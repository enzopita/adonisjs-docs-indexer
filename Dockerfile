FROM oven/bun:1.3.11-alpine
WORKDIR /app

RUN apk add --no-cache git

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src/ src/
COPY tsconfig.json ./

VOLUME ["/app/.repos", "/app/output"]

EXPOSE 3000

CMD ["bun", "run", "src/server/index.ts"]
