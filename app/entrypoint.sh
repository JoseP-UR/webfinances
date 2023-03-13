#!/bin/bash

environment="app"
npmCommand="npm run dev"
DIRECTORY="/$environment"

if ! [[ -d "$DIRECTORY/node_modules" ]]
    then
        echo "node_modules not found, running install commands"
        cd /$environment/ && npm install && npm ci
fi
    echo "node_modules found, running..."
    cd /$environment/ && $npmCommand