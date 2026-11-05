# B round 342 -> 343: builds current-task.md from b-round-339/current-task-c4-ii-draft.md (run from the loop root)
import pathlib, sys
src = open('b-round-339/current-task-c4-ii-draft.md').read()
lines = src.split('\n')
# drop the old title (l.1) and the round-341 carry-forward blockquote (l.6)
assert lines[0].startswith('# [DRAFT for round 341')
assert lines[5].startswith('> **Carry-forward for round 341')
body = '\n'.join(lines[1:5] + lines[6:])
def rep(old, new, n=1):
    global body
    c = body.count(old)
    assert c == n, (old, c)
    body = body.replace(old, new)
rep('**Planned by:** B, at the round 339 → 340 planning, 2026-11-04 (23:2x UTC).',
    '**Planned by:** B. The package was written at the round 339 → 340 planning (2026-11-04, 23:2x UTC). It was held back while REGRESSION-ROUND-2026-11-05 ran (rounds 340–342), and is dispatched now at the round 342 → 343 planning (2026-11-05), **D-29z1077**.')
rep('**Decisions** (all in `backlog.json` v298 → v299 `decisions_log_b`; D-29z1049…D-29z1058):',
    '**History: decisions of the round-340 planning** (`backlog.json` v298 → v299, D-29z1049…D-29z1058). They are kept as written. Where they say "round 340", that was the planned round at the time. The decisions for this dispatch are in the block "Dispatch as round 343" above.')
rep('"Asserted since PERF-DRAG-PREVIEW stage c4-ii (round 340): …"', '"Asserted since PERF-DRAG-PREVIEW stage c4-ii (round 343): …"')
rep('c4-i, c4-ii, c5; C round 340 PASS)`', 'c4-i, c4-ii, c5; C round 343 PASS)`')
rep('(round 340, D-29z1052)` after the c4-i section', '(round 343, D-29z1052, D-29z1077)` after the c4-i section')
i = body.index('`## მეტრიკები` only: the 10 group rows are asserted')
j = body.index('\n', i)
seg = body[i:j]
assert 'round 340' in seg, seg
body = body[:i] + seg.replace('round 340', 'round 343') + body[j:]
rep('Apply `b-round-339/sketch/source.patch.txt`, `tests.patch.txt` and `budgets.patch.txt` (`git apply`).',
    'Apply `b-round-339/sketch/source.patch.txt`, `b-round-339/sketch/tests.patch.txt` and **`b-round-342/sketch/budgets.patch.txt`** (`git apply`). The budgets patch was regenerated for round 343; it differs from `b-round-339/sketch/budgets.patch.txt` only in the "(round 343)" note text and the git header.')
i = body.index('| A-CLAIMS |'); j = body.index('\n', i)
body = body[:i] + '| A-CLAIMS | `bash b-round-342/claims-343.sh` from the loop root, before and after | pre == `b-round-342/claims-343-planning-output.txt`; final == `b-round-342/claims-343-sketch-output.txt` except K2 (hash and status count 7) and K10 (doc 232 stage token `stage c4-ii of`, `### ეტაპი c4-ii` 1) |' + body[j:]
rep('| CLAIMS | `claims-340.sh` at start and end |', '| CLAIMS | `b-round-342/claims-343.sh` at start and end |')
rep('`git apply -R --check` of the 3 sketch patches |', '`git apply -R --check` of `b-round-339/sketch/source.patch.txt`, `b-round-339/sketch/tests.patch.txt` and `b-round-342/sketch/budgets.patch.txt` |')
i = body.index('| G340-AUTH'); j = body.index('\n', i)
body = body[:i] + '| G343-AUTH (browser, fresh anonymous contexts, both viewports) | copy `c-round-340/tools/g340-auth.cjs` into `c-round-343/tools/` (sink redirect is a lookup), as in round 342 row 11 | `/studio-lab` workspace and demo badge with `auth_user` null; `/studio/middle-east` "Sign in required" with 0 `audio[src]`; `/api/studio-token`: no header → 401, bare → 400, fake Bearer → **403** while the mock answers `/__mock/health` 200 (rounds 341 and 342; D-29z1078). 500 is accepted only when the mock is down, and C records the health status. No token in any body |' + body[j:]
rep('PERF and G340-AUTH all run here.', 'PERF and G343-AUTH all run here.')
rep('- A: the 7 files; `a-round-340.md` with the A rows; `a-round-340/` logs.', '- A: the 7 files; `a-round-343.md` with the A rows; `a-round-343/` logs.')
rep('- C: `c-round-340.md`, `c-round-340.json`, `c-round-340/`.', '- C: `c-round-343.md`, `c-round-343.json` (with all L57 fields), `c-round-343/`, and `c-round-343/progress.json` after every row (L59).')
i = body.index('Run `bash b-round-339/claims-340.sh` from the loop root'); j = body.index('\n', i)
body = body[:i] + 'Run `bash b-round-342/claims-343.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). It is `b-round-339/claims-340.sh` with K12 extended by the regenerated budgets patch and the round-342 files. Expected output at HEAD: `b-round-342/claims-343-planning-output.txt`. On B\'s final sketch: `b-round-342/claims-343-sketch-output.txt` (the round-339 sketch output with K8 = 2026-11-05).' + body[j:]
rep('- **K1:** gate 339 `published` `99a5912`.', '- **K1:** gate 339 `published` `99a5912`. Gates 340–342 were `skipped` (no change), so 339 is still the last publication.')
rep('- **K8:** the `regression-last` date.', '- **K8:** the `regression-last` date (2026-11-05 after this planning).')
i = body.index('- **Next:** the next planning (on or after 2026-11-05) is REGRESSION-ROUND-2026-11-05.'); j = body.index('\n', i)
body = body[:i] + '- **Next:** c5 (video clip previews, including groups with video), then the conversions, PERF-9…15 and the rest of the queue. The next regression round is due on or after 2026-11-08 (`regression-last.json` round 342).' + body[j:]
rep('- `lessons.md`: L10, L11, L22, L26, L28, L29, L37, L38, L49, L51, L56, L57, L58.',
    '- `lessons.md`: L10, L11, L22, L26, L28, L29, L37, L38, L49, L51, L56, L57, L58, and for C also L59 (do not end the phase with a runnable row unrun) and L60 (destructive commands only inside `c-round-343/`, with absolute paths).')
head = open('b-round-342/task-343-head.md').read()
out = head + body
for bad in ['a-round-340', 'c-round-340.md', 'c-round-340.json', 'G340-AUTH', 'claims-340.sh` from', 'DRAFT']:
    assert bad not in out, bad
open('current-task.md', 'w').write(out)
print('ok', len(out))
