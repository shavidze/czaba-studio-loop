# A round 262: SABA-B-9 stage 2, Master to the bottom-right corner, plus Master labels in `strings.ts`

**No STOP.** None of the §3.8 conditions happened:
- The footer did not wrap at 1440, 1280 or 1024.
- The header (35) and toolbar (49/87) are unchanged.
- No test outside the grants turned red. B's 23-file pre-check list runs green.
- `test:perf` passed every step that passed in round 261.

Baseline: HEAD `10e1cd4…`. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-261-r262-tree-sha256.txt` returns rc 0. `git status` shows exactly the 9 grants (` M`) and doc 196 (`??`).

## Changed files
1. `app/components/arrangement/StudioWorkspace.tsx`:
   - `<ArrangementMaster />` is removed from the header's right group.
   - It now renders in the footer's last row. It comes after the one-slot ternary (hint / selected clip / reserve) and directly before the `Shortcuts ?` button (now l.3173).
   - The header wrapper div keeps the badge only. Nothing else changed.
2. `app/components/arrangement/ArrangementMaster.tsx`:
   - The `fieldset` `aria-label`, the visible `Master` span, the Mute `aria-label` and `title`, and the fader `aria-label` now use `studioMasterStrings.*`.
   - No `shrink-0` was added. The reviewer confirmed the fieldset cannot compress: all its children except the label are `shrink-0`, and a fieldset's min-content applies. B's sketch also had no `shrink-0`, so the measured bounds hold as written.
3. `app/lib/arrangement/strings.ts`: `studioMasterStrings = { groupLabel: 'Master', muteLabel: 'Master Mute', volumeLabel: 'Master Volume' }`. The values are byte-identical to the old inline text.
4. `app/lib/arrangement/__tests__/master-ui.test.tsx`:
   - **Changed row:** "sits in the workspace header before the transport…" became "sits in the footer's last row, directly before the Shortcuts button, and renders 0 times per Play frame". It checks:
     - the footer contains Mute and Volume, and the header does not (with non-null checks on both);
     - `group.nextElementSibling === Shortcuts`, the same parent, and `previousElementSibling` is one of the ternary testids (the reviewer's suggestion);
     - Exit before Mute (kept), Play before Mute, Mute before Fader, and Peak before Shortcuts;
     - the 0-renders-per-Play-frame assert and the Stop asserts are kept.

     No assertion was lost. The old "fader before Play" is now the reverse, "Play before Mute", which is what the task requires.
   - **New row LABELS:** `studioMasterStrings` equals the 3 values. The group, mute and slider names and the title come from the keys. The source of `ArrangementMaster.tsx` contains no `aria-label="Master`, no `title="Master Mute"` and no bare `Master` line.
   - **New row FOCUS-KEEP:** StudioWorkspace is rendered, the Master Volume node is held and focused, then four steps run through the provider API:
     - `addSourceToActiveTrack('song')`: the clip count goes up by 1 and the selected-clip line shows;
     - `selectClip(null)`: the reserve shows;
     - `setTimeRange({1,3,'music'})`: the range shows;
     - `selectClip('music-1')`: the selected-clip line shows.

     After each step, the slider is the same node (`===`), still connected, and still `document.activeElement`.
5. `app/lib/arrangement/__tests__/meter-ui.test.tsx`:
   - Renamed to "puts Master Peak after Master Volume, after Play and before the Shortcuts button in the footer".
   - New checks: the footer contains Peak and the header does not; Volume before Peak (kept); Play before Peak; Peak before Shortcuts.
   - The old "Peak before Play" is now reversed, as the task requires.
6. `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`: TH9's label order is now `['Zoom', 'BPM', 'Markers', 'Loop', 'Master']`. Length 5 and all token asserts are unchanged.
7. `perf/lib/app-labels.ts`:
   - `studioMasterStrings` is added to the existing single import.
   - `perfMasterVolumeLabel = studioMasterStrings.volumeLabel`.
   - The `masterVolume` entry is deleted, so `perfInlineLabels` has **5** entries.
8. `perf/studio-lab.perf.spec.ts`: `perfMasterVolumeLabel` is added to the import, and the master locator uses it. Nothing else changed.
9. `docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md`: l.4 is now `**სტატუსი:** Completed (C round 262 PASS)`. Nothing else changed.
10. **New** `docs/implementation/2026/quarter-IV/196-saba-b-9-master-bottom-right.md`:
    - written in Georgian, with l.4 byte-exact `**სტატუსი:** Completed (C round 262 PASS)`;
    - the TEMPLATE's 7 headings appear in order (l.7, 23, 59, 77, 93, 106, 131);
    - it states D1–D4 and the +4 px ruling;
    - it cites only test rows that exist.

## Commands run, with results
| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck` | rc 0 (first run, and again after the review fixes) | `a-round-262/typecheck-final.txt` |
| `npm run lint` | rc 0 (the 205 pre-existing warnings are unchanged) | `a-round-262/lint-final.txt` |
| `npx biome check` on the 6 owned `app/` files | rc 0, after one Biome format of my own `master-ui.test.tsx`. `perf/**` is not covered by Biome (L30); typecheck covers it. | `a-round-262/biome-owned-final.txt` |
| `npx vitest run` on the 9 §3.6 files (the 3 granted, `strings`, `fader-focus-order`, `transport-surface-ui`, `header-meter-envelope-strings-ui`, `track-volume-db`, `fader-style-ui`) | **9/9 files, 147/147 tests** after the final edit. `master-ui`: 2.9 s for 20 tests, against a 15 s describe timeout. The slowest test is 1.8 s, below 50 %. | `a-round-262/vitest-targeted-final.txt` |
| B's 23-file pre-check list (`b-round-261/probe/precheck-files.txt`) | **23/23 files, 378/378** (B's 373 passed + 3 collision rows fixed + 2 new rows), run before the last strengthening edit | `a-round-262/vitest-precheck23.txt` |
| Mutant control (scratch copy outside `store/`, working diff applied) | `master-ui` + `meter-ui`, rc 0 | `a-round-262/mutant-control.txt` |
| M1: restore inline `aria-label="Master Volume"` | rc 1. **LABELS** is red. | `a-round-262/mutant-m1-inline-label.txt` |
| M2: `<ArrangementMaster />` inside the reserve branch of the ternary | rc 1. **FOCUS-KEEP** is red ("Unable to find … slider 'Master Volume'" after the add step). | `a-round-262/mutant-m2-ternary-branch.txt` |
| M3: `<ArrangementMaster />` back in the header | rc 1. The **footer placement row** and the **meter-ui row** are red (2 failed / 30 passed). | `a-round-262/mutant-m3-header.txt` |
| `npm run test:perf`, **alone** (no other job ran; 1 attempt, 0 replacements) | **rc 0, 3 passed (12.6 m)**, 0 ` FAIL` lines | `a-round-262/perf-run-1.log` |

The mutants ran against the test files before the reviewer's extra `previousElementSibling` assert was added. That assert only strengthens the placement row, and M3 was already red there. The scratch copy (`tmp/a262-scratch`, my own) was removed afterwards.

### `test:perf` summary (`a-round-262/perf-compare.txt`, JSON copies in `a-round-262/latest*.json`)
| Spec | Complete / passes | Aborts / page errors / problems / failures | Assert rows (failing) | Deterministic rows vs `c-round-261/latest*.json` | Sequence |
|---|---|---|---|---|---|
| PERF-1a `latest.json` | true / 6 | 0 / 0 / 0 / 0 | 92 (0) | 166 compared, **0 deltas**; no rows new or missing | equal |
| PERF-1b-i `latest-interactions.json` | true / 6 | 0 / 0 / 0 / 0 | 17 (0) | 106 compared, **0 deltas** | equal |
| PERF-1b-ii `latest-resources.json` | true / 6 | 0 / 0 / 0 / 0 | 15 (0) | 37 compared, **4 deltas** (below) | equal |

The 4 PERF-1b-ii deltas are JS bundle byte sizes. They follow from the source change (the new strings object and the new import), not from layout:
- `res.js.studio-lab.encoded-bytes`: 364751 → 364826
- `res.js.studio-lab.decoded-bytes`: 1154933 → 1155014
- `res.js.home.encoded-bytes`: 263571 → 263574
- `res.js.studio-guard.encoded-bytes`: 286181 → 286184

The `fader.master.*` rows (log):
- **stopped:** `moves-dispatched` = 121, `move-components-max` = 1, `move-components-per-move` = 0.792, `release-commits` = 1. All PASS at 1x and 6x.
- **playing:** `restarts` = **0** (PASS), `moves-dispatched` = 121, `move-components-max` = 1, `move-components-per-move` = 0.742, `release-commits` = 1. All PASS.

## Browser self-probe (real Chromium against the running dev server `http://127.0.0.1:5173`; no extra server started)
Evidence is in `a-round-262/probe/`. I ran B's own scripts there (`baseline.mjs`, `sketch.mjs`, `range.mjs`), plus my own `shift-tab.mjs`. My own state file is `tmp/studio-real-loop/a-browse.json`.

| Measure | 1440×900 | 1280×720 | 1024×720 |
|---|---|---|---|
| header h | 35 | 35 | – |
| toolbar h | 49 | 87 | – |
| footer h: empty / clip selected / time range | 53 / 53 / 73 | 53 / 53 / 73 | 53 / 53 / – |
| scroller h (empty) | 512 | 402 | 402 |
| Master box (x, y, w, h) | 911.8, 874, 424.3, 20 | 751.8, 694, 424.3, 20 | 495.8, 694, 424.3, 20 |
| Master x, w across empty / clip / range | unchanged | unchanged | unchanged (empty / clip) |
| `Shortcuts ?` x / right | 1352 / 1428 | 1192 / 1268 | – |
| overlaps with Master; footer overflow | 0; 0 | 0; 0 | 0; 0 |

- **Tab order:** forward from `arrangement-exit` at both viewports, the first stop is Follow, then Play and Stop. Master is no longer among the first 3 stops.
- **Shift+Tab from `Shortcuts ?`** at both viewports: Master Peak → Master Volume → Master Mute. Each is in the footer, matches `:focus-visible` and has a computed outline of `solid 1px`.
- **Tab from `Shortcuts ?`:** BODY, then the CZABA link. This is the same as HEAD in B's `head.json`.

**Environment note:** the first `baseline.mjs` run, right after my edits, logged hydration errors at 1440 only: "Cannot read properties of null (reading 'useState')". That is the dev server's first load after the source change. A re-run (`probe/rerun/after.json`) had 0 errors, and every later run was clean. It is not reproducible, so I am not filing it as a bug.

I did not run C's AUDIO, KEYS or SCREEN-BUDGET rows myself; they are C's. For SCREEN-BUDGET, the after-state screenshots already exist: `probe/after-full-1440x900.png` and `probe/after-full-1280x720.png` (empty project), and `probe/sketch-clip-*.png` (demo with a clip, which is the live after state). They pair with B's `b-round-261/probe/head-full-*.png` and `head-clip-*.png`. C still does the line count.

## Code-reviewer (actual `code-reviewer` subagent, 9 files)
The reviewer found 0 Critical, High or Medium issues and scored the change 8.5/10. Findings and what I did:
- **Low, optional `shrink-0` on the fieldset:** not applied, because it is not needed (the fieldset's min-content applies, and B's measured sketch has none). The live probe confirms 0 overlaps at 1024.
- **Low, doc 196 named only the `Master Volume` undo label:** fixed. The doc and its TODO now name both `MASTER_VOLUME_LABEL` and `MASTER_MUTE_LABEL`, which stay in the frozen `ArrangementContext.tsx`.
- **Info, the left neighbour was not pinned:** fixed. The placement row now asserts that `previousElementSibling` is one of the ternary testids.
- **Info (for B):**
  - FOCUS-KEEP does not cover the `clipLaneDrag` branch or the multi-select count `<p>`. They behave the same way, and the mutant proves the class.
  - The LABELS source scan would not catch `aria-label={'Master Volume'}` or a template literal.
  - Keyboard users now reach Master near the end of the Tab sequence, because it follows the approved position. Tab order still matches the visual order (WCAG 2.4.3).
  - `strings.test.ts` (not granted) does not cover `studioMasterStrings`.

### Architecture note (verbatim gist for B, non-blocking)
"Signal 3 (the same region changed again at real cost): `StudioWorkspace.tsx:3095-3189`. Rounds 193 and 196 both changed the workspace header/footer chrome, and each placement check needs a full `<StudioWorkspace />` render with the provider and API probe. Keep for now: no state, ref or lifecycle moved. Proposal (value low, risk low): if a third round touches this region, extract the footer's last row as a presentational child, using the existing placement and FOCUS-KEEP rows as acceptance tests." This is a proposal only; nothing was extracted.

## For B / root (signals, outside my grants)
- **Doc 195, l.18 and l.60:** still counts `Master Volume` among the "6 inline labels", which is now stale (5 remain). Not granted.
- **Undo labels:** `MASTER_VOLUME_LABEL` and `MASTER_MUTE_LABEL` in `ArrangementContext.tsx` l.233–234 are still inline. They could move to `studioMasterStrings` in a later round.
- **`strings.test.ts`:** could add a `studioMasterStrings` bundle check.
- **SABA-Q-9-MASTER-ROW (D1–D3):** goes to Saba as B planned (stated in doc 196).

## Acceptance (only what I actually ran)
- §3.1 move: done. Placement row, M3 red, browser boxes as above.
- §3.2 labels: done. LABELS row, M1 red, `grep -cE 'aria-label="Master|title="Master Mute"|^ *Master$' ArrangementMaster.tsx` = 0.
- §3.3 perf wiring: done. 5 inline entries; typecheck 0; `test:perf` rc 0 with the master rows present and `playing.restarts` = 0. C's PERF-WIRING tsc mutant is not run by me; it is C's.
- §3.4 collisions + 2 new rows: done. No assertion lost; M1, M2 and M3 red.
- §3.5 docs: done (doc 196 new; doc 193 l.4 only).
- §3.6 checks: done as listed. The full suite, build, `npm run verify` and e2e smoke are gate rows. I did not run them.
- §3.7 code-reviewer: done, findings handled as above.

## Exact next C checks
SOURCE-SCOPE (sha rc 0, 9 ` M` + 1 `??`, HEAD `10e1cd4`) → PLACE-1440/1280 → STATES (clip, range, lane-move if reachable) → NARROW 1024 + first-overlap width → SCREEN-BUDGET (B's `head-full-*.png` vs after) → TAB-ORDER (forward, Shift+Tab, ring) → FOCUS-KEEP (the unit row + M2 on a scratch copy) → AUDIO (meter, drag, M, double-click, Undo) → KEYS → LABELS → PERF-WIRING (rename mutant, tsc) → PERF-RUN alone → TESTS-TARGETED + M3 → DOCS → ABLETON R1–R7 → LESSON → G262-AUTH.

## Known gaps
- I ran no real-audio browser check (AUDIO/KEYS); those are C rows. Master's audio code is unchanged, and the perf master scenario passed.
- The lane-move-hint state was not probed in the browser by me.
- The 1440 dev-server hydration error appeared once, on the first load after the edit (see the environment note).
