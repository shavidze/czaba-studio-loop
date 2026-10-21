const fs = require('fs');
const p = 'feature-status.md';
let s = fs.readFileSync(p, 'utf8');
const rep = (from, to) => {
  if (!s.includes(from)) throw new Error('missing: ' + from.slice(0, 80));
  s = s.replace(from, to);
};
const lineStarting = (prefix, to) => {
  const lines = s.split('\n');
  const i = lines.findIndex((l) => l.startsWith(prefix));
  if (i < 0) throw new Error('missing line: ' + prefix);
  lines[i] = typeof to === 'function' ? to(lines[i]) : to;
  s = lines.join('\n');
};
const mustReplaceInLine = (prefix, from, to) =>
  lineStarting(prefix, (l) => {
    if (!l.includes(from)) throw new Error('missing in line ' + prefix + ': ' + from);
    return l.replace(from, to);
  });

rep('განახლდა: 2026-10-13 · ავტორი: B (round 34 → round 35 დაგეგმვა)', 'განახლდა: 2026-10-13 · ავტორი: B (round 35 → round 36 დაგეგმვა)');

lineStarting('- **R35-T (ახალი):**', '- **R35-T:** რეალური მაუსით, Round 36-ის შემდეგ: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი (Pan-ის ცენტრზე click Pan-ის ჩანაწერს არ წერს).');

lineStarting('- **Round 31 + 32 + 33 + 34 (იგივე 9 ხაზი) C-მ შეამოწმა', '- **Round 31 + 32 + 33 + 34 (იგივე 9 ხაზი) C-მ შეამოწმა და root-ის checkpoint commit-ისთვის მზადაა** (C round 34 PASS; round 35-ში `store/` არ შეცვლილა; B-მ gate-ები თავიდან გაუშვა: `b-round-35/gates.txt`). Root თავად უშვებს check/typecheck/tests/build-ს და review-ს. **Round 36 მეხუთედ ზედიზედ იგივე 3 ფაილს ეხება** (`StudioWorkspace.tsx`, `fader-guards.test.tsx`, doc 036): commit A-ს დაწყებამდე ან C-ის round-36 PASS-ის შემდეგ, არა რაუნდის შუაში. შუალედური commit release არ არის.');
rep('- Dev server C round 34-ის დროს მუშაობდა (200); B-ის gate-ებისას `node.exe` 7 → 7.', '- Dev server C round 35-ის დროს მუშაობდა (200); B-ის gate-ებისას `node.exe` 7 → 7.');

const curStart = s.indexOf('მიმდინარე რაუნდი: **Round 35**');
const curEnd = s.indexOf('**Round 34-ის შედეგი**');
if (curStart < 0 || curEnd < 0) throw new Error('current block missing');
const cur = [
  'მიმდინარე რაუნდი: **Round 36** (`current-task.md`, D-29z + D-29z1) — C-R34-01 + C-R34-02-ის ხელახალი გაგზავნა B-ის განჩინებით:',
  '- **C-R34-01 (Medium, ისევ მეორდება — `c-round-35/runs/cr-baseline-1440.txt`):** Clip Gain-ში Enter-ის გარეშე აკრეფილი მნიშვნელობა იკარგება Volume-ზე, Pan-ზე, Master-ზე და ვიდეოს Volume-ზე დაჭერისას.',
  '- **განჩინება (D-29z1):** frozen `fader-guards.test.tsx`-ის review ტესტი (l.1258–1278) ზუსტად სამ ხაზში იცვლება — სათაური და l.1265 / l.1272 → `not.toBe(search)`. მიზეზი: რეალურ ბრაუზერში ძებნა range-ზე დაჭერისას focus-ს უკვე კარგავს (C round 35); ძველი assertion მხოლოდ jsdom-ის მდგომარეობას აღწერდა. დანარჩენი 53 ტესტი byte-identical.',
  '- **A:** round 35-ის მზა handler (`a-round-35/proposed-StudioWorkspace.diff`) და 12 `it` (`a-round-35/new-describe.tsx.txt`) — red-first თავიდან `store/`-ში; doc 036 (დამატება + C-R34-02-ის ერთხაზიანი შესწორება).',
  '- **C:** R36-CR (Pan-ის ცენტრზე click: მხოლოდ Clip Gain-ის commit მოწმდება), R36-CL (ცოცხალი აუდიო), R36-OT, R36-R34, R36-K, S (frozen ტესტის ზუსტად 3 ხაზი), U (mutation a–f; (c) — composed scroller capture), Doc, G36-1..3.',
  '',
  'შემდეგ: Round 37 — SRW-13 ეტაპი 4b (fader-ის UX, A-R32-REVIEW-1 და A-R33-REVIEW-TOUCH-ის ჩათვლით); Round 38 — 4c + polish.',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 36 -StartPhase A`.',
  '',
  '**Round 35-ის შედეგი** (A `a-round-35.md`, C `c-round-35.md`): **A გაჩერდა §1.4-ზე, `store/` უცვლელია; C — BLOCKED.**',
  '- A-მ იპოვა frozen ტესტი, რომელიც ძებნის focus-ის შენარჩუნებას ელოდება Pan-ზე დაჭერისას; C-მ საკუთარ scratch-ში დაადასტურა (1 failed | 776 passed, მხოლოდ l.1265).',
  '- **PASS:** G35-2 (HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4), G35-3 (ანონიმური `/studio-lab` header-იდან და პირდაპირ; token/recording/download/R2 მოთხოვნა არ არის; Authorization 0 drag-ის დროსაც; `/studio/middle-east` → Sign in required).',
  '- **არ გაშვებულა** (ცვლილება არ იყო): R35-OT, CL, R34, K, S, U, Doc. G35-1 — baseline მწვანეა (1247/1247), მაგრამ ახალი ტესტები არ არის.',
  '- **სტატუსები:** არაფერი გადავიდა „მზადაა“-ში. C-R23-01: 2 NUL 28013/28014 (63 520 byte, უცვლელი).',
  '- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-35/gates.txt`): ხე უცვლელია, tsc 0, vitest 69/1247, build ✓, Biome 2 CRLF error + 218 warning + 1 info.',
  '',
].join('\n');
s = s.slice(0, curStart) + cur + s.slice(curEnd);

mustReplaceInLine('| FB-04 |', '| Round 35: C-R34-01.', '| Round 36: C-R34-01 (Round 35-ში A frozen ტესტზე გაჩერდა; ბაგი ისევ მეორდება — `c-round-35/runs/cr-baseline-1440.txt`).');
mustReplaceInLine('| FB-05 |', 'ეტაპი 4b (Round 36) |', 'ეტაპი 4b (Round 37) |');
mustReplaceInLine('| SRW-13 |', 'და C-R34-01 (Medium) → Round 35)', 'და C-R34-01 (Medium) → Round 36; Round 35-ში A გაჩერდა)');
mustReplaceInLine('| SRW-13 |', 'Round 35: C-R34-01 + C-R34-02 (D-29z). Round 36 — 4b:', 'Round 36: C-R34-01 + C-R34-02 (D-29z + D-29z1). Round 37 — 4b:');
mustReplaceInLine('| SRW-13 |', 'Round 37 — 4c:', 'Round 38 — 4c:');

for (const prefix of ['| A-R31-REVIEW-2 |', '| A-R32-REVIEW-1 |', '| A-R33-REVIEW-TOUCH |']) {
  mustReplaceInLine(prefix, 'ეტაპი 4b (Round 36)', 'ეტაპი 4b (Round 37)');
}
lineStarting('| **C-R34-01** |', (l) => l.replace('**მუშავდება** (Round 35, D-29z)', '**ბაგია** (Round 35-ში fix არ ჩაჯდა — A frozen ტესტზე გაჩერდა; C-მ ოთხივე range-ზე ისევ გაიმეორა) → Round 36 (D-29z1)').replace('`a-round-34.md` §4 R1 |', '`a-round-34.md` §4 R1; `c-round-35/runs/cr-baseline-1440.txt`, `cr-baseline-1280.txt` |'));
lineStarting('| C-R34-02 |', (l) => l.replace('**მუშავდება** (Round 35)', '**ბაგია** (doc 036 უცვლელია) → Round 36'));
lineStarting('| A-R34-REVIEW-RESIDUALS |', (l) => l.replace('→ 4b ან საბოლოო რეგრესია', '→ 4b (Round 37) ან საბოლოო რეგრესია'));

rep('**Round 34:** დაიხურა FOCUS-TEXT-STALE', '**Round 35:** A §1.4-ზე გაჩერდა (frozen ტესტი), `store/` უცვლელია; C BLOCKED; C-R34-01 ისევ მეორდება; G35-2/G35-3 PASS. C-R23-01: 2 NUL (უცვლელი).\n\n**Round 34:** დაიხურა FOCUS-TEXT-STALE');

lineStarting('| **R35-T** |', (l) => l.replace('→ +3.0 dB რჩება, ისტორია `[Clip Gain, fader]`', '→ +3.0 dB რჩება, ისტორია `[Clip Gain, fader]` (Round 36-ის შემდეგ; Pan-ის ცენტრზე Pan-ის ჩანაწერი არ იწერება)'));

rep('- round 31 + 32 + 33 + 34-ის 9 ფაილი C-მ შეამოწმა (Round 34 PASS) და checkpoint commit-ისთვის მზადაა — round 35-ის დაწყებამდე ან მისი C PASS-ის შემდეგ;', '- round 31 + 32 + 33 + 34-ის 9 ფაილი C-მ შეამოწმა (Round 34 PASS; round 35-ში არაფერი შეცვლილა) და checkpoint commit-ისთვის მზადაა — round 36-ის დაწყებამდე ან მისი C PASS-ის შემდეგ;');

fs.writeFileSync(p, s);
console.log('ok', s.length);
