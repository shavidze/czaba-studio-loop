const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(p, 'utf8');
const must = (cond, msg) => { if (!cond) { console.error('FAIL', msg); process.exit(1); } };
must(!s.includes('**D-29z7'), 'D-29z7 already present');
const CRLF = String.fromCharCode(13, 10);
const LF = String.fromCharCode(10);
const eolAfter = (needle) => { const i = s.indexOf(needle); const j = s.indexOf(LF, i); return i >= 0 && j > 0 && s[j - 1] === CRLF[0] ? CRLF : LF; };
const eolBefore = (needle) => { const i = s.indexOf(needle); return i >= 2 && s.slice(i - 2, i) === CRLF ? CRLF : LF; };
const anchor = '**ვიდეოს import (SRW-02, FB-15).**';
must(s.indexOf(anchor) > 0, 'anchor');
const block = [
'**D-29z7 — Round 41-ის შედეგი; Round 42: Pan-ი დაკარგული release-ის შემდეგ კლავიატურით აღდგება და window blur-ზე drag-ის აღრიცხვა სრულდება (SRW-13, 4b-2 ჯგუფი 2).** C round 41 (`tmp/studio-real-loop/c-round-41.md`, `c-round-41.json`): **PASS** ყველა კონტრაქტულ ID-ზე — G41-1 (დატვირთვის გარეშე: `npm run verify` exit 0, 73 ფაილი, 1325/1325; პირველი გაშვება Defender-ის დატვირთვით timeout-ებით ჩავარდა — ორივე გაშვება ანგარიშშია), G41-2, G41-3 (ანონიმური `/studio-lab`, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required, Authorization 0), R41-S, R41-U (ძველ კოდზე RF1/RF2/RF5 წითელია; mutation a–h), R41-Doc, R41-RV (6/6 — 1440, 1280, 120 px), R41-SB (10 px stable gutter), R41-NONE, R41-PM, R41-MN-1..4, R41-K. Root-მა round 41 დააკომიტა და გამოაქვეყნა: `ea35611`. B-ის gate-ები: `tmp/studio-real-loop/b-round-41/gates.txt` (tsc 0, vitest 73/1325, 386 OK, protected 4/4).',
'- **დაიხურა C-ის მტკიცებულებით:** C-R40-01 (R41-RV), DOC038-STALE-LINES (R41-Doc).',
'- **ახალი C-R41-01 (Low) — ცალკე რაუნდი არ ენიჭება:** 1024×768-ზე შუა/ვიდეოს ყუთი `min-w-32`-მდე (128 px) ვიწროვდება; ვიდეოს მიზეზი 4 ხაზია და `overflow-hidden` ყუთში ზემოდან და ქვემოდან 4.5 px-ით იჭრება, scroll-ის გარეშე; ჯგუფის Clip Gain-ის მიზეზი ხილულ ზონას 28 px-ით ქვემოთაა (scroll-დება). ეს round 41-ის შედეგია ამ სიგანეზე (ძველი სვეტი scroll-დებოდა), ტექსტი `title`-ითა და `aria-describedby`-ით ხელმისაწვდომია. მომხმარებელმა viewport-ებად 1280×720 და 1440×900 დაასახელა (`publication-checkpoint.json` → `scrollbarUserRequest`) და გეგმაც ორ სავალდებულო viewport-ს ასახელებს; C-მ round 41-ის FAIL-ად არ ჩაწერა. B viewport-ების მატრიცას თვითონ არ აფართოებს: **Tech Lead-ის კითხვა TL-Q-VIEWPORT**. თუ 1280-ზე ვიწრო სიგანე ფარგლებშია, C-R41-01 ჯგუფ 3-მდე დაიგეგმება. კანდიდატი (ჰიპოთეზა, შეუმოწმებელი): ვიდეოს absolute ფენას `justify-center-safe` + `overflow-y-auto` + `STUDIO_SCROLLBAR_CLASS` (`WAVEFORM_BOX_CLASS` უცვლელი; content-ის wheel handler მხოლოდ focus-ში მყოფ რიცხვის ველზე ბლოკავს wheel-ს).',
'- **Round 42 — მხოლოდ `ArrangementLane.tsx`:** ორივე წყვილს ერთი მიზეზი აქვს — Lane-ის Pan-ის აღრიცხვა მხოლოდ drag-ის pointer-ის `pointerup`/`pointercancel`-ზე სრულდება, ამიტომ დაკარგული release მას ჩარჩენილს ტოვებს.',
'  - **A (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK):** Pan-ის slider-ს ემატება `onKeyDown`, რომელიც მხოლოდ blur suppression-ს ხსნის (`preventDefault`/`stopPropagation` არა — Delete/Backspace/Space window-მდე აღწევს). keydown ბრაუზერის `change`-მდე ხდება, ამიტომ იგივე ისარი ერთ `Pan — <ტრეკი>` ჩანაწერს წერს. სხვა ელემენტზე keydown suppression-ს არ ხსნის; keydown-ის გარეშე `change` კვლავ იგნორდება (C-R31-01, frozen `fader-guards`). რეალური გზა: Pan-ის drag → Alt+Tab (Chrome slider-ს blur-ს უკეთებს) → ღილაკი ფანჯრის გარეთ თავისუფლდება → დაბრუნებისას ისრები აღარ მუშაობდა.',
'  - **B (A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES):** `beginPanPointerDrag` window `blur`-ზეც იძახებს თავის `cleanup`-ს (draft `null`, cleanup/pointer ref-ები `null`). context-ი ამ დროს უკვე აუქმებს gesture-ს და შენახულ pan-ს აბრუნებს; Lane-ს აღარ რჩება ძველი draft და სხვა gesture-ის დროს კლავიატურის ცვლილება მხოლოდ ვიზუალურ draft-ად აღარ იქცევა (არსებული gesture-blocked უარი). window blur suppression-ს არ აყენებს და არ ხსნის.',
'- **უარყოფილი:** (a) suppression-ის მოხსნა `focus`-ზე — დაჭერა თვითონ აკეთებს focus-ს; (b) მოხსნა window `blur`-ზე — Alt+Tab-ისას ღილაკი შეიძლება ისევ დაჭერილია და C-R31-01-ის გარანტია დაიკარგება; (c) context-ში ახალი „ჩემი Pan gesture“ API — frozen ფაილი, მეტი ზედაპირი; (d) keydown-ის ფილტრი ღილაკის მიხედვით — არაცვლადი ღილაკი `change`-ს არ იწვევს.',
'- **მიღებული ზღვარი:** თუ მომხმარებელი blur-ის შემდეგ, ისევ დაჭერილი pointer-ით, ღილაკს დააჭერს, suppression იხსნება და ამ pointer-ის შემდგომი native `change` ჩაიწერება; მაუსის დაჭერა round 38-იდან `preventDefault`-ითაა, ამიტომ native thumb drag მაუსზე აღარ ხდება. headless-ში ვერ მეორდება; ახალი ID არ არის.',
'- **Ableton:** ახალი ქცევა არ კოპირდება; ორივე სტრიქონი „არ ეხება“ (CZABA-ს web slider-ის მდგრადობა, D-29w-ის gesture-abort წესი). წყარო — round 37-ის capture (§3.2).',
'- **Root-ის review-ს შესწორება:** round 40–41-ის task-ებში `root-pre-push-review.md`-ის M1–M3, L1–L4, L6–L8 შეცდომით ღიად ეწერა; backlog-ითა და `b-round-32.md`-ით ისინი დახურულია (L5 მიღებულია). Round 42-ის task-ი გასწორებულია.',
'- **შემდეგი რაუნდები:** 43 — ჯგუფი 3 (FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH); 44 — ჯგუფი 4; შემდეგ 4c და polish; შემდეგ SRW-14..20, SRW-21, სრული რეგრესია, T12. მოცულობა უცვლელია.',
''].join(eolBefore(anchor));
s = s.replace(anchor, block + anchor);

const oldRows = [
'| 41 | C-ის ბაგი (Round 40-ის record) | C-R40-01: ჯგუფისა და ვიდეოს მიზეზი შუა ყუთში (ყოველთვის ჩანს); detail content-ს `STUDIO_SCROLLBAR_CLASS`; doc 038-ის ძველი ხაზები (D-29z6) |',
'| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |',
].join(eolAfter('| 41 | C-ის ბაგი (Round 40-ის record) |'));
must(s.includes(oldRows), 'round rows 41-42');
s = s.replace(oldRows, [
'| 41 | C-ის ბაგი (Round 40-ის record) | C-R40-01: ჯგუფისა და ვიდეოს მიზეზი შუა ყუთში (ყოველთვის ჩანს); detail content-ს `STUDIO_SCROLLBAR_CLASS`; doc 038-ის ძველი ხაზები (D-29z6). **C PASS**; C-R40-01, DOC038-STALE-LINES დაიხურა; ახალი C-R41-01 (1024×768, Tech Lead-ის კითხვა) |',
'| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane; D-29z7) |',
].join(eolAfter('| 41 | C-ის ბაგი (Round 40-ის record) |')));

const r41eol = () => eolAfter(r41);
const r41 = '- **Round 41: გაგზავნილია.** C-R40-01 — გამორთული ველების მიზეზი შუა ყუთში + detail content-ის scrollbar (D-29z6). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.';
must(s.includes(r41), 'round 41 status line');
s = s.replace(r41, '- **Round 41: C PASS** (`tmp/studio-real-loop/c-round-41.md`) ყველა კონტრაქტულ ID-ზე, vitest 1325/1325, mutation a–h; root-ის checkpoint `ea35611`. დაიხურა C-R40-01, DOC038-STALE-LINES. ახალი: C-R41-01 (Low, 1024×768 — Tech Lead-ის კითხვა TL-Q-VIEWPORT). C-R23-01/C-R38-01: 3 NUL (11729, 28025, 28026), 1 U+FFFD `aria-label`.' + r41eol() + '- **Round 42: გაგზავნილია.** Pan — keydown blur suppression-ს ხსნის; window blur-ზე Lane-ის Pan drag-ის აღრიცხვა სრულდება (D-29z7). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srwOld = '4b-2 — Round 39–44 (ჯგუფი 1: D-29z4 + D-29z5 — Round 39–40 C PASS, დასრულდა; C-R40-01 — D-29z6, Round 41; ჯგუფები 2–4 — Round 42–44)';
if (s.includes(srwOld)) {
  s = s.replace(srwOld, '4b-2 — Round 39–44 (ჯგუფი 1: D-29z4 + D-29z5 — Round 39–40 C PASS, დასრულდა; C-R40-01 — D-29z6, Round 41 C PASS; ჯგუფი 2 — D-29z7, Round 42; ჯგუფები 3–4 — Round 43–44)');
} else {
  console.log('WARN srw status text not found');
}
fs.writeFileSync(p, s);
console.log('plan.md updated');
