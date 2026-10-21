const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'feature-status.md');
const raw = fs.readFileSync(file, 'utf8');
const crlf = raw.includes('\r\n');
let t = raw.replace(/\r\n/g, '\n');
if (t.includes('round 28 → round 29')) {
  throw new Error('already updated');
}
function rep(a, b) {
  const i = t.indexOf(a);
  if (i < 0 || t.indexOf(a, i + 1) >= 0) {
    throw new Error('anchor not unique: ' + a.slice(0, 70));
  }
  t = t.replace(a, () => b);
}
function cut(startAnchor, endAnchor, replacement) {
  const s = t.indexOf(startAnchor);
  const e = t.indexOf(endAnchor);
  if (s < 0 || e < 0 || e <= s || t.indexOf(startAnchor, s + 1) >= 0) {
    throw new Error('block not found: ' + startAnchor.slice(0, 50));
  }
  t = t.slice(0, s) + replacement + t.slice(e);
}

rep('განახლდა: 2026-10-12 · ავტორი: B (round 27 → round 28 დაგეგმვა)', 'განახლდა: 2026-10-12 · ავტორი: B (round 28 → round 29 დაგეგმვა)');

cut(
  '**⚠ Tech Lead-ისთვის, პირველ რიგში — C-R23-01 ისევ ღიაა.**',
  '## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)',
  [
    '**⚠ Tech Lead-ისთვის, პირველ რიგში:**',
    '- **C-R23-01 ისევ ღიაა.** `/studio-lab`-ის SSR HTML-ში ახლა **2 NUL** byte-ია: 28013/28014 (ხილული ტექსტი `Arrangement · `). round 27-ის მეორე წყვილი (58733/58734) გაქრა მხოლოდ იმიტომ, რომ round 28-მა footer-ის ტექსტი შეცვალა — ეს offset-ის გადაწევაა და არა გამოსწორება. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). B ამ ნებართვას ვერ გასცემს. პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.',
    '- **C-R27-01 (Medium) ახლა quiet Chrome-ს ელოდება** (D-29t, decision table-ის row 3). C round 28-ში r26 layout-ზე ვალიდური დარჩა ორი run: vm-4 19.0 ms (PASS) და **vm-5 287.6 ms** (procedure-ის ფარგლებში; excursion Master Mute-ის click-იდან ~130 ms-ში, hardSeek 0). მექანიზმის ჰიპოთეზა არ არსებობს, ამიტომ A-ს რაუნდი არ ინიშნება. საჭიროა RF7-2/RF7-3-ის სუფთა Chrome-ის run, C-R6-02/C-R8-01-თან ერთად.',
    '',
    '**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX `Soft impact` თავისთავად full scale-ს აღწევს, ამიტომ Master Peak `+0.0` Clip-ს აჩვენებს და export 2 sample-ს ზღუდავს. (a) `lib/sfx-*`/demo-synth-ის ვიწრო grant დემოს პიკების ≤ `MAX_24BIT_SAMPLE`-მდე ნორმალიზებისთვის, ან (b) მიღება. პრედიკატი არ იცვლება.',
    '',
    '**⚠ გარემო (root):** 2026-10-12-ს B-ის დაგეგმვისას dev server `127.0.0.1:5173` ისევ გაჩერებული იყო (`curl` → `000`). C round 29-ის დაწყებამდე root-მა უნდა გაუშვას; აგენტები მას არ რთავენ. `node.exe` ახლა **10**-ია (round 27–28-ში 34–42).',
    '',
    'მიმდინარე რაუნდი: **Round 29** (`current-task.md`, D-29t) — SRW-24-ის follow-up bug round (C-ის ბაგები პირველ რიგში).',
    '- **A:**',
    '  - C-R28-01: ყველა ხაზის მონიშვნიდან (Ctrl+Shift+L → Ctrl+C/X) და Cut Time-იდან აღებული clipboard Paste-ზე ორიგინალ ხაზებს ინარჩუნებს, მაშინაც, როცა მასალა ერთ აუდიო ხაზზეა. ამისთვის `ArrangementClipboard` იღებს optional ველს. ერთხაზიანი მონაკვეთისა და კლიპების D-25 წესი (active lane) უცვლელია.',
    '  - C-R28-02: Cut Time-ის no-op (zero-width ან არაფერი იცვლება) ისტორიას, playhead-ს, მონაკვეთსა და ბუფერს არ ეხება, ხოლო status გულწრფელია.',
    '  - A-R28 review finding 4: footer-ის მონიშვნის ხაზი ყველა ხაზის მდგომარეობაში ამბობს `ყველა ხაზი`-ს.',
    '  - Doc 034: Paste-ის წესი, no-op, footer, Ableton-ის გასწორებული ცხრილი.',
    '  - ტესტები: ახალი `all-lane-clipboard.test.tsx` (≥ 10 `it`). არსებული ტესტები არ იცვლება.',
    '- **C:** R29-PA/PB/PC/PD/NO/NE/FT/UR/K/R/S/U/Doc, G29-1..3, Ableton-ის სვეტი, C-R27-02-ის წესი (`node.exe` < 30), C-R23-01-ის ჩანაწერი.',
    '',
    'შემდეგ:',
    '- C-R23-01 — Tech Lead-ის პასუხისთანავე, ახალ ფუნქციამდე;',
    '- Round 30: SRW-13 ეტაპი 3 (FB-04 clip gain);',
    '- Round 31: ეტაპი 4 (FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick).',
    '',
    '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 29 -StartPhase A`.',
    '',
    '**Round 28-ის შედეგი** (C, `c-round-28.md`): **FAIL** — მხოლოდ C-R27-01-ის გამო.',
    '- **PASS (SRW-24):** G28-1..3 (vitest 1119/1119), R28-DA/DB/DV/DM/VL/VD/CX/UR/PS/TF/UI/K/E/R/S/U/Doc. Export-ში სიცარიელე ციფრული 0-ია, დანარჩენი ფანჯრები ≤ 1 LSB. Video drift 4–6.008-ზე median 2.9 / max 48.1 ms (R3-V1).',
    '- **PASS (round 27-ის დავალიანება):** R27-TL (გასწორებული oracle: p95 0.11, max 0.35 dB), R27-K 1440 + Space-on-M, მცურავი ვიდეო, R27-TO Redo-თი, R27-E offline node-ები 0, R27-R, R27-TI video floor.',
    '- **C-R27-01:** row 3 (B, D-29t) → Tech Lead.',
    '- **C-R27-02:** 3/3 batch მწვანე 35–36 `node.exe`-ზე → watch. Round 29-ის წესი: < 30-ზე 3/3 → იხურება.',
    '- **ახალი Low:** C-R28-01, C-R28-02 → Round 29.',
    '- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-12): HEAD `c5ed47b`, 66 ხაზი = `c-round-28/gates/git-status-end.txt`, `b-round-28-tree-sha256` 72 OK, snapshot-ების sha-ები ემთხვევა. Live ხელახლა არ შემოწმებულა (server გაჩერებული იყო).',
    '- **Ableton:** C-მ აღმოაჩინა, რომ B-ის round-27 ცხრილში Ctrl+Shift+L „დაუდასტურებლად“ ეწერა, თუმცა წყაროში არსებობს (§42.8/§42.16). ეს B-ის შეცდომაა; Round 29-ში doc 034 სწორდება.',
    '',
  ].join('\n'),
);

rep(
  '| FB-02 | Cut (სიცარიელით) vs Cut Time | **მუშავდება** (კონტრაქტი შეიცვალა მომხმარებლის 2026-10-11-ის გადაწყვეტილებით: Delete/Backspace ყოველთვის ტოვებს სიცარიელეს, Ctrl+Shift+L ყველა ხაზზე ავრცელებს მონიშვნას, სიცარიელეს მხოლოდ Ctrl+Shift+X ხურავს; ძველი Delete Time ქცევა აღარ შეესაბამება) | Cut/Copy/Paste/Cut Time: `c-round-5.md` (R9-C1..C4), `c-round-20.md` §2.12. ჩანაცვლებული: R1-B5, R1-B12, R9-C5-ის პირველი პუნქტი. მოთხოვნა: `docs/technical/studio-real-workspace/delete-selection-update.md` | SRW-24 — Round 28 |',
  '| FB-02 | Cut (სიცარიელით) vs Cut Time | **ბაგია** (Low). მომხმარებლის 2026-10-11-ის კონტრაქტი C-მ Round 28-ში დაადასტურა (Delete/Backspace სიცარიელით, Ctrl+Shift+L, Ctrl+Shift+X). ღიაა C-R28-01 (ყველა ხაზის clipboard active lane-ზე ჯდება) და C-R28-02 (Cut Time-ის no-op-ის ცრუ status) | Cut/Copy/Paste/Cut Time: `c-round-5.md` (R9-C1..C4), `c-round-20.md` §2.12; SRW-24: `c-round-28.md` §1–§5. ჩანაცვლებული: R1-B5, R1-B12, R9-C5-ის პირველი პუნქტი. მოთხოვნა: `docs/technical/studio-real-workspace/delete-selection-update.md` | Round 29 (D-29t). Tech Lead: R28-T |',
);
rep(
  '| SRW-09 | Clipboard (FB-02) | **მუშავდება** (Cut/Copy/Paste/Cut Time დადასტურებულია; Delete-ის კონტრაქტი ჩანაცვლდა → SRW-24) | `c-round-5.md`; `c-round-20.md` §2.12 | SRW-24 — Round 28 |',
  '| SRW-09 | Clipboard (FB-02) | **ბაგია** (Low; Cut/Copy/Paste/Cut Time დადასტურებულია; Delete-ის ახალი კონტრაქტი C PASS (Round 28); D-25-ის Paste-ის წესი Round 29-ში სწორდება ყველა ხაზის clipboard-ისთვის → C-R28-01) | `c-round-5.md`; `c-round-20.md` §2.12; `c-round-28.md` §3, §11 | Round 29 |',
);
rep(
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპი 1 და 2a მზადაა; ეტაპი 2b: C round 27 FAIL მხოლოდ ღირებულების oracle-ზე → C-R27-01, Medium; გაუშვებელი ID-ები round 28 §4.1-შია) | ეტაპი 1: `c-round-25.md`; ეტაპი 2a: `c-round-26.md`; ეტაპი 2b: `c-round-27.md` §1–§10 | C-R27-01-ის decision table და round 27-ის დარჩენილი ID-ები (Round 28 C). ეტაპი 3: FB-04 clip gain (Round 29). ეტაპი 4: FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick |',
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპი 1 და 2a მზადაა; ეტაპი 2b-ის ყველა ID PASS-ია (round 27–28); ღიაა C-R27-01, Medium, Tech Lead quiet Chrome) | ეტაპი 1: `c-round-25.md`; ეტაპი 2a: `c-round-26.md`; ეტაპი 2b: `c-round-27.md` §1–§10, `c-round-28.md` §6 | C-R27-01: Tech Lead. ეტაპი 3: FB-04 clip gain (Round 30). ეტაპი 4: FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick (Round 31) |',
);
rep(
  '| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **მუშავდება** (Round 28) | `delete-selection-update.md`; `current-task.md` §0, §4.2–§4.5 | Round 28: A → C (R28-*). Tech Lead: R28-T |',
  '| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **ბაგია** (Low; C-ის ყველა R28 ID PASS; ღიაა C-R28-01, C-R28-02, A-R28 review finding 4) | `delete-selection-update.md`; `c-round-28.md` §1–§9; `tasks/round-28.md` | Round 29 (D-29t): A → C (R29-*). Tech Lead: R28-T |',
);

rep(
  '| **C-R27-01** | Medium | **ბაგია** (R27-RB drift: 81.7/36.2/46.1/20.6/41.6 ms vs 30.1; dock hardSeeks 2/2; control run-ები ხაზების read-ის გარეშეც 60.4/130.6) | `c-round-27.md` §7; `c-round-27/runs/vm-*.txt` | Round 28 C §4.1: r26 layout, decision table, hardSeek vs Master Mute-ის დრო, `node.exe` რაოდენობა |\n| C-R27-02 | Low | **ბაგია** (frozen-8 batch: 151/152, 150/152, 152/152; ცალკე და სრულ suite-ში მწვანეა) | `c-round-27/gates/vitest-frozen8*.txt` | Round 28 C: 3 batch დატვირთვის ჩაწერით; ტესტი არ იცვლება |',
  [
    '| **C-R27-01** | Medium | **ბაგია** (round 28, r26 layout: vm-3 125.4 off-procedure, vm-4 19.0, vm-5 287.6 ms; hardSeek 0 ყველგან; row 3) | `c-round-27.md` §7; `c-round-28.md` §6; `c-round-28/runs/vm-*.txt` | Tech Lead quiet Chrome (C-R6-02/C-R8-01-თან ერთად). A-ს რაუნდი არ ინიშნება მექანიზმის ჰიპოთეზის გარეშე (D-29t) |',
    '| C-R27-02 | Low | **ბაგია** (watch: round 28-ში 3/3 batch მწვანე 35–36 `node.exe`-ზე) | `c-round-27/gates/vitest-frozen8*.txt`; `c-round-28/gates/vitest-r27batch-1..3.txt` | Round 29 C: 3 batch; < 30 `node.exe`-ზე 3/3 → იხურება, ჩავარდნა → ტესტის მდგრადობა |',
    '| C-R28-01 | Low | **ბაგია** (ყველა ხაზის Cut/Copy, ერთ აუდიო ხაზზე მასალით, Paste-ზე active lane-ზე ჯდება) | `c-round-28.md` §11; `c-round-28/runs/finding2.txt`; `a-round-28.md` §4 finding 2 | Round 29: clipboard-ის წარმოშობის flag (D-25-ის შესწორება) |',
    '| C-R28-02 | Low | **ბაგია** (Cut Time no-op-ზე status „სიცარიელე დაიხურა“, მონაკვეთი იშლება, playhead remap) | `c-round-28.md` §11; `c-round-28/runs/zero-width-cx.txt` | Round 29 |',
    '| A-R28-REVIEW-4 | Low | **ბაგია** (ყველა ხაზის მდგომარეობა მხოლოდ გარდამავალ status-შია; overlay `aria-hidden`) | `a-round-28.md` §4 finding 4 | Round 29: footer-ის `· ყველა ხაზი` |',
  ].join('\n'),
);
rep(
  '| **C-R23-01** | Medium | **ბაგია** (round 27: 4 NUL — 28013/28014 და 58733/58734; offset-ები ისევ გადაიწია, ეს გამოსწორება არ არის) |',
  '| **C-R23-01** | Medium | **ბაგია** (round 28: 2 NUL — 28013/28014; round 27-ის 58733/58734 footer-ის ტექსტის შეცვლით გაქრა — offset-ის გადაწევა, არა გამოსწორება) |',
);

rep(
  '**Round 27:** ბაგი არ დახურულა.',
  '**Round 28:** ბაგი არ დახურულა. ახალია C-R28-01 და C-R28-02 (Low); A-R28 review finding 4 ბაგად ჩაიწერა (Low), finding 5 მიღებულია (Split ღილაკი enabled რჩება და click-ზე status-ით უარს ამბობს). ინფორმაცია: Ctrl+Shift+L-ის შემდეგ ცარიელ ადგილზე click-ზე status ძველია (ცნობილი pattern); ჭრის კიდეებზე fade არ არის → SRW-18. C-R23-01: 2 NUL.\n\n**Round 27:** ბაგი არ დახურულა.',
);

rep(
  '| **R28-T** | რეალურ Chrome-ში, რეალური მაუსით/კლავიატურით: Delete/Backspace მონაკვეთზე სიცარიელეს ტოვებს; Ctrl+Shift+L-ს browser არ იჭერს და ყველა ხაზზე ავრცელებს; Ctrl+Shift+X ხურავს სიცარიელეს; ყველა ხაზის overlay იკითხება |',
  '| **R28-T** | რეალურ Chrome-ში, რეალური მაუსით/კლავიატურით: Delete/Backspace მონაკვეთზე სიცარიელეს ტოვებს; Ctrl+Shift+L-ს browser არ იჭერს და ყველა ხაზზე ავრცელებს; Ctrl+Shift+X ხურავს სიცარიელეს; ყველა ხაზის overlay (`/60`) იკითხება; Round 29-ის შემდეგ — Ctrl+Shift+L → Ctrl+X → Ctrl+V სხვა active lane-ზე მასალას თავის ხაზზე აბრუნებს |',
);

rep('- round 6–27-ის დაუკომიტებელი tree (62 ხაზი);', '- round 6–28-ის დაუკომიტებელი tree (66 ხაზი);');
rep(
  '- მანქანის დატვირთვა: A/C-ის run-ების დროს 34–42 `node.exe` (C-R27-01/02-ის ჰიპოთეზა);',
  '- მანქანის დატვირთვა: round 27–28-ის A/C run-ებში 34–42 `node.exe` (C-R27-01/02-ის ჰიპოთეზა); B-ის round-29 დაგეგმვისას 10;\n- dev server დაგეგმვისას ისევ გაჩერებული იყო — C-მდე root-მა უნდა გაუშვას;',
);

fs.writeFileSync(file, crlf ? t.replace(/\n/g, '\r\n') : t, 'utf8');
console.log('feature-status updated');
