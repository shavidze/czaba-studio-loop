# C round 474 — DPG-P0-1: PASS (browserVerified true)

Rows C1–C10 all verified on A's tree (HEAD 58fc56e + working changes). Evidence index in `c-round-474.json`; files in `c-round-474/`.

| Row | Result | Evidence |
|---|---|---|
| C1 | PASS: 8 modified files + doc 307; 4 source shas equal sketch; protected diff 0 | c1-status.txt, claims-c.txt K10 |
| C2 | PASS: K13=20, K13b=9; residue = StudioTrack 1, two studio.css 4 each, VideoPlayer 2 class words, ableton-export comment | hue-scan.txt |
| C3 | PASS: removed assertions all replaced (LT7→no-dead-rule, exempt keys→checked 29, GR1/ST3b/HUE1-3 added); 4 mutants red on scratch copy | mutants.txt |
| C4 | PASS: 14 files / 158 tests | c4-vitest.log |
| C5 | PASS: /store, /products/middle-east, /studio-lab: 0 px diff vs HEAD build (:5180, own cacheDir) at 1440×900 and 1280×720. Home: t1 (tree) == h1 (HEAD) exactly; tree-vs-tree control also differs in the hero headline, so the diff is animation timing | pixeldiff.json, home-compare.json |
| C6 | PASS: scrollbar-color rgba(201,164,106,.4); inline-button box-shadow brass across 4 animation samples; waveform-bar gradient rgb(201,164,106)→rgb(217,184,127); `--gradient-primary` = brass stops; `--color-glow-primary` #c9a46a | browser.json probe-* |
| C7 | PASS (arithmetic only): #0e0d0c on #c9a46a = 8.32:1 | — |
| C8 | PASS: headings in TEMPLATE order, l.4 exact, collapse and frozen question recorded; K19=0 | doc 307 |
| C9 | PASS: anonymous /studio/middle-east shows "Sign in required", 0 audio src; /api/studio-token with params and no bearer = 401 (without params 400, same on HEAD). Premium auth not bypassed. Owner path BLOCKED (no backend) | browser.json auth-*, b3.mjs |
| C10 | PASS with explained diffs K16/K17/K18 | C-R474-01 |

## Findings (both Low, neither blocks)
- **C-R474-01 (B spec):** C10 omitted three claim diffs that B's own required edits cause.
- **C-R474-02 (pre-existing):** Tailwind still emits unused `.bg-[#13D9CC]` (rgb 19,217,204) on HEAD and tree; the class string is an example in `.claude/primitives/TAILWIND_FIRST.md`, `.claude/HOW_TO_USE_PRIMITIVES.md` and tailwind-v4 SKILL.md. No element uses it; HUE1 scans `app/**` only. Protected `.claude/**`; B/root decide.

Note: HEAD dev server's first cold load at 1440 threw a React duplicate-instance error (Vite dep re-optimise on fresh cacheDir); re-run warm was clean. Environment, not the tree.

Not claimed by C: full verify, code review, publish (root gate). DPG ids stay "awaiting DP-gate re-review".
