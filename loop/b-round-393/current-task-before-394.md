# Round 393: PERF-13c-i. A library preview of a URL-backed source streams through a media element and does not decode the file

**Planned by:** B, at the round 392 → 393 planning, 2026-11-07 (`b-round-392.md`).
**Decisions:** D-29z1336 … D-29z1341 (`backlog.json` v360, `decisions_log_b`).
**Type:** a feature stage of STUDIO-PERFORMANCE (PERF-13c, stage 1 of 2). Performance work: no new screen element, and no new behaviour a user must learn.

**Read first:**
- `lessons.md` in full. Most relevant here: L4, L10, L11, L23, L26, L28, L29, L31, L49, L51, L52, L56, L57, L58, L59.
- This file. Open `tasks/round-392.md` only to look up the round-392 decode-status contract, which this round keeps.
- **Claims:** `b-round-392/claims-393.sh`, run from the loop root. Its planning output is `b-round-392/claims-393-planning-output.txt`.
  - A runs it before editing.
  - C runs it at SOURCE-SCOPE start, where it must equal the planning output, and again at the end, where only the facts in §7 may differ.

## Baseline: HEAD `c1183a0`, clean tree
- Gate 392 is `published` at `c1183a0` [K1]. HEAD is `c1183a0`, with 0 status lines [K2].
- Protected files: 11/11 [K3].
- Frozen manifest `b-round-392/r393-frozen-sha256.txt`: 1280 entries, 0 failures [K4]. It covers every tracked file except the 5 tracked granted paths.
- Grants: `b-round-392/grants-393.txt`, 7 paths (§4).

## 0. Why this round
- **PERF-13b-ii is done.** C round 392 passed with `browserVerified` true, and gate 392 published it as `c1183a0` [K7]. PERF-13c is next in the STUDIO-PERFORMANCE order (D-29z1340).
- **Premise, measured by B at HEAD (L37)** [K19], in `b-round-392/premise/premise-head.json`:
  - **Middle East:** Preview decodes the whole file. `decodeAudioData` takes 278 ms and adds 37.1 MiB of live PCM. The first sound comes 360 ms after the click.
  - **Hero:** 673 ms, +55.1 MiB, first sound after 765 ms.
  - **Synth Full mix:** already decoded in memory, so 66 ms and no decode.
  - So every Preview of an unplaced URL source holds tens of MiB that nothing else needs. On slow machines it also shows the round-391/392 `Loading “X”…` wait.
- **Goal of 13c-i.** Previewing an unplaced URL-backed source plays it through an `HTMLAudioElement` (the browser streams and decodes internally), with **0 `decodeAudioData` calls and 0 MiB of added live PCM**.
  - Synth sources (no URL) keep today's buffer path.
  - The purchased adapter is **13c-ii** and is not touched here. Its browser half needs the backend, which is BLOCKED in the cloud.
- **B's sketch already works in Chromium at both viewports** [K20], in `b-round-392/sketch-browser.json`:
  - Middle East streams: `paused` false, `currentTime` 0.51, no decode, live PCM unchanged at `[2,5,16,16,16,16,16]`.
  - Stop leaves the element paused, with no `src` and `networkState` 0.
  - With media requests aborted, it falls back to the decode path: `Loading…` → `is ready.`, and a 101.35 s buffer starts.

## 1. Rulings (B)

### D-29z1341: how the preview chooses its path
In `startLibraryPreview`, for a source that exists, the first rule that applies wins:
1. **Cached buffer** (`decodedBuffers.has(id)`): the buffer path, as today. A cached buffer is free and exact.
2. **Stream path** (new), when all of these hold:
   - the source is `ready` and not cached;
   - `collection.previewUrl?.(source)` returns a string;
   - the id is not in this collection's stream-fallback set.
3. **Otherwise:** the decode branch and the not-ready branches, exactly as at HEAD. The round-391/392 settle rule is unchanged [K24].

**The stream path, in order:**
1. `ensureAudioContext()`; return if it fails. This keeps the "audio unavailable" behaviour and a later Play unchanged; it is recorded in doc 252.
2. If playing, `stopPlayback()`. This keeps the pre-existing "preview stops the transport" contract (Q-PREVIEW-STOPS-TRANSPORT stays open and unchanged).
3. Create the player lazily, with the same `onEnded` as today. A may extract one `ensurePreviewPlayer(ctx)` helper shared with the buffer path, inside the grant.
4. Set `previewRequestRef.current = null`.
5. Call `releasePreviewPin()`. A stream holds no decoded buffer, so it pins nothing and frees any earlier preview's pin.
6. Set `libraryPreviewSourceRef.current = id` and call `setLibraryPreviewSourceId(id)`. This happens **before** the player call, so a synchronous error's restart writes last (sketch review #3).
7. Call `player.playLibraryPreviewStream(url, offset, onStreamError)`.

**No status write on the stream path.**
- While the element buffers, the status line keeps its text. A cached-buffer preview also writes nothing today.
- A loading text would flash on every waveform seek (tech-lead consult).
- This is the smallest honest behaviour. The toggle already reads `Stop`, and the cursor holds at the requested offset until sound starts (the media spec's `currentTime`).

**Stream failure.** A failure is an element `error` event, or a rejected `play()`, while that preview is still the active one.
- The player stops and releases the element, then calls `onStreamError(atSeconds)`, where `atSeconds` is the element's `currentTime` at that moment.
- The provider then:
  - adds the id to a per-collection fallback set: one ref, `{ collection, sourceIds }`, which starts over when the collection object differs;
  - clears the preview id and state;
  - calls `startLibraryPreviewRef.current(id, atSeconds)`. That call takes the decode path and writes the round-392 texts honestly: `Loading “X”…`, then `“X” is ready.` or `sourceFailed`.
- Later previews of that id in the same collection skip the stream.
- A `play()` that rejects after our own `pause()` (`AbortError` on a stopped or superseded preview) is **not** a failure, because that preview is no longer active.

**Player (`preview.client.ts`).** One `LibraryPreviewPlayer` with one active slot, which holds either a buffer source or a media element. Starting either kind stops the other.
- **New method `playLibraryPreviewStream(url, offset, onStreamError)`.**
  - It creates a **bare** `HTMLAudioElement` through an injectable factory: `createLibraryPreviewPlayer(ctx, onEnded, { createAudioElement })`, default `() => new Audio()`.
  - It does not use `createMediaElementSource`. The routing is equivalent, because the buffer preview also goes straight to `ctx.destination` and bypasses master [K9]. A bare element also avoids the CORS silence that 13c-ii's signed URLs would hit.
  - After `element.src = url`, it returns if the slot is no longer this preview.
- **Seek while the same URL streams:** set `currentTime` on the same element. No new element and no reload.
- **Stop:** remove the listeners, then `pause()`, `removeAttribute('src')`, `load()`. The media resource is released (`networkState` 0).
- **`getLibraryPreviewOffset`** on a stream returns `element.currentTime`.
- **`ended`:** only when that element is still the active one, stop and then call `onEnded()`.
- **Unmount:** the provider cleanup already calls `previewPlayerRef.current?.stopLibraryPreview()` [K12]. That now silences a streaming element too. A closed `AudioContext` does not stop a media element, so this call is load-bearing.

**Type and demo.**
- `WorkspaceCollection` gains an optional `previewUrl?: (source: WorkspaceSource) => string | null` [K10]. It is a function on the collection, not a field on the source, so 13c-ii can mint a fresh signed URL per call (tech-lead).
- `studioLabDemoCollection.previewUrl` returns `demoUrls[source.id]` for its two MP3 ids and `null` for every other id [K11].

**Deliberately unchanged:**
- `ensureDecoded`'s body, the cache, the collection effect, `decideDecodeSettle`, `prepareExportSources` and the Play warning;
- the purchased adapter (`app/lib/arrangement/collection.ts`) [K26];
- `ArrangementLibraryPreview.tsx`. The UI reads its duration from `sourceStates` [K14], so it needs no element duration.

**The stem cache is not warmed by a streamed preview** (SIG-R393-PREVIEW-NO-CACHE-WARM).
- In `/studio-lab`, both MP3s are fetched through the stem cache at load, because they are decoded for peaks. A later Add therefore decodes from that cache, with no second download.
- The purchased case is ruled in 13c-ii.

### Sketch review rulings (`b-round-392/sketch-review.md`)
- **REV-B393-M1-STALL (Medium) → 13c-ii.** A stalled stream (`stalled` or `waiting`, with no `error`) keeps `Stop` with a frozen cursor.
  - 13c-i streams only same-origin static demo files.
  - The decode path is equally exposed to a hung fetch today.
  - 13c-ii gets the stall watchdog row, an error-name filter (`NotAllowedError`), and a synchronous-throw guard.
- **Other reviewer Lows:** see `sketch-review.md`, and `deferred_low_polish` where listed. **No unruled Medium remains.**

### D-29z1337: architecture (ARCH-CHECKPOINT-DECODE-REGION is still unanswered)
- **B rules keep.** The A-392 reviewer, the gate-392 reviewer and the tech-lead consult all agree.
- This round puts the new media code in `preview.client.ts`. `ArrangementContext.tsx` changes only by the stream branch, the fallback ref and its callback, plus the optional `ensurePreviewPlayer`.
- No other provider refactor, no new context field, and no change to `useArrangement()`'s shape.
- Moving `decideDecodeSettle` to `lib/arrangement` is a candidate after PERF-13c closes, with root approval.

### Side effects of the call this path replaces (L49)
The stream path is taken instead of the decode branch. Each of that branch's first effects is ruled here:

| Effect | Ruling |
|---|---|
| `stopLibraryPreview()` | **Replaced.** `playLibraryPreviewStream` stops the active slot itself, as `playLibraryPreview` does today. The stream path then sets the new id |
| owner read, and `sourceNotLoaded` on a null owner | **Not needed.** No decode starts. A stale call needs a collection change; the unmount cleanup stops the stream, and a replacing call replaces it |
| `previewRequestRef = id`, and the preview pin | **Dropped with reason:** there is no decode to supersede and no buffer to pin. The path sets `previewRequestRef = null` and calls `releasePreviewPin()` instead (PS6, PS9) |
| the loading text and the settle `.then` | **Dropped with reason:** no decode. The fallback re-enters the decode path, which keeps them (PS8, C row S9) |

### Ruling lines (L4)
- **Status line on a streamed Preview:** D-29z1341's "no status write" wins over the round-391 `sourceDecoding` text. That text applies to the decode path only.
- **The preview pin on a streamed Preview:** `releasePreviewPin()` (none held) wins over round 382's "preview pins its source".
- **A cached buffer:** the buffer path wins over the stream path.
- **Stop:** releasing the element (`src` removed, `networkState` 0) wins over "keep the element ready for a fast restart".

**Status writes this round can collide with (L51).**
- The stream path writes none.
- The fallback writes `Loading “X”…`, `“X” is ready.` and `sourceFailed`, through the unchanged round-392 code.
- Those can meet the collection's `Demo collection ready…`, the add text, the Undo/Redo texts and `playingFrom`.
- **Lifetime:** the fallback's texts follow the round-392 rule (a conditional swap). A stream that ends naturally writes nothing, and the toggle returns to `Preview`.

## 2. Reference
- **This is a performance stage.** It adds no new user-visible behaviour, so it needs no `product-designer` consult and no full reference section (perf rounds are exempt by policy).
- **Alignment:** Live's browser preview plays files from disk without loading them into the Set first (Live 12 manual ch. 5, "Managing Files and Sets", browser preview). 13c moves CZABA the same way. This is "consistent in direction", not "identical".
- **The preview gestures are unchanged-behaviour rows:** the toggle, waveform click-to-seek, the keyboard step, the end of file, and Play stopping the preview.
- **Screen budget (L39):** nothing new is permanently visible. The status line writes less, not more.

## 3. What A changes
1. **`app/types/arrangement.ts`:** the optional `previewUrl`.
2. **`app/data/studio-lab-demo.ts`:** `previewUrl` from `demoUrls`, `null` otherwise. Nothing else changes (titles, `loadSource`, `canReloadSource`) [K11].
3. **`app/lib/arrangement/preview.client.ts`:** `playLibraryPreviewStream`, the injectable `createAudioElement`, and one active slot. `playLibraryPreview` keeps its behaviour.
4. **`app/contexts/ArrangementContext.tsx`:**
   - the stream branch at the top of `startLibraryPreview`;
   - the fallback ref;
   - the optional `ensurePreviewPlayer`.
   `collection.previewUrl` is read through `collection`, which is already in the dependency array. Nothing else changes.
5. **Tests:** §5.
6. **`docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`** (new; 252 is the next free number [K18]).
   - It is in Georgian and follows `docs/implementation/TEMPLATE.md`.
   - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 393 PASS)` (L28, multi-stage; stage 2 is PERF-13c-ii).
   - It cites only rows that exist (L26) and records the premise numbers with their file.

**B's sketch.**
- The file is `b-round-392/sketch-393.patch.txt`, sha256 `8de762db…`, as reviewed in `b-round-392/sketch-review.md`.
- It passes typecheck, scoped Biome, the covering set, the full suite (on the first sha, with the overlap caveat in §5) and the browser probe.
- A may follow it, but must re-type the tests **without type assertions** (project rule: no `as`, `any` or `@ts-ignore`). For example, a fake element can be a real `document.createElement('audio')` with `vi.spyOn` on `play`, `pause` and `load`, plus `Object.defineProperty` for `currentTime` where jsdom needs it.
- A deviation from §1's semantics is a STOP (L11).

**Forbidden:**
- every path outside the grants, in particular:
  - `ArrangementLibraryPreview.tsx`;
  - `collection.ts` (13c-ii);
  - `graph.client.ts`;
  - `decoded-buffer-cache*`;
  - `decoded-buffer-eviction-ui.test.tsx` (it stays green and unchanged);
  - `perf/**` (13c-ii);
  - `strings.ts`;
- the global forbidden files and actions, the protected files and `package.json`;
- commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-392/grants-393.txt`)
- `app/contexts/ArrangementContext.tsx`
- `app/lib/arrangement/preview.client.ts`
- `app/types/arrangement.ts`
- `app/data/studio-lab-demo.ts`
- `app/data/__tests__/studio-lab-demo.test.ts`
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx` (new)
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md` (new)

## 5. A: tests
Row ids are binding. Each row names the mutant that must turn it red. Rows go in `library-preview-stream.test.tsx` unless the row names another file.
- A runs each mutant on a scratch copy outside `store/` and saves the logs in `a-round-393/mutants/`.
- B's sketch logs are in `b-round-392/mutants/`: `summary.txt` shows 7/7 red and a pristine rc 0, on sha `8de762db…`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **PS1** player | `playLibraryPreviewStream(url, 12)`; set the element time to 13.5; stop | Before the change: `src` = url, `currentTime` 12, `play` called once. Offset reads 13.5. After stop: `pause` once, no `src` attribute, `load` once, offset `null` | MU-393-STOP-KEEPS-SRC |
| **PS2** player | Stream url at 0, then the same url at 40 | One element; `currentTime` 40; `pause` 0 | MU-393-SEEK-NEW-ELEMENT |
| **PS3** player | `ended` on the active element; then a new stream, stop, and `ended` on the old element | `onEnded` exactly once in total; offset `null` after the first `ended` | MU-393-ENDED-UNGUARDED (identity check and detach both removed) |
| **PS4** player | `error` at time 5. Then a second player whose `play()` rejects with `AbortError` after stop | `onStreamError(5)` is called and the element is paused; the second `onStreamError` is never called | MU-393-ERROR-AFTER-STOP |
| **PS5** player | Stream, then `playLibraryPreview(buffer, 0)` | The stream element is paused and released; one buffer source started | MU-393-BUFFER-KEEPS-STREAM (`stopActive` removed from `playLibraryPreview`) |
| **PS6** provider | Evicted URL source (the collection has `previewUrl`); `startLibraryPreview('big', 0)` | `loadSource` count unchanged; no decode in flight; the recorded status sequence never contains `sourceDecoding(BIG_TITLE)`; `libraryPreviewSourceId` = `big`; the cache has no `big`; no `['preview',['big']]` pin call; Stop → id `null` | MU-393-STREAM-NEVER |
| **PS7** provider | Add `big` (decoded and cached), then preview `big` | No media element created; a buffer source starts | MU-393-STREAM-OVER-CACHE (the `!decodedBuffers.has` condition dropped from the stream choice) |
| **PS8** provider | Preview `big` (stream), then element `error`; after the decode, Stop and preview `big` again | Status `sourceDecoding(BIG_TITLE)`, then after the decode `sourceReady(BIG_TITLE)`; preview = `big` (buffer). On the second preview: no second element, and the decode path (`sourceDecoding`) | MU-393-NO-FALLBACK, MU-393-FALLBACK-NOT-REMEMBERED |
| **PS9** provider | Stream `big` with a placed clip (so Play has audio), then `togglePlayback()` | The element is paused, with no `src`; `libraryPreviewSourceId` `null`; the transport is playing | MU-393-STOP-IGNORES-STREAM (`stopActive` returns early for a stream) |
| **PS10** provider | Stream `big`, then unmount the provider | The element is paused and released after unmount | MU-393-UNMOUNT-NO-STOP (the unmount cleanup's `stopLibraryPreview()` call removed) |
| **PS11** provider | Transport playing, then preview `big` | The transport has stopped (`isPlaying` false) before the element plays; the element plays | MU-393-STREAM-KEEPS-TRANSPORT |
| **PS12** provider | Stream `big`, then `ended` | `libraryPreviewSourceId` `null`; a `setPinned('preview', [])` call after the end | MU-393-ENDED-NO-CALLBACK |
| **PS13** provider | Stream `big` at offset 0; set the element time to 30; `error` | After the fallback decode settles, the buffer source starts at offset 30 (the `start` offset argument) | MU-393-FALLBACK-FROM-ZERO |
| **PS14** provider | Note the status; preview `big` (stream); flush | The status is exactly the same text (no write) | MU-393-LOADING-ON-STREAM (the stream path writes `sourceDecoding`) |
| **PS15** `studio-lab-demo.test.ts` | `studioLabDemoCollection.previewUrl` for every source | `demo-middle-east` → `/middle-east.mp3`; `demo-hero-music` → `/videos/hero/hero-music.mp3`; every other id → `null` | MU-393-DEMO-URL-ALL |

**Collision rows (L23).**
- **Covering set:** the 6 preview-API test files [K15], the 7 demo-collection test users [K16], and the new file.
- **On B's final sketch** that set is green with no change: `b-round-392/precheck-covering.log`, 14 files, 238 tests, rc 0.
- **Full suite on the sketch:** `b-round-392/precheck-full.log`, 257 files, 3801 tests, rc 0, run on the first sha (`05c7e9d3…`).
  - B's mutant runs overlapped that run on the same scratch copy. The covering run on the final sha did not overlap, so it is the clean evidence for the touched area.
  - The delta between the two shas is 4 lines of ordering (`sketch-review.md`).
- **A keeps the eviction file unchanged and green.**

**A also runs:**
- `npm run typecheck` and `npm run lint`;
- scoped `npx biome check` on the 5 changed code and test paths;
- `npx vitest run` on the covering set;
- the claims script, at the start and at the end;
- the `code-reviewer` (3+ files changed). A reviewer Medium whose fix falls outside §1 is a STOP (L11).

A does not run the full suite or `verify`; the gate does.

**A's report, `a-round-393.md`:**
- the changed files;
- each command, with its rc and a log path under `a-round-393/`;
- each mutant's red log;
- any deviation from the sketch;
- the reviewer's notes. Architecture notes go to B as signals.

## 6. C: browser rows
Run at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, with a fresh context per row.

**Probe setup.**
- Copy `b-round-392/premise/sketch-browser.mjs` (and `c-round-382/lib.mjs`'s `open`) into `c-round-393/`. The sketch run used port 5174; C uses 5173.
- **Hooks**, installed after ready:
  - count `decodeAudioData` calls;
  - `HTMLMediaElement.prototype.play` records each element;
  - `AudioBufferSourceNode.start` → `__starts` (from `lib.mjs`);
  - a status `MutationObserver`. Install it via `addInitScript` if the first-load text is needed (INFO-C392-FIRSTLOAD-OBSERVER).
- **Locate the library toggle by `data-testid="arrangement-library-preview-toggle"`** [K23]. The transport's own Stop button matches a name-based locator.
- Warm up the dev server in a browser before any timed row (L38).

| Row | Steps | PASS when |
|---|---|---|
| **S1 STREAM** | Select Middle East; click the toggle; wait until the played element's `currentTime` > 0.5 (≤ 15 s) | The element's `src` = `/middle-east.mp3` and `paused` is false; 0 `decodeAudioData` calls since the click; 0 buffer-source starts; the live PCM durations after GC×2 equal those before the click; the status sequence since the click never contains `Loading “Middle East — public preview”…`; the toggle reads `Stop`. Record the time to the first `currentTime > 0` |
| **S2 STOP** | After S1, click the toggle | The element is `paused`, has no `src` attribute, and has `networkState` 0; the toggle reads `Preview` |
| **S3 HERO** | S1 for `CZABA hero — public preview` | As S1, with `/videos/hero/hero-music.mp3` |
| **S4 SEEK** | During S1, click the preview waveform (`data-testid="arrangement-library-preview-wave"` [K23]) at 50 % of its width | **Assert:** still exactly 1 played element (the same object), still playing, and its `currentTime` jumped forward. **Record — not run on sketch (B's probe did not seek):** the exact `currentTime` after the click (101.35 s source; MP3 seek is approximate) and the wave's `aria-valuenow` |
| **S5 END** | Click the waveform at 98 %; Preview; wait for `ended` (give up after 30 s) | **Assert:** the Middle East element fires `ended`; the toggle returns to `Preview`; there is no second play; the end leaves the status text unchanged. **Record — not run on sketch:** the time from the click to `ended` |
| **S6 PLAY-STOPS-PREVIEW** | Add Full mix (Enter); preview Middle East (streaming); press Space | `data-playing` true; the Middle East element is paused with no `src`; the toggle reads `Preview` |
| **S7 PREVIEW-STOPS-TRANSPORT** | Add Full mix; Space (playing); then preview Middle East | `data-playing` false (pre-existing contract); the Middle East element plays (`currentTime` > 0.5) |
| **S8 UNMOUNT** | Stream Middle East; click `data-testid="arrangement-exit"` [K23] (client navigation to `/`) | After navigation, the element recorded **before** the click (`src` was `/middle-east.mp3`) is `paused` with no `src`, and 1 s later its `currentTime` has not advanced. Ignore elements recorded after navigation (the home page's hero plays `hero-music.mp3` itself) |
| **S9 FALLBACK** | `page.route('**/middle-east.mp3')`, aborting only `resourceType() === 'media'`; select Middle East; Preview; then Stop and Preview again | First Preview: the status sequence is `Loading “Middle East — public preview”…` → `“Middle East — public preview” is ready.`; one `decodeAudioData` of 101.35 s; one buffer start of 101.35 s; the toggle reads `Stop`. Second Preview: no new element plays (the fallback is remembered) |
| **S10 SYNTH** | Preview Full mix | One buffer start of 16 s; 0 media elements played; 0 decodes |
| **S11 SUPERSEDE-FALLBACK** (round-392 B7 through the fallback; the recipe reaches the decode branch, L29) | The S9 route plus `__delayDecodes = 1` (the round-392 probe helper); Preview Middle East; while it decodes, select Full mix and Preview | The sequence contains `Loading “Middle East — public preview”…` and then `“Middle East — public preview” is ready.`; the line does not end on the loading text; Full mix (16 s) is the started preview; 0 `pageerror` |
| **PERF-RES** | `perf/studio-lab-resources.perf.spec.ts`, run alone (L38) | `res.mem.pcm-live-mib-ready` ≤ 60 and `pcm-live-decode-mib-ready` ≤ 0, as asserted [K26]. Copy the results to `c-round-393/perf-results/` |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<any premium handle>` shows sign-in with no workspace; `/api/studio-token` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | The claims script at start and end; `git status`; `sha256sum -c` on `b-round-392/r393-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | Start = the planning output. End: only granted paths changed (two of them new); K4 0 failures; K3 11; only the §7 facts differ |
| **DOC-252** | Read the doc | Georgian; the TEMPLATE headings in order (L26); l.4 per L28, as in §3; every cited row id exists in the test files; the premise numbers cite `b-round-392/premise/premise-head.json` |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

**Neighbours** (one short check each, at 1440 only):
- **Add after a streamed preview:** Add Middle East. The clip waveform appears, with one decode of 101.35 s, as before.
- **Keyboard step:** ArrowRight on the focused preview wave while streaming moves `currentTime` by the existing step.
- **First load** reaches `Demo collection ready.`

**Ableton:** report "consistent in direction (Live previews from disk); no claim of identical behaviour", with the status `not applicable / perf`.

**All L57 fields go in `c-round-393.json`:**
- `manifestPaths` = `b-round-392/r393-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
- `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified` and `mutantsRecorded`;
- `mutantRedOnSketch` = `b-round-392/mutants/summary.txt`;
- `mutantRedOnTree`: A's logs, if C re-runs any;
- `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-392/precheck-full.log`, `precheck-covering.log`) and `chainHeadGateRunGreen`;
- `affectedChecksNamed` and `affectedChecksRunOnSketch` (`b-round-392/sketch-browser.json`);
- `progressFile` and `stopSignal`.

**Before hand-off:**
- Run `tools/l57-check.py`.
- Run the heaviest rows first: PERF-RES, S8, S9, S11.
- Write `c-round-393/progress.json` after each row (L59).

## 7. Claims that may change during the round
- **K2:** 0 → 2–7 status lines (at most 5 modified and 2 new).
- **K8:** `stream-call` 0 → 1; `fallback-ref` 0 → ≥ 2; `player-create` 1 → 1 or 2 (it changes only through the optional `ensurePreviewPlayer`).
- **K9:** `stream-api` 0 → ≥ 2; `audio-element` 0 → 1. `buffer-api` and `to-destination` stay 1.
- **K10:** `previewUrl` 0 → 1.
- **K11:** `previewUrl` 0 → 1. The URL count stays 2.
- **K17:** may grow by the new test file.
- **K18:** `doc252` 0 → 1; last 251 → 252.

Every other fact must equal the planning output. K20 and K21 cover B's artifacts.

## 8. Out of scope (recorded, not dropped)
- **PERF-13c-ii:**
  - the purchased adapter's `previewUrl` (a fresh signed URL per call; its browser half is BLOCKED "backend unavailable in cloud");
  - REV-B393-M1-STALL (the stall watchdog), the `NotAllowedError` filter and the synchronous-throw guard;
  - the perf harness preview row (`res.mem.pcm-live-preview-delta-mib` and the decode count, asserted from B's sketch run, L58);
  - the stem-cache warm ruling.
- **A-R392-REVIEW-M1** (a collection swap with an old clip gives a false `is ready`), and sketch-review #5 (a collection change does not stop a stream). Both are Low and unreachable today: there is one provider mount with a constant collection [K25]. They are named rows of SRW-21-PLAN (D-29z1338).
- **The settle-helper extraction** (ARCH-CAND-SETTLE-HELPER-EXTRACT): a candidate after PERF-13c, with root approval.
- **Unchanged:** Q-PREVIEW-STOPS-TRANSPORT, the "Offline" mark (Saba Q1), retrying a failed source.
- **Next:** PERF-13c-ii → PERF-13d → PERF-14 → PERF-15. The regression round is due at the first planning on or after 2026-11-10. The RETRO is at round 400.
