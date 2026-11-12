# RETRO 465 lessons edit (D-29z1639). Run once from the loop root: python3 -I b-round-464/edit-lessons.py
# In-place clauses only (tech-lead, b-round-464/consult-tech-lead.md §1 and §3); line count stays 60; net bytes go down.
import os, sys
p = 'lessons.md'; DONE = 'b-round-464/edit-lessons.done'
if os.path.exists(DONE): sys.exit('already applied')
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, ('count', s.count(old), old[:80])
    s = s.replace(old, new)
lines = s.split('\n')
old3 = lines[2]
assert old3.startswith('Kept by the RETRO rounds.'), old3[:40]
rep(old3, 'Kept by the RETRO rounds. Sources: `retros/retro-200.md` … `retro-465.md` (windows 123–199 … 450–464). ≤ 60 lines. Replace obsolete lessons; do not append forever. "(1×)" = single-event evidence, keep as hypothesis. Numbers are stable ids, not order. Amendment history: this line up to RETRO 450 is kept verbatim in `b-round-464/lessons-before-465.md` l.3 (older copies listed there); later amendments are in the `decisions_log_b` D-IDs. **RETRO 465 (D-29z1639):** L52, L56 and L18 gain one clause each, L60 one evidence id; L23, L58 and this line shortened (all `tech-lead`).')
rep(' (SW1 missed `hasAttribute(\'disabled\')`/`toHaveProperty(\'disabled\'`, filtered by `undoButton`-style ids, and dropped `navigation-strings-ui` that `b-round-229/sys5-disabled-grep.txt` listed; gate 276 failed)', '')
rep(' (Pause label, round 256, and the clip-body title, rounds 252–253, broke PERF-1a/1b-i unnoticed for 33 rounds)', '')
rep('Evidence: gate 262 (`track-layout.test.tsx` l.867 pinned the footer row to 2 children; B grepped only Master tokens; C PASS, gate red) (1×).', 'Evidence: gate 262 (1×).')
rep('; and every planning that dispatches a `sketch-*.patch.txt` carries a `[K#]` claim that `sketch-review.md` exists and names the dispatched sha256. Evidence: C-R399-01, D-29z1369; dispatches 388, 391, 394, 395 had a sketch and no review (`b-round-400/data/l58-sketch-review-application.txt`), 391 and 394 failed (2×).', '. Evidence: C-R399-01, D-29z1369 (2×).')
rep('Evidence: C-R387-01 (SF6 stubbed rAF, so nobody saw `tick` re-sample the meters).', 'Evidence: C-R387-01 (SF6 stubbed rAF, so nobody saw `tick` re-sample the meters). **A guard must be able to disagree with what it checks (RETRO 465):** a guard never shares its rule with the generator or analyser it guards (it uses an independent, stricter or syntax-based rule); every HEAD exclusion, allow or skip list is swept HEAD vs sketch, and a wider one is never "stronger"; a regex analyser that imitates a resolver is compared with each real resolver it imitates (tsc, Vite). Each gets one mutant on which guard and subject disagree. Evidence: A-R451-REVIEW-M1-GT5-BARREL-SCOPE, A-R456-REVIEW-M1, A-R457-REVIEW-M1, A-R463-REVIEW-M1 (4×).')
rep('Evidence: C-R416-CLAIMS-K22-ARCHIVE, C-R420-CLAIMS-K22-ARCHIVE-AGAIN, C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED (2×).', 'Evidence: C-R416-CLAIMS-K22-ARCHIVE, C-R420-CLAIMS-K22-ARCHIVE-AGAIN, C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED (2×). **Pre-check tree = delivered tree (RETRO 465):** B\'s claims and build-compare run on a tree that holds every granted path in its delivered form, docs included (Tailwind v4 scans `docs/*.md`); a doc A writes gets a placeholder with its exact required lines and literals. Evidence: A STOP 462 (K23), C-R462-01 (2×).')
rep('(STORE-1d rows were mount-relative jsdom timers; the page painted 140–380 ms before the overlay, Saba 2026-11-11) (1×).', '(STORE-1d rows were mount-relative jsdom timers; the page painted 140–380 ms before the overlay, Saba 2026-11-11) (1×). A pre-hydration DOM handshake keeps its state off React-owned nodes and gets a browser row with a node injected before hydration (React #418, document client re-render). Evidence: C-R459-01 (1×).')
rep('Evidence: RETRO450-A-SHELL-EDITS-BYPASS-HOOK (round 447) (1×).', 'Evidence: RETRO450-A-SHELL-EDITS-BYPASS-HOOK (round 447), INFO-A451-L60-SED-DOC (2×).')
assert s.count('\n') == open(p, encoding='utf-8').read().count('\n')
open(p, 'w', encoding='utf-8').write(s); open(DONE, 'w').write('ok\n'); print('ok')
