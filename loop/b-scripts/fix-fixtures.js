const fs=require('fs');const d='C:/Apps/czaba-project/tmp/studio-real-loop/';
let b=fs.readFileSync(d+'b-round-1.md','utf8');
const rep=[['c18deb3b','2c4f59dd'],['97d89134','400625b3'],['74a7a38b','628ac6bd'],['febdff59','e0726003']];
for(const [a,z] of rep){if(!b.includes(a))throw a;b=b.replace(a,z);}
b=b.replace('Environment risk:','All beep fixtures are **stereo** (`aevalsrc` with `c=stereo`, `ffprobe channels=2`). The first set was mono, and the advisor caught it: a mono source passes the pan-0 `StereoPanner` at −3 dB (A\'s L11), which would have made R3-V3\'s bit-level oracle fail for the wrong reason. `tone-2s.wav` stays mono because it is only used for the rejection test.\n\nEnvironment risk:');
fs.writeFileSync(d+'b-round-1.md',b);
let t=fs.readFileSync(d+'current-task.md','utf8');
const o1='→ clips 0–6.008 and 6.008–10.016.';
if(!t.includes(o1))throw 'v1';
t=t.replace(o1,'→ the first clip is 0–d₁, with d₁ = 6.008 ± 0.02 (the browser-reported duration), and the second clip starts exactly at the first clip\'s end.');
const o3='Nominal onset time ±25 ms.';
if(!t.includes(o3))throw 'v3';
t=t.replace(o3,'Nominal onset time ±25 ms for WebM/Opus. For the AAC fixtures (env-limited), allow ±50 ms because of AAC priming; the same-decode comparison remains the oracle. The fixtures are stereo, so the pan-0 path is identity. Mono sources remain A\'s known L11 (−3 dB, identical live and in export); this oracle does not test them.');
const o4='| `beeps-6s-vp9-opus.webm` | 6.008 s VP9 + Opus,';
if(!t.includes(o4))throw 'v4';
t=t.replace(o4,'| `beeps-6s-vp9-opus.webm` | 6.008 s VP9 + Opus stereo,');
fs.writeFileSync(d+'current-task.md',t);console.log('ok');
