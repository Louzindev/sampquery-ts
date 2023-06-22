# sampquery

> A tool for interact with SA-MP Queries

## Instalation

> `npm install @devkrieger/sampquery ` and, done xD.

## Simple Example

### Getting Server info.

```js
const squery = require("@devkrieger/sampquery");
const server = new squery.SampQuery({
  ipaddress: "127.0.0.1",
  port: 7778,
  rconpassword: "password",
});

server.getServerInformation((info, err) => {
  if (err) {
    return console.log(err);
  }
  console.log(info);
});
```

## [Wiki](https://github.com/KriegerDev/sampquery-ts/wiki)
