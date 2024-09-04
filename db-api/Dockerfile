FROM node:20-alpine AS development
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci -f
COPY --chown=node:node . .
USER node

FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm ci -f --only=production && npm cache clean --force
USER node

FROM node:20-alpine AS production
ENV NODE_ENV production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/index.js ./

RUN apk add --no-cache libstdc++ dumb-init libc6-compat

ENTRYPOINT ["docker-entrypoint.sh"]
USER node

# Run with dumb-init to not start node with PID=1, since Node.js was not designed to run as PID 1
CMD ["dumb-init", "node", "./index.js"]
