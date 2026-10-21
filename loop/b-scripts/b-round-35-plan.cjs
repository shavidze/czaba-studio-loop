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
if (lines.some((l) => l.startsWith('**D-29z1'))) throw new Error('D-29z1 already present');

const d29z = idx('**D-29z');
const ableton = idx('- **Ableton:** შენახული §18.1 value box-ის commit-ის მომენტს არ აღწერს.', d29z);
const d29z1 = [
  '',
  '**D-29z1 — Round 35-ის შედეგი; Round 36: C-R34-01 + C-R34-02-ის ხელახალი გაგზავნა B-ის განჩინებით.** A round 35-ში §1.4-ის stop პირობაზე გაჩერდა და `store/`-ში არაფერი შეცვალა (`tmp/studio-real-loop/a-round-35.md`). C-მ (`c-round-35.md`, taskStatus BLOCKED) საკუთარ scratch-ში დაადასტურა: შემოთავაზებული handler-ით `app/lib/arrangement` → 1 failed, ერთადერთი ჩავარდნა frozen `fader-guards.test.tsx` l.1265 (`expected <body> to be <input type="search">`). C-R34-01 ბრაუზერში ოთხივე range-ზე ისევ მეორდება (Volume, Pan, Master, ვიდეოს Volume; 1280-იც). G35-2 და G35-3 PASS. B-მ gate-ები თავიდან გაუშვა (`tmp/studio-real-loop/b-round-35/gates.txt`): ხე უცვლელია (HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4), tsc 0, vitest 1247/1247, build ✓, Biome 2 CRLF error (root).',
  '- **განჩინება (A-ს ვარიანტი 1):** frozen ტესტი `review: during an active Pan drag a clip header pointerdown keeps the search focus` (l.1258–1278) ზუსტად სამ ხაზში იცვლება: სათაური (l.1258) და l.1265 / l.1272 → `expect(document.activeElement).not.toBe(search)`. მიზეზი: ეს assertion მხოლოდ jsdom-ის მდგომარეობას აღწერდა (jsdom pointerdown-ზე focus-ს არ გადაიტანს). C-ის რეალურ ბრაუზერში (`c-round-35/runs/cr-baseline-1440.txt`, ბოლო ორი ბლოკი) ძებნა `ab` → Pan-ზე ან Master-ზე რეალური click → focus range-ზე გადადის უკვე ახლაც. ანუ frozen ხაზი რეალურ ქცევას ეწინააღმდეგებოდა და არა გამოსწორებას. ტესტის ღირებულება რჩება: აქტიური Pan gesture-ის დროს კლიპის header-ზე დაჭერა კლიპების ცხრილს არ ცვლის და ძებნის ტექსტი `ab` რჩება. „gesture აქტიურია → ტექსტური ველი focus-ს ინარჩუნებს“ ახლა ახალ case 10-ს ეკისრება, რეალისტური `preventDefault`-იანი მფლობელით (detail-ის გამყოფი).',
  '- **ვარიანტი 2 უარყოფილია:** ძებნის ველის გამორიცხვა D-29z-ის საკუთარ სტრიქონს („ძებნა → range → focus ტოვებს ძებნას“) და ბრაუზერის ამჟამინდელ ქცევას ეწინააღმდეგება.',
  '- **დაზუსტებები C-ის §6-დან:** (1) Pan-ის ცენტრზე რეალური click მნიშვნელობას 0 → 0 ტოვებს და Pan-ის ჩანაწერს არ წერს — ამ სტრიქონში მოწმდება მხოლოდ Clip Gain-ის commit (SFX `gainDb 3`, +1 `Clip Gain`, blocked status-ის გარეშე); ორჩანაწერიან კუდს Volume / Master / ვიდეოს Volume ამტკიცებს. (2) gesture-ის მფლობელების სიას ემატება lane-ის ფონის marquee (`StudioWorkspace.tsx` ~l.917, `preventDefault` l.921; round 34 ჯერ blur-ს აკეთებს) — დაკარგვის გზა არ არის. (3) mutation (c) = root-ის ატრიბუტი მოხსნილია და scroller-ის capture ჯერ ახალ handler-ს, მერე round 34-ის handler-ს იძახებს (React-ში ელემენტზე ერთი `onPointerDownCapture`-ია) → Master და Zoom ჩავარდება. (4) A-ს case 6 red-ია snapshot-ზე, რადგან focus-ის გათავისუფლებასაც ამოწმებს.',
  '- **A-ს მზა სამუშაო:** `a-round-35/proposed-StudioWorkspace.diff` და `new-describe.tsx.txt` (12 `it`) იგზავნება როგორც იმპლემენტაცია, მაგრამ red-first `store/`-ში თავიდან სრულდება. scratch-ში მხოლოდ `app/lib/arrangement` (37 ფაილი) გაეშვა; სრული vitest `store/`-ში პირველად გაივლის.',
  '- **სტატუსები:** არაფერი გადადის „მზადაა“-ში. C-R34-01 — ისევ ღია (Medium), C-R34-02 — ღია (Low). FB-04 და SRW-13 — „ბაგია“.',
  '- **გადანომვრა:** 4b → Round 37, 4c + polish → Round 38.',
  '- **Ableton:** ბაგის რაუნდია; ახალი წყარო არ დათვალიერებულა. value box-ის commit-ის მომენტი §18.1-ში არ არის აღწერილი — „დაუდასტურებელი“, CZABA-ს მოთხოვნა (D-29u).',
];
lines.splice(ableton + 1, 0, ...d29z1);

const row35 = idx('| 35 | C-ის ბაგი (Round 34-ის record)');
lines[row35] = '| 35 | C-ის ბაგი (Round 34-ის record) | C-R34-01 + C-R34-02 (D-29z). **A გაჩერდა §1.4-ზე** (frozen `fader-guards.test.tsx` l.1265/l.1272 ეწინააღმდეგებოდა კონტრაქტს); `store/` უცვლელია; C BLOCKED, ბაგი მეორდება |';
const row36 = idx('| 36 | SRW-13, ეტაპი 4b');
const row37 = idx('| 37 | SRW-13, ეტაპი 4c');
lines[row37] = lines[row37].replace('| 37 |', '| 38 |');
lines[row36] = lines[row36].replace('| 36 |', '| 37 |').replace('round-35-ის root capture', 'round-36-ის root capture');
lines.splice(row36, 0, '| 36 | C-ის ბაგი (Round 35-ის ხელახალი გაგზავნა) | C-R34-01 + C-R34-02 B-ის განჩინებით (D-29z1): frozen ტესტის 3 ხაზი იცვლება, root capture + 12 ტესტი + doc 036 |');

const st35 = idx('- **Round 35: გაგზავნილია.**');
lines[st35] = '- **Round 35: A გაჩერდა §1.4-ზე, `store/` უცვლელია** (`tmp/studio-real-loop/a-round-35.md`, `c-round-35.md` BLOCKED). C-R34-01 ისევ მეორდება; G35-2/G35-3 PASS; C-R23-01: 2 NUL (უცვლელი).';
lines.splice(st35 + 1, 0, '- **Round 36: გაგზავნილია.** C-R34-01 + C-R34-02 (D-29z + D-29z1 განჩინება). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srw13 = idx('  - SRW-13: ეტაპები 1 და 2a C PASS');
const before = lines[srw13];
lines[srw13] = before.replace('range-ზე დაჭერისას Clip Gain-ის დაკარგვა — Round 35 (D-29z), 4b — Round 36, 4c — Round 37;', 'range-ზე დაჭერისას Clip Gain-ის დაკარგვა — Round 35-ში A გაჩერდა (frozen ტესტი), Round 36 (D-29z1), 4b — Round 37, 4c — Round 38;');
if (lines[srw13] === before) throw new Error('SRW-13 status line not updated');

fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
