#!/bin/bash
# Deployment script for He-man
set -e

echo "🏔️ Deploying He-man subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create He-man --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy He-man --local

echo "✅ Deployment completed!"
