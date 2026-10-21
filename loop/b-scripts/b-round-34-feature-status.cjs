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
  lines[i] = to;
  s = lines.join('\n');
};

rep('განახლდა: 2026-10-13 · ავტორი: B (round 33 → round 34 დაგეგმვა)', 'განახლდა: 2026-10-13 · ავტორი: B (round 34 → round 35 დაგეგმვა)');

lineStarting('- **R34-T (ახალი):**', '- **R34-T:** რეალური მაუსით: (1) ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნის ტექსტი უცვლელია; (2) Clip Gain-ში მნიშვნელობა Enter-ის გარეშე → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება (ერთი `Clip Gain` ჩანაწერი); (3) ძებნაში focus-ით timeline-ის scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის — Chrome-შიც და Firefox-ში overlay scrollbar-ებით. headless 10 px gutter-ს იტოვებს, მაგრამ scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს, ამიტომ (3)-ს მხოლოდ რეალური scrollbar ამტკიცებს.');
rep('- **R34-T:** რეალური მაუსით: (1)', '- **R35-T (ახალი):** რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი.\n- **R34-T:** რეალური მაუსით: (1)');

lineStarting('- **Round 31 + 32 + 33 (ყველა 9 ხაზი) C-მ შეამოწმა', '- **Round 31 + 32 + 33 + 34 (იგივე 9 ხაზი) C-მ შეამოწმა და root-ის checkpoint commit-ისთვის მზადაა** (C round 34 PASS; B-მ gate-ები თავიდან გაუშვა: `b-round-34/gates.txt`). Root თავად უშვებს check/typecheck/tests/build-ს და review-ს. **Round 35 მეოთხედ ზედიზედ იგივე 3 ფაილს ეხება** (`StudioWorkspace.tsx`, `fader-guards.test.tsx`, doc 036): commit A-ს დაწყებამდე ან C-ის round-35 PASS-ის შემდეგ, არა რაუნდის შუაში. შუალედური commit release არ არის.');
rep('- Dev server C round 33-ის დროს მუშაობდა (200); B-ის gate-ებისას `node.exe` 8 → 7.', '- Dev server C round 34-ის დროს მუშაობდა (200); B-ის gate-ებისას `node.exe` 7 → 7.');

const curStart = s.indexOf('მიმდინარე რაუნდი: **Round 34**');
const curEnd = s.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
if (curStart < 0 || curEnd < 0) throw new Error('current block missing');
const cur = [
  'მიმდინარე რაუნდი: **Round 35** (`current-task.md`, D-29z) — C-ის ბაგი პირველ რიგში:',
  '- **C-R34-01 (Medium, C-მ ბრაუზერში დაადასტურა; = A-R34-REVIEW-1):** Clip Gain-ში Enter-ის გარეშე აკრეფილი მნიშვნელობა იკარგება, როცა მომხმარებელი ტრეკის Volume/Pan-ს ან Master-ს აჭერს: range gesture-ს იკავებს, ბრაუზერი focus-ს მერე გადაიტანს და `commitClipGain` „edit during gesture“-ით უარს ამბობს.',
  '- **გამოსწორება:** workspace-ის root-ზე ცალკე capture handler: focused ტექსტური ველი + native range target + აქტიური gesture-ის გარეშე → `blur()` range-ის handler-მდე, ამიტომ არსებული `onBlur` მნიშვნელობას წერს. Round 34-ის scroller handler byte-identical რჩება. focused range-ები — 4b.',
  '- **C-R34-02 (Low, doc):** doc 036-ში headless-ის gutter-ის წინადადება სწორდება (10 px ვერტიკალური gutter, 0 px მხოლოდ ჰორიზონტალური).',
  '- **A:** `StudioWorkspace.tsx` (root handler), `fader-guards.test.tsx`-ში ახალი `describe` (≥ 10 `it`, red-first), doc 036 (დამატება + ერთხაზიანი შესწორება).',
  '- **C:** R35-CR, R35-CL (ცოცხალი აუდიო), R35-OT, R35-R34, R35-K, S, U (mutation a–f), Doc, G35-1..3.',
  '',
  'შემდეგ: Round 36 — SRW-13 ეტაპი 4b (fader-ის UX, A-R32-REVIEW-1 და A-R33-REVIEW-TOUCH-ის ჩათვლით); Round 37 — 4c + polish.',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 35 -StartPhase A`.',
  '',
  '**Round 34-ის შედეგი** (C, `c-round-34.md`): **PASS** — ყველა ID.',
  '- **PASS:** G34-1..3 (vitest 1247/1247, 376 OK, protected 4/4, ანონიმური `/studio-lab`); R34-TS (ძებნა → header/lane/clip body/ruler, Delete და Backspace, ძებნის ტექსტი უცვლელი; 1280); R34-CG (CG-1..5, unchanged contract, CG-6 ცოცხალი: 2 `setTargetAtTime` ფანჯარაში — მიმდინარე + დაგეგმილი source, 1 გარეთ, 0 restart); R34-SB (gutter synthetic, ცარიელი ადგილი რეალური click-ით); R34-R33; R34-K; R34-S; R34-U (mutation a–g მოკლულია); R34-Doc.',
  '- **დაიხურა:** FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR (რეალური scrollbar — Tech Lead-ის R34-T).',
  '- **ახალი:** C-R34-01 (Medium), C-R34-02 (Low, doc), A-R34-REVIEW-RESIDUALS (Low: RTL, overlay scrollbar, მარჯვენა ღილაკი).',
  '- **Ableton:** სამივე ქცევა დაუდასტურებელია (§18.1 focus-ზე და value box-ის commit-ზე არაფერს ამბობს).',
  '- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-34/gates.txt`): 376 OK, protected 4/4, tsc 0, vitest 69/1247, build ✓, Biome 2 CRLF error + 218 warning + 1 info. Frozen სია: `b-round-34-tree-sha256.txt` (376).',
  '',
].join('\n');
s = s.slice(0, curStart) + cur + s.slice(curEnd);

lineStarting('| FB-04 |', '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **ბაგია** (C-ის ყველა round-30 და round-34 ID PASS-ია; CLIP-GAIN-CLICK-DISCARD დაიხურა. ღიაა C-R34-01, Medium — Enter-ის გარეშე აკრეფილი მნიშვნელობა range-ზე (Volume/Pan/Master) დაჭერისას იკარგება) | `c-round-30.md` §1–§9 (R30-GE +6.0000 dB, GV/GL, GN); `c-round-34.md` R34-CG; ბაგი: `c-round-34/runs/rec-a-r34-review-1.txt` | Round 35: C-R34-01. შემდეგ Tech Lead: R30-T, R34-T, R35-T. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');
rep('double-click reset და A-R32-REVIEW-1 — ეტაპი 4b (Round 35) |', 'double-click reset და A-R32-REVIEW-1 — ეტაპი 4b (Round 36) |');
lineStarting('| SRW-12 |', '| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მოწმდება** (FOCUS-TEXT-STALE დაიხურა Round 34-ში — C R34-TS; ფუნქციები C-ით დადასტურებულია; დარჩა Tech Lead-ის ხელით შემოწმება) | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17; `c-round-34.md` R34-TS | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Windows-ის ფონტები. R34-T(1)/(3) |');
lineStarting('| SRW-13 |', '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2, 4a-fix3 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R34-01 (Medium) → Round 35) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md` | Round 35: C-R34-01 + C-R34-02 (D-29z). Round 36 — 4b: fader-ის UX, A-R29-REVIEW-1, FADER-KEY-ENTRIES, Master-ის hold tick, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH. Round 37 — 4c: round-9 M1/L8. C-R27-01: Tech Lead |');
rep('fader → კლიპი → Delete Round 33-ში PASS; ძებნა → კლიპი → Delete — FOCUS-TEXT-STALE, Round 34)', 'fader → კლიპი → Delete Round 33-ში PASS; ძებნა → კლიპი → Delete/Backspace Round 34-ში PASS — R34-TS)');
rep('`c-round-33.md` R33-FT; `tasks/round-28.md`', '`c-round-33.md` R33-FT; `c-round-34.md` R34-TS; `tasks/round-28.md`');
rep('| Tech Lead: R28-T. DOC034-UNREACHABLE-NOTE |\n\n## 3.', '| Tech Lead: R28-T, R34-T(1). DOC034-UNREACHABLE-NOTE |\n\n## 3.');

rep('lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური) → ეტაპი 4b (Round 35) |', 'lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური) → ეტაპი 4b (Round 36) |');
rep('რეალური მაუსის click მას ხსნის (C) → ეტაპი 4b (Round 35) |', 'რეალური მაუსის click მას ხსნის (C) → ეტაპი 4b (Round 36) |');
lineStarting('| **FOCUS-TEXT-STALE** |', '| FOCUS-TEXT-STALE | Medium | **დაიხურა** (Round 34: R34-TS — ძებნა → 4 სამიზნე, Delete და Backspace, ძებნის ტექსტი უცვლელი; 1280; must-not) | `c-round-34/runs/ts-1440.txt`, `ts-1280.txt`, `ts-mustnot.txt` | — |');
lineStarting('| **CLIP-GAIN-CLICK-DISCARD** |', '| CLIP-GAIN-CLICK-DISCARD | Medium | **დაიხურა** (Round 34: R34-CG — კლიპის/lane-ის სამიზნეები; range სამიზნე → C-R34-01) | `c-round-34/runs/cg-1to4.txt`, `cg5.txt`, `cg-unchanged.txt`, `cg6-1..4.txt` | — |');
lineStarting('| A-R33-REVIEW-SCROLLBAR |', '| A-R33-REVIEW-SCROLLBAR | Low | **დაიხურა კოდისთვის** (Round 34: gutter synthetic, ცარიელი ადგილი რეალური click-ით, mutation b/c/g მოკლულია) | `c-round-34/runs/sb-*.txt` | რეალური scrollbar — Tech Lead-ის R34-T(3), Firefox-ის overlay ვარიანტით |');
lineStarting('| A-R33-REVIEW-TOUCH |', '| A-R33-REVIEW-TOUCH | Low | **არ დაწყებულა** | `a-round-33.md` §4; `a-round-34.md` §4 R4 | touch scroll timeline-ზე fader-ს და (Round 34-იდან) ტექსტურ ველსაც ათავისუფლებს; pending preview / Clip Gain ადრე იწერება (მონაცემი არ იკარგება) → ეტაპი 4b (Round 36) |\n| **C-R34-01** | Medium | **მუშავდება** (Round 35, D-29z) | `c-round-34/runs/rec-a-r34-review-1.txt`; `c-round-34.json` bugs[0]; `a-round-34.md` §4 R1 | Clip Gain-ში აკრეფა → ტრეკის Volume/Pan-ზე ან Master-ზე დაჭერა → მნიშვნელობა იკარგება (status-ით). Fix: workspace-ის root capture range-მდე ტექსტურ ველს ათავისუფლებს |\n| C-R34-02 | Low | **მუშავდება** (Round 35) | `c-round-34/runs/sb-geometry.txt` | doc 036: headless-ში 10 px ვერტიკალური gutter, 0 px მხოლოდ ჰორიზონტალური. B-მ feature-status §5 თავად გაასწორა |\n| A-R34-REVIEW-RESIDUALS | Low | **არ დაწყებულა** | `a-round-34.md` §4 R2, R3, N | RTL-ის მარცხენა scrollbar, Firefox-ის overlay scrollbar (R34-T), მარჯვენა ღილაკი Clip Gain-ს commit-ს უკეთებს (native blur-ის ტოლი), `transform`/zoom → 4b ან საბოლოო რეგრესია |');

rep('**Round 33:** დაიხურა C-R32-01 და C-R31-02.', '**Round 34:** დაიხურა FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR. ახალი: C-R34-01 (Medium), C-R34-02 (Low), A-R34-REVIEW-RESIDUALS (Low). C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).\n\n**Round 33:** დაიხურა C-R32-01 და C-R31-02.');

rep('| R11-SB | Auto-fit რეალური 10 px scrollbar-ით | headless-ში scrollbar 0 px-ია |', '| R11-SB | Auto-fit რეალური 10 px scrollbar-ით | headless 10 px gutter-ს იტოვებს (`scrollbar-gutter: stable`), მაგრამ scrollbar-ს არ ხატავს; ჰორიზონტალური 0 px-ია (C round 34) |');
lineStarting('| **R34-T** |', '| **R34-T** | რეალური მაუსით რეალურ Chrome-ში: ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნა უცვლელია; Clip Gain-ში Enter-ის გარეშე აკრეფა → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება; ძებნაში focus-ით scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის (Firefox-ში overlay scrollbar-ებითაც) | headless scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს; focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |\n| **R35-T** | რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume/Pan-ზე ან Master-ზე click → +3.0 dB რჩება, ისტორია `[Clip Gain, fader]` | synthetic/CDP pointer; focus-ის გადატანა რეალურ Chrome-ში |');

rep('- round 31 + 32 + 33-ის 9 ფაილი C-მ შეამოწმა (Round 33 PASS) და checkpoint commit-ისთვის მზადაა; root-ის gate-ები და review სავალდებულოა;', '- round 31 + 32 + 33 + 34-ის 9 ფაილი C-მ შეამოწმა (Round 34 PASS) და checkpoint commit-ისთვის მზადაა — round 35-ის დაწყებამდე ან მისი C PASS-ის შემდეგ; root-ის gate-ები და review სავალდებულოა;');

fs.writeFileSync(p, s);
console.log('ok', s.length);
