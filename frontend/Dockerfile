# Dockerfile for KrishiAI Frontend static server
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend static resources
COPY . /usr/share/nginx/html

# Copy custom nginx config if required, otherwise default configuration is fine
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
