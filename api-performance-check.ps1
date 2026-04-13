param(
  [string]$BaseUrl = "http://localhost:8080",
  [int]$Iterations = 30,
  [int]$TimeoutSec = 10
)

$ErrorActionPreference = "Stop"

if ($Iterations -lt 1) {
  throw "Iterations must be at least 1."
}

$endpoint = "/api/health"
$durations = New-Object System.Collections.Generic.List[double]

Write-Host "API performance check"
Write-Host "BaseUrl   : $BaseUrl"
Write-Host "Endpoint  : $endpoint"
Write-Host "Iterations: $Iterations"

for ($i = 1; $i -le $Iterations; $i++) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    Invoke-WebRequest -Uri "$BaseUrl$endpoint" -Method Get -TimeoutSec $TimeoutSec | Out-Null
  } catch {
    throw "Request failed at iteration $i. $($_.Exception.Message)"
  } finally {
    $sw.Stop()
  }

  $ms = [Math]::Round($sw.Elapsed.TotalMilliseconds, 2)
  $durations.Add($ms)
  Write-Host ("[{0}/{1}] {2} ms" -f $i, $Iterations, $ms)
}

$stats = [pscustomobject]@{
  Iterations = $Iterations
  MinMs      = [Math]::Round(($durations | Measure-Object -Minimum).Minimum, 2)
  AvgMs      = [Math]::Round(($durations | Measure-Object -Average).Average, 2)
  MaxMs      = [Math]::Round(($durations | Measure-Object -Maximum).Maximum, 2)
}

Write-Host ""
Write-Host "Summary"
$stats | Format-List
