#!/bin/bash
# Deployment script for shivam
set -e

echo "🏔️ Deploying shivam subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create shivam --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy shivam --local

echo "✅ Deployment completed!"
