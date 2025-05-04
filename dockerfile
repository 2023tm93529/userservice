# Use official Node.js image
FROM node:18

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the container
COPY . .

# Expose the app port
EXPOSE 3000

# Command to start the app
CMD ["node", "index.js"]
