import { cron, Patterns } from '@elysiajs/cron'
import { Elysia } from 'elysia'
import { join, resolve } from 'node:path'
import { regenerate } from '../lib/generator'

const ROOT = resolve(import.meta.dir, '..', '..')
const REPO_DIR = resolve(ROOT, '.repos', 'v7-docs')
const OUTPUT_DIR = resolve(ROOT, 'output')

await regenerate(REPO_DIR, OUTPUT_DIR)

const app = new Elysia()
  .use(
    cron({
      name: 'sync-docs',
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      async run() {
        console.log(`[cron] Syncing docs at ${new Date().toISOString()}`)
        await regenerate(REPO_DIR, OUTPUT_DIR)
      },
    }),
  )
  .get('/', () => ({
    name: 'AdonisJS v7 Docs Indexer',
    endpoints: {
      '/llms.txt': 'LLM-friendly documentation index',
      '/llms-full.txt': 'Full documentation content for LLM consumption',
    },
  }))
  .get('/llms.txt', () => Bun.file(join(OUTPUT_DIR, 'llms.txt')))
  .get('/llms-full.txt', () => Bun.file(join(OUTPUT_DIR, 'llms-full.txt')))
  .listen(3000)

console.log(`Server running at http://${app.server?.hostname}:${app.server?.port}`)
console.log('Cron: sync-docs running daily at midnight')
