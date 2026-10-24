# A — Round 142 (VISUAL-A V-0.4e) — report

**Scope status: implementation complete; STOP-RULE triggered on one LAYOUT item (needs B's decision). Do not count V-0.4e as PASS-ready until B rules on it.**

## STOP — width-limited slot (task §2 stop rule #3)
- In real Chromium at **1440×900, video clip selected**, the English `clipGainVideoReason` (`A video clip has no Clip Gain — for its sound use the track Volume/Mute`) renders on **2 lines** (392/408 px) in the middle column. B's baseline (`b-round-141/out/detail-baseline-6e9f9b1.json`) has the Georgian text on **1 line** (327 px). §5 LAYOUT says "video reason 1 … Any breach = FAIL". The box also moves: reason d=(−32.5, −8, +65, +16). **Second symptom of the same cause:** the video placeholder moves d=(x +16, y −8, w −32, h 0), so §5 "the x of other nodes must not move" would also fail. The middle column centres its content, so a 1-line reason should remove both symptoms.
- The text is fixed exactly by §1.1, and a class change is forbidden by the stop rule. **I changed neither** and widened no scope.
- **Measured alternatives in the same live slot** (DOM text swap, no store edits), from `a-round-142/probe/out/video-reason-candidates-a142.json`. Each row gives lines and width at 1440:
  - `A video clip has no Clip Gain — use the track Volume/Mute`: **1** line, 329 px
  - `Video clips have no Clip Gain — use the track Volume/Mute`: **1** line, 333 px
  - `No Clip Gain on video — for its sound use the track Volume/Mute`: **1** line, 363 px
  - Georgian baseline: 1 line, 327 px
  - At 1280 every candidate, the Georgian one included, takes 2 lines (232/248 px).
- **B decision needed:** approve a shorter `clipGainVideoReason`. The change would touch strings.ts plus the pins in clip-gain-fader l.36, clip-gain l.60, detail-panel-fit l.25–26 and detail-panel-reason l.25–26, and ST41 via EXPECTED_DETAIL_PLAIN_STRINGS.
- **Pre-existing, not caused by this round:** at 1280 open (panel capped at 120 px), the bottom lines sit below the panel edge: the none reasons, `The source file stays unchanged` and the multi note. `contentScroll` is 96/83. With the Georgian baseline strings swapped back into the same DOM, the clipped list and scroll heights are **identical** (`probe/out/geo-swap-a142.json`). B's probe stored only the collapsed panel at 1280, so C will see `clippedBelowPanel` non-empty there; that is a baseline state, not a V-0.4e regression. B should rule on it before C applies "clippedBelowPanel must be empty" at 1280.

## Start checks (all OK)
- HEAD is `6e9f9b1e97d67703ba34e8b2a260a0a5215c3506`, and `git status --short` was empty.
- Frozen list (941 entries) passes `sha256sum -c --quiet`. The 20 grant start hashes match, and the start copies match.
- Pre-grep is in `a-round-142/pre-grep.txt`:
  - Georgian in the 4 sources: 38 / 1 / 1 / 4 = 44 lines, as in §0.
  - All 56 pin lines match the file content byte-for-byte, and the per-file counts equal §0.
  - The importer list (73 test files) is saved.
  - No test uses `მუსიკა` / `სტემ*` as a library kind or folder label outside library.test. All other uses are fixture track names or the collection label.

## Changed files (exactly the 22 grants: 20 ` M` + 2 `??`)
- `app/lib/arrangement/strings.ts`:
  - LB1: 4 keys appended last to `studioLibraryStrings`.
  - `studioDetailStrings` appended as the last export, with keys in §1.1 order and byte-exact values. U+2212 and U+2026 were checked with `od`.
  - Added the non-exported `StudioDetailRangeText` interface and the `detailClipCountText` helper.
  - No import, so the file stays a leaf.
- `app/components/arrangement/ArrangementDetailPanel.tsx`: DD1 (all 38 lines, plus 1 import). The `DETAIL_*` names are kept and branches stay in the caller. No class, testid or handler changed.
- `app/lib/arrangement/panels.ts`: DD2 (+ import `./strings`).
- `app/lib/arrangement/clip-gain-multi.ts`: DD3 (+ import).
- `app/lib/arrangement/library.ts`: LB2 and LB3 (+ import).
- `strings.test.ts`:
  - imports (`clip-gain-multi`, `library`, `panels`, `studioDetailStrings`);
  - 4 LB1 entries in the l.648 plain block;
  - ST39 `toBe(17)` restored, with the `>=` and non-empty checks kept;
  - new describe `V-0.4e detail and library strings` with ST41–ST44.
- 13 pin files: the 56 lines replaced with hand-written English, matchers unchanged, plus LB-SEARCH.
- `docs/.../117-studio-v0-default-names.md`:
  - l.4 now reads `Completed (A-ის შემოწმებები მწვანეა რაუნდ 141-ში; C round 141 — PASS, browserVerified; gate 141 — 6e9f9b1)`. The only "not yet run" sentence was in that l.4 parenthesis, so it is replaced.
  - The l.57 C round 141 TODO line is deleted.
- **new** `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx`: DPS1–DPS4.
- **new** `docs/implementation/2026/quarter-IV/118-studio-v0-detail-library-strings.md`: Georgian, TEMPLATE sections, per-string map, status "C round 142 not run yet". It records the stop item.

## `it` counts (before → after)
- `strings.test`: 40 → 44.
- New `detail-panel-strings-ui`: 4.
- All 13 pin files are unchanged: clip-gain-fader 14, clip-gain-multi 14, clip-gain 28, detail-panel-fit 7, detail-panel-polish 16, detail-panel-reason 6, detail-panel 24, fader-guards 63, library 11, panels 49, pending-status 22, self-disabling-focus 10, status-announcement-ui 33.
- Files: `a-round-142/it-counts-{before,after}.txt`.

## Deviations (granted files only; for B to ratify)
- **D1** `detail-panel-fit` l.24 `PENDING_HIDDEN_HINT` still had Georgian but was **not** in B's 56-line list. I changed it to `' — Enter saves, Esc reverts'` because R7 requires it; the matcher is unchanged. That makes 57 changed pin lines.
- **D2** `detail-panel-polish` l.390 and l.406 (shifted from 387/400): `not.toMatch(/\b(start|offset)\b/i)` became false by design, since the labels are now `Start` / `Source offset`.
  - I flipped it on the same line to a stale-label guard, `not.toMatch(/დასაწყისი|სიგრძე|წყაროდან/)`. No test was deleted.
  - Stale leftovers, not renamed: `it` titles that still say "in Georgian", and `not.toContain('end, წმ')`, which can no longer fail.
- **D3** LB-SEARCH: §3.2 bullet 2 and R8 say `'stems'` matches the stems by kind. It cannot: the search text uses the **kind** label `Stem`, and `'stem'.includes('stems')` is false. The folder label `Stems` is not in the search text.
  - `library.ts` behaviour was not changed. LB-SEARCH asserts `'stem'` instead, which is also what C's LIBRARY-LABELS row uses.
  - The baseline had the same gap: `სტემები` did not match the kind label `სტემი`.
- **D4** Line-shape changes on changed lines, with the cause of each:
  - **Biome-forced, test files:** detail-panel-fit l.25–28 and detail-panel-reason l.23–26 (each const split onto 2 lines); detail-panel-polish ariaLabels arrays (2×, 4 lines each).
  - **Biome-forced, other direction:** the separator `aria-valuetext` (my 3-line ternary was collapsed to 1 line) and `clipGainMultiReason` in strings.ts (one line). The `detailClipCountText` arrow became one line with a parenthesised ternary.
  - **Written multi-line because one line would exceed 100 columns:** component `rangeApplied({…})` call (l.125), the l.453 `setStatus(…)`, the toggle `aria-label` ternary, the clip-gain-multi return (3 lines), and `rangeInvalid` in strings.ts.
  - All of these are on changed lines only; Biome check reports 0 on all files.
- **D5** `detailClipCountText` is a shared non-exported helper for `clipCount` and `clipGainMembers`. The output is identical to §1.1 (R6).
- **D6** The §2 instruction to add the 4 LB1 keys to the l.702 "key list" block was not followed. That block is the **formatter**-samples map, and ST12 pins it to function keys only, so adding plain keys would break ST12. The l.648 plain block already covers all 4 keys through ST10.
- **D7** I renamed the new test's helper `rangeInput` → `detailInputByTestId` (reviewer nit) inside my own new file.

## Key → test map (GATE130-S3)
- **Plain strings, all checked by ST41:**
  - panelTitle: also DPS1
  - nothingSelected: DPS1
  - noSelectionHint: DPS1, detail-panel l.400
  - multiClipNote: DPS4
  - videoPlaceholder: detail-panel l.417, detail-panel-reason
  - rangeMultiReason: DPS4, detail-panel l.414, fit, reason
  - noneReason: detail-panel l.404, clip-gain, clip-gain-fader, reason
  - sourceUnchanged: DPS2, detail-panel l.317
  - clipGainMultiReason: clip-gain, clip-gain-fader, clip-gain-multi, fit, reason
  - clipGainVideoReason: clip-gain, clip-gain-fader, fit, reason
  - clipGainInvalid: clip-gain l.61, fader-guards ×3
  - pendingFull: also ST42, DPS3, pending-status, fit
  - pendingLabel: also ST42, DPS3, fit
  - trackLabel: DPS2, fit l.327
  - tracksLabel: DPS4, fit l.331
  - startLabel, lengthLabel: DPS2, polish
  - sourceOffsetLabel: DPS2, polish
  - rangeFromLabel, rangeToLabel, rangeStartLabel, rangeEndLabel: DPS2, polish
  - applyRange: DPS2
  - clipGainResetLabel: DPS2, clip-gain l.841
  - heightLabel: DPS1
  - expandLabel, collapseLabel, expandText, collapseText: DPS1
  - rangeInvalid: also ST42 (via DETAIL_RANGE_INVALID_MESSAGE), panels.test l.349, detail-panel l.130
- **Formatters, all checked by ST42:**
  - rangeApplied: also detail-panel l.327, status-announcement-ui l.709
  - clipGainUnchanged: also clip-gain l.710, clip-gain-multi l.507, self-disabling-focus, status-announcement-ui
  - clipCount: also DPS4, detail-panel l.407/409
  - clipGainMembers: also clip-gain-multi l.418/485/513 (via formatClipGainMembersStatus)
  - collapsedValueText: also DPS1, detail-panel l.551/684/686
- **LB1 keys:**
  - kindMusic: ST10, ST43, LB-SEARCH
  - kindStem: ST10, ST43, library l.71, LB-SEARCH
  - folderMusic: ST10, ST43, library l.44/48
  - folderStems: ST10, ST43, library l.49

## LB-SEARCH (inside the existing `it` at library.test l.68)
Fixture ids:
- music sources: `me`, `mix`
- stem sources: `pulse`, `bass`, `pad`, `lead`
- `sources[0]` = `me` for the negative check

Assertions:
- `'music'` and `'MUSIC'` → `['me','mix']`.
- `'stem'` → `['pulse','bass','pad','lead']`.
- `matchesLibraryQuery(sources[0],'მუსიკა')` is false, and `'მუსიკა'` matches `[]`, because no fixture title or collection label contains it.
- `'stem პადი'` → `['pad']` (l.71).

## Tests actually run
- `npm run typecheck`: exit 0 (re-run after the last edit).
- `npm run lint`: exit 0. There are 218 warnings and 1 info, all old; none are in changed files.
- Read-only `npx biome check` on the 20 granted .ts/.tsx files: 0 diagnostics.
- `npx vitest run` on 82 files (13 pins, strings.test, the new file, the 11 named neighbours and all importer-grep files): **1294/1294 passed, 0 failed**. List: `a-round-142/vitest-files.txt`; JSON: `a-round-142/vitest.json`.
  - After the run, the new file only had its helper renamed (D7). I re-ran it on its own: 4/4.
- **Not run (gate):** the full suite, `npm run verify`, build and e2e.
- Pin grep before and after: `a-round-142/pin-grep-before-after.txt`. On the 56 lines, the only Georgian left is fixture data (`მუსიკა` track name ×3, `პადი` title).
- Browser probe (Playwright Chromium, my own copy of B's tool, contexts named `a142-*`, against the running :5173 server):
  - Files: `a-round-142/probe/{tools,out,shots}`; comparison script `probe/tools/compare.cjs`.
  - At 1440, panel boxes are unchanged and nothing is clipped or overflows. The only line-count increase is the video Clip Gain reason (STOP above).
  - At 1440 the header label width (−45 x, +43 w) changes because the h2 `Clip details` is shorter; it is a flex-1 span.
  - The toggle (`w` +2) and apply (`w` +22) are `w-fit`.
  - My first probe run failed once in `setSnapOff` during page load (an invalid run, not a product failure). The re-run passed.

## Mutations (each restored by `cp` from `a-round-142/mut-backup/`, and the sha256 matched after restore)

| ID | Red |
|---|---|
| m82 | ST41, detail-panel (disables…), clip-gain (nothing, a group…), detail-panel-reason RF3 |
| m83 | ST42, DPS4, detail-panel (disables… l.407/409) |
| m84 | ST41, ST42, DPS3, pending-status S9/PM1/PM3, detail-panel-fit F1/F3 |
| m85 | ST42, ST44, clip-gain-multi MG4/MG8/MG9 |
| m86a `'Stem sound'` | ST10, ST43 (library.test stays green, as the task predicts) |
| m86b `'სტემი'` | ST43, ST10, ST12, ST4, library.test (l.71 + LB-SEARCH share one `it`) |
| m87 | ST42, DPS1, detail-panel (l.551 test and l.684/686 test) |

Logs and JSON: `a-round-142/mut-*.{txt,log,json}`.

## Code review (the real `code-reviewer` subagent ran)
- **Verdict 9/10. No Critical, High or Medium findings.** It accepted D1–D6, and it rated D6 as "A is right, §2 is wrong".
- Lows for B (outside A's ownership):
  - the stale polish `it` titles and the dead `'end, წმ'` check;
  - `stems` vs `Stems` search UX (R8 needs correcting);
  - the doc-117 sentence instruction had no separate target.
- Its nit (helper name) is fixed (D7).
- **Architecture note (for B, not acted on):** `library.ts:114` uses the display label `LIBRARY_KIND_LABELS` as the search text, so a copy edit in strings.ts changes search results (m86 proves it). Keep for now: one consumer, no cycle, both sides pinned. Proposal: when V-0.5 touches the library, give each kind its own search keywords (including the plural), separate from the display labels, as one bounded task.

## Shell writes (all temporary or outside store)
- Mutations m82–m87 on `strings.ts` and `clip-gain-multi.ts` through `a-round-142/tools/run-mutation.sh` and `mutate.cjs`. Each file was restored and sha-verified: strings.ts `d5b8be20…`, clip-gain-multi.ts `31a179b2…`.
- `sed -i` on my **copy** of the probe tool, `a-round-142/probe/tools/detail-probe.cjs` (outside store).
- Report and evidence files under `a-round-142/`. The probe copy writes only to `a-round-142/probe/{out,shots}` because its `lib.cjs` ROOT resolves to its own folder. `find -newer` shows no other writes in the loop folder; the only new files are the server log and `context-watch-status.json`, which belong to others.
- Browser state: every probe session used a fresh Playwright context with no `storageState`, so `a-browse.json` was not read or written.
- Every lasting store edit went through Edit/Write.

## End state
- `git status --short`: exactly the 20 ` M` + 2 `??` granted paths (`a-round-142/end-status.txt`).
- Frozen list OK at the end. Protected `git diff 6e9f9b1` is empty.
- End hashes: `a-round-142/end-sha256.txt` (22 paths).
- No commit, stash, checkout, install, `--write` or `check:fix`.

## B acceptance — what I truly passed
- §3.1 ST39 / ST41–ST44, §3.3 DPS1–DPS4, §3.5 m82–m87: passed.
- §3.2 pins: passed, with D1, D2 and D3 noted.
- §4 checks (typecheck, lint, Biome, named vitest, reviewer, end state): passed.
- **Not passed / open:** LAYOUT "video reason 1 line at 1440" fails with the §1.1 text (STOP). The 1280 open-panel clipping predates this round. Every C browser row is still C's to verify.

## Exact next C checks (after B's ruling)
1. LAYOUT 1440 video state: line count of `arrangement-detail-clip-gain-reason` (currently 2; baseline 1).
2. LAYOUT 1280 open: compare `clippedBelowPanel` against a Georgian-swap control, as in `probe/tools/geo-swap.cjs`, or against B's ruling.
3. DETAIL-TEXT and DETAIL-STATUS in all 5 states. Rendered examples observed by the probe: header `Nothing selected` / `2 clips`; collapsed toggle `Expand details`, sep `collapsed · 144 px` (1440) / `collapsed · 120 px` (1280).
4. LIBRARY-LABELS: use `music`, `MUSIC`, `stem` and `მუსიკა` (D3: do not expect `stems` to match by kind).
5. CLIP-GAIN-AUDIO, GEO-COUNT, REG-141, G142-3, PX-NET/REG-HYD as in §5.

## Known gaps
- The STOP item above.
- I did not re-verify the Ableton correspondence; §6 already marks it unconfirmed.
- The full suite, verify, build and e2e were not run (gate).
