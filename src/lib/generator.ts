import { mkdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DOCS_BASE_URL, SECTION_TITLES } from './config'
import { indexAll } from './indexer'
import { stripFrontmatter } from './markdown'
import { cloneOrUpdateRepo } from './repo'
import type { IndexedDoc } from './types'

export function generateLlmsTxt(docs: IndexedDoc[]): string {
  const lines: string[] = [
    '# AdonisJS v7 Documentation',
    '',
    '> AdonisJS is a backend-first, type-safe framework for building web applications with Node.js and TypeScript. This file indexes the official v7 documentation for LLM consumption.',
    '',
    `> Documentation site: ${DOCS_BASE_URL}`,
    '> Source repository: https://github.com/adonisjs/v7-docs',
    '',
  ]

  const grouped = Map.groupBy(docs, (doc) => doc.section)

  for (const [section, sectionDocs] of grouped) {
    lines.push(`## ${SECTION_TITLES[section] || section}`, '')

    const byCategory = Map.groupBy(sectionDocs, (doc) => doc.category)
    for (const [category, categoryDocs] of byCategory) {
      lines.push(`### ${category}`, '')
      for (const doc of categoryDocs) {
        const desc = doc.description ? `: ${doc.description}` : ''
        lines.push(`- [${doc.title}](${doc.rawUrl})${desc}`)
        if (doc.topics.length > 0) {
          lines.push(`  Topics: ${doc.topics.join(', ')}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

export async function generateLlmsFullTxt(docs: IndexedDoc[]): Promise<string> {
  const parts: string[] = [
    '# AdonisJS v7 — Full Documentation',
    '',
    '> Complete documentation content for LLM consumption.',
    '> Source: https://github.com/adonisjs/v7-docs',
    `> Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    '---',
    '',
  ]

  for (const doc of docs) {
    let content: string
    try {
      content = await readFile(doc.filePath, 'utf-8')
    } catch {
      continue
    }

    parts.push(
      `<!-- SOURCE: ${doc.docsUrl} -->`,
      `<!-- SECTION: ${doc.section} | CATEGORY: ${doc.category} -->`,
      '',
      stripFrontmatter(content).trim(),
      '',
      '---',
      '',
    )
  }

  return parts.join('\n')
}

export async function regenerate(repoDir: string, outputDir: string) {
  await cloneOrUpdateRepo(repoDir)

  console.log('Indexing documentation...')
  const docs = await indexAll(repoDir)
  console.log(`Indexed ${docs.length} documents.`)

  await mkdir(outputDir, { recursive: true })

  const llmsTxt = generateLlmsTxt(docs)
  await Bun.write(join(outputDir, 'llms.txt'), llmsTxt)

  const llmsFullTxt = await generateLlmsFullTxt(docs)
  await Bun.write(join(outputDir, 'llms-full.txt'), llmsFullTxt)

  console.log(
    `Regenerated: llms.txt (${(llmsTxt.length / 1024).toFixed(1)} KB), llms-full.txt (${(llmsFullTxt.length / 1024).toFixed(1)} KB)`,
  )
}
