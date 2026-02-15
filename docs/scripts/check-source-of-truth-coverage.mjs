import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DOCS_DIR = path.join(ROOT, 'docs')
const SOURCE_OF_TRUTH_PATH = path.join(DOCS_DIR, 'SOURCE_OF_TRUTH.md')

function walkMarkdownFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, files)
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(ROOT, fullPath).replaceAll('\\', '/')
      files.push(relativePath)
    }
  }
  return files
}

function parseCoveragePatterns(sourceOfTruthContent) {
  const lines = sourceOfTruthContent.split(/\r?\n/)
  const patterns = []
  let inTrustTable = false

  for (const line of lines) {
    if (line.trim() === '## Trust-state map') {
      inTrustTable = true
      continue
    }

    if (inTrustTable && line.startsWith('## ')) {
      break
    }

    if (!inTrustTable) {
      continue
    }

    const matches = [...line.matchAll(/`([^`]+)`/g)]
    for (const match of matches) {
      const token = match[1]
      if (token.startsWith('docs/')) {
        patterns.push(token)
      }
    }
  }

  return patterns
}

function globToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replaceAll('**', '__DOUBLE_STAR__')
    .replaceAll('*', '[^/]*')
    .replaceAll('__DOUBLE_STAR__', '.*')
  return new RegExp(`^${escaped}$`)
}

function main() {
  if (!fs.existsSync(SOURCE_OF_TRUTH_PATH)) {
    console.error('[sot-coverage] Missing docs/SOURCE_OF_TRUTH.md')
    process.exit(1)
  }

  const sourceOfTruth = fs.readFileSync(SOURCE_OF_TRUTH_PATH, 'utf8')
  const patterns = parseCoveragePatterns(sourceOfTruth)

  if (patterns.length === 0) {
    console.error('[sot-coverage] No docs/* patterns found in Trust-state map.')
    process.exit(1)
  }

  const regexes = patterns.map((pattern) => ({
    pattern,
    regex: globToRegex(pattern)
  }))

  const markdownFiles = walkMarkdownFiles(DOCS_DIR).sort()
  const uncovered = []

  for (const file of markdownFiles) {
    const covered = regexes.some(({ regex }) => regex.test(file))
    if (!covered) {
      uncovered.push(file)
    }
  }

  if (uncovered.length > 0) {
    console.error('[sot-coverage] Unclassified docs found. Add trust-state entries in docs/SOURCE_OF_TRUTH.md:')
    for (const file of uncovered) {
      console.error(`- ${file}`)
    }
    process.exit(1)
  }

  console.log(`[sot-coverage] All docs markdown files are classified (${markdownFiles.length} files).`)
}

main()
