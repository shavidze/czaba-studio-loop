# Root publisher (Claude as root). Run once; keep the window open.
# Waits for a gated bundle from Claude in root-publish\pending, then at the next C->B boundary:
# stops the loop, fast-forwards store HEAD to the gated commit (git reset --mixed keeps all working-tree edits),
# pushes origin master (both remotes), records it, and restarts the loop at the same round, phase B.
$ErrorActionPreference = 'Stop'
$taskRoot = 'C:/Apps/czaba-project/tmp/studio-real-loop'
$storeRoot = 'C:/Apps/czaba-project/store'
$pubRoot = "$taskRoot/root-publish"
$log = "$pubRoot/publisher.log"
function Log([string]$m) { $line = "$([DateTime]::UtcNow.ToString('o')) $m"; Add-Content -LiteralPath $log -Value $line; Write-Host $line }
function Status { Get-Content -LiteralPath "$taskRoot/status.json" -Raw | ConvertFrom-Json }
Log 'publisher started'
while ($true) {
    $pending = Get-ChildItem -LiteralPath "$pubRoot/pending" -Filter *.json -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -First 1
    if (-not $pending) { Start-Sleep -Seconds 30; continue }
    $m = Get-Content -LiteralPath $pending.FullName -Raw | ConvertFrom-Json
    $s = Status
    if ($s.phase -ne 'B_PLANNING_NEXT' -or [int]$s.round -lt [int]$m.minRound) { Start-Sleep -Seconds 20; continue }
    Log "boundary reached: round $($s.round) phase $($s.phase); publishing $($m.commit)"
    $loopPid = (Get-Content -LiteralPath "$taskRoot/loop.pid" -Raw).Trim()
    & taskkill /PID $loopPid /T /F | Out-Null
    Start-Sleep -Seconds 3
    Set-Location -LiteralPath $storeRoot
    $ok = $true
    $head = (git rev-parse HEAD).Trim()
    if ($head -ne $m.base) { Log "ABORT: HEAD $head != expected base $($m.base)"; $ok = $false }
    if ($ok) {
        git fetch "$pubRoot/pending/$($m.bundle)" master 2>&1 | ForEach-Object { Log "fetch: $_" }
        $fetched = (git rev-parse FETCH_HEAD).Trim()
        if ($fetched -ne $m.commit) { Log "ABORT: bundle commit $fetched != $($m.commit)"; $ok = $false }
    }
    if ($ok) {
        git reset --mixed $m.commit 2>&1 | Out-Null
        Log "HEAD now $((git rev-parse HEAD).Trim())"
        git push origin master 2>&1 | ForEach-Object { Log "push: $_" }
        foreach ($u in @('https://github.com/TCzaba/czaba-store.git','https://github.com/shavidze/czaba-store.git')) { Log "ls-remote $u : $((git ls-remote $u master) -join ' ')" }
        $note = [pscustomobject]@{ commit=$m.commit; base=$m.base; publishedUtc=[DateTime]::UtcNow.ToString('o'); rounds=$m.rounds; gate=$m.gate; resume="StartRound $($s.round) StartPhase B; HEAD is now $($m.commit) (root Claude publication of rounds $($m.rounds)); uncommitted working-tree edits since then are preserved; do not revert." }
        $note | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath "$taskRoot/root-claude-publication-latest.json" -Encoding utf8
        try {
            $pc = Get-Content -LiteralPath "$taskRoot/publication-checkpoint.json" -Raw | ConvertFrom-Json
            $pc | Add-Member -NotePropertyName ("claudeRootCheckpoint_" + $m.commit.Substring(0,7)) -NotePropertyValue $note -Force
            $pc | ConvertTo-Json -Depth 50 | Set-Content -LiteralPath "$taskRoot/publication-checkpoint.json" -Encoding utf8
        } catch { Log "publication-checkpoint update failed: $_" }
    }
    Move-Item -LiteralPath $pending.FullName -Destination "$pubRoot/done/" -Force
    Set-Location -LiteralPath $taskRoot
    $exe = if (Get-Command pwsh -ErrorAction SilentlyContinue) { 'pwsh' } else { 'powershell' }
    $p = Start-Process -FilePath $exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',"$taskRoot/run-loop.ps1",'-RoundLimit','64','-StartRound',"$($s.round)",'-StartPhase','B') -RedirectStandardOutput "$taskRoot/root-claude-r$($s.round)-resume.out.log" -RedirectStandardError "$taskRoot/root-claude-r$($s.round)-resume.err.log" -PassThru -WindowStyle Hidden
    Set-Content -LiteralPath "$taskRoot/loop.pid" -Value $p.Id
    Log "loop restarted pid $($p.Id) at round $($s.round) phase B (publish ok=$ok)"
}
