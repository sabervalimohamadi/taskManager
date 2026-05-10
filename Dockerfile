# ── Stage 1: production dependencies ─────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# python3/make/g++ required to compile bcrypt native bindings on Alpine
RUN apk add --no-cache python3 make g++ \
    && npm ci --omit=dev

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ \
    && npm ci
COPY . .
RUN npm run build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Copy only the production node_modules (no devDependencies)
COPY --from=deps  /app/node_modules ./node_modules
# Copy compiled output
COPY --from=builder /app/dist ./dist

# node:alpine already ships with a 'node' user (uid 1000)
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/v1/health/live || exit 1

CMD ["node", "dist/main.js"]
