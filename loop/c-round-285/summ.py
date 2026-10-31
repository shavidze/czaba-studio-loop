import json,sys,glob
cov=lambda s: (s.get('coverage') or {}).get('missing')
for f in sys.argv[1:]:
    d=json.load(open(f)); n=f.split('/')[-1]
    if 'flip' in n: print(n,'frames',d['frames'],'flips',d['flips'],'gapRuns',d['secondsGapRuns']); continue
    if '-nb-' in n: w=d['wav']; print(n,{k:d[k] for k in ['posStart','posAfterRulerClick','posAfter3sPlay','posAfterStop','scrollLeftBeforePlay','scrollLeftAfterPlay','pageErrors']}, w['fmt'],w['frames'],round(w['seconds'],4),w['peak'],w['rms'],w['nonzeroPct'],w['nan'],w['firstNonZeroFrame'],w['dataSha256'][:16]); continue
    if d['mode'] in ('in','out','jump'):
        print(n,'start',d['start']['ruler'],cov(d['start']),'steps',[s['ruler'] for s in d['steps']],'miss',[cov(s) for s in d['steps']],'ET',[round(x) for x in d.get('eventTimingKeydownMs',[])])
    else:
        print(n,'beforePlay r/b',d['beforePlay']['ruler'],d['beforePlay']['bars'],'rm',[ (s['rm']['ruler'],s['rm']['bars']) for s in d['steps']],'bars',[s['bars'] for s in d['steps']], 'sl',[s['scrollLeft'] for s in d['steps']], 'zoomed',d.get('zoomed',{}).get('ruler'))
