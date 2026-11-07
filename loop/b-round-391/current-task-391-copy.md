# Round 391: PERF-13b-ii. Honest status while dropped audio is decoded again; a clip whose sound failed never disappears silently from an export; the PCM memory rows become `assert`

**Planned by:** B, at the round 390 → 391 planning, 2026-11-07 (`b-round-390.md`).
**Decisions:** D-29z1322 … D-29z1329 (`backlog.json` v358, `decisions_log_b`).

**Read first:**
- `lessons.md` in full. Directly relevant:
  - L4: one element, one rule;
  - L10;
  - L23: collisions are granted;
  - L29 and L56: claims;
  - L31: timeouts;
  - L37/L58: perf rows come from B's sketch, with a mutant;
  - L51: status writes, what they overwrite and their lifetime;
  - L52: a jsdom assert must be able to fail;
  - L57: harness fields;
  - L59: do not end early;
  - L60: destructive commands stay in `c-round-391/`.
- The rules: `docs/technical/studio-real-workspace/agent-workflow.md` (speed rules, the bug gate, reference-first, product-designer, cloud runner).
- Earlier stages of this feature:
  - `tasks/round-382.md` §2: the cache, pins and `ensureDecoded` (D-29z1274/1275);
  - `tasks/round-386.md`: decode-resync errors.
- **Claims.** Every fact below about current code or evidence carries a `[K#]` tag from `b-round-390/claims-391.sh`; the planning output is `b-round-390/claims-391-planning-output.txt`. Run it from the loop root.
  - A runs it before editing.
  - C runs it at SOURCE-SCOPE start, where it must equal the planning output, and again at the end. At the end only the facts listed in §6 may differ.

## Baseline: HEAD `11ca746`, clean tree
- **Gates** [K1]: `gates/gate-round-388.json` is `published` with `commit` `11ca746…`. Gates 389 and 390 are `skipped` (no source change). So the baseline is `11ca746`. `context/head-sha.txt` may be stale.
- **At planning:**
  - HEAD is `11ca746`, with 0 status lines [K2];
  - the protected files are 11/11 OK [K3];
  - the frozen manifest `b-round-390/r391-frozen-sha256.txt` (the round-389 tree minus the granted paths) has 1279 entries and 0 failures [K4].

## 0. Why this round
- **REGRESSION-2026-11-08 is closed.** C round 389 (part 1) and C round 390 (part 2) both passed, with 0 bugs and `browserVerified` true [K7]. `regression-last.json` is now 2026-11-07 / 390 [K5]. The next regression is due on or after 2026-11-10 (D-29z1322).
- No Critical or High finding is open, and no cloud-reproducible Medium. The next item in the approved order (D-29z1298) is **PERF-13b-ii** (STUDIO-PERFORMANCE).
- PERF-13b-i made the Studio drop decoded audio that no clip uses and decode it again on demand. It left three gaps in honest behaviour:
  1. **Wait text.** While a dropped sound decodes again, Play writes `“X” has not loaded yet.` [K9], which reads like a broken sound. The library preview writes nothing during the wait [K12]. Nothing tells the user when the sound is ready.
  2. **Data honesty (A-R382-ERROR-SOURCE-SKIPPED).** If a placed clip's sound fails to decode again, its source becomes `error`. Play and export wait only for sources that are `ready` and not cached [K10], so an `error` clip is skipped silently. **An exported WAV can lack a clip, with no message.**
  3. **Memory rows.** `res.mem.pcm-live-mib-ready` and `res.mem.pcm-live-decode-mib-ready` are still `record` [K18]. B has now run the production sketch and a fix-removed mutant (L58), so they become `assert`.

**Promise this serves (L55):** "What you hear and what you export are the clips on the timeline. When a sound is not available, the Studio says so; it never drops it silently."

## 1. Rulings (B)

### D-29z1324: the assert flip
Apply B's sketch exactly: `b-round-390/sketch-391.patch.txt` (sha256 prefix `d2127c92` [K20]). The resulting file is `b-round-390/sketch-391-budgets.resources.json`.
- **The two rows that flip:**
  - `res.mem.pcm-live-mib-ready`: `assert`, `<= 60` MiB. This is the perf-plan PERF-13 target, "≤ 60 MB at ready" (ROOT-NOTE-PERF13-PLAN-ROW).
  - `res.mem.pcm-live-decode-mib-ready`: `assert`, `<= 0`.
- **B's production run on the sketch:** 31.9 and 0, three samples each. Both rows PASS, and the spec reports `1 passed` [K20]. Logs: `b-round-390/perf-sketch-391.log` and `perf-sketch-391-latest-resources.json`.
- **Mutant MU-391-NOTHING-EVICTABLE** (`canReloadSource` → `false` in `app/data/studio-lab-demo.ts` [K19]): the values become 124 and 92.2, and both rows FAIL [K21]. Log: `b-round-390/mutants/mutant-MU-391-NOTHING-EVICTABLE.log`.
- **No loaded replicate.** The memory values are deterministic (three identical samples in each run), so L37's loaded replicate does not apply.
- **`count-ready`, `after-add`, `count-after-add` and `after-export-delta` stay `record`.** An exact count would break the day a synth source is added, and the plan sets no budget for the after-add values.
- No test reads the budgets file; only the perf spec does [K18].

### D-29z1325: the decode wait text (the "known vs decoded" state)
- **No new React state.** "Decoding again" is derived from data that already exists: the source is `ready`, it has no cached buffer (`decodedBuffers.has`), and a decode is in flight. This follows `tech-lead`, because the root architecture checkpoint for this region is still unanswered (D-29z1328).
- **New strings in `studioLibraryStrings`:**
  - `sourceDecoding(title)` → `Loading “<title>”…`
  - `sourceReady(title)` → `“<title>” is ready.`
- **Play,** on every start path through `startPlaybackAt`: a clip whose source is `ready` but not cached gets `sourceDecoding(<title of awaiting[0]>)` instead of `sourceNotLoaded` [K9]. Play still does not start (the round-382 ruling: no auto-start), and `isPlaying` stays false.
- **Library preview** of a source that is `ready` but not cached: it writes `sourceDecoding(title)` before it waits [K12].
- **Settle (the L51 lifetime).**
  - **Where:** at the two call sites, in the `.then` of the `ensureDecoded` call each one started. Not inside `ensureDecoded`: its other callers (the pin path and export) write no status.
  - **How:** one functional update, `setStatus(cur => cur === loadingText ? next : cur)`. Exact text equality is the only token.
  - **What:** `next` is decided at settle time from the cache and the source states, never from the promise resolving (the promise also resolves after an abort):
    - **Success:** every awaited source is cached → `sourceReady(<the same title as the loading text>)`.
    - **Failure:** an awaited source is `error` → `sourceFailed(<the title of the first such source>)`. This write is **unconditional**; see the ruling lines (L4).
    - **Neither** (an abort, or the collection changed) → no write.
- **Preview: the smallest honest rule.** The settle rule above also holds for a preview.
  - When the preview starts, the line reads `“X” is ready.`.
  - A preview that another preview or Stop has replaced does not start (as now). Its settle still swaps its own loading text if that text is still on the line, so a stale "Loading" never stays.
  - **Rejected:** `product-designer`'s "clear the text when the preview starts". Restoring the text that the loading text replaced needs bookkeeping across overlapping waits: preview A waits, then preview B waits. The restored text could itself be a stale loading text. The uniform rule is always true and needs no new state.
- **Unchanged:**
  - A source that is still `loading` (its first load) keeps `sourceNotLoaded`. That covers Add (`addSourceToActiveTrack`), drop, and the preview's not-`ready` branch: the other 3 `sourceNotLoaded` call sites [K8].
  - `dropNotLoaded` is unchanged.

### D-29z1326: a clip whose source is `error` (A-R382-ERROR-SOURCE-SKIPPED)
- **Export (WAV and MP3) refuses.**
  - **Which clips:** `prepareExportSources` [K11] returns the existing failed text when a clip **that the export renders** has a source whose status is exactly `'error'`.
    - With no render window: the whole arrangement.
    - With a render window: only clips that overlap it, `clip.start < window.end && clip.start + clip.duration > window.start`.
  - **What it returns:** still one message, the same `librarySourceFailedMessage(title)` that the callers already wrap in `studioExportStrings.exportFailed` [K11, K15]. The dialog reads `Export failed — no file was created. “<title>” failed to load — details are in the library.`
  - **Keep:**
    - the pins being set before the `await`;
    - the callers' `signal.aborted` check before `failedSource`, so a cancel still wins;
    - the `finally` → `releaseExportPins`.
  - A source with no `sourceStates` entry (video) is never "failed".
- **Play plays, and says why a clip is silent.** This matches Live, which plays silence for missing media and warns in the status bar (see the Reference section).
  - When `present.clips` has a clip whose source is `'error'`, Play starts as before. The status then becomes `sourceFailed(<the title of the first such clip's source>)`.
  - Write it **after** the existing `playingFrom` write [K14], so it is not overwritten. It replaces the "Playing from" text. That is the accepted cost: the warning matters more than the start position.
  - If every clip has failed, Play still starts, plays silence and shows the same warning, as in Live.
- **Not in scope:**
  - retrying a failed source;
  - an "Offline" mark on the clip, as Live has. That mark is a question for Saba (`user-review/questions-perf13b-ii.md`, Q1; default "not now").

### D-29z1327: A-R383-REVIEW-L1-STALE-ENSURE-DECODED is closed, with no code
- `tech-lead` traced every path to the stale `.then`:
  - collection cleanup aborts the signal before it clears the in-flight map;
  - a stale `ensureDecoded` closure gets `controller = null` from the owner check [K13];
  - unmount runs the same cleanup.
- So an extra guard would mean the same as `signal.aborted`, and no mutant could tell the two apart (L52).
- EV7 already proves that an old decode in flight never sets [K16].

### D-29z1329: the purchased collection's reload
Signed URLs can expire, so `canReloadSource` stays absent for the purchased adapter. This becomes a question in `SRW-21-PLAN` (root's parallel lane), not code here.

### Ruling lines (L4)
- Status line after the Play refusal: D-29z1325 wins over the round-382 `sourceNotLoaded` refusal text, for the ready-but-not-cached case only.
- Status line after Play with an `error` clip: D-29z1326's warning wins over `playingFrom`.
- The EV9 assertion `status` = `statusBefore` [K16]: the D-29z1325 settle rule wins. EV9 is rewritten, and no assertion is lost.
- **Settle writes: success is conditional, failure is not.** The `sourceReady` write is the conditional swap (only when the line still shows the loading text). The **failure** write (`sourceFailed(<first failed title>)`) is **unconditional** at both call sites. For the preview this is today's behaviour, pinned by EV13 [K12]. For Play it is new. A failure must never go silent because another text replaced the loading text. EV13 is not weakened.

## 2. Reference: how Ableton Live 12 does it (and where we differ)
| Behaviour | Source | Live (confirmed) | CZABA decision | C check |
|---|---|---|---|---|
| Waiting for a sound to decode | Live 12 manual, ch. 5 "Managing Files and Sets" (searched by `product-designer`, 2026-11-07) | **No reference found.** Live streams samples from disk, so it shows no decode wait | Status line `Loading “X”…` → `“X” is ready.`; no auto-start (round 382) | B1, B2 |
| Play with a clip whose media is missing | Live 12 manual 5.6 "Locating Missing Files", https://www.ableton.com/en/live-manual/12/managing-files-and-sets/#locating-missing-files | "Live's Status Bar … will display a warning message"; the clips are marked "Offline"; "Live will play silence instead of the missing samples" | Plays, with a warning in the status line. **Difference:** no "Offline" mark on the clip (Saba Q1, L44) | B3 |
| Export with missing media | Live 12 manual 5.1.3 "Exporting Audio and Video" | **No reference found.** The section does not mention missing files | Refuse, and write no file. Our own decision: a WAV with a missing part must never reach an editor's timeline | B4 |

**Product design (`product-designer`, 2026-11-07).**
- **Framing:** a short wait (≤ 2 s) needs a truthful text, not a new visual element.
- **Rejected:**
  - a spinner on the library row: a new element for a wait of 2 s or less;
  - auto-start after the decode: the sound would arrive after the user has moved on;
  - rendering silence with a warning: the warning is lost and the WAV is wrong.
- **Where B deviates from it:** the preview settle text (D-29z1325, with the reason given there).

**Screen budget (L39):** nothing new is permanently visible. Only the existing status line changes text, so C has nothing to count.

## 3. What A changes (grants: `b-round-390/grants-391.txt`, 6 paths)
1. **`perf/budgets.resources.json`:** apply `b-round-390/sketch-391.patch.txt` exactly. The result must be byte-identical to `b-round-390/sketch-391-budgets.resources.json` (`cmp`).
2. **`app/lib/arrangement/strings.ts`:** add `sourceDecoding` and `sourceReady` to `studioLibraryStrings`, with the exact texts in D-29z1325. Change nothing else [K15].
3. **`app/contexts/ArrangementContext.tsx`:** D-29z1325 and D-29z1326 only.
   - No new `useState` or context field. Add a ref only if one is needed to remember the loading text per call, and explain it in the report.
   - Do not touch `ensureDecoded`'s body [K13], the cache, the pins or the collection effect.
4. **`app/lib/arrangement/__tests__/strings.test.ts`:**
   - add the two formatters to the `studioLibraryStrings` formatter-sample table [K17];
   - add exact-text expectations next to the existing `sourceNotLoaded` one.

   B's L23 pre-apply showed ST12 red without this [K22].
5. **`app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`:** rewrite EV3 and EV9 to the new contract, and add the rows in §4.
   - The file has 22 tests and ran in 1855 ms at gate 388 [K24], so the L31 headroom is fine.
   - Rewrites keep every assertion or replace it with an equal or stronger one. A test whose only change removes an assertion is a Medium finding.
6. **`docs/implementation/2026/quarter-IV/251-perf-decode-status-and-failed-sources.md`** (new; 251 is the next free number [K23]): in Georgian, following `docs/implementation/TEMPLATE.md`.

**Forbidden:**
- every path not in the grants, including `ensureDecoded`'s body, `app/data/studio-lab-demo.ts`, `graph.client.ts` and the purchased adapter;
- `global_forbidden_files` / `global_forbidden_actions` and the 4 protected files;
- `package.json`;
- commit, push, stash, checkout, deploy, and dev-server restarts.

## 4. A: tests (jsdom, in `decoded-buffer-eviction-ui.test.tsx`; the ids are binding)
Each row names the mutant that must turn it red. A runs each mutant on a scratch copy outside `store/`, and saves the logs in `a-round-391/mutants/`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **EV3** (rewritten) | Add `big`; Play before the decode settles | `isPlaying` false; status `sourceDecoding(BIG_TITLE)`. Settle OK → status `sourceReady(BIG_TITLE)`, still not playing. Play again → plays. Keep the rest of today's EV3 asserts | MU-391-OLD-PLAY-TEXT (`sourceNotLoaded` back at the Play refusal); MU-391-NO-SETTLE-SWAP (the `.then` swap removed) |
| **EV16** | As EV3, but another status write lands before the settle (a second Add, of the ready source `keep`) | After the settle, the status is still the second write's exact text, not `sourceReady`. **Failure variant:** the same sequence, but the settle fails → the status is `sourceFailed(BIG_TITLE)` (unconditional) | MU-391-UNCONDITIONAL-SWAP (`setStatus(next)` without the equality check); MU-391-CONDITIONAL-FAILURE (the failure write also gated on the loading text) |
| **EV17** | Two evicted sources placed: `big` and a second evictable fixture (add one to the fixture if none exists). Play; settle the first only | Status still `sourceDecoding(<first title>)`. Settle the second **with an error** → `sourceFailed(<second title>)`; `isPlaying` false | MU-391-READY-ON-FIRST (decides "ready" from the first settled id only) |
| **EV9** (rewritten, both cases) | Preview `big` (evicted) | Before the settle: status `sourceDecoding(BIG_TITLE)`. After the settle: the preview plays `big` and the status is `sourceReady(BIG_TITLE)`. **Superseded case:** preview `big`, then preview `keep`. After `big`'s settle, `libraryPreviewSourceId` is `keep`, the status is `sourceReady(BIG_TITLE)` (it still equalled the loading text), and the cache does not keep `big` (as today) | MU-391-PREVIEW-NO-LOADING (no loading write) |
| **EV18** | Preview `big`; settle **with an error** | Status `sourceFailed(BIG_TITLE)` (today's EV13 failure text, now reached through the swap); no preview | MU-391-NO-SETTLE-SWAP |
| **EV19** | Add `big`; settle with an error (the source is now `error`); then `exportWav()` | `renderWavMock` not called; `exportState` = `{ phase: 'error', message: exportFailed(sourceFailed(BIG_TITLE)) }`; the export pins are released | MU-391-EXPORT-NO-ERROR-CHECK (the new failed branch removed) |
| **EV20** | As EV19, but a range export whose window does not overlap the failed clip, with a `ready`, cached clip inside it | The render runs (`renderWavMock` called once); no failure text | MU-391-ERROR-CHECK-IGNORES-WINDOW |
| **EV21** | As EV19, then Play | `isPlaying` true; status `sourceFailed(BIG_TITLE)`, not `playingFrom` | MU-391-PLAY-NO-WARNING; MU-391-WARNING-BEFORE-PLAYINGFROM (the warning written before the `playingFrom` update) |
| **EV22** | Play → `sourceDecoding`; `beginPointerGesture()` [K14]; settle OK; release the gesture | **Record** the final committed status and `getStatusPreviewText()` in the report. Assert only that the final status is not `sourceDecoding(BIG_TITLE)`. EV3 is the positive counterpart | None (a record row for `tech-lead`'s mid-gesture risk) |

**A also runs:**
- `npm run typecheck` and `npm run lint`;
- `npx vitest run` on:
  - `decoded-buffer-eviction-ui.test.tsx`, `strings.test.ts`, `failed-source-refusal.test.tsx`, `name-bar-hint-ui.test.tsx`, `grid-snap-loop-drop.test.tsx`;
  - `export-range-ui.test.tsx`, `export-range.test.ts`, `schedule-failure-ui.test.tsx`;
  - every other test file under `app/` that matches `sourceNotLoaded|exportFailed|prepareExportSources|playingFrom` (paste the grep and its file list);
- the `code-reviewer` (3 or more files changed).

A does not run the full suite or `verify`; the gate does.

**A's report, `a-round-391.md`:**
- the changed files;
- each command with its rc and its log path under `a-round-391/`;
- each mutant's red log;
- the EV22 record;
- the reviewer's notes. An Architecture note goes to B as a signal.

## 5. C: browser rows (1440×900 and 1280×720, on `http://127.0.0.1:5173/studio-lab`)
**Probe setup.**
- **Base:** `c-round-382/lib.mjs` `open()`, with the injection style of `b-round-385/probe/preview-while-playing.mjs`.
- **Two init helpers:**
  - `window.__delayDecodes = n`: the next n `decodeAudioData` calls resolve 1500 ms late, so the wait is visible;
  - `window.__failDecodes = n`: the next n calls reject.
- **Status:** read it from `[data-testid="arrangement-status"]`, an `aria-live="polite"` `output` [K26]. Record every text the line takes with a `MutationObserver`.
- **Ready wait:** wait for the text starting `Demo collection ready.` before the first action (L48) [K26].
- **Injection order:** install both helpers with their counters at 0, wait for ready, and only then set a counter to 1 and act. A counter set before ready delays or fails the collection's own first decode, and makes the run invalid (a replacement attempt, not a FAIL).
- **Title:** the Middle East title is `Middle East — public preview` [K19].

| Row | Steps | PASS when |
|---|---|---|
| **B1 PREVIEW-LOADING** | Fresh load; delay 1; select Middle East; click Preview | The observed sequence contains `Loading “Middle East — public preview”…`, then `“Middle East — public preview” is ready.`. The preview audibly starts (a source start longer than 100 s, or the toggle reads Stop). 0 `pageerror` |
| **B2 PLAY-LOADING** | Fresh load; delay 1; Add Middle East (Enter); press Space within 500 ms | The status shows `Loading “Middle East — public preview”…` and `data-playing` stays false. After the decode, the status is `“Middle East — public preview” is ready.` and playback is still stopped. Space again → playing, with a level at least 20 dB above the floor |
| **B3 FAILED-CLIP-PLAY** | Add Middle East and wait for the decode; Delete the clip (its buffer is released); fail 1; Ctrl+Z (the clip returns and its re-decode fails) | After Ctrl+Z, the library row of Middle East shows its load error. The undo path writes no decode status, so record the status text without asserting it. Space → `data-playing` true, and the status is `“Middle East — public preview” failed to load — details are in the library.` |
| **B4 FAILED-CLIP-EXPORT** | Continue from B3: Stop; Export → WAV | No download. The dialog shows `Export failed — no file was created. “Middle East — public preview” failed to load — details are in the library.`. Repeat once with MP3: the same text, no download |
| **B5 CONTROL-EXPORT** | Fresh load, no injection: Add Middle East, export a WAV | One WAV with a RIFF/WAVE header and length > 0 (the existing flow still works) |
| **MOCK-START** (before B6 only) | Start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199, as round 390 did; stop it at the end. B1–B5 and PERF-RES do not need it | `GET /api/products` returns 200. Without it, B6 is BLOCKED (environment), not FAIL |
| **B6 JOURNEY (L54)** | Product page → "Try it in the Studio" → `/studio-lab` → preview → Add → Play → Export WAV | A screenshot of each step; the B1 and B2 texts appear where expected; the WAV arrives |
| **PERF-RES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone (it builds; port 5188) | 1 passed, 0 problems. `pcm-live-mib-ready` assert PASS (≈ 31.9), `decode-mib-ready` assert PASS (0), and every other assert PASS. Copy the results to `c-round-391/perf-results/` |
| **SOURCE-SCOPE** | At start and end: the claims script, `git status`, and `sha256sum -c` on `r391-frozen-sha256.txt` and on the protected manifest | Start = the planning output. End: only the 6 granted paths changed (doc 251 is new); K4 0 failures; K3 11 |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

**Neighbours that can break** (one short check each, at 1440 only):
- the round-382 EV13 path: a preview while playing keeps the timeline playing until its decode succeeds;
- the first-load sequence `Loading the demo collection…` → `Demo collection ready.`;
- Add of a source that is still loading still says `has not loaded yet.`.

**L57 fields** in `c-round-391.json`:
- `manifestPaths` = `b-round-390/r391-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
- `mutantRedOnSketch` = "MU-391-NOTHING-EVICTABLE red on B's sketch (`b-round-390/mutants/`); jsdom mutants: A's logs";
- an `origin` per finding.

## 6. Claims that may change during the round
- **K8:** 4 → 2 or 3. The Play refusal goes; the preview `.then` fallback at the old not-`error` branch may go too, if the swap replaces it. The Add/drop and preview not-`ready` call sites stay. A lists each remaining call site.
- **K9:** 1 → 0.
- **K15** `new-keys`: 0 → 2.
- **K16:** the EV pins and the test count (22 → 22 plus the new rows).
- **K17:** unchanged, with new rows next to it.
- **K18:** `assert assert record record`.

Everything else must equal the planning output.

## 7. Out of scope (recorded, not dropped)
- An "Offline" mark on clips (Saba Q1).
- Retrying a failed source.
- Q-PREVIEW-STOPS-TRANSPORT (awaiting Saba).
- The purchased reload (SRW-21-PLAN).
- PERF-13c (streaming library preview) comes next.
