# B round 460 -> 461 planning, correction after the advisor check (v3 sketch, R2 closure wording). Run once from the loop root.
import json, os, sys
P = 'backlog.json'
MARK = 'b-round-460/update-backlog-461b.done'
if os.path.exists(MARK):
    sys.exit('already applied')
b = json.load(open(P, encoding='utf-8'))
SHA = open('b-round-460/sketch-461.sha256').read().split()[0]
assert SHA.startswith('b154ff53'), SHA
d = [e for e in b['decisions_log_b'] if e.get('id') == 'D-29z1629'][0]
assert '3e56c4dc' in d['decision']
d['decision'] = d['decision'].replace('(sha 3e56c4dc' + d['decision'].split('(sha 3e56c4dc', 1)[1].split(')', 1)[0] + ')',
    '(v3 sha ' + SHA[:16] + '; v2 3e56c4dc superseded: whole-file mutant run showed M5 GREEN because React dev dedupes hydration warnings per module, so E21/E21b now run before E20/E20b; tech-lead APPROVE on v3)')
d['decision'] = d['decision'].replace('Mutants M1-M10 RED, BASE green (b-round-460/mutants/mutants.txt).', 'Mutants M1-M10 RED in whole-file mode, BASE/BASE-ALL green (b-round-460/mutants/mutants.txt, mutants.py ... whole).')
r = [x for x in b['rounds'] if x.get('round') == 461][0]
r['note'] = r['note'].replace(r['note'].split('sha ', 1)[1].split(';', 1)[0], SHA[:16])
f = [x for x in b['open_findings'] if x.get('id') == 'A-R459-REVIEW-R2'][0]
f['status'] = f['status'].replace('E18 green in C4 covering, M23 RED; C13 delayinject no leak symptoms', 'E18 green in C4 covering and M23 RED (c-round-460/mutants.txt); C did not measure listener leaks in the browser')
q = [e for e in b['post_current_stage_queue'] if e.get('id') == 'STORE-REDESIGN'][0]
assert q['status'].startswith('in_progress (D-29z1629)')
b['updated'] = '2026-11-12'
open(P, 'w', encoding='utf-8').write(json.dumps(b, indent=2, ensure_ascii=True))
open(MARK, 'w').write('applied 2026-11-12\n')
print('ok', SHA[:16])
