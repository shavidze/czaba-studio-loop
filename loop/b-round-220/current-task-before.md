# CURRENT TASK — Round 220: PERF-16b-i — the purchased-Studio MP3 export moves from ffmpeg.wasm (unpkg) onto the shared LAME encoder, plus the licence-classifier fix (C-R219-01)

Decisions:
- **D-29z227:** round 219 closed. C PASS (10 rows), `browserVerified` and `realVerified` true. Gate 219 published `c54a534`. **OSS-LIC is done.**
- **D-29z228:** C-R219-01 is ruled (§1.5) and fixed in this round. The other gate-219 review items are ruled in §1.5 as well.
- **D-29z229:** PERF-16b is split into two stages:
  - **16b-i (this round):** code. The legacy path delegates to the shared encoder, quality tiers are kept, and the run-time download note leaves the notices.
  - **16b-ii (next PERF round):** packages. A root remove request for `@ffmpeg/ffmpeg` and `@ffmpeg/util`, a one-line root grant for `vite.config.ts` l.27 (`optimizeDeps.exclude`), and a notices regeneration.
  - **No `root-deps-request.json` is filed at this planning.** Root's deps step runs before the round starts; a removal now would break the build at the baseline, because `app/utils/ffmpeg.ts` still imports `@ffmpeg/*` at `c54a534`.
- **D-29z230:** encoder cancel scope (ARCH-R218-ENCODER-CANCEL-SCOPE). The decision is a single consumer per page, written down and pinned by a test. There is no per-call signal (§1.3).
- **D-29z231:** the smaller rulings and records (§1.6).

Planned by B on 2026-10-28. Dispatcher: B. Implementer: A. Verifier: C. Consulted before dispatch:
- `tech-lead` (read-only);
- `performance-optimizer` (read-only);
- the advisor.

Summaries are in `b-round-219.md` §4.

**Read first:**
- `lessons.md`. L10, L11, L12, L23, L26, L28, L31, L32, L33 and L35 apply. L35 now names TL4 as well as TL5.
- `/home/runner/czaba-project/docs/technical/performance/oss-adoption.md`: the PERF-16 row and "Never copy code from".
- Project primitives:
  - `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `API_ERROR_HANDLING.md` (only the error-propagation part applies);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `.claude/prompts/new-test.md`, `.claude/prompts/studio-feature.md`.
- `tasks/round-218.md` §1 (the shared encoder contract) and `tasks/round-219.md` §1.3 (the classifier rules).

## Baseline
- **Expected HEAD:** `c54a534e997b9b5caf98e4294187b3e906c4a285` (gate 219, `feat(studio): verified loop rounds 219-219`). No deps commit is expected; B filed no `root-deps-request.json`.
- **Working tree at planning:** clean. `b-round-219/git-status-at-planning.txt` is empty.
- **Frozen:** every tracked file except the 8 grants. That is 1,062 files in `b-round-219-r220-tree-sha256.txt`, `package.json` and `package-lock.json` included.
  - From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-219-r220-tree-sha256.txt`. B checked it: rc 0.
- **Grants (8 existing files):** listed in `b-round-219-r220-grants.txt`. Their start hashes are in `b-round-219-r220-granted-start-sha256.txt`.
  1. `app/utils/ffmpeg.ts`: the whole file (§1.1).
  2. `app/lib/arrangement/mp3-encoder.client.ts`: the bitrate option only (§1.2).
  3. `app/lib/arrangement/__tests__/mp3-encoder.test.ts`: new rows ME10–ME12. Existing rows stay as they are.
  4. `app/lib/arrangement/__tests__/export-progress-ui.test.tsx`: **only** the `loadFFmpeg` removal. That covers the l.21 import, the l.54 mock factory, the l.60 `loadFFmpegMock` const, the l.255 reset and the l.540 expectation. PU5's other assertions stay as they are.
  5. `app/lib/third-party-licenses.ts`: §1.4 and §1.5.
  6. `app/lib/__tests__/third-party-licenses.test.ts`: §1.4 and §1.5.
  7. `THIRD_PARTY_NOTICES.md`: regenerated only, never edited by hand.
  8. `docs/technical/diagrams/studio-audio-pipeline.md`: the whole sections listed below (L34). Nothing else in that file changes.
     - the intro sentence (l.5);
     - `## 7. Export Pipeline`;
     - `## 10. Error Handling Paths`;
     - `## 12. სრული Data Flow`.
- **New files (2):** listed in `b-round-219-r220-new-files.txt`. B checked that both are free.
  - `app/utils/__tests__/ffmpeg.test.ts`. This is a new folder; vitest includes `app/**/*.test.{ts,tsx}`.
  - `docs/implementation/2026/quarter-IV/172-perf-16b-i-legacy-mp3-shared-encoder.md` (171 is the last).
- **Protected as always:**
  - the auth and purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - **`app/contexts/StudioContext.tsx` is frozen this round.** Its call `convertWavToMp3(wavBlob, bitrate)` (l.1188–1190) and its catch path (l.1199–1203) stay byte-identical;
  - `app/contexts/ArrangementContext.tsx` (frozen);
  - `.claude/**`, `CLAUDE.md`, `package*.json`, `vite.config.ts`, `vitest.config.ts`, `biome.json` and every other config file;
  - `perf/**` and `e2e/**`.
- **Not allowed:**
  - installing, updating or removing packages;
  - deleting or renaming any file. Deletion needs Saba's permission (CLAUDE.md), so `app/utils/ffmpeg.ts` keeps its path;
  - copying code from `@ffmpeg/core` or any project on the oss-adoption "Never copy" list.

## 0. Why this round
- **The outcome table was fixed in advance** in `tasks/round-219.md` §6: "PASS, and planning before 2026-10-30 → Round 220 = PERF-16b". C passed round 219, and B is planning on 2026-10-28. Regression is due on or after 2026-10-30, per `regression-last.json`.
- **C bug first.** C-R219-01 is the only C finding. It is fixed here because this round has to own the same two licence files anyway: the run-time download section lives in `third-party-licenses.ts`, and TL6's `@ffmpeg/core` row goes red once the unpkg URL is gone. The 2026-10-23 rule allows a Low to be fixed early when the round already owns the code and the fix is cheap.
- **The spec** (`oss-adoption.md`, PERF-16 row): MP3 export goes through mediabunny + `@mediabunny/mp3-encoder`, `@ffmpeg/*` and the unpkg URL are removed, and "the export dialog, progress, cancel and file names stay exactly as they are".
- **Facts B measured on `c54a534` (2026-10-28):**
  - `app/utils/ffmpeg.ts` imports `FFmpeg`, `fetchFile` and `toBlobURL` from `@ffmpeg/*`. At l.38 it downloads the core from `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm`. It exports `loadFFmpeg`, `convertWavToMp3(wavBlob, bitrate = '320k')` and `onFFmpegProgress`.
    - The only app importer is `StudioContext.tsx` l.25, and it imports `convertWavToMp3` only.
    - `loadFFmpeg` is referenced only by the mock in `export-progress-ui.test.tsx`.
    - `onFFmpegProgress` has no references.
  - **The purchased-Studio dialog has quality tiers.** `app/components/studio/ExportDialog.tsx` l.25 and l.197–211 offer Low, Medium and High. `StudioContext.tsx` l.1188–1189 maps them to `'128k'`, `'192k'` and `'320k'`, and renders at 48 kHz (l.1114).
  - The shared encoder is fixed at `ARRANGEMENT_MP3_BITRATE = 320_000` (`mp3-encoder.client.ts` l.17).
  - **B's real-Chromium probe** (`b-round-219/bitrate-probe.cjs` and `.log`) used mediabunny 1.62.1 + LAME, `Quality({ bitrate })`, on a 5 s 48 kHz stereo 16-bit WAV. Every audio frame came out MPEG-1 Layer III, 48 kHz, joint stereo: 128000 gave 210 frames at 128 kbps, 192000 gave 210 at 192 kbps, and 320000 gave 210 at 320 kbps. Each file had one 56 kbps Xing frame, and the frame walk ended at EOF. **So all three tiers are CBR at the exact rate.**
  - **ME9** (`mp3-encoder.test.ts` l.150–193, l.467–477) counts every textual `mp3-encoder.client` in a non-test `app/` file. Each one must be an `import('~/lib/arrangement/mp3-encoder.client')`, either at run time or as `typeof import(...)`. An `import type … from '…mp3-encoder.client'`, or a comment or JSDoc that names the module, is a violation (see class ruling R in §1.1).
  - **Providers:** `StudioProvider` mounts only in `routes/studio.$productId.tsx` (l.540), and `ArrangementProvider` mounts only in `routes/studio-lab.tsx` (l.26). They are never mounted together.
  - **L23 scratch check by B.** B made a scratch copy of `c54a534`, applied a draft of §1.1–§1.5, and ran the checks below:
    - Test files run: `mp3-encoder`, `export-progress-ui`, `export-mp3`, `strings`, `third-party-licenses` (plain and `CI=true`), and the 7 repo-scan files `timeline-cursor-map`, `studio-focus-ring`, `export-dialog-a11y-copy`, `panel-radius-ui`, `studio-theme-obsidian`, `store-focus-ring` and `store-theme-tokens`. Result: **228/228 pass** (`b-round-219/l23-scratch-run.txt`).
    - `tsc --noEmit`: rc 0.
    - `npm run build`: rc 0. 0 `unpkg.com` and 0 `@ffmpeg` hits in the build. No ffmpeg worker asset. The `routes/studio.$productId` manifest imports (21) contain no mp3, media or ffmpeg chunk (`b-round-219/scratch-build-facts.txt`).
    - The drafts are in `b-round-219/draft-*.ts.txt`. They are sketches, not a spec. A writes its own code.
    - **Not in the scratch run:** the `LicenseRef-* → unknown` rule (§1.5 R-219-2). The round-219 licence census of the lock (MIT 354, Apache-2.0 175, BSD-3-Clause 18, ISC 18, MPL-2.0 14, Unlicense 2, plus six single expressions) has no `LicenseRef-` id, so TL4 stays green. That rule is not a STOP trigger by itself.
    - B also checked that Vite serves `/app/utils/ffmpeg.ts` to the browser with the `~` alias resolved (`curl` on the dev server: `import { debug } from "/app/lib/debug.ts"`). So FACADE-REAL-220's `import('/app/utils/ffmpeg.ts')` works in the page.

## 1. Rulings. Required.
### 1.1 `app/utils/ffmpeg.ts` becomes a thin facade (StudioContext unchanged)
- It exports exactly one function: `convertWavToMp3(wavBlob: Blob, bitrate: string = '320k'): Promise<Blob>`. `loadFFmpeg` and `onFFmpegProgress` are removed. The file is not deleted or renamed.
- **The bitrate map is exact:** `'128k'` → 128000, `'192k'` → 192000, `'320k'` → 320000. Any other string rejects with `Error('Unsupported MP3 bitrate: <value>')` **before** the encoder module is imported. That covers `'256k'`, `''`, `'320'` and `'320K'`.
- **Delegation:** `await import('~/lib/arrangement/mp3-encoder.client')`, then `loadArrangementMp3Encoder()` on **every call**, so no encoder object is cached across a reset. Then `encoder.encode(wavBlob, undefined, { bitrate })`. The Blob is returned as it is (`audio/mpeg`).
- **Errors:** a load or encode failure propagates unchanged. It is not wrapped and not swallowed. `StudioContext`'s existing catch then sets `isExporting: false` and `exportProgress: 0`, and rethrows. That is today's behaviour for an ffmpeg failure.
- **Progress:** unchanged. StudioContext sets 85 before the call and 100 after it, with no intermediate MP3 progress, the same as with ffmpeg today. Intermediate progress is accepted debt (signal LEGACY-MP3-PROGRESS); it is not this round.
- **Class ruling R (ME9).** Every textual occurrence of `mp3-encoder.client` in `ffmpeg.ts` is an `import('~/lib/arrangement/mp3-encoder.client')`. There is no `import type … from` and no comment that names the module path. If a type is needed, use `typeof import('~/lib/arrangement/mp3-encoder.client')` (the ArrangementContext l.3411 form). If ME9 goes red, that is a STOP.
- **Naming.** The file name now says ffmpeg while the code does not use it. AGENT_DISCOVERABLE_CODE gets the minimum: one line `// TODO: rename to a legacy-mp3 facade once Saba allows file renames (PERF-16b)`. Project rules allow a TODO comment. The rename is a Saba question (`b-round-219.md` §8).

### 1.2 The shared encoder gets an optional bitrate
- `ArrangementMp3Encoder.encode(wav, onProgress?, options?: ArrangementMp3EncodeOptions)`, where `ArrangementMp3EncodeOptions` is `{ bitrate?: number }`.
- **Allowed values:** an exported `ARRANGEMENT_MP3_BITRATES: readonly number[] = [128_000, 192_000, 320_000]`. No `as const`: the project forbids assertions.
- **Default:** 320000, so every lab call site keeps its current behaviour. ArrangementContext is frozen and calls `encode(blob, onProgress)`.
- **Validation:** a value outside the list rejects with `Error('Unsupported MP3 bitrate: <n>')`. It does so before `new Input(...)` and before `Conversion.init`. No Input is created, so there is nothing to dispose.
- **Quality:** `new Quality({ bitrate })` receives the chosen value. Nothing else in the module changes:
  - generation and reset;
  - `isCancelled` progress gating;
  - the post-execute generation check;
  - the error texts.

### 1.3 Cancel scope (D-29z230)
- **Ruling: a single consumer per page.** `resetArrangementMp3Encoder()` stays module-wide. Each page has at most one encoder consumer, because the two providers mount on different routes.
- **Known race, documented and not fixed:** start a lab MP3 export, navigate client-side to `/studio/:id`, then start a legacy MP3 export before the lab's pending `import()` resolves. The lab's late `resetArrangementMp3Encoder()` (ArrangementContext l.3456–3460) can then reject the legacy encode with "MP3 encoder reset during …".
  - This fails safely: the StudioContext catch resets the state, no file is produced, and the user can export again.
  - Doc 172 states this. A per-call signal would mean editing the frozen ArrangementContext, and it is not justified by an observed defect.
- **ME12** pins the invariant (§1.7).

### 1.4 The notices lose the run-time download entry
- After §1.1, no app code downloads `@ffmpeg/core`. Remove `NOTICES_RUNTIME_DOWNLOADS_SECTION` and its place in the renderer.
- The `@ffmpeg/ffmpeg` and `@ffmpeg/util` table rows stay, because they are still in the lock until 16b-ii.
- TL6 "the run-time downloads section names @ffmpeg/core@0.12.6" becomes **TL6 "there is no run-time downloads section"**. That row checks `notices` does not contain `Run-time downloads`.
- **New TL8:** no non-test `.ts`/`.tsx` file under `app/` contains `unpkg.com` or a `from '@ffmpeg/` / `import('@ffmpeg/` reference.
  - It is a repo scan like ME9: `readdirSync`, with `__tests__` excluded.
  - Its red-proof is a named mutant: a scratch file holding the old l.38 URL is flagged (L23: a repo scan cannot be red on the start copy).

### 1.5 C-R219-01 and the gate-219 review (D-29z228)
- **Severity:** B keeps **Low**. A's code-reviewer and the gate reviewer both rated it Medium. B rules lower because no lock version reachable today has such a spelling: TL4 shows 0 failures, and the only GPL id, `node-forge`, passes by the OR rule. It is fixed now because the grants overlap (§0).
- **Fix:** `COPYLEFT_ID_PATTERN = /^A?GPL(?:V?\d|[-+]|$)/i`, applied per token, as today. The `^` anchor keeps LGPL clean.
- **TL1 rows, added:**

  | Expression | Classification |
  |---|---|
  | `GPLv3` | copyleft |
  | `GPLv2+` | copyleft |
  | `GPL2` | copyleft |
  | `AGPLv3` | copyleft |
  | `MIT AND GPLv2` | copyleft |
  | `(MIT OR GPLv3)` | clean (OR rule) |
  | `LGPLv3` | clean |
  | `LGPL-2.1-only` | clean |
  | `LicenseRef-Proprietary` | unknown (R-219-2 below) |

  The existing rows stay.
- **A's open questions, R-219-2 to R-219-4 (L10, each ruled):**
  - **R-219-2: changed.** An id beginning `LicenseRef-` (case-insensitive) is **unknown**, so it fails until someone looks at it. Other well-formed ids that are not GPL stay `clean`. Doc 172 states that `clean` means "no GPL/AGPL found", not "permissive". There is no SPDX id list, because the spec's scope is GPL/AGPL. A TL1 row `Proprietary` → clean pins that meaning.
  - **R-219-3: accepted.** Lowercase `and`, `or` and `with` stay accepted, because npm metadata casing varies. The TL1 row `mit or gpl-3.0` → clean stays.
  - **R-219-4: accepted.** An empty or whitespace licence string means no licence: it is unknown, and an exception can cover it.
- **Gate-219 review:**
  - **S1** is the same finding, and is closed with it.
  - **S2** (Low), folded: in TL5, `expect(existsSync(NOTICES_PATH)).toBe(true)` comes before the snapshot assertion, so a run without `CI=true` cannot silently recreate a deleted file. GitHub Actions sets `CI=true`, so the gate was already safe.
  - **S3** (Low), folded: the intro says "lists every runtime (non-dev) entry in `package-lock.json`, a superset of what the store ships", instead of "the third-party software that this store ships".
  - **S4** (Low), ruled: TL4's version anchors stay, on purpose. The drift rule now names TL4 and TL5 (L35 amended by B, and doc 172 says so).
  - **S5** (nit, the double exception lookup) goes to `deferred_low_polish`.
  - **S6** (legal) stays with SABA-Q-LAME-LGPL.

### 1.6 Smaller rulings and records (D-29z231)
- **`encoderLoadTimeout`** ("Check your internet connection", C-R218 info): **kept, not changed.** The encoder is a same-origin lazy chunk that still needs the network, so the sentence is still true. `strings.ts` is not granted.
- **INFO-C219-WARMUP-MP3** becomes harness rule HR-MP3-WARMUP: on a fresh machine, C's warm-up includes one MP3 export (round 219 attempt 1 was invalid because Vite re-optimized and reloaded).
- **INFO-C219-LAME-DECODER** is attached to SABA-Q-LAME-LGPL as a **hypothesis**, not a fact: the minified WASM has no decoder strings.
- **DOC169-GUARD-STALE** (performance-optimizer: doc 169 l.167–171 and l.178 still say 42 scripts and the old bytes) goes to `deferred_low_polish`. C's PERF-RUN-220 numbers become the new record.

### 1.7 Test rows (ids are required; C greps them)
**`app/utils/__tests__/ffmpeg.test.ts`** mocks `~/lib/arrangement/mp3-encoder.client` with `vi.mock` and a `vi.hoisted` fake, the way `export-progress-ui.test.tsx` l.24–52 does:
- **LF1:** `'128k'`, `'192k'`, `'320k'` and no argument call `encode(wav, undefined, { bitrate })` with 128000, 192000, 320000 and 320000. The same `wav` reference is passed.
- **LF2:** `'256k'`, `''`, `'320'` and `'320K'` each reject with `Unsupported MP3 bitrate: <value>`, and `loadArrangementMp3Encoder` is never called.
- **LF3:**
  - the encoder's Blob is returned unchanged (same reference);
  - a load rejection propagates unchanged (same error object);
  - an encode rejection propagates unchanged.
- **LF4:** two calls make two `loadArrangementMp3Encoder` calls, so no encoder is cached.
- **LF5:** a source read of `app/utils/ffmpeg.ts` shows:
  - no `@ffmpeg`, `unpkg` or `FFmpeg`;
  - the module's runtime exports (read through `await import`) are exactly `['convertWavToMp3']`.

**`mp3-encoder.test.ts`:**
- **ME10:** `encode(wav, undefined, { bitrate: 128000 })` and `{ bitrate: 192000 }` put that value into `Quality`. `encode(wav)` keeps 320000; the existing ME4 still pins this.
- **ME11:** `{ bitrate: 256000 }` and `{ bitrate: 0 }` reject with `Unsupported MP3 bitrate: <n>`, with 0 new `FakeInput` instances and `Conversion.init` not called.
- **ME12 (the single-consumer invariant):**
  - two encodes run at once, at two different bitrates;
  - one `resetArrangementMp3Encoder()` rejects **both** and cancels both conversions;
  - a fresh `loadArrangementMp3Encoder()` after the reset encodes successfully.

  The title says "a reset cancels every in-flight encode, whichever caller started it".

**`third-party-licenses.test.ts`:**
- TL1: the added rows from §1.5.
- TL5: the existence check.
- TL6: the changed row.
- TL8: the new row from §1.4.

All existing rows stay green.

### 1.8 Red-proof (named mutants, A runs them; each is a temporary edit, followed by a sha256 restore check)
| Mutant | Must go red |
|---|---|
| (a) facade maps `'192k'` → 320000 | LF1 |
| (b) facade accepts any string (no reject) | LF2 |
| (c) facade adds a static `import { loadArrangementMp3Encoder } from '~/lib/arrangement/mp3-encoder.client'` | ME9 |
| (d) the encoder ignores `options.bitrate` | ME10 |
| (e) the encoder validates after `new Input(...)` | ME11 (the Input count) |
| (f) the old pattern `/^A?GPL(-\|\+\|$)/i` is restored | TL1 `GPLv3` |
| (g) `LicenseRef-` → clean | TL1 `LicenseRef-Proprietary` |
| (h) a scratch file with `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm` | TL8 named mutant |

### 1.9 Drift rule (L35, amended)
- After any deps or lock change, TL4's anchors and TL5 can go red.
- 16b-ii (the `@ffmpeg/*` removal) and PERF-8 (zustand) grant `THIRD_PARTY_NOTICES.md` and the licence test.
- **16b-ii is filed only when both hold:**
  - (a) C has confirmed in this round that `grep -rn "@ffmpeg/\|unpkg" app --include=*.ts --include=*.tsx`, excluding `__tests__`, gives 0 hits;
  - (b) the next round is not a REGRESSION round.

## 2. A: the files you own. Everything else is frozen.
1. `app/utils/ffmpeg.ts`: §1.1.
2. `app/lib/arrangement/mp3-encoder.client.ts`: §1.2.
3. `app/utils/__tests__/ffmpeg.test.ts` (new): LF1–LF5.
4. `app/lib/arrangement/__tests__/mp3-encoder.test.ts`: ME10–ME12.
5. `app/lib/arrangement/__tests__/export-progress-ui.test.tsx`: the `loadFFmpeg` removal only (§Baseline grant 4).
6. `app/lib/third-party-licenses.ts` and `app/lib/__tests__/third-party-licenses.test.ts`: §1.4 and §1.5.
7. `THIRD_PARTY_NOTICES.md`: regenerate it with `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u`, then confirm a `CI=true` run passes without `-u`. The diff against HEAD must be only:
   - the removed run-time downloads section;
   - the intro paragraph (§1.5 S3; it may reflow over 2–3 lines).
8. `docs/technical/diagrams/studio-audio-pipeline.md`, the granted sections only, in Georgian:
   - The intro and §7 describe the MP3 step as the shared LAME encoder (mediabunny), loaded on demand from the same origin, with 128, 192 or 320 kbps from the dialog's Quality.
   - The Mermaid participant and the steps are updated: no `loadFFmpeg`, no ~31 MB CDN.
   - §10 E3/E4 are renamed for the encoder load and encode errors.
   - §12 has no unpkg CDN node.
   - The Mermaid blocks must still parse: one participant per name, no dangling arrows.
9. Doc 172, in Georgian with English terms:
   - It has the 7 TEMPLATE `##` headings in order.
   - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 220 PASS)` (L28: this is a stage of PERF-16b).
   - It covers:
     - the facade and its bitrate map;
     - the encoder option;
     - the single-consumer invariant and the known race;
     - the StudioContext freeze and its unchanged progress and error path;
     - the notices change;
     - C-R219-01 and the R-219-2..4 rulings;
     - the drift rule (TL4 + TL5);
     - TODOs: 16b-ii, the rename question for Saba, and intermediate progress.
   - Every test it cites exists (L26).

**Checks A runs (speed rules):**
- `npm run typecheck`;
- `npm run lint`;
- `npx vitest run` on these files, reporting per-test times; each must be under 50 % of its timeout (L31/L32):
  - `app/utils/__tests__/ffmpeg.test.ts`;
  - `app/lib/arrangement/__tests__/mp3-encoder.test.ts`;
  - `app/lib/arrangement/__tests__/export-progress-ui.test.tsx`;
  - `app/lib/arrangement/__tests__/export-mp3.test.tsx`;
  - `app/lib/arrangement/__tests__/strings.test.ts`;
  - `app/lib/__tests__/third-party-licenses.test.ts`;
  - the 7 repo-scan files listed in §0;
- the licence test again with `CI=true`;
- the mutants in §1.8;
- `sha256sum -c` of the frozen list, which must give rc 0;
- `git status --short --untracked-files=all`, which must show the 8 grants as `M` (at most) and the 2 new files as `??`.

A does not run the full suite, `npm run verify` or `npm run build`. With 10 files, A asks the `code-reviewer` and reports its Architecture note for B.

**STOP rules (L11, L32, L33):**
- HEAD is not `c54a534`, or the tree is not clean at the start.
- A frozen file has to change. StudioContext and ArrangementContext are included.
- ME9 or any repo-scan file goes red.
- The lock gives a real copyleft or unknown runtime entry under the new rules (other than `limiter`, which its exception covers). A writes `STOP — needs B ruling: <name@version licence>` and does not add an exception.

## 3. C: rows
**Setup.**
- Use Playwright Chromium, with the dev server at `http://127.0.0.1:5173`. Do not run the full vitest suite or `npm run verify`.
- **Warm-up (HR-MP3-WARMUP):** one `goto('/studio-lab')` plus one throwaway lab MP3 export, before any measured MP3 row.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-220** (start + end) | <ul><li>`git log -1`;</li><li>`git status --short --untracked-files=all`;</li><li>`sha256sum -c` of the 1,062-file list.</li></ul> | <ul><li>HEAD is `c54a534`.</li><li>Only the 8 grants are `M` and the 2 new files `??`.</li><li>Frozen rc 0, so StudioContext and ArrangementContext are byte-identical.</li></ul> |
| **UNIT-220** | The A file list from §2, plus the licence test with `CI=true`. Grep LF1–LF5, ME10–ME12, TL8 and the TL1 rows from §1.5. | <ul><li>All pass.</li><li>The ids exist.</li><li>TL5 has the `existsSync` check before the awaited snapshot.</li></ul> |
| **REDPROOF-220** | <ul><li>Read A's mutant logs (a)–(h).</li><li>**C's own probes**, as in round 219 (a vite transform plugin or `/tmp` copies; never edit the repo lock):<ul><li>(1) re-run `c-round-219/probe/spellings.probe.test.ts` against the new module;</li><li>(2) plant `zz-gplv3-probe@1.0.0` with `license: "GPLv3"` into a lock copy;</li><li>(3) the same entry with `license: "LicenseRef-Foo"`.</li></ul></li></ul> | <ul><li>(a)–(h) each fail the named row.</li><li>(1) `GPLv3`, `GPLv2`, `GPL2`, `AGPLv3` and `MIT AND GPLv2` are copyleft. `(MIT OR GPLv3)`, `Proprietary`, `SSPL-1.0` and `BUSL-1.1` are clean. `LicenseRef-Proprietary` is unknown.</li><li>(2) TL4 fails as copyleft, naming the probe.</li><li>(3) TL4 fails as unknown.</li><li>The repo lock sha256 is unchanged.</li></ul> |
| **NOTICES-220** | <ul><li>`git diff c54a534 -- THIRD_PARTY_NOTICES.md`;</li><li>re-run C's `c-round-219/notices-indep.cjs`.</li></ul> | <ul><li>The diff is only the removed run-time downloads section and the intro paragraph (§1.5 S3; it may reflow over 2–3 lines).</li><li>Still 563 rows, and the table is byte-identical.</li><li>No `unpkg` or `@ffmpeg/core` remains in the file.</li><li>The `@ffmpeg/ffmpeg` and `@ffmpeg/util` rows are present.</li></ul> |
| **FACADE-REAL-220** (browser; 1440 and 1280, fresh context each) | On `/studio-lab`, in `page.evaluate`: <ul><li>`const m = await import('/app/utils/ffmpeg.ts')`;</li><li>build a 5 s, 48 kHz, stereo, 16-bit sine WAV in the page (as `b-round-219/bitrate-probe.cjs` does);</li><li>**first** call `m.convertWavToMp3(wav, '256k')`;</li><li>then call it with `'128k'`, `'192k'`, `'320k'` and no argument.</li></ul> Frame-walk each result with C's round-218 parser, and decode it in the page. | <ul><li>`'256k'` rejects with `Unsupported MP3 bitrate: 256k`, and no `mp3-encoder.client` chunk was requested before the first valid call.</li><li>Each valid file: every audio frame (Xing frame excluded) is MPEG-1 Layer III, 48 kHz, stereo or joint stereo, at exactly 128, 192, 320 and 320 kbps.</li><li>Frame duration is in [5.0, 5.1] s.</li><li>Decoded: 2 ch, RMS above −40 dBFS.</li><li>0 page errors.</li><li>Between the first `convertWavToMp3` call and the last result: 0 requests to `unpkg.com` or to any other origin. Page-load requests (the cart `:5199` fetch, fonts) are not counted, per the cloud rule.</li></ul> |
| **LAB-MP3-220** (browser, 1440, dev) | The round-219 MP3-SMOKE through the UI (Add, Export, MP3, Export MP3), after the warm-up. | <ul><li>`czaba-studio-lab.mp3`;</li><li>every audio frame is 320 kbps, 48 kHz, stereo or joint stereo;</li><li>the duration is in [101.352, 101.452] s;</li><li>RMS within 0.1 dB of round 219 (−15.29 dBFS);</li><li>0 page errors.</li></ul> So the lab default stayed 320k. |
| **STUDIO-SMOKE-220** (browser, 1280, dev) | The round-219 WAV smoke. | <ul><li>PCM, 2 ch, 48 kHz, 24-bit.</li><li>The length matches "WAV created" within 1 frame.</li><li>Not all zeros.</li><li>0 page errors.</li></ul> |
| **BUNDLE-220** | Run your own `npm run build`, then remove `build/`. | <ul><li>`build/client` and `build/server`: 0 `unpkg.com`, 0 `@ffmpeg`, 0 `ffmpeg-core`, and no ffmpeg worker asset.</li><li>The `mp3-encoder.client-*.js` client chunk contains `AGFzbQ` once.</li><li>The manifest's `routes/studio.$productId` `imports` contain no mp3-encoder or mediabunny chunk.</li><li>Loading `/studio/middle-east` (dev or the prod build) gives no `modulepreload` link and no request for that chunk.</li></ul> |
| **PERF-RUN-220** | Run `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` once, alone, with sentinels as in round 218. Compare with `c-round-218/perf-run-1.json`. | <ul><li>rc 0, `complete`, `failures []`.</li><li>studio-lab and home `scripts` and `third-party-scripts` are unchanged (43/0, 41/0). Their encoded and decoded bytes are within 4,096 B.</li><li>The guard (`/studio/middle-east`) `scripts` is ≤ 41 and `third-party-scripts` is 0. Its bytes are **recorded**, not judged: the ffmpeg class chunk leaves the guard's chunks, so a decrease is expected.</li><li>Any increase in guard scripts or bytes is a FAIL (an eager load).</li></ul> |
| **SOURCE-GREP-220** | Run `grep -rn "@ffmpeg/\|unpkg" app --include=*.ts --include=*.tsx`, excluding `__tests__`. | 0 hits. This is the precondition for 16b-ii (§1.9). |
| **LEGACY-UI-220** (browser) | Purchased `/studio/:productId`, MP3 export at Low, Medium and High through the UI. | **BLOCKED:** "backend unavailable in cloud". List it under `blocked`, not in `passed`. It does not make `browserVerified` false. FACADE-REAL-220 exercises the same function in real Chromium. |
| **G220-3** (browser) | Fresh contexts at 1440×900 and 1280×720: <ul><li>`/studio-lab` anonymous;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token?product=middle-east&file=stem1.wav`, with no header and with a fake Bearer.</li></ul> | <ul><li>`/studio-lab` opens anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> |
| **AN-REVIEW-220** | Read doc 172 and the four granted sections of `studio-audio-pipeline.md`. | <ul><li>Doc 172: the 7 headings in order, l.4 byte-exact, every cited row exists, and the §2 item 9 topics are present.</li><li>Pipeline doc: no `loadFFmpeg`, `~31MB` or unpkg in the granted sections.</li><li>Its changed Mermaid blocks parse. C checks each one with `mermaid.parse` in a page and records the result.</li><li>Outside the granted sections the file is byte-identical (`git diff` hunks lie only inside them).</li></ul> |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke at the gate. | Not claimed by C. |

**`browserVerified`:** FACADE-REAL-220, LAB-MP3-220, STUDIO-SMOKE-220, BUNDLE-220's page check, PERF-RUN-220 and G220-3 are browser rows that can run here. If any one of them does not run, the flag is false. LEGACY-UI-220 is backend-blocked and does not count.

## 4. Reference: how Ableton Live 12 does it
**Not applicable.** This is a performance and refactor round: the encoder engine changes behind an unchanged UI (agent-workflow "Reference first" excludes pure performance and refactor rounds). Ableton conformance for C is "not applicable" on every row.

**Deviations from today's CZABA behaviour:** none intended.
- The legacy dialog's Low, Medium and High still give 128, 192 and 320 kbps, and the file name, progress and error path are unchanged.
- The only observable differences:
  - no ~31 MB third-party download;
  - the LAME build is mediabunny's 3.100 rather than FFmpeg's libmp3lame (the same encoder family).

## 5. Adjacent behaviour that could break
- **The lab MP3 export.** The encoder's default must stay 320k. LAB-MP3-220 and the existing ME4/ME9 cover it.
- **The import boundary.** A static reference from the facade would pull mediabunny into `/studio/:id`'s eager set. ME9, BUNDLE-220 and PERF-RUN-220 cover this.
- **Server render.** `StudioContext` is also evaluated on the server. The `.client` module is an empty stub there (0.22 kB in B's build), and the facade only imports it when an export runs, which happens only in the browser. Nothing runs at module load.
- **The export-progress UI test.** PU5 keeps asserting that ArrangementContext never mentions `utils/ffmpeg` or `@ffmpeg/`.
- **Notices.** TL5 is now strict about the file existing (§1.5 S2).

## 6. Outcome, fixed in advance
| C result | B at round-221 planning |
|---|---|
| PASS, SOURCE-GREP-220 0 hits, and planning before 2026-10-30 | Round 221 = **PERF-16b-ii**. B files `root-deps-request.json` `{"add": [], "remove": ["@ffmpeg/ffmpeg", "@ffmpeg/util"]}` at that planning. The round grants: <ul><li>`THIRD_PARTY_NOTICES.md` and the licence test (L35);</li><li>a root one-line grant for `vite.config.ts` l.27;</li><li>the remaining ffmpeg doc mentions (`docs/technical/studio.md` and `debug-studio.md`; B greps first).</li></ul> The guard baseline becomes C's PERF-RUN-220 numbers. |
| PASS, and planning on or after 2026-10-30 | Round 221 = **REGRESSION**. Every done/c_pass item is checked at both viewports, plus `npm run test:e2e:smoke`; this round's FACADE-REAL and the round-219 OSS-LIC test are added to the regression's `scope_additions`. 16b-ii follows. No deps request is filed during a regression planning. |
| A STOP | B rules first. No re-dispatch until it is ruled (L10). |
| A row fails (unit, red-proof, notices, facade, bundle) | A bounded fix-up inside the same 10 files. |
| PERF-RUN-220 or BUNDLE-220 shows an eager load | Fix-up: the facade's import boundary. |
| A smoke or G220-3 finds Medium+ | A bounded fix-up first. A Low goes to `deferred_low_polish`. |

## 7. Publication
- After C PASS, root gates this tree: the 8 grants plus 2 new files on `c54a534`.
- Suggested commit message: `perf(studio): legacy MP3 export uses the shared LAME encoder (no unpkg ffmpeg core) + GPL spelling fix`.
- **Root reviewer, please cover:**
  - the facade's error propagation and bitrate map;
  - encode-time validation before `Input`;
  - the single-consumer invariant (ME12) and the documented race;
  - the ME9 boundary;
  - the classifier change and the `LicenseRef-` ruling;
  - TL8.
- Still pending with root, non-blocking: the frontend-architect checkpoint (D-29z195) and `b-round-215-root-request-l28.md`.
- **At the 16b-ii boundary**, B will request a bounded export-pipeline checkpoint covering the WAV worker, the shared encoder and the legacy StudioContext export (`b-round-218.md` §6).
