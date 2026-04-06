Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $rootPath "backend"
$gradleWrapper = Join-Path $backendPath "gradlew.bat"

if (-not (Test-Path -LiteralPath $backendPath)) {
  throw "Backend directory not found: $backendPath"
}

if (-not (Test-Path -LiteralPath $gradleWrapper)) {
  throw "Gradle Wrapper not found: $gradleWrapper"
}

Write-Host "Starting backend: $backendPath"
Push-Location $backendPath
try {
  & .\gradlew.bat bootRun
} finally {
  Pop-Location
}
