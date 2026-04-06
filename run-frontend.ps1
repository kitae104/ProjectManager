param(
  [switch]$InstallDeps,
  [string]$DevHost = "127.0.0.1",
  [int]$Port = 5173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $rootPath "frontend"

if (-not (Test-Path -LiteralPath $frontendPath)) {
  throw "Frontend directory not found: $frontendPath"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm command not found. Please check Node.js installation."
}

Write-Host "Starting frontend: $frontendPath"
Push-Location $frontendPath
try {
  if ($InstallDeps -or -not (Test-Path -LiteralPath (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Running npm install..."
    npm install
  }

  $viteCmd = Join-Path $frontendPath "node_modules\.bin\vite.cmd"
  if (-not (Test-Path -LiteralPath $viteCmd)) {
    throw "Vite executable not found: $viteCmd (run with -InstallDeps first)"
  }

  & $viteCmd --host $DevHost --port $Port
} finally {
  Pop-Location
}
