const fs = require('fs');
const p = '../../docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
if (t.includes('**D-29z3')) throw new Error('D-29z3 already present');

const d29z3 = `**D-29z3 — Round 37-ის შედეგი; Round 38: SRW-13 ეტაპი 4b-1 — fader-ზე დაჭერა მნიშვნელობას აღარ ცვლის, drag ფარდობითია, ორმაგი click საწყის მნიშვნელობას აბრუნებს.** C round 37 (\`tmp/studio-real-loop/c-round-37.md\`): **PASS** ყველა ID-ზე (G37-1..3, R37-S, PG — PG-1/2/3 + 1280, MN — MN-2b-ის ჩათვლით, CR, K, U — mutation a–e, Doc); vitest 1264/1264. **დაიხურა C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE.** Root-მა rounds 31–37 დააკომიტა (\`134b4ab\`, ორივე remote). B-მ gate-ები დამოუკიდებლად გაუშვა (\`tmp/studio-real-loop/b-round-37/gates.txt\`): HEAD \`134b4ab\`, სუფთა ხე, ახალი frozen სია \`b-round-37-tree-sha256.txt\` (376 OK), protected 4/4, tsc 0, vitest 69/1264, build ✓, Biome 2 CRLF error (root) + 218 warning + 1 info.
- **C-R37-02 (B-ის ფორმულირება) — გასწორდა აქ:** D-29z2-ის ცხრილის მე-5 სტრიქონი (\`tasks/round-37.md\` §0) „ნორმალიზებულად ტოლი ტექსტი → early return“ არასწორი იყო. \`commitClipGain\` (l.330) **ნედლ ტექსტს** ადარებს: \`0.00\` შენახულ \`0.0\`-თან early return-ს გადის, gesture-ის დროს blocked status-ს იღებს და ტექსტი რჩება; release-ის შემდეგ Enter → \`Clip Gain უცვლელია: 0.0 dB.\`, ჩანაწერის გარეშე (C MN-2b). კოდი და doc 036 ამას უკვე ასე აღწერს; archive \`tasks/round-37.md\` არ იცვლება.
- **ახალი Low:** C-R37-01 (შენახულ ტექსტს pending ნიშანი არ აქვს; მომდევნო fader-ის ჩანაწერი მას არ წერს; stale status) → 4b-2; DOC036-R37-TAIL, DOC036-ROUND-REF → polish; A-R37-TEST-HARDENING (N5 შუალედური pin, jsdom \`focus()\`) → 4b-2 ან საბოლოო რეგრესია. checkpoint-r37 review: #1 → CP-R37-PAN-KEY-LOCK (A-R32-REVIEW-1-თან ერთად, 4b-2), #2 → CP-R37-DRAG-ENTRIES (info, 4b-1-ის შემდეგ ხელახლა შეფასება), #3/#4 მიღებულია (import/persistence დღეს არ არის).
- **4b იყოფა:** 4b-1 (Round 38) — click-ზე არ ხტება + ფარდობითი drag + ორმაგი click reset; 4b-2 (Round 39+, მაქს. სამი დაკავშირებული ბაგი თითო რაუნდში) — FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending რიგი, stale status + C-R37-01, A-R31-REVIEW-2, A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, CP-R37-DRAG-ENTRIES.
- **კონტრაქტი (4b-1):** ხაზის Volume (აუდიო და ვიდეო ხაზი), Master Volume და ხაზის Pan.
  - მარცხენა ღილაკით დაჭერა მოძრაობის გარეშე მნიშვნელობას არ ცვლის და ჩანაწერს არ წერს; fader focus-ს იღებს (ისრები მუშაობს, Delete/Backspace no-op რჩება — round 32–33).
  - drag ფარდობითია: მნიშვნელობა = დაჭერისას შენახული + Δx · (max − min) / input-ის rendered სიგანე, დამრგვალებული native step-ზე და clamp-ით; ვერტიკალური მოძრაობა არაფერს ცვლის. preview არსებული გზით მიდის (\`previewTrackVolume\`, \`previewMasterGain\`, \`previewTrackPan\`) — ცოცხალი ხმა იცვლება; ხელის აშვება = ერთი ჩანაწერი (\`Volume\`, \`Master Volume\`, \`Pan — {name}\`); თუ საბოლოო მნიშვნელობა საწყისის ტოლია — 0 ჩანაწერი (\`commitHistory\` JSON-ით ადარებს). blur/pointercancel drag-ის შუაში — უცვლელი (ბრუნდება, ჩანაწერის გარეშე).
  - სხვა pointer-ის gesture-ის დროს დაჭერა: მნიშვნელობა და focus არ იცვლება, status = \`GESTURE_EDIT_BLOCKED_MESSAGE\`, 0 ჩანაწერი.
  - ორმაგი click → საწყისი მნიშვნელობა: Volume 100 %, Master 0.0 dB, Pan C; ერთი ჩანაწერი არსებული label-ით; უკვე საწყისზე — 0 ჩანაწერი და status არ იცვლება; სხვა gesture-ის დროს — არსებული უარი status-ით.
  - კლავიატურა, Pan-ის readout reset, Mute/Solo, Zoom slider (ნავიგაციაა, fader არ არის) — უცვლელია.
- **მექანიზმი:** fader-ის \`pointerdown\`-ზე \`preventDefault()\`. B-ის probe (\`tmp/studio-real-loop/b-round-37/probe-pointerdown.txt\`, live \`/studio-lab\`, რეალური \`$B click\`): Master \`0\` რჩება, \`mousedown\`/\`input\`/\`change\` არ მოდის, native focus არ ხდება, \`click\` მოდის; კონტროლი preventDefault-ის გარეშე — \`−27\` და focus. ამიტომ fader თავად იღებს focus-ს, როცა claim წარმატებულია. drag window-ის \`pointermove\`-დან მოდის. \`onChange\` რჩება კლავიატურისთვის და იმ frozen ტესტებისთვის, რომლებიც drag-ს \`pointerDown\` + \`change\`-ით ასახავს — ისინი მწვანე რჩება. ფაილები: \`ArrangementLane.tsx\`, \`ArrangementMaster.tsx\`, ახალი \`app/lib/arrangement/fader.ts\` (სუფთა ფუნქცია) და \`app/hooks/useRelativeFaderDrag.ts\`; \`ArrangementContext.tsx\` და \`StudioWorkspace.tsx\` frozen-ია. სამ fader-ს \`touch-none\` ემატება, რომ touch drag scroll-ად არ იქცეს.
- **frozen ტესტის ცვლილება (B-ის ნებართვით, ზუსტად 3 ხაზი):** \`fader-guards.test.tsx\` l.840 (SFX Volume-ზე დაჭერის შემდეგ focus SFX Volume-ზეა) და l.1597/l.1602 (Master-ზე დაჭერის შემდეგ focus Master-ზეა). ორივე jsdom-ის „focus არ გადადის“ მდგომარეობას აფიქსირებდა, რაც Chrome-ში არასოდეს ყოფილა (C round 36/37: დაჭერილი range native focus-ს იღებს). სხვა frozen ტესტის ჩავარდნა = stop and report.
- **უარყოფილი:** (1) native ნახტომის „offset-ით“ კომპენსაცია პირველ \`change\`-ზე — \`pointerDown\` + \`change\` frozen ტესტებს (44 + 11 + 10 გამოძახება) არღვევს; (2) \`mousedown\`-ის preventDefault მხოლოდ — touch/pen-ს არ ფარავს და probe-მ \`pointerdown\` საკმარისად აჩვენა; (3) custom \`role="slider"\` native range-ის ნაცვლად — a11y-ის და ყველა selector-ის გადაწერა, ბევრად დიდი.
- **ორმაგი click-ის შემოწმების ზღვარი:** gstack-ს dblclick არ აქვს, CDP \`Input.dispatchMouseEvent\` allowlist-ში არ არის. ლოგიკა — vitest \`fireEvent.dblClick\` და C-ის synthetic \`dblclick\` (label-ით); რეალური ორმაგი click — Tech Lead-ის R38-T.
- **Ableton:** Pan-ის double-click reset — დადასტურებული (Live 12 §18.1, \`b-round-29/ableton-mixing-20261012.txt\`). Volume/Master-ის double-click reset — mixer-ისთვის პირდაპირ ტექსტში დაუდასტურებელია; §42.4 „Reset Parameter Value — Delete or double-click“ device-ების სექციაშია (\`b-round-37/ableton-live-keyboard-shortcuts-20261013.txt\`, https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/, 2026-10-13). click-ზე არ ხტება — წყაროში ტექსტი ვერ ვიპოვე (§18.1, Live Concepts, §42) → დაუდასტურებელი, CZABA-ს მოთხოვნა (C round 22 §5, l.732). §42.6 „Return to Default — Delete“ — შეგნებული განსხვავება: focused range-ზე Delete browser-ის no-op რჩება (\`StudioWorkspace.tsx\` l.1182). §42.6 Shift-ით ზუსტი drag — T12.9.

`;
const anchor = '**ვიდეოს import (SRW-02, FB-15).**';
if (!t.includes(anchor)) throw new Error('anchor missing');
t = t.replace(anchor, d29z3 + anchor);

const oldRow37 = '| 37 | C-ის ბაგი (Round 36-ის record) | C-R36-01: სხვა gesture-ის დროს იძულებითი blur Clip Gain-ის ტექსტს აღარ შლის (Enter უცვლელია) + round-36 ტესტის nits + doc 036 (D-29z2) |';
if (!t.includes(oldRow37)) throw new Error('row 37 missing');
t = t.replace(oldRow37, '| 37 | C-ის ბაგი (Round 36-ის record) | C-R36-01: სხვა gesture-ის დროს იძულებითი blur Clip Gain-ის ტექსტს აღარ შლის (Enter უცვლელია) + round-36 ტესტის nits + doc 036 (D-29z2). **C PASS**; სამივე დაიხურა; root checkpoint `134b4ab` |');
const oldRow38Start = '| 38 | SRW-13, ეტაპი 4b (საჭიროებისას 38/39) |';
const i38 = t.indexOf(oldRow38Start);
if (i38 < 0) throw new Error('row 38 missing');
const e38 = t.indexOf('\n', i38);
t = `${t.slice(0, i38)}| 38 | SRW-13, ეტაპი 4b-1 | fader-ზე დაჭერა არ ხტება, ფარდობითი drag, ორმაგი click reset (Volume — აუდიო და ვიდეო, Master, Pan); Zoom უცვლელია; round-36-ის root capture რჩება (D-29z3) |\n| 39+ | SRW-13, ეტაპი 4b-2 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending commit-ების რიგი, stale status + C-R37-01, A-R31-REVIEW-2, A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, CP-R37-DRAG-ENTRIES — მაქს. სამი თითო რაუნდში |${t.slice(e38)}`;
const oldRow3940 = '| 39–40 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |';
if (!t.includes(oldRow3940)) throw new Error('row 39-40 missing');
t = t.replace(oldRow3940, '| — | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE |');

const oldStatus37 = '- **Round 37: გაგზავნილია.** C-R36-01 + ტესტის nits + doc 036 (D-29z2). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.';
if (!t.includes(oldStatus37)) throw new Error('status 37 missing');
t = t.replace(oldStatus37, '- **Round 37: C PASS** (`tmp/studio-real-loop/c-round-37.md`) ყველა ID-ზე, vitest 1264/1264, mutation a–e. დაიხურა C-R36-01, A-R36-TEST-NITS, DOC036-R36-REVIEW-SENTENCE; C-R37-02 B-მ D-29z3-ში გაასწორა. ახალი Low: C-R37-01. Root-მა rounds 31–37 დააკომიტა (`134b4ab`, ორივე remote). C-R23-01: 2 NUL (უცვლელი).\n- **Round 38: გაგზავნილია.** SRW-13 ეტაპი 4b-1 (D-29z3). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.');

const oldSrw13 = 'multi-pointer-ით Clip Gain-ის დაკარგვა (C-R36-01) — Round 37 (D-29z2), 4b — Round 38, 4c — შემდეგ;';
if (!t.includes(oldSrw13)) throw new Error('srw13 line missing');
t = t.replace(oldSrw13, 'multi-pointer-ით Clip Gain-ის დაკარგვა (C-R36-01) — Round 37 C PASS (D-29z2), 4b-1 — Round 38 (D-29z3), 4b-2 — Round 39+, 4c — შემდეგ;');
fs.writeFileSync(p, t);
console.log('plan ok', t.length);
