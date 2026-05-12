#!/bin/bash

echo "Stopping all services..."

# Kill Node server
fuser -k 8080/tcp > /dev/null 2>&1
# Kill FastAPI server
fuser -k 8000/tcp > /dev/null 2>&1
# Kill Ganache
fuser -k 7545/tcp > /dev/null 2>&1

echo "Cleaning up..."
sleep 2

# Start everything
bash start.sh
