# C — Round 170 verification: V-3c-4c-2 (Clip details panel button surfaces + field radius, D-29z135)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. 0 bugs. One row is BLOCKED by the cloud environment (Fake-Bearer 403: backend unavailable in cloud).
Environment: `env-status.json` store 200 (round 170). Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720. Every measured session recorded `document.fonts.ready` and the font status: fonts ok and 0 non-200 font responses in all of them, d6 and g170-3 included. That closes the round-169 fontStatusGap.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T170-TARGETED | PASS: **185/185** on the 11 files of `a-round-170/vitest-files.txt`, equal to A's count. DSU1, DFR1, DPS1–DPS5, TH5, TH10, PM1, PM2 and F4 are present and green. | `c-round-170/out/vitest-c.json` |
| SOURCE-SCOPE | PASS: HEAD `352dc91`. Frozen 985 OK at start and at end. `a-round-170/end-sha256.txt` OK. `git status` = 3 ` M` + doc 139 `??`. The protected diff is empty (only the 3 granted paths differ). The tree hashes at start and end of C's phase are identical (`start-tree-sha256.txt` = `end-tree-sha256.txt`, 989 files). | `c-round-170/*-tree-sha256.txt` |
| AN-REVIEW | PASS (see below) | `git diff 352dc91` |
| SURF-V3C4C2 | PASS at both viewports | `out/surf/surf-{1440,1280}-1{,-rm,-crops}.json` |
| BOX-V3C4C2 | PASS: worst delta **0.00 px** | `out/box-v3c4c2.json` |
| CONTRAST-V3C4C2 | PASS | `out/box-v3c4c2.json`, surf JSON |
| RV1-V3C4C2 | PASS | `out/rv1-v3c4c2.json`, `out/d6/` |
| FUNC-SMOKE-V3C4C2 | PASS at both viewports | `out/func/func-1440-2.json`, `func-1280-1.json`, `shots/func/` |
| FOCUS-RING-INFO | Informational: the double ring shows (see below) | `out/focus-1440.json`, `shots/focus/` |
| G170-3 | PASS. Fake-Bearer 403 is BLOCKED (backend unavailable in cloud). | `out/g170-3.json`, `shots/g170-3-*.png` |
| PX-NET / REG-HYD | PASS: 25 measured sessions with 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror and 0 bad font responses. Cart noise only (2 per session). | the surf, func, d6 and focus JSONs |

## AN-REVIEW (C read the diff itself)
- **Component:** only 4 lines changed, all class strings: l.640 `inputClass`, l.752 Set selection, l.861 0 dB, l.1142 toggle.
  - **S1–S3:** `rounded-sm`→`rounded-md` and `border-outline`→`border-transparent bg-foreground/5`, plus the 4 MOTION tokens and `enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`.
    - Each button has exactly one border colour.
    - Kept: `hover:text-brand`, the focus ring, `disabled:text-dim` (S1/S2), `font-mono` (S2), `inline-flex h-6 shrink-0 items-center gap-0.5 pl-2 pr-1` (S3) and `h-6 w-fit px-2` (S1/S2).
    - No `disabled:opacity-40`.
  - **F1:** only the radius changed; `border-outline-strong` stays.
  - The only arbitrary values are the 4 MOTION tokens.
  - No text, aria, role, title, handler, size, gap or padding change.
- **Test file:** +104/−0, in a new describe at the end. Its helpers and token lists are inside the describe. `afterEach` unmounts, then unstubs. `expect(` count: 48 → 60. `DSU1`/`DFR1` appear nowhere else in `app` or `e2e`.
- **Doc 138:** only l.4 (exact status text) and the l.126 TODO, which is struck through.
- **A's process note (C-R120-01 class):** A briefly wrote a shell-heredoc placeholder into the test file before replacing it with Edit. Closed: `grep -c PLACEHOLDER_R170` on the final test file = 0, and the file's sha equals `end-sha256.txt`.
- **Doc 139:** exists with the TEMPLATE sections: context, approach, architecture, files, problems, testing, TODO. Status `In Progress (awaiting C round 170)`.
  - Its D2 content is present: R1/R3/R13/R14, the probe table, the before/after tokens, the m213–m218 mutations, and the trade-offs (1.12, 4.82, B-R169-1280).
  - The TODO lists V-3c-4c-3, V-3c-5 (including this file's framed boxes), DUX-R-5, M1/M3/M4 and checkpoint Q1 fallback (c).

## SURF-V3C4C2 (shipped classes, no DOM swap; real mouse hover and held button released off-target)
Both viewports gave identical values:

| Control / state | border-top | width | radius | rest bg (eff.) | hover bg / text | active bg | transition | reduce |
|---|---|---|---|---|---|---|---|---|
| Set selection D1 (enabled) | transparent | 1 px | 8 px | rgb(33,31,28) (raw 5 %) | rgb(39,36,34) (8 %) / rgb(201,164,106) = brand | rgb(48,46,43) (12 %) | `background-color, color` 0.18 s `cubic-bezier(0.2, 0.8, 0.2, 1)` | `none` |
| Toggle D0 "Collapse" | transparent | 1 px | 8 px | rgb(33,31,28) | rgb(39,36,34) / brand | rgb(48,46,43) | same | `none` |
| Toggle D2 "Expand" | transparent | 1 px | 8 px | rgb(33,31,28) | rgb(39,36,34) / brand | rgb(48,46,43) | same | `none` |
| 0 dB enabled (D1 after `-6` + Enter) | transparent | 1 px | 8 px | rgb(33,31,28) | rgb(39,36,34) / brand | rgb(48,46,43) | same | `none` |
| Set selection D0 (disabled), info | transparent | 1 px | 8 px | rgb(33,31,28) | unchanged, text-dim rgb(146,138,125) | n/a | same | `none` |
| 0 dB at 0 dB (disabled, D0 and D1), info | transparent | 1 px | 8 px | rgb(33,31,28) | unchanged, text-dim | n/a | same | `none` |

- The brand token resolves to rgb(201,164,106), so hover text = brand.
- After release, each button goes back to the rest fill with 13.24 contrast.
- **Fields** (From, To, Clip Gain; D0/D1):
  - radius 8 px on all corners;
  - border 1 px rgb(115,107,96), unchanged;
  - their transition is the old one (not in scope).
- **Pending Clip Gain** (`3` typed, not committed): border rgb(217,163,91) = the `border-warning` token, radius 8 px, contrast 15.62, and the pending marker is present.
- **Fill against its own surface:** 1.12 at both viewports (informational; GATE167-WCAG-1411-FILL).
- **4× crops** (DPR 4), in `shots/surf/crop4x-*`, for Saba's veto:
  - D1 rest and hover of all 3 buttons;
  - the enabled 0 dB at rest and on hover;
  - the fields row and the pending field;
  - the D0 and D2 toggle.

## BOX-V3C4C2 (raw rects vs `b-round-169/out/v3c4c2-probe.json` `before.box`, same states at 352dc91)
| VP | State | apply | reset | toggle | start | end | gain | fader |
|---|---|---|---|---|---|---|---|---|
| 1440 | D0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1440 | D1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1440 | D2 | 0 | 0 | 0 (1360,801.5,68,24) | hidden (0) | 0 | 0 | 0 |
| 1280 | D0 | 0 (90×**18**, baseline) | 0 | 0 | 0 | 0 | 0 | 0 |
| 1280 | D1 | 0 (90×**23**, baseline) | 0 | 0 | 0 | 0 | 0 | 0 |
| 1280 | D2 | 0 | 0 | 0 (1200,621.5,68,24) | 0 | 0 | 0 | 0 |

- The D1 clip is the music clip at 1.000 s, picked explicitly by lane and start.
- The 1280 Set selection squash (18 / 23 px) is unchanged. It is the pre-existing B-R169-1280-SET-SELECTION-SQUASH, not a finding.

## CONTRAST-V3C4C2 (canvas colour parse on the composited background)
| Control | 1440 | 1280 | Rule |
|---|---|---|---|
| Set selection D1, rest / hover / active | 13.24 / 6.58 / 5.82 | 13.24 / 6.58 / 5.82 | ≥ 4.5 ✓ |
| 0 dB enabled, rest / hover / active | 13.24 / 6.58 / 5.82 | same | ✓ |
| Toggle D0/D1/D2, rest / hover / active | 13.24 / 6.58 / 5.82 | same | ✓ |
| From/To/Clip Gain, D1 enabled | 15.62 (B before 15.62) | 15.62 | equal ✓ |
| From/To/Clip Gain, D0 disabled | 5.69 (B 5.69) | 5.69 | equal ✓ |
| Disabled Set selection / 0 dB (info) | 4.82 (was 5.38) | 4.82 | info |

## RV1-V3C4C2 (copied `d6.cjs`, sha `3abc88fe…` unchanged, one run per viewport)
- **How it ran:** `d6.cjs` was run through `tools/d6-fontwrap.cjs`. The wrapper only records the font status of the session (`out/d6/d6-*-r1-fonts.json`: fonts ok, 0 bad responses); d6 itself is unchanged.
- **Boxes, compared with `c-round-169/out/d6/d6-*-r1.json`:**
  - S0/S1/S2 at 1440: 111/122/131 keys. At 1280: 103/121/130 keys.
  - **0 missing, 0 added, max delta 0 px.**
- **Contrast:**
  - Changed entries are only `arrangement-detail-toggle`, `arrangement-detail-apply` and `arrangement-detail-clip-gain-reset`.
  - Enabled: 14.78 → 13.24. Disabled: 5.38 → 4.82, a drop of 0.56, which is within ≤ 0.6.
  - The failing sets are identical to the reference: S0 Undo/Redo/Split/Delete/Loop/Zoom-back/Metronome, S1 Redo/Zoom-back/Metronome. They are pre-existing.

## FUNC-SMOKE-V3C4C2 (real mouse clicks at button centres; `elementFromPoint` hit = true for every click)
| Check | 1440 | 1280 |
|---|---|---|
| Set selection, From 2 / To 4 | status "Time selection: 00:02.000 — 00:04.000 · Music." `arrangement-range` shows 00:02.000—00:04.000. The in-clip overlay on the music clip measures 2.000 s, labelled "00:02.000 – 00:04.000 · 2.000 s" | same |
| Invalid From 6 / To 3 | "The time selection must stay inside the clip, and its end must be after its start." The range is unchanged. | same |
| Clip Gain 0 dB, play 3→5 s (real AudioDestination tap) | peak 0.38655 | 0.38655 |
| −20 + Enter, same window | peak 0.03865 → **−20.00 dB** (median −19.51) | **−20.00 dB** (median −19.84) |
| Click **0 dB** | field 0.0; status "Clip Gain: … — 0.0 dB."; replay peak 0.38655 → **0.00 dB** | same |
| Ctrl+Z | "Undo: Clip Gain"; field −20.0 | same |
| Toggle click ×2 | collapse (`aria-expanded=false`, "Expand", fields hidden), then expand. Focus stays on the toggle. | same (1280 started collapsed, as expected) |
| Toggle Space | toggles; the playhead stays at 4.97 / 4.95 and Play does not start; focus stays on the toggle | same |
| Toggle Enter | toggles; clip count 1 → 1; focus stays on the toggle | same |

- After a mouse 0 dB click, focus is on BODY. That is the designed contract (FL2, `onMouseDown` preventDefault).
- **Harness note for B (not an app bug):** the task named `arrangement-lane-range` as the selection marker. That testid renders only for all-lanes ranges (`ArrangementLane.tsx` l.1001). A single-lane range is drawn inside the clip (`ArrangementClip.tsx` l.933, no testid), so C measured that overlay. `func-1440-1` read only the testid and is superseded by `func-1440-2`; every other value is identical between the two.

## FOCUS-RING-INFO (1440, informational)
Click From, then Tab: From → To → Set selection → Clip Gain.
- **Every stop:** `outline: solid 2px rgb(201,164,106)`, offset 2 px, **plus** a `box-shadow` 2 px brand ring. So the **C-R169-N1 double ring appears here too**, on the inputs and on Set selection (`shots/focus/focus-1440-stop*.png`).
- The field border stays rgb(115,107,96). The button border is transparent.
- **Owner:** the global focus style, `app/styles/app.css` (protected). This is already deferred as C-R169-N1-SEARCH-DOUBLE-RING and is not a new finding. B may widen that entry's scope to "all ring-2 controls".

## G170-3
- **Tool:** `tools/g170-3.cjs` is a copy of `c-round-169/tools/g169-3.cjs`. It changes only the output names and adds **one** line, `res.fonts = await L.fontsWait(page)`, because the task requires the font status in g170-3. Result: fonts ok.
- `/studio-lab` is anonymous: `auth_user` null, 0 cookies, the "Demo collection — no sign-in required" badge shows, and fonts are ok.
- `/studio/middle-east` at 1440 and 1280: "Sign in required", no workspace, 0 `audio[src]`.
- `GET /api/studio-token?product=middle-east&file=stem1.wav` → **401** `{"error":"Please sign in to access Studio."}`.
- 0 forbidden requests, 0 Authorization headers, 0 errors.
- Fake-Bearer 403: **BLOCKED**, backend unavailable in cloud.

## Ableton
Not applicable. This is a CZABA brand decision (`visual-direction-a.md` § „ღილაკები და ზედაპირები“); no Live manual claim is made. Behaviour (range, Clip Gain, collapse) is unchanged and was verified in the browser.

## Invalid / superseded runs
- The `tools/warm.cjs` warm-up load (not measured) hit cold Vite: "Invalid hook call" pageerror (ENV-FIRST-LOAD class). Every measured session after it was clean.
- `func-1440-1`: harness gap, superseded (see above).

## Gate rows (not C's)
Full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## For B
- No bugs. Per §7, a C PASS means: V-3c-4c-2 → მზადაა, and round 171 = V-3c-4c-3. The REGRESSION round takes precedence if B plans on or after 2026-10-27.
- Pass on A's code-reviewer Architecture note: the SURF+MOTION string is now copied 3× in this file, and the token set is in 10 components. Checkpoint Q1 is still open.
- Spec wording: replace `arrangement-lane-range` with the in-clip overlay in future single-lane Set selection rows.
