# sampquery
> A tool for interact with SA-MP Queries

## Instalation
> `npm install @louzindeev/sampquery ` and, done xD.

## Simple Example

### Getting Server info.
```js
const sampquery = require("@louzindeev/sampquery");

const samp = new sampquery.SampQuery("127.0.0.1", 7777); // local ... ;)

samp.getServerInformation().then((info) => {
    console.log(info);
});
```