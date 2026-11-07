# usage: python3 -I perf-log-compare.py <sketch perf log> <head perf log>
import re,sys
def rows(p):
    out={}
    for line in open(p,errors='replace'):
        line=re.sub(r'\x1b\[[0-9;]*m','',line)
        m=re.match(r'^((?:interact|res|lab|stem)\.\S+)\s+(\S+)\s+median\s+(\S+)',line)
        if m: out.setdefault(m.group(1),(m.group(2),m.group(3)))
    return out
s,h=rows(sys.argv[1]),rows(sys.argv[2])
fails=[k for k,(st,_) in s.items() if st=='FAIL']
print('rows sketch',len(s),'head',len(h),'FAIL sketch',len(fails),fails[:5])
for k,(st,v) in s.items():
    hv=h.get(k,(None,None))[1]
    if hv!=v and ('components' in k or 'commits' in k or 'renders' in k or 'restarts' in k):
        print(f'{k} sketch={v} head={hv} status={st}')
