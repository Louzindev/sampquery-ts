export enum E_SAMPQUERY_PACKET_TYPE {
    INFORMATION_QUERY_PACKET = 0x69,
    RULES_QUERY_PACKET = 0x72,
    DETAILED_QUERY_PACKET = 0x64,
    CLIENTLIST_QUERY_PACKET = 63,
    RCON_QUERY_PACKET = 0x78
}

export enum E_SAMPQUERY_ERROR {
    NONE = 0,
    SOCKET_ERROR = 1,
    INVALID_HOST = 2,
    INVALID_PACKET_LEN = 3,
    INVALID_RCON_PASSWORD = 4
}
export interface IServerAddress {
    ipaddress: string;
    port: number;
    rconpassword?: string;
}

export interface IInformationPacket {
    isPassworded : boolean,
    maxPlayers : number,
    playerCount : number,
    hostname : string,
    gamemode : string,
    language : string
};

export interface IRulesPacket {
    ruleName: string,
    ruleValue: string
};

export interface IDetailedPacket {
    playerId: number,
    playerName: string,
    playerScore: number,
    playerPing: number
};

export interface IClientListPacket {
    name: string,
    score: number
};

export interface IError {
    errorID: E_SAMPQUERY_ERROR,
    data: string
}

export const incomming_packet_len = 11;
export const outgoing_packet_len = 512;