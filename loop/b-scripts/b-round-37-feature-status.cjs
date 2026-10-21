const fs = require('fs');
const p = 'feature-status.md';
let t = fs.readFileSync(p, 'utf8');
if (t.includes('Round 38 (`current-task.md`, D-29z3)')) throw new Error('already applied');
const rep = (a, b) => {
  if (!t.includes(a)) throw new Error(`missing: ${a.slice(0, 80)}`);
  t = t.replace(a, b);
};
const replaceBlock = (startMarker, endMarker, text) => {
  const i = t.indexOf(startMarker);
  const j = t.indexOf(endMarker, i);
  if (i < 0 || j < 0) throw new Error(`block missing: ${startMarker.slice(0, 60)}`);
  t = t.slice(0, i) + text + t.slice(j);
};

rep('განახლდა: 2026-10-13 · ავტორი: B (round 36 → round 37 დაგეგმვა)', 'განახლდა: 2026-10-13 · ავტორი: B (round 37 → round 38 დაგეგმვა)');
rep('- **R35-T (ახლა შესამოწმებელია — Round 36 C PASS):** რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი (Pan-ის ცენტრზე click Pan-ის ჩანაწერს არ წერს). სურვილისამებრ Round 37-ის შემდეგ: touch მოწყობილობაზე ორი თითით C-R36-01.',
  '- **R35-T (ახლა შესამოწმებელია — Round 36–37 C PASS, `134b4ab`-შია):** რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი (Pan-ის ცენტრზე click Pan-ის ჩანაწერს არ წერს). **Round 38-ის შემდეგ** fader-ის click აღარ ხტება, ამიტომ fader-ის ჩანაწერი აღარ იწერება — მხოლოდ `Clip Gain`. სურვილისამებრ: touch მოწყობილობაზე ორი თითით C-R36-01.\n- **R38-T (Round 38-ის C PASS-ის შემდეგ):** რეალური მაუსით ყველა fader-ზე (Volume, ვიდეოს Volume, Pan, Master): click არ ხტება, drag მდორედ მიჰყვება მაჩვენებელს, რეალური ორმაგი click საწყისს აბრუნებს (100 %, 0.0 dB, C); touch მოწყობილობაზე fader-ის drag გვერდს არ ასქროლებს. headless-ში რეალური ორმაგი click და drag შეუძლებელია (gstack/CDP allowlist).');

replaceBlock('**⚠ Root:**', '**Round 36-ის შედეგი**',
`**⚠ Root:**
- **Round 31–37 დაკომიტებულია** — \`134b4ab\` (\`feat(studio): add track pan and preserve editing focus\`), ორივე remote (\`publication-checkpoint.json\` → \`round37Checkpoint\`; B-ის \`git ls-remote origin master\` = \`134b4ab\`). Root-ის \`npm run verify\` (1264) და 2 smoke გავიდა; review: \`checkpoint-r37-review.md\` — blocker არ არის, Low-ები B-მ დაახარისხა (\`b-round-37.md\` §5). შუალედური commit release არ არის.
- Round 38 ცვლის \`ArrangementLane.tsx\`-ს, \`ArrangementMaster.tsx\`-ს, \`fader-guards.test.tsx\`-ის 3 ხაზს და ქმნის 4 ახალ ფაილს: შემდეგი checkpoint — მხოლოდ C-ის round-38 PASS-ის შემდეგ, არა რაუნდის შუაში.
- Merge-ით შემოსული \`app/lib/auth.ts\` და \`auth-bugs.test.ts\` working copy-ში CRLF-ია: Biome 2 format error (B round 37 gates-შიც).
- Tracked \`frontend-architect.md\` Write/Bash-ს იძლევა.
- Dev server B-ის დაგეგმვისას (18:53) მუშაობდა (200); B-ის gate-ებისას \`node.exe\` 8 → 8.

მიმდინარე რაუნდი: **Round 38** (\`current-task.md\`, D-29z3) — SRW-13 ეტაპი 4b-1, ერთი ფუნქცია:
- **რა იცვლება:** Volume (აუდიო და ვიდეო ხაზი), Pan და Master fader-ზე დაჭერა მნიშვნელობას აღარ ცვლის და ჩანაწერს არ წერს (დღეს Master click → −27 dB, Volume → 50 %); drag ფარდობითია (სრული სიგანე = სრული დიაპაზონი), ხელის აშვება = ერთი ჩანაწერი; ორმაგი click → 100 % / 0.0 dB / C. Zoom უცვლელია. კლავიატურა უცვლელია.
- **მექანიზმი:** \`pointerdown\`-ის \`preventDefault\` (B-ის probe: \`b-round-37/probe-pointerdown.txt\`), fader თავად იღებს focus-ს; preview/commit — არსებული API-ებით; \`ArrangementContext.tsx\`, \`StudioWorkspace.tsx\` frozen-ია. \`fader-guards.test.tsx\`-ის 3 ხაზი B-ის ნებართვით იცვლება (focus Chrome-ის რეალურ ქცევას მიჰყვება).
- **C:** R38-PG (რეალური click-ები, მთავარი), DR (synthetic drag + ცოცხალი ხმა), DC (synthetic dblclick), MN, CR, K, S, U (mutation a–h), Doc, G38-1..3.

შემდეგ: Round 39+ — 4b-2 (მაქს. სამი დაკავშირებული ბაგი თითო რაუნდში); შემდეგ 4c + polish.

**Loop runner:** თუ \`run-loop.ps1\` \`-RoundLimit\`-ზე გაჩერდა, გადატვირთვა: \`-StartRound 38 -StartPhase A\`.

**Round 37-ის შედეგი** (A \`a-round-37.md\`, C \`c-round-37.md\`): **C PASS — ყველა ID.**
- **PASS:** G37-1..3 (vitest 1264/1264, 376 OK, protected 4/4, ანონიმური \`/studio-lab\` header-იდან და პირდაპირ, studio-token 401, \`/studio/middle-east\` → Sign in required); R37-S; R37-PG (PG-1/2/3 + 1280: ველი \`3\`-ს ინარჩუნებს, release-ის შემდეგ Enter ან blur ერთხელ წერს); R37-MN (MN-2b-ის ჩათვლით); R37-CR; R37-K; R37-U (mutation a–e; a = snapshot, ზუსტად N1–N3 წითელი); R37-Doc.
- **დაიხურა:** C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE; C-R37-02 (B-ის ფორმულირება — გასწორდა \`plan.md\` D-29z3-ში).
- **ახალი Low:** C-R37-01 (შენახულ ტექსტს pending ნიშანი არ აქვს → 4b-2), DOC036-R37-TAIL, DOC036-ROUND-REF (→ polish), A-R37-TEST-HARDENING. checkpoint-r37 review: CP-R37-PAN-KEY-LOCK (→ 4b-2), CP-R37-DRAG-ENTRIES (info), CP-R37-PAN-CLAMP (მიღებულია).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, \`b-round-37/gates.txt\`): HEAD \`134b4ab\`, სუფთა ხე, 376 OK (ახალი სია), protected 4/4, tsc 0, vitest 69/1264, build ✓, Biome 2 CRLF error + 218 warning + 1 info.

`);

rep('| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **ბაგია** (C-ის round-30, 34 და 36 ID-ები PASS-ია; C-R34-01 დაიხურა Round 36-ში. ღიაა C-R36-01, Medium — სხვა pointer-ის gesture-ის დროს იძულებითი blur აკრეფილ ტექსტს შლის, მხოლოდ multi-pointer) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; ბაგი: `c-round-36/runs/ot.txt` OT-5b | Round 37: C-R36-01 (D-29z2). შემდეგ Tech Lead: R30-T, R34-T, R35-T. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |',
  '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის round-30, 34, 36 და 37 ID-ები PASS-ია; C-R36-01 დაიხურა Round 37-ში. ღიაა მხოლოდ Low C-R37-01 — შენახულ ტექსტს pending ნიშანი არ აქვს, მონაცემი არ იკარგება → 4b-2) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; `c-round-37.md` R37-PG/MN | Tech Lead: R30-T, R34-T, R35-T. C-R37-01 — 4b-2. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');
rep('| Tech Lead: R31-T, R33-T. double-click reset და A-R32-REVIEW-1 — ეტაპი 4b (Round 37) |', '| Tech Lead: R31-T, R33-T. double-click reset — 4b-1 (Round 38); A-R32-REVIEW-1 — 4b-2 |');
rep('| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2, 4a-fix3, 4a-fix4 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R36-01 (Medium) → Round 37) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md` | Round 37: C-R36-01 (D-29z2). Round 38 — 4b-1: click-ზე არ ხტება + double-click reset; 4b-2: FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending რიგი, stale status, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, Master-ის hold tick. შემდეგ 4c: round-9 M1/L8. C-R27-01: Tech Lead |',
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead). 4b-1 მუშავდება — Round 38) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md` | Round 38 — 4b-1: click-ზე არ ხტება, ფარდობითი drag, double-click reset (D-29z3). 4b-2 (Round 39+): FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending რიგი, stale status + C-R37-01, A-R31-REVIEW-2, A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, Master-ის hold tick, CP-R37-DRAG-ENTRIES. შემდეგ 4c: round-9 M1/L8. C-R27-01: Tech Lead |');

rep('| **C-R36-01** | Medium | **ბაგია** (არსებული; Round 37-ში იგზავნება, D-29z2) | `c-round-36/runs/ot.txt` OT-5b; `c-round-36.json` bugs[0]; `a-round-36.md` §4 | სხვა pointer-ის gesture-ის დროს Master-ზე/range-ზე დაჭერა focus-ს იღებს → Clip Gain-ის აკრეფილი ტექსტი `0.0`-ზე ბრუნდება. Fix: blur-ზე ტექსტი რჩება, Enter უცვლელია |',
  '| C-R36-01 | Medium | **დაიხურა** (Round 37: R37-PG PG-1/2/3 + 1280, mutation a = snapshot → ზუსტად N1–N3 წითელი) | `c-round-37/runs/pg-1440.txt`, `pg-1280.txt` | — |');
rep('| A-R36-TEST-NITS | Low | **არ დაწყებულა** → Round 37 | `a-round-36.md` §4 | case 7 status, case 8 `start.value`; l.1272 ზედმეტია, მაგრამ D-29z1-ის ბაიტებით რჩება |',
  '| A-R36-TEST-NITS | Low | **დაიხურა** (Round 37: R37-S, mutation e) | `c-round-37/gates/snap-*.diff` | — |');
rep('| DOC036-R36-REVIEW-SENTENCE | Low | **არ დაწყებულა** → Round 37 | `c-round-36.md` §9 | doc 036: „ბრაუზერში არ შემოწმებულა“ → C-მ გაიმეორა (C-R36-01) |',
  `| DOC036-R36-REVIEW-SENTENCE | Low | **დაიხურა** (Round 37: R37-Doc) | \`c-round-37.md\` §8 | — |
| **C-R37-01** | Low | **არ დაწყებულა** (D-29z2-ის მიღებული შედეგი) | \`c-round-37/runs/kept.txt\` KEPT-1/2; \`c-round-37.json\` bugs[0] | შენახულ Clip Gain-ის ტექსტს pending ნიშანი არ აქვს; შემდეგი fader-ის ჩანაწერი მას არ წერს და stale status რჩება; მონაცემი არ იკარგება → 4b-2 (stale status-თან ერთად) |
| C-R37-02 | Low | **დაიხურა** (B: \`plan.md\` D-29z3 — ადრინდელი D-29z2 მე-5 სტრიქონი ნედლ ტექსტს ადარებს) | \`c-round-37/runs/mn.txt\` MN-2b | — |
| DOC036-R37-TAIL | Low | **არ დაწყებულა** | \`c-round-37.md\` §8; \`a-round-37.md\` R1 | doc 036 l.436-ის ძველი ბოლო „ღიად რჩება“ ახალ clause-ს ეწინააღმდეგება → polish |
| DOC036-ROUND-REF | Low | **არ დაწყებულა** | \`c-round-37.md\` §8; \`a-round-37.md\` R7 | doc 036 l.468: 4b „round 37“ → round 38 → polish |
| A-R37-TEST-HARDENING | Low | **არ დაწყებულა** | \`a-round-37.md\` §4 R4, R5 | N5-ს შუალედური \`'3'\` pin აკლია; jsdom-ში \`fireEvent.blur\`-ის შემდეგ \`field.focus()\` no-op-ია → 4b-2 ან საბოლოო რეგრესია |
| CP-R37-PAN-KEY-LOCK | Low | **არ დაწყებულა** | \`checkpoint-r37-review.md\` #1 | Pan-ის blur suppression-ის დროს ისრებიც იგნორდება; დაკარგული release-ის შემდეგ კლავიატურა მკვდარია ახალ დაჭერამდე (A-R32-REVIEW-1-ის იგივე მიზეზი) → 4b-2 |
| CP-R37-DRAG-ENTRIES | info | **არ დაწყებულა** | \`checkpoint-r37-review.md\` #2 | window blur-ის abort element blur-ის გარეშე → drag keyboard-ის გზით (ჩანაწერი თითო event-ზე); ნორმალურ browser-ში არ მეორდება; Round 38 Pan-ის drag-ს pointermove-ზე გადაიყვანს → შემდეგ ხელახლა შეფასება |
| CP-R37-PAN-CLAMP | info | **მიღებულია** | \`checkpoint-r37-review.md\` #3, #4 | \`trackPanValue\`/\`handle.setTrackPan\` clamp-ის გარეშე; დღეს ყველა გამომძახებელი ნორმალიზებულ მნიშვნელობას აწვდის, import/persistence არ არის |`);
for (const [a, b] of [
  ['→ ეტაპი 4b (Round 37) |\n| C-R32-01', '→ ეტაპი 4b-2 (Round 39+) |\n| C-R32-01'],
]) {
  if (t.includes(a)) t = t.replace(a, b);
}
t = t.replace(/ეტაპი 4b \(Round 37\)/g, 'ეტაპი 4b-2 (Round 39+)').replace(/→ 4b \(Round 37\) ან საბოლოო რეგრესია/g, '→ 4b-2 ან საბოლოო რეგრესია');

rep('Critical/High ღია ბაგი არ არის.\n', 'Critical/High ღია ბაგი არ არის.\n\n**Round 37:** დაიხურა C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE, C-R37-02 (B-ის ფორმულირება). ახალი Low: C-R37-01, DOC036-R37-TAIL, DOC036-ROUND-REF, A-R37-TEST-HARDENING; checkpoint-r37 review: CP-R37-PAN-KEY-LOCK, CP-R37-DRAG-ENTRIES (info), CP-R37-PAN-CLAMP (მიღებულია). C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).\n');

rep('| **R35-T** | რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume/Pan-ზე ან Master-ზე click → +3.0 dB რჩება, ისტორია `[Clip Gain, fader]` (Round 36-ის შემდეგ; Pan-ის ცენტრზე Pan-ის ჩანაწერი არ იწერება) | synthetic/CDP pointer; focus-ის გადატანა რეალურ Chrome-ში |',
  '| **R35-T** | რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume/Pan-ზე ან Master-ზე click → +3.0 dB რჩება; ისტორია `[Clip Gain, fader]` `134b4ab`-ზე, Round 38-ის შემდეგ მხოლოდ `[Clip Gain]` (click აღარ ხტება) | synthetic/CDP pointer; focus-ის გადატანა რეალურ Chrome-ში |\n| **R38-T** | რეალური მაუსით: fader-ზე (Volume, ვიდეოს Volume, Pan, Master) click არ ხტება; drag მდორედ მიჰყვება; რეალური ორმაგი click → 100 % / 0.0 dB / C; touch-ზე fader-ის drag გვერდს არ ასქროლებს | gstack-ს dblclick/drag არ აქვს, CDP `Input.dispatchMouseEvent` allowlist-შია დაბლოკილი |');

rep('- round 31 + 32 + 33 + 34 + 36-ის 9 ფაილი C-მ შეამოწმა (Round 36 PASS) და checkpoint commit-ისთვის მზადაა — round 37-ის დაწყებამდე ან მისი C PASS-ის შემდეგ; root-ის gate-ები, review და `npm run test:e2e:smoke` სავალდებულოა;',
  '- round 31–37 დაკომიტდა (`134b4ab`, ორივე remote; root-ის verify 1264 + 2 smoke); review `checkpoint-r37-review.md` — Low-ები დახარისხდა (`b-round-37.md` §5). Round 38-ის ფაილები checkpoint-ისთვის მხოლოდ C PASS-ის შემდეგ;');
rep('- მანქანის დატვირთვა: round 27–28-ის A/C run-ებში 34–42 `node.exe`; round 29-ში 10–12 (C-R27-02 დაიხურა); B-ის round-30 დაგეგმვისას 12;',
  '- მანქანის დატვირთვა: round 27–28-ის A/C run-ებში 34–42 `node.exe`; round 29-ში 10–12 (C-R27-02 დაიხურა); B-ის round-30 დაგეგმვისას 12; round 37-ში 6–8;');

fs.writeFileSync(p, t);
console.log('feature-status ok', t.length);
