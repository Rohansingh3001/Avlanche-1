#!/bin/bash
# Deployment script for WORLD
set -e

echo "🏔️ Deploying WORLD subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create WORLD --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy WORLD --local

echo "✅ Deployment completed!"
