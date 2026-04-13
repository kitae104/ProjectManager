param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"

if (-not (Test-Path (Join-Path $backendDir "gradlew.bat"))) {
  throw "backend/gradlew.bat not found."
}

Push-Location $backendDir
try {
  $env:SERVER_PORT = "$Port"
  Write-Host "Starting backend on port $Port"
  .\gradlew.bat bootRun
} finally {
  Pop-Location
}
