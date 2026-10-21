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
if (lines.some((l) => l.startsWith('**D-29y'))) throw new Error('D-29y already present');

const d29x = idx('**D-29x');
const ableton = idx('- **Ableton:** შენახული §18.1', d29x);
const d29y = [
  '',
  '**D-29y — Round 33-ის შედეგი; Round 34: C-ის ბაგები პირველ რიგში — timeline-ზე click ტექსტურ ველსაც ათავისუფლებს (FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR).** C round 33 (`c-round-33.md`): **PASS** ყველა ID-ზე (G33-1..3, R33-FT, KO, G, K, S, U a–f, Doc). დაიხურა C-R32-01 და C-R31-02. B-მ gate-ები დამოუკიდებლად გაუშვა (`tmp/studio-real-loop/b-round-33/gates.txt`): 376 OK, protected 4/4, tsc 0, vitest 1230/1230, build ✓, Biome 2 CRLF error (root).',
  '- **FOCUS-TEXT-STALE (Medium, C-მ დაადასტურა):** ძებნაში აკრეფის შემდეგ კლიპზე click focus-ს ძებნაში ტოვებს: Delete მკვდარია, Backspace ფარულად ცვლის ფილტრს. მიზეზი იგივეა, რაც C-R32-01-ის.',
  '- **CLIP-GAIN-CLICK-DISCARD (Medium, C-ის REC-2):** Clip Gain-ში Enter-ის გარეშე აკრეფილი მნიშვნელობა სხვა კლიპზე click-ისას იკარგება: `ArrangementDetailContent` clip id-ით keyed-ია, focused input remount-ისას იშლება blur-ის გარეშე, `isContentMountedRef` კი გვიან commit-ს ბლოკავს. ეს არღვევს D-29u-ის „blur = commit“ კონტრაქტს.',
  '- **გადაწყვეტილება:** round 33-ის capture handler focused **ტექსტურ ველსაც** (`isTypingTarget`) ათავისუფლებს. blur clip-ის handler-მდე ხდება, ამიტომ არსებული `commitClipGain(\'blur\')` მნიშვნელობას იმ კლიპზე წერს, რომელზეც აიკრიფა — selection-ის შეცვლამდე. `ArrangementDetailPanel.tsx` და `ArrangementLibrary.tsx` frozen-ია; keydown handler და ყველა predicate byte-identical რჩება.',
  '- **Scrollbar gutter (A-R33-REVIEW-SCROLLBAR):** pointerdown, რომლის target თვითონ scroller-ია და წერტილი მის client box-ს გარეთაა (`x ≥ clientWidth` ან `y ≥ clientHeight`; `scrollbar-gutter: stable`), blur-ს აღარ იწვევს. client box-ის შიგნით (lane-ების ქვემოთ ცარიელი ადგილი) blur რჩება. უარყოფილია `target === scroller`-ის მთლიანად გამორიცხვა: ცარიელ ადგილზე C-R32-01 დაბრუნდებოდა. ეს round 33-ის კონტრაქტის შეგნებული შესწორებაა.',
  '- **scroller-ის გარეთ (OUTSIDE-SCROLLER-DELETE):** ბიბლიოთეკის item-ზე click-ის შემდეგ Delete timeline-ის მონიშვნას შლის — მიღებულია: ბიბლიოთეკას წაშლის მოქმედება არ აქვს, workspace-ის კლავიშები timeline-ის მონიშვნაზე მოქმედებს, თუ focus ტექსტურ ველში ან native range-ზე არ არის.',
  '- **ცნობილი შედეგი:** ძებნაში აკრეფა → კლიპზე click → Backspace კლიპს შლის (undo-ით აღდგება, ერთი ჩანაწერი, სიცარიელე). ეს ბრაუზერის ქცევაა `preventDefault`-ის გარეშე და SRW-24-ს შეესაბამება; Tech Lead ამოწმებს (R34-T).',
  '- **A-R33-REVIEW-TOUCH → Low, ეტაპი 4b:** touch scroll fader-ს blur-ს უკეთებს და pending preview ადრე იწერება; მონაცემი არ იკარგება, C-ს trusted touch input არ აქვს.',
  '- **სტატუსები:** FB-05 → „მოწმდება“ (C-ის ყველა ID PASS-ია, C-ის ბაგები დახურულია; A-R32-REVIEW-1 review-ის Low-ია და რეალური მაუსი მას ხსნის — 4b). FB-04 → „ბაგია“ (CLIP-GAIN-CLICK-DISCARD). SRW-12 → „ბაგია“ (FOCUS-TEXT-STALE) Round 34-ის C PASS-მდე.',
  '- **გადანომვრა:** 4b → Round 35, 4c + polish → Round 36.',
  '- **Ableton:** შენახული §18.1 არ აღწერს focus-ს Arrangement-ზე click-ის შემდეგ, Browser-ის ძებნის ველს ან value box-ის commit-ის მომენტს. სამივე ქცევა „დაუდასტურებელია“ და CZABA-ს მოთხოვნად ჩაიწერა; ახალი წყარო არ დათვალიერებულა.',
];
lines.splice(ableton + 1, 0, ...d29y);

const row33 = idx('| 33 | C-ის ბაგი (Round 32-ის follow-up)');
lines[row33] = '| 33 | C-ის ბაგი (Round 32-ის follow-up) | C-R32-01: timeline-ის scroller-ზე pointerdown focused fader-ს `blur()`-ს უკეთებს (gesture-ის დროს და range target-ზე — არა); pending fader preview ერთ ჩანაწერად (D-29x). **C PASS**; C-R32-01 და C-R31-02 დაიხურა |';
const row34 = idx('| 34 | SRW-13, ეტაპი 4b');
const row35 = idx('| 35 | SRW-13, ეტაპი 4c');
lines[row34] = '| 34 | C-ის ბაგები (Round 33-ის record) | FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR: capture handler ტექსტურ ველსაც ათავისუფლებს, scrollbar gutter-ზე — არა; Clip Gain-ის აკრეფილი მნიშვნელობა blur-ით იწერება (D-29y) |';
lines[row35] = '| 35 | SRW-13, ეტაპი 4b | fader-ის UX (Volume, Master, Pan): click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH |';
lines.splice(row35 + 1, 0, '| 36 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |');

const st33 = idx('- **Round 33: გაგზავნილია.**');
lines[st33] = '- **Round 33: C PASS** (`tmp/studio-real-loop/c-round-33.md`) ყველა ID-ზე, vitest 1230/1230. დაიხურა C-R32-01 და C-R31-02. Record-იდან: FOCUS-TEXT-STALE დადასტურდა (Medium), CLIP-GAIN-CLICK-DISCARD (Medium); A-ს review: A-R33-REVIEW-SCROLLBAR, A-R33-REVIEW-TOUCH (Low). C-R23-01: 2 NUL (უცვლელი). Round 31–33-ის 9 ფაილი root-ის checkpoint commit-ისთვის მზადაა.';
lines.splice(st33 + 1, 0, '- **Round 34: გაგზავნილია.** FOCUS-TEXT-STALE + CLIP-GAIN-CLICK-DISCARD + A-R33-REVIEW-SCROLLBAR (D-29y). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srw13 = idx('  - SRW-13: ეტაპები 1 და 2a C PASS');
lines[srw13] = lines[srw13].replace('C-R32-01 — Round 33 (D-29x), 4b — Round 34, 4c — Round 35;', 'C-R32-01 — Round 33 C PASS (D-29x), ტექსტური ველების focus და Clip Gain-ის დაკარგვა — Round 34 (D-29y), 4b — Round 35, 4c — Round 36;');
if (!lines[srw13].includes('Round 36')) throw new Error('SRW-13 status line not updated');

fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
