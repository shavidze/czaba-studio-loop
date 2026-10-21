const fs = require('fs');
const path = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
const raw = fs.readFileSync(path, 'utf8');
const lines = raw.split('\n');
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
const idx = (pred, m) => { const i = lines.findIndex(pred); must(i >= 0, m); return i; };
const starts = (p) => (l) => l.startsWith(p);
must(!raw.includes('**D-29z8'), 'D-29z8 already present');

const video = idx(starts('**ვიდეოს import (SRW-02, FB-15).**'), 'video anchor');
lines.splice(video, 0,
  '**D-29z8 — Round 42-ის შედეგი; ჯგუფი 3 კოდის გარეშე; Round 43: Master-ის hold tick ყუთში რჩება + fader-ის ორი ტესტის გამკვრივება (SRW-13, 4b-2 ჯგუფი 4).** C round 42 (`tmp/studio-real-loop/c-round-42.md`, `c-round-42.json`): **PASS** ყველა კონტრაქტულ ID-ზე — G42-1 (`npm run verify` exit 0, 74 ფაილი, 1333/1333), G42-2, G42-3 (ანონიმური `/studio-lab`, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required, Authorization 0), R42-S, R42-U (ძველ Lane-ზე PK1/PK3/RW1/RW2 წითელია; mutation a–f), R42-Doc, R42-PK (1440 + 1280), R42-RW, R42-REG. Root-მა round 42 დააკომიტა: `b6a96f8` (+ root-ის `ci.yml` და `vercel.json`); B-მ ორივე master remote გადაამოწმა. B-ის gate-ები: `tmp/studio-real-loop/b-round-42/gates.txt` (tsc 0, vitest 74/1333, 387 OK, protected 4/4).',
  '- **დაიხურა C-ის მტკიცებულებით:** A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK (R42-PK), A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES (R42-RW). **root-ის მტკიცებულებით:** FOREIGN-CI-YML (განზრახ commit `b6a96f8`-ში). **task-ის ტექსტი:** TASK-R42-REGDEL — round 42-ის PK4/REG-DEL შეცდომით ელოდა, რომ Pan-ზე focus-ით Delete კლიპს წაშლიდა; გაყინული კონტრაქტი (C-R31-02) ასეთია: Delete/Backspace ნებისმიერ range input-ზე კლიპს ინარჩუნებს, 0 ჩანაწერი, Space მუშაობს. ახალი: GSTACK-ACL (root/გარემო).',
  '- **ჯგუფი 3 — კოდის გარეშე (წყაროს წაკითხვის შემდეგ):**',
  '  - **FADER-KEY-ENTRIES → მიღებულია.** Volume/Master `keyup`-ზე იწერება, Pan — ყოველ ცვლად კლავიშზე; სამივე fader D-29v-ის წესს მისდევს „კლავიატურის ნაბიჯი = ერთი ჩანაწერი“. C-მ ეს Round 42-ში ჩაწერა (REG-FADERS, REG-KEYS) და Round 30-ში (R30-K). Ableton-ზე მტკიცება არ კეთდება.',
  '  - **A-R29-REVIEW-1 → მიღებულია** (C-ის მტკიცებულება არ არის, ამიტომ „მიღებულია“, არა „დახურულია“). `applyEdit` (ArrangementContext l.961–962) შემდეგ რედაქტირებამდე შეუნახავ fader-ის preview-ს წერს — ეს ნამდვილი ცვლილებაა; no-op Cut Time-ის შემდეგ undo label მას სწორად ასახელებს, status კი Cut Time-ზე ლაპარაკობს. მიღწევადია მხოლოდ key rollover-ით (Ctrl+Shift+X range-ზე არ იბლოკება, StudioWorkspace l.1153–1161).',
  '  - **A-R33-REVIEW-TOUCH → Tech Lead (R38-T).** `pointerType touch`-ის გამორიცხვა timeline-ის capture handler-ში touchscreen ლეპტოპზე (კლავიატურით) C-R32-01-ს დააბრუნებდა; tap-ზე გადადებული blur მოწყობილობის მტკიცებულებას საჭიროებს.',
  '- **Round 43 — ჯგუფი 4** (გეგმის რიგში შემდეგი კოდის ჯგუფი; SRW-14-ზე გადახტომის მიზეზი არ არის — ჩავარდნა არ არის, ხოლო Low-ები done policy-ით დასახურია):',
  '  - **MASTER-HOLD-TICK-EDGE** (`ArrangementMaster.tsx`): `holdDb ≥ +6`-ზე მთელი 2 px tick meter-ის ყუთშია; `≤ +5 dB`-ზე tick-ის ცენტრი `meter.left + f × W`-დან 0.5 px-ის ფარგლებშია (0 dB-ზე 0 dBFS ნიშნულს ფარავს); შუალედში მონოტონურია. wrapper-ის inset-ის ვარიანტები 0 dB-ის tick-ს 0.8–1.8 px-ით გადაწევს და წესს არღვევს, ამიტომ საჭიროა translation-ის clamp (ფორმას A ირჩევს). `rounded-full`-ის ბოლოს 3 px-ში ვერტიკალური ჭრა მიღებულია. ტრეკის meter უცვლელია. C ზომავს `getBoundingClientRect`-ით რეალური დაკვრით (1440 + 1280).',
  '  - **A-R38-TEST-ORDER** (ახალი `fader-focus-order.test.tsx`): ან ტესტი, რომელიც mutation (i)-ზე წითელია, ან წერილობითი ეკვივალენტობა — B-ის წაკითხვით root capture ტექსტურ ველს ადრე ათავისუფლებს (C-R34-01), `beginTrackVolumeGesture` კი pending Volume/Master-ს flush-ავს (l.2150–2151). C ადასტურებს ან უარყოფს. hook და workspace არ იცვლება.',
  '  - **A-R37-TEST-HARDENING** (`fader-guards.test.tsx`, ვიწრო grant მხოლოდ C-R36-01 describe-ზე): N5-ს შუალედური `"3"` pin, N1/N2-ში focus-ის რეალური გადატანა; ყველა არსებული `expect` უცვლელია.',
  '  - ერთად ყოფნის მიზეზი: გეგმით დამტკიცებული ჯგუფი 4; ორი ტესტი fader-ის focus-ის თემას იზიარებს; tick ერთ ელემენტს ეხება.',
  '- **Ableton:** ახალი ქცევა არ კოპირდება; სამივე სტრიქონი „არ ეხება“.',
  '- **Browse-ის წესი:** `$B restart` აღარ გამოიყენება (Round 42-ში daemon ორჯერ გატეხა); მხოლოდ ახალი `BROWSE_STATE_FILE`.',
  '- **შემდეგი რაუნდები:** 44 — 4c (R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY); 45 — polish (SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, doc-ების შენიშვნები; საჭიროებისას ორად); შემდეგ SRW-14 ეტაპი 1 (grid-ის მოდელი, Snap on/off, დანაყოფები, ჯერ კლიპის გადატანაზე), SRW-15..20, SRW-21, სრული რეგრესია, T12. მოცულობა უცვლელია.');

const r42 = idx(starts('| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 |'), 'row 42');
lines[r42] = '| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane; D-29z7). **C PASS**; ოთხივე დაიხურა; root checkpoint `b6a96f8` |';
const r43 = idx(starts('| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 3 |'), 'row 43');
lines[r43] = '| — | SRW-13, ეტაპი 4b-2, ჯგუფი 3 | კოდის გარეშე (D-29z8): FADER-KEY-ENTRIES და A-R29-REVIEW-1 მიღებულია, A-R33-REVIEW-TOUCH → Tech Lead R38-T |';
const r44 = idx(starts('| 44 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 |'), 'row 44');
lines[r44] = '| 43 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R38-TEST-ORDER, A-R37-TEST-HARDENING (D-29z8) |';
const r4c = idx(starts('| — | SRW-13, ეტაპი 4c → polish |'), 'row 4c');
lines[r4c] = '| 44 | SRW-13, ეტაპი 4c | round-9 M1/L8, PREVIEW-VOLUME-IDENTITY (`ArrangementContext.tsx`) |';
lines.splice(r4c + 1, 0, '| 45 | Polish | SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON; DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, DOC015-DELETE-GAP-NOTE (საჭიროებისას ორ რაუნდად) |');

const st42 = idx(starts('- **Round 42: გაგზავნილია.**'), 'status 42');
lines[st42] = '- **Round 42: C PASS** (`tmp/studio-real-loop/c-round-42.md`) ყველა კონტრაქტულ ID-ზე, vitest 1333/1333, mutation a–f; root-ის checkpoint `b6a96f8`. დაიხურა A-R32-REVIEW-1, CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2, CP-R37-DRAG-ENTRIES, TASK-R42-REGDEL, FOREIGN-CI-YML. ჯგუფი 3 კოდის გარეშე გადაწყდა (D-29z8). C-R23-01/C-R38-01: 3 NUL, 1 U+FFFD `aria-label` (უცვლელი).';
lines.splice(st42 + 1, 0, '- **Round 43: გაგზავნილია.** Master-ის hold tick ყუთში რჩება; A-R38-TEST-ORDER და A-R37-TEST-HARDENING (D-29z8). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

fs.writeFileSync(path, lines.join('\n'));
console.log('plan written', lines.length);
