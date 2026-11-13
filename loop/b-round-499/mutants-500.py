"""usage: python3 -I mutants-500.py <committed copy of the store tree with the round-500 delta applied> <log dir>
Each mutant edits one file, runs both 2b-1 test files, expects a non-zero exit (RED), records the failing row ids, then restores with git checkout."""
import os, re, subprocess, sys
C, LOG = sys.argv[1], sys.argv[2]
os.makedirs(LOG, exist_ok=True)
TESTS = ['app/lib/__tests__/store-button-cleanup-2b.test.tsx', 'app/lib/__tests__/product-price-cards.test.tsx']
ES, EB, ST = 'app/components/ui/EmptyState.tsx', 'app/components/errors/ErrorBoundary.tsx', 'app/routes/store.tsx'
PILL = "buildButtonClassName({ size: 'lg', shape: 'pill' })"
def rep(old, new):
    def f(s):
        assert s.count(old) == 1, ('anchor', old[:60], s.count(old))
        return s.replace(old, new)
    return f
def swap_empty_state(s):
    a = s.index('        {actionLabel &&')
    b = s.index('        {secondaryActionLabel &&')
    e = s.index('          ))}\n      </div>', b) + len('          ))}\n')
    first, second = s[a:b], s[b:e]
    return s[:a] + second.rstrip('\n') + '\n\n' + first.rstrip('\n') + '\n' + s[e:]
def swap_error_pair(s):
    a = s.index('          {showRefresh && (')
    b = s.index('          {showHome && (')
    e = s.index('          )}\n        </div>', b) + len('          )}\n')
    first, second = s[a:b], s[b:e]
    return s[:a] + second.rstrip('\n') + '\n\n' + first.rstrip('\n') + '\n' + s[e:]
M = [
  ('N5b', EB, rep('<Button type="button" size="lg" shape="pill" onClick', '<Button type="button" variant="secondary" size="lg" onClick')),
  ('N10', ST, rep(f'<Link to="/store" className={{{PILL}}}>', "<Link to=\"/store\" className={buildButtonClassName({ variant: 'ghost', size: 'lg', shape: 'pill' })}>")),
  ('N11', ST, rep(f'<Link to="/store" className={{{PILL}}}>', "<Link to=\"/store\" className={buildButtonClassName({ size: 'md', shape: 'pill' })}>")),
  ('N12', ST, rep(f'<Link to="/store" className={{{PILL}}}>', f'<Link to="/" className={{{PILL}}}>')),
  ('N13', ST, rep(f'<Link to="/store" className={{{PILL}}}>', f"<Link to=\"/store\" className={{['bg-brand', {PILL}].join(' ')}}>")),
  ('N14', EB, rep(' onClick={() => window.location.reload()}>', '>')),
  ('N15', EB, rep('<Button type="button" size="lg" shape="pill"', '<Button size="lg" shape="pill"')),
  ('N16', ES, swap_empty_state),
  ('N18', EB, swap_error_pair),
  ('N17', ST, rep('              Try again\n            </Link>', '              Retry\n            </Link>')),
]
for mid, path, fn in M:
    p = f'{C}/{path}'
    src = open(p, encoding='utf8').read()
    try:
        out = fn(src)
    except AssertionError as e:
        print(mid, 'APPLY-FAILED', e); continue
    open(p, 'w', encoding='utf8').write(out)
    r = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=C, capture_output=True, text=True)
    log = r.stdout + r.stderr
    open(f'{LOG}/mutant-{mid}.log', 'w').write(log)
    rows = sorted(set(re.findall(r'(?:×|FAIL).*?\b((?:B2B|SE|VC|PC|SC)-?\d+[a-z]?)\b', log)))
    print(mid, 'RED' if r.returncode else 'GREEN (mutant survived)', ' '.join(rows))
    subprocess.run(['git', 'checkout', '-q', '--', path], cwd=C)
