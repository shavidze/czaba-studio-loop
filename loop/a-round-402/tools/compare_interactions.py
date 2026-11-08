import json, sys
a = json.load(open(sys.argv[1]))
b = json.load(open(sys.argv[2]))
def rows(d):
    return {r['id']: r for r in d['rows']}
ra, rb = rows(a), rows(b)
out = []
mismatch = 0
for rid, r in rb.items():
    if r.get('kind') != 'deterministic':
        continue
    x = ra.get(rid)
    if x is None:
        out.append(f'MISSING {rid}'); mismatch += 1; continue
    va = (x.get('min'), x.get('median'), x.get('max'), tuple(x.get('samples') or []))
    vb = (r.get('min'), r.get('median'), r.get('max'), tuple(r.get('samples') or []))
    ok = va == vb
    mismatch += 0 if ok else 1
    out.append(f"{'EQ ' if ok else 'DIFF'} {rid} A={va} B={vb} pass={x.get('pass')}")
extra = [k for k, r in ra.items() if r.get('kind') == 'deterministic' and k not in rb]
for k in extra:
    out.append(f'EXTRA {k}'); mismatch += 1
out.append(f'deterministic rows {sum(1 for r in rb.values() if r.get("kind")=="deterministic")} mismatches {mismatch}')
out.append(f"A complete={a.get('complete')} failures={a.get('failures')}")
open(sys.argv[3], 'w').write('\n'.join(out) + '\n')
print(out[-2]); print(out[-1])
sys.exit(1 if mismatch else 0)
