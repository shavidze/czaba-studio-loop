# One-time switch from run-loop.ps1 (v1) to loop-v2/run-loop-v2.ps1 at the next C -> B boundary.
$ErrorActionPreference = 'Stop'
$taskRoot = 'C:/Apps/czaba-project/tmp/studio-real-loop'
$v2 = "$taskRoot/loop-v2"
function Log([string]$m) { $line = "$([DateTime]::UtcNow.ToString('o')) $m"; Add-Content -LiteralPath "$v2/switch.log" -Value $line -Encoding UTF8; Write-Host $line }
function Stop-Tree([int]$rootPid) {
    $all = Get-CimInstance Win32_Process
    $ids = @($rootPid)
    do { $added = @($all | Where-Object { $_.ParentProcessId -in $ids -and $_.ProcessId -notin $ids } | Select-Object -ExpandProperty ProcessId); $ids += $added } while ($added.Count -gt 0)
    foreach ($id in ($ids | Sort-Object -Descending)) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
}
Log 'switch started; waiting for the next C -> B boundary (status phase B_PLANNING_NEXT)'
while ($true) {
    $s = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
    if ($s.runner -eq 'v2') { Log 'loop already runs v2; nothing to do'; exit 0 }
    if ($s.phase -eq 'B_PLANNING_NEXT' -or $s.phase -in @('NEEDS_ATTENTION','ROUND_LIMIT_REACHED')) { break }
    Start-Sleep -Seconds 20
}
$round = [int]$s.round
$startPhase = if ($s.phase -eq 'B_PLANNING_NEXT') { 'G' } else { 'B' }
Log "boundary: round $round phase $($s.phase) -> v2 starts at phase $startPhase"
$loopPid = [int]((Get-Content -LiteralPath "$taskRoot/loop.pid" -Raw).Trim())
$proc = Get-CimInstance Win32_Process | Where-Object ProcessId -eq $loopPid
if ($proc -and $proc.CommandLine -match 'studio-real-loop') { Stop-Tree $loopPid; Log "stopped v1 loop tree $loopPid" } else { Log "v1 loop pid $loopPid not running (ok)" }
foreach ($w in @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'watch-context\.py' -and $_.CommandLine -notmatch 'watch-context-v2' })) { Stop-Process -Id $w.ProcessId -Force -ErrorAction SilentlyContinue; Log "stopped old watchdog $($w.ProcessId)" }
$pending = "$taskRoot/root-publish/pending"
if (Test-Path -LiteralPath $pending) {
    foreach ($f in @(Get-ChildItem -LiteralPath $pending -File)) { Move-Item -LiteralPath $f.FullName -Destination "$taskRoot/root-publish/done/" -Force; Log "superseded $($f.Name) (v2 gate publishes everything since HEAD)" }
}
$py = $null; foreach ($c in @('python','py','python3')) { $g = Get-Command $c -ErrorAction SilentlyContinue; if ($g) { $py = $g.Source; break } }
if ($py) {
    $w = Start-Process -FilePath $py -ArgumentList @("$v2/watch-context-v2.py") -WindowStyle Hidden -RedirectStandardOutput "$v2/watch-v2.out.log" -RedirectStandardError "$v2/watch-v2.err.log" -PassThru
    Set-Content -LiteralPath "$v2/watch-v2.pid" -Value $w.Id; Log "started watchdog v2 pid $($w.Id) ($py)"
} else { Log 'WARNING: python not found; context watchdog not started' }
$ps = (Get-Command powershell -ErrorAction SilentlyContinue).Source; if (-not $ps) { $ps = 'powershell' }
$p = Start-Process -FilePath $ps -ArgumentList @('-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',"$v2/run-loop-v2.ps1",'-RoundLimit','999','-StartRound',"$round",'-StartPhase',$startPhase) -WorkingDirectory 'C:/Apps/czaba-project/store' -WindowStyle Hidden -RedirectStandardOutput "$v2/loop-v2-r$round.out.log" -RedirectStandardError "$v2/loop-v2-r$round.err.log" -PassThru
Set-Content -LiteralPath "$taskRoot/loop.pid" -Value $p.Id
Log "started loop v2 pid $($p.Id): round $round phase $startPhase"
Start-Sleep -Seconds 20
$s2 = Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json
Log "status now: $($s2.phase) round $($s2.round) runner $($s2.runner)"
Log 'done. You can close this window.'
