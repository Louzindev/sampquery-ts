export interface serverInformationPacket {
    isPassworded : boolean,
    maxPlayers : number,
    playerCount : number,
    hostname : string,
    gamemode : string,
    language : string
};

export interface serverRulesPacket {
    ruleName: string,
    ruleValue: string
};

export interface serverDetailedInformationPacket {
    playerId: number,
    playerName: string,
    playerScore: number,
    playerPing: number
};

export interface serverClientListPacket {
    name: string,
    score: number
};

export enum E_SAMPQUERY_ERROR {
    NONE = 0,
    SOCKET_ERROR = 1,
    INVALID_HOST = 2,
    INVALID_PACKET_LEN = 3,
    INVALID_RCON_PASSWORD = 4
}

export interface sampqueryErrorInterface {
    errorID: E_SAMPQUERY_ERROR,
    data: string
}

export type sampqueryCallbackType = (info, err) => void;