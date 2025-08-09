# Multi-stage React Dockerfile - Optimized
FROM node:20-alpine AS build

WORKDIR /app

# Accept CI as build argument and set it to false by default
ARG CI=false
ENV CI=${CI}

# Copy package files first for better Docker layer caching
COPY package*.json ./
RUN npm ci --silent

# Copy source code and build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Add a label to identify our container
LABEL app=agentichub

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]