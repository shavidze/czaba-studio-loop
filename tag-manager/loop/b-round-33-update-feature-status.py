p='/home/runner/czaba-project/tmp/tag-manager-loop/feature-status.md'
L=open(p,encoding='utf-8').read().split('\n')
if any(l.startswith('| TM-B36 |') for l in L): raise SystemExit('already applied')
def idx(prefix):
    r=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(r)==1,(prefix,r); return r[0]
L[2]=("განახლდა: 2026-10-28, B round 33. round 33 **PASS** (C R33-1…R33-6, realVerified=true, ორი ახალი low finding). TM-B35 (D-40) → **done**, root gate published `9f5ac51` (round 33), review COMMIT OK (1 medium, 2 low). ეს არის round 34-ის baseline. "
 "round 34 = **TM-B36** (D-41, low): schema editor-ი, რომელიც pending `Done`-ის დროს დაიხურა (Back) და ხელახლა გაიხსნა, ძველი `Done`-ის `onClose`-ით თავისით იხურება და აკრეფილი ველის სახელი იკარგება (C-R33-02 = QA-R33-01). თან: pin (w8) C-R33-01-ისთვის (DM-3), D-40-ის ერთი წინადადება (RR-R33-03) და README-ის ფორმულირება (A-R33-04). "
 "B-მ red-ად reproduce გააკეთა `9f5ac51`-ზე (`b-round-33-exp/`: (e1)(e2) red, (e3)(e4)(e5)(w8) green; prototype 281/281 17 ფაილში, Biome 0/8, tsc web + test სუფთა; SM-1…SM-4 და DM-3 მოკლულია). შემდეგი: **TM-B37** (medium, UX): `Done` ლოდინისას feedback-ს არ აჩვენებს და ხელახლა დაჭერადია (RR-R33-01, QA-R33-02) — reference-first. სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
L.insert(4,("**round 33 დახურულია (C PASS, R33-1…R33-6, realVerified=true):** ownership: მხოლოდ 5 owned path; src diff ზუსტად D-40-ია. `ee15e6c`-ის `MetadataPanel.tsx` + A-ს ტესტები: 272/3 ((w1) A-ს map B-ის სიის ქვეშ, (w2) `Failed to read 2 files`, (w3) `r33note` აკლია); A-ს tree 275/275 (16 ფაილი), თითო ტესტი ცალკე 1.5–2.2 s. DM-1/2/4/5/6/7 მოკლულია; DM-3 117 ტესტს გადის, მაგრამ **ეკვივალენტური არ არის** — C-ის (k1) მას კლავს (C-R33-01; B-ის R32 მტკიცება მცდარი იყო). "
 "gate: verifyCommand exit 0, Biome 0/8 იგივე სია, 275/93/7, `--retries=0` 7/7. real app ორ build-ზე: W (ძველი: `f.wav` Tagged-ს კარგავს; ახალი: Done-ის შემდეგ `slow/` read არ არის, editor 1.81 s-ზე იხურება, `R32Fast` რჩება), WJ (ძველი: `Failed to read 1 files`; ახალი: არა), R (ძველი: R33note ცარიელი, თუმცა ffprobe/music-metadata/raw `R33N=R33Val`; ახალი: `R33Val`, editor 5.51 s), N (9/11 ms ორივეზე). sha256 უცვლელი; ffprobe + music-metadata `ICAT`/`R33N` ველ-ველ; `pageErrors` ცარიელი. (w4)(w5)(w7) მხოლოდ unit. docs PASS. "
 "ახალი finding-ები: C-R33-01 (DM-3 test gap → TM-B36), C-R33-02/QA-R33-01 (ძველი Done ხელახლა გახსნილ editor-ს ხურავს → TM-B36), RR-R33-01 medium (Done feedback-ის გარეშე → TM-B37), QA-R33-02 (ორი Done → ორი re-read → TM-B37), RR-R33-02/A-R33-01/A-R33-03 signal-ები, RR-R33-03 (D-40-ის doc ხაზი → TM-B36), A-R33-04 (README ფორმულირება → TM-B36)."))
L.insert(5,'')
i=idx('| TM-B35 |')
L[i]=("| TM-B35 | schema-ს ცვლილება მიმდინარე folder load-ის დროს: Done Open Folder B-ის scan-ის დროს B-ის `metadata`-ს A-ს entry-ებით ცვლის (reject-ზე stale toast); ძველი schema-თი დაწყებული Rescan/Open read schema re-read-ის შემდეგ ახალი ველის მნიშვნელობებს შლის | **done** (round 33, C PASS, realVerified=true, `9f5ac51`) | C R33: 272/3 → 275/275; DM-1/2/4/5/6/7 მოკლულია, DM-3 გადარჩა (არა ეკვივალენტური, C-R33-01); gate 275/93/7, retries=0 7/7; real app W/WJ/R old symptom-ები vs new სუფთა, N ორივეზე; sha256 + ffprobe + music-metadata `ICAT`, `R33N=R33Val` | D-40 |")
L.insert(i+1,"| TM-B36 | schema editor-ი, ხელახლა გახსნილი pending `Done`-ის დროს, ძველი `Done`-ის `onClose`-ით იხურება, აკრეფილი იკარგება (C-R33-02); pin (w8) DM-3-ისთვის (C-R33-01); D-40-ის doc ხაზი (RR-R33-03); README ფორმულირება (A-R33-04) | todo (low), round 34 | B R33 red (`b-round-33-exp/`): (e1)(e2) red `9f5ac51`-ზე, (e3)(e4)(e5)(w8) green; prototype 281/281 (17), Biome 0/8; SM-1…SM-4, DM-3 მოკლულია | D-41 |")
L.insert(i+2,"| TM-B37 | schema editor-ის `Done` ლოდინისას feedback-ს არ აჩვენებს და ხელახლა დაჭერადია (ყოველი click ახალი re-read) — UX, reference-first (disabled vs aria-disabled + aria-busy; ლოდინისას დამატებული ველი) | todo (medium), TM-B36-ის შემდეგ | RR-R33-01, QA-R33-02, B-R32-01 (C გაზომა: W 1.81 s, R 5.51 s), QA-R33-03 | — |")
C33='**closed** — TM-B35 (D-40), C R33 PASS, `9f5ac51`'
for fid in ['A-R32-01','RR-R32-04']:
    i=idx('| '+fid+' |'); cells=L[i].split(' | '); cells[-1]=C33+' |'; L[i]=' | '.join(cells)
i=idx('| B-R32-01 |'); cells=L[i].split(' | '); cells[-1]='C R33-5 გაზომა (ახალი: W 1.81 s, R 5.51 s); ღიაა → TM-B37 |'; L[i]=' | '.join(cells)
i=idx('| B-R32-02 |'); cells=L[i].split(' | '); cells[-1]='**closed — შესწორებულია** C-R33-01-ით: DM-3 ეკვივალენტური არ არის (superseding load-ის საკუთარი read reject-ზე D-40-ის re-read C-ს ავსებს); pin (w8) → TM-B36 |'; L[i]=' | '.join(cells)
rows=[
"| C-R33-01 | low | test gap: DM-3 (`folderLoadId` ლოდინამდე) 117 ტესტს გადის, მაგრამ (k1)-ით კვდება (C-ის პირველი read reject → re-read C-ს ავსებს, DM-3 — `{}`) | **TM-B36** (round 34, (w8)) |",
"| C-R33-02 | low | pending `Done` (D-40 ლოდინი ან ნელი re-read) Back → Customize-ის ხელახლა გახსნის შემდეგ ახალ editor-ს ხურავს, აკრეფილი იკარგება; pre-existing, D-40-მა ფანჯარა გააფართოვა; დისკზე არაფერი (A qa: medium) | **TM-B36** (round 34, D-41) |",
"| QA-R33-01 | low | = C-R33-02 (qa-engineer: medium) | **TM-B36** |",
"| QA-R33-02 | low | ორი `Done` pending load-ის დროს → ორი schema re-read; შედეგი სწორია, reject-ზე toast შეიძლება ორჯერ | **TM-B37** |",
"| QA-R33-03 | info | არასოდეს დასრულებული `scanFolder` → `Done` სამუდამოდ ელოდება; Back/Open/Close მუშაობს | record (TM-B37 ოჯახი) |",
"| RR-R33-01 | medium | `Done` ლოდინისას feedback-ის გარეშე (არც disabled, არც busy); ნელ folder-ზე თითქოს არაფერი ხდება | **TM-B37** (UX, reference-first) |",
"| RR-R33-02 | low | `waitForFolderLoadIdle`-ის subscription შეიძლება MetadataPanel-ს გადაურჩეს (დღეს უვნებელი) | signal |",
"| RR-R33-03 | low | startup-ზე schema-ს ჩავარდნისას drop `isScanning`-ს ≤5 s ინახავს → Done ≤5 s ელოდება; D-40-ში არ წერია | **TM-B36** (D-40 doc ხაზი) |",
"| A-R33-01 | low | D-40 ეყრდნობა `handleCloseFolder`-ის სინქრონულობას (`setIsScanning(false)` `setFiles([])`-მდე) | signal / STATE_MANAGEMENT წესის კანდიდატი |",
"| A-R33-02 | low | `Done` ლოდინისას clickable: (1) = QA-R33-02, (2) = C-R33-02 | (2) TM-B36, (1) TM-B37 |",
"| A-R33-03 | low | module-level subscription ტესტებს შორის შეიძლება გაჟონოს, თუ ტესტი `isScanning` true-ით მთავრდება | signal (TESTING.md წესის კანდიდატი) |",
"| A-R33-04 | low | README row 001 \"8 გასწორდა, 5 მათგანი Saba-ს კითხვაა\" ორაზროვანია | **TM-B36** (ფორმულირება) |",
]
i=idx('| B-R32-02 |')
for k,r in enumerate(rows): L.insert(i+1+k,r)
i=idx('| D-40 |'); L[i]=L[i].replace('| planned R33 (TM-B35) |','| verified (C R33 PASS), published `9f5ac51` (TM-B35) |')
L.insert(i+1,"| D-41 | დახურული (unmounted) schema editor-ი panel-ს არ ხურავს (TM-B36, მხოლოდ renderer, `SchemaEditor.tsx`). `isMountedRef = useRef(false)`; mount effect მას true-ს ანიჭებს, cleanup — false-ს (StrictMode-safe). `handleSave` `await onSave()`-ის შემდეგ `onClose()`-ს არ იძახებს, თუ `isMountedRef.current` false-ია. რატომ: Back editor-ს ხურავს, სანამ Done ჯერ ელოდება (D-40) ან re-read-ს აკეთებს; ხელახლა გახსნილ editor-ს ძველი Done-ის `onClose` (`setShowSchemaEditor(false)`) ხურავდა. pending re-read მაინც სრულდება და იწერება (D-40 უცვლელი). Done-ის busy state / re-entrancy — TM-B37. K-4 კონტრაქტს არ ეხება | planned R34 (TM-B36) |")
open(p,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
