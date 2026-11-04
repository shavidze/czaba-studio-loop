P='feature-status.md'
s=open(P).read()
old='განახლდა: 2026-11-04 · ავტორი: B (round 333 → round 334 დაგეგმვა, D-29z995…D-29z1003)'
assert s.count(old)==1
s=s.replace(old,'განახლდა: 2026-11-04 · ავტორი: B (round 334 → round 335 დაგეგმვა, D-29z1004…D-29z1010)',1)
anchor='  შემდეგი: 334 ეტაპი c2b-iii → REGRESSION'
i=s.index(anchor); j=s.index('\n',i)+1
add=(
"  - **Round 334 = PERF-DRAG-PREVIEW ეტაპი c2b-iii — მზადაა (D-29z1004).** C round 334 PASS (`browserVerified`/`realVerified` true, 13 row, ბაგი 0), gate 334 გამოქვეყნდა `0d22ab9` ორივე remote-ზე. fade 9.833 კომპონენტი/move (max 10), move 24.267 (max 101) — B-ის sketch-ის ტოლი; waveform-ის `path d` HEAD-ის ტოლია ორივე viewport-ზე (C-ის trim-end და ვიდეოს sample-ებიც), export sha ტოლია, G334-AUTH ორივე viewport-ზე. PERF-CAND-PEAK-PRIMITIVE-PROPS დაიხურა. A-ის reviewer-ის სამი Low → `deferred_low_polish`; gate-ის Architecture note → ARCH-R334-PEAKPATH-FILE (signal). მტკიცებულება: `c-round-334.json`, `gates/gate-round-334.json`.\n"
"  - **Round 335 = PERF-DRAG-PREVIEW ეტაპი c3-i — მუშავდება (D-29z1007…D-29z1010).** მხოლოდ ტესტი: perf harness-ში ემატება კლიპის სხვა ხაზზე გადატანის სცენარი (საკუთარი ხაზი → შემდეგი ხაზი → უკან) და 26 `record` row. B-მ HEAD-ზე გაზომა: სხვა ხაზზე ყოველ move-ზე 87 კომპონენტი და `ArrangementProvider` ყოველ move-ზე იხატება, იმავე ხაზზე — 19 (`b-round-334/cross-head-1440-summary.txt`). ეს არის c3-ii-ის (clipLaneDrag store) საზომი. checkpoint D-29z915 პასუხის გარეშეა — მიღებულია default keep (D-29z1007).\n"
"  შემდეგი: 335 ეტაპი c3-i → 336 REGRESSION (თუ დაგეგმვა 2026-11-05-ზე ან შემდეგაა, შემდეგ 337 RETRO; სხვა შემთხვევაში 336 RETRO, D-29z1009) → c3-ii → c4 → c5 → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n"
)
s=s[:j]+add+s[j:]
old2='| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old2)==1
s=s.replace(old2,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z1004…D-29z1010: PERF-DRAG-PREVIEW ეტაპი c2b-iii მზადაა (`0d22ab9`); round 335 = ეტაპი c3-i (cross-lane perf row); შემდეგ REGRESSION/RETRO, c3-ii, c4, c5.) ძველი: ',1)
open(P,'w').write(s)
print('ok')
