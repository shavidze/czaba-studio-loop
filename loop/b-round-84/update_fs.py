import re
P='feature-status.md'
t=open(P,encoding='utf-8').read()
lines=t.split('\n')
def rep(prefix, new):
    for i,l in enumerate(lines):
        if l.startswith(prefix):
            lines[i]=new; return
    raise SystemExit('missing '+prefix)
rep('განახლდა: ', 'განახლდა: 2026-10-22 · ავტორი: B (round 84 → round 85 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`')
rep('მიმდინარე რაუნდი: **Round 84**', 'მიმდინარე რაუნდი: **Round 85** (`current-task.md`, D-29z50) — **ჯერ X1 = C-R84-M1 (Medium), შემდეგ SRW-20 ეტაპი 1 (range export).** X1: ხაზის sticky სათაური (z-20) უნდა ფარავდეს მის ქვეშ გადასულ კლიპის შიგთავსს — fade handle-ები, trim-ის ზოლები და ghost-ები სათაურზე აღარ იხატება და click-ს აღარ იჭერს (`isolate` ხაზის სხეულზე; ალტერნატივა — კლიპის root). SRW-20 ეტაპი 1: `renderArrangementWav`-ს ემატება არჩევითი ფანჯარა {start, end} (`planSchedule(arr, start, end)`, from = start, სიგრძე round((end − start) × 48000), გადატვირთვა მხოლოდ ფანჯარაზე, Master-ის მიქსი); Export-ში ახალი „მონაკვეთი“ — მონიშნული მონაკვეთი ნაგულისხმევია, როცა ის არსებობს, თორემ გამორთულია მიზეზით; ფაილი `czaba-studio-lab-range.wav`; მთელი პროექტის გზა ბაიტ-იდენტურია; MP3 ჯერ გამორთულია (ეტაპი 2). doc 074 l.4, ახალი doc 075. ბაზა: HEAD `88b0262`, სუფთა tree, გაყინული 481.')
i=[k for k,l in enumerate(lines) if l.startswith('**Round 83-ის შედეგი:**')][0]
lines.insert(i, '**Round 84-ის შედეგი:** C PASS, `browserVerified=true`, `realVerified=true` (`c-round-84.md`, `c-round-84.json`); root-მა გამოაქვეყნა `88b0262` (ორივე remote). SRW-19 — 16 რიგი PASS ორივე viewport-ზე: VF-PREVIEW (გაჩერებული 1/0.25/0.5/0.75/1; დაკვრისას 153 sample, მაქს. ცდომილება 0.000; pixel 9.7 < 39.4 < 98.9), VF-EXPORT, VF-AUDIO (მხოლოდ სურათი), VF-SYNC. C-R83-L1 დაიხურა (X1-ALIGN, 0 px). P-M1 გამეორდა → **C-R84-M1 (Medium)** → Round 85 X1. C-R84-L1 (Low, ექსპორტის ±1 LSB ვიდეოს ხმის მონაკვეთზე) → Low-ების ჯგუფი + harness-ის წესი. fake-Bearer 403 — BLOCKED (backend cloud-ში მიუწვდომელია). SRW-19 → **მოწმდება** (Tech Lead R84-T).')
lines.insert(i+1,'')
rep('| FB-06 |', '| FB-06 | ხმის ავტომაცია და fade-ები | **მოწმდება** (ეტაპი 1 — fade in/out: C PASS, `bdc2067`; ეტაპი 2 — volume envelope: C PASS `browserVerified`, `a68c81d`; C-R83-L1 დაიხურა Round 84-ში, `88b0262`; რჩება Tech Lead R82-T/R83-T) | `c-round-82.md`; `c-round-83.md`; `c-round-84.md` X1-ALIGN | Tech Lead R82-T/R83-T |')
rep('| FB-07 |', '| FB-07 | ვიდეოს Opacity fade | **მოწმდება** (Round 84 C PASS `browserVerified`, `88b0262`; R19-F1, R19-F2 pass; რჩება Tech Lead R84-T) | `c-round-84.md`, `c-round-84.json` | Tech Lead R84-T |')
rep('| SRW-18 |', [l for l in lines if l.startswith('| SRW-18 |')][0].replace('Low C-R83-L1 → Round 84 X1','C-R83-L1 დაიხურა (Round 84)'))
rep('| SRW-19 |', '| SRW-19 | ვიდეოს opacity fade (preview) | **მოწმდება** (Round 84 C PASS `browserVerified=true`, ორივე viewport, `88b0262`; R19-F1/R19-F2 pass) | `c-round-84.md`; `c-round-84.json` | Tech Lead R84-T; signals SRW19-RESCHEDULE, VIDEO-FADE-SOUND |')
rep('| SRW-20 |', '| SRW-20 | Range export, MP3, worker/progress/cancel | **მუშავდება** (ეტაპი 1 — range export, Round 85, D-29z50; ეტაპი 2 — MP3; ეტაპი 3 — worker/progress/cancel; არაფერი გადადებული) | `current-task.md` | Round 85 → C (XR-*) |')
h=[k for k,l in enumerate(lines) if l.startswith('| C80-1 |')][0]
lines[h:h]=[
 '| C-R84-M1 | Medium | **ბაგია** → Round 85 X1 (ხაზის sticky სათაურის ქვეშ გადასული fade handle-ები და trim-ის ზოლები სათაურზე იხატება და click-ს იჭერს; დამალული ვიდეოკლიპის fade შეიცვალა 1.000 → 2.000) | `c-round-84.md` C-R84-M1; `c-round-84/pm1b-*.json`; `shots/pm1b-*.png` | C: M1-HANDLE, M1-SELECTED, M1-GHOST, M1-VISIBLE, M1-ENV |',
 '| C-R84-L1 | Low | **ღიაა** — Low-ების ჯგუფი (აუდიოს გზა გაყინულია; უხმოა); harness-ის წესი Round 85-დან: ექსპორტის ტოლობის oracle ვიდეოს ხმის მონაკვეთს გამორიცხავს ან ვიდეოს აჩუმებს | `c-round-84/r2-1280x720-{a,b}.json` | Low-ები |',
 '| C-R83-L1 | Low | **დაიხურა** (Round 84 X1-ALIGN PASS ორივე viewport-ზე, 0 px; `88b0262`) | `c-round-84.md` X1-ALIGN | — |',
 '| GATE83-M1 | Medium | **გამეორდა** → C-R84-M1 | `c-round-84.md` P-M1 | Round 85 X1 |']
j=[k for k,l in enumerate(lines) if l.startswith('Round 84 (D-29z49): SRW-19')][0]
lines[j:j]=['Round 85 (D-29z50): X1 = C-R84-M1 (sticky სათაური ფარავს კლიპის შიგთავსს) + SRW-20 ეტაპი 1 — range export (WAV ფანჯარა, „მონაკვეთი“ Export-ში, `czaba-studio-lab-range.wav`). Round 84 → C PASS `browserVerified`, გამოქვეყნდა `88b0262`. შემდეგ: რეგრესია 2026-10-24-დან (Round 86-ის დაგეგმვისას სავარაუდოდ), თორემ SRW-20 ეტაპი 2 (MP3) → ეტაპი 3 → Low-ები → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN.','']
open(P,'w',encoding='utf-8').write('\n'.join(lines))
print('ok')
