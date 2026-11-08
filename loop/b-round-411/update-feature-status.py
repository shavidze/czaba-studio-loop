P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
s=open(P).read()
if 'D-29z1432' in s:
    print('already'); raise SystemExit
lines=s.split('\n')
assert lines[2].startswith('განახლდა:')
lines[2]='განახლდა: 2026-11-08 · ავტორი: B (round 411 → round 412 დაგეგმვა, D-29z1432…D-29z1433) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md` (+ policy-ის SABA-B-4, SABA-B-7, SABA-B-8 და SABA-B-9/10/11 სექციები)'
idx=next(i for i,l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1427…D-29z1430): **round 411 = PERF-15b-i'))
new=[
"  - **Round 411 = PERF-15b-i — ბაგია (C round 411 FAIL, D-29z1432).** A გაჩერდა L11-ით code-reviewer-ის Medium-ზე **A-R411-REVIEW-M1**: generator-ი `AudioContext`-ს sample rate-ის გარეშე ხსნის (შედეგი host-ის მოწყობილობაზეა დამოკიდებული), PS17 კი 44100-ს hardcode-ით ამოწმებს და meta-ს `sampleRate`-ს არ კითხულობს — 48 kHz host-ზე სწორი რეგენერაცია ტესტს ყალბად გააწითლებდა. Commit-ებული ფაილები და runtime არ დაზიანებულა: C-მ იმავე tree-ზე ბრაუზერის row 3/4/5a/7 ორივე viewport-ზე გაიარა (`browserVerified: true`), მაგრამ row 2/5b/mutants/docs/reference არ გაეშვა. Gate 411 გამოტოვებულია. B-ის დაგეგმვის შეცდომა ჩაიწერა: B-R411-SKETCH-M1-MISSED (RETRO 416).",
"  შემდეგი (D-29z1432…D-29z1433): **round 412 = PERF-15b-i fix-up — მუშავდება.** Sketch v6.1 (2 ფაილი, runtime უცვლელი): generator 44100 Hz context-ს ფიქსირებს (სხვაგვარად შეჩერდება), `response.ok`, `try/finally`, ფაილებს ორივე decode-ის შემდეგ წერს; PS17 meta-ს rate-ს კითხულობს, 44100-ს ამოწმებს და header-ის `sample_rate`/`samples_per_pixel`-ს მას უკავშირებს. B-ის scratch-ზე: რეგენერაცია byte-ით იდენტურია (3/3), 13/13 mutant წითელია (2 ახალი rate mutant v5-ის ტესტზე ცოცხალი რჩება), covering 425/425, სრული vitest 3911/3911; `tech-lead` — APPROVE WITH LOWS ორჯერ. C მთელ ეტაპს სრულად ამოწმებს (row 1–11, scratch-ში რეგენერაცია, held=ready სიმაღლეების საკუთარი შედარება). შემდეგ **PERF-15b-ii** (ნაყიდი adapter-ის `peaksUrl`, streamed-bytes cap, Firefox-ის probe, A-R411-REVIEW-L2/L5; ხურავს PERF-15).",
]
lines[idx+1:idx+1]=new
s='\n'.join(lines)
old='| STUDIO-PERFORMANCE | **მუშავდება (D-29z1431):'
assert s.count(old)==1
s=s.replace(old,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z1432): round 411 PERF-15b-i — ბაგია (A-R411-REVIEW-M1, Medium); round 412 = fix-up + ეტაპის სრული შემოწმება; შემდეგ PERF-15b-ii (ხურავს PERF-15), SYS-R2-FAKE-FIDELITY + SYS-R388.** ძველი: **მუშავდება (D-29z1431):')
open(P,'w').write(s)
print('ok')
