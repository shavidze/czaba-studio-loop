# A round 411 — PERF-15b-i (demo precomputed peaks + preview strip tooltip)

## STOP — needs B ruling on A-R411-REVIEW-M1
The `code-reviewer` (A5) reported a **Medium** in two of the 10 patch files. A confirmed it by reading the code. Task A5 and L11 make a Medium+ in the patch logic a STOP, so A has not edited the patch files.
- **Where:**
  - `scripts/peaks/generate-demo-peaks.mjs` l.19: `const ctx = new AudioContext();` has no `sampleRate`, so `decodeAudioData` resamples to the device rate.
  - `app/data/__tests__/studio-lab-demo.test.ts`, PS17 (l.376): `precomputedPeaksMatchDecodedLength(peaks, decodedLength, 44100)`. `readPeaksMeta` (l.332–353) drops the meta's `sampleRate`.
- **Failure mode:** regenerating on a 48 kHz host writes `sample_rate 48000`, `samples_per_pixel 480` and a 48 kHz `decodedLength`. PS17 then expects `≈ len48k/441` buckets instead of `len48k/480`, so it goes red after a valid regeneration.
- **Not affected:**
  - the committed files: headers `version 1, channels 1, 44100, spp 441, bits 16`, lengths 10136/15038 = `ceil(decodedLength/441)`;
  - the runtime and every A1–A4 result;
  - the browser sanity runs (§2).
- **Tree state:** consistent. The patch is applied byte-for-byte, the docs are written, and status shows 12 granted lines. Nothing has been reverted.

**Status:** implemented up to the STOP above. The full reviewer result is in §4, and the options for B are in §6.

**Pre-flight:**
- **Assumptions:** B's reviewed v5 sketch is the contract and is applied byte-for-byte; A writes only doc 264 and doc 263 l.4.
- **Files:** the 12 granted, no others.
- **Success:** A1–A5. Primitives read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, API_ERROR_HANDLING, TESTING_QUALITY_GATES, GEORGIAN_DOCS, and `docs/implementation/TEMPLATE.md`.

## 1. Changed files (12; `git status --short --untracked-files=all` = 7 ` M` + 5 `??`)
Patch v5 `b-round-410/sketch-411.patch.txt` (sha256 `e9b149c4be701ad13c6819856082674cf94702b94c0d51b71712e1576dd39025`, equal to `sketch-dispatched.sha256`). It was applied byte-for-byte with `git apply` after `--check` OK, and none of the 10 patch files was edited afterwards:
- M `app/components/arrangement/ArrangementLibraryPreview.tsx` (+1: strip `title`)
- M `app/data/studio-lab-demo.ts`, M `app/data/__tests__/studio-lab-demo.test.ts` (PS16, PS17)
- M `app/lib/arrangement/precomputed-peaks.ts`, M `app/lib/arrangement/__tests__/precomputed-peaks.test.ts` (PP8, PP9)
- M `app/lib/arrangement/__tests__/library-preview.test.tsx` (LPA3b)
- ?? `public/peaks/middle-east.peaks.json`, ?? `public/peaks/hero-music.peaks.json`
- ?? `scripts/peaks/generate-demo-peaks.mjs`, ?? `scripts/peaks/demo-peaks-meta.json`

Docs (A):
- ?? `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md`. Its l.4 is `**სტატუსი:** In Progress (stage 2 of 3; C round 411 PASS)`, and it has the 7 TEMPLATE headings in order plus the 10 mutant lines copied from `b-round-410/mutants/summary.txt`.
- M `docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md`: l.4 only, now `**სტატუსი:** In Progress (stage 1 of 3; C round 410 PASS)`.

## 2. Checks (logs in `a-round-411/`)
| # | Check | Result |
|---|---|---|
| A1 | claims at start | Identical to `claims-411-planning-output.txt`; stderr 0 bytes (`claims-start.txt`, `claims-start.err`). HEAD `328db74`, tree clean before apply |
| A2 | `npm run typecheck` | rc 0 (`typecheck.log`) |
| A2 | `npm run lint` | rc 0: 205 warnings and 1 info, pre-existing repo-wide; 0 errors (`lint.log`) |
| A2 | `npx biome check` on the 6 `app/` files | rc 0, "Checked 6 files", no fixes (`biome.log`) |
| A3 | `npx vitest run $(cat b-round-410/sketch-logs/covering.txt)` | 24 files, **425/425**, rc 0 (`covering.log`, `covering.json`) |
| A3 | L31 slowest tests (`slowest.txt`) | The highest ratio is 871 ms / 5,000 ms default (17 %) in `render-budget` RB-PB2. The longest test is 2,205 ms / 15,000 ms (15 %), the render-budget "does not re-render clips…" row (l.369). library-notice LN1 takes 864 ms / 5,000 ms (17 %). Nothing is above 50 %. Gate 410's `verify.log` has no per-test times |
| A4 | claims at end (`claims-end.txt`, diff in `claims-planning-vs-end.diff`) | Differs from planning only on K2 (12), K5 (`no`), K6 (doc264 1 with the l.4 above, and doc263's new l.4), K6b (9, pending 0), K7, K8, K10, K11 and K12. K3, K7, K8, K10, K11 and K12 equal `claims-411-sketch-output.txt` line for line. K3 `frozen-entries 1300 rc 0`; K4 `protected rc 0 granted-protected 0`; stderr 0 bytes |
| A5 | `code-reviewer` (12 files) | §4 |
| extra | Browser sanity: `b-round-410/probe/peaks-before-ready-411.mjs` on `:5173`, mode `real`, working tree | See below |

**Browser sanity check (not a C row; C runs its own):**
- **First attempt at 1440:** it timed out waiting for the strip on a cold server, so it is environment-invalid (L38). Its output was `peaksRequests []` and `pageErrors 4` (count only, no messages). The log was then overwritten by the retry, so only this note records it. The warm-up that followed had 0 page errors.
- **Warm-up, then retry:** after one browser warm-up of `/studio-lab` (`warmup.mjs`, 0 page errors), the probe ran at both viewports with rc 0.
- **While the MP3 is held:** `rects` 96, `ariaDisabled` "true", `opacity` "0.4", `cursor` "not-allowed", `tabIndex` "-1", `title` "Preview — wait for the sound to load".
- **After ready:** `rects` 96, "false", `title` null, "pointer", "0".
- **Counts:** `middleEastBegins` 0, `heroBegins` 0, `peaksRequests` exactly the 2 `/peaks/*.peaks.json`, `pageErrors` [].
- **Heights:** held vs ready max difference 0.0.
- **Evidence:** `probe-real-1440x900.json`, `probe-real-1280x720.json`, and held/ready PNGs per viewport.
- **Not run:** the 404/8bit modes, the lane probe and the 410 probe (C rows 4 and 5).

## 3. B acceptance (A side)
- §2 items 1–3: done. Patch applied byte-identical; doc 264 written; doc 263 l.4 changed.
- A1–A4: pass as above. A4 refers to the final claims run made after the last doc edit.
- **A5: not passed.** One Medium in the patch logic (A-R411-REVIEW-M1) means STOP.
- C rows: not claimed by A.

## 4. Code-reviewer (actual `code-reviewer` subagent, 12 files): no Critical or High, 1 Medium, Lows; score 8/10
- **A-R411-REVIEW-M1 (Medium):** the generator depends on the device sample rate, and PS17 assumes 44.1 kHz. This is the STOP above. Reviewer's fix: `new AudioContext({ sampleRate: 44100 })`, and PS17 reads `sampleRate` from the meta file.
- **A-R411-REVIEW-L1 (Low):** `rate / 100` in the generator duplicates `PEAK_BUCKETS_PER_SECOND` (`app/lib/arrangement/peaks.ts:1`). PS17 could assert `samples_per_pixel === sample_rate / PEAK_BUCKETS_PER_SECOND`. Patch file, not edited.
- **A-R411-REVIEW-L2 (Low):** the peaks↔MP3 tie is the byte size only; a sha256 in the meta would be stronger. Acceptable for demo assets (same class as TL-R411-L2). Not edited.
- **A-R411-REVIEW-L3 (Low):** generator robustness. It has no `response.ok` check, no `try/finally` around `browser.close()`, and a braceless `for` at l.25. `scripts/**` is outside Biome `files.includes`, so no repo check lints it (L30). Not edited.
- **A-R411-REVIEW-L4 (Low, doc):** doc 264 l.124 used the present tense "C checks" next to the post-PASS l.4. **Fixed in the doc**: now "C round 411-ის row 3–5 იგივეს ფარავს working tree-ზე." The claims were re-run after this edit (§2 A4 refers to that run).
- **A-R411-REVIEW-L5 (Low, doc):** doc 264 l.31 says an injected `SourceFetch` bearer header still works. That follows from the Fetch spec and from B's `tech-lead` ruling (task D-29z1427 item 4), but no row in this diff tests it. A left it as written because it quotes the task ruling. B may move it to 15b-ii.
- **Info (a11y):** a not-ready strip has `tabIndex -1`, so its tooltip is mouse-only. The Preview button carries the same title. This is accepted by design (`product-designer`, D-29z1429).
- **Passed:**
  - **Fetch change:** never rejects; NaN `content-length` → refused; a null body is safe; `credentials: 'omit'` matches `source-fetch.ts:15`.
  - **a11y:** `title` on a role=slider that has an `aria-label` becomes the description.
  - **Tests:** PP8, PP9 (the never-closing streams make a missing cancel time out), PS16 and LPA3b can each fail.
  - **Docs:** all 5 row ids exist, and the 7 headings are in order.
  - **Project rules:** no `any` and no type assertions.
- **Architecture note (for B/root, not acted on):** the same two URL pairs live in 4 places (`studio-lab-demo.ts`, the test's `peaksFiles`, the generator's `files`, the meta file). The reviewer says keep them, since the test copy is intentionally independent and the `.mjs` script cannot import TS. Separately, `ArrangementContext.tsx` ~l.4557 has a `.then` without `.catch` on `fetchPrecomputedPeaks`. It is safe only because that function never rejects. That code is not in this diff and was not touched.
- **Alternative (reviewer):** build-time peaks from the MP3 in CI. The reviewer's verdict is to keep the current approach.

## 5. Known gaps
- Chromium only (TL-R411-L3 → 15b-ii). The cap applies only when `content-length` is present (TL-R411-L4 → 15b-ii). Purchased `peaksUrl` → 15b-ii.
- The full suite, build and verify are not run by A (speed rules: gate rows).
- I created and deleted a temporary warm-up script copy in the store root, `./.a411-warmup.mjs`, to resolve `@playwright/test`. The final status is 12 lines, without it.

## 6. For B
**Options for ruling on A-R411-REVIEW-M1** (one step):
- **(a)** Rule it Low (dev-tool determinism only; the committed files and the runtime are unaffected) and re-dispatch the same v5 patch as round 412. The tree is already in that state.
- **(b)** Sketch v6:
  - `new AudioContext({ sampleRate: 44100 })` in the generator;
  - PS17 reads `sampleRate` from the meta file (or asserts it is 44100);
  - optionally fold in A-R411-REVIEW-L1 (`PEAK_BUCKETS_PER_SECOND`) and L3;
  - then a new sha, a delta re-review and a re-dispatch.

  The committed peaks files would be byte-identical if they were regenerated on a 44.1 kHz context.

INFO:
- **INFO-A411-SKETCH-REVIEW-HEADER:** `b-round-410/sketch-review.md` l.2 still reads "Dispatched sketch sha256: 26266d04… (v4)". l.24 names the dispatched v5 `e9b149c4…` correctly. L58 is satisfied by l.24, but the header is stale.
- **INFO-A411-L31-TIMEOUT-WORDING:** task §1 says the detail-panel row ran "2,119 ms against the 5,000 ms default (42 %)". That test (`render-budget.test.tsx` l.485) closes with `}, 15000)` at l.544, so the real ratio was 14 %. This changes nothing in the round.
- **INFO-A411-CONTEXT-STALE:** `context/active-summary.md` names 9616d3a/round 410 in places, as the task already notes.

## 7. Exact next C checks
**Per L22 (a STOP on a reviewer Medium, with a diff):**
1. SOURCE-SCOPE: status = the 12 granted paths, frozen 1300 rc 0, protected rc 0.
2. CLAIMS: compare `a-round-411/claims-end.txt` with the planning output (allowed delta as in task A4).
3. AUTH (row 7).
4. The STOP's named check: `grep -n 'new AudioContext()' scripts/peaks/generate-demo-peaks.mjs` (expect l.19) and `grep -n 'decodedLength, 44100' app/data/__tests__/studio-lab-demo.test.ts` (expect 1 hit in PS17).
5. Then a short FAIL "STOPPED — routed to B".

If B or root instead tells C to verify in full, use the task's L59 order: row 6 (unit + mutants on a committed scratch of this tree), row 4 (404/8bit at both viewports), row 3 (real at both viewports; A's sanity runs above are not C evidence), row 5 (lane probe + 410 probe, expecting the 2 peaks requests), row 7 (auth), rows 2/8/9/10/11 (patch identity cmp, docs byte checks, reference, `git diff` on `ArrangementLibraryPreview.tsx` = 1 insertion with `title=`, claims at end + `tools/l57-check.py`).
