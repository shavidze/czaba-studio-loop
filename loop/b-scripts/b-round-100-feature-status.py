P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
t=open(P,encoding='utf-8').read()
def rep(old,new):
    global t
    assert t.count(old)==1, old[:90]
    t=t.replace(old,new,1)
rep('განახლდა: 2026-10-23 · ავტორი: B (round 99 → round 100 დაგეგმვა)','განახლდა: 2026-10-23 · ავტორი: B (round 100 → round 101 დაგეგმვა)')
lines=t.split('\n')
out=[]
for l in lines:
    if l.startswith('| SRW-12 |'):
        cells=l.split(' | ')
        l=('| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მოწმდება** (C-ის ღია ბაგი არ არის. B-R98-H1-PREVIEW-TOGGLE-HOLD დაიხურა — C round 100 PASS `browserVerified`: დაჭერილი Enter ▶ მოუსმინე-ზე preview-ს ერთხელ რთავს ორივე viewport-ზე, RMS 0.173; გამოქვეყნდა `17d944d`. B-R98-HELD-ENTER-MULTI-ADD — Round 99, `e2412db`. FOCUS-TEXT-STALE — Round 34. ფუნქციები C-ით დადასტურებულია; დარჩა Tech Lead-ის ხელით შემოწმება) | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17; `c-round-34.md` R34-TS; `c-round-99.md`; `c-round-100.md` | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Windows-ის ფონტები. R34-T(1)/(3). GATE100-S1 (Space focused toggle-ზე) — C-ის დაკვირვება Round 101-ში |')
    elif l.startswith('| B-R98-H1-PREVIEW-TOGGLE-HOLD |'):
        l='| B-R98-H1-PREVIEW-TOGGLE-HOLD | Low | **დაიხურა** — C round 100 PASS `browserVerified`: HOLD-TOGGLE ორივე viewport-ზე (4 keydown F/T/T/T → 1 click, label ერთხელ იცვლება, RMS 0.173 1.2 წმ-ზე), FRESH-TOGGLE, WAVE-REG, HOLD-PLUS-REG, HOLD-ROW-REG; AN-REVIEW (C-მ mutation-ები a, b, c გაიმეორა); გამოქვეყნდა `17d944d` | `c-round-100.md`, `c-round-100.json`, `gates/gate-round-100.json` | — |'
    elif l.startswith('| GATE99-S1-DOC087-STATUS |'):
        l=('| GATE99-S1-DOC087-STATUS | Low | **დაიხურა** — C round 100 SOURCE-UNCHANGED (doc 087 l.4), გამოქვეყნდა `17d944d` | `c-round-100.md` | — |\n'
           '| GATE100-S1-SPACE-ON-FOCUSED-TOGGLE | Low | **მოწმდება** → Round 101 SPACE-TOGGLE-OBS (კოდი არ იცვლება). B-ის probe: focused ▶ მოუსმინე-ზე Space (ერთი ან დაჭერილი) → toggle-ზე 0 click, label უცვლელი, transport Play → Pause ერთხელ (გლობალური Space = transport, D-29z64 R2). C-ის დადასტურებამდე არ იხურება | `gates/round-100/review.md` #1; `b-round-100-probe/probe-space-hold-result.json` | C |\n'
           '| GATE100-S4-DOC088-STATUS | Low | **მუშავდება** → Round 101: doc 088 l.4 | `gates/round-100/review.md` #4 | A → C (SOURCE-UNCHANGED) |\n'
           '| C-R100-N2-PREVIEW-START-FROM-ZERO | Info | ჩაიწერა — არსებული ქცევა, რეგრესია არ არის: ▶ მოუსმინე preview-ს 0-დან იწყებს, waveform — cursor-იდან. არ იგეგმება | `c-round-100.md` N2 | — |')
    elif l.startswith('| ARCH-R97-EXPORT-FOOTER-KEYBOARD |'):
        l='| ARCH-R97-EXPORT-FOOTER-KEYBOARD | Info | ღიაა, არ არის დაგეგმილი — არქიტექტურული სიგნალი (gate 97–100, keep). held-Enter-ის guard 6 ადგილზეა 4 ფაილში; gate 100-ის reviewer-ი გვთავაზობს `preventRepeatedEnterClick(event)`-ს მხოლოდ 4 native `<button>`-ისთვის (ღირებულება დაბალი). Round 101-ის GATE97-S4 ოთხივე ღილაკის guard-ს ტექსტურად ერთნაირს ხდის. B root-ს Export-ის Low-ების შემდეგ ერთ შეზღუდულ checkpoint-ს სთხოვს — დამატება (m), (g)/(j)/(k)/(l)-თან ერთად | `gates/round-97/review.md`–`gates/round-100/review.md` Architecture note; `b-round-91-checkpoint-request.md` (l), (m) | root/B |'
    elif l.startswith('| GATE97-S4-REPEAT-EQ-TRUE-NIT |'):
        l='| GATE97-S4-REPEAT-EQ-TRUE-NIT | Info | **მუშავდება** → Round 101 (D-29z66): l.542 `event.repeat === true` → `event.repeat` (ეკვივალენტური; HE1–HE7 უცვლელად მწვანე) | `gates/round-97/review.md` #4 | A → C (CLOSE-HOLD-REG) |'
    elif l.startswith('| GATE89-S3/S4/S6 |'):
        l='| GATE89-S3/S4/S6 | Low | S4 და S6 — **მუშავდება** → Round 101 (D-29z66): S4 — 16 px ზოლი footer-ის ქვეშ (B-ის გაზომვა: 1280 max scroll-ზე 16 px, 1440-ზე scroll-ის გარეშეც 16 px; `ModalBody`-ზე `pb-0` → 0), `-mx-8`/`px-8` კავშირი მიღებულია, სანამ `Modal.tsx` დაცულია; S6 — `aria-valuetext` = ხილული label. S3 (worker watchdog) — **ბაგია** → Low-ების პაკეტი | `gates/round-89/review.md`; `b-round-100-probe/probe-strip-result.json` | A → C (STRIP-1280/1440, VALUETEXT); S3 — Low-ები |'
    elif l.startswith('| A-R88-REVIEW-EDGES |'):
        l='| A-R88-REVIEW-EDGES | Low | #4 (16 px ზოლი) და `py-4` nit — **მუშავდება** → Round 101 GATE89-S4-თან ერთად. #1 (guard radio-ს rect-ს ზომავს და არა label-ს), #2 (მაუსის focus-ზეც მუშაობს), #3 (footer-ის ზრდა focus-ის შემდეგ) — **ბაგია** → ცალკე focus-scroll რაუნდი | `a-round-88.md` | A → C; #1–#3 — Low-ები |'
    out.append(l)
t='\n'.join(out)
anchor='Round 100 (D-29z65): ▶ მოუსმინე-ზე'
assert t.count(anchor)==1
new=('Round 101 (D-29z66): Export dialog-ის footer-ის Low-ები. GATE89-S4 + A-R88 #4: `ModalBody`-ზე `pb-0` და footer-ზე `py-4` — footer-ის ქვეშ 16 px ზოლი ქრება (B-ის Chromium-ის გაზომვა: 1280 max scroll-ზე და 1440-ზე scroll-ის გარეშე 16 px → 0). GATE89-S6: `<progress>`-ს `aria-valuetext` = ხილული label, `aria-live`-ის გარეშე. GATE97-S4: Close-ის guard `event.repeat`. GATE100-S4: doc 088 l.4; ახალი doc 089. ტესტები FS1, FV1, FV2 ემატება `export-dialog-footer.test.tsx`-ს (მხოლოდ დამატება). C: STRIP-1280, STRIP-1440, VIS-RENDER-REG, VALUETEXT, FOCUS-REG, CLOSE-HOLD-REG, SPACE-TOGGLE-OBS, EXPORT-REG, PX-NET, REG-HYD, G101-3. Round 100 → C PASS `browserVerified`, გამოქვეყნდა `17d944d`. შემდეგი B-ის დაგეგმვა 2026-10-24-ზე ან შემდეგ — რეგრესიის რაუნდი.\n\n')
t=t.replace(anchor,new+anchor,1)
open(P,'w',encoding='utf-8').write(t)
print('ok')
