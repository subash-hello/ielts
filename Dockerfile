FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy the backend package.json files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Copy the PDFs so they are available in the container
COPY pdf/ /app/pdf/

# Set the working directory to the backend folder
WORKDIR /app/backend

# Hugging Face Spaces requires the application to listen on port 7860
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Start the Node.js server
CMD ["npm", "start"]
