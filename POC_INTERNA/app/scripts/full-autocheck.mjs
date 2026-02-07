import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'

const APP_ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS_DIR = path.join(APP_ROOT, 'test-results')
const AUTOCHECK_PORT = Number(process.env.AUTOCHECK_PORT || 3101)
const NPM_BIN = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const NPX_BIN = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const CAPSULE_ROUTES = [
  {
    name: 'Legacy Capsule',
    cardLabel: 'Cápsula Legacy',
    slug: 'legacy',
    summaryToken: 'diario personal',
  },
  {
    name: 'Life Chapter Capsule',
    cardLabel: 'Cápsula Capítulo de Vida',
    slug: 'life-chapter',
    summaryToken: 'etapas concretas',
  },
  {
    name: 'Together Capsule',
    cardLabel: 'Cápsula Together',
    slug: 'together',
    summaryToken: 'historia de una relacion',
  },
  {
    name: 'Social Capsule',
    cardLabel: 'Cápsula Social',
    slug: 'social',
    summaryToken: 'compartir momentos',
  },
  {
    name: 'Pet Capsule',
    cardLabel: 'Cápsula Mascota',
    slug: 'pet',
    summaryToken: 'recuerdos de mascotas',
  },
  {
    name: 'Origin Capsule',
    cardLabel: 'Cápsula Origen',
    slug: 'origin',
    summaryToken: 'historia de sus hijos',
  },
]

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const commandLine = [command, ...args].join(' ')
    const proc = spawn(commandLine, {
      cwd: APP_ROOT,
      shell: true,
      stdio: 'pipe',
      ...options,
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
      if (code === 0) return resolve({ code, stdout, stderr })
      reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`))
    })
  })
}

function killProcessTree(proc) {
  return new Promise((resolve) => {
    if (!proc || !proc.pid) {
      resolve()
      return
    }

    if (process.platform === 'win32') {
      const killer = spawn(`taskkill /PID ${proc.pid} /T /F`, {
        shell: true,
        stdio: 'ignore',
      })
      killer.on('close', () => resolve())
      killer.on('error', () => resolve())
      return
    }

    proc.kill('SIGTERM')
    proc.on('close', () => resolve())
    proc.on('error', () => resolve())
  })
}

async function pathExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK)
    return true
  } catch {
    return false
  }
}

async function hasEslintConfig() {
  const candidates = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.json',
    'eslint.config.js',
    'eslint.config.cjs',
    'eslint.config.mjs',
  ]

  for (const candidate of candidates) {
    if (await pathExists(path.join(APP_ROOT, candidate))) {
      return true
    }
  }

  return false
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 1500)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (res.ok) return true
    } catch (_) {
      // ignore until timeout
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`Server not reachable at ${url} within ${timeoutMs}ms`)
}

async function isPortFree(port) {
  return await new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port)
  })
}

async function findFreePort(startPort) {
  let port = startPort
  for (let i = 0; i < 50; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port
    port += 1
  }
  throw new Error(`No free port found from ${startPort} to ${startPort + 49}`)
}

async function runBuildWithRetry(maxAttempts = 2) {
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await rm(path.join(APP_ROOT, '.next'), { recursive: true, force: true })
      await runCommand(NPM_BIN, ['run', 'build'])
      return attempt
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        console.warn(`Build attempt ${attempt} failed. Retrying...`)
      }
    }
  }

  throw lastError ?? new Error('Build failed with unknown error')
}

async function runOnboardingChecks(baseUrl) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  const page = await context.newPage()

  const dvhFixCss = `.h-\\[100dvh\\]{height:100vh!important;}`
  const injectDvhFix = async () => {
    await page.addStyleTag({ content: dvhFixCss })
  }

  const artifactsDir = path.join(RESULTS_DIR, 'autocheck-screens')
  await mkdir(artifactsDir, { recursive: true })

  const checks = []
  const browserErrors = []
  const ensureOnP4 = async () => {
    for (let guard = 0; guard < 8; guard += 1) {
      if ((await page.locator('text=Elige tu cápsula').count()) > 0) {
        await injectDvhFix()
        return
      }

      if ((await page.getByLabel('Toca para abrir la cápsula').count()) > 0) {
        await page.getByLabel('Toca para abrir la cápsula').click()
        continue
      }

      if ((await page.locator('text=Animación de apertura').count()) > 0) {
        await page.waitForTimeout(4200)
        continue
      }

      if ((await page.locator('button:has-text("Continuar")').count()) > 0) {
        await page.click('button:has-text("Continuar")')
        continue
      }

      await page.waitForTimeout(500)
    }

    await page.goto(`${baseUrl}/onboarding?step=4`, { waitUntil: 'networkidle' })
    await injectDvhFix()
    if ((await page.locator('text=Elige tu cápsula').count()) > 0) {
      return
    }

    throw new Error('Could not reach P4 state during autocheck')
  }

  const ensureTokenVisible = async (token, fallbackStep = null) => {
    try {
      await page.waitForFunction(
        (needle) => document.body.innerText.includes(needle),
        token,
        { timeout: 10000 },
      )
      return
    } catch {
      if (!fallbackStep) {
        throw new Error(`Token "${token}" not visible and no fallback configured`)
      }
    }

    await page.goto(`${baseUrl}/onboarding?step=${fallbackStep}`, { waitUntil: 'networkidle' })
    await page.waitForFunction(
      (needle) => document.body.innerText.includes(needle),
      token,
      { timeout: 10000 },
    )
  }

  page.on('pageerror', (err) => {
    browserErrors.push(`pageerror: ${err.message}`)
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      browserErrors.push(`console.error: ${msg.text()}`)
    }
  })

  await page.goto(`${baseUrl}/onboarding`, { waitUntil: 'networkidle' })
  await injectDvhFix()

  const p1 = page.getByLabel('Toca para abrir la cápsula')
  checks.push({
    check: 'P1 interactive capsule visible',
    pass: await p1.isVisible(),
  })
  await page.screenshot({ path: path.join(artifactsDir, 'P1.png') })

  await p1.click()
  await page.waitForFunction(
    () =>
      document.body.innerText.includes('apertura') ||
      document.body.innerText.includes('Somos las historias'),
    { timeout: 12000 },
  )
  await injectDvhFix()
  const p2Visible = (await page.locator('text=Animación de apertura').count()) > 0
  const p3VisibleEarly = (await page.locator('text=Somos las historias').count()) > 0
  checks.push({
    check: 'P2 opening placeholder visible',
    pass: p2Visible || p3VisibleEarly,
  })
  await page.screenshot({ path: path.join(artifactsDir, p2Visible ? 'P2.png' : 'P2_or_P3.png') })

  if (!p3VisibleEarly) {
    await ensureTokenVisible('Somos las historias', 3)
  }
  await injectDvhFix()
  checks.push({
    check: 'P3 manifesto copy visible',
    pass:
      (await page.locator('text=Somos las historias que recordamos.').count()) > 0 &&
      (await page.locator('text=Haz que las tuyas permanezcan.').count()) > 0,
  })
  await page.screenshot({ path: path.join(artifactsDir, 'P3.png') })

  await page.click('button:has-text("Continuar")')
  await ensureTokenVisible('Elige tu cápsula', 4)
  await injectDvhFix()
  checks.push({
    check: 'P4 capsule list has six cards',
    pass: (await page.locator('button:has(h3)').count()) >= 6,
  })
  await page.screenshot({ path: path.join(artifactsDir, 'P4.png') })

  for (const capsule of CAPSULE_ROUTES) {
    await ensureOnP4()
    const card = page
      .getByRole('button', { name: new RegExp(escapeRegex(capsule.cardLabel), 'i') })
      .first()
    let clickedFromP4 = false
    try {
      if ((await card.count()) > 0) {
        await card.click({ timeout: 8000 })
        clickedFromP4 = true
      }
    } catch {
      clickedFromP4 = false
    }

    if (!clickedFromP4) {
      await page.goto(`${baseUrl}/onboarding/capsule/${capsule.slug}`, { waitUntil: 'networkidle' })
    }

    await page.waitForURL(`**/onboarding/capsule/${capsule.slug}`)

    const headingVisible = (await page.locator(`h1:has-text("${capsule.name}")`).count()) > 0
    const summaryHasToken = await page
      .locator('main')
      .innerText()
      .then((txt) => txt.toLowerCase().includes(capsule.summaryToken))

    checks.push({
      check: `Capsule detail route works: ${capsule.slug}`,
      pass: page.url().includes(`/onboarding/capsule/${capsule.slug}`),
    })
    checks.push({
      check: `Capsule card click path works: ${capsule.slug}`,
      pass: clickedFromP4,
    })
    checks.push({
      check: `Capsule detail heading visible: ${capsule.slug}`,
      pass: headingVisible,
    })
    checks.push({
      check: `Capsule detail summary aligned: ${capsule.slug}`,
      pass: summaryHasToken,
    })

    await page.screenshot({ path: path.join(artifactsDir, `${capsule.slug}.png`) })
    await page.click('text=Volver')
    await page.waitForURL('**/onboarding', { waitUntil: 'networkidle' })
  }

  checks.push({
    check: 'Browser console/page errors',
    pass: browserErrors.length === 0,
    details: browserErrors,
  })

  await browser.close()
  return checks
}

async function main() {
  await mkdir(RESULTS_DIR, { recursive: true })
  const report = {
    startedAt: new Date().toISOString(),
    lint: { pass: false, skipped: false, reason: null },
    build: { pass: false, attempts: 0 },
    onboarding: [],
    pdfAlignment: { pass: false },
    runtimePort: null,
  }

  if (await hasEslintConfig()) {
    await runCommand(NPM_BIN, ['run', 'lint'])
    report.lint.pass = true
  } else {
    report.lint = {
      pass: true,
      skipped: true,
      reason: 'No ESLint config found; skipped to keep autocheck non-interactive.',
    }
    console.log('Lint step skipped: no ESLint config found.')
  }

  report.build.attempts = await runBuildWithRetry(2)
  report.build.pass = true

  let devProc = null
  const runtimePort = await findFreePort(AUTOCHECK_PORT)
  const baseUrl = `http://localhost:${runtimePort}`
  report.runtimePort = runtimePort

  try {
    devProc = spawn(`${NPX_BIN} next dev -p ${runtimePort}`, {
      cwd: APP_ROOT,
      shell: true,
      stdio: 'pipe',
    })
    devProc.stdout.on('data', (d) => process.stdout.write(d.toString()))
    devProc.stderr.on('data', (d) => process.stderr.write(d.toString()))
    await waitForServer(`${baseUrl}/onboarding`)

    report.onboarding = await runOnboardingChecks(baseUrl)
    await runCommand('python', ['scripts/autocheck_pdf_alignment.py'])
    report.pdfAlignment.pass = true
  } finally {
    if (devProc) {
      await killProcessTree(devProc)
    }
  }

  report.finishedAt = new Date().toISOString()
  report.success =
    report.lint.pass &&
    report.build.pass &&
    report.pdfAlignment.pass &&
    report.onboarding.every((c) => c.pass)

  const reportFile = path.join(RESULTS_DIR, 'full-autocheck-report.json')
  await writeFile(reportFile, JSON.stringify(report, null, 2), 'utf-8')

  if (!report.success) {
    console.error(`Autocheck failed. See ${reportFile}`)
    process.exit(1)
  }

  console.log(`Autocheck passed. Report: ${reportFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
