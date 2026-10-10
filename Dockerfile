FROM node:24-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install --yes --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build

COPY package.json package-lock.json .npmrc prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build \
  && npm prune --omit=dev

FROM base AS runtime

ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/package.json /app/package-lock.json /app/prisma.config.ts ./
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
