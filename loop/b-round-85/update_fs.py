P='feature-status.md'
t=open(P,encoding='utf-8').read()
lines=t.split('\n')
def idx(prefix):
    r=[i for i,l in enumerate(lines) if l.startswith(prefix)]
    if len(r)!=1: raise SystemExit('prefix count %d: %s'%(len(r),prefix))
    return r[0]
def rep(prefix,new): lines[idx(prefix)]=new
rep('განახლდა: ', 'განახლდა: 2026-10-22 · ავტორი: B (round 85 → round 86 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`')
rep('მიმდინარე რაუნდი: **Round 85**', 'მიმდინარე რაუნდი: **Round 86** (`current-task.md`, D-29z51) — **ჯერ X1 = C-R85-L2 + GATE85-S2, შემდეგ SRW-20 ეტაპი 2 (MP3 და WAV + MP3).** X1: Export-ში „მთელი პროექტი“ ყოველთვის აქტიურია (რენდერის გარდა), გამორთული „მონიშნული მონაკვეთი“ მიზეზს `aria-describedby`-ით უკავშირდება. ეტაპი 2: ფორმატი WAV (ნაგულისხმევი) / MP3 / WAV + MP3; MP3 გაყინული `app/utils/ffmpeg.ts`-ით (dynamic import, 120 წმ-იანი ჩატვირთვის timeout), ჩავარდნისას ზუსტი შეცდომა და ფაილის გარეშე, WAV + MP3 — ორივე ან არცერთი; `czaba-studio-lab[-range].mp3`; ფანჯრის საერთო helper `render-window.ts`; `vite.config.ts`-ში `optimizeDeps.exclude` ffmpeg-ისთვის (B-ის ექსპერიმენტი: dev-ზე worker სხვაგვარად ვერ იტვირთება). doc 075 l.4, ახალი doc 076. ბაზა: HEAD `51e024a`, სუფთა tree, გაყინული 487.')
i=idx('**Round 84-ის შედეგი:**')
lines[i:i]=['**Round 85-ის შედეგი:** C PASS, `browserVerified=true`, `realVerified=true` (`c-round-85.md`, `c-round-85.json`); root-მა გამოაქვეყნა `51e024a` (ორივე remote, review 8.5/10). C-R84-M1 დაიხურა: სათაური ზედაა ვიდეოს/აუდიოს fade handle-ებზე, trim-ის ზოლებსა და envelope-ის წერტილებზე, მონიშნულ და მოუნიშნავ კლიპზე; იქ drag არაფერს ცვლის. SRW-20 ეტაპი 1: XR-WAV (240000 frame, პროექტის ფანჯარასთან 0/1 LSB), XR-MIDSTART, XR-ALLTRACKS (Master), XR-PROJECT, XR-OVERLOAD, XR-KEYS, XR-X3 PASS; XR-PASTEND UI-დან მიუღწევადია (unit XR4). ახალი Low-ები: C-R85-L1 (Escape drag-ს არ აუქმებს — კონტრაქტი არ არის, სიგნალი ESCAPE-CANCEL-GESTURE), C-R85-L2 (→ Round 86 X1). fake-Bearer 403 — BLOCKED (backend cloud-ში მიუწვდომელია).','']
rep('| SRW-20 |', '| SRW-20 | Range export, MP3, worker/progress/cancel | **მუშავდება** (ეტაპი 1 — range export: C PASS `browserVerified`, `51e024a`, R20-X1/R20-X3 pass; ეტაპი 2 — MP3 + WAV + MP3, Round 86, D-29z51; ეტაპი 3 — worker/progress/cancel; არაფერი გადადებული) | `c-round-85.md`, `c-round-85.json`; `current-task.md` | Round 86 → C (X1-PROJECT, MP-*) |')
rep('| C-R84-M1 |', '| C-R84-M1 | Medium | **დაიხურა** (Round 85 X1; C M1-HANDLE/M1-SELECTED/M1-GHOST/M1-VISIBLE/M1-ENV PASS ორივე viewport-ზე, `51e024a`) | `c-round-85.md` M1-* | — |')
rep('| C-R84-L1 |', '| C-R84-L1 | Low | **ღიაა** — Low-ების ჯგუფი; C Round 85: 1 LSB-ის jitter ვიდეოს გარეშეც ჩანს (4–9 წმ, 3254 sample); tolerance-ის ფარგლებშია; harness-ის წესი გაფართოვდა (≤ 1 LSB ყველგან jitter-ია) | `c-round-84/r2-*.json`; `c-round-85.json` observations | Low-ები |')
rep('| GATE83-M1 |', '| GATE83-M1 | Medium | **დაიხურა** C-R84-M1-ით (Round 85, `51e024a`) | `c-round-85.md` | — |')
h=idx('| C-R84-M1 |')
lines[h:h]=[
 '| C-R85-L1 | Low | **განჩინება (D-29z51): კონტრაქტი არ არის** — Escape კლიპის drag-ს არ აუქმებს; არცერთი gesture არ უქმდება Escape-ით; Live დაუდასტურებელია; მომხმარებელს არ უთხოვია → სიგნალი ESCAPE-CANCEL-GESTURE | `c-round-85/m1-*.json` M1-GHOST | Tech Lead / მომხმარებლის გადაწყვეტილება |',
 '| C-R85-L2 | Low | **ბაგია** → Round 86 X1 (მონიშვნის გარეშე „მთელი პროექტი“ checked + disabled) | `c-round-85/xr-*.json` XR-PROJECT | C: X1-PROJECT |',
 '| FFMPEG-DEV-WORKER | Medium | **ბაგია** → Round 86 (`vite.config.ts` exclude; B-ის ექსპერიმენტი: dev-ზე ffmpeg-ის worker ERR_FAILED, `loadFFmpeg` არ სრულდება) | `b-round-85/probe/PROBE-SUMMARY.md` | C: MP-MP3 |']
j=idx('Round 85 (D-29z50): X1 = C-R84-M1')
lines[j:j]=['Round 86 (D-29z51): X1 = C-R85-L2 + GATE85-S2 (მონაკვეთის radio-ები) + SRW-20 ეტაპი 2 — MP3 და WAV + MP3 (გაყინული `ffmpeg.ts`, 120 წმ timeout, ჩავარდნისას ფაილის გარეშე, `vite.config.ts` exclude, `render-window.ts`). Round 85 → C PASS `browserVerified`, გამოქვეყნდა `51e024a`. შემდეგ: რეგრესიის რაუნდი 2026-10-24-დან, თორემ SRW-20 ეტაპი 3 → Low-ები → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN.','']
open(P,'w',encoding='utf-8').write('\n'.join(lines))
print('ok')
