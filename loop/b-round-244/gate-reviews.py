import re,os
tot=0
for n in range(230,245):
    f=f'gates/round-{n}/review.md'
    if not os.path.exists(f): print(n,'no review.md'); continue
    t=open(f).read()
    commit=re.search(r'COMMIT: ([A-Z]+)',t); score=re.search(r'Score:?\s*\**\s*([0-9.]+)/10',t)
    def count(h):
        m=re.search(r'###\s*'+h+r'[^\n]*\n(.*?)(?=\n###|\Z)',t,re.S)
        if not m: return 0
        body=m.group(1)
        if re.search(r'^\s*-\s*none',body,re.M|re.I): return 0
        return len(re.findall(r'^\d+\.\s',body,re.M))
    crit=count('Critical'); sug=count('Suggestions')+count('Findings')
    tot+=crit+sug
    print(n,'commit',commit.group(1) if commit else None,'score',score.group(1) if score else None,'critical',crit,'suggestions',sug)
print('total numbered review findings',tot)
