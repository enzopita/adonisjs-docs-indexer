import { resolve } from 'node:path'
import { regenerate } from '../lib/generator'

const ROOT = resolve(import.meta.dir, '..', '..')

await regenerate(resolve(ROOT, '.repos', 'v7-docs'), resolve(ROOT, 'output'))
