P='feature-status.md'
s=open(P,encoding='utf-8').read()
old_hdr='განახლდა: 2026-10-25 · ავტორი: B (round 170 → round 171 დაგეგმვა, D-29z136)'
assert old_hdr in s
s=s.replace(old_hdr,'განახლდა: 2026-10-25 · ავტორი: B (round 171 → round 172 დაგეგმვა, D-29z137)')
lines=s.split('\n')
idx=[i for i,l in enumerate(lines) if l.startswith('- **Round 170 (V-3c-4c-2) — C PASS')][0]
new=("- **Round 171 (V-3c-4c-3) — C PASS, `browserVerified: true`, `realVerified: true`; gate 171 გამოქვეყნდა `13ad2bd`. V-3c-4c-3 — **მზადაა**, V-3c-4 სრულია.** "
"SURF-V3C4C3 (Cancel/Done — გამჭვირვალე 1 px ჩარჩო, 8 px, ფონი 5/8/12 %, 180 ms; Export — `brand` ჩარჩო და ტექსტი; reduced motion-ზე `none`), BOX-V3C4C3 (0.00 px), CONTRAST-V3C4C3 (Done/Cancel 13.24 / hover 12.35; Export 7.05 / 6.58), RV1-V3C4C3, "
"FUNC-SMOKE-V3C4C3 (რეალური WAV: RIFF/WAVE, ხანგრძლივობის სხვაობა 0, peak 1.0; Cancel რეალური render-ის დროს — „Export cancelled — no file was created.“; Done-ის ფოკუსი transport-ის Export-ზე; MP3 ბარათი; მცურავი ვიდეო: drag/ArrowRight 16 px/დაკვრა/Close/Return/Escape) — PASS ორივე ზომაზე (`c-round-171.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
"ძველი Low-ები → `deferred_low_polish`: C-R171-01 (დაჭერა დიალოგში და ხელის აშვება backdrop-ზე დიალოგს ხურავს — `Modal.tsx`, დაცული), C-R171-02 (1440-ზე render-ის დაწყებისას footer 31.8 px-ით ჩამოდის), GATE171-DONE-DISABLED-CURSOR. "
"**Round 172 (D-29z137): V-3c-5a** — პანელების 10 px: ახალი token `--radius-panel` (`rounded-panel`, R21); Detail panel-ის waveform და ჯგუფის reason ყუთი, video dock-ის placeholder და ვიდეოს ყუთი, Grid და Marker მენიუები → 10 px (R22, R23); მენიუს სტრიქონები რჩება 6 px (კონცენტრული, R23); მიმაგრებული პანელები რჩება კუთხოვანი (R22); Overview და დარჩენილი 6 px კონტროლები → V-3c-5b; `Modal.tsx` დაცულია → კითხვა Q-V3C5-MODAL-RADIUS. "
"**⚠ ვეტოს შესაძლებლობით (D-29z137):** R21 (გლობალური `rounded-panel` token), R22 (მიმაგრებული პანელები კუთხოვანი რჩება), R23 (მენიუ 10 px, სტრიქონები 6 px; ალტერნატივა 8 px). STORE-0: `cloud/run.sh` l.127–131 `mock-api/server.mjs`-ს უშვებს, თუ ფაილი არსებობს — root-ის კითხვა დაიხურა.")
lines.insert(idx+1,new)
s='\n'.join(lines)
old='**V-3c-4c-3 — მუშავდება** (Export dialog: Cancel, Done, Export, ბარათები; video dock: მცურავი ღილაკები, Return; marker-ის ჭდე — R20-ით დაიხურა; Round 171, D-29z136). შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა, V-3c-5 (პანელის 10 px; frame-ის radius root-ს უნდა ემთხვეოდეს — OV1)'
assert old in s, 'row'
s=s.replace(old,'**V-3c-4c-3 — მზადაა** (Round 171, C PASS `browserVerified`, `13ad2bd`; `c-round-171.json`) → V-3c-4 სრულია. **V-3c-5a — მუშავდება** (`--radius-panel` token; Detail panel-ის ყუთები, video dock-ის ჩარჩოები, Grid/Marker მენიუები; Round 172, D-29z137). შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა, **V-3c-5b** — არ დაწყებულა (Overview: root, outline და frame ერთად 10 px, OV1; დარჩენილი 6 px კონტროლები: transport-ის timecode l.159, ბიბლიოთეკის preview waveform l.251, `← CZABA` l.2197); Q-V3C5-MODAL-RADIUS — ელოდება მომხმარებელს')
open(P,'w',encoding='utf-8').write(s)
print('ok')
