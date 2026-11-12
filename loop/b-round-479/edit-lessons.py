# RETRO 480 (D-29z1706): lessons.md trim + 2 clauses + l.3 pointer. Run from the loop root.
# Each cut is a quote from b-round-479/consult-tech-lead.md §2 (tier 1 + part of tier 2); "…" = any text,
# backticks are optional between characters. Every quote must match exactly once on its line, else abort.
import os
import re
import sys

P = 'lessons.md'
DONE = 'b-round-479/edit-lessons.done'
if os.path.exists(DONE):
    print('refused: .done marker exists')
    sys.exit(0)

L = open(P, encoding='utf-8').read().split('\n')


def rx(q):
    parts = []
    for ch in q:
        if ch == '…':
            parts.append('[^\n]*?')
        else:
            parts.append(re.escape(ch) + '`?')
    return '`?' + ''.join(parts)


CUTS = {
    16: [
        ' (glossary "Close" vs the frozen Modal ✕, a-round-127.md §3)',
        ' (W2 mandatory while its selector tests were protected, a-round-178.md DEVIATION 2)',
        ' (B grepped 15 chosen files, b-round-208.md l.36; the 10th hit was elsewhere)',
        ' (tempo.test.ts T10, round-229 pre-check)',
        " (round 252's pre-check applied items 3–4 only; IM4's collision surfaced at A)",
        ' (DW3/DW9 toBe on a rebuilt wrapper)',
        ' (DW10 compared arrays with themselves)',
        ' (round 292 ran only the app/lib/arrangement scanners; …failed gate 293)',
        ' (the recurrence RETRO 290 set as the trigger; fix-up round 294, $14.60)',
        ' (it greps the whole tree)',
        ' (a shared cached module makes both sides one object)',
        ' (they pin child counts and sibling order)',
    ],
    41: [
        ' (retro-321 §3)',
        ' (a non-memo leaf added +1 per transport render; B ran no perf)',
        ' (round 411 lost)',
        ' (b-round-415/data/l58-check-window.txt)',
        ' (round 468 mean-only diff)',
        ' (A STOP 322)',
        '; A STOP 327',
        ' dispatched with no sketch-review.md',
        ' (runtime name)',
        ' (mirrored bytes)',
        ' (vacuity guard, budget headroom)',
        ' (a pre-check, a skip)',
    ],
    24: [
        ' (interact.drag.fade… 5782 ×3), a B contract-design gap in round 224',
        ' ("path rebuilt every zoom step"…the ruler)',
        ' (PERF-5a starved … accept an app frame)',
        ' (≤ 15 never deducted … A STOP)',
        ' (splits in 405–409, no perf run in 405–422)',
        'clip-gain 6× 91/1 vs 92/2 = held-back Follow page turn rendering the ruler, ',
        ' (load tolerance ambiguous)',
        ' (a layout effect, a second commit)',
    ],
    58: [
        ' (stopped after round 276, found at RETRO 290)',
        ' (tasks 300–304 did not name it; …manifest-fields.txt)',
        ' (gateChecksRunOnSketch 0–2 of 6 in 322–335)',
        'fields absent in 8 of 16 JSONs 337–352, origin on 1 of 7 bugs ',
        ' (387, 391 re-tagged), 411 untagged',
    ],
}

log = []
fail = []
for ln, quotes in CUTS.items():
    s = L[ln - 1]
    for q in quotes:
        ms = list(re.finditer(rx(q), s))
        if len(ms) != 1:
            fail.append((ln, q, len(ms)))
            continue
        m = ms[0]
        log.append('l.%d cut %d B: %s' % (ln, len(m.group(0).encode()), m.group(0)))
        s = s[:m.start()] + s[m.end():]
    L[ln - 1] = s

if fail:
    for f in fail:
        print('NO-UNIQUE-MATCH', f)
    sys.exit(1)

ADD_A = (' **Reload → client nav (RETRO 480):** the task carries a first-Tab row (L47 target) and a route-announcement '
         'row (live-region text = new document.title). Evidence: RC-R479-CLIENT-NAV-FOCUS, GATE479-M1-ROUTE-ANNOUNCE (1×).')
ADD_B = (' **One STOP threshold (RETRO 480):** a task states its STOP threshold in one clause (Medium+ or outside the '
         'grants); others cite it, never restate it. Evidence: C-R475-01 (1×).')
assert L[27].startswith('47. ')
assert L[14].startswith('10. ')
L[27] = L[27] + ADD_A
L[14] = L[14] + ADD_B

old3 = (' **RETRO 465 (D-29z1639):** L52, L56 and L18 gain one clause each, L60 one evidence id; L23, L58 and this line '
        'shortened (all `tech-lead`).')
assert L[2].count(old3) == 1
L[2] = L[2].replace('`retro-465.md` (windows 123–199 … 450–464)', '`retro-480.md` (windows 123–199 … 465–479)')
L[2] = L[2].replace(old3, ' **RETRO 480 (D-29z1706):** L47 and L10 gain one clause each; evidence trimmed on L23, L58, L37 and L57 '
                    '(`tech-lead`, `retros/retro-480.md` §10); full previous text `b-round-479/lessons-before-480.md`.')
open(P, 'w', encoding='utf-8').write('\n'.join(L))
open('b-round-479/edit-lessons.log', 'w', encoding='utf-8').write('\n'.join(log) + '\n')
open(DONE, 'w').write('applied\n')
print('applied', len(log), 'cuts')
