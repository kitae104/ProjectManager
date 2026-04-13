param(
  [switch]$InstallDeps,
  [string]$DevHost = "localhost",
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $projectRoot "frontend"

if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
  throw "frontend/package.json not found."
}

Push-Location $frontendDir
try {
  if ($InstallDeps) {
    Write-Host "[1/2] Installing frontend dependencies"
    npm install
  } else {
    Write-Host "[1/2] Skipping dependency install"
  }

  Write-Host "[2/2] Starting frontend dev server"
  npm run dev -- --host=$DevHost --port=$Port
} finally {
  Pop-Location
}
