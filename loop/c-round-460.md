# C round 460: SABA-B-13 fix-up (C-R459-01) — verdict PASS

`browserVerified` true. Real Chromium (Playwright), production builds for timing (HEAD `891dc0f` on :5190, working tree on :5191), dev server :5173 for hydration/Studio/protection. Evidence: `c-round-460/` (matrix JSONs, `matrix/summary.txt`, `matrix/table.txt`, `analyze.py` + `analyze.out` = per-row scoring, `r1-c.txt`, `console-c.txt`, `mutants.txt`, `c15.json`, `prot.mjs`, `l29.txt`, `shots/`). Gate rows (full vitest, typecheck, build, Biome, lint, verify) are not claimed here.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: 5 grant paths only; `root.tsx` numstat `2 0` | git status |
| C2 CLAIMS | PASS: `claims-460.sh` output == `claims-460-expected-after-A.txt`, stderr 0 bytes; L29 grep 17 hits (grant paths / args / planned changes / `[K#]` claims) | `claims-tree.*`, `l29.txt` |
| C3 APPLY | PASS: 4 OK | sha256sum -c |
| C4 COVERING + MUTANTS | PASS: 11 files / 206 tests; mutants.txt 28 lines cmp-identical to B's (BASE green, M1–M27 RED incl. M16, M26) | `mutants.txt` |
| C5 FIRST FRAME | PASS 4/4 cells: tree `firstPaintedLum` 0, `firstCovered` ≤ fp, gaps 0; HEAD lum 13.2–13.5, `firstCovered` > fp | `analyze.out` |
| C6 DURATION | PASS 8/8: CPU1 removed−firstCovered 1490–1604, logo 705–717, tag 466–467; CPU4 removed−dataStart 1897–1923 (≤2000), removed−firstCovered ≥1897, logo/tag >0. CPU4 1440 replicates (fresh r2/r3: 1910/1894; clientnav r2/r3: 1895/1896) | matrix |
| C7 NO COVER | PASS 8/8 (`reload`, `rm`): no black sample, 0 black frames, state null | matrix |
| C8 FAILSAFE | PASS: blockjs/delayjs removed−firstCovered 1219–1408 (within 1200–1500); delayjs `expired`, logo 0 | matrix |
| C9 SKIP | PASS 12/12 + 3 replicates: removedMinusInput CPU1 5–58 (replicates 104, 19), CPU4 9–137; all `skipped` (one `live` after hand-off), logo 0, tab50 focus `A`, click50 url `/` | matrix |
| C10 ARRIVE | PASS 4/4: both play; tree removed−firstCovered 1335–1429, state null | matrix |
| C11 HYDRATION + SSR | PASS: dev `fresh` ×3 + `reload` ×3 `hydration` 0 (after 2 warm-ups); both `useLayoutEffect` greps 0; L1 green in covering run; M16 RED | `console-c.txt` |
| **C12 R1 (the bug)** | PASS: `r1-repro inject` ×3: HEAD 3/3 overlaySeen, **tree 3/3** (v1 was 0/3), `curState` live. `frames inject` tree, 4 cells + 4 replicates, all valid (`styleReplaced` true, 55 hydration errors): overlaySeen, lum 0, gaps 0, reblack 0, handshake live; removed−firstCovered CPU1 1569–1614, CPU4 1892–1919; CPU1 logo 692–712; CPU4 logo 249–344 (record only) | `r1-c.txt`, matrix |
| **C13 SLOW JS + RE-RENDER** | PASS: 4 cells + 2 replicates, all valid: `expired`, logo 0, overlay never shown, uncovered−firstCovered 1272–1411 (≤1500), reblack 0 (HEAD plays late, 1155–1198, record only) | matrix, `reblack.py` |
| C14 COLOUR + LAYER | PASS: `rgb(0, 0, 0)`, z-index 60, fixed | `c14.mjs` |
| C15 STUDIO + PROTECTION | PASS: `/studio-lab` 1 clip, Playing → Stopped, `stopHeld` true at 1440 and 1280; anonymous (new context, no credentials) `/studio/middle-east` shows "Sign in required", audio 0, media 0 — premium auth not bypassed. (First 1440 protected read gave `NO-BODY`, a dev first-compile race; re-run ×3 correct) | `c15.json`, `prot.mjs` |
| C16 DOCS | PASS: l.3/l.4 exact; TEMPLATE headings in order; `pending` 0; `isEntrancePending` 0; E1–E19 in doc and test; TL-R460-1..3, C-R459-02/03, SABA-Q-ENTRANCE-BACKGROUND-TAB, R1 present | doc 300 |
| C17 L57 | PASS: `L57 OK` | `l57-check.txt` |

## Bugs
None new. C-R459-01 is fixed (R1 re-render plays, cover stays on, no re-blackening after expiry). C-R459-02 and C-R459-03 are closed by the rulings and pass under them.

## Observations / not run
- CPU4 `inject` logo 249–344 ms (fresh 514–682): inside the ruling (record-only, >0), but the document re-render shortens the logo phase at 4× CPU. Info for B.
- `click50` CPU4 `gapsWhileCovered` 1–2: samples inside the skip fade after the input; probe artefact, no C9 criterion on gaps.
- Optional probes A-R460-REVIEW-4 (skip in the claim→hand-off window) and -2 (re-render with no takeover) were not run; REVIEW-2 is partly covered by C13 (reblack 0). The reviewer Lows A-R460-REVIEW-2..7 stay open for B.
- BLOCKED: Firefox/Safari entrance (TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465).
- Servers: :5190/:5191 stopped; mock API on :5199 (A started it) left running.
