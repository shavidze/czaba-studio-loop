# A round 251: SABA-B-10a stage 2a fix-up (library line names the Insert Marker)

**STOP: none.** No covering test exceeded 50 % of its declared timeout. The slowest were:
- CP12a–d at ≈ 6.8 s against 30 s;
- UC5 at 3.2 s, UM9 at 2.75 s and DXM3 at 2.6 s against 20 s.

Every other test ran in ≤ 2.4 s. No reviewer finding is a Medium+ product regression.

**Reviewer Medium, handed to B (not fixed in-round): A-R251-REVIEW-IM22-PLAYING.** Details are in §5.

Step checkpoints: `a-round-251/checkpoint-log.md`.

## 1. Changed files (round-251 delta only; the round-250 files are untouched)
`git apply -p1 b-round-250/precheck-251.diff` was applied as is (`--check` rc 0, apply rc 0). `sha256sum -c b-round-250/expected-final-sha256.txt` gives rc 0, so grants 1–7 are byte-identical to B's scratch.

| # | File | Hunk |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementLibraryPreview.tsx` | <ul><li>`LibraryPlayheadText` → `LibraryInsertMarkerText` and its memo → `LibraryInsertMarkerTextMemo`.</li><li>It reads `useArrangementInsertMarkerStore()`. A `useEffect` calls the writer once and returns `subscribePosition(writer)`; the writer sets `textContent`.</li><li>The imports of `useArrangementPositionStore`/`useArrangementPositionWriter` are removed.</li><li>testid `arrangement-library-playhead` → `arrangement-library-insert-marker`.</li><li>The literal `· playhead` → `· {studioLibraryPanelStrings.insertMarker}`.</li></ul> |
| 2 | `app/lib/arrangement/strings.ts` | `studioLibraryPanelStrings.insertMarker: 'insert marker'` |
| 3 | `__tests__/insert-marker-ui.test.tsx` | <ul><li>IM15 and IM17 get a playing branch.</li><li>IM20 checks `fireEvent.keyDown` → `false` ×3, including Meta+Shift+Space.</li><li>New IM22 and IM23.</li></ul> |
| 4 | `__tests__/library-preview.test.tsx` | the new testid, text and titles |
| 5 | `__tests__/render-budget.test.tsx` | R9-L1 rewritten to the new contract; `InsertMarkerStoreProbe`; the playback-frames row uses `LibraryInsertMarkerText: 0` |
| 6 | `__tests__/strings.test.ts` | ST49: 24 keys |
| 7 | `__tests__/studio-theme-obsidian.test.tsx` | the TH10 testid |
| 8 | `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md` | <ul><li>l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 251 PASS)`.</li><li>Each of the 7 TEMPLATE headings, in order, gets a round-251 part: context, D-29z445 with its two rejected alternatives, the direct-write pattern, `findFreeStart`, Live BR 4.10 (confirmed) kept apart from the inference, the Mermaid edge `IMS → LibraryInsertMarkerText`, files, problems (C-R250-01 → L29; IM15/IM17 stopped-only), testing (with the IM22 caveat from §5), and TODO (REGRESSION, B-R251-PASTEND-AT-END, the 10b sheet `marker` copy).</li><li>The stage-2a text is not rewritten.</li><li>Delta: `a-round-251/doc191-r251.diff`; final sha256 `30c7341c14b17514b3542883f3d3a63c99a52efa7ef2e21bf0e4aba42ecdfedc`.</li></ul> |

## 2. Scope (run by A)
- **HEAD:** `dcb7eb1`.
- **Status:** 17 `M` paths (the 13 from round 250 plus `ArrangementLibraryPreview.tsx`, `library-preview.test.tsx`, `render-budget.test.tsx` and `studio-theme-obsidian.test.tsx`). Nothing is untracked.
- **Frozen 1,102 list:** rc 0. **Root files:** rc 0. **Grant start list (before applying):** rc 0.
- **Protected files:** `git diff --quiet HEAD` gives 0 on all 7.
- **Repo `git status`:** identical before and after the mutant runs.

## 3. Tests actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npx biome check` on grants 1–7 | "Checked 7 files … No fixes applied" |
| `npm run lint` | rc 0 (205 pre-existing warnings, 1 info) |
| Covering set `b-round-250/covering-251.txt`, run alone | **123 files, 1,843/1,843 passed**, rc 0 (`a-round-251/covering.json`, `covering.log`). It includes IM15 (323 ms), IM17 (515 ms), IM20, IM22, IM23, R9-L1, ST49 and TH10. |
| Mutants `run251.sh /tmp/a251-scratch a-round-251/mutants` | Matches §0.2 exactly (`a-round-251/mutants/summary.txt`). <ul><li>FIX-CONTROL: none</li><li>MU-CAPTION-POSITION: IM22 and R9-L1</li><li>MU-CAPTION-REACT-STATE: R9-L1</li><li>MU-CAPTION-STATIC: IM22 and R9-L1</li><li>MU-PASTE-SPLIT-LOCATOR: IM15 and IM17</li><li>MU-PASTE-LOCATOR: IM15</li><li>MU-SPLIT-LOCATOR: IM17</li><li>MU-M-NO-RANGE: IM23</li><li>MU-GESTURE-CS-NO-PREVENT: IM20</li><li>MU-GESTURE-HOME-NO-PREVENT: IM20</li></ul> |

- The scratch is `/tmp/a251-scratch`: a tar copy of the working tree after step 2, with per-entry `node_modules` symlinks and no `.vite`. It is outside the repo. The script removed its own `/tmp/b251-mut-*` directories.
- The mutant runs started before the doc-only IM22 caveat edit. That edit does not affect the test files.
- The full suite and `verify` were not run (speed rule): they are gate rows.

## 4. Playwright (Chromium, existing server `:5173`, a fresh context per case)
- The script is a copy of B's, unmodified (same sha256): `a-round-251/caption-probe-251-a.cjs`.
- **Attempt 1 was invalid and is kept:** `caption-a-attempt1-timeout.log`. The first cold load timed out after 150 s on "Demo collection ready" (the same class as rounds 249 and 250).
- **Attempt 2:** rc 0, results in `caption-a.json` and `shots-caption-a/`.

| Case | 1440×900 | 1280×720 |
|---|---|---|
| stopped | `Active track: SFX · insert marker 00:03.000` (playhead 4.483); 1 line; Add → `sfx@3.000`; status `“Soft impact” added to the SFX track at 00:03.000.` | identical (playhead 4.483) |
| playing (from 3) | the same line while playing (playhead 3.96); Add → `sfx@3.000`, still playing (4.68) | identical (3.948 → 4.66) |
| Video lane (widest) | `Active track: Video (audio is not added here) · insert marker 00:03.000`; 2 lines; time visible; sh = ch = 32, sw = cw = 264 | identical |

Library width 288 px. 0 page errors in all 6 cases. This matches the task's §0.3 "Fix" column.

## 5. code-reviewer (actual subagent, run after the covering run, nothing else running)
Verdict: PASS, 8/10. How each finding was handled:
- **Medium, A-R251-REVIEW-IM22-PLAYING (confirmed, not fixed in-round).**
  - The mechanism: `insert-marker-ui.test.tsx` l.150 stubs `requestAnimationFrame` to `() => 1`. While playing, the position store therefore stays at the play-from value (3), which equals the marker.
  - The playing assert at l.563 (`caption === '00:03.000'`) cannot tell a playhead-reading line from the fix.
  - The class is still killed: MU-CAPTION-POSITION is red through IM22's stopped branch and through R9-L1, which drives 60 position frames.
  - **Not edited because** grant 3 must match `expected-final-sha256.txt` (§4 step 2, C-SCOPE-251), and the diff is B's source of truth. It is a test-strength gap, not a product regression (same class as A-R250-REVIEW-PASTE-SPLIT-PLAYING).
  - **Proposed fix for B:** in IM22's playing branch, before l.563, write the position store to the live position (`mounted.api.position?.setPosition(live(mounted.api).getLivePosition())`), assert that it is > 3.5, then assert the caption is still `00:03.000`. Red-proof: MU-CAPTION-POSITION should then also turn the playing assert red.
  - Doc 191's testing bullet now says this honestly (grant 8, L26).
- **Low, "doc claims an L29 change that does not exist": rejected.** The reviewer read the snapshot `b-round-250/lessons-before-251.md`. The current `lessons.md` l.18, L29, contains "A changed meaning is a signal too … grep the old word over `app/**` … C-R250-01" (D-29z450). The doc wording stays.
- **Low, "the time can be clamped with a long lane name; add `aria-describedby` on Add".** This was already ruled in task §1.1 (D-29z445: user-renamed long names are info, unchanged), and the widest built-in state was measured as fitting (§4). `aria-describedby` would be a new attribute outside the diff. **For B:** consider keeping the time in its own `whitespace-nowrap` segment, and linking Add to the line through `aria-describedby`.
- **Info:** the source is correct. The effect deps are `[insertMarkerStore]` with cleanup, there is no SSR mismatch (both renders read the same store), and the pattern matches `ArrangementInsertMarkerSignal`. No assertion was weakened: IM20 is stricter, and R9-L1's contract flip is intended, with per-frame writes still pinned at `render-budget.test.tsx` l.379–386 and 449–464.
- **Info, remaining "playhead" copy in `app/**`:** the same as B's §0.3 copy sweep. `rulerTitle` and `rangeBodyTitle` are B-R250-PLAYHEAD-TITLES, and `noneAfter`/`noneBefore` are B-R250-NAV-ORIGIN, both stage 2b. `SfxSceneBuilder` is another feature.
- **Info:** pre-existing class selectors in touched files (`library-preview.test.tsx:241` `span.text-foreground`, `render-budget.test.tsx:540` className equality). None was added this round; R9-L1's className check is B's specified row. For B: a deferred Low candidate.
- **Architecture note (proposal for B and root, not acted on):** there are now two identical subscribe-and-write effects on the insert-marker store, in `ArrangementLibraryPreview.tsx` l.63–76 and `StudioWorkspace.tsx` l.500–509. Keep them for now. When SABA-B-10b adds the visible marker (a third subscriber), extract `useArrangementInsertMarkerWriter` next to `useArrangementPositionWriter`, with R9-L1 and IM22 as acceptance tests.

## 6. B acceptance (§4 A checks) actually passed
- [x] 1. Start state (HEAD, 13 M, three hash lists)
- [x] 2. Diff applied; `expected-final-sha256` rc 0; grant 8 written
- [x] 3. typecheck, Biome on grants 1–7 and lint all clean
- [x] 4. Covering set alone: 123 files, 1,843/1,843
- [x] 5. 10 mutant runs = the §0.2 table; repo status unchanged
- [x] 6. code-reviewer run; findings handled above; Architecture note passed on
- [x] 7. Playwright at both viewports = the Fix column (attempt 2; attempt 1 invalid, kept)
- [x] 8. This report
- None of the §5 C rows are claimed. Full vitest, build, `verify` and e2e smoke are gate rows.

## 7. Known gaps
- A-R251-REVIEW-IM22-PLAYING (above).
- B-R251-PASTEND-AT-END and B-R250-PLAYHEAD-TITLES/NAV-ORIGIN (stage 2b).
- The 10b sheet `marker` copy.
- Long user-renamed lane names can clamp the time (D-29z445 info).
- The purchased-route library line: BLOCKED, backend unavailable in cloud. I did not touch the protected files.

## 8. Exact next C checks
C-SCOPE-251 (17 M paths; the 1,102 list, the root list and `expected-final-sha256` rc 0; the 7 protected files), C-UNIT-251, C-MUT-251, C-CAPTION-251, C-CAPTION-MOVE-251 (three ruler clicks with their own x, ≥ 850 ms apart, 10 samples over 1 s), C-CAPTION-WIDE-251, C-ADD-251 (Enter and double-click), C-PASTE-SPLIT-251, C-BUDGET-251 (85/69 empty, 101/85 demo), C-LESSON-251, AN-REVIEW-251 (l.4 byte-exact, 7 headings, IM22/IM23 cited and existing, plus the new IM22 caveat sentence), LAB-SMOKE-251 (WAV sha `1fea093b…`), Auth.

Probe first (§6):
- Drag-and-drop still lands at the drop point.
- The transport clock, ruler handle, detail panel and Overview playheads still move per frame.
- Add is disabled on the Video lane.
- The line's `title` has no time in it.

Optional extra probe for the reviewer's Medium: in the browser while playing, check that the line keeps `00:03.000` while the transport clock advances (the real rAF runs there).

**Scope completed:** the round-251 A task (§4 steps 1–8). The backlog, stage 2b and 10b are not complete.
