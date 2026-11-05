"""B round 355 -> 356: doc 232 stage video-move-budget. Usage: python3 -I apply-doc232.py <store-tree>.
Refuses the real store path. Every replaced anchor must occur exactly once."""
import os, sys
root = os.path.realpath(sys.argv[1])
if root == os.path.realpath('/home/runner/czaba-project/store'):
    sys.exit('refusing the real store path')
p = os.path.join(root, 'docs/implementation/2026/quarter-IV/232-perf-drag-preview.md')
s = open(p, encoding='utf-8').read()

def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

rep('ეტაპი dp-test-polish — DP69/DP70/DP72-ის გამკაცრება)\n',
    'ეტაპი dp-test-polish — DP69/DP70/DP72-ის გამკაცრება, ეტაპი video-move-budget — video move-ის budget-ების გამკაცრება)\n')
rep('video-trim-fade-cost-2, dp-test-polish; C round 355 PASS)',
    'video-trim-fade-cost-2, dp-test-polish, video-move-budget; C round 356 PASS)')

SECTION = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'doc232-section.md'), encoding='utf-8').read()
assert SECTION.startswith('### ეტაპი video-move-budget') and SECTION.endswith('\n\n')
rep('\n### განხილული ალტერნატივები\n', '\n' + SECTION + '### განხილული ალტერნატივები\n')

rep('- ეტაპი dp-test-polish (round 355): `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (DP69, DP70, DP72; იხ. ეტაპი dp-test-polish).\n',
    '- ეტაპი dp-test-polish (round 355): `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (DP69, DP70, DP72; იხ. ეტაპი dp-test-polish).\n'
    '- ეტაპი video-move-budget (round 356): `perf/budgets.interactions.json` (3 row-ის budget და 19 note, იხ. ეტაპი video-move-budget).\n')

old_todo_start = '- dp-test-polish (round 355): DP69/DP70/DP72 გამკაცრდა. შემდეგი რიგი (D-29z1144): PERF-CAND-VIDEO-MOVE-BUDGET (budgets-only, GATE354-S1-ის ჩათვლით) → PERF-CAND-MASTER-GROUP-FADER-PROPS → '
rep(old_todo_start,
    '- ~~dp-test-polish (round 355)~~: დასრულდა; C round 355 PASS (D-29z1145).\n'
    '- video-move-budget (round 356): video move-ის სამი row გამკაცრდა და 19 note გასუფთავდა. შემდეგი რიგი (D-29z1148): PERF-CAND-MASTER-GROUP-FADER-PROPS → ')
open(p, 'w', encoding='utf-8').write(s)
print('doc232 ok', s.count('\n## '), 'h2 (excluding a first-line heading)')
