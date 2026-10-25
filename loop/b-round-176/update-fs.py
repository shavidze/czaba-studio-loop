p='feature-status.md'; s=open(p).read()
old='განახლდა: 2026-10-25 · ავტორი: B (round 175 → round 176 დაგეგმვა, D-29z141)'
assert old in s; s=s.replace(old,'განახლდა: 2026-10-25 · ავტორი: B (round 176 → round 177 დაგეგმვა, D-29z142)')
anchor='5b-2b-ის რეცეპტი (საზღვარი + `foreground/20`).'
assert s.count(anchor)==1, s.count(anchor)
add=anchor+('\n- **Round 176 (DUX-R-5b-2a) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 176 გამოქვეყნდა `ff3f710`. DUX-R-5b-2a — **მზადაა**; A-R175-DETAIL-SEP-ACCENT — დახურულია.** '
 'CC-ONSTATE (Mute ჩართული rgb(163,155,142), Solo ჩართული rgb(236,230,218), mixed — `foreground/40` ნახევარი; hover/press = rest), NO-BRASS-ONSTATE (0 `--disable-lcd-text`-ით; ჩვეულებრივ LCD რეჟიმში ასოების კიდეზე subpixel ფერი ჩანს, off ღილაკებზეც — ეს text rendering-ია, არა ფერის token), '
 'SEP-HOVER (rgb(129,125,118), 0 სპილენძისფერი პიქსელი, 4.49), CONTRAST (Mute 6.30–7.06, Solo 13.94–15.62, mixed ნახევარი 3.32, ასო 4.20), FUNC-SMOKE (Master Mute → output 0), ENV-VIS, RV1 — PASS (`c-round-176.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). '
 '**Round 177 (D-29z142): DUX-R-5b-2b** — რეჟიმის ღილაკები ნეიტრალური ხდება: Loop, Delete (range-ით), Follow (on / paused), მეტრონომი, Snap, Env, Waveform Zoom, loop brace და მისი წარწერა, ბიბლიოთეკის Preview/Stop და „previewing“ წარწერა. '
 'ჩართულ მდგომარეობას **საზღვარი** (`border-foreground`, 13.94–15.62:1) აჩვენებს; `foreground/20` შევსება მეორეხარისხოვანია (ფონთან 1.66–1.76 — ინფორმაციულად). StudioWorkspace-ში მხოლოდ 3 ხაზი იცვლება. '
 'დამატებით gate-176 S1: `affordance-colour-ui`-ში ბრუნდება ორი დამცავი დათვლა (Export dialog-ის K7 radio-ები და Lane-ის ghost-ები). **⚠ ვეტოს შესაძლებლობით (D-29z142):** საზღვრით გამოხატული on-state (შევსება მხოლოდ დამხმარე), Follow პირველივე ჩატვირთვაზე ჩარჩოთი, Follow paused — წყვეტილი ჩარჩო, '
 'ნეიტრალური Preview და „previewing“, ჩართული loop brace `foreground`-ში, mixed Solo-სთვის შევსების ზღვარი არ ემატება (C-R176-MIXED-VS-OFF-FILL 2.96 — განსხვავებას საზღვარი ქმნის).')
s=s.replace(anchor,add,1)
old='**DUX-R-5b-2a — მუშავდება** (mixer-ის Mute/Solo on-state-ები + A-R175-DETAIL-SEP-ACCENT; Round 176, D-29z141), **DUX-R-5b-2b — არ დაწყებულა** (რეჟიმის ღილაკები)'
assert old in s, 'vis'
s=s.replace(old,'**DUX-R-5b-2a — მზადაა** (Round 176, C PASS `browserVerified`, `ff3f710`; `c-round-176.json`), **DUX-R-5b-2b — მუშავდება** (რეჟიმის ღილაკები + gate-176 S1; Round 177, D-29z142)',1)
open(p,'w').write(s); print('ok')
