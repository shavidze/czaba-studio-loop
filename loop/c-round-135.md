# C — Round 135 verification: VISUAL-A V-0.3b (Transport, tempo row, ruler, overview, loop brace, navigation statuses → English)

Verifier: C · Date: 2026-10-24 · Baseline `16533c1` (HEAD unchanged) · Target `http://127.0.0.1:5173/studio-lab` · Real Playwright Chromium (headless), a fresh context for every row, **1440×900 and 1280×720**. Snap was **off** in every row (`setSnapOff` confirmed `off`), except REG-134 (G turns it on).
JSON: `c-round-135.json`. Evidence: `c-round-135/{tools,out,shots}/`.

## Verdict: **PASS** — browserVerified = realVerified = **true**
- Every browser row ran at both viewports and passed. The final runs (`out/c135-{1440,1280}-r4-all.json`) had **0 failed checks**: 98 checks at 1440 and 97 at 1280.
- No Critical, High or Medium finding. One **Low** (wording, pre-existing): **C-R135-01**.
- **Blocked:** the fake-Bearer 403 part of G135-3 (backend unavailable in cloud).
- **Gate rows** (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Rows
| ID | Result | Evidence / notes |
|---|---|---|
| T135-TARGETED | PASS | A's exact 21-file list: **21 files, 386/386 tests**, the same counts as A (strings 27, delete-selection-ui 13, grid-snap-ui 20, tempo-ui 12, metronome-ui 10, navigation-strings-ui 5 …). `out/vitest-list.txt` |
| SOURCE-SCOPE | PASS | 13 ` M` + 2 `??`. Frozen list OK at the start and the end. Protected files: `git diff 16533c1` empty. All 15 end hashes equal A's `end-sha256.txt` at the start and the end, so no source changed during my phase |
| AN-REVIEW | PASS | Source diff vs the start copies: `out/src.diff`. Test diff: `out/tests.diff`. Details below |
| TRANSPORT | PASS (both) | Texts and effects, below |
| FOLLOW | PASS (both) | Sequence and effects, below |
| ZOOM-FIT | PASS (both) | Statuses and views, below |
| RULER-OVERVIEW | PASS (both) | Titles, valuetext and double-click, below |
| LOOP | PASS (both) | Brace texts and key effects, below |
| TEMPO | PASS (both) | TR18, TR19 and `Metronome` read exactly. After BPM 120 the clips are unchanged (`sfx@5.00+2.00 stems@0.00+16.00`). The metronome toggles on/off with English statuses (`Metronome is on — 120 BPM, 4/4: …`, `Metronome is off.`) |
| GEO-COUNT | PASS (both) | Net Georgian = **0** over 46 steps at 1440 and 45 at 1280. Subtracted by name, below |
| LAYOUT | PASS (both) | Only text-width changes (RV-1 exception), below |
| REG-134 | PASS | Snap starts `off`; G → `Snap on — grid 1 s (G)` |
| G135-3 | PASS (fake-Bearer BLOCKED) | `/studio-lab`: workspace + demo badge. `/studio/middle-east` at 1440 and 1280: "Sign in required", no workspace, 0 `audio[src]`. Token API **401** `{"error":"Please sign in to access Studio."}`. `out/g135-3.json`, `shots/g135-3-*.png` |
| PX-NET / REG-HYD | PASS | Every session: 0 forbidden requests, 0 `Authorization` headers, 0 hydration errors, 0 pageerrors. Only the known cloud cart noise (2 per session) |

### AN-REVIEW details
- **`strings.ts`:** only added keys, in the six existing objects (playback +3, edit +7, loop +6 plus `braceTitle`, tempo +2, metronome +1, view +23 plus three formatters). No new object, no import, no assertion. Formatters take values that are already formatted.
- **Components:** only the import and the §2 lines changed.
  - The Transport delete-hint caller shape is exactly as specified; `deleteHint` was removed.
  - All ternaries keep their conditions and pick order, and JSX text became `{object.key}`.
  - A's incident (§10, a short `PLACEHOLDER` overwrite) left no trace: the Transport diff holds only the §2 hunks.
- **StudioWorkspace:** import plus the 10 lines.
  - The 33 Georgian lines in the start copy and the 23 in the current file: 0 lines are new, and 10 were removed.
  - The remaining 23 are byte-identical. B's list file stores `${` as `{`, which is the same normalisation ST25 applies.
- **Tests:**
  - Every replaced pin is a hand-written English literal with the same matcher.
  - ST maps grew only by additions; ST25 = 23; ST26 and ST27 are new.
  - The new `navigation-strings-ui.test.tsx` has 5 `it`s with literal `toBe` assertions, no strings import, no Georgian, and no skip/only/todo.
  - No other `it` was added, removed or renamed.
- **Docs:** doc 110 changed only l.4, 132 and 136. Doc 111 holds the TR/NV map, R1–R3 and the facts, and names C round 135 as still to come.
- **§1.1 facts:** every listed fact survives in English.
  - Gap and Delete/Backspace; Cut Time on Ctrl+Shift+X; "on all tracks" only for an all-tracks range.
  - Both edges vs playhead; the bar moves the loop and the edges change its length.
  - The tempo field: grid only, not stretched, Enter, Esc, empty hides the bars.
  - Three Follow states; the NV10 remedy; both double-click places; the 5 s step.
  - Both ways back in NV17; extent and times plus "X goes back" in NV20/NV21; "one more step" only in NV22.

### TRANSPORT (both viewports, identical results)
- **Setup:** stems `demo-stem-pulse` at 0 (0–16 s), SFX `demo-soft-impact` at 5 (5–7 s), project end `00:16.000`.
- **(a) nothing selected:**
  - TR1/TR2; `/ end 00:16.000`; TR5; TR8/TR9/TR10; TR12 (the Loop button is disabled with no range and no loop; its title is still TR12);
  - NV3, NV4/NV5, NV6/NV8, NV10, NV11.
  - The r4 run of (a) still had the last-added clip selected (Escape does not deselect). I therefore re-ran a **true empty selection** (a click on the empty music lane): `out/c135-{1440,1280}-r5-none.json`.
    - Split and Delete are disabled, and every (a) text is exact at both viewports (17 checks each, 0 fails).
    - Shot: `tr-a-true-none-1280-r5.png` (detail panel `არაფერია არჩეული`, Split/Delete dimmed).
  - Back to start: playhead 3 s → **0**.
- **(b) clip selected:** TR5, TR8, TR9, TR10, TR12, NV8.
  - Clicking Delete removes the stems clip and leaves the SFX clip (a gap). Undo restores it exactly.
- **(c) one-track range 4–8 on stems:** TR4, TR6 as both title and aria-label, TR10, TR11, NV7.
  - Split → `stems 0+4, 4+4, 8+8`.
  - Delete → `stems 0+4, 8+8`, SFX untouched (a gap on that track only).
  - Undo restores each.
- **(d) Ctrl+Shift+L:** TR4, TR7 as title and aria-label, TR10, TR11, NV7.
  - Delete → `stems 0+4, 8+8`, and the SFX clip 5–7 is removed as well (a gap on all tracks).
  - The status reads `⌫ Deleted 00:04.000 — 00:08.000 on all tracks; the gap remains.` Undo restores.
- **Screenshots:**
  - `tr-c-1280-r4.png`: orange `⌫ Delete`, `/ end 00:16.000`, the range 00:04–00:08 on stems. The range readout under the lanes is still Georgian, which is the accepted mixed surface.
  - `tr-d-after-delete-1440-r4.png`: a gap on both tracks.

### FOLLOW (both)
- **Setup:** zoom slider at its max (**320 px/s**) before Play, so the project is wider than the view.
- **On:** scrollLeft 0 → 590 (1440) / 970 (1280) with the playhead inside the view. Follow really follows.
- **Manual horizontal wheel during playback:**
  - `data-follow-mode=paused`, title **NV2**, status **NV17**, recorded by the MutationObserver.
  - The view stays still for 1.25 s while the playhead runs.
  - `follow-paused-1280-r4.png` shows the amber `Follow ⏸` and the NV17 status while playing (Pause button).
- **No pause while stopped:** a wheel scroll while playback is stopped leaves Follow `on`, title NV3 (RULER-OVERVIEW `scrolled` step, both viewports, `out/c135-*-r4-all.json`). Pause happens only during playback.
- **Click 1:** on, **NV25**, title NV3; the view follows again.
- **Click 2:** off, **NV24**, title NV1; the view stays still for 2.3 s while the playhead moves.
- **Click 3:** on, **NV26**, title NV3; the view follows. Then Stop.
- **Addendum (`out/fitplay.json`):** Fit pressed during playback also pauses Follow (title NV2). The observer saw only the Fit status; NV17 was never rendered. The task text says Fit's own status replaces NV17. The code did not change this round, so this is a note for B, not a bug.

### ZOOM-FIT (both)
- **Z with no range:** NV18.
- **X with an empty history:** NV19, title NV10.
- **Fit:** `Fit: the entire project is visible (00:16.000). X goes back.` Title NV9. 57.1 / 47.1 px/s, scrollLeft 0, 16 s = 914 / 754 px ≤ viewport (the whole project is visible).
- **Range 3.998–7.996, then Z:** `Zoom to selection: 00:03.998 — 00:07.996. X goes back.` 137.8 / 113.8 px/s, with the range fully visible.
- **X:** NV22, title NV9, back to the exact Fit view.
- **X:** NV23, title NV10, back to the exact start view (40 px/s, scrollLeft 0).
- **X:** NV19.
- **Screenshots:** `zoom-fit-*`, `zoom-z-*`, `zoom-x2-*`.

### RULER-OVERVIEW (both)
- Ruler title NV13, playhead title NV12, overview aria-label NV14, title NV15. `aria-valuetext` = `Visible start 00:00.000 / 00:16.000`.
- **After zoom and a wheel scroll:** `Visible start 00:10.000 / 00:16.000`, i.e. the start changes with the scroll.
  - The start is rounded to whole seconds by the existing `Math.round` in `ArrangementOverview` l.97 (unchanged code). At scrollLeft 839 and 87.9 px/s that is 9.545 → 10.
- **Overview ArrowRight:** +5 s (439 px).
- **Double-click on the ruler with no range:** NV20 and the whole project visible; valuetext `Visible start 00:00.000 / 00:16.000`. Shot: `ruler-dblclick-fit-*`.

### LOOP (both)
- **No loop:** strip text TR13.
- **Range 4–8:** Transport Loop title TR11.
- **Ctrl+L:** brace aria-label `Loop 00:04.000 — 00:08.000 · ← → nudge · Shift + ← → length`, title TR15, edge titles `Loop start` / `Loop end`. The status is the already-English `Loop created and turned on: …`. Shot: `loop-on-1440-r4.png`.
- **Clearing the range** (a click on the empty music lane) → TR12, and `aria-pressed=true` stays.
- **ArrowRight on the focused brace:** 4–8 → **4.1–8.1** (Snap off).
- **Shift+ArrowRight:** → **4.1–8.2** (only the length changes). Statuses: `Loop: 00:04.100 — 00:08.100.` and `Loop: 00:04.100 — 00:08.200.`

### GEO-COUNT
- **Scope:** every title, aria-label, valuetext and text of the transport bar; the tempo field and metronome; ruler and playhead; overview; loop strip and brace; the status region at every step and every observer record.
- **Net 0 at both viewports.**
- **Subtracted by name:** the clip-added status. It is English, but it contains the demo source title `ღამის პულსი · პულსი` and the track name `სტემები` (library/track data, V-0.4/V-0.5).
- **Visible but outside the counted surfaces (accepted, named in the task):**
  - the range readout under the lanes (`… Delete = წაშლა, სიცარიელე რჩება …`, V-0.3d);
  - the selected-clip readout;
  - library, detail panel and video dock (V-0.4/V-0.5);
  - the header `· სამუშაო სივრცე`;
  - the demo badge.

### LAYOUT (both)
Compared with `c-round-125/out/bbox-baseline-*.json` (S0, S1, S2 via `tools/layout130.cjs`; `out/layout-compare.json`):
- `/ end` is narrower than `/ ბოლო`. Undo, Redo, Split and Loop shift x by −7.5 to −8.5 px with **unchanged size**.
- The Delete button: 89 → 88 px wide, x −7.5. Back to start, the tempo input and Metronome (76 px) keep identical boxes.
- The grid-select deltas come from round 134. The remaining key-only differences are renamed aria-labels and the already-English Export dialog/group status.
- **Overflow:** the transport bar and tempo row have `scrollWidth == clientWidth` at both viewports, with no selection, with a range, with an all-tracks range and with BPM 120.
- **Wrap:** at 1280 the transport bar already wrapped to two lines before this round (the tempo row y 258.5 equals the baseline), so it is not a new wrap.

## Screenshots opened and described (`c-round-135/shots/`)
| Shot | What it shows |
|---|---|
| `probe-1440.png` | Fresh empty project: `/ end 00:00.000`, `⌫ Delete`, `Metronome`, loop hint TR13; the demo-ready status |
| `tr-a-true-none-1280-r5.png` | Nothing selected: Split/Delete dimmed; the detail panel says nothing is selected; the transport reads in English; the 1280 transport sits on two lines (as before this round) |
| `tr-b-1280-r4.png` | Stems clip selected (outline, handles); Split and Delete enabled; `/ end 00:16.000` |
| `tr-c-1280-r4.png` | One-track range 4–8 on stems; orange `⌫ Delete`; the Georgian range readout below (accepted, V-0.3d) |
| `tr-d-after-delete-1440-r4.png` | All-tracks Delete: a gap 4–8 on stems; the SFX clip gone; status `⌫ Deleted 00:04.000 — 00:08.000 on all tracks; the gap remains.` |
| `follow-paused-1280-r4.png` | Playing (Pause button), 320 px/s, amber `Follow ⏸`, status NV17 |
| `follow-off-1440-r4.png` | Playing at 00:09.041 with Follow off; status NV24; playhead near the right edge, view not moving |
| `zoom-fit-1440-r4.png` | 57.1 px/s, ruler 0–16 s fully visible; status NV20 `(00:16.000)`; `↩ Zoom` enabled |
| `zoom-z-1440-r4.png` | 137.8 px/s; range 00:03.998–00:07.996 framed in the middle of the view; status NV21 |
| `zoom-x2-1280-r4.png` | Back to 40 px/s; `↩ Zoom` disabled again; status NV23 |
| `ruler-scrolled-1440-r4.png` | 87.9 px/s scrolled to ~10–19 s; the overview frame on the right part |
| `ruler-dblclick-fit-1280-r4.png` | After the ruler double-click: 47.1 px/s, whole project visible, status NV20. The playhead is at 19.894 because the first click of the double-click is "Click = playhead" (existing behaviour) |
| `loop-on-1440-r4.png` | Amber Loop brace 4–8; strip label `Loop 00:04.000 — 00:08.000`; status `Loop created and turned on: …` |
| `loop-nudged-1280-r4.png` | Range cleared, Loop button on (amber); brace 4.1–8.2; status `Loop: 00:04.100 — 00:08.200.` |
| `tempo-none-1440-r4.png` | Empty BPM field, dimmed `Metronome`, hint `Bars: set a BPM — grid only, audio is not stretched` |
| `tempo-met-on-1280-r4.png` | BPM 120, bars ruler 1–10, `Metronome` highlighted, status `Metronome is on — 120 BPM, 4/4: …`; clips at the same places |
| `g135-3-protected-1440.png` / `-1280.png` | "Sign in required" with a lock and a Sign In button; no workspace |
| `g135-3-lab-1440.png` | New context without credentials: the `/studio-lab` workspace with the amber demo badge (`დემო კოლექცია — ავტორიზაცია არ სჭირდება`), an empty project, English transport |

## Bugs
- **C-R135-01 (Low, wording → `deferred_low_polish`):**
  - **Problem:** the brace hint TR13 says `press ↻ Loop (Ctrl+L)`, while TR11/TR12 say `(Ctrl/Cmd+L)`.
  - **Origin:** carried over from the Georgian original and dictated verbatim by §1.1 (the reviewer noticed it too). It is not a regression.
  - **Repro:** a fresh `/studio-lab`; compare the Loop strip hint with the ↻ Loop button title.

## CZABA requirement vs Ableton correspondence
- **CZABA requirement (V-0.3b, text only, behaviour unchanged): met.**
- **Ableton correspondence** (Live 12 manual, as cited in task §6; no new Live behaviour is claimed):

| Behaviour | Correspondence | Basis |
|---|---|---|
| Follow on / paused / off | Confirmed | §6.2 text plus the observed effect |
| Follow resumes with Follow or Play | Deliberate difference | A subset of Live's ways to resume |
| Z / X, repeatable | Confirmed | §6.2, §42 |
| Ruler double-click → Fit | Confirmed | §6.1 |
| "Fit" as a command name | Unconfirmed | Live names no command "Fit" |
| Split Ctrl/Cmd+E | Confirmed | §42 |
| Split at the playhead without a selection | CZABA addition | — |
| Delete leaves a gap; Cut Time = Ctrl+Shift+X | Deliberate difference | User decision 2026-10-11 |
| Loop brace nudges a fixed 0.1 s (Snap off) | Deliberate difference | Live nudges by the grid |
| BPM / metronome | Not re-checked this round | — |

## Invalid runs and harness iterations
- **No environment-invalid runs.**
- The early runs (r1 at 1440, r2 at both viewports, r3 at 1440) exposed **C harness defects**, fixed before the final r4 runs:
  - the wheel ran at scrollLeft 0;
  - the double-click landed on the sticky lane-header column;
  - Escape does not clear a time range (a lane click does);
  - the raw detail value was not formatted;
  - the overview rounds to whole seconds.
- These are not product failures and are not counted as measurements.
- **Final evidence:** r4 at both viewports, plus the r3 single rows at 1440.

## Notes for B
1. Fit or X during playback pauses Follow, but NV17 is never rendered: the action's status replaces it in the same tick (an inference). The code is unchanged; this is info only. If B wants both statuses announced, that is a behaviour task.
2. Z frames the range with margins: a 4 s range fills about 48% of the view, centred. The code is unchanged.
3. A's reviewer Architecture note is passed on: split `strings.ts` into `strings/<area>.ts` after V-0.3d and keep the `~/lib/arrangement/strings` re-export. The strings-split checkpoint (e–g) is still unanswered.
4. Doc 111 still says the C browser check is pending. B or root may record this PASS.
5. **Outcome per §8:** C PASS, so V-0.3b → `c_pass`. Round 136 = V-0.3c (MarkerRow + MarkerMenu), unless B plans on or after 2026-10-27, when the regression round comes first. C-R135-01 → `deferred_low_polish`.
