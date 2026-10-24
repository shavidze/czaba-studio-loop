# C round 134 — VISUAL-A V-0.3a: grid and Snap texts in English

Verifier: C · 2026-10-24 · Target: `http://127.0.0.1:5173/studio-lab` (env-status store 200) · Playwright Chromium, a fresh context per session, 1440×900 and 1280×720.
**Verdict: PASS.** `browserVerified` = `realVerified` = true. New bugs: 0. One row is BLOCKED: the fake-Bearer 403 check (backend unavailable in cloud).
Machine-readable: `c-round-134.json`. Evidence: `c-round-134/{tools,out,shots}/`.

## Offline rows
- **T134-TARGETED — PASS.** I ran A's exact list (`a-round-134/vitest-list.txt`): 23 files and 409 tests, all green. The counts equal A's. Log: `out/vitest.log`.
- **SOURCE-SCOPE — PASS** (checked at the start and the end):
  - HEAD is `ee40ad6`; `git status` shows 16 ` M` + 1 `??` (doc 110).
  - The frozen list (930) is OK, and A's 17 end hashes are OK.
  - `git diff ee40ad6` on the 5 protected files is empty.
  - No source changed during my phase.
- **AN-REVIEW — PASS.** Diffs: `out/src.diff`, `out/tests.diff`, `out/strings-test.diff`.
  - **`strings.ts`:** one new object, `studioGridStrings` (21 keys), with no import. The other objects are untouched.
  - **`grid.ts` and `grid-divisions.ts`:** only the imports and string expressions changed. Every condition, list and number is unchanged, and the `snapEnabled ?` pick stays in the caller.
  - **`ArrangementGridMenu.tsx`:** only the import and l.6.
  - **`StudioWorkspace.tsx`:** only the import, l.158, l.1276, the Snap title picks and the aria-label.
    - A's declared deviation 1: Biome collapsed the 3-line title ternary onto one line, so the baseline `snapEnabled` line was touched. The condition and pick order are the same, so I accepted it and did not record a bug.
  - **The 33 remaining lines:** I extracted them again myself using all three Georgian ranges. They are byte-identical to the baseline minus the 5 migrated lines, and equal to `b-round-133/r134-studioworkspace-remaining-georgian.txt`.
  - **Tests:**
    - `it` counts are unchanged except strings.test (22 → 25).
    - There are 0 skip/only/todo.
    - Both sides of the 9-file diff have the same matchers: 51 `toBe`, 13 `menuItem(`, 4 `getByTestId`.
    - No added line contains Georgian.
    - ST25 holds the 33-line list as literals (it does not read the loop folder) and includes the self-check of the widened pattern.
  - **Meaning:** I compared GR1–GR20 side by side with the Georgian. No fact was dropped or added.
  - **Mutations:** I reviewed the m24–m29 logs, and each turned red as named. I did not re-run them, because C makes no store writes.
  - **Shell writes:** I reviewed A's list: the /tmp helpers, the `a-round-134/*` evidence, and the sed mutations, each restored from `bak/` and checked by sha256. I re-verified the end hashes and the frozen list myself.
  - **Docs:** doc 109 l.4, l.128 and the TODO line are as specified. Doc 110 exists and says C round 134 is still to come.

## Browser rows (valid runs: 1440 r2/r3/r4, 1280 r1/r2 — listed in JSON `validRuns`)
| Row | 1440 | 1280 | What was measured |
|---|---|---|---|
| GRID-SEC | PASS | PASS | Options by value: `10 s` … `0.1 s`. aria-label `Grid division`. Title `Grid 1 s · 1 — narrower, 2 — wider`. Every 1/2 step gave the exact status, with both Snap off and Snap on. The ends: `…narrowest — 0.1 s (1)` and `…widest — 10 s (2)`. `data-grid-seconds` equalled the id at every step. The lane line spacing equalled pps × seconds on every visible lane |
| GRID-MUSICAL | PASS | PASS | **Steps as run** (they differ from the row): Snap off → add a clip on music at 1.3 s (for the effect check) → G (Snap on) → select 0.5 (a prior seconds division, as in GU7) → BPM 120 → 1/4 → 1 ×4 → 2 ×6 → clear the BPM. Without the 0.5 step the cleared text would name the default `1 s`, by design. Optgroup `Bars · 120 BPM`. Statuses `Grid: 1/4 · 0.5 s at 120 BPM (Snap on)` … `1/32 · 0.063 s` … `1 bar · 2 s`. The ends: 1/32 (1) and 1 bar (2). After clearing the BPM: `Tempo cleared — the bars ruler is hidden. Audio is unchanged. Grid back to seconds: 0.5 s.` This closes **GATE132-TEMPO-CLEARED-MIXED** in the browser. The clip `music@1.3+16` was identical at all 14 steps |
| GRID-TRIPLET | PASS | PASS | (a), (b) and (c) gave the exact refusal texts, and the division stayed unchanged. (d) gave `1/4T` with a step of 0.4444 s (= 60/90 × 2/3), optgroup `Triplets · 90 BPM`, title `Grid 1/4T · 1 — narrower, 2 — wider` and status `Grid: 1/4T · 0.444 s at 90 BPM (Snap off)`. The lane menu item `Triplets (3)` has aria-checked=true |
| GRID-HIDDEN | PASS | PASS | At 0.1 s the lines are hidden at 40 and 50 px/s, visible at 62.5 px/s, and hidden again at 50. The title flipped exactly together with `data-grid-lines` on the control and on every lane |
| SNAP | PASS | PASS | Snap is off by default. G gave `Snap on — grid 1 s (G)` with title `Snap on — clips land on the grid (G)`. G again gave `Snap off — free movement (G)`, with the same title. With Snap on, a +0.4 s drag stayed at 2 s and +0.7 s landed on 3.000. With Snap off, +0.4 s landed on 3.400 |
| MENU | PASS | PASS | Menu aria-label `Grid division`. Items `10 s` … `0.1 s` and `Snap (G)` (the ✓ glyph is aria-hidden). Focus opens on the checked `1 s`. ArrowDown and Enter set 0.5 with status `Grid: 0.5 s (Snap off)`, and the menu closes. When reopened, 0.5 s is checked. Escape closes it. Focus goes to BODY after Enter and after Escape, even when the Snap toggle had focus before the right-click: the real right mousedown on the lane already blurs it. "As before" rests on the diff: `ArrangementGridMenu.tsx` changed only in l.6 and one import |
| GEO-COUNT | PASS | PASS | Georgian count = 0 in the counted places, over 95 steps and 83 observed status changes (`out/geo-count.json`). Subtracted by name: the demo-ready load status, the frozen ArrangementClip move statuses after the SNAP drags, and the track names |
| LAYOUT | PASS | PASS | Only the grid select (width 72 → 66, `1 s` vs `1 წმ`) and the two controls right of it (envelope toggle and waveform-zoom: x −6 px, size unchanged) moved more than 1 px. Header `scrollWidth` = `clientWidth` = 223 with no BPM (select 66), BPM 120 (72) and 1/4T (78). **C-R122-02 (225 > 223) no longer reproduces.** The row ran with BPM 120. I also checked C-R122-02's own repro, BPM 90 (`out/hdr90.json`): select 72 px, sw = cw = 223, and the waveform-zoom right edge (498) sits inside the grid control (512) |
| REG-133 | PASS | — | Ctrl+G with no selection gave `To group tracks, select them first — Ctrl+click or Shift+click a track name.` |
| G134-3 | PASS | PASS | The demo opens with the badge. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. The token API returns 401. Fake-Bearer 403: **BLOCKED** (backend unavailable in cloud) |
| PX-NET / REG-HYD | PASS | PASS | 14 valid sessions plus G134-3: 0 forbidden requests, 0 Authorization headers, 0 pageerror, 0 hydration errors. Only the known cart noise appeared |

## Invalid and superseded runs (honesty record)
- **ENV-FIRST-LOAD:** the first session (1440 r1 sec) crashed on the first dev-server load, with a hydration error, "Invalid hook call" and a missing status element. The automatic retry in a new context was clean.
- **Harness errors, not app defects:**
  - The r1/r2 runs at 1440 expected `(Snap on)`, because the task examples show it. The real default is Snap off, and the app always reported its real state. The fixed harness reads `data-snap` and adds a Snap-on pass to GRID-SEC.
  - At 1280 r1, the harness right-clicked the SFX lane, which is below the fold, so no menu opened. It was retargeted to a visible lane in r2.

## Screenshots
I opened 14 valid-run shots: the 8 below, plus `mus-cleared-1280-r1`, `trip-menu-1440-r4`, `menu-open-1280-r2`, `layout-hdr-bpm120-1440-r2`, `snap-g1-1440-r3` and `sec-narrowest-1280-r1`. Each matched its measured text and state.

**Not opened:** sec-widest/select, mus-14/bpm120/narrowest/widest, trip-a/c/d, hidden-back, snap-g2, menu-chosen, reg133, layout-hdr-nobpm, S0/S1/S2, hdr90, g134-3-lab and g134-3-protected-1440. Those rows rest on the DOM measurements in `out/*.json`.

- `mus-cleared-1440-r2.png`: the status line reads the English "Tempo cleared — … Grid back to seconds: 0.5 s." The select shows `0.5 s`, and the clip still starts at 1.3 s with length 16 s.
- `trip-menu-1280-r2.png`: the BPM is 90 and the select shows `1/4T`. The menu lists `10 s` … `0.1 s`, `1/2T` … `1/32T` (✓ on 1/4T), `Snap (G)` and `✓ Triplets (3)`. The status reads `Grid: 1/4T · 0.444 s at 90 BPM (Snap off)`. The menu fits inside the 720 px viewport.
- `menu-open-1440-r4.png`: the lane menu shows English items with ✓ on `1 s`, and the focus ring is on `1 s`.
- `layout-hdr-triplet-1280-r1.png`: the header shows Snap · `1/4T` · Env · 1×, with no clipping.
- `snap-drag-1280-r1.png`: Snap is highlighted and the clip sits at 2.000. The status shows the frozen Georgian "no change" move text (V-0.4).
- `hidden-visible-1440-r3.png`: at 62.5 px/s the 0.1 s lines are drawn. The status reads `Grid: 0.1 s (Snap off)`.
- `sec-start-1280-r1.png`: the default state is Snap off with `1 s` selected. The Georgian demo-ready status is expected (a later stage).
- `g134-3-protected-1280.png`: the "Sign in required" card with a Sign In button, and no Studio.

## Ableton
- **CZABA requirement:** met. This is a text-only round, and the measured behaviour is unchanged.
- **Correspondence with Live 12 §6.10:**
  - The narrow/widen wording follows the manual's verbs (confirmed).
  - 1/2/3/G instead of Ctrl+1…4 is a deliberate difference (D-29z24).
  - The refusal rules and the hidden-lines rule are CZABA's own (not applicable).
  - "1 bar" is unconfirmed as a Live menu name.

## Notes for B
1. **Snap default:** Snap is off by default in `/studio-lab`, and future rows should name the Snap state. §1.1/§5 assumed it was on.
2. **GRID-MUSICAL precondition:** the expected `Grid back to seconds: 0.5 s.` needs a prior seconds division of 0.5. I pre-selected 0.5, as GU7 does. Future rows should list that step.
3. **Layout rule:** the LAYOUT "every other box within 1 px" rule cannot hold literally when the select narrows. The neighbouring controls shift x by the width change. I applied the RV-1 exception; B could say so explicitly for V-0.3b–d.
4. **C-R122-02:** the header overflow no longer reproduces, at its own BPM 90 repro or at BPM 120/1/4T. B can consider closing it as fixed-by-text at the polish pass.
5. **No new findings.** C-R133-L1 and the other deferred Lows are unchanged by this round.
