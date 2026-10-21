# C — Round 47 verification: SRW-14 stage 1 (FB-13) — seconds grid, Snap, lane grid lines, move snapping

Verifier C, session `636aa330`, 2026-10-16 16:03–16:40 +04. Source read-only; nothing committed. Every number below comes from C's own runs (`c-round-47/runs/`); A's numbers were not reused.

**Verdict: FAIL, on one contracted gate only.** All product behaviour C could exercise passes, with REAL input at 1440×900 and the main drags repeated at 1280×720. **G47-1 is red as written.** The frozen `render-budget.test.tsx:309` expects 2 `option` roles, and the select required by §0.2 adds 7 more, so the test sees 9. This is a conflict between the task and a frozen test (B-EXPECT-R47-RB), not an app defect. C confirmed in scratch that scoping that one query to the listbox gives 7/7. There is also one low contract deviation (C-R47-01 = A-R47-GROUP-LANE-DELTA) for B to decide.

## 0. Harness (read first)

- **REAL-mouse drags:**
  - The browse CLI has no drag command.
  - Its CDP allowlist has no `Input.*` method.
  - `server-node.mjs` (the "fallback") has the same command set and no mouse API, so the task's "fallback Playwright mouse" does not exist.
  - C therefore used a **standalone Playwright 1.57 script** (`store/node_modules/playwright`, already-installed chromium rev 1200, no install), headless, in a new context with no credentials. It uses `page.mouse.down/move(steps)/up` and `page.keyboard` (trusted CDP input).
  - Every drag ID below is labelled **REAL-mouse (PW)**. Scripts: `c-round-47/pwlib.cjs`, `snap.cjs`, `shift.cjs`, `grouplane*.cjs`, `lines.cjs`, `au.cjs`, `reg.cjs`.
  - Layout L47 comes from the round-46 setup chain, evaluated in-page (SYNTHETIC setup only).
  - **Harness finding for B:** update `harness_rules` so it no longer names the fallback as a mouse source.
- **gstack browse** was used for the non-drag REAL checks: UI-1…UI-6, the reload reset, NU-1…NU-3, and G47-3 in a fresh anonymous state.
  - Own daemon: `c-round-47/b.sh`, state `c-round-47/c-browse.json`, PID 31712, stopped at the end.
  - Anonymous daemon: `c-round-47/anon/ba.sh`, PID 11044, stopped.
  - No restart, no fallback needed.
- **node.exe count:** 31–48 across runs (recorded in each run file).
- Dev server: `/studio-lab` 200 all session, never started or stopped.

## 1. Gates

| ID | Result | Evidence |
|---|---|---|
| **G47-2** | **PASS** | start and end (`runs/g47-2-start.txt`, `g47-2-end.txt`): HEAD `d2f6715`; status = §3.2 exactly (3 M components, M doc 043, 4 ??); 395 → 0 non-OK; `ArrangementTransport.tsx` cmp-identical; protected 4/4 OK; `git ls-remote` HEAD `d2f6715` |
| **G47-1** | **FAIL — B-EXPECT-R47-RB** | `tsc` exit 0. Full vitest (`runs/full-vitest.txt`, node 31→33): **1 failed / 1386 passed (1387 = 1364 + 23)**; only failure `render-budget.test.tsx` "does not re-render clips…" `expected … length of 2 but got 9`. `npm run build` exit 0. Biome `./app`: **2 errors** (the baseline CRLF `format` on `app/lib/auth.ts` and `auth-bugs.test.ts`, confirmed by a targeted run), **218 warnings, 1 info**, 0 diagnostics in any owned file. Focused set (grid, grid-snap-ui, gesture-reentry, gesture-guard, track-layout, render-budget, context-hygiene): 108/109, the same single failure; track-layout did not time out in this run (node 48). |
| B-EXPECT-R47-RB scratch check | confirmed | Scratch copy (`c-round-47/scratch/s`, node_modules junction): only l.309 changed to `within(view.getByRole('listbox')).getAllByRole('option')` → **7/7** (`runs/rb-scratch-scoped.txt`); restored and verified identical afterwards |
| **G47-3** | **PASS** | Fresh anonymous state, details below |

G47-3 details (`runs/g47-3.txt`, `network-anon-*.txt`, `anon-*.json`):
- Direct `/studio-lab` → workspace shown, badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`, `auth_user` null, cookie empty.
- Header link `Studio LabDemo` → `/studio-lab`, workspace shown.
- REAL add + Space session: 0 `Authorization` headers.
- 0 requests to studio-token, recording-*, /api/download or R2.
- Media: only `hero-music.mp3` and `middle-east.mp3`.
- Hosts: 127.0.0.1, the allowed `localhost:5199/api/cart`, GA, GTM, Google Fonts.
- Anonymous token request → **401** `Please sign in to access Studio.`; fake Bearer → **500** with no token (known root item).
- `/studio/middle-east` → "Sign in required", no workspace. **The premium auth path is not bypassed.**

`npm run verify` was not re-run: its steps (tsc, vitest, build, Biome) were each run above, and it would stop at the same vitest failure.

## 2. R47-S — static (PASS)

`runs/r47s-diff.txt` (diff -u against the B snapshots):
- **ArrangementClip:**
  - The changes are the import, the optional `snapSeconds`, the `moveStartOnGrid`/`groupDeltaOnGrid` helpers, `snapStep = timeLocked ? null : snapSeconds`, the group/single move lines, `data-clip-start`, and l.622 `bg-foreground/60` → `/30`.
  - The trim branches, the range gesture and `finishGesture` have no hunks.
  - `handlePointerMove` is a React `onPointerMove` prop that is re-created on each render, so a G toggle mid-drag is read on the next move.
- **ArrangementLane:**
  - Two optional props.
  - A body `backgroundImage` `repeating-linear-gradient(to right, var(--color-outline-light) 0 1px, transparent 1px {g·pps}px)`; the token exists (`app.css:141`).
  - `data-grid-seconds`/`data-grid-lines`, and `snapSeconds` passed to clips.
  - Without `gridSeconds` there is no background and no attributes.
- **StudioWorkspace:**
  - State plus mirror refs; `toggleSnap`/`changeGridDivision` set the status without history.
  - The header cell holds the button (`aria-pressed`, `aria-keyshortcuts="G"`, exact titles, Loop's pressed classes `border-accent bg-accent/20 text-accent`) and the select (exact `aria-label`, titles, 7 options); `ხაზები` is removed.
  - G sits **after** `if (modifier) return;`, not in the gesture-blocked list; `shortcutLetter` handles KeyG.
  - Nudge branch per §0.5; deps `[returnFloatingVideo, toggleSnap]`.
- `grid.ts` exports exactly the 8 §0.1 names; the divisions are ms-integers.
- The banned-content grep over the diff, `grid.ts` and both new tests (any, @ts-ignore, `as`, `//`, hex/rgb/hsl colours) found nothing.

## 3. R47-U — unit tests and mutations

- New tests: `grid.test.ts` 8 `it`, `grid-snap-ui.test.tsx` 15 `it` → green (scratch base 23/23).
- **Frozen suites:** all green except `render-budget` (B-EXPECT-R47-RB), so **R47-U-FROZEN = FAIL (same cause)**.
- **Mutations (C, own scratch; `runs/mutations-part1.txt` + `runs/mutations.txt`), all killed:**

| # | Mutation | Must fail | Failed |
|---|---|---|---|
| base | none | — | 23/23 green |
| (a) | same-lane commit ignores snap | GS3, GS4 | GS3, GS4, GS10, GS12, GS13 |
| (b) | group raw delta (`snapStep` → null) | GS5 | GS5, GS5b |
| (c) | single cross-lane `timeDelta: delta` | GS6 | GS6 |
| (d) | Shift no longer wins | GS7 | GS7 |
| (e) | nudge ignores Snap | GS8 | GS8, GS9 |
| (f) | G ignores `repeat` | GS11 | GS11 |
| (g) | tie goes earlier | GM1 | GM1 |
| (h) | 6 px check removed | GS10 | GS10, GM4 |
| (i) | G before the modifier return | GS11 | GS11 |
| (j) C | `snapGroupDelta` returns the clamped raw delta | GM3 | GM3, GS5b |
| (k) C | lane lines only with Snap on | GS1 | GS1 |

## 4. R47-UI (REAL, gstack) — PASS

`runs/ui-1-2.txt`, `ui-3-4.txt`, `ui-5-6.txt`; shots `UI-fresh-*-top.png`, `UI-3-pressed.png`.

| ID | Result | Reads |
|---|---|---|
| UI-1 | PASS | Fresh 1440×900: cell (288,191) **224×28**, sticky; `data-snap=off`, `grid-seconds=1`, `lines=visible`; toggle `aria-pressed=false`, title `Snap გამორთულია — თავისუფალი გადაადგილება (G)`; select `1 წმ`, `scrollWidth = clientWidth = 73` (not clipped, screenshot); toolbar **49** |
| UI-2 | PASS | **Fresh** 1280×720 (not a resize): same cell 224×28, select 73/73, toolbar **87** |
| UI-3 | PASS | REAL click → `on`, `aria-pressed=true`, classes `border-accent bg-accent/20 text-accent`, status `Snap ჩართულია — ბადე 1 წმ (G)`, Undo title still `Undo` |
| UI-4 | PASS | REAL `g` (focus on the button) toggles; REAL `g` on body toggles (blur was SYNTHETIC); REAL `g` after a REAL click on a clip header toggles (PW, SN-GROUP/SN-LANE; `activeElement` not read). **Not toggled:** `Control+g`; `g` in the library search field (the letter goes into the input; cleared afterwards) |
| UI-5 | PASS | REAL Tab → select; REAL ArrowDown ×2 → `0.5`, then `0.25`; status `ბადე: 0.25 წმ (Snap ჩართულია)`; REAL Space on the select → **no playback**, no status change, clock 00:00.000 (recorded) |
| UI-6 | PASS (record) | REAL click (focus) → Enter toggles (`Snap ჩართულია — ბადე 0.25 წმ (G)`); REAL Space with focus on Snap goes to global Space (empty project: status `დასაკრავი არაფერია…`; Snap not toggled). **Not run:** Space from the focused Snap button with clips loaded; AU-2 shows playback from Space on body |
| Reload (§0.1) | PASS | Snap on + 0.25 → reload → `off`, `1` |

## 5. R47-SNAP — REAL-mouse (PW), 1440×900, 40 px/s

`runs/snap-1440x900.txt`, `shift-1440x900.txt`, `grouplane*.txt`; shots `SN-*.png`. "One entry" means one Ctrl+Z restored the pre-drag state **and** the pre-drag Undo title.

| ID | Result | Reads |
|---|---|---|
| SN-OFF | PASS | +30 px → **4.750** (free), status `კლიპის გადატანა: start 00:04.750 …`; one entry |
| SN-1 | PASS | REAL click Snap; +56 px (1.4 s) → **5.000**; status `კლიპის გადატანა: start 00:05.000 …`; one entry |
| SN-025 | PASS | division set with Playwright `selectOption` (programmatic; the REAL keyboard path is UI-5) + REAL G; +24 px (0.6 s) → **4.500**; one entry |
| SN-GROUP | PASS | Free +12 px → 4.300; Ctrl+click music (2 selected); G; +40 px → Soft impact **5.000**, music **7.700**; status `გადატანა (2): 2 კლიპი გადავიდა 00:00.700-ით მარჯვნივ.`; one entry `გადატანა (2)` |
| SN-LANE | PASS | Soft impact at 4.3, G, drag +20 px onto music → ghost `data-ghost-start="5.000"` during the move; final **music 5.000**; `Undo: გადატანა ხაზზე — მუსიკა`; one entry |
| SN-SHIFT | PASS | Shift pressed **after** mouse-down, Snap on → ghost `4.300@music`; final **music 4.300** (time kept, off-grid); one entry `გადატანა ხაზზე — მუსიკა`. Same with Snap off. **Note (not a bug, pre-existing):** with Shift held *before* mouse-down no gesture starts, in both Snap states |
| SN-MID | PASS | Snap off, down, move +30 px → 4.750; REAL `g` mid-drag → `on`, still 4.750; next move (+34 px) → **5.000**; up → one entry; Ctrl+Z → 4.000 |
| SN-BLOCK | PASS | Ctrl+D → copy at 6.000; G; +56 px toward it → status `გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.`; final 4.000 (grid), no overlap, no history (`ცვლილება არ მოხდა`) |
| SN-VIDEO | PASS | G; video header +24 px → **1.000**; video `currentTime` at pos 0 = 0.000; REAL ruler click at 3 s → video `currentTime` **2.000** (follows the 1 s offset); one entry |
| 1280×720 | PASS | SN-OFF 4.750, SN-1 5.000, SN-GROUP 5.000/7.700, SN-LANE ghost 5.000 → music 5.000; each one entry (`runs/snap-1280x720.txt`) |

**C-R47-01 / A-R47-GROUP-LANE-DELTA (low, contract deviation):**
- Setup: a group of music (7) and a stem (0.4, stems lane); Soft impact deleted so the sfx lane is free; Snap on 1 s. Grab music and drag down one lane.
- **dx −0.3 s:** ghosts `7.000@stems`, `0.400@sfx` → lane move committed (one entry). Correct.
- **dx −7.3 s:**
  - Blocked ghosts appear at **the same valid places** `7.000@stems`, `0.400@sfx`.
  - Status `ჯგუფის ნაწილისთვის ხაზი არ არსებობს — მხოლოდ დრო იცვლება.`
  - Result: no change.
  - Under §0.4 (`snapGroupDelta` with bounds → 0) the lane plan would succeed with delta 0.
- **Snap off, same gesture:** also refused; time-only move −0.4 (music 6.6, stem 0.0); misleading blocked ghosts at free places.
- So A's code keeps the existing structure and the Snap-off behaviour; the deviation is from the task text, not a regression.
- B decides: accept the deviation (update §0.4/doc 044) or schedule the bounded delta (and possibly the refusal wording) in stage 2.

## 6. R47-NUDGE (REAL keys, gstack, L47) — PASS

`runs/nudge-1440.txt`. Soft impact was selected (the REAL click selector matched 2 elements; the setup had already selected it).
- **NU-2:** Snap off, ArrowRight ×3 → 4.100 / 4.200 / 4.300.
- **NU-1:** REAL `g`, then ArrowRight / ArrowLeft / ArrowLeft → **5.000 / 4.000 / 3.000**, Undo `კლიპის ჩაჩოჩება`. Ctrl+Z ×3 → 4 / 5 / 4.3 (one entry each); redo ×3 → 5 / 4 / 3.
- **NU-3:** ArrowLeft → 2 / 1 / 0, then ArrowLeft ×2 at 0 → status `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.`, start 0. One Ctrl+Z → **1.000**, so the blocked presses wrote no entry.

## 7. R47-LINES — PASS

`runs/lines-1440x900.txt`, `au-1440x900-ln4.txt`; shots `LN-1-1440x900.png`, `LN-2-zoomed-1440x900.png`, `LN-4-1440x900.png`. The pixel analysis decodes a page screenshot (luminance per column, row in the lane).

| ID | Result | Reads |
|---|---|---|
| LN-1 | PASS | All 4 lane bodies `visible`, sec 1, left 512 = ruler left. Ruler tick lines (`border-l`) at x 512, 552, 592 … 792. Lit columns in the empty stems row at **552, 592, 632, 672, 712, 752, 792**, so line x = tick x, **Δ 0 px** (7 ticks). Inside opaque clips the lines do not show (behind). `pointer-events` on the body unchanged. Line contrast is faint (median luminance 10 → line ≥ 13): readability goes to the Tech Lead (R47-T) |
| LN-2 | PASS | 0.1 s set with Playwright `selectOption` (programmatic; REAL keyboard path = UI-5) at 40 px/s: control and all lanes `hidden`, no background; the select title is exactly the hidden text; no lit columns. REAL `=` ×2 → 62.5 px/s → `visible`, title `ბადე 0.1 წმ`, period 6.25 px, lines every ~6.25 px (fractional anti-aliasing, as the review noted) |
| LN-3 | PASS | Snap on → identical lit columns (552 … 792) |
| LN-4 | PASS | REAL-mouse marquee from stems 3 s to sfx 5.25 s → Soft impact selected. REAL click on the stems background at 2.5 s → pos 2.5, selection cleared. REAL-mouse HTML5 drag of library `Soft impact` onto stems → drop ghost `00:07.500` on stems, then the clip is added at **stems 7.500** |

## 8. R47-AUDIO — PASS

`runs/au-1440x900-all.txt`:
- **AU-1:**
  - REAL click on the video lane `M` (`aria-pressed=true`); G; REAL-mouse drag of Soft impact +80 px → **6.000** (`კლიპის გადატანა: start 00:06.000`). REAL Export → `WAV-ის ექსპორტი`.
  - Blob decode: `RIFF`/`WAVE`, PCM 24-bit, 2 ch, 48 kHz, 1 104 000 frames = **23.000 s**, 0 NaN.
  - **First sample above −40 dBFS in [3.5, 6.9) s at exactly 6.000 s** (Δ 0 ≤ 0.010).
  - [3.5, 5.99) s is digital silence (peak −∞ dBFS < −60).
  - Music onset 6.901 s (its 7 s clip; the pre-roll is the clip's own content). Peak −0.000001 dBFS with 2 full-scale samples (known DEMO-SFX-FULL-SCALE / export hard-clip root item; unchanged).
- **AU-2:** REAL ruler click at 5.5 s, REAL Space. SFX track meter (`data-level-db`) samples: 5.50 … 5.92 `-inf`, **6.06 → 0.0 dB**, then decays −2.0, −4.7, … (Master follows). The SFX is heard at 6 s.

## 9. R47-REG — PASS (records)

`runs/reg-1440x900.txt`, shot `REG-RANGE-1440x900.png`.
- **REG-HYD:** fresh load, 3 s console → only `[vite]` debug, the React DevTools info, and the allowed `ERR_CONNECTION_REFUSED`/"Failed to load cart". No hydration, React or `useLayoutEffect` warning. Dev-server `useLayoutEffect` count 357 → 357 after `curl /studio-lab` (the log is live: `curl /` grew it 1 177 038 → 1 178 958 bytes), **Δ 0**.
- **REG-TRIM (Snap on):** right edge −14.8 px → length **1.630** (free); left edge +14.8 px → start **4.370**, offset 0.370 (free). Matches the stage-1 contract.
- **REG-RANGE (Snap on):** body drag on music → range **7.55–8.81** (free; the start is at the threshold, as before). Overlay classes `bg-foreground/30`, computed `oklab(… / 0.3)`.
- **REG-KEYS:**
  - Ctrl+Z ×2 / Ctrl+Shift+Z, Ctrl+D (copy at 6.000), Delete (`კლიპი წაიშალა; სიცარიელე დარჩა.`) and Ctrl+Z restore all work.
  - With SYNTHETIC focus on the Snap button: Delete reaches the handler (`წასაშლელად აირჩიე კლიპი…`, no selection) and Ctrl+Z undoes.
  - With focus on the select, Delete and Ctrl+Z are ignored (typing target, existing rule; recorded).
- **REG-RB:** render-budget red (B-EXPECT-R47-RB); context-hygiene green.

## 10. R47-Doc — PASS

- **Doc 044:**
  - Follows TEMPLATE sections: header, კონტექსტი, მიდგომა, არქიტექტურა (1 Mermaid), შეცვლილი ფაილები (no code), პრობლემები და გადაწყვეტები, ტესტირება, TODO.
  - Georgian; matches the code (G placement, refs, gradient token, move-only scope, tie tolerance, A-R47-GROUP-LANE-DELTA stated honestly).
  - Has the §4.9 table and stages 2–5.
  - Status `Round 47 — D-29z12; C-ის შემოწმებას ელოდება`.
- **Doc 043:** differs from the snapshot on **l.4 only**, with exactly T3.

## 11. Ableton — two verdicts (§4.9)

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Moving a clip snaps to grid lines (6.7/6.10) | PASS (SN-1, SN-025, SN-GROUP, SN-LANE, SN-MID) | Confirmed (text 6.10/6.7), while Snap is on |
| Grid = tempo subdivisions | PASS for seconds divisions (UI-1, GM1) | Deliberate difference until SRW-15 |
| Snap toggle, Ctrl+4 | PASS (UI-3, UI-4, GS11) | Toggle confirmed; **G** instead of Ctrl+4 is a deliberate difference |
| Grid spacing shown above the ruler | PASS (UI-1) | Confirmed (placement analogous) |
| Zoom-adaptive / narrow-widen / triplets | Fixed division; hidden < 6 px PASS (LN-2) | Deliberate simplification; stage 4 / after SRW-15 |
| Division from the lane context menu | Not in this stage | Confirmed in source; stage 4 (not tested) |
| Alt bypass | Not in this stage | Confirmed in source; stage 2 (not tested) |
| Snap to clip edges / locators | Not in this stage | Confirmed in source; stage 4 / SRW-16 (not tested) |
| Arrow nudge (6.9) | PASS (NU-1…3) | Nudge exists: confirmed; the grid-line step is **unconfirmed** (CZABA decision) |
| Lines remain with Snap off | PASS (LN-3) | Unconfirmed (the user's request) |
| Snap not undoable | PASS (UI-3, GS3) | Unconfirmed (CZABA decision) |
| Snap starts off | PASS (UI-1, reload) | Unconfirmed (CZABA decision) |

C did not check Ableton itself: no video, no Live install. Nothing above says "Ableton does it this way" for an unconfirmed row.

## 12. Bugs and decisions for B

1. **B-EXPECT-R47-RB (medium, test/task conflict):** G47-1 and `npm run verify` are red at `render-budget.test.tsx:309` (9 options vs 2). Proposed fix, owned by B/root, as a frozen-test edit: `within(view.getByRole('listbox')).getAllByRole('option')`. C verified 7/7 in scratch. The app is not wrong.
2. **C-R47-01 = A-R47-GROUP-LANE-DELTA (low):** see §5. This is a deviation from the contract text and matches Snap-off behaviour. B decides whether to accept it or schedule it (stage 2), possibly together with the "only time changes" refusal wording and the blocked ghosts drawn at free places, which are pre-existing.
3. **Harness:** the fallback has no mouse API; the REAL-mouse path is standalone Playwright (§0). The B harness rule needs updating.

**Notes (not bugs):**
- Shift held before mouse-down starts no gesture (pre-existing, both Snap states).
- Grid lines are faint (Tech Lead R47-T).
- REG-TRIM and REG-RANGE are free by contract.
- Space on a focused Snap button goes to the transport.

## 13. Carried (unchanged)

- **C-R23-01 / C-R38-01** (`runs/ssr.txt`): SSR `/studio-lab` is 66 072 bytes (round 46: 64 312; the header cell changed). It has **3 NUL** at 11729 / 28025 / 28026 (the same offsets, ×3 identical) and 0 U+FFFD in the HTML. Hydrated U+FFFD `aria-label`s: 1 (`ბიბ�ლიოთეკის დაკეცვა`). Not a fix and not a new bug.
- **Open as before:** C-R41-01, C-R27-01, C-R6-02, C-R8-01; the Low list of §4.10; accepted items unchanged.
- **Root items:** `root-pre-push-review.md` (2026-10-07) has nothing open. `publication-checkpoint.json` `round46Checkpoint` = `d2f6715`, both remotes, 1364/80, `release:false`. The other root items in §4.10 are unchanged, including the CDP allowlist and ENV-BROWSE-DAEMON (this round, no daemon failure).
- **Tech Lead:** R47-T (real mouse, Georgian layout `KeyG`, line readability) plus the earlier manual items.
- **Not run this round (not PASS):** video sync / C-R27-01; the full find sound → add → fit video → export flow; the FB-01…FB-16 stage regression; `npm run test:e2e:smoke` (root only).

**Commit readiness:** the product change is verified. The tree should not be committed as "verify green" until B-EXPECT-R47-RB is resolved, because the full vitest run is red on that frozen test.
