# C315: parse a 24-bit PCM WAV; report format, duration, peak/RMS, silence runs, dominant frequency (zero crossings), clicks.
import sys, struct, math
d = open(sys.argv[1], 'rb').read()
assert d[:4] == b'RIFF' and d[8:12] == b'WAVE'
i = 12; fmt = None; data = None
while i < len(d):
    cid, sz = d[i:i+4], struct.unpack('<I', d[i+4:i+8])[0]
    if cid == b'fmt ': fmt = struct.unpack('<HHIIHH', d[i+8:i+24])
    if cid == b'data': data = d[i+8:i+8+sz]
    i += 8 + sz + (sz & 1)
tag, ch, sr, br, ba, bits = fmt
n = len(data) // ba
def s(k, c):
    o = k*ba + c*3; v = data[o] | data[o+1] << 8 | data[o+2] << 16
    return (v - (1 << 24) if v & 0x800000 else v) / 8388608.0
L = [s(k, 0) for k in range(n)]
peak = max(abs(x) for x in L); rms = math.sqrt(sum(x*x for x in L)/n)
nz = [k for k, x in enumerate(L) if abs(x) > 1e-4]
mid = L[int(0.5*sr):int(1.5*sr)]
zc = sum(1 for a, b in zip(mid, mid[1:]) if a < 0 <= b)
jump = max(abs(b-a) for a, b in zip(L, L[1:]))
print(dict(tag=tag, ch=ch, sr=sr, bits=bits, frames=n, seconds=round(n/sr, 4), peak=round(peak, 4), rms=round(rms, 4),
           firstNonSilent_s=round(nz[0]/sr, 4) if nz else None, lastNonSilent_s=round(nz[-1]/sr, 4) if nz else None,
           freqHz_0p5_1p5=zc, maxSampleJump=round(jump, 4), chEqual=all(abs(s(k, 0)-s(k, 1)) < 1e-6 for k in range(0, n, 97)) if ch == 2 else None))
