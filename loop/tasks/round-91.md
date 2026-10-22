# CURRENT TASK — Round 91: SRW-20 stage 3b-2 — honest WAV + MP3 note, honest MP3 timeout text, and one less float copy in the WAV worker (D-29z56)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-90.md` (exact copy, sha256 `a53a0ec5…`). Rationale: `b-round-90.md`. Decision record: D-29z56 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** the last SRW-20 stage (3b-2) = three tightly related export items, one owner (A):
  1. GATE86-S2 — the WAV + MP3 note promises delivery the browser does not guarantee (Low);
  2. R87-L-TIMEOUT-RELOAD-TEXT — the 120 s timeout text says "reload the page", but a retry works in the same page since round 87 (Low);
  3. GATE89-S2 — the WAV worker allocates one extra stereo float copy for the clamp (Medium, memory).
  Plus one doc status line (GATE90-S6) and one C-only measurement row for the gate-90 Medium GATE90-S1 (no A work).

## Why this round
- **C round 90: PASS**, `browserVerified=true`, `realVerified=true`, both viewports, 0 bugs. Cancel works in the render, wav, load and mp3 phases and for WAV + MP3; unmount aborts; Escape does not cancel (contract).
- **Gate 90: published.** Commit `35c84036577591b62b528a271337de565033bc28` is on both remotes. Root verify: 134 files, 2152 tests, `tsc` clean, build OK. Reviewer 8.5/10, no blocker.
- **R20-X4 is now complete** (responsiveness + progress + trap + cancel, all C-verified and published).
- **What is still open in SRW-20:** exactly the three 3b-2 items above. After this round SRW-20 can close.
- **Regression round:** due on or after 2026-10-24 (`regression-last.json` = 2026-10-21). Today is 2026-10-22, so not yet.

## Baseline (measured by B, 2026-10-22)
- **HEAD `35c84036577591b62b528a271337de565033bc28`** (gate 90 published). `git status --short` is **empty** (clean tree).
- **Frozen list:** `../tmp/studio-real-loop/b-round-90-r91-tree-sha256.txt`, **506** entries, **506/506 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the eight owned existing files below.
  - It includes the protected auth and route files, `Modal.tsx`, `ffmpeg.ts`, `StudioContext.tsx`, `mp3-encoder.client.ts`, `export-wav.client.ts`, `graph.client.ts`, `export-cancel.ts` and **`export-wav.test.ts`** (EW1–EW7 must stay byte-identical and green).
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-90-r91-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-90-r91-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/lib/arrangement/export-wav.ts` | `5fa36348` | 58 | owned (G1) |
  | `app/lib/arrangement/export-wav.worker.ts` | `cddff503` | 29 | owned (G2) |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `0c28ea0b` | 532 | owned (N1: `BOTH_FORMAT_NOTE` declaration only, l.32) |
  | `app/contexts/ArrangementContext.tsx` | `c487b71b` | 3380 | owned (T1: the timeout literal only, l.2856) |
  | `app/lib/arrangement/__tests__/export-mp3.test.tsx` | `86d5ddee` | 673 | owned (`BOTH_NOTE` l.53 and `LOAD_TIMEOUT_MESSAGE` l.63–64 declarations only) |
  | `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` | `0705cc16` | 539 | owned (`LOAD_TIMEOUT_MESSAGE` l.66–67 declaration only) |
  | `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | `490233a5` | 499 | owned (the one string literal at l.455 only) |
  | `docs/implementation/2026/quarter-IV/078-studio-lab-export-cancel.md` | `126569d7` | 131 | owned (status line l.4 only) |
  | `export-wav.test.ts` / `export-wav.client.ts` / `graph.client.ts` / `export-cancel-ui.test.tsx` | `e8d93132` / `b56ca58e` / `de385544` / see SHA256SUMS | — | frozen, reference (`ref_*` copies) |

- **Protected:** never touch the auth files, `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `Modal.tsx` (`741c2341`) or `mp3-encoder.client.ts` (`ddb70919`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-91/mut/`), never in `store/`. Set the Vite/Vitest `cacheDir` to the scratch folder (round-89/90 housekeeping note); never write into `store/node_modules/.vite`.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

### G1 — `export-wav.ts`: a new in-place encoder for owned channel copies (GATE89-S2)
- **Today's peak (B read the code):** `renderArrangementWav` keeps the rendered `AudioBuffer`, `.slice()`s both channels and transfers the copies to the worker. In the worker, `encodeArrangementWav` allocates a **second** clamped `Float32Array` per channel and then the 24-bit bytes. So at the worker peak: rendered buffer + transferred copy + clamped copy + bytes.
- **Add exactly one new export:**
  `export function encodeArrangementWavInPlace(channels: Float32Array[], sampleRate: number, onProgress?: (fraction: number) => void): ArrangementWavEncoding`
  1. `const report = measureExportOverload(channels);` — **first**, on the unclamped samples (the overload warning depends on it);
  2. clamp every sample **in the given arrays** with exactly the same expression as today: `Math.min(MAX_24BIT_SAMPLE, Math.max(-1, x))` (NaN stays NaN, the same as today);
  3. `const bytes = encodeSfxWav({ sampleRate, channels }, onProgress);` — the same arrays, no new `Float32Array`;
  4. `return { bytes, ...report };`
- **`encodeArrangementWav` stays byte-identical and non-mutating.** Frozen EW1 calls `measureExportOverload(raw)` **after** `encodeArrangementWav(raw)` and expects peak 1.5; an in-place `encodeArrangementWav` would turn it red. Do not change its body, signature or callers. A small private helper shared by both is allowed only if `encodeArrangementWav` keeps allocating its own copies and its output stays byte-identical (EW1/EW4/EW7).
- **Contract (doc 079 + a JSDoc-free name):** the in-place variant is only for arrays the caller owns and will not read again. Today that is only the worker, which receives transferred copies.

### G2 — `export-wav.worker.ts`: use the in-place encoder
- Replace the `encodeArrangementWav` call with `encodeArrangementWavInPlace(event.data.channels, event.data.sampleRate, …)`. Nothing else changes: the progress throttle, the `complete` message, the transfer list `[result.bytes]` and the error path stay identical (frozen EW7 pins them).
- **Not changed:** `export-wav.client.ts` (frozen; the no-Worker fallback keeps the non-mutating `encodeArrangementWav`) and `graph.client.ts` (frozen; the `.slice()` copy is needed because an `AudioBuffer` channel cannot be transferred).

### N1 — `ArrangementExportDialog.tsx`: the WAV + MP3 note (GATE86-S2)
Change only the `BOTH_FORMAT_NOTE` declaration (l.32) to exactly:
`იგივე მიქსი ორ ფაილად — ან ორივე შეიქმნება, ან არცერთი. ბრაუზერმა მეორე ფაილის ჩამოტვირთვაზე შეიძლება ნებართვა მოითხოვოს.`
- Rationale (smallest honest change): "both or none" is true for **creation** (C round 90 CX-BOTH: no file before the last phase), but the browser may ask permission for, or block, the second automatic download (gate-86 reviewer #2, Tech Lead R86-T). The note now says so without promising delivery.
- Same element, same classes (`block text-xs text-muted`); the label text `WAV + MP3 · ორი ფაილი` is unchanged.

### T1 — `ArrangementContext.tsx`: the 120 s timeout text (R87-L-TIMEOUT-RELOAD-TEXT)
Change only the timeout literal in `exportMp3` (l.2856) to exactly:
`MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.`
- Rationale: since round 87 the lab encoder resets on timeout and a retry works in the same page (C round 87 PX-RETRY, C round 90 CX-LOAD). "Reload the page" is no longer needed. "120 წამში" stays (C MP-TIMEOUT measured 120.394 s). The second sentence now matches the load-failure message.
- **Nothing else in the context changes** (no other message, timer, guard, reset or state order).

### Test grants (string locks; B grep-checked every literal)
- `export-mp3.test.tsx`: the `BOTH_NOTE` declaration (l.53) → the new N1 text; the `LOAD_TIMEOUT_MESSAGE` declaration (l.63–64) → the new T1 text. No other line.
- `export-progress-ui.test.tsx`: the `LOAD_TIMEOUT_MESSAGE` declaration (l.66–67) → the new T1 text. No other line.
- `export-range-ui.test.tsx`: the literal at l.455 → `'WAV + MP3 · ორი ფაილი' + <new N1 text>` written as one string (the label and note concatenated, as today). No other line.
- If Biome's formatter needs a declaration to wrap differently, that is allowed **inside the granted declaration only**.

### New test file `app/lib/arrangement/__tests__/export-wav-in-place.test.ts`
Copy the helpers you need (`wavOracle`, `seededChannel`, `testChannels`, `bytesOf`) from frozen `export-wav.test.ts`; never import from a test file. Compute every oracle on a **copy** (`raw.map((c) => c.slice())`) taken **before** the call under test.
- **IP1 in-place bytes and report:** for `testChannels()`, `encodeArrangementWavInPlace(raw, 48000)` returns `bytes` byte-equal to the oracle and `peak`/`clippedSamples` equal to `measureExportOverload(copy)` (peak 1.5, `clippedSamples > 0`).
- **IP2 the input is clamped in place:** after the call the **same** array objects (`toBe` identity on the array passed in) hold clamped values: `raw[0][0] === MAX_24BIT_SAMPLE` (was 1.5), `raw[0][1] === -1` (was -1.5), `Number.isNaN(raw[0][4])`, `raw[0][6] === -1` (was -1.0001), and every sample equals the oracle's clamped value.
- **IP3 progress:** non-decreasing, more than 2 values, last = 1.
- **IP4 the worker uses the in-place encoder:** EW7-style (spy on `window.postMessage`, `await import('../export-wav.worker')`, call `window.onmessage`): the `complete` message has `peak` 1.5 and bytes equal to the oracle, transfer = `[bytes]`, **and** the posted `raw` arrays are clamped afterwards (`raw[0][0] === MAX_24BIT_SAMPLE`). Reset `window.onmessage = null` at the end.
- **IP5 the shared path stays non-mutating:** after `encodeArrangementWav(raw, 48000)` every sample of `raw` equals the copy (`Object.is` per sample, so NaN counts), and the result equals IP1's result.

**Mutation proofs** (scratch copy; each must turn at least one listed test red):

| ID | Mutation | Expected red |
|---|---|---|
| a | the in-place variant clamps into a new `Float32Array` (copy re-added) | IP2, IP4 |
| b | measure **after** the clamp in the in-place variant | IP1, IP4 |
| c | the worker keeps calling `encodeArrangementWav` | IP4 |
| d | `encodeArrangementWav` delegates to the in-place variant without copying | IP5 (and frozen EW1) |
| e | the N1 constant reverted | `export-mp3` MX1 radio-label check (l.339) and `export-range-ui` l.452–457 |
| f | the T1 literal reverted | `export-mp3` l.485 and `export-progress-ui` l.309/320/341 |

### Docs
- `078-studio-lab-export-cancel.md` **l.4 only** → `**სტატუსი:** C PASS (Round 90), გამოქვეყნდა 35c8403 (D-29z55)` (GATE90-S6).
- New `docs/implementation/2026/quarter-IV/079-studio-lab-export-notes-and-memory.md` per `docs/implementation/TEMPLATE.md` (Georgian; every section). Status line: `**სტატუსი:** Round 91 — C-ის შემოწმებას ელოდება (D-29z56)`. It records: the two text changes and why; the peak-memory reasoning for G1 with B's baseline numbers (below); the in-place contract (owned arrays only); that `encodeArrangementWav` and the no-Worker fallback stay non-mutating; GATE90-S1 as an open measurement (C row MEM-CANCEL); SRW-20 boundary → checkpoint q14 next.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/lib/arrangement/export-wav.ts` | G1 only |
| `app/lib/arrangement/export-wav.worker.ts` | G2 only |
| `app/components/arrangement/ArrangementExportDialog.tsx` | N1 only |
| `app/contexts/ArrangementContext.tsx` | T1 only |
| `app/lib/arrangement/__tests__/export-mp3.test.tsx` | the two declarations above only |
| `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` | the one declaration above only |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | the l.455 literal only |
| `app/lib/arrangement/__tests__/export-wav-in-place.test.ts` | **new** (IP1–IP5) |
| `docs/implementation/2026/quarter-IV/078-studio-lab-export-cancel.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/079-studio-lab-export-notes-and-memory.md` | **new** |

**Expected end state: 8 M + 2 ??**, and all 506 frozen entries unchanged. `git diff` of the six line-granted files (dialog, context, the three test files, doc 078) must touch only the granted lines (C checks the hunks).
- If any frozen test turns red, **stop and report**; do not edit it. B expects every frozen export test to stay green: EW1–EW7 (the worker output is byte-identical; the client and fallback are unchanged), PU1–PU5, MX1–MX7 / MP-* (only the two constants change, and their declarations are granted), CU1–CU9, EC1–EC4, TR1–TR6, focus and footer tests.

## 2. Pre-flight for A
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md` (one new export), `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md` (a constant in a component file), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. **Prompts:** `new-test.md`.
- **Verify the baseline before the first edit:** HEAD `35c8403`; clean status; frozen 506/506; the eight owned hashes; LF/CR.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the owned code and test files (no `--write`).
  - **GATE90-S7:** save `npx biome lint <the 7 owned code/test files>` output to `a-round-91/biome-lint-owned.txt` (the gate log hides most warnings).
  - **Targeted vitest:** every file in `a-round-90/targeted-list.txt`, plus the new file, plus every test that imports `export-wav`, `export-wav.worker` or `export-wav.client` (grep). Write the list to `a-round-91/targeted-list.txt`. Do not run the full suite.
- **A's own smoke (not C evidence), 1440×900:** one 10M WAV export with B's probe (`../tmp/studio-real-loop/b-round-90/probe/mem-probe.cjs`; copy it into `a-round-91/`, change its `OUT`), recording before/after `VmHWM`; and the WAV + MP3 note text at 1280.
- **Code-reviewer: required** (10 files). Pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-91*`. **B** owns the planning artifacts. **Root** owns gates, commits and pushes.
- **Protected (never edited):**
  - `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`;
  - the auth files: `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`, `app/types/auth.ts`;
  - for this loop: `app/contexts/StudioContext.tsx`, `app/utils/ffmpeg.ts`, `app/components/ui/Modal.tsx`, `app/lib/arrangement/mp3-encoder.client.ts`.
- **`/studio-lab`** stays the public **demo-only** workspace: demo badge; no purchased audio; no token/R2 requests; the only third-party requests are the unpkg ffmpeg core after an MP3 click (plus the known Google Fonts and the failing root cart call); user video stays local.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| WAV + MP3 delivery note | none (browser download behaviour, CZABA copy) | — | **არ ეხება.** CZABA copy about browser downloads; no Ableton claim | NOTE-BOTH: match status "არ ეხება" |
| Encoder timeout text | none (CZABA's ffmpeg.wasm) | — | **არ ეხება** | TIMEOUT-TEXT: "არ ეხება" |
| Export peak memory | none | — | **არ ეხება** (internal pipeline; no Ableton claim) | MEM-WAV10, MEM-CANCEL: "არ ეხება" |
| Cancel leaves no partial file (carried) | Live 12 manual §5.1.3.5 (`b-round-84/web/managing-files.txt` l.281) | confirmed for real-time rendering only | carried from round 90; offline Cancel unconfirmed | CX-WAVPHASE-R: not re-judged |

## 5. C acceptance (real browser, Playwright Chromium, `/studio-lab` anonymous; viewport per row)

**Setup:** check `env-status.json` and that `:5173` returns 200; one warm-up load. Demo setup as in round 90 (`c-round-90/tools/lib90.cjs` `setup`): **5M** = 3 demo sources + music clip Ctrl+D ×2 (`05:04.406`); **10M** = Ctrl+D ×5 (`10:08.462`). HR-PHASE and the 15 s download window from round 90 apply to every cancel.

**Memory method (MEM rows; B pre-checked it in `b-round-90/probe/`):** the page's renderer is the `--type=renderer` Chromium process with the largest `VmRSS` (`/proc/<pid>/status`); dedicated workers run in it. One fresh `chromium.launch()` per run, so `VmHWM` starts fresh. Call CDP `HeapProfiler.collectGarbage` before every reading. Do not use `performance.memory` (OfflineAudioContext buffers are not in the V8 heap). Three valid runs per row, plus at most two extra runs for environment-invalid ones.

| ID | Viewport | Action | Pass evidence |
|---|---|---|---|
| MEM-WAV10 (primary, GATE89-S2) | 1440 | Fresh browser, 10M, WAV, read the renderer `VmHWM` after setup (GC + 2 s), Export to done, read `VmHWM` again | In each of 3 valid runs, the export increase **ΔHWM = after − before ≤ 639 MB**. B's baseline on the published tree `35c8403` (same probe, same runner type): ΔHWM **739 / 748 / 748 MB** (before 450/447/441, after 1189/1195/1189), so the limit is ≥ 100 MB below the smallest baseline; the expected drop is one 10M stereo float copy (29 206 176 × 2 × 4 B ≈ 234 MB). The file is one `.wav`, RIFF, PCM 24-bit/48 kHz/2 ch, **29 206 176 frames**, NaN 0, RMS within 1e-5 of B's 0.17243646, the exact done message `WAV შეიქმნა: 10:08.462, 24-bit · 48 kHz · stereo.`. A run is **environment-invalid** (not judged; replace it within the two extra runs) if its before-export `VmHWM` is outside 381–510 MB (B anchor 441–450 ± 60) or a non-noise console error occurs. If the limit is missed in a valid run, record all numbers: GATE89-S2 stays open (FAIL of this row), not a harness question |
| WAV5-REG | 1280 and 1440 | 5M WAV to done | One `.wav`, 14 611 488 frames, 24-bit/48k/2ch, exact WAV done message, **and the overload warning `გადატვირთვა: პიკი +1.7 dBFS — 498 sample…` (exact text as in round 90)** — proves the measure-before-clamp order in the worker |
| CX-WAVPHASE-R | 1280 | 5M WAV, Cancel in the **wav** phase | The round-90 plain cancelled message, 0 downloads in 15 s, the WAV worker closes at the cancel; the next WAV export succeeds |
| NOTE-BOTH | 1280 and 1440 | Open Export, idle | The `both` radio label text is exactly `WAV + MP3 · ორი ფაილი` + the N1 note; the note is HR-VISIBLE after scrolling it into view (inside the dialog scroller, `elementFromPoint` hits it), not clipped horizontally; the sticky footer still shows status/buttons (round-88 VIS-IDLE check, one sample). Then a 5M **WAV + MP3** export: both `.wav` and `.mp3` download, exact both-done message |
| TIMEOUT-TEXT | 1440 | Fresh page, 5M, MP3; `page.route(unpkg)` never responds; wait for the timeout | At 120 s (± 2 s) the exact `role="alert"` text `MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.`, 0 downloads, Close enabled. Then unroute and export MP3 again **in the same page, without a reload**: one `.mp3` decoding to 304.406 ± 0.1 s and the exact MP3 done message. This is what makes the new text honest |
| MEM-CANCEL (GATE90-S1 evidence; **never a FAIL of round 91**) | 1440 | **Cancel series** (fresh browser): 5M WAV, one completed export (warm-up), GC → R0; 3 render-phase cancels (HR-PHASE: `რენდერი · N%`); GC; idle 15 s; GC → R1. **Control series** (another fresh browser): the same, but 3 completed WAV exports instead of the cancels → R0c, R1c. Use `VmRSS` | Report retained = (R1 − R0) − (R1c − R0c) per pair; 3 valid pairs. **Decision rule (B):** retained ≥ 117 MB (one 5M render buffer, 304.406 × 48000 × 2 × 4 B) in ≥ 2 of 3 pairs → GATE90-S1 **confirmed** (B schedules the reviewer's "disconnect + resume" fix in a later round); retained < 58 MB in all pairs → **not reproduced at this resolution**; anything else → **inconclusive**, numbers kept. Cancel code is unchanged this round |
| PX-NET | all sessions | — | No unpkg request before the first MP3 click; then only `ffmpeg-core.js`/`.wasm`; workers same-origin; 0 studio-token / R2 / download requests; 0 `Authorization` headers |
| REG-HYD | all sessions | — | No hydration / `useLayoutEffect` warning, no non-noise console error |
| G91-3 | 1440 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace. `/api/studio-token?…` anonymous → 401. The header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T91-TARGETED | — | A's `a-round-91/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | — | Start = end | HEAD `35c8403`; 8 M + 2 ??; frozen 506/506; A's end hashes; the diff hunks of the six line-granted files (dialog, context, `export-mp3`, `export-progress-ui`, `export-range-ui`, doc 078) touch only the granted lines; `Modal.tsx` `741c2341`, `ffmpeg.ts` `0995ae78`, StudioContext `caa388e7`, `mp3-encoder.client.ts` `ddb70919` |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the production bundle (PROD-MP3-UNVERIFIED).
- **Not browser-reachable** (unit only; say so): the no-Worker fallback (unchanged), the worker's in-place identity (IP4; the browser proof is MEM-WAV10).
- **Neighbour behaviour that could break:** the overload warning (WAV5-REG), the worker terminate on cancel (CX-WAVPHASE-R), the MP3 path that reads the WAV blob (NOTE-BOTH both-export, TIMEOUT-TEXT retry), the dialog layout at 1280 with a longer note (NOTE-BOTH VIS sample).
- **Known and intended (not new bugs):** Escape does not cancel; the encoder reloads after a load/mp3 cancel; the headless `<progress>` colour (R87-T); `disabled:opacity-40` on Cancel (GATE90-S4, Lows); holding Enter on Cancel can then close the dialog (GATE90-S3, Lows — do not file it again).

## 6. After this round
- **If C PASS:** SRW-20 is complete (all of R20-X1..X4 and 3b-2 C-verified). B then writes the formal SRW-20 boundary request for the bounded frontend-architect checkpoint q14 to root (inputs already appended to `b-round-83-checkpoint-request.md`). It is non-blocking.
- **Round 92:** the regression round if planned on or after 2026-10-24; otherwise the MEM-CANCEL follow-up if GATE90-S1 is confirmed, else the Lows batch. Then SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN. Scope is not reduced.
- **Architecture:** the gate-90 reviewer's `useArrangementExport` proposal is merged into q14. Do not extract anything in this round.
