import udp from 'node:dgram';
import { Buffer } from "node:buffer"
import { E_SAMPQUERY_ERROR, sampqueryErrorInterface, serverClientListPacket, serverDetailedInformationPacket, serverInformationPacket, serverRulesPacket, sampqueryCallbackType } from './types';


const incomming_packet_len = 11;
const outgoing_packet_len = 512;

class SampQuery {
    private ip: string;
    private port: number;
    constructor(ipaddress: string, port: number) {
        this.ip = ipaddress;
        this.port = port;
    }

    public async getServerInformation(callback: sampqueryCallbackType) {
        this.request('i').then((info) => {
            callback(info, 0);
        }).catch((error: sampqueryErrorInterface) => {
            callback(0, error);
        });
    }

    public async getServerRules(callback: sampqueryCallbackType) {
        this.request('r').then((rules) => {
            callback(rules, 0);
        }).catch((error: sampqueryErrorInterface) => {
            callback(0, error);
        });
    }

    public async getServerDetailedInformation(callback: sampqueryCallbackType) {
        this.request('d').then((detailedInformation) => {
            callback(detailedInformation, 0);
        }).catch((error: sampqueryErrorInterface) => {
            callback(0, error);
        });
    }

    public async getServerClientList(callback: sampqueryCallbackType) {
        this.request('c').then((clientList) => {
            callback(clientList, 0);
        }).catch((error: sampqueryErrorInterface) => {
            callback(0, error);
        });
    }

    public async sendRCONCommand(password: string, command: string, callback?: sampqueryCallbackType) {
        this.rconRequest(password, command).then((info) => {
            if(callback) callback(info, 0);
        }).catch((err) => {
            const error: sampqueryErrorInterface = err;
            if(callback) callback(0, err);
        });
    }

    private rconRequest(password: string, command: string): any {
        return new Promise((resolve, reject) => {
            const socket = udp.createSocket('udp4');
            const packet = Buffer.alloc((incomming_packet_len + 4) + (password.length + command.length));
            packet.write("SAMP");
            packet.writeUint8((this.ip.split('.')[0] as any), 4);
            packet.writeUint8((this.ip.split('.')[1] as any), 5);
            packet.writeUint8((this.ip.split('.')[2] as any), 6);
            packet.writeUint8((this.ip.split('.')[3] as any), 7);

            packet.writeUint8((this.port & 0xFF), 8);
            packet.writeUint8((this.port >> 8 & 0xFF), 9);

            const opcode: string = "x";
            packet.writeUint8(opcode.charCodeAt(0), 10);

            packet.writeUint8((password.length & 0xFF), 11);
            packet.writeUint8((password.length >> 8 & 0xFF), 12);
            packet.write(password, 13);
            let offset: number = 13 + password.length;
            packet.writeUInt8((command.length & 0xFF), offset);
            ++offset;
            packet.writeUInt8((command.length >> 8 & 0xFF), offset);
            ++offset;
            packet.write(command, offset);
            socket.send(packet, this.port, this.ip, (error, number) => {
                if (error) {
                    const resp: sampqueryErrorInterface = {
                        errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                        data: `${error}`
                    }
                    console.log(error);
                    return reject(resp);
                }
                return resolve(packet);
            });
        });
    }

    private request(opcode: string): any {
        return new Promise((resolve, reject) => {
            const socket = udp.createSocket('udp4');
            const packet = Buffer.alloc(incomming_packet_len);

            packet.write("SAMP");
            packet.writeUint8((this.ip.split('.')[0] as any), 4);
            packet.writeUint8((this.ip.split('.')[1] as any), 5);
            packet.writeUint8((this.ip.split('.')[2] as any), 6);
            packet.writeUint8((this.ip.split('.')[3] as any), 7);

            packet.writeUInt8((this.port & 0xFF), 8);
            packet.writeUInt8((this.port >> 8 & 0xFF), 9);

            packet.writeUInt8(opcode.charCodeAt(0), 10);

            try {
                socket.send(packet, this.port, this.ip, (error, number) => {
                    if (error) {
                        const resp: sampqueryErrorInterface = {
                            errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                            data: `${error}`
                        }
                        console.log(error);
                        return reject(resp);
                    }
                });
            } catch (error: any) {
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

                if (timeout)
                    clearTimeout(timeout);
                if (msg.length < 11) {
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
                        const isPassworded: boolean = !!packet.readUInt8(offset);
                        offset += 1;
                        const playerCount: number = packet.readUInt16LE(offset);
                        offset += 2;
                        const maxPlayers: number = packet.readUInt16LE(offset);
                        offset += 2;
                        const hostnameLen: number = packet.readUInt32LE(offset);
                        offset += 4;
                        const hostname: string = packet.slice(offset, offset += hostnameLen).toString();

                        const gamemodeLen: number = packet.readUInt32LE(offset);
                        offset += 4;
                        const gamemode: string = packet.slice(offset, offset += gamemodeLen).toString();

                        const languageLen: number = packet.readUint32LE(offset);
                        offset += 4;
                        const language: string = packet.slice(offset, offset += languageLen).toString();

                        var object: serverInformationPacket = {
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
                        var array: Array<serverRulesPacket> = new Array<serverRulesPacket>();
                        var itemCount = packet.readUInt16LE(offset);
                        offset += 2;

                        for (var i = 0; i < itemCount; i++) {
                            const ruleNameLen = packet.readUInt8(offset);
                            const ruleName = packet.slice(++offset, offset += ruleNameLen).toString();

                            const ruleValueLen = packet.readUInt8(offset);
                            const ruleValue = packet.slice(++offset, offset += ruleValueLen).toString();

                            const rule: serverRulesPacket = {
                                ruleName: ruleName,
                                ruleValue: ruleValue
                            };
                            array.push(rule);
                        }
                        return resolve(array);
                        break;
                    }

                    case 'd': {
                        var playerArray: Array<serverDetailedInformationPacket> = new Array<serverDetailedInformationPacket>();
                        var playerCount: number = packet.readUint16LE(offset);
                        offset += 2;

                        for (var i = 0; i < playerCount; ++i) {
                            const playerId: number = packet.readUInt8(offset);

                            const playerNameLen: number = packet.readUInt8(++offset);
                            const playerName = packet.slice(++offset, offset += playerNameLen).toString();

                            const playerScore = packet.readUInt16LE(offset);
                            const playerPing = packet.readUInt16LE(offset += 4);

                            const playerObj: serverDetailedInformationPacket = {
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
                        var clientArray: Array<serverClientListPacket> = new Array<serverClientListPacket>();
                        var clientCount: number = packet.readUInt16LE(offset);
                        offset += 2;
                        for (var i = 0; i < clientCount; i++) {
                            var playerNameLen = packet.readUInt8(offset);
                            var playerName = packet.slice(++offset, offset += playerNameLen).toString();
                            const playerScore = packet.readUInt16LE(offset);
                            offset += 4;

                            const clientObj: serverClientListPacket = {
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