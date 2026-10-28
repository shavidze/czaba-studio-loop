import re
P='feature-status.md'
s=open(P).read()
lines=s.split('\n')
assert lines[2].startswith('განახლდა: 2026-10-28, B round 35')
lines[2]=("განახლდა: 2026-10-28, B round 36. round 36 **PASS** (C R36-1…R36-6, realVerified=true, ერთი ახალი low finding C-R36-01). TM-B38 → **done**, root gate published `51969a2` (round 36), review COMMIT OK (0 critical/high/medium, 4 low RR-R36-01…04, 1 არქიტექტურის შენიშვნა RR-R36-05). ეს არის round 37-ის baseline. "
 "round 37 = **TM-B39** (low, C-R34-01, D-44): `setFiles` `selectedPaths`-ს ჩამოთვლილ ფაილებამდე ჭრის (prune, არა clear), რათა pending scan-ის დროს ძველ სიაზე click load-ის შემდეგ არ დარჩეს. B-ის red reproduction (`b-round-36-exp/`): (x1)–(x7) 7/7 red `51969a2`-ზე, prototype 296/296; Reference: Qt `QItemSelectionModel`, Kid3, Mp3tag (Explorer — მხოლოდ anecdotal). "
 "შემდეგი: **TM-B40** (Done/Save Tags `aria-disabled` + focus, ისრების opacity, + RR-R36-01), მერე **TM-B41** (`dom-queries` unit ტესტები, RegExp `lastIndex`, TESTING.md §6 ორი ხაზი). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.")
closed36=("**round 36 დახურულია (C PASS, R36-1…R36-6, realVerified=true):** ownership: მხოლოდ 14 owned path, frozen `--quiet` exit 0; `dom-queries.ts` B-ის prototype-ის byte-identical-ია; `git diff -w` მხოლოდ lookup-ები, import, ლოკალური helper-ის წაშლა, (e5) და (b7)/(b8). "
 "mutant-ები: SM-1, SM-2, DM-3, BM-1, DM-8 ((b5), (b7) `expected 'STALE1' to be 'B'`), BM-6 ((b8)) მოკლულია; DM-9 ეკვივალენტური; red base `3035ffc`: (b1)(b2)(b5)(b7) + (b4) Unhandled Rejection. HM-1…HM-3 (helper mutant-ები) გადარჩა, მაგრამ identity probe 257 lookup-ზე: ყველგან 1 match და იგივე element, რასაც `getByRole` → C-R36-01 (low). "
 "durations (ერთი runner, interleaved): 289/289 ×2, ყველაზე ნელი ტესტი 402/360 ms; metadata-panel-schema-change 14.2×, schema-change-during-folder-load 10.6×, schema-editor-stale-close 9.3×, reread-after-folder-switch 7.5×. gate: verifyCommand exit 0, Biome 0/8 იგივე სია, 289/93/7, `--retries=0` 7/7 (რეალური Electron xvfb-ში). docs PASS. "
 "ახალი finding-ები: C-R36-01 → TM-B41; RR-R36-01 ((b7)-ის `qtwo` assertion) → TM-B40; RR-R36-02/03/04 → TM-B41; RR-R36-05 (Biome `tests/`-ს არ ამოწმებს = TM-B06; `clickButton` helper) → signal; R36-A-01/02 latent, მიუღწეველი; R36-A-03 დახურულია (B: (b7)/(b8) mutant-ის pin-ებია, არა ცნობილი შეზღუდვა).")
lines.insert(4, closed36)
lines.insert(5, '')
s='\n'.join(lines)

def row_replace(s, rid, new):
    pat=re.compile(r'^\| '+re.escape(rid)+r' \|.*$', re.M)
    assert len(pat.findall(s))==1, rid
    return pat.sub(lambda m: new, s)

s=row_replace(s,'TM-B38',"| TM-B38 | renderer component ტესტების სიჩქარე და hygiene: საერთო `getButtonByText` helper, (e5)-ის სახელი, pin-ები (b7)/(b8), D-40/D-41 docs ფორმულირება, TESTING.md წესი 6 | **done** (round 36, `51969a2`) | C R36 PASS: ყველაზე ნელი ტესტი 402/360 ms, ოთხი ფაილი 7.5–14.2× სწრაფი, 289/289 ×2; mutant-ები მოკლულია; gate 289/93/7, `--retries=0` 7/7 | — |")
s=row_replace(s,'TM-B39',"| TM-B39 | stale selection folder-ის შეცვლის შემდეგ: pending scan-ის დროს ძველი სიის row-ზე click `selectedPaths`-ში რჩება ახალი სიის ჩატვირთვის შემდეგ (toolbar `1 selected`, row მონიშნული არ არის) | **in_progress** (low), round 37, D-44 | C-R34-01; B R36 (`b-round-36-exp/`): (x1)–(x7) 7/7 red `51969a2`-ზე, prototype 296/296, PM-1/PM-2/PM-3 მოკლულია; Reference R1–R3 (Qt, Kid3, Mp3tag) | — |")
s=row_replace(s,'TM-B40',"| TM-B40 | busy commit ღილაკები focus-ს ინარჩუნებენ და იკითხება: Done და Save Tags native `disabled`-იდან `aria-disabled` + `aria-busy`-ზე no-op guard-ით ((b2) აზრს იძენს); Active Fields-ის ისრები Applying-ის დროს ორმაგად არ ფერმკრთალდება; optional timeout არასოდეს დასრულებული `onSave`-ისთვის (Saba-ს გადაწყვეტილება); + RR-R36-01 ((b7)-ის assertion) | todo (low, UX), TM-B39-ის შემდეგ | RR-R35-01, RR-R35-04, C-R35-01, RR-R35-02, RR-R36-01; reference-first (R35 R4/R5 წყაროები) | — |\n| TM-B41 | `dom-queries` helper-ის hygiene: unit ტესტები uniqueness / ზუსტი string / trim სემანტიკაზე (HM-1…HM-3), RegExp `g`/`y` `lastIndex`, TESTING.md §6: a11y სახელის შემოწმება ისევ `getByRole`-ით, აგენტის სახელის ნაცვლად „ერთ runner-ზე გაზომილი“ | todo (low, test-only), TM-B40-ის შემდეგ | C-R36-01, RR-R36-02, RR-R36-03, RR-R36-04 | — |")

for rid in ['C-R34-02','C-R34-03','B-R34-02','C-R35-02','C-R35-03']:
    pat=re.compile(r'^(\| '+re.escape(rid)+r' \|.*\| )([^|]*)(\|)$', re.M)
    assert len(pat.findall(s))==1, rid
    s=pat.sub(lambda m: m.group(1)+'**closed** — TM-B38, C R36 PASS, `51969a2` '+m.group(3), s)
pat=re.compile(r'^(\| C-R34-01 \|.*\| )([^|]*)(\|)$', re.M)
assert len(pat.findall(s))==1
s=pat.sub(lambda m: m.group(1)+'**TM-B39** round 37 (D-44) '+m.group(3), s)

newrows=("| C-R36-01 | low | helper mutant-ები HM-1 (uniqueness), HM-2 (`includes`), HM-3 (trim-ის გარეშე) 289/289-ს გადის; დღევანდელ 257 lookup-ზე ეკვივალენტურია (identity probe); `dom-queries`-ის სემანტიკას ტესტი არ იცავს | **TM-B41** |\n"
"| RR-R36-01 | low | (b7)-ის `reads[1].schema.some(qtwo)` ალბათ ვერ არჩევს Done #1-ის და #2-ის read-ს; შედეგის შემოწმება (STALE1 არ რჩება) სწორია | **TM-B40** (იგივე ფაილს ეხება) |\n"
"| RR-R36-02 | low | helper visibility-ს არ ფილტრავს და `aria-label`-ს არ ითვალისწინებს; უსაფრთხოა unique-match-ის გამო; TESTING.md §6-ს ერთი წინადადება: a11y სახელი ისევ `getByRole`-ით | **TM-B41** |\n"
"| RR-R36-03 | low | `g`/`y` RegExp-ზე `lastIndex` call-ებს შორის რჩება; დღეს ასეთი call site არ არის (= R36-A-02) | **TM-B41** |\n"
"| RR-R36-04 | low | TESTING.md §6 აგენტს ასახელებს („B-ის გაზომვით“) | **TM-B41** |\n"
"| RR-R36-05 | info | არქიტექტურის signal: Biome მხოლოდ `src/`-ს ამოწმებს (= TM-B06); საერთო `clickButton(name)` helper ~8 suite-ის ასლს ჩაანაცვლებდა | signal (TM-B06 note) |\n"
"| R36-A-01 | low | helper შიდა whitespace-ს არ კუმშავს; მიუღწეველი დღეს (C probe) | record |\n"
"| B-R36-01 | info | pending scan-ის დროს ძველი სია clickable რჩება; ჩაკეტვა ახალი UX-ია (Saba-ს კითხვის კანდიდატი). D-44-ით ასეთი click load-ს აღარ გადაურჩება | signal / Saba-ს კითხვები |")
anchor=re.compile(r'^\| RR-R35-05 \|.*$', re.M)
m=anchor.search(s); assert m
s=s[:m.end()]+'\n'+newrows+s[m.end():]

d43=re.compile(r'^\| D-43 \|.*$', re.M); m=d43.search(s); assert m
s=s[:m.end()]+"\n| D-44 | selection ჩამოთვლილი ფაილების შიგნით რჩება (TM-B39, მხოლოდ renderer, `file-store.ts`). `setFiles(files)` `selectedPaths`-ს ახალ `files`-ში არსებულ path-ებამდე ჭრის, რიგის შენარჩუნებით; თუ არაფერი იჭრება, მასივი იგივე რჩება. load-ის დასაწყისის `clearSelection`, `selectRange`, `selectAll` და D-31 უცვლელია. უარყოფილი: apply-ზე სრული წმენდა (Rescan-ის დროს შენარჩუნებულ row-ზე განზრახ click-ს დაკარგავდა). Reference R1–R3, Deviations 1–4 (round 37 task) | planned R37 | none (მხოლოდ renderer-ის selection state) |"+s[m.end():]
open(P,'w').write(s)
print('ok')
