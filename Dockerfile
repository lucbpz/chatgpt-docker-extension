FROM --platform=$BUILDPLATFORM node:20.9.0-alpine3.18 AS builder
WORKDIR /backend
COPY backend/package*.json .
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
COPY backend/. .

FROM --platform=$BUILDPLATFORM node:20.9.0-alpine3.18 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM --platform=$BUILDPLATFORM node:20.9.0-alpine3.18
LABEL org.opencontainers.image.title="Open AI" \
    org.opencontainers.image.description="Docker extension with a node.js backend" \
    org.opencontainers.image.vendor="Docker Inc." \
    com.docker.desktop.extension.api.version="0.3.0" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

COPY --from=builder /backend backend
COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui
CMD ["node", "backend/server.js", "/run/guest-services/extension-node-extension.sock"]
