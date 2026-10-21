const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
const src = fs.readFileSync(p, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';
const lines = src.split(/\r?\n/);
const idx = (prefix, from = 0) => {
  const i = lines.findIndex((l, n) => n >= from && l.startsWith(prefix));
  if (i < 0) throw new Error('missing: ' + prefix);
  return i;
};
if (lines.some((l) => l.startsWith('**D-29z'))) throw new Error('D-29z already present');

const d29y = idx('**D-29y');
const ableton = idx('- **Ableton:** შენახული §18.1 არ აღწერს focus-ს', d29y);
const d29z = [
  '',
  '**D-29z — Round 34-ის შედეგი; Round 35: C-ის ბაგი პირველ რიგში — range-ზე დაჭერამდე ტექსტური ველი თავისუფლდება (C-R34-01, C-R34-02).** C round 34 (`c-round-34.md`): **PASS** ყველა ID-ზე (G34-1..3, R34-TS, CG, SB, R33, K, S, U a–g, Doc). დაიხურა FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD და A-R33-REVIEW-SCROLLBAR (რეალური scrollbar — Tech Lead-ის R34-T). B-მ gate-ები დამოუკიდებლად გაუშვა (`tmp/studio-real-loop/b-round-34/gates.txt`): 376 OK, protected 4/4, tsc 0, vitest 1247/1247, build ✓, Biome 2 CRLF error (root).',
  '- **C-R34-01 (Medium, C-მ ბრაუზერში დაადასტურა; = A-R34-REVIEW-1):** Clip Gain-ში Enter-ის გარეშე აკრეფილი მნიშვნელობა იკარგება, როცა მომხმარებელი native range-ს აჭერს (ტრეკის Volume/Pan, Master Volume). range `pointerdown`-ზე gesture-ს იკავებს, ბრაუზერი focus-ს ამის შემდეგ გადაიტანს, `commitClipGain` კი „edit during gesture“ status-ით უარს ამბობს და ძველ ტექსტს აბრუნებს.',
  '- **რატომ მხოლოდ range:** gesture-ის ყველა სხვა მფლობელი (Overview, VideoDock, detail-ის გამყოფი, ხაზის სიმაღლე, კლიპი, loop brace) `pointerdown`-ზე `preventDefault`-ს უძახის, ამიტომ focus ველში რჩება და აკრეფილი მნიშვნელობა მოგვიანებით commit-დება. Native range-ს `preventDefault` native drag-ს დაუკარგავდა — ეს ერთადერთი დაკარგვის გზაა. A ამ სიას pre-flight-ში ამოწმებს.',
  '- **გადაწყვეტილება:** workspace-ის root-ზე ცალკე `onPointerDownCapture`: თუ focused ელემენტი ტექსტური ველია (`isTypingTarget`), `event.target` native range-ია და pointer gesture აქტიური არ არის — `focused.blur()`. blur range-ის საკუთარ `onPointerDown`-მდე ხდება, ამიტომ არსებული `onBlur` მნიშვნელობას gesture-ის გარეშე წერს. სხვა არაფერი: არც `preventDefault`, არც status. Round 34-ის scroller handler, ყველა predicate და keydown handler byte-identical რჩება; `ArrangementDetailPanel.tsx` frozen-ია.',
  '- **მოსალოდნელი ისტორია:** ქრონოლოგიური კუდი `[Clip Gain, Volume]` (ან Pan / Master Volume) — ორი ჩანაწერი, SFX `gainDb 3`, gesture-blocked status-ის გარეშე. fader click-ის წერტილზე ხტება (native; ნახტომის მოხსნა 4b-ია). ორი Undo ორივეს აბრუნებს. Zoom gesture-ს არ იკავებს და რეგრესიის სტრიქონია.',
  '- **ფარგლები:** focused range-ები ახალ კოდს არ ეხება (A-R32-REVIEW-1 / 4b). scroller-ის გარეთ არა-range click უცვლელია (D-29y 4).',
  '- **4b-სთვის:** თუ 4b range-ის `pointerdown`-ს შეცვლის (მაგ. `preventDefault` ნახტომის მოსახსნელად), ეს root capture range-ის gesture-მდე ტექსტური ველის გათავისუფლების ერთადერთი გზა ხდება და უნდა შენარჩუნდეს.',
  '- **C-R34-02 (Low, doc):** headless 10 px-იან ვერტიკალურ gutter-ს იტოვებს (`scrollbar-gutter: stable`); 0 px მხოლოდ ჰორიზონტალური scrollbar-ია. scrollbar-ები დამალულია, ამიტომ gutter-ში hit-test შვილ ელემენტებს აღწევს. doc 036 ერთი წინადადებით სწორდება; B-მ იგივე ტექსტი თავის ფაილებშიც (feature-status §5) გაასწორა.',
  '- **CG-6-ის ორაკულის ფორმულირება (C round 34):** „1 `setTargetAtTime` თითო ცოცხალ ან დაგეგმილ SFX source node-ზე, 0 restart“ — loop-ში დაკვრისას 2, ფანჯრის გარეთ 1.',
  '- **სტატუსები:** SRW-12 → „მოწმდება“, SRW-24 → „მოწმდება“ (R34-TS). FB-04 რჩება „ბაგია“ (C-R34-01 იგივე D-29u კონტრაქტს არღვევს). SRW-13 — „ბაგია“.',
  '- **გადანომვრა:** 4b → Round 36, 4c + polish → Round 37.',
  '- **Ableton:** შენახული §18.1 value box-ის commit-ის მომენტს არ აღწერს. ქცევა „დაუდასტურებელია“ და CZABA-ს მოთხოვნად (D-29u) ჩაიწერა; ბაგის რაუნდისთვის ახალი წყარო არ დათვალიერებულა.',
];
lines.splice(ableton + 1, 0, ...d29z);

const row34 = idx('| 34 | C-ის ბაგები (Round 33-ის record)');
lines[row34] = '| 34 | C-ის ბაგები (Round 33-ის record) | FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR: capture handler ტექსტურ ველსაც ათავისუფლებს, scrollbar gutter-ზე — არა; Clip Gain-ის აკრეფილი მნიშვნელობა blur-ით იწერება (D-29y). **C PASS**; სამივე დაიხურა |';
const row35 = idx('| 35 | SRW-13, ეტაპი 4b');
const row36 = idx('| 36 | SRW-13, ეტაპი 4c');
lines[row36] = '| 37 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |';
lines[row35] = '| 36 | SRW-13, ეტაპი 4b | fader-ის UX (Volume, Master, Pan): click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH; round-35-ის root capture უნდა შენარჩუნდეს |';
lines.splice(row35, 0, '| 35 | C-ის ბაგი (Round 34-ის record) | C-R34-01: workspace-ის root capture range-ზე დაჭერამდე focused ტექსტურ ველს ათავისუფლებს, ამიტომ Clip Gain-ის აკრეფილი მნიშვნელობა commit-დება; C-R34-02 — doc 036-ის შესწორება (D-29z) |');

const st34 = idx('- **Round 34: გაგზავნილია.**');
lines[st34] = '- **Round 34: C PASS** (`tmp/studio-real-loop/c-round-34.md`) ყველა ID-ზე, vitest 1247/1247. დაიხურა FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR. ახალი: C-R34-01 (Medium, = A-R34-REVIEW-1), C-R34-02 (Low, doc). C-R23-01: 2 NUL (უცვლელი). Round 31–34-ის 9 ფაილი root-ის checkpoint commit-ისთვის მზადაა.';
lines.splice(st34 + 1, 0, '- **Round 35: გაგზავნილია.** C-R34-01 + C-R34-02 (D-29z). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srw13 = idx('  - SRW-13: ეტაპები 1 და 2a C PASS');
lines[srw13] = lines[srw13].replace('ტექსტური ველების focus და Clip Gain-ის დაკარგვა — Round 34 (D-29y), 4b — Round 35, 4c — Round 36;', 'ტექსტური ველების focus და Clip Gain-ის დაკარგვა — Round 34 C PASS (D-29y), range-ზე დაჭერისას Clip Gain-ის დაკარგვა — Round 35 (D-29z), 4b — Round 36, 4c — Round 37;');
if (!lines[srw13].includes('Round 37')) throw new Error('SRW-13 status line not updated');

fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
