# Round 437: COPY-PD-VIS stage 2: a filled brass Export button (STUDIO-VIS-7), a CZABA exit link in foreground (STUDIO-VIS-10), and a 1 px resize line between lanes (SABA-LANE-RESIZE-HANDLE)

**Planned by:** B, at the round 436 → 437 planning, 2026-11-10 (`b-round-436.md`).
- The advisor was consulted after orientation.
- The round-436 task is archived as `tasks/round-436.md` [K13].

## Decisions (`backlog.json` v420 → v422, `decisions_log_b`) [K15]
- **D-29z1548:** round 436 is accepted.
  - C PASS, 0 bugs, `browserVerified` true [K22]. Gate 436 published `69de9bd` [K1].
  - STUDIO-VIS-4, STUDIO-VIS-6 and SR-435-2 are done [K14].
- **D-29z1549:** the stage-2 rulings below (`product-designer` consult + B's browser pre-check).
- **D-29z1550:** the sketch review. Lows go to `deferred_low_polish`. TL-R437-02 is fixed by doc 284 in this round.
- **D-29z1551:** "Why we missed it" (below), plus the L61 clause in `lessons.md` [K24].
- **D-29z1552:** the dispatch and the order after this round.
- **D-29z1553 (after the advisor's close review):**
  - the band's origin is corrected to commit `08b9e53`;
  - the border-row hit ruling;
  - the L31 headroom;
  - the L28 check;
  - the round-436 cross-check.

## Read first
- `lessons.md` (60 lines) [K24]. The lessons that apply here:
  - **L61, with its new clause "Hover and drag paint on a hit area":** read paint per state in the browser, and decode a 1-px pixel column. Two traps: pointer capture keeps `:hover`, and cursor utilities on buttons are dead.
  - L2/L15: contrast of a changed colour.
  - L3: boxes.
  - L4: element ruling lines.
  - L23: test collisions, and the full suite on the sketch.
  - L29: tagged claims.
  - L39: screen budget.
  - L56–L58: artifacts and the sketch.
  - L57: C's JSON fields.
- **L38:** never run vitest while a browser probe runs.
- **L59/L60:** run every row to a result. Write `c-round-437/progress.json` after each row. Destructive commands stay inside `c-round-437/`.

## Baseline: HEAD `69de9bd`, clean tree
- `git rev-parse HEAD` is `69de9bd` (gate 436 published) [K1]. At planning, `git status --short --untracked-files=all` is empty [K2].
- **Frozen files:** `b-round-436/r437-frozen-sha256.txt` lists every tracked file except the 13 grants: **1333** entries, rc 0 [K3].
  - Check it from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-436/r437-frozen-sha256.txt`.
  - The 11 protected files (`b-round-318/protected-sha256.txt`) give rc 0, and none of them is granted [K4].

## 0. Why this round
- **Saba's own items come next.** STUDIO-VIS-7 (answer 3: filled brass), STUDIO-VIS-10 (answer 4: CZABA in foreground, arrow muted) and SABA-LANE-RESIZE-HANDLE (Saba 2026-11-10: "the grey hover line between lanes is too thick") are Saba-approved Lows. They are fixed now, not deferred (policy 2026-11-10; D-29z1518).
- **Nothing outranks them in the current order** [K14c]:
  - no Critical or High finding is open;
  - the loop-fixable open Mediums are STUDIO-VIS-5 and SABA-B-12 stage 4 (STUDIO-VIS-3), which Saba's "defer" parks in REVIEW-RECOMMENDATIONS (D-29z1512);
  - every other open Medium is a Tech Lead, root or Saba item.
- **REGRESSION is not due:** `regression-last.json` says 2026-11-10, so it is due at the first planning on or after 2026-11-13 [K7].
- **No Saba answer** on STEM-LANES or the retro-435 questions [K23].

## 1. What the code does today (tagged)
- **Export primary button** (`ArrangementExportDialog.tsx`) [K8]:
  - it is an outline: `border border-brand bg-foreground/5 … text-brand`, with `enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 disabled:cursor-not-allowed disabled:opacity-40`;
  - `disabled={isEmpty || isRendering || isDecoding}`;
  - the label switches to `studioExportStrings.busyButton` ("Rendering…") while rendering.
- **Exit links** (`StudioWorkspace.tsx` header, `StudioNarrowScreen.tsx` below 900 px) [K9]:
  - both are `… text-sm font-medium text-muted hover:text-foreground`;
  - the `ArrowLeft` icon has no colour of its own.
- **Lane height handle** (`ArrangementLane.tsx`) [K10]:
  - unfolded: `absolute inset-x-0 bottom-0 z-20 h-1.5 cursor-row-resize touch-none hover:bg-foreground/50`;
  - while dragging: `bg-foreground/50`;
  - the lane row is `'relative flex border-b border-outline'`.
- **Clip-details top separator** (`ArrangementDetailPanel.tsx`) [K10]:
  - `absolute inset-x-0 top-0 z-20 h-1.5 cursor-row-resize touch-none hover:bg-foreground/50`;
  - the panel is `overflow-hidden border-t border-outline`.
- **Sibling handles that keep `hover:bg-foreground/50`** (sweep, `app/components/arrangement`) [K10b]: clip trim edges ×2, loop-brace edges ×2 and the Library edge. Lane and Detail are the 2 that change.
- **Buttons ignore cursor utilities.** `app/styles/app.css` l.482 is an unlayered `button { cursor:pointer }` [K11]. That is why HEAD's `disabled:cursor-not-allowed` computes `pointer` (`b-round-436/probe/summary.txt`, `exportDisabledEmpty`).
- **Browser at HEAD** (`b-round-436/probe/head/vis-probe.json` and `head-narrow/narrow-probe.json`, both viewports) [K16] [K16b]:
  - **Exit link** at rest: rgb(163,155,142) for both word and arrow; on hover both turn rgb(236,230,218).
  - **Export:** fill `oklab(… / 0.05)`, text brass rgb(201,164,106). Hover goes to 0.08 and pressed to 0.12; busy is opacity 0.4. The box is 113×38.
  - **Lane hover:** the whole 6 px band is painted rgb(125,121,115) (`rows-decoded.txt`, six rows).

## 2. Rulings
B's rulings, from `product-designer` and B's own browser measurement; review in `b-round-436/sketch-review.md`.

**STUDIO-VIS-7: Export.**
- **Rest:** `bg-brand text-brand-foreground`, with `border border-transparent` so the height stays the same as Done/Cancel.
- **Hover and pressed:** hover is `enabled:hover:bg-brand-hover`; pressed is `enabled:active:bg-brand` (it steps back to base).
- **Disabled (empty project or decoding):** keeps `disabled:opacity-40`.
- **Busy (rendering):** `aria-busy={isRendering}` plus `opacity-70`, so "Rendering…" stays readable.
- **No busy cursor.** It was dropped because of the unlayered button rule [K11]; that rule is B-R437-BUTTON-CURSOR-UNLAYERED (Low, pre-existing, deferred).
- **Focus ring:** the shared 1.5 px brass ring with its 2 px offset, unchanged.
- **Element ruling:** *Export busy state: "busy label readable" wins over "disabled opacity-40"*.

**STUDIO-VIS-10: exit link.**
- The link is `group … text-foreground`. The arrow is `text-muted group-hover:text-foreground`. There is no underline.
- The narrow-screen link gets exactly the same.
- **Element ruling:** *exit-link hover: "the arrow lights up" wins over "hover changes the word"*, because the word is already foreground.

**SABA-LANE-RESIZE-HANDLE.**
- **Lane handle:** keeps its `h-1.5` hit box and its focus offset. It paints only a 1 px `::after` with `after:-bottom-px`, which lands on the lane's own border row.
- **Hover:** `hover:after:bg-foreground/25`.
- **While dragging:** `after:bg-foreground/40`. While dragging, the hover class is **swapped out**, because pointer capture keeps `:hover` and the hover class would win (B-R437-DRAG-HOVER-WINS, found and fixed in B's pre-check).
- **The folded branch is unchanged.**
- **The border row is now part of the handle.** The `::after` covers the lane's border row, so a press there grabs the handle. HEAD hit the lane container there and nothing moved (`b-round-436/probe/head-press`, `sketch-press`) [K16c].
  - The visible split line is also grabbable, as Live's split line is.
  - The pointer area grows from 6 px to 7 px. The element box is unchanged.
  - **Element ruling:** *lane border row: "the line you see is the line you grab" wins over "hit area exactly HEAD"*.
- **Detail separator:** it follows, for consistency (`product-designer`), with `after:top-0`. The panel's `overflow-hidden` clips `-top-px`, so on hover the line reads as a light row directly under the dark border row (TL-R437-01, accepted and deferred).
- **Element ruling:** *Detail separator hairline: "box and overflow unchanged" wins over "line overlays the border"*.
- **Siblings out of scope:** clip trim edges, loop-brace edges and the Library edge. They are vertical or sit on the object; Saba named only the line between lanes.
- **Contrast.** Saba's request overrides doc 144's 3:1 hover rule for these two separators. Hover-only paint; the keyboard ring is unchanged. Doc 284 records the override (TL-R437-02).
- **Element ruling:** *lane/Detail separator hover: "Saba's thin line" wins over "doc 144 hover ≥ 3:1"*.

**Tests.**
- Rewritten assertions keep or strengthen every check. DXA5, for example, now also asserts that the hover class returns after release.
- New rows:
  - **NG1b:** the narrow exit link;
  - **ESU1 busy block:** `aria-busy` true, `opacity-70`, no `disabled:opacity-40`.
- Test titles that named the old contract are updated to the new one.

## Reference: how Ableton Live 12 does it
| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Track height resize | Live 12 manual §6.9 "Selecting Clips and Time" (https://www.ableton.com/en/live-manual/12/arrangement-view/, WebFetch 2026-11-10) [K25] | "adjust its height by dragging the split line below the Unfold Track button"; Alt/Option +/− keys; Alt-drag resizes all tracks. The manual says nothing about a hover or drag paint or the cursor | A thin split line: 1 px on the border, faint on hover, a step stronger while dragging; `row-resize` cursor kept. The keyboard Arrow resize already exists. Alt-drag-all is not in scope (not requested) | C5 |
| Primary action in a dialog | No Live reference used. This is CZABA's design system (DESIGN_SYSTEM button variants; product-designer audit STUDIO-VIS-7) | — | Saba-approved filled brass | C3 |
| Header back link | No Live equivalent (Live has no in-app exit to a store) | — | Saba-approved foreground | C4 |
- **Deviations:** none from Live. The hover and drag paint are CZABA choices where the manual is silent; this is not presented as Live behaviour.
- **Product-designer step:** run at planning (states, siblings and C rows). Its rows are C3–C6 below, and the press rows are in C5.
- **Saba note:** the Detail separator follows the lane line for consistency. `user-review/note-round-437-detail-separator.md` tells Saba; it is reverted if he objects. It said the Ableton claim in the policy note is unconfirmed, and this task does not make that claim.
- **No journey row (L54):** no entry, exit or hand-off behaviour changes. The exit link keeps `to="/"` [K9].
- **Screen budget (L39):** nothing new is permanently visible. B measured 138/168/118/144 records, outside the timeline 97/124/86/101, equal on HEAD and the sketch, with 0 text differences (`b-round-436/screens/compare.txt`).

## Why we missed it (SABA-LANE-RESIZE-HANDLE)
- **The band dates from the first resize handle.** The 6 px painted hover band came in with commit `08b9e53` (2026-10-13) [K27]. Round 175 (DUX-R-5b-1, doc 144) only recoloured it, from `accent/60` to `foreground/50`, so that it reached 3:1.
- **C checked colour, never thickness.** Every later C row read tokens or the computed colour on hover. None compared the painted thickness with the reference: Live's manual calls it a split line.
- **The screen reviews could not see it.** The RETRO screen reviews used rest-state screenshots, where hover paint is invisible.
- **The new rule:** the L61 clause "Hover and drag paint on a hit area" (D-29z1551). C checks that it exists (K24).

## 3. What A changes (sketch `b-round-436/sketch-437.patch.txt`, sha256 `88259112492496c19b2cfe59cd4c17627ba93dbf034a905b71956b913a41dde9`, 12 `diff --git` headers) [K5] [K21]
From `store/`, run `git apply ../tmp/studio-real-loop/b-round-436/sketch-437.patch.txt`, then review the result and keep it. The sketch is the whole code change:
- 5 components: `ArrangementExportDialog.tsx`, `StudioWorkspace.tsx`, `StudioNarrowScreen.tsx`, `ArrangementLane.tsx`, `ArrangementDetailPanel.tsx`.
- 7 test files (`b-round-436/sketch-paths.txt`).

**Doc 284.** A writes `docs/implementation/2026/quarter-IV/284-studio-vis-7-10-lane-hairline.md` (284 is the next free number [K6]). The doc must:
- carry the TEMPLATE headings (L26);
- have l.4 exactly `Completed (C round 437 PASS)` (L28);
- cite only tests that exist;
- state in its approach section:
  - (a) the doc 144 override (TL-R437-02);
  - (b) the Detail two-row reading (TL-R437-01, accepted);
  - (c) why there is no busy cursor (B-R437-BUTTON-CURSOR-UNLAYERED);
  - (d) the drag hover swap.

**STOP (L11)** if the sketch does not apply, a covering file is red, or any file outside the grants changes.

## 4. Grants (`b-round-436/grants-437.txt`, 13 paths)
The 12 sketch paths plus doc 284. Nothing else in `store/` may change.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | PASS means |
|---|---|---|
| A1 | `git apply --check` the sketch, then apply it; compare `git diff` with the sketch | Identical, ignoring `index` lines |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-436/covering-files.txt)` | rc 0. On B's sketch: **8 files, 106/106** [K18] |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each; lint gives 205 warnings, the same as on B's sketch [K20] |
| A4 | `bash ../tmp/studio-real-loop/b-round-436/claims-437.sh` | It differs from `b-round-436/claims-437-sketch-output.txt` only in K1 (the scratch hash), K2 (A's tree) and K6 (doc 284 present) |
- **code-reviewer: required** (3+ files). A Medium+ it finds is a STOP unless `sketch-review.md` already rules on it.
- **Full suite:** B ran it on the sketch: 272 files, 4019 tests, rc 0 [K19]. It is a gate row.

## 6. C's acceptance
**Order:** C1, then the browser rows C3–C7 (heaviest first), then the rest.
- Write `c-round-437.md` and `c-round-437.json` as you go.
- Never run vitest during a browser row (L38). Warm up first: `node b-round-415/screens/warmup.mjs http://127.0.0.1:5173`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; the r437 manifest; the protected manifest | Only granted paths changed; both manifests give rc 0 |
| C2 | **PATCH-IDENTITY** | Apply the sketch to a `git archive HEAD` scratch and `cmp` the 12 files with the working tree | All identical; doc 284 is the only extra path |
| C3 | **EXPORT-STATES (browser)** | From the loop root: `node b-round-436/probe/vis-probe.mjs http://127.0.0.1:5173 <abs dir under c-round-437/>`, then `python3 -I b-round-436/probe/summarize.py <dir>/vis-probe.json`. Per viewport, with one clip added, it reads the Export button at rest, hover, pressed (released inside the panel), keyboard focus (Shift+Tab, Tab), disabled (empty project) and busy (frames after the click), plus contrast | Equal to B's sketch output `b-round-436/probe/sketch/vis-probe.json` [K16]: rest rgb(201,164,106) / text rgb(14,13,12) / border transparent; hover rgb(217,184,127); pressed rgb(201,164,106); focus outline brass at 0.8 with offset 2px and `focused` true; empty project opacity 0.4; busy "Rendering…" opacity 0.7 with `aria-busy` "true"; box 113×38 (same as HEAD); `labelOnFill` 8.32 (≥ 4.5) and `ringOnSurface` 5.45 (≥ 3). Look at `export-*.png`: no glow, ring all round |
| C4 | **EXIT-LINK (browser)** | C3's run (header); plus `node b-round-436/probe/narrow-probe.mjs http://127.0.0.1:5173 <abs dir>` (800×900) | Header and narrow: word rgb(236,230,218) at rest; arrow rgb(163,155,142) at rest and rgb(236,230,218) on hover. Boxes as on HEAD: header 70×20 at (12,7); narrow 71×20 at (16,16) (`head-narrow`, `sketch-narrow`) |
| C5 | **LANE-HAIRLINE (browser, L61)** | C3's run: the `::after` per state (rest, hover, drag, drag with the pointer away, released) and the 1-px columns. Then `node b-round-436/probe/rows-decode.mjs <dir>`. Then `node b-round-436/probe/press-export-probe.mjs http://127.0.0.1:5173 <abs dir>` (press on the border row, 1 px above it and 5 px above it, each dragging 20 px down) | Rest: transparent. Hover: `/ 0.25`, 1px, bottom −1px. Drag and drag-pointer-away: `/ 0.4`. Released: transparent. Handle box h 6, the same as HEAD. In the hover column only the border row changes (1440: `… 14,13,12 \| 86,82,77 \| 23,20,16 …`; HEAD painted 6 rows at 125,121,115) [K16b]. Keyboard focus: inset ring, −2px offset, unchanged. The press rows equal `b-round-436/probe/sketch-press/press-export.json`: at both viewports, `border-row`, `1px-above` and `5px-above` each hit `arrangement-track-height` and move it by 20 (HEAD: `border-row` hit `DIV` and moved 0) [K16c] |
| C6 | **DETAIL-HAIRLINE (browser)** | C3's run | Hover `::after` `/ 0.25`, 1px, top 0px; separator box equal to HEAD (h 6). The hover column reads border 36,33,30, then 75,73,68, then surface 22,20,18 (the TL-R437-01 reading, accepted) |
| C7 | **SIBLINGS + SCREEN-BUDGET** | K10b on the working tree. `BASE=http://127.0.0.1:5173 node b-round-435/screens/capture-base.mjs <abs dir>`, then `python3 -I b-round-436/screens/compare.py b-round-436/screens/head/screen435.json <dir>/screen435.json` | K10b gives 5 hits: Clip ×2, LoopBrace ×2, Library ×1. Lane and Detail give 0 hits. Counts 138/168/118/144, outside 97/124/86/101, 0 text diffs |
| C8 | **MUTANTS** | `python3 -I b-round-436/mutants/run.py <scratch copy of the working tree> <dir under c-round-437/ holding covering-files.txt>` | M1–M12 are each red, and the sketch is green (B's run: `b-round-436/mutants/summary.txt` [K17]) |
| C9 | **UNIT** | A2, A3 | As in A2 and A3 |
| C10 | **CLAIMS** | `bash b-round-436/claims-437.sh` compared with `b-round-436/claims-437-planning-output.txt` | The allowed differences are those of B's sketch-scratch run, `b-round-436/claims-437-planning-vs-sketch.diff.txt`, plus K2 (A's tree) and K6 (doc 284). K3 is unchanged. Anything else is a finding |
| C11 | **DOC** | Doc 284 | TEMPLATE headings in order (L26); l.4 exact (L28); cited tests exist; the four approach notes (a)–(d) are present |
| C12 | **G437-AUTH (browser)** | Fresh anonymous context: open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake bearer: BLOCKED (backend unavailable in cloud) |
| C13 | **SMOKE + REAL EXPORT (browser)** | Play about 1.5 s, then Stop. The export half comes from C5's `press-export-probe.mjs` run (one clip, Export WAV, download saved, bytes read, then deleted) | The clock advances, then holds. Equal to `b-round-436/probe/sketch-press/press-export.json` `export` [K16c] at both viewports: `czaba-studio-lab.wav`, 29189420 bytes, `RIFF`…`WAVE`; afterwards the button reads "Export WAV" at opacity 1 with `aria-busy` "false"; Esc closes the dialog |
| C14 | **SOURCE-SCOPE** (end) + **L57** | As C1; then `python3 -I tools/l57-check.py c-round-437.json c-round-437/l57-check.txt` | As C1; then rc 0 |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** List them under `"gate"` |

- **C's JSON:** all L57 fields. `mutantRedOnSketch` names `b-round-436/mutants/summary.txt`. Every bug carries an enum `origin`.
- **Ableton conformance:** §6.9 split line (C5) and no listed deviation. The paint is CZABA's own; record "manual silent" rather than "matches Live".
- **Neighbouring behaviour that could break:**
  - lane resize by drag and by Arrow keys;
  - fold/unfold of a lane;
  - Detail panel resize and collapse;
  - the Export flow (WAV, MP3, both; Cancel; Done disabled while rendering);
  - the `?` sheet and the status line in the header.

## 7. Claims
- **Script:** `b-round-436/claims-437.sh`.
- **B's run at planning:** `b-round-436/claims-437-planning-output.txt`, with stderr in `claims-437-planning.err`.
- **On the sketch scratch:** `claims-437-sketch-output.txt`, diffed against the planning run in `claims-437-planning-vs-sketch.diff.txt`.

| Claim | What it checks |
|---|---|
| K1 | HEAD and gate 436 |
| K2 | Tree status: total, and paths outside the grants |
| K3 | The frozen manifest |
| K4 | The protected manifest, and how many protected files are granted |
| K5 | The sketch applies |
| K6 | The last implementation doc; doc 284 is absent |
| K7 | The regression date |
| K8 | The Export button classes and attributes |
| K9 | The exit link classes (header and narrow) |
| K10 | The lane and Detail separator classes, and their containers |
| K10b | SWEEP: siblings with `hover:bg-foreground/50` |
| K11 | `app.css` l.482, and the brand-hover token |
| K11b | SWEEP: old tokens and testids in the test roots `app/**/__tests__`, `perf`, `e2e` |
| K12 | The cited artifacts exist |
| K13 | The archived task |
| K14 | Backlog ids (`tools/find-ids.py`, location column dropped because the optimizer archives done ids) |
| K14c | The open Critical/High/Medium ids and their statuses |
| K14b | SR-435-1/2 |
| K15 | The backlog version and the last D-ID |
| K16 | The probe values, HEAD and sketch |
| K16b | The decoded lane column |
| K16c | The press and real-export probe, HEAD and sketch |
| K17 | The mutants |
| K18 | The covering run |
| K19 | The full run on the sketch |
| K20 | Typecheck and lint on the sketch |
| K21 | The review names the sha; `l58-check` |
| K22 | C round 436 and its L57 check |
| K23 | Saba's answers |
| K24 | The `lessons.md` line count and the L61 clause |
| K25 | The Live manual quote (web source, not re-runnable) |
| K26 | L31 timeout headroom of the covering set on the sketch (`b-round-436/l31-headroom.txt`): max 15 % |
| K27 | Origin of the 6 px band (`git log -S`) |
| K28 | L28: `In Progress (stage` hits, none of them a COPY-PD-VIS doc; the round-436 cross-check (`b-round-436/recheck-436.txt`) |
