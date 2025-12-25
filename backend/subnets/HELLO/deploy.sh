#!/bin/bash
# Deployment script for HELLO
set -e

echo "🏔️ Deploying HELLO subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create HELLO --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy HELLO --local

echo "✅ Deployment completed!"
