p='feature-status.md'; s=open(p).read()
old='განახლდა: 2026-10-25 · ავტორი: B (round 174 → round 175 დაგეგმვა, D-29z140)'
assert old in s; s=s.replace(old,'განახლდა: 2026-10-25 · ავტორი: B (round 175 → round 176 დაგეგმვა, D-29z141)')
anchor='`app/components/studio/*` DUX-R-5-ის ფარგლებს გარეთაა (დაცული `studio.$productId.tsx`, SRW-21).'
assert s.count(anchor)==1, s.count(anchor)
add=anchor+('\n- **Round 175 (DUX-R-5b-1) — C PASS, `browserVerified: true`, `realVerified: true`, Critical/High/Medium 0; gate 175 გამოქვეყნდა `c53eefc`. DUX-R-5b-1 — **მზადაა**.** '
 'CC-AFFORD (6 thumb `accent-color` rgb(236,230,218); fade handle ფონი rgb(14,13,12), საზღვარი rgb(236,230,218); hover-ები `foreground/50`; scrollbar hover/press rgb(236,230,218)), NO-BRASS-AFFORD (0 px ყველა რეგიონში, ორივე ზომაზე), '
 'CONTRAST (thumb vs შეუვსებელი track 9.01 — `accent-muted`-ის წინასწარი წესი არ ამოქმედდა; trim 4.40, loop-ის კიდე 4.49, სიმაღლე 4.49, ბიბლიოთეკის სახელური 4.49, scrollbar 14.78), HANDLE-DISTINCT, ENV-VIS (12/12 ≥ 3:1), RV1 0, FUNC-SMOKE (რეალური output tap 0.3514 → 0.0012) — PASS (`c-round-175.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). '
 'C-ის Low **A-R175-DETAIL-SEP-ACCENT** — Clip details-ის სიმაღლის გამყოფი hover-ზე ისევ სპილენძისფერია (B-ის inventory-ს გამოტოვება, არა A-ის შეცდომა) → Round 176-ში სწორდება. '
 '**Round 176 (D-29z141): DUX-R-5b-2a** — 5b-2 ორად იყოფა (მოცულობა უცვლელია): **5b-2a** (ეს რაუნდი) — mixer-ის on-state-ები: Mute ჩართული (ხაზი, ჯგუფი, Master) → შევსებული ნაცრისფერი (`muted`, 6.68:1), Solo ჩართული (ხაზი, ჯგუფი) → შევსებული ღია (`foreground`, 14.78:1), ჯგუფის Solo „mixed“ → ნახევრად `foreground/40`; hover/press უცვლელი ფერით (R2); '
 'Clip details-ის გამყოფი → `foreground/50`. **5b-2b** (შემდეგი) — რეჟიმის ღილაკები (Loop, მეტრონომი, Snap, Env, Waveform Zoom, Follow, Delete range-ით, loop brace, preview): ჩართულ მდგომარეობას საზღვარი (`border-foreground`) აჩვენებს. **5b-3** — ეტიკეტები, ghost-ები, Export dialog, + ახლად ნაპოვნი საიტები (ვიდეოს იმპორტი, ბიბლიოთეკის Add, Apply / 0 dB hover). '
 'DUX-R-5 მზადაა მხოლოდ 5b-3-ის C PASS-ის შემდეგ. **⚠ ვეტოს შესაძლებლობით (D-29z141):** ნაცრისფერი Mute და ღია Solo (ერთმანეთისგან 2.21:1 — განმასხვავებელი ისევ M/S ასოა), mixed Solo-ს ღია ნახევარი, R35 (იმპორტი/Add — არა primary, ნეიტრალური ხდება), 5b-2b-ის რეცეპტი (საზღვარი + `foreground/20`).')
s=s.replace(anchor,add,1)
old='**DUX-R-5b-1 — მუშავდება** (controls/affordances; Round 175, D-29z140), **DUX-R-5b-2 — არ დაწყებულა** (on-state ღილაკები)'
assert old in s, 'vis'
s=s.replace(old,'**DUX-R-5b-1 — მზადაა** (Round 175, C PASS `browserVerified`, `c53eefc`; `c-round-175.json`), **DUX-R-5b-2a — მუშავდება** (mixer-ის Mute/Solo on-state-ები + A-R175-DETAIL-SEP-ACCENT; Round 176, D-29z141), **DUX-R-5b-2b — არ დაწყებულა** (რეჟიმის ღილაკები)',1)
open(p,'w').write(s); print('ok')
