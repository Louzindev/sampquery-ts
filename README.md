# sampquery

> A tool for interact with SA-MP Queries

## Instalation

> `npm install @devkrieger/sampquery ` and, done xD.

## Simple Example

### Getting Server info.

```js
const squery = require("@devkrieger/sampquery");
const server = new squery.SampQuery("127.0.0.1", 7777); // Local ;)

server.getServerInformation((info, err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(info);
});
```

## [Wiki](https://github.com/Krieger0725/sampquery-ts/wiki)
