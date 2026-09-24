# ─────────────────────────────────────────────────────────────────────────────
# EventDrivenStore — Worker Service (Development Only)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm install

# In development, the source code is mounted via docker-compose volumes.
# Workers have no exposed ports.

# Start the development server with hot-reloading
CMD ["npm", "run", "dev"]
