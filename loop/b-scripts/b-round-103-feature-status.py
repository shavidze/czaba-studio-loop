P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P,encoding='utf-8').read().split('\n')
def idx(prefix):
    r=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(r)==1,(prefix,r); return r[0]
i=idx('განახლდა: ')
L[i]='განახლდა: 2026-10-23 · ავტორი: B (round 103 → round 104 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
ev='C round 103 PASS, `browserVerified=true` (`c-round-103.json`); gate 103 გამოქვეყნდა `3b6178b`'
i=idx('| GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED |')
L[i]=('| GATE96-S2-REPEATED-STATUS-NOT-ANNOUNCED | Low | **მუშავდება → Round 104 (D-29z69):** სტატუსი pure reducer-ში (`reduceArrangementStatus`, `status-announcement.ts`); ყოველ `setStatus(string)`-ზე sequence იზრდება, '
 '`<output aria-live="polite">` ადგილზე რჩება და მხოლოდ შიდა `<span key>` იცვლება, ამიტომ იგივე ტექსტი ხელახლა ცხადდება. B-ის scratch probe: tsc 0, Biome-ის ახალი warning 0, provider-ის 67 ტესტ-ფაილი 1113/1113. '
 'რეალური screen reader — Tech Lead R104-T. | `gates/round-96/review.md` #2; `b-round-103/probe2/` | A → C (SR-REPEAT-*) |')
i=idx('| C-R90-MUT-B-CU4-GAP |')
L[i]=f'| C-R90-MUT-B-CU4-GAP | Low | **დაიხურა** — CU10 დარჩა: C AN-REVIEW m6 (`ArrangementContext.tsx` l.2915–2917 წაშლილი scratch-ში) 3/3 წითელი, მუტაციის გარეშე 3/3 მწვანე. {ev} | `c-round-103.md` | — |'
i=idx('| GATE89-S3/S4/S6 |')
L[i]=(f'| GATE89-S3/S4/S6 | Low | S4 და S6 — **დაიხურა** (C round 101, gate 101 `56231c0`). S3 — **დაიხურა**: WD-STALL 1280/1440 (alert 30 008.7 / 30 009.4 ms, ზუსტი ტექსტი, terminate 1, 0 ჩამოტვირთვა), WD-CANCEL (terminate 1 +35 წმ-ზეც), WD-ERRTEXT, WD-MP3 (0 unpkg), WD-SLOW (CPU 6×, მაქს. შუალედი 145 ms). {ev} | `c-round-103.md`; `c-round-101.md` | — |')
i=idx('| GATE102-S5 |')
L[i]=f'| GATE102-S5 | Low | **დაიხურა** — C SOURCE-UNCHANGED: doc 090-ში ერთი hunk `@@ -4 +4 @@`. {ev} | `c-round-103.md` | — |'
i=idx('| A-R87-L5 / A-R87-LOW-PU-ORDER |')
L[i]=(f'| A-R87-L5 / A-R87-LOW-PU-ORDER | Low | L5 **დაიხურა** (`35c8403`). PU-ORDER **დაიხურა** — C PU-ALONE: `-t PU1/PU2/PU3` ცალკე გადის, baseline-ზე PU2 წითელია (assertion-ით, არა timeout-ით — B-ის ტექსტის შესწორება), 8 ტესტი, `it`-ების ტექსტი ბაიტამდე უცვლელი. {ev} | `c-round-103.md`, `a-round-103.md` | — |')
i=idx('| ARCH-R102-FOOTER-GUARD-PURE-FN |')
new=[
 '| GATE103-S1 | Low | **ღია (პირობითი, არ არის დაგეგმილი)** — პირველ progress-მდე სიჩუმე: C WD-SLOW-ში 145 ms (CPU 6×; worker-ის thread-ის throttling დაუდასტურებელია). თუ გაზომვა 10 წმ-ს მიუახლოვდება — worker-მა `progress 0` `measureExportOverload`-მდე გაგზავნოს. | `gates/round-103/review.md` #1 | B (პირობითი) |',
 '| GATE103-S2 / A-R103-EW5-TITLE-NIT | Info | **ღია** → Low-ები: „30“ ორჯერ წერია (EW8f ორივეს ამოწმებს); EW5-ის სათაური „exact message“. | `gates/round-103/review.md` #2; `a-round-103.md` | Low-ები |',
 '| GATE103-S3 | Low | **ღია** → Low-ები: worker-ის/ძრავის ტექსტი alert-ში შეზღუდვის გარეშე და შესაძლოა ინგლისურად (XSS არა — React text node). | `gates/round-103/review.md` #3 | Low-ები |',
 '| GATE103-S4 | Info | **ჩაწერილია (კოდის გარეშე)** — CU10-ის წითელი refactor-ის შემდეგ ნიშნავს „microtask-ები თავიდან დათვალე“ (witness), არა აუცილებლად რეგრესიას. | `gates/round-103/review.md` #4 | — |',
 '| GATE103-S5 | Low | **მუშავდება** → Round 104: doc 091 l.4 | `gates/round-103/review.md` #5 | A → C (SOURCE-UNCHANGED) |',
 '| ARCH-R103-EXPORT-ABORT-CONTRACT-DOC | Info | სიგნალი (არ არის დაგეგმილი) — export-ის abort-ის კონტრაქტის აღწერა `docs/technical/`-ში (CU1–CU10 უცვლელი, კოდის გარეშე); checkpoint-ის მოთხოვნის დამატება (p). Signal 4 (`detachWorker`) — keep. | `gates/round-103/review.md` Architecture note | root |',
]
L[i+1:i+1]=new
i=idx('| R92-T |')
L[i+1:i+1]=['| R104-T | რეალური screen reader (NVDA + Chrome; შესაძლებლობისას VoiceOver): `/studio-lab`-ზე ცარიელ პროექტზე Space ორჯერ და ჩავარდნილ row-ზე Enter ორჯერ — ერთი და იგივე სტატუსი ორჯერ ისმის; fade-ის drag-ისას readout-ი არ გროვდება | headless-ში screen reader არ არის; C მხოლოდ DOM-ის ცვლილებას ზომავს |']
i=idx('Round 103 (D-29z68):')
L[i]=L[i]+' → **C PASS** (`browserVerified=true`, 0 ბაგი), gate 103 გამოქვეყნდა `3b6178b`.'
L[i:i]=['Round 104 (D-29z69): GATE96-S2 — ერთი და იგივე სტატუსის ტექსტი ხელახლა ცხადდება. `ArrangementContext.tsx`-ში სტატუსი pure reducer-ში (`reduceArrangementStatus`, ახალი `app/lib/arrangement/status-announcement.ts`) — `setStatus(string)` ყოველთვის ზრდის sequence-ს; ფუნქციური restore (l.1484) უცვლელ ტექსტზე იმავე ობიექტს აბრუნებს. `StudioWorkspace.tsx`-ში `<output aria-live="polite">` რჩება, შიგნით მხოლოდ `<span key={statusSequence}>` იცვლება. GATE103-S5: doc 091 l.4; ახალი doc 092. C: SR-REPEAT-SPACE, SR-REPEAT-FAILED-ROW, SR-REGION-STABLE, SR-DRAG-STREAM, SR-TEXT-REG. **შემდეგი B-ის დაგეგმვა (2026-10-24-ზე ან შემდეგ) — რეგრესიის რაუნდი.**','']
open(P,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
