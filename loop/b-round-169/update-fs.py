import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 168 → round 169 დაგეგმვა, D-29z134', 'round 169 → round 170 დაგეგმვა, D-29z135')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z134):** R9/R10 (Preview/Stop), R11 (Add კარგავს `brand` ფონს), R7 (სტრიქონების 8 px კუთხეები), R12 (ხის სტრიქონები კვადრატული).\n"
bullet = ("- **Round 169 (V-3c-4c-1) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 169 გამოქვეყნდა `352dc91`. V-3c-4c-1 — **მზადაა**.** "
  "SURF-V3C4C1 (Preview — გამჭვირვალე 1 px ჩარჩო; Stop — `accent` ჩარჩო რჩება; Add — `brand` ჩარჩო; 8 px, ფონი 5/8/12 %, 180 ms; reduced motion-ზე `none`), BOX-V3C4C1 (0.00 px), CONTRAST-V3C4C1 (7.05 / hover 6.58 / დაჭერისას 5.82), RV1-V3C4C1, "
  "FUNC-SMOKE-V3C4C1 (რეალური preview აუდიო: peak > 0.01 92/94 ms-ში, Stop-ის შემდეგ < 0.001 91/87 ms-ში; Add + Undo; ორმაგი დაწკაპუნება; ძიება 9 → 1 და გასუფთავება; collapse/expand focus) — PASS ორივე ზომაზე (`c-round-169.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "ახალი Low-ები → `deferred_low_polish`: C-R169-N1 (ძიების ველზე ორი ფოკუსის რგოლი, ძველი), GATE169 ტესტის ჰიგიენა, B-R169-1280-SET-SELECTION-SQUASH (1280-ზე „Set selection“ 18 px-მდე იკუმშება, ძველი). "
  "**Round 170 (D-29z135): V-3c-4c-2** — Clip details: „Set selection“, „0 dB“ და Collapse/Expand ღილაკები კარგავს `border-outline`-ს და იღებს 5 % ფონს, 8 px (R1, R13; `hover:text-brand` და `disabled:text-dim` რჩება); From/To და Clip Gain ველები — მხოლოდ 8 px, ჩარჩო რჩება (R3); ჩარჩოიანი ყუთები → V-3c-5, fader და resize handle — უცვლელი (R14). "
  "B-ის ბრაუზერის probe: layout 0.000 px 3 მდგომარეობაში ორივე ზომაზე; კონტრასტი 14.78 → 13.24, hover 6.58; გათიშული 5.38 → 4.82 (`b-round-169/out/v3c4c2-probe.json`). "
  "**⚠ ვეტოს შესაძლებლობით (D-29z135):** R13 (სამი ღილაკი ჩარჩოს გარეშე), R3 (ველები ინარჩუნებს ჩარჩოს).\n")
rep(anchor, anchor + bullet)
old = "**V-3c-4c-1 — მუშავდება** (ბიბლიოთეკის Preview/Stop და Add, სტრიქონები, ხატულა-ღილაკები, ძიების ველი; Round 169, D-29z134). შემდეგ V-3c-4c-2 (Detail panel, 170), V-3c-4c-3 (Export dialog, video dock, marker-ის ჭდის კითხვა; 171)"
new = ("**V-3c-4c-1 — მზადაა** (Round 169, C PASS `browserVerified`, `352dc91`; `c-round-169.json`). "
  "**V-3c-4c-2 — მუშავდება** (Clip details: Set selection, 0 dB, Collapse/Expand, From/To და Clip Gain ველები; Round 170, D-29z135). შემდეგ V-3c-4c-3 (Export dialog, video dock, marker-ის ჭდის კითხვა; 171, თუ რეგრესია არ დგება)")
rep(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
