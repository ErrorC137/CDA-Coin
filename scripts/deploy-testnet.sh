#!/bin/bash

echo "🚀 Deploying CDA Coin System to Testnet..."

# Check if network is provided
if [ -z "$1" ]; then
    echo "❌ Please provide network: sepolia or polygonMumbai"
    echo "Usage: ./deploy-testnet.sh sepolia"
    exit 1
fi

NETWORK=$1

echo "📋 Deploying to $NETWORK network..."

# Deploy contracts
npx hardhat run deployments/deploy.ts --network $NETWORK

echo "✅ Deployment completed!"
echo "📝 Check the console output for contract addresses"
echo "🔗 Add these addresses to your .env.local file"
