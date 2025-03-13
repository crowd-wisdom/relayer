# Copy source code and build the project
FROM node:20-alpine AS builder

WORKDIR /builder

COPY . .

RUN npm i -g pnpm@9
RUN pnpm install
RUN pnpm run build

# Create image by copying build artifacts
FROM node:20-alpine AS runner
RUN npm i -g pnpm@9

COPY --chown=node:node  --from=builder /builder/ ./

USER node
ARG PORT=3000

EXPOSE ${PORT}
CMD ["sh", "-c", "node build/main.js"]