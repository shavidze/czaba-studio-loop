import json
d=json.load(open('c-round-275/rt/backlog-before-275.json'))
L=d['deferred_low_polish']
c=[f for f in L if str(f.get('status','')).lower().startswith(('closed','folded'))]
open('c-round-275/rt/deferred-totals.txt','w').write(f"deferred {len(L)} closed/folded {len(c)} other {len(L)-len(c)}\n")
CLOSED=('closed','done','merged','ruled','fixed','withdrawn','converted','resolved','superseded','duplicate','folded','corrected','accepted','rejected','c_pass','n/a','obsolete','moot')
o=[f['id'] for f in d['open_findings'] if str(f.get('severity','')).lower().startswith(('critical','high','medium')) and not str(f.get('status','')).lower().startswith(CLOSED)]
open('c-round-275/rt/open-medium-plus.txt','w').write(f"{len(o)} {o}\n")
print(open('c-round-275/rt/deferred-totals.txt').read(), len(o), o)
