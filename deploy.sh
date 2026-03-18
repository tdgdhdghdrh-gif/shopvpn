#!/bin/bash

echo "🚀 Starting deployment..."

# Kill existing processes
echo "🛑 Stopping existing processes..."
pkill -9 -f "next" 2>/dev/null || true
pm2 delete shop 2>/dev/null || true
sleep 2

# Build
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Start with PM2
echo "🟢 Starting with PM2..."
pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
echo "🌐 Website: http://103.253.73.24:3003"
