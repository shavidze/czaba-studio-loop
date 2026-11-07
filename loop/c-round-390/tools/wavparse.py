import sys,struct,json
b=open(sys.argv[1],'rb').read()
assert b[:4]==b'RIFF' and b[8:12]==b'WAVE'
i=12;fmt=None;data=None
while i<len(b)-8:
    cid=b[i:i+4];sz=struct.unpack('<I',b[i+4:i+8])[0]
    if cid==b'fmt ': fmt=struct.unpack('<HHIIHH',b[i+8:i+24]);
    if cid==b'data': data=(i+8,sz);break
    i+=8+sz+(sz&1)
tag,ch,sr,br,ba,bits=fmt
off,sz=data; frames=sz//ba
import array
bps=bits//8
nz=0;peak=0;n=0
raw=b[off:off+sz]
if bits==24:
    for k in range(0,len(raw)-2,3):
        v=int.from_bytes(raw[k:k+3],'little',signed=True); n+=1
        if v: nz+=1
        if abs(v)>peak: peak=abs(v)
    pk=peak/8388608
elif bits==16:
    a=array.array('h');a.frombytes(raw[:len(raw)//2*2]);n=len(a);nz=sum(1 for v in a if v);pk=max(abs(v) for v in a)/32768
else: pk=None
print(json.dumps(dict(tag=tag,ch=ch,sr=sr,bits=bits,frames=frames,dur=frames/sr,datasize=sz,filesize=len(b),nonzero_frac=nz/max(n,1),peak=pk)))
