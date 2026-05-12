#!/bin/bash

echo "Starting Ganache..."
nohup npx ganache -d --host 0.0.0.0 --port 7545 --chain.networkId 1337 --chain.chainId 1337 > ganache.log 2>&1 &
sleep 5

echo "Migrating contracts..."
npx truffle migrate --reset

echo "Bundling frontend assets..."
npx browserify ./src/js/app.js --ignore cheerio -o ./src/dist/app.bundle.js

echo "Starting FastAPI Database API..."
cd Database_API
source ../venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > ../uvicorn.log 2>&1 &
cd ..

echo "Starting Node.js Voting Server..."
nohup node index.js > node.log 2>&1 &

echo "All services started successfully!"
