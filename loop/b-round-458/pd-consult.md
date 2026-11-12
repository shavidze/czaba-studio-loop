# product-designer consult — SABA-B-13 (2026-11-12, read-only)
Chosen (B adopts unless noted):
1. Bound = first painted cover frame -> removal. Target 1450 ms, floor 1400, ceiling 2000 (tech-lead tightened the code cap to 1900 for slack). Logo fully visible >= ~650 ms, tagline >= ~450 ms (B rows: logo >= 600, tagline >= 400 at 1x).
2. Clock starts at first paint (cover visible). Black-only failsafe 1000 ms then 250 ms CSS fade; a later hydration must not replay. No-JS: no cover (B: cover is off by default; the boot script opts in).
3. Skip before hydration: yes (Esc, Tab without preventDefault, click absorbed).
4. Reduced motion: keep "no entrance".
5. States: fresh / same-tab reload (none) / new tab (plays) / client nav after seen (none) / arrive from another page then click to / (PD default: no -> B keeps HEAD behaviour = plays, as a Saba question, not a silent change) / RM / JS slow / JS disabled / skip.
6. Questions for Saba (defaults kept): static wordmark on the pre-hydration cover (default no); entrance when first reaching / by in-app navigation (default: HEAD behaviour, plays once per tab); hero animations finishing under the cover (default: leave).
Rejected: clock from hydration (user sees black from first paint); wordmark on the static cover (brand shown twice, look change needs Saba).
Note: PD could not open docs/technical/store-redesign/store-redesign-spec.md D10 by the path given; D10 "<= 1.2 s" is quoted from backlog SABA-B-13 ruling_d29z1616.
