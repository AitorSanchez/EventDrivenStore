# ─────────────────────────────────────────────────────────────────────────────
# EventDrivenStore — API Service (Development Only)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including devDependencies for ts-node-dev, jest, etc)
COPY package*.json ./
RUN npm install

# In development, the source code is mounted via docker-compose volumes,
# so we don't need to COPY the src directory or build the project here.

EXPOSE 3000

# Start the development server with hot-reloading
CMD ["npm", "run", "dev"]
