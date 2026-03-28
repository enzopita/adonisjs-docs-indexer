import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { $ } from 'bun'
import { REPO_URL } from './config'

export async function cloneOrUpdateRepo(repoDir: string): Promise<void> {
  if (existsSync(join(repoDir, '.git'))) {
    console.log('Fetching latest changes...')
    await $`git -C ${repoDir} fetch --depth 1 origin main`.quiet()
    await $`git -C ${repoDir} reset --hard origin/main`.quiet()
    await $`git -C ${repoDir} clean -fd`.quiet()
  } else {
    console.log('Cloning v7-docs repository...')
    await $`git clone --depth 1 ${REPO_URL} ${repoDir}`.quiet()
  }
  console.log('Repository ready.')
}
