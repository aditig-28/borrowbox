FROM node:22-alpine AS dependencies

WORKDIR /app
RUN npm install -g npm@latest
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY config ./config
COPY controllers ./controllers
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY server.js ./

RUN addgroup -S borrowbox && adduser -S borrowbox -G borrowbox \
    && chown -R borrowbox:borrowbox /app

USER borrowbox
EXPOSE 5000
CMD ["node", "server.js"]
