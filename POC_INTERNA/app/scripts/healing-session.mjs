import { spawn } from 'node:child_process'
import { access, copyFile, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const APP_ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS_DIR = path.join(APP_ROOT, 'test-results')
const HEALING_HISTORY_DIR = path.join(RESULTS_DIR, 'healing-history')
const FULL_AUTOCHECK_SCRIPT = path.join('scripts', 'full-autocheck.mjs')

function run(cmd, options = {}) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, {
      cwd: APP_ROOT,
      shell: true,
      stdio: 'pipe',
      env: {
        ...process.env,
        ...options.env,
      },
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
  const value = Number(readArgValue('iterations') ?? 3)
  if (!Number.isFinite(value) || value < 1) return 3
  return Math.min(10, value)
}

function readArgValue(name) {
  const eqPrefix = `--${name}=`
  const idx = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(eqPrefix))
  if (idx === -1) return null

  const current = process.argv[idx]
  if (current.startsWith(eqPrefix)) {
    return current.slice(eqPrefix.length)
  }

  return process.argv[idx + 1] ?? null
}

function parseModeArg() {
  const value = (readArgValue('mode') ?? 'heal').toLowerCase()
  if (value === 'stability') return 'stability'
  return 'heal'
}

function parseRuntimeArg() {
  const value = (readArgValue('runtime') ?? process.env.AUTOCHECK_RUNTIME ?? 'start').toLowerCase()
  if (value === 'dev') return 'dev'
  return 'start'
}

function parseHistoryLimitArg() {
  const value = Number(readArgValue('history-limit') ?? process.env.HEAL_HISTORY_LIMIT ?? 60)
  if (!Number.isFinite(value) || value < 1) return 60
  return Math.min(500, Math.floor(value))
}

function normalizeForFilename(value) {
  return value.replace(/[:.]/g, '-')
}

async function pathExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK)
    return true
  } catch {
    return false
  }
}

async function pruneHistoryFiles(limit) {
  const names = await readdir(HEALING_HISTORY_DIR)
  const entries = []

  for (const name of names) {
    const filePath = path.join(HEALING_HISTORY_DIR, name)
    // eslint-disable-next-line no-await-in-loop
    const stats = await stat(filePath)
    if (!stats.isFile()) continue
    entries.push({ filePath, modifiedAt: stats.mtimeMs })
  }

  entries.sort((a, b) => b.modifiedAt - a.modifiedAt)
  const staleEntries = entries.slice(limit)

  for (const stale of staleEntries) {
    // eslint-disable-next-line no-await-in-loop
    await rm(stale.filePath, { force: true })
  }
}

async function main() {
  const maxIterations = parseIterationsArg()
  const mode = parseModeArg()
  const runtime = parseRuntimeArg()
  const historyLimit = parseHistoryLimitArg()
  await mkdir(RESULTS_DIR, { recursive: true })
  await mkdir(HEALING_HISTORY_DIR, { recursive: true })

  const session = {
    startedAt: new Date().toISOString(),
    mode,
    runtime,
    historyLimit,
    maxIterations,
    iterations: [],
    success: false,
  }

  console.log(`[heal] mode: ${mode}`)
  console.log(`[heal] runtime: ${runtime}`)

  for (let i = 1; i <= maxIterations; i += 1) {
    console.log(`\n[heal] ===== Iteration ${i}/${maxIterations} =====`)
    const result = await run(`"${process.execPath}" ${FULL_AUTOCHECK_SCRIPT}`, {
      env: { AUTOCHECK_RUNTIME: runtime },
    })
    const stamp = normalizeForFilename(new Date().toISOString())
    const iterationId = String(i).padStart(2, '0')
    const autocheckReportSrc = path.join(RESULTS_DIR, 'full-autocheck-report.json')
    const autocheckReportDst = path.join(HEALING_HISTORY_DIR, `iter-${iterationId}-${stamp}.json`)
    let reportCopied = false
    if (await pathExists(autocheckReportSrc)) {
      await copyFile(autocheckReportSrc, autocheckReportDst)
      reportCopied = true
    }

    let logPath = null
    if (result.code !== 0) {
      logPath = path.join(HEALING_HISTORY_DIR, `iter-${iterationId}-${stamp}.log`)
      await writeFile(logPath, `${result.stdout}\n${result.stderr}`, 'utf-8')
    }

    const entry = {
      iteration: i,
      exitCode: result.code,
      success: result.code === 0,
      autocheckReportPath: reportCopied ? autocheckReportDst : null,
      failureLogPath: logPath,
      finishedAt: new Date().toISOString(),
    }
    session.iterations.push(entry)

    if (result.code === 0 && mode === 'heal') {
      session.success = true
      console.log('[heal] first successful iteration reached; stopping in heal mode.')
      break
    }

    if (result.code !== 0) {
      await applyHealingActions(i)
    }
  }

  await pruneHistoryFiles(historyLimit)

  if (mode === 'stability') {
    session.success =
      session.iterations.length === maxIterations && session.iterations.every((it) => it.success)
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
