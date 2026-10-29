# C round 256: SABA-B-9 stage 1 (centre transport, Stop, honest Play) — independent verification

**Verdict: FAIL.** One Medium finding: **C-R256-01**, an accessibility regression this round caused. While playing, the UI now exposes no programmatic playing state. Every acceptance row of §3 that can run here was run in a real browser (Playwright Chromium, fresh contexts, 1440×900 and 1280×720), and all of them pass. The FAIL comes only from C-R256-01. B's spec caused it (§2.3 has no programmatic replacement and lists no deviation for the loss). A's implementation did not; A's code-reviewer had already flagged it as M-2. So the fix-up needs a B ruling.

- `browserVerified` / `realVerified`: **true**.
- The HEAD control was a `git archive HEAD` copy (`a061d52`) on :5180, stopped at the end.
- Evidence: `c-round-256/` (script `c256.cjs`, results `browser/c256.json`, screenshots `browser/*.png`, `a11y.cjs`, `browser/a11y-playing-state.json`, `unit.log`, `mutants.log`, `collisions-1.diff`, `collisions-ts.diff`, `source.diff`, `scope-start.txt`, `scope-end.txt`, `checkpoint.txt`).

## Bugs for B

### C-R256-01 (Medium, a11y regression; spec-induced): the playing state is visual-only
**Steps:**
1. Fresh context, `/studio-lab` at 1440×900. Wait for `Demo collection ready`.
2. Add `demo-stem-pulse`, then click Play.
3. Inspect the transport buttons' accessible names and states, and the live regions (`ariaSnapshot`, `aria-pressed`, `[aria-live]`/`role=status`).

**Expected:** the playing state is programmatically determinable, as an equivalent of the new brass on-state (WCAG 1.3.1 / 4.1.2, Level A). HEAD exposed it through the button name `Pause`.

**Actual:**
- **New build:** `button "Play"` and `button "Stop"` in both states, no `aria-pressed` and no `aria-describedby`. The status live region does not change on Play (status log length unchanged).
- **HEAD:** `button "Pause"` while playing.
- So the brass fill is the only playing signal, and a screen-reader user cannot tell whether playback runs. Hearing the audio does not cover this: the playhead can be in silence, before the first clip, or the project can be muted.

**Evidence:** `c-round-256/browser/a11y-playing-state.json` (new vs HEAD snapshots), script `c-round-256/a11y.cjs`.

**Cause:** §2.3 requires a constant name and gives no replacement. A's reviewer raised it as M-2 / A-R256-REVIEW-PLAYING-SR-STATE; it was not fixed because the spec did not allow it.

**For B's ruling:**
- The options A listed are `aria-pressed` on Play, which A says misdescribes the button, or a "Playing" status, which needs a context change. Two more candidates are an `aria-describedby`/sr-only "playing" state on Play, or a `role="status"` text inside the transport.
- One of these candidates appears to fit within grant 1 (`ArrangementTransport.tsx`). That is for B to scope; C makes no fix.
- It is also part of SABA-Q-9-TRANSPORT (d).

### C-R256-02 (Low → `deferred_low_polish`): three render-budget cleanup Stop clicks lost the implicit "still playing" check
- **Where:** `render-budget.test.tsx` new l.348, l.371 and l.472. At HEAD, `getByRole('button',{name:'Pause'})` there implicitly asserted that playback was still running after the second Play.
- **What happened:** after the rename, `name:'Stop'` always resolves, so the check is gone. A added explicit `data-playing` pairs at l.411, l.454 and l.611 (reviewer M-1), but not at these three sites.
- **Classification:** this is the same class of loss A fixed elsewhere. It is a test-strength gap only; the browser shows correct behaviour.
- **Fix:** add `expect(Play.dataset.playing).toBe('true')` before each of those clicks.

## Rulings and info for B
- **A's deviation on grant rows 5/6** (`data-playing` pairs added in render-budget and master-ui): **conformant to the §0.1 rule** ("equal or stronger" replacement). `git diff -w` shows no other change in those files. Info only. The row text ("assertions unchanged" / "Nothing else") conflicts with §0.1, so please word future rows as "no assertion lost; equal or stronger replacements allowed".
- **GS14 title** still says "keeps the transport toolbar unchanged" although it now asserts the new order. The title is stale; no assertion was lost. Info.
- **Focus outline** on Stop reads `solid 1px` brass/0.8, offset 2px, in Chromium at DPR 1. This is the shared SABA-B-4 style and predates this round. Info.
- **Known growth window (D-29z483):** 1366×768 and 1407×800 are **87 px new vs 49 px HEAD**. A's breakpoint of 1408 widens the window by about 8 px (1,400–1,407). This is evidence, not a FAIL; it stays part of SABA-Q-9-TRANSPORT (c).
- **A's other reviewer notes** (Low A-R256-REVIEW-SPACE-ON-FOCUSED, Info A-R256-REVIEW-STALE-GUARD and the Architecture note `play()`/`stop()` commands) go to B as A reported them. C did not reproduce the stale-guard window.

## Acceptance rows
| ID | Result | Evidence |
|---|---|---|
| C-SCOPE-256 | **PASS** | HEAD `a061d52`. The status equals the 14 grant paths exactly. Frozen tree (1,099) rc 0, root files rc 0, the 7 protected files rc 0. Checked at the start and the end (`scope-start.txt`, `scope-end.txt`). |
| C-UNIT-256 | **PASS** | The 12 §2.7.3 files: **12 files / 220 tests passed** (`unit.log`). Mutants on a scratch copy (`/tmp/c256-mut`, the real source verified untouched): **M1 → TC2 red** and **M4 → TC6 red** (`mutants.log`). |
| C-COLLISION-256 | **PASS with Low C-R256-02** | C1–C9 each match their §0.1 row (`collisions-1.diff`, `collisions-ts.diff`). No explicit assertion is removed. The additions in TS2, C2 and C3 are stronger. The only gap is three implicit checks (C-R256-02). |
| C-LAYOUT-256 | **PASS** | Measured against HEAD (see the table below). |
| C-STOP-256 | **PASS** (both viewports) | Real output RMS tap, marker 2.000 (see below). |
| C-STATUS-256 | **PASS** | New Play → Stop → dblclick Stop gives the same status text as HEAD Space → Space → Home after 500 ms. Both end at 00:00.000 with marker 0.000; the status log is unchanged in both. |
| C-KEYS-256 | **PASS** | Tab to Play + Space: plays once and is still playing after 700 ms. Tab to Stop + Space: stops once. With a `click` listener on Play and Stop, Space on each focused button produced **0 native click events** at both viewports, so the keyup `preventDefault` suppresses the native click. This is the half TC7 cannot prove (`browser/space-native-click.json`). Enter on Stop while playing: stops. Held Enter used real CDP auto-repeat (40 `repeat` keydowns seen by the page): on Play while stopped, the first press plays and the repeats change nothing; on Stop while playing, the first press stops and the repeats change nothing (position, marker and status frozen). Space with no focus: three presses give the same playing state, marker and status as HEAD. |
| C-ONSTATE-256 | **PASS** | Contrast in both states (see below). `data-playing` goes false → true. Name `Play`, title `Play (Space)` and keys `Space` are constant. The Play box `[779.5,43,32,32]` (1440) and `[699.5,43,32,32]` (1280) is identical in both states. Screenshots `onstate-*`. |
| C-FOCUS-256 | **PASS** | Toolbar Tab stops at both viewports: Undo, Split, Delete, Follow, Play, Stop, Back to start, Zoom slider, Fit, Export. Redo, Loop and zoom-to-selection are disabled in this state. HEAD had Play, Back to start, Undo, Split, Delete, Follow, Zoom, Fit, Export. Outside the toolbar, the full page sequence is identical to HEAD (80 vs 79 stops; the difference is Stop). Ring: `:focus-visible` true with a 1px brass outline after keyboard Tab; after a mouse press, `:focus-visible` is false and the outline is none. `activeElement` is Stop after a double-click. Screenshots `focus-kb-*` and `focus-mouse-*`. |
| C-SHEET-256 | **PASS** | `back-to-start` keys `Home` and `Double-click Stop`; row 40 px (HEAD 20); the action text is unchanged. scrollHeight 1,280 (HEAD 1,260), clientHeight 808 / 646, scrollWidth = clientWidth (718). Every other row equals HEAD per id (action, keys, height). Esc returns focus to "Keyboard shortcuts (?)". |
| C-BUDGET-256 | **PASS** | Persistent text lines outside the timeline, new = HEAD: 1440 empty 85 / demo 101, 1280 empty 69 / demo 85. 0 added, 0 removed. Screenshots `budget-{empty,demo}-{new,head}-*`. |
| C-REF-256 | **PASS** (see the table below) | Every difference is a listed deviation. |
| C-LESSON-256 | **PASS** | `lessons.md` has 58 lines and contains L43, L44 and L45. L43's evidence names "SABA-B-9 stage 1 (round 256, D-29z485)". |
| AN-REVIEW-256 | **PASS** | Doc 193: l.4 is byte-exact. The 7 TEMPLATE headings are in order. Every cited id (TC1–TC9, TS1/TS2/TS6, GS14, DXT2, M1–M5) exists. It is written in Georgian with English terms. |
| LAB-SMOKE-256 | **PASS** | Both viewports: no page errors; playing RMS 0.024; export WAV 48 kHz / 24-bit / 2 ch, 768,000 frames = 16.000 s, 0 NaN, peak 0.2967; **sha256 `1fea093b…033f94`** = round 255. |
| Auth | **PASS** | Fresh incognito context, no credentials. `/studio-lab` opens the demo with `auth_user` = null. `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token`: 401 with no header, 500 with a fake Bearer token, never 200 (the page made 0 token calls). |
| Purchased origin | **BLOCKED** | Backend unavailable in cloud. |
| gate | gate | Full vitest, typecheck, lint, build, verify, e2e smoke: the root gate runs these; C does not claim them. |

### C-LAYOUT-256 numbers (new / HEAD)
| Viewport | Toolbar h | Rows | Centre offset | Overlap / overflow | Clock | Library / dock / ruler / 1st lane top | Floating video |
|---|---|---|---|---|---|---|---|
| 1440×900 | 49 / 49 | 1 | 0 | none / 0 | 24 px line | 84/84/191/275 = HEAD | (8, 523, 272×153) = HEAD |
| 1280×720 | 87 / 87 | 2; centre alone in row 1 (y 43), edit and view in row 2 (y 81) | 0 | none / 0 | 1 line | 122/122/229/313 = HEAD | (8, 371.5, 221.3×124.5) = HEAD |
| 1366×768 | **87 / 49** (D-29z483 window) | 2 | 0 | none / 0 | 1 line | – | – |
| 1408×800 | 49 / 49 | 1 | 0 | none / 0 | 1 line | – | – |
| 1407×800 | **87 / 49** (window) | 2 | 0 | none / 0 | 1 line | – | – |

- **Group DOM order:**
  - edit: Undo, Redo, separator, Split, Delete;
  - centre: Follow, clock, Play, Stop, Back to start, Loop;
  - view: Zoom slider, Zoom to selection, Zoom back, Fit, separator, Export.
- **Screenshots:** `layout-{new,head}-*` and `layout-float-*`.

### C-STOP-256 (1440; 1280 is equivalent)
1. Play from marker 2.000: position 2.0 → 2.89, max RMS > 0.01, no Pause button.
2. Play again: no restart; the position is monotonic 2.89 → 3.021 → … → 3.541, and RMS peaks 0.153 (the pulse stem decays between hits, so single samples dip).
3. Stop: not playing; RMS < 0.001 at +300 ms and for 14 samples up to +1 s; position frozen; marker 2.000.
4. Space: plays from 2.0.
5. A single Stop while stopped: position, marker, status, status-log length and Undo label all unchanged.
6. Double-click Stop: 00:00.000, marker 0.000, Undo label unchanged.
7. Play, then double-click Stop while playing: stopped at 00:00.000 with marker 0, RMS < 0.001 from +300 ms to +1 s, never restarted.

### C-ONSTATE-256 contrast (canvas sRGB round trip, composited on the toolbar surface)
| State | Play fill | Play glyph : fill | Stop glyph : fill |
|---|---|---|---|
| Stopped | rgb(236,230,218) | **15.62** | **13.24** |
| Playing | rgb(201,164,106) (brand) | **8.32** | **13.24** |

### C-REF-256: CZABA requirement vs Ableton conformity (kept separate)
| # | CZABA requirement | Ableton conformity | Observed |
|---|---|---|---|
| R1 transport position | met (centred, offset 0) | deliberate difference (geometric centre; Live only orders the sections) | layout rows |
| R2 separate Play / Stop | met | confirmed | Stop button present and working |
| R3 Space toggles | met (= HEAD) | confirmed | C-KEYS body Space |
| R4 double-click Stop = back to start | met (stopped and playing) | confirmed | C-STOP 6/7 |
| R5 Play while playing | met (no-op) | unconfirmed (manual silent; SABA-Q-9 a) | C-STOP 2 |
| R6 Stop while stopped | met (no-op) | unconfirmed (SABA-Q-9 b) | C-STOP 5 |
| R7 Play on-state | met visually; **not exposed programmatically (C-R256-01)** | unconfirmed (SABA-Q-9 d) | C-ONSTATE, a11y probe |
| R8 position next to the transport | met (clock in the centre group, min:sec) | position confirmed; content is a deliberate difference (min:sec, not bars) | layout order |
| R9 Back-to-start button | met (kept) | deliberate difference (not in Live) | – |
| R10 edit buttons in the toolbar | met (left group) | deliberate difference (Live: Edit menu) | – |

## Next for B
- Rule on C-R256-01. If the playing state is to be exposed, plan the fix-up on grant 1 with a browser row: an accessibility snapshot while playing shows the state, and Play's name stays constant.
- Then re-run C-ONSTATE, C-FOCUS and C-KEYS.
- Add C-R256-02 to `deferred_low_polish`, or fix it in the same fix-up at little cost (render-budget is already granted).
