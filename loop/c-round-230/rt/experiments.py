import json,re,glob,os
d=json.load(open('c-round-230/rt/backlog-before-230.json'))
pools=d['open_findings']+d['deferred_low_polish']+(d.get('closed_findings_d29z163') or [])
def rnd(i):
    m=re.match(r'(?:C-R|A-R|GATE|B-R|ROOT-R|INFO-C|C-)(\d+)',i); return int(m.group(1)) if m else None
print('## (1) status-line findings with window ids (regex DOC\\d+-STATUS|status line|l\\.4)')
for f in pools:
    i=f.get('id','');r=rnd(i)
    if r and 215<=r<=229:
        t=json.dumps(f,ensure_ascii=False)
        if re.search(r'DOC\d+-STATUS|status line|l\.4\b|\bL28\b',t):
            print(i,'|',f.get('severity'),'|',str(f.get('status'))[:90])
print('## docs 169-178 l.4 at HEAD')
for p in sorted(glob.glob('/home/runner/czaba-project/store/docs/implementation/2026/quarter-IV/1[67][0-9]-*.md')):
    n=int(p.split('/')[-1][:3])
    if n>=169: print(p.split('/')[-1], '|', open(p).read().splitlines()[3])
print('## (3) timeout gate failures in window: gates with status failed and timeout in verify.log')
for n in range(215,230):
    try: g=json.load(open(f'gates/gate-round-{n}.json'))
    except Exception: continue
    if g.get('status')!='published':
        f=f'gates/round-{n}/verify.log'
        log=open(f,errors='ignore').read() if os.path.exists(f) else ''
        print(n,g.get('status'),'timed out' in log.lower())
