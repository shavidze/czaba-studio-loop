# C round 169 — V-3c-4c-1 (Library panel + Library preview button surfaces): independent verification

**Verdict: PASS.** browserVerified = realVerified = true. 0 bugs. Only blocked item: fake-Bearer 403 (backend unavailable in cloud).
Env: `env-status.json` store 200 (round 169). Real Playwright Chromium, `http://127.0.0.1:5173/studio-lab`, fresh context per session, 1440×900 and 1280×720.
Evidence: `c-round-169/` (tools, out, shots). Machine summary: `c-round-169.json`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T169-TARGETED | PASS — 8 files, 165/165 (= A); LBS1, LPS1, LI1, LI2, LI3, TH5 present and green | `out/vitest-c.json` |
| SOURCE-SCOPE | PASS — HEAD `e50498f`; frozen 983 OK at start and end; `a-round-169/end-sha256.txt` 5/5 OK; `git status` = 4 ` M` grants + `??` doc 138; protected diff vs `e50498f` empty; full tree sha (988 files) identical at start and end of C's phase | `c-round-169/start-tree-sha256.txt` |
| AN-REVIEW | PASS (see below) | diff vs `b-round-168/r169-granted-start/` |
| SURF-V3C4C1 | PASS | `out/surf/surf-{W}-1.json`, `-1-rm.json`, `-1-crops.json`, `shots/surf/` |
| BOX-V3C4C1 | PASS — max delta **0.00 px** on every shared site, all states P0–P3, both viewports, vs B `before.box` | `out/box-v3c4c1.json` |
| CONTRAST-V3C4C1 | PASS — toggle off/Stop/Add 7.05 rest, 6.58 hover; borderless unchanged | `out/surf/*.json` |
| RV1-V3C4C1 | PASS — d6 one valid run per viewport: 0 missing/added keys, max box delta 0 in S0/S1/S2; contrast changes only toggle (7.88→7.05) and Add (6.69→7.05); failing set = reference set | `out/rv1-v3c4c1.json`, `out/d6/` |
| FUNC-SMOKE-V3C4C1 | PASS (both viewports) | `out/func/func-{1440,1280}-2.json`, `shots/func/` |
| G169-3 (except fake-Bearer) | PASS — `/studio-lab` anonymous (no auth_user, 0 cookies) with demo badge; `/studio/middle-east` "Sign in required", no workspace, 0 `audio[src]` at 1440 and 1280; `GET /api/studio-token` 401. Fake-Bearer 403: BLOCKED (backend unavailable in cloud) | `out/g169-3.json`, `shots/g169-3-*.png` |
| PX-NET / REG-HYD | PASS — 32 valid sessions (surf 24, func 3, d6 2, g169-3 2, N1 1): 0 forbidden, 0 Authorization, 0 hydration, 0 pageerror/console errors (cart noise only). Font status is recorded for the 28 surf/func/N1 sessions: 0 font failures and fonts ready. `d6.cjs` and `g169-3.cjs` (tools unchanged from round 168) record no font status; d6 waits for fonts inside `openStudio` but discards the result. | per-run `net` |

Gate rows (not C's): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
Not re-run (unchanged code, task §4): transport/toolbar/lane/group header/dock/clip/marker/icon rows, ENV-VIS, OV-CORNERS.

## AN-REVIEW
- `ArrangementLibraryPreview.tsx`:
  - **P1 (base):** `rounded-md border border-transparent bg-foreground/5 … <4 MOTION> enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 …`. `gap-0.75`, `px-2 py-1.5`, `text-sm font-medium`, the focus ring and the `disabled:` tokens are kept.
  - **P2 (on):** `'border-accent text-accent'`. **P3 (off):** `'text-brand'`. Both match R9/R10 exactly.
  - **P4 (Add):** matches R11 exactly. It has `border border-brand`, `bg-foreground/5`, the enabled hover/active fills, MOTION, `font-medium` and `text-brand`, and no `border-transparent`. `bg-brand/10` and `hover:bg-brand/20` are gone.
- `ArrangementLibrary.tsx`: exactly 5 `rounded-sm` → `rounded-md` changes (l.99, 438, 457, 473, 482). Nothing else.
- The only arbitrary values added are the 4 MOTION tokens. No text, aria, role, title, handler, size, gap or padding changed.
- Test file: 0 lines removed, 136 added. The `expect(` count went 95 → 105.
- **Doc 137:** only the l.4 status and the struck-through l.136 TODO changed.
- **Doc 138** exists with every D2 section, and its content mentions twMerge, 1.12, m206 and R11 (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, trade-offs, TODO). Its status is In Progress.
- **Info, not bugs:**
  - The test helpers sit at module level, outside the new describe. A disclosed this; it goes beyond the literal "new describe" wording but has no effect on existing tests.
  - The Preview file is 2 lines shorter because the ternary reflowed.
  - P1 splits SURF around MOTION. This has no CSS effect.

## SURF / CONTRAST (identical at 1440 and 1280)
| Site / state | border-top | width | radius | rest bg → contrast | hover bg → contrast | active bg → contrast | transition |
|---|---|---|---|---|---|---|---|
| Toggle off "Preview" (P0, P1) | transparent, also on hover and press | 1px | 8px ×4 | rgb(33,31,28) 7.05 | rgb(39,36,34) 6.58 | rgb(48,46,43) 5.82 | `background-color, color` 0.18s `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Toggle on "Stop" (P2; text stays "Stop" at rest, hover and press) | rgb(201,164,106) accent, kept on hover and press | 1px | 8px | rgb(33,31,28) 7.05 | rgb(39,36,34) 6.58 | rgb(48,46,43) 5.82 | same |
| Add (P0–P2) | rgb(201,164,106) brand | 1px | 8px | rgb(33,31,28) 7.05 | rgb(39,36,34) 6.58 | rgb(48,46,43) 5.82 | same |
| Selected option row | – | 0 | 8px | rgb(40,35,27) 12.56 (= before) | – | – | global (unchanged) |
| Unselected option row | – | 0 | 8px | rgb(22,20,18) 14.78 | rgb(29,26,23) 13.94 (hover only; no press, to avoid starting a native drag) | – | global |
| Collapse / Expand (P3) | – | 0 | 8px | 6.68 (= before) | 13.94 (= before) | 13.94 | global |
| Search clear (P1) | – | 0 | 8px | 6.68 (= before) | 14.78 (= before) | 14.78 | global |
| Search field | rgb(115,107,96) at rest; rgb(201,164,106) on focus | 1px | 8px | 15.62 | – | – | global |

- Every rest colour and hover colour of the borderless sites equals B's `before` values in `b-round-168/out/v3c4c1-probe.json`. The toggle and Add values equal B's probe after-values (7.05 and 6.58).
- Fill against its own surface: 1.12 at both viewports. This is informational (GATE167-WCAG-1411-FILL).
- **Reduced motion:** I opened one extra context per state per viewport with `reducedMotion:'reduce'`. `transition-property` is `none` on the toggle and on Add in P0–P2, at both viewports.
- **Disabled (informational):**
  - Add with the video lane active is disabled: opacity 0.4, brand border, contrast 2.26 at rest and on hover, and no hover fill change.
  - A disabled Preview toggle cannot be reached in `/studio-lab`, because all 9 demo sources load ready.
- **4× crops (DPR 4)**, for Saba's R7/R10/R11 veto:
  - `shots/surf/crop4x-{W}-P1-selected-query-preview-buttons-1.png`: borderless Preview next to the brand-outlined Add.
  - `…P2-previewing-preview-buttons-1.png`: Stop keeps its accent outline.
  - `…P0-default-selected-option-1.png`, `…P1-selected-query-search-clear-1.png` and `…P3-collapsed-expand-1.png`.

## FUNC-SMOKE (attempt 2; 1440 and 1280 gave the same results)
- **Option row:** clicking the unselected `demo-hero-music` row changed it from false to true, with exactly 1 row selected. Clicking `demo-middle-east` selected it and deselected hero. Every centre click hit its target (checked with `elementFromPoint`).
- **Preview, real audio (AudioDestination tap):**
  - The peak was 0 before the click. It passed 0.01 at 92 ms (1440) and 94 ms (1280), with a max of 0.338.
  - The button read "Stop" and the row showed "Playing".
  - After Stop, the peak stayed below 0.001 from 91 ms (1440) and 87 ms (1280) onwards. The button read "Preview" again and "Playing" was gone.
- **Add:** with the Music lane active, the clip count went 0 → 1 (Middle East on music at 0.000), and the status read "… added to the Music track at 00:00.000". Ctrl+Z brought it back to 0 ("Undo: Add — …").
- **Double-click** on Soft impact: the clip count went 0 → 1, and Undo brought it back to 0.
- **Search:** typing "impact" filtered the list from 9 to 1. Clear emptied the field, brought back all 9 rows and removed the clear button. Focus stayed in the search, and typing still worked.
- **Collapse/expand:** collapse showed the rail with 0 options and put focus on Expand. Expand brought back the 9 options and put focus on Collapse.

## Invalid or superseded runs
- **d6 1440, attempt 1:** a cold-Vite first load ("Invalid hook call" and a hydration replace; ENV-FIRST-LOAD). I replaced it once and kept it as `out/INVALID-coldvite-d6-1440.log` and `out/d6/INVALID-coldvite-d6-1440-r1.json`.
- **func 1440, attempt 1:** the session was valid, but the option-click check clicked a row that was already selected, so it proved nothing. I fixed the script and re-ran both viewports as attempt 2. Attempt 1 is kept as `out/func/func-1440-1-nondiscriminating-option.json`.

## Notes for B (not bugs)
- **C-R169-N1 (info, pre-existing):** the focused search field shows two brand rings.
  - **Confirmed by measurement** (`out/c169-n1.json`, 1440): at rest the outline is `none` and the border is rgb(115,107,96). After a mouse click into the field, `:focus-visible` matches (Chromium treats a text input as focus-visible on mouse focus too). The outline is `solid 2px rgb(201,164,106) offset 2px` and the border is rgb(201,164,106). Both rings are visible.
  - **Confirmed pre-existing:** the same double ring shows on the search in B's probe screenshot at `e50498f`, `b-round-168/out/v3c4c1-probe-1440-P1-selected-query-after.png`. That probe swapped only the radius on the search.
  - **Inferred from source (not measured):** the outer ring comes from the unlayered global `:focus-visible` rule in `app/styles/app.css` l.378, which beats Tailwind's layered `focus:outline-none`. `app.css` is unchanged this round.
  - Evidence: `shots/surf/crop4x-*-P1-selected-query-search-clear-1.png`. For B to triage with the Lows or VISUAL-A.
- **C-R169-N2:** the active (12 %) fill contrast of the toggle, Stop and Add is 5.82, which is ≥ 4.5.
- A's code-reviewer Architecture note (a shared surface constant) is in `a-round-169.md`. Pass it on with the checkpoint request.

## Ableton
Not applicable. This is a CZABA brand decision (task §5, `visual-direction-a.md`). The Preview, Add, search and collapse behaviour is unchanged, and I make no claim that the look matches Live's browser.
