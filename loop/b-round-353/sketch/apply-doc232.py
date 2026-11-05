"""B round 353 -> 354: doc 232 edits for PERF-CAND-VIDEO-TRIM-FADE-COST stage 2. Usage: python3 -I apply-doc232.py <tree>"""
import os, sys
root = os.path.realpath(sys.argv[1])
if root == os.path.realpath('/home/runner/czaba-project/store') and '--store' not in sys.argv:
    sys.exit('refusing the real store path (pass --store only for A)')
p = os.path.join(root, 'docs/implementation/2026/quarter-IV/232-perf-drag-preview.md')
s = open(p, encoding='utf-8').read()

def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

rep('ეტაპი video-trim-fade-cost — video dock-ის per-move render-ის მოხსნა)',
    'ეტაპი video-trim-fade-cost — video dock-ის per-move render-ის მოხსნა, ეტაპი video-trim-fade-cost-2 — video trim/fade row-ები assert-ზე)')
rep('video-trim-fade, video-trim-fade-cost-1; C round 352 pending)',
    'video-trim-fade, video-trim-fade-cost-1, video-trim-fade-cost-2; C round 354 PASS)')

SECTION = """### ეტაპი video-trim-fade-cost-2: video trim/fade row-ები assert-ზე (round 354, D-29z1138)

105. **რატომ.** ეტაპ video-trim-fade-cost-ის კოდი C-მ round 350-ში შეამოწმა, ტესტები კი round 352-ში (gate 352, `a55543b`). video trim-ისა და fade-ის 22 row ისევ `record` იყო, ამიტომ dock-ის per-move render-ის დაბრუნებას არცერთი row არ დაიჭერდა.
106. **ცვლილება (B-ის `b-round-353/sketch/budgets.patch.txt`, უცვლელად; ახალი owner `PERF-CAND-VIDEO-TRIM-FADE-COST-2`, ეს ეტაპი).** budget C round 350-ის მნიშვნელობის ceil-ია (სამი ტოლი sample, 1×):

    | row | ადრე | ახლა |
    |---|---|---|
    | `interact.drag.video-trim.stopped.move-components-per-move` | record | `<= 13` (12.817) |
    | `interact.drag.video-trim.<state>.move-components-max` | record | `<= 15` (15) |
    | `interact.drag.video-trim.<state>.release-commits` | record | `== 1` |
    | `interact.drag.video-trim.playing.move-restarts` | record | `== 0` |
    | `interact.drag.video-fade.stopped.move-components-per-move` | record | `<= 3` (2.95) |
    | `interact.drag.video-fade.<state>.move-components-max` | record | `<= 3` (3) |
    | `interact.drag.video-fade.playing.move-restarts` | record | `== 0` |
    | `interact.harness.drag-video-trim-live`, `interact.harness.drag-video-fade-live` | record | `== 1` |

    სულ 12 row; assert row-ები 70 → 82 (252 row-დან). `record` რჩება 10: ოთხი `move-to-paint-p95` და ორი `playing.move-components-per-move` (`kind` wallclock-ია; playing-ში trim-ის sample-ები ტოლი არ არის), ორი `release-restarts` (31; ფაილში არცერთი release-restarts row არ არის assert) და video fade-ის ორი `release-commits` (2/2; მეორე commit ჯერ ახსნილი არ არის, PERF-CAND-FADE-RELEASE-COMMITS).
107. **margin (`tech-lead`).** stopped-ში ყველა sample-ს 60 move-ზე 59 window commit აქვს: trim 769 / 60, fade 177 / 60. კიდევ ერთი სრული commit trim-ს 13.03-ზე აიყვანს, fade-ს 4-component-იანი commit — 3.0-ზე მეტზე. ეს სწორი სიგნალია: stopped-ში საათი არ მუშაობს, ამიტომ დამატებითი commit drag-ზე ზედმეტ render-ს ნიშნავს. წითელი per-move row ჯერ `windowCommits`-ისა და `componentsSum`-ის detail-ით უნდა შემოწმდეს.
108. **B-ის sketch-ის გაზომვა (production, მარტო; `b-round-353/perf-summary.txt`).** sketch: rc 0, 252 row, 82/82 assert გადის, 0 NEW, C round 350-ზე მაღალი deterministic row 0, `durationMs` 488086. mutant M-B2′ (`b-round-350/mutant-M-B2prime.diff.txt`, dock-ი preview store-ს ისევ იწერს): __MB2P__.

"""
rep('### განხილული ალტერნატივები\n', SECTION + '### განხილული ალტერნატივები\n')
rep('`app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (DP66–DP71; DP72 — rounds 351–352).\n',
    '`app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (DP66–DP71; DP72 — rounds 351–352).\n'
    '- ეტაპი video-trim-fade-cost-2 (round 354): `perf/budgets.interactions.json` (12 row, იხ. ეტაპი video-trim-fade-cost-2).\n')
old_todo = [l for l in s.split('\n') if l.startswith('- video-trim-fade-cost (round 350): video dock-ის per-move render მოიხსნა; C round 350-ის შემოწმებას ელოდება.')]
assert len(old_todo) == 1
rep(old_todo[0] + '\n',
    '- ~~video-trim-fade-cost (rounds 350–352)~~: დასრულდა; C round 352 PASS (D-29z1127).\n'
    '- video-trim-fade-cost-2 (round 354): 12 video row assert-ზე. შემდეგი რიგი: PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS (video fade-ის `release-commits` 2/2-ის ჩათვლით). interactions spec-ს ახალი row არ ემატება ROOT-REQ-PERF-TIMEOUT-ის პასუხამდე ან spec-ის გაყოფამდე (D-29z1108). move-ის გადაკვეთის commit-ისა და PERF-CAND-MASTER-GROUP-FADER-PROPS-ის წინ საჭიროა ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE. `useStableHandler`-ის კონტრაქტის `docs/technical/`-ში გადატანა შემდეგ რაუნდს, რომელიც იქ შეეხება.\n')
mb = os.environ.get('MB2P')
assert mb, 'set MB2P'
rep('__MB2P__', mb)
open(p, 'w', encoding='utf-8').write(s)
print('doc232 ok')
