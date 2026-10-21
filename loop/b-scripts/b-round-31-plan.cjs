const fs = require('fs');
const p = '../../docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
const eol = t.includes('\r\n') ? '\r\n' : '\n';
const L = (s) => s.split('\n').join(eol);
function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error(`missing anchor: ${from.slice(0, 80)}`);
  }
  t = t.replace(from, to);
}

const d29w = L(`**D-29w — Round 31-ის შედეგი; Round 32: C-ის ბაგები პირველ რიგში — fader-ზე კლავიშები და pointer-ი (C-R31-02, C-R31-01, R31-U-GAP-B2).** C round 31 (\`c-round-31.md\`): **PASS** ყველა ID-ზე (G31-1..3, R31-PE..Doc; vitest 1193/1193; mutation a–k მოკლულია). R13-M2 დადასტურდა:
- 50L-ზე მარჯვენა არხი 0 LSB-ია, W3C-ის კანონი ≤ 1.41 LSB, EC = E0 0 LSB;
- დაკვრისას ახალი start არ არის, \`setTargetAtTime\` მხოლოდ music panner-ზეა;
- loop-ის ყოველ iteration-ზე ერთი start.

B-მ gate-ები დამოუკიდებლად გაუშვა (\`tmp/studio-real-loop/b-round-31/gates.txt\`): 371 OK, protected 4/4, tsc 0, vitest 1193/1193, build ✓, Biome 2 CRLF error (root).

ახალი ჩანაწერები:
- **C-R31-02 (Medium, არსებული ქცევა):** focused Volume slider-ზე Delete/Backspace არჩეულ კლიპს შლის (Undo აბრუნებს). კოდის მიხედვით იგივეა Master-სა და Zoom-ზე.
- **C-R31-01 (Low, round 31-ის კოდი):** Pan-ის drag-ის შუაში blur-ის შემდეგ, თუ იგივე pointer დაჭერილია და \`input\` გრძელდება, თითო input ცალკე ჩანაწერია.
- **R31-U-GAP-B2:** \`syncPlayback\`-ის reschedule-ის გარეშე pan push-ში override-ის წაშლას არცერთი ტესტი არ აგდებს.

გადაწყვეტილებები:
- **Round 32 = ბაგების რაუნდი** (სამი მჭიდროდ დაკავშირებული ბაგი, ეტაპი 4b-მდე, რადგან 4b იგივე კოდს გადაამუშავებს). 4b → Round 33, 4c + polish → Round 34.
- **Guard მხოლოდ native range-ზე** (\`input[type="range"]\`: Volume, Pan, Master, Zoom). \`role="slider"\` ელემენტები (playhead, overview, ბიბლიოთეკის preview) timeline-ის/ნავიგაციის ობიექტებია; SRW-24-ის flow-ში Delete იქ მონიშვნას შლის, ამიტომ უცვლელი რჩება.
- **A-ს round-31 deviation 1** (Pan-ის \`onKeyDown\` stopPropagation) round 31-ისთვის მიღებულია და Round 32-ში იშლება: workspace-ის guard-ის შემდეგ ის მკვდარი კოდია და გატეხილ guard-ს დამალავდა.
- **C-R31-01: იგნორი, არა გაერთიანება.** blur drag-ს აუქმებს; შემდეგი input-ები იმავე pointer-ის აშვებამდე არაფერს წერს. Volume-ის ქცევა (ერთი ჩანაწერი) უცვლელია და reference ტესტით ფიქსირდება.
- **R31-U-GAP-B2 მიღებულია, როგორც დამცავი კოდი:** gesture-ის დროს ყველა edit და Undo/Redo უარყოფილია, დანარჩენი \`syncPlayback\` გამოძახებები კი reschedule-ს აკეთებს, სადაც override-ს \`startGraph\` ითვალისწინებს (mutation h). A ამ ჩამონათვალს ამოწმებს.
- **A-ს round-31 deviation-ები 2–9 მიღებულია**, მათ შორის 6: \`setTrackPan\` ნებისმიერი gesture-ის დროს უარს ამბობს (round 31 §2.3-ის ფორმულირების შეცვლა).
- **FB-05 → „ბაგია“** (C-ის ყველა ID PASS-ია, მაგრამ Low C-R31-01 FB-05-ის კოდშია). FB-04 „მოწმდება“ იმიტომ გახდა, რომ C-R30-01 არსებული და სხვა ადგილას იყო.
- **4b-ში დაემატა:** A-R31-REVIEW-2 (lane-ის draft gate გლობალურ \`isPointerGestureActive()\`-ს იყენებს) და drag-ის შემდეგ დარჩენილი refusal status.
- **Ableton:** შენახული §18.1 (\`b-round-29/ableton-mixing-20261012.txt\`) კლავიშებს focused mixer control-ზე და focus-ის დაკარგვის შემდეგ pointer-ს არ აღწერს. ეს ქცევები „დაუდასტურებელია“ და CZABA-ს მოთხოვნად აღირიცხება.

`);
rep('**ვიდეოს import (SRW-02, FB-15).**', `${d29w}**ვიდეოს import (SRW-02, FB-15).**`);

rep(
  L('| 32 | SRW-13, ეტაპი 4b | fader-ის UX (Volume, Master, Pan): click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick |\n| 33 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |'),
  L('| 32 | C-ის ბაგები (SRW-13 ეტაპი 4a-ის follow-up) | C-R31-02 (Delete/Backspace focused range-ზე timeline-ს არ ცვლის; Pan-ის workaround იშლება), C-R31-01 (blur-ის შემდეგ input-ები იგნორირდება), R31-U-GAP-B2 (დამცავი კოდი, ჩამონათვალით) (D-29w) |\n| 33 | SRW-13, ეტაპი 4b | fader-ის UX (Volume, Master, Pan): click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick, A-R31-REVIEW-2 |\n| 34 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |'),
);

rep(
  '- **Round 31: გაგზავნილია.** SRW-13 ეტაპი 4a, FB-05 Pan (D-29v). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  L('- **Round 31: C PASS** (`tmp/studio-real-loop/c-round-31.md`) ყველა ID-ზე: R31-PE..Doc, G31-1..3, vitest 1193/1193, mutation a–k. R13-M2 დადასტურდა; FB-05 → „ბაგია“ (Low C-R31-01; R31-T).\n  - ახალი: C-R31-02 (Medium, არსებული), C-R31-01 (Low), R31-U-GAP-B2. C-R23-01: 2 NUL (უცვლელი).\n- **Round 32: გაგზავნილია.** C-R31-02, C-R31-01, R31-U-GAP-B2 (D-29w). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.'),
);

rep(
  'ეტაპი 4a გაგზავნილია Round 31-ში (D-29v), 4b/4c — შემდეგ;',
  'ეტაპი 4a-ის ყველა ID PASS-ია (Round 31, D-29v), მისი ბაგები Round 32-შია (D-29w), 4b — Round 33, 4c — Round 34;',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
