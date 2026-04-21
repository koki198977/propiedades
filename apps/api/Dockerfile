# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy shared packages
COPY packages ./packages

# Copy API app
COPY apps/api ./apps/api

# Install dependencies for the whole monorepo
RUN npm install

# Build shared packages first
RUN npm run build -w packages/types

# Build the API
RUN npm run build -w apps/api

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy built artifacts and necessary files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/database ./packages/database

# Expose API port
EXPOSE 3000

# Start the application
CMD ["node", "apps/api/dist/main"]
