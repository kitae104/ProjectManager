param(
  [string]$DbUrl = "jdbc:mysql://localhost:3306/project_manager?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=utf8",
  [string]$DbUsername = "root",
  [string]$DbPassword = "root",
  [int]$BackendPort = 8080,
  [int]$Iterations = 30,
  [int]$StartupTimeoutSec = 90
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$checkScript = Join-Path $projectRoot "api-performance-check.ps1"
$stdoutPath = Join-Path $projectRoot "backend-runtime.stdout.log"
$stderrPath = Join-Path $projectRoot "backend-runtime.stderr.log"

if (-not (Test-Path $checkScript)) {
  throw "api-performance-check.ps1 not found."
}

Write-Host "[1/4] Building backend jar"
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

Write-Host "[2/4] Starting backend runtime"
if (Test-Path $stdoutPath) { Remove-Item -LiteralPath $stdoutPath -Force }
if (Test-Path $stderrPath) { Remove-Item -LiteralPath $stderrPath -Force }

$previousEnv = @{
  DB_URL = $env:DB_URL
  DB_USERNAME = $env:DB_USERNAME
  DB_PASSWORD = $env:DB_PASSWORD
  SERVER_PORT = $env:SERVER_PORT
}

$env:DB_URL = $DbUrl
$env:DB_USERNAME = $DbUsername
$env:DB_PASSWORD = $DbPassword
$env:SERVER_PORT = "$BackendPort"

$proc = $null
try {
  $proc = Start-Process -FilePath "java" `
    -ArgumentList @("-jar", $jar.FullName) `
    -WorkingDirectory $backendDir `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru

  $healthUrl = "http://localhost:$BackendPort/api/health"
  $deadline = (Get-Date).AddSeconds($StartupTimeoutSec)
  $healthy = $false
  while ((Get-Date) -lt $deadline) {
    if ($proc.HasExited) { break }
    try {
      $resp = Invoke-WebRequest -Uri $healthUrl -Method Get -TimeoutSec 3
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) {
        $healthy = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  if (-not $healthy) {
    Write-Host "Backend failed to become healthy on $healthUrl."
    Write-Host "STDOUT:"
    if (Test-Path $stdoutPath) { Get-Content -LiteralPath $stdoutPath -Tail 120 }
    Write-Host "STDERR:"
    if (Test-Path $stderrPath) { Get-Content -LiteralPath $stderrPath -Tail 120 }
    throw "Backend startup failed."
  }

  Write-Host "[3/4] Running API performance check"
  & $checkScript -BaseUrl "http://localhost:$BackendPort" -Iterations $Iterations

  Write-Host "[4/4] Done"
} finally {
  if ($proc -and -not $proc.HasExited) {
    $proc | Stop-Process -Force
  }

  foreach ($key in $previousEnv.Keys) {
    $value = $previousEnv[$key]
    if ($null -eq $value) {
      Remove-Item "Env:$key" -ErrorAction SilentlyContinue
    } else {
      Set-Item "Env:$key" $value
    }
  }
}
