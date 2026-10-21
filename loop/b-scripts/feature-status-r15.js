const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let t = fs.readFileSync(p, 'utf8');
if (t.includes('Round 14-ის შედეგი')) {
  throw new Error('already updated for round 15');
}
function rep(from, to) {
  const i = t.indexOf(from);
  if (i < 0 || t.indexOf(from, i + 1) >= 0) {
    throw new Error('not exactly one match: ' + from.slice(0, 90));
  }
  t = t.slice(0, i) + to + t.slice(i + from.length);
}

rep(
  'განახლდა: 2026-10-10 · ავტორი: B (round 13 → round 14 დაგეგმვა)',
  'განახლდა: 2026-10-10 · ავტორი: B (round 14 → round 15 დაგეგმვა)',
);

const headStart = t.indexOf('მიმდინარე რაუნდი: **Round 14**');
const headEnd = t.indexOf('## 1. მომხმარებლის თავდაპირველი მოთხოვნები');
if (headStart < 0 || headEnd < 0) {
  throw new Error('header block not found');
}
t =
  t.slice(0, headStart) +
  `მიმდინარე რაუნდი: **Round 15** — C-R14-01 (ბიბლიოთეკის row-ები გაფართოებული ვიდეოს დროს) და C-R14-02 (Modal-ის X Export-ის Tab-ციკლში), D-29f (\`current-task.md\`). შემდეგ polish 14a–14c (Round 16–18) და milestone-ის სრული რეგრესია.

Round 14-ის შედეგი (C, \`c-round-14.md\`): **PASS.**
- **PASS:** R14-P1 (placement 6 შემთხვევაში, Δ ≤ 0.02; ◀/ძებნა/separator/preview ყველგან თავისი control-ია), R14-P2, R14-S (დაბრუნების ტექსტები სიტყვასიტყვით), R14-E (ფოკუსი dialog-ში, Tab-ციკლი ორივე მიმართულებით, Space, Esc, WAV კლავიატურით: RIFF PCM 2 ch 48 kHz 24-bit, 288 384 frame = პროექტის ბოლო), R14-U (C-ის guard-ები G1–G4), R14-Doc.
- **მეზობელი რეგრესიები PASS:** R13-F2/F3/F4 quick (reduced motion მხოლოდ სიმულაციით), R11A-1 quick, dock quick, RF7-P2. G14-1..3 PASS, vitest 945/945.
- **დაიხურა:** C-R13-01, C-R13-02, C-R13-03.
- **ახალი ბაგები:** C-R14-01 (Medium) — ყუთი სიისა და ხის ქვედა row-ებს ფარავს და ისინი scroll-ით ვერ ამოდის; 1280×720-ზე, ბიბლიოთეკით 480, მაუსით find → add იბლოკება. C-R14-02 (Low) — Modal-ის X-იდან Shift+Tab dialog-იდან გადის. ორივე Round 15-შია (D-29f).
- **ვერ შემოწმდა:** ნამდვილი \`prefers-reduced-motion\` (R13-RM, Tech Lead); render-ის შუაში ფოკუსი ბრაუზერში (render < 120 ms; component ტესტი ფარავს).

` +
  t.slice(headEnd);

rep(
  '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (Round 18) |',
  '| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (Round 19) |',
);
rep('| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 (Round 18) |', '| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 (Round 19) |');
rep(
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium), C-R11-01..03 და C-R13-01..03 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3 | Round 14: C-R13-01..03 (D-29e). Round 15: polish 14a (C-R11-01..03, D-29c). C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM |',
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 და C-R14-01 (Medium), C-R11-01..03 და C-R14-02 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §3–§8 | Round 15: C-R14-01/02 (D-29f). Round 16: polish 14a (C-R11-01..03, D-29c). C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM |',
);
rep('| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 |', '| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 (Round 19) |');
rep(
  '`c-round-13.md` §4 (vp9 import) | R2-V1 milestone-ის რეგრესიაში თავიდან |',
  '`c-round-13.md` §4 (vp9 import), `c-round-14.md` (vp9 OS-drop) | R2-V1 milestone-ის რეგრესიაში თავიდან |',
);

rep(
  '| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3); `c-round-13.md` §4–§5 (export, G13-3) | — |',
  '| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3); `c-round-13.md` §4–§5 (export, G13-3); `c-round-14.md` §2, §6 (WAV კლავიატურით, G14-3) | — |',
);
rep(
  'Round 14: dock და `video-sync.ts` გაყინულია, sync run არ არის |',
  'Round 15: dock და `video-sync.ts` გაყინულია, sync run არ არის |',
);
rep(
  '`c-round-13.md` §2.4 (controlled collapse, preview ჩერდება) | R11A-2 (keys) milestone-ის რეგრესიაში. Round 14 ბიბლიოთეკას მხოლოდ `bodyRef` prop-ს უმატებს — C ამოწმებს R11A-1 quick-ს |',
  '`c-round-13.md` §2.4 (controlled collapse, preview ჩერდება); `c-round-14.md` §8 (R11A-1 quick) | R11A-2 (keys) milestone-ის რეგრესიაში. Round 15 ბიბლიოთეკას მხოლოდ `bottomInsetPx` prop-ს უმატებს (გაფართოებული ვიდეოს დროს ხისა და სიის ქვედა padding) — C ამოწმებს R15-P3-ს და R11A-1 quick-ს |',
);
rep(
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium), C-R11-01..03 და C-R13-01..03 (Low)) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3; D-29, D-29a–D-29e (`plan.md`) | Round 14: C-R13-01..03 (R14-P1, R14-P2, R14-S, R14-E, R14-U, R14-Doc). Polish 14a–14c Round 15–17. C-R8-01: Tech Lead quiet Chrome |',
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 და C-R14-01 (Medium), C-R11-01..03 და C-R14-02 (Low)) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §1–§8; D-29, D-29a–D-29f (`plan.md`) | Round 15: C-R14-01/02 (R15-P1, R15-P2, R15-P3, R15-E, R15-U, R15-Doc). Polish 14a–14c Round 16–18. C-R8-01: Tech Lead quiet Chrome |',
);
rep(
  '| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 18, milestone-ის რეგრესიის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის (round 13-შიც peak 1.0) |',
  '| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 19, milestone-ის რეგრესიის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის (round 14-შიც peak 1.0, 1018 sample FS-ზე) |',
);
rep('| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 19 |', '| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 20 |');
rep(
  '| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 19, SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |',
  '| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 20, SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |',
);
rep('| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 20 |', '| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 21 |');
rep('| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 21, SRW-13-ის შემდეგ |', '| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 22, SRW-13-ის შემდეგ |');
rep('| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 22, SRW-13-ის შემდეგ |', '| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 23, SRW-13-ის შემდეგ |');
rep('| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 23 (C-R6-02 Tech Lead-ზეა) |', '| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 24 (C-R6-02 Tech Lead-ზეა) |');
rep('| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 24, SRW-13-ის შემდეგ |', '| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 25, SRW-13-ის შემდეგ |');
rep(
  '`c-round-13.md` §5 (header link, Header იდენტურია) | — |',
  '`c-round-13.md` §5 (header link, Header იდენტურია); `c-round-14.md` §2 (G14-3 header link) | — |',
);

const bugsOld = `| C-R13-01 | Low (C: Medium დასაბუთებულია) | **მუშავდება** (Round 14) | \`c-round-13/runs/f4-collapse-occluded-1440.json\`, \`shots/collapse-occluded-1440.png\`, \`c-round-13.md\` §6 | D-29e: placement ბიბლიოთეკის body-ში, ქვედა კიდეზე; header/◀, ძებნა, separator და preview არასოდეს იფარება (R14-P1, R14-P2) |
| C-R13-02 | Low | **მუშავდება** (Round 14) | \`c-round-13/shots/video-compact-after-1280.png\`, \`runs/f3-1440.txt\`, \`runs/r11a1-1440.txt\` | D-29e: დაბრუნების ტექსტები სიტყვასიტყვით (R14-S) |
| C-R13-03 | Low | **მუშავდება** (Round 14) | \`c-round-13/runs/export-focus-probe.txt\` | D-29e: Export-ის dialog ფოკუსს იღებს, Tab შიგნით ტრიალებს, დახურვისას ფოკუსი ბრუნდება (R14-E). \`Modal.tsx\` read-only რჩება |`;
const bugsNew = `| C-R14-01 | Medium | **მუშავდება** (Round 15) | \`c-round-14/runs/p2-1280-480.txt\`, \`p2-1280-480-rows.json\`, \`p2-covered-rows-scrolled-1440.json\`, \`shots/expanded-1280-480.png\`, \`shots/p2-list-scrolled-max-1440.png\`; \`c-round-14.md\` §4 | D-29f: ყუთი ≤ body-ს ნახევარი (1280/480) + ხისა და სიის ქვედა padding/scroll-padding = ყუთის სიმაღლე + 16 (1440/288-ის ბოლო row-ები) (R15-P1, R15-P2, R15-P3). B-ის ფორმულის ხარვეზია |
| C-R14-02 | Low | **მუშავდება** (Round 15) | \`c-round-14/runs/e-modalx-1440.txt\`; \`c-round-14.md\` §6 | D-29f: Tab-ციკლი Modal-ის content ელემენტზე (forward-ებული ref), X ციკლშია და ხილული რჩება (R15-E). \`Modal.tsx\` read-only რჩება |`;
rep(bugsOld, bugsNew);
rep('| C-R11-01 | Low | **ბაგია** | `c-round-11/runs/unfold-manual-1440.json` | Round 15 (polish 14a)', '| C-R11-01 | Low | **ბაგია** | `c-round-11/runs/unfold-manual-1440.json` | Round 16 (polish 14a)');
rep('`p2a-1280-open-noselect.json` | Round 15, D-29c (2)', '`p2a-1280-open-noselect.json` | Round 16, D-29c (2)');
rep('| C-R11-03 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-afoff-a.json` | Round 15, D-29c (3)', '| C-R11-03 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-afoff-a.json` | Round 16, D-29c (3)');

rep(
  '**ბოლოს დაიხურა:** C round 12-ში C-R7-01 headless-ში (R12-W1, D-19b); Tech Lead-ის RF7-3 რჩება სავალდებულო მტკიცებულებად. Round 10-ში C-R7-02 (R10-R1, R10-R2). Round 13-ში ბაგი არ დახურულა (ფუნქციის რაუნდი იყო).',
  '**ბოლოს დაიხურა:** C round 14-ში C-R13-01, C-R13-02 და C-R13-03 (R14-P1/P2/S/E; round-13-ის repro-ები აღარ მეორდება). C round 12-ში C-R7-01 headless-ში (R12-W1, D-19b); Tech Lead-ის RF7-3 რჩება სავალდებულო მტკიცებულებად. Round 10-ში C-R7-02 (R10-R1, R10-R2).',
);
rep(
  '- `export-clip-onset-1lsb` — export-ის შედარება ≤ 1.2e-7-ით.',
  `- \`export-clip-onset-1lsb\` — export-ის შედარება ≤ 1.2e-7-ით.
- A-ს round-14 deviation-ები (C-მ დაადასტურა): effect B + ფოკუსირებადი wrapper render-ის დროს (review H1), exported დაბრუნების constant-ები, ⤢-ით დაბრუნება compact ტექსტს წერს, სიგანის rounding არ არის, E5-ის პროექტი სესიისაა.
- \`floating-video.test.tsx\`-ის გარე \`describe\` ისევ „D-29d“-ს ამბობს (სახელის შეცვლა ყველა ტესტის სახელს შეცვლიდა).`,
);
rep(
  '- Round 9-ის ჩანაწერები (reviewer M1, M-R10-1/M2, L2–L8, design-philosopher (a)–(d), L11) და A-ს round-11 follow-up-ები **Round 15–17-ის panel polish**-შია (15: 14a; 16: 14b detail panel; 17: 14c context/preview) (`backlog.json` → SRW-11B `polish_round`).',
  '- Round 9-ის ჩანაწერები (reviewer M1, M-R10-1/M2, L2–L8, design-philosopher (a)–(d), L11) და A-ს round-11 follow-up-ები **Round 16–18-ის panel polish**-შია (16: 14a; 17: 14b detail panel; 18: 14c context/preview) (`backlog.json` → SRW-11B `polish_round`).',
);
rep(
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–13-ის Studio სამუშაო (17 M + 14 untracked) დაუკომიტებელია.',
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–14-ის Studio სამუშაო (18 M + 16 untracked) დაუკომიტებელია.',
);
rep(
  '| R13-RM | ნამდვილი `prefers-reduced-motion`: დაკეცილი ბიბლიოთეკიდან ⤢ — ყუთი მომდევნო frame-ზე ლაგდება | gstack CDP `Emulation.setEmulatedMedia`-ს არ უშვებს; C-მ round 13-ში სიმულაცია გააკეთა |',
  '| R13-RM | ნამდვილი `prefers-reduced-motion`: დაკეცილი ბიბლიოთეკიდან ⤢ — ყუთი მომდევნო frame-ზე ლაგდება | gstack CDP `Emulation.setEmulatedMedia`-ს არ უშვებს; C-მ round 13-სა და 14-ში სიმულაცია გააკეთა |',
);
rep(
  '**ახალი:** საერთო `components/ui/Modal.tsx`-ს focus management არ აქვს. Round 14 მხოლოდ Studio-ს export dialog-ს ასწორებს; სხვა Modal-ები root/UI owner-ის გადასაწყვეტია.',
  'საერთო `components/ui/Modal.tsx`-ს focus management არ აქვს. Round 14–15 მხოლოდ Studio-ს export dialog-ს ასწორებს (round 15: X Tab-ციკლში); სხვა Modal-ები root/UI owner-ის გადასაწყვეტია. **ახალი (C round 14):** root GA consent-denied რეჟიმში `page_view`-ის გარდა `scroll` event-საც აგზავნის (root analytics, Studio-ს გარეთ).',
);
rep(
  '- `/studio-lab` ანონიმურად იხსნება (C round 13-ში G13-3 დაადასტურა);',
  '- `/studio-lab` ანონიმურად იხსნება (C round 14-ში G14-3 დაადასტურა);',
);

fs.writeFileSync(p, t);
console.log('feature-status.md updated');
