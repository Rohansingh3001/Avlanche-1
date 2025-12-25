#!/bin/bash
# Deployment script for TEST
set -e

echo "🏔️ Deploying TEST subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create TEST --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy TEST --local

echo "✅ Deployment completed!"
