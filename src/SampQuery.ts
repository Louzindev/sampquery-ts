import udp from 'node:dgram';
import { Buffer } from "node:buffer"
import { 
    E_SAMPQUERY_PACKET_TYPE,
    E_SAMPQUERY_ERROR,
    IError, 
    IClientListPacket,
    IDetailedPacket, 
    IInformationPacket,  
    IRulesPacket,
    IServerAddress
} from './types';


const incomming_packet_len = 11;
const outgoing_packet_len = 512;

class SampQuery {
    private serverAddress: IServerAddress;
    constructor(serverAddress: IServerAddress) {
        this.serverAddress = serverAddress;
    }

    public getServerInformation(callback: (data: IInformationPacket, error: IError) => void) {
        this.request(E_SAMPQUERY_PACKET_TYPE.INFORMATION_QUERY_PACKET).then((data) => {
            callback(data, undefined);
        }).catch((error: IError) => {
            callback(undefined, error);
        });
    }

    public getServerRules(callback: (data: IRulesPacket, error: IError) => void) {

        this.request(E_SAMPQUERY_PACKET_TYPE.INFORMATION_QUERY_PACKET).then((info) => {
            this.request(E_SAMPQUERY_PACKET_TYPE.RULES_QUERY_PACKET).then((data) => {
                callback(data, undefined);
            }).catch((error: IError) => {
                callback(undefined, error);
            });
        }).catch((error: IError) => {
            callback(undefined, error);
        });
        
    }

    public getServerDetailedInformation(callback: (data: IDetailedPacket, error: IError) => void) {
        this.request(E_SAMPQUERY_PACKET_TYPE.INFORMATION_QUERY_PACKET).then((info) => {
            this.request(E_SAMPQUERY_PACKET_TYPE.DETAILED_QUERY_PACKET).then((data) => {
                callback(data, undefined);
            }).catch((error: IError) => {
                callback(undefined, error);
            });
        }).catch((error: IError) => {
            callback(undefined, error);
        });
        
    }

    public getServerClientList(callback: (data: IDetailedPacket, error: IError) => void) {
        this.request(E_SAMPQUERY_PACKET_TYPE.INFORMATION_QUERY_PACKET).then((info) => {
            this.request(E_SAMPQUERY_PACKET_TYPE.CLIENTLIST_QUERY_PACKET).then((data) => {
                callback(data, undefined);
            }).catch((error: IError) => {
                callback(undefined, error);
            });
        }).catch((error: IError) => {
            callback(undefined, error);
        });
        
    }

    public sendRCON(command: string, callback?: (data: string, error: IError) => void, password?: string) {
        this.request(E_SAMPQUERY_PACKET_TYPE.RCON_QUERY_PACKET).then((info) => {
            this.rconRequest(command, password).then((data) => {
                callback(data, undefined);
            }).catch((error: IError) => {
                callback(undefined, error);
            });
        }).catch((error: IError) => {
            callback(undefined, error);
        });
    }

    private rconRequest(command: string, password?: string) : any {
        return new Promise((resolve, reject) => {
            if(password) {
                this.serverAddress.rconpassword = password;
            }

            const socket = udp.createSocket('udp4');
            const queryPacket = this.makeSampQueryPacket(E_SAMPQUERY_PACKET_TYPE.RCON_QUERY_PACKET, command);

            try {
                socket.send(queryPacket, this.serverAddress.port, this.serverAddress.ipaddress, (error) => {
                    if(error) {
                        const resp: IError = {
                            errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                            data: `${error}`
                        }
                        return reject(resp);
                    }
                })
            } catch(error: any) {
                const resp: IError = {
                    errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                    data: `${error}`
                }
                return reject(resp);
            }

            var timeout = setTimeout(() => {
                socket.close();
                return resolve("Successfully sended.");
            }, 2000);

            socket.on('message', (msg) => {
                if(timeout)
                    clearTimeout(timeout);
                if(msg.slice(12).toString().includes("Invalid RCON password")) {
                    const err: IError = {
                        errorID: E_SAMPQUERY_ERROR.INVALID_RCON_PASSWORD,
                        data: "Invalid RCON password"
                    }
                    return reject(err);
                }
                return resolve("Successfully sended.");
            })
        });
    }

    private request(queryPacketType: E_SAMPQUERY_PACKET_TYPE): any {
        return new Promise((resolve, reject) => {
            const socket = udp.createSocket('udp4');
            const queryPacket = this.makeSampQueryPacket(queryPacketType);

            try {
                socket.send(queryPacket, this.serverAddress.port, this.serverAddress.ipaddress, (error, number) => {
                    if (error) {
                        const resp: IError = {
                            errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                            data: `${error}`
                        }
                        console.log(error);
                        return reject(resp);
                    }
                });
            } catch (error: any) {
                const resp: IError = {
                    errorID: E_SAMPQUERY_ERROR.SOCKET_ERROR,
                    data: `${error}`
                }
                return reject(resp);
            }

            var timeout = setTimeout(() => {
                socket.close();
                const resp: IError = {
                    errorID: E_SAMPQUERY_ERROR.INVALID_HOST,
                    data: "[error] no response for - " + this.serverAddress.ipaddress + ":" + this.serverAddress.port
                }
                return reject(resp);
            }, 2000);

            socket.on('message', (msg) => {

                if (timeout)
                    clearTimeout(timeout);
                if (msg.length < 11) {
                    const resp: IError = {
                        errorID: E_SAMPQUERY_ERROR.INVALID_PACKET_LEN,
                        data: "Received an Packet len < 11"
                    }
                    return reject(resp);
                }
                socket.close();

                const incommingQueryPacket = msg.slice(11);
                return resolve(this.readSampQueryPacket(queryPacketType, incommingQueryPacket));
            });
        });
    }

    private makeSampQueryPacket(querypacket: E_SAMPQUERY_PACKET_TYPE, command?: string): Buffer {
        const packet = Buffer.alloc(incomming_packet_len);
        packet.write("SAMP");
        packet.writeUint8((this.serverAddress.ipaddress.split('.')[0] as any), 4);
        packet.writeUint8((this.serverAddress.ipaddress.split('.')[1] as any), 5);
        packet.writeUint8((this.serverAddress.ipaddress.split('.')[2] as any), 6);
        packet.writeUint8((this.serverAddress.ipaddress.split('.')[3] as any), 7);

        packet.writeUInt8((this.serverAddress.port & 0xFF), 8);
        packet.writeUInt8((this.serverAddress.port >> 8 & 0xFF), 9);

        packet.writeUInt8(querypacket.charCodeAt(0), 10);

        if(querypacket == E_SAMPQUERY_PACKET_TYPE.RCON_QUERY_PACKET) {
            packet.writeUint8((this.serverAddress.rconpassword.length & 0xFF), 11);
            packet.writeUint8((this.serverAddress.rconpassword.length >> 8 & 0xFF), 12);
            packet.writeUint8((this.serverAddress.rconpassword.length & 0xFF), 11);
            packet.writeUint8((this.serverAddress.rconpassword.length >> 8 & 0xFF), 12);
            packet.write(this.serverAddress.rconpassword, 13);
            packet.writeUInt8((command.length & 0xFF), (13 + this.serverAddress.rconpassword.length));
            packet.writeUInt8((command.length >> 8 & 0xFF), (14 + this.serverAddress.rconpassword.length));
            packet.write(command, 15 + this.serverAddress.rconpassword.length);
        }
        return packet;
    }

    private readSampQueryPacket(queryPacketType: E_SAMPQUERY_PACKET_TYPE, queryPacket: Buffer): any {
        var offset = 0;
        switch (queryPacketType) {
            case E_SAMPQUERY_PACKET_TYPE.INFORMATION_QUERY_PACKET: {
                const isPassworded: boolean = !!queryPacket.readUInt8(offset);
                offset += 1;
                const playerCount: number = queryPacket.readUInt16LE(offset);
                offset += 2;
                const maxPlayers: number = queryPacket.readUInt16LE(offset);
                offset += 2;
                const hostnameLen: number = queryPacket.readUInt32LE(offset);
                offset += 4;
                const hostname: string = queryPacket.slice(offset, offset += hostnameLen).toString();

                const gamemodeLen: number = queryPacket.readUInt32LE(offset);
                offset += 4;
                const gamemode: string = queryPacket.slice(offset, offset += gamemodeLen).toString();

                const languageLen: number = queryPacket.readUint32LE(offset);
                offset += 4;
                const language: string = queryPacket.slice(offset, offset += languageLen).toString();

                var object: IInformationPacket = {
                    isPassworded: isPassworded,
                    playerCount: playerCount,
                    maxPlayers: maxPlayers,
                    hostname: hostname,
                    gamemode: gamemode,
                    language: language,
                };
                return object;
                break;
            }

            case 'r': {
                var array: Array<IRulesPacket> = new Array<IRulesPacket>();
                var itemCount = queryPacket.readUInt16LE(offset);
                offset += 2;

                for (var i = 0; i < itemCount; i++) {
                    const ruleNameLen = queryPacket.readUInt8(offset);
                    const ruleName = queryPacket.slice(++offset, offset += ruleNameLen).toString();

                    const ruleValueLen = queryPacket.readUInt8(offset);
                    const ruleValue = queryPacket.slice(++offset, offset += ruleValueLen).toString();

                    const rule: IRulesPacket = {
                        ruleName: ruleName,
                        ruleValue: ruleValue
                    };
                    array.push(rule);
                }
                return array;
                break;
            }

            case 'd': {
                var playerArray: Array<IDetailedPacket> = new Array<IDetailedPacket>();
                var playerCount: number = queryPacket.readUint16LE(offset);
                offset += 2;

                for (var i = 0; i < playerCount; ++i) {
                    const playerId: number = queryPacket.readUInt8(offset);

                    const playerNameLen: number = queryPacket.readUInt8(++offset);
                    const playerName = queryPacket.slice(++offset, offset += playerNameLen).toString();

                    const playerScore = queryPacket.readUInt16LE(offset);
                    const playerPing = queryPacket.readUInt16LE(offset += 4);

                    const playerObj: IDetailedPacket = {
                        playerId: playerId,
                        playerName: playerName,
                        playerScore: playerScore,
                        playerPing: playerPing
                    }
                    offset += 4;
                    playerArray.push(playerObj);
                }
                return playerArray;
                break;
            }

            case 'c': {
                var clientArray: Array<IClientListPacket> = new Array<IClientListPacket>();
                var clientCount: number = queryPacket.readUInt16LE(offset);
                offset += 2;
                for (var i = 0; i < clientCount; i++) {
                    var playerNameLen = queryPacket.readUInt8(offset);
                    var playerName = queryPacket.slice(++offset, offset += playerNameLen).toString();
                    const playerScore = queryPacket.readUInt16LE(offset);
                    offset += 4;

                    const clientObj: IClientListPacket = {
                        name: playerName,
                        score: playerScore
                    }

                    clientArray.push(clientObj);
                }
                return clientArray;
                break;
            }
            default:
                break;
        }
    };
};

export default SampQuery;