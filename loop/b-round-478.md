# B round 478 → 479 planning

**Date:** 2026-11-12 (`date -u` 20:58).
- **Advisor:** available. Consulted twice: after orientation, and after the first full draft, before hand-off. The second pass found that the focus helper moved focus on Ctrl/middle clicks; this was fixed and re-measured (below).
- **Project agent consults:** none.
  - The round is a navigation fix with no new screen element. The reference is the measured HEAD behaviour plus the Remix Link docs, so neither `product-designer` nor `ableton-arrangement-expert` was needed.
  - B ran the browser checks itself.

## Inputs read
- `context/active-summary.md`;
- `current-task.md`, archived byte-identical as `tasks/round-478.md` (the `cmp` against `current-task.md` ran right after the copy, before the rewrite);
- `a-round-478.md`, `c-round-478.md` and `c-round-478.json`;
- `gates/gate-round-478.json`: **published `75a6028`**, which is the new baseline (`context/head-sha.txt` still says `10791ac`, from before publication);
- `gates/round-478/review.md`;
- `regression-last.json`: 2026-11-10, next due 2026-11-13, so **not due** on 2026-11-12;
- `lessons.md` (skimmed by line; L1, L12, L13, L23, L29, L36, L47, L56 and L58 applied);
- backlog entries for DPG-FIX, STORE-REDESIGN, `global_forbidden_files` and SABA-Q-DPG-LOGO-FONT-SERIF.
- **No new Saba answers or DP-gate result.** `user-review/` has no decisions file after questions-round-475, and no DP-gate report sits in `gates/`.

## Round 478 result (C evidence only, D-29z1695)
- **C PASS:** C1–C10, `browserVerified`/`realVerified` true. Gate 478 published `75a6028`, and the review is COMMIT OK at 9/10.
- **DPG-DOCS-UPDATE is C-verified but not მზადაა.** It waits for the DP gate.
- **DPG P0 is complete on C evidence** (rounds 474, 475, 477, 478). Root re-runs the DP gate. ROOT-REQ-DPG-PRIMITIVES-PATCH should land before that re-run.
- **C-R478-01 (Low)** → `deferred_low_polish`.

## Rulings on A-478's open items (D-29z1696)
| Item | Ruling |
|---|---|
| H2 | Accepted (L28) |
| M3 banner date | Low B-R478-BANNER-DATE, origin B spec: the Store `direction-decision.md` is dated 2026-11-05, the banner says 2026-10-25. L9 and L11 are folded into it. Deferred |
| M4 `card.md` cool hsl(220), gate finding 3 (shadow hue) | SIG-R478-COOL-NEUTRAL-HUE → DPG-COLOR-CONSOLIDATE |
| L6 `style-guide.md` glow advice | Extends SIG-R478-AWWWARDS-GLOW (P2) |
| `direction-decision.md:18` misquote | Low B-R478-DD-QUOTE, deferred |
| Gate architecture note (checker as CI) | SIG-R478-DOC-TOKEN-CHECKER-CI, a signal only |

## Next task: round 479 = DPG-FOOTER-LINKS (D-29z1697…D-29z1699)
- **Why this P1 item now:**
  - DPG-LOGO's serif half awaits Saba.
  - DPG-BUTTON-CLEANUP needs a narrow `app.css` grant (styles are globally forbidden), a Button migration in six files and a product-designer pass, so it is the next P1 round.
  - FOOTER-LINKS depends on neither and fits before REGRESSION-2026-11-13 and RETRO 480.
- **Inventory:**
  - Every `<a` tag in `app/**`, read as whole tags.
  - Internal targets were checked with `curl` on the dev server.
  - The rulings on what is in and out are in D-29z1697. The two dead targets became findings.
- **Dead links (D-29z1699):**
  - `/license` (Footer and Terms) and `/music` (`account.orders`, and protected `account.downloads`) render the 404 page with HTTP 200. `/collections/music` is 404 too, and `git log` has no `license` route.
  - The licence copy is legal content, so it goes to Saba: `user-review/questions-round-478.md` Q1, with options (a) a real page, (b) `/terms#license`, (c) remove the link; (a) is recommended.
  - The `/music` fix (`/store`) is a later small round (Q2).
  - The soft 404 is a Low and is deferred.
- **Browser probes** (`b-round-478/probe/`; LeadMagnet seeded as dismissed, because unseeded it auto-opened and blocked the first run):
  - **Scroll and Lenis.** HEAD's own header `<Link>`s and the sketch both land at `scrollY 0` at 400 ms and at 3 s after a navigation from the page bottom. One wheel step afterwards gives 171 px (1440) or 200 px (1280), with no jump back.
  - **No reload.** The sketch keeps a `window` marker. HEAD's footer `<a>` loses it, which is the red control.
  - **Focus regression found and fixed in the sketch:**
    - With a plain `<Link>`, the first Tab after Enter on footer "Support" landed on the `/support` "Live Chat" button. HEAD (reload) lands on the header logo.
    - `blur()` did not help.
    - Focusing `body` with a temporary `tabindex=-1` restores the header logo for footer and in-page links, at both viewports (`nav-final-5174.json` vs `nav-final-5173.json`).
    - This becomes the shared helper `releaseLinkFocus` (D-29z1698). It is named per `AGENT_DISCOVERABLE_CODE.md` rule 1, and it does not duplicate `app/lib/focus-source.ts`.
  - **Modifier clicks (advisor pass 2):**
    - The first sketch moved focus to `body` on Ctrl+click and Ctrl+Enter while the page stayed (`modifier-sketch-v1.json`). HEAD keeps focus on the link (`modifier-head.json`).
    - A plain-primary-activation guard fixes it (`modifier-sketch.json`: focus stays on the link, one new page).
    - It is covered by LF3 and mutant M5.
  - **Same-route click:** HEAD reloads and restores `scrollY` ≈ 2158; the sketch goes to 0. This is task deviation 3.
- **Sketch:**
  - The scratch copy is `/tmp/scratch479`: store minus `.git`/`docs`/`public`, with `node_modules` symlinked. It ran on a dev server at :5174, which is now stopped.
  - The 11 files are in `b-round-478/sketch-479/` with hashes in `sketch-479.sha256`. They are Biome-formatted, and `tsc` rc 0.
  - The covering set is 10 files and 162 tests, all green (`sketch-vitest-final.log`).
  - Red runs:
    - baseline sources: 21 failed;
    - M1, the CookieConsent `<a>`: 3 failed;
    - M2, footer Support `<a>`: 2 failed;
    - M3, a no-op helper: 11 failed;
    - M4, faq without `onClick`: 1 failed;
    - M5, no modifier guard: 5 failed.
  - The four focused files have 48 tests.
- **Claims:** `b-round-478/claims-479.sh` (K1–K10). The HEAD output is `claims-479-planning-output.txt`, and the after-values on the sketch are in `claims-479-sketch-output.txt`.

## Architecture
- **No frontend-architect checkpoint requested.** This is a 6-file navigation change with a 9-line helper, and no owner carries accumulated structural risk.
- **New signals:**
  - SIG-R479-USERDROPDOWN-DEAD;
  - SIG-R479-AUTH-MODAL-LINKS;
  - SIG-R479-ROUTE-ANNOUNCE: client navigation no longer announces the page title. A root-level announcer needs `root.tsx`, which is root-only.
- **RETRO 480 candidate:** RC-R479-CLIENT-NAV-FOCUS.

## Files B changed
| File | Backup |
|---|---|
| `current-task.md` | `tasks/round-478.md` |
| `tasks/round-478.md` (copy) | — |
| `backlog.json` v465 → v466, via `b-round-478/update-backlog-479.py`: D-29z1695…D-29z1699, 4 deferred Lows, 2 Medium findings, 5 signals, the DPG-FIX status and P1 progress, round rows 478 and 479, `baseline.head_round_479` | `b-round-478/backlog-before-479.json` |
| `feature-status.md` (header, round-478 result line, round-479 line) | `b-round-478/feature-status-before-479.md` |
| `b-next.json` | `b-round-478/b-next-before.json` |
| `user-review/questions-round-478.md` (new) | — |
| `b-round-478/**` (probe, sketch, logs, claims) | — |

**Not changed:**
- `lessons.md`. RC-R479-CLIENT-NAV-FOCUS goes to RETRO 480.
- The store tree. `git status` shows 0 lines at `75a6028`.

## Readiness and order
- **Commit-ready stage:** round 478, already published by root.
- **Order after round 479:**
  1. REGRESSION-2026-11-13 (due from 2026-11-13);
  2. RETRO 480;
  3. DPG-BUTTON-CLEANUP;
  4. the rest of P1 and any DP-gate findings;
  5. B-R478-DEAD-MUSIC-LINK (`account.orders`): deadline, the first planning after RETRO 480 (L46).

## Hand-off
- The planning files were written before each advisor call.
- The store tree is clean (0 status lines).
- The final sketch and claims were re-saved after the advisor fixes.
- The browser probes that cover the guard (`modifier-sketch.json`) and the focus start (`nav-final-5174.json`) ran on the guarded helper before the rename. The rename to `releaseLinkFocus` changes no behaviour; the 162 tests and all mutants were re-run after it.
