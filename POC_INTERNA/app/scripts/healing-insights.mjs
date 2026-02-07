import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const APP_ROOT = path.resolve(import.meta.dirname, '..')
const RESULTS_DIR = path.join(APP_ROOT, 'test-results')
const HEALING_HISTORY_DIR = path.join(RESULTS_DIR, 'healing-history')
const INSIGHTS_FILE = path.join(RESULTS_DIR, 'healing-insights.json')

function numericDurationFromReport(report) {
  if (Number.isFinite(report?.timings?.totalMs)) {
    return report.timings.totalMs
  }

  const startedMs = Date.parse(report?.startedAt ?? '')
  const finishedMs = Date.parse(report?.finishedAt ?? '')
  if (Number.isFinite(startedMs) && Number.isFinite(finishedMs) && finishedMs >= startedMs) {
    return finishedMs - startedMs
  }

  return null
}

function percentile(values, p) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

async function loadHistoryReports() {
  const files = await readdir(HEALING_HISTORY_DIR)
  const jsonFiles = files.filter((name) => name.endsWith('.json'))
  const reports = []

  for (const name of jsonFiles) {
    const reportPath = path.join(HEALING_HISTORY_DIR, name)
    try {
      // eslint-disable-next-line no-await-in-loop
      const raw = await readFile(reportPath, 'utf-8')
      const parsed = JSON.parse(raw)
      reports.push({ reportPath, report: parsed })
    } catch {
      // skip malformed report files
    }
  }

  reports.sort((a, b) => Date.parse(a.report?.startedAt ?? '') - Date.parse(b.report?.startedAt ?? ''))
  return reports
}

async function main() {
  await mkdir(RESULTS_DIR, { recursive: true })
  await mkdir(HEALING_HISTORY_DIR, { recursive: true })

  const records = await loadHistoryReports()
  const durations = []
  const runtimeModes = {}
  const failureCheckCounts = {}
  const recentFailures = []

  let successCount = 0
  let buildRetryEvents = 0

  for (const item of records) {
    const report = item.report
    if (report.success) successCount += 1
    const mode = report.runtimeMode ?? 'unknown'
    runtimeModes[mode] = (runtimeModes[mode] ?? 0) + 1

    const duration = numericDurationFromReport(report)
    if (duration !== null) durations.push(duration)

    if ((report?.build?.attempts ?? 1) > 1) {
      buildRetryEvents += 1
    }

    const failedChecks = Array.isArray(report.failedChecks)
      ? report.failedChecks
      : (report.onboarding ?? []).filter((c) => c && c.pass === false).map((c) => c.check)

    if (!report.success) {
      recentFailures.push({
        startedAt: report.startedAt ?? null,
        runtimeMode: mode,
        reportPath: item.reportPath,
        failedChecks,
      })
    }

    for (const check of failedChecks) {
      failureCheckCounts[check] = (failureCheckCounts[check] ?? 0) + 1
    }
  }

  recentFailures.sort((a, b) => Date.parse(b.startedAt ?? '') - Date.parse(a.startedAt ?? ''))
  const topFailedChecks = Object.entries(failureCheckCounts)
    .map(([check, count]) => ({ check, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const totalRuns = records.length
  const insights = {
    generatedAt: new Date().toISOString(),
    source: {
      historyDir: HEALING_HISTORY_DIR,
      totalReports: totalRuns,
    },
    health: {
      successCount,
      failureCount: totalRuns - successCount,
      successRate: totalRuns === 0 ? null : Number((successCount / totalRuns).toFixed(4)),
      runtimeModes,
      buildRetryEvents,
    },
    performance: {
      avgDurationMs:
        durations.length === 0
          ? null
          : Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length),
      p50DurationMs: percentile(durations, 50),
      p95DurationMs: percentile(durations, 95),
      maxDurationMs: durations.length === 0 ? null : Math.max(...durations),
    },
    failures: {
      topFailedChecks,
      recentFailures: recentFailures.slice(0, 10),
    },
  }

  await writeFile(INSIGHTS_FILE, JSON.stringify(insights, null, 2), 'utf-8')
  console.log(`[insights] wrote ${INSIGHTS_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
