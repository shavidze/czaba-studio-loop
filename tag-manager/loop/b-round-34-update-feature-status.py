p='/home/runner/czaba-project/tmp/tag-manager-loop/feature-status.md'
L=open(p,encoding='utf-8').read().split('\n')
if any(l.startswith('| TM-B38 |') for l in L): raise SystemExit('already applied')
def idx(prefix):
    r=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(r)==1,(prefix,r); return r[0]
L[2]=("განახლდა: 2026-10-28, B round 34. round 34 **PASS** (C R34-1…R34-6, realVerified=true, ორი ახალი low finding). TM-B36 (D-41) → **done**, root gate published `3035ffc` (round 34), review COMMIT OK (0 critical/high/medium, 4 low). ეს არის round 35-ის baseline. "
 "round 35 = **TM-B37** (D-42, D-43, medium): schema editor-ის `Done` ლოდინისას disabled-ია და `Applying...`-ს წერს, რედაქტირების ნაწილი `<fieldset disabled>`-ით იკეტება, Back ხელმისაწვდომი რჩება, `onSave`-ის reject editor-ს ჩვეულ მდგომარეობაში აბრუნებს (RR-R33-01, QA-R33-02, RR-R34-01); ორი პარალელური re-read-იდან ბოლო `Done` იმარჯვებს (QA-R34-01). "
 "B-მ red-ად reproduce გააკეთა `3035ffc`-ზე (`b-round-34-exp/`: 284/3 + 1 Unhandled Rejection; prototype 287/287 18 ფაილში, Biome 0/8, tsc სუფთა; BM-1…BM-5, DM-8, DM-10 მოკლულია, BM-6/DM-9 ეკვივალენტობის არგუმენტით). შემდეგი: **TM-B38** (test-only, `getByRole`-ის სიჩქარე, C-R34-02), მერე **TM-B39** (stale selection, C-R34-01). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
L.insert(4,("**round 34 დახურულია (C PASS, R34-1…R34-6, realVerified=true):** ownership: მხოლოდ 5 owned path; `SchemaEditor.tsx` diff ზუსტად D-41-ია. `9f5ac51`-ის `SchemaEditor.tsx` + A-ს ტესტები: 279/2 ((e1) `:166:37`, (e2) `:179:37` `expected undefined to be 'QTyped'`); A-ს tree 281/281 (17 ფაილი); C-ის runner-ზე ცალკე 2.9–3.95 s (C-R34-02). SM-1…SM-5 და DM-3 მოკლულია ((w8) `metadata` assertion), C-ის CM-6/CM-8 მოკლულია, CM-7 ეკვივალენტურია. "
 "gate: verifyCommand exit 0, Biome 0/8 იგივე სია, 281/93/7, `--retries=0` 7/7. real app ორ build-ზე: Q (ძველი: ხელახლა გახსნილი editor +4012 ms-ზე თავისით იხურება, `QTyped` იკარგება; ახალი: ღია რჩება `QTyped`-ით, Add Field → `R34note` + `QTyped`, pending re-read გამოყენებულია), QD (ძველი +3252 ms-ზე იხურება; ახალი ღიაა), N 136/137 ms. sha256 უცვლელი; ffprobe + music-metadata `ICAT` ველ-ველ; `pageErrors` ცარიელი. docs PASS (README 17/9/5 ხელახლა დათვლილი). "
 "ახალი finding-ები: C-R34-01 (stale selection folder-ის შეცვლის შემდეგ → TM-B39), C-R34-02 (ტესტის timing margin → TM-B38; B-მ გაზომა: `getByRole` 11.8 s vs 0.84 s), QA-R34-01 (ორი re-read, last-writer-wins → TM-B37), RR-R34-01 (`onSave` reject → TM-B37), RR-R34-02 (= QA-R33-02), RR-R34-05 არქიტექტურის signal, C-R34-03 ((e5)-ის სახელი → TM-B38), B-R34-01 (B-ის RR-R33-03 ფორმულირება მცდარი იყო, A-მ გაასწორა)."))
L.insert(5,'')
i=idx('| TM-B36 |')
L[i]=("| TM-B36 | schema editor-ი, ხელახლა გახსნილი pending `Done`-ის დროს, ძველი `Done`-ის `onClose`-ით იხურებოდა, აკრეფილი იკარგებოდა (C-R33-02); pin (w8) DM-3-ისთვის (C-R33-01); D-40-ის doc ხაზი (RR-R33-03); README ფორმულირება (A-R33-04) | **done** (round 34, C PASS, realVerified=true, `3035ffc`) | C R34: 279/2 → 281/281; SM-1…SM-5, DM-3 მოკლულია; gate 281/93/7, retries=0 7/7; real app Q/QD old symptom vs new სუფთა, N ორივეზე; sha256 + ffprobe + music-metadata `ICAT` | D-41 |")
i=idx('| TM-B37 |')
L[i]=("| TM-B37 | schema editor-ის `Done` ლოდინისას feedback-ს არ აჩვენებს და ხელახლა დაჭერადია (ყოველი click ახალი re-read); ორი re-read-იდან ბოლოს დასრულებული იმარჯვებს (QA-R34-01); `onSave` reject unhandled-ია (RR-R34-01) | in_progress (medium), round 35 | B R34 red (`b-round-34-exp/`): (b1)(b2)(b5) red + (b4) Unhandled Rejection `3035ffc`-ზე, (b3)(b6) green; prototype 287/287 (18), Biome 0/8; Reference R1–R5 + Deviations 1–4 task-ში | D-42, D-43 |")
L.insert(i+1,"| TM-B38 | renderer component ტესტების სიჩქარე და hygiene: ნელ FolderBrowser + MetadataPanel suite-ებში `screen.getByRole` ღილაკების ძებნის ჩანაცვლება სწრაფი helper-ით (default 5 s timeout-ის მარაგი), (e5)-ის სახელი, TESTING.md შენიშვნა | todo (low, test-only), TM-B37-ის შემდეგ | C-R34-02, B-R34-02 (B: 11.8 s vs 0.84 s ერთ ფაილზე), C-R34-03 | — |")
L.insert(i+2,"| TM-B39 | stale selection folder-ის შეცვლის შემდეგ: pending Open Folder-ის დროს ძველი სიის row-ზე click `selectedPaths`-ში რჩება ახალი folder-ის ჩატვირთვის შემდეგ (toolbar `1 selected`, row მონიშნული არ არის) | todo (low), TM-B37-ის შემდეგ | C-R34-01 (C R34-5 screenshots ორივე build-ზე); reference-first (selection-ის ქცევა იცვლება) | — |")
C34='**closed** — TM-B36 (D-41), C R34 PASS, `3035ffc`'
for fid in ['C-R33-01','C-R33-02','QA-R33-01','RR-R33-03','A-R33-04']:
    i=idx('| '+fid+' |'); cells=L[i].split(' | '); cells[-1]=C34+' |'; L[i]=' | '.join(cells)
i=idx('| A-R33-02 |'); cells=L[i].split(' | '); cells[-1]='(2) **closed** TM-B36 (C R34 PASS); (1) → **TM-B37** round 35 (D-42) |'; L[i]=' | '.join(cells)
for fid in ['QA-R33-02','RR-R33-01']:
    i=idx('| '+fid+' |'); cells=L[i].split(' | '); cells[-1]='**TM-B37** round 35 (D-42) |'; L[i]=' | '.join(cells)
i=idx('| B-R32-01 |'); cells=L[i].split(' | '); cells[-1]='C R33-5 გაზომა (W 1.81 s, R 5.51 s); **TM-B37** round 35: D-42 ლოდინს ხილულ `Applying...`-ს აძლევს (ლოდინის სიგრძე D-40-ით უცვლელია) |'; L[i]=' | '.join(cells)
rows=[
"| C-R34-01 | low | pending Open Folder-ის დროს ძველი სიის row-ზე click selection-ს ტოვებს path-ზე, რომელიც ახალ სიაში არ არის (`1 selected`, row მონიშნული არ არის); pre-existing ორივე build-ზე | **TM-B39** |",
"| C-R34-02 | low | (e1)–(e5), (w8) C-ის runner-ზე ცალკე 2.9–3.95 s (default 5 s); A-ს QA-მ დატვირთვისას (e1)-ის timeout ნახა. B: `getByRole` ღილაკების ძებნა მთავარი მიზეზია (11.8 s vs 0.84 s, hypothesis ერთ ფაილზე) | **TM-B38** |",
"| C-R34-03 | info | (e5)-ის სახელი \"the panel stays on the form\" არაზუსტია (Open Folder selection-ს წმენდს) | **TM-B38** |",
"| QA-R34-01 | low | ორი პარალელური schema re-read (Done #1 → Back → reopen → Qtwo → Done #2): ბოლოს დასრულებული იმარჯვებს, ძველი schema `qtwo`-ს მნიშვნელობებს შლის (მხოლოდ ჩვენება) | **TM-B37** round 35 (D-43) |",
"| RR-R34-01 | low | `onSave` reject-ზე `handleSave` ისვრის, editor არ იხურება, Done-ის click unhandled rejection-ს ტოვებს (pre-existing) | **TM-B37** round 35 (D-42) |",
"| RR-R34-02 | low | Done-ის რამდენჯერმე დაჭერა რამდენიმე re-read-ს იწყებს (= QA-R33-02) | **TM-B37** |",
"| RR-R34-05 | info | არქიტექტურის signal: MetadataPanel-მა მთელი \"schema save → re-read → close\" flow უნდა მართოს token/AbortSignal-ით, SchemaEditor მხოლოდ `isSaving`-ს აჩვენებს | signal (B: round 35 უფრო მცირე D-42 + D-43-ს ირჩევს) |",
"| B-R34-01 | info | B-ის round 34 task-ში RR-R33-03-ის ფორმულირება (\"schema fails to load\") მცდარი იყო: reject-ებული `loadSchema` `isLoaded`-ს მაშინვე true-ზე აყენებს | **closed** — A-მ docs-ში გაასწორა, C R34-6 PASS |",
"| B-R34-02 | info | TESTING.md წესის კანდიდატი: FolderBrowser + MetadataPanel suite-ებში `getByRole('button')` ~1.5–2 s/ტესტი, `querySelectorAll('button')` ~0.14 s | **TM-B38** |",
"| B-R34-03 | low | ცნობილი შეზღუდვა D-42/D-43-ის შემდეგ: Done #1 pending → Back → reopen → ველის დამატება Done-ის გარეშე: თუ #1 ჯერ folder load-ს ელოდებოდა, ველი იკითხება; თუ #1-ის read უკვე დაწყებული იყო — შემდეგ Done/Rescan-მდე არა (მხოლოდ ჩვენება) | docs/bugs/001 entry 19 (TM-B37 round 35) |",
]
i=idx('| QA-R33-03 |')
for k,r in enumerate(rows): L.insert(i+1+k,r)
i=idx('| D-41 |'); L[i]=L[i].replace('| planned R34 (TM-B36) |','| verified (C R34 PASS), published `3035ffc` (TM-B36) |')
L.insert(i+1,"| D-42 | schema editor-ის `Done` busy state (TM-B37, მხოლოდ renderer, `SchemaEditor.tsx`). ლოკალური `isApplying` Done-ზე ირთვება; სანამ true-ა, Done natively `disabled`-ია და `Applying...`-ს წერს (Save Tags-ის `disabled` + `Saving...`-ის ანალოგი, `MetadataPanel.tsx:369-372`), რედაქტირების ნაწილი `<fieldset disabled={isApplying} className=\"min-w-0 space-y-4 disabled:opacity-60\">`-შია (ველის დამატება/წაშლა/toggle/reorder შეუძლებელია). Back (header, fieldset-ის გარეთ) enabled რჩება (D-41). `onSave`-ის reject-ზე editor ღია რჩება და `isApplying` false ხდება (unhandled rejection-ის გარეშე). Reference: Mp3tag-ის \"Writing tag-data\" progress dialog; W3C APG: HTML `disabled`, თუ control focusable არ უნდა იყოს. Deviation: native `disabled` focus-ს კარგავს (GitLab/ARIA `aria-disabled` + `aria-busy`-ს ამჯობინებს) — Save Tags-თან თანმიმდევრულობისთვის. K-4 კონტრაქტს არ ეხება | planned R35 (TM-B37) |")
L.insert(i+2,"| D-43 | ბოლო `Done` იმარჯვებს (TM-B37, მხოლოდ renderer, `MetadataPanel.tsx`). `handleSchemaChanged` თავში `schemaReadIdRef`-ს ზრდის და read-ების შემდეგ store-ს არ ეხება, თუ შემდეგი `handleSchemaChanged` უკვე დაიწყო (`isFolderLoadCurrent`-თან ერთად). რატომ: D-41-ით მეორე editor-ს შეუძლია მეორე re-read დაიწყოს, სანამ პირველი pending-ია; ძველი ბოლოს დასრულებისას ახალი schema-ს მნიშვნელობებს შლიდა (QA-R34-01). ცნობილი შეზღუდვა B-R34-03 რჩება. K-4 კონტრაქტს არ ეხება | planned R35 (TM-B37) |")
open(p,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
