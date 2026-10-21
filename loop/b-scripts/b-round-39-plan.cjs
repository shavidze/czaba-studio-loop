const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(p, 'utf8');
const CRLF = String.fromCharCode(13, 10); const LF = String.fromCharCode(10); const ai = s.indexOf('**ვიდეოს import (SRW-02, FB-15).**'); const nl = s.slice(ai - 2, ai) === CRLF ? CRLF : LF; const tl = s.includes('ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |' + CRLF) ? CRLF : LF; console.log('nl', nl.length, 'tl', tl.length);
const must = (cond, msg) => { if (!cond) { console.error('FAIL', msg); process.exit(1); } };
must(!s.includes('**D-29z5'), 'D-29z5 already present');
const anchor = '**ვიდეოს import (SRW-02, FB-15).**';
must(s.includes(anchor), 'anchor');
const block = [
'**D-29z5 — Round 39-ის შედეგი; Round 40: detail panel-ის ჩატევა — შეუნახავი Clip Gain-ის ნიშანი ერთ ხაზზე (C-R39-01), info სვეტის გადაფარვა (C-R30-01), Clip Gain/range-ის მიზეზის ხაზები (DETAIL-REASON-FIT).** C round 39 (`tmp/studio-real-loop/c-round-39.md`, `c-round-39.json`): **FAIL მხოლოდ ერთ Low ბაგზე — C-R39-01**; ყველა დანარჩენი ID PASS-ია: G39-1..3 (`npm run verify` exit 0, 71 ფაილი, 1312/1312; 380 OK; protected 4/4; ანონიმური `/studio-lab`, token 401, `/studio/middle-east` → Sign in required, Authorization 0), R39-S, R39-ST (ST-1..6 + 1280: უარის status release-ის შემდეგ ბრუნდება), R39-PM (PM-2, PM-3, PM-RAW, PM-VID, PM-KEPT-TAB), R39-PO (unit-only, mutation g/h), R39-MN, R39-CR, R39-K, R39-U (mutation a–h + b2; (b)-ს იჭერს S3-same-act, არა S3), R39-Doc. B-ის gate-ები: `tmp/studio-real-loop/b-round-39/gates.txt`.',
'- **დაიხურა C-ის მტკიცებულებით:** C-R31-INFO-REFUSAL-STATUS (R39-ST); PENDING-COMMIT-ORDER (**მხოლოდ unit** — R39-PO, PO1 წითელია snapshot-ზე, mutation g; ბრაუზერში აუგებელია). C-R37-01: ნაწილები 1–2 სემანტიკურად PASS-ია, ნაწილი 3 მიღებულია (D-29z4); ღია რჩება ნაწილი 1-ის ხილვადობა = **C-R39-01**.',
'- **C-R39-01 (Low):** 144 px-იან ნაგულისხმევ სიმაღლეზე ნიშნის ტექსტი `w-32` slot-ში 3 ხაზად (48 px) იშლება; content-ის scroller-ი (clientHeight 107, scrollHeight 122) მე-3 ხაზს („აბრუნებს“) 15 px-ით ჭრის — 1440×900-ზეც და 1280×720-ზეც. focus-ისას teal `ring-brand` ნარინჯისფერ ჩარჩოს ფარავს. A-მ წინასწარ გაამჟღავნა; რეგრესია არ არის. C-R39-INFO-KEPT-PREMISE: PM-KEPT-ის ნაბიჯი (Master-ზე click) round 38-ის შემდეგ ველს blur-ს აღარ უკეთებს — სწორი ნაბიჯია REAL Tab, სანამ gesture 41 დაჭერილია (C-ის PM-KEPT-TAB).',
'- **B-ის გაზომვა** (gstack `/browse`, 1440×900, `tmp/studio-real-loop/b-round-39/measure-1440.txt`, `measure-reason-1440.txt`; DOM-ში დროებითი ელემენტი, source უცვლელი): slot 128 px, ფონტი 12/16 px; „შეუნახავია“ nowrap = 69.8 px, სრული ტექსტი 257.5 px; `0 dB` ღილაკი 44.2 px; scroller 107/107 ნიშნის გარეშე. ერთი ხაზი (16 px) ცალკე სტრიქონზე → 3 px იჭრება (არ ეტევა); ღილაკის გვერდით: 44.2 + 4 + 69.8 = 118 ≤ 128 (10 px მარაგი) → ნიშანი სვეტის სიმაღლეს **0 px**-ს მატებს. იგივე გაზომვით Clip Gain-ის ვიდეოს მიზეზი (345.5 px) და ჯგუფის მიზეზი (320.6 px) იმავე slot-ში 3 ხაზს (48 px) იკავებს, ანუ იმავე წესით იჭრება → **DETAIL-REASON-FIT** (B-ის probe; ნამდვილ state-ში C ზომავს). range-ის ჯგუფის მიზეზი (`w-44`) — 2 ხაზი.',
'- **რატომ ეს ჯგუფი:** workflow — ჯერ C-ის ბაგები. სამი მჭიდროდ დაკავშირებული ბაგი ერთი დეფექტის ოჯახიდან და ერთ ფაილში — detail panel-ის content-ი თავის სიმაღლეში არ ეტევა: C-R39-01, C-R30-01 (1280×720-ზე, range-ით, info სვეტის `truncate` ხაზები flex სვეტში იკუმშება და ერთმანეთს ეფარება), DETAIL-REASON-FIT. Pan-ის ჯგუფი Round 41-ზე გადადის, შემდეგი ჯგუფები — თითო რაუნდით. მოცულობა არ მცირდება.',
'- **კონტრაქტი (მხოლოდ `ArrangementDetailPanel.tsx`):**',
'  - **ნიშანი:** იგივე პირობა (`isClipGainPending`) და იგივე `id`/`data-testid`/`aria-describedby`. ნიშანი `0 dB` ღილაკთან ერთ `flex items-center gap-1` რიგშია. ხილული ნაწილი — მხოლოდ „შეუნახავია“ (`truncate`, ერთ ხაზზე); დანარჩენი „ — Enter ინახავს, Esc აბრუნებს“ — `sr-only` span-შია, ამიტომ ელემენტის `textContent` და accessible description ზუსტად round 39-ის ტექსტია; სრული ტექსტი `title`-შიც (ნიშანზე და, როცა pending-ია, ველზე). pending ველის focus ring — `focus-visible:ring-warning` (`ring-brand`-ის ნაცვლად); ჩარჩო `border-warning` უცვლელია.',
'  - **მიზეზის ხაზები:** Clip Gain-ის (`arrangement-detail-clip-gain-reason`) და range-ის (`arrangement-detail-reason`) მიზეზი — ერთი ხაზი `truncate`-ით და `title` = სრული ტექსტი; ტექსტი, `id` და `aria-describedby` უცვლელია (screen reader-ი სრულს კითხულობს).',
'  - **info სვეტი:** სვეტის `truncate` შვილებს `shrink-0` — ხაზები აღარ იკუმშება და აღარ ეფარება; თუ content-ი არ ეტევა, ის `overflow-y-auto` scroller-ით ჩანს (scroll), არა გადაფარვით. ნაგულისხმევი სიმაღლე და openHeightCap უცვლელია.',
'  - **უარყოფილი:** (a) ტექსტის შემოკლება ინფორმაციის დაკარგვით (hint SR-ს და `title`-ს რჩება); (b) slot-ის გაფართოება — სრული ტექსტი 257 px-ია, ერთ ხაზზე არც `w-44`-ში ეტევა და მეზობელ სვეტებს ავიწროებს; (c) ნაგულისხმევი სიმაღლის გაზრდა — timeline-ის ადგილს ჭამს და D-29j-ის გაზომვებს ცვლის; (d) მხოლოდ `sr-only` — მხედველ მომხმარებელს ნიშანი ეკარგება; (e) `aria-live` — ყოველ აკრეფაზე გამოცხადდებოდა (MARKER-LIVE-REGION უარყოფილია).',
'- **Round 39-ის checkpoint:** round 39-ის 5 ფაილი (sha `91fa12d6`, `4249f4f3`, `9d9f2122`, `7bf223eb`, `f2cd4b53` — C-ის შემოწმებული) **მზადაა root-ის შუალედური checkpoint-ისთვის** ღია Low C-R39-01-ით (round 37-ის პრეცედენტი: checkpoint ≠ PASS). თუ root ჯერ დააკომიტებს, round 40-ის baseline ეს commit-ია; თუ არა — იგივე sha-ები working tree-ში.',
'- **A-ს review-ის follow-up:** SSR-LAYOUT-EFFECT-WARN (Low, hygiene) — dev log-ში `useLayoutEffect does nothing on the server` 139-ჯერ (`StudioWorkspace`, `ArrangementDetailPanel`, ახლა `ArrangementProvider`-იც); არსებული კლასია → polish (არსებული `usePositionWriterEffect`-ის ნიმუშით, l.410).',
'- **Ableton:** ახალი ქცევა არ არის; D-29z4-ის სამი სტრიქონი უცვლელია. მიზეზის/info ხაზების ჩატევა — CZABA-ს layout, „არ ეხება“.',
'',
].join(nl);
s = s.replace(anchor, block + anchor);
const oldRows = [
'| 40 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |',
'| 41 | SRW-13, ეტაპი 4b-2, ჯგუფი 3 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH |',
'| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER |',
].join(tl);
must(s.includes(oldRows), 'rows');
const newRows = [
'| 40 | C-ის ბაგები (Round 39-ის record) — detail panel-ის ჩატევა | C-R39-01 (ნიშანი ერთ ხაზზე `0 dB`-ის გვერდით + `ring-warning`), C-R30-01 (info სვეტი `shrink-0`), DETAIL-REASON-FIT (მიზეზის ხაზები `truncate` + `title`) (D-29z5) |',
'| 41 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |',
'| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 3 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH |',
'| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER |',
].join(tl);
s = s.replace(oldRows, newRows);
const polishOld = 'round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES';
must(s.includes(polishOld), 'polish');
s = s.replace(polishOld, 'round-9 M1/L8, PREVIEW-VOLUME-IDENTITY; შემდეგ SSR-LAYOUT-EFFECT-WARN, DOC035-NOTES');
const r39 = '- **Round 39: გაგზავნილია.** SRW-13 ეტაპი 4b-2, ჯგუფი 1 (D-29z4). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.';
must(s.includes(r39), 'r39 line');
const rl = s.includes(r39 + String.fromCharCode(13, 10)) ? String.fromCharCode(13, 10) : String.fromCharCode(10);
s = s.replace(r39, '- **Round 39: C FAIL მხოლოდ C-R39-01-ზე (Low)** (`tmp/studio-real-loop/c-round-39.md`); ყველა სხვა ID PASS-ია, vitest 1312/1312, mutation a–h + b2. დაიხურა C-R31-INFO-REFUSAL-STATUS და PENDING-COMMIT-ORDER (unit-only). Round 39-ის 5 ფაილი checkpoint-ისთვის მზადაა ღია C-R39-01-ით (D-29z5).' + rl + '- **Round 40: გაგზავნილია.** detail panel-ის ჩატევა: C-R39-01, C-R30-01, DETAIL-REASON-FIT (D-29z5). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');
const srw = '4b-2 — Round 39–42 (ჯგუფი 1: D-29z4)';
if (s.includes(srw)) s = s.replace(srw, '4b-2 — Round 39–43 (ჯგუფი 1: D-29z4 — Round 39 C PASS ყველა ID-ზე C-R39-01-ის გარდა; ჩატევის follow-up: D-29z5, Round 40)');
else console.log('WARN srw line not found');
fs.writeFileSync(p, s);
console.log('plan updated');
