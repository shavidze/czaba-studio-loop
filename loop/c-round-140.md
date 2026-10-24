# C — Round 140 verification (VISUAL-A V-0.4c: envelope, group header, meter and Master Peak texts)

**Verdict: PASS** · `browserVerified` = `realVerified` = **true** · new bugs: **0** · env: `env-status.json` round 140, store 200 (17:22:04Z).

Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, each session in a new context, Snap was `off` at the start of every session (env/group/meter/reg at both viewports; `snapAtStart` in the JSONs). I ran the full set at **1440×900 (r2)** and **1280×720 (r1)**. 1440 r1 was single-row development runs. Expected strings are written by hand from task §1.1; nothing is imported from the app.
Evidence: `c-round-140/out/c140-1440-r2-all.json`, `c140-1280-r1-all.json` (78 OK / 0 fail each), `run-*.log`, screenshots under `c-round-140/shots/`, tools under `c-round-140/tools/` (`c140.cjs`, `g140-3.cjs`, `layout130.cjs`).

## Rows

| Row | Result | Evidence |
|---|---|---|
| T140-TARGETED | PASS: 17 files, 244/244, exit 0 (equals A's count) | `out/vitest-17.json`, `vitest-17.log` |
| SOURCE-SCOPE | PASS: HEAD `3f2c187`; `git status` = exactly the 16 granted paths; the frozen list (943) is OK at start and end; A's `end-sha256.txt` is OK at start and end; protected diff vs `3f2c187` is empty; the full tree sha snapshot is identical at C start and end, so no source changed during C's phase | `out/c-start-tree.txt`, `c-end-tree.txt` |
| AN-REVIEW | PASS: the 4 components change only the strings import and §1.1 lines (no handler, condition, class, testid or glyph change; `toFixed(3)` + `seconds()` in all 5 time sites; EV4 = `historyUnchanged('Envelope')`; GH2/GH6/GH11 reuse lane strings; both branches stay in the caller). strings.ts: 9 EV keys appended, the 4 old keys byte-identical, 2 new objects after `studioLaneStrings`, no import. Pins: 31 lines, hand-written English with the same matchers and anchors. The new HM file and ST38/39 have no expectation built from a module value (grep), and the HM file imports no other test file. The l.1623 hunk is only the 4 EV literals in `EXPECTED_CLIP_ENVELOPE_STRINGS`. A's deviations 1–3 were checked and are minimal. Docs 113/115 change only the named lines | `out/an-diff-src.txt`, `an-diff-strings.txt`, `an-diff-pins.txt`, `an-diff-strings-test.txt` |
| ENVELOPE | PASS at both viewports: editor title EV10; double-click at 6 s → `Envelope: point added — 6.000 s · 0.0 dB.`, Undo `Undo: Envelope: add point`, point title EV5; drag beyond the threshold and back → EV4 with the Undo title unchanged; drag down → live `Envelope: 6.000 s · −14.0 dB` (no final `.`), release → `… −14.0 dB.`, Undo `Undo: Envelope: move point`, point title updated; Ctrl+Z → gain `1.0000`, title back to 0.0 dB, Undo back to `add point`; double-click the point → `Envelope: point deleted — 6.000 s.`, Undo `Undo: Envelope: delete point`. **Real audio (output tap, same position 6.1–7.3 s, paired):** 0 dB vs −14 dB point = **13.98 dB** (1440) / **14.73 dB** (1280, gain 0.1837) ≥ 6 dB | `shots/env-*.png` |
| GROUP-HEADER | PASS: Ctrl+G music+stems → 1 group row; name `ჯგუფი 1 — group, selected`, title GH1; fold `Fold or unfold group — ჯგუფი 1`, title `Fold / unfold (U)`; fold with one member clip → `aria-expanded=false`, 0 member clips rendered, **`ჯგუფი 1 — group, folded, 1 clip, selected`** (singular, real browser); with 2 member clips → `ჯგუფი 1 — group, folded, 2 clips`; unfold restores; unselected `ჯგუფი 1 — group`; F2 → input `Group name — ჯგუფი 1`; typing then Escape keeps the name and label | `shots/group-*.png` |
| GROUP-MIX | PASS: Mute `Mute — ჯგუფი 1 (group)`, Solo `Solo — ჯგუფი 1 (group, Ctrl/Cmd+click = add to solo)` with title `Solo (Ctrl/Cmd+click = add to solo)`, Volume `Volume — ჯგუფი 1 (group)`; ArrowLeft `+0.0 dB` → `−0.1 dB`. **Real audio (paired, same position):** group Mute on members region −20.7 dBFS → digital silence (drop ≈179 dB), unmute restores (Δ −0.02/−0.08 dB); group Solo → the non-member sfx region −19.6 dBFS → silence (≈180 dB), members still sound (Δ 0.0 dB); Ctrl+click Solo on sfx → both `aria-pressed=true`, sfx region sounds again (Δ +0.07/+0.05 dB) | `shots/group-solo-two-*.png` |
| METER | PASS. The Master latch did **not** trip at Master 0 dB (music full mix + stems pulse + sfx bass at 0 s: Master Peak `Master Peak −0.2 dBFS — click to clear`, output-tap peak −0.19 dBFS). At **Master +6 dB** it tripped: `Master Peak +5.8 dBFS — overload (Clip). Click to clear` (MT5). Track over driven for real: +12 dB Clip Gain on the full-mix clip → `მუსიკა · Peak +7.3 dBFS — went above 0 dBFS. Click Master Peak to clear` (MT2) and sr-only `მუსიკა: the level went above 0 dBFS` (MT3); tracks that stayed under 0 dBFS have MT1 only (`სტემები · Peak −10.6 dBFS`, `SFX · Peak −13.3 dBFS`, `ვიდეო · Peak −∞ dBFS`). Master Peak click → `Master Peak −∞ dBFS — click to clear` (MT4); Undo title unchanged, status unchanged, 0 status mutations; all track titles back to MT1, sr-only gone | `shots/meter-*.png` |
| GEO-COUNT | PASS: **net 0** at all 38 steps (19 per viewport; net sum 0 and 0 `GEO` residue lines in both run logs). Removed before counting (R5): default group name `ჯგუფი N` (V-0.4d) in the group row, status and Undo labels; default track names in meter titles, sr-only text and status (V-0.4d); demo source names in status and Clip Gain status/Undo (data); the demo-ready load status (V-0.5). The detail panel, library and dock were not scanned (V-0.4e/V-0.5) | `geoSteps` in the run JSONs |
| LAYOUT | PASS for S0/S1/S2: **0** element deltas >1 px vs round 139 at both viewports (111/122/131 and 103/121/130 elements). Group row: **inconclusive vs a baseline.** No stored round-139 group-row baseline exists, and C cannot run the old tree. The only historical value is round 126 `d3a-summary.json` groupRow height 28, which matches. Recorded now: row h 28; fold/name/M/S 24 px; name w 79; fader 48×4. The same values at both viewports. Round 140 changes only attributes, not visible group text | `out/layout-compare.json`, `layout130-*.json`, `shots/group-row-*.png` |
| REG-139 | PASS: `მუსიკა — set as the active track, selected`, `Solo — მუსიკა (Ctrl/Cmd+click = add to solo)` | run JSONs |
| G140-3 (alone, last) | PASS: `/studio-lab` shows the workspace and demo badge; `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]` (1440 and 1280); `GET /api/studio-token` → **401**. The fake-Bearer 403 check is **BLOCKED** (backend unavailable in cloud) | `out/g140-3.json`, `shots/g140-3-*.png` |
| PX-NET / REG-HYD | PASS: 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror in all sessions (only known cart noise: 8 per full run) | `net` in the run JSONs |

Gate rows (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Invalid / superseded runs (harness, not app)
- `c140-1440-r1-group` `escape-keeps-name`: my check compared the button text to `ჯგუფი 1`, but the text includes the `▣` glyph. The script now compares the text before and after F2+Escape, and both later runs pass.
- First `c140-1440-r1-meter`: +12 dB Clip Gain on the bass clip peaks at −1.3 dBFS, so no track went over. I moved the boost to the full-mix clip. The rerun **overwrote** `c140-1440-r1-meter.json` and its shots; the −1.3 dBFS value above is the only record of the first run.

## CZABA requirement vs Ableton correspondence
| Behaviour | CZABA requirement | Ableton correspondence |
|---|---|---|
| Envelope point texts | Met (browser + real audio) | Unconfirmed: §26.6.1/§42.7 are TOC titles only. “point” vs Live “breakpoint” is a **deliberate difference** |
| Group header texts | Met | Unconfirmed: §18.3 “Group Tracks” is a title only. The Undo labels `Group Tracks`/`Ungroup Tracks` match that title |
| Meter / Master Peak | Met | Not applicable / no claim: §38.3 is the CPU overload indicator, not the clip indicator |
| Solo Ctrl/Cmd+click adds | Met (real audio) | Unconfirmed (Mixer chapter not captured) |

## Notes for B
- A's deviations 1–3 are minimal, keep the matchers, and touch no non-granted file. C sees no problem; B ratifies them.
- C-R86-OBS (“default export peaks above 0 dBFS”) does not describe the current demo, which starts empty. A 3-clip setup peaks at −0.2 dBFS at Master 0 dB. Future METER rows should plan for Master +6 dB or a Clip Gain boost.
- C-R139-01 and C-R139-02 (pre-existing Lows, `deferred_low_polish`) are out of scope this round and were not re-tested.
- Outcome per task §8: C PASS → V-0.4c `c_pass`; round 141 = V-0.4d unless a regression round is due (2026-10-27 or later).
