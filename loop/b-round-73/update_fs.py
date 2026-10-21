import sys
p = sys.argv[1]
lines = open(p, encoding='utf-8').read().split('\n')
def find(prefix):
    idx = [i for i, l in enumerate(lines) if l.startswith(prefix)]
    assert len(idx) == 1, (prefix, idx)
    return idx[0]
i = find('მიმდინარე რაუნდი: **Round 73**')
lines[i] = ('მიმდინარე რაუნდი: **Round 74** (`current-task.md`, D-29z39) — **SRW-16 (FB-10) ეტაპი 2a:** მარკერის გადატანა drag-ით (3 px ზღვარი; Snap ჩართულზე ბადის ხაზზე, Alt — თავისუფლად, Snap გამორთულზე ms-ით; 0-ზე შეზღუდვა) და ისრებით ფოკუსირებულ flag-ზე (ბადის ხაზი ან 0.1 წმ), სხვა მარკერთან დამთხვევის უარყოფა, ერთი `Move Marker` ისტორიაში, drag-ის შემდეგ click არ გადაადგილებს playhead-ს, დაჭერა flag-ს ფოკუსს აძლევს; მარჯვენა click / Shift+F10 / ContextMenu — მენიუ „სახელის შეცვლა / დაკვრა აქედან / წაშლა“. '
            'ბაზა: HEAD `6b574e8` (gate 73-მა გამოაქვეყნა რაუნდები 72–73), სუფთა tree. ეტაპი 2b (Round 75, დაგეგმილია და არ გადადებულა): კლიპების/range-ის/playhead-ის snap მარკერებზე, Ctrl+←/→ (macOS-ზე Option+←/→) კლიპის კიდეებზეც.\n\n'
            '**Round 73-ის შედეგი:** C PASS, `browserVerified=true`, ბაგები არ არის (`c-round-73.md`); root-მა გამოაქვეყნა `6b574e8`. SRW-16 ეტაპი 1 დადასტურდა ორივე viewport-ზე (C73-1..4, MK-DELETE, MK-NAV, MK-ADD-PLAYING, header-ის ბმული, ვერტიკალური sticky, REG-KEYS, REG-HYD, G73-3). fake-Bearer 403 — BLOCKED (backend ღრუბელში მიუწვდომელია), ღია მტკიცებულებად რჩება.')
row_old = find('| FB-10 | Markers/Locators |')
lines[row_old] = '| FB-10 | Markers/Locators | **მუშავდება** (SRW-16 ეტაპი 1 — C PASS Round 73, `browserVerified=true`, `6b574e8`; ეტაპი 2a — Round 74, D-29z39; ეტაპი 2b — Round 75) | `c-round-73.md`, `gates/gate-round-73.json` | Round 74 → 75 |'
row = find('| SRW-16 | Markers/Locators |')
lines[row] = '| SRW-16 | Markers/Locators | **მუშავდება** (ეტაპი 1 დადასტურდა: C Round 73 PASS, `browserVerified=true`, გამოქვეყნდა `6b574e8`; ეტაპი 2a — გადატანა drag/ისრებით და მენიუ, Round 74; ეტაპი 2b — snap მარკერებზე და Ctrl/Option+←/→ კლიპის კიდეებზე, Round 75) | `c-round-73.md`, `c-round-73.json` | Round 74 (2a) → Round 75 (2b) |'
h = find('Round 72 (D-29z37): SRW-16 (FB-10) ეტაპი 1')
lines.insert(h, 'Round 74 (D-29z39): SRW-16 (FB-10) ეტაპი 2a — მარკერის გადატანა (drag/ისრები, snap, დამთხვევის უარყოფა) და მარკერის მენიუ (Rename / Play from here / Delete); `markers.ts` (`moveMarker`), `ArrangementMarkerRow.tsx`, ახალი `ArrangementMarkerMenu.tsx`, ვიწრო ნებართვები (`ArrangementGridMenu.tsx` — ერთი `export`, `StudioWorkspace.tsx` — ორი prop); doc 065. შემდეგ Round 75 — ეტაპი 2b → checkpoint-ის თხოვნა SRW-16-ის საზღვარზე → SRW-17 → SRW-18 → SRW-19 → SRW-20 → Low-ების ჯგუფი → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN. რეგრესიის რაუნდი — 2026-10-24-დან. ფარგლები არ მცირდება.\n\n'
                 'Round 73 (D-29z38): C-R72-01 — მონიშნული კლიპი Delete/ისარს იღებს მარკერის დამატების შემდეგაც (`releaseEditFocusOnTimelinePointerDown`-ის marker-ის პუნქტი), MU8c–MU8f, doc 064. **შედეგი: C PASS, `browserVerified: true`; გამოქვეყნდა `6b574e8` (რაუნდები 72–73).**\n')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok')
