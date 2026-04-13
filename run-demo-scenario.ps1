$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$reportPath = Join-Path $backendDir "build/reports/demo/demo-scenario-summary.json"

Write-Host "[1/2] Running demo scenario test"
Push-Location $backendDir
try {
  ./gradlew.bat test --tests "com.projectmanager.backend.demo.DemoScenarioApiTest" --console=plain
} finally {
  Pop-Location
}

Write-Host "[2/2] Demo summary"
if (Test-Path $reportPath) {
  Get-Content -LiteralPath $reportPath
  Write-Host ""
  Write-Host "Saved to: $reportPath"
} else {
  Write-Host "Summary file not found: $reportPath"
}
