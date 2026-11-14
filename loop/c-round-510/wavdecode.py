import struct,sys,json,math
def dec(path):
    b=open(path,'rb').read()
    assert b[:4]==b'RIFF' and b[8:12]==b'WAVE'
    off=12;fmt=None;data=None
    while off<len(b)-8:
        cid=b[off:off+4];sz=struct.unpack('<I',b[off+4:off+8])[0]
        if cid==b'fmt ': fmt=struct.unpack('<HHIIHH',b[off+8:off+24])
        if cid==b'data': data=(off+8,min(sz,len(b)-off-8));break
        off+=8+sz+(sz&1)
    f,ch,sr,_,_,bits=fmt;o,n=data;bps=bits//8;cnt=n//bps
    import array
    peak=0;bad=0;ss=0;nz=0;
    raw=b[o:o+cnt*bps]
    # 24-bit
    first_nz=None
    for i in range(cnt):
        v=int.from_bytes(raw[i*3:i*3+3],'little',signed=True)/8388608 if bps==3 else None
        a=abs(v)
        if a>peak:peak=a
        if a>1.0001:bad+=1
        ss+=v*v
        if a>1e-5:
            nz+=1
            if first_nz is None:first_nz=i//ch
    frames=cnt//ch
    return dict(fmtTag=f,ch=ch,sr=sr,bits=bits,riffSizeMatches=struct.unpack('<I',b[4:8])[0]+8==len(b),dataBytes=n,frames=frames,durSec=frames/sr,peak=peak,bad=bad,rms=math.sqrt(ss/cnt),nonzeroFrac=nz/cnt,firstNonZeroFrame=first_nz)
out={p:dec(p) for p in sys.argv[1:]}
print(json.dumps(out,indent=1))
