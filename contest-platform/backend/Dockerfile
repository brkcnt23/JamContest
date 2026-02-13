FROM node:18-alpine
WORKDIR /app
# Copy monorepo root lock/package files
COPY pnpm-lock.yaml package.json ./
# Install pnpm and all dependencies for the monorepo
RUN npm install -g pnpm && pnpm install --frozen-lockfile
# Copy backend source
COPY backend ./backend
# Install backend dependencies only (if needed)
RUN pnpm install --filter ./backend...
# Build the backend
WORKDIR /app/backend
RUN pnpm exec nest build
# Start the app
CMD ["node", "backend/dist/main.js"]
WORKDIR /app
# Copy monorepo root lock/package files and backend package.json
COPY pnpm-lock.yaml package.json ./
COPY backend/package.json ./
# Install pnpm and all dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile
# Copy backend source
COPY backend .
# Build the backend
RUN pnpm exec nest build
# Start the app
CMD ["node", "dist/main.js"]
