# Doc-ledger checker (RETRO 510, D-29z1847; lesson L26 "Behaviour sentences have a ledger"). Run from the loop root.
# Usage: python3 -I tools/ledger-check.py <task.md> [out-file]
# For every b-round-N/sketch-*.patch.txt the task tells A to `git apply` (same detection as tools/l58-check.py):
# if the patch adds lines to a file under docs/implementation/, then b-round-N/doc-ledger.md must exist and
# must contain every test-row id cited on those added doc lines (ids like SF1, PU7, N1-2, B2D-7, MU8c).
# Exit 0 when every such sketch passes, or when no dispatched sketch touches docs ("no doc sketch").
import os, re, sys
if len(sys.argv) < 2:
    sys.exit('usage: ledger-check.py <task.md> [out-file]')
task = open(sys.argv[1], encoding='utf-8').read()
pats = []
for line in task.splitlines():
    if 'git apply' in line:
        for p in re.findall(r'b-round-\d+/sketch-[A-Za-z0-9._-]+\.patch\.txt', line):
            if p not in pats:
                pats.append(p)
ROW = re.compile(r'\b[A-Z][A-Z0-9]{0,4}-?[0-9]+[a-z]?(?:-[0-9]+)?\b')
out, ok = [], True
for p in pats:
    if not os.path.exists(p):
        out.append(f'{p} MISSING'); ok = False; continue
    cur, doc_lines = None, []
    for l in open(p, encoding='utf-8', errors='replace'):
        if l.startswith('+++ '):
            cur = l[4:].strip()
        elif l.startswith('+') and not l.startswith('+++') and cur and 'docs/implementation/' in cur:
            doc_lines.append(l[1:])
    if not doc_lines:
        out.append(f'{p} no doc text'); continue
    led = os.path.join(os.path.dirname(p), 'doc-ledger.md')
    if not os.path.exists(led):
        out.append(f'{p} doc lines {len(doc_lines)} ledger MISSING ({led})'); ok = False; continue
    lt = open(led, encoding='utf-8', errors='replace').read()
    ids = sorted({m for d in doc_lines for m in ROW.findall(d) if not re.fullmatch(r'[A-Z]?[0-9]+', m)})
    miss = [i for i in ids if i not in lt]
    out.append(f'{p} doc lines {len(doc_lines)} ledger {led} ids {len(ids)} missing {miss}')
    if miss: ok = False
if not pats:
    out.append('no sketch')
out.append('LEDGER OK' if ok else 'LEDGER INCOMPLETE')
txt = '\n'.join(out) + '\n'
if len(sys.argv) > 2:
    open(sys.argv[2], 'w', encoding='utf-8').write(txt)
print(txt, end='')
sys.exit(0 if ok else 1)
