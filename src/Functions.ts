import { 
    E_SAMPQUERY_PACKET_TYPE,
    IClientListPacket,
    IDetailedPacket, 
    IInformationPacket,  
    IRulesPacket,
    IServerAddress,
    incomming_packet_len
} from './types';

export function makeSampQueryPacket(serverAddress: IServerAddress, queryPacketType: E_SAMPQUERY_PACKET_TYPE, command?: string) {
    var bufferSize = incomming_packet_len;
    if(queryPacketType === E_SAMPQUERY_PACKET_TYPE.RCON_QUERY_PACKET) {
        bufferSize += (serverAddress.rconpassword.length + command.length + 4);
    }
        
    const packet = Buffer.alloc(bufferSize);
    packet.write("SAMP");
    packet.writeUint8((serverAddress.ipaddress.split('.')[0] as any), 4);
    packet.writeUint8((serverAddress.ipaddress.split('.')[1] as any), 5);
    packet.writeUint8((serverAddress.ipaddress.split('.')[2] as any), 6);
    packet.writeUint8((serverAddress.ipaddress.split('.')[3] as any), 7);

    packet.writeUInt8((serverAddress.port & 0xFF), 8);
    packet.writeUInt8((serverAddress.port >> 8 & 0xFF), 9);

    packet.writeUInt8(queryPacketType, 10);

    if(queryPacketType == E_SAMPQUERY_PACKET_TYPE.RCON_QUERY_PACKET) {
        packet.writeUint8((serverAddress.rconpassword.length & 0xFF), 11);
        packet.writeUint8((serverAddress.rconpassword.length >> 8 & 0xFF), 12);
        packet.write(serverAddress.rconpassword, 13);
        packet.writeUInt8((command.length & 0xFF), (13 + serverAddress.rconpassword.length));
        packet.writeUInt8((command.length >> 8 & 0xFF), (14 + serverAddress.rconpassword.length));
        packet.write(command, 15 + serverAddress.rconpassword.length);
    }
    return packet;
}

export function readSampQueryPacket(queryPacket: Buffer) {
    const opcode = queryPacket.readUint8(10);
    var offset = 11;
    switch (opcode) {
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
        case E_SAMPQUERY_PACKET_TYPE.RULES_QUERY_PACKET: {
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

        case E_SAMPQUERY_PACKET_TYPE.DETAILED_QUERY_PACKET: {
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

        case E_SAMPQUERY_PACKET_TYPE.CLIENTLIST_QUERY_PACKET: {
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
}