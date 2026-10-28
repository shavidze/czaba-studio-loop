# A round 221 — PERF-16b-ii: notices, TL9 and docs after root removed `@ffmpeg/*`

No STOP. The baseline conditions held, the notices diff matched §1.1 exactly, every covering test passed with no slow test, and no regression was found.

## Baseline (checked at start)
- HEAD `521eb27` "chore(deps): remove @ffmpeg/ffmpeg @ffmpeg/util (root, OSS plan approved by Saba)", parent `c4e6c9d`. `git show --stat`: only `package.json` (2 lines) and `package-lock.json` (32 lines deleted).
- Lock diff: the 2 root `dependencies` lines plus the 3 entries `node_modules/@ffmpeg/{ffmpeg,types,util}`. This matches B's scratch run.
- `root-deps-done.json` has the `521eb27` entry. The working tree was clean at the start.
- Frozen list: `sha256sum -c` rc 0. Grants' start sha: all 8 OK. `vite.config.ts` start sha OK.
- **VITE-EXCLUDE-STALE: no root grant.** `root-grant-r221-vite.json` does not exist, and root did not touch `vite.config.ts`. The file is byte-identical (sha OK at the end).
- **Note for C (DEPS-221):** `node_modules/@ffmpeg/` still exists as an **empty directory** (mtime 06:50, left by root's uninstall). `npm ls @ffmpeg/ffmpeg @ffmpeg/util` gives `(empty)`. A did not delete it (the rules forbid deletions). C/B should rule on whether an empty dir meets "No `node_modules/@ffmpeg` directory".

## Changed files (8 M + 1 ??; `git status` in `a-round-221/git-status.txt`)
1. `THIRD_PARTY_NOTICES.md`: regenerated with `vitest -u`. The diff is exactly `(563)` → `(560)` plus the 3 `@ffmpeg/*` rows removed.
2. `app/lib/__tests__/third-party-licenses.test.ts`:
   - test-local helpers `readObjectKeys`, `listFfmpegPackageJsonKeys`, `listFfmpegLockKeys` and `listFfmpegLockRootDependencies`;
   - `describe('TL9 …')` with TL9a, TL9b, TL9c and TL9d;
   - existing rows unchanged, and no export added to `third-party-licenses.ts`.
3. `docs/technical/studio.md`: Tech Stack, Core Components, Export System → Architecture, `### MP3 encoding (LAME via mediabunny)` (was "FFmpeg.wasm Integration"; the old code sample is replaced by the real signature only), `### 3. Why LAME via mediabunny?`, File Structure, Testing Checklist → Export, Dependencies (wavesurfer `^7.x`, mediabunny pair `1.62.1`), Last Updated 2026-10-28. The TOC lists only `##` headings, so no anchor broke.
4. `docs/technical/debug-studio.md`: §5 Export fails (the `loadFFmpeg` sample is replaced by the real signature plus a lazy-chunk/Network note) and the Testing Checklist.
5. `docs/design/components/audio-player.md`: ExportDialog table and Export Flow step 5.
6. `docs/learning/README.md`: one Tech Stack row (`mediabunny` + `@mediabunny/mp3-encoder` 1.62.1).
7. `docs/learning/architecture/02-audio-studio-system.md`: ტერმინოლოგია row, User Journey message (l.178), the Export Pipeline paragraph and Mermaid labels (subgraph `Process` label, `MIX`/`ENC` labels; ids and edges unchanged), Trade-offs row, Key Takeaways bullet.
8. Doc 172, l.4 only: `**სტატუსი:** Completed (C round 221 PASS)`.
9. New: `docs/implementation/2026/quarter-IV/173-perf-16b-ii-remove-ffmpeg-packages.md`.
   - 7 TEMPLATE headings in order, and l.4 is exactly `**სტატუსი:** Completed (C round 221 PASS)`.
   - It covers every §1.3 topic, including the kept-mentions table and the TODOs.

Language: the new prose is in Georgian with English technical terms, as §1.3 says, including inside `studio.md`, whose untouched text is English.

**Deviation from the task text (for B):** §1.3 gave the sample signature as `bitrate?: '128k' | '192k' | '320k'`. The real code (`app/utils/ffmpeg.ts` l.8) is `bitrate: string = '320k'` with a runtime check. The docs use the real signature and list the accepted values in prose. `ffmpeg.ts` is not touched.

## Tests actually run
- `CI=true npx vitest run app/lib/__tests__/third-party-licenses.test.ts`: **67/67** (63 before + 4 TL9).
- Covering run, `CI=true npx vitest run --reporter=verbose` on the 5 files: **5 files, 115/115 passed**, rc 0 (`a-round-221/covering.log`).
  - ME9 and LF1–LF5 are green.
  - Slowest test: 250 ms (MX1, export-mp3) against the 5 s default. Nothing is above 50 % of its timeout.
- `npm run typecheck`: rc 0. `npm run lint`: rc 0 (205 warnings, 1 info, pre-existing; `npx biome check` on the test file: clean).
- Mermaid: `mermaid.parse` (mermaid 11.17.2 tarball in `/tmp`, run with C's `c-round-220/mermaid-parse.cjs` in Chromium). 7/7 blocks parse: all 6 in `02-audio-studio-system.md` and doc 173's flowchart (`a-round-221/mermaid-parse.json`).
- Frozen `sha256sum -c`: rc 0 at the end.

### Red-proofs (§1.5)
Each mutant was a temporary edit, followed by a sha256 restore check (OK). Logs are in `a-round-221/redproof-*.log`.

| Mutant | Intended red | Collateral reds |
|---|---|---|
| (a) `realLock` path → `/tmp/c4e-lock.json` | TL9b, naming all 3 keys `node_modules/@ffmpeg/ffmpeg`, `/types`, `/util` (`redproof-a-keys.log`) | TL5, TL9c (TL9c renders from the same constant) |
| (b) `realPackageJson` path → `/tmp/c4e-package.json` | TL9a | TL6 |
| (c) notices = `c4e6c9d` version | TL5 | none (only TL5) |
| (d) `listFfmpegLockKeys` returns `[]` | TL9d | none |

### `grep -n -i ffmpeg` in the granted docs (all are §1.3 path mentions with the legacy note)
- `studio.md:45` (file tree `ffmpeg.ts`, "legacy სახელი");
- `studio.md:417` (`app/utils/ffmpeg.ts`, legacy);
- `studio.md:627` (file tree, legacy);
- `debug-studio.md:101` (`app/utils/ffmpeg.ts (legacy სახელი)`);
- `02-audio-studio-system.md:247` (`app/utils/ffmpeg.ts`, "legacy სახელია");
- `audio-player.md` and `learning/README.md`: 0.

There are 0 `loadFFmpeg`, `FFmpeg.wasm`, `@ffmpeg`, `3-5MB` or `31 MB` hits in the granted docs.

## Code review (code-reviewer subagent, run for real; score 8.5/10)
No Critical, High or Medium findings. It checked the docs against `ffmpeg.ts`, `StudioContext` l.1188–1190, ExportDialog and `package.json`, and confirmed every test id doc 173 cites. Lows, not fixed and reported for B:
- **A-R221-REVIEW-L1 (Low, older text):** granted sections keep wrong facts the code does not back. `learning/README.md:32` says React v19 (`package.json` has `^18.3.1`), and `:39` says Firebase v10 (`^12.6.0`). `studio.md:22` says "Remix (Shopify Hydrogen)", and Hydrogen is not a dependency. They are not ffmpeg claims, so A left them (no drive-bys). Suggest `deferred_low_polish`.
- L2: the "320 kbps CBR" claims rest on the browser frame-walk (doc 172 probe, R217), not on the encoder code (`new Quality({ bitrate })`). This is information only.
- L3: the status lines say "C round 221 PASS" by L28 design. They become true only after C's PASS.
- L4/L5: TL9a checks only deps/devDeps, as the spec says. `readObjectKeys` overlaps `listDependencyNames`.
- L6: `vite.config.ts` still has the stale `optimizeDeps.exclude`. This is VITE-EXCLUDE-STALE, already recorded.

**Architecture note (for B, not acted on):** `third-party-licenses.test.ts` l.56–155 keeps gaining near-duplicate `unknown`-JSON readers (`listDependencyNames`, `readLockVersion`, `countDevLockEntries`, `readObjectKeys`). Keep them for now: they are test-local and moved no ownership. A later bounded test-only round could merge them, with TL4–TL9 unchanged as the acceptance.

## For root/Saba (not A's)
- §1.4 stale ffmpeg instructions in `.claude/**`, `.codex/**`, `CLAUDE.md` and `AGENTS.md`. They are unchanged and listed in doc 173's TODO.
- `b-round-220-root-request-vite.md` is still open (VITE-EXCLUDE-STALE).
- TL5 stays red on master until this round publishes (expected).

## Hunk locations (new-file line numbers, for AN-REVIEW)
- `02-audio-studio-system.md`: 25, 178, 247, 258, 260, 262, 372, 398.
- `debug-studio.md`: 101–102, 105–108 (§5), 193 (Testing Checklist).
- `audio-player.md`: 178, 187.
- `learning/README.md`: 37.
- `studio.md` (git hunk starts): 26, 45, 326, 415, 417, 419–420, 423–426 (MP3 encoding section), 584, 586–590 (Why LAME), 624–625, 627, 742, 762–763, 770.
- Doc 173: `grep -c '^## '` = 7.

## Exact next C checks
SCOPE-221, DEPS-221 (note the empty `node_modules/@ffmpeg/` dir above), UNIT-221 (grep `TL9a|TL9b|TL9c|TL9d`), REDPROOF-221 (logs (a)–(d) here plus C's own `@ffmpeg/core` GPL probe), NOTICES-221, LEGACY-UI-STUBBED-221 (both viewports), LAB-MP3-221, STUDIO-SMOKE-221, DEV-START-221, BUNDLE-221, PERF-RUN-221, SOURCE-GREP-221, G221-3 and AN-REVIEW-221 (mermaid 7 blocks, hunks inside the granted sections). LEGACY-OWNERSHIP-221 stays BLOCKED (backend unavailable in cloud).

## Acceptance A passed itself
- §1.1 notices diff exact.
- §1.2 TL9a–d present and green.
- §1.3 doc sweep (the real-signature deviation is noted above).
- §1.5 red-proofs (a)–(d).
- typecheck and lint.
- 5 covering files plus the `CI=true` licence run.
- frozen rc 0.
- `git status` shape: 8 M + 1 ??.

No browser row was run by A; those are C's. The round is not complete until C passes it.
