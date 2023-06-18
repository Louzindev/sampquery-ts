const squery = require("@devkrieger/sampquery");
const server = new squery.SampQuery({
    ipaddress: '127.0.0.1',
    port: 7778,
    rconpassword: 'louzin'
});

server.sendRCON("echo Hello world!!", (data, error) => {
    if (error)
        return console.log(error);
    console.log(data);
});