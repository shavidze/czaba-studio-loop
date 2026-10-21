$ErrorActionPreference = 'Stop'
$taskRoot = 'C:/Apps/czaba-project/tmp/studio-real-loop'
[pscustomobject]@{phase='B_INITIAL_PLANNING';round=0;detail='B finishing first task; C baseline completed. A will start after valid B result.';updatedUtc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath "$taskRoot/status.json" -Encoding utf8
$deadline = [DateTime]::UtcNow.AddMinutes(25)
while ([DateTime]::UtcNow -lt $deadline) {
    $ready = $false
    try {
        $initial = Get-Content -LiteralPath "$taskRoot/b-initial-result.json" -Raw | ConvertFrom-Json
        $ready = $null -ne $initial -and $initial.type -eq 'result'
    } catch { }
    if ($ready) {
        if ($initial.is_error) { throw 'B initial planning failed; no implementation started.' }
        if (-not (Test-Path -LiteralPath "$taskRoot/current-task.md")) { throw 'B did not create current task; no implementation started.' }
        & "$taskRoot/run-loop.ps1" -RoundLimit 64
        exit $LASTEXITCODE
    }
    Start-Sleep -Seconds 5
}
throw 'B planning result not ready within 25 minutes; no implementation started.'
