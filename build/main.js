"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SampQuery_1 = require("./SampQuery");
const query = new SampQuery_1.SampQuery('172.17.78.33', 7777);
query.getServerInformation().then((response) => {
    console.log(response);
});
query.getServerClientList().then((response) => {
    console.log(response);
});
query.getServerDetailedInformation().then((response) => {
    console.log(response);
});
