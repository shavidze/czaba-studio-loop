# A round 272: SYS-6 STATUS-LIFETIME stage 1

**Status:** implemented. Not a STOP under §10/L11. One item needs a B ruling and is listed first.
**Baseline:** HEAD `66b570a`, clean tree.
**Commits:** none. Only the 8 granted paths changed.
**Browser:** A ran no browser (`browserVerified: false` for A). The server on :5173 was not touched.

## 0. Needs a B ruling (not a STOP under §10): a strip click from a stopped T text
- **Who found it:** the code-reviewer, rated Medium. A reproduced it in jsdom with a temporary probe file, which is deleted.
- **What happens:** `playFrom` (top strip, or a marker-flag click at `ArrangementMarkerRow.tsx:686/849`) runs `placeInsertMarker` (W), then `seekTo` (W), then `startPlaybackAt`. The W updater runs in the `useReducer` reducer at render time, when `isPlayingRef` is already true. So W rewrites a stopped T text to `insertMarkerWhilePlaying(new t)`.
- **Probe output, verbatim:**
  ```
  STOPPED: Stopped — Space plays from the insert marker at 00:04.000.
  PLAYFROM: true Insert marker at 00:06.000 — playback continues. Stop, then Space plays from here.
  STOPPED2: Stopped — Space plays from the insert marker at 00:06.000.
  SPACE: true Stopped — Space plays from the insert marker at 00:06.000.
  ```
- **At HEAD**, the stale `Stopped — … 00:04.000` stayed while playing from 6.
- **Assessment:** the new text is true, and it follows §3.3 Rule W literally ("while playing → `insertMarkerWhilePlaying`"). The Rule W code is B's sketch. It is a behaviour change against HEAD that partly overlaps B-R272-STOPPED-TEXT-WHILE-PLAYING, which §3.7 assigns to stage 2. §3.7 says the stopped text stays on Space **or a strip click**. That still holds for Space; for a strip click it no longer does.
- **What A did not do:**
  - A did not pin the new strip behaviour in an LT row, because that would be A ruling on unspecified behaviour.
  - A did not "fix" it by reading `isPlaying` at call time, because that would put a stale "Stopped" text on screen during playback.
- **For C:** at both viewports, add a strip click and a marker-flag click from a stopped T text, and record the text. For the strip click, Tempo must be set first.

## 1. Changed files (all granted)
| Path | Change |
|---|---|
| `app/lib/arrangement/playback-start.ts` (new) | `PlaybackStartOrigin`, `PlaybackStartPlan`, `resolvePlaybackStart`, `resolveSpaceStartPoint`, `InsertMarkerStatusKind`, `insertMarkerStatusKind` (B `sketch.diff`, unchanged) |
| `app/contexts/ArrangementContext.tsx` | the import; the `PlaybackStartOrigin` re-export; `startPlaybackAt` now calls the resolver; `togglePlayback` now calls `resolveSpaceStartPoint`; `describeSpaceStart` (interface field, both value objects and deps, plus `describeSpaceStartRef`); Rule W in `writeInsertMarker` |
| `app/components/arrangement/StudioWorkspace.tsx` | the import, and the stop effect's `if` and write (Rule S) |
| `app/lib/arrangement/strings.ts` | `insertMarkerAfterStopFromStart` and `selectionAfterStop`, after `insertMarkerAfterStop` (exact §3.5 text) |
| `app/lib/arrangement/__tests__/strings.test.ts` | additions only: 2 `V02B_FORMATTER_SAMPLES` entries and 2 ST11 expects |
| `app/lib/arrangement/__tests__/playback-start.test.ts` (new) | PB1–PB8 |
| `app/lib/arrangement/__tests__/status-lifetime.test.tsx` (new) | LT1–LT11, in `describe('SYS-6 STATUS-LIFETIME stage 1 …', { timeout: 15_000 })` |
| `docs/implementation/2026/quarter-IV/203-sys-6-status-lifetime-stage-1.md` (new) | l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 272 PASS)`. The 7 TEMPLATE headings appear in order |

**Diff:** `a-round-272/diff-tracked.patch` covers the tracked files from before the reviewer fixes. The source hunks are unchanged since then; only the tests and the doc changed.

## 2. Tests and checks, actually run on the final tree
- **Targeted vitest, the 9 files of §5.3:** 9/9 files and 244/244 tests pass (`a-round-272/targeted-vitest.log`).
  - **File times:** `bars-ruler-ui` 8331 ms (25 tests; gate 271: 7977 ms), `insert-marker-ui` 7460 ms (29 tests; gate 271: 7111 ms).
  - **Slowest single test:** BR2, 1155 ms of 15 s (8 %).
  - **Slowest LT row:** LT1, 562 ms. No test is above 50 % of its timeout.
- **Other checks:**
  - `npm run typecheck`: rc 0.
  - `npm run lint`: rc 0. It shows 205 warnings and 1 info, repository-wide. `biome check` on the 7 owned code files: rc 0, clean.
- **LT4** reaches the real natural-end branch of `tick`: the test captures `requestAnimationFrame` and runs it. The effect-level fallback was not needed.
- **SRC-ONE-PREDICATE**, checked in advance:
  - `grep -n "endedHere\|> end +" app/contexts/ArrangementContext.tsx` finds only l.1177, the existing `tick` overshoot. There is no predicate in `startPlaybackAt`.
  - `resolvePlaybackStart(` is called only at l.1357 (`startPlaybackAt`) and l.1409 (`describeSpaceStart`).
- **Mutants:** script `a-round-272/mutants/mutate.py`, results in `results-final.txt`. All 8 turn red. Afterwards the sources were restored, and `cmp` confirms they are byte-identical.

| Mutant | Red (A) | §7 expected | Note |
|---|---|---|---|
| M-STOP-EXACT | LT10 | LT3, LT4 | Applied: only HEAD's `if` (exact comparison with the marker time); the write stays `describeSpaceStart()`. LT3 and LT4 stay **green**: Rule W keeps the playing text in step with the marker, so the exact comparison matches as well. A extended LT10 beyond §5.2 so that it catches the mutant: after a remount it does play, Ctrl+Shift+Space, Stop, and expects `insertMarkerAfterStop(t)` |
| M-NO-W | LT3–LT8, LT10 | LT3, LT5, LT6, LT7, LT10 | superset |
| M-W-ALWAYS-STOPPED | LT3, LT4, LT7, LT10 | LT3, LT7, LT10 | superset |
| M-DESCRIBE-MARKER-ONLY | LT1, LT2, LT4, LT5, LT6, LT8, LT11 | LT1, LT2, LT4, LT5, LT11 | superset |
| M-PRED-COPY | LT2, LT11 | LT11 | Applied: `startPlaybackAt` keeps its own copy with `current >= end - EPS` (it also refuses at the end). A literal `>= end + EPS` differs only at exactly end + EPS, so no row could catch it |
| M-KIND-LOOSE | PB8 | PB8, LT9 | Applied: a text that starts with `Insert marker` is classified by its words. It cannot touch LT9's `followResumed` or `Demo collection ready…`, because neither starts with `Insert marker`. So LT9 stays green |
| M-SEQ-BUMP | LT9 | LT9 | Applied: the string form, built from `lastNonRefusalStatusRef.current` |
| M-ORIGIN | PB7, LT8 | PB7, LT8 | — |

## 3. Code-reviewer (a real subagent run): 8/10, no Critical or High
- **Medium (playFrom):** section 0.
- **Low, fixed in A-owned files:**
  - **The doc claimed range-clear coverage that did not exist.** LT8 now ends with Home: `range` becomes null, the marker 0, and the text `insertMarkerAfterStop('00:00.000')`. The doc is corrected.
  - **PB8:**
    - added a case where only the second time token changes (→ `null`);
    - added a past-end text with a different end (→ `stopped`);
    - added an at-end/past-end wording swap (→ `null`);
    - removed the useless length assertion.
  - **LT11:** `toBeCloseTo(from, 1)` is replaced by `|pos − from| < 0.25`. The fake clock uses real `Date.now`, so the old ±0.05 s could flake.
- **Low, left alone (contract gaps for B, not fixed):**
  - **Selection at the end.** A selection that starts at the project end gets `insertMarkerAfterStopFromStart`, whose wording says "insert marker". This follows the §3.2 table literally.
  - **Range clears outside `placeInsertMarker`** do not go through W, contrary to the §3.7 ruling: `StudioWorkspace.tsx:1204` (hiding a track), `ArrangementClip.tsx:454/685/733` and `ArrangementClipEnvelope.tsx:231`. Not read one by one.
  - **Texts outside T.** `nothingToPlay` and the Selection-subject `playPastEnd` can be written by `describeSpaceStart`, but they are outside T, so W cannot correct them later.
  - **The `describeSpaceStartRef` render-time write.** The grant allows it; the reviewer suggests calling the function directly.
- **Info:**
  - In an explicit-write batch, `statusSequence` can rise by 2 in one render. Nothing visible changes.
  - The name of the `insertMarkerToPlayhead` kind (`'stopped'`) is misleading.
- **Architecture note (a proposal for B/root, no action taken):**
  - **Problem:** Rule W runs inside the status reducer and depends on playback and range refs and on when React runs the reducer.
  - **Proposal:** in stage 2, consider one explicit "status truth at commit" step after each transport or marker action. One rule would then cover section 0 and B-R272-STOPPED-TEXT-WHILE-PLAYING, with LT rows for both.

## 4. B acceptance A can claim
**Claimed (A side):**
- SOURCE-SCOPE / HUNK-SCOPE;
- SRC-ONE-PREDICATE;
- TESTS-TARGETED;
- TEST-ADDITIONS: `strings.test` additions only, no assertion removed;
- MUTANTS: red-proofed, with the differences listed above;
- DOC-203: l.4 and the headings;
- ARCH-EVIDENCE: the file exists and its describe names SYS-6.

**Not claimed (C only):**
- the browser rows: B-PASTEND, B-ATEND, B-RESIDUAL-PLAYING, B-RESIDUAL-END, B-PASTEND-HOME, B-STOPPED-MOVE, B-UNRELATED, B-AUDIO;
- LT-RANGE-OWN-STATUS, LT-WIDTH, SCREEN-BUDGET, G272-AUTH, CLAIMS.

**Gate rows** (the full suite, build, verify and smoke) were not run.

## 5. Next checks for C
1. Re-run the mutants on C's own scratch. Use `a-round-272/mutants/mutate.py` (run it from `store/` on the scratch), or C's own reading of §7.
2. Run the browser rows of §8, using B's `probe-stale-status.cjs` against :5173.
3. Section 0: a strip click and a marker-flag click from a stopped T text, at both viewports.
4. Confirm that LT9's recipe (ruler click → press Follow → `followResumed` → Ctrl+←) differs from FW10's scroll recipe, and why: with the scroll recipe the marker stayed at 0, so Ctrl+← did not move it.

## 6. Known gaps
- No browser run by A.
- Section 0 needs a B ruling.
- The reviewer's Low contract gaps (section 3) go to B for stage 2.
- B-R272-STOPPED-TEXT-WHILE-PLAYING (the Space path) stays open, as planned.
