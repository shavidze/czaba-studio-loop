# Tag Manager loop — project rules (in addition to the kit's policy.md)

## Environment: Linux GitHub Actions runner

- The loop runs on `ubuntu-24.04`, one round per job. `C:/Apps/czaba-project/czaba-tag-manager` in any older file means `/home/runner/czaba-project/czaba-tag-manager` here. Shell commands are bash.
- Each job starts on a fresh machine. Uncommitted Tag Manager work from the previous job is restored before the round starts. Background processes and files outside the repository and this loop folder do not survive. Write report files as you go.
- Installed: Node 22, the repository's npm dependencies, Playwright Chromium dependencies, `xvfb`, `ffmpeg`/`ffprobe`. No Windows, no macOS: `build:win`, `build:mac` and NSIS installer checks are BLOCKED with the reason "Windows packaging is not available in the cloud", never PASS and never a FAIL of A's work.
- Agents do not install or upgrade packages. A task that needs a new dependency is BLOCKED and names the package, its licence and why.

## Verification

- `verifyCommand` = `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` (the braces make the gate's log capture all three steps). The fixtures in `tests/fixtures/*.wav` are generated, never committed.
- **C uses the real app.** C launches the built Electron app with Playwright `_electron` under `xvfb-run`, drives the UI (folder scan, selection, editing, save), and takes screenshots as evidence. IPC-only checks support the UI check; they never replace it.
- **Metadata is checked by an independent reader.** After a save, C reads the file with `music-metadata` and with `ffprobe -show_entries format_tags -of json`, and compares field by field. A value that only Tag Manager itself can read back does not count as written.
- Bug fixes follow the repository's `test-on-bugfix` rule: a failing test first, then the fix.

## Known state at loop start (2026-10-26)

- `npm run check` passes on Linux (Vitest renderer 75/75, main 30/30) once the fixtures are generated.
- `tests/e2e/folder-workflow.spec.ts` "can read and write metadata via IPC" fails on Linux: `meta:write` → "WAV file is missing data chunk". The spec's `createMinimalWav()` writes a 44-byte file whose data chunk is empty. Whether the fixture or the writer is wrong is for B to establish; this is the first bug in the backlog because the gate's verify cannot pass until it is fixed.

## Coordination with other streams

- The backend import tool (`czaba-api/tools/recording-import`) will read Tag Manager's fields with `ffprobe`. Field names and the WAV chunk they land in are a contract between the two streams: B records every such decision with a D-ID and lists it in `feature-status.md`.
- Reports Saba reads are written in Georgian with English technical terms.

## Root note — check.yml run on c34ee5a (2026-10-26)

- Run `40323787413` (workflow `Check`, commit `c34ee5a`) was **cancelled by its 30-minute job timeout**. Steps 1–4 passed in 19 s. Step 5 "Install system packages" (`sudo apt-get update && sudo apt-get install -y ffmpeg xvfb`) ran from 12:36:29 to 13:06:24 and never finished. Lint, tests, build and E2E never ran. The `Release` workflow on the same commit passed.
- The same packages installed in about 2 minutes in this loop's own job on `ubuntu-24.04`, so the hang is in the apt step, not in the app. Root cannot read the step log (the log storage host is not reachable from root's environment).
- Fix belongs to **TM-T0-CI**, before TM-T1:
  - install with `--no-install-recommends` and `-o Dpkg::Use-Pty=0`;
  - skip man-db trigger processing (`echo 'set man-db/auto-update false' | sudo debconf-communicate` and remove `/var/lib/man-db/auto-update`);
  - give the step its own `timeout-minutes` (for example 8) and retry it once;
  - keep the job timeout as a backstop.
- Root can read the Actions status of `TCzaba/czaba-tag-manager` and will record the green run that closes TM-T0-CI. A, C and B cannot see Actions from the runner: C proves the workflow locally (same commands, same order) and lists the step timings it measured.
