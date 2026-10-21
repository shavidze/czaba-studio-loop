import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
anchor = '**D-29z38 — Round 72-ის შედეგი; Round 73: C-R72-01 (SRW-16 ეტაპი 1-ის ბაგი).**'
assert t.count(anchor) == 1
block = '''**D-29z39 — Round 73-ის შედეგი; Round 74: SRW-16 (FB-10) ეტაპი 2a — მარკერის გადატანა და მარკერის მენიუ.**

C round 73 (`tmp/studio-real-loop/c-round-73.md`, `c-round-73.json`) — **PASS, `browserVerified: true`**, ბაგები არ არის. Root-მა გამოაქვეყნა `6b574e8` (რაუნდები 72–73, ორივე remote, `gates/gate-round-73.json`; review 8.5/10, COMMIT OK; verify 103 ფაილი / 1744 ტესტი). SRW-16 ეტაპი 1 დაიხურა C-ის ბრაუზერის მტკიცებულებით. fake-Bearer 403 — BLOCKED (backend ღრუბელში მიუწვდომელია), ღია მტკიცებულებაა backend-იანი შემოწმებისთვის.

- **R1 — რიგი:** ღია Critical/High ბაგი არ არის; რეგრესიის რაუნდი 2026-10-24-დან. SRW-16 ეტაპი 2 ორ ქვეეტაპად იყოფა owner-ების მიხედვით: **2a (Round 74)** — მარკერის ხაზი (გადატანა, მენიუ); **2b (Round 75, დაგეგმილია, არ გადადებულა)** — კლიპების/range-ის/playhead-ის snap მარკერებზე (Live 12 §6.7) და Ctrl+←/→ (macOS — Option+←/→, Live 12 §6.9) კლიპის კიდეებზეც; ის `grid.ts`-ს, clip-ს, lane-ს, loop brace-სა და workspace-ის key handler-ს ეხება. ფარგლები არ მცირდება.
- **R2 — გადატანა:** დაჭერა flag-ს ირჩევს და ფოკუსს აძლევს (`preventDefault`-ის გამო — პირდაპირ `focus()`; ეს A-R73-ის Safari-ს სიგნალსაც ხურავს); 3 px-მდე — click (jump/ორმაგი click უცვლელია); შემდეგ `resolveGridTime` (Snap → ბადე, Alt → თავისუფლად, Snap გამორთული → ms), 0-ზე შეზღუდვა, პროექტის ბოლოს მიღმა დასაშვებია. Preview `previewArrangement`-ით, release — ერთი `Move Marker`; ჟესტი `claimPointerGesture`-ით. drag-ის შემდეგ click/dblclick არ მოქმედებს. ისრები ფოკუსირებულ flag-ზე: ბადის ხაზი ან 0.1 წმ, `stopPropagation` (მონიშნული კლიპი არ იძვრის). სხვა მარკერთან დამთხვევა — უარი (Cut Time-ის merge მხოლოდ იქ რჩება). `moveMarker` ალაგებს დროით. `scheduleKey` არ იცვლება — resync არ ხდება.
- **R3 — მენიუ:** მარჯვენა click / Shift+F10 / ContextMenu — „სახელის შეცვლა (F2) / დაკვრა აქედან / წაშლა (Delete)“; მოქმედება მარჯვენა click-ით არჩეულ მარკერზეა. ქცევა grid-მენიუს მსგავსია (viewport-ში clamp, გარე დაჭერის შთანთქმა, Escape → focus flag-ზე). `armGridMenuDismissClickSwallow` ექსპორტდება (ვიწრო ნებართვა), ლოგიკა არ დუბლირდება.
- **Ableton (Live 12 §6.4, B-ის შენახული capture 2026-10-21):** locator-ის გადატანა drag-ით/ისრებით — დადასტურებული; ნაბიჯის ზომა, ბადეზე snap, დამთხვევა — დაუდასტურებელი (CZABA-ს არჩევანი); locator-ის context menu არსებობს, მაგრამ სხვა პუნქტებით (Edit Info Text, Loop to Next Locator, Set Song Start Time Here) — CZABA-ს მენიუ შეგნებული განსხვავებაა (FB-10-ის მოთხოვნა). scrub area-ს „Add Locator“ — სიგნალი (MARKER-STRIP-CONTEXT-ADD), არ იგეგმება.
- **Root review 73:** S1 (macOS Ctrl+←/→) → ეტაპი 2b; S2 (aria-keyshortcuts) → Round 74, `aria-current` რჩება; S3–S6 → Low-ების ჯგუფი. Architecture note (`isSelfHandledKeyTarget`) — ARCH-CHECKPOINT-SRW14-PREFS (e)-ს დაემატა; შეზღუდული frontend-architect checkpoint-ის თხოვნა root-ს SRW-16-ის საზღვარზე (ეტაპი 2b-ის შემდეგ), არ აჩერებს.
- **შემდეგ:** Round 75 — ეტაპი 2b, შემდეგ SRW-17…SRW-20, Low-ები, SRW-21, სრული რეგრესია, T12.

'''
t = t.replace(anchor, block + anchor)
old_row_prefix = '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 72 (ეტაპი 1), შემდეგ ეტაპი 2 |'
assert t.count(old_row_prefix) == 1
start = t.index(old_row_prefix); end = t.index('\n', start)
t = t[:start] + '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 72–73 (ეტაპი 1, C PASS, `6b574e8`), 74 (2a), 75 (2b) | D-29z37/D-29z38: ცალკე მარკერების ხაზი, დამატება სახელით, გადასვლა, დაკვრა მარკერიდან, წინა/შემდეგი, F2, Delete, Cut Time-ის remap. D-29z39: 2a — გადატანა drag/ისრებით და მენიუ; 2b — snap მარკერებზე, Ctrl/Option+←/→ კლიპის კიდეებზე |' + t[end:]
open(p, 'w', encoding='utf-8').write(t)
print('ok')
