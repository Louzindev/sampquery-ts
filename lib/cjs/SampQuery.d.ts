import { serverClientListPacket, serverDetailedInformationPacket, serverInformationPacket, serverRulesPacket } from './types';
declare class SampQuery {
    private ip;
    private port;
    constructor(ipaddress: string, port: number);
    getServerInformation(): Promise<serverInformationPacket>;
    getServerRules(): Promise<Array<serverRulesPacket>>;
    getServerDetailedInformation(): Promise<Array<serverDetailedInformationPacket>>;
    getServerClientList(): Promise<Array<serverClientListPacket>>;
    private request;
}
export default SampQuery;
