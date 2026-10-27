p='feature-status.md'
s=open(p,encoding='utf-8').read()
lines=s.split('\n')
assert lines[2].startswith('განახლდა: 2026-10-27, B round 28.')
lines[2]=("განახლდა: 2026-10-27, B round 29. round 29 **PASS** (C R29-1…R29-6, realVerified=true, acceptance-ის FAIL 0, 2 low finding). "
 "TM-B31 (D-36) → **done**, root gate published `20967a0` (round 29), review COMMIT OK. ეს არის round 30-ის baseline. "
 "round 30 = **TM-B32** (D-37, low): Open Folder / drop ცარიელ folder-ზე `metadata`-ს წმენდს (როგორც Rescan), + (u3) ორი reject-ილი chunk-ის ტესტი (C-R29-01). "
 "B-მ red-ად reproduce გააკეთა `20967a0`-ზე (`b-round-29-exp/`). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
lines.insert(4,("**round 29 დახურულია (C PASS, R29-1…R29-6, realVerified=true, 2 low finding, FAIL არ არის):** ownership: მხოლოდ 10 owned path. "
 "ძველი `b182557` src + A-ს ტესტები: 227/8 ((k1)–(k6), (g3), (u2) symptom-ზე); A-ს tree 235/235 (13 ფაილი). MK-1…MK-9c მოკლულია; "
 "დამატებითი EX-1 (splice, მხოლოდ ბოლო reject-ილი chunk) გადარჩა → C-R29-01. gate: verifyCommand exit 0, Biome 0/8 იგივე სია, 235/93/7, `--retries=0` 7/7. "
 "real app ორ build-ზე (harness `meta:read-batch`-ს reject-ს აკეთებს): ახალი build Rescan-ზე და იგივე folder-ის Open Folder-ზე ინარჩუნებს `Tagged`-ს და `R29Cat`-ს, აჩვენებს `Failed to read 2 files`-ს; "
 "სხვა folder-ზე row-ები ჩანს + toast; `b182557` ცლის toast-ის გარეშე. sha256 უცვლელია, ffprobe + music-metadata `ICAT=R29Cat`. docs-ის ყოველი `file:line` grep-ით სწორია. "
 "C-R29-02: D-35-ის ტექსტი „ცარიელი folder → `setMetadata({})`“ მხოლოდ Rescan-ზეა სწორი → TM-B32.\n"))
s='\n'.join(lines)
old_row=[l for l in s.split('\n') if l.startswith('| TM-B31 |')][0]
new_row=("| TM-B31 | reject-ილი folder-read chunk (D-36): `readMetadataChunked` reject-ს `failures`-ში ითვლის, მაგრამ Rescan / Open Folder / drop მას არ ამოწმებს; `applyMetadataRead` ამ path-ებს `metadata`-დან შლის (row-ები მნიშვნელობებს და `Tagged` badge-ს კარგავს, ფორმა ცარიელია), toast არ ჩანს. + `docs/bugs/001` entry 11-ის შევსება "
 "| **done** (R29), realVerified=true, `20967a0` | C R29-1…R29-6 PASS: red 227/8 → green 235/235, MK-1…MK-9c, gate 235/93/7, `--retries=0` 7/7. real app old vs new: ახალი build ინახავს `R29Cat`-ს + toast, `b182557` ცლის toast-ის გარეშე; დისკი უცვლელია (sha256, ffprobe, music-metadata) | D-36 |\n"
 "| TM-B32 | ცარიელი folder-ის Open Folder / drop ძველი folder-ის entry-ებს `metadata`-ში ტოვებს (მხოლოდ Rescan წმენდს); მოგვიანებით ამ folder-ის reject-ილი read მათ მიმდინარედ აჩვენებს. + ორი reject-ილი chunk-ის test gap (C-R29-01) "
 "| in_progress (low), round 30 | B R29 red (`b-round-29-exp/`): (x1) Open Folder empty, (x2) drop empty → `metadata` ინახავს a, b; (x3) empty → `/music` reject → stale entry-ები; (x4) Rescan empty → `{}`. prototype `else` → 239/239. მხოლოდ ჩვენება | D-37 |\n"
 "| TM-B33 | ერთმანეთზე გადაფარული folder read-ები (Rescan ორჯერ, Open Folder A → B): ბოლოს დასრულებული read იმარჯვებს, რიგის guard არ არის (RR-R29-03) | todo (low) | root review R29; B-ს red reproduction ჯერ არ არის | TM-B32 |")
s=s.replace(old_row,new_row)
lines=s.split('\n')
def setcol(prefix,newlast):
    for i,l in enumerate(lines):
        if l.startswith(prefix):
            parts=l.split(' | ')
            parts[-1]=newlast+' |'
            lines[i]=' | '.join(parts); return
    raise SystemExit('missing '+prefix)
setcol('| B-R27-01 |','**TM-B31** (round 29, D-36). **დახურულია**: C R29 PASS, `20967a0`')
setcol('| A-R28-01 |','TM-B31 entry 11 — **დახურულია** (C R29-6)')
setcol('| A-R28-02 |','TM-B31 entry 11 — **დახურულია** (C R29-6)')
setcol('| RR-R28-01 |','TM-B31: entry 11-ში ცნობილ შეზღუდვად ჩაიწერა — **დახურულია** (C R29-6); შეტყობინება/დათვლა signal-ია')
setcol('| C-R25-01 |','record — B R29 გადაწყვეტილება: სუფთა signal (defaults-only ტესტი რიგზე დამოკიდებული იქნებოდა, RR-R23-01); task არ იქნება')
s='\n'.join(lines)
anchor=[l for l in s.split('\n') if l.startswith('| C-R28-01 |')][0]
add=("\n| C-R29-01 / A-R29-01 | low | test gap: ორ reject-ილ chunk-ს ტესტი არ ამოწმებს; mutant `failedPaths.splice(0, len, ...chunk)` (`utils.ts:72`) 235/235-ს გადაურჩება | **TM-B32** (round 30, (u3)) |"
 "\n| C-R29-02 / A-R29-02 | low | D-35-ის docs/STATE_MANAGEMENT: „error და ცარიელი folder → `setMetadata({})`“; რეალურად ცარიელ folder-ს მხოლოდ Rescan წმენდს, Rescan-ის error კი მხოლოდ toast-ია | **TM-B32** (round 30, D-37: კოდი + ზუსტი ტექსტი) |"
 "\n| RR-R29-01 | low | toast `Failed to read 1 files` (FolderBrowser ×2, App) D-33-ის ტექსტს იმეორებს; (k4) ამაგრებს | record (RR-R15-04-თან ერთად: ოთხივე ადგილი + ტესტები ერთად) |"
 "\n| RR-R29-02 | info | არქიტექტურა: read → `applyMetadataRead` → toast ბლოკი სამჯერ მეორდება; ერთი `loadFolderMetadata(paths, schema)` helper file-store-ში | signal (RR-R28-05-თან); TM-B33-ის guard-ის ბუნებრივი ადგილი |"
 "\n| RR-R29-03 | low | ორი გადაფარული folder read რიგის guard-ის გარეშე: ბოლოს დასრულებული იმარჯვებს | **TM-B33** (todo; ჯერ B-ს red reproduction) |")
s=s.replace(anchor,anchor+add,1)
lines=s.split('\n')
for i,l in enumerate(lines):
    if l.startswith('| D-36 |'):
        parts=l.split(' | '); parts[-1]='**verified** (C R29 PASS), published `20967a0` (TM-B31) |'; lines[i]=' | '.join(parts)
        lines.insert(i+1,"| D-37 | ცარიელი folder სამივე folder-caller-ში `metadata`-ს წმენდს (TM-B32, მხოლოდ renderer): FolderBrowser `handleOpenFolder` და App `openFolder` (drop) `scanFolder`-ის ცარიელ შედეგზე იძახებენ `setMetadata({})`-ს, როგორც `handleRescan` უკვე აკეთებს; toast არ არის. error path-ები უცვლელია და ზუსტად დოკუმენტირდება: Open Folder / drop error → `setFiles([])` + `setMetadata({})` + toast; Rescan error → მხოლოდ toast (files და metadata რჩება). მიზეზი: Close Folder და არაცარიელი folder-ის Open Folder ძველ entry-ებს უკვე აგდებს; ცარიელ folder-ზე დარჩენილ entry-ებს მოგვიანებით reject-ილი read (D-36 keptPaths) მიმდინარედ აჩვენებდა. მხოლოდ ჩვენება. K-4 კონტრაქტს არ ეხება | planned R30 (TM-B32) |")
        break
else: raise SystemExit('no D-36')
open(p,'w',encoding='utf-8').write('\n'.join(lines))
print('ok')
