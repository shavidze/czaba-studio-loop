import json,collections
R=json.load(open('c-round-200/rt/rounds-123-199.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bug entries in c-round-N.json bugs[] (123-199, incl. carried ids):',dict(sev))
print('critical',sev.get('critical',0),'high',sev.get('high',0))
print('browserVerified false rounds:',[r['round'] for r in R if r.get('browser') is not True])
print('gate skipped rounds:',[r['round'] for r in R if r['gate']=='skipped'])
d=json.load(open('backlog.json'))
L=d['deferred_low_polish']
closed=[f['id'] for f in L if str(f.get('status','')).lower().startswith(('closed','folded'))]
print('deferred_low_polish entries:',len(L),'closed/folded status:',len(closed),'other:',len(L)-len(closed))
c=json.load(open('c-round-200/rt/classify-out.json'))['deferred_low_polish']
print('deferred window 123-199 by origin:',c['origin_window'],'n=',c['window_123_199'])
print('deferred all by origin:',c['origin_all'])
CR=json.load(open('c-round-200/rt/cost-rows.json'))
fa=[r[2] for r in CR if r[4]=='FAIL'];pa=[r[2] for r in CR if r[4]=='PASS']
print('A avg cost FAIL rounds',round(sum(fa)/len(fa),2),'PASS rounds',round(sum(pa)/len(pa),2))
bs=[r[1] for r in CR if r[1] is not None]; print('B planning cost per round min',min(bs),'max',max(bs))
print('C cost rounds 123-126:',[r[3] for r in CR if 123<=r[0]<=126],'A:',[r[2] for r in CR if 123<=r[0]<=126],'C 192:',[r[3] for r in CR if r[0]==192])
