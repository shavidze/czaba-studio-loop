@echo off
rem Stops only stuck vitest test processes (not the dev servers, not claude). The loop then continues by itself.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -match 'vitest' }; if (-not $p) { 'No vitest processes found.' } else { $p | ForEach-Object { '{0}  {1}' -f $_.ProcessId, $_.CommandLine.Substring(0, [Math]::Min(140, $_.CommandLine.Length)); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; 'Stopped ' + @($p).Count + ' vitest process(es).' }"
pause
