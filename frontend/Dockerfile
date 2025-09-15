# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Accept build arguments for environment
ARG NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Copy appropriate environment file based on NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
        cp .env.production .env.local; \
    elif [ "$NODE_ENV" = "docker" ]; then \
        cp .env.docker .env.local; \
    else \
        cp .env.development .env.local; \
    fi

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 