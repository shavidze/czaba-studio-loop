# usage: python3 -I mutants-502.py <tree> <logdir>
# Each mutant edits app/routes/cart.tsx in <tree> (a COPY outside store/), runs the new test file, restores the file.
# PASS of the harness = every mutant RED on exactly its expected rows. logdir is resolved to an absolute path (INFO-C501-MUTANT-HARNESS-RELPATH).
import os, re, subprocess, sys
tree = os.path.abspath(sys.argv[1]); logdir = os.path.abspath(sys.argv[2]); os.makedirs(logdir, exist_ok=True)
CART = os.path.join(tree, 'app/routes/cart.tsx')
TEST = 'app/lib/__tests__/cart-mobile-layout.test.ts'
NEW = 'min-h-[calc(100vh-80px)] bg-background lg:h-[calc(100vh-80px)] lg:overflow-hidden'
COL = 'lg:col-span-2 lg:overflow-y-auto lg:overscroll-contain styled-scrollbar pr-2'
GRID = 'grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)] gap-8 flex-1 min-h-0'
SUM = 'lg:col-span-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain styled-scrollbar'
COL_ATTR = COL + '"\n              data-lenis-prevent-wheel'
SUM_ATTR = SUM + '"\n              data-lenis-prevent-wheel'
CARD = 'bg-surface border border-outline rounded-lg p-8"'
MUTANTS = [
  ('M1', 'HEAD main layout restored', NEW, 'h-[calc(100vh-80px)] bg-background overflow-hidden', ['CML1']),
  ('M2', 'clipping on every width', 'lg:overflow-hidden', 'overflow-hidden', ['CML1']),
  ('M3', 'lg fixed height dropped', ' lg:h-[calc(100vh-80px)]', '', ['CML1']),
  ('M4', 'min height dropped', 'min-h-[calc(100vh-80px)] ', '', ['CML1']),
  ('M5', 'clip instead of hidden on every width', 'lg:overflow-hidden', 'overflow-y-clip', ['CML1']),
  ('M6', 'items column scroll removed', COL, 'lg:col-span-2 lg:overscroll-contain styled-scrollbar pr-2', ['CML2']),
  ('M14', 'items column scroll on every width again (tech-lead review 2 Medium 1)', COL, 'lg:col-span-2 overflow-y-auto overscroll-contain styled-scrollbar pr-2', ['CML2']),
  ('M7', 'grid row bound removed', GRID, 'grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0', ['CML2']),
  ('M8', 'md clipping added (tech-lead Medium 1)', NEW, NEW + ' md:overflow-hidden', ['CML1']),
  ('M9', 'summary column scroll removed', SUM, 'lg:col-span-1 lg:min-h-0 lg:overscroll-contain styled-scrollbar', ['CML2']),
  ('M10', 'summary column wheel opt-out removed', SUM_ATTR, SUM, ['CML2']),
  ('M11', 'items column wheel opt-out removed', COL_ATTR, COL, ['CML2']),
  ('M12', 'summary card sticky restored', CARD, 'bg-surface border border-outline rounded-lg p-8 sticky top-24"', ['CML4']),
  ('M13', 'summary column clipped on every width', SUM, SUM + ' overflow-hidden', ['CML2']),
  ('M15', 'below-lg clipping via max-lg (tech-lead review 2 Low 3)', NEW, NEW + ' max-lg:overflow-hidden', ['CML1']),
]
orig = open(CART).read()
for s in (NEW, COL_ATTR, GRID, SUM_ATTR, CARD):
    assert orig.count(s) == 1, s
results = []
try:
    for mid, desc, old, new, expect in MUTANTS:
        assert orig.count(old) >= 1, (mid, old)
        open(CART, 'w').write(orig.replace(old, new, 1))
        log = os.path.join(logdir, f'mutant-{mid}.log')
        p = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', TEST], cwd=tree, capture_output=True, text=True, timeout=300)
        out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
        open(log, 'w').write(out)
        failed = sorted(set(re.findall(r'(?:×|✗|FAIL)\s.*?(CML\d)', out)))
        ok = p.returncode != 0 and failed == sorted(expect)
        results.append(f'{mid} {"RED" if p.returncode else "GREEN"} failing={",".join(failed) or "-"} expected={",".join(expect)} {"OK" if ok else "MISMATCH"} ({desc})')
finally:
    open(CART, 'w').write(orig)
p = subprocess.run(['npx', 'vitest', 'run', TEST], cwd=tree, capture_output=True, text=True, timeout=300)
results.append(f'restored rc {p.returncode}')
open(os.path.join(logdir, 'summary.txt'), 'w').write('\n'.join(results) + '\n')
print('\n'.join(results))
