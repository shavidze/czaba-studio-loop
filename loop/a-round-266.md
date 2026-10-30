# A round 266: SABA-B-11c stage 1 fix-up. Ctrl+E split rule D3 (C-R265-01, Medium) + the time-selection copy (C-R265-02, Low)

**STOP:** none. No §2.9 condition hit:
- no change outside the 7 grants;
- no test outside §2.6 went red;
- no assertion dropped;
- every required mutant went red;
- `sha256sum -c` rc 0 before and after;
- D3 reproduces HEAD's result for the C-R265-01 gesture.

**No test above 50 % of its timeout in the changed files.** The slowest rows against the vitest default of 5 s, measured under parallel load in the 9-file run:
- `background-time-selection-ui.test.tsx`: BS4 0.985 s, BT1 0.951 s;
- `model.test.ts`: the whole file takes 48 ms;
- `strings.test.ts`: the whole file takes 153 ms.

One unchanged neighbour is close to the line: NS5 in `navigation-strings-ui.test.tsx` took 2.28 s (46 %).

## Scope

### Changed files (exactly the 7 grants)
| File | Change |
|---|---|
| `app/lib/arrangement/model.ts` | `splitClipsByRange` implements rule D3 (details below). Its result field `middleId` became `middleIds: string[]`. |
| `app/contexts/ArrangementContext.tsx` | The range branch of `splitSelection` only:<ul><li>1 part → `setSelectedClipId` and `splitRangeDone`;</li><li>≥ 2 parts → `setSelection(middleIds)` and `splitRangeClipsDone(n)`;</li><li>`null` → `splitRangeFailed`, the range is kept and no history entry is written.</li></ul>Both success cases make one `historySplitRange` entry and clear the range. The all-tracks branch and both marker branches are untouched. |
| `app/lib/arrangement/strings.ts` | <ul><li>`rangeMissingReason` → "Make a time selection in the Arrangement (drag in a lane)";</li><li>`needsSelection` → "To set a loop, first make a time selection (drag in a lane).";</li><li>new `splitRangeClipsDone(count)`.</li></ul> |
| `app/lib/arrangement/__tests__/model.test.ts` | <ul><li>The l.192 row is rewritten: it reads `middleIds[0]`, adds a length-1 assert and keeps every old assert.</li><li>New rows MS1–MS5, plus MS6 and MS7 (added after the review).</li></ul> |
| `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>ST1 and ST10 get the new literals.</li><li>ST8 gets the `splitRangeClipsDone` samples (2 and 3).</li><li>ST7 gets the exact outputs for 2 and 3.</li></ul> |
| `app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx` | BS1–BS4 appended. The diff against B's r265 copy has 0 removed or changed lines, so BT1–BT9 are byte-identical. |
| doc 198 | <ul><li>l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 266 PASS)`.</li><li>D3, the copy change, C-R265-01 as Problem → Solution, the changed files, the tests, the mutants and the Saba question are added.</li><li>The headings are unchanged and in order.</li></ul> |

**What D3 does in `splitClipsByRange`:**
- **Targets:** every clip on `range.trackId` with `start < end − ε` and `clipEnd > start + ε`, sorted by start.
- **Per target:** take `a = max(range.start, clip.start)` and `b = min(range.end, clipEnd)`. Skip the clip when `b − a < MIN_CLIP_DURATION`. Otherwise cut at `a`, then at `b`, with the existing `splitClipAt`.
- **Selected parts:** the part inside the range, or the whole clip when neither cut happened.
- **Result:** `null` when no cut happened on any clip.

### Scope evidence
- **git status:** 16 entries: the 11 from round 265, plus ` M` on `model.ts`, `model.test.ts`, `ArrangementContext.tsx`, `strings.ts` and `strings.test.ts`. HEAD is still `2ea196e`.
- **Hunk windows** (HEAD line numbers):
  - `ArrangementContext.tsx`: -1996, -1998 (window 1989–2000);
  - `model.ts`: -293,15, -309, -311,11, -323 (window 290–324);
  - `strings.ts`: -24, -116,0 (insertion), -289.
- **Removed lines in the two test files that round 265 did not touch:** only the `middleId` line and the two old literals. Every old assertion is kept or replaced by an equal or stronger one.

## Tests actually run (from `store/`)
| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-266/typecheck.txt` |
| `npm run lint` | rc 0. 205 warnings and 1 info, the same counts as round 265's `a-round-265/lint.txt`, so no new warnings. `setSelection` was already in the `splitSelection` deps. | `a-round-266/lint.txt` |
| `npx biome check` on the 6 granted code and test files | rc 0 | `a-round-266/biome-scoped.txt` |
| `npx vitest run` on the 9 §2.8 files | **9 files, 218 tests, all passed** | `a-round-266/vitest-targeted.txt` |
| `sha256sum -c --quiet b-round-265-r266-tree-sha256.txt` | rc 0, before and after | — |

### Red-proofs
Run on the scratch copy `/tmp/a266-scratch`, outside `store/`, with `model.test.ts` and the UI file only. The control run was green and the scratch sources were restored afterwards (cmp).

| Mutant | Rows that went red (file:line) |
|---|---|
| **M6** (HEAD's full-containment `find`) | <ul><li>MS1 `model.test.ts:227`, MS2 `:242`, MS6 `:328`, MS7 `:357`;</li><li>BS1 `background-time-selection-ui.test.tsx:534` (via `expectSplitPastStart`), BS2 `:544`, BS4 `:581`.</li></ul> |
| **M7** (`targets.slice(0, 1)`) | MS2 `:244`, MS6 `:335`, BS2 `:544` |
| **M8** (always the single-clip branch) | BS2 `:552`, on the selection |
| **M9** (result returned even when nothing was cut) | MS3 `:268`, MS7 `:348`, BS3 `:570` (status "the 0 parts…") |
| **M10** (extra: select only clips that were cut) | MS6 |
| **M11** (extra: delete the `MIN_CLIP_DURATION` skip) | MS7 |
| **M12** (extra: closed-interval target filter) | **Stays green.** It is an equivalent mutant: the MIN skip and `splitClipAt` give the same result at the touching edges. Recorded honestly, not counted as a proof. |

Logs: `a-round-266/mutant-*.txt`. Script: `a-round-266/mutants.py`.

### Browser check by A
This is not C's acceptance. B's `probe-split.mjs` was copied to `a-round-266/probe-split.mjs` with only `DIR` changed, and run on `:5173`. Output: `a-round-266/probe-split-a266.json`, screenshots in `a-round-266/shots/`.
- **Every one of the 23 keys at both viewports equals B's `probe-split-sketch.json`.** 0 page errors.
  - **A (the C-R265-01 repro):** clips `["10.000","12.500"]` with `splitRangeDone`. Delete leaves `["12.500"]`. After two undos: `["10.000"]` with "Undo: Split at time selection".
  - **C (gap, 2 clips):** clips `["10.000","11.250","20.000","22.500"]` with "Clips split at the edges of the time selection; the 2 parts inside it are selected.". Delete gives "2 clips deleted; the gap remains.".
  - **D and E:** both give "Could not split at the time selection." and keep the range.
  - **H (focus):** the library `BUTTON` before and after.
  - **F (video lane):** the overlay is in the video row.
  - **G (export reason):** "…(drag in a lane)", 310 × 16 px, 1 line.
- My first run timed out waiting for "Demo collection ready", probably on a cold Vite reload after the edits. A diagnostic load (`a-round-266/diag.mjs`) and the re-run were both clean.

## Code review (required: 7 files)
The `code-reviewer` subagent ran read-only. It found no correctness bug, and it judged id tracking across chained splits and fade edges correct. How each finding was handled:

| Severity | Finding | What I did |
|---|---|---|
| Medium | No test for a whole clip next to a cut clip | **Fixed:** MS6, red-proved by M10 |
| Medium | The `b − a < MIN` skip is untested | **Fixed:** MS7, red-proved by M11; MS7 also covers a clip that only touches the range |
| Low | BS1 and BS4 do not assert that the lane overlay is gone | **Fixed:** `laneRanges('music')` must be empty |
| Low | Doc claims: the "16 tests" count; "a fully inside clip → null" | **Fixed** in doc 198 |
| Medium (copy; **not changed, see B-R266-1**) | `splitRangeDone` says "Clip split at **both** edges…" while D3 often cuts only one edge (MS1, BS1); `splitRangeTitle` says the same | Task §2.2/§2.3 pins this text unchanged, and C's SPLIT-PAST-START row expects it. HEAD gave the same text for the same one-edge cut (at HEAD the range clamped to 10–12.5, so `a = clip.start` and only one cut happened). So it is pre-existing, not a regression of this round, and not a conflict between task clauses. Handed to B. |
| Low | Fade fields of the middle part are not asserted | Not added; the reviewer read the code and confirmed it is correct. |
| Low (pre-existing) | `splitClipAt`'s MIN check has no epsilon (float edge at exactly 0.05 s) | Not changed; outside the `splitClipsByRange` grant. |

**Architecture note for B** (a proposal, not a refactor; nothing extracted):
- `splitSelection` (`ArrangementContext.tsx` about l.1966–2029) now maps 4 result shapes to selection and status. Verdict: **keep**. The branch is thin and the model logic is in `lib/`.
- If one more split variant arrives, consider a pure "split result → {selection, status}" mapper in `lib/arrangement/`.
- No new state, effect or listener.

## For B (signals, not done)
- **Deviation from `b-round-265/sketch.diff`, for B to rule (L10):** the targets are sorted by `start`. I read §2.1's "collected in clip order" as timeline order, not as `arrangement.clips` array order. MS2 pins this by passing the clips in reverse. As a result, the order of `setSelection(middleIds)` (and so the primary selected part) follows the timeline. The sketch follows array order.
- **B-R266-1 (copy, Low/Medium for B to rule):** `splitRangeDone` ("…at both edges…") and `splitRangeTitle` ("Split at both edges…") are inaccurate when only one range edge falls inside the clip. This is pre-existing at HEAD, and C can re-run the evidence: C's own HEAD capture `c-round-265/nb-head.json` → `1440x900.pastStartSplit` and `1280x720.pastStartSplit` show clips `["10.000","12.500"]` with status "Clip split at both edges of the time selection; the middle part is selected." for the same one-edge cut. A candidate wording: "Clip split at the time selection; the part inside it is selected." It would need ST1/ST7-style rewrites and C's row texts updated.
- `splitRangeClipsDone` says "Clips split" even when the other selected part is a whole uncut clip (MS6). It is accurate enough, but noted.

## Known gaps
- I did not run the full suite, `npm run verify`, the build or e2e (speed rules). Those are gate rows.
- A's own browser check reused B's probe. C's rows still need to be run independently: SPLIT-MARKER, SPLIT-ALL-TRACKS, the second FOCUS-SPLIT part (Split button), VIDEO-BG without a marquee mid-drag, and COPY's `statusFits` for the new Ctrl+L text.

## Exact next C checks
- **Scope and claims:**
  - SOURCE-SCOPE: rc 0, 16 entries, HEAD `2ea196e`.
  - HUNK-SCOPE: the windows above.
  - CLAIMS K1–K16: K4–K9 via `git show HEAD:`; K13 should now equal `probe-split-sketch.json`.
- **Tests:**
  - TESTS-TARGETED.
  - REWRITES. MS6, MS7 and the BS1/BS4 overlay assert are extra rows beyond the §2.6 list, inside the granted describe block and the add-only UI file.
  - MUTANTS M6–M9.
- **Browser rows, both viewports:** SPLIT-PAST-START, SPLIT-BG-INTO-CLIP, SPLIT-GAP-2, SPLIT-NO-EDGE, SPLIT-MARKER, SPLIT-ALL-TRACKS, FOCUS-SPLIT, VIDEO-BG, COPY.
- **Carried and other rows:** CARRIED (smoke of BG-INTO-CLIP and IN-CLIP-SAME at 1440), LESSONS, DOC-198, G266-AUTH.

## B acceptance criteria truly passed by A
- §2.1–2.3 implemented.
- §2.6 rewrites made, with no assertion removed.
- MS1–MS5 and BS1–BS4 added, plus MS6 and MS7.
- M6–M9 red.
- §2.7 doc l.4 and sections done.
- §2.8 typecheck, lint, scoped Biome and the targeted vitest set are green.
- The code-reviewer was run and its findings handled.

Browser acceptance belongs to C. Nothing in the backlog is marked complete by A.
