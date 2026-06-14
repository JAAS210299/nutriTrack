# ── Etapa 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build          # genera /app/dist


# ── Etapa 2: producción (imagen mínima) ──────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia el build compilado
COPY --from=builder /app/dist ./dist

# Usuario sin privilegios
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]
