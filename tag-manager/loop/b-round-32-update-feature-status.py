p='/home/runner/czaba-project/tmp/tag-manager-loop/feature-status.md'
L=open(p,encoding='utf-8').read().split('\n')
def idx(prefix):
    r=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(r)==1,(prefix,r); return r[0]
L[2]=("განახლდა: 2026-10-27, B round 32. round 32 **PASS** (C R32-1…R32-6, realVerified=true, ახალი ბაგი 0). TM-B34 (D-39) → **done**, root gate published `ee15e6c` (round 32), review COMMIT OK (4 low + არქიტექტურის შენიშვნა). ეს არის round 33-ის baseline. "
 "round 33 = **TM-B35** (D-40, low): schema-ს ცვლილება მიმდინარე folder load-ის დროს — (a) Done, დაჭერილი Open Folder B-ის scan-ის დროს, A-ს ფაილებს B-ის (მიმდინარე) load id-ით კითხულობს და B-ის `metadata`-ს A-ს entry-ებით ცვლის, reject-ზე stale toast (A-R32-01); (b) Rescan/Open read, რომელიც ძველი schema-თი დაიწყო, schema re-read-ის შემდეგ სრულდება და ახალი ველის მნიშვნელობებს შლის (RR-R32-04). "
 "B-მ red-ად reproduce გააკეთა `ee15e6c`-ზე (`b-round-32-exp/`: (w1)(w2)(w3) red, (w4)–(w7) green pin; prototype 275/275; DM-1/2/4/5/6/7 მოკლულია, DM-3 ეკვივალენტურია). A-ს ორი შემოთავაზებული fix (`isScanning`-ზე ადრეული return; `files`-ის identity guard) mutant-ებით უარყოფილია: DM-4 (w3)-ს ამტვრევს, DM-5 (w1)(w3)(w7)-ს. სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
L.insert(4,("**round 32 დახურულია (C PASS, R32-1…R32-6, realVerified=true, ახალი ბაგი 0):** ownership: მხოლოდ 8 owned path; src diff ზუსტად D-39-ია. `7355d78`-ის `MetadataPanel.tsx`/`App.tsx` + A-ს ტესტები: 260/8 ((v1)–(v4), (v6)–(v9) symptom-ზე; (v5)(o17)(o18) მწვანე); A-ს tree 268/268 (15 ფაილი), თითოეული ცალკე 1 passed. SM-1…SM-8 მოკლულია მოსალოდნელი killer-ებით, SM-9 ეკვივალენტურია (C-მ დაასაბუთა). "
 "gate: verifyCommand exit 0, Biome 0/8 იგივე სია, 268/93/7, `--retries=0` 7/7. real app ორ build-ზე (read-one / batch delay / reject harness): V, SC, SJ სცენარებში ძველი build ყველა symptom-ს აჩვენებს, ახალი — არცერთს; `Tags saved` V-ში ორივეზე. sha256: `f.wav` უცვლელი, `s.wav` მხოლოდ V-ის save-ით; ffprobe `ICAT` + music-metadata `exif:ICAT` field-by-field `R32Fast`/`R32Slow`/`R32Slow2`; `R32note` არ ჩაწერილა; `pageErrors` ცარიელი. (v3)(v5)(v8)(v9) მხოლოდ unit (ნათქვამია). docs PASS (ყველა `file:line` `refs.py`-ით). "
 "root review: medium არ არის; RR-R32-01 (batch filter O(n×m), signal), RR-R32-02 (stats refresh-ის ზედმეტი scan, signal), RR-R32-03 (App early return სწორია, record), RR-R32-04 (ძველი schema-ს Rescan read, → TM-B35), RR-R32-05 (არქიტექტურა). A/C signal-ები: A-R32-01 (→ TM-B35, B-მ red-ით დაადასტურა), A-R32-02 (ხილული ეფექტი ვერ ვიპოვე → info), C-R32-01 ((s1)/(v9) timing load-ის ქვეშ)."))
L.insert(5,'')
i=idx('| TM-B34 |')
L[i]=("| TM-B34 | გვიანი re-read-ები folder switch-ის შემდეგ: save-ის re-read ძველი folder-ის path-ს ახალ `metadata`-ში ამატებს; schema re-read ახალი folder-ის `metadata`-ს ძველით ცვლის + stale toast; superseded drop schema-ს ლოდინის შემდეგ მაინც scan-ს აკეთებს | **done** (round 32, C PASS, realVerified=true, `ee15e6c`) | C R32: 260/8 → 268/268; SM-1…SM-8 მოკლულია, SM-9 ეკვივალენტური; gate 268/93/7, retries=0 7/7; real app V/SC/SJ old symptom-ები vs new სუფთა; sha256 + ffprobe + music-metadata `ICAT=R32Fast/R32Slow/R32Slow2` | D-39 |")
L.insert(i+1,"| TM-B35 | schema-ს ცვლილება მიმდინარე folder load-ის დროს: Done Open Folder B-ის scan-ის დროს B-ის `metadata`-ს A-ს entry-ებით ცვლის (reject-ზე stale toast); ძველი schema-თი დაწყებული Rescan/Open read schema re-read-ის შემდეგ ახალი ველის მნიშვნელობებს შლის | todo (low), round 33 | B R32 red (`b-round-32-exp/`): (w1)(w2)(w3) red, (w4)–(w7) pin green `ee15e6c`-ზე; prototype 275/275, Biome 0/8; DM-1/2/4/5/6/7 მოკლულია, DM-3 ეკვივალენტური | D-40 |")
C32='**closed** — TM-B34 (D-39), C R32 PASS, `ee15e6c`'
for fid in ['A-R19-02','RR-R28-03','RR-R30-01','RR-R31-01','RR-R31-02','A-R31-01','C-R31-01']:
    i=idx('| '+fid+' |'); cells=L[i].split(' | '); cells[-1]=C32+' |'; L[i]=' | '.join(cells)
i=idx('| B-R31-02 |'); cells=L[i].split(' | '); cells[-1]='**closed** — C R32-3 დაადასტურა: SM-9 ეკვივალენტურია |'; L[i]=' | '.join(cells)
rows=[
"| RR-R32-01 | low | batch filter-ში `isListedPath` მთელ `files`-ს თითო path-ზე ეძებს (O(files × paths)); ერთხელ აგებული `Set` იგივე შედეგს იძლევა | signal (perf nit) |",
"| RR-R32-02 | low | `refreshSavedFileStats` folder-ის შეცვლის შემდეგ ახალ folder-ს scan-ს აკეთებს; შედეგი იყრება (ზედმეტი IPC, pre-existing) | signal (RR-R19-01 / RR-R19-03 ოჯახი; performance Saba-ს კითხვაა) |",
"| RR-R32-03 | info | `App.tsx:55` superseded return `try/finally`-მდეა და `setIsScanning(false)`-ს ტოვებს — სწორია (მხოლოდ მიმდინარე load ფლობს `isScanning`-ს) | record |",
"| RR-R32-04 | low | ძველი schema-თი დაწყებული Rescan/Open read schema re-read-ის შემდეგ სრულდება და ძველ-schema-ს მონაცემს წერს | **TM-B35** (round 33, D-40, (w3)) |",
"| RR-R32-05 | info | არქიტექტურა: სამი წესი (load id, listed path, write generation) ერთ `applyLateRead` store action-ში | signal (RR-R31-04 ოჯახი) |",
"| A-R32-01 | low | Done Open Folder B-ის `beginFolderLoad`-ის შემდეგ და `setFiles(B)`-მდე: `loadId` მიმდინარეა, `allFiles` ჯერ A-სია → A-ს schema re-read B-ის `metadata`-ს ცვლის, reject-ზე stale toast (A: medium) | **TM-B35** (round 33, D-40, (w1)(w2)); B-მ red-ით დაადასტურა, severity low |",
"| A-R32-02 | info | single save-ში `skipSyncRef` დგება, როცა `isListedPath` false-ია | record: B-ის explore ტესტმა შიდა მდგომარეობა გაიმეორა, ხილული ეფექტი არ არის (b click → B-ის ფორმა) |",
"| C-R32-01 | info | (s1) პარალელურ load-ზე ერთხელ 5000 ms timeout-ით ჩავარდა; (v9) 50 ms poll-ზეა დამოკიდებული | record (A-R31-02-თან ერთად) |",
"| B-R32-01 | info | D-40-ით Done მიმდინარე load-ის დროს editor-ს ღიად ტოვებს load-ისა და re-read-ის დასრულებამდე (C-R27-01 კლასი) | record; C ზომავს R33-5-ში |",
"| B-R32-02 | info | ეკვივალენტური mutant DM-3: `folderLoadId` ლოდინამდე აღებული — ლოდინის დროს დაწყებული load უკვე ახალი schema-თი კითხულობს | record |",
]
i=idx('| B-R31-02 |')
for k,r in enumerate(rows): L.insert(i+1+k,r)
i=idx('| D-39 |'); L[i]=L[i].replace('| planned R32 (TM-B34) |','| verified (C R32 PASS), published `ee15e6c` (TM-B34) |')
L.insert(i+1,"| D-40 | schema re-read მიმდინარე folder load-ს ელოდება (TM-B35, მხოლოდ renderer). `handleSchemaChanged` ჯერ `await waitForFolderLoadIdle()`-ს იძახებს (module-level: `isScanning` false → მაშინვე; სხვა შემთხვევაში store-ის პირველ ცვლილებაზე, სადაც `isScanning` false-ია, subscribe → unsubscribe), შემდეგ `files`-ს და `folderLoadId`-ს `useFileStore.getState()`-დან იღებს (არა render closure-ის `allFiles`-დან) და ამ path-ებს მიმდინარე schema-თი კითხულობს. D-39(b) guard, D-33, D-34 და toast-ები უცვლელია. რატომ ლოდინი და არა გამოტოვება: ძველი schema-თი დაწყებული load-ის შემდეგ მხოლოდ re-read მოიტანს ახალ ველს (RR-R32-04, DM-4). რატომ არა `files`-ის identity: save-ის stats refresh `files`-ს ცვლის ((w7), DM-5). ეფექტი: Done მიმდინარე load-ის დროს editor-ს load-ის დასრულებამდე ღიად ტოვებს (B-R32-01). K-4 კონტრაქტს არ ეხება | planned R33 (TM-B35) |")
open(p,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
