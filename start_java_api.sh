#!/bin/bash

# Voting System Java API Startup Script

echo "Starting Voting System Java API..."
echo "=================================="

# Navigate to the VotingSystemAPI directory
cd "$(dirname "$0")/VotingSystemAPI"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed. Please install Maven first."
    exit 1
fi

# Build the project
echo "Building project..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Run the application
echo ""
echo "Starting Spring Boot Application..."
echo "API will be available at: http://localhost:8081"
echo ""

java -jar target/voting-system-api-1.0.0.jar
