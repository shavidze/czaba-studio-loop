P='feature-status.md'
s=open(P).read()
old='განახლდა: 2026-11-04 · ავტორი: B (round 331 → round 332 დაგეგმვა, D-29z972…D-29z983)'
assert s.count(old)==1
s=s.replace(old,'განახლდა: 2026-11-04 · ავტორი: B (round 332 → round 333 დაგეგმვა, D-29z984…D-29z994)',1)
anchor='  შემდეგი: 332 ეტაპი c2b-i → 333 REGRESSION'
i=s.index(anchor); j=s.index('\n',i)+1
add=(
"  - **Round 332 = PERF-DRAG-PREVIEW ეტაპი c2b-i — მზადაა (D-29z984).** C round 332 PASS (`browserVerified`/`realVerified` true, 11 row, ბაგი 0), gate 332 გამოქვეყნდა `de28cca` ორივე remote-ზე (review 9/10). fade 13.767 → 10.817 კომპონენტი/move (max 11), trim 23.6, move 28.2; OVERVIEW-SHOWN (23 sample/viewport, HEAD-თან 0 სხვაობა), METER-SHOWN, D-ROWS (export sha ტოლია) და G332-AUTH ორივე viewport-ზე. **დაიხურა:** GATE331-S1 (გადაწყვეტილებით), GATE331-S2, GATE331-S3. **A-R332-REVIEW-OVERVIEW-PROP-TYPE** — ბაგი არ არის (C: 0 სხვაობა; gate-ის reviewer-იც იგივეს ადასტურებს) → info სიგნალი SIG-R332-OVERVIEW-PICK, checkpoint D-29z915-ის ფარგლებში, ვადა RETRO 336 (D-29z986). A-ის Low-ები → `deferred_low_polish` (A-R332-REVIEW-LOWS); loop-ის გადართვის row → REGRESSION-ის სიაში. მტკიცებულება: `c-round-332.json`, `gates/gate-round-332.json`.\n"
"  - **Round 333 = PERF-DRAG-PREVIEW ეტაპი c2b-ii — მუშავდება (D-29z988…D-29z994).** Clip details-ის Start/End ველის ტექსტი render-ში განახლდება layout effect-ის ნაცვლად (`syncedClipGainText`-ის pattern, ოთხ raw რიცხვზე `Object.is`): trim/move/range-ის ყოველ move-ზე ზედმეტი 2-component commit ქრება. ეკრანზე და ხმაში არაფერი იცვლება; ქცევა HEAD-ზეა მიბმული (DP35–DP37, DP39–DP42). B-ის sketch: trim 23.6 → 21.633 კომპონენტი/move, move 28.2 → 26.233, range 9.233 → 7.267, click 102 → 100 (commit 3 → 2); 103 row ტოლი, 18 მხოლოდ კლებით; 6/6 mutant წითელი; covering 613/613. `interact.harness.hook-live` 2 → 1 (budget ≥ 1; სიგნალი SIG-R333-HOOK-LIVE-MARGIN). PERF-CAND-PEAK-PRIMITIVE-PROPS → ცალკე ეტაპი c2b-iii (D-29z990). REGRESSION გადავიდა პირველ დაგეგმვაზე 2026-11-05-ზე ან შემდეგ (D-29z988: დღეს 2026-11-04-ია, regression-last-დან 2 დღე). კონსულტაცია: performance-optimizer, tech-lead. checkpoint D-29z915 — პასუხი ჯერ არ არის, ეს რაუნდი არ ელოდება (StudioWorkspace.tsx-ს არ ეხება).\n"
"  შემდეგი: 333 ეტაპი c2b-ii → REGRESSION (პირველი დაგეგმვა 2026-11-05-ზე ან შემდეგ; C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION, SIG-R327-NOBPM-RULER-CLICK, A-R328-REVIEW-SAME-TEXT-RACE, GATE328-S1, ეტაპები b/c1/c2a/c2b-i/c2b-ii, loop toggle) → c2b-iii → c3 → c4 → c5 → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). შემდეგი RETRO: 336 ან STUDIO-PERFORMANCE-ის ბოლო.\n"
)
s=s[:j]+add+s[j:]
old2='| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old2)==1
s=s.replace(old2,'| STUDIO-PERFORMANCE | **მუშავდება (D-29z984…D-29z994: PERF-DRAG-PREVIEW ეტაპი c2b-i მზადაა (`de28cca`); round 333 = ეტაპი c2b-ii; შემდეგ REGRESSION (2026-11-05-დან), c2b-iii, c3–c5.) ძველი: ',1)
open(P,'w').write(s)
print('ok')
