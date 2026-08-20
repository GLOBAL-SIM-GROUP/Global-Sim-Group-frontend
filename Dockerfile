# ─────────────────────────────────────────────────────────────
# GLOBAL SIM GROUP — SIM · frontend (TanStack Start SSR)
#
# Build multi-stage, image Node minimale. En production, le rendu SSR
# est assuré par `server.mjs` (hôte node:http + serveur statique),
# qui exécute le bundle `dist/server/server.js` produit par Vite.
#
# Build :  docker build -t sim-frontend .
# Run   :  docker run -p 3000:3000 sim-frontend
# Compose : docker compose up --build
# ─────────────────────────────────────────────────────────────

# ── Étape 1 — Build : source → dist/ ─────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Dépendances en premier (cache Docker préservé tant que le lock ne bouge pas).
# `.npmrc` porte `legacy-peer-deps=true` (tolérance openapi-typescript vs
# TypeScript 6, cf. docs/development.md) ; le flag ci-dessous est explicite
# pour que le build reste correct même si le `.npmrc` évolue.
COPY package.json package-lock.json .npmrc ./
RUN npm ci --legacy-peer-deps

# Code source + fichiers générés committés (schema.ts, routeTree.gen.ts).
COPY . .

# URL du backend, INLINÉE au build (variable Vite).
# Défaut : `/api/v1` (même origine) — à mettre derrière un reverse-proxy
# qui relaie `/api/*` vers le backend NestJS.
# Autre domaine : docker build --build-arg VITE_API_URL=https://host/api/v1 .
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Étape 2 — Runtime : dist/ + serveur custom ──────────────────
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Dépendances de prod uniquement (React, TanStack, etc.).
# Même `.npmrc` + flag qu'à l'étape build.
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Artefacts du build Vite (client + server, avant Nitro compilation).
COPY --from=build /app/dist ./dist
COPY prod-server.mjs ./prod-server.mjs

ENV PORT=3000
EXPOSE 3000

# Non-root : l'image officielle node fournit l'utilisateur `node`.
USER node

# Hôte custom : relaye /api/* vers le backend NestJS + sert SSR + assets.
CMD ["node", "prod-server.mjs"]
