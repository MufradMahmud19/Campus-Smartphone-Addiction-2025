# Stage 1: Building React app
FROM node:18 as build

WORKDIR /app
COPY ../frontend/package*.json ./
RUN npm install
COPY ../frontend ./
RUN npm run build

# Stage 2: Serving with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ../deployment/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
