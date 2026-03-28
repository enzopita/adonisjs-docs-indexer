const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/
const HEADING_RE = /^#{2,3}\s+(.+)/

export function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n*/, '')
}

export function parseFrontmatter(content: string): { title?: string; description?: string } {
  const match = content.match(FRONTMATTER_RE)
  if (!match) return {}

  const result: { title?: string; description?: string } = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(title|description):\s*['"]?(.*?)['"]?\s*$/)
    if (kv) {
      result[kv[1] as 'title' | 'description'] = kv[2]
    }
  }
  return result
}

export function extractHeadings(content: string): string[] {
  const body = stripFrontmatter(content)
  const headings: string[] = []

  for (const line of body.split('\n')) {
    const match = line.match(HEADING_RE)
    if (match) {
      headings.push(match[1].trim())
    }
  }

  return headings
}

export function extractFirstParagraph(content: string): string {
  const body = stripFrontmatter(content).replace(/^#[^\n]*\n*/, '')

  for (const p of body.split(/\n\n+/)) {
    const trimmed = p.trim()
    if (trimmed && !/^[#\-`]/.test(trimmed)) {
      return trimmed
        .replace(/\n/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 200)
    }
  }
  return ''
}
