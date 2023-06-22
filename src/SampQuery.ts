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
    IServerAddress,
    incomming_packet_len,
    outgoing_packet_len
} from './types';

import {
    makeSampQueryPacket,
    readSampQueryPacket
} from './Functions'

class SampQuery {
    private serverAddress: IServerAddress;
    constructor(serverAddress: IServerAddress) {
        this.serverAddress = serverAddress;
    }

    public static makeSampQueryPacket(serverAddress: IServerAddress, queryPacketType: E_SAMPQUERY_PACKET_TYPE, command?: string) {
        return makeSampQueryPacket(serverAddress, queryPacketType, command);
    }

    public static readSampQueryPacket(queryPacket: Buffer) {
        return readSampQueryPacket(queryPacket);
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
        this.request(E_SAMPQUERY_PACKET_TYPE.INFORMATION_QUERY_PACKET).then((info) => {
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
            const queryPacket = makeSampQueryPacket(this.serverAddress, E_SAMPQUERY_PACKET_TYPE.RCON_QUERY_PACKET, command);

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
    // commented
    private request(queryPacketType: E_SAMPQUERY_PACKET_TYPE): any {
        return new Promise((resolve, reject) => {
            const socket = udp.createSocket('udp4');
            const queryPacket = makeSampQueryPacket(this.serverAddress, queryPacketType);

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

            socket.on('message', (packet) => {

                if (timeout)
                    clearTimeout(timeout);
                if (packet.length < 11) {
                    const resp: IError = {
                        errorID: E_SAMPQUERY_ERROR.INVALID_PACKET_LEN,
                        data: "Received an Packet len < 11"
                    }
                    return reject(resp);
                }
                socket.close();

                return resolve(readSampQueryPacket(packet));
            });
        });
    }
};

export default SampQuery;