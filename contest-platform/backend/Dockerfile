FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY backend/package.json backend/package-lock.json* ./
RUN npm install

COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm run prisma:generate
RUN npx nest build

FROM node:20-slim
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

CMD ["node", "dist/main.js"]