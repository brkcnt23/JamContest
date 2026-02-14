FROM node:20-alpine
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/*.config.* frontend/*.json frontend/*.ts ./

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]