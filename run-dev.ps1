param(
  [switch]$InstallFrontendDeps,
  [int]$BackendPort = 8080,
  [string]$FrontendHost = "localhost",
  [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

if (-not (Test-Path (Join-Path $backendDir "gradlew.bat"))) {
  throw "backend/gradlew.bat not found."
}

if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
  throw "frontend/package.json not found."
}

if ($InstallFrontendDeps) {
  Write-Host "[0/2] Installing frontend dependencies"
  Push-Location $frontendDir
  try {
    npm install
  } finally {
    Pop-Location
  }
}

$backendCommand = @"
Set-Location "$backendDir"
`$env:SERVER_PORT="$BackendPort"
./gradlew.bat bootRun
"@

$frontendCommand = @"
Set-Location "$frontendDir"
npm run dev -- --host=$FrontendHost --port=$FrontendPort
"@

Write-Host "[1/2] Starting backend in new PowerShell window"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  $backendCommand
)

Write-Host "[2/2] Starting frontend in new PowerShell window"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  $frontendCommand
)

Write-Host ""
Write-Host "Backend:  http://localhost:$BackendPort/api/health"
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "To stop, close each opened PowerShell window (or press Ctrl + C in each)."
