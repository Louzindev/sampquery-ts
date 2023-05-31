const squery = require('../../lib/cjs');
const server = new squery.SampQuery('127.0.0.1', 7777);

server.sendRCONCommand("password", "varlist", (info, err) => {
    if(err) {
        console.log(err);
    }
    console.log(info);
    let offset = 11;
    const pl1 = info
});