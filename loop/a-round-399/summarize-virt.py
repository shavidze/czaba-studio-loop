import json,sys
f,out=sys.argv[1:3]
c=json.load(open(f))
ps=c.get('passes',[])
lines=[f"file {f}", f"complete {c.get('complete')} failures {len(c.get('failures',[]))}",
       f"aborted {[p.get('abortedAt') for p in ps]}", f"problems {[p.get('problems') for p in ps]}"]
nonnull_bad=[r['id'] for r in c['rows'] if sum(1 for s in r['samples'] if s is not None) < 3]
lines.append(f"rows {len(c['rows'])} rows-with-<3-non-null {len(nonnull_bad)} {nonnull_bad}")
fails=[r for r in c['rows'] if r.get('mode')=='assert' and r.get('pass') is False]
lines.append(f"failing asserts {len(fails)}")
for r in fails: lines.append(f"  FAIL {r['id']} kind={r['kind']} median={r['median']} samples={r['samples']} budget={r['budget']}")
for k in ['scale.dom.page','scale.dom.page.min-zoom','scale.dom.page.min-zoom-mid','scale.clips.model','scale.zoom.components-per-key','res.harness.clips-2']:
    for r in c['rows']:
        if r['id']==k: lines.append(f"  {k} median {r['median']} samples {r['samples']}")
open(out,'w').write('\n'.join(lines)+'\n'); print('\n'.join(lines))
