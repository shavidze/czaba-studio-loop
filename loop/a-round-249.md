# A round 249: SABA-B-10a stage 1, Insert Marker

**STOP:** none. No covering test failed, and none ran above 50 % of its timeout. The reviewer reported three Mediums. One is a product case, and it does not reproduce in Chromium (§5). The other two are test-strength gaps in grant 10. Strengthening those tests would break C-SCOPE-249's "diff equals precheck-scratch.diff" row, so I did not edit them. They are handed to B in §6 for a ruling. Neither is a regression of existing behaviour.

## 1. Scope
- Start state: HEAD `0e862be30b3e…`, `git status` empty. `sha256sum -c` gave rc 0 on all three lists: the frozen 1,099 list, the root list and the grant start list. The diff sha256 was `dd9b5198…2686`.
- I applied `b-round-248/precheck-scratch.diff` with `git apply -p1`, **unchanged**. After applying, the frozen and root lists still give rc 0.
- Final `git status`: `M` on grants 1–9, `??` on `insert-marker-ui.test.tsx` and `??` on doc 191 (grant 11). Nothing else changed.
- Hunks (numstat, as B listed):

| File | Change |
|---|---|
| `ArrangementContext.tsx` | +142/−53 |
| `StudioWorkspace.tsx` | +51/−12 |
| `ArrangementRuler.tsx` | +1/−1 |
| `ArrangementLane.tsx` | +2/−2 |
| `ArrangementTransport.tsx` | +2/−2 |
| `ArrangementMarkerRow.tsx` | +5/−10 |
| `strings.ts` | +4 |
| `bars-ruler-ui.test.tsx` | +8/−1 |
| `strings.test.ts` | +8 |
| `insert-marker-ui.test.tsx` | +367, new |

- Grant 11: `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md`.
  - l.4 matches `**სტატუსი:** In Progress (stage 1 of 2; C round 249 PASS)` byte for byte.
  - The seven TEMPLATE headings appear in order (l.7, 18, 73, 100, 122, 136, 155).
  - Every row id cited in the doc exists (grep: IM1–IM14, BR4b, ST11, ST12).
  - The Cmd+Shift+Space line says plainly that the Cmd path is unverified (see §6).

## 2. Static checks
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0 (205 warnings and 1 info, all in files outside this round's changes).
- `npx biome check` on the 10 granted code paths: "Checked 10 files … No fixes applied", clean.

## 3. Covering set
`npx vitest run $(cat b-round-248/covering.txt)` covers **122 files, 1,815/1,815 passed**, with 0 failed. Evidence: `a-round-249/covering.json`.
- BR4b, IM1–IM14, ST11 and ST12 all pass. IM7 is the slowest IM row at 882 ms against a 15 s timeout.
- Slowest tests overall:

| Test | Time | Timeout | Share |
|---|---|---|---|
| CP12a–d | 7.0–7.6 s | 30 s | ≤ 26 % |
| UM9 | 3.3 s | 20 s | 17 % |
| UC5 | 3.2 s | 20 s | 16 % |

Every other test is under 2.8 s against a 20 s timeout. Nothing is near 50 %.

## 4. Mutants
- 15 runs used `run-mutants.sh` on a fixed scratch copy at `/tmp/a249-scratch`: `git archive HEAD` plus the working-tree files. MU-HEAD ran by hand, with the 7 source files taken from `0e862be`.
- Logs: `a-round-249/mutants/`.
- `git status` was identical before and after (`status-before.txt` diff, empty). The scratch copies were removed.

| Run | Red rows | Matches §0.2? |
|---|---|---|
| FIX-CONTROL | none | yes |
| MU-HEAD | strings.test.ts fails to load (`pb.insertMarkerWhilePlaying is not a function`); BR4b, IM1–IM10, IM12–IM14; IM11 green | yes |
| MU-SPACE-FROM-POSITION | BR4b IM1 IM4 IM5 | yes |
| MU-NO-RANGE-START | IM5 | yes |
| MU-SHIFT-SAME-AS-SPACE | IM2 | yes |
| MU-CLICK-SEEKS-PLAYING | BR4b IM4 | yes |
| MU-NO-STATUS-PLAYING | IM4 | yes |
| MU-NO-RANGE-CLEAR | IM6 IM12 | yes |
| MU-CTRL-SHIFT-NOOP | IM3 IM6 | yes |
| MU-HOME-MARKER-ONLY | IM7 | yes |
| MU-SEEKTO-NO-MARKER | IM9 | yes |
| MU-SCRUBEND-NO-MARKER | IM8 | yes |
| MU-HANDLE-ONSEEK | IM8 | yes |
| MU-CUT-NO-REMAP | IM10 | yes |
| MU-KEYUP-OLD | IM14 | yes |
| MU-MARKER-PLAY-TOGGLE | IM12 | yes |
| **A-MU-CTRL-ONLY** (my extra run: the Ctrl/Cmd+Shift branch accepts only `ctrlKey`) | **none, 14/14 green** | n/a. It shows that no test pins the Cmd path (§6) |

## 5. Browser (Playwright, Chromium, `:5173`, both viewports, a fresh context per case)
- I ran copies of B's scripts from `a-round-249/` (`im-probe-249.cjs`, `dbg3.cjs`).
- Outputs:
  - `im-probe-a249.json` and `shots-im-probe-a249/`;
  - `dbg3-a249.json` and `range-strip-5173-*.png`;
  - `keyup-order-a249.json`.
- 0 page errors in every case.
- **Invalid attempt, kept:** the first im-probe run timed out after 120 s waiting for `Demo collection ready` on the first page load after the change (`im-probe-attempt1-timeout.log`). The re-run passed.

| Case | 1440 | 1280 | §0.3 Fix column |
|---|---|---|---|
| ruler 2, Space, stop, Space | stop 3.491 → restart **2.200**, marker 2.000 | stop 3.483 → **2.200** | 2.200 ✔ |
| then Shift+Space | 3.682 from stop 3.483, marker 2.000 | 3.682 | ✔ |
| Ctrl+Shift+Space after the stop | marker 3.491 + exact status; Space → 3.699 | marker 3.483 + status; Space → 3.691 | ✔ |
| click while playing (lane 6, ruler 8, Home, ruler 5, ↤) | playback continues 2.712, 3.632; markers 6.000/8.000 with the exact status; Home → 0.24 / m 0; ruler 5 → m 5.000; ↤ → 0.252 / m 0; Stop + Space → 0.203 | same: 2.712, 3.62, 0.252, 1.181, 0.249, 0.200 | ✔ |
| range 5–7, Space ×2, Shift+Space; strip 9, stop, Space | 5.229 / 5.191; Shift 5.42; strip → m 9.000; restart **9.203** | 5.232 / 5.200; 5.42; **9.211** | ✔ |
| Play focused, Ctrl+Shift+Space | not playing, focus on Play, marker 0.000, status | same | ✔ |
| **Reviewer case:** Play focused, Ctrl+Shift+Space, **Shift released before Space** (and the reverse order) | not playing, focus on Play, marker 0.000 | same | not in §0.3. Does not reproduce in Chromium |

Not verified by A: Cmd+Shift+Space on a real Mac, Firefox and Safari key-up behaviour, and every C row (§5 of the task is C's).

## 6. code-reviewer (real subagent, score 8/10, no Critical or High)
- **M1, Shift released before Space can click a focused button** (`StudioWorkspace.tsx` key-up reads the modifiers at release time). **Measured in Chromium: does not reproduce**, at both viewports and in both orders (`keyup-order-a249.json`). The keydown is `preventDefault`-ed, so Chromium never activates the button. At HEAD, Ctrl+Shift+Space was unhandled. Kept as **A-R249-REVIEW-KEYUP-ORDER (info)**: Firefox and Safari are unverified, and the reviewer's suggested fix is a `spaceKeyHandledRef` flag. Not applied (not reproducible; outside the exact diff).
- **M2, IM3 does not prove the Cmd+Shift+Space path:** marker = playhead = 1.000 when Cmd is pressed. **Confirmed by A-MU-CTRL-ONLY (green).** Suggested fix: assert the status `insertMarkerToPlayhead('00:01.000')` after the Cmd press (the previous status names the stop point), or split marker and playhead first. **For B: A-R249-REVIEW-IM3-CMD (Medium, test strength).** Not applied, because C-SCOPE-249 requires the test file to equal the precheck diff. I corrected doc 191's claim instead (grant 11).
- **M3, IM13 cannot catch Ctrl+Shift+Space leaking out of the tempo field** (marker = playhead = 2). Suggested fix: assert the status is unchanged, or split marker and playhead before focusing. **For B: A-R249-REVIEW-IM13-LEAK (Medium, test strength).** The product path is guarded by the existing typing-target filter, which is unchanged. I wrote no mutant for it.
- **Lows and info** (for B, not applied):
  - IM14's `isPlaying` assert is vacuous in jsdom; the key-up `defaultPrevented` is the real check.
  - Ctrl+Shift+Space does nothing on a focused slider, the same as plain Space.
  - Status clobbering (already INFO-B249-STALE-MARKER-STATUS).
  - `setInsertMarker` returns early while playing, before the scrub-ref reset. This is unverified, and the pointer-gesture claim probably makes it moot.
  - Home and Ctrl+Shift+Space are not gated during a range drag.
  - The marker is not part of Undo (consistent with the playhead).
  - A stopped handle step clears the selection but has no test.
  - The test-only hidden node stays in production until 10b.
- **Architecture note (proposal for B and root, not acted on):** "Keep for now. The marker shares `latestRef`, `isPlayingRef`, `positionRef`, `playbackEndedAtRef` and `startPlaybackAt` with the transport. After stage 2 and 10b, a bounded task could move the two position stores and the marker-write policy (`placeInsertMarker`/`writeInsertMarker`) into a `lib/arrangement/` transport-positions module and replace the hidden signal with the visible marker. Selection-clearing rules spread across call sites are the likeliest stage-2 break point."

### My own self-check notes (from the advisor, also for B)
- In the stopped path of `playFrom`, `placeInsertMarker` runs before the D-27 refusal. A flag "play" past the end therefore moves the marker and clears the range even though playback refuses. This matches the ruler behaviour in IM11 and is consistent with §1.2.
- `returnToStart` writes the marker twice. `position-store` skips repeated values, so this is harmless.

## 7. B acceptance criteria this round truly passed (A's side, §4 of the task)
- §4.1 start state ✔
- §4.2 apply + grant 11 ✔
- §4.3 typecheck, Biome and lint ✔
- §4.4 covering 122/1,815 ✔
- §4.5 mutants exactly as §0.2 ✔
- §4.6 code-reviewer run, findings and note passed on ✔
- §4.7 Playwright Fix column reproduced at both viewports ✔

C's §5 rows are not claimed.

## 8. Next C checks (suggested first)
1. C-SCOPE-249: the status has 9 `M` + 2 `??`. The diff equals precheck-scratch.diff, with doc 191 extra.
2. C-CTRLSHIFT-FOCUS-249, including the Shift-released-first order (A saw no activation in Chromium).
3. C-CLICK-PLAYING-249, including the clip-body click at 11 s (A's probe covered lane, ruler, Home and ↤ only).
4. C-POINT-RANGE-249 with a one-track drag, using `[data-testid="arrangement-range"]`. B's dbg3 `range` field reads `[data-range-start]` and shows null for one-track ranges.
5. C-VIDEO-249, C-D27-249, C-CUT-249 and C-STATUS-BOX-249 (not probed by A).
6. AN-REVIEW-249: check the doc's Cmd+Shift+Space wording against A-MU-CTRL-ONLY.

## 9. Known gaps
- Cmd+Shift+Space has no test that pins it (M2).
- IM13 has the Ctrl+Shift leak gap (M3).
- No Mac, Firefox or Safari check.
- Stage 2 scope as listed in §7 of the task.
