#!/bin/bash

# Hostinger VPS Deployment Script for Indeed CRM
# Run this script on your VPS after initial setup

set -e  # Exit on error

echo "🚀 Indeed CRM Deployment Script"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Installing Docker and Docker Compose...${NC}"
# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${YELLOW}Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${YELLOW}Docker Compose already installed${NC}"
fi

echo -e "${GREEN}Step 2: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.production .env
    echo -e "${YELLOW}⚠ Please edit .env file with your actual values${NC}"
    echo -e "${YELLOW}  - Update POSTGRES_PASSWORD${NC}"
    echo -e "${YELLOW}  - Update DOMAIN name${NC}"
    echo -e "${YELLOW}  - Update EMAIL for SSL${NC}"
    read -p "Press enter after updating .env file..."
fi

echo -e "${GREEN}Step 3: Setting up SSL with Let's Encrypt...${NC}"
read -p "Enter your domain name (e.g., crm.yourdomain.com): " DOMAIN
read -p "Enter your email for SSL notifications: " EMAIL

# Update nginx config with domain
sed -i "s/server_name _;/server_name $DOMAIN;/g" nginx/nginx.conf

# Create nginx/ssl directory
mkdir -p nginx/ssl

# Get SSL certificate
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
    -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email

# Uncomment SSL lines in nginx.conf
sed -i "s|# ssl_certificate |ssl_certificate |g" nginx/nginx.conf
sed -i "s|# ssl_certificate_key |ssl_certificate_key |g" nginx/nginx.conf
sed -i "s|yourdomain.com|$DOMAIN|g" nginx/nginx.conf

echo -e "${GREEN}Step 4: Building and starting containers...${NC}"
docker-compose down
docker-compose up -d --build

echo -e "${GREEN}Step 5: Waiting for services to start...${NC}"
sleep 10

echo -e "${GREEN}Step 6: Checking service status...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "Your CRM is now running at: ${GREEN}https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload your credentials.json file to the root directory"
echo "2. Visit https://$DOMAIN and click 'Connect with Gmail'"
echo "3. Complete OAuth authentication"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs: docker-compose logs -f"
echo "  Restart services: docker-compose restart"
echo "  Stop services: docker-compose down"
echo "  Start services: docker-compose up -d"
echo ""
