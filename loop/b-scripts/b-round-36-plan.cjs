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
if (lines.some((l) => l.startsWith('**D-29z2'))) throw new Error('D-29z2 already present');
const d29z1 = idx('**D-29z1');
const abl = idx('- **Ableton:** ბაგის რაუნდია; ახალი წყარო არ დათვალიერებულა.', d29z1);
const block = [
  '',
  '**D-29z2 — Round 36-ის შედეგი; Round 37: C-R36-01 — სხვა gesture-ის დროს იძულებითი blur Clip Gain-ის აკრეფილ ტექსტს აღარ შლის.** C round 36 (`tmp/studio-real-loop/c-round-36.md`): **PASS** ყველა ID-ზე (G36-1..3, R36-CR 5/5 + ორი Undo + 1280, OT, CL 3/3, R34, K, S, U a–f, Doc). **დაიხურა C-R34-01 და C-R34-02.** ახალი: **C-R36-01** (Medium, არსებული ქცევა, = A-R36-REVIEW-1): Clip Gain-ში `3` (Enter-ის გარეშე) → სხვა pointer-ის gesture აქტიურია (synthetic detail-ის გამყოფი id 41) → რეალური click Master-ზე → focus ბუნებრივად გადადის, `commitClipGain(\'blur\')` gesture-ს ხედავს, blocked status-ს წერს და ტექსტს `0.0`-ზე აბრუნებს — აკრეფილი მნიშვნელობა იკარგება (`c-round-36/runs/ot.txt` OT-5b). რეალურად მხოლოდ ორი ერთდროული pointer-ით მიიღწევა. B-მ gate-ები დამოუკიდებლად გაუშვა (`tmp/studio-real-loop/b-round-36/gates.txt`): HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4, tsc 0, vitest 69/1259, build ✓, Biome 2 CRLF error (root) + 218 warning + 1 info.',
  '- **გადაწყვეტილება (Locus A, ყველაზე მცირე პატიოსანი ქცევა):** `ArrangementDetailPanel.tsx`-ის `commitClipGain`-ში gesture-ის შტო blur-ზე ტექსტს აღარ აბრუნებს: status `GESTURE_EDIT_BLOCKED_MESSAGE` რჩება, ჩანაწერი არ იწერება, ველში აკრეფილი ტექსტი რჩება. gesture-ის დასრულების შემდეგ მომხმარებელი ველზე დაბრუნდება და Enter-ით ან blur-ით (მაგ. კლიპის header-ზე click, round 34) ჩაწერს. **Enter gesture-ის დროს უცვლელია** (ტექსტი ბრუნდება, status blocked — frozen `clip-gain.test.tsx` l.815–831): Enter ნებაყოფლობითი მოქმედებაა და ველი focus-ში რჩება, blur კი იძულებითია (focus სხვა pointer-მა წაიღო).',
  '- **უარყოფილი ალტერნატივები:** (B) root capture-ში gesture-ის დროს range-ზე `preventDefault` — D-29z-ის გადაწყვეტილება 5-ს ცვლის და ყველა მეორე pointer-ის range-ზე დაჭერას (Zoom-ის ჩათვლით) აჩერებს; 4b-ის no-jump click-მა შეიძლება ისედაც `preventDefault` შემოიტანოს. (C) gesture-ის დასრულებისას ავტომატური commit — ახალ context API-ს (`ArrangementContext.tsx`, `StudioWorkspace.tsx`, panel) მოითხოვს მხოლოდ multi-pointer გზისთვის; უარყოფილია როგორც უფრო დიდი ცვლილება, ვიდრე პრობლემა.',
  '- **შეგნებული შეზღუდვა:** pending ტექსტი არსებულ D-29u-ს წესს ემორჩილება — თუ ჩაწერამდე სხვა კლიპი მოინიშნა, ტექსტი უკუიგდება (frozen `clip-gain.test.tsx` l.803). ეს ჩუმი დაკარგვა აღარ არის იმ მომენტში, როცა focus იძულებით იკარგება; status მომხმარებელს ეუბნება, რომ ჯერ ხელი აუშვას.',
  '- **იმავე რაუნდში (მჭიდროდ დაკავშირებული, Low):** A-ს round-36 ტესტის nits — case 7 status-ს ლიტერალით აფიქსირებს (`Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).`), case 8 — `start.value` `4.5` რჩება; l.1272 (ზედმეტი, მაგრამ უვნებელი) D-29z1-ის ბაიტებით რჩება. doc 036-ის „ბრაუზერში არ შემოწმებულა“ A-R36-REVIEW-1-ზე → C-მ გაიმეორა (C-R36-01), Round 37-მა გაასწორა.',
  '- **ფაილები:** `ArrangementDetailPanel.tsx` (მხოლოდ ერთი შტო), `fader-guards.test.tsx` (case 7/8-ის დამატებითი assertion-ები + 5 ახალი `it` round-36-ის describe-ში), doc 036 (ერთი წინადადება + append). `StudioWorkspace.tsx` ახლა frozen-ია (`b-round-36-tree-sha256.txt`, 376).',
  '- **სტატუსები:** C-R34-01, C-R34-02 დაიხურა. FB-04 და SRW-13 რჩება „ბაგია“ (C-R36-01 Clip Gain-ის commit-ის გზაზეა). SRW-13 ეტაპი 4a-fix4 — done (Round 36).',
  '- **checkpoint-oct13 review-ის Low-ების triage:** #1 → DOC015-DELETE-GAP-NOTE (docs, საბოლოო docs pass); #2 = L3-REMOVED-TRACK-TAPS; #3/#4 → 4c-ში შეფასება ან მიღება (meter-ის ღირებულება / crossfade-ის ორმაგი თვლა, კოსმეტიკური); #5 = 4b (pending commit-ების რიგი); #6 → EXPORT-DIALOG-FOCUS-RESTORE (polish); #7 მიღებულია (clamp + გაფრთხილება; კლიპის over-indicator — T12); #8 → C-R6-02/C-R8-01 (Tech Lead); #9 → root.',
  '- **გადანომვრა:** 4b → Round 38 (თუ დიდია, 38/39-ად იყოფა: 4b-1 no-jump click + double-click reset; 4b-2 კლავიშების ჩანაწერები, A-R29-REVIEW-1, pending რიგი, stale refusal status, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE), 4c + polish → შემდეგი.',
  '- **Ableton:** ბაგის რაუნდია; ახალი წყარო არ დათვალიერებულა. იძულებითი focus-ის დაკარგვისას value box-ის ტექსტის ბედი §18.1-ში აღწერილი არ არის — „დაუდასტურებელი“; CZABA-ს გადაწყვეტილება: ტექსტი არ იშლება (D-29u-ს სულისკვეთება).',
];
lines.splice(abl + 1, 0, ...block);

const row37 = idx('| 37 | SRW-13, ეტაპი 4b');
const row38 = idx('| 38 | SRW-13, ეტაპი 4c');
lines[row38] = lines[row38].replace('| 38 |', '| 39–40 |');
lines[row37] = lines[row37].replace('| 37 | SRW-13, ეტაპი 4b |', '| 38 | SRW-13, ეტაპი 4b (საჭიროებისას 38/39) |');
const row36 = idx('| 36 | C-ის ბაგი (Round 35-ის ხელახალი გაგზავნა)');
lines[row36] = lines[row36] + ' **C PASS**; C-R34-01 და C-R34-02 დაიხურა; ახალი C-R36-01 |';
lines[row36] = lines[row36].replace(' | **C PASS**', ' **C PASS**').replace(/ \|$/, ' |');
lines.splice(row36 + 1, 0, '| 37 | C-ის ბაგი (Round 36-ის record) | C-R36-01: სხვა gesture-ის დროს იძულებითი blur Clip Gain-ის ტექსტს აღარ შლის (Enter უცვლელია) + round-36 ტესტის nits + doc 036 (D-29z2) |');

const st36 = idx('- **Round 36: გაგზავნილია.**');
lines[st36] = '- **Round 36: C PASS** (`tmp/studio-real-loop/c-round-36.md`) ყველა ID-ზე, vitest 1259/1259, mutation a–f. დაიხურა C-R34-01 და C-R34-02. ახალი: C-R36-01 (Medium, არსებული, multi-pointer). C-R23-01: 2 NUL (უცვლელი). Round 31–34 + 36-ის 9 ფაილი root-ის checkpoint commit-ისთვის მზადაა.';
lines.splice(st36 + 1, 0, '- **Round 37: გაგზავნილია.** C-R36-01 + ტესტის nits + doc 036 (D-29z2). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srw13 = idx('  - SRW-13: ეტაპები 1 და 2a C PASS');
const before = lines[srw13];
lines[srw13] = before.replace('Round 36 (D-29z1), 4b — Round 37, 4c — Round 38;', 'Round 36 C PASS (D-29z1), multi-pointer-ით Clip Gain-ის დაკარგვა (C-R36-01) — Round 37 (D-29z2), 4b — Round 38, 4c — შემდეგ;');
if (lines[srw13] === before) throw new Error('SRW-13 status line not updated');
const adv = idx('Advisor: B-მ გამოიყენა');
if (!lines[adv].includes('Round 36-ის შემდეგ')) {
  lines[adv] = lines[adv] + ' Round 36-ის შემდეგ advisor ხელმისაწვდომი იყო; B-მ ის წერამდე გამოიძახა და რჩევა გამოიყენა.';
}
fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
