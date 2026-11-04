P='feature-status.md'
s=open(P).read()
old='განახლდა: 2026-11-04 · ავტორი: B (round 332 → round 333 დაგეგმვა, D-29z984…D-29z994)'
assert s.count(old)==1
s=s.replace(old,'განახლდა: 2026-11-04 · ავტორი: B (round 333 → round 334 დაგეგმვა, D-29z995…D-29z1003)',1)
anchor='  შემდეგი: 333 ეტაპი c2b-ii → REGRESSION'
i=s.index(anchor); j=s.index('\n',i)+1
add=(
"  - **Round 333 = PERF-DRAG-PREVIEW ეტაპი c2b-ii — მზადაა (D-29z995).** C round 333 PASS (`browserVerified`/`realVerified` true, 10 row, ბაგი 0), gate 333 გამოქვეყნდა `3f945e3` ორივე remote-ზე (review 9/10). trim 21.633, move 26.233, range 7.267 კომპონენტი/move, click 2 commit — B-ის sketch-ის ტოლი; DETAIL-TEXT (23 sample/viewport) HEAD-ის ტოლია, export sha ტოლია, G333-AUTH ორივე viewport-ზე. gate-ის შენიშვნა 3 (Start-ში აკრეფილი ტექსტი drag-ზე იკარგება, HEAD-ის ქცევა) → `deferred_low_polish` GATE333-S3-TYPED-TEXT-DRAG, კითხვა საბასთვის; შენიშვნა 4 (doc 232-ის რიცხვები) → round 334-ში. მტკიცებულება: `c-round-333.json`, `gates/gate-round-333.json`.\n"
"  - **Round 334 = PERF-DRAG-PREVIEW ეტაპი c2b-iii — მუშავდება (D-29z997…D-29z1003).** `ArrangementPeakPath` იღებს primitive props-ს (`clipId`, `sourceOffset`, `duration`, `gainDb`) მთელი `clip` object-ის ნაცვლად, ამიტომ fade-ისა და გადატანის drag-ზე waveform აღარ ხელახლა იხატება. ეკრანზე და ხმაში არაფერი იცვლება: browser-ში ყველა `path d` HEAD-ის ტოლია 22 sample-ზე ორივე viewport-ზე. B-ის sketch: fade 10.817 → 9.833 კომპონენტი/move, move 26.233 → 24.267, trim უცვლელი; 104 row ტოლი, 17 მხოლოდ კლებით; 9/9 mutant წითელი; covering 2459/2459. კონსულტაცია: performance-optimizer, tech-lead (დაემატა WG9, WG10, DP48 და ორი mutant). REGRESSION — პირველი დაგეგმვა 2026-11-05-ზე ან შემდეგ (D-29z997).\n"
"  შემდეგი: 334 ეტაპი c2b-iii → REGRESSION (პირველი დაგეგმვა 2026-11-05-ზე ან შემდეგ) → c3 (checkpoint D-29z915-ის შემდეგ, თუ პასუხი იქნება) → c4 → c5 → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). შემდეგი RETRO: 336 ან STUDIO-PERFORMANCE-ის ბოლო.\n"
)
s=s[:j]+add+s[j:]
old2='| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old2)==1
s=s.replace(old2,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z995…D-29z1003: PERF-DRAG-PREVIEW ეტაპი c2b-ii მზადაა (`3f945e3`); round 334 = ეტაპი c2b-iii; შემდეგ REGRESSION (2026-11-05-დან), c3–c5.) ძველი: ',1)
open(P,'w').write(s)
print('ok')
