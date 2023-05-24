import { SampQuery, serverClientListPacket, serverDetailedInformationPacket, serverInformationPacket } from "./SampQuery";

const query : SampQuery = new SampQuery('172.17.78.33', 7777);

query.getServerInformation().then((response : serverInformationPacket) => {
    console.log(response);
});

query.getServerClientList().then((response : Array<serverClientListPacket>) => {
    console.log(response);
});

query.getServerDetailedInformation().then((response : Array<serverDetailedInformationPacket>) => {
    console.log(response);
});