# RETRO 480 consult inputs (B, 2026-11-12, window 465–479)

All paths are relative to `/home/runner/czaba-project/tmp/studio-real-loop/`. Store repo: `/home/runner/czaba-project/store` at HEAD `bbb3193` (gate 479 published). Read-only: do not edit any file.

## Data (scripts in `b-round-479/`, outputs in `b-round-479/data/`)
- Cost (`data/cost.txt`): 15 rounds, total $214.36; B $133.40 (62.2 %), A $68.69, C $12.27. Round median $15.29; B median $9.38; top5 474 $22.09, 468 $19.77, 479 $17.91, 476 $17.28, 478 $16.26.
- Verdicts: PASS 10; FAIL 4 [466, 471, 472, 476]; BLOCKED 1 [469]; gate skipped [465, 466, 468, 469, 471, 472, 476]; browserVerified false in 471 and 476 (both FAIL rounds where rows were not run).
- C bugs (`data/fails-detail.txt`): C-R466-01 M (test did not observe pre-check), C-R469-01 L (glow shape flatter), C-R470-F1 L, C-R471-01 M (FN4 unguarded by store @theme), C-R472-01 M (doc 306 text contradicts test), C-R474-01 L, C-R474-02 L, C-R475-01 L (task text 1.2 vs 1.6 STOP contradiction), C-R475-02 L, C-R476-STOP-R1 M (sketch byte-exact kept a duplicate background; no B ruling, rows not run), C-R478-01 L.
- STOPs (first 3 lines of a-round-N.md): 466, 471, 472, 475, 476 (`data/stops-head.txt`).
- Fix-up chains (`data/task-titles.txt`): 466→467, 469→470, 471→472→473, 476→477.
- L57 check on C JSONs: OK 10/15; INCOMPLETE 469, 470, 472, 475, 477 (`data/l57-check-window.txt`). L58 on tasks 466–479: OK 13/14; 471 INCOMPLETE (`data/l58-check-window.txt`).
- New deferred Lows, union method (`data/deferred-added.txt`): 43 (7 of them added at this planning from round 479); by prefix TL 8, B 5, A 19, C 5, gate 3, other 3.
- Gate reviews (`data/gate-reviews.txt`): 8 reviews, 35 items: low 15, info 6, unlabelled 13, medium 1 (round 479: client navigation no longer announces the page title; GATE479-M1-ROUTE-ANNOUNCE).
- `lessons.md`: 60 lines, 59,870 B (counter was ≤ 57,500 B). Largest lines: l.41 (L58) 5,400 B; l.16 (L23) 4,622 B; l.18 (L29) 3,289 B; l.24 (L37) 3,163 B.
- Saba-found issues in the window: SABA-B-15 (Store scroll not smooth; rule merged into L18 "Scroll frames"), SABA-B-16 (logo old colours), and the 2026-11-12 design gate result: design-philosopher 3.5/10, product-designer 4/10 after STORE-2b (100+ teal values left; Saba's 5 process rules: exhaustive grep color sweep, token change = docs change in same round, C color audit rows, visual block done = C PASS + design gate, primitive staleness at RETRO).
- Primitive staleness: `.claude/primitives/DESIGN_TOKENS.md` still has 3 teal hits, `TAILWIND_FIRST.md` 2, `docs/design/DESIGN_SYSTEM.md` 1 (`grep -ci "13d9cc|teal|19,217,204|hsl(175"`); ROOT-REQ-DPG-PRIMITIVES-PATCH (root-only, `.claude/**` forbidden for the loop) is still not applied.
- RETRO 465 counters for 480: round median ≤ $18 (15.29 MET), B median ≤ $13 (9.38 MET), B share ≤ 68 % (62.2 MET), C FAIL ≤ 2 (4 MISSED), deferred ≤ 35 (43 MISSED; 36 without this planning's 7), l58 15/15 (13/14 MISSED), lessons ≤ 57,500 B (59,870 MISSED), ≤ 2 one-off .py per b-round (MET, 0–1).
- Round 479 (DPG-FOOTER-LINKS) gate finding 1: Medium. At `75a6028` Header.tsx already had 15 `<Link>` and `app/root.tsx` has no route announcer; round 479 added 13 more client-navigating links. `app/root.tsx` is in `global_forbidden_files` (root-only). Every Store page renders `Header` (check `app/components/layout/`).
