const squery = require('../../lib/cjs');
const server = new squery.SampQuery('127.0.0.1', 7777);

server.getServerInformation((info, err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(info);
});