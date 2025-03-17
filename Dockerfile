# Use Node.js LTS as base image
FROM node:18-alpine AS base

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM --platform=$TARGETPLATFORM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.env* ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]