const fs = require('fs');
const p = 'feature-status.md';
const src = fs.readFileSync(p, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';
let lines = src.split(/\r?\n/);
const idx = (prefix, from = 0) => {
  const i = lines.findIndex((l, n) => n >= from && l.startsWith(prefix));
  if (i < 0) throw new Error('missing: ' + prefix);
  return i;
};
if (lines.some((l) => l.includes('Round 37') && l.startsWith('მიმდინარე რაუნდი'))) throw new Error('already updated');

lines[idx('განახლდა:')] = 'განახლდა: 2026-10-13 · ავტორი: B (round 36 → round 37 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`';

const r35t = idx('- **R35-T:**');
lines[r35t] = '- **R35-T (ახლა შესამოწმებელია — Round 36 C PASS):** რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი (Pan-ის ცენტრზე click Pan-ის ჩანაწერს არ წერს). სურვილისამებრ Round 37-ის შემდეგ: touch მოწყობილობაზე ორი თითით C-R36-01.';

const rootStart = idx('- **Round 31 + 32 + 33 + 34 (იგივე 9 ხაზი)');
lines[rootStart] = '- **Round 31 + 32 + 33 + 34 + 36 (იგივე 9 ხაზი) C-მ შეამოწმა და root-ის checkpoint commit-ისთვის მზადაა** (C round 36 PASS; B-მ gate-ები თავიდან გაუშვა: `b-round-36/gates.txt` — 376 OK, tsc 0, vitest 69/1259, build ✓). Root თავად უშვებს check/typecheck/tests/build-ს, review-ს და `npm run test:e2e:smoke`-ს (A/C სერვერს ვერ უშვებს). **Round 37 მეექვსედ ეხება `fader-guards.test.tsx`-სა და doc 036-ს** და ახლა `ArrangementDetailPanel.tsx`-საც: commit A-ს დაწყებამდე ან C-ის round-37 PASS-ის შემდეგ, არა რაუნდის შუაში. შუალედური commit release არ არის.';
lines[idx('- Dev server C round 35-ის დროს მუშაობდა')] = '- Dev server B-ის დაგეგმვისას (17:49) მუშაობდა (200); B-ის gate-ებისას `node.exe` 7 → 7.';

const cur = idx('მიმდინარე რაუნდი: **Round 36**');
const curEnd = idx('**Loop runner:**', cur);
const curBlock = [
  'მიმდინარე რაუნდი: **Round 37** (`current-task.md`, D-29z2) — C-ის ბაგი პირველ რიგში:',
  '- **C-R36-01 (Medium, არსებული ქცევა — `c-round-36/runs/ot.txt` OT-5b):** Clip Gain-ში `3` Enter-ის გარეშე → სხვა pointer-ის gesture აქტიურია → Master-ზე რეალური click → focus გადადის, `commitClipGain(\'blur\')` blocked status-ს წერს და ტექსტს `0.0`-ზე აბრუნებს. მხოლოდ ორი ერთდროული pointer-ით მიიღწევა, მაგრამ მომხმარებლის შეყვანას შლის.',
  '- **გადაწყვეტა (Locus A):** `ArrangementDetailPanel.tsx`-ში gesture-ის შტო blur-ზე ტექსტს აღარ აბრუნებს (status და „ჩანაწერი არ არის“ უცვლელია); Enter gesture-ის დროს უცვლელია. gesture-ის შემდეგ Enter ან blur ჩაწერს. შეზღუდვა: ჩაწერამდე სხვა კლიპის მონიშვნა ტექსტს უკუაგდებს (D-29u-ს არსებული წესი).',
  '- **იმავე რაუნდში:** round-36 ტესტის nits (case 7 status, case 8 `start.value`) და doc 036-ის მოძველებული წინადადება.',
  '- **C:** R37-PG (OT-5b-ის harness: PG-1 Enter, PG-2 blur, PG-3 შეზღუდვა, 1280), R37-MN, R37-CR, R37-K, S, U (mutation a–e), Doc, G37-1..3. `StudioWorkspace.tsx` ახლა frozen-ია.',
  '',
  'შემდეგ: Round 38 — SRW-13 ეტაპი 4b (4b-1: click-ზე არ ხტება + double-click reset; 4b-2: დანარჩენი 4b ბაგები, მაქს. სამი თითო რაუნდში); შემდეგ 4c + polish.',
  '',
];
lines.splice(cur, curEnd - cur, ...curBlock);
const lr = idx('**Loop runner:**');
lines[lr] = '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 37 -StartPhase A`.';
lines.splice(lr + 1, 0, '', '**Round 36-ის შედეგი** (A `a-round-36.md`, C `c-round-36.md`): **C PASS — ყველა ID.**', '- **PASS:** G36-1..3 (vitest 1259/1259, 376 OK, protected 4/4, ანონიმური `/studio-lab`, studio-token 401, `/studio/middle-east` → Sign in required); R36-CR (Volume, Pan-ის ცენტრი, Master, ვიდეოს Volume, Zoom + ორი Undo + 1280); R36-OT (7 სტრიქონი); R36-CL (3/3 ვალიდური, 2 `setTargetAtTime` ფანჯარაში, 0 restart); R36-R34; R36-K; R36-S; R36-U (mutation a–f მოკლულია); R36-Doc.', '- **დაიხურა:** C-R34-01, C-R34-02.', '- **ახალი:** C-R36-01 (Medium, არსებული, = A-R36-REVIEW-1); A-R36-TEST-NITS (Low); DOC036-R36-REVIEW-SENTENCE (Low). stale refusal status ისევ ჩანს (→ 4b).', '- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-36/gates.txt`): HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4, tsc 0, vitest 69/1259, build ✓, Biome 2 CRLF error + 218 warning + 1 info.');

const fb04 = idx('| FB-04 |');
lines[fb04] = '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **ბაგია** (C-ის round-30, 34 და 36 ID-ები PASS-ია; C-R34-01 დაიხურა Round 36-ში. ღიაა C-R36-01, Medium — სხვა pointer-ის gesture-ის დროს იძულებითი blur აკრეფილ ტექსტს შლის, მხოლოდ multi-pointer) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; ბაგი: `c-round-36/runs/ot.txt` OT-5b | Round 37: C-R36-01 (D-29z2). შემდეგ Tech Lead: R30-T, R34-T, R35-T. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |';

const srw13 = idx('| SRW-13 |');
lines[srw13] = '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2, 4a-fix3, 4a-fix4 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R36-01 (Medium) → Round 37) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md` | Round 37: C-R36-01 (D-29z2). Round 38 — 4b-1: click-ზე არ ხტება + double-click reset; 4b-2: FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending რიგი, stale status, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, Master-ის hold tick. შემდეგ 4c: round-9 M1/L8. C-R27-01: Tech Lead |';

const c3401 = idx('| **C-R34-01** |');
lines[c3401] = '| C-R34-01 | Medium | **დაიხურა** (Round 36: R36-CR 5/5 + ორი Undo + 1280, R36-CL 3/3, mutation a–f) | `c-round-36/runs/cr-1440.txt`, `cr-1280.txt`, `cl.txt` | — |';
const c3402 = idx('| C-R34-02 |');
lines[c3402] = '| C-R34-02 | Low | **დაიხურა** (Round 36: R36-Doc) | `c-round-36/gates/snap-036.diff` | — |';
lines.splice(c3402 + 1, 0,
  '| **C-R36-01** | Medium | **ბაგია** (არსებული; Round 37-ში იგზავნება, D-29z2) | `c-round-36/runs/ot.txt` OT-5b; `c-round-36.json` bugs[0]; `a-round-36.md` §4 | სხვა pointer-ის gesture-ის დროს Master-ზე/range-ზე დაჭერა focus-ს იღებს → Clip Gain-ის აკრეფილი ტექსტი `0.0`-ზე ბრუნდება. Fix: blur-ზე ტექსტი რჩება, Enter უცვლელია |',
  '| A-R36-TEST-NITS | Low | **არ დაწყებულა** → Round 37 | `a-round-36.md` §4 | case 7 status, case 8 `start.value`; l.1272 ზედმეტია, მაგრამ D-29z1-ის ბაიტებით რჩება |',
  '| DOC036-R36-REVIEW-SENTENCE | Low | **არ დაწყებულა** → Round 37 | `c-round-36.md` §9 | doc 036: „ბრაუზერში არ შემოწმებულა“ → C-მ გაიმეორა (C-R36-01) |',
  '| DOC015-DELETE-GAP-NOTE | Low | **არ დაწყებულა** | `checkpoint-oct13-review.md` #1 | doc 015-მა Delete-ის სიცარიელე (SRW-24) უნდა ახსენოს → საბოლოო docs pass |',
  '| EXPORT-DIALOG-FOCUS-RESTORE | Low | **არ დაწყებულა** | `checkpoint-oct13-review.md` #6 | export dialog-ის focus-ის დაბრუნება და hidden ელემენტები → polish |',
);
const crit = idx('Critical/High ღია ბაგი არ არის.');
lines.splice(crit + 1, 0, '', '**Round 36:** დაიხურა C-R34-01 და C-R34-02. ახალი: C-R36-01 (Medium, არსებული, multi-pointer), A-R36-TEST-NITS და DOC036-R36-REVIEW-SENTENCE (Low). checkpoint-oct13 review-ის Low-ები დახარისხდა (`b-round-36.md` §6): #1 → DOC015-DELETE-GAP-NOTE, #2 = L3, #3/#4 → 4c ან მიღება, #5 = 4b, #6 → EXPORT-DIALOG-FOCUS-RESTORE, #7 მიღებულია, #8 → C-R6-02/C-R8-01, #9 → root. C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).');

const rr = idx('- round 31 + 32 + 33 + 34-ის 9 ფაილი C-მ შეამოწმა');
lines[rr] = '- round 31 + 32 + 33 + 34 + 36-ის 9 ფაილი C-მ შეამოწმა (Round 36 PASS) და checkpoint commit-ისთვის მზადაა — round 37-ის დაწყებამდე ან მისი C PASS-ის შემდეგ; root-ის gate-ები, review და `npm run test:e2e:smoke` სავალდებულოა;';

fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
