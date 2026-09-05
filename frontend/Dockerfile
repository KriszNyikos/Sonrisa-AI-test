# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all files
COPY . .

# Install frontend dependencies
RUN npm ci --workspace=frontend

# Build Vue app
RUN npm run build -w frontend

# Production stage - Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config from root
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /app/frontend/dist .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
