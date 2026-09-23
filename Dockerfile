# Etapa 1: build de la app Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: servir con nginx
FROM nginx:alpine
COPY --from=build /app/dist/reservas-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER="^(GATEWAY_URL|AUTH_URL)$"
EXPOSE 80
