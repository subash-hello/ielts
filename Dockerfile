FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy the backend package.json files
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Hugging Face Spaces requires the application to listen on port 7860
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Start the Node.js server
CMD ["npm", "start"]
