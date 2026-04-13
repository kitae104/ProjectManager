$ErrorActionPreference = "Stop"

Write-Host "[1/2] Backend tests"
Push-Location backend
try {
  ./gradlew.bat test --console=plain
} finally {
  Pop-Location
}

Write-Host "[2/2] Frontend build"
Push-Location frontend
try {
  npm run build
} finally {
  Pop-Location
}

Write-Host "Release check completed successfully."
