p = 'feature-status.md'
s = open(p, encoding='utf-8').read()
old_hdr = 'განახლდა: 2026-10-26 · ავტორი: B (round 179 → round 180 დაგეგმვა, D-29z145)'
assert old_hdr in s
s = s.replace(old_hdr, 'განახლდა: 2026-10-26 · ავტორი: B (round 180 → round 181 დაგეგმვა, D-29z146)')
lines = s.split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('- **Round 179 (C-R178-BADGE-SELECTOR')][0]
new = (
    "- **Round 180 (DUX-R-5b-3b: drag-ის უკუკავშირი და R35 import/Add) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 180 გამოქვეყნდა `59d4bab`. DUX-R-5b-3b — **მზადაა**; **DUX-R-5 (ერთი ფერის წესი) — მზადაა** (5a, 5b-1, 5b-2a, 5b-2b, 5b-3a, 5b-3b — ყველა C PASS); B-R174-ACCENT-EQ-BRAND, C-R179-DOC147-STALE — დახურულია.** "
    "T180-TARGETED 249/249, CC-DRAG (ვალიდური rgb(236,230,218), დაბლოკილი rgb(163,155,142), რეალური drag-ით; ფაილის drag — სინთეზური DragEvent რეალურ Chromium-ში), CC-R35 (ჩარჩო rgb(115,107,96), ±0 px), NO-BRASS-DRAG 0 px, CONTRAST-DRAG (15.62 / 7.06 / 2.21 / 3.50), BEHAVIOUR-DRAG, INVENTORY-EXIT (56 token, 0 unmapped), ENV-VIS 12/12, RV1 (ცვლილება მხოლოდ import/Add-ის ყუთებში), G180-3, FUNC-SMOKE (tap 0.297) — PASS (`c-round-180.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
    "B-ის გადაწყვეტილებები (ვეტოს შესაძლებლობით): N1-ის სტრუქტურული lookup-ები მიღებულია (ფერის class-ით selector — არა); K8 playhead-ის mask მიღებულია, რეგრესიის რაუნდში ერთი ხელახალი scan playhead-ის გადაწევით. "
    "**Round 181 (D-29z146): M1 — Play მრგვალი, მხოლოდ იკონით.** Transport-ის Play/Pause ღილაკი 96×32-დან 32×32 წრე ხდება, ტექსტი ქრება (lucide Play/Pause რჩება), სახელი `Play`/`Pause` უცვლელია, title `Play (Space)`/`Pause (Space)`. "
    "მეზობლები (Back to start … Loop) 64 px-ით მარცხნივ იწევს; მარჯვენა ჯგუფი, რიგის სიმაღლე და ქვემოთ ყველაფერი უცვლელია (B-ის პროგნოზი `b-round-180/out/transport-probe.json`). "
    "C ამოწმებს ფორმას, ფერს, კონტრასტს, focus-ს, განლაგებას HEAD-თან, რეალურ playback-ს (click და Space) და ხელმისაწვდომობას. **⚠ ვეტოს შესაძლებლობით:** R38 (title Space-ის მინიშნებით), R39 (accessible name უცვლელი), R40 (32×32, იკონი 16 px). "
    "Frontend-architect-ის ახალი შეზღუდული მოთხოვნა DUX-R-5-ის საზღვარზე: `b-round-180-checkpoint-request.md` (არ აჩერებს; fallback (c)). შემდეგი დაგეგმვა 2026-10-27-დან — რეგრესიის რაუნდი (მოსალოდნელია 182), მერე M3."
)
lines.insert(idx + 1, new)
s = '\n'.join(lines)
old = ("**DUX-R-5b-3b — მუშავდება** (Round 180, D-29z145: Lane ghost / drop ring / hint / R35; ეტაპის ბოლოს INVENTORY-EXIT), **DUX-R-5 — მუშავდება** (მზადაა Round 180-ის C PASS-ის შემდეგ); "
       "შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა, M1, M3, M4, ROOT-RECON-GRID-HARNESS (ტესტის helper, ეტაპის ბოლოს).")
assert old in s, 'row'
s = s.replace(old, "**DUX-R-5b-3b — მზადაა** (Round 180, C PASS `browserVerified`, `59d4bab`; `c-round-180.md`), **DUX-R-5 — მზადაა** (INVENTORY-EXIT 0 unmapped); "
              "**M1 — მუშავდება** (Round 181, D-29z146: Play მრგვალი, მხოლოდ იკონით); შემდეგ რეგრესიის რაუნდი (2026-10-27-დან), M3, M4, ROOT-RECON-GRID-HARNESS (ტესტის helper, ეტაპის ბოლოს).")
old2 = 'M1/M3/M4 — **არ დაწყებულა**.'
assert old2 in s, 'm'
s = s.replace(old2, 'M1 — **მუშავდება** (Round 181); M3/M4 — **არ დაწყებულა**.', 1)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
