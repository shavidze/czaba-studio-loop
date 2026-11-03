import json,glob,sys
files=sys.argv[1:]
for f in files:
    try: d=json.load(open(f))
    except Exception as e: print(f,'ERR',e); continue
    rows={x['id']:x for x in d.get('rows',[])}
    def g(i,k=None):
        r=rows.get(i); 
        if not r: return None
        return [dd.get(k) for dd in r['details']] if k else r['samples']
    c=g('fader.clipgain.playing.components-per-commit.6x','commits')
    rel=g('fader.clipgain.playing.release-commits.6x')
    c1=g('fader.clipgain.playing.components-per-commit.1x','commits')
    rel1=g('fader.clipgain.playing.release-commits.1x')
    live=g('harness.loaf-scripts-live'); sm=g('load.script-max')
    print(f, 'fail=%d'%len(d.get('failures',[])), '6x commits',c,'rel',rel,'| 1x',c1,rel1,'| live',live,'| script-max',sm, d.get('startedAt'))
