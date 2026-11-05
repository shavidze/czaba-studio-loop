import re,sys,glob,os
R='/home/runner/czaba-project/tmp/studio-real-loop/'
def n(s):
    s=re.sub(r'"(t|eff|afterMs|focusMs|sinceLoadMs|ms|lcp|cls)":[-0-9.e]+','"\\1":N',s)
    s=re.sub(r'\d{4}-\d{2}-\d{2}','DATE',s)
    s=re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}','U',s)
    return s
tot=0
for d in sys.argv[2:]:
    for f in sorted(glob.glob(R+sys.argv[1]+'/'+d+'/logs/*.log')):
        o=f.replace(sys.argv[1],'c-round-301/t258' if False else sys.argv[1])
    break
