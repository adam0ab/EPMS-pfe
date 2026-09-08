FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/server/package.json apps/server/package.json
RUN npm ci --ignore-scripts
COPY packages/shared packages/shared
COPY apps/server apps/server
RUN npm run build --workspace=@epms/shared && npm run build --workspace=@epms/server
RUN npm prune --omit=dev --ignore-scripts

FROM gcr.io/distroless/nodejs22-debian13:nonroot AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=nonroot:nonroot --from=build /app/package.json ./
COPY --chown=nonroot:nonroot --from=build /app/node_modules node_modules
COPY --chown=nonroot:nonroot --from=build /app/packages/shared/package.json packages/shared/package.json
COPY --chown=nonroot:nonroot --from=build /app/packages/shared/dist packages/shared/dist
COPY --chown=nonroot:nonroot --from=build /app/apps/server/package.json apps/server/package.json
COPY --chown=nonroot:nonroot --from=build /app/apps/server/dist apps/server/dist
EXPOSE 4000
USER nonroot
CMD ["apps/server/dist/index.js"]
