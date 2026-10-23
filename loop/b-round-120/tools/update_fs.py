p = '/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
t = open(p, encoding='utf-8').read()
lines = t.split('\n')
assert lines[2].startswith('განახლდა: 2026-10-23 · ავტორი: B (round 119 → round 120')
lines[2] = 'განახლდა: 2026-10-23 · ავტორი: B (round 120 → round 121 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
idx = [i for i, l in enumerate(lines) if l.startswith('- **T12 ეტაპი 4a — მუშავდება')]
assert len(idx) == 1
i = idx[0]
lines[i] = ('- **T12 ეტაპი 4a (waveform Clip Gain-ს აჩვენებს) — მზადაა (Round 120, C PASS `browserVerified`, გამოქვეყნდა `0a75ba8`).** '
  '`c-round-120.json`: WG-SCALE / WG-LIVE 1440×900-სა და 1280×720-ზე, WG-CLAMP-FLOOR, WG-DETAIL, WG-MULTI, WG-MUSTNOT, WG-PLAY (0 ახალი source), WG-AUDIO (peak/RMS 0.501187 — აუდიო უცვლელია). 0 ბაგი. C-R120-01 (პროცესი): მუდმივი ცვლილება მხოლოდ Edit/Write-ით.')
lines.insert(i + 1, ('- **T12 ეტაპი 4b — მუშავდება. Round 121 (D-29z86): Waveform Vertical Zoom** — grid row-ში ახალი `½× 1× 2× 4× 8×` არჩევანი; ხაზებზე ყველა აუდიო კლიპის ნახატს ადიდებს/ამცირებს; ხმა, export, meter-ები და Undo არ იცვლება; ვიდეო და detail panel უცვლელია; reload → `1×`. '
  'რეგრესიის რაუნდი ჯერ არ დამდგარა (2026-10-23 23:26 UTC, 2 დღე). 4b-ის C PASS-ით **T12 V1 სრულდება**; **round 122 რეგრესიის რაუნდია**, შემდეგ ABLETON-EXPERT-REVIEW. '
  'Tech Lead-ისთვის (არ ბლოკავს): რეალურ Chrome-ში გამოსადეგია თუ არა `appearance-none` არჩევანი ისრის გარეშე (WAVEFORM-ZOOM-DISCOVERABILITY, DESIGN-UX-REVIEW).'))
t = '\n'.join(lines)
old = "ეტაპი 4a — **მუშავდება** (Round 120, D-29z85: waveform Clip Gain-ს აჩვენებს); 4b (vertical zoom) — **არ დაწყებულა** (რეგრესიის რაუნდის შემდეგ);"
assert t.count(old) == 1
t = t.replace(old, "ეტაპი 4a **მზადაა** (Round 120 C PASS `browserVerified`, `0a75ba8`); 4b (Waveform Vertical Zoom) — **მუშავდება** (Round 121, D-29z86; V1-ს ხურავს; შემდეგ რეგრესიის რაუნდი);", 1)
old2 = "სიგნალები: TRACK-VOLUME-BOOST, TRACK-VOLUME-NUMERIC-FIELD, MIXER-MULTI-TRACK, TRACK-VOLUME-TAPER, GROUP-VOLUME-VISIBLE-READOUT, PAN-SHIFT-FINE."
assert t.count(old2) == 1
t = t.replace(old2, "სიგნალები: TRACK-VOLUME-BOOST, TRACK-VOLUME-NUMERIC-FIELD, MIXER-MULTI-TRACK, TRACK-VOLUME-TAPER, GROUP-VOLUME-VISIBLE-READOUT, PAN-SHIFT-FINE, WAVEFORM-ZOOM-DISCOVERABILITY, WAVEFORM-ZOOM-LIVE-PARITY, ARCH-R120-PEAKSHAPE-TO-PEAKS.", 1)
open(p, 'w', encoding='utf-8').write(t)
print('ok')
