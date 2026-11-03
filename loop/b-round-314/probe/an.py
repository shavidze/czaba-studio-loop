import json,sys
runs=json.load(open(sys.argv[1]))
for r in runs:
  print(f"pass {r['pass']} rate {r['rate']} ready {r['readyMs']} settled {r['settledMs']} problems {r['problems']}")
  ev=[(m['t'],'MARK '+m['name']) for m in r['marks']]+[(c['t'],f"COMMIT n={c['rendered']} {','.join((c['names'] or [])[:6])}") for c in r['commits']]+[(l['t'],f"LONGTASK {l['d']}") for l in r['longtasks']]
  for t,e in sorted(ev,key=lambda x:x[0]): print('  ',t,e[:160])
