const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let s = fs.readFileSync(p, 'utf8');
const rep = (from, to) => {
  const n = s.split(from).length - 1;
  if (n !== 1) {
    throw new Error(`expected 1 match, got ${n}: ${from.slice(0, 80)}`);
  }
  s = s.replace(from, to);
};

rep('განახლდა: 2026-10-21 · ავტორი: B (round 70 → round 71 დაგეგმვა)', 'განახლდა: 2026-10-21 · ავტორი: B (round 71 → round 72 დაგეგმვა)');

const curStart = s.indexOf('მიმდინარე რაუნდი: **Round 71**');
const curEnd = s.indexOf('წინა რაუნდი: **Round 70');
if (curStart < 0 || curEnd < 0) throw new Error('current block not found');
const round72 = [
  'მიმდინარე რაუნდი: **Round 72** (`current-task.md`, D-29z37) — **SRW-16 (FB-10) სახელიანი მარკერები, ეტაპი 1:**',
  '- **რა ემატება:** `Arrangement.markers?` (არჩევითი; ცარიელი სია არასდროს ინახება), სუფთა `markers.ts`; ახალი `ArrangementMarkerRow` sticky chrome-ში TempoRow-სა და Loop-ის ხაზს შორის („ზემოდან“). `M` ან Add ღილაკი → მარკერი range-ის დასაწყისში ან მიმდინარე პოზიციაზე, სახელის ველით (Enter/blur — შენახვა, Escape — გაუქმება); click — გადასვლა; ორმაგი click გაჩერებულზე — დაკვრა მარკერიდან; Ctrl+←/→ და ◀/▶ — წინა/შემდეგი (ბოლოს 0 / პროექტის ბოლო); F2 — სახელის შეცვლა; Delete ფოკუსირებულ მარკერზე; Undo/Redo. Cut Time (Ctrl+Shift+X): შიგნით მყოფი მარკერი იშლება, შემდეგი — იწევს, სტატუსში რაოდენობა.',
  '- **უცვლელია:** აუდიო (`scheduleKey` — resync არ ხდება), ექსპორტი, SRW-24-ის Delete, ruler (გაყინულია), Paste.',
  '- **Ableton (Live 12 §6.4/6.9/6.11, B-მ 2026-10-21-ს gstack-ით ხელახლა წაიკითხა):** დამატება insert marker-ზე/selection-ის დასაწყისში, click/ორმაგი click, წინა/შემდეგი ბოლოებით, Delete — დადასტურებული. F2 (Ctrl+R ბრაუზერის reload-ია) და დაკვრის ავტომატური დაწყების არარსებობა — შეგნებული განსხვავება; Delete Time-ში locator-ები — დაუდასტურებელი.',
  '- **კოდი:** `arrangement.ts`, `markers.ts` (ახალი), `model.ts` (`deleteTime`), `ArrangementContext.tsx` (Cut Time-ის სტატუსი), `ArrangementMarkerRow.tsx` (ახალი), `StudioWorkspace.tsx`; MK1–MK10, MU1–MU12 → 103 ფაილი; doc 064 ახალი; doc 063 — სტატუსი და verify-ის წინადადება (ROOT-R71-L1).',
  '- **C:** MK-ADD*, MK-ADD-RANGE, MK-ADD-PLAYING / MK-NO-RESYNC, MK-ESC, MK-DUP, MK-JUMP, MK-PLAYFROM* (რეალური აუდიო), MK-NAV, MK-RENAME, MK-DELETE, MK-CUT-TIME, MK-LAYOUT*, MK-TYPING, MK-EXPORT-REG, REG-CHROME, REG-KEYS, REG-HYD, G72-3.',
  '- **შემდეგ:** SRW-16 ეტაპი 2 (გადატანა drag/ისრებით snap-ით, მარჯვენა click-ის მენიუ, snap მარკერებზე, Ctrl+←/→ კლიპის კიდეებზეც) → SRW-17…SRW-20.',
  '',
  'წინა რაუნდი: **Round 71 — C PASS, `browserVerified: true`** (`c-round-71.md`) (D-29z36) — **ROOT-R66-M1: მეტრონომის კლიკები horizon-ით:** G71-1/2/3, R71-S, R71-U (a–l მოკლულია, h ექვივალენტურია; n/o — ტესტის ხარვეზები, Low-ებში), MT-BEATS*, MH-LONG, MH-END, MT-SEEK, MT-TEMPO-CHANGE, MT-LIVE-TOGGLE, MH-SCRUB, MH-NODES* (≤ 120, ადრე ≈ 2200), MH-SCRUB-PERF, MT-LOOP, MT-EXPORT-REG, MT-OFF, REG-HYD — ყველა PASS, ბაგები არ არის. Root-მა გამოაქვეყნა: `1e469e5` (review 9/10). ROOT-R66-M1 დაიხურა.',
  '',
  '',
].join('\n');
s = s.slice(0, curStart) + round72 + s.slice(curEnd);
rep('წინა რაუნდი: **Round 70 — C PASS', 'უფრო ადრე: **Round 70 — C PASS');

rep('| FB-09 | Bars/Beats + Metronome | **მოწმდება** (C-ის ყველა ID PASS-ია, ბრაუზერში დადასტურებული: ტაქტების სახაზავი — Round 65, მეტრონომი — Round 66, `b5fb12b`. ROOT-R65-M1 — Round 70 C PASS, `2be45df`. რჩება: Tech Lead-ის R65-T/R66-T/R70-T; perf Medium ROOT-R66-M1 — Round 71 (D-29z36)) | `c-round-65.md`, `c-round-66.md`, `c-round-70.md` | Round 71 |',
  '| FB-09 | Bars/Beats + Metronome | **მოწმდება** (C-ის ყველა ID PASS-ია, ბრაუზერში დადასტურებული: ტაქტების სახაზავი — Round 65, მეტრონომი — Round 66, `b5fb12b`. ROOT-R65-M1 — Round 70, `2be45df`; ROOT-R66-M1 — Round 71, `1e469e5`. რჩება: Tech Lead-ის R65-T/R66-T/R70-T/R71-T) | `c-round-65.md`, `c-round-66.md`, `c-round-70.md`, `c-round-71.md` | Tech Lead |');
rep('| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |',
  '| FB-10 | Markers/Locators | **მუშავდება** (SRW-16 ეტაპი 1 — Round 72, D-29z37; ეტაპი 2 შემდეგია) | `current-task.md` | Round 72 |');
rep('| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **მოწმდება** (R15-T1 — Round 65, R15-T2 — Round 66; C-ის ყველა ID PASS-ია, `browserVerified: true`, `b5fb12b`. ROOT-R65-M1 — Round 70 C PASS, `2be45df`. რჩება: Tech Lead-ის R65-T/R66-T/R70-T; perf Medium ROOT-R66-M1 — Round 71) | `c-round-65.md`, `c-round-66.md`, `c-round-70.md` | Round 71 (ROOT-R66-M1) |',
  '| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **მოწმდება** (R15-T1 — Round 65, R15-T2 — Round 66; C-ის ყველა ID PASS-ია, `browserVerified: true`, `b5fb12b`. ROOT-R65-M1 — Round 70, `2be45df`; ROOT-R66-M1 — Round 71 C PASS, `1e469e5`. რჩება: Tech Lead-ის R65-T/R66-T/R70-T/R71-T) | `c-round-65.md`, `c-round-66.md`, `c-round-70.md`, `c-round-71.md` | Tech Lead |');
rep('| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | SRW-15-ის შემდეგ |',
  '| SRW-16 | Markers/Locators | **მუშავდება** (ეტაპი 1 — Round 72, D-29z37: მოდელი, დამატება სახელით, გადასვლა, დაკვრა მარკერიდან, წინა/შემდეგი, F2, Delete, Cut Time-ის remap; ეტაპი 2 — გადატანა, მენიუ, snap მარკერებზე) | `current-task.md` | Round 72 → ეტაპი 2 |');

rep('| T12-GAIN-VOLUME | **არ დაწყებულა** | იწყება მხოლოდ თავდაპირველი scope-ის (SRW-01..24) დადასტურებული დასრულების შემდეგ. წყაროები: `docs/technical/studio-real-workspace/next-stage-t12/` |',
  '| T12-GAIN-VOLUME | **არ დაწყებულა** | იწყება მხოლოდ თავდაპირველი scope-ის (SRW-01..24) დადასტურებული დასრულების შემდეგ. წყაროები: `docs/technical/studio-real-workspace/next-stage-t12/` |\n| VISUAL-A-OBSIDIAN | **არ დაწყებულა** | root-ის შენიშვნა 2026-10-21 (მომხმარებელმა დაამტკიცა): T12-ის შემდეგ, დამატებითი დასტურის გარეშე; მხოლოდ ფერები, ხატულები, ტიპოგრაფია, ღილაკების ზედაპირი + M1–M4 (M2 — Studio UI ინგლისურად ერთი strings მოდულით). სპეციფიკაცია: `docs/technical/studio-real-workspace/visual-direction-a.md`. ფაზა 1-სა და T12-ში არ ერევა |');

const r71Para = 'Round 71 (D-29z36): ROOT-R66-M1';
const idx = s.indexOf(r71Para);
if (idx < 0) throw new Error('r71 para');
const r72Para = 'Round 72 (D-29z37): SRW-16 (FB-10) ეტაპი 1 — სახელიანი მარკერები (მოდელი, `markers.ts`, მარკერების ხაზი, M/Add, click/ორმაგი click, Ctrl+←/→, F2, Delete, Cut Time-ის remap); 103 ფაილი; doc 064; doc 063-ის სტატუსი. შემდეგ SRW-16 ეტაპი 2 → SRW-17 → SRW-18 → SRW-19 → SRW-20 → Low-ების ჯგუფი → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN. **ფაზა 2 (root 2026-10-20):** ამის შემდეგ B-ის გადაწყვეტილება იქნება BLOCKED — „phase 2 awaiting user go-ahead“. ფარგლები არ მცირდება.\n\n';
s = s.slice(0, idx) + r72Para + s.slice(idx);

rep('ამის შემდეგ იწყება T12. T12-ის შემდეგ ფაზა 2 (PHASE2-VIDEO-SCORING) მხოლოდ მომხმარებლის დასტურით — root-ის ჩანაწერამდე B-ის გადაწყვეტილებაა BLOCKED („phase 2 awaiting user go-ahead“).',
  'ამის შემდეგ იწყება T12, შემდეგ VISUAL-A-OBSIDIAN (root-ის შენიშვნა 2026-10-21, დამატებითი დასტური არ სჭირდება). ამის შემდეგ ფაზა 2 (PHASE2-VIDEO-SCORING) მხოლოდ მომხმარებლის დასტურით — root-ის ჩანაწერამდე B-ის გადაწყვეტილებაა BLOCKED („phase 2 awaiting user go-ahead“).');

fs.writeFileSync(p, s);
console.log('ok');
