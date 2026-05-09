#!/bin/bash
npx browserify ./src/js/app.js --ignore cheerio -o ./src/dist/app.bundle.js
npx browserify ./src/js/login.js -o ./src/dist/login.bundle.js
pkill -f uvicorn
source venv/bin/activate && cd Database_API && nohup uvicorn main:app --host 0.0.0.0 --port 8000 > ../uvicorn.log 2>&1 &
