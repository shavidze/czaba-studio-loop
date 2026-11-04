import json
P='feature-status.md'
s=open(P).read()
PERF=json.load(open('b-round-331/perf-numbers.json'))
old_hdr=s.split('\n',3)[2]
assert old_hdr.startswith('განახლდა: 2026-11-04 · ავტორი: B (round 330 → round 331 დაგეგმვა, D-29z962…D-29z971)'), old_hdr[:120]
s=s.replace('განახლდა: 2026-11-04 · ავტორი: B (round 330 → round 331 დაგეგმვა, D-29z962…D-29z971)','განახლდა: 2026-11-04 · ავტორი: B (round 331 → round 332 დაგეგმვა, D-29z972…D-29z983)',1)
anchor='  შემდეგი: 331 ეტაპი c2a → REGRESSION'
i=s.index(anchor); j=s.index('\n',i)+1
add=(
"  - **Round 331 = PERF-DRAG-PREVIEW ეტაპი c2a — მზადაა (D-29z972).** C round 331 PASS (`browserVerified`/`realVerified` true, 14/14 row), gate 331 გამოქვეყნდა `c1d3fbf` ორივე remote-ზე. fade 21.633 → 13.767 კომპონენტი/move (max 14) — item-ის მიზანი ≤ 15 მიღწეულია; move 30.367 → 29.4; FADE/TRIM/MOVE/GROUP-SHOWN და D-ROWS (export sha) HEAD-ის ტოლია ორივე viewport-ზე. **დაიხურა:** SIG-R326-DETAIL-IGNORES-FADE, SIG-R326-READOUT-PRIMITIVE, GATE330-S1, GATE330-S2. **C-R331-01** (Low, HEAD-შიც ასეა: 1280×720-ზე, detail panel-ით, fade-ის handle trim-ის მარცხენა კიდის შუას ფარავს) → `deferred_low_polish`. **A-R331-REVIEW-STALE-CLIP** — ბაგი არ არის (სამი დამოუკიდებელი შემოწმება), info სიგნალად შეუერთდა SIG-R331-DETAIL-PICK-ს, ვადით (D-29z973). მტკიცებულება: `c-round-331.json`, `gates/gate-round-331.json`.\n"
"  - **Round 332 = PERF-DRAG-PREVIEW ეტაპი c2b-i — მუშავდება (D-29z976…D-29z983).** overview და ხაზის meter აღარ ხატავს თავიდან, როცა იცვლება ველი, რომელსაც არ აჩვენებს: overview-ს საკუთარი ამომწურავი ველების სია (`OVERVIEW_CLIP_FIELD_ROLES`: id, trackId, start, duration) და `memo(ArrangementTrackMeterInner)`. "+"B-ის sketch: fade "+str(PERF['fadePerMove'])+" კომპონენტი/move (max "+str(PERF['fadeMax'])+"), trim "+str(PERF['trimPerMove'])+", move "+str(PERF['movePerMove'])+" (max "+str(PERF['moveMax'])+"); click, play და zoom −4; 83 row ტოლი, 38 მხოლოდ კლებით; 6/6 mutant წითელი; covering 438/438. ეკრანზე და ხმაში არაფერი იცვლება. `ArrangementPeakPath`-ის comparator გაზომვის შემდეგ ამოვიღეთ (trim-ზე counted wrapper fiber-ის გამო +1, D-29z983) → კანდიდატი PERF-CAND-PEAK-PRIMITIVE-PROPS c2b-ii-სთვის. c2b-ii (detail-ის Start/End ტექსტი render-ში) — ცალკე რაუნდი. კონსულტაცია: performance-optimizer, tech-lead. frontend-architect-ის checkpoint D-29z915: root-ს ეთხოვა 332-ის გამოქვეყნების შემდეგ, c3-მდე (`b-round-331-checkpoint-addendum.md`, არ ბლოკავს).\n"
"  შემდეგი: 332 ეტაპი c2b-i → 333 REGRESSION (2026-11-05-დან; C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION, SIG-R327-NOBPM-RULER-CLICK, A-R328-REVIEW-SAME-TEXT-RACE, GATE328-S1, ეტაპები b/c1/c2a/c2b-i) → c2b-ii → c3 → c4 → c5 → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). შემდეგი RETRO: 336 ან STUDIO-PERFORMANCE-ის ბოლო.\n"
)
s=s[:j]+add+s[j:]
open(P,'w').write(s)
print('ok')
