import os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-400/edit-lessons.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/lessons.md'
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('Kept by the RETRO rounds.'), lines[2][:40]
assert lines[8].startswith('4. **One element, one rule.**'), lines[8][:40]
assert lines[40].startswith('58. **An asserted number'), lines[40][:40]
lines[2] = lines[2].replace('`retro-200.md` … `retro-385.md` (windows 123–199 … 369–384)',
                            '`retro-200.md` … `retro-401.md` (windows 123–199 … 385–400)')
lines[2] += ' **RETRO 401 (D-29z1373):** L4 and L58 gain one clause each (both `tech-lead`).'
lines[8] += (' **Degraded state × gesture (RETRO 401):** for a watchdog, timeout, stall or other degraded-state fix, one row repeats each user '
             'gesture the feature accepts (seek, play, stop, re-preview) while the degraded state is active, with a mutant. '
             'Evidence: C-R394-01, A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING, D-29z1350 (1×).')
lines[40] += (' **Pre-step rules and the review claim (RETRO 401):** a rule that adds an action before a measured or read step (scroll into view, '
              'focus, wait) is run by B on the sketch for every spec it governs, with the log showing values equal to HEAD, or the rule is written '
              'conditional on the state that needs it; and every planning that dispatches a `sketch-*.patch.txt` carries a `[K#]` claim that '
              '`sketch-review.md` exists and names the dispatched sha256. Evidence: C-R399-01, D-29z1369; dispatches 388, 391, 394, 395 had a sketch '
              'and no review (`b-round-400/data/l58-sketch-review-application.txt`), 391 and 394 failed (2×).')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
open(done, 'w').write('ok\n')
print('lessons edited')
