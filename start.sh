#!/bin/bash
nohup npx ganache -d --host 0.0.0.0 --port 7545 --chain.networkId 1337 --chain.chainId 1337 > ganache.log 2>&1 &
GANACHE_PID=$!
sleep 5
npx truffle migrate --reset
npx browserify ./src/js/app.js --ignore cheerio -o ./src/dist/app.bundle.js
nohup node index.js > node.log 2>&1 &
