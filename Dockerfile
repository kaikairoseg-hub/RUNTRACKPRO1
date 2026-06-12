# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "src/index.js"]
