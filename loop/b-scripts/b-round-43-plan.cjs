const fs = require('fs');
const path = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(path, 'utf8');
const lines = t.split('\n');
const idx = lines.findIndex((l) => l.startsWith('- **შემდეგი რაუნდები:** 44 — 4c'));
if (idx < 0) { console.error('anchor D-29z8 tail'); process.exit(1); }
const block = [
  '',
  '**D-29z9 — Round 43-ის შედეგი; Round 44: კონტექსტის სისუფთავე `ArrangementContext.tsx`-ში (SRW-13, ეტაპი 4c).** C round 43 (`tmp/studio-real-loop/c-round-43.md`, `c-round-43.json`) — **PASS** ყველა კონტრაქტულ ID-ზე:',
  '- G43-1: `npm run verify` exit 0, 76 ფაილი, 1341/1341. G43-2 და G43-3 (ანონიმური `/studio-lab`, token 401, `/studio/middle-east` → Sign in required) PASS-ია.',
  '- R43-S, R43-HT, R43-U, R43-REG, R43-Doc PASS-ია. R43-HT რეალური დაკვრით გაიზომა: ≥ +6 dB-ზე tick ყუთშია 1440-ზეც და 1280-ზეც, ≤ +5 dB-ზე max |Δ| 0.061 px.',
  '- Root-მა round 43 დააკომიტა: `2c0f800`. B-მ 2026-10-15 12:06-ზე ორივე master remote გადაამოწმა.',
  '- B-ის gate-ები (`tmp/studio-real-loop/b-round-43/`): tsc 0, vitest 76/1341, 391 OK, protected 4/4.',
  '- **დაიხურა C-ის მტკიცებულებით:** MASTER-HOLD-TICK-EDGE და A-R37-TEST-HARDENING. A-R38-TEST-ORDER დაიხურა როგორც ეკვივალენტური: C-მ დამოუკიდებლად ვერ ააგო განსხვავებული შემთხვევა, ხოლო S1–S5 contract pin-ებია და რიგს ვერ იჭერენ.',
  '- **დაიხურა task-ის ტექსტით ან root-ის ჩანაწერით:** TASK-R43-HTZERO და ROOT-ROUND42-CHECKPOINT-RECORD. TASK-R43-HTZERO-დან წესი: ≈ 0 dBFS-ის meter fixture-ში ვიდეო Mute-ზეა.',
  '- **მიღებულია (კოდის გარეშე):**',
  '  - A-R43-EXACT-5DB: ზუსტად +5.0-ზე ორივე branch ყველა წესს აკმაყოფილებს (Δ 0.21 ≤ 0.5).',
  '  - A-R43-REVIEW-W66, დაკვირვებით: Master meter-ის სიგანის ცვლილებისას R43-HT თავიდან იზომება.',
  '  - A-R43-REVIEW-ROOTFONT (info).',
  '- **ახალი root-ის პუნქტი:** ROOT-ROUND43-CHECKPOINT-RECORD.',
  '- **Round 44 — ეტაპი 4c** (გეგმის რიგში შემდეგი; Critical/High ბაგი არ არის):',
  '  - **R9-REVIEWER-M1:** `transportRunningRef`/`markTransportRunning` იშლება. სახელის შეცვლა არ ხდება, რადგან მისი ერთადერთი წამკითხველი საკუთარი guard-ია (l.836). ქცევა არ იცვლება. ტესტი მკვდარ კოდს ვერ დაიჭერს, ამიტომ მიღება ასეა: grep 0, ყველა suite მწვანეა, C-ის R44-TR ბრაუზერში (play/stop/resume, ბოლომდე დაკვრა, loop, seek, preview).',
  '  - **R9-REVIEWER-L8:** `useArrangementPositionStore` საკუთარი სახელით აგდებს შეცდომას.',
  '  - **PREVIEW-VOLUME-IDENTITY:**',
  '    - `previewTrackVolume` `updateHistory`/`syncPlayback`-ის გარეშე ბრუნდება, როცა ტრეკი არ არსებობს ან clamp-ის შემდეგ მნიშვნელობა უცვლელია.',
  '    - შემოწმება `flushPendingMaster`-ის შემდეგ და `volumeBeforeRef`-მდე ხდება — `previewMasterGain`-ის სიმეტრიულად.',
  '    - `model.ts` უცვლელია: `setTrackMix` Mute-საც ემსახურება, info-სთვის მოდელი არ იხსნება.',
  '    - render-count pin-ები snapshot-ზე წითელია.',
  '  - ერთად ყოფნის მიზეზი: გეგმით დამტკიცებული 4c, ერთი ფაილი, სამი მცირე ცვლილება.',
  '- **Ableton:** სამივე სტრიქონი „არ ეხება“ (შიდა კონტექსტი; Live-ის იმპლემენტაციად არ წარმოჩნდება).',
  '- **Browse-ის წესი:** ერთი წარუმატებელი CLI daemon-ის შემდეგ დამტკიცებულია საკუთარი `server-node.mjs` (`BROWSE_PARENT_PID=0`, ახალი state, log; ბრძანება და PID იწერება). `$B restart` ისევ აკრძალულია.',
  '- **შემდეგი რაუნდები:** 45 — polish (SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, doc-ების შენიშვნები; საჭიროებისას ორად); შემდეგ SRW-14 ეტაპი 1 (FB-13: grid-ის მოდელი, Snap on/off, დანაყოფები, ჯერ კლიპის გადატანაზე), SRW-15..20, SRW-21, სრული რეგრესია, T12. მოცულობა არ მცირდება.',
];
lines.splice(idx + 1, 0, ...block);
t = lines.join('\n');
const rep = (a, b) => { if (!t.includes(a)) { console.error('MISSING', a.slice(0, 80)); process.exit(1); } t = t.replace(a, b); };
rep('| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R38-TEST-ORDER, A-R37-TEST-HARDENING (D-29z8) |', '| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R38-TEST-ORDER, A-R37-TEST-HARDENING (D-29z8). **C PASS**; სამივე დაიხურა (A-R38 — ეკვივალენტობით); root checkpoint `2c0f800` |');
rep('| 44 | SRW-13, ეტაპი 4c | round-9 M1/L8, PREVIEW-VOLUME-IDENTITY (`ArrangementContext.tsx`) |', '| 44 | SRW-13, ეტაპი 4c | round-9 M1 (latch-ის წაშლა), L8 (შეცდომის ტექსტი), PREVIEW-VOLUME-IDENTITY (`ArrangementContext.tsx`; D-29z9) |');
rep('- **Round 43: გაგზავნილია.** Master-ის hold tick ყუთში რჩება; A-R38-TEST-ORDER და A-R37-TEST-HARDENING (D-29z8). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.', '- **Round 43: C PASS** (`tmp/studio-real-loop/c-round-43.md`) ყველა კონტრაქტულ ID-ზე, vitest 1341/1341, mutation a–e; root-ის checkpoint `2c0f800`. დაიხურა MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING, A-R38-TEST-ORDER (ეკვივალენტობა), TASK-R43-HTZERO, ROOT-ROUND42-CHECKPOINT-RECORD. A-R43-ის review-ის სამი პუნქტი მიღებულია (D-29z9). C-R23-01/C-R38-01: 3 NUL, 1 U+FFFD `aria-label` (უცვლელი).\n- **Round 44: გაგზავნილია.** ეტაპი 4c — `ArrangementContext.tsx`-ის სისუფთავე (D-29z9). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');
fs.writeFileSync(path, t);
console.log('plan updated');
