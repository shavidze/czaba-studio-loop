import json, sys
def load(p): return {r['id']: r for r in json.load(open(p))['rows']}
ref, mine = load(sys.argv[1]), load(sys.argv[2])
n, diffs = 0, []
for rid, r in ref.items():
    if r['kind'] != 'deterministic':
        continue
    n += 1
    m = mine.get(rid)
    if m is None:
        diffs.append((rid, 'missing')); continue
    if m['median'] != r['median']:
        diffs.append((rid, f"ref={r['median']} mine={m['median']} samples={m['samples']}"))
print('rows ref', len(ref), 'rows mine', len(mine), 'deterministic compared', n)
print('asserts failing (mine):', [k for k, v in mine.items() if v['mode'] == 'assert' and not v['pass']])
print('unmeasured-3x (mine):', [k for k, v in mine.items() if len(v['samples']) != 3])
for d in diffs: print('DIFF', d)
print('harness.audio-running', mine['harness.audio-running']['samples'], mine['harness.audio-running']['details'])
