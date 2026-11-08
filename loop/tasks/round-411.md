# Round 411: PERF-15b-i — the demo ships precomputed peaks: the library preview shows the real waveform, dimmed, before the MP3 has decoded (stage 2 of 3 of PERF-15)

**Planned by:** B, at the round 410 → 411 planning, 2026-11-08 (`b-round-410.md`). The advisor was used after orientation and before hand-off.

## Read first
- `lessons.md` in full. The most relevant lessons are L4, L11, L23, L26, L28, L29, L31, L39, L54, L56, L57, L58 and L59.
- This file. Background only: `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md` (outside `store/`).
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (one attribute on an existing element), `AUDIO_ARCHITECTURE.md`, `API_ERROR_HANDLING.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** run `bash b-round-410/claims-411.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-410/claims-411-planning-output.txt`, with empty stderr.
  - Output on the committed sketch scratch: `b-round-410/claims-411-sketch-output.txt`.
  - The two differ only on the lines in `b-round-410/claims-411-planning-vs-sketch.diff`.

## Baseline: HEAD `328db74`, clean tree
- Gate 410 published `328db74` on both remotes [K16]. HEAD is `328db74…` [K1], and `git status --short --untracked-files=all` is empty [K2].
- **Context files are stale.** `context/head-sha.txt` and `context/active-summary.md` still name `9616d3a`, because they were written before gate 410 ran. The gate file wins. This is INFO only.
- **Frozen:** `b-round-410/r411-frozen-sha256.txt` has **1,300** entries: every tracked file except the 7 tracked grants. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Grants:** `b-round-410/grants-411.txt` (§4).
- **No root patch pending:** neither `cloud/root-commits/` nor `root-deps-request.json` exists in the loop folder at planning. If K1 at A1 is not `328db74`, A re-runs the claims on the new HEAD and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 410 passed and is published.** PERF-15a is done: C round 410 PASS, `browserVerified`/`realVerified` true, 0 bugs, gate `328db74`. C found no bugs, so no bug fix-up comes first.
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`, and none reproduces in the cloud browser.
- **REGRESSION-2026-11-10 is not due yet.** `regression-last.json` says 2026-11-07 [K17]. RETRO is due at round 416.
- **PERF-15 promises a waveform visible before decode** (perf-plan). After 15a the client path exists, but no collection sets `peaksUrl` [K10 at HEAD], so a user sees nothing new. 15b makes the promise true in the real `/studio-lab`.
- **15b is split (D-29z1428):**
  - **15b-i (this round):**
    - the demo's two URL-backed MP3 sources get real, committed peaks files;
    - the A-R410-REV-S1/S2 Lows are fixed in the same function;
    - the preview strip gets its unavailable-reason tooltip (`product-designer`);
    - the browser proof.
  - **15b-ii (next):** the purchased adapter's `peaksUrl` input (an optional `AudioStem` field and signed URLs), a streamed-bytes cap (TL-R411-L4), one non-Chromium decode-length probe (TL-R411-L3), and closing PERF-15.
  - This is staging, not a cut: the purchased half needs its own design (fetch injection, signed URLs, no caching by expiring URL).
- **Promise in one sentence (L55):** "When a demo music preview is still downloading, its real waveform is already visible (dimmed, not seekable), and once it is ready the Studio does not compute it again." The proof is rows 3 and 4.

## 1. Rulings (B)

### D-29z1427: the 15b-i contract
1. **Two new committed files: `public/peaks/middle-east.peaks.json` and `public/peaks/hero-music.peaks.json`.**
   - **Format:** audiowaveform JSON v1, mono (the min/max over both channels), 16-bit, `sample_rate` 44100, `samples_per_pixel` 441.
   - **Source:** generated from Chromium's `decodeAudioData` of `/middle-east.mp3` (4,054,080 bytes) and `/videos/hero/hero-music.mp3` (3,610,677 bytes) [K24]. Decoded lengths are 4,469,623 and 6,631,424 at 44.1 kHz; the files hold 10,136 and 15,038 pixels.
   - **Size:** 121,855 and 188,440 bytes, well below the 4 MiB cap [K12 on the sketch].
   - **A copies the bytes from the patch.** A never regenerates the files.
   - **Clipping (recorded, intended):** decoded MP3 samples above full scale are clamped to int16, as in audiowaveform. In the preview, the largest column-height difference between HEAD's worker peaks and the shipped peaks is 0.0133 of full height, and it is not visible [K21].
2. **New committed generator: `scripts/peaks/generate-demo-peaks.mjs` and its output `scripts/peaks/demo-peaks-meta.json`** (TL-R411-M1).
   - **Usage:** with a dev server running, `node scripts/peaks/generate-demo-peaks.mjs [baseUrl]` rewrites both peaks files and the meta file.
   - **Paths:** the script resolves every path from its own location (TL-R411-L6), so it works from any working directory.
   - **No code comments** (CLAUDE.md, TL-R411-L7). Its usage is documented in doc 264.
   - **Meta file:** records the MP3 bytes, the decoded length, the sample rate and the user agent. PS17 reads the MP3 bytes and the decoded length from it (TL-R411-L8), so the test and the meta file cannot drift apart.
   - B re-ran the script from another directory, and it produced byte-identical files.
   - The backend replaces all of this with real audiowaveform output (handoff note).
3. **`app/data/studio-lab-demo.ts`:** a `demoPeaksUrls` map (the two demo MP3 ids → `/peaks/<name>.peaks.json`) and `peaksUrl` on `studioLabDemoCollection`. Every other source returns `null`. Nothing else changes: `previewUrl`, `canReloadSource`, `loadSource`, the labels, the 9 sources and the notice all stay.
4. **`app/lib/arrangement/precomputed-peaks.ts` `fetchPrecomputedPeaks`:**
   - **(S1)** the request passes `credentials: 'omit'`, the same as the audio request in `source-fetch.ts` [K25]. `tech-lead`: this is right for signed URLs, and a bearer header added by an injected `SourceFetch` still works.
   - **(S2)** when the response is not ok, or its declared size is over the cap, the unread body is cancelled (`void response.body?.cancel().catch(() => undefined)`) before `null` is returned.
   - Nothing else changes: the parser, the tolerance, the cap value and the context wiring stay.
5. **`app/components/arrangement/ArrangementLibraryPreview.tsx`:** the preview strip (`data-testid="arrangement-library-preview-wave"`) gets `title={previewUnavailableTitle ?? undefined}` [K8]. It is the same reason string the Preview button already shows (`product-designer`, D-29z1429):
   - no source selected: "Preview — select a sound in the list first";
   - loading: "Preview — wait for the sound to load";
   - error: "Preview — this sound could not load; choose another";
   - ready: no `title`, as at HEAD.

   Nothing else on the strip changes: `opacity-40`, `cursor-not-allowed`, `aria-disabled`, `tabIndex` and the columns all stay.
6. **Unchanged:**
   - `ArrangementContext.tsx` and the whole 15a wiring;
   - the synthetic sources, which have no peaks file and keep the worker path;
   - lanes, which need `ready` [K9];
   - the status texts. **No status write is added, so L51 is not triggered. No focus change, so L50 is not triggered. No persistent text: the tooltip is the quietest home (L39). No position moves.**

### D-29z1429: consult rulings
- **`product-designer`** (`b-round-410/consult-product-designer.md`): keep the existing dimmed state, and add the strip tooltip (adopted, item 5). Rejected options:
  - a shimmer or pulse, because it reads as a placeholder although the shape is real;
  - hiding the peaks until ready, because that throws away honest information;
  - a live-region announcement when ready, because the source row and the status line already carry it;
  - a softer dim, because there is no token reason for it.

  Its three acceptance rows are rows 3 (hover, tooltip and cursor), 3 (Tab skips a not-ready strip) and 4 (no jump in the column heights).
- **`tech-lead`** on v2 (sha `b0a5841f…`, kept as `b-round-410/sketch-411-v2.patch.txt`) gave APPROVE WITH LOWS (`b-round-410/sketch-review.md`):
  - **M1** (the generator is not in the repo): fixed in v4, item 2.
  - **L2** (nothing ties a peaks file to its MP3): fixed in v4. PS17 also asserts the byte size of each MP3.
  - **L3** (all evidence is HeadlessChrome; Firefox and Safari may differ by more than 1 bucket and then use the worker, which is safe): goes to 15b-ii as a Firefox probe.
  - **L4** (the cap applies only when `content-length` is present): goes to 15b-ii, where signed URLs make it matter.
  - **L5** (`demoPeaksUrls` repeats the keys of `demoUrls`): kept. PS16 pins both.
- **`tech-lead` delta re-review of v4** (sha `26266d04…`, kept as `sketch-411-v4.patch.txt`): APPROVE WITH LOWS, with no Medium or higher in the delta. The strip `title` is fine for a11y: the strip already has an `aria-label`, so the title becomes the description, not the name. No repo check picks up `scripts/peaks/*.mjs`. It found three new Lows, all fixed in v5:
  - **L6:** the script used relative paths.
  - **L7:** the header comment broke the project's no-comments rule.
  - **L8:** the meta file and PS17 could drift apart.
  - Answers: the evict-then-reload cell needs no new row, because the reload never recomputes peaks; an HTML 200 response gives `null`.
- **Delta re-review of v5** (the dispatched sha `e9b149c4…`): see `sketch-review.md`, which names every sha. The only v4 → v5 changes are the script and the test file. No runtime file changed (`sketch-logs/v4-v5-runtime-delta.txt`: 0), so the browser evidence taken on v4 is the evidence for v5's runtime.

### Reference: how Ableton Live 12 does it
**Source:** Live 12 manual, ch. 5.1.2 "Analysis Files (.asd)", https://www.ableton.com/en/live-manual/12/managing-files-and-sets/, checked 2026-11-08.

| Point | Live (confirmed in the manual) | CZABA after this round | C row |
|---|---|---|---|
| Stored waveform data | "The analyzed data is also used to quickly draw the audio's waveform in the Sample Editor." The `.asd` file sits next to the sample | The peaks file sits next to the source (backend or `public/peaks`) and draws the waveform before decode | 3 |
| While not ready | "the audio waveform is grayed out until it is fully drawn, and the sample cannot be played back." | Dimmed to 40 %, not-allowed cursor, not seekable, not focusable | 3 |
| Browser preview timing | Not confirmed. Ch. 5.1.1 (Decoding Cache) describes no indicator while decoding | — | none: no reference found. B read the first 100k characters of the ch. 5 page with WebFetch; ch. 4 was seen only in a search summary |

**Better than Live:** Live greys out a waveform that is still being drawn. CZABA shows the complete stored waveform dimmed, because the data is already complete. The "not playable yet" meaning is the same.

**Deviations:** the tooltip text is CZABA's own reason string, shared with the Preview button. This is the already-accepted class of English-only labels, not a new deliberate difference.

### Doc 264 (new) and doc 263 l.4 (L26, L28)
**New doc:** `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md`. 264 is the next free number [K6].
- **Title:** `PERF-15b-i: demo-ს წინასწარ გამოთვლილი peaks და preview strip-ის tooltip`, in Georgian with English technical terms, using the 7 TEMPLATE headings in order.
- **l.4, byte-exact:** `**სტატუსი:** In Progress (stage 2 of 3; C round 411 PASS)`.
- **What it contains:**
  - the D-29z1427 contract;
  - the generator and how to rerun it;
  - the clipping note;
  - the Live 5.1.2 reference;
  - **ტესტირება:** PP8, PP9, PS16, PS17, LPA3b and the 10 mutant lines copied from `b-round-410/mutants/summary.txt`;
  - **TODO:** 15b-ii (TL-R411-L3, TL-R411-L4, purchased `peaksUrl`).
- **Doc 263 l.4** is today `**სტატუსი:** In Progress (stage 1 of 2; C round 410 PASS)` [K6]. It becomes exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 410 PASS)`, because PERF-15 now has 3 stages. That is the only change in doc 263.

After this round, the count of `In Progress (stage` docs goes from 8 to 9 [K6b], and `C round N pending` stays at 0.

### Ruling lines (L4)
- **Patch files:** "apply the patch byte-for-byte" wins over any style preference of A's reviewer. A Medium+ in the patch logic is a STOP (L11), not an edit.
- **The preview strip:** item 5 (one new `title`) wins over "nothing on the strip changes". Only the title is added.
- **`studio-lab-demo.ts`:** item 3 wins over "the demo collection is frozen".

### D-29z1430: the dispatched patch (L58: reviewed = dispatched)
**Patch:** `b-round-410/sketch-411.patch.txt` (v5), sha256 `e9b149c4be701ad1…` in `b-round-410/sketch-dispatched.sha256` [K13]. It touches 10 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 10 files afterwards.** The earlier versions are kept for the record: `sketch-411-v2/-v3/-v4.patch.txt`.

**Evidence on the sketch (committed scratch `/tmp/b411`):**
- `tsc` rc 0, Biome on the 6 `app/` files clean, and `npm run lint` rc 0 (`precheck-lint.log`, `sketch-logs/`).
- **Full vitest: 264 files, 3,911/3,911, rc 0** [K19]. HEAD has 264 files / 3,906 tests; the sketch adds 5 rows (PP8, PP9, PS16, PS17, LPA3b).
- **Covering set** (`sketch-logs/covering.txt`, 24 files): **425/425** [K20]. The slowest test is 2,842 ms in `render-budget`, which declares 15,000 ms (19 %). The second slowest is the detail-panel row: 2,119 ms against the 5,000 ms default (42 %), and 2,002 ms at gate 410. Nothing is above 50 % (L31, `sketch-logs/slowest.txt`).
- **Mutants: 10/10 red**, with pristine rc 0 before and after and 0 scratch status lines [K15] (`mutants/summary.txt`; earlier runs in `mutants/v2/`, `mutants/v4/`).
- **Browser** (`probe/peaks-before-ready-411.mjs`, at both viewports; HEAD on :5173, sketch on :5174 with its own Vite cache) [K21]:
  - **HEAD:** while `/middle-east.mp3` is held, the preview has 0 columns and no title. After ready there is 1 worker job each for Middle East and Hero, and 0 peaks requests.
  - **Sketch, real files:** while the MP3 is held, 96 columns show, with `aria-disabled` true, opacity 0.4, the not-allowed cursor, `tabindex` -1 and the title "Preview — wait for the sound to load". After ready: 96 columns, no title, pointer cursor, `tabindex` 0, **0 worker jobs** for both MP3 sources, exactly the 2 peaks requests and 0 page errors.
  - **Column heights:** held vs ready differ by 0.0000; HEAD-ready vs sketch-ready by at most 0.0133 (`probe/heights-compare.txt`).
  - **404:** 0 columns while held, then 1 worker job for Middle East.
  - **8-bit:** 96 columns while held, then 1 worker job.
- **Round 410's probe on the sketch:** `ok` is false **only** because of its `peaksRequests []` assertion. It shows exactly the 2 peaks files, all 9 sources with 96 columns and 0 page errors [K22]. **Lane probe:** `ok`, 8/8 steps at both viewports [K23].
- The sketch server's first cold warm-up timed out (L38; `probe/v2/` holds `sketch-cold-warmup-attempt.json`).

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| `/studio-lab` now makes exactly 2 peaks requests, `/peaks/middle-east.peaks.json` and `/peaks/hero-music.peaks.json` (HEAD: 0) | Intended. Round 410's `peaks-probe-410` is no longer `ok` because of its `peaksRequests []` assertion; this round replaces that assertion with "exactly these 2" | Row 5 |
| The 2 MP3 sources skip the worker job once decoded (HEAD: 1 job each) | Intended (the 15a contract, 16-bit matched) | Row 4 |
| Preview column heights after ready differ from HEAD by at most 0.0133 | Intended (int16 clipping) | Row 4 |
| The no-source state also gets a strip `title` ("select a sound…") | Intended: the same reason as the Preview button | LPA3b; row 3 |
| jsdom tests that mount the real demo collection now call `fetch('/peaks/…')`, which resolves to `null` | Harmless: the full suite on the sketch is green [K19] | gate |
| Firefox or Safari decode may differ by more than 1 bucket | The worker path runs (safe). 15b-ii adds a probe | TL-R411-L3 |

## 2. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-410/sketch-411.patch.txt`, then `git apply` the same file. **Do not edit the 10 patch files after that.**
3. Write doc 264 and the doc 263 l.4 change as above.
4. Run the §4 checks. Write `a-round-411.md` as you go: changed files, checks with their rc and file paths, reviewer findings, and a For B section (include any Architecture note).

## 3. Grants (`b-round-410/grants-411.txt`)
- **Patch only:**
  - `app/data/studio-lab-demo.ts`
  - `app/data/__tests__/studio-lab-demo.test.ts`
  - `app/lib/arrangement/precomputed-peaks.ts`
  - `app/lib/arrangement/__tests__/precomputed-peaks.test.ts`
  - `app/components/arrangement/ArrangementLibraryPreview.tsx`
  - `app/lib/arrangement/__tests__/library-preview.test.tsx`
  - `public/peaks/middle-east.peaks.json` (new)
  - `public/peaks/hero-music.peaks.json` (new)
  - `scripts/peaks/generate-demo-peaks.mjs` (new)
  - `scripts/peaks/demo-peaks-meta.json` (new)
- **Docs:**
  - `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md` (new);
  - `docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md` (l.4 only).
- **Nothing else:** no protected, auth, route, context, config, package or other file.
- At the end, `git status --short --untracked-files=all` shows exactly 7 ` M` lines and 5 `??` lines.

## 4. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-410/claims-411.sh` at start | Equals `claims-411-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 6 `app/` patch files | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-410/sketch-logs/covering.txt)` (24 files) | 425/425 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K2 (12), K5 (`no`), K6 (doc 264 `1`, its l.4 and doc 263's new l.4), K6b (9, pending 0), and K7, K8, K10, K11 and K12. K7, K8, K10, K11 and K12 equal `claims-411-sketch-output.txt` (see `claims-411-planning-vs-sketch.diff`; K1 differs there only because the scratch has its own commits). K3 stays 1,300 with rc 0 |
| A5 | `code-reviewer` (12 files) | No Critical, High or Medium in the patch logic. A Medium+ there is a STOP (L11). Doc findings are fixed in the docs |

## 5. C's acceptance
Write `c-round-411.json` with **all L57 fields**. They include:
- `mutantRedOnSketch` = `b-round-410/mutants/summary.txt`;
- `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch` and `chainHeadGateRunGreen`;
- `affectedChecksNamed` and `affectedChecksRunOnSketch`;
- one result per row.

Run `python3 -I tools/l57-check.py c-round-411.json c-round-411/l57-check.txt` before hand-off.

**Order (L59):** run the heaviest rows first: row 6, then row 4, then rows 3 and 5. Write `c-round-411/progress.json` after every row.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 12 granted paths. Frozen 1,300 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply the patch to a `git archive HEAD` scratch and `cmp` its 10 files against the working tree: 0 differences |
| 3 | **WAVEFORM-BEFORE-READY** (browser, 1440×900 and 1280×720, working tree, `:5173`) | Run `node b-round-410/probe/peaks-before-ready-411.mjs http://127.0.0.1:5173 <out>.json <WxH> real`. **Assert:** `whileAudioHeld` has `rects` 96, `ariaDisabled` "true", `opacity` "0.4", `cursor` "not-allowed", `tabIndex` "-1" and `title` "Preview — wait for the sound to load". `afterReady` has `rects` 96, `ariaDisabled` "false", `title` null, `cursor` "pointer" and `tabIndex` "0". `middleEastBegins` 0 and `heroBegins` 0. `peaksRequests` is exactly the 2 `/peaks/*.peaks.json` URLs. `pageErrors` []. The held and ready `heights` are equal to within 0.0001. Keep both screenshots per viewport. **Control:** B's HEAD runs (`b-round-410/probe/head-real-*.json`: 0 columns while held, 1 job each) |
| 4 | **FALLBACKS** (browser, both viewports) | Same script, modes `404` and `8bit`. **404:** `whileAudioHeld.rects` 0 with the same title, then `afterReady.rects` 96 and `middleEastBegins` 1. **8bit:** `whileAudioHeld.rects` 96, then `middleEastBegins` 1 (the decoded peaks replace the placeholder). `pageErrors` [] in both |
| 5 | **NO-REGRESSION** (browser, both viewports) | (a) Run `node b-round-408/lane/lane-actions-probe.mjs http://127.0.0.1:5173 <out>.json <WxH>`: `ok` true, 8/8 steps. (b) Run `node b-round-409/probe/peaks-probe-410.mjs …`: every source has 96 columns, `pageErrors` [], and `peaksRequests` is exactly the 2 peaks files. Its `ok` false is expected: the side-effect table replaces its `[]` assertion |
| 6 | **UNIT + MUTANT** | The A3 set passes, 425/425. Then run the mutants on a committed scratch copy of the working tree: `S=/tmp/c411-scratch OUT=<loop>/c-round-411/mutants python3 -I b-round-410/mutants/run.py`. Never use the default `OUT`. Pass = 10/10 RED, each naming its expected row; pristine before and after rc 0 with `failed []`; `SCRATCH-STATUS 0 lines` |
| 7 | **AUTH** (browser, fresh context, no credentials) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 8 | **DOCS** | Doc 264 l.4 is byte-exact, and doc 263 l.4 equals the ruled value. Doc 264 has the 7 TEMPLATE headings in order (L26). Its 10 mutant lines equal `b-round-410/mutants/summary.txt`. PP8, PP9, PS16, PS17 and LPA3b exist in their test files. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No other doc changed |
| 9 | **REFERENCE** (Live 12 manual 5.1.2) | Each point in the Reference table is a match or a listed deviation (rows 3 and 4 supply the evidence) |
| 10 | **SCREEN BUDGET** (L39) | No new persistent text. `git diff HEAD -- app/components/arrangement/ArrangementLibraryPreview.tsx` shows exactly 1 insertion and 0 deletions. That line contains `title=`, and no JSX text node is added. The tooltip is not persistent text |
| 11 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is in `b-round-410/precheck-full.log` |

**Notes on the rows:**
- **Retries (rows 3, 4, 5 and 7):** a first-load timeout on a cold server is an environment problem (L38: warm `/studio-lab` once in a browser first). Retry at most twice; it is never a FAIL.
- **Row 3, scope:** this proves Chromium only. Firefox and Safari go to 15b-ii (TL-R411-L3).
- **Row 6, the scratch:**
  1. Copy the working tree to `/tmp/c411-scratch` and symlink `node_modules`.
  2. Run `git init && git add -A && git commit`.
  3. The runner mutates `public/` and `scripts/` files too, so copy those folders.

**Neighbouring behaviour that could break:**
- The library preview (`library-preview`, `library-preview-stream`) and the collection load order (`collection-load-status`, `pending-status`, `failed-source-refusal`).
- The worker peaks for the 7 synthetic sources: 7 `begin` jobs remain [K21].
- The decoded-buffer eviction and re-decode of the two MP3s (`decoded-buffer-eviction-ui`): reload never recomputes peaks (TL answer).
- The render counts on load (`render-budget`).

## 6. For C: the mutants (`b-round-410/mutants/run.py`)
| Mutant | Site | Expected red |
|---|---|---|
| MU-411-NO-DEMO-PEAKS | the demo `peaksUrl` line is removed | PS16 |
| MU-411-SWAPPED-PEAKS | the two demo peaks paths are swapped | PS16 |
| MU-411-CREDENTIALS-DEFAULT | the fetch has no `credentials: 'omit'` | PP8 |
| MU-411-NO-CANCEL | there is no body cancel on a refused response | PP9 |
| MU-411-FIXTURE-8BIT | the Middle East file says `bits` 8 | PS17 |
| MU-411-FIXTURE-WRONG-SPP | the Middle East file says `samples_per_pixel` 400 | PS17 |
| MU-411-MP3-SIZE-UNTIED | the meta file's MP3 bytes are off by 1 | PS17 |
| MU-411-META-LENGTH-DRIFT | the meta file's Hero decoded length is off by 100,000 | PS17 |
| MU-411-NO-STRIP-TITLE | the strip `title` is removed | LPA3b |
| MU-411-STRIP-TITLE-WHEN-READY | the strip keeps a title when ready | LPA3b |
