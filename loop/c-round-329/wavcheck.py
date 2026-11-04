import sys,struct,hashlib
for p in sys.argv[1:]:
    b=open(p,'rb').read()
    assert b[:4]==b'RIFF' and b[8:12]==b'WAVE'
    i=12; fmt=None; data=None
    while i<len(b):
        cid=b[i:i+4]; sz=struct.unpack('<I',b[i+4:i+8])[0]
        if cid==b'fmt ': fmt=struct.unpack('<HHIIHH',b[i+8:i+24])
        if cid==b'data': data=b[i+8:i+8+sz]
        i+=8+sz+(sz&1)
    af,ch,rate,br,ba,bits=fmt
    n=len(data)//3
    import array
    # decode 24-bit
    mx=0; full=0; first=None; nz=0
    mv=memoryview(data)
    vals=[]
    step=1
    for k in range(0,n):
        v=mv[3*k]|(mv[3*k+1]<<8)|(mv[3*k+2]<<16)
        if v&0x800000: v-=0x1000000
        a=abs(v)
        if a>mx: mx=a
        if a>=8388607: full+=1
        if v!=0:
            nz+=1
            if first is None: first=k//ch
    print(p.split('/')[-1], 'sha',hashlib.sha256(b).hexdigest()[:16],'fmt',af,ch,rate,bits,'frames',n//ch,'dur',round(n/ch/rate,3),'peak',round(mx/8388608,5),'fullscale',full,'nonzero',nz,'firstAudible',round(first/rate,3) if first is not None else None)
