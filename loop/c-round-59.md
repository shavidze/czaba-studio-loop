# C — Round 59 verification (D-29z24: `1` / `2` narrow/widen keys; GM22–GM24 for C-R58-01/02/INFO-M)

Verifier: C · 2026-10-18, 13:06–13:58 +04 · App source read-only · Every gate re-run by C; A's claims not trusted without a re-run.

## Summary

- **Offline scope: PASS.** G59-2, R59-S, R59-U (mutations a–m plus C extras) and G59-1, all re-run with C's own scripts and mutation strings.
- **Browser scope: RUN this round — for the first time since round 51.**
  - Server check 1 at 13:06:49 gave `000` / `000`, so the offline items ran first.
  - Server check 2 at 13:23:37 gave 5173 → **200** and 5199 → 500. Check 3 at 13:55:52 gave **200 / 200**. C did not start or stop anything.
  - **G59-3 (anonymous workspace and purchase protection): PASS.** This was its first browser verification since round 51.
  - **§4.6 KEY-\*: PASS** at 1440×900, and KEY-NARROW at 1280×720.
  - **Round-58 browser half: PASS.** MN-DISMISS-BUTTON passed at both sizes (D2's timing assumption is confirmed in real Chromium); MN-REPOSITION and MN-FOLLOW (both sizes) also passed.
  - **Round-57 browser half: PASS**, including R57-FOCUS, which closes C-R51-02.
  - **Carried 4a half (§4.7): PASS** for every row except **EG-GROUP**. EG-GROUP is a criterion-text mismatch, not a code defect; B must rule (C-R59-03).
- **New C findings (none blocks commit):**
  - **C-R59-01 (Low, UX):** when the header select has focus, `1` jumps to **10 s** through the browser's native type-ahead, the opposite of the hint in that same select's tooltip.
  - **C-R59-02 (info):** a plain vertical wheel over a timeline with no vertical overflow scrolls nothing, so the grid menu stays open.
  - **C-R59-03 (Low, spec):** EG-GROUP's wording does not match the documented group snapping rule.
- **Root's new review** (`root-review-r50-58.md`, appended to `root-pre-push-review.md` at 12:46 today) adds 5 Lows. They are forwarded in §9.
  - **Correction for B:** B wrote that `root-pre-push-review.md` was unchanged since 2026-10-07. It was modified today at 12:46:34.

Labels used below:
- **REAL** = gstack `$B` (`c-round-59/b.sh`, own state `c-round-59/c-browse.json`; daemon PID 36912, now exited).
- **REAL-mouse (PW)** = standalone Playwright: installed chromium, a fresh context with no credentials (`cookies []` in every log), no installs.
- **Forbidden requests:** 0 in every browser run, checked at URL level (gstack `network` and the PW request listener).
- **`Authorization` headers:** 0, checked at header level only in these places:
  - the PW `page.on('request')` listener (every PW run, from page load);
  - the in-page fetch/XHR hook in G59-3, which covered only the session actions after it was installed.

  gstack `network` output is URL-level only.
- `node.exe` was recorded by the gstack scripts, `r59e` and the gates. The `pw59`/`pw59b`/`pw59c` logs do not print it; the counts during those runs were 13–14 (`checkpoint.md`).

## G59-2 — tree: PASS

Files: `c-round-59/g59-2-tree-start.txt` (13:07), `g59-2-tree-end.txt` (13:23) and `g59-2-tree-final.txt` (13:55).

- HEAD is `038ed5a45f94596a264c14c4ec834607cb407948` throughout, so this is case (A).
- `git status --short` has **28 lines**: the 26 baseline lines, `?? …grid-snap-keys.test.tsx` and `?? docs/…/052-…md`. The list was identical at start and end.
- Frozen list: 414 entries, 0 non-OK, at all three checks.
- Protected files: 4/4 OK at all three checks.
- Snapshots `SHA256SUMS.txt`: 4/4 OK.
- End sha256 of the owned files:
  - StudioWorkspace `44adb8f3d189…`;
  - grid.ts `46c9b6567104…`;
  - grid-snap-menu `bb56ecf0de46…`;
  - grid-snap-ui `eb38cbf8920c…`;
  - grid-snap-keys `c9f8227401c2…`;
  - doc 052 `6f69db202812…`.
- `node.exe` counts: 9 (start), 11–14 during the browser runs, 12 (end).
- Root holds a commit bundle, `root-publish/pending/r50-58-cb12805.bundle`, that is not applied to `store/`. `cb12805` is not a valid object in the store repo, so case (A) holds.

## R59-S — static: PASS

- **Diffs** (`c-round-59/diff-*.txt`, `--strip-trailing-cr` against the snapshots):
  - **`grid.ts`:** only `adjacentGridDivision`.
  - **`StudioWorkspace`** has 5 hunks:
    - the import;
    - the two end-status constants;
    - the digit branch;
    - `changeGridDivision` added to the keydown-effect deps;
    - `aria-keyshortcuts` and the title suffix on both select variants.
  - **A's D1 (deps hunk) is accepted, with C evidence** (`c-round-59/d1/d1-evidence.txt`):
    - without the dep, `biome lint` reports `lint/correctness/useExhaustiveDependencies … does not specify its dependency on changeGridDivision`;
    - with it, 0 diagnostics;
    - `changeGridDivision` is `useCallback(…, [])` (l.832–838), so behaviour is unchanged.
- **`grid-snap-ui`, AST** (`r59-s-ui-ast.txt`, script `scripts/ast-literal-diff.cjs`):
  - 10525 nodes in both files;
  - exactly **3** string-literal diffs (l.108, l.297, l.583), each `suffixOnly=true`;
  - **0** non-literal diffs;
  - 20 `it`.
  - Negative control: a 4th edited literal is detected (`r59-s-negative-controls.txt`).
- **`grid-snap-menu`, AST** (`r59-s-menu-asteq.txt`):
  - `{"old":25,"new":28,"identical":25,"added":["GM22","GM23","GM24"]}`.
  - Negative control: an edited `'0.5 წმ'` is flagged in 3 tests.
  - The diff is a pure append inside the first describe, after GM21.
- **`grid-snap-keys`:**
  - 12 `it` (GD1, GD2, GK1–GK10);
  - describe 2 has `{ timeout: 15_000 }`;
  - imports come only from `@testing-library/react`, `react`, `vitest`, `~/components`, `~/contexts`, `~/types`, `../grid` and `../model`, with **no test-file imports**.
- **K1 read in code** (l.1301–1318):
  - the branch sits after `if (modifier) return;` and next to `G`;
  - it matches `event.code` `Digit1`/`Digit2` only;
  - it is guarded by `!altKey && !shiftKey`;
  - `preventDefault` comes before the `repeat` return;
  - it is not in the gesture-blocked list (l.1205–1224);
  - the menu file is unchanged (frozen list OK).
- **EOL:** `StudioWorkspace` is **1783/1783 CRLF**, with 0 bare LF. `grid.ts` 0/184, menu 0/850, ui 0/733, keys 0/421 and doc 0/134 are all LF.
- **Banned patterns:** the scan of the 4 LF files and the added SW lines is clean: no `any`, assertions, `@ts-ignore`, comments, hard-coded colours, `.skip`/`.only`/`.todo`, `retry`, `vi.setConfig` or per-`it` timeouts.
- **Doc 052** has all §2.5 sections: date and status, context, approach K1–K4, alternatives, the numpad note, the gesture note, changed files, problems, testing, the Ableton table and TODO.
- **`title` grep** (`title-grep.txt`): only `grid-snap-ui` l.297/l.583 (plus `HIDDEN_LINES_TITLE` l.107–108 → l.572), the new GK1 l.317, and the Snap toggle l.406, which is unaffected. **No stop condition.**

## R59-U — mutations (C's own scratch and strings): PASS

- **Setup:** scratch `c-round-59/scratch` (a copy of `store/app` plus a `node_modules` junction, removed at the end) with its own `vitest.config.mts`.
- **Script:** `scripts/cmut59.cjs`. Files: grid-snap-keys, grid-snap-menu, grid-snap-ui and gesture-guard. Unmutated: **79/79**.
- **Output:** `c-round-59/mutations.txt` (13:10–13:17, `node.exe` 9).
- Every row is `restored=true`, and after the run the scratch tree was byte-identical to `store/app`.

| # | Mutation (C string) | Failed | Named tests killed? |
|---|---|---|---|
| a | digit branch removed | GK1, GK2, GK3, GK7, GK8 | yes |
| b | `narrow = code === 'Digit2'` | GK1, GK2, GK3, GK7, GK8 | yes |
| c | branch moved before `if (modifier) return;` (dry-run diff `mut-c-dryrun.diff`: one branch, placed before the modifier return) | GK4 | yes |
| d | `!altKey && !shiftKey` dropped | GK4 | yes |
| e | `repeat` return dropped | GK6 | yes |
| f | branch `preventDefault()` dropped | GK1, GK2, GK3 | yes |
| g | end status → bare `return;` | GK3 | yes |
| h | helper `?? current` | GD1, GD2, GK3 | yes |
| i | unknown → `GRID_DEFAULT_DIVISION_SECONDS` | GD2 | yes |
| j | swallow armed before the inside-menu `return` | GM22 | yes (closes C-R58-01) |
| k | `releaseClickSwallow` calls `preventDefault()` | GM23 | yes (closes C-R58-02) |
| l | suffix dropped (`matches=2`, both variants) | GK1, GS1, GS10 | yes |
| m | `followModeRef === 'on'` dropped | GM24 | yes (closes C-R58-INFO-M; reviewer #1 anchor equality confirmed by the kill) |
| n (extra) | `Numpad1` also bound | none | info: the numpad is unbound by design |
| n2 (extra) | `narrow = code !== 'Digit2'` | none | info: equivalent under the `Digit1`/`Digit2` guard |
| p (extra) | digits added to the gesture-blocked list | none | info: untested by design (§0.2) |
| q (extra) | `aria-keyshortcuts` removed | GK1 | killed |
| s (extra) | `setGridSeconds(next)` instead of `changeGridDivision` | GK1, GK8 | killed |
| r58a | round-58 a (swallow arm removed) | GM16 | yes |
| r58d | round-58 d (`closeGridMenu` on any scroll) | GM21 | yes |

**Run alone** (`alone-grid-snap-keys.txt`, `alone-grid-snap-menu.txt`, from `store/`):

| File | Result | Duration | Slowest tests |
|---|---|---|---|
| keys | 12/12 | 5.02 s | GK5 746 ms, GK9 434 ms, GK8 380 ms |
| menu | 28/28 | 10.40 s | GM22 142 ms, GM23 156 ms, GM24 145 ms |

No test took over 3 s.

## G59-1 — gates: PASS

Files: `c-round-59/gates-meta.txt`, `tsc.txt`, `full-vitest.txt`, `build.txt`, `biome-*.txt`, `verify-1.txt`.

- **tsc:** rc 0.
- **Full vitest** (13:18, `node.exe` 9): **89 files / 1544 passed**, rc 0, 68.31 s, **0 `timed out`**.
- **Build:** rc 0.
- **Biome `./app`:** **5 errors / 218 warnings / 1 info**, equal to the baseline. The errors are the same 5 CRLF-only `format` files: StudioWorkspace, auth-bugs, grid.test, render-budget and auth.ts.
- **Owned files:** the 4 LF files have 0 diagnostics; `StudioWorkspace` lint is 0; the stdin `format` output equals the LF copy (`STDIN FORMAT EQUAL`).
- **`npm run verify`, attempt 1** (quiet, 13:20–13:22, `node.exe` 11 at the start): **rc 0**, 89/1544, both builds ✓.

## G59-3 — anonymous workspace and purchase protection: PASS

REAL gstack in a fresh daemon with its own state; script `c-round-59/g59-3.sh`, log `runs/g59-3.txt`.

- **Direct load of `/studio-lab`:**
  - `auth_user` null;
  - localStorage holds only `czaba_session_id`;
  - no cookies;
  - workspace present, with the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება` (screenshot `shots/anon-direct.png`).
- **Header link `Studio LabDemo`:** opens `/studio-lab` with the workspace and no auth.
- **REAL add + Space play/stop with the fetch/XHR auth hook:** `[]` (no workspace requests, no Authorization).
- **Network** (direct, session, header): **0** hits for `studio-token`, `recording-`, `/api/download` or R2.
  - Media requested: `middle-east.mp3` and `hero-music.mp3` only.
  - Allowed traffic: root `GET localhost:5199/api/cart` (CORS-blocked), GA/GTM and Google Fonts.
- **Anonymous `/api/studio-token?product=middle-east&file=mix.mp3`:** **401** `Please sign in to access Studio.`
  - Fake Bearer → **403** `Unable to verify ownership`. This is a change from the "fake Bearer → 500" root item: it is now a 403.
- **`/studio/middle-east`:** shows "Sign in required"; no workspace.
- **During every key, right-click and drag probe:**
  - forbidden requests: 0 at URL level, in gstack and PW;
  - `Authorization` headers: 0 at header level, from the PW request listener (`NET … withAuth 0` in each PW log).

## §4.6 — browser acceptance (round 59)

**Layout deviation:** the §4.6 KEY-\*, MN-\* and round-57 rows used the plain demo page with one or two added clips; only §4.7 used L52 (`pwlib.fresh`). No KEY row depends on L52 positions:
- narrow, widen, ends, mod, type and select are layout-free;
- KEY-SNAP needs any clip;
- KEY-PLAY needs any audio.

This is a transparency note, not a re-run.

| ID | Method | Result | Verdict |
|---|---|---|---|
| KEY-NARROW* | REAL `1` ×3, focus on body (`active: BODY`) | 1440: `data-grid-seconds` 0.5 → 0.25 → 0.1; the select follows; lane lines 20 px → 10 px, then `hidden` at 0.1 with the hidden-lines `title` (40 px/s); status `ბადე: 0.5 წმ (Snap გამორთულია)` … 1280: identical | **PASS** (`runs/keys-1440x900.txt`, `runs/keys-1280x720.txt`) |
| KEY-WIDEN | REAL `2` ×4 from 1 | 2 → 5 → 10 → 10; last status `ბადე უკვე ყველაზე ფართოა — 10 წმ (2)` | **PASS** |
| KEY-ENDS | `1` at 0.1 | still 0.1; status `ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)` | **PASS** |
| KEY-MOD | REAL `Shift+1`, `Alt+1`, `Shift+2`, `Alt+2` | no change | **PASS**. Ctrl/Cmd+digit: **not testable (CDP)**, so Tech Lead R59-T |
| KEY-TYPE | REAL click in the library search → `1`, `2` | value `1`, then `12`; grid unchanged | **PASS** |
| KEY-SELECT | REAL click on the select → Escape (focus stays on the select) → `1`, `2` | the shortcut did **not** run: no end status and no one-step narrowing. **Native type-ahead moved the select to `10 წმ`** (first option starting with "1"), and `onChange` set the grid to 10 s with status `ბადე: 10 წმ …`; `2` then left it at 10 | **PASS** per the row (native behaviour recorded). UX finding **C-R59-01** |
| KEY-SNAP | REAL-mouse (PW): add → `g` → `1` (0.5, Snap on) → drag the header +1.6 s, then +1.15 s | start 0 → **1.500** → **2.500** (0.5 multiples, not whole seconds) | **PASS** (`runs/pw59-1440x900-dismiss_keymenu_keysnap.txt`) |
| KEY-PLAY | REAL add → REAL Play → `1` → `2` → `1`; an in-page sampler every 100 ms plus an **AnalyserNode tap on every destination connection** (`tools/tap59.js`) | 125 playing samples, **0 below −60 dBFS** (min RMS −38.1); **1** `AudioBufferSourceNode.start`, **0** `stop` across the 3 key presses (nothing re-scheduled); position rate ≈ 1.0 (paired 0.64/1.66 outliers are display-sampling jitter, not at the key presses); the division changes 1 → 0.5 → 1 → 0.5; the visible master meter is `data-level-db` −10.3 … −18.8 before and after the keys | **PASS** (`runs/keyplay-1440x900-analysis.txt`, `runs/keyplay-meter-1440x900.txt`) |
| KEY-MENU | REAL-mouse (PW) right-click a lane → `1`, `2` → Escape | grid stays 1; menu stays open with focus on `✓1 წმ`; Escape closes it | **PASS** |

**Round-58 browser half:**

| ID | Result | Verdict |
|---|---|---|
| MN-DISMISS-BUTTON* | PW, 1440 and 1280, with a clip present (`runs/pw59-*-addfirst_dismiss.txt`). Each dismissing click on **Snap**, **Play** and **Export** closes the menu and does nothing: `data-snap` stays off; the transport stays `▶ Play` at 00:00.000 and the status is untouched; there is no dialog. The **next** click works each time: Snap turns on; Play gives `❚❚ Pause` with the position advancing 0.401 → 1.051 s; Export opens the dialog. | **PASS** at both sizes. D2's pointerup + macrotask timing holds in real Chromium |
| MN-REPOSITION (G5) | right-click at (712,356), then at (1112,518) without closing → **1** menu, rect [1112,518,…] | **PASS** |
| MN-FOLLOW (G6) | Zoom 97.7 px/s; Play from 0; menu opened at 1.4 s; 9 s of samples every 250 ms. The menu stayed open through the Follow page flip (scrollLeft 0 → 589 at 1440, 0 → 482 at 1280); the meter was non-−∞ in 34/34 samples. A **horizontal** wheel over the timeline closed the menu, and Follow became `paused`. | **PASS** at both sizes. The first 1280 attempt was invalid because the wheel point fell inside the menu; it was replaced. A vertical wheel scrolls nothing here (`vOverflow 0`): **C-R59-02** |

**Round-57 browser half** (PW; `tools/pw59c.cjs`; layout: Middle East on music at 0, `Soft impact` on SFX at 4):

| ID | Result | Verdict |
|---|---|---|
| MN-OPEN* | Music empty lane, SFX clip body and video lane at 1440 and 1280: the menu appears at the pointer, 8 items with `1 წმ` checked, and `contextmenu` is `defaultPrevented: true` (no native menu). Clips unchanged. | **PASS** |
| MN-EDGE* | Right edge (x = vw − 5): the menu is clamped to [1292…1436] at 1440 and [1132…1276] at 1280. Bottom: at 1440 the lanes end at y ≈ 558, so no clamp is needed (non-discriminating). **At 1280, a click at y 584 gives a menu at 473–716 (≤ 720): clamp proven.** | **PASS** (the bottom clamp is proven at 1280 only) |
| MN-NATIVE | Track header, ruler and library row: no CZABA menu, and `contextmenu` is **not** prevented (Chrome native allowed). The native menu itself cannot be seen headless. | **PASS** (event-level) |
| MN-CHOOSE | `0.25 წმ` → select 0.25, lane lines 10 px; drags with Snap on: V = **1.25**, then **1.75** (0.25 multiples) | **PASS** |
| MN-SNAP | `Snap (G)` twice: off → on (`Snap ჩართულია — ბადე 0.25 წმ (G)`), then on → off (`Snap გამორთულია — …`) | **PASS** |
| MN-KEYS | ArrowDown moves focus to `0.1 წმ`, and Enter sets 0.1 and closes; Escape changes nothing; **Space in the menu chooses the focused item and does not start playback** (`▶ Play`, 00:04.000) | **PASS** |
| MN-DISMISS | Menu open → left-click on the **unselected** music clip: the menu closes; the clip stays unselected at 0; Undo is unchanged | **PASS** (the first attempt clicked the already-selected clip and was replaced) |
| MN-NOEDIT | Music selected → right-click on the SFX clip: menu opens; selection, starts, playhead (4.000) and Undo are unchanged | **PASS** |
| R57-FOCUS (C-R51-02) | Range 11–14 → Ctrl+L → REAL click on the brace (focus = brace) → click the music header (focus → body) → ArrowRight: **music 0 → 0.100, brace unchanged**. LK-CLIP order (clip, then brace) → ArrowRight: **brace 11 → 11.1**, clip unchanged | **PASS**. **C-R51-02 closed** in the browser |
| R57-PLAY | Play from 0; menu at 1.9 s; `0.5 წმ` chosen at 2.06 s; 56 samples. Monotonic; master meter non-−∞ and tap RMS > −60 dBFS in **all** samples after 0.3 s. **SFX `start()` `when` = 4.05 against the music origin 0.05, so the scheduled onset is 4.000** (± 0.03 required). This is scheduling-level evidence; for the same geometry, the EP-VIDEO meter onset (4.030) corroborates it acoustically | **PASS** (`runs/pw59c-1440x900-play.txt`) |
| R57-LOOK* | Graphite surface `rgb(17,19,24)`, outline border, accent (amber) check, brand focus ring `rgb(18,217,200)` (`:focus-visible`); text readable; no clipping | **PASS** (`shots/r57-look-1440x900.png`, `shots/r57-look-1280x720.png`) |
| Probe 4 and reviewer #9 | First open after navigation: focus is on the checked item `✓1 წმ`, with `:focus-visible` true, so the ring shows on a mouse open | recorded (info) |

**Invalid run, replaced (honest note):** the first full `pw59c` run was invalid for three reasons:
- **The Solo click.** My setup clicked the SFX header at (+60, +50), which is the **Solo** button (`aria-pressed=true`, `runs/pw59c-1440x900-oldsetup.txt`). The silent R57-PLAY in that run was correct Solo behaviour.
- **The placement.** It also placed `Soft impact` on the music lane.
- **The edge click.** The bottom-edge click hit the track-height handle.

The fixed runs replace it. A minimal check confirmed real audio in PW: context `running`, meter −8…−15 dB (`runs/pwdiag-*.txt`).

## §4.7 — carried stage-4a browser half

**Method:** REAL-mouse (PW) with the round-51 fixture (`tools/pwlib.cjs` `fresh` + `s31.js`, SYNTHETIC setup only), runner `tools/r59e.cjs`, logs `runs/r59e-*.txt`.

**Layout L52:**
- video 0 → **V = 6.008**, read raw from `window.__c.arr()` (V·1000 is an integer);
- music `სრული მიქსი` 7–23;
- `Soft impact` on SFX 4–6;
- 40 px/s.

**Shift:** Shift is pressed **after** mouse-down. Shift before down adds to the selection (SHIFT-BEFORE-DOWN-NOTE); my first SH run did that and was replaced.

| ID | Result | Verdict |
|---|---|---|
| EG-OFF | 6.6, free | PASS |
| EG-1 | **7**; `კლიპის გადატანა: start 00:07.000, …`; Undo `კლიპის გადატანა`; Ctrl+Z → 4 | PASS |
| EG-VIDEO | start **4.008**, end **6.008**; \|start − (V − 2)\| = 0 | PASS |
| EG-LINE | 9 | PASS |
| EG-ALT | 6.6, free | PASS |
| EG-ALT-ON | 7 | PASS |
| EG-CROSS | stems **7**; `გადატანა ხაზზე — სტემები: start 00:07.000.` | PASS |
| EG-GROUP | SI 4 → **10** and music 7 → **13**: one delta of **6**, both moved, anchor on the 10-s line, no edge capture; status `გადატანა (2): 2 კლიპი გადავიდა 00:06.000-ით მარჯვნივ.` | **not PASS: criterion mismatch (C-R59-03).** The code (`snapGroupDelta` / `groupDeltaOnGrid`, since stage 2) snaps the anchor's **absolute** start to the grid. The row asks for "a multiple of 10 s from their starts". Behaviour is consistent and documented; B must rule on the wording |
| EG-1280 | 7; Ctrl+Z → 4 | PASS |
| SH-CROSS | stems, start **4.008** unchanged (\|d\| = 0); `გადატანა ხაზზე — სტემები: start 00:04.008.`; Undo `გადატანა ხაზზე — სტემები`; Ctrl+Z → SFX 4.008 | PASS (closes C-R54-01's browser half) |
| SH-SAME | 4.008 unchanged; `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`; Undo unchanged | PASS (C-R54-02's browser half) |
| SH-NOTE / CX-NOTE | (V − 2)·1000 = 4008 and V·1000 = 6008 are integers, so SH-* and CX-VIDEO are **regression checks only**. Sub-ms exactness (C-R53-01, C-R54-01/02) stays **unit-only**; no sub-ms `/studio-lab` asset was found | recorded |
| CX-VIDEO | stems 4.008–6.008; status and Undo verbatim; Ctrl+Z → SFX 4 | PASS |
| EP-VIDEO | h30 `start()` (`when − at`, off, dur): video `[0.05, 3, 3.008]` (lead 0.05 at position 3); SFX `[1.058, 0, 2]` → onset 3 + 1.008 = **4.008 = V − 2**, stop **V**; SFX meter first above −∞ at **4.030** ∈ [3.988, 4.108] | PASS |
| EP-OFF | SFX `when − at` **0.95** (= 0.9 + 0.05 lead); meter onset 3.931 | PASS |
| EP-CROSS | stems source `[1.058, 0, 2]`; **stems** meter onset 4.038; SFX meter never rose | PASS |
| EP-SHIFT | same `when` (1.058); stems meter onset 4.041; SFX none | PASS |
| LN setup | `Slow rise` dropped on SFX: S = **9.4**, D = **5** | — |
| LN-TOUCH | **7.4** = S − 2 | PASS |
| LN-AFTER | **14.4** = S + D | PASS |
| LN-SHORT (C-R52-03) | (1) Ls = 0.5 (4–4.5); (2) SI → 16; (3) `Slow rise` → **11.000–16.000** with the normal move status; Ctrl+Z ×3 restores everything | PASS (C-R52-03's browser half) |
| ET-START | start **9.4**, offset 2.4000000000000004 (= 9.4 − 7 in binary floating point) | PASS |
| ET-END | end **14.4** | PASS |
| ET-ALT | end 14.35 (free) | PASS |
| ET-CLAMP | end stays **6**; `Trim — მარჯვენა კიდე: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` | PASS |
| SN-1 | 5 | PASS |
| NU-1 | 5 | PASS |
| Stage-2 trim | music end at raw 20.3 → 20 | PASS |
| RU-1 | 7 | PASS |
| LB-MOVE | loop made with Snap off: 11.325–14.125 → +10 px with Snap on, division 1 → **12–14.8** | PASS (the first attempt, with a Snap-on loop at 11–14, was non-discriminating and was replaced) |
| LD-1 | `Slow rise` on stems at **9**; ghost `00:09.000` | PASS |
| R8-M | Shift cross-lane 4 → stems **4** | PASS |
| Clip-body click | 8.4 → seek **8** | PASS |
| REG-HYD | fresh load, 3 s console: **0** hydration/React/`useLayoutEffect` warnings; 1 aria-label containing U+FFFD. **C-R23-01:** the SSR response has **5 NUL** bytes (offsets 11729, 28025, 28026, 54650, 60794; `runs/ssr-nul.txt`) | PASS (C-R23-01 is still present, Tech Lead) |

**C-R51-01 probe (evidence for B, not PASS/FAIL):**

| Case | Event counts | Final events | Result |
|---|---|---|---|
| Blocked release: `Soft impact` from the library onto SFX at 4.5 (occupied 4–6) | dragenter 11, dragover 5, dragleave 11, **drop 0**, dragend 1 | the last `dragleave` has `relatedTarget` **null**; `dragend` `dropEffect` **`none`** | ghost `00:04.500 · აქ ადგილი არ არის` (`blocked=true`); nothing added |
| Lane-to-lane then drop: via SFX to stems at 12 | dragleave 7 (sfx→stems `relatedTarget` = stems), **drop 1** | `dragend` `dropEffect` **`copy`** | added |

**Discriminator:** a blocked release has **no `drop`** and `dragend.dropEffect === 'none'`, so it can be told apart from a lane-to-lane move.

## Ableton conformance (two verdicts per row)

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| A key narrows the grid | **PASS**: GK1, GK3, KEY-NARROW | **Deliberate difference.** §6.10 (C read B's capture `b-round-46/ableton-6.7-6.10-20261016.txt`): "Ctrl1 (Win) / Cmd1 (Mac) narrows the grid, doubling the density". CZABA uses plain `1` and steps to the next seconds division, not ×2 |
| A key widens the grid | **PASS**: GK2, KEY-WIDEN | **Deliberate difference** (Ctrl2/Cmd2 "halving the density" vs plain `2` and the next larger division) |
| Behaviour at the narrowest/widest division | **PASS**: GK3, KEY-ENDS | **Unconfirmed** (no source) |
| Triplets (Ctrl+3) | — | **Does not apply** yet (stage 5) |
| Snap on/off (Ctrl+4) | **PASS**: `G` and the menu item (MN-SNAP, KEY-SNAP) | **Deliberate difference** (`G`) |
| Fixed / adaptive grid (Ctrl+5) | — | **Does not apply** (not requested) |
| The current spacing is shown | **PASS**: the select and the status (GK1, KEY-*) | **Deliberate difference** in placement: Live shows it "above the time ruler in the lower right corner"; CZABA uses the header select and the status line |
| Width from the track context menu | **PASS**: MN-OPEN, MN-CHOOSE | Entry point **confirmed** (§6.10); content is a **deliberate difference** (round 57) |
| Dismissing press, Follow scroll, focus return (GM22–GM24, MN-*) | **PASS** | **Unconfirmed** (no source) |
| Ctrl/Cmd+digit in a real Chrome | **not testable (CDP)** | **Unconfirmed**, so Tech Lead R59-T |

No Live installation or video was available, and C did not claim "Ableton does the same" anywhere.

## Findings for B

1. **C-R59-01 (Low, UX).**
   - **What happens (measured):** with the header division `<select>` focused by a mouse click and its popup closed with Escape, pressing `1` makes native type-ahead jump to **`10 წმ`**.
   - **Expected but not measured:** the same after choosing an option with the mouse, because Chrome normally keeps focus on the select. The native popup cannot be driven headless. That is the opposite of "narrow", and the same element's tooltip says `1 — უფრო მჭიდრო`.
   - **Why it matters:** this is the most likely moment for a user to try the hint they just read.
   - **Spec status:** this behaviour is what the spec specifies (GK9, KEY-SELECT), so it is not a failure of this round.
   - **Related:** reviewer #3 (`aria-keyshortcuts` sits on an element where the keys do nothing).
   - **Options for B:**
     - (a) move the hint and `aria-keyshortcuts` to the grid-control container;
     - (b) blur the select after `onChange`;
     - (c) handle `Digit1`/`Digit2` on the select itself.
   - Evidence: `runs/keys-1440x900.txt` SELECTCLICK → SELECT1.
2. **C-R59-02 (info).**
   - **What happens:** with no vertical overflow, a plain vertical mouse wheel over the timeline scrolls nothing, so no `scroll` event fires and the grid menu stays open.
   - **Spec status:** rule S is scroll-based, so this is consistent with the spec. A user may still expect the wheel to dismiss the menu, as it does for native menus.
   - **Related:** root's Low #1 (a vertical **scroll** while Follow is playing does not close the menu) could not be exercised, because `vOverflow` is 0 at both viewports with 4 lanes.
3. **C-R59-03 (Low, spec text).** EG-GROUP's PASS text ("a multiple of 10 s from their starts") contradicts the implemented anchor-to-grid group rule. **B ruling is needed:** either correct the row, or open a behaviour task if delta-multiples were really intended.
4. **Reviewer items forwarded from A:**
   - #3 (`aria-keyshortcuts` semantics; see C-R59-01);
   - #4 (`GRID_DIVISIONS_SECONDS[6]`/`[0]` tied to the list length);
   - #5 (a repeated end status is not re-announced);
   - #6 ("Zoom. · 1 —" punctuation);
   - the architecture note on the duplicated grid test harness (~250 lines across `grid-snap-*`).

## Closures C can support

- **C-R58-01, C-R58-02, C-R58-INFO-M:** closed. GM22–GM24 kill mutations j, k and m.
- **A-R57-REVIEW-DISMISS-CLICK (G1):** closed (MN-DISMISS-BUTTON\* PASS).
- **A-R57-REVIEW-FOLLOW-SCROLL (G6):** closed (MN-FOLLOW PASS at both sizes).
- **C-R51-02:** closed (R57-FOCUS PASS).
- **C-R52-03:** browser half PASS (LN-SHORT).
- **C-R54-01 / C-R54-02:** browser halves PASS (SH-CROSS / SH-SAME). They are regression-level only, because V is whole-ms; sub-ms stays unit-only.
- **C-R53-01:** CX-VIDEO / EP-CROSS PASS at regression level; sub-ms stays unit-only.
- **G-3 / G51-3 debt:** cleared (G59-3 PASS).

**C-R51-01:** the probe evidence is above, and B decides for 4c.

## Commit readiness (for root)

- **Round 59:** **ready as an interim change.**
  - Offline gates PASS; §4.6 browser PASS.
  - It touches `StudioWorkspace.tsx`, `grid.ts` and `grid-snap-ui`, which the pending `r50-58-cb12805` bundle also changes, so apply cb12805 first; round 59 is then a clean 4-modified + 2-new diff.
  - **Open but non-blocking:** C-R59-01/02/03.
- **Round 58:** **ready.** MN-DISMISS-BUTTON, MN-REPOSITION and MN-FOLLOW are now proven in the browser.
- **Round 57:** **ready.** The browser half passed.
- **Round 56:** **ready** (unchanged).
- **Rounds 50–55:** **ready.**
  - The carried 4a browser half passed (EG-GROUP is a spec-wording ruling, not a defect).
  - The anonymous/purchase check G59-3 passed.
  - Root's cb12805 bundle covers rounds 50–58.
- **Interim, not a release:** video sync, the export flow and the FB regression were not run (§10).

## §9. Carried items (honest; not run this round unless stated)

- **`root-pre-push-review.md`** (mtime **2026-10-18 12:46:34**; original 2026-10-07 content unchanged, root appended a note):
  - **Video sync:** RF3-1, RF3-2, R5-L6 (C-R27-01) are open and were **not run**.
  - **Partially measured:** R5-L3.
  - **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
  - **Medium:** M1 (rAF-only loop refill, so a hidden tab goes silent) and M2 (per-frame `position` re-renders).
  - **Lows:** L1–L4 and L6–L8.
- **`root-review-r50-58.md`** (new, 12:46; root COMMIT OK 8/10). Five Lows for B to schedule:
  1. a vertical user scroll during Follow does not close the menu (see C-R59-02; not reproducible here without vertical overflow);
  2. an armed swallow can eat a later keyboard click if the `pointerup` was lost (Alt-Tab while held). Suggested fix: release on capture `keydown` / `blur`;
  3. a right-click on the menu itself shows the native menu;
  4. `rightClick()` in `grid-snap-menu` leaves the swallow armed between tests;
  5. the duplicated Follow predicate (proposal: `isFollowAutoScroll` / `useArrangementGridMenu`).

  Root's info item (the M6 reposition path in real browsers) is now covered by MN-REPOSITION PASS.
- **`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24, unchanged):
  - SRW-21: the purchased loader hardcodes `middle-east`;
  - portable instruction paths;
  - scrollbar refinement (1280×720 / 1440×900);
  - library and stems parity (SRW-11/12);
  - T12 continuation.
- **Root/env:**
  - ENV-DEV-SERVER-DOWN-R52 is resolved this round (servers up from about 13:23);
  - the fake-Bearer item is now **403**, not 500;
  - the root `GET /api/cart` is CORS-blocked from `127.0.0.1:5173` (console errors only);
  - the stray `store/nul` and the CRLF Biome errors are unchanged.
- **Tech Lead:**
  - R59-T: Ctrl/Cmd+1/2 in a real Chrome, plus `1`/`2` and search typing by hand;
  - C-R23-01 (5 NUL in the SSR stream, 1 U+FFFD aria-label);
  - C-R27-01, C-R6-02, C-R8-01, C-R38-01, C-R41-01, and the earlier list.

## §10. Not run this round (honest)

- Video sync (RF3-1, RF3-2, R5-L6, C-R27-01).
- The full find → add → fit video → **export WAV** flow with frame/NaN/RMS checks.
- The FB-01..FB-16 stage regression.
- `npm run test:e2e:smoke` (root's).
- A real `pointercancel`.
- Mid-gesture `1`/`2` (untested by design; mutation p survives).

None of these is PASS. SRW-14 stage 4b-2a can move to **მზადაა** for its own scope. The project and SRW-14 are **not** complete.
