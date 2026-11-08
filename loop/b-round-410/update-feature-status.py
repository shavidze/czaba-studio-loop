P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
s=open(P).read()
if 'D-29z1427' in s:
    print('already'); raise SystemExit
lines=s.split('\n')
assert lines[2].startswith('განახლდა:')
lines[2]='განახლდა: 2026-11-08 · ავტორი: B (round 410 → round 411 დაგეგმვა, D-29z1427…D-29z1431) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md` (+ policy-ის SABA-B-4, SABA-B-7, SABA-B-8 და SABA-B-9/10/11 სექციები)'
idx=next(i for i,l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1423…D-29z1426): **round 410 = PERF-15a'))
new=[
"  - **Round 410 = PERF-15a — მზადაა (C round 410 PASS, 8 row, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 410 გამოქვეყნდა `328db74`; D-29z1431).** Parser, optional `peaksUrl`, worker fallback; 17/17 mutant წითელია C-ის scratch-ზე; `/studio-lab` უცვლელია (9 წყარო × 96 სვეტი, peaks request 0). A-ის reviewer-ის Low-ები: S1/S2 → round 411-ში სწორდება; S3/S4, GATE410-L3 → `deferred_low_polish`; GATE410-L2 → PERF-15b-ii. Architecture signal: SIG-R410-PEAKS-ARBITRATION (არ არის დაგეგმილი). fake-bearer row — blocked (backend cloud-ში არ არის). **PERF-15 ჯერ არ არის მზადაა.**",
"  შემდეგი (D-29z1427…D-29z1430): **round 411 = PERF-15b-i — მუშავდება (PERF-15-ის 3-დან მე-2 ეტაპი).** დემოს ორ MP3-ს (Middle East, CZABA hero) მიეცემა ნამდვილი, commit-ებული peaks ფაილები (`public/peaks/`, audiowaveform v1 16-bit, Chromium-ის decode-იდან; generator `scripts/peaks/`). ბიბლიოთეკის preview MP3-ის ჩატვირთვამდე ნამდვილ waveform-ს აჩვენებს — მკრთალად, seek-ის გარეშე, tooltip-ით „Preview — wait for the sound to load“ (`product-designer`). ready-ის შემდეგ worker აღარ ეშვება ამ ორ წყაროზე. Ableton-ის წყარო: Live 12 manual 5.1.2 (.asd — waveform ნაცრისფერია, სანამ ბოლომდე არ დაიხატება, დაკვრა შეუძლებელია) — დამთხვევა. B-ის sketch (v5, `tech-lead` APPROVE): სრული vitest 3911/3911, covering 425/425, 10/10 mutant წითელია; ბრაუზერში ორივე viewport-ზე: HEAD — 0 სვეტი ჩატვირთვისას და 1 worker job თითო MP3-ზე, sketch — 96 მკრთალი სვეტი და 0 job; 404 და 8-bit fallback-ები 1 job. შემდეგ **PERF-15b-ii** (ნაყიდი adapter-ის `peaksUrl`, streamed-bytes cap, Firefox-ის probe; ხურავს PERF-15).",
]
lines[idx+1:idx+1]=new
s='\n'.join(lines)
old='| STUDIO-PERFORMANCE | **მუშავდება (D-29z1426):'
assert s.count(old)==1
s=s.replace(old,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z1431): PERF-15a — მზადაა (C round 410 PASS, `328db74`); round 411 = PERF-15b-i (დემოს წინასწარი peaks, preview strip-ის tooltip); შემდეგ PERF-15b-ii (ხურავს PERF-15), SYS-R2-FAKE-FIDELITY + SYS-R388.** ძველი: **მუშავდება (D-29z1426):')
open(P,'w').write(s)
print('ok')
