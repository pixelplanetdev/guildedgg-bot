# Basic guilded.gg Bot

This is just a test to run a bot on guilded.gg.
All guild and channel and user informations are being fetched.
Currently its possible to answer to basic messages, to get images and to post images

This porject will be obsolete as soon as guilded provides their own bot libraries.

## Building and Running

```
npm install
npm run Build
npm start -- email@mail.com yourguildedpassword
```

If you want to develop your own bot, look into `src/index.js` how it's used.
The `src/guildedjs` module provides the interface.
It is not planned to ship it in an own package or to publish it on npm.
