import sys,struct,json,math
f=sys.argv[1];d=open(f,'rb').read()
assert d[:4]==b'RIFF' and d[8:12]==b'WAVE'
i=12;fmt=None;data=None
while i<len(d)-8:
    cid=d[i:i+4];sz=struct.unpack('<I',d[i+4:i+8])[0]
    if cid==b'fmt ': fmt=struct.unpack('<HHIIHH',d[i+8:i+24])
    if cid==b'data': data=d[i+8:i+8+sz]; dsz=sz
    i+=8+sz+(sz&1)
tag,ch,sr,br,ba,bits=fmt
n=len(data)//ba
import array
if bits==16: a=array.array('h');a.frombytes(data[:n*ba]);sc=32768.0;vals=a
elif bits==24:
    vals=[int.from_bytes(data[j:j+3],'little',signed=True) for j in range(0,n*ba,3)];sc=8388608.0
elif bits==32 and tag==3: a=array.array('f');a.frombytes(data[:n*ba]);vals=a;sc=1.0
else: raise SystemExit(('unsupported',fmt))
frames=n
win=sr//10
rms=[]
for k in range(0,frames-win,win):
    s=0
    for j in range(k*ch,(k+win)*ch,max(1,ch)): s+=(vals[j]/sc)**2
    rms.append(math.sqrt(s/win))
bad=sum(1 for v in vals if isinstance(v,float) and not math.isfinite(v))
peak=max(abs(v) for v in vals)/sc
# active ranges
act=[round(i/10,1) for i,r in enumerate(rms) if r>0.001]
print(json.dumps({'fmt':{'tag':tag,'ch':ch,'sr':sr,'bits':bits},'frames':frames,'dur':round(frames/sr,3),'peak':round(peak,4),'nonFinite':bad,'activeFirst':act[:1],'activeLast':act[-1:],'activeCount':len(act),'dataBytes':dsz,'headerRiffSizeOK':struct.unpack('<I',d[4:8])[0]==len(d)-8,'rms_every_s':[round(max(rms[i:i+10]),4) for i in range(0,len(rms),10)]}))
