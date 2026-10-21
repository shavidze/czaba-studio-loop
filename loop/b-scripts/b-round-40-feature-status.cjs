const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let lines = fs.readFileSync(p, 'utf8').split('\n');
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(!lines.some((l) => l.includes('D-29z6')), 'already updated');
const idx = (prefix) => { const i = lines.findIndex((l) => l.startsWith(prefix)); must(i >= 0, 'missing ' + prefix); return i; };
const setLine = (prefix, text) => { lines[idx(prefix)] = text; };

const tableStart = idx('| FB-04 |') - 5;
for (let i = tableStart; i < lines.length; i += 1) {
  if (/Round 4[1-3]/.test(lines[i]) && !lines[i].startsWith('**Round ')) {
    lines[i] = lines[i].replace(/Round 43/g, 'Round @44').replace(/Round 42/g, 'Round @43').replace(/Round 41/g, 'Round @42').replace(/Round @/g, 'Round ');
  }
}

setLine('განახლდა:', 'განახლდა: 2026-10-14 · ავტორი: B (round 40 → round 41 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`');

setLine('- **Round 39 checkpoint-ისთვის მზადაა', '- **Round 39–40 checkpoint-ისთვის მზადაა** (D-29z6; round 40 — C PASS, ღიაა მხოლოდ არსებული Low C-R40-01): working tree-ში 6 ბილიკი C-ის sha-ებით — ` M` `app/contexts/ArrangementContext.tsx` (`91fa12d6`), ` M` `app/components/arrangement/ArrangementDetailPanel.tsx` (`dbcd5c2f`), ` M` doc 037 (`9d9f2122`), `??` `app/lib/arrangement/__tests__/pending-status.test.tsx` (`f2cd4b53`), `??` `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` (`dac18003`), `??` doc 038 (`947d9f83`). C-ის `npm run verify` exit 0 (72 ფაილი, 1319/1319); B (18:37): tsc 0, vitest 72/1319, 384 OK, protected 4/4. Round 41 იგივე `ArrangementDetailPanel.tsx`-სა და doc 038-ს ცვლის: commit — A-ს round 41-ის დაწყებამდე, მხოლოდ ამ 6 ბილიკით. 17 untracked `.codex/agents/*.toml` root-ისაა; `.kilo/` მხოლოდ ignored-ად ჩანს (`!! .kilo/`).');
setLine('- Dev server B-ის დაგეგმვისას', '- Dev server: C round 40-ში 16:55–17:18 არ მუშაობდა (root-მა აღადგინა); B-ის დაგეგმვისას (18:3x) 200. gstack browse daemon C-ს ორჯერ არ ჩაირთო 15 წმ-ში და 18:05-ის შემდეგ აღარ პასუხობდა (ENV-BROWSE-DAEMON). B-ის gate-ებისას `node.exe` 28.');

const curStart = idx('მიმდინარე რაუნდი:');
const resultEnd = idx('- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 16:14');
lines.splice(curStart, resultEnd - curStart + 1,
  'მიმდინარე რაუნდი: **Round 41** (`current-task.md`, D-29z6) — C-ის ბაგი round 40-ის record-იდან (ერთი ბაგი, ერთი ფაილი + doc 038):',
  '- **C-R40-01 (C-ის ბაგი):** გამორთული ველების მიზეზი ყველა რეალურ მდგომარეობაში ჩანს — ჯგუფის არჩევისას range-ისა და Clip Gain-ის მიზეზი შუა (ცარიელ) ყუთშია, ვიდეოს არჩევისას Clip Gain-ის მიზეზი ვიდეოს ყუთში placeholder-ის ქვეშ; „არაფერი არჩეული“ — უცვლელი. ტექსტი, `id`, `aria-describedby`, `title` უცვლელია; `truncate` არა. B-ის გაზომვა: შუა ყუთი 500 × 91 (1440), ≈ 340 (1280).',
  '- **Scroll-ის ნიშანი:** detail content-ის scroller-ს ემატება არსებული `STUDIO_SCROLLBAR_CLASS` (library/timeline-ის იგივე რეილი; 10 px gutter). ვიზუალი headless-ში არ ჩანს → Tech Lead R23-1.',
  '- **DOC038-STALE-LINES:** doc 038-ის ძველი ხაზები (l.45, TODO).',
  '- **C:** R41-RV (მიზეზი ჩანს: ვიდეო/ჯგუფი 1440, 1280, 120 px), R41-SB (gutter, სვეტების სიგანე), R41-NONE, R41-PM (ნიშანი — რეგრესია), R41-MN, R41-K, R41-S, R41-U (mutation), R41-Doc, G41-1..3.',
  '',
  'შემდეგ: Round 42 — Pan (A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES); Round 43 — FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; Round 44 — MASTER-HOLD-TICK-EDGE + test hardening; შემდეგ 4c + polish; შემდეგ SRW-14..20 (FB-13, FB-09/11, FB-10, FB-12, FB-06, FB-07), SRW-21, სრული რეგრესია, T12.',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 41 -StartPhase A`.',
  '',
  '**Round 40-ის შედეგი** (A `a-round-40.md`, C `c-round-40.md`): **C PASS ყველა კონტრაქტულ ID-ზე.**',
  '- **PASS:** G40-1..3 (`npm run verify` exit 0, 72 ფაილი, 1319/1319; 383 OK; protected 4/4; ანონიმური `/studio-lab` პირდაპირ და header-იდან, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer → 500 ტოკენის გარეშე, `/studio/middle-east` → Sign in required); R40-S; R40-U (snapshot-ზე F1–F4/F8 წითელია, mutation a–i); R40-Doc; R40-PM (PM-1, PM-1280, PM-2, PM-3, PM-KEPT-TAB, PM-RAW, PM-RESET, PM-TAB, PM-R30 — ნიშანი 1 ხაზი, 69.8 px, scroller +0, ring `rgb(245, 158, 11)`); R40-INFO; R40-MN-1..6; R40-CR; R40-K.',
  '- **დაიხურა:** C-R39-01, C-R30-01, C-R37-01. 4b-2-ის ჯგუფი 1 დასრულდა.',
  '- **ახალი:** C-R40-01 (Low, არსებული layout — DETAIL-REASON-FIT-ის გაზომვიდან); DOC038-STALE-LINES (Low); DETAIL-RESET-SHRINK (info, B-ის არჩევანი); ENV-BROWSE-DAEMON (გარემო).',
  '- **C-ის შესწორებები:** PM-ის კრიტერიუმი — „იგივე ცენტრი ±2 px“; 1280-ის კანონიკური fresh-load — panel 142 / ხაზი 273.',
  '- **Ableton:** ნიშანი — დაუდასტურებელი (CZABA-ს მოთხოვნა); ერთსიტყვიანი ხილული მინიშნება და info-ს scroll — არ ეხება (CZABA-ს layout).',
  '- **B-მა დამოუკიდებლად შეამოწმა** (2026-10-14 18:37, `b-round-40/gates.txt`): HEAD `6c7b4bb`, round 39–40-ის 6 ბილიკი C-ის sha-ებით, 384 OK (ახალი სია `b-round-40-tree-sha256.txt`), protected 4/4, tsc 0, vitest 72/1319, `node.exe` 28.'
);

setLine('| FB-04 |', '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის round-30, 34, 36–40 ID-ები PASS-ია; C-R37-01 და C-R39-01 დაიხურა Round 40-ში. ღიაა Low C-R40-01 — გამორთული ველის მიზეზის ჩატევა → Round 41 მუშავდება) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; `c-round-37.md` R37-PG/MN; `c-round-38.md` R38-CR; `c-round-39.md` R39-PM/ST; `c-round-40.md` R40-PM | Tech Lead: R30-T, R34-T, R35-T. C-R40-01 — Round 41 (D-29z6). T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |');

setLine('| SRW-13 |', '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2…4a-fix5, 4b-1 და 4b-2 ჯგუფი 1 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R40-01 (Low, Round 41)) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md`; 4a-fix5: `c-round-37.md`; 4b-1: `c-round-38.md`; 4b-2 ჯგუფი 1: `c-round-39.md`, `c-round-40.md` | Round 41 — C-R40-01 (D-29z6). Round 42: Pan-ის ჯგუფი; 43: FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R33-REVIEW-TOUCH; 44: Master-ის hold tick + test hardening. შემდეგ 4c: round-9 M1/L8, PREVIEW-VOLUME-IDENTITY. C-R27-01: Tech Lead |');

setLine('| **C-R37-01** |', '| C-R37-01 | Low | **დაიხურა** (ნაწილები 1–2 — Round 39 PASS; ნაწილი 3 მიღებულია; ხილვადობა — Round 40 R40-PM PASS) | `c-round-39.md` R39-PM, R39-ST; `c-round-40.md` §2 | — |');
setLine('| **C-R39-01** |', '| C-R39-01 | Low | **დაიხურა** (Round 40: R40-PM PASS — 1 ხაზი, 69.8 × 16, scroller +0 1440-ზე და 1280-ზე) | `c-round-40.md` §2; `c-round-40/runs/pm-1440.txt`, `pm-1280.txt`; `shots/pm1-1440.png` | — |');
setLine('| DETAIL-REASON-FIT |', '| DETAIL-REASON-FIT | Low | **გადაკეთდა C-R40-01-ად** (Round 40: C-მ რეალური მდგომარეობები გაზომა, R40-RS) | `c-round-40.md` §3 | → C-R40-01 |');
{
  const i = idx('| DETAIL-REASON-FIT |');
  lines.splice(i + 1, 0,
    '| **C-R40-01** | Low | **მუშავდება** (Round 41, D-29z6) | `c-round-40.md` §3; `c-round-40/runs/rs-1440.txt`, `rsinfo-1280.txt`, `mn6-1440.txt`; `shots/rs-vid-1440-crop.png`, `rs-grp-1280.png` | ჯგუფის მიზეზები შუა ყუთში, ვიდეოს — ვიდეოს ყუთში; content-ს `STUDIO_SCROLLBAR_CLASS` |',
    '| DOC038-STALE-LINES | Low | **მუშავდება** (Round 41) | `c-round-40.md` R40-Doc; `a-round-40.md` §5 #2/#3 | doc 038 l.45 და TODO |',
    '| DETAIL-RESET-SHRINK | info | **არ დაწყებულა** (დეფექტი არ გაზომილა) | `a-round-40.md` §5 #4; `c-round-40.md` §2 | `0 dB`-ს `shrink-0` — B-ის არჩევანი, თუ ნიშანი ~80 px-ს გადააჭარბებს |',
    '| ENV-BROWSE-DAEMON | info | **არ ეხება კოდს** (გარემო) | `c-round-40.md` §0, §10 | browse daemon-ის არასტაბილურობა; C აღრიცხავს და offline ID-ებს აგრძელებს |'
  );
}
setLine('| **C-R30-01** |', '| C-R30-01 | Low | **დაიხურა** (Round 40: R40-INFO PASS — 16 px ხაზები, გადაფარვა არ არის, scroll ბოლომდე) | `c-round-40.md` §4; `shots/info-music-range-1280.png`, `info-music-range-scrolled-1280.png` | — |');
setLine('| R23-1 / R23-2 |', '| R23-1 / R23-2 | Scrollbar-ის ვიზუალი; wheel და thumb drag (Round 41-იდან detail panel-ის content-იც — 1280×720, ჯგუფი) | headless native scrollbar-ს მალავს |');
{
  const i = idx('**Round 39:** დაიხურა');
  lines.splice(i, 0, '**Round 40:** დაიხურა C-R39-01, C-R30-01, C-R37-01; DETAIL-REASON-FIT → C-R40-01 (Low, Round 41). ახალი: DOC038-STALE-LINES (Low), DETAIL-RESET-SHRINK (info), ENV-BROWSE-DAEMON (გარემო). C-R23-01/C-R38-01: 5 NUL იგივე offset-ებზე (63 654 byte), 2 U+FFFD `aria-label` (round 39: 1).', '');
}
fs.writeFileSync(p, lines.join('\n'));
console.log('feature-status updated');
