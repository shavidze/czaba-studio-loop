import json,sys
for l in open(sys.argv[1]):
    port,w,cpu,m,js=l.split(' ',4)
    try: d=json.loads(js)
    except Exception: print(port,w,cpu,m,'ERR',js[:200]); continue
    ds=float(d['dataStart']) if d['dataStart'] else None
    fc=d['firstCovered']; rem=d['removedAt']
    print(port,w,cpu,m,'fp',d['fp'],'start',None if ds is None else round(ds),'firstCov',fc,'coveredUntil',d['coveredUntil'],'removed',rem,'rem-firstCov',None if (rem is None or fc is None) else rem-fc,'rem-start',None if (rem is None or ds is None) else round(rem-ds),'gaps',d['gapsWhileCovered'],'logo',d['logoFullMs'],'tag',d['tagFullMs'],'black',d['blackFrames'],'state',d['finalState'],'focus',d['finalFocus'],'url',d['url'])
