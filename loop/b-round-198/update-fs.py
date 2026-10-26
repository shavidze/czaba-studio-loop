p='feature-status.md'
s=open(p,encoding='utf-8').read()
assert '- **Round 198 (D-29z163)' not in s
old3='განახლდა: 2026-10-26 · ავტორი: B (round 197 → round 198 დაგეგმვა, D-29z163)'
assert s.count(old3)==1
s=s.replace(old3,'განახლდა: 2026-10-26 · ავტორი: B (round 198 → round 199 დაგეგმვა, D-29z164)')
a93='- **Round 197 (D-29z162): SABA-B-4 ეტაპი 1-ის fix-up'
assert s.count(a93)==1
new='- **Round 198 (D-29z163): C-R196-02 (R91, keyboard focus-ის გამოჩენა sticky chrome-ის ქვეშ) — მზადაა.** C PASS, `browserVerified: true`, `realVerified: true`, 12 row, blocked 0; gate 198 გამოქვეყნდა `980cfbe`. FOCUS-REVEAL-198: 1280 rich — დამალული stop 0/0 (ref `2505252`: 6/6); CHROME-FOCUS-198, POINTER-198, SIDE-198 (Follow და marker menu ref-ის იდენტური), RING-KEY-198, REST-198 (0 px), G198-3 (mock-backed 401/403), T-RUN-198 (m1–m5 წითელი) — PASS. **C-R196-02 დაიხურა.** ახალი Low (ძველი, ref-შიც არის): **C-R198-01** (ნაწილობრივ დაფარული slider-ი mouse click + ArrowUp-ის შემდეგ ისევ 6 px ქვეშ რჩება) და **C-R198-02** (Mute/Solo — Original video sound, ring-ის ქვედა მხარე მოჭრილი) → `deferred_low_polish` (274). B-ის ruling: Medium-ის წინასწარი პირობა Tab-ით focus-ის დაჯდომას ეხება; კონტროლი სრულად დამალული არ არის (`c-round-198.json`). **Round 199 (D-29z164) — რეგრესია (მუშავდება):** phase 1 + T12 V1 + Round 122-ის შემდეგ დასრულებული ყველაფერი + store (mock :5199) + e2e smoke; A — მხოლოდ doc 156/158/159-ის სტატუსის ხაზები. შემდეგ Round 200 — RETRO (ან ჯერ fix-up, თუ რეგრესია Medium+-ს იპოვის).\n'
s=s.replace(a93,new+a93)
o439='ღიაა C-R196-02 (Medium, ძველი; Round 198, R91). ეტაპი 2'
assert s.count(o439)==1
s=s.replace(o439,'C-R196-02 დაიხურა (Round 198, R91, C PASS `browserVerified`, `980cfbe`). ეტაპი 2')
o439b="`b-round-197/probe-*.json` | Round 198 — C-R196-02 |"
assert s.count(o439b)==1
s=s.replace(o439b,"`b-round-197/probe-*.json`; `c-round-198.json`; `gates/gate-round-198.json` | Round 199 რეგრესია → Round 200 RETRO → ეტაპი 2 |")
o986='Round 198 — C-R196-02; Round 199 — რეგრესია; Round 200 — RETRO;'
assert s.count(o986)==1
s=s.replace(o986,'Round 198 — C-R196-02 **მზადაა** (`980cfbe`); Round 199 — რეგრესია (D-29z164, მუშავდება); Round 200 — RETRO;')
o986b='რეგრესია — 2026-10-27-ზე ან შემდეგ დაგეგმვისას. '
assert s.count(o986b)==1
s=s.replace(o986b,'')
open(p,'w',encoding='utf-8').write(s)
print('ok')
