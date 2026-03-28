---
name: adonisjs
description: Build backend applications with AdonisJS v7, a type-safe Node.js framework with batteries included.
---

# AdonisJS v7 Development Skill

## Documentation Sources

All documentation is served as raw markdown, always up-to-date:

- **Index with topics**: `https://adonisjs-docs-indexer.enzopita.com/llms.txt`
- **Full docs (single file)**: `https://adonisjs-docs-indexer.enzopita.com/llms-full.txt`

Every link in the index points to a `.md` endpoint on `docs.adonisjs.com` that returns raw markdown.

## When to Use This Skill

Trigger this skill when the user asks to:
- Create or modify AdonisJS routes, controllers, or middleware
- Work with Lucid ORM (models, migrations, relationships, queries)
- Implement authentication (session guard, access tokens, social auth)
- Add authorization with Bouncer (abilities and policies)
- Handle validation with VineJS
- Configure file uploads, sessions, or cookies
- Use Edge templates or Inertia (React/Vue) for frontend
- Set up mail, queues, cache, or other services
- Write tests (API, browser, console)
- Create Ace CLI commands
- Deploy AdonisJS applications to production

## How to Use the Documentation

### Step 1: Fetch the index

Fetch `https://adonisjs-docs-indexer.enzopita.com/llms.txt` to find the right page.

Each entry has this format:
```
- [Title](https://docs.adonisjs.com/{permalink}.md): Description of the page
  Topics: Heading 1, Heading 2, Heading 3, ...
```

Use the **Topics** line to identify the exact page you need without opening it. For example, if the user asks about "remember me tokens", scan the topics and you'll find it under the Session guard page.

### Step 2: Fetch the specific page

Click/fetch the URL from the index entry. It returns raw markdown with full code examples.

### Step 3: Apply with context

Use the fetched documentation to provide accurate, version-correct code. **Never guess AdonisJS v7 APIs** — always verify against the docs first.

### When to use llms-full.txt

Use the full docs file when:
- The user asks a broad question spanning multiple topics
- You need to cross-reference between sections
- You want full context about the framework in one fetch

Prefer the index + individual pages for targeted questions (lower token cost).

## Quick Start

```bash
npm init adonisjs@latest my-app
cd my-app
node ace serve --hmr
```

## Key Patterns

### Routing
```typescript
// start/routes.ts
import router from '@adonisjs/core/services/router'

router.get('/', async () => ({ hello: 'world' }))
router.post('/posts', '#controllers/posts_controller.store')
router.resource('posts', '#controllers/posts_controller')

router.group(() => {
  router.get('/profile', '#controllers/users_controller.profile')
}).prefix('/api').middleware('auth')
```

### Controllers
```typescript
// app/controllers/posts_controller.ts
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ response }: HttpContext) {
    return response.ok({ posts: [] })
  }

  async store({ request }: HttpContext) {
    const data = request.only(['title', 'content'])
    return data
  }
}
```

### Lucid ORM
```typescript
// app/models/post.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Comment from '#models/comment'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
```

### Validation (VineJS)
```typescript
import vine from '@vinejs/vine'

const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    content: vine.string().trim(),
  })
)

// In controller:
const data = await request.validateUsing(createPostValidator)
```

### Authentication
```typescript
// Login with session guard
await auth.use('web').login(user)

// Protect routes
router.get('/dashboard', '#controllers/dashboard_controller.index')
  .middleware('auth')

// Access authenticated user
const user = auth.user!
```

## Deprecated v6 Patterns — DO NOT USE

Your training data likely contains AdonisJS v5/v6 patterns. These are **wrong for v7**. Never generate them.

### Imports and modules

```typescript
// WRONG — v6 IoC container imports
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// CORRECT — v7 uses ESM subpath imports
import User from '#models/user'
import router from '@adonisjs/core/services/router'
import type { HttpContext } from '@adonisjs/core/http'
```

### JIT compiler

```typescript
// WRONG — ts-node was replaced in v7
import 'ts-node-maintained/register/esm'

// CORRECT
import '@poppinss/ts-exec'
```

### Request and Response classes

```typescript
// WRONG — renamed in v7 (conflicted with native platform classes)
import { Request, Response } from '@adonisjs/core/http'
Request.macro('foo', () => {})

// CORRECT
import { HttpRequest, HttpResponse } from '@adonisjs/core/http'
HttpRequest.macro('foo', () => {})
```

### URL builder

```typescript
// WRONG — deprecated in v7
router.makeUrl('posts.show', { id: 1 })
router.makeSignedUrl('posts.show', { id: 1 })

// CORRECT
import { urlFor } from '@adonisjs/core/services/url_builder'
urlFor('posts.show', { id: 1 })

// Edge templates:
// WRONG: route('posts.show', { id: 1 })
// CORRECT: urlFor('posts.show', { id: 1 })
```

### Helpers removed in v7

```typescript
// WRONG — these helpers no longer exist
import { getDirname, getFilename, slash, cuid } from '@adonisjs/core/helpers'

// CORRECT
import.meta.dirname          // replaces getDirname()
import.meta.filename         // replaces getFilename()

import stringHelpers from '@adonisjs/core/helpers/string'
stringHelpers.toUnixSlash()  // replaces slash()
// cuid() removed — use crypto.randomUUID() or nanoid
```

### Flash messages

```edge
{{-- WRONG — 'errors' key was removed in v7 --}}
{{ flashMessages.get('errors.email') }}

{{-- CORRECT --}}
{{ flashMessages.get('inputErrorsBag.email') }}
```

### Assembler hooks (adonisrc.ts)

```typescript
// WRONG — v6 hook names
hooks: {
  onBuildStarting: [],
  onSourceFileChanged: [],
  onDevServerStarted: [],
  onBuildCompleted: [],
}

// CORRECT — v7 renamed all hooks
hooks: {
  buildStarting: [],
  fileChanged: [],
  devServerStarted: [],
  buildFinished: [],
  // New in v7: fileAdded, fileRemoved, devServerStarting, testsStarting, testsFinished
}
```

### Inertia configuration

```typescript
// WRONG — v6 Inertia config pattern
export default defineConfig({
  entrypoint: 'inertia/app/app.tsx',
  history: { encrypt: true },
  sharedData: { user: (ctx) => ctx.auth.user },
})

// CORRECT — v7 restructured Inertia
export default defineConfig({
  // entrypoint removed
  encryptHistory: true,
  // sharedData removed — use middleware instead
})
// File paths changed: inertia/app/app.tsx → inertia/app.tsx
```

### Encryption

```typescript
// WRONG — v6 had appKey in config/app.ts
// appKey: env.get('APP_KEY')

// CORRECT — v7 uses dedicated config/encryption.ts
import { defineConfig, drivers } from '@adonisjs/core/encryption'

export default defineConfig({
  default: 'legacy',
  list: {
    legacy: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),
  },
})
```

### Test file globs

```typescript
// WRONG — v6 glob syntax (glob package)
files: ['tests/unit/**/*.spec(.ts|.js)']

// CORRECT — v7 uses Node.js built-in glob
files: ['tests/unit/**/*.spec.{ts,js}']
```

### General v6 patterns to avoid

- **CommonJS**: Never use `require()`, `module.exports`, or `export =`. AdonisJS v7 is ESM-only.
- **@ioc: prefix**: The `@ioc:` import prefix does not exist in v7. All imports use standard ESM.
- **Contract interfaces**: `HttpContextContract`, `RequestContract`, etc. were renamed to just `HttpContext`, `Request` types.
- **Relative imports for app code**: Always use `#` subpath imports (`#models/...`, `#controllers/...`), never `../../app/models/...`.
- **Youch bundled**: `youch` is no longer bundled — install it as a dev dependency if needed.

## Best Practices

- **Use `#` imports**: AdonisJS uses subpath imports (`#controllers/...`, `#models/...`) instead of relative paths
- **Validate at the edge**: Always validate request input in controllers using VineJS
- **Type-safe**: Leverage TypeScript — AdonisJS provides end-to-end type safety
- **Convention over configuration**: Follow the framework's naming conventions and folder structure
- **Use Ace generators**: `node ace make:controller`, `node ace make:model`, `node ace make:migration`
- **Never guess APIs**: When unsure, fetch the relevant `.md` page from the index and verify
