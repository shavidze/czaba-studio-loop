@echo off
rem Root (Claude): starts the Studio test servers the loop expects. Close these windows to stop them.
start "czaba-backend-5199" cmd /k "cd /d C:\Apps\czaba-project\backend && dotnet run --project Czaba.Api --launch-profile http"
start "czaba-store-5173" cmd /k "cd /d C:\Apps\czaba-project\store && npx remix vite:dev --host 127.0.0.1 --port 5173"
