const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let lines = fs.readFileSync(p, 'utf8').split('\n');
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(!lines.some((l) => l.includes('D-29z5')), 'already updated');
const idx = (prefix) => { const i = lines.findIndex((l) => l.startsWith(prefix)); must(i >= 0, 'missing ' + prefix); return i; };
const setLine = (prefix, text) => { lines[idx(prefix)] = text; };

setLine('განახლდა:', 'განახლდა: 2026-10-14 · ავტორი: B (round 39 → round 40 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`');

setLine('- Round 39 ცვლის `ArrangementContext.tsx`-ს', '- **Round 39 checkpoint-ისთვის მზადაა ღია Low C-R39-01-ით** (D-29z5; round 37-ის პრეცედენტი — checkpoint ≠ PASS): working tree-ში 5 ბილიკი — ` M` `app/contexts/ArrangementContext.tsx` (`91fa12d6`), ` M` `app/components/arrangement/ArrangementDetailPanel.tsx` (`4249f4f3`), ` M` doc 037 (`9d9f2122`), `??` `app/lib/arrangement/__tests__/pending-status.test.tsx` (`f2cd4b53`), `??` doc 038 (`7bf223eb`) — sha-ები C-ის შემოწმებულს ემთხვევა (B 2026-10-14 16:1x). C-ის `npm run verify` exit 0 (1312/1312); B: tsc 0, vitest 71/1312. Round 40 იგივე `ArrangementDetailPanel.tsx`-სა და doc 038-ს ცვლის: თუ root round 39-ს დააკომიტებს, ეს უნდა მოხდეს A-ს round 40-ის დაწყებამდე, მხოლოდ ამ 5 ბილიკით. 17 untracked `.codex/agents/*.toml` root-ისაა. dev log-ში 15:59-ზე `.kilo/worktrees/graceful-mousepad` გამოჩნდა — არც B-ისაა და არც `git status`-შია; A/C ახალ untracked ბილიკებს მხოლოდ აღრიცხავენ.');

const curStart = idx('მიმდინარე რაუნდი:');
const curEnd = idx('**Loop runner:**');
lines.splice(curStart, curEnd - curStart + 1,
  'მიმდინარე რაუნდი: **Round 40** (`current-task.md`, D-29z5) — C-ის ბაგები round 39-ის record-იდან, detail panel-ის ჩატევა (სამი დაკავშირებული ბაგი, ერთი ფაილი):',
  '- **C-R39-01 (C-ის ბაგი):** შეუნახავი Clip Gain-ის ნიშანი `0 dB` ღილაკის გვერდით ერთ ხაზზე ჩანს („შეუნახავია“; დანარჩენი hint — `sr-only` და `title`), ამიტომ სვეტის სიმაღლე არ იზრდება; pending ველის focus ring — `ring-warning`. B-ის გაზომვა: 44.2 + 4 + 69.8 = 118 ≤ 128 px (`b-round-39/measure-1440.txt`).',
  '- **C-R30-01 (C-ის ბაგი):** info სვეტის ხაზები (`truncate`) აღარ იკუმშება და აღარ ეფარება ერთმანეთს (`shrink-0`); თუ არ ეტევა — scroll.',
  '- **DETAIL-REASON-FIT (B-ის probe, C ადასტურებს):** Clip Gain-ისა და range-ის მიზეზის ხაზები ერთ ხაზზეა `truncate`-ით და `title`-ით; ტექსტი და `aria-describedby` უცვლელია.',
  '- **C:** R40-PM (ნიშანი, geometry 1440/1280 + C-R30-01-ის state), R40-RS (მიზეზის ხაზები), R40-INFO (C-R30-01), MN, CR, K, S, U (mutation), Doc, G40-1..3.',
  '',
  'შემდეგ: Round 41 — Pan (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES); Round 42 — FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; Round 43 — MASTER-HOLD-TICK-EDGE + test hardening; შემდეგ 4c + polish.',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 40 -StartPhase A`.',
  '',
  '**Round 39-ის შედეგი** (A `a-round-39.md`, C `c-round-39.md`): **C FAIL მხოლოდ C-R39-01-ზე (Low, ნიშნის ხილვადობა); ყველა სხვა ID PASS-ია.**',
  '- **PASS:** G39-1..3 (`npm run verify` exit 0, 71 ფაილი, 1312/1312; 380 OK; protected 4/4; ანონიმური `/studio-lab` header-იდან და პირდაპირ, 0 token/recording/download/R2, Authorization 0, token 401, `/studio/middle-east` → Sign in required); R39-S; R39-ST (ST-1..6, ST-1280 — უარის status release-ის შემდეგ ბრუნდება, round 38-ში რჩებოდა); R39-PM (PM-2, PM-3, PM-RAW, PM-VID, PM-KEPT-TAB); R39-PO (unit-only); R39-MN-1..5; R39-CR; R39-K; R39-U (mutation a–h + b2); R39-Doc.',
  '- **დაიხურა:** C-R31-INFO-REFUSAL-STATUS; PENDING-COMMIT-ORDER (unit-only); C-R39-INFO-KEPT-PREMISE (ნაბიჯის ფორმულირება).',
  '- **ახალი:** C-R39-01 (Low); DETAIL-REASON-FIT (Low, B-ის probe); SSR-LAYOUT-EFFECT-WARN (Low, polish). MARKER-LIVE-REGION უარყოფილია.',
  '- **Ableton:** pending რიგი — დადასტურებული (§5.4.2, პრინციპი); უარის status-ის გაქრობა და შეუნახავი ველის ნიშანი — დაუდასტურებელი (CZABA-ს გადაწყვეტილება/მოთხოვნა).',
  '- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 16:14, `b-round-39/gates.txt`): HEAD `6c7b4bb`, round 39-ის 5 ბილიკი C-ის sha-ებით, 383 OK (ახალი სია `b-round-39-tree-sha256.txt`), tsc 0, vitest 71/1312, `node.exe` 23.',
  ''
);

setLine('| FB-04 |', '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის round-30, 34, 36, 37, 38 და 39 ID-ები PASS-ია; C-R37-01-ის ნიშნის სემანტიკა და status — Round 39 PASS. ღიაა მხოლოდ Low C-R39-01 — ნიშნის ტექსტი 144 px-ზე იჭრება → Round 40 მუშავდება) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; `c-round-37.md` R37-PG/MN; `c-round-38.md` R38-CR; `c-round-39.md` R39-PM/ST | Tech Lead: R30-T, R34-T, R35-T. C-R39-01 — Round 40 (D-29z5). T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');

{
  const i = idx('| SRW-13 |');
  lines[i] = '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5 და 4b-1 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead). 4b-2 ჯგუფი 1 — Round 39 ყველა ID PASS-ია C-R39-01-ის გარდა; ჩატევის follow-up — Round 40 მუშავდება) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md`; 4b-1: `c-round-38.md`; 4b-2 ჯგუფი 1: `c-round-39.md` | Round 40 — C-R39-01, C-R30-01, DETAIL-REASON-FIT (D-29z5). Round 41: Pan-ის ჯგუფი; 42: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; 43: Master-ის hold tick + test hardening. შემდეგ 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY. C-R27-01: Tech Lead |';
}

setLine('| **C-R37-01** |', '| **C-R37-01** | Low | **ბაგია** (ნაწილები 1–2 სემანტიკურად Round 39-ში PASS-ია, ნაწილი 3 მიღებულია; ღიაა ნიშნის ხილვადობა = C-R39-01) | `c-round-37/runs/kept.txt`; `c-round-39.md` R39-PM, R39-ST | C-R39-01 — Round 40 (D-29z5) |');
setLine('| C-R31-INFO-REFUSAL-STATUS |', '| C-R31-INFO-REFUSAL-STATUS | info | **დაიხურა** (Round 39: R39-ST-1..6 + ST-1280 PASS) | `c-round-39.md` R39-ST; `c-round-39/runs/st-1440.txt` | — |');
setLine('| PENDING-COMMIT-ORDER |', '| PENDING-COMMIT-ORDER | Low | **დაიხურა — მხოლოდ unit** (Round 39: R39-PO, PO1 წითელია snapshot-ზე, mutation g/h; ბრაუზერში აუგებელია) | `c-round-39.md` R39-PO; `c-round-39/runs/mut-red-snapshot.txt` | — |');
{
  const i = idx('| C-R37-01 |'.replace('| C-R37-01 |', '| **C-R37-01** |'));
  lines.splice(i + 1, 0,
    '| **C-R39-01** | Low | **მუშავდება** (Round 40, D-29z5) | `c-round-39.md` R39-PM PM-1/PM-1280; `c-round-39/runs/pm-1440.txt` (15 px იჭრება); `shots/pm1-panel-1440.png`, `pm1-panel-1280.png` | ნიშანი `0 dB`-ის გვერდით ერთ ხაზზე, hint `sr-only` + `title`, `ring-warning` |',
    '| DETAIL-REASON-FIT | Low | **მუშავდება** (Round 40, D-29z5; მხოლოდ B-ის probe — C ადასტურებს) | `b-round-39/measure-reason-1440.txt` | Clip Gain/range-ის მიზეზი ერთ ხაზზე `truncate` + `title` |',
    '| SSR-LAYOUT-EFFECT-WARN | Low | **არ დაწყებულა** | `oct14-dev-error.log` (139); `a-round-39.md` §5 #3 | polish: isomorphic alias (`usePositionWriterEffect`-ის ნიმუში) |'
  );
}
setLine('| **C-R30-01** |', '| **C-R30-01** | Low | **მუშავდება** (Round 40, D-29z5 — detail panel-ის ჩატევის ჯგუფი) | `c-round-30.md` §10; `c-round-30/shots/gui-1280x720.png`; `c-round-29/shots/ft-range-1280x720.png` | info სვეტის `truncate` ხაზებს `shrink-0`; გადაფარვის ნაცვლად scroll |');
for (const [prefix, from, to] of [
  ['| A-R29-REVIEW-1 |', '(Round 41)', '(Round 42)'],
  ['| MASTER-HOLD-TICK-EDGE |', '(Round 42)', '(Round 43)'],
  ['| FB-05 |', '→ Round 40)', '→ Round 41)'],
  ['| FB-05 |', '(Round 40)', '(Round 41)'],
]) {
  const i = idx(prefix);
  lines[i] = lines[i].split(from).join(to);
}
{
  const i = idx('**Round 38:** ბაგი არ დახურულა');
  lines.splice(i, 0, '**Round 39:** დაიხურა C-R31-INFO-REFUSAL-STATUS, PENDING-COMMIT-ORDER (unit-only), C-R39-INFO-KEPT-PREMISE. C-R37-01 — მხოლოდ ხილვადობა დარჩა (C-R39-01). ახალი: C-R39-01 (Low), DETAIL-REASON-FIT (Low, B probe), SSR-LAYOUT-EFFECT-WARN (Low). MARKER-LIVE-REGION უარყოფილია (D-29z5).', '');
}
fs.writeFileSync(p, lines.join('\n'));
console.log('feature-status updated');
