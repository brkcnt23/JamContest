#!/bin/bash

# JamContest Server Deploy Script
# Usage: bash scripts/deploy.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 JamContest Server Deploy${NC}"

# ==========================================
# 1. Install Dependencies
# ==========================================

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

# ==========================================
# 2. Database Migrations
# ==========================================

echo -e "${YELLOW}🗄️  Running database migrations...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file first:"
    echo "  cp .env.example .env"
    echo "  nano .env  # Edit DATABASE_URL, JWT_SECRET, etc."
    exit 1
fi

pnpm db:migrate:deploy

# Ask to run seed
read -p "Run database seed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pnpm db:seed
fi

# ==========================================
# 3. Build
# ==========================================

echo -e "${YELLOW}🏗️  Building application...${NC}"
pnpm build

# ==========================================
# 4. Start with PM2 (optional)
# ==========================================

if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🎯 Starting with PM2...${NC}"
    pm2 start contest-platform/backend/dist/main.js --name "jamcontest-backend" --interpreter node
    pm2 save
    echo -e "${GREEN}✅ Backend started with PM2${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not installed. Run manually:${NC}"
    echo "   node contest-platform/backend/dist/main.js"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Backend: http://localhost:3071${NC}"
