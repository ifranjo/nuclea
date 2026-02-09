#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const appDir = resolve(__dirname, '..')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: appDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    })

    child.on('error', rejectRun)
    child.on('close', (code) => {
      if (code === 0) {
        resolveRun()
      } else {
        rejectRun(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })
  })
}

async function main() {
  console.log('\n[quality-full] Step 1/2 - Webpack analyze build (ANALYZE=true)')
  await run(npxCmd, ['next', 'build', '--webpack'], {
    env: {
      ...process.env,
      ANALYZE: 'true',
    },
  })

  console.log('\n[quality-full] Step 2/2 - Lighthouse baseline script')
  await run(npmCmd, ['run', 'quality:prm-008'])

  console.log('\n[quality-full] Completed successfully')
}

main().catch((error) => {
  console.error('\n[quality-full] Failed:', error)
  process.exitCode = 1
})

