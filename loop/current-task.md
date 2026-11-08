# Round 413: PERF-15b-ii-a — purchased-stem peaks URL (same origin), the collection's fetch carries the peaks request, and a streamed 4 MiB cap (stage 3 of 3 of PERF-15; closes PERF-15 on the client)

**Planned by:** B, at the round 412 → 413 planning, 2026-11-08 (`b-round-412.md`). The advisor was used after orientation. The round-412 task is archived as `tasks/round-412.md`.

## Read first
- `lessons.md` in full. The most relevant here are L4, L10, L11, L23, L26, L28, L29, L31, L52, L56, L57, L58 and L59.
- This file. For the stage contract it builds on, see `tasks/round-411.md` §1 (the D-29z1427 contract, the Reference table and the Side effects table). Nothing there is changed except what §1 below rules.
- Primitives: `API_ERROR_HANDLING.md`, `SECURITY_AUDIT.md`, `TESTING_QUALITY_GATES.md`, `AUDIO_ARCHITECTURE.md`, `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** run `bash b-round-412/claims-413.sh` (`ROOT=` and `LOOP=` can be overridden).
  - **Planning output** on the real store: `b-round-412/claims-413-planning-output.txt`, with empty stderr.
  - **Sketch output** on a fresh copy of HEAD with the sketch applied: `b-round-412/claims-413-sketch-output.txt`, with empty stderr.
  - **Expected differences** between the two: `b-round-412/claims-413-planning-vs-sketch.diff`. In the sketch output, K1 differs because the scratch has its own base commit; K2 (9 M) and K5 (`no`) differ because the sketch is applied there uncommitted.

## Baseline: HEAD `107eb2d`, clean tree
- **Gate 412** published `107eb2d` [K16]. HEAD is `107eb2d…` [K1]. The tree is clean: K2 `total 0`.
- **Frozen:** `b-round-412/r413-frozen-sha256.txt` lists **1,301** entries: every tracked file except the 11 tracked grants. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. The protected purchased route still does not mount this adapter [K22] (SRW-21 is `deferred_user`). This stage is therefore unit-proved for the purchased path and browser-proved for the demo path.
- **Pending root work:** none at planning. If K1 at A1 is not `107eb2d`, A re-runs the claims. A STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 412 passed.** C round 412 PASS with `browserVerified` true and 0 bugs [K21], and gate 412 published. **PERF-15b-i is done,** so A-R411-REVIEW-M1, A-R411-REVIEW-L1, A-R411-REVIEW-L3 and TL-R412-L-F are closed.
- **Next in the recorded order (D-29z1426):** PERF-15b-ii, which closes PERF-15. It is split:
  - **ii-a:** this round, all the code.
  - **ii-b:** the Firefox decode-length probe (TL-R411-L3). It cannot run here because Playwright Firefox is not installed [K19 = 0]. B filed `b-round-412/root-request-playwright-firefox.md` (ROOT-REQ-PLAYWRIGHT-FIREFOX).
- **Ruling D-29z1435: PERF-15 closes on this round's C PASS.** The Firefox probe becomes the `record` item TLM-PERF15-FIREFOX. It is Low, and a fallback to decode in Firefox is safe and already proved by the 404 and 8-bit rows. It does not reopen PERF-15 unless its outcome is `crashed`.
- **Open Criticals and Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **Schedule:** REGRESSION-2026-11-10 is not due yet [K17]. RETRO comes at round 416.

## 1. Rulings (B)

### D-29z1434: the change (sketch v4, `b-round-412/sketch-413.patch.txt`, sha256 `a7913dec…` [K12])
**What A applies byte-for-byte.** The facts below about HEAD are [K7]–[K7d]; the sketch's lines are in `claims-413-sketch-output.txt`.

1. **`app/lib/arrangement/precomputed-peaks.ts`** (TL-R411-L4 = GATE410-L2, TL-R413-L1)
   - **Today [K7]:** the declared `content-length` check is the only size guard, and the body is read with `response.json()`. A missing header reads as 0 and passes, and a gzip header shows the compressed size, so the read is unbounded.
   - **New `readCappedText`:**
     - reads the body through `body.getReader()` and counts decoded bytes;
     - above `PRECOMPUTED_PEAKS_MAX_BYTES` (4 MiB, strict `>`) it cancels the reader and returns null;
     - an already aborted signal cancels the reader and returns null;
     - an abort listener (`{ once: true }`, removed in `finally`) cancels a pending read, so a stalled body settles even when an injected fetch ignores `init.signal`.
   - **The caller still checks** `text === null || signal.aborted` before `JSON.parse`.
   - **Kept unchanged:** the declared-length refusal, the `credentials: 'omit'` request, the never-throw contract, and the parser.
2. **`app/types/arrangement.ts`:** `WorkspaceCollection.fetchPeaks?: (url, init) => Promise<Response>`. This is an inline function type, so there is no lib import into types (TL-R413-I4).
3. **`app/contexts/ArrangementContext.tsx`:** the single `fetchPrecomputedPeaks` call [K7b: 1 call site] passes `collection.fetchPeaks` as its third argument. Biome re-wraps the `.then(` callback; the patch already holds that formatting.
   - **This file is granted for that one hunk only.** Any other hunk in it is a STOP (L11).
   - With `fetchPeaks` undefined, the demo collection keeps `plainSourceFetch`.
4. **`app/types/audio.ts`:** `AudioStem.peaksUrl?: string`. It is additive. Every importer [K9] compiles, as tsc on the sketch shows.
5. **`app/lib/arrangement/collection.ts`**, in `createPurchasedWorkspaceCollection` (TL-R411 15b-ii scope, A-R411-REVIEW-L5, TL-R413-L2):
   - **`peaksUrl`** is a snapshot taken at creation, keyed by stem id.
   - **Same origin only.** A stem's `peaksUrl` is kept only when its origin equals the origin of that stem's `audioUrl`. Both URLs are resolved against `https://base.invalid`. An empty or unparsable URL is dropped.
   - **`fetchPeaks: fetchAudio`:** the peaks request goes through the same injected fetch as the audio, so a bearer header that fetch adds is kept, and `credentials: 'omit'` stays.
   - **No cache is keyed by the expiring URL.** Peaks are held in memory by source id [K8: 0 storage hits].
6. **Tests.** Every row is listed with its mutant in §6.
   - **PP7d is rewritten.** It used to override `response.json()`, which the new code never calls [K10b: `json-override 1` → 0]. Now the abort lands mid-stream, and the row also asserts that the body is cancelled. This replacement is equal or stronger; no assertion is lost (L4).
   - **New rows:** PP7e, PP10, PP11, PP12, PP12b, PPC12, PK1–PK4 and PS18. PS18 checks that the meta's `file` field equals the served path (TL-R411-L9).

### Rulings on the open Lows
| Id | Ruling |
|---|---|
| TL-R411-L4 / GATE410-L2 | Fixed here (PP10, PP11, PP12) |
| TL-R411-L9 | Fixed here (PS18) |
| A-R411-REVIEW-L5 | Fixed here: PK2 proves that a bearer header added by the injected fetch reaches the peaks request |
| TL-R411-L3 | → TLM-PERF15-FIREFOX + ROOT-REQ-PLAYWRIGHT-FIREFOX (D-29z1435) |
| A-R411-REVIEW-L2 (sha256 in the meta) | → `deferred_low_polish`. Byte identity is already proved by regeneration (C round 412 row 6c), and a hash would pin bytes to one runner |
| TL-R413-L-a (fail-closed origin rule) | Product contract. Written into `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md` ("peaksUrl must share the audioUrl origin"); doc 265 states it |
| TL-R413-L-b (1 s race timers in PP12/PP12b) | → `deferred_low_polish` |
| TL-R413-L-c | Doc 265 gets one sentence: a dropped peaks URL means the decode-based waveform |
| A's round-412 proposal (Biome does not cover `scripts/`) | → `root_requests_b` (config is outside the loop grants) |

### Reference and product design
- **Reference-first: N/A.** This is a performance, robustness and security round with no user-visible change.
- **No screen change:** no file under `app/components` or `app/routes` changes [K5, K23] (row 8).
- The stage's user-visible part, the dimmed loading waveform, was designed and verified in round 411/412 against Live 12 manual 5.1.2 (`tasks/round-411.md` §1).
- `product-designer`: N/A, because nothing on screen changes.

### Docs (L28, final stage)
- **Doc 263** (`docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md`): only l.4 changes, to exactly `**სტატუსი:** Completed (C round 413 PASS)`.
- **Doc 264** (`docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md`): only l.4 changes, to the same string. Today these lines read `In Progress (stage 1 of 3; …)` and `(stage 2 of 3; …)` [K6].
- **New doc 265** (`docs/implementation/2026/quarter-IV/265-perf-precomputed-peaks-purchased.md`; 265 is the next free number [K6b]):
  - l.4 is exactly `**სტატუსი:** Completed (C round 413 PASS)`;
  - it has the 7 TEMPLATE headings in order (L26), written in Georgian;
  - it covers the cap, the abort listener, the same-origin rule with the fail-closed note (L-c), `fetchPeaks`, and the Firefox record item;
  - its mutant block is the 15 `MU-413-` lines of `b-round-412/mutants/summary.txt`, copied byte for byte;
  - it cites only test rows that exist (L26).
- **After the round:** K6b drops from 9 to 7 `In Progress (stage` docs, and `pending` stays 0.

### Ruling lines (L4)
- **Patch vs reviewer style:** "apply the sketch byte-for-byte" wins over any style preference of A's reviewer. A Medium+ in the sketch logic is a STOP (L11), not an edit.
- **ArrangementContext.tsx:** "one hunk only" wins over any formatter change elsewhere in that file. If `biome check` wants other edits there, STOP.

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| A peaks body without a trustworthy length is now read in chunks and capped (was: unbounded `json()`) | Intended | PP10, PP11 |
| An abort now cancels a pending body read | Intended | PP7d, PP12, PP12b |
| Purchased peaks on another origin than the audio are ignored (decode fallback) | Intended, fail-closed, performance-only | PK4; handoff doc |
| The demo path is unchanged in the browser | Must hold | Rows 4–5 (values equal round 412 and B's v4 run [K20]) |

## 2. What A changes
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-412/sketch-413.patch.txt`, then `git apply` the same file. **Do not edit those 9 files afterwards.**
3. **Docs:** write doc 265 and set l.4 of docs 263 and 264, as ruled above.
4. **Checks and report:** run the §4 checks. Write `a-round-413.md` as you go. It holds the changed files, each check with its rc and log path, the reviewer's findings, and a For B section that includes any Architecture note.

## 3. Grants (`b-round-412/grants-413.txt`, 12 paths)
- **Code and tests (from the sketch):**
  - `app/lib/arrangement/precomputed-peaks.ts`
  - `app/lib/arrangement/collection.ts`
  - `app/types/arrangement.ts`
  - `app/types/audio.ts`
  - `app/contexts/ArrangementContext.tsx` (one hunk)
  - `app/lib/arrangement/__tests__/precomputed-peaks.test.ts`
  - `app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx`
  - `app/lib/arrangement/__tests__/collection.test.ts`
  - `app/data/__tests__/studio-lab-demo.test.ts`
- **Docs:** l.4 of docs 263 and 264, and doc 265 (new, whole).
- **Nothing else:** no protected, auth, route, component, config, package or `public/` file.
- **At the end,** `git status --short --untracked-files=all` shows 11 ` M` lines and 1 `??` line (doc 265).

## 4. A's checks
The full suite and verify belong to the gate (speed rules).

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-412/claims-413.sh` at start | Equals `claims-413-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 9 code and test files | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-412/sketch-logs/covering.txt)` (24 files) | **436/436** [K15]. Report the slowest test against its declared timeout. B's run: 1,731 ms of 15,000 ms (`sketch-logs/slowest.txt`). Above 50 % is a STOP (L31) |
| A4 | Claims at end | Equal to the **sketch output** on K7–K7d, K10b and K10c. K3 stays 1,301 rc 0, K4 rc 0, K2b 0. K2 shows 11 M + 1 ??. K5 is `no`. K6 shows the three Completed lines |
| A5 | `code-reviewer` on the 9 files and doc 265 | No Critical, High or Medium in the sketch logic. A Medium+ there is a STOP (L11). Lows that `b-round-412/sketch-review.md` already rules are not new. Doc findings are fixed in the doc |

## 5. C's acceptance (full run)
**Before hand-off:**
- Write `c-round-413.json` with **all L57 fields**, including:
  - `mutantRedOnSketch` = `b-round-412/mutants/summary.txt`;
  - `mutantRedOnTree`;
  - `gateChecksNamed`, `gateChecksRunOnSketch` = `b-round-412/precheck-full.json` (264 files, 3,922/3,922 [K15]), and `chainHeadGateRunGreen`;
  - `affectedChecksNamed` and `affectedChecksRunOnSketch`.
- Run `python3 -I tools/l57-check.py c-round-413.json c-round-413/l57-check.txt`.

**Order (L59):** row 3 (mutants), then rows 4 and 5 (browser), then the rest. Write `c-round-413/progress.json` after every row. Never run vitest while a browser probe runs (L38). Warm `/studio-lab` in a browser first.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the A4 expectation. Status is the 12 granted paths. Frozen 1,301 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply `b-round-412/sketch-413.patch.txt` to a `git archive HEAD` scratch, then `cmp` its 9 files against the working tree: 0 differences |
| 3 | **UNIT + MUTANT** | (a) The A3 set passes, 436/436. (b) On a committed scratch copy of the working tree (`/tmp/c413-scratch`, `node_modules` symlinked, `git init && git add -A && git commit`), run `S=/tmp/c413-scratch OUT=<loop>/c-round-413/mutants python3 -I b-round-412/mutants/run.py`. Pass = **15/15 RED**, each naming its expected row; pristine before and after rc 0 with `failed []`; `SCRATCH-STATUS 0 lines`. Never use another `OUT` |
| 4 | **DEMO PEAKS UNCHANGED** (browser, 1440×900 and 1280×720, `:5173`, working tree) | `node b-round-412/probe/peaks-before-ready-413.mjs http://127.0.0.1:5173 <out>.json <WxH> <mode>`, modes `real`, `404` and `8bit` only (the other modes are B's invalid harness experiments: `b-round-412/browser/harness-notes.md`). **real:** held `rects` 96, `ariaDisabled` "true", `opacity` "0.4", `title` "Preview — wait for the sound to load"; ready `rects` 96, "false", `title` null; `middleEastBegins` 0; `peaksRequests` exactly the 2 `/peaks/*.peaks.json` URLs; `pageErrors` []. **404:** held 0, ready 96, `middleEastBegins` 1. **8bit:** held 96, `middleEastBegins` 1. B ran these exact values on the v4 sketch at both viewports [K20; `b-round-412/browser/v4-*.json`] |
| 5 | **NO-REGRESSION** (browser, both viewports) | (a) `node b-round-408/lane/lane-actions-probe.mjs …`: `ok` true, 8/8. (b) `node b-round-409/probe/peaks-probe-410.mjs …`: every source has 96 columns, `pageErrors` [], 2 peaks requests. Its `ok` false is expected (round 411 side-effect table) |
| 6 | **AUTH** (browser, fresh context, no credentials) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. The auth wait is `networkidle` (C round 412 note). `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 7 | **SECURITY READ** | PK2 and PK4 are in the row 3 pass. `grep -nE 'console\.' app/lib/arrangement/precomputed-peaks.ts app/lib/arrangement/collection.ts` gives 0 hits (no URL or token is logged) [K23]. The `peaksUrl` same-origin rule is written in doc 265 and in the handoff doc |
| 8 | **DOCS + SCREEN** | **l.4:** docs 263, 264 and 265 l.4 are byte-exact `**სტატუსი:** Completed (C round 413 PASS)`. **Doc 265:** the 7 TEMPLATE headings in order (L26); its `MU-413-` lines equal the 15 in `b-round-412/mutants/summary.txt`; it states the same-origin rule and the decode fallback. **Sweeps:** `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0; `grep -rln 'In Progress (stage' docs/implementation \| wc -l` gives 7. **No other doc** differs from HEAD. **No screen change:** `git diff --stat HEAD -- app/components app/routes` is empty |
| 9 | **FIREFOX** (TLM-PERF15-FIREFOX) | `record`: if K19 is 0, write BLOCKED "Playwright Firefox not installed (ROOT-REQ-PLAYWRIGHT-FIREFOX)". This BLOCKED does not make `browserVerified` false: the row cannot run here. If Firefox is installed, copy the probe to `c-round-413/` (L38: C writes only in its own folder), switch its launcher from `chromium` to `firefox`, run `real` mode, and record one of `matched`, `fell-back-cleanly` or `crashed` |
| 10 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows) |

**Retries (rows 4, 5 and 6):** a first-load timeout on a cold server is an environment problem (L38). Retry at most twice; it is never a FAIL.

**Neighbouring behaviour that could break:**
- **Demo waveform before ready:** rows 4 and 5.
- **The other purchased adapter rows** (PC1–PC10, PV1–PV2 in `collection.test.ts`; `purchased-collection-ui.test.tsx`; `collection-load-status.test.tsx`): they are in the A3 set.
- **PPC1–PPC11:** they still use the global fetch, because `toneCollection` sets no `fetchPeaks` [K22].

## 6. For C: the mutants (`b-round-412/mutants/run.py`, 4 covering files)
| Mutant | Site | Expected red |
|---|---|---|
| MU-413-NO-STREAM-CAP / -LYING | cap ×4 | PP10 / PP11 |
| MU-413-CAP-OFF-BY-ONE | `>` → `>=` | PP11 (the body at exactly the cap must parse) |
| MU-413-NO-ABORT-LISTENER / -PP7D | listener removed | PP12 / PP7d |
| MU-413-NO-PRE-ABORT | pre-aborted branch removed | PP12b |
| MU-413-NO-CALLER-ABORT-CHECK | `\|\| signal.aborted` removed | PP7e |
| MU-413-NO-CTX-FETCHPEAKS | context call without `collection.fetchPeaks` | PPC12 |
| MU-413-NO-ADAPTER-FETCHPEAKS | `fetchPeaks: fetchAudio` removed | PK2 |
| MU-413-ADAPTER-FETCH-STUB | `fetchPeaks` replaced by a 404 stub | PK3 |
| MU-413-NO-ADAPTER-PEAKSURL | adapter `peaksUrl` removed | PK1 |
| MU-413-EMPTY-PEAKSURL-KEPT | empty-candidate guard removed | PK4 |
| MU-413-PEAKSURL-LIVE-READ | live read of the input array | PK1 |
| MU-413-NO-ORIGIN-CHECK | same-origin check removed | PK4 |
| MU-413-META-FILE-SWAPPED | meta `file` points at the other peaks file | PS18 |
