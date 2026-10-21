const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'feature-status.md');
const text = fs.readFileSync(file, 'utf8');
const NL = text.includes('\r\n') ? '\r\n' : '\n';
let lines = text.split(NL);

const indexOf = (prefix) => {
  const hits = lines.flatMap((line, i) => (line.startsWith(prefix) ? [i] : []));
  if (hits.length !== 1) {
    throw new Error(`prefix ${hits.length}x: ${prefix.slice(0, 50)}`);
  }
  return hits[0];
};
const setLine = (prefix, value) => {
  lines[indexOf(prefix)] = value;
};
const replaceBlock = (startPrefix, endPrefix, block) => {
  const start = indexOf(startPrefix);
  const end = indexOf(endPrefix);
  if (end <= start) {
    throw new Error('bad block');
  }
  lines = [...lines.slice(0, start), ...block, ...lines.slice(end)];
};
const insertAfter = (prefix, block) => {
  const at = indexOf(prefix);
  lines = [...lines.slice(0, at + 1), ...block, ...lines.slice(at + 1)];
};

setLine('განახლდა:', 'განახლდა: 2026-10-12 · ავტორი: B (round 29 → round 30 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`');

setLine(
  '**⚠ გარემო (root):**',
  '**⚠ გარემო (root):** 2026-10-12-ს B-ის round-30 დაგეგმვისას dev server `127.0.0.1:5173` მუშაობდა (200), თუმცა round 27–29-ში A/C-ის დაწყებისას რამდენჯერმე გაჩერდა. თუ C-ის დაწყებისას გაჩერებულია, root-მა უნდა გაუშვას; აგენტები მას არ რთავენ. `node.exe` დაგეგმვისას **12**-ია.',
);

replaceBlock('მიმდინარე რაუნდი:', '## 1. მომხმარებლის თავდაპირველი მოთხოვნები', [
  'მიმდინარე რაუნდი: **Round 30** (`current-task.md`, D-29u) — SRW-13 ეტაპი 3: **FB-04 Clip Gain** ერთ მონიშნულ აუდიო კლიპზე (R13-M1).',
  '- **A:**',
  '  - მონაცემი: `ArrangementClip.gainDb?` (მხოლოდ არანულოვანზე, −60…+24 dB, 0.1 dB);',
  '  - graph: `clipGains` option და `ScheduleHandle.setClipGain` — ცოცხლად reschedule-ის გარეშე, loop-ის შემდეგ iteration-ებშიც, export-შიც; ახალი კვანძი არ ემატება;',
  '  - clipboard: Copy/Cut/Paste gain-ს ინარჩუნებს; Split/Duplicate/trim/move/Delete Time — spread-ით;',
  '  - detail panel: ახალი სვეტი `Clip Gain, dB` (რიცხვითი ველი + `0 dB` reset), commit Enter/blur-ზე = ერთი `Clip Gain` ჩანაწერი; ჯგუფზე, ვიდეოზე და ცარიელ მონიშვნაზე disabled მიზეზით;',
  '  - გაყინული `detail-panel-polish.test.tsx`-ის ორი query-ის ვიწრო ცვლილება (B probe);',
  '  - doc 035 და ახალი `clip-gain.test.tsx` (≥ 16 `it`).',
  '- **C:** R30-GE (export, Master −12 dB-ზე, ±0.2 dB), GV/GL (ცოცხლად და loop-ში, hook-ები და meter), GH/GK/GD, GN (gain edit-ების შემდეგ რჩება), GUI (1440/1280), GC, K, R, S, U (mutation a–i), Doc, G30-1..3, Ableton-ის ორი ვერდიქტი.',
  '',
  'T12-ის რიგში რჩება (მომხმარებლის T12 სპეციფიკაცია, არა გადადებული FB-04): slider/drag/Shift/double-click (T12.8/T12.9), რამდენიმე კლიპის Gain (T12.7), waveform gain-ის მიხედვით (T12.19), gain envelope (T12.10).',
  '',
  'შემდეგ:',
  '- C-R23-01 — Tech Lead-ის პასუხისთანავე, ახალ ფუნქციამდე;',
  '- Round 31: ეტაპი 4 (FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick, A-R29-REVIEW-1).',
  '',
  '**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 30 -StartPhase A`.',
  '',
  '**Round 29-ის შედეგი** (C, `c-round-29.md`): **PASS** ყველა UI-დან მიღწევად ID-ზე.',
  '- **PASS:** G29-1..3 (vitest 1133/1133, Biome 218 + 1, build 0, protected 4/4, ანონიმური `/studio-lab`, premium sign-in), R29-PA (export `[20,22)` 0 LSB), PB, PC (loop 12–18 → 12–16, playhead 26 → 24), PD (3/3), NO (zero-width გაჩერებული და დაკვრისას), FT (geometry = round 28), UR (PA, PC), K, R (ცარიელი clipboard-ის ჩათვლით), S, U (mutation a–g), Doc.',
  '- **Not run:** R29-NE და არანულოვანი (40–41) no-op — UI-დან მიუღწეველია (მონაკვეთი ყოველთვის კლიპის საზღვრებშია). მხოლოდ provider ტესტები და mutation (d) ფარავს; PASS არ არის.',
  '- **დაიხურა:** C-R28-01, C-R28-02, A-R28-REVIEW-4; C-R27-02 — D-29t-ის წესით (3/3, `node.exe` 10).',
  '- **ახალი Low:** A-R29-REVIEW-1 (pending fader flush → undo label) → ეტაპი 4; DOC034-UNREACHABLE-NOTE.',
  '- **Ableton:** ყველა ხაზის Paste ორიგინალ ხაზებზე — დაუდასტურებელი; Paste Cut Time-ის შემდეგ, Ctrl+Shift+L, Ctrl+Shift+Delete — შეგნებული განსხვავება; Cut Time no-op — დაუდასტურებელი.',
  '- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-12): HEAD `c5ed47b`, 67 ხაზი = `c-round-29/gates/git-status-end.txt`, `b-round-28-tree-sha256` 72 OK, ახალი `b-round-29-tree-sha256` 69 OK. Live ხელახლა არ შემოწმებულა (ეს C-ის მტკიცებულებაა).',
]);

setLine(
  '| FB-02 |',
  '| FB-02 | Cut (სიცარიელით) vs Cut Time | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი ID PASS-ია, Round 28–29; C-R28-01/02 დაიხურა. R29-NE და არანულოვანი no-op UI-დან მიუღწეველია — მხოლოდ provider ტესტები) | Cut/Copy/Paste/Cut Time: `c-round-5.md` (R9-C1..C4), `c-round-20.md` §2.12; SRW-24: `c-round-28.md` §1–§5, `c-round-29.md` §1–§8. მოთხოვნა: `docs/technical/studio-real-workspace/delete-selection-update.md` | Tech Lead: R28-T. DOC034-UNREACHABLE-NOTE |',
);
setLine(
  '| FB-04 |',
  '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **მუშავდება** (Round 30 გაგზავნილია, D-29u) | — | SRW-13 ეტაპი 3: A → C (R30-*). T12.7/8/9/19 — T12-ის რიგში |',
);
setLine(
  '| SRW-09 |',
  '| SRW-09 | Clipboard (FB-02) | **მოწმდება** (C-R28-01 დაიხურა Round 29-ში: ყველა ხაზის clipboard ორიგინალ ხაზებზე, D-25 ერთხაზიან/კლიპების clipboard-ზე) | `c-round-5.md`; `c-round-20.md` §2.12; `c-round-28.md` §3, §11; `c-round-29.md` §3 | Tech Lead: R28-T. Round 30-ში clipboard gain-ს ატარებს (R30-GN) |',
);
setLine(
  '| SRW-13 |',
  '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპი 1 და 2a მზადაა; ეტაპი 2b-ის ყველა ID PASS-ია (round 27–28); ღიაა C-R27-01, Medium, Tech Lead quiet Chrome; ეტაპი 3 მუშავდება) | ეტაპი 1: `c-round-25.md`; ეტაპი 2a: `c-round-26.md`; ეტაპი 2b: `c-round-27.md` §1–§10, `c-round-28.md` §6 | ეტაპი 3: FB-04 clip gain (Round 30, D-29u). ეტაპი 4: FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick, A-R29-REVIEW-1 (Round 31). C-R27-01: Tech Lead |',
);
setLine(
  '| SRW-24 |',
  '| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი R28/R29 ID PASS-ია; C-R28-01/02 და finding 4 დაიხურა; R29-NE/40–41 — UI-დან მიუღწეველი) | `delete-selection-update.md`; `c-round-28.md` §1–§9; `c-round-29.md`; `tasks/round-28.md`, `tasks/round-29.md` | Tech Lead: R28-T. DOC034-UNREACHABLE-NOTE |',
);

setLine(
  '| C-R27-02 |',
  '| C-R27-02 | Low | **დაიხურა** (Round 29: round-27-ის 8 ფაილიანი batch 152/152 ×3, `node.exe` 10 < 30 — D-29t-ის წესი) | `c-round-29/gates/vitest-r27batch-1..3.txt` | — |',
);
setLine(
  '| C-R28-01 |',
  '| C-R28-01 | Low | **დაიხურა** (Round 29: R29-PA/PB/PC/PD; mutation a–c) | `c-round-29.md` §3 | — |',
);
setLine(
  '| C-R28-02 |',
  '| C-R28-02 | Low | **დაიხურა** (Round 29: R29-NO zero-width გაჩერებული და დაკვრისას; არანულოვანი — მხოლოდ provider ტესტი) | `c-round-29.md` §4 | — |',
);
setLine(
  '| A-R28-REVIEW-4 |',
  '| A-R28-REVIEW-4 | Low | **დაიხურა** (Round 29: R29-FT, geometry = round 28) | `c-round-29.md` §4 | — |',
);
insertAfter('| A-R28-REVIEW-4 |', [
  '| A-R29-REVIEW-1 | Low | **არ დაწყებულა** (არსებული ქცევა; ბრაუზერში არ შემოწმებულა) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | pending Volume/Master preview `applyEdit`-ში ცალკე ჩანაწერად იწერება, ამიტომ no-op Cut Time-ის შემდეგ undo label fader-ს აჩვენებს → SRW-13 ეტაპი 4 (Round 31) |',
  '| DOC034-UNREACHABLE-NOTE | Low | **არ დაწყებულა** | `c-round-29.md` §4, §6 | doc 034-მა უნდა თქვას, რომ არანულოვანი Cut Time no-op და „სიცარიელე შემდეგი კლიპით“ მხოლოდ კოდის გზებია → doc 034-ის მომდევნო მფლობელი რაუნდი ან საბოლოო docs pass |',
]);

insertAfter('Critical/High ღია ბაგი არ არის.', [
  '',
  '**Round 29:** დაიხურა C-R28-01, C-R28-02, A-R28-REVIEW-4 და C-R27-02. ახალი Low: A-R29-REVIEW-1, DOC034-UNREACHABLE-NOTE. C-R23-01: 2 NUL 28013/28014 (უცვლელი). ინფორმაცია: C-ის პირველი არავალიდური mutation მცდელობისას `npx`-მა `vitest@5.0.4` npm cache-ში ჩამოტვირთა (store უცვლელია) → root-ის ჩანაწერი.',
]);

const r28t = indexOf('| **R28-T** |');
insertAfter('| **R28-T** |', [
  '| **R30-T** | Clip Gain-ის ცვლილება დაკვრისას ყურსასმენით: click/zipper არ ისმის (τ 15 ms); +6 dB ერთ კლიპზე მხოლოდ იმ კლიპს ხდის ხმამაღლა | headless-ში მოსმენა შეუძლებელია |',
]);
if (r28t < 0) {
  throw new Error('R28-T row');
}

setLine('- round 6–28-ის დაუკომიტებელი tree (66 ხაზი);', '- round 6–29-ის დაუკომიტებელი tree (67 ხაზი);');
setLine(
  '- მანქანის დატვირთვა:',
  '- მანქანის დატვირთვა: round 27–28-ის A/C run-ებში 34–42 `node.exe`; round 29-ში 10–12 (C-R27-02 დაიხურა); B-ის round-30 დაგეგმვისას 12;',
);
setLine(
  '- dev server დაგეგმვისას ისევ გაჩერებული იყო',
  '- dev server round 27–29-ში A/C-ის დაწყებისას რამდენჯერმე გაჩერებული იყო (round 29: 16:51–17:08) — C-მდე root-მა უნდა შეამოწმოს;',
);
setLine(
  '- ორი უცხო agent ფაილი;',
  '- ორი უცხო agent ფაილი; C round 29-ის `npx` cache-ის ჩამოტვირთვა (vitest 5.0.4, store უცვლელი);',
);

fs.writeFileSync(file, lines.join(NL));
console.log('feature-status updated', lines.length);
