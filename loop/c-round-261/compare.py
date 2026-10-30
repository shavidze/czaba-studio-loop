import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
oracle = os.path.join(here, '..', 'c-round-259')
for name in ('latest.json', 'latest-interactions.json', 'latest-resources.json'):
    cur = json.load(open(os.path.join(here, name), encoding='utf8'))
    old = json.load(open(os.path.join(oracle, name), encoding='utf8'))
    rows = cur['rows']
    failed = [r['id'] for r in rows if r.get('mode') != 'record' and r.get('pass') is not True]
    aborts = sum(1 for p in cur.get('passes', []) if p.get('abortedAt') is not None)
    page_errors = sum(p.get('pageErrors', 0) or 0 for p in cur.get('passes', []))
    problems = sum(len(p.get('problems', []) or []) for p in cur.get('passes', []))
    print(f"{name} harness={cur['harness']} complete={cur['complete']} passes={len(cur.get('passes', []))} "
          f"aborts={aborts} pageErrors={page_errors} problems={problems} failures={len(cur.get('failures', []))} "
          f"rows={len(rows)} failedRows={failed}")
    oldmap = {r['id']: r for r in old['rows']}
    curmap = {r['id']: r for r in rows}
    det = [r for r in rows if r.get('kind') == 'deterministic']
    deltas = [(r['id'], oldmap[r['id']]['median'], r['median']) for r in det
              if r['id'] in oldmap and oldmap[r['id']].get('median') != r.get('median')]
    print(f"  deterministic={len(det)} deltas={deltas} new={sorted(set(curmap) - set(oldmap))} gone={sorted(set(oldmap) - set(curmap))}")
    print(f"  sequenceEqual={cur.get('sequence') == old.get('sequence')} "
          f"scenarioEqual={[r['scenario'] for r in rows] == [r['scenario'] for r in old['rows']]} "
          f"noteEqual={[r.get('note') for r in rows] == [r.get('note') for r in old['rows']]}")
    for r in rows:
        if r['id'] in ('harness.audio-running', 'interact.harness.audio-running') or '.playing.restarts' in r['id']:
            print('   ', r['id'], r['median'], r['samples'], ('record' if r.get('mode') == 'record' else ('pass' if r.get('pass') else 'FAIL')))
    for r in rows:
        if 'components-per' in r['id'] or 'release' in r['id']:
            print('   ', r['id'], r['median'], 'budget', r.get('budget'), ('record' if r.get('mode') == 'record' else ('pass' if r.get('pass') else 'FAIL')))
    if cur.get('failures'):
        print('  failures:', json.dumps(cur['failures'])[:1500])
sys.exit(0)
