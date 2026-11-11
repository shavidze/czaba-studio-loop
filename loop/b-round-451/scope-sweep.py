import re,sys
def block(src, name):
    i=src.index('const '+name)
    eq=src.index('=',i)
    k=eq+1
    while src[k] in ' \n': k+=1
    if src[k] in '{[':
        close={'{':'}','[':']'}[src[k]]; depth=0
        for m in range(k,len(src)):
            if src[m]==src[k]: depth+=1
            elif src[m]==close:
                depth-=1
                if depth==0: return re.sub(r'\s+',' ',src[k:m+1])
    return re.sub(r'\s+',' ',src[k:src.index(';',k)])
H={'teal':open(sys.argv[1]).read(),'grad':open(sys.argv[2]).read()}
V={'teal':open(sys.argv[3]).read(),'grad':open(sys.argv[4]).read()}
for f,names in [('teal',['TEAL_ALLOW_LIST','GRANTED_TEAL_FREE_SOURCES','GLOW_TOKENS','GRADIENT_TEXT_TOKENS','MIN_SCANNED_SOURCES','MIN_SCANNED_PERF_SOURCES','SPOTLIGHT_LOADER_PATH','TEAL_PATTERN_SOURCE']),('grad',['RETIRED_CLASS_ALLOW_LIST','BARREL_FILES','DEAD_COMPONENTS','MIN_SCANNED_SOURCES','GRADIENT_TEXT_ALLOW_LIST','GRADIENT_TEXT_PATTERN','RETIRED_CLASS_PATTERN','RETIRED_TOKEN_PATTERN'])]:
    for n in names:
        h=('const '+n) in H[f]; v=('const '+n) in V[f]
        if not(h and v): print(f,n,'present-head',h,'present-v5',v); continue
        a=block(H[f],n); b=block(V[f],n)
        print(f,n,'EQUAL' if a==b else 'DIFF')
        if a!=b: print('  HEAD:',a[:500]); print('  V5  :',b[:500])
