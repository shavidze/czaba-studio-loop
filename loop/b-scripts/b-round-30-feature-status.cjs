const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let t = fs.readFileSync(p, 'utf8');
const crlf = t.includes('\r\n');
if (crlf) t = t.replace(/\r\n/g, '\n');
const must = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const headStart = t.indexOf('განახლდა: 2026-10-12');
const tableStart = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
must(headStart > 0 && tableStart > headStart, 'head anchors');
const header = `განახლდა: 2026-10-13 · ავტორი: B (round 30 → round 31 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება \`tmp/studio-real-loop/\`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში:**
- **C-R23-01 ისევ ღიაა.** \`/studio-lab\`-ის SSR HTML-ში 2 NUL byte-ია (28013/28014, round 30: 61 609 byte). გამოსწორებას სჭირდება (a) React 19 ან (b) \`app/entry.server.tsx\`-ის ვიწრო grant A-სთვის (\`b-round-23.md\` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.
- **C-R27-01 (Medium)** quiet Chrome-ს ელოდება (D-29t), C-R6-02/C-R8-01-თან ერთად.
- **ახალი საინფორმაციო კითხვა TL-Q-FB05-FB11 (არ ბლოკავს):** \`2.mp4\` 03:08–03:17-ში მთავარ mixer-ზე ნათქვამია „პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება“. B scope-ს არ ამცირებს: ტრეკის Pan (FB-05, \`1.mp4\` 03:39) და Tempo-ს ბადე (FB-11) რჩება, თუ Tech Lead სხვას არ იტყვის.

**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX \`Soft impact\` full scale-ს აღწევს (DEMO-SFX-FULL-SCALE): (a) ნორმალიზების grant ან (b) მიღება.

**⚠ Root:**
- \`08b9e53\` (C-ის მიერ შემოწმებული 69 ფაილი) და \`1cefea1\` (\`shavidze/master\`-ის merge) დაკომიტდა. ხე სუფთაა, vitest 1167/1167.
- Push მეორე remote-ზე non-fast-forward-ით უარყოფილი იყო. Merge-ის შემდეგ ორივე remote-ის hash შესამოწმებელია, force push-ის გარეშე.
- Merge-ით შემოსული \`app/lib/auth.ts\` და \`auth-bugs.test.ts\` working copy-ში CRLF-ია, ამიტომ Biome 2 format error-ს აჩვენებს.
- Tracked \`frontend-architect.md\` Write/Bash-ს იძლევა.
- Dev server დაგეგმვისას მუშაობდა (200); \`node.exe\` 6–7.

მიმდინარე რაუნდი: **Round 31** (\`current-task.md\`, D-29v) — SRW-13 ეტაპი 4a: **FB-05 ტრეკის Pan** აუდიო ხაზებზე (R13-M2).
- **A:**
  - მონაცემი: \`ArrangementTrack.pan?\` — მხოლოდ არანულოვანზე, −1…+1, ბიჯი 1/50;
  - graph: არსებული panner \`tracks\`-იდან იწყება; \`ScheduleHandle.setTrackPan\`; export უცვლელია;
  - context: \`setTrackPan\`, pan-ის gesture, preview ისტორიის გარეშე (override reschedule-ზეც);
  - header-ის პირველი რიგი: Pan range + \`C\`/\`NL\`/\`NR\` readout, რომელიც C-ზე აბრუნებს;
  - doc 036 და ახალი \`track-pan.test.tsx\` (≥ 18 \`it\`).
- **C:** R31-PE/PE2 (export, Master −12, არხების ფორმულა), PV/PL, PH/PG/PD, PUI (1440 და 1280 ღია panel-ით), PC, K, R, S, U (mutation a–j), Doc, G31-1..3, Ableton-ის ორი ვერდიქტი.

SRW-13 ეტაპი 4 დაიყო (ერთი ფუნქცია ერთ რაუნდში):
- **4b:** fader-ის UX — click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick;
- **4c:** round-9 M1/L8;
- შემდეგ polish: C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE.

**Loop runner:** თუ \`run-loop.ps1\` \`-RoundLimit\`-ზე გაჩერდა, გადატვირთვა: \`-StartRound 31 -StartPhase A\`.

**Round 30-ის შედეგი** (C, \`c-round-30.md\`): **PASS** ყველა ID-ზე.
- **PASS:**
  - G30-1..3 (vitest 1161/1161, protected 4/4, ანონიმური \`/studio-lab\`);
  - R30-GE: B +6.0000 / −6.0000 dB; A, SFX და ვიდეო 0 LSB; reset = არასოდეს შეცვლილი;
  - GV: 0 ახალი start, ერთი \`setTargetAtTime\`, meter +6.0;
  - GL: loop-ის შემდეგი B source-ები სწორი gain-ით;
  - GH, GK, GD;
  - GN (split, duplicate, nudge, trim, Cut Time, Delete, Paste, D-25; export-ის მტკიცებულება);
  - GUI, GC, K, R, S, U (10/10), Doc.
- **ახალი Low:** C-R30-01 (არსებული ქცევა; round 19-ის 1280-ის გაზომვა range-ის გარეშე იყო), DOC035-NOTES, FADER-KEY-ENTRIES.
- **მიღებულია:** A-ს §6.1 (optional prop), §6.2/6.2a.
- **Ableton:**
  - კლიპის gain dB-ში — დადასტურებული;
  - ველი slider-ის ნაცვლად და რამდენიმე კლიპი — შეგნებული განსხვავება;
  - Volume-ისგან ცალკე, ზღვრები, reset და შენარჩუნება — დაუდასტურებელი.
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13): \`c5ed47b..08b9e53\` = C-ის 69 ფაილი; HEAD \`1cefea1\`, ხე სუფთაა, protected 4/4, tsc 0, vitest 1167/1167, build ✓, ახალი frozen სია 371 OK.
`;
t = t.slice(0, headStart) + header + t.slice(tableStart);

const rep = (from, to) => {
  must(t.includes(from), 'missing: ' + from.slice(0, 60));
  t = t.replace(from, to);
};
rep(
  '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მუშავდება** (Round 30 გაგზავნილია, D-29u) | — | SRW-13 ეტაპი 3: A → C (R30-*). T12.7/8/9/19 — T12-ის რიგში |',
  '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მოწმდება** (C-ის ყველა ID PASS-ია, Round 30; დარჩა Tech Lead-ის R30-T) | `c-round-30.md` §1–§9 (R30-GE +6.0000 dB, GV/GL, GN) | Tech Lead: R30-T. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |',
);
rep(
  '| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 ეტაპი 4 |',
  '| FB-05 | Pan | **მუშავდება** (Round 31 გაგზავნილია, D-29v) | — | SRW-13 ეტაპი 4a: A → C (R31-*) |',
);
const s13Start = t.indexOf('| SRW-13 |');
const s13End = t.indexOf('\n', s13Start);
must(s13Start > 0, 'SRW-13 row');
t =
  t.slice(0, s13Start) +
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a და 3 მზადაა — 3: Round 30 C PASS; ეტაპი 2b-ის ყველა ID PASS-ია; ღიაა C-R27-01, Medium, Tech Lead quiet Chrome; ეტაპი 4a მუშავდება) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md` | 4a: FB-05 Pan (Round 31, D-29v). 4b: fader-ის UX, A-R29-REVIEW-1, FADER-KEY-ENTRIES, Master-ის hold tick. 4c: round-9 M1/L8. C-R27-01: Tech Lead |' +
  t.slice(s13End);
rep(
  '| A-R29-REVIEW-1 | Low | **არ დაწყებულა** (არსებული ქცევა; ბრაუზერში არ შემოწმებულა) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | pending Volume/Master preview `applyEdit`-ში ცალკე ჩანაწერად იწერება, ამიტომ no-op Cut Time-ის შემდეგ undo label fader-ს აჩვენებს → SRW-13 ეტაპი 4 (Round 31) |',
  '| A-R29-REVIEW-1 | Low | **არ დაწყებულა** (არსებული ქცევა; ბრაუზერში არ შემოწმებულა) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | pending Volume/Master preview `applyEdit`-ში ცალკე ჩანაწერად იწერება, ამიტომ no-op Cut Time-ის შემდეგ undo label fader-ს აჩვენებს → SRW-13 ეტაპი 4b |\n| **C-R30-01** | Low | **არ დაწყებულა** (არსებული ქცევა; round 29-ის screenshot-შიც ჩანს) | `c-round-30.md` §10; `c-round-30/shots/gui-1280x720.png` | 1280×720-ზე, ღია detail panel-ით და ხილული range-ით, info სვეტის 5 ხაზს ~88 px სჭირდება, content კი 85 px-ია: სათაური და „ხაზი“ ერთმანეთს ეფარება. round 19-ის 1280-ის გაზომვა range-ის გარეშე იყო → polish რაუნდი 4c-ის შემდეგ |\n| DOC035-NOTES | Low | **არ დაწყებულა** | `c-round-30.md` §8, §10 | doc 035-ის სცენარის status-ის სათაური, l.4 სტატუსი და A §6.2a-ის (keyboard, 2 ჩანაწერი) შენიშვნა → polish რაუნდი |\n| FADER-KEY-ENTRIES | Low | **არ დაწყებულა** (არსებული ქცევა) | `c-round-30.md` §7 | Volume/Master fader-ზე თითო კლავიში = ერთი ჩანაწერი → ეტაპი 4b (Pan-იც შედის) |',
);
rep(
  '| R9-REVIEWER-M1-L8 | Low | **არ დაწყებულა** | `a-round-9.md` l.227–237 | `ArrangementContext.tsx`: `transportRunningRef` latch და position-store-ის შეცდომის ტექსტი. SRW-13 ეტაპი 4-ში',
  '| R9-REVIEWER-M1-L8 | Low | **არ დაწყებულა** | `a-round-9.md` l.227–237 | `ArrangementContext.tsx`: `transportRunningRef` latch და position-store-ის შეცდომის ტექსტი. SRW-13 ეტაპი 4c-ში',
);
rep(
  '| MASTER-HOLD-TICK-EDGE | Low | **არ დაწყებულა** | `c-round-26.md` §9 | Master-ის hold tick ≥ +6 dBFS-ზე 1 px ჩანს → SRW-13 ეტაპი 4 |',
  '| MASTER-HOLD-TICK-EDGE | Low | **არ დაწყებულა** | `c-round-26.md` §9 | Master-ის hold tick ≥ +6 dBFS-ზე 1 px ჩანს → SRW-13 ეტაპი 4b |',
);
rep(
  'Critical/High ღია ბაგი არ არის.\n',
  'Critical/High ღია ბაგი არ არის.\n\n**Round 30:** ბაგი არ დახურულა (რაუნდის scope-ში ახალი არ იყო). ახალი Low: C-R30-01 (არსებული ქცევა), DOC035-NOTES, FADER-KEY-ENTRIES. C-R23-01: 2 NUL 28013/28014 (უცვლელი).\n',
);
rep(
  '| **R30-T** | Clip Gain-ის ცვლილება დაკვრისას ყურსასმენით: click/zipper არ ისმის (τ 15 ms); +6 dB ერთ კლიპზე მხოლოდ იმ კლიპს ხდის ხმამაღლა | headless-ში მოსმენა შეუძლებელია |',
  '| **R30-T** | Clip Gain-ის ცვლილება დაკვრისას ყურსასმენით: click/zipper არ ისმის (τ 15 ms); +6 dB ერთ კლიპზე მხოლოდ იმ კლიპს ხდის ხმამაღლა | headless-ში მოსმენა შეუძლებელია |\n| **R31-T** | Pan-ის drag რეალური მაუსით და ყურსასმენით: მდორეა, zipper-ის გარეშე; 50L მხოლოდ მარცხნივ ისმის, C — ცენტრში (Round 31-ის შემდეგ) | headless-ში მოსმენა და რეალური მაუსი შეუძლებელია |',
);
rep(
  '- round 6–29-ის დაუკომიტებელი tree (67 ხაზი);\n',
  '- round 6–30-ის სამუშაო დაკომიტდა (`08b9e53`, შემდეგ merge `1cefea1`). მეორე remote-ის push non-fast-forward-ით უარყოფილი იყო — root-მა უნდა შეათანხმოს force push-ის გარეშე. ეს შუალედური checkpoint-ია, არა release;\n- merge-ის შემდეგ `app/lib/auth.ts` და `auth-bugs.test.ts` working copy-ში CRLF-ია (`core.autocrlf`): Biome `./app` 2 format error-ს აჩვენებს (Studio-ს ფაილები არ არის);\n- tracked `.claude/agents/frontend-architect.md` Write/Bash-ს იძლევა (checkpoint review 9);\n',
);
rep(
  '- ორი უცხო agent ფაილი; C round 29-ის `npx` cache-ის ჩამოტვირთვა (vitest 5.0.4, store უცვლელი);',
  '- agent ფაილები ახლა tracked-ია (root-ის commit-ები); C round 29-ის `npx` cache-ის ჩამოტვირთვა (vitest 5.0.4, store უცვლელი);',
);
must(!t.includes('განახლდა: 2026-10-12'), 'old date remains');
if (crlf) t = t.replace(/\n/g, '\r\n');
fs.writeFileSync(p, t);
console.log('ok', crlf ? 'CRLF' : 'LF', t.length);
