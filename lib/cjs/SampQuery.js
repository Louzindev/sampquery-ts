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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_dgram_1 = __importDefault(require("node:dgram"));
var types_1 = require("./types");
var Buffer = require('node:buffer').Buffer;
var incomming_packet_len = 11;
var outgoing_packet_len = 512;
var SampQuery = /** @class */ (function () {
    function SampQuery(ipaddress, port) {
        this.ip = ipaddress;
        this.port = port;
    }
    SampQuery.prototype.getServerInformation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var serverInformation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('i')];
                    case 1:
                        serverInformation = _a.sent();
                        return [2 /*return*/, serverInformation];
                }
            });
        });
    };
    SampQuery.prototype.getServerRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rules;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('r')];
                    case 1:
                        rules = _a.sent();
                        return [2 /*return*/, rules];
                }
            });
        });
    };
    SampQuery.prototype.getServerDetailedInformation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var detailedInformation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('d')];
                    case 1:
                        detailedInformation = _a.sent();
                        return [2 /*return*/, detailedInformation];
                }
            });
        });
    };
    ;
    SampQuery.prototype.getServerClientList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clientList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request('c')];
                    case 1:
                        clientList = _a.sent();
                        return [2 /*return*/, clientList];
                }
            });
        });
    };
    SampQuery.prototype.request = function (opcode) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var socket = node_dgram_1.default.createSocket('udp4');
            var packet = Buffer.alloc(incomming_packet_len);
            packet.write("SAMP");
            packet[4] = _this.ip.split('.')[0];
            packet[5] = _this.ip.split('.')[1];
            packet[6] = _this.ip.split('.')[2];
            packet[7] = _this.ip.split('.')[3];
            packet[8] = (_this.port & 0xFF);
            packet[9] = (_this.port >> 8 & 0xFF);
            packet[10] = opcode.charCodeAt(0);
            try {
                socket.send(packet, _this.port, _this.ip, function (error, number) {
                    if (error) {
                        var resp = {
                            errorID: types_1.E_SAMPQUERY_ERROR.SOCKET_ERROR,
                            data: "".concat(error)
                        };
                        console.log(error);
                        return reject(resp);
                    }
                });
            }
            catch (error) {
                var resp = {
                    errorID: types_1.E_SAMPQUERY_ERROR.SOCKET_ERROR,
                    data: "".concat(error)
                };
                return reject(resp);
            }
            var timeout = setTimeout(function () {
                socket.close();
                var resp = {
                    errorID: types_1.E_SAMPQUERY_ERROR.INVALID_HOST,
                    data: "[error] host unavailable - " + _this.ip + ":" + _this.port
                };
                return reject(resp);
            }, 2000);
            socket.on('message', function (msg) {
                if (timeout)
                    clearTimeout(timeout);
                if (msg.length < 11) {
                    var resp = {
                        errorID: types_1.E_SAMPQUERY_ERROR.INVALID_PACKET_LEN,
                        data: "Received an Packet len < 11"
                    };
                    return reject(resp);
                }
                socket.close();
                var packet = msg.slice(11);
                var offset = 0;
                switch (opcode) {
                    case 'i': {
                        var isPassworded = !!packet.readUInt8(offset);
                        offset += 1;
                        var playerCount_1 = packet.readUInt16LE(offset);
                        offset += 2;
                        var maxPlayers = packet.readUInt16LE(offset);
                        offset += 2;
                        var hostnameLen = packet.readUInt32LE(offset);
                        offset += 4;
                        var hostname = packet.slice(offset, offset += hostnameLen).toString();
                        var gamemodeLen = packet.readUInt32LE(offset);
                        offset += 4;
                        var gamemode = packet.slice(offset, offset += gamemodeLen).toString();
                        var languageLen = packet.readUint32LE(offset);
                        offset += 4;
                        var language = packet.slice(offset, offset += languageLen).toString();
                        var object = {
                            isPassworded: isPassworded,
                            playerCount: playerCount_1,
                            maxPlayers: maxPlayers,
                            hostname: hostname,
                            gamemode: gamemode,
                            language: language,
                        };
                        return resolve(object);
                        break;
                    }
                    case 'r': {
                        var array = new Array();
                        var itemCount = packet.readUInt16LE(offset);
                        offset += 2;
                        for (var i = 0; i < itemCount; i++) {
                            var ruleNameLen = packet.readUInt8(offset);
                            var ruleName = packet.slice(++offset, offset += ruleNameLen).toString();
                            var ruleValueLen = packet.readUInt8(offset);
                            var ruleValue = packet.slice(++offset, offset += ruleValueLen).toString();
                            var rule = {
                                ruleName: ruleName,
                                ruleValue: ruleValue
                            };
                            array.push(rule);
                        }
                        return resolve(array);
                        break;
                    }
                    case 'd': {
                        var playerArray = new Array();
                        var playerCount = packet.readUint16LE(offset);
                        offset += 2;
                        for (var i = 0; i < playerCount; ++i) {
                            var playerId = packet.readUInt8(offset);
                            var playerNameLen_1 = packet.readUInt8(++offset);
                            var playerName_1 = packet.slice(++offset, offset += playerNameLen_1).toString();
                            var playerScore = packet.readUInt16LE(offset);
                            var playerPing = packet.readUInt16LE(offset += 4);
                            var playerObj = {
                                playerId: playerId,
                                playerName: playerName_1,
                                playerScore: playerScore,
                                playerPing: playerPing
                            };
                            offset += 4;
                            playerArray.push(playerObj);
                        }
                        return resolve(playerArray);
                        break;
                    }
                    case 'c': {
                        var clientArray = new Array();
                        var clientCount = packet.readUInt16LE(offset);
                        offset += 2;
                        for (var i = 0; i < clientCount; i++) {
                            var playerNameLen = packet.readUInt8(offset);
                            var playerName = packet.slice(++offset, offset += playerNameLen).toString();
                            var playerScore = packet.readUInt16LE(offset);
                            offset += 4;
                            var clientObj = {
                                name: playerName,
                                score: playerScore
                            };
                            clientArray.push(clientObj);
                        }
                        return resolve(clientArray);
                        break;
                    }
                    default:
                        break;
                }
            });
        });
    };
    return SampQuery;
}());
;
exports.default = SampQuery;
