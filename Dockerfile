# Dockerfile para Quasar/Vite frontend robusto y compatible con scripts postinstall
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 make g++ \
    && npm install
COPY .env* ./
RUN npm run build

# --- Etapa de producción ---
FROM nginx:alpine
COPY --from=build /app/dist/spa /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/spa /usr/share/nginx/html
# Opcional: copia tu nginx.conf si tienes uno personalizado
# COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 