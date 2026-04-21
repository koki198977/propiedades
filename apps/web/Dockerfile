# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy shared packages and web app
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies for the whole monorepo
RUN npm install

# Build the web app
RUN npm run build -w apps/web

# Stage 2: Production (Nginx)
FROM nginx:stable-alpine AS runner

# Copy built files from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional, for SPA routing)
# RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
