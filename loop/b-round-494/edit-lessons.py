# RETRO 495 lessons edit (D-29z1769). Run once from the loop root. Every replacement must match exactly once.
import os, sys
M = 'b-round-494/edit-lessons.done'
if os.path.exists(M): sys.exit('refused: .done marker exists')
P = 'lessons.md'
s = open(P, encoding='utf-8').read()
log = []
def rep(old, new, tag):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f'{tag}: expected 1 match, got {n}: {old[:80]!r}')
    s = s.replace(old, new); log.append(f'{tag}: -{len(old.encode())} +{len(new.encode())} | removed: {old!r} | added: {new!r}')
# l.3 pointer
rep("**RETRO 480 (D-29z1706):** L47, L10 +1 clause; trimmed L23, L29, L37, L56, L57, L58 (`retro-480.md` §10; before: `b-round-479/lessons-before-480.md`).",
    "**RETRO 495 (D-29z1769):** L26, L47, L52, L57 +1 clause each; trimmed L1, L11, L12, L14, L18, L26, L28, L44, L57, L58, L59, L61 (`retro-495.md` §10; before: `b-round-494/lessons-before-495.md`; RETRO 480: D-29z1706).", 'L3')
rep("`retro-480.md` (windows 123–199 … 465–479)", "`retro-495.md` (windows 123–199 … 480–494)", "L3b")
# trims (tech-lead, b-round-494/consult-tech-lead.md §3)
rep(" (rounds 192, 194, 201 lost)", "", 'L1a')
rep(" (round-449 planning; the advisor caught it)", "", 'L1b')
rep(" (Saba 2026-11-10: Detail panel spin arrows survived VISUAL-A and every RETRO screen review, which used rest-state screenshots)", "", 'L61a')
rep(" (teal Modal bar never visible in the cloud headless screenshots; D-29z1529)", " (D-29z1529)", 'L61b')
rep(" (6 px hover band since 08b9e53, recoloured to foreground/50 in round 175, passed every token row; Saba 2026-11-10)", "", 'L61c')
rep("; C-R230-01 (the round-230 wording also required `## Prompt`, which 0 of 178 docs have)", "; C-R230-01", 'L26a')
rep(" SABA-B-9 stage 1 (round 256, D-29z485) closes it and asks the 1280 layout once as SABA-Q-9-TRANSPORT (c).", " Closed by SABA-B-9 stage 1 (D-29z485; SABA-Q-9-TRANSPORT).", 'L44')
rep("Evidence: tasks 313/314/315/318/320 listed only the three new fields; `c-round-313/315/318/320.json` lack the four manifest fields (`b-round-320/l57-fields.txt`); tasks 319/320 sent `mutantRedOnSketch` to A's tree (2×).", "Evidence: tasks 313–320 (`b-round-320/l57-fields.txt`) (2×).", 'L57a')
rep("`b-round-335/exp-fields.txt (1×)", "`b-round-335/exp-fields.txt` (1×)", 'L57b')
rep(" (round 340: `end_turn` after ~13 min / 31 turns, no cap found in visible runner files, 6 of ~150 rows, no progress.json; round 301 ran 133 rows in one phase)", "", 'L59')
rep("Evidence: `a-round-252.md` ruling 1 (round 252 FAIL, C-R252-01), A reviewer M-2 in round 256 (round 256 FAIL, C-R256-01) (2×).", "Evidence: C-R252-01, C-R256-01 (2×).", 'L11')
rep(" (the code-reviewer found the hits in protected tests; A reproduced them, reported a BLOCKER and did not edit)", "", 'L12a')
rep(" (track-layout pinned `basis-full`; gate 226 failed)", "", 'L12b')
rep(" (1×; A found it through the granted tests and stopped, the cause was the task, see L23)", " (1×)", 'L14')
rep(" (STORE-1d rows were mount-relative jsdom timers; the page painted 140–380 ms before the overlay, Saba 2026-11-11)", "", 'L18a')
rep(" (SABA-B-13 built 1.45 s from Saba's example; slow first visits expired unseen)", "", 'L18b')
rep("Evidence: 8 stale-status findings in rounds 200–214 under the old rule (`b-round-214/l28-status.txt`), ROOT-L28-AMEND-MISSED", "Evidence: `b-round-214/l28-status.txt`, ROOT-L28-AMEND-MISSED", 'L28a')
rep(" (doc 170 kept `In Progress (stage 1 of 2; C round 218 PASS)` after stage 2 passed in C round 221)", "", 'L28b')
rep(" (e.g. `not.toBe(valueAt`, consumer-count `toBeGreaterThan(0)` after the moved trigger)", "", 'L58a')
rep(" (the perf spec on a production build, network capture, name-keyed test)", "", 'L58b')
rep("A-R411-REVIEW-M1 / B-R411-SKETCH-M1-MISSED; round 415 (2×)", "A-R411-REVIEW-M1 / B-R411-SKETCH-M1-MISSED (2×)", 'L58c')
# new clauses
rep("Evidence: C-R471-01 → C-R472-01 (2 rounds on doc 306) (1×).",
    "Evidence: C-R471-01 → C-R472-01 (2 rounds on doc 306) (1×). **Every sentence has a ledger (RETRO 495, RC-R492-DOC-TRUTH-REVIEW):** before dispatch, `b-round-N/doc-ledger.md` maps each declarative doc sentence to a test row, a browser row on the same code per input origin (mouse, keyboard), a `[K#]` claim, or inference wording, and greps open/deferred findings on the touched files for contradictions; a task STOP list never overrides the clause above. Evidence: C-R492-01, C-R493-01 (2×).", 'L26-new')
rep("Evidence: RC-R479-CLIENT-NAV-FOCUS, GATE479-M1-ROUTE-ANNOUNCE (1×).",
    "Evidence: RC-R479-CLIENT-NAV-FOCUS, GATE479-M1-ROUTE-ANNOUNCE (1×). **Focus write after an async settle (RETRO 495):** a `.focus()` that runs when a save or request settles moves focus only if focus is still on body or inside the origin; a row moves focus elsewhere while in flight, with a mutant. Evidence: A-R487-REVIEW-FOCUS-STEAL, C-R487-01 (1×).", 'L47-new')
rep("B's mutants include one over-broad classifier per side. Evidence: A-R489-REVIEW-NONZOOM-CLASSIFY (MA–MD survived 22 mutants) (1×).",
    "B's mutants include one over-broad classifier per side, and a fix made for a reviewer Medium gets its own mutant per direction. Evidence: A-R489-REVIEW-NONZOOM-CLASSIFY (MA–MD survived 22 mutants) (1×).", 'L52-new')
rep("Evidence: (`b-round-352/l57-coverage.txt`) (2×).",
    "Evidence: (`b-round-352/l57-coverage.txt`) (2×). **B enforces it (RETRO 495):** every task, short routes included, names the row `tools/l57-check.py c-round-N.json c-round-N/l57-check.txt`, and B's claims script checks `c-round-{N-1}/l57-check.txt` for `L57 OK` (a miss is an INFO id). Evidence: 485, 487, 488, 493 had no l57-check.txt (1×).", 'L57-new')
open(P, 'w', encoding='utf-8').write(s)
open('b-round-494/edit-lessons.log', 'w', encoding='utf-8').write('\n'.join(log) + '\n')
open(M, 'w').write('applied\n')
print('applied', len(log))
