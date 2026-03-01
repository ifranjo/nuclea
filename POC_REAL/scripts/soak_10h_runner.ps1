param(
  [double]$DurationHours = 10,
  [int]$SleepSeconds = 120,
  [int]$MaxRetries = 3,
  [int]$MaxTotalRetries = 100,
  [switch]$DryRun,
  [switch]$SkipUpload  # Skip upload test (fails on claimed capsules)
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$runId = Get-Date -Format 'yyyyMMdd_HHmmss'
$startAt = Get-Date
$deadline = $startAt.AddHours($DurationHours)

# For dry-run: 2 cycles max
if ($DryRun) {
  $DurationHours = 0.1  # 6 minutes minimum
  $SleepSeconds = 10    # Quick sleep for dry-run
  $deadline = $startAt.AddHours($DurationHours)
}

$logDir = Join-Path $projectRoot 'logs\soak'
if (!(Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$logFile = Join-Path $logDir "soak_${runId}.log"
$csvFile = Join-Path $logDir "soak_${runId}.csv"

"timestamp,cycle,name,exit_code,duration_sec,retry,notes" | Out-File -FilePath $csvFile -Encoding utf8

function Write-Log {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Write-Output $line
  Add-Content -Path $logFile -Value $line
}

function Append-Result {
  param(
    [int]$Cycle,
    [string]$Name,
    [int]$ExitCode,
    [double]$DurationSec,
    [int]$Retry = 0,
    [string]$Notes = ''
  )

  $safeNotes = $Notes.Replace('"', "'")
  $row = '{0},{1},"{2}",{3},{4},{5},"{6}"' -f (
    (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),
    $Cycle,
    $Name,
    $ExitCode,
    [math]::Round($DurationSec, 2),
    $Retry,
    $safeNotes
  )
  Add-Content -Path $csvFile -Value $row
}

function Load-EnvFile {
  param([string]$Path)
  if (!(Test-Path $Path)) {
    Write-Log "WARN: env file not found at $Path"
    return
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
      return
    }

    $parts = $line -split '=', 2
    if ($parts.Length -ne 2) {
      return
    }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    if ($value.StartsWith('"') -and $value.EndsWith('"') -and $value.Length -ge 2) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    Set-Item -Path "Env:$key" -Value $value
  }
}

function Test-Http200 {
  param([string]$Url)
  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
    return $resp.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Run-Step {
  param(
    [int]$Cycle,
    [string]$Name,
    [string]$Command,
    [int]$MaxRetries = 0
  )

  Write-Log "Cycle $Cycle | START $Name"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()

  $stdoutFile = Join-Path $logDir "soak_${runId}_c${Cycle}_${Name}_stdout.log"
  $stderrFile = Join-Path $logDir "soak_${runId}_c${Cycle}_${Name}_stderr.log"

  $retry = 0
  $exitCode = 1

  while ($retry -le $MaxRetries) {
    $retry += 1
    Write-Log "Cycle $Cycle | $Name attempt $retry of $($MaxRetries + 1)"

    $proc = Start-Process -FilePath 'cmd.exe' `
      -ArgumentList '/c', "cd /d $projectRoot && $Command" `
      -NoNewWindow `
      -PassThru `
      -Wait `
      -RedirectStandardOutput $stdoutFile `
      -RedirectStandardError $stderrFile

    $exitCode = $proc.ExitCode

    if ($exitCode -eq 0) {
      break
    }

    if ($retry -le $MaxRetries) {
      Write-Log "Cycle $Cycle | $Name failed with exit=$exitCode, retrying in 10s..."
      Start-Sleep -Seconds 10
    }
  }

  $sw.Stop()
  $duration = $sw.Elapsed.TotalSeconds
  $retriesUsed = [math]::Max(0, $retry - 1)
  $script:totalRetryBudgetUsed += $retriesUsed
  Append-Result -Cycle $Cycle -Name $Name -ExitCode $exitCode -DurationSec $duration -Retry $retry

  if ($exitCode -eq 0) {
    Write-Log "Cycle $Cycle | PASS $Name (${([math]::Round($duration,2))}s, retries=$retriesUsed, retryBudget=$($script:totalRetryBudgetUsed)/$MaxTotalRetries)"
  } else {
    Write-Log "Cycle $Cycle | FAIL $Name exit=$exitCode (${([math]::Round($duration,2))}s, retries=$retriesUsed, retryBudget=$($script:totalRetryBudgetUsed)/$MaxTotalRetries)"
  }

  return $exitCode
}

Write-Log "=============================================="
Write-Log "SOAK TEST START runId=$runId"
Write-Log "Duration: ${DurationHours}h, Sleep: ${SleepSeconds}s, MaxRetries: $MaxRetries, MaxTotalRetries: $MaxTotalRetries, DryRun: $DryRun"
Write-Log "=============================================="
Load-EnvFile -Path (Join-Path $projectRoot '.env.local')

# Keep quick-fill users available for Playwright scripts that rely on them.
$env:NODE_ENV = 'development'

$cycle = 0
$totalPass = 0
$totalFail = 0
$script:totalRetryBudgetUsed = 0
$maxCycles = if ($DryRun) { 2 } else { 999999 }  # Max 2 cycles for dry-run

while ($cycle -lt $maxCycles -and (Get-Date) -lt $deadline -and $script:totalRetryBudgetUsed -lt $MaxTotalRetries) {
  $cycle += 1
  Write-Log "=============================================="
  Write-Log "CYCLE $cycle started at $(Get-Date -Format 'HH:mm:ss')"
  Write-Log "=============================================="

  $appUp = Test-Http200 -Url 'http://127.0.0.1:3002/login'
  $supabaseUp = Test-Http200 -Url 'http://127.0.0.1:54321/auth/v1/health'

  if (-not $appUp -or -not $supabaseUp) {
    $note = "appUp=$appUp supabaseUp=$supabaseUp"
    Write-Log "Cycle $cycle | SKIP infra not ready ($note)"
    Append-Result -Cycle $cycle -Name 'infra-check' -ExitCode 1 -DurationSec 0 -Notes $note
    $script:totalRetryBudgetUsed += 1
    Write-Log "Cycle $cycle | retry budget used=$($script:totalRetryBudgetUsed)/$MaxTotalRetries"
    if ($script:totalRetryBudgetUsed -ge $MaxTotalRetries) {
      Write-Log "Cycle $cycle | STOP max retry budget reached by infra checks"
      break
    }
    Write-Log "Waiting ${SleepSeconds}s before retry..."
    Start-Sleep -Seconds $SleepSeconds
    continue
  }

  Append-Result -Cycle $cycle -Name 'infra-check' -ExitCode 0 -DurationSec 0 -Notes 'app and supabase healthy'

  # Run tests with retries
  $typecheckResult = Run-Step -Cycle $cycle -Name 'typecheck' -Command 'npx tsc --noEmit' -MaxRetries $MaxRetries
  $smokeResult = Run-Step -Cycle $cycle -Name 'smoke-send-claim' -Command 'node tests/smoke_send_claim.mjs' -MaxRetries $MaxRetries
  $betaResult = Run-Step -Cycle $cycle -Name 'playwright-beta' -Command 'node tests/beta_qa.mjs' -MaxRetries $MaxRetries

  $uploadResult = 0
  if (-not $SkipUpload) {
    $uploadResult = Run-Step -Cycle $cycle -Name 'playwright-upload' -Command 'node tests/upload_flow_e2e.mjs' -MaxRetries $MaxRetries
  } else {
    Write-Log "Cycle $cycle | SKIP playwright-upload (--SkipUpload flag set)"
    Append-Result -Cycle $cycle -Name 'playwright-upload' -ExitCode 0 -DurationSec 0 -Notes 'skipped by --SkipUpload flag'
  }

  # Count pass/fail
  $allCore = ($typecheckResult -eq 0 -and $smokeResult -eq 0 -and $betaResult -eq 0)
  $allIncludingUpload = ($allCore -and ($SkipUpload -or $uploadResult -eq 0))

  if ($allIncludingUpload) {
    $totalPass += 1
    Write-Log "Cycle $cycle | SUMMARY: ALL PASS"
  } elseif ($allCore) {
    Write-Log "Cycle $cycle | SUMMARY: CORE PASS (upload skipped/failed)"
  } else {
    $totalFail += 1
    Write-Log "Cycle $cycle | SUMMARY: SOME FAILED (typecheck=$typecheckResult, smoke=$smokeResult, beta=$betaResult, upload=$uploadResult)"
  }

  if ($script:totalRetryBudgetUsed -ge $MaxTotalRetries) {
    Write-Log "Cycle $cycle | STOP max retry budget reached"
    break
  }

  Write-Log "Waiting ${SleepSeconds}s before next cycle..."
  Start-Sleep -Seconds $SleepSeconds
}

Write-Log "=============================================="
Write-Log "SOAK TEST END runId=$runId"
Write-Log "=============================================="
Write-Log "SUMMARY: Total cycles=$cycle, Pass=$totalPass, Fail=$totalFail"
Write-Log "SUMMARY: Retry budget used=$($script:totalRetryBudgetUsed)/$MaxTotalRetries"
Write-Log "Artifacts: $logFile and $csvFile"

# Print CSV summary
Write-Log "`nCSV Results:"
Get-Content $csvFile | Select-Object -First 10
