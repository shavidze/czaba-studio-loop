# B round 515 -> 516 planning amendment (after the advisor's hand-off review): v522 -> v523. Run once from the loop root.
import json, os, shutil
L = os.getcwd(); P = os.path.join(L, 'backlog.json')
DONE = os.path.join(L, 'b-round-515', 'amend-backlog-516.applied')
assert not os.path.exists(DONE), 'already applied'
shutil.copyfile(P, os.path.join(L, 'b-round-515', 'backlog-before-amend-516.json'))
b = json.load(open(P, encoding='utf-8')); assert b['version'] == 522, b['version']
BY = '2026-11-14 B round 515 -> 516 planning'
of = b['open_findings']
def find(i):
    return next((f for f in of if isinstance(f, dict) and f.get('id') == i), None)
if find('INFO-B515-SHARED-VITE-CACHE') is None:
    of.append({'id': 'INFO-B515-SHARED-VITE-CACHE', 'severity': 'info', 'origin': 'B pre-check', 'added': BY,
               'title': 'B planning started a scratch dev server whose node_modules symlink shared store/node_modules/.vite; it re-optimised deps and :5173 answered 504 Outdated Optimize Dep (no hydration) until store/vite.config.ts was touched (mtime only, sha unchanged, git status clean)',
               'evidence': 'b-round-515.md "Environment incident"; repeat of C-R278-ENV-01 (L38 second-dev-server clause existed and was not applied by B)',
               'status': 'recorded (D-29z1875): process slip of B; round 516 task cites L38 for C; trace at RETRO 525'})
c = find('C-R278-ENV-01')
if c is not None:
    c.setdefault('confirmedBy', []).append('B round 515 planning repeat (INFO-B515-SHARED-VITE-CACHE, D-29z1875): B did not apply the L38 clause; second occurrence (2x)')
b['decisions_log_b'].append({'id': 'D-29z1875', 'date': '2026-11-14', 'by': BY,
    'decision': 'Hand-off amendments to the round-516 task after the advisor review: both link boxes stated (gift 186x50, collection 170x50; x/y not compared), mutants run on a copy outside store/ (L60, as round 515 C5), L38 cited for any second server, docs/e2e inventory pre-ruled (DESIGN_SYSTEM l.1161 example list not granted -> DPG-BUTTON-CONTRACT-TABLE; doc 327 l.63 historic; e2e Close selectors still match), claims K11/K19 extended. INFO-B515-SHARED-VITE-CACHE recorded; C-R278-ENV-01 confirmedBy (2x).'})
b['version'] = 523; b['updated'] = BY
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(DONE, 'w').write('ok\n'); print('backlog v523 written')
