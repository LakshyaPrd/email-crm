#!/bin/bash
# Complete deployment fix script for VPS

echo "🔧 Fixing Indeed CRM deployment issues..."

cd /opt/indeed-crm

# 1. Stop containers
echo "📦 Stopping containers..."
docker compose -f docker-compose.simple.yml down

# 2. Fix token.json directory issue
echo "🗂️ Removing token.json directory if it exists..."
docker compose -f docker-compose.simple.yml run --rm backend bash -c "rm -rf /app/token.json"

# 3. Create proper directory structure
echo "📁 Creating proper directory structure..."
mkdir -p backend/uploads

# 4. Start containers
echo "🚀 Starting containers..."
docker compose -f docker-compose.simple.yml up -d

# 5. Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# 6. Check status
echo "✅ Checking container status..."
docker compose -f docker-compose.simple.yml ps

# 7. Show backend logs
echo "📋 Backend logs (last 20 lines):"
docker compose -f docker-compose.simple.yml logs backend | tail -20

echo ""
echo "✅ Deployment fix complete!"
echo ""
echo "📤 IMPORTANT: Upload credentials.json:"
echo "   From Windows: scp C:\\Lakshya\\indeed-crm\\backend\\credentials.json root@76.13.17.251:/opt/indeed-crm/backend/"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://76.13.17.251:3000"
echo "   Backend:  http://76.13.17.251:8000/docs"
