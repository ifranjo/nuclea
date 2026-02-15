import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'src')

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css'])
const EVERLIFE_ALLOWED = new Set([
  'src/types/index.ts',
  'src/app/globals.css'
])

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, files)
      continue
    }
    const ext = path.extname(entry.name)
    if (CODE_EXTENSIONS.has(ext)) {
      files.push(fullPath)
    }
  }
  return files
}

function findLineNumbers(text, needle) {
  const lines = text.split(/\r?\n/)
  const matches = []
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes(needle)) {
      matches.push(i + 1)
    }
  }
  return matches
}

function assertTypesFile(violations) {
  const typesPath = path.join(ROOT, 'src', 'types', 'index.ts')
  const content = fs.readFileSync(typesPath, 'utf8')
  const requiredTokens = [
    "'legacy'",
    "'together'",
    "'social'",
    "'pet'",
    "'life-chapter'",
    "'origin'"
  ]

  for (const token of requiredTokens) {
    if (!content.includes(token)) {
      violations.push(
        `Missing canonical capsule token ${token} in src/types/index.ts`
      )
    }
  }

  if (!content.includes("export type StoredCapsuleType = CapsuleType | 'everlife'")) {
    violations.push('Missing StoredCapsuleType legacy compatibility alias in src/types/index.ts')
  }

  if (!content.includes("everlife: 'legacy'")) {
    violations.push("Missing alias normalization mapping 'everlife: legacy' in src/types/index.ts")
  }
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('[ontology] Missing src/ directory')
    process.exit(1)
  }

  const files = walk(SRC_DIR)
  const violations = []

  for (const fullPath of files) {
    const relativePath = path.relative(ROOT, fullPath).replaceAll('\\', '/')
    const content = fs.readFileSync(fullPath, 'utf8')

    const everlifeLines = findLineNumbers(content, 'everlife')
    if (everlifeLines.length > 0 && !EVERLIFE_ALLOWED.has(relativePath)) {
      violations.push(
        `${relativePath}: forbidden legacy token "everlife" at line(s) ${everlifeLines.join(', ')}`
      )
    }

    const underscoreLines = findLineNumbers(content, 'life_chapter')
    if (underscoreLines.length > 0) {
      violations.push(
        `${relativePath}: forbidden runtime slug "life_chapter" at line(s) ${underscoreLines.join(', ')}`
      )
    }
  }

  assertTypesFile(violations)

  if (violations.length > 0) {
    console.error('[ontology] Failed capsule ontology checks:')
    for (const violation of violations) {
      console.error(`- ${violation}`)
    }
    process.exit(1)
  }

  console.log('[ontology] Capsule ontology checks passed.')
}

main()
