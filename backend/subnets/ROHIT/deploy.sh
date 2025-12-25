#!/bin/bash
# Deployment script for ROHIT
set -e

echo "🏔️ Deploying ROHIT subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create ROHIT --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy ROHIT --local

echo "✅ Deployment completed!"
