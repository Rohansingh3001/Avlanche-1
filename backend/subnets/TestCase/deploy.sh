#!/bin/bash
# Deployment script for TestCase
set -e

echo "🏔️ Deploying TestCase subnet..."

# Check Avalanche CLI
if ! command -v avalanche &> /dev/null; then
    echo "❌ Avalanche CLI not found"
    exit 1
fi

# Create and deploy subnet
avalanche subnet create TestCase --genesis genesis.json --vm SubnetEVM
avalanche subnet deploy TestCase --local

echo "✅ Deployment completed!"
