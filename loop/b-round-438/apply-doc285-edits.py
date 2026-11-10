# usage: python3 -I apply-doc285-edits.py <doc-in> <edits.md> <doc-out>  (B's simulation of E1-E8)
import re, sys
s=open(sys.argv[1],encoding='utf-8').read()
f=re.findall(r'```\n(.*?)\n```',open(sys.argv[2],encoding='utf-8').read(),re.S)
assert len(f)==14,len(f)
E1,E2,E3a,E3b,E3c0,E3c1,E3c2,E4,E5a,E5b,E6,E7a,E7b,E8=f
L=s.split('\n'); assert L[3].startswith('**სტატუსი:**'); L[3]=E1
gi=[i for i,l in enumerate(L) if l.startswith('- **(g)')]; assert len(gi)==1; L.insert(gi[0]+1,E2)
k=[i for i,l in enumerate(L) if l.startswith('| ახალი guard-ები (tech-lead v1-7, v2-1)')]; assert len(k)==1; L.insert(k[0]+1,E3b)
k=[i for i,l in enumerate(L) if l.startswith('| helper row-ები')]; assert len(k)==1
c=L[k[0]].split(' | '); assert len(c)==4
assert c[3].count('SS4; SF1 + SS3; SS2')==1; c[3]=c[3].replace('SS4; SF1 + SS3; SS2',E3c0)
c[1]=c[1]+E3c1; assert c[3].endswith(' |'); c[3]=c[3][:-2]+E3c2+' |'; L[k[0]]=' | '.join(c)
k=[i for i,l in enumerate(L) if l.startswith('NF1, RD1, PG1 და DS1–DS3 უცვლელია.')]; assert len(k)==1; L[k[0]]=E4
k=[i for i,l in enumerate(L) if l.startswith('- Mutant-ები (ცხრილი ზემოთ)')]; assert len(k)==1; L[k[0]]=E5b
s='\n'.join(L)
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:60],s.count(a)); s=s.replace(a,b)
rep('`b-round-437/mutants/head.jsonl`, `sketch.jsonl`, `helper.jsonl`',E3a)
rep('A-ს გაშვებები (round 438), log-ები `tmp/studio-real-loop/a-round-438/`-ში:','A-ს გაშვებები (round 439), log-ები `tmp/studio-real-loop/a-round-439/`-ში:')
rep('  - covering set: 7 ფაილი, 23/23, rc 0;',E5a)
rep('SS1–SS8',E7a)
rep('JSX opening tag-ების სკანირება hazard-ებით',E7b)
rep('  P --> T[jsxOpeningTags / scanJsxOpeningTags<br/>path, line, tag, attributes, hazards]',E8)
s=s.rstrip('\n')+'\n'+E6+'\n'
open(sys.argv[3],'w',encoding='utf-8').write(s)
