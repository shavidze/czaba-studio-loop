# C round 138 — VISUAL-A V-0.4a (clip gestures in English)

**Verdict: PASS.** browserVerified = realVerified = true. Bugs: 2 Low (C-R138-01 doc wording, C-R138-02 pre-existing blocked-status-after-commit) → `deferred_low_polish`; no Critical/High/Medium. Blocked: only the fake-Bearer 403 check (backend unavailable in cloud).
Env: `env-status.json` store 200 (round 138, 2026-10-24T15:20Z). Evidence: `c-round-138/{tools,out,shots}/`, JSON `c-round-138.json`.

## Offline rows
| Row | Result | Evidence |
|---|---|---|
| T138-TARGETED | PASS — A's 25 files, 527/527, exit 0 (equals A) | `out/vitest-25.json` |
| SOURCE-SCOPE | PASS — start and end: HEAD 7e6202b, `git status` = exactly the 24 granted paths, frozen list (931) OK, `a-round-138/end-sha256.txt` OK, protected diff vs 7e6202b empty; no source change during C's phase | shell log |
| AN-REVIEW | PASS — ArrangementClip: import + the §1.1 lines only (no handler/condition/class change); Context: import + l.1761 only; strings.ts: appended leaf object, no import. Pins: 102 −/108 + lines, every − line had Georgian, + keep only fixture names, matchers toBe 62/62, selectors `^=` 7/7, `$=` 2/2, `[title=` 5/5, no `it(` change, 3 Biome wraps (trailing comma), no pin imports the module. strings.test: import, l.721 removal, ST33 retitle, ST34–35. Doc 113: l.4/21/70/74/75. `clip-strings-ui.test.tsx` read: CSU1–CSU3 match §3.3 with hand-written literals | `out/an-diff-*.txt` |

## Browser rows (Playwright Chromium, fresh context per session, 1440×900 and 1280×720; Snap at the start of every session = off)
Final clean runs `r2`: 73/73 checks at each viewport, 0 fails (`out/c138-{1440,1280}-r2-all.json`, logs `out/run-*-r2.log`).

| Row | Result (both viewports) |
|---|---|
| CLIP-MOVE | `Move clip: start 00:03.000, length 00:02.000, source offset 00:00.000.` (measured start 3.000); `Undo: Move clip`; one Ctrl+Z → 2.000 |
| MOVE-BLOCKED | held: CL7 exact; released at 3.875 (end 5.875 < neighbour 6.000, no overlap) |
| TRIM | hover → `Trim — left edge`; left +0.5 s → `Trim — left edge: start 00:02.500, length 00:01.500, source offset 00:00.500.`, `Undo: Trim — left edge`; right −0.5 s → `Trim — right edge: … length 00:01.000 …`, `Undo: Trim — right edge`; right +2 s held → CL9, length stops at 1.500 (source end); left past source start held → CL8, start stops at 2.000 |
| LANE-MOVE | `Move to track — სტემები: start 00:02.000.`, `Undo: Move to track — სტემები`; refusal path (right in music to 8.5 s, then straight down onto stems 8–10): held `No room here`, released `No room here — the clip stayed in its last free spot: მუსიკა, start 00:08.500.`; clip measured on music at 8.500 |
| GROUP-MOVE | ArrowRight: both +0.100, `Undo: Move (2)`; drag right `Move (2): 2 clips moved 00:01.000 to the right.` (both +1.000); drag left `Move (2): 2 clips moved 00:02.000 to the left.` (both −2.000); Undo `Undo: Move (2)` |
| NO-CHANGE | drag +1 s and back, and Shift-lock drag: `Move clip: nothing changed — the Undo history is unchanged.`; Undo title unchanged (`Undo: Add — Soft impact`) |
| FADES | held `Fade In: 1.000 s`, release `Fade In: 1.000 s.`, `Undo: Fade In`, double-click `Fade In: 0.000 s.` (data-fade-in 0.000). **Real audio** (output tap on the live destination, `demo-stem-pulse` at 1 s, window clip+0.02…+0.2 s, paired): unfaded −21.4/−21.5 dBFS (1440), −21.9/−22.2 (1280); with 1 s fade −47.0 dBFS; Δ ≈ 25 dB (≥ 6 dB). Silence before the clip (−200), so the baseline is a real level. Video: fade handle titles CL2/CL3 exact; fade-out drag `Video Fade Out: 2.000 s` / `Video Fade Out: 2.000 s.` |
| FOLDED-TITLE | via the **track** fold button: header `Soft impact — drag to move` + `\n` + CL1, root `Soft impact` + `\n` + CL1; unfolded header `Soft impact — drag to move`, root title absent. See note 1 |
| RANGE-BADGE | `00:03.000 – 00:05.000 · 2.000 s`; body title CL19 |
| REG-137 | one-track range readout equals the round-137 line exactly |
| GEO-COUNT | 23 steps per viewport, raw 193, **net 0**. Subtractions: track names (მუსიკა, სტემები), clip/source titles (ღამის პულსი · …), default group name `ჯგუფი 1` (V-0.4d). The lane-move label was not subtracted |
| LAYOUT | S0/S1/S2 vs round 137: 0 deltas > 1 px at both viewports (`out/layout-compare.json`) |
| G138-3 (alone, last) | `/studio-lab` workspace + demo badge; `/studio/middle-east` "Sign in required", no workspace, 0 `audio[src]` (1440 and 1280); `/api/studio-token` → 401. Fake-Bearer 403: BLOCKED (backend unavailable in cloud). Passed except that sub-check |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration, 0 pageerror (only the known cart noise) |

Gate rows (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Harness corrections (first run r1, not app bugs)
- TRIM: I wrongly expected a commit status after a blocked release; the code sets none when blocked (logic unchanged).
- GROUP-MOVE: after Undo both clips stay selected and a plain click on a selected clip keeps the group, so my Ctrl+click deselected one.
- FOLDED-TITLE: see note 1.

## Ableton (CZABA requirement / correspondence)
- Trim edges (§6.7): met / confirmed for the gesture; "Trim" and the Undo label names are CZABA labels (Live Undo wording unconfirmed).
- Fade handles (§6.8): met / confirmed handles at the edges, shown on hover; double-click = 0 is a deliberate difference; picture-only video fade is CZABA (D-29z49).
- Folded track (§6.9): met / confirmed idea ("unfold its track").
- Cross-track move, lane refusal, no-change status: met / unconfirmed (no source).

## Notes for B
1. FOLDED-TITLE row wording: Ctrl+G plus the group fold cannot show the title, because a folded group renders 0 clips (measured at both viewports). CL1 appears with the **track** fold button, and I verified it there. I did not check the `U` key path.
2. Low C-R138-02 (pre-existing): after a blocked trim or move, the CL7/CL8/CL9 status stays after release, while the last free length or spot is committed and Undo shows `Undo: Trim — …` / `Undo: Move clip`. The logic is unchanged; the user sees "Trim stopped" although an edit was committed.
3. Low C-R138-01 → `deferred_low_polish`: doc 113 l.21 and l.74 read "track-header selector (l.331)-ის selector" (the word twice). This comes from the literal §2 replacement (A Low #3).
4. A Low #1: m60 leaves `gesture-reentry` green. I did not re-run the mutations. m60 is still killed by grid-snap-edit and track-layout.
5. A's Architecture note: test locators that use titles (8 files) could move to `data-testid` in a separate task.
6. The R5 mixed state is as named: library, track headers, detail panel, video dock and the demo badge are still Georgian.
