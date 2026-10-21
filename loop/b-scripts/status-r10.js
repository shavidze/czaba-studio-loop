const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'feature-status.md');
let s = fs.readFileSync(file, 'utf8');
const rep = (a, b) => {
  if (!s.includes(a)) throw new Error(`missing: ${a.slice(0, 80)}`);
  s = s.replace(a, b);
};
const row = (id, text) => {
  const re = new RegExp(`^\\| ${id.replace(/[-]/g, '\\-')} \\|.*$`, 'm');
  if (!re.test(s)) throw new Error(`row missing: ${id}`);
  s = s.replace(re, text);
};

rep('განახლდა: 2026-10-09 · ავტორი: B (round 8 → round 9 დაგეგმვა)', 'განახლდა: 2026-10-10 · ავტორი: B (round 9 → round 10 დაგეგმვა)');
s = s.replace(/^მიმდინარე რაუნდი: .*$/m,
  'მიმდინარე რაუნდი: **Round 10** — ბაგების რაუნდი: C-R7-01 + C-R7-02 (`current-task.md`). Round 11: SRW-11B-ის ეტაპი 2. Round 12: SRW-11B-ის ეტაპი 3. შემდეგ milestone-ის სრული რეგრესია.\n\n' +
  'Round 9-ის შედეგი (C, `c-round-9.md`): **FAIL**. R9-D3/L1/L2/U/Doc და G9-1..3 PASS-ია. R9-D1 (D 2/3), R9-D2 (D − N p95 +0.3 ms) და R9-L3 ჩავარდა. C-R8-01 და C-R6-02 ღიაა: app-side ნაწილი დადასტურებულია, შემდეგი მტკიცებულება Tech Lead-ის quiet Chrome-ია. უცვლელი კოდის ხელახალი გაზომვა აღარ ხდება, ამიტომ Round 11-ის ბაგების რაუნდი Round 10-ზე გადმოვიდა.');

row('FB-01', '| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მუშავდება** (Low C-R7-02, Round 10; C-ის სხვა ID-ები PASS-ია) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r PASS). ღიაა C-R7-02 (Low) | Round 10: C-R7-02. Tech Lead: რეალური მაუსი/wheel/pinch |');
row('FB-08', '| FB-08 | პანელების განლაგება | **ბაგია** (SRW-11A მზადაა; SRW-11B-ის ეტაპი 1-ის ყველა ID PASS-ია; ღიაა C-R8-01, app-side contract R9-D3 PASS) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2; `c-round-9.md` §3 | C-R8-01: Tech Lead quiet Chrome. Round 11: fold/სიმაღლე/auto-fit. Round 12: მცურავი ვიდეო |');
row('FB-16', '| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** | `c-round-7.md` §2: RF7-P1/P2/2 PASS, RF7-3 FAIL (C-R7-01); C-R6-02: `c-round-9.md` (N 3/3, RF5-3 3/3, D 2/3; R9-L1/L2 PASS) | Round 10: C-R7-01. C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap |');
row('SRW-03', '| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** | `c-round-7.md` §2, `c-round-7.json` (C-R7-01, C-R6-02); `c-round-8.md` §4 (N_1); `c-round-9.md` §2–§3 | Round 10: C-R7-01. C-R6-02: Tech Lead quiet Chrome |');
row('SRW-05', '| SRW-05 | Loop brace, sample-accurate wrap | **მუშავდება** (ვიდეოს landing wrap-ზე, C-R7-01) | `c-round-7.md` §2.2 (L6_1 wrap 1 = 2.244). აუდიოს wrap და export უცვლელია | Round 10: C-R7-01 (instrumentation → fix) |');
row('SRW-10', '| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მუშავდება** (Low C-R7-02, Round 10; C-ის სხვა ID-ები PASS-ია; ხელით შემოწმება რჩება) | `c-round-6.md` §3; `c-round-7.md` §3 (R10-N5r, R10-N5-U), §6 (N1/N3/N6/N8) | Round 10: C-R7-02. Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |');
row('SRW-11B', '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპი 1: R11-P1b/c/d/e, R11-P4d, R11-U1, R8-D1 PASS; R9-D3 contract PASS; ღიაა C-R8-01. ეტაპები 2–3 არ დაწყებულა; ეტაპი 3 SRW-03-ზეა დამოკიდებული) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; D-29 + D-29a (`plan.md`); ეტაპები 2/3: `tasks/round-7-before-bounded-policy.md` §7 | C-R8-01: Tech Lead quiet Chrome. Round 11: ეტაპი 2. Round 12: ეტაპი 3 |');
row('C-R7-01', '| C-R7-01 | Medium | **მუშავდება** (Round 10) | `c-round-7/runs/L6_1*.json`, `rf72-summary.txt` | Round 10: wrap-ზე standby hand-off-ის instrumentation (მიზეზები a/b/d/m/c), შემდეგ მხოლოდ დადასტურებული მიზეზის გამოსწორება. Verdict R10-W1: 3 ვალიდური L6 run, 9 wrap. ეტაპი 3 მის დახურვას ელოდება |');
row('C-R6-02', '| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია: R9-L1/L2 PASS) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 (N 3/3, RF5-3 3/3, D 2/3) | Tech Lead quiet Chrome, R3-V1 D layout. კოდი Round 10-ში გაყინულია |');
row('C-R7-02', '| C-R7-02 | Low | **მუშავდება** (Round 10) | `c-round-7/runs/n5r-*.json` (sweep 1.41–1.47 px) | Round 10: დიაგნოზი (ბოლო tick-ის border / label / rounding), შემდეგ overflow ≤ 1 px C-ის მთელ zoom sweep-ზე |');
row('C-R8-01', '| C-R8-01 | Medium | **ბაგია** (compositor-only contract R9-D3 PASS; R9-D1 2/3, R9-D2 D − N p95 +0.3 ms) | `c-round-9/runs/drift-summary.txt`, `runs/D_3.json`, `c-round-9.md` §2, §7 | Tech Lead quiet Chrome, R3-V1 D layout (სურვილისამებრ paint/raster trace D vs N, 8–12 წმ). ეტაპ 2-ში ერთი mode-D info run |');
row('RF7-2 / RF7-3', '| RF7-2 / RF7-3 | ვიდეოს drift (R3-V1, მათ შორის **mode D**: panel ღია, music მონიშნული) და loop wrap-ის landing (RF5-2) სუფთა Windows Chrome-ზე, VP9 + H.264 | **სავალდებულოა** C-R8-01-ისა და C-R6-02-ისთვის, ხოლო C-R7-01-ისთვის, თუ Round 10 ვერ დახურავს: დატვირთულ მანქანაზე app და preemption ერთმანეთისგან არ გამოირჩევა |');

rep('ბოლოს დაიხურა (C, round 7): **C-R6-01** (R30-1/2/U), **C-R6-03** (R10-N5r, R10-N5-U), checkpoint-r6 #10.',
  'ბოლოს დაიხურა (C, round 7): **C-R6-01** (R30-1/2/U), **C-R6-03** (R10-N5r, R10-N5-U), checkpoint-r6 #10. Round 9-ში ბაგი არ დაიხურა.\n\n' +
  'Round 9-ის ჩანაწერები (ბაგი არ არის): reviewer M1 (latch), M-R10-1/M2 (preview-ის 20 Hz re-render) და L2–L8 ეტაპ 2-ისთვის ან შემდეგისთვისაა ჩაწერილი (`backlog.json` → SRW-11B `recorded_followups`). `a7-review-pending` დაიხურა: A-მ code-reviewer ორჯერ გაუშვა სრულ cumulative diff-ზე. Harness-ის წესები H1/H2 B-მ გადაწყვიტა (`current-task.md` §6.4). Root-ის ძველი carry (M1, L1–L4, L6, L7, L8, M2, M3) დახურულია და ღიად აღარ ითვლება. Root-ისთვის: უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml`.');

fs.writeFileSync(file, s);
console.log('feature-status updated');
