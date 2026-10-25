P='feature-status.md'
s=open(P,encoding='utf-8').read()
old_hdr='განახლდა: 2026-10-25 · ავტორი: B (round 172 → round 173 დაგეგმვა, D-29z138)'
assert old_hdr in s
s=s.replace(old_hdr,'განახლდა: 2026-10-25 · ავტორი: B (round 173 → round 174 დაგეგმვა, D-29z139)')
lines=s.split('\n')
idx=[i for i,l in enumerate(lines) if l.startswith('- **Round 172 (V-3c-5a) — C PASS')][0]
new=("- **Round 173 (V-3c-5b) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 173 გამოქვეყნდა `02c08fd`. V-3c-5b — **მზადაა**; V-3c-5, V-3c და V-3 სრულდება.** "
"RADIUS-V3C5B (Overview root/outline/frame 10 px; 1280-ზე ვიწრო frame-ის რეალური radius 9.30 px — კაფსულა; readout და preview wave 8 px; `← CZABA` 6 px), OV-CORNERS (notch არ არის), BOX 0.00 px, RV1 სხვაობა 0, FUNC-SMOKE (მათ შორის მზად არმყოფი wave-ის click) — PASS (`c-round-173.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
"C-ის შენიშვნები (info, ძველი): N1 — Overview-ზე მაუსის click focus ring-ს აჩენს (პროდუქტის კითხვა), N2 — playhead x=0-ზე frame-ის მარცხენა საზღვარს ფარავს, N3 — exit ბმულის ring outline-ით იხატება. "
"**Round 174 (D-29z139): DUX-R-5a** — ფერის ერთი წესი, ნაწილი 1: content ნეიტრალური ხდება — კლიპის waveform (აუდიო და ვიდეო) და detail waveform → `muted/70` (R30), ვიდეო კლიპის სპილენძისფერი ფონი/სათაური → ნეიტრალური (R31), ვიდეოს fade-ის ramp-ები → `foreground` (R32), Overview-ს ზოლები → ნეიტრალური კიბე (R33). სპილენძი რჩება მხოლოდ მონიშვნაზე, playhead-ზე, focus-ზე და preview-ს დაკრულ ნაწილზე (K1–K6). SABA-B-1-ის envelope-ის კონტრასტი ხელახლა მოწმდება (ENV-VIS). "
"**⚠ ვეტოს შესაძლებლობით (D-29z139):** R30 (waveform `muted/70`, 3.76:1), R31 (ვიდეო აუდიოსგან მხოლოდ სიღიავით და `Film` იკონით გამოირჩევა — ფერით აღარ), R32, R33, K5 (preview-ს დაკრული ნაწილი სპილენძად რჩება, როგორც დაკვრის პროგრესი). "
"**DUX-R-5b** (დარჩენილი სპილენძის საიტები: fader-ის thumb-ები, fade handle-ები, trim hover, on-state ღილაკები, `text-brand` ეტიკეტები, StudioWorkspace) — შემდეგი ეტაპი; DUX-R-5 მზადაა მხოლოდ 5b-ის C PASS-ის შემდეგ. "
"Architecture checkpoint-ის განახლებული მოთხოვნა: `b-round-173-checkpoint-request.md` (არ ბლოკავს).")
lines.insert(idx+1,new)
s='\n'.join(lines)
old='**V-3c-5b — მუშავდება** (Overview: root, outline და frame ერთად 10 px, OV1; transport-ის timecode l.159 და ბიბლიოთეკის preview waveform l.251 → 8 px; `← CZABA` l.2197 რჩება 6 px; Round 173, D-29z138). შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა; Q-V3C5-MODAL-RADIUS — ელოდება მომხმარებელს, **DUX-R-5** (ფერის ერთი წესი; დამტკიცდა 2026-10-25; ცალკე ეტაპი M1-მდე; SABA-B-1-ის კონტრასტი ხელახლა მოწმდება)'
assert old in s, 'row'
s=s.replace(old,'**V-3c-5b — მზადაა** (Round 173, C PASS `browserVerified`, `02c08fd`; `c-round-173.json`) → V-3c და V-3 სრულია. Q-V3C5-MODAL-RADIUS — ელოდება მომხმარებელს. **DUX-R-5** (ფერის ერთი წესი; დამტკიცდა 2026-10-25): **DUX-R-5a — მუშავდება** (content ნეიტრალური: waveform-ები, ვიდეოს ფონი, detail waveform, Overview-ს ზოლები; ENV-VIS ხელახლა; Round 174, D-29z139), **DUX-R-5b — არ დაწყებულა** (დარჩენილი არარეზერვირებული სპილენძის საიტები, StudioWorkspace-ის ჩათვლით); შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა')
open(P,'w',encoding='utf-8').write(s)
print('ok')
