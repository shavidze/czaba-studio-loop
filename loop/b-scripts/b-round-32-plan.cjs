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
if (lines.some((l) => l.startsWith('**D-29x'))) throw new Error('D-29x already present');

const d29w = idx('**D-29w');
const ableton = idx('- **Ableton:** შენახული §18.1', d29w);
const d29x = [
  '',
  '**D-29x — Round 32-ის შედეგი; Round 33: C-ის ბაგი პირველ რიგში — timeline-ზე click fader-იდან focus-ს აშორებს (C-R32-01).** C round 32 (`c-round-32.md`): **FAIL** მხოლოდ ახალ Medium C-R32-01-ზე. PASS: G32-1..3, R32-BC, R32-K, R32-S, R32-U (mutation a–g, b2 გადარჩა — მიღებულია), R32-Doc; R32-DK-ის იზოლირებული რიგები. B-მ gate-ები დამოუკიდებლად გაუშვა (`tmp/studio-real-loop/b-round-32/gates.txt`): 375 OK, protected 4/4, tsc 0, vitest 1212/1212, build ✓, Biome 2 CRLF error (root).',
  '- **C-R32-01:** fader-ზე რეალური click-ის შემდეგ კლიპზე ან ცარიელ lane-ზე click focus-ს fader-იდან არ აშორებს: timeline-ის pointerdown-ები (`ArrangementClip` `beginGesture`, lane background, ruler) `preventDefault`-ს იძახებს, კლიპი და lane body კი focusable არ არის. Round 32-ის `isRangeInputTarget` guard-ი Delete-ს ბლოკავს. Volume/Master/Zoom-ზე ეს regression-ია; იგივე მიზეზით ადრეც არ მუშაობდა Arrow nudge, Enter და Home.',
  '- **გადაწყვეტილება: focus-ის გასწორება, არა guard-ის.** ერთი capture-phase `pointerdown` handler timeline-ის scroller-ზე (`StudioWorkspace.tsx`): focused native range-ს `blur()`, თუ target range არ არის და pointer gesture არ მიმდინარეობს. ეს იმეორებს ბრაუზერის ქცევას `preventDefault`-ის გარეშე (focus → body, C-ის გამვლელი control). უარყოფილია: კლიპზე focus (არ აქვს `tabIndex`, frozen ფაილი), თითო handler-ში გამოძახება (3+ ფაილი), guard-ის დავიწროება (C-R31-02-ს აბრუნებს ან ფარულ state-ს ამატებს).',
  '- **გამონაკლისები:** gesture-ის დროს blur არ ხდება (მეორე pointer-ს claim-ი მაინც უარყოფს; blur მიმდინარე fader drag-ს გააუქმებდა). scroller-ის გარეთ და ტექსტურ ველებზე ქცევა უცვლელია; FOCUS-TEXT-STALE (B-ის დაკვირვება კოდის კითხვით) Round 33-ში მხოლოდ ჩაიწერება.',
  '- **pending keyboard Volume/Master preview** blur-ზე არსებული `onBlur`-ით ერთ ჩანაწერად იწერება, clip gesture-ის claim-მდე (capture phase). ეს ტესტის oracle-ია.',
  '- **A-R32-REVIEW-1 → Low, ეტაპი 4b:** C-მ აჩვენა, რომ რეალური მაუსის `pointerup` (id 1) suppression-ს ხსნის; touch/pen `pointercancel`-ს იღებს; ცვლილება Round 32-ის კონტრაქტს შეცვლიდა.',
  '- **სტატუსები:** C-R31-01 დაიხურა; R31-U-GAP-B2 მიღებულია; C-R31-02 იზოლირებულად გასწორდა და C-R32-01-თან ერთად დაიხურება. FB-05 რჩება „ბაგია“: Round 32 მისი fix-ის რაუნდი იყო და FAIL-ით დასრულდა იმავე flow-ში.',
  '- **გადანომვრა:** 4b → Round 34, 4c + polish → Round 35.',
  '- **Ableton:** შენახული §18.1 არ აღწერს, რომელი view იღებს კლავიშებს კლიპზე click-ის შემდეგ. ქცევები „დაუდასტურებელია“ და CZABA-ს მოთხოვნად ჩაიწერა; ახალი წყარო არ დათვალიერებულა.',
];
lines.splice(ableton + 1, 0, ...d29x);

const row32 = idx('| 32 | C-ის ბაგები');
lines[row32] = '| 32 | C-ის ბაგები (SRW-13 ეტაპი 4a-ის follow-up) | C-R31-02 (Delete/Backspace focused range-ზე timeline-ს არ ცვლის; Pan-ის workaround იშლება), C-R31-01 (blur-ის შემდეგ input-ები იგნორირდება), R31-U-GAP-B2 (დამცავი კოდი, ჩამონათვალით) (D-29w). **C FAIL** მხოლოდ ახალ C-R32-01-ზე; C-R31-01 დაიხურა |';
const row33 = idx('| 33 | SRW-13, ეტაპი 4b');
const row34 = idx('| 34 | SRW-13, ეტაპი 4c');
lines[row33] = '| 33 | C-ის ბაგი (Round 32-ის follow-up) | C-R32-01: timeline-ის scroller-ზე pointerdown focused fader-ს `blur()`-ს უკეთებს (gesture-ის დროს და range target-ზე — არა); pending fader preview ერთ ჩანაწერად (D-29x) |';
lines[row34] = '| 34 | SRW-13, ეტაპი 4b | fader-ის UX (Volume, Master, Pan): click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick, A-R31-REVIEW-2, A-R32-REVIEW-1 |';
lines.splice(row34 + 1, 0, '| 35 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |');

const st32 = idx('- **Round 32: გაგზავნილია.**');
lines[st32] = '- **Round 32: C FAIL** (`tmp/studio-real-loop/c-round-32.md`) მხოლოდ ახალ Medium C-R32-01-ზე. G32-1..3, R32-BC, K, S, U, Doc PASS-ია, vitest 1212/1212. დაიხურა C-R31-01, R31-U-GAP-B2 (მიღებულია); C-R31-02 იზოლირებულად გასწორდა. ახალი Low: A-R32-REVIEW-1 (→ 4b). C-R23-01: 2 NUL (უცვლელი).';
lines.splice(st32 + 1, 0, '- **Round 33: გაგზავნილია.** C-R32-01 (D-29x). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srw13 = idx('  - SRW-13: ეტაპები 1 და 2a C PASS');
lines[srw13] = lines[srw13].replace('მისი ბაგები Round 32-შია (D-29w), 4b — Round 33, 4c — Round 34;', 'მისი ბაგების Round 32 FAIL-ით დასრულდა (C-R32-01, D-29w), C-R32-01 — Round 33 (D-29x), 4b — Round 34, 4c — Round 35;');
if (!lines[srw13].includes('Round 35')) throw new Error('SRW-13 status line not updated');

fs.writeFileSync(p, lines.join(nl));
console.log('ok', lines.length);
