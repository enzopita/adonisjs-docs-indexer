import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { DOCS_BASE_URL, SECTIONS } from './config'
import { extractFirstParagraph, extractHeadings, parseFrontmatter } from './markdown'
import type { DbCategory, DbChild, IndexedDoc } from './types'

function flattenChildren(
  child: DbChild,
): { title: string; permalink: string; contentPath: string }[] {
  if (child.variations) {
    return child.variations.map((v) => ({
      title: `${child.title} (${v.name})`,
      permalink: v.permalink,
      contentPath: v.contentPath,
    }))
  }

  if (child.permalink && child.contentPath) {
    return [{ title: child.title, permalink: child.permalink, contentPath: child.contentPath }]
  }

  return []
}

export async function indexAll(repoDir: string): Promise<IndexedDoc[]> {
  const contentDir = join(repoDir, 'content')
  const docs: IndexedDoc[] = []

  for (const section of SECTIONS) {
    const sectionDir = join(contentDir, section)
    const categories: DbCategory[] = JSON.parse(
      await readFile(join(sectionDir, 'db.json'), 'utf-8'),
    )

    for (const cat of categories) {
      for (const child of cat.children) {
        for (const entry of flattenChildren(child)) {
          const filePath = resolve(sectionDir, entry.contentPath)
          let content: string
          try {
            content = await readFile(filePath, 'utf-8')
          } catch {
            console.warn(`  Warning: Could not read ${filePath}`)
            continue
          }

          const fm = parseFrontmatter(content)
          const docsUrl = `${DOCS_BASE_URL}/${entry.permalink}`

          docs.push({
            title: fm.title || entry.title,
            description: fm.description || extractFirstParagraph(content),
            topics: extractHeadings(content),
            permalink: entry.permalink,
            docsUrl,
            rawUrl: `${docsUrl}.md`,
            filePath,
            section,
            category: cat.category,
          })
        }
      }
    }
  }

  return docs
}
