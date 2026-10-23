p = '/home/runner/czaba-project/docs/technical/studio-real-workspace/plan.md'
t = open(p, encoding='utf-8').read()
anchor = '**D-29z85 — Round 119-ის შედეგი; Round 120: T12 ეტაპი 4a'
assert t.count(anchor) == 1
entry = (
"**D-29z86 — Round 120-ის შედეგი; Round 121: T12 ეტაპი 4b — Waveform Vertical Zoom (მხოლოდ ხედი; T12.18 + Test 7).**\n\n"
"C round 120 (`tmp/studio-real-loop/c-round-120.md`, `c-round-120.json`) — **PASS**, `browserVerified: true`, `realVerified: true`, 0 ბაგი: T120-TARGETED 331/331, WG-SCALE და WG-LIVE ორივე viewport-ზე, WG-CLAMP-FLOOR, WG-DETAIL, WG-MULTI, WG-MUSTNOT, WG-PLAY (0 `createBufferSource`), WG-AUDIO (peak/RMS 0.501187), G120-3 (401). Gate 120 გამოქვეყნდა `0a75ba8` (ორივე remote). T12 ეტაპი 4a → `c_pass_published`.\n"
"- **R1 — რეგრესიის რაუნდი ჯერ არ დამდგარა:** `date -u` 2026-10-23 23:26:24, `regression-last.json` 2026-10-21 (2 დღე). D-29z85-ის პროგნოზი (round 121 = რეგრესია) 2026-10-24-ზე ან შემდეგ დაგეგმვას გულისხმობდა და ჩანაცვლდა. Round 121 = ეტაპი 4b (V1-ს ხურავს); round 122-ის დაგეგმვა (≥ 3 დღე) რეგრესიის რაუნდია და V1-საც მოიცავს. C FAIL-ისას ჯერ შეზღუდული გასწორებაა.\n"
"- **R2 — კონტროლი:** `<select data-testid=\"arrangement-waveform-zoom\">`, საფეხურები `½× 1× 2× 4× 8×`, ნაგულისხმევი `1×`, `appearance-none`, 224 px-იანი grid row-ის ბოლო ელემენტი (B-მ გაზომა: 28 px, მთავრდება x = 210 ≤ 216). Transport/tempo/marker/loop row-ებში ადგილი სიმაღლის შეცვლის გარეშე არ არის. Live-ის უწყვეტი slider-ისგან შეგნებული განსხვავებაა; `½×` T12.18-ის „ზრდის ან ამცირებს“-ის გამოა (Live-ის ტექსტი მხოლოდ „enlarge“-ს ამბობს).\n"
"- **R3 — ფარგლები:** მხოლოდ ხაზებზე მდებარე აუდიო კლიპები, მათ შორის მოგვიანებით დამატებულიც (Live 12 §6.1: „audio clips“, „all audio tracks in the Arrangement, as well as new clips“). ვიდეოს ნახატი და detail panel უცვლელია (panel კლიპის რეალურ დონეს აჩვენებს).\n"
"- **R4 — მხოლოდ ხედი:** სესიის view state `StudioWorkspace`-ში; არც history, არც arrangement, არც `localStorage` — ამიტომ `scheduleKey`-ში, graph-ში, meter-ებსა და export-ში ვერ მოხვდება. Status: `Waveform Zoom 200% — მხოლოდ ხედი, ხმა არ იცვლება.`\n"
"- **R5 — ერთი ფაქტორი:** `clipWaveformScale(clip, isVideo, zoom)` = `clipLinearGain(clip) × zoom` (ვიდეოზე zoom არა) არსებულ clamp-მდე `scale` პარამეტრში; `1×`-ზე ნახატი round 120-ის ბაიტობრივად იდენტურია. ახალი prop-ები არჩევითია (ნაგულისხმევი 1), ამიტომ არსებული ტესტი grant-ს არ საჭიროებს.\n"
"- **R6 — B-ის literal-ები და baseline:** WZ1-ის path-ები node-ში `Float32Array`-ით (`b-round-120/literals.txt`); ბრაუზერის baseline გამოქვეყნებულ სუფთა tree-ზე (`b-round-120/probe/baseline-r121.json`: chrome row-ები, ხაზების y, ოთხივე ნახატის sha256 `1×`-ზე).\n"
"- **R7 — Test 7:** C — WZ-AUDIO (WAV `1×` vs `2×`: ≤ 1 LSB, ratio 1.0000) და WZ-METER (წყვილური per-iteration output peak ±0.1 dB, loop-ზე).\n"
"- **R8 — Ableton:** §6.1 — ცალკე slider, ყველა აუდიო ტრეკზე და ახალ კლიპებზე (დადასტურებული); დიაპაზონი, ადგილი, Undo და Clip View — დაუდასტურებელი (ABLETON-EXPERT-REVIEW). სიგნალები: WAVEFORM-ZOOM-DISCOVERABILITY (DESIGN-UX-REVIEW), WAVEFORM-ZOOM-LIVE-PARITY.\n"
"- **R9 — პროცესი (C-R120-01):** ყველა მუდმივი ცვლილება Edit/Write-ით; shell replace — მხოლოდ დროებითი მუტაციისთვის, sha256-ით აღდგენილი; A ყველა shell write-ს ჩამოთვლის. Architecture: addendum (ad) `b-round-91-checkpoint-request.md`-ში (`buildPeakShape` → `peaks.ts`, keep).\n\n"
)
t = t.replace(anchor, entry + anchor, 1)
row_anchor = "| 120 | T12 ეტაპი 4a | waveform-ის ნახატი Clip Gain-ს აჩვენებს (ხაზი + detail panel, ცოცხლად, აუდიო უცვლელი); შემდეგ რეგრესიის რაუნდი, მერე 4b (D-29z85) |"
assert t.count(row_anchor) == 1
t = t.replace(row_anchor, row_anchor + "\n| 120 → | (შედეგი) | **C PASS** (`browserVerified`), gate 120 გამოქვეყნდა `0a75ba8`: T12 ეტაპი 4a მზადაა; რეგრესია ჯერ არ დამდგარა (2 დღე) |\n| 121 | T12 ეტაპი 4b | Waveform Vertical Zoom (`½×–8×`, მხოლოდ ხედი, აუდიო კლიპები ხაზებზე); V1-ს ხურავს; შემდეგ რეგრესიის რაუნდი, მერე ABLETON-EXPERT-REVIEW (D-29z86) |", 1)
own_anchor = "**D-29z85:** round 120-ში A-ს ეკუთვნის"
i = t.index(own_anchor)
j = t.index('\n', i)
t = t[:j+1] + "**D-29z86:** round 121-ში A-ს ეკუთვნის ახალი `app/lib/arrangement/waveform-zoom.ts`, `ArrangementClip.tsx` (არჩევითი `waveformZoom` prop + scale-ის წყარო), `ArrangementLane.tsx` (მხოლოდ prop-ის გადაცემა), `StudioWorkspace.tsx` (view state, handler, select, `data-waveform-zoom`, lane prop), ახალი `waveform-zoom.test.tsx` და ახალი doc 103. დანარჩენი გაყინულია (`b-round-120-r121-tree-sha256.txt`, 931).\n" + t[j+1:]
open(p, 'w', encoding='utf-8').write(t)
print('ok')
