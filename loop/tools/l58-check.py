# L58 sketch-review checker (RETRO 416, D-29z1446). Run from the loop root.
# Usage: python3 -I tools/l58-check.py <task.md> [out-file]
# Finds every b-round-N/sketch-*.patch.txt the task tells A to `git apply` (lines containing "git apply").
# Exit 0 only when each one exists, b-round-N/sketch-review.md exists, names that patch's sha256 (64 hex),
# and has a verdict line (case-insensitive: verdict, approve, reject, request changes). The sha must be unbroken (no ** inside). A task with no dispatched sketch exits 0 ("no sketch").
import hashlib, os, re, sys
if len(sys.argv) < 2:
    sys.exit('usage: l58-check.py <task.md> [out-file]')
task = open(sys.argv[1], encoding='utf-8').read()
pats = []
for line in task.splitlines():
    if 'git apply' in line:
        for p in re.findall(r'b-round-\d+/sketch-[A-Za-z0-9._-]+\.patch\.txt', line):
            if p not in pats:
                pats.append(p)
lines = [f'task {sys.argv[1]}', f'dispatched {pats}']
ok = True
for p in pats:
    rev = os.path.join(os.path.dirname(p), 'sketch-review.md')
    if not os.path.isfile(p):
        lines.append(f'MISSING patch {p}'); ok = False; continue
    sha = hashlib.sha256(open(p, 'rb').read()).hexdigest()
    if not os.path.isfile(rev):
        lines.append(f'MISSING review {rev} for {p} sha {sha}'); ok = False; continue
    text = open(rev, encoding='utf-8').read()
    has_sha = sha in text
    has_verdict = re.search(r'verdict|approve|reject|request changes', text, re.I) is not None
    lines.append(f'{p} sha {sha[:16]} review {rev} names-sha {has_sha} verdict {has_verdict}')
    ok = ok and has_sha and has_verdict
if not pats:
    lines.append('no sketch')
lines.append('L58 OK' if ok else 'L58 INCOMPLETE')
out = '\n'.join(lines) + '\n'
if len(sys.argv) > 2:
    open(sys.argv[2], 'w').write(out)
sys.stdout.write(out)
sys.exit(0 if ok else 1)
