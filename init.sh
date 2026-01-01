#!/bin/bash

# Exit on error
set -e

echo "--- Step 1: Setting up AI Models ---"
python3 models/run.py

echo "--- Step 2: Installing Node.js Dependencies ---"
npm install

echo "--- Step 3: Database Setup ---"
npx nx db:generate server
npx nx db:push server

echo "--- Step 4: Building Server ---"
npx nx build server

echo "--- Step 5: Starting Services ---"
echo "Starting server and app..."

# Run server and app in parallel
# We use npx nx to ensure we use the local version
npx nx start server &
npx nx dev app &

# Wait for background processes
wait
