param(
  [switch]$InstallFrontendDeps
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendScript = Join-Path $rootPath "run-backend.ps1"
$frontendScript = Join-Path $rootPath "run-frontend.ps1"

if (-not (Test-Path -LiteralPath $backendScript)) {
  throw "run-backend.ps1 not found."
}

if (-not (Test-Path -LiteralPath $frontendScript)) {
  throw "run-frontend.ps1 not found."
}

$frontendArgs = @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$frontendScript`""
)

if ($InstallFrontendDeps) {
  $frontendArgs += "-InstallDeps"
}

Write-Host "Starting backend/frontend in separate PowerShell windows."
Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$backendScript`""
)

Start-Process -FilePath "powershell" -ArgumentList $frontendArgs
