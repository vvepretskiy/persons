# Stage 1: Build the Angular app
FROM node:18 AS build

WORKDIR /app

# Copy the package.json and pnpm-lock.yaml from the root of the Nx workspace
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the Angular app source code
COPY . .

# Build the Angular app
RUN pnpm exec nx build frontend --prod

# Stage 2: Serve the Angular app
FROM nginx:alpine

# Copy the built Angular app to the Nginx directory
COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html

# Create a non-root user and group
RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup

# Change ownership of the Nginx html directory to the non-root user
RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html
RUN chown -R nginxuser:nginxgroup /var/cache/nginx
RUN chmod -R 755 /var/cache/nginx

# Create a directory for the PID file
RUN mkdir /var/run/nginx && chown nginxuser:nginxgroup /var/run/nginx

# Switch to the non-root user
USER nginxuser

# Copy custom Nginx configuration
COPY /apps/frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
