#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const appDir = resolve(__dirname, '..')
const buildIdPath = resolve(appDir, '.next', 'BUILD_ID')

const port = Number(process.env.SMOKE_PORT || 3210)
const baseUrl = `http://localhost:${port}`
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function killTree(pid) {
  if (!pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }

  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    // Process may already be gone.
  }
}

async function waitForServer(url, attempts = 45) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Server still booting.
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 1000))
  }

  throw new Error(`Server did not become ready at ${url}`)
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function assertResult(results, name, pass, detail) {
  results.push({ name, pass, detail })
  if (pass) {
    console.log(`[smoke] PASS: ${name}`)
  } else {
    console.error(`[smoke] FAIL: ${name} -> ${detail}`)
  }
}

async function runSmokeChecks() {
  if (!existsSync(buildIdPath)) {
    throw new Error('Missing production build. Run `npm run build` before `npm run smoke:routes`.')
  }

  const results = []
  let serverProcess

  try {
    if (process.platform === 'win32') {
      serverProcess = spawn(`${npmCmd} run start -- -p ${port}`, {
        cwd: appDir,
        stdio: 'inherit',
        shell: true,
      })
    } else {
      serverProcess = spawn(npmCmd, ['run', 'start', '--', '-p', String(port)], {
        cwd: appDir,
        stdio: 'inherit',
      })
    }

    await waitForServer(baseUrl)

    const homeResponse = await fetch(`${baseUrl}/`)
    const homeHtml = await homeResponse.text()
    assertResult(results, 'Home page responds 200', homeResponse.status === 200, `status=${homeResponse.status}`)
    assertResult(results, 'Home includes NUCLEA marker', homeHtml.includes('NUCLEA'), 'missing NUCLEA in HTML')

    const privacyResponse = await fetch(`${baseUrl}/privacidad`)
    assertResult(results, 'Privacy page responds 200', privacyResponse.status === 200, `status=${privacyResponse.status}`)

    const termsResponse = await fetch(`${baseUrl}/terminos`)
    assertResult(results, 'Terms page responds 200', termsResponse.status === 200, `status=${termsResponse.status}`)

    const waitlistResponse = await fetch(`${baseUrl}/api/waitlist`)
    const waitlistPayload = await parseJsonSafe(waitlistResponse)
    const waitlistCountIsNumber = typeof waitlistPayload?.count === 'number'
    assertResult(results, 'Waitlist GET responds 200', waitlistResponse.status === 200, `status=${waitlistResponse.status}`)
    assertResult(results, 'Waitlist GET returns numeric count', waitlistCountIsNumber, `payload=${JSON.stringify(waitlistPayload)}`)

    const capsulesResponse = await fetch(`${baseUrl}/api/capsules`)
    assertResult(results, 'Capsules GET without token returns 401', capsulesResponse.status === 401, `status=${capsulesResponse.status}`)

    const exportResponse = await fetch(`${baseUrl}/api/privacy/export`)
    assertResult(results, 'Privacy export without token returns 401', exportResponse.status === 401, `status=${exportResponse.status}`)

    const deleteResponse = await fetch(`${baseUrl}/api/privacy/account`, { method: 'DELETE' })
    assertResult(results, 'Privacy delete without token returns 401', deleteResponse.status === 401, `status=${deleteResponse.status}`)

    const failed = results.filter((item) => !item.pass)
    if (failed.length > 0) {
      console.error(`\n[smoke] ${failed.length}/${results.length} checks failed.`)
      process.exitCode = 1
      return
    }

    console.log(`\n[smoke] All ${results.length} checks passed.`)
  } finally {
    if (serverProcess?.pid) {
      killTree(serverProcess.pid)
    }
  }
}

runSmokeChecks().catch((error) => {
  console.error('\n[smoke] Failed:', error)
  process.exitCode = 1
})
