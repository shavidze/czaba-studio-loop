# A round 236 — SABA-B-11a-FIX-1 (scrub strip play-from path)

**No STOP.** No covering test is above 50 % of its timeout (L32: A's time and the gate time are both listed; the higher one decides):
- CP12a–d: A 6.2–6.6 s; gate 235 `verify.log` 8.4–8.9 s (CP12d 8.86 s). Limit 30 s, so the worst is 30 %.
- UC5: A 2.7 s; gate 3.36 s. Limit 20 s (17 %).
- UM3: gate 3.35 s. Limit 20 s.

**Two items for B to rule on:**
1. **Deviation:** BR13 was extended beyond §2.4. It now also covers the loop past the end and the library-preview stop. This answers the reviewer's two Medium findings; MU-L and MU-P are red. It is additive and stays inside the granted new row.
2. **Ruling request:** the `playFromRuler` bullet in doc 183 (l.38–40) is stale and outside grant 5. I left it unchanged.

## Baseline
HEAD `49b4c74`, tree clean at start. Frozen list (1,093) rc 0, grant start hashes OK, root files OK.

## Changed files (5 M + 1 new; exactly the grants)
| # | Path | Change |
|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | `playFrom(time)`: interface member, `useCallback` after `seekTo` (deps `[seekTo, stopLibraryPreview, togglePlayback]`), in the value object and its deps. `togglePlayback`/`seekTo` unchanged. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | `playFromRuler` body → `workspaceRef.current.playFrom(time)`, still `[]` deps. |
| 3 | `app/components/arrangement/ArrangementTempoRow.tsx` | `pressInStripRef`; `onPointerDown` wrapper records the zone; `onDoubleClick` returns when the press was in the strip. `undefined` without tempo. |
| 4 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | BR12, BR13, BR14 after BR11. BR1–BR11, BR4b and the helpers are byte-identical. **Addition beyond B's BR13 spec (same new row, same file grant):** after the specified assertions, BR13 also checks (a) an enabled loop 14–18 (past the project end), where a strip click at 15.95 → playing from 16.000, and (b) a loop 2–6 with a running library preview, where a strip click at 15.95 → not playing, the preview stopped (`libraryPreviewSourceId` null), and the `playPastEnd` status. Prompted by the code-reviewer's two Medium test gaps. |
| 5 | `docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md` | `git diff -U0`: 2 hunks only. One is the "Drag და double-click" bullet (l.34–37); the other is the mermaid `Dbl` branch (l.76–78, adds `Press{last press inside strip?}`). l.4 is unchanged (`C round 235 PASS`). |
| N1 | `docs/implementation/2026/quarter-IV/184-saba-b-11a-play-from-fix.md` | New. l.4 is `**სტატუსი:** Completed (C round 236 PASS)`. It has all 7 TEMPLATE headings in order and cites BR7, BR11, BR12, BR13 and BR14 (all exist). It also includes the §3 reference table, the deviations, `SABA-Q-SCRUB-DOUBLE-CLICK`, B-R236-END-WORDING and the "last press decides" rule. |

Implementation = B's pre-checked sketch (`b-round-235/precheck-scratch.diff`) applied verbatim, plus the BR13 extension above.

## Checks actually run
- `npm run typecheck`: rc 0 (after the final edits).
- `npx biome check` on the 4 code/test files: "Checked 4 files. No fixes applied." (Docs are outside Biome's `app/**`.)
- Covering set (`b-round-235/covering-files.txt`, before the BR13 extension): **118 files, 1,692 tests, all passed**, 153 s. Log: `a-round-236/covering.log`.
- After the BR13 extension: `bars-ruler-ui` 15/15. `bars-ruler-ui` + `tempo-ui` + `tempo-window-ui` + `tempo-seed-ui`: 4 files, 43/43 passed. BR12 took 245 ms, BR13 187 ms and BR14 151 ms (limit 15 s).
- Final scope: HEAD `49b4c74`. `git status` shows the 5 M + 1 `??` above. Frozen rc 0, root files rc 0. `git diff --quiet HEAD` on the 4 protected route/test files: rc 0.

## Mutants (each applied alone, N2 run, restored; source hashes re-verified OK against `a-round-236/post-apply-sha256.txt`)
| Mutant | Red rows | Log |
|---|---|---|
| MU-R (restore the render-state `latest.isPlaying` check in `playFromRuler`) | BR13, BR14 | `a-round-236/mutant-MU-R.log` |
| MU-E (`end > 0` → `false`) | BR13 (l.424, not playing) | `mutant-MU-E.log` |
| MU-T (double-click zone from `event.target`) | BR12 | `mutant-MU-T.log` |
| MU-L (A extra: drop the `resolveActiveLoop(...) === null` condition) | BR13 (l.443, loop 14–18 case) | `mutant-MU-L.log` |
| MU-P (A extra: drop `stopLibraryPreview()` in the end branch) | BR13 (l.451, preview not stopped) | `mutant-MU-P.log` |

The final files contain no mutant.

## A's Playwright probe (`:5173`, Chromium, fresh page per scenario)
Script: `a-round-236/probe.cjs`. Output: `a-round-236/probe-out.json`. Shots: `a-round-236/shots/`. It waits for `Demo collection ready`, then seeds with demo-stem-pulse → Add (120 BPM, 1/4, Snap on, 16 s, 40 px/s). The first attempt timed out after 90 s waiting for the ready status. The likely cause is a cold Vite compile after the edits, but this is unconfirmed. A debug load then showed ready within 3 s, and the re-run passed. 0 page errors in all scenarios at both viewports.

| Scenario | 1440×900 | 1280×720 |
|---|---|---|
| Strip dblclick at t = 3 (y + 4): event targets | `pointerdown:strip`, `pointerup:root`, `click:root` ×2, `dblclick:root` | same |
| → after 300 ms | `Pause`, pos 3.24, status = the seed status (no `Fit:`), scrollLeft 0, bars width 1840 (zoom unchanged) | same |
| Space, then a lower-zone dblclick at t = 6 (y + 15), stopped | `Play`, pos 6, status `Fit: the entire project is visible (00:16.000). X goes back.` | same |
| scrollLeft 300, strip click at 15.95 | `Play`, pos 16, exact `playPastEnd` status, scrollLeft 300 | same |
| → then Space | `Pause`, pos 0.382 after 400 ms (plays from 0, the Space rule) | same |

- I did **not** measure the ±25 ms audio-source start (C-DBL-STRIP / L48); that row is C's. The position readings are wallclock playhead values.
- The lower-zone dblclick **while playing**, the loop variants, C-RACE (10 fast clicks) and the Follow experiments were not probed by A.
- Screenshots: `empty-*`, `seeded-before-*` and `after-strip-dbl-*` at both viewports. These are working-tree only; the persistent-text count against the baseline (L39) is C's row. A added no string and no element.

## Code-reviewer (actual subagent run): 8/10, no Critical/High
- **Medium ×2 (test gaps: the loop condition and the preview stop in the end guard):** fixed by the BR13 extension and proven by MU-L and MU-P.
- **Low (doc drift):** doc 183's `playFromRuler` bullet (l.38–40) still describes the old flow, and doc 184 claimed it was replaced. That bullet is outside grant 5, so I left it and reworded doc 184 to say so. **B ruling needed** on updating doc 183 l.38–40.
- **Low:** `pressInStripRef` is written before the hook's button/claim guard, and it is never reset, so the last press decides. Recorded in doc 184. A strip press followed by a lower press within the dblclick slop would Fit; this happens only at the ~10 px boundary. Not changed.
- **Low:** the zone is now computed in two places (the hook's `pressTarget` at l.126 and `event.target` in the wrapper). Not changed (see the Architecture note).
- **Low (carried over, not caused by this diff):** while playing, a strip click past the end just seeks past the end.

### Architecture note (for B/root; not a task)
- The play-from decision moved from StudioWorkspace into the context in back-to-back rounds, and the end rule is now split between `playFrom` and `togglePlayback`. Keep it, because it needs `isPlayingRef` and `historyRef`. Proposal: a pure `lib/arrangement` helper `(arrangement, target, isPlaying) → 'seek' | 'pastEnd' | 'start'`, unit-tested over the loop/end cases.
- `pressInStripRef` copies what `useRulerNavigation` already stores as `pressTarget`. Keep it for now. Alternative as a separate small task: the hook passes the last `pressTarget` to `onRulerDoubleClick(pressTarget)`, giving one zone check.

## B acceptance items A can claim
- §2.1–2.5 implemented within the grants. §4 steps 1–6 done: typecheck/biome, the covering set green, the mutants red as predicted, the reviewer run, the Playwright probe at both viewports, and this report.
- Not claimed: every C row (C-DBL-STRIP timing, C-RACE browser, C-FOLLOW, C-BUDGET, C-REF backlog greps, Auth, LAB-SMOKE) and the gate rows.

## Exact next C checks (suggested order)
1. C-SCOPE-236. Doc 183 hunks are by content: the bullet plus the mermaid `Dbl` branch.
2. C-DBL-STRIP, with the audio-source start ±25 ms.
3. C-END-236, including loop 2–6 and loop 14–18 with a click at 16.
4. C-RACE-236 (MutationObserver, 10 clicks at 80 ms).
5. C-DBL-LOWER while playing.
6. C-STRIP-236 regression.
7. C-NO-TEMPO-236.
8. C-BUDGET-236 against the baseline shots.
9. AN-REVIEW-236. Note: doc 184 cites BR11 as well as BR7/12/13/14.

## Known gaps
- The doc 183 l.38–40 stale `playFromRuler` bullet is outside the grants and needs a B ruling.
- The covering set was run before the BR13 extension. Only `bars-ruler-ui` changed after it, and it was re-run together with the 3 tempo UI files.
- Root: gate rows only (full suite, verify, build, e2e smoke).
