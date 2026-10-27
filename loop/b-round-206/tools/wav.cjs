function parse(buf){const fmt={};let o=12,data=null;
 while(o+8<=buf.length){const id=buf.toString('ascii',o,o+4),sz=buf.readUInt32LE(o+4);
  if(id==='fmt '){fmt.tag=buf.readUInt16LE(o+8);fmt.ch=buf.readUInt16LE(o+10);fmt.sr=buf.readUInt32LE(o+12);fmt.bits=buf.readUInt16LE(o+22);}
  if(id==='data'){data=buf.subarray(o+8,o+8+sz);break}o+=8+sz+(sz&1);}
 const bps=fmt.bits/8,n=Math.floor(data.length/bps);
 const read=i=>fmt.tag===3?data.readFloatLE(i*bps):fmt.bits===16?data.readInt16LE(i*2):fmt.bits===24?data.readIntLE(i*3,3):data.readInt32LE(i*4);
 return {fmt,n,frames:n/fmt.ch,read,seconds:n/fmt.ch/fmt.sr,riff:buf.toString('ascii',0,4)};}
function stats(w){let nan=0,full=0,sum=0,peak=0;const fs=w.fmt.tag===3?1:Math.pow(2,w.fmt.bits-1);for(let i=0;i<w.n;i++){const v=w.read(i);if(!Number.isFinite(v)){nan++;continue}const a=Math.abs(v)/fs;if(a>=0.9999)full++;sum+=a*a;if(a>peak)peak=a}return {nan,full,rms:Math.sqrt(sum/w.n),peak}}
function cmp(a,b){let m=0;const n=Math.min(a.n,b.n);const fs=a.fmt.tag===3?1:1;for(let i=0;i<n;i++){const d=Math.abs(a.read(i)-b.read(i));if(d>m)m=d}return m}
module.exports={parse,stats,cmp};
