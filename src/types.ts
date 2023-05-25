interface serverInformationPacket {
    isPassworded : boolean,
    maxPlayers : number,
    playerCount : number,
    hostname : string,
    gamemode : string,
    language : string
};

interface serverRulesPacket {
    ruleName: string,
    ruleValue: string
};

interface serverDetailedInformationPacket {
    playerId: number,
    playerName: string,
    playerScore: number,
    playerPing: number
};

interface serverClientListPacket {
    name: string,
    score: number
};

enum E_SAMPQUERY_ERROR {
    NONE = 0,
    SOCKET_ERROR = 1,
    INVALID_HOST = 2,
    INVALID_PACKET_LEN = 3
}

interface sampqueryErrorInterface {
    errorID: E_SAMPQUERY_ERROR,
    data: string
}

export { serverInformationPacket, serverRulesPacket, serverDetailedInformationPacket, serverClientListPacket, sampqueryErrorInterface, E_SAMPQUERY_ERROR };