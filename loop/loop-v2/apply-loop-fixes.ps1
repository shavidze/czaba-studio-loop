# One-time: move the running v2 loop onto the fixed run-loop-v2.ps1 at the next B -> A boundary.
# After this, the runner reloads itself whenever run-loop-v2.ps1 changes (no more clicks for fixes).
$ErrorActionPreference = 'Stop'
$taskRoot = 'C:/Apps/czaba-project/tmp/studio-real-loop'
$v2 = "$taskRoot/loop-v2"
function Log([string]$m) { $line = "$([DateTime]::UtcNow.ToString('o')) $m"; Add-Content -LiteralPath "$v2/apply-fixes.log" -Value $line -Encoding UTF8; Write-Host $line }
function Stop-Tree([int]$rootPid) {
    $all = @(Get-CimInstance Win32_Process)
    $ids = @($rootPid)
    do { $added = @($all | Where-Object { $_.ParentProcessId -in $ids -and $_.ProcessId -notin $ids } | Select-Object -ExpandProperty ProcessId); $ids += $added } while ($added.Count -gt 0)
    foreach ($id in ($ids | Sort-Object -Descending)) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
}
$s0 = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
Log "waiting for the next B -> A boundary (now: round $($s0.round) $($s0.phase)). Keep this window open; it finishes by itself."
$bRound = if ($s0.phase -eq 'B_PLANNING_NEXT') { [int]$s0.round } else { -1 }
while ($true) {
    $s = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
    if ($s.phase -in @('NEEDS_ATTENTION','AWAITING_ROOT_VERIFICATION','ROUND_LIMIT_REACHED')) { Log "loop stopped by itself ($($s.phase): $($s.detail)); the fixed runner will be used on the next start. Nothing else to do."; exit 0 }
    if ($s.phase -eq 'B_PLANNING_NEXT') { $bRound = [int]$s.round }
    elseif ($bRound -ge 0 -and [int]$s.round -gt $bRound) { break }
    Start-Sleep -Seconds 10
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
Log "stopped old runner $loopPid (test servers left running)"
$ps = (Get-Command powershell).Source
$p = Start-Process -FilePath $ps -ArgumentList @('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',"$v2/run-loop-v2.ps1",'-RoundLimit','999','-StartRound',"$round",'-StartPhase','A') -WorkingDirectory 'C:/Apps/czaba-project/store' -WindowStyle Hidden -RedirectStandardOutput "$v2/loop-v2-r$round.out.log" -RedirectStandardError "$v2/loop-v2-r$round.err.log" -PassThru
Set-Content -LiteralPath "$taskRoot/loop.pid" -Value $p.Id
Log "started fixed runner pid $($p.Id): round $round phase A"
Start-Sleep -Seconds 30
$s2 = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
Log "status now: $($s2.phase) round $($s2.round). Done; this window can be closed."
