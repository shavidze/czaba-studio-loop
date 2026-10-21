# One-time: move the CZABA Studio loop from loop-v2/run-loop-v2.ps1 to the public agent-loop-kit
# (C:/Apps/agent-loop-kit, a git clone of github.com/shavidze/agent-loop-kit) at the next B -> A boundary.
param([switch]$Now)
$ErrorActionPreference = 'Stop'
$taskRoot = 'C:/Apps/czaba-project/tmp/studio-real-loop'
$v2 = "$taskRoot/loop-v2"
$kit = 'C:/Apps/agent-loop-kit'
$config = "$taskRoot/kit.config.json"
function Log([string]$m) { $line = "$([DateTime]::UtcNow.ToString('o')) $m"; Add-Content -LiteralPath "$v2/switch-to-kit.log" -Value $line -Encoding UTF8; Write-Host $line }
function Stop-Tree([int]$rootPid) {
    $all = @(Get-CimInstance Win32_Process)
    $ids = @($rootPid)
    do { $added = @($all | Where-Object { $_.ParentProcessId -in $ids -and $_.ProcessId -notin $ids } | Select-Object -ExpandProperty ProcessId); $ids += $added } while ($added.Count -gt 0)
    foreach ($id in ($ids | Sort-Object -Descending)) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
}
foreach ($f in @("$kit/run-loop.ps1", "$kit/start-loop.ps1", $config, "$taskRoot/prompts/A.md", "$taskRoot/policy.local.md")) { if (-not (Test-Path -LiteralPath $f)) { Log "missing $f; aborting without changes"; exit 1 } }
$s0 = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
$phaseMap = @{ 'ENV_CHECK' = 'A'; 'A_IMPLEMENTING' = 'A'; 'C_VERIFYING' = 'C'; 'G_ROOT_GATE' = 'G'; 'B_PLANNING_NEXT' = 'B' }
$startPhase = 'A'
if ($Now) {
    if (-not $phaseMap.ContainsKey("$($s0.phase)")) { Log "status $($s0.phase): nothing running to switch; start the kit with $kit/start-loop.cmd -Config $config"; exit 0 }
    $s = $s0; $startPhase = $phaseMap["$($s0.phase)"]; $runnerGone = $false
    Log "switching NOW at round $($s.round) phase $($s.phase) -> kit phase $startPhase"
} else {
Log "waiting for the next B -> A boundary (now: round $($s0.round) $($s0.phase)). Keep this window open; it finishes by itself."
$bRound = if ($s0.phase -eq 'B_PLANNING_NEXT') { [int]$s0.round } else { -1 }
$runnerGone = $false
while ($true) {
    $s = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
    if ($s.phase -in @('NEEDS_ATTENTION','AWAITING_ROOT_VERIFICATION','ROUND_LIMIT_REACHED')) { $runnerGone = $true; break }
    if ($s.phase -eq 'B_PLANNING_NEXT') { $bRound = [int]$s.round }
    elseif ($bRound -ge 0 -and [int]$s.round -gt $bRound) { break }
    Start-Sleep -Seconds 10
}
}
if ($runnerGone) {
    Log "v2 loop stopped by itself ($($s.phase): $($s.detail)). Not starting the kit automatically; fix the cause, then run: $kit/start-loop.cmd with -Config $config"
    exit 0
}
$round = [int]$s.round
$loopPid = [int]((Get-Content -LiteralPath "$taskRoot/loop.pid" -Raw).Trim())
$all = @(Get-CimInstance Win32_Process)
$runner = $all | Where-Object ProcessId -eq $loopPid
if (-not $runner -or $runner.CommandLine -notmatch 'run-loop-v2') { Log "runner pid $loopPid not found or not v2; aborting without changes"; exit 1 }
foreach ($c in @($all | Where-Object { $_.ParentProcessId -eq $loopPid })) {
    if ($c.CommandLine -match 'claude|--agent') { Stop-Tree $c.ProcessId; Log "stopped agent process tree $($c.ProcessId)" }
}
Stop-Process -Id $loopPid -Force -ErrorAction SilentlyContinue
Log "stopped v2 runner $loopPid (test servers left running)"
foreach ($w in @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'watch-context-v2\.py' })) { Stop-Process -Id $w.ProcessId -Force -ErrorAction SilentlyContinue; Log "stopped v2 watchdog $($w.ProcessId)" }
Start-Sleep -Seconds 3
& powershell -NoProfile -ExecutionPolicy Bypass -File "$kit/start-loop.ps1" -Config $config -StartRound $round -StartPhase $startPhase
Log "kit loop started at round $round phase $startPhase"
Start-Sleep -Seconds 40
$s2 = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
Log "status now: $($s2.phase) round $($s2.round) runner $($s2.runner). Done; this window can be closed."
