# Use the slim version for a smaller AWS footprint
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (better for caching!)
COPY package*.json ./
RUN npm ci --only=production

# Copy your source code
COPY . .

# Match this to your server.js port (usually 4000)
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]