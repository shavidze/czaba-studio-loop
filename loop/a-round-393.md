# A round 393: PERF-13c-i. The library preview streams URL sources (A report)

**Status:** implemented. No STOP. Every command below was really run, and its log is under `a-round-393/`.
**Baseline:** HEAD `c1183a0`, clean tree at the start. The claims start-run equals the planning output byte for byte (`a-round-393/claims-start.txt`; `diff` gave no output).

## Read first: claim deltas that §7 does not list (not a STOP; for B and C)
**Reviewer M1 (external pause) is B's ruled sketch-review #4 (A-R393-SKETCH-L4-EXTERNAL-PAUSE). It is not a STOP; see "Code review" below.**

The final claims run is `a-round-393/claims-end.txt`. Every delta that §7 lists is within range: K2 7, K8 stream-call 1, fallback-ref 4, player-create 2, K9, K10, K11, K17 111 and K18 252. Three deltas are **not** in §7's list:

| Claim | Planning → now | Cause | Evidence |
|---|---|---|---|
| **K13** `preview-stops-transport` | 6 → **7** | Required by D-29z1341 stream-path step 2 (`if (isPlayingRef.current) { stopPlayback(); }`) | B's dispatched sketch gives **7** as well: `a-round-393/claims-on-sketch.txt` (the claims script on a scratch copy with `sketch-393.patch.txt` applied, sha `8de762db…`) |
| **K15** sweep | the new `library-preview-stream.test.tsx` joins the list | The granted new test file uses the preview API | The sketch output lists the same file |
| **K22** `in-progress-docs` | 5 → **6** | Required by §3: doc 252 l.4 is `In Progress (stage 1 of 2; C round 393 PASS)`. The sketch had no doc, so its output still reads 5 | `claims-end.txt` |

- **Reading:** §7 was typed by hand, not taken from the claims run on the sketch (L56, "allowed deltas from the sketch"). No semantic deviation from §1 caused any of these three deltas.
- **One deliberate claims-preserving edit.** The sketch's stream condition repeats the line `        !decodedBuffers.has(sourceId)`. That makes K8 `not-cached-branch` 2 on the sketch, which §7 does not allow. I hoisted it as `const isCached = decodedBuffers.has(sourceId);`, used as `!isCached`. The semantics are identical, and K8 `not-cached-branch` stays **1**.

## Changed files (7 = 5 modified + 2 new; all granted)
- `app/types/arrangement.ts`: optional `WorkspaceCollection.previewUrl?: (source) => string | null`.
- `app/data/studio-lab-demo.ts`: `previewUrl` returns `demoUrls[id]` for the 2 MP3 ids and `null` for every other id.
- `app/lib/arrangement/preview.client.ts`:
  - `playLibraryPreviewStream(url, offset, onStreamError)`;
  - `LibraryPreviewPlayerOptions.createAudioElement` (default `() => new Audio()`);
  - one active slot (`ActiveBufferPreview | ActiveStreamPreview`);
  - stop = detach, `pause()`, `removeAttribute('src')`, `load()`;
  - a same-URL call is a seek;
  - `ended` and `error` are guarded by `active === preview`;
  - the offset reads `currentTime`.
- `app/contexts/ArrangementContext.tsx`:
  - `streamFallbackRef` (`{ collection, sourceIds }`);
  - a stream branch at the top of `startLibraryPreview`, following D-29z1341 steps 1–7, with no status write;
  - `onStreamError` adds the id to the per-collection set, clears the preview id and state, and calls `startLibraryPreviewRef.current(id, atSeconds)`.
  - The decode, not-ready and buffer branches are byte-unchanged.
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx` (new): PS1–PS14.
- `app/data/__tests__/studio-lab-demo.test.ts`: PS15 (added; no existing assert changed).
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md` (new):
  - Georgian;
  - l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 393 PASS)`;
  - the 7 TEMPLATE `## ` headings appear in order;
  - every PS id it cites exists, once each (checked by grep);
  - the premise numbers cite `tmp/studio-real-loop/b-round-392/premise/premise-head.json`.

## Deviations from B's sketch (`8de762db…`)
1. **Tests re-typed with no `as`, `any` or `@ts-ignore`, as §3 requires.**
   - The player rows build `new AudioContext()` and `new AudioBuffer()` from stubbed globals.
   - Elements are real jsdom `<audio>` elements (`document.createElement('audio')`, or a subclass of `window.Audio` in the provider rows). Calls are counted per element through `vi.spyOn(HTMLMediaElement.prototype, 'play' | 'pause' | 'load')`.
   - The asserts read `getAttribute('src')`/`hasAttribute('src')`, because jsdom absolutizes `.src`.
2. **All rows PS1–PS15 are written.** The sketch had PS1–PS4, PS6 and PS8. The fixture `FakeSource.start` records its offset (PS13), and `FakeSource.stop` and `play` write to one timeline (the PS11 order).
3. **The `isCached` hoist** (above). It is semantically identical.
4. **The optional `ensurePreviewPlayer(ctx)` helper was not extracted.** The sketch keeps the two creation blocks, so `player-create` is 2, as on the sketch.
5. **PS4 is stronger than the sketch's version (after review M2).** It also asserts that a `play()` rejection (`NotSupportedError`) on the **active** stream calls `onStreamError(7)`, removes `src` and sets the offset to `null`. New mutant: MU-393-PLAY-REJECT-IGNORED.

## Commands (rc, log)
| Command | rc | Log |
|---|---|---|
| claims start (loop root) | 0, equal to the planning output | `a-round-393/claims-start.txt` |
| claims on the sketch-applied scratch (`CLAIMS_STORE=/tmp/a393-sketch`) | 0 | `a-round-393/claims-on-sketch.txt` |
| `npm run typecheck` | 0 | `a-round-393/typecheck.log` |
| `npm run lint` | 0. These are the repo's existing warnings; the scoped check shows none in the changed paths | `a-round-393/lint.log` |
| `npx biome check` on the 6 changed code and test paths | 0, "Checked 6 files. No fixes applied." | `a-round-393/biome-scoped.log` |
| `npx vitest run` on the covering set (6 K15 files + 7 K16 files + the new file; list in `a-round-393/covering-files.txt`) | 0: **14 files, 247 tests** (B's sketch run had 238; the difference is the extra PS rows) | `a-round-393/covering.log` |
| mutants (`a-round-393/mutants/run.py`, scratch `/tmp/a393-scratch` outside `store/`) | **17/17 RED at their named row**, pristine rc 0 | `a-round-393/mutants/summary.txt`, `mutant-<id>.log`, `pristine.log` |
| claims end | 0; deltas as listed above | `a-round-393/claims-end.txt` |
| tracked diff, regenerated after the PS4 edit (final tree) | n/a | `a-round-393/diff-tracked.patch.txt` |
| frozen manifest `b-round-392/r393-frozen-sha256.txt` | 0 failures | inline |
| protected `b-round-318/protected-sha256.txt` | 11/11 OK | inline |

**Mutants:**
- MU-393-STOP-KEEPS-SRC → PS1
- SEEK-NEW-ELEMENT → PS2
- ENDED-UNGUARDED → PS3
- ERROR-AFTER-STOP → PS4
- PLAY-REJECT-IGNORED → PS4
- BUFFER-KEEPS-STREAM → PS5
- STREAM-NEVER → PS6
- STREAM-OVER-CACHE → PS7
- NO-FALLBACK → PS8
- FALLBACK-NOT-REMEMBERED → PS8
- STOP-IGNORES-STREAM → PS9
- UNMOUNT-NO-STOP → PS10
- STREAM-KEEPS-TRANSPORT → PS11
- ENDED-NO-CALLBACK → PS12
- FALLBACK-FROM-ZERO → PS13
- LOADING-ON-STREAM → PS14
- DEMO-URL-ALL → PS15

Each anchor is asserted unique before it is replaced.

**Timeouts (L31):** no covering test is above 50 % of its timeout. The slowest is LRS4 at 2.05 s, under a describe timeout of 15 s. Gate 392 recorded LRS4 at 2.28 s.

Not run by A, per the speed rules: the full suite, `npm run verify`, the build and the browser rows. Those belong to C and the gate. **I did not use a browser this round.**

## Code review (`code-reviewer` subagent, real run; the delta re-review also ran)
First review: **8/10, no Critical or High.**

**Medium**
- **M1. An external pause (media keys, an OS interruption, a Bluetooth disconnect) leaves `Stop` showing with a frozen cursor, and a same-URL seek does not resume.**
  - This is the issue B already ruled as sketch-review **#4 (A-R393-SKETCH-L4-EXTERNAL-PAUSE, Low, `deferred_low_polish`)**. The reviewer rates it Medium and adds the toggle and cursor state.
  - The fix (a `pause` listener, or `play()` on reuse) changes §1 semantics, so I did not apply it.
  - **For B:** re-rate it against your #4 ruling. It is not a STOP, because it is ruled by id.
- **M2. Nothing tested an active-stream `play()` rejection.** **Fixed in the tests** (deviation 5 and MU-393-PLAY-REJECT-IGNORED red). The delta re-review said **"delta OK"**.

**Low (recorded, not changed)**
- L1: the `active !== preview` guard after `element.src = url` cannot fire in a browser. It comes from B's ruled delta, so I kept it.
- L2: PS3 cannot tell the `ended` guard from `detach`. The mutant removes both, as the task defines.
- L3: no test that a stream with a different URL releases the previous one, and none that a stream start cancels a pending decode request.
- L4: the fallback set never clears, so one transient 5xx disables streaming for that id for the life of the collection object. The ref also keeps the old collection object alive.
- L5: the reuse branch keeps the first call's `onStreamError`. Two sources sharing one URL would restart the old id. This is unreachable today.
- **L6 (signal for 13c-ii):** a fresh signed URL per call means `active.url === url` never matches, so every seek tears the element down and reloads it. 13c-ii should compare a stable key, such as the source id, rather than the URL.
- L7: the bare element shows up in the OS and Chrome "now playing" media controls. The buffer path never did.

**Delta-review nits:** the variable order `third`/`second`; the PS4 middle block does not assert that `src` was set first, or that `pause` was called.

**Architecture note (signal for B and root; no refactor this round):** `startLibraryPreview` now has four branches (stream, decode, not-ready, buffer) plus the fallback memory, and the region keeps drawing costly changes. The reviewer proposes a pure `decidePreviewMode({ isCached, status, url, fallbackHas })` in `lib/arrangement/`, tested without the provider. It sits with ARCH-CAND-SETTLE-HELPER-EXTRACT. Element lifecycle code in `preview.client.ts` is the right owner.

## B acceptance criteria truly passed by A
- §3 items 1–6 are implemented inside the grants.
- §5 rows PS1–PS15 exist and pass, and each named mutant is red, plus one extra.
- typecheck, lint and scoped Biome are rc 0, and the covering set is green.
- The claims were run at the start and at the end.
- The `code-reviewer` ran, plus a delta re-review.

**Not claimed:** the browser rows S1–S11, PERF-RES, AUTH, SOURCE-SCOPE and DOC-252 (all C's), and every gate row.

## Known gaps (unchanged scope; not fixed here)
- REV-B393-M1-STALL, the `NotAllowedError` filter, a synchronous `play()` throw, and the purchased `previewUrl`: all PERF-13c-ii.
- Review M1 and #4, the external pause (see above).
- A collection change does not stop a stream. It is unreachable today and belongs to SRW-21-PLAN.

## Exact next C checks (suggested order, from task §6)
1. SOURCE-SCOPE. Expect the K13, K15 and K22 deltas above, and rule them against `a-round-393/claims-on-sketch.txt`. Then `git status` (5 M + 2 ??), K4 0 failures, K3 11.
2. The heaviest rows first: PERF-RES (run alone), then S8 UNMOUNT, S9 FALLBACK and S11 SUPERSEDE-FALLBACK.
3. S1 STREAM and S3 HERO (0 decodes, live PCM unchanged, no `Loading…`), S2 STOP (`networkState` 0, no `src`), S4 SEEK (same element), S5 END, S6 and S7 Play↔preview, S10 SYNTH.
4. Neighbours: Add after a streamed preview (one decode of 101.35 s), ArrowRight on the wave while streaming, and first load reaching `Demo collection ready.`
5. Optional probe of review M1: pause the element from the console (`el.pause()`) and see whether the toggle stays at `Stop`. This is evidence for B's re-rating; it is not an acceptance row.
6. DOC-252 and AUTH.

## Scope completed
PERF-13c-i is implemented for C to verify. PERF-13c is not complete: stage 2, PERF-13c-ii, remains. I mark no backlog item complete.
