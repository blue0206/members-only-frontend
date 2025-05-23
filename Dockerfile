FROM node:20

# Set working directory.
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application.
COPY . .

# Expose dev port.
EXPOSE 5173

# Run application.
CMD ["npm", "run", "dev", "--", "--host"]
