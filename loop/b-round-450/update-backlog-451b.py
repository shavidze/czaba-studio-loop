# B round 450 -> 451 backlog edit 2 (tech-lead sketch review 1 outcomes). Idempotent via marker.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
mark = os.path.join(L, 'b-round-450', 'update-backlog-451b.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 440
for d in b['decisions_log_b']:
    if d.get('id') == 'D-29z1604':
        d['decision'] += ' (f) GT1b allow-list keys carry the root prefix (two roots), other lists keep bare paths (tech-lead Low 8); (g) walker stays HEAD-identical (INFO-TL-R451-WALKER-HOST). Sketch v3 (faa8fc3) fixes tech-lead review-1 Mediums 2-5 and Lows 6-7: one-pass tokenizer, script scanner includes CSS text/quoted keys/ternaries/_ classes, whole-source multi-layer zero-offset glow incl. text-shadow with ring guard, GT5b dead-module import guard (Timeline.tsx, email.server.ts), SCRIPT_SCAN_ROOTS instead of as const; 46 mutants.'
b['open_findings'] += [
 {'id': 'TL-R451-CODE4-TEAL-TEXT-SHADOW', 'severity': 'info', 'status': 'scheduled STORE-2b-3c (live teal CSS) (D-29z1604)', 'title': 'app/styles/app.css .code-4 has a teal zero-offset text-shadow that renders on the live 404 page (routes/$.tsx); neither style suite scans CSS for teal or text-shadow', 'evidence': 'b-round-450/sketch-review.md review 1 #10', 'origin': 'pre-existing'},
 {'id': 'INFO-TL-R451-WALKER-HOST', 'severity': 'info', 'status': 'logged (D-29z1604-g): walker kept HEAD-identical', 'title': 'style-scan listFiles walks untracked/ignored files and follows symlinks (dangling link -> ENOENT); a missing perf/ throws, as at HEAD; option: walk git ls-files', 'evidence': 'b-round-450/sketch-review.md review 1 #9', 'origin': 'pre-existing'},
]
sig = b.setdefault('architecture_signals', [])
entry = {'id': 'SIG-R451-STYLE-SCAN-ENGINE-POLICY', 'added': '2026-11-11 B round 450 -> 451 planning', 'source': 'tech-lead sketch review 1 (b-round-450/sketch-review.md)', 'note': 'helpers/style-scan.ts mixes the scan engine (walk, tokenizer, counting, allow-list check) with policy regexes; split into one tokenizer + one SCAN_ROOTS table + policy modules if it keeps growing. Backlog signal only, not scheduled.'}
if isinstance(sig, list):
    sig.append(entry)
else:
    sig[entry['id']] = entry
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied 451b')
