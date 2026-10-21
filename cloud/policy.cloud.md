
## Cloud runner (GitHub Actions, from 2026-10-21) — takes precedence over older environment notes

- **Paths.** The loop now runs on a Linux GitHub Actions runner. `C:/Apps/czaba-project` is `/home/runner/czaba-project`, with the same layout below it: `store/` (the repository), `tmp/studio-real-loop/` (this loop folder), `docs/` (plan, workflow and phase specs). A Windows path in an older file means the same file at the Linux path. Shell commands are bash, not PowerShell or cmd.
- **Browser.** gstack `/browse` is not installed. Use Playwright with the installed Chromium (`@playwright/test` is a store devDependency): small node scripts or specs under `tmp/studio-real-loop/c-round-N/`, with screenshots and measurements as evidence. The evidence rules are unchanged: an offline or simulated pass never stands in for a browser check.
- **Servers.** Only the store dev server runs, at `http://127.0.0.1:5173/studio-lab`. The .NET backend (`:5199`) and SQL Server are not available. `/studio-lab` does not need them. An acceptance row that truly needs the backend is BLOCKED with the reason "backend unavailable in cloud". It is never PASS and never a FAIL of A's work.
- **No `.env`.** Firebase, Shopify, R2 and Brevo are not configured. The console errors "Failed to load cart" / `ERR_CONNECTION_REFUSED` / `ERR_TUNNEL_CONNECTION_FAILED` are expected here and are not Studio bugs.
- **Fresh machine per job.** Each job starts on a new machine. Uncommitted store work from the previous job is restored before the round starts. Background processes and files outside `store/` and the loop folder do not survive. Never depend on them.
- **Time.** A job can be stopped at its time limit. The next job resumes the same phase, so write the round's report files as you go, not only at the end.
