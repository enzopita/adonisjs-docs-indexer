# AdonisJS v7 Docs Indexer

Generates `llms.txt` and `llms-full.txt` from the official [AdonisJS v7 documentation](https://docs.adonisjs.com/) for LLM consumption.

Since AdonisJS doesn't provide a native `llms.txt`, this indexer clones the [v7-docs repository](https://github.com/adonisjs/v7-docs), parses the content structure, and generates LLM-friendly index files with proper hyperlinks to the raw markdown sources.

## Project structure

```
src/
├── lib/                # Core library
│   ├── config.ts       # Constants (URLs, sections)
│   ├── types.ts        # Shared interfaces
│   ├── markdown.ts     # Frontmatter/heading extraction
│   ├── repo.ts         # Git clone/fetch operations
│   ├── indexer.ts      # Reads db.json → IndexedDoc[]
│   └── generator.ts    # Generates llms.txt / llms-full.txt
├── cli/
│   └── generate.ts     # CLI entry point
└── server/
    └── index.ts        # Elysia server with daily cron sync
```

## Quick start

```bash
bun install
bun run generate
```

## Usage

### CLI — one-off generation

```bash
bun run generate
```

Clones (or updates) the v7-docs repo and writes output files:

- `output/llms.txt` — structured index with links, descriptions and topics
- `output/llms-full.txt` — full documentation content concatenated

### Server — HTTP endpoints with auto-sync

```bash
bun run serve
```

Starts an Elysia server on port `3000` that:

- Serves `GET /llms.txt` and `GET /llms-full.txt`
- Regenerates daily at midnight via cron
- Runs an initial sync on startup

### Development

```bash
bun run dev       # watch mode
bun run check     # lint + format check
```

## Docker

### Build

```bash
docker build -t adonisjs-docs-indexer .
```

### Run

```bash
docker run -d \
  -p 3000:3000 \
  -v adonisjs-docs-repo:/app/.repos \
  -v adonisjs-docs-output:/app/output \
  --name adonisjs-docs-indexer \
  adonisjs-docs-indexer
```

The volumes persist the cloned repo and generated files across container restarts, so subsequent startups only fetch the diff.

## Output format

The `llms.txt` follows the [llms.txt spec](https://llmstxt.org/) with enriched entries:

```markdown
- [Session guard](https://docs.adonisjs.com/guides/auth/session-guard.md): Learn how to authenticate users using the session guard.
  Topics: Configuring the guard, Logging in, Logging out, Remember me, Events
```

Each link points to the `.md` endpoint on docs.adonisjs.com, which returns raw markdown — ready for direct LLM consumption.
