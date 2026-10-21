# C — Round 41 verification (D-29z6: the disabled-control reasons are visible in every real state, C-R40-01)

Verifier: C · 2026-10-14 · 14:28–17:07 (+04:00) · HEAD **`54922e6`** at the start and at the end.

## 0. Verdict

**taskStatus: PASS.** Every contracted round-41 ID passed on C's own runs:
- G41-1, G41-2, G41-3;
- R41-S, R41-U, R41-Doc;
- R41-RV (all 6 cases), R41-SB (SB-1..3; SB-4 is record-only), R41-NONE;
- R41-PM (PM-1, PM-2), R41-MN (MN-1..4), R41-K.

**C-R40-01 is closed** at both mandatory viewports (1440×900 and 1280×720), at the default height and at the 120 px minimum:
- every reason that round 40 found clipped (video 21/23/45 px; group 21/43 and 21 px) is now fully visible at `scrollTop` 0;
- the end of the video reason (`ხაზის Volume/Mute`) is visible.

**No new bug inside the contracted range.** There is one **Low** bug outside the two mandatory viewports: C-R41-01 = A's A-R41-REVIEW-NARROW, now with C's measurements at 1024×768 (§9). B decides whether widths below 1280 are in scope.

### Environment and harness

**Baseline / HEAD**
- HEAD moved from the dispatch baseline `63ce722` to **`54922e6`** before C started. This is root's `agentConfigCheckpoint` in `publication-checkpoint.json`: it only commits the 17 `.codex/agents/*.toml` files.
- The 6 round-39/40 shas are unchanged in that tree (`ArrangementContext` `91fa12d6`, panel `dbcd5c2f`, doc 037 `9d9f2122`, `pending-status` `f2cd4b53`, `detail-panel-fit` `dac18003`, doc 038 `947d9f83`). The §1.2 condition "a newer root commit that leaves those shas unchanged" therefore holds.
- Because the `.codex` files are now tracked, `git status --short` has 3 lines instead of 3 + 17.

**Machine load (it affected the gates)**
- `node.exe` was 28–44.
- Windows Defender (`MsMpEng`) used about **172 % CPU** during C's first gate run: vitest import took 758 s, with 5000 ms test timeouts and one worker-start timeout (§2).
- With the load gone, every gate passed on re-run. Both runs are reported.

**gstack browse daemon (ENV-BROWSE-DAEMON)**
- Its first start printed "failed to start within 15 s", but it came up shortly after.
- The setup helper's promise poll (`c-round-34/r.sh`) hung once for 10 min. C replaced it with `c-round-41/fresh41.sh`, which uses the same setup scripts with synchronous polling.
- A `restart` before G41-3 timed out. A second G41-3 attempt hit a navigation timeout during the overloaded verify run.
- G41-3 was then captured once more, in a confirmed fresh daemon (new PID, `about:blank`, `cookies []`).
- No foreign process was killed. C did not start or stop the dev server, which answered 200 throughout.
- C's browse daemon is **left running** (PID 9936, `c-browse.json` present). In round 40, `stop` hung, so it was not attempted.

**Harness labels**
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC**, labelled at each use:
  - `.focus()` on the separator (RV-MIN);
  - `scrollTop = max` and `scrollTop = 0` (SB-3, SB-4);
  - `blur()` in the shared clean-up helper.
- **C instrumentation:**
  - the `window.__c` reader (setup chain as in `c-round-34/reset.sh`, run by `c-round-41/fresh41.sh`);
  - `c-round-35/scripts/authhook.js`;
  - the new geometry reader `c-round-41/scripts/geo41.js`;
  - the round-40 `geo40.js` (PM-1).
- **`geo41.js` "visible"** = the reason's rect lies inside its box rect **and** inside the scroller's visible rect at `scrollTop` 0, as §4 defines it.
- No source instrumentation. Mutations ran in a scratch copy outside `store/`.

**Layout and the "none" state**
- Layout L41 was confirmed before measuring: video at 0 (6.008 s), `სრული მიქსი` on music at 7, `Soft impact` on SFX at 4.
- The none state was reached with a **REAL click on an empty SFX lane area**. Before each click, `elementFromPoint` at the lane-body centre was checked to hit no clip.
- REAL Escape did **not** clear the group in this run, with focus on the ruler's Playhead slider (`runs/esc-record.txt`). A grep for `Escape` across `app/` finds no deselect handler in the arrangement workspace: the workspace (floating video), library and detail panel only. The only "Deselect All – Escape" is in the old premium `StudioContext` and on `studio.$productId`. Round 40 recorded sel 0 after the same ruler → Ctrl+A → Escape sequence at 1440, so the behaviour is focus- or context-dependent. Code outside the panel is byte-identical (384 OK), so this is not a round-41 item. It is a harness note, not a bug.

## 1. Results by ID

| ID | Result | Evidence |
|---|---|---|
| G41-1 | **PASS** (after a load re-run, both runs reported) | `tsc` 0. Clean re-run: `npx vitest run` **73 files, 1325/1325** (= 1319 + 6) in 39 s; `npm run build` exit 0; `npm run verify` **exit 0** (73 / 1325, both builds); the 13 §4.7 suites alone **334/334**. Biome `./app`: exactly **2 errors** (`app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`, both `format`: the root CRLF baseline, confirmed by an error-level run), **218 warnings, 1 info**. Scoped Biome on the 2 round-41 TS/TSX files: 0 diagnostics. **Loaded first run (not a code failure):** 13 suites 325/334, all 9 failures `Test timed out in 5000ms`; `verify` vitest 62 failed / 1256 passed / 1 worker-start timeout. The failures cascaded inside files whose earlier test had timed out (for example `track-meter-ui` "Unable to find element" after a timeout); 0 failed on the idle re-run. The gate script was stopped at its background limit before `verify` printed an exit code, so `verify` was re-run (`gates/verify2.txt`, exit 0) |
| G41-2 | **PASS** | `gates/g41-2-start.txt` = `g41-2-end.txt`: HEAD `54922e6`; status = ` M` panel, ` M` doc 038, `??` `detail-panel-reason.test.tsx`; 384/384 OK; protected 4/4 OK. Live shas: panel `61834b2a…`, doc 038 `cf894ea3…`, test `b919643f…` (all equal A's report). `b-round-40-snapshots` `SHA256SUMS` OK. `studio-scrollbar.ts` `f41d1e43…` is unchanged (it is in the 384 list) |
| G41-3 | **PASS** | §7 |
| R41-S | **PASS** | §3 |
| R41-U | **PASS** | §6 |
| R41-Doc | **PASS** | §5 |
| R41-RV | **PASS** (6/6) | §4.1 |
| R41-SB | **PASS** (SB-1, SB-2, SB-3; SB-4 recorded) | §4.2 |
| R41-NONE | **PASS** (default heights); 120 px case recorded | §4.3 |
| R41-PM | **PASS** (PM-1, PM-2) | §4.4 |
| R41-MN | **PASS** (MN-1..4) | §4.4 |
| R41-K | **PASS** | §4.4 |

**Not re-run this round**, by §4.6, so these are not PASS:
- exports and WAV integrity;
- video sync and C-R27-01;
- the full find sound → add → fit video → export flow;
- the FB-01..FB-16 stage regression.

## 2. Gates detail (`c-round-41/gates/`)

**First gate run (`summary.txt`), under load:**

| Step | Result |
|---|---|
| start | 15:58, node.exe 32 |
| `tsc` | exit 0 |
| frozen suites (`frozen.txt`) | exit 1: 325/334, 9 × `Test timed out in 5000ms`; import 207 s |
| Biome `./app` | exit 1: 2 baseline errors (the expected result) |
| scoped Biome | exit 0 |
| `verify` (`verify.txt`) | in vitest: 62 failed / 1256 passed / 1 worker timeout; the script was killed at its background limit, so no exit code |

**Clean re-run, nothing else running:**

| Step | Time | Result |
|---|---|---|
| `vitest-full.txt` | 16:59 | 73 / 1325, exit 0 |
| `build.txt` | 17:00 | exit 0 (`✓ built in 8.78s` / `1.57s`) |
| `verify2.txt` | 17:01 | exit 0: 73 / 1325, both builds |
| `frozen2.txt` | — | 13 files, 334/334 |

Frozen-suite counts in `frozen2.txt`:
- `detail-panel-reason` 6, `detail-panel-fit` 7, `pending-status` 22, `clip-gain` 28, `detail-panel` 24, `detail-panel-polish` 16;
- `track-layout` 36, `gesture-guard` 19, `fader-guards` 71, `fader-click` 26, `delete-selection-ui` 13, `floating-video` 45, `ArrangementContext` 21.

## 3. R41-S — static (`gates/snap-panel.diff`, `gates/snap-doc038.diff`, `gates/r41-s-static.txt`)

**`ArrangementDetailPanel.tsx`**: only the §2.1 items.
- `type ReactNode` was added to the react import, and `import { STUDIO_SCROLLBAR_CLASS } from './studio-scrollbar'`.
- `ArrangementDetailWaveform`:
  - one optional prop, `videoClipGainReason?: ReactNode`;
  - its video branch is one layer, `absolute inset-0 flex flex-col items-center justify-center gap-1 bg-elevated px-2 text-center`, holding `<p className="text-muted" data-testid="arrangement-detail-video-placeholder">{DETAIL_VIDEO_PLACEHOLDER}</p>` followed by the prop;
  - the waveform box's own `className` is unchanged.
- The two reason nodes:
  - `isGroupState = !clip && group !== null` and `isNoneState = !clip && group === null`. `group` is `ArrangementDetailGroup | null`, so these agree with the existing `group ?` truthiness;
  - `rangeReasonNode` and `clipGainReasonNode` are each built **once**, with the same `id`, `data-testid`, `className="text-dim"` and text as before;
  - placement: the group state renders both in the middle box (range first); the video state passes the Clip Gain node to the waveform; the none state renders them in the columns.
- Scroller: `cn('flex min-h-0 flex-1 gap-3 overflow-y-auto px-3 py-2', STUDIO_SCROLLBAR_CLASS)`.
- Middle box: `flex min-w-32 flex-1 flex-col gap-0.5 rounded-sm border border-outline bg-background px-2 py-1`. Besides the contracted `flex flex-col gap-0.5 px-2 py-1` tokens it also has `flex`, which `flex-col` needs. This is within the intent.
- Unchanged: `disabled`, `title`, `aria-describedby`, the `0 dB` row, the marker, Apply, the info column, the `key` and the wheel handler. The diff does not touch them.

**Negative scan** of the 35 added lines: 0 each of `any`, `@ts-ignore`, ` as X`, `//`, hex, `rgb`, `style=`, new `[..:..]` arbitrary values, `title=` and `truncate`.

**New test file:** it exists. Its `instanceof` guards are the only type narrowing; it has no `any`, no assertion, no comment, no timer and no snapshot. Its exact strings are literals, as in the frozen tests (the panel constants are not exported).

## 4. Browser results

### 4.1 R41-RV — the reasons are visible (REAL selection)

Runs: `runs/rv-1440.txt`, `rv-1280.txt`, `rv-min-1440.txt`, `rv-min-1280.txt`, `rv-switch-1440.txt`. Summaries come from `scripts/sum.cjs`. y values are viewport px; "vis" is the scroller's top … top + clientHeight.

| Case | Panel / lane | Scroller vis | Reason(s): place, rect, lines | Visible? | Round 40 |
|---|---|---|---|---|---|
| **RV-VID-1440** | 144 / 235 | 724–831 (107/107) | Clip Gain reason in **waveform** (box 732–823), 779.5–795.5, 345.5 px wide, **1 line**; placeholder `<p>` 759.5–775.5, so `placeholder.bottom ≤ reason.top`, `contains` false, same parent | **yes** (inBox + inScroller) | 21 px clipped |
| **RV-VID-1280** | 142 / 273 | 546–651 (105/105) | waveform (554–643), 592.5–624.5, 312 px, **2 lines**; placeholder 572.5–588.5, below OK | **yes** | 23 px clipped |
| **RV-GRP-1440** (REAL ruler click + REAL Ctrl+A, sel 3) | 144 / 235 | 704–811 | **middle** box (712–803): range 717–733 (1 line), then Clip Gain 735–751 (1 line); `rangeFirst` true, no overlap | **both yes** | CG 21 px |
| **RV-GRP-1280** (same method) | **122** / 273, content **85** | 546–631 (85/94) | middle (554–623): range 559–575 (**1 line**), Clip Gain 577–609 (**2 lines**) | **both yes** | 43 / 21 px |
| **RV-MIN 1440 @120** (SYNTHETIC `.focus()` separator + 8 × REAL ArrowDown → `aria-valuenow` 120/120) | 120 | video 748–831 (83/96); group 728–811 (83/94) | video: waveform (756–823) reason 791.5–807.5, 1 line; group: range 741–757, Clip Gain 759–775 | **all yes** | video 45 px |
| **RV-MIN 1280 @120** (same method) | 120 | video 568–651; group 548–631 | video: reason 603.5–635.5, 2 lines (box 576–643); group: range 561–577 (1 line), Clip Gain 579–611 (2 lines) | **all yes** | — |

**Checks common to every RV case:**
- Each moved `<p>` has `className` exactly `text-dim`, no `title`, and its full text; `scrollWidth = clientWidth`.
- The range and Clip Gain columns contain no reason in the group and video states (`where` = `middle` / `waveform`).
- The video state:
  - the Clip Gain input is disabled, `title` = the reason, and `aria-describedby` = the reason id (`:r7:`);
  - the `0 dB` button is disabled with the same `title`;
  - the range start, end and Apply stay enabled.
- The group state:
  - start/end are disabled, `title` = the range reason, and `aria-describedby` = the range reason id (`:r9:`);
  - Apply is disabled with that title;
  - the Clip Gain input and `0 dB` are disabled with the group reason; the input's `aria-describedby` = `:ra:`.
- B's fit prediction holds: at 1280 the group needs 1 + 2 lines (bottom 609 ≤ 631) and the video 2 lines (bottom 624.5 ≤ 651).

**Screenshots** (`c-round-41/shots/`):
- `rv-vid-1440.png`, `rv-vid-panel-1440.png`: the placeholder with the full reason below it, centred;
- `rv-grp-panel-1440.png`: both reasons stacked in the middle box;
- `rv-vid-1280.png`, `rv-vid-panel-1280.png`, `rv-grp-1280.png`, `rv-grp-panel-1280.png`;
- `rv-min-none-1280.png`.

**RV-SWITCH** (1440, REAL clicks, `runs/rv-switch-1440.txt`):

| Step | Action | Reasons in the DOM | Waveform `p` |
|---|---|---|---|
| 1 | SFX header | 0 | 0 |
| 2 | video header | 1, `clip-gain-reason@waveform` | 2 (placeholder + reason) |
| 3 | empty lane | `reason@rangeCol` + `clip-gain-reason@cgCol`; middle text "" | no waveform |
| 4 | ruler + Ctrl+A | `reason@middle` + `clip-gain-reason@middle` | no waveform |
| 5 | SFX header | group **kept** (sel 3) | panel consistent |
| 6 | empty lane | none-state placement | — |
| 7 | SFX header | 0 | 0 |
| 8 | video header | 1 @waveform | 2 |
| 9 | music header | 0 | 0 |

Step 5 is by design: `ArrangementClip.tsx` l.256–282 keeps an existing group when one of its members is clicked, so it can move as a group. The panel stayed consistent with sel 3.

Nothing stale remained at any step.

### 4.2 R41-SB — the scroll affordance

**SB-1 PASS** (`runs/sb1-1440.txt`):
- computed `scrollbar-gutter: stable`; `offsetWidth − clientWidth` = **10** in every state, at both viewports;
- all **15** `STUDIO_SCROLLBAR_CLASS` tokens are on the scroller, and each matches a stylesheet rule (R23-1 method). These include `::-webkit-scrollbar` w/h 2.5, `-track` / `-corner` `--color-surface`, `-button` `display: none`, and `-thumb` `--color-dim` + `rounded-full` + a 2 px `--color-surface` border + `:hover` / `:active` `--color-brand`;
- the computed pseudo-element styles are thumb `rgb(103, 111, 126)` (= `hsl(220 10% 45%)` = `--color-dim`), track `rgb(17, 19, 24)` (= `--color-surface`), buttons `display: none`;
- the visual look is not paintable headless and is added to Tech Lead **R23-1** (detail panel, 1280×720, group state).

**SB-2 PASS** (column widths):

| Viewport | info | middle | range | Clip Gain |
|---|---|---|---|---|
| 1440 | 288 | **490** | 176 | 128 |
| 1280 | 288 | **330** | 176 | 128 |

- They are identical in the none, audio, video and group states, so a selection change shifts nothing.
- The panel height and the first lane are unchanged: 144/235 at 1440; 142/273 at 1280 (122 in the group state, as in round 40).

**SB-3 PASS** (1280 group, `runs/rv-1280.txt`):
- info `<p>`s 554–570, 572–588, 590–606 (16 px each) and 608–640;
- the last `<p>` (`ჯგუფი ერთად გადაადგილდება · Delete შლის · Ctrl+D აორმაგებს`) is one paragraph wrapped to 2 lines (32 px), identical to round 40's R40-INFO record;
- 0 overlaps;
- SYNTHETIC `scrollTop = max` → 9 → the last line is 599–631 against the visible bottom 631, so the end is reached;
- at 1440 the group needs no scroll (107/107).

**SB-4 (record, no PASS/FAIL; `runs/sb4-1280.txt`).** 1280 group state, all panel controls disabled:
- a REAL click on the first info line (Playwright scrolled the content to 8 to reach the click point), then REAL Tab → C's harness `#c-stage` → BODY → `arrangement-exit`. A forward Tab did not stop on the scroller, which is an ancestor of the starting point;
- 3 × REAL Shift+Tab landed on the **content scroller** (`document.activeElement` = content; Chrome's keyboard-focusable scroller, `tabIndex` −1 in the DOM);
- with SYNTHETIC `scrollTop = 0`, REAL ArrowDown scrolled it to **9** (the max). Selection, playhead and history were unchanged.

### 4.3 R41-NONE — must-not

| Case | Panel | Range reason | Clip Gain reason | Middle box |
|---|---|---|---|---|
| 1440, default height (REAL empty-lane click) | 144 / lane 235 | range column, 804–820, 1 line | Clip Gain column, 804–820, 1 line | text `""` (empty) |
| 1280, default height | 142 / 273 | 626–642, 1 line | 626–642, 1 line | `""` |

- At default heights both reasons are fully visible against vis 831 and 651; **clipped 0**. **PASS.**
- Controls: disabled, `title` = `ჯერ აირჩიე კლიპი`, and start/end and the Clip Gain input are described by the column reasons.
- **At the 120 px minimum (record, not FAIL), at both 1440 and 1280:**
  - the info hint `აირჩიე კლიპი, რომ დეტალები ნახო` is visible at the top (1440: 756–772; 1280: 576–592);
  - the column reasons sit below the visible area: range clipped **7 px**, Clip Gain **13 px** (1440: 822–838 / 828–844 against vis 831; 1280: 642–658 / 648–664 against 651), and both overflow their column box;
  - this is the case §4.3 accepts as a record, because the same instruction is visible in the info hint. B's estimate was ≈ 13 px.

### 4.4 R41-PM, R41-MN, R41-K (1440)

Runs: `runs/pm-1440.txt`, `mnk-1440.txt`, `k-space-1440.txt`.

| ID | Result | Evidence |
|---|---|---|
| PM-1 | **PASS** | SFX + REAL click field + REAL type `3`: marker `<p>` 69.8 × 16 (**1 line**), `scrollWidth` 70 = `clientWidth` 70, width ≥ 69. Scroller `scrollHeight` 107 before = 107 after. Marker centre 788 = `0 dB` centre 788. Input border and ring `rgb(245, 158, 11)` (box-shadow 2 px). `0 dB` button **44.2 × 24**, 1 line (DETAIL-RESET-SHRINK: width 44.2 ± 1 OK). `aria-describedby` = marker id `:r19:`; `textContent` / `title` = the full string |
| PM-2 | **PASS** | REAL Enter → **+1** `Clip Gain` entry, status `Clip Gain: Soft impact — +3.0 dB.`, field `3.0`, no marker, `data-pending` null |
| MN-1 | **PASS** | Video selected, REAL click on the start field → REAL Tab → end → `მონიშვნა` (Apply) → C's harness `#c-stage` (file input, outside the panel). The disabled Clip Gain and `0 dB` are skipped, the same order as round 40 |
| MN-2 | **PASS** | Clip Gain `3` → REAL click on music Volume → +1 entry, tail `[…, Clip Gain]`, `3.0`, focus `Volume — მუსიკა` |
| MN-3 | **PASS** | SFX selected → REAL music Volume → REAL Delete → clips 3 → 3, 0 entries, focus stays on Volume |
| MN-4 | **PASS** | Video: REAL start `1`, end `3`, REAL Apply → status `მონიშვნა: 00:01.000 — 00:03.000 · ვიდეო.`, range `{1, 3, video}`, 0 entries. The waveform box holds the placeholder layer, the overlay `arrangement-detail-range` (`pointer-events-none`, `bg-foreground/30`, x 682.2–844.7) and the playhead. **Overlap record:** the overlay covers part of the placeholder (x 754.6–935.4) and of the reason (672.2–1017.8); the text stays readable through it (`shots/mn4-vid-range-1440.png`) |
| K | **PASS** | Mute: 1 entry, `aria-pressed` true. REAL Space with focus on music Volume: start at 0 → playing (1.44 → 4.13), second REAL Space → stopped at 5.64, 0 entries. Repeated from 14.4: start / stop / start, all correct. One earlier reading (`playing=true` after the second Space) was explained: playback that started at 14.4 reached the end (23) and auto-stopped during the slow browse calls, so the second Space started it again. Confirmed by `pos 23, playing false` (`k-space-1440.txt`) |

## 5. R41-Doc — PASS (`gates/snap-doc038.diff`)

Doc 038 changes only the §2.2 parts:
- **Status line:** verbatim `Round 40 C PASS (D-29z5); Round 41 — D-29z6 (C-R40-01).`
- **l.45** now states the round-40 truth: `შეუნახავია` shows in the `0 dB` row; the rest of the string is in `sr-only` and `title`, so `textContent` and the description are the full string. This closes the stale l.45 that round 40 carried.
- **New section `## Round 41 — …`:** the bug with C's table; B's measurement and fit check; the state table and the scroller; the none-state rationale; rejected a–g; the files; red/green; the C IDs; the Ableton table.
- **TODO** is current:
  - C-R40-01 → round 41 ("ready only after C PASS");
  - groups 2/3/4 → rounds 42/43/44; 4c;
  - polish without C-R30-01, keeping SSR-LAYOUT-EFFECT-WARN and EXPORT-DIALOG-FOCUS-RESTORE;
  - the closed "მესამე ხაზი" item and the rejected live-region item are removed;
  - Tech Lead R38-T, plus R23-1 for the detail scroller.
- Earlier sections are untouched.
- The doc matches the code: the prop name `videoClipGainReason` and the class strings are verbatim.
- The Ableton table matches §4.8: 2 rows, both "არ ეხება", no "Ableton does it this way" claim.

## 6. R41-U — mutation table (`runs/mutations.txt`, scratch `c-round-41/mut/`)

**Setup**
- Suite: `detail-panel-reason` + `detail-panel-fit` + `pending-status` + `clip-gain` + `detail-panel` + `detail-panel-polish` (103 tests).
- `app/` was copied, with its own `vitest.config.mts` and `cacheDir`; `node_modules` was a junction to `store/node_modules`.
- **Control: 103/103.**
- **Old source** (`b-round-40-snapshots/ArrangementDetailPanel.tsx`): exactly **RF1, RF2, RF5 red**, and RF3, RF4, RF6 and every frozen test green. This reproduces A's red run.

| # | Mutation (in the new source) | Failed tests | Expected |
|---|---|---|---|
| (a) | group reasons left in the columns (columns render on `!clip`, middle empty) | RF1 | RF1 ✓ |
| (b) | video reason left in the Clip Gain column (`videoClipGainReason={null}`) | RF2 | RF2 ✓ |
| (c) | video reason rendered inside the placeholder `<p>` | RF2 + `detail-panel` "…shows the video placeholder" (l.416 exact text) | RF2 (+ l.416) ✓ |
| (d) | none reasons moved into the middle box | RF3 | RF3 ✓ |
| (e) | no `STUDIO_SCROLLBAR_CLASS` | RF5 | RF5 ✓ |
| (f) | `truncate` on the Clip Gain reason | F5 + RF6 | RF6 / F5 ✓ |
| (g) | group order swapped (Clip Gain before range) | RF1 | RF1 ✓ |
| (h) | `id` dropped from the Clip Gain reason | F5, PM5, RF1, RF2, `clip-gain` "nothing, a group and a video clip … exact linked reasons" | RF1 / `clip-gain` l.779 ✓ |

**Clean-up**
- After the run the copy was restored and was identical (`RESTORE IDENT`).
- The junction was removed with a non-recursive `rmdir`. `store/node_modules` is intact (618 entries, `.bin/vitest` present), and `git status` is unchanged.

## 7. G41-3 — anonymous access and the premium boundary — PASS

Runs: `runs/g3-anon.txt`, `anon-direct.json`, `anon-header.json`, `anon-studio-me.json`, `g3-session.txt`, `curl-token.txt`, and the network logs.

**Context**
- A confirmed fresh daemon: new PID 9936, `about:blank`, `cookies []`.
- The direct open came first, then the header link in the same fresh context. No credentials were ever set.

**Direct `/studio-lab`**
- `auth_user` null; localStorage holds only `czaba_session_id` (root cart session); cookie empty.
- The workspace is shown, with the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`.
- Network: 0 requests to `studio-token` / `recording-` / `/api/download` / R2.
- Media: only `middle-east.mp3` and `hero-music.mp3`, the 2 demo MP3s.
- API: only the root `GET localhost:5199/api/cart` (allowed).
- Hosts: GA/GTM (root, allowed) and Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`). Fonts are not in §4.6's "known and allowed" list; round 40 accepted them the same way, and C records them explicitly rather than folding them in.

**Header link**
- Home → the visible `Studio LabDemo` link at 906,40 → `/studio-lab`, `auth_user` null, workspace shown.
- 0 forbidden requests; same 2 MP3s.

**Session** (`authhook.js`)
- REAL `＋ დამატება` → `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`, then REAL Play and REAL Space.
- The only `fetch` was GA `collect` `en=scroll` with consent denied (the known root item), with `auth: null`.
- So workspace code sent **no `Authorization` header**, and there were 0 forbidden requests.

**Premium**
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`
- A fake Bearer → **500** `Unable to prepare Studio access`, with no token (known root item).
- `/studio/middle-east` → **Sign in required**, no workspace (`shots/anon-studio-me.png`).

**Premium auth is not bypassed.**

**C-R23-01 / C-R38-01 record** (Tech Lead, carried; `runs/c-r23-01-record.txt`):
- `curl /studio-lab`: **64 312 bytes** (round 40: 63 654), **3 NUL** at **11729, 28025, 28026**.
- 11729 is in the library-collapse `aria-label` (`ბიბ\0ლიოთეკის …`); 28025/28026 are in `Arrangement · \0\0მთლიანი პროექ…`.
- Round 40's 58745/58746 pair is gone: round 41's bytes moved the content under that offset.
- Hydrated DOM: **1 U+FFFD label** (`ბიბ�ლიოთეკის დაკეცვა`; round 40: 2). The `range-ის დასაწყისი` label is clean again.
- The pattern still points to the dev SSR transport at fixed offsets, not to A's code.

## 8. Ableton two-verdict table (§4.8; no new browsing, no video)

Source for the status-bar context: Live 12 Reference Manual §3.2, https://www.ableton.com/en/live-manual/12/live-concepts/, captured 2026-10-13 (`b-round-37/ableton-live-concepts-20261013.txt`). C did no new browsing.

| Behaviour | CZABA requirement | Ableton compliance |
|---|---|---|
| A disabled control's reason is shown in the panel's free area (group: middle box; video: under the placeholder), not under the control | **Met** (R41-RV at 1440/1280, default and 120 px) | **Not applicable**: CZABA layout decision D-29z6 (C-R40-01); there is no Ableton source and no claim |
| The detail content uses the Studio thin scrollbar with a stable gutter | **Met, computed** (R41-SB: 15 rules, 10 px stable gutter; the visual is Tech Lead R23-1) | **Not applicable**: CZABA user request of 2026-10-07 (consistent scrollbars) |

## 9. New and carried items

**C-R41-01 (Low; outside the two mandatory viewports; = A-R41-REVIEW-NARROW with C evidence; `runs/narrow-1024.txt`, `shots/narrow-grp-1024.png`)**
- **Setup:** fresh load at **1024×768**, L41, panel 144. The middle / waveform box is **128 px** (`min-w-32`, inner 110).
- **Video selected:**
  - the Clip Gain reason wraps to **4 lines** (615.5–679.5) and the placeholder to 2 lines;
  - the centred stack is taller than the `overflow-hidden` waveform box (584–675), so the reason's last 4.5 px and the placeholder's first 4.5 px are clipped;
  - this box does not scroll (the reason `inBox` = false).
- **Group (REAL ruler + Ctrl+A):**
  - panel 136, content 99/127;
  - the range reason is 3 lines (visible); the Clip Gain reason is 4 lines (627–691), **28 px below** the visible area, reachable only by scrolling the content.
- **Why it is not a round-41 FAIL:** the plan names 1440×900 and 1280×720 as the two mandatory viewports, and D-29z6 measured only those, so this is not a round-41 FAIL. The full text is still reachable through the controls' `title` and `aria-describedby`.
- **For B:** decide whether narrower widths are in scope. If so, a small follow-up could be `min-w` on the middle box, or letting the waveform's video layer scroll.

**Open C bugs (unchanged, not re-run):**
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead; record in §7).

**Open Low items (unchanged):**
- R26-M1;
- 4b-2 groups 2–4 (rounds 42–44);
- A-R38-TEST-ORDER, R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY, A-R34-REVIEW-RESIDUALS;
- DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, LIB-SEP-REASON, SSR-LAYOUT-EFFECT-WARN;
- the DOC034/035/036/015 notes, EXPORT-DIALOG-FOCUS-RESTORE;
- DETAIL-RESET-SHRINK (info: `0 dB` is still 44.2 × 24, 1 line).

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- **Commits and publication:**
  - rounds 39–40 are published as `63ce722`, and the agent configs as `54922e6` (`agentConfigCheckpoint`; the 17 `.codex` files are now tracked);
  - **round 41 is checkpoint-ready on this C PASS.** Exactly 3 paths change: panel `61834b2a…`, doc 038 `cf894ea3…`, the new test `b919643f…`;
  - `round40Checkpoint.remaining` "C-R40-01 disabled reason clipping" is resolved by this round.
- **Repository and tooling:**
  - the ignored `.kilo/`;
  - `npm run test:e2e:smoke` (root only);
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` grant;
  - portable instruction-file paths.
- **App behaviour:**
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - the export hard-clip at 0 dBFS;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied (seen again in G41-3);
  - fake Bearer → 500 (seen again);
  - the CDP allowlist;
  - `Content-Type` without a charset.
- **The root review's open M/L items:**
  - M1 lookahead driver; M2 render load; M3 doc 012;
  - L1 undo during a gesture; L2 hold-window reschedule; L3 Delete key repeat; L4 `setPointerCapture` throw; L6 the export dialog text; L7 unbounded history; L8 the unwrapped `new AudioContext`.
- **Environment:**
  - dev-server availability;
  - ENV-BROWSE-DAEMON (recurred: slow starts, a hung promise poll, a restart timeout);
  - machine load: Defender at about 172 % CPU made the first gate run time out.

**Tech Lead manual checks:**
- R23-1, now including the detail scroller at 1280×720 in the group state;
- R23-2, R38-T (including A-R38-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11.

## 10. Files

- `c-round-41/checkpoint.md`.
- `c-round-41/gates/`:
  - `g41-2-start.txt`, `g41-2-end.txt`;
  - `snap-panel.diff`, `snap-doc038.diff`, `r41-s-static.txt`;
  - `tsc.txt`, `frozen.txt`, `frozen2.txt`, `vitest-full.txt`, `build.txt`, `verify.txt` (loaded), `verify2.txt`;
  - `biome-app.txt`, `biome-errors.txt`, `biome-scoped.txt`, `summary.txt`.
- `c-round-41/runs/`:
  - `rv-1440.txt`, `rv-1280.txt`, `rv-min-1440.txt`, `rv-min-1280.txt`, `rv-switch-1440.txt`;
  - `sb1-1440.txt`, `sb4-1280.txt`;
  - `pm-1440.txt`, `mnk-1440.txt`, `k-space-1440.txt`, `esc-record.txt`;
  - `narrow-1024.txt`;
  - `mutations.txt`, `mut-*.txt`, `mut-*.diff`;
  - `g3-anon.txt`, `g3-session.txt`, `anon-*.json`, `network-*.txt`, `curl-token.txt`, `c-r23-01-record.txt`, `studio-lab.html`.
- `c-round-41/shots/*.png`.
- `c-round-41/scripts/geo41.js`, `sb1.js`, `sum.cjs`.
- `c-round-41/lib41.sh`, `fresh41.sh`, `g3b.sh`; `mut/mutate41.cjs`, `mut/run-mut.sh`.
