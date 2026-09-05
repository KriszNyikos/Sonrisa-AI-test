# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and backend files
COPY . .

# Install backend dependencies only
RUN npm ci --workspace=backend

# Build TypeScript
RUN npm run build -w backend

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy root and backend package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm ci --workspace=backend --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Set environment
ENV NODE_ENV=production
EXPOSE 3001

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "backend/dist/index.js"]
