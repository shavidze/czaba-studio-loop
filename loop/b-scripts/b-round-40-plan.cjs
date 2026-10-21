const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(p, 'utf8');
const CRLF = String.fromCharCode(13, 10);
const LF = String.fromCharCode(10);
const must = (cond, msg) => { if (!cond) { console.error('FAIL', msg); process.exit(1); } };
must(!s.includes('**D-29z6'), 'D-29z6 already present');
const anchor = '**ვიდეოს import (SRW-02, FB-15).**';
const ai = s.indexOf(anchor);
must(ai > 0, 'anchor');
const nl = s.slice(ai - 2, ai) === CRLF ? CRLF : LF;
const block = [
'**D-29z6 — Round 40-ის შედეგი; Round 41: გამორთული ველების მიზეზი ყოველთვის ჩანს (C-R40-01) + detail content-ის scrollbar.** C round 40 (`tmp/studio-real-loop/c-round-40.md`, `c-round-40.json`): **PASS** ყველა კონტრაქტულ ID-ზე — G40-1..3 (`npm run verify` exit 0, 72 ფაილი, 1319/1319; 383 OK; protected 4/4; ანონიმური `/studio-lab`, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required, Authorization 0), R40-S, R40-U (snapshot-ზე F1–F4/F8 წითელია; mutation a–i), R40-Doc, R40-PM (PM-1, PM-1280, PM-2, PM-3, PM-KEPT-TAB, PM-RAW, PM-RESET, PM-TAB, PM-R30: ნიშანი 1 ხაზი, 69.8 px, scroller +0), R40-INFO (info ხაზები 16 px, გადაფარვა არ არის, scroll ბოლომდე აღწევს), R40-MN-1..6, R40-CR, R40-K. B-ის gate-ები: `tmp/studio-real-loop/b-round-40/gates.txt`.',
'- **დაიხურა C-ის მტკიცებულებით:** C-R39-01 (R40-PM), C-R30-01 (R40-INFO), C-R37-01 (ბოლო ღია ნაწილი — ნიშნის ხილვადობა). 4b-2-ის ჯგუფი 1 (D-29z4 + D-29z5) დასრულებულია.',
'- **DETAIL-REASON-FIT → C-R40-01 (Low, C-ის მტკიცებულება, არსებული layout):** Clip Gain-ის გამორთვის მიზეზი `w-32`-ში 3 ხაზად (48 px) იშლება და ხილულ ზონას ქვემოთ იჭრება — ვიდეო: 21 px (1440) / 23 px (1280); ჯგუფი: 21 px (1440) / 43 px (1280, panel 122, content 85); 45 px 120 px-იან მინიმუმზე; range-ის მიზეზი 1280-ის ჯგუფში 21 px-ით. content scroll-დება, მაგრამ scrollbar არ ჩანს (headless; scroller-ს scrollbar-ის სტილი არ აქვს). round 40-ის რეგრესია არ არის — მიზეზის `<p>`-ები snapshot-ის იდენტურია.',
'- **B-ის გაზომვა** (gstack `/browse`, `tmp/studio-real-loop/b-round-40/measure-none-1440.txt`): 1440×900, ნაგულისხმევი 144 px: scroller 107/107; სვეტები — info 288, შუა ყუთი **500 × 91**, range 176, Clip Gain 128 (ყველა 91 px სიმაღლის). ტექსტის nowrap სიგანე (12/16 px): ვიდეოს მიზეზი 345.5, ჯგუფის Clip Gain 320.6, ჯგუფის range 256.3, „ჯერ აირჩიე კლიპი“ 114.4, ვიდეოს placeholder 180.8. 1280-ზე შუა ყუთი C-ის კოორდინატებით ≈ 340 px.',
'- **რატომ არა იმავე სვეტში:** C-ის რიცხვებით ვერცერთი სტრიქონის სიგრძე და სვეტის შიგნით გადაადგილება ყველა რეალურ მდგომარეობას ვერ ფარავს — 1280-ის ჯგუფში (content 85) ერთხაზიანი მიზეზიც ~11 px-ით იჭრება, 120 px-ზე ~13 px-ით; მიზეზის მოკლე ხილული თავსართი კი (`truncate`, D-29z5 f) ინფორმაციას მალავს. scrollbar მარტო საკმარისი არ არის: headless Chromium scrollbar-ს არ ხატავს (`c-round-4.md` R23-1), ხოლო ვიდეოს მდგომარეობაში range-ის ველები focus-დება, ამიტომ scroller-ი კლავიატურით არ scroll-დება.',
'- **კონტრაქტი (მხოლოდ `ArrangementDetailPanel.tsx`):**',
'  - **ჯგუფი** (`!clip && group`): range-ისა და Clip Gain-ის მიზეზის `<p>`-ები (იგივე `id`, `data-testid`, `text-dim`, ტექსტი; `truncate` და `title` არა) შუა, ახლა ცარიელ ყუთშია — ჯერ range-ის, მერე Clip Gain-ის; ყუთი ზემოდან იწყება (`flex flex-col gap-0.5 px-2 py-1`). სვეტებში მიზეზი აღარ არის.',
'  - **ვიდეო:** Clip Gain-ის მიზეზი ვიდეოს waveform-ის ყუთშია, placeholder-ის ტექსტის ქვეშ (ცენტრირებული სვეტი); placeholder-ის `data-testid` ელემენტის `textContent` უცვლელია, მიზეზი მის შიგნით არ არის.',
'  - **არაფერი არჩეული:** უცვლელი — ორივე მიზეზი 1 ხაზია და თავის სვეტშია (C RS-NONE: 0 px); იგივე ინფორმაცია („აირჩიე კლიპი …“) info სვეტის პირველ ხაზზე ყოველთვის ჩანს.',
'  - inputs-ის `title`, `aria-describedby`, `disabled` და Tab-ის რიგი უცვლელია; აუდიოკლიპის მდგომარეობა (waveform, ნიშანი) უცვლელია.',
'  - **scrollbar:** content-ის scroller-ს ემატება არსებული `STUDIO_SCROLLBAR_CLASS` (`studio-scrollbar.ts`, library-სა და timeline-ის იგივე graphite რეილი; მომხმარებლის 2026-10-07 მოთხოვნა — ერთიანი scrollbar-ები). `scrollbar-gutter: stable` 10 px-ს ყოველთვის იტოვებს — shrink-0 სვეტები უცვლელია, შუა `flex-1` ყუთი 10 px-ით ვიწროვდება, სამაგიეროდ selection-ის ცვლისას layout არ ხტება. ვიზუალი headless-ში არ ჩანს → Tech Lead R23-1-ის გაგრძელება.',
'  - **doc 038:** ძველი ხაზები (l.45 „`0 dB` ღილაკის ქვემოთ“, TODO-ს ძველი round-ის ნომრები, C-R30-01 polish-ში, „ნიშნის მესამე ხაზი“) round 40-ის შედეგით სწორდება; ახალი სექცია round 41-ისთვის.',
'- **უარყოფილი:** (a) მიზეზის ტექსტის შემოკლება — frozen ტესტები ზუსტ ტექსტს ამოწმებს და 1280-ის ჯგუფში ერთი ხაზიც არ ეტევა; (b) `truncate` + `title` — D-29z5 (f); (c) მიზეზი იმავე სვეტში disabled ღილაკის წინ — 1280-ის ჯგუფში და 120 px-ზე მაინც იჭრება; (d) ცალკე ფიქსირებული რიგი scroller-ის ზემოთ/ქვემოთ — 16+ px-ს ართმევს scroller-ს; (e) header-ში — selection-ის სათაურს ეჯიბრება და დაკეცილ panel-შიც ჩანს; (f) ნაგულისხმევი სიმაღლის გაზრდა — D-29j; (g) მხოლოდ scrollbar — ზემოთ.',
'- **რისკი, რომელსაც C ამოწმებს:** 1280-ის ჯგუფში ყუთის შიდა სიგანე ≈ 312 px → Clip Gain-ის მიზეზი 2 ხაზი; ჯამი 8 + 16 + 2 + 32 = 58 ≤ 69 px. ვიდეო 1280 / 120 px: 16 + 4 + 32 = 52 ≤ 67 px.',
'- **Round 40-ის checkpoint:** round 39-ისა და 40-ის ფაილები C-ის sha-ებით (`ArrangementContext.tsx` `91fa12d6`, doc 037 `9d9f2122`, `pending-status.test.tsx` `f2cd4b53`, `ArrangementDetailPanel.tsx` `dbcd5c2f`, doc 038 `947d9f83`, `detail-panel-fit.test.tsx` `dac18003`) **მზადაა root-ის შუალედური checkpoint-ისთვის**; ღიაა C-R40-01 (Low, არსებული). Round 41 იგივე panel-სა და doc 038-ს ცვლის — commit A-ს დაწყებამდე, მხოლოდ ამ 6 ბილიკით.',
'- **C-ის შესწორებები task-ის ტექსტში:** „იგივე top ±2 px“ → „იგივე ცენტრი ±2 px“ (`items-center`); 1280×720-ის კანონიკური fresh-load baseline — panel 142 / პირველი ხაზი 273.',
'- **Ableton:** ახალი ქცევა არ არის; მიზეზის განლაგება და scrollbar — CZABA-ს layout, „არ ეხება“.',
'- **შემდეგი რაუნდები:** 42 — Pan-ის ჯგუფი (4b-2 ჯგუფი 2); 43 — ჯგუფი 3; 44 — ჯგუფი 4; შემდეგ 4c და polish. მოცულობა უცვლელია.',
''].join(nl);
s = s.replace(anchor, block + anchor);

const tl = s.includes('| 41 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 |') ? (s.includes('(Pan, მხოლოდ Lane) |' + CRLF) ? CRLF : LF) : LF;
const oldRows = [
'| 40 | C-ის ბაგები (Round 39-ის record) — detail panel-ის ჩატევა | C-R39-01 (ნიშანი ერთ ხაზზე `0 dB`-ის გვერდით + `ring-warning`), C-R30-01 (info სვეტი `shrink-0`); DETAIL-REASON-FIT — მხოლოდ C-ის გაზომვა (D-29z5) |',
'| 41 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |',
'| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 3 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH |',
'| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER |',
].join(tl);
must(s.includes(oldRows), 'round rows 40-43');
const newRows = [
'| 40 | C-ის ბაგები (Round 39-ის record) — detail panel-ის ჩატევა | C-R39-01 (ნიშანი ერთ ხაზზე `0 dB`-ის გვერდით + `ring-warning`), C-R30-01 (info სვეტი `shrink-0`); DETAIL-REASON-FIT — მხოლოდ C-ის გაზომვა (D-29z5). **C PASS**; C-R39-01, C-R30-01, C-R37-01 დაიხურა; DETAIL-REASON-FIT → C-R40-01 |',
'| 41 | C-ის ბაგი (Round 40-ის record) | C-R40-01: ჯგუფისა და ვიდეოს მიზეზი შუა ყუთში (ყოველთვის ჩანს); detail content-ს `STUDIO_SCROLLBAR_CLASS`; doc 038-ის ძველი ხაზები (D-29z6) |',
'| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |',
'| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 3 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH |',
'| 44 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER |',
].join(tl);
s = s.replace(oldRows, newRows);

const r40 = '- **Round 40: გაგზავნილია.** detail panel-ის ჩატევა: C-R39-01, C-R30-01; DETAIL-REASON-FIT — მხოლოდ გაზომვა (D-29z5). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.';
const ri = s.indexOf(r40);
must(ri > 0, 'round 40 status line');
const rl = s.slice(ri + r40.length, ri + r40.length + 2) === CRLF ? CRLF : LF;
s = s.replace(r40, '- **Round 40: C PASS** (`tmp/studio-real-loop/c-round-40.md`) ყველა კონტრაქტულ ID-ზე, vitest 1319/1319, mutation a–i. დაიხურა C-R39-01, C-R30-01, C-R37-01. ახალი: C-R40-01 (Low, არსებული — DETAIL-REASON-FIT-ის გაზომვიდან). C-R23-01/C-R38-01: 5 NUL იგივე offset-ებზე, 2 U+FFFD `aria-label`. Round 39–40-ის 6 ფაილი checkpoint-ისთვის მზადაა (D-29z6).' + rl + '- **Round 41: გაგზავნილია.** C-R40-01 — გამორთული ველების მიზეზი შუა ყუთში + detail content-ის scrollbar (D-29z6). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const srwOld = '4b-2 — Round 39–43 (ჯგუფი 1: D-29z4 — Round 39 C PASS ყველა ID-ზე C-R39-01-ის გარდა; ჩატევის follow-up: D-29z5, Round 40)';
if (s.includes(srwOld)) {
  s = s.replace(srwOld, '4b-2 — Round 39–44 (ჯგუფი 1: D-29z4 + D-29z5 — Round 39–40 C PASS, დასრულდა; C-R40-01 — D-29z6, Round 41; ჯგუფები 2–4 — Round 42–44)');
} else {
  console.log('WARN srw status text not found');
}
fs.writeFileSync(p, s);
console.log('plan.md updated', 'nl', nl.length, 'tl', tl.length, 'rl', rl.length);
