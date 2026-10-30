# C round 276 — SYS-5 stage 1 (soft-disabled transport buttons) + RT-FIX 276

**Verdict: PASS, with one failed half-row (Low, predates this round) and two Low findings for B.** Real Chromium (Playwright) on `/studio-lab`, fresh anonymous contexts, 1440×900 and 1280×720 (B-TAB also at 375×812). HEAD control: a second dev server at `a4c0e24` (`git archive` extract, port 5174, its own Vite cacheDir). Both are now removed. `browserVerified = realVerified = true`: every browser row of §8 ran. Nothing is BLOCKED.

Evidence: `c-round-276/` (`c276-new.json`, `c276-head.json`, `c276-ring-new.json`, `c276-ring-head.json`, `c276-blur.json`, `c276-smoke.json`, scripts `c276.cjs`, `c276-ring.cjs`, `c276-blur.cjs`, `c276-smoke.cjs`, logs, PNGs).

## Findings first

### C-R276-01 (Low, against B's spec; not a regression). V-HOVER-SOFT cursor half fails
- **Expected (§8 V-HOVER-SOFT):** a hovered soft-disabled button computes `cursor: not-allowed`.
- **Actual:** `pointer` on all seven at both viewports (`c276-new.json` `look@*.hoverSoft[*].cursor`).
- **HEAD:** the natively disabled buttons also compute `pointer` (`c276-head.json` `look@*`). The control in the page agrees: `<button disabled class="disabled:cursor-not-allowed">` computes `pointer` too (`c276-ring-*.json` `cursorControl`).
- **Cause (confirmed):** `app/styles/app.css` l.483 `button { cursor:pointer }` is unlayered CSS, so it beats every Tailwind utility in `@layer utilities`. A's token `aria-disabled:cursor-not-allowed` is present (SD7) and compiled, but it loses the cascade.
- A raised this as a STOP in `a-round-276.md`, and B has not ruled yet. B's options:
  - (a) grant l.483, for example `button:not(:disabled):not([aria-disabled="true"])`, or move it into `@layer base`;
  - (b) use the in-grant form `aria-disabled:cursor-not-allowed!` (one token, plus SD7's list).
- The background half of the row passes: hover background equals rest on all seven.
- The task premise "HEAD shows not-allowed" was never measured (B's `baseline.cjs` did not read `cursor`). L29 premise gap.
- The same mismatch exists at HEAD, so a Low in `deferred_low_polish` or a one-token stage-2 fix are both fine. §11 routes only Medium+ look-row failures to a fix-up.

### C-R276-02 (Low/info, against B's §2.1 L49 table). A greyed-button click no longer commits a pending text field
- **Steps:** `/studio-lab` at 1440×900 → click the tempo input → type `97` (no Enter) → mouse-click the soft-disabled Undo.
- **New build:** focus stays in the tempo input. The value is not committed: `data-bpm` is empty and the status is unchanged.
- **HEAD:** the natively disabled click drops focus to BODY, which blurs the field and commits it (`data-bpm="97"`, status "Tempo 97 BPM · 4/4 — bars ruler updated…").
- **Evidence:** `c-round-276/c276-blur.json`, `c276-blur.cjs`.
- This is the intended effect of §2.1 mousedown `preventDefault` (B-MOUSE-FOCUS demands "not BODY"). B's L49 list rules "no mouse focus → kept" but does not rule "a click on a disabled button blurs the active field". The value is not lost: it commits on the next Enter or blur. A's code-reviewer predicted this (FYI Low). For B to rule at stage 2.

### Noted, not new
- **A-R276-REVIEW-DELETE-NAME (Low, A's reviewer):** confirmed in the browser. The AX tree gives the soft-disabled Delete the name "Delete — the selected clip; leaves a gap" and the description "Delete — select a clip or make a time selection first (Delete)". §2.2 froze the `aria-label`, so this is not a failure of A's work. It is newly reachable by Tab, so B should take it into stage 2 or `deferred_low_polish`.

## Rows

### Scope, claims, tests
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | `git status --short` lists the 9 modified §5 paths plus the new doc 206. `sha256sum -c b-round-275-r276-tree-sha256.txt` rc 0, both at the start of C's phase and after cleanup |
| HUNK-SCOPE | PASS | `app.css` l.380–381 and `utilities.css` l.73–74: only the `:not([aria-disabled="true"])` selector suffix. `strings.ts`: the two null branches plus `splitNeedsTargetTitle` / `deleteNeedsTargetTitle`. `ArrangementTransport.tsx`: the helpers, the 7 `disabled` → props + guards, the Split/Delete titles, `toolButtonClass` + 4 overrides, and the handoff predicate. Play/Stop handlers and the position writer are unchanged. Delete's `aria-label` is unchanged. 0 `enabled:`, 0 `disabled:`, 0 `disabled={` in the transport |
| CLAIMS | PASS | `claims.sh` re-run on an `a4c0e24` extract: byte-identical to `b-round-275/claims-output-at-a4c0e24.txt`, and every K1–K14/SW1 value matches §9. K10 was re-measured in the browser on HEAD: 7 transport Tab stops, the 7 natively disabled buttons with the "Title today" texts (`c276-head.json` tab/ax). Rerun time ≈ 4 min |
| SWEEP | PASS | SW1 on A's tree gives 39 files; the transport filter leaves transport-surface 9, mode-toggle 5, self-disabling 3. Every remaining hit is non-transport: `BASE_FILL` → TS8 Snap/Env/Master (l.544); `ON_TOKENS`/`DROPPED_TOKENS` → DXT4 (l.379); `fullOn` → WORKSPACE/TEMPO_ROW; `reset().disabled` → detail panel; l.521 SD1 `button.disabled === false` (stronger); l.652 SD7 token. This is A's B-R276-SHARED-TEST-CONSTANTS deviation, inside the grant wording "token lists naming the transport's tokens" |
| TESTS-TARGETED | PASS | the 20 §6.3 files on a scratch copy of A's tree: 20 files, 379 tests passed, 32.8 s (`vitest-targeted.log`) |
| TEST-CHANGES | PASS | every removed `-` line in the 5 test diffs has an equal or stronger replacement (`.disabled` → `aria-disabled` + `hasAttribute('disabled') === false`; token-for-token lists of the same length). No assertion was lost |
| MUTANTS | PASS | M1 (Split guard deleted) → SD2 and SD2b red (`m1.log`). M3 (predicate back to `.disabled`) → FL3, FL4, FL5, FL6, FL10, SD5 red (`m3.log`). File restored and `cmp`-verified |
| SD5b statement | PASS (checked) | A's four-pair argument holds against §2.4: an undo always creates a redo entry and the reverse; a successful delete always creates an undo entry, and a refused delete changes nothing; Fit is never unavailable. Doc 206 l.18 says SD5b was not written |

### Browser behaviour (new build; HEAD control where the row asks)
| Row | 1440×900 | 1280×720 | Notes |
|---|---|---|---|
| B-TAB | PASS | PASS | 14 transport stops in the exact §8 order (375×812 also 14). Backward from End + Shift+Tab gives the same set reversed. Each soft-disabled stop has `aria-disabled="true"`, `:focus-visible`, a 1px solid brass ring at 80 %, and effective opacity 1. HEAD: 7 stops at 1440, 1280 and 375 |
| B-AX | PASS | PASS | CDP: all 7 are buttons with `disabled: true`, `focusable: true`, and description = the §1 "Title after". HEAD: `disabled: true`, not focusable, HEAD titles |
| B-NOOP | PASS | PASS | Enter, Ctrl+Space and mouse click on each of the 7: status, Undo title, clips, range, loop, zoom and scroll are identical (`noop@*.allSame=true`, 0 diffs) |
| B-MOUSE-FOCUS | PASS | PASS | focus on the first library item survives a click on the soft-disabled Split. HEAD (data): focus → BODY |
| B-REASON-TITLES | PASS | PASS | after a 1.5 s hover (`:hover` true), all 7 titles equal §1. With a clip selected: Split `Split at the insert marker (Ctrl+E)`, Delete `Delete clip — leaves a gap (Delete)`. With a range: `Split clips at the time selection (Ctrl+E)` and the range hint. Headless Chromium does not paint native OS tooltips, so the title attribute plus the hover state is the observable part |
| B-HANDOFF-DELETE | PASS | PASS | clip deleted, focus on Undo with the ring visible; Enter → the clip is back |
| B-HANDOFF-ZOOM | PASS | PASS | range, Z×2, Tab to Zoom back, Enter×2 → 40 px/s and focus on Fit |
| B-HANDOFF-UNDO | PASS | PASS | edit undone, focus on Redo |
| B-ENABLE-WHILE-FOCUSED | PASS | PASS | Redo → focus Undo; Tab → soft-disabled Redo; Ctrl+Z → Redo loses `aria-disabled` and keeps focus; Enter → redo |
| B-SPACE | PASS | PASS | focus on soft-disabled Zoom to selection: `data-playing` false>true>false, zoom unchanged, focus kept. Control Fit (new): identical. HEAD Fit: identical; HEAD Zoom to selection cannot hold focus (BODY) |
| B-SHORTCUTS | PASS | PASS | Ctrl+Z, Ctrl+E, Delete, Ctrl+L, Z and X status texts are byte-identical to HEAD |
| B-SHEET-RESTORE | PASS | PASS | `?` opens the sheet, Esc closes it, and focus returns to Undo. HEAD data: Undo cannot be focused (BODY), and focus is restored to the "Keyboard shortcuts (?)" button |
| STUDIO-SMOKE-276 | PASS | PASS | `data-playing` false>true>false, playhead advances and holds, live RMS > 0.001, export WAV 16 s, sha256 `1fea093b…` equal to round 275, 0 NaN |

### Look
| Row | Result | Evidence |
|---|---|---|
| V-REST | PASS | label text new (114,110,104), HEAD (108,104,98) = B's prediction exactly; fill new (32,30,28), HEAD (26,24,22), within ±4 of the predicted (33,30,28). ΔE2000: text 2.31, fill 1.88, Zoom-to-selection icon 2.18, Zoom back 2.30 (all ≤ 3). Boxes are identical to HEAD (±0 px) at both viewports |
| V-HOVER-SOFT | **FAIL (cursor half) / PASS (background half)** | C-R276-01 |
| V-HOVER-ENABLED | PASS | computed rest, hover and press backgrounds of Fit, Follow (on), Play, Stop and Loop (on) are identical to HEAD at both viewports |
| V-PRESS | PASS | mousedown-hold on each soft-disabled button: `transform: none`. Fit pressed: `matrix(0.98,…)`, equal to HEAD |
| V-RING | PASS | real Tab focus (`c276-ring-new.json`): all 7 have a solid 1px ring in `rgb(201,164,106)/0.8` at offset 2px, button opacity 1, children 0.4. The ring pixel (165,135,88) on the toolbar (22,20,18) gives a contrast of 5.43:1, identical to Fit, and to HEAD's Fit. My first `look` pass read `outline: none` because programmatic `.focus()` after mouse moves is not `:focus-visible` there; the Tab-driven file is the evidence |
| SCREEN-BUDGET | PASS | persistent text lines outside the timeline, HEAD = new: 1440 empty 61 / with a clip 67; 1280 empty 51 / with a clip 62; text-node lists identical |

### Guards, docs, RT-FIX
| Row | Result | Evidence |
|---|---|---|
| G276-AUTH | PASS | at both viewports, in a fresh context with no cookies or storage: `/studio-lab` badge "Demo collection — no sign-in required", `auth_user` null. `/studio/middle-east` → "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token?product=middle-east&file=Music.wav` with no header → 401 `{"error":"Please sign in to access Studio."}`; with a fake Bearer → non-200, no token (`c276-smoke.json`) |
| DOC-206 | PASS | l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 276 PASS)`. The 7 TEMPLATE headings are in order. Every cited row id exists (SD1–SD7, SD2b, FL3/FL6/FL10 in FL3–FL6, ST-K1); SD5b is cited only as "not written" |
| RT-FIX-276 | PASS | `retro-275.md` §8: two RT-FIX 276 bullets. C-R265-01 is in L49's evidence; D-29z575 names the L4 "Same key path" clause. `backlog.json`: RC-R265-AT-RISK-NO-ROW status `applied … RT-FIX 276`; GATE264-ARCH-TEST-HELPER disposition with "13 users", and `grep -rl workspace-test-environment app \| wc -l` = 13; C-R275-01/02 "pending C RT-FIX-276 row"; `retro_runs` 275 notes the correction. `b-round-274/stops.txt` comment: 13 files match lines 1–3 (261–273), only 267 is a STOP. `screen-review-275.md` SR-275-1: the 1280 wording matches INFO-C275-05 |

**Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, `test:e2e:smoke`.

## Ableton conformance (separate from the CZABA requirement)
- APG "aria-disabled keeps toolbar controls focusable": **confirmed** by its source and matched in the browser.
- Live 12's handling of unavailable controls under Tab or a screen reader: **unconfirmed** (no source; LIVE-MEAS-SYS5-DISABLED is still open).
- Reason text in titles: a Saba-approved addition (DUX-R-4(b)), not a Live behaviour.

## Environment notes
- The first HEAD server run shared `store/node_modules/.vite` through the `node_modules` symlink. It was restarted with its own cacheDir after one aborted control run; the 5173 server stayed healthy (200) and its rows were unaffected.
- `head/`, `scratch/` and `head-vite-cache/` were deleted after the run, and the 5174 server is stopped.
- At the end, `sha256sum -c` rc 0 and `git status --short` lists only A's §5 paths.
