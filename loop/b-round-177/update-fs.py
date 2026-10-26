p='feature-status.md'; s=open(p).read()
old='განახლდა: 2026-10-25 · ავტორი: B (round 176 → round 177 დაგეგმვა, D-29z142)'
assert old in s; s=s.replace(old,'განახლდა: 2026-10-26 · ავტორი: B (round 177 → round 178 დაგეგმვა, D-29z143)')
anchor='C-R176-MIXED-VS-OFF-FILL 2.96 — განსხვავებას საზღვარი ქმნის).'
assert s.count(anchor)==1
add=anchor+('\n- **Round 177 (DUX-R-5b-2b) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 177 გამოქვეყნდა `cc984b6`. DUX-R-5b-2b — **მზადაა**; GATE176-S1 — დახურულია.** '
 'CC-TOGGLE (ჩართული: საზღვარი და ტექსტი rgb(236,230,218), შევსება `foreground/20`; hover/press = rest შევსებულ მდგომარეობებზე), NO-BRASS-TOGGLE (0 სპილენძისფერი პიქსელი ორივე ზომაზე), CONTRAST (საზღვარი 14.78, ტექსტი 8.59), LOOP-EDGE (3.44, 0/352), '
 'FUNC-SMOKE (Delete range + Undo, Loop, brace drag, მეტრონომი output tap-ზე 5 დარტყმა 500 ms-ით, Snap, Env, Waveform Zoom, Preview, Follow), ENV-VIS, RV1 — PASS (`c-round-177.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). '
 'A-R177-TS1-FOLLOW და A-R177-LRS3-CLASS — B-მ მიიღო (T3/Y1-ით იძულებითი; C-მ დაადასტურა, რომ დაცვა არ შესუსტდა). '
 '**Round 178 (D-29z143): DUX-R-5b-3a** — 5b-3 ორად გაიყო. 5b-3a: ტექსტური ადგილები ნეიტრალური ხდება — Detail-ის ჯგუფის რაოდენობა, Apply / 0 dB / პანელის ღილაკის hover, `← CZABA` hover, demo badge (`outline-strong` ჩარჩო + `muted` ტექსტი), Delete-ის მინიშნება (`muted`), მონიშნული კლიპების რაოდენობა, ხაზზე გადატანის უარი, ბიბლიოთეკის ფილტრი, Grid მენიუს ნიშნები, Export-ის ცარიელი პროექტის შენიშვნა, progress bar და overload გაფრთხილება. '
 'დამატებით: doc 146 → Completed (gate-177 S5) და ExportDialog-ის დაცული დათვლა 6 → 5 (C-R177-G1-562). **5b-3b (შემდეგ):** Lane-ის drop ring / hint / ghost-ები და R35 import / Add. DUX-R-5 მზადაა მხოლოდ ორივე ნაწილის C PASS-ის შემდეგ. '
 '**⚠ ვეტოს შესაძლებლობით (D-29z143):** გაფრთხილებები (უარი, ცარიელი პროექტი, overload) ნეიტრალურია და არა `warning` ფერის (Obsidian-ის `warning` #d9a35b სპილენძისფერია), Grid მენიუს ნიშნები ნეიტრალურია (on-state და არა ობიექტის მონიშვნა), demo badge `muted`, Delete-ის მინიშნება `muted`. '
 '**⚠ ვეტოს შესაძლებლობით (gate-177):** Delete range-ით ჩართული ღილაკის ჩარჩოთი ჩანს (GATE177-S1; ვარიანტები: `foreground/50` ან წყვეტილი ჩარჩო); ჩართული loop brace წინანდელზე ხმამაღალია (GATE177-S3). '
 'Follow paused-ის ცალკე accessible name და `border-color`-ის transition — `deferred_low_polish` (სულ 252).')
s=s.replace(anchor,add,1)
old='**DUX-R-5b-2a — მზადაა** (Round 176, C PASS `browserVerified`, `ff3f710`; `c-round-176.json`), **DUX-R-5b-2b — მუშავდება** (რეჟიმის ღილაკები + gate-176 S1; Round 177, D-29z142)'
assert old in s, 'vis'
s=s.replace(old,'**DUX-R-5b-2a — მზადაა** (Round 176, C PASS `browserVerified`, `ff3f710`; `c-round-176.json`), **DUX-R-5b-2b — მზადაა** (Round 177, C PASS `browserVerified`, `cc984b6`; `c-round-177.json`), **DUX-R-5b-3a — მუშავდება** (ტექსტური ადგილები; Round 178, D-29z143), **DUX-R-5b-3b — არ დაწყებულა** (Lane ghost / drop / R35)',1)
open(p,'w').write(s); print('ok')
