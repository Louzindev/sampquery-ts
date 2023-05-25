import udp from 'node:dgram';

import { E_SAMPQUERY_ERROR, sampqueryErrorInterface, serverClientListPacket, serverDetailedInformationPacket, serverInformationPacket, serverRulesPacket } from './types';
const { Buffer } = require('node:buffer');

const incomming_packet_len = 11;
const outgoing_packet_len = 512;

class SampQuery {
    private ip : string;
    private port : number;
    constructor(ipaddress : string, port : number) {
        this.ip = ipaddress;
        this.port = port;
    }

    public async getServerInformation() : Promise<serverInformationPacket> {
        const serverInformation : serverInformationPacket = await this.request('i');
        return serverInformation;
    }

    public async getServerRules() : Promise<Array<serverRulesPacket>> {
        var rules : Array<serverRulesPacket> = await this.request('r');
        return rules;
    }

    public async getServerDetailedInformation() : Promise<Array<serverDetailedInformationPacket>> {
        const detailedInformation : Array<serverDetailedInformationPacket> = await this.request('d');
        return detailedInformation;
    };

    public async getServerClientList() : Promise<Array<serverClientListPacket>> {
        const clientList : Array<serverClientListPacket> = await this.request('c');
        return clientList;
    }

    private request(opcode : string) : any {
        return new Promise((resolve, reject) => {
            const socket = udp.createSocket('udp4');
            const packet = Buffer.alloc(incomming_packet_len);

            packet.write("SAMP");
            packet[4] = this.ip.split('.')[0];
            packet[5] = this.ip.split('.')[1];
            packet[6] = this.ip.split('.')[2];
            packet[7] = this.ip.split('.')[3];

            packet[8] = (this.port & 0xFF);
            packet[9] = (this.port >> 8 & 0xFF);
            
            packet[10] = opcode.charCodeAt(0);

            try {
                socket.send(packet, this.port, this.ip, (error, number) => {
                    if(error) {
                        const resp: sampqueryErrorInterface = {
                            errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                            data: `${error}`
                        }
                        console.log(error);
                        return reject(resp);
                    }
                });
            } catch(error) {
                const resp: sampqueryErrorInterface = {
                    errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                    data: `${error}`
                }
                return reject(resp);
            }
    
            var timeout = setTimeout(() => {
                socket.close();
                const resp: sampqueryErrorInterface = {
                    errorID: E_SAMPQUERY_ERROR.INVALID_HOST,
                    data: "[error] host unavailable - " + this.ip + ":" + this.port
                }
                return reject(resp);
            }, 2000);
    
            socket.on('message', (msg) => {
    
                if(timeout) 
                    clearTimeout(timeout);
                if(msg.length < 11) {
                    const resp: sampqueryErrorInterface = {
                        errorID: E_SAMPQUERY_ERROR.INVALID_PACKET_LEN,
                        data: "Received an Packet len < 11"
                    }
                    return reject(resp);
                }
                socket.close();
                const packet = msg.slice(11);
                
                var offset = 0;
                
                switch (opcode) {
                    case 'i': {
                        const isPassworded:boolean = !!packet.readUInt8(offset);
                        offset += 1;
                        const playerCount:number = packet.readUInt16LE(offset);
                        offset += 2;
                        const maxPlayers:number = packet.readUInt16LE(offset);
                        offset += 2;
                        const hostnameLen:number = packet.readUInt32LE(offset);
                        offset += 4;
                        const hostname:string = packet.slice(offset, offset += hostnameLen).toString();

                        const gamemodeLen:number = packet.readUInt32LE(offset);
                        offset += 4;
                        const gamemode:string = packet.slice(offset, offset += gamemodeLen).toString();

                        const languageLen:number = packet.readUint32LE(offset);
                        offset += 4;
                        const language:string = packet.slice(offset, offset += languageLen).toString();

                        var object : serverInformationPacket = {
                            isPassworded: isPassworded,
                            playerCount: playerCount,
                            maxPlayers: maxPlayers,
                            hostname: hostname,
                            gamemode: gamemode,
                            language: language,
                        };
                        return resolve(object);
                        break;
                    }

                    case 'r': {
                        var array : Array<serverRulesPacket> = new Array<serverRulesPacket>();
                        var itemCount = packet.readUInt16LE(offset);
                        offset += 2;

                        for(var i = 0; i < itemCount; i++) 
                        {
                            const ruleNameLen = packet.readUInt8(offset);
                            const ruleName = packet.slice(++offset, offset += ruleNameLen).toString();

                            const ruleValueLen = packet.readUInt8(offset);
                            const ruleValue = packet.slice(++offset, offset += ruleValueLen).toString();

                            const rule : serverRulesPacket = {
                                ruleName: ruleName,
                                ruleValue: ruleValue
                            };
                            array.push(rule);
                        }
                        return resolve(array);
                        break;
                    }

                    case 'd': {
                        var playerArray : Array<serverDetailedInformationPacket> = new Array<serverDetailedInformationPacket>();
                        var playerCount: number = packet.readUint16LE(offset);
                        offset += 2;

                        for(var i=0; i<playerCount; ++i) {
                            const playerId:number = packet.readUInt8(offset);

                            const playerNameLen:number = packet.readUInt8(++offset);
                            const playerName = packet.slice(++offset, offset += playerNameLen).toString();

                            const playerScore = packet.readUInt16LE(offset);
                            const playerPing = packet.readUInt16LE(offset += 4);

                            const playerObj : serverDetailedInformationPacket = {
                                playerId: playerId,
                                playerName: playerName,
                                playerScore: playerScore,
                                playerPing: playerPing
                            }
                            offset += 4;
                            playerArray.push(playerObj);
                        }
                        return resolve(playerArray);
                        break;
                    }

                    case 'c': {
                        var clientArray:Array<serverClientListPacket> = new Array<serverClientListPacket>();
                        var clientCount:number = packet.readUInt16LE(offset);
                        offset += 2;
                        for(var i = 0; i < clientCount; i++)
                        {
                            var playerNameLen = packet.readUInt8(offset);
                            var playerName = packet.slice(++offset, offset += playerNameLen).toString();
                            const playerScore = packet.readUInt16LE(offset);
                            offset += 4;

                            const clientObj : serverClientListPacket = {
                                name: playerName,
                                score: playerScore
                            }

                            clientArray.push(clientObj);
                        }
                        return resolve(clientArray);
                        break;
                    }
                    default:
                        break;
                }
            })
        });
    }
};

export default SampQuery;