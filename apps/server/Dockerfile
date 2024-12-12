FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml from the root of the Nx workspace
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy the NestJS app source code
COPY . .

# Copy the .env.production file from the server directory
# Adjust the path based on your project structure
COPY ../apps/server/.env.production .env

# Create a non-root user and group
RUN groupadd -r nestgroup && useradd -r -g nestgroup nestuser

# Change ownership of the app directory to the non-root user
RUN chown -R nestuser:nestgroup /app

# Switch to the non-root user
USER nestuser

# Build the NestJS app
RUN pnpm exec nx build server

# Expose the port defined in the .env file
EXPOSE 3001

# Start the application using the PORT from the environment
CMD ["node", "dist/apps/server/main"]
