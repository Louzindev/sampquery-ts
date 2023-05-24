"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampQuery = void 0;
const node_dgram_1 = __importDefault(require("node:dgram"));
const { Buffer } = require('node:buffer');
const incomming_packet_len = 11;
const outgoing_packet_len = 512;
;
;
;
;
class SampQuery {
    constructor(ipaddress, port) {
        this.ip = ipaddress;
        this.port = port;
    }
    getServerInformation() {
        return __awaiter(this, void 0, void 0, function* () {
            const serverInformation = yield this.request('i');
            return serverInformation;
        });
    }
    getServerRules() {
        return __awaiter(this, void 0, void 0, function* () {
            var rules = yield this.request('r');
            return rules;
        });
    }
    getServerDetailedInformation() {
        return __awaiter(this, void 0, void 0, function* () {
            const detailedInformation = yield this.request('d');
            return detailedInformation;
        });
    }
    ;
    getServerClientList() {
        return __awaiter(this, void 0, void 0, function* () {
            const clientList = yield this.request('c');
            return clientList;
        });
    }
    request(opcode) {
        return new Promise((resolve, reject) => {
            const socket = node_dgram_1.default.createSocket('udp4');
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
                    if (error) {
                        console.log(error);
                    }
                    console.log("Socket sended");
                });
            }
            catch (error) {
                console.log(error);
                return 0;
            }
            var timeout = setTimeout(() => {
                socket.close();
                return console.log("[error] host unavailable - " + this.ip + ":" + this.port);
            }, 2000);
            socket.on('message', (msg) => {
                if (timeout)
                    clearTimeout(timeout);
                if (msg.length < 11) {
                    return reject(undefined);
                }
                socket.close();
                const packet = msg.slice(11);
                var offset = 0;
                if (opcode === 'i') {
                    const isPassworded = !!packet.readUInt8(offset);
                    offset += 1;
                    const playerCount = packet.readUInt16LE(offset);
                    offset += 2;
                    const maxPlayers = packet.readUInt16LE(offset);
                    offset += 2;
                    const hostnameLen = packet.readUInt32LE(offset);
                    offset += 4;
                    const hostname = packet.slice(offset, offset += hostnameLen).toString();
                    const gamemodeLen = packet.readUInt32LE(offset);
                    offset += 4;
                    const gamemode = packet.slice(offset, offset += gamemodeLen).toString();
                    const languageLen = packet.readUint32LE(offset);
                    offset += 4;
                    const language = packet.slice(offset, offset += languageLen).toString();
                    var object = {
                        isPassworded: isPassworded,
                        playerCount: playerCount,
                        maxPlayers: maxPlayers,
                        hostname: hostname,
                        gamemode: gamemode,
                        language: language,
                    };
                    return resolve(object);
                }
                else if (opcode === 'r') {
                    var array = new Array();
                    var itemCount = packet.readUInt16LE(offset);
                    offset += 2;
                    for (var i = 0; i < itemCount; i++) {
                        const ruleNameLen = packet.readUInt8(offset);
                        const ruleName = packet.slice(++offset, offset += ruleNameLen).toString();
                        const ruleValueLen = packet.readUInt8(offset);
                        const ruleValue = packet.slice(++offset, offset += ruleValueLen).toString();
                        const rule = {
                            ruleName: ruleName,
                            ruleValue: ruleValue
                        };
                        array.push(rule);
                    }
                    return resolve(array);
                }
                else if (opcode === 'd') {
                    var playerArray = new Array();
                    var playerCount = packet.readUint16LE(offset);
                    offset += 2;
                    for (var i = 0; i < playerCount; ++i) {
                        const playerId = packet.readUInt8(offset);
                        const playerNameLen = packet.readUInt8(++offset);
                        const playerName = packet.slice(++offset, offset += playerNameLen).toString();
                        const playerScore = packet.readUInt16LE(offset);
                        const playerPing = packet.readUInt16LE(offset += 4);
                        const playerObj = {
                            playerId: playerId,
                            playerName: playerName,
                            playerScore: playerScore,
                            playerPing: playerPing
                        };
                        offset += 4;
                        playerArray.push(playerObj);
                    }
                    return resolve(playerArray);
                }
                else if (opcode === 'c') {
                    var clientArray = new Array();
                    var clientCount = packet.readUInt16LE(offset);
                    offset += 2;
                    for (var i = 0; i < clientCount; i++) {
                        var playerNameLen = packet.readUInt8(offset);
                        var playerName = packet.slice(++offset, offset += playerNameLen).toString();
                        const playerScore = packet.readUInt16LE(offset);
                        offset += 4;
                        const clientObj = {
                            name: playerName,
                            score: playerScore
                        };
                        clientArray.push(clientObj);
                    }
                    return resolve(clientArray);
                }
                else {
                    console.log('Not defined');
                    return 0;
                }
            });
        });
    }
}
exports.SampQuery = SampQuery;
;
