P='feature-status.md'
s=open(P,encoding='utf-8').read()
old_hdr='განახლდა: 2026-10-25 · ავტორი: B (round 171 → round 172 დაგეგმვა, D-29z137)'
assert old_hdr in s
s=s.replace(old_hdr,'განახლდა: 2026-10-25 · ავტორი: B (round 172 → round 173 დაგეგმვა, D-29z138)')
lines=s.split('\n')
idx=[i for i,l in enumerate(lines) if l.startswith('- **Round 171 (V-3c-4c-3) — C PASS')][0]
new=("- **Round 172 (V-3c-5a) — C PASS, `browserVerified: true`, `realVerified: true`; gate 172 გამოქვეყნდა `3810816`. V-3c-5a — **მზადაა**.** "
"RADIUS-V3C5A (P1–P6 — 10 px ოთხივე კუთხეზე ორივე ზომაზე; მენიუს სტრიქონები 6 px; ვიდეო და waveform მომრგვალებულ კუთხეზე იჭრება), BOX-V3C5A (0.00 px round 171-თან), RV1-V3C5A (სხვაობა 0), FUNC-SMOKE-V3C5A (Set selection, ჯგუფის მიზეზები, მცურავი ვიდეო, Grid/Marker მენიუები) — PASS (`c-round-172.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
"ძველი Low-ები → `deferred_low_polish`: C-R172-01 (1280-ზე ჯგუფის reason-ის ტექსტი P2 ყუთის ქვედა საზღვარს 4 px-ით კვეთს — მიზეზი გადატანაა, არა radius), C-R172-02 (Set selection footer-ს ხაზს უმატებს და Clip details 20 px-ით ხტება). "
"**Round 173 (D-29z138): V-3c-5b** — Overview: root, outline და frame ერთად → 10 px (R25; B-ის probe: max zoom-ზე frame 27.05 / 18.59 px — 20 px-ზე ვიწრო frame კაფსულად იქცევა, ეს მიღებული trade-off-ია); transport-ის timecode readout → 8 px (R26); ბიბლიოთეკის preview waveform → 8 px (R27); `← CZABA` ბმული რჩება 6 px (R28). "
"**⚠ ვეტოს შესაძლებლობით (D-29z138):** R25 (Overview 10 px, ვიწრო frame — კაფსულა; ალტერნატივა არ არის min-w, რადგან ხილულ დიაპაზონს შეცვლიდა), R26 (readout 8 px; ალტერნატივა — 6 px chip), R27 (preview wave 8 px), R28 (ბმული 6 px). "
"Tech Lead-ის ხელით შემოწმება: GATE172-SAFARI-VIDEO-RADIUS (Safari-ში მცურავი ვიდეოს კუთხეები).")
lines.insert(idx+1,new)
s='\n'.join(lines)
old='**V-3c-5a — მუშავდება** (`--radius-panel` token; Detail panel-ის ყუთები, video dock-ის ჩარჩოები, Grid/Marker მენიუები; Round 172, D-29z137). შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა, **V-3c-5b** — არ დაწყებულა (Overview: root, outline და frame ერთად 10 px, OV1; დარჩენილი 6 px კონტროლები: transport-ის timecode l.159, ბიბლიოთეკის preview waveform l.251, `← CZABA` l.2197)'
assert old in s, 'row'
s=s.replace(old,'**V-3c-5a — მზადაა** (Round 172, C PASS `browserVerified`, `3810816`; `c-round-172.json`). **V-3c-5b — მუშავდება** (Overview: root, outline და frame ერთად 10 px, OV1; transport-ის timecode l.159 და ბიბლიოთეკის preview waveform l.251 → 8 px; `← CZABA` l.2197 რჩება 6 px; Round 173, D-29z138). შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა')
open(P,'w',encoding='utf-8').write(s)
print('ok')
