# C round 265 — SABA-B-11c stage 1: background time selection, no clip clamp, marquee on Ctrl/Cmd

**Verifier:** C, 2026-10-30. **Verdict: FAIL** — every §4 row passes at both viewports. However, this round causes a **Medium regression** of an existing gesture→command sequence in a §3 at-risk neighbour: Ctrl+E split on a range that runs past a clip edge (C-R265-01). The bug gate requires Medium regressions caused by the round to be fixed before the feature counts as done. The fix needs `app/lib/arrangement/model.ts` (`splitClipsByRange`), which was not granted to A. This is a planning gap, not a defect in A's work inside the grants.
- **Why FAIL here and not "PASS + next-round bug" (as GATE264-S2 at round 264):** GATE264-S2 was pre-existing. C-R265-01 is a regression this round's diff creates: the same gesture plus Ctrl+E works at HEAD (`nb-head.json`). The governing rule is the policy bug gate: "any regression the round itself caused at Medium or above" is fixed.
- **Expected next step:** a bounded fix-up re-dispatch that grants `model.ts` plus its tests. It is not a redo. Every §4 row stays green and is carried, not re-run from scratch. The fix-up task must also re-rule doc 198 l.4: L28 fixed it as "C round 265 PASS".

- HEAD `2ea196e`. The working tree holds A's uncommitted round-265 diff, unchanged during C's phase. C edited no source.
- Env: `env-status.json` = store 200 (round 265). The browser target is `http://127.0.0.1:5173/studio-lab`, a fresh anonymous context per session, after `Demo collection ready`.
- **HEAD baseline:** C ran its own server on `127.0.0.1:5174`, serving a `git archive HEAD` extract at `tmp/c265-head`. It uses symlinked package dirs but its own `.vite` cache. It was used for K13/K17/K22, SCREEN-BUDGET "before" and the split comparison.
- `browserVerified` = `realVerified` = **true**: every §4 browser row ran at 1440×900 and 1280×720, with 0 page errors in every context.
- Scripts and raw data are in `c-round-265/`:
  - `c265-browser.mjs` → `browser-after.json`;
  - `c265-nb.mjs` → `nb-head.json` / `nb-after.json`;
  - `c265-split2.mjs` → `split2-after.json`;
  - `c265-budget.mjs` → `budget.json`;
  - `g265-auth.cjs` → `g265-auth.json`;
  - `k-probe-*-head.mjs` → `k-head-*.json`;
  - screenshots in `shots/`.

## Rows
| Row | Result | Evidence (1440×900 / 1280×720 identical unless stated) |
|---|---|---|
| SOURCE-SCOPE | PASS | sha256 rc 0; `git status`: the 9 grant files ` M` + 2 new files `??`; HEAD 2ea196e |
| CLAIMS | PASS | K1–K12, K14–K16, K18–K21 and K23 were re-run at HEAD (granted files via `git show HEAD:` into `/tmp/headtree`). All outputs match. K21 shows 12 in the worktree (HEAD 11 + the new file). K13/K17/K22 were re-run on C's HEAD server: sheet rows 48, one scroller sh 1280 / ch 808·646, overflowX 0; P1 clamp "00:10.000 — 00:12.500"; P2 marquee mid-drag with no range; P6 → BODY; grid probe matches; AltGr z/e/l as claimed. The L29 grep has no untagged code fact (l.17 is the scope source doc). |
| TESTS-TARGETED | PASS | 10 files, 166 tests, rc 0 (`vitest-targeted.txt`) |
| REWRITES | PASS | `rewrites.diff`: SP13/UC10b/TG9 gain only `ctrlKey: true` plus a title change. SE8 changes `end: 23` → `24` and keeps the exact object. SC1 gains exactly the 2 ids. No assertion is lost. |
| MUTANTS | PASS | Own scratch `tmp/c265-scratch`, new file only. Control 16/16 green. M1: 10 red (BT1 ×3, BT2, BT3 ×2, BT6 bg, BT8, BT9). M2: 1 red (BT6 in-clip). M3: 6 red (BT1 overlay ×3, BT3, BT6, BT9). M4 (HEAD SW): 10 red incl. BT1. Scratch restored (`diff -rq` clean). |
| BG-RANGE | PASS | Mid-drag marquee 0. Readout "Time selection: 00:01.000 — 00:07.500 · length 00:06.500 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time". 1 overlay, Music row (lane 0), 1.000/7.500, aria-hidden true, text "00:01.000 – 00:07.500 · 6.500 s" (no "all tracks"). Insert marker hidden. `shots/after-bg-range-*.png` |
| BG-INTO-CLIP | PASS | Range 00:01.000 — 00:15.000, 1 overlay. Delete → clips ["15.000"], status "Deleted 00:01.000 — 00:15.000 on the Music track; the gap remains." Ctrl+Z → ["10.000"]. |
| BG-EMPTY-DELETE | PASS | "Nothing to delete in the time selection — nothing changed.", clips ["10.000"] |
| CLIP-PAST-START | PASS | "00:06.250 — 00:12.500" (HEAD clamped "00:10.000 — 00:12.500", re-measured on C's HEAD server). 1 lane overlay, no in-clip label. `shots/after-clip-past-start-*.png` |
| IN-CLIP-SAME | PASS | "00:12.500 — 00:20.000", 0 `[data-range-start]`, in-clip labels shown |
| SNAP | PASS | G → pressed "true". (1) 00:01.000 — 00:08.000; (2) Alt: 00:01.300 — 00:07.600; (3) no range. G again → "false". |
| MARQUEE-CTRL | PASS | Control: marquee count 1 mid-drag, no range after; Delete → "Clip deleted; the gap remains.", 0 clips. Shift (fresh S): a range 00:01.000 — 00:15.000, no marquee; Delete → the BG-INTO-CLIP status, clips ["15.000"]. |
| CLICK-SAME | PASS | Insert marker "3.000", visible; no range |
| VERTICAL | PASS | Drag into lane 2's row: range 00:01.000 — 00:07.500, 1 overlay, Music only |
| ALL-TRACKS | PASS | "Selection on all tracks: 00:01.000 — 00:07.500.". 4 overlays: Music/Stems/SFX + video row, 1 each. Same 4-row layout at HEAD (`nb-head.json`). |
| PLAYING | PASS | Playing before (00:10.472); mid-drag Playing 00:10.591/10.571; after 00:10.992/10.931; +500 ms 00:11.512/11.430 (monotonic, no seek). Space stop, Space → Playing at 00:01.461 / 00:01.458, within [1.000, 2.000]. |
| SHEET | PASS | 50 rows. "Add clips in an area to the selection · Ctrl + drag on a lane" comes right after "Add a clip to the selection". "Select time · Drag in a lane" comes right before "Cut Time…". One scroller (sh 1322; ch 808 / 646), overflowX 0, both rows fully inside the scroller. `shots/after-sheet-{Add,Select}-*.png` |
| SCREEN-BUDGET | PASS | DOM text outside the timeline, lanes and clips, HEAD (:5174) vs after (:5173). Empty: 78/78 lines @1440 and 64/64 @1280. Setup S: 81/81 and 64/64. The visible string sets are identical (0 only-head, 0 only-after). `budget.json`, `shots/budget-*` |
| FOCUS-SAME | PASS | (1) Snap button focused → still Snap after the drag (same at HEAD, `nb-head.json`). (2) "Search the library" → BODY, the same as HEAD P6. Recorded as equal to HEAD, not a FAIL (§2.6). |
| LESSONS | PASS | L45 at l.31 and L46 at l.32 |
| DOC-198 | PASS | l.4 byte for byte `**სტატუსი:** In Progress (stage 1 of 2; C round 265 PASS)`. The TEMPLATE headings appear in order. Cited rows exist (BT4 via `it.each`). |
| G265-AUTH | PASS | Anonymous `/studio-lab`: the workspace + demo badge, `auth_user` null, 0 cookies. `/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 audio/token requests. `/api/studio-token` with no header → 401 "Please sign in…", no token. With a fake Bearer → 500, no token (backend not running, as in prior rounds). |

**Extra probes**
- **A's "probe first", a vertical-only background drag (dx 0, dy ≈ 0.6 lane), Snap off.** No range, no overlay, the insert marker unchanged. A recorded this deviation from §2.1 ("null for any equal ends, not only snapped ends"). It is listed for B's ruling (L10), not as a bug.
- **Ctrl+L on a background range.** "Loop created and turned on: 00:01.000 — 00:07.500." Works.
- **Ctrl+Shift+X on the range 1–15 over a gap and a clip.** The clip moves to 1.000, and Ctrl+Z restores it. Works.

## Bugs
### C-R265-01 (Medium): Ctrl+E refuses to split a range that runs past a clip edge, a regression from the removed clamp
- **Steps (both viewports):** setup S (clip at 10.000, 40 px/s). Drag on the clip body from clip x + 100 to clip x − 150. Press Ctrl+E.
- **Expected:** the clip is split at the edges of the selection that fall inside it, here at 12.500, as it was at HEAD for this exact gesture. At HEAD the clamped range 10–12.5 gave "Clip split at both edges of the time selection; the middle part is selected." with clips ["10.000","12.500"] (`nb-head.json`).
- **Actual:** range 06.250–12.500, status "Could not split at the time selection.", clips unchanged (`split2-after.json`, `shots/after-split-refused-*.png`). The same happens for the BG-INTO-CLIP range 1–15 (`browser-after.json` NB_SPLIT).
  - Consequence: a user who presses Ctrl+Z, expecting to undo the split, undoes the previous edit instead (here the clip add: clips → []). Redo restores it, so no data is lost.
- **Cause (code reading):** `splitClipsByRange` (`app/lib/arrangement/model.ts`) only accepts a clip that fully contains the range. Saba's "no clamp" now makes a past-the-edge range the normal result of an overshooting in-clip drag. §3 named "Ctrl+E split at a range … on a range that spans a gap" as at risk, but §4 had no row, and `model.ts` was not granted. This is a planning gap (L23: the "mandatory change vs neighbour" collision was not pre-run).
- **Ableton conformance:** unconfirmed. Manual 12 §6.12 "Splitting Clips" covers only a selection within the clip. No source covers a selection that extends past a clip.
- **Question for B (reference-first; not prescribed by C):** what should Ctrl+E do with a selection that spans a clip edge, a gap or several clips? The options are: split at the edges that fall inside the clip; split every clip it intersects; or refuse with clearer copy. B needs a Live source (an `ableton-arrangement-expert` / `docs-explorer` consult or a video) or a Saba question. C's only fact is the regression versus HEAD for an overshooting in-clip drag. The fix-up needs rows for a range past the edge, over a gap and over 2 clips.

### C-R265-02 (Low → deferred_low_polish): copy still names only the clip or waveform as the place to make a time selection
- `strings.ts:289` `needsSelection` "To set a loop, first make a time selection on the waveform." This is shown on Ctrl+L without a range (K22 output).
- `strings.ts:24` `rangeMissingReason` "Make a time selection in the Arrangement (drag on a clip or on the ruler)". This appears in the export dialog.
- A time selection is now also made by dragging on the empty lane background. This is L29's "changed meaning" clause. `strings.ts` was not granted, so it is a planning gap.

### Notes (info, no bug filed)
- `strings.ts:809` `rangeInvalid` "The time selection must stay inside the clip…" is the details-panel numeric range entry. It still enforces the clip clamp that the drag no longer has. B should decide whether Saba's "no clamp" applies there too.
- The marquee's toolbar focus ring: the Snap button keeps focus with `:focus-visible` true. Its outline is `none` (the ring is drawn some other way). This is unchanged and not in scope.

- **Evidence caveat:** in `nb-after.json`, every field after `pastStartSplit` is invalid. The probe's own Ctrl+Z after the refused split undid the clip add, which is why its `inClipSplit` shows `[]`. The clean in-clip control is `split2-after.json`: the in-clip range 12.5–20 → Ctrl+E → clips ["10.000","12.500","20.000"] at both viewports.
- **Not covered by any §4 row:** a background drag started on the video lane. §2.1 says the video lane uses the same handler. B decides whether the fix-up gets a row.
- **Housekeeping:** C's HEAD server on :5174 was stopped after use (curl → 000). :5173 is still 200. After C's phase, `git status` shows the same 11 entries and sha256 rc 0.

## Ableton conformance (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| Background drag selects a timespan; click = insert marker | Confirmed ([AV] 6.9) and matched |
| Snap + Alt bypass | Confirmed ([AV] 6.10) and matched |
| No clamp inside a clip | Saba decision. The Live behaviour at the clip edge is unconfirmed. |
| Marquee on Ctrl/Cmd+drag | Deliberate difference D1 (awaiting Saba, SABA-Q-11C-MARQUEE) |
| Vertical drag stays on one lane | Deliberate difference D2 (awaiting Saba) |
| Ctrl+E on a range past a clip edge | Unconfirmed (§6.12 is silent) |

## Gate rows (not claimed)
Full vitest, build, full Biome, `npm run verify` and the e2e smoke belong to the root gate.

## Not in scope
Relative snap (stage 2, awaiting R49-T), multi-lane partial ranges (D2), Live-style Shift-click extension.
