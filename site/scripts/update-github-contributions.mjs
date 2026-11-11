import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseContributionHtml } from '../assets/js/github-contributions.js'

const username = 'WU928-spec'
const output = new URL('../assets/data/github-contributions.json', import.meta.url)

try {
  const response = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: { Accept: 'text/html', 'User-Agent': 'wuspace-site-build' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
  const contributions = parseContributionHtml(await response.text())
  if (contributions.days.length === 0) throw new Error('No contribution days found')
  const payload = { ...contributions, updatedAt: new Date().toISOString() }
  await mkdir(new URL('../assets/data/', import.meta.url), { recursive: true })
  await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Updated ${contributions.days.length} contribution days`)
} catch (error) {
  try {
    await readFile(output, 'utf8')
    console.warn(`Using cached GitHub contributions: ${error.message}`)
  } catch {
    throw error
  }
}
