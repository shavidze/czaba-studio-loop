# ROOT-REQ-PLAYWRIGHT-FIREFOX (B, round 412 -> 413 planning, 2026-11-08)

**What:** install Playwright's Firefox build on the cloud runner before C's phase, so the PERF-15 non-Chromium decode-length probe (TL-R411-L3) can run:
`cd store && npx playwright install firefox` (no `package.json` / lock change; `@playwright/test` is already a devDependency; only the browser binary under `~/.cache/ms-playwright`).

**Why:** `ls ~/.cache/ms-playwright` on this runner shows only `chromium-1200`, `chromium_headless_shell-1200`, `ffmpeg-1011`. TL-R411-L3 (Low): Firefox/Safari decode lengths of the demo MP3s may differ from Chromium by more than 1 bucket; the client then falls back to the worker (safe). The probe records which of three outcomes Firefox shows: `matched` (peaks kept, no worker job), `fell-back-cleanly` (worker job, waveform correct, no page error), `crashed`.

**Effect on the loop:** none blocking. PERF-15 closes on round 413's C PASS (D-29z1435). The Firefox row is a `record` row tracked as `TLM-PERF15-FIREFOX` until root installs Firefox; then B schedules one short check (it does not reopen PERF-15 unless the outcome is `crashed`).
