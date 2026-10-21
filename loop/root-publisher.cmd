@echo off
title czaba-root-publisher
where pwsh >nul 2>nul && (pwsh -NoProfile -ExecutionPolicy Bypass -File "C:\Apps\czaba-project\tmp\studio-real-loop\root-publisher.ps1") || (powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Apps\czaba-project\tmp\studio-real-loop\root-publisher.ps1")
pause
