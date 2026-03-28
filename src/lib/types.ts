export interface DbChild {
  title: string
  permalink?: string
  contentPath?: string
  variations?: { name: string; permalink: string; contentPath: string }[]
}

export interface DbCategory {
  category: string
  children: DbChild[]
}

export interface IndexedDoc {
  title: string
  description: string
  topics: string[]
  permalink: string
  docsUrl: string
  rawUrl: string
  filePath: string
  section: string
  category: string
}
