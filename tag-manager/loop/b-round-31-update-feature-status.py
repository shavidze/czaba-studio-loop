import re
p='feature-status.md'
L=open(p,encoding='utf-8').read().split('\n')
def idx(prefix):
    r=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(r)==1,(prefix,r); return r[0]
# header
L[2]=("განახლდა: 2026-10-27, B round 31. round 31 **PASS** (C R31-1…R31-6, realVerified=true, ახალი ბაგი 0). TM-B33 (D-38) → **done**, root gate published `7355d78` (round 31), review COMMIT OK (3 low + არქიტექტურის შენიშვნა). ეს არის round 32-ის baseline. "
 "round 32 = **TM-B34** (D-39, low): გვიანი re-read-ები folder switch-ის შემდეგ — (a) save-ის re-read ძველი folder-ის path-ს ახალი folder-ის `metadata`-ში ამატებს (RR-R28-03 / A-R19-02 / RR-R30-01); (b) schema-ს re-read (`handleSchemaChanged`) ახალი folder-ის მთელ `metadata`-ს ძველით ცვლის და stale toast-ს აჩვენებს (A-R31-01); (c) superseded drop schema-ს ლოდინის შემდეგ მაინც იძახებს `scanFolder`-ს (RR-R31-02). "
 "B-მ red-ად reproduce გააკეთა `7355d78`-ზე (`b-round-31-exp/`: 8 red, 3 green pin; prototype 268/268; SM-1…SM-8 მოკლულია, SM-9 ეკვივალენტურია). round 30-ის „Next“-ის hint (save `folderLoadId`-ით) **არასწორია**: SM-3 D-35-ის (r1)(r2)(r3)(r6)(r7)(k6)-ს ამტვრევს (Rescan-იც იღებს load id-ს) → D-39 იყენებს „path ჯერ კიდევ `files`-შია“ წესს. სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
para=("**round 31 დახურულია (C PASS, R31-1…R31-6, realVerified=true, ახალი ბაგი 0):** ownership: მხოლოდ 8 owned path; src diff ზუსტად D-38-ია. `bf83c7d` src + A-ს ტესტები: 241/16 ((o1)–(o7), (o9)–(o15) symptom-ზე, (o16)/(f1) missing export-ზე, (o8) მწვანე); A-ს tree 257/257 (14 ფაილი), თითოეული ცალკე 1 passed. GM-1…GM-19 + დამატებითი GM-7b მოკლულია მოსალოდნელი killer-ებით. gate: verifyCommand exit 0, Biome 0/8 იგივე სია, 257/93/7, `--retries=0` 7/7. "
 "real app ორ build-ზე (delay/reject/scan harness): L, J, S, C სცენარებში ძველი build ყველა symptom-ს აჩვენებს, ახალი — არცერთს (Close-ზე prompt 53 ms-ში). sha256 უცვლელია, music-metadata `exif:ICAT` და ffprobe `ICAT` = `R31Slow`/`R31Fast` 8-ვე run-ში; `pageErrors` ცარიელია. drop და Rescan→Open მხოლოდ unit-ით (ნათქვამია). docs PASS. root review: medium არ არის; RR-R31-01 (test import), RR-R31-02 (App schema-wait guard), RR-R31-03 (optional simplification), RR-R31-04 (არქიტექტურა). C/A signal-ები: A-R31-01 (schema re-read folder switch-ის შემდეგ, B-მ დაადასტურა red-ით), C-R31-01 (Close pending scan/drop-ის test gap).")
L.insert(4,para); L.insert(5,'')
i=idx('| TM-B33 |')
cells=L[i].split('|')
L[i]=("| TM-B33 | ერთმანეთზე გადაფარული folder load-ები: ძველი `scanFolder`/`readMetadataChunked` შედეგი ახალ folder-ს ცვლიდა (files/metadata), stale toast, `isScanning` ადრე ქრებოდა, Close Folder-ის შემდეგ metadata ბრუნდებოდა (RR-R29-03) | **done** (round 31, C PASS, realVerified=true, `7355d78`) | "
 "C R31: 241/16 → 257/257; GM-1…GM-19 (+GM-7b) მოკლულია; gate 257/93/7, retries=0 7/7; real app L/J/S/C old symptom-ები vs new სუფთა; sha256 + ffprobe + music-metadata `ICAT=R31Slow/R31Fast` | D-38 |")
L.insert(i+1,"| TM-B34 | გვიანი re-read-ები folder switch-ის შემდეგ: save-ის re-read ძველი folder-ის path-ს ახალ `metadata`-ში ამატებს (reopen + reject-ილი read-ისას „current“-ად ჩანს); schema re-read ახალი folder-ის `metadata`-ს ძველით ცვლის + stale toast; superseded drop schema-ს ლოდინის შემდეგ მაინც scan-ს აკეთებს | in_progress (low), round 32 | B R31 red (`b-round-31-exp/`): (v1)–(v4), (v6)–(v9) red, (v5)(o17)(o18) pin green `7355d78`-ზე; prototype 268/268, Biome 0/8; SM-1…SM-8 მოკლულია, SM-9 ეკვივალენტური | D-39 |")
def setlast(prefix,newlast):
    i=idx(prefix); c=L[i].rstrip().rstrip('|').split('|'); c[-1]=' '+newlast+' '; L[i]='|'.join(c)+'|'
setlast('| RR-R29-03 |','**closed** — TM-B33 (D-38), C R31 PASS, `7355d78`')
setlast('| A-R30-01 |','**closed** — entry 12 ასახელებს (k7) (C R31-6), `7355d78`')
setlast('| RR-R30-01 |','**TM-B34** (round 32, D-39, (v4)); `folderLoadId` hint უარყოფილია (SM-3 ამტვრევს D-35-ს)')
setlast('| RR-R28-03 |','**TM-B34** (round 32, D-39, (v1)–(v4)); lock არა, listed-path წესი')
setlast('| A-R19-02 |','**TM-B34** (round 32, D-39, (v1)–(v3))')
i=idx('| B-R30-01 |')
rows=[
 "| RR-R31-01 | low | `file-store.test.ts:2-3` ერთი module-დან ორი import | **TM-B34** rider (import-ის გაერთიანება) |",
 "| RR-R31-02 | low | App `openFolder`-ის schema-wait loop `isFolderLoadCurrent`-ს არ ამოწმებს: superseded drop ≤5 s polling-ის შემდეგ ძველ folder-ს scan-ს აკეთებს (შედეგი იყრება, IPC ფუჭდება) | **TM-B34** (D-39c, (v9)) |",
 "| RR-R31-03 | info | `beginFolderLoad` `set` + `get()`; უფრო მარტივი `next = get().folderLoadId + 1` | signal (optional) |",
 "| RR-R31-04 | info | არქიტექტურა: load-ის თანმიმდევრობა სამჯერაა კოპირებული; ერთი `loadFolder(path, { onError })` helper load id-ით + schema-ready promise | signal (RR-R29-02 / RR-R30-03 ოჯახი) |",
 "| A-R31-01 | low | `handleSchemaChanged` ძველი folder-ის ფაილებს კითხულობს და მთელ `metadata`-ს ცვლის: Done → Open Folder B / Close → B-ს ფაილები Tagged-ს კარგავს, stale `Failed to read N files`. მხოლოდ ჩვენება (ცარიელი ფორმა მხოლოდ აკრეფილ ველებს წერს) | **TM-B34** (D-39b, (v6)(v7)(v8)); B-მ red-ით დაადასტურა |",
 "| C-R31-01 | low | test gap: Close Folder pending scan-ის და pending drop-ის დროს ტესტი არ აქვს | **TM-B34** pin-ები (o17)(o18) |",
 "| A-R31-02 | info | App-ის overlap ტესტებში `waitMs(100)` — load-ის ქვეშ flakiness-ის მცირე რისკი | record |",
 "| B-R31-01 | info | ფაქტი: save `folderLoadId`-ით (round 30 hint) D-35 (r1)(r2)(r3)(r6)(r7)(k6)-ს ამტვრევს; `folderPath` snapshot-ით (v5)-ს | record (D-39-ის საფუძველი) |",
 "| B-R31-02 | info | ეკვივალენტური mutant SM-9: App guard loop-ის შემდეგ (და არა შიგნით) — scan მაინც არ ხდება, განსხვავება მხოლოდ ≤5 s idle polling | record |",
]
for k,r in enumerate(rows): L.insert(i+1+k,r)
i=idx('| D-38 |')
c=L[i].rstrip().rstrip('|').split('|'); c[-1]=' verified (C R31 PASS), published `7355d78` (TM-B33) '; L[i]='|'.join(c)+'|'
L.insert(i+1,"| D-39 | გვიანი re-read-ები folder switch-ის შემდეგ (TM-B34, მხოლოდ renderer). (a) `handleSave`: write, `markPathsWritten`, stats refresh, re-read და ყველა toast უცვლელია; re-read-ის შედეგი store-ში (`updateFileMetadata`) იწერება **მხოლოდ** იმ path-ისთვის, რომელიც იმ მომენტში `useFileStore.getState().files`-შია (single: `isListedPath(path)`, batch: `savedEntries` ფილტრი). `folderLoadId`-ით არა: Rescan და იგივე folder-ის Open Folder-იც იღებს load id-ს და D-35-ს save-ის re-read სჭირდება (SM-3); `folderPath`-ით არა: parent folder, რომელიც ფაილს ისევ აჩვენებს, შენახულ მნიშვნელობას უნდა იღებდეს ((v5)). (b) `handleSchemaChanged` თავში იღებს `folderLoadId`-ს; chunk loop-ის შემდეგ, თუ `!isFolderLoadCurrent(loadId)` → return: `setMetadata`, editor-ის ცვლილება და toast არ ხდება (ყოველი შემდეგი load უკვე ახალი schema-თი კითხულობს). (c) App `openFolder`: schema-wait loop-ში ყოველი 50 ms ლოდინის შემდეგ superseded load → return (scan IPC არ ხდება). `file-store.ts` უცვლელია; D-34…D-38 უცვლელია. K-4 კონტრაქტს არ ეხება | planned R32 (TM-B34) |")
open(p,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
