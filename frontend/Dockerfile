# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy sources and build (accept build ARGs for env vars used by CRA)
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Set up the Nginx server
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]