import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const APP_ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS_DIR = path.join(APP_ROOT, 'test-results')

function run(cmd) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, {
      cwd: APP_ROOT,
      shell: true,
      stdio: 'pipe',
    })

    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => {
      const chunk = d.toString()
      stdout += chunk
      process.stdout.write(chunk)
    })
    proc.stderr.on('data', (d) => {
      const chunk = d.toString()
      stderr += chunk
      process.stderr.write(chunk)
    })

    proc.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr })
    })
  })
}

async function applyHealingActions(iteration) {
  // Keep deterministic and safe: clean generated artifacts/caches only.
  await rm(path.join(APP_ROOT, '.next'), { recursive: true, force: true })
  await rm(path.join(RESULTS_DIR, 'autocheck-screens'), { recursive: true, force: true })
  console.log(`[heal] iteration ${iteration}: cleaned .next and autocheck screenshots`)
}

function parseIterationsArg() {
  const arg = process.argv.find((a) => a.startsWith('--iterations='))
  if (!arg) return 3
  const value = Number(arg.split('=')[1])
  if (!Number.isFinite(value) || value < 1) return 3
  return Math.min(10, value)
}

async function main() {
  const maxIterations = parseIterationsArg()
  await mkdir(RESULTS_DIR, { recursive: true })

  const session = {
    startedAt: new Date().toISOString(),
    maxIterations,
    iterations: [],
    success: false,
  }

  for (let i = 1; i <= maxIterations; i += 1) {
    console.log(`\n[heal] ===== Iteration ${i}/${maxIterations} =====`)
    const result = await run('npm run autocheck')
    const entry = {
      iteration: i,
      exitCode: result.code,
      success: result.code === 0,
      finishedAt: new Date().toISOString(),
    }
    session.iterations.push(entry)

    if (result.code === 0) {
      session.success = true
      break
    }

    await applyHealingActions(i)
  }

  session.finishedAt = new Date().toISOString()
  const out = path.join(RESULTS_DIR, 'healing-session-report.json')
  await writeFile(out, JSON.stringify(session, null, 2), 'utf-8')

  if (!session.success) {
    console.error(`[heal] failed after ${maxIterations} iterations. Report: ${out}`)
    process.exit(1)
  }

  console.log(`[heal] success. Report: ${out}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

