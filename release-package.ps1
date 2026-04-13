param(
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$releaseRoot = Join-Path $projectRoot "release"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$bundleDir = Join-Path $releaseRoot "bundle-$timestamp"
$backendBundleDir = Join-Path $bundleDir "backend"
$frontendBundleDir = Join-Path $bundleDir "frontend"

if (-not $SkipChecks) {
  Write-Host "[1/4] Running release checks"
  & (Join-Path $projectRoot "release-check.ps1")
} else {
  Write-Host "[1/4] Skipping release checks"
}

Write-Host "[2/4] Building backend jar"
Push-Location $backendDir
try {
  ./gradlew.bat bootJar --console=plain
} finally {
  Pop-Location
}

$jar = Get-ChildItem -Path (Join-Path $backendDir "build/libs") -Filter "*.jar" |
  Where-Object { $_.Name -notlike "*-plain.jar" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $jar) {
  throw "Backend jar not found in backend/build/libs."
}

Write-Host "[3/4] Building frontend dist"
Push-Location $frontendDir
try {
  npm run build
} finally {
  Pop-Location
}

Write-Host "[4/4] Creating release bundle"
New-Item -ItemType Directory -Force -Path $backendBundleDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $frontendBundleDir "dist") | Out-Null

Copy-Item -LiteralPath $jar.FullName -Destination (Join-Path $backendBundleDir $jar.Name) -Force

$backendEnvExample = Join-Path $backendDir ".env.example"
if (Test-Path $backendEnvExample) {
  Copy-Item -LiteralPath $backendEnvExample -Destination (Join-Path $backendBundleDir ".env.example") -Force
}

Copy-Item -LiteralPath (Join-Path $frontendDir "dist/*") -Destination (Join-Path $frontendBundleDir "dist") -Recurse -Force

$frontendEnvExample = Join-Path $frontendDir ".env.example"
if (Test-Path $frontendEnvExample) {
  Copy-Item -LiteralPath $frontendEnvExample -Destination (Join-Path $frontendBundleDir ".env.example") -Force
}

$manifestPath = Join-Path $bundleDir "release-manifest.txt"
$manifestLines = @(
  "Release Bundle",
  "GeneratedAt=$((Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz"))",
  "BackendJar=$($jar.Name)",
  "FrontendDist=frontend/dist",
  "BundlePath=$bundleDir"
)
$manifestLines | Set-Content -LiteralPath $manifestPath -Encoding UTF8

Write-Host "Release bundle created:"
Write-Host $bundleDir
