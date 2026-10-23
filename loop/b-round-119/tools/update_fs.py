import sys
p = '/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
t = open(p, encoding='utf-8').read()
lines = t.split('\n')
assert lines[2].startswith('განახლდა: 2026-10-23 · ავტორი: B (round 118 → round 119')
lines[2] = 'განახლდა: 2026-10-23 · ავტორი: B (round 119 → round 120 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
assert lines[18].startswith('- **T12 ეტაპი 3b — ბაგია')
lines[18] = ('- **T12 ეტაპი 3b (ჯგუფის Volume dB-ში + Shift-ით ზუსტი drag) — მზადაა (Round 118 ბრაუზერი + Round 119 C PASS `browserVerified`, გამოქვეყნდა `4090f6e`).** '
  'Round 119 (`c-round-119.json`): T119-TARGETED 452/452, SH-MASTER (Shift −2.5 vs plain −27.5) და GV-DRAG (−25.0 dB) 1440×900-სა და 1280×720-ზე; app-ის კოდი round 118-ის შემოწმებულის იდენტურია, ამიტომ round 118-ის ბრაუზერის სტრიქონები ძალაში რჩება. C-R118-01 და A-R118-REVIEW-DOC100-L69 დაიხურა. '
  'ახალი სიგნალები: MASTER-FINE-STEP (ABLETON-EXPERT-REVIEW), SHIFT-FINE-DISCOVERABILITY (DESIGN-UX-REVIEW). C-R119-01 (პროცესი): untracked ფაილის რედაქტირებამდე მისი ასლი ინახება.')
lines.insert(19, ('- **T12 ეტაპი 4a — მუშავდება. Round 120 (D-29z85):** waveform-ის სიმაღლე = წყაროს peak × კლიპის Clip Gain წრფივად (`10^(dB/20)`), კლიპის სიმაღლით შეზღუდული; ხაზზეც და detail panel-შიც; drag-ის დროს ცოცხლად; Undo ზუსტად აბრუნებს. '
  'Track/ჯგუფის Volume, Master, Pan, fade-ები და envelope ნახატს არ ცვლის; აუდიო არ იცვლება. '
  'ეტაპი 4b (Waveform Vertical Zoom, Test 7) — რეგრესიის რაუნდის შემდეგ; T12 V1 მხოლოდ 4b-ის C PASS-ით სრულდება. **Round 121 (დაგეგმვა 2026-10-24 UTC-ზე ან შემდეგ) რეგრესიის რაუნდია.**'))
t = '\n'.join(lines)
old_row_start = '| T12-GAIN-VOLUME | **მუშავდება** — ეტაპი 1 **მზადაა**'
i = t.index(old_row_start)
j = t.index('| T12-ის gate გაიხსნა', i)
new_status = ('| T12-GAIN-VOLUME | **მუშავდება** — ეტაპი 1 **მზადაა** (Round 114, `38c0e21`); ეტაპი 2 **მზადაა** (Round 115, `d5de68f`); '
  'ეტაპი 3a **მზადაა** (Round 116–117, `9cb820b`); ეტაპი 3b **მზადაა** (Round 118–119 C PASS `browserVerified`, `4090f6e`); '
  'ეტაპი 4a — **მუშავდება** (Round 120, D-29z85: waveform Clip Gain-ს აჩვენებს); 4b (vertical zoom) — **არ დაწყებულა** (რეგრესიის რაუნდის შემდეგ); 5+ — **არ დაწყებულა** (T12-ADVANCED) ')
t = t[:i] + new_status + t[j:]
t = t.replace('→ 4 — waveform-ზე gain-ის ჩვენება + vertical zoom (T12.18/19) →', '→ 4a — waveform-ზე Clip Gain-ის ჩვენება (T12.19) → 4b — Waveform Vertical Zoom (T12.18, Test 7) →', 1)
open(p, 'w', encoding='utf-8').write(t)
print('ok')
