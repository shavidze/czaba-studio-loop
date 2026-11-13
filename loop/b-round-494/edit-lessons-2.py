# RETRO 495 lessons edit 2 (D-29z1769): narrative-only trims, every finding id kept. Run once from the loop root.
import os, sys
M = 'b-round-494/edit-lessons-2.done'
if os.path.exists(M): sys.exit('refused: .done marker exists')
if not os.path.exists('b-round-494/edit-lessons.done'): sys.exit('run edit-lessons.py first')
P = 'lessons.md'; s = open(P, encoding='utf-8').read(); log = []
def rep(old, new, tag):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f'{tag}: expected 1 match, got {n}: {old[:80]!r}')
    s = s.replace(old, new); log.append(f'{tag}: -{len(old.encode())} +{len(new.encode())} | removed: {old!r} | added: {new!r}')
rep(" (C-R475-02: a 4 px, delta-1 diff under a parallel vitest, 0 px on two idle reruns)", " (C-R475-02)", 'L38')
rep(" (C-STRIP-PLAYING −47…−63 ms against a literal ±50 ms; HEAD the same)", "", 'L48a')
rep("B-R299-IM24-LOAD-SIGNAL watched since round 299 → GATE325-IM24-WALLCLOCK failed gate 325", "B-R299-IM24-LOAD-SIGNAL → GATE325-IM24-WALLCLOCK", 'L48b')
rep(" (round-9 shortcut line grew to 19 keys by round 80; 13 helper sentences on the empty demo; no round looked at the whole screen)", "", 'L39')
rep(" (clip envelope linear in gain since rounds 82–83; one bottom point is silent only for an instant)", "", 'L41')
rep(" (FB-13 was musical; seconds grid default since round 47; catalogue BPM never reached the Studio)", "", 'L45')
rep(" (accepted at round 47 \"until R49-T\"; still open at 2026-10-28)", "", 'L46')
rep(" (adaptive `1`/`2` stopped setting `gridHandChosen`; the seed then replaced the user's grid)", "", 'L49')
open(P, 'w', encoding='utf-8').write(s)
open('b-round-494/edit-lessons-2.log', 'w', encoding='utf-8').write('\n'.join(log) + '\n')
open(M, 'w').write('applied\n'); print('applied', len(log))
