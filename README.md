# sampquery

> A tool for interact with SA-MP Queries

## Instalation

> `npm install @louzindeev/sampquery ` and, done xD.

## Simple Example

### Getting Server info.

```js
const squery = require("@louzindeev/sampquery");
const server = new squery.SampQuery("127.0.0.1", 7777); // Local ;)

server.getServerInformation((info, err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(info);
});
```

## [Wiki](https://github.com/LouzinDeev/sampquery-ts/wiki)
