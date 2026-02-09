#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appDir = resolve(__dirname, '..');
const docsDir = resolve(appDir, 'docs', 'quality');
const tempDir = resolve(appDir, '.next', 'lighthouse');
const reportPath = resolve(docsDir, 'PRM-QUALITY-008_Lighthouse_Baseline.md');
const analyzeSnapshotDir = resolve(docsDir, 'analyze');

const port = Number(process.env.QUALITY_PORT || 3100);
const url = `http://localhost:${port}`;
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

mkdirSync(docsDir, { recursive: true });

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: appDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('error', rejectRun);
    child.on('close', (code) => {
      if (code === 0) {
        resolveRun();
      } else {
        rejectRun(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function waitForServer(maxAttempts = 45) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Server is still booting.
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not become ready at ${url} after ${maxAttempts}s`);
}

function killTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(pid, 'SIGTERM');
  } catch (_error) {
    // Process may already be gone.
  }
}

function readAudit(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function metric(report, auditId, decimals = 2) {
  const value = report?.audits?.[auditId]?.numericValue;
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function msToSeconds(ms) {
  if (typeof ms !== 'number') return null;
  return Math.round((ms / 1000) * 100) / 100;
}

function toPrintable(value, unit = '') {
  if (value === null || value === undefined) return 'n/a';
  return unit ? `${value}${unit}` : `${value}`;
}

const mobileJsonPath = join(tempDir, 'lighthouse-mobile.json');
const desktopJsonPath = join(tempDir, 'lighthouse-desktop.json');
const mobileJsonCliPath = '.next/lighthouse/lighthouse-mobile.json';
const desktopJsonCliPath = '.next/lighthouse/lighthouse-desktop.json';

let serverProcess;

try {
  console.log(`\n[quality] Building production bundle in ${appDir}`);
  await run(npmCmd, ['run', 'build']);
  mkdirSync(tempDir, { recursive: true });

  console.log(`[quality] Starting production server at ${url}`);
  serverProcess = spawn(npmCmd, ['run', 'start', '--', '-p', String(port)], {
    cwd: appDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  await waitForServer();

  console.log('[quality] Running Lighthouse mobile profile');
  await run(npxCmd, [
    '--yes',
    'lighthouse@12.6.1',
    url,
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--only-categories=performance',
    '--output=json',
    '--output-path',
    mobileJsonCliPath,
    '--quiet',
  ]);

  console.log('[quality] Running Lighthouse desktop profile');
  await run(npxCmd, [
    '--yes',
    'lighthouse@12.6.1',
    url,
    '--preset=desktop',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--only-categories=performance',
    '--output=json',
    '--output-path',
    desktopJsonCliPath,
    '--quiet',
  ]);

  const mobile = readAudit(mobileJsonPath);
  const desktop = readAudit(desktopJsonPath);

  const rows = [
    { profile: 'mobile', report: mobile },
    { profile: 'desktop', report: desktop },
  ].map(({ profile, report }) => ({
    profile,
    performanceScore: metric(report, null) ?? Math.round((report.categories.performance.score || 0) * 100),
    lcpSec: msToSeconds(metric(report, 'largest-contentful-paint', 2)),
    cls: metric(report, 'cumulative-layout-shift', 3),
    inpMs: metric(report, 'interaction-to-next-paint', 0),
    tbtMs: metric(report, 'total-blocking-time', 0),
  }));

  const generatedAt = new Date().toISOString();
  const markdown = [
    '# PRM-QUALITY-008 Lighthouse Baseline',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Repro Command',
    '',
    '```bash',
    'cd PREREUNION_ANDREA',
    'npm run quality:prm-008',
    '```',
    '',
    '## Full Rerun (Analyzer + Lighthouse)',
    '',
    '```bash',
    'cd PREREUNION_ANDREA',
    'npm run quality:prm-008:full',
    '```',
    '',
    '## Evidence',
    '',
    `- URL tested: \`${url}\``,
    `- Mobile JSON: \`${mobileJsonPath}\``,
    `- Desktop JSON: \`${desktopJsonPath}\``,
    `- Analyzer snapshot (from full rerun): \`${analyzeSnapshotDir}\\client.html\`, \`${analyzeSnapshotDir}\\edge.html\`, \`${analyzeSnapshotDir}\\nodejs.html\``,
    '',
    '## Metrics',
    '',
    '| Profile | Perf Score | LCP (s) | CLS | INP (ms) | TBT (ms) |',
    '|---|---:|---:|---:|---:|---:|',
    ...rows.map((row) => `| ${row.profile} | ${toPrintable(row.performanceScore)} | ${toPrintable(row.lcpSec)} | ${toPrintable(row.cls)} | ${toPrintable(row.inpMs)} | ${toPrintable(row.tbtMs)} |`),
    '',
  ].join('\n');

  writeFileSync(reportPath, markdown, 'utf8');
  console.log(`\n[quality] Report generated at ${reportPath}`);
} catch (error) {
  console.error('\n[quality] Failed:', error);
  process.exitCode = 1;
} finally {
  if (serverProcess?.pid) {
    killTree(serverProcess.pid);
  }
}
