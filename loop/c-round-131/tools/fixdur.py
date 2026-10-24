import sys,struct
src,dst,ms=sys.argv[1],sys.argv[2],float(sys.argv[3])
b=bytearray(open(src,'rb').read())
i=b.find(bytes([0x15,0x49,0xA9,0x66]))
assert i>0
p=i+4; first=b[p]; L=1
while not (first & (0x80>>(L-1))): L+=1
size=first & (0xFF>>L)
for k in range(1,L): size=(size<<8)|b[p+k]
assert b.find(bytes([0x44,0x89]),p+L,p+L+size)<0, 'duration exists'
dur=bytes([0x44,0x89,0x88])+struct.pack('>d',ms)
ns=size+len(dur)
enc=bytearray(L); v=ns
for k in range(L-1,-1,-1): enc[k]=v&0xFF; v>>=8
enc[0]|=(0x80>>(L-1))
out=b[:p]+enc+b[p+L:p+L+size]+dur+b[p+L+size:]
open(dst,'wb').write(out); print('info size',size,'->',ns,'L',L)
