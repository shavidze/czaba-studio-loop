STOP — needs B ruling on §2.4 "Collection reset" vs §1 "video audio … decoded once, never evicted" (code-reviewer M2).
Measurement: `resetDecodedBuffers` (collection effect cleanup in `app/contexts/ArrangementContext.tsx`) calls `decodedBuffers.clear()` as §2.4 requires. That also removes video-audio entries set with `evictable: false`; the video source stays `audio: 'ready'`, and its clips would schedule/export as silence after a collection change. At HEAD the old `buffersRef` Map kept them. Unreachable in production today (`studioLabDemoCollection` is a module constant at `app/routes/studio-lab.tsx` l.115; `createPurchasedWorkspaceCollection` has 0 route callers); reachable in tests (EV7) and on any future collection swap.
Options: (a) keep `clear()` and amend §1 to exclude a collection change; (b) delete only `collection.sources` ids + clear the in-flight map + `setPinned('preview'|'export', [])`, and reword §2.4/EV7. Also rule whether "clears all pins it owns" means the preview/export pins: the reset currently clears no pins (clips pins are recomputed from history; preview/export pins are not touched).
The tree is left as written to §2.4 (all tests green). Nothing else in this round depends on the ruling. Sequence note: the edits made after this STOP was written (code-review M1 preview fix, the two type-assertion fixes, the EV3/EV5/EV9 rows and their mutants, doc 248 wording) are in-grant review fixes and do not touch the disputed reset clause.

# A round 382 — PERF-13b-i: decoded audio cache, eviction, pins, re-decode (A report)

**Status:** implementation complete inside the grants; one STOP item above for B (spec conflict, reviewer M2). No browser, perf or full-suite run by A (speed rules). `realVerified=false` for every browser/perf row — those are C's.

## Changed files (all in `b-round-381/grants-382.txt`; 0 fixture-grant files changed)
- `app/lib/arrangement/decoded-buffer-cache.ts` (new): `estimateBufferBytes`, `createDecodedBufferCache<B>` (`get/has/set/delete/clear/setPinned/isPinned/totalBytes/evictableUnpinnedBytes/evict/asReadonlyMap`), `UNPINNED_DECODED_BUDGET_BYTES = 32 MiB`, `DecodedBufferPinOwner`. `isPinned` is an extra read-only helper (used by DC7).
- `app/types/arrangement.ts`: `WorkspaceCollection.canReloadSource?`.
- `app/data/studio-lab-demo.ts`: `canReloadSource: (source) => Object.hasOwn(demoUrls, source.id)`.
- `app/contexts/ArrangementContext.tsx`: `buffersRef` renamed to `decodedBuffers` (lazy `useState` cache; initial `clips` pins from the initial history); pins in `updateHistory` (skipped when `clips` keeps identity); `ensureDecoded` (dedupe map, controller captured at call time, abort check before `set`, `evict()` after `set`, resync when a clip uses it, failure → `error` with the existing text); Play refusal in `startPlaybackAt` (the only site that sets `isPlaying`); preview decode branch (stops preview, resumes the AudioContext and stops playback inside the gesture, pins, plays only if still the requested source); export pins + awaited re-decode (owner = controller, a replaced export does not release the new export's pins; release in `finally` and right after render); video audio `evictable: false`; collection cleanup aborts, clears the in-flight map and `clear()`s the cache.
- `perf/lib/pcm-live.ts` + `pcm-live.test.ts`: bound `pcm live count N outside [P, M]`; shape-classified probes (kept 1 frame, dropped 2 frames, decode 480 frames mono); decode-liveness guard (in-page 44-byte-header + 480-frame 16-bit WAV, OfflineAudioContext at 48,000 Hz) and dropped-probe guard; `PcmLiveBounds`, `PcmProbeShapes`, `classifyPcmProbe` exported.
- `perf/studio-lab-resources.perf.spec.ts`: registry installed in the record pass only (GATE381-L1); bounds P = audio clips on the page, M = library `Sounds` options; new 1× step `pcm after Add` (poll `__czabaPcm.read(null)` 15 s for a non-probe decode entry, problem string on timeout, then GC ×2 read) → `res.mem.pcm-live-mib-after-add`, `res.mem.pcm-live-count-after-add`.
- `perf/budgets.resources.json`: two new `record` rows (owner PERF-13b, notes say "record — not run on sketch"); notes of the four `res.mem.pcm-live-*` rows updated (ready 31.9 / 7 / 0; after-export delta now ≈ +37.1 expected because the placed clip pins middle-east). No row turned `assert`.
- `docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md` (new): l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 382 PASS)`; TEMPLATE headings in order (checked).

## Claims line shifts (for C's CLAIMS row)
- K3/K4/K5: `buffersRef` now has **0 hits** (renamed to `decodedBuffers`). Declaration l.803; set sites l.1433 (re-decode), l.2839 (video, `evictable: false`), l.4292 (load path); `clear()` l.4253; reads: `applySchedule` l.1178, preview `get` l.1742, export `asReadonlyMap()` l.3934 (WAV) and l.4040 (MP3).
- K7: `canReloadSource` now has hits in types, demo, Context and tests.
- K29: `startGraph(` callers now l.1377, 1664 (the only one that begins playback), 1810, 1891, 1911.
- K31 (`ReadonlyMap` params in graph.client.ts) untouched; graph.client.ts not edited.

## Checks actually run (logs under `a-round-382/`)
- `npm run typecheck` rc 0 (`typecheck.log`); `npm run lint` rc 0, 205 pre-existing warnings, none in owned files (`lint.log`); `npx biome check` on the 6 owned `app/**` paths: clean (`perf/**` is not biome-scoped, L30 — covered by typecheck).
- Covering grep `grep -rlE "buffersRef|startLibraryPreview|renderArrangementWav|canReloadSource" app --include=*.test.*` (run before the new test files existed) → 29 hits, list in `covering-hits.txt`. Run set = 29 hits ∪ 10 C-DEMO files (39, `run-files.txt`) + the 2 new files → **41 files, 545 tests, all pass** (`covering-run3.log`). Re-running the grep now adds `decoded-buffer-eviction-ui.test.tsx` (included).
- Perf lib (scratch config `b-round-334/vitest.perf-lib.config.mjs`): 3 files, 54 tests pass (`perf-lib.log`); PL1, PL2, PL3 ×6, PL4, PL5 ×3, PL6, PL7 present.
- New tests: DC1–DC7 (7), EV1–EV9 (14 its: EV3 ×2, EV5 ×3, EV6 ×2, EV9 ×2). EV9, the second EV3/EV6 and the third EV5 its are additions beyond B's table, added after code review so that every behaviour doc 248 states has a row.
- Timeout headroom (L31): slowest single tests in the run: NG5 2.08 s (15 s timeout), master footer row 2.06 s (15 s); none > 50 %.
- `sha256sum -c` protected (b-round-318) rc 0, frozen r382 (b-round-381) rc 0; every status line is a grant path.
- C-DEMO fixture files: none needed edits (all green unchanged).

## Mutants (`a-round-382/mutants/run-mutants-382.sh`, `TREE=<copy> OUT=<abs> MODE=unit|browser|all`)
Unit, run by A on a tar copy (node_modules symlinked), all red on the named row, `restored` printed (`mutants/out/summary.txt`):
MU-EV-NO-EVICT→EV1, MU-EV-NO-DEDUPE→EV2, MU-EV-PLAY-NO-REFUSE→EV3, MU-EV-NO-CLIPS-PIN-RECOMPUTE→EV4, MU-EV-EXPORT-NO-AWAIT→EV5 (waits), MU-EV-EXPORT-PIN-LEAK→EV5 (cancelled), MU-EV-FAIL-SILENT→EV6, MU-EV-EXPORT-FAIL-SILENT→EV6 (export), MU-EV-NO-ABORT-CHECK→EV7, MU-EV-PIN-EVERY-UPDATE→EV8, MU-EV-NO-PLAYING-RESYNC→EV3 (already playing), MU-EV-REPLACED-EXPORT-RELEASES→EV5 (replaced), MU-EV-PREVIEW-NO-STOP-RELEASE→EV9, MU-EV-PREVIEW-NO-SUPERSEDE→EV9 (superseded), MU-13B-BOUND-OFF→PL3, MU-13B-DECODE-PROBE-OFF→PL5.
Browser (for C, `MODE=browser`, alone, builds), expected problem strings in `latest-resources.json`:
- MU-13B-NO-DECODE-WRAP (remove `proto.decodeAudioData = trackedDecode;`) → `pcm registry did not count its decode probe` (the after-Add poll will also report `pcm after Add: no live decoded buffer within 15000 ms`).
- MU-13B-STRONG-REFS (`refs.push({ ref: { deref: () => buffer }, origin })`) → `pcm registry kept a dropped probe`.

## Code review (`code-reviewer` subagent, 8/10, no Critical/High)
- M1 preview decode branch resumed the AudioContext outside the gesture and kept arrangement playback running during the decode → **fixed** (ensureAudioContext + stopPlayback synchronously before the decode).
- M2 `clear()` vs video audio → **STOP above**, not ruled by A.
- Low, fixed: type assertions (`as const` in pcm-live.ts → typed `PcmProbeShapes`; `[] as …` in the test → typed hoisted local); EV5 read `buffers.has` after the fact → now captured at render call time; doc claims without rows → rows added (EV3 playing join, EV5 replaced export, EV9 preview) with mutants.
- Low, recorded as known costs/notes (not changed): `previewArrangement` (envelope/marker drags) makes a new `clips` array per frame, so pins/evict/ensureDecoded loop run per frame (O(clips)); P counts audio clips per §2.6 (§2.5 says "placed clip sources") and the lower bound is nearly always true at /studio-lab (7 synth buffers are never evicted); reads via `asReadonlyMap()` do not refresh LRU order.
- **Architecture note (verbatim, proposal for B/root, not acted on):** "signal: `ArrangementContext.tsx` (new state and lifecycle in an existing owner: the cache, pins, in-flight map, export and preview owners; about 150 lines spread over 8 call sites). For this round, keep: pins are bound to `updateHistory`, `startPlaybackAt` and the export lifecycle, and moving them now would put Undo/Redo pinning and gesture timing at risk. Proposal for the planner: one bounded task, `useDecodedSourceBuffers(collection, historyRef)`, owning the cache, pins, `ensureDecoded` and the reset, with EV1–EV8 as its tests. Do it together with ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING."

## Known gaps / for B
- STOP M2 above (collection-reset semantics; also whether the reset should clear preview/export pins).
- A clip whose source re-decode failed **before** an export (state already `error`) is rendered without that clip, as with any `error` source; only a failure during the export's own wait refuses the export. Play likewise starts without an `error` source's clip (library shows the error). Ruling candidate for 13b-ii.
- Purchased adapter has no `canReloadSource` (unchanged by design).
- Export of middle-east from a fresh load now triggers a ~37 MiB decode inside the export window: neighbour risk §5 (`peak-backing-delta-mib`, `longtask-max.6x`) is unmeasured by A.

## Acceptance actually passed by A
- §2.1–2.10 implemented, except the §2.4 "Collection reset" clause, which is under the STOP above; UNIT rows (DC1–DC7, EV1–EV8 + EV9, PL1–PL7) green; MUTANTS-UNIT all red + restored; typecheck/lint rc 0; protected/frozen sha rc 0; doc l.4 and heading order.
- **Not run by A (C's):** PERF-RES, HARNESS-MUTANTS, EVICT-BROWSER, PLAY-REFUSE-BROWSER, EXPORT-BROWSER, G382-AUTH, CLAIMS script. `realVerified=false` for those.

## Exact next C checks
1. SOURCE-SCOPE + FIXTURE-ONLY (expect 0 fixture files changed).
2. CLAIMS: expect K3–K5 to show 0 `buffersRef` hits (rename) and the lines listed above.
3. UNIT + MUTANTS-UNIT with `run-mutants-382.sh MODE=unit` on a copy.
4. PERF-RES alone (production build): ready ≈ 31.9 MiB / 7 / 0 decode; after-add ≈ 69.0 / 8; after-export delta ≈ +37.1; 22 asserts; export bytes 29,189,420 / 58,378,796.
5. HARNESS-MUTANTS `MODE=browser` alone.
6. EVICT-BROWSER (a)–(d), PLAY-REFUSE-BROWSER (CPU 6× likely needed), EXPORT-BROWSER, G382-AUTH at 1440×900 and 1280×720 on http://127.0.0.1:5173.
7. Preview first click on `/studio-lab` (middle-east is evicted at ready): audio must start once the decode settles, and a running arrangement playback must stop at the click (M1 fix).
