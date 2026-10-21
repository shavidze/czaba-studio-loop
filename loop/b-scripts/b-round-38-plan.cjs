const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('**D-29z4')) throw new Error('D-29z4 already present');
const lines = s.split('\n');
const anchorIdx = lines.findIndex((l) => l.startsWith('**ვიდეოს import (SRW-02, FB-15).**'));
if (anchorIdx < 0 || !lines[anchorIdx - 2].startsWith('- **Ableton:** Pan-ის double-click reset')) throw new Error('anchor');
const block = [
  '**D-29z4 — Round 38-ის შედეგი; Round 39: SRW-13 ეტაპი 4b-2, ჯგუფი 1 — შეუნახავი Clip Gain-ის ნიშანი, ძველი უარის status-ის აღდგენა, pending preview-ების რიგი.** C round 38 (`tmp/studio-real-loop/c-round-38.md`): **PASS** ყველა ID-ზე (G38-1..3, R38-S, PG — რეალური click-ები, DR — synthetic drag + ცოცხალი ხმა, DC — synthetic dblclick, MN, CR, K, U — mutation a–h, Doc); vitest 1290/1290. Root-მა round 38 დააკომიტა (`6c7b4bb`, ორივე remote; B-მა sha256-ით შეადარა C-ის მიერ შემოწმებულ ფაილებს — იდენტურია). B-ის gate-ები (`tmp/studio-real-loop/b-round-38/gates.txt`): HEAD `6c7b4bb`, 17 untracked `.codex/agents/*.toml` (root-ის), ახალი frozen სია `b-round-38-tree-sha256.txt` (380 OK), protected 4/4, tsc 0, vitest 70/1290, build ✓, Biome 2 CRLF error + 218 warning + 1 info, `/studio-lab` 200, NUL 5.',
  '- **ახალი:** C-R38-01 (Low) — C-R23-01-ის NUL byte-ები ახლა ორ `aria-label`-შია (ბიბლიოთეკის დაკეცვის ღილაკი, range-ის დასაწყისის ველი) და hydration-ის შემდეგაც რჩება; Tech Lead-ის C-R23-01-თან ერთად. A-R38-TEST-ORDER (Low, test-only) — `focus()` → `begin`-ის რიგს jsdom ტესტი არ იცავს (C-ის mutation (i) ცოცხალი დარჩა). A-R38-REVIEW-TOUCH (Medium, დაუდასტურებელი) — touch-ზე native slide შეიძლება დარჩეს; Tech Lead R38-T რეალურ მოწყობილობაზე; დადასტურების შემთხვევაში წინასწარ განსაზღვრული ცვლილება: სამ fader-ზე native non-passive `touchstart` + `preventDefault` (Zoom გარდა). ბრმად არ კეთდება.',
  '- **რატომ ეს ჯგუფი:** workflow — ჯერ C-ის ბაგები. A-სთვის მისაწვდომი ერთადერთი ღია C ბაგია C-R37-01 (C-R23-01/C-R38-01 — `entry.server.tsx` ან React 19, Tech Lead; C-R27-01/C-R6-02/C-R8-01 — quiet Chrome; C-R30-01 — polish). D-29z3-ის §7-ის რიგი მხოლოდ ორიენტაცია იყო. მესამე დაკავშირებული ერთეული — PENDING-COMMIT-ORDER (იგივე pending preview-ის ოჯახი).',
  '- **კონტრაქტი:**',
  '  - **უარის status:** `GESTURE_EDIT_BLOCKED_MESSAGE` ან `GESTURE_UNDO_BLOCKED_MESSAGE`. პირველი უარის წინ ნაჩვენები status ინახება. როცა ბოლო pointer gesture მთავრდება (count → 0: commit, cancel, abort, window blur) და status ისევ უარის ტექსტია, ბრუნდება შენახული status. თუ უარის შემდეგ სხვა status დაიწერა, ის რჩება. status ცარიელი არ ხდება. `setStatus`-ის სიგნატურა უცვლელია, ამიტომ Lane/Master/DetailPanel-ის უარებიც იფარება.',
  '  - **შეუნახავი Clip Gain:** ჩართულ ველში, როცა ნედლი ტექსტი ≠ `clipGainInputText(stored)` (იგივე შედარება, რასაც blur-ის early return იყენებს, l.330): `data-pending="true"`, `border-warning` token, ხილული ტექსტი „შეუნახავია — Enter ინახავს, Esc აბრუნებს“ (`arrangement-detail-clip-gain-pending`), `aria-describedby`-ით მიბმული. detail panel-ის გარე სიმაღლე 1440×900-სა და 1280×720-ზე არ იცვლება.',
  '  - **C-R37-01-ის მე-3 ნაწილი მიღებულია:** შენახული ტექსტი იწერება, როცა მომხმარებელი ადასტურებს (Enter/blur), ამიტომ მისი ჩანაწერი შუალედური ჩანაწერების შემდეგ დგება; ახალი ნიშანი აჩვენებს, რომ ის შეუნახავია. clip-ის შეცვლისას ველი თავიდან mount-დება (`key` = clip id) და ტექსტი ქრება — უცვლელია.',
  '  - **pending რიგი:** `previewTrackVolume` ახალ pending Volume preview-მდე pending Master preview-ს წერს (`previewMasterGain` l.2307-ის სიმეტრიულად). B-ის scratch probe (`b-round-38/probe-order.test.snippet`): დღევანდელ კოდზე Master −3 → Volume 0.5 → Mute → undo ×3 = Master რჩება −3 (არასწორი); flush-ით Master 0, Volume 1, undo-ს რიგი Mute, Volume, Master Volume.',
  '- **B-ის probe:** სამივე კანდიდატური ცვლილება `store/`-ის გარეთ scratch ასლში (`b-round-38/probe/`) → vitest 70/1290 მწვანე. frozen ტესტის ცვლილება არც საჭიროა და არც ნებადართული; ნებისმიერი frozen ჩავარდნა = A ჩერდება და აცნობებს.',
  '- **ფაილები:** `ArrangementContext.tsx` (status-ის wrapper, gesture-ის დასრულებისას აღდგენა, `previewTrackVolume`-ის flush), `ArrangementDetailPanel.tsx` (მხოლოდ Clip Gain-ის ველი), ახალი `pending-status.test.tsx`, ახალი doc 038, doc 037-ის სტატუსის ხაზი და TODO.',
  '- **შემდეგი ჯგუფები (ორიენტაცია):** 2 (Round 40) — A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK (Pan-ზე keydown suppression-ს ხსნის) და A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Lane-ის Pan bookkeeping window blur-ზეც მთავრდება; draft იშლება); მხოლოდ Lane, frozen l.363–430 მწვანე რჩება. 3 (Round 41) — FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH. 4 (Round 42) — MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER. შემდეგ 4c (round-9 M1/L8, PREVIEW-VOLUME-IDENTITY) და polish.',
  '- **Ableton:** §5.4.2 Undo History — „all the actions in the order they occurred“ (https://www.ableton.com/en/live-manual/12/managing-files-and-sets/, 2026-10-14, `b-round-38/ableton-managing-files-and-sets-20261014.txt`) → pending რიგი პრინციპულად დადასტურებულია. §3.2 Status Bar — „displays useful information like error messages“ (https://www.ableton.com/en/live-manual/12/live-concepts/, 2026-10-13) — შეტყობინების გაქრობაზე არაფერს ამბობს → დაუდასტურებელი, CZABA-ს გადაწყვეტილება. შეუნახავი ველის ნიშანზე წყარო არ არის → დაუდასტურებელი, CZABA-ს მოთხოვნა (C-R37-01).',
  '',
];
lines.splice(anchorIdx, 0, ...block);
s = lines.join('\n');
const oldRow = '| 39+ | SRW-13, ეტაპი 4b-2 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending commit-ების რიგი, stale status + C-R37-01, A-R31-REVIEW-2, A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE, CP-R37-DRAG-ENTRIES — მაქს. სამი თითო რაუნდში |';
if (!s.includes(oldRow)) throw new Error('row');
s = s.replace('| 38 | SRW-13, ეტაპი 4b-1 | fader-ზე დაჭერა არ ხტება, ფარდობითი drag, ორმაგი click reset (Volume — აუდიო და ვიდეო, Master, Pan); Zoom უცვლელია; round-36-ის root capture რჩება (D-29z3) |', '| 38 | SRW-13, ეტაპი 4b-1 | fader-ზე დაჭერა არ ხტება, ფარდობითი drag, ორმაგი click reset (Volume — აუდიო და ვიდეო, Master, Pan); Zoom უცვლელია; round-36-ის root capture რჩება (D-29z3). **C PASS**; root checkpoint `6c7b4bb` |');
s = s.replace(oldRow, [
  '| 39 | SRW-13, ეტაპი 4b-2, ჯგუფი 1 | C-R37-01 (შეუნახავი Clip Gain-ის ნიშანი) + C-R31-INFO-REFUSAL-STATUS (უარის status gesture-ის ბოლოს ბრუნდება) + PENDING-COMMIT-ORDER (D-29z4) |',
  '| 40 | SRW-13, ეტაპი 4b-2, ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |',
  '| 41 | SRW-13, ეტაპი 4b-2, ჯგუფი 3 | FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH |',
  '| 42 | SRW-13, ეტაპი 4b-2, ჯგუფი 4 | MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING + A-R38-TEST-ORDER |',
].join('\n'));
const oldStatus = '- **Round 38: გაგზავნილია.** SRW-13 ეტაპი 4b-1 (D-29z3). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.';
if (!s.includes(oldStatus)) throw new Error('status');
s = s.replace(oldStatus, [
  '- **Round 38: C PASS** (`tmp/studio-real-loop/c-round-38.md`) ყველა ID-ზე, vitest 1290/1290, mutation a–h. რეალური click აღარ ხტება (round 37: 0.5 / −27 dB). ახალი: C-R38-01 (Low, C-R23-01 `aria-label`-ებში), A-R38-TEST-ORDER (Low), A-R38-REVIEW-TOUCH (Medium, დაუდასტურებელი, Tech Lead R38-T). C-R23-01: 5 NUL. Root-მა round 38 დააკომიტა (`6c7b4bb`, ორივე remote).',
  '- **Round 39: გაგზავნილია.** SRW-13 ეტაპი 4b-2, ჯგუფი 1 (D-29z4). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
].join('\n'));
s = s.replace('4b-1 — Round 38 (D-29z3), 4b-2 — Round 39+, 4c — შემდეგ;', '4b-1 — Round 38 C PASS (D-29z3), 4b-2 — Round 39–42 (ჯგუფი 1: D-29z4), 4c — შემდეგ;');
fs.writeFileSync(p, s);
console.log('ok', s.length);
