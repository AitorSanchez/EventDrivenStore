# ─────────────────────────────────────────────────────────────────────────────
# EventDrivenStore — Frontend Service (Development)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Install all dependencies (including devDependencies for vite, jest, etc)
COPY package*.json ./
RUN npm install --legacy-peer-deps

EXPOSE 5173

# Run Vite dev server with host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
