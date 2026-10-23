const fs = require('fs');
const p = '/home/runner/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(p, 'utf8');
const ins = (anchor, text, after) => { const i = s.indexOf(anchor); if (i < 0) { console.error('missing', anchor.slice(0, 50)); process.exit(1); } if (after) { const j = s.indexOf('\n', i) + 1; s = s.slice(0, j) + text + s.slice(j); } else { s = s.slice(0, i) + text + s.slice(i); } };
const block = [
  '**D-29z83 — Round 117-ის შედეგი; Round 118: T12 ეტაპი 3b — ჯგუფის Volume dB-ში და Shift-ით ზუსტი drag.**',
  '',
  'C round 117 (`tmp/studio-real-loop/c-round-117.md`, `c-round-117.json`) — **PASS**, `browserVerified: true`, `realVerified: true`; gate 117 გამოქვეყნდა `9cb820b` (rounds 116 + 117, ორივე remote). T12 ეტაპი 3a → `c_pass_published`; C-R116-01, GATE-116-SKIPPED, GATE115-S4 დაიხურა.',
  '- **R1 — რეგრესიის რაუნდი ჯერ არ დამდგარა:** `regression-last.json` 2026-10-21; დაგეგმვა 2026-10-23 ~21:05 UTC (2 დღე). Round 119-ის დაგეგმვა (2026-10-24-ზე ან შემდეგ) რეგრესიის რაუნდია; ეტაპი 4 მის შემდეგ.',
  '- **R2 — 3b ერთ რაუნდში:** B-ის grep-მა აჩვენა, რომ შესაცვლელი pin-ები მხოლოდ `track-group-mix-ui`-ის ჯგუფის ხაზებში, TV11-სა და CF11-შია; ყველა ჩამოთვლილია `current-task.md` §2.1-ში.',
  '- **R3 — ჯგუფის fader:** dB −60…0, step 0.1, `track-volume-db.ts`-ით (მხოლოდ UI; context/groups/schedule/export წრფივი რჩება); ქვედა ბოლო ზუსტად `0`; title/valuetext `formatTrackVolumeDb`. ხილული readout **არ** ემატება: UM1-ის კონტრაქტი (სტრიქონს ტექსტი არ ემატება, 28 px) და 224 px header (სახელი depth 2-ზე ~16 px დარჩებოდა). სიგნალი GROUP-VOLUME-VISIBLE-READOUT → DESIGN-UX-REVIEW.',
  '- **R4 — ზუსტი დაბრუნება:** ხაზის `volumeGestureStartRef`-ის pattern ჯგუფში კოპირდება (მეორე ასლი). Checkpoint-ის (ab)/(ac) hook-ის ცვლილება ამ რაუნდში არ კეთდება.',
  '- **R5 — Shift:** `FADER_SHIFT_FINE_DIVISOR = 10` (`fader.ts`) ხაზის, ვიდეოს, ჯგუფისა და Master-ის Volume-ზე; Live 12 §42.6 „Finer Resolution When Dragging: Shift“ (დადასტურებული). ფაქტორი 10 და mid-drag ქცევა — დაუდასტურებელი. Pan უცვლელია (შეგნებული განსხვავება, სიგნალი PAN-SHIFT-FINE).',
  '- **R6 — TV11-ის წინასწარი შემოწმება:** plain drag-ის შედეგი `F(-16.4)` −4.4-იდან ათვლას ნიშნავს, თუმცა slider −2.9-ს აჩვენებს. თუ drag ჩვენებულისგან განსხვავებული მნიშვნელობიდან იწყება — STOP, რეალური დეფექტია, B წყვეტს.',
  '- **R7 — gate 117-ის შენიშვნები:** S1 (doc 100 l.4/56/70) → round 118; S2 → სიგნალი TRACK-VOLUME-TAPER; S3 → deferred Low (სულ 160); S5 → info; Architecture note → checkpoint addendum (ac).',
  '',
  '',
].join('\n');
ins('**D-29z82 — Round 116-ის შედეგი;', block, false);
ins('| 117 | C-R116-01 |', '| 118 | T12 ეტაპი 3b | ჯგუფის Volume dB + Shift fine (ხაზი/ვიდეო/ჯგუფი/Master); GATE117-S1; შემდეგ რეგრესიის რაუნდი (D-29z83) |\n', true);
ins('**D-29z82:** round 117-ში A-ს ეკუთვნის', '\n**D-29z83:** round 118-ში A-ს ეკუთვნის `ArrangementGroupHeader.tsx`, `ArrangementLane.tsx` და `ArrangementMaster.tsx` (მხოლოდ fine option), `fader.ts` (კონსტანტა), `track-group-mix-ui.test.tsx` / `track-volume-db.test.tsx` (TV11) / `clip-gain-fader.test.tsx` (CF11) — მხოლოდ §2.1-ის ხაზები, ახალი `group-volume-db.test.tsx`, doc 100 (l.4/56/70) და ახალი doc 101. დანარჩენი გაყინულია (`b-round-117-r118-tree-sha256.txt`, 922).\n', true);
fs.writeFileSync(p, s);
console.log('ok');
