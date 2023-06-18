const squery = require("@devkrieger/sampquery");
const server = new squery.SampQuery({
    ipaddress: '127.0.0.1',
    port: 7778,
    rconpassword: 'louzin'
});

server.getServerInformation((data, err) => {
    if (err) 
        return console.log(err);
    console.log(data);
});