"""B round 448 -> 449 advisor follow-up. Idempotent (update-backlog-followup.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-448/update-backlog-followup.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
b['version'] += 1
b['decisions_log_b'].append({'id': 'D-29z1596', 'date': '2026-11-11', 'by': '2026-11-11 B round 448 -> 449 planning (advisor follow-up)',
    'decision': ('Advisor follow-up before hand-off: K4 output sorted (traversal order differs per machine); A step 6 gains the mock-API precondition, warm.cjs warm-up '
                 'and an own-HEAD fallback for box-only drift; C6 selection, C7 forced-colors and C12 Studio/purchase protection were run by B on HEAD :5178 and sketch :5179 '
                 '(probe/extras-*.json, probe/c12-run/c12-summary.txt: Sign in required on both after a browser warm-up, 0 audio[src], 0 media) and became asserts (L58); '
                 'HERO replicated 3x per viewport (HEAD 0.341-0.349 / 0.654-0.656 teal, sketch <= 0.001; probe/hero-replicates.txt) -> C3 bounds: HEAD transparent fill + '
                 'gradient + teal >= 0.2, tree core ink within 8 per channel; C9 run-1 anomaly reworded as unexplained, seen once; C11 scratch must be committed. '
                 'Optimizer trigger words checked: no still-open entry written this planning contains closed/done/resolved (ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING).')})
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('done\n')
print('applied v', b['version'])
