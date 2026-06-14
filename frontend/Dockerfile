# ── Etapa 1: build Angular ────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production


# ── Etapa 2: servir con Nginx (Caddy actúa como proxy delante) ────────────────
FROM nginx:alpine AS production

# Copia el build
COPY --from=builder /app/dist/nutritrack/browser /usr/share/nginx/html

# Config nginx para Angular (SPA routing — todas las rutas a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
