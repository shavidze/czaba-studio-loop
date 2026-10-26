# B: round 191 → round 192 planning (D-29z157)

Date: 2026-10-26 · Author: B · Advisor: **available**. Consulted once after orientation, before writing; a final review follows below. Project subagents: none consulted. This is a token-only sub-stage of a spec that design-philosopher already wrote and Saba already approved, and every open question was settled by grep.

## Inputs read
- **Round 191 files:** `tasks/round-191.md` (archive of the round-191 task; `cp` + `cmp` OK), `a-round-191.md`, `c-round-191.md`, `c-round-191.json`.
- **Gate:** `gates/gate-round-191.json` is **published**: commit `caa09af`, both remotes match. That commit is the round-192 baseline. Also read: the gate reviewer's `gates/round-191/review.md`.
- **Context:** `context/active-summary.md` (head), `regression-last.json` (2026-10-24, round 122), `lessons.md` (empty, no RETRO yet), `user-review/` (no new decision files since 11:23), the agent-workflow policy (unchanged since the snapshot).
- **By ID only:** in `backlog.json`, STORE-REDESIGN, `open_findings` (SABA-B-3, GLOBAL-FOCUS-VISIBLE-UNLAYERED, A-R190-SIGNALS), `regression_rounds`, `narrow_grants`, `global_forbidden_files`, `rounds` and `items` (all phase-1 items are complete or deferred). In `feature-status.md`, l.3, l.88, the SABA-B-3 row and the STORE-REDESIGN row.
- **Spec:** `docs/technical/store-redesign/store-redesign-spec.md` (STORE-2 row, rules) and `direction-decision.md` (A, 2026-10-25).
- **Source, read-only, at `caa09af`:**
  - `app/styles/app.css`: `@theme` l.31–177, the global `:focus-visible` at l.379, and the obsidian block at l.3920–3943;
  - `Button.tsx` variants;
  - the font links in `root.tsx:33–37` and `studio-lab.tsx:8`;
  - the tests that read `app.css`: `studio-theme-obsidian` (TH2/TH4), `audio-preview-player`, `panel-radius-ui`.

## Round 191 result, from evidence
- **C PASS:** `browserVerified=true`, `realVerified=true`. 13 rows passed, 0 blocked. LOOK-191 is kept out of `passed` because of one sub-criterion.
- **SABA-B-3 → მზადაა.** On all six range controls at both viewports: no filled box, one 2 css px ring only while `:focus-visible` matches, and the thumb never grows. Behaviour, audio and layout are identical to HEAD. Studio rest shows 0 changed px outside the mask.
- **C-R191-01 (Low):** the ivory thumb against the brass fill is 1.82:1. It follows directly from Saba's R68 description. It goes to `deferred_low_polish` and is put to Saba as a design call: (a) a dark thumb edge, or (b) accept it. It is not scheduled. The gate reviewer also judges it not a WCAG 1.4.11 failure.
- **C-R191-I1 ruling:** R70 takes precedence. The Pan/Zoom pressed thumb shade is Chromium's native shade and identical to HEAD. PRESS's "within 8" clause applies to the four level faders only. This ruling is written into the regression scope, so that the regression round does not re-open it.
- **C-R191-I2 and gate #1:** doc 157 still says "In Progress" and lists FS0–FS6. Fixed in round 192 with a 2-line doc grant (precedent: rounds 82/83).
- **Gate reviewer, other items:**
  - #2: the Pan reset button's own focus still shows a double ring → `deferred_low_polish` (GATE191-PAN-RESET-DOUBLE-RING). The systemic focus task closes it.
  - #4–#6: nits → `deferred_low_polish` (GATE191-ACCENT-FOREGROUND-INERT).
  - #7 → TECH-LEAD-MANUAL.
- **Architecture notes → signals, not tasks:**
  - A run 1: keep `studio-fader.ts`.
  - A run 2 and gate Signal 2: keep the Pan ring on the reset button's `::before` → `ARCH-R191-PAN-RING-COUPLING`, with its trigger.
  - Gate Signal 3 → `GLOBAL-FOCUS-VISIBLE-UNLAYERED`, which now records two rules (`app.css:379` and `base/utilities.css:79`), about 53 sites, and the reviewer's one-task proposal. It is the first-RETRO systemic candidate.

## Decision for round 192: STORE-2a (colour tokens)
- **Order:**
  - Regression is not due: still 2026-10-26, and it is due on or after 2026-10-27. The round-191 task already fixed "otherwise round 192 is the first STORE-2 sub-stage".
  - No cloud-reproducible Critical, High or Medium finding is open.
  - Direction A is decided, so STORE-2 is unblocked.
- **The split** (one stage per round, nothing dropped):
  - **2a:** tokens.
  - **2b:** the hardcoded teal, glows, gradient text and `shadow-glow`. B's recount at `caa09af`: 37 uses in 14 TS/TSX files, and 72 in `app.css` outside `@theme`.
  - **2c:** type and fonts together. Instrument Sans is loaded only by `studio-lab.tsx` today, so the store's `--font-sans` cannot change before `root.tsx` loads the font.
  - **2d:** motion.
- **Why 2a is safe for the Studio:** on `/studio-lab`, the obsidian block overrides 18 colour keys through `body:has(...)`.
  - **R72:** the store takes exactly those values, which prevents drift.
  - Of the store-only keys that change, B's grep found exactly one Studio-reachable use: `Toast.tsx:82` `text-secondary`. It is not rendered at rest. Shadows, fonts and gradients do not change.
  - A's K0 re-proves this, and C checks it with STUDIO-RV-192 at 0 px with no mask, plus three overlays.
- **R75 (contrast):** ivory on brass is 1.88:1, and ivory on the new destructive colour is 2.57:1. Four non-protected sites switch to `text-brand-foreground` (8.32:1 and 6.09:1): Button `buy`, Button `destructive`, the hire-us submit, and the account.orders CTA. `Button` is imported by no Studio file. The protected `studio.$productId.tsx` and `account.downloads.tsx` sites stay as they are → signal `STORE2A-PROTECTED-BRASS-TEXT`.
- **Grants:** 5 narrow grants (`backlog.json` → `narrow_grants` round 192), each with a line-level scope, plus 2 new files (test + doc 158). The `app.css` grant excludes `:focus-visible` explicitly, so that A does not fold the systemic focus fix in.
- **Contrast outcome rule:** CONTRAST-192 separates two kinds of failure. A failure caused by a §1 token is a 2a FAIL (Medium), unless HEAD was the same or worse. A failure from a hardcoded colour, gradient or glow is STORE-2b inventory. So the intermediate mixed look does not block 2a, and nothing is hidden.
- **Keep-list:** KEEP-192 asserts that `innerText` and mount position stay byte-identical for every item on Saba's list.
- **Ableton row:** not applicable (store pages).
- **Baseline files:**
  - `b-round-191-r192-tree-sha256.txt`: 1017 entries, OK from the store root;
  - `b-round-191-r192-grants.txt` (5) and `b-round-191-r192-new-files.txt` (2);
  - `b-round-191-r192-granted-start-sha256.txt`, and start copies in `b-round-191/r192-granted-start/`.

## Root requests
- **`app/root.tsx` narrow grant for STORE-2c/2d** (current-task §8). It is global_forbidden and has never been granted. The approved spec names it for font loading and for a Lenis reduced-motion guard, and it holds no auth or purchase logic. Fallback if root declines: load the fonts from `app.css`, and record the deviation for Saba.
- **C-R188-I3** (a mock `digital-gift-card` fixture) is still open; nothing is blocked by it.
- **Architecture checkpoint:** no new feature boundary. `b-round-183-checkpoint-request.md` is still pending, and fallback (c) continues. Next point: the STORE-REDESIGN exit.

## Files written
- **Archive and backups:** `tasks/round-191.md`, and `b-round-191-{current-task.md,backlog.json,feature-status.md,b-next.json,regression-last.json}-before`.
- **Tools:** `b-round-191/tools/update-backlog.cjs` and `update-fs.cjs`.
- **Round 192 task:** `current-task.md`.
- **`backlog.json` (version 177):**
  - SABA-B-3 `done` with its result and the I1 ruling;
  - C-R191-01, C-R191-INFO, GATE191-REVIEW-SIGNALS, A-R191-SIGNALS, ARCH-R191-PAN-RING-COUPLING and STORE2A-PROTECTED-BRASS-TEXT;
  - an update to GLOBAL-FOCUS-VISIBLE-UNLAYERED;
  - 3 `deferred_low_polish` entries;
  - regression scope additions, and the regression round now expected at 193;
  - 5 `narrow_grants`;
  - the STORE-REDESIGN status, `split_d29z157` and `store2a_plan_d29z157`;
  - `rounds` 191 and 192.
- **Status and next step:** `feature-status.md` (header, round-191 line, the SABA-B-3 and STORE-REDESIGN rows) and `b-next.json`.
- `regression-last.json` is unchanged.

## Readiness for commit
Round 191 is already published (`caa09af`). Round 192 is not ready until C passes it.

## For Saba (vetoable)
- **C-R191-01:** the fader thumb against the brass fill is 1.82:1. Options: a dark thumb edge, or accept it.
- **STORE-2a:** the store takes exactly the Studio's Obsidian colours. "Buy" becomes brass, and the text on brass buttons becomes dark (R72–R75).
