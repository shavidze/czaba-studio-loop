const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md';
let t = fs.readFileSync(p, 'utf8');
function rep(from, to) {
  const n = t.split(from).length - 1;
  if (n !== 1) throw new Error('expected one match: ' + from.slice(0, 70) + ' got ' + n);
  t = t.replace(from, to);
}
const headStart = t.indexOf('განახლდა:');
const headEnd = t.indexOf('## 1. მომხმარებლის');
const head = `განახლდა: 2026-10-11 · ავტორი: B (round 15 → round 16 დაგეგმვა) · წესი: \`docs/technical/studio-real-workspace/agent-workflow.md\`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება \`tmp/studio-real-loop/\`-ს.

მიმდინარე რაუნდი: **Round 16** (\`current-task.md\`, D-29c/D-29g):
- panel polish 14a: C-R11-01..03 და A-ს round-11 deviation 9;
- C-R15-02, D-29c (2)-ით;
- C-R15-03-ის ტესტი.

შემდეგ polish 14b–14c (Round 17–18) და milestone-ის სრული რეგრესია.

Round 15-ის შედეგი (C, \`c-round-15.md\`): **FAIL მხოლოდ R15-P3-ის სიტყვასიტყვით sub-check-ზე** („inline \`style\` ატრიბუტი არ არის“). ✕-ისა და Esc-ის შემდეგ ცარიელი \`style=""\` რჩება.
- **PASS:**
  - R15-P1: ოთხი შემთხვევა და დროებითი გახსნა. Δ ≤ 0.02, ყუთი ≤ body/2, hit-test 4/4. 160-იანი მინიმუმი არცერთ შემთხვევაში არ მიიღწევა.
  - R15-P2:
    - 1280/480-ზე რეალური click „soft“-ზე → 1 კლიპი, 1 Undo;
    - 1440/288-ის ბოლო row-ები მისაწვდომია;
    - ოთხივე შემთხვევაში 9/9 სიის და 9/9 ხის row მისაწვდომია;
    - ArrowDown-ით ფოკუსირებული row ყუთის ზემოთ რჩება.
  - R15-E:
    - X-ის repro აღარ მეორდება;
    - Tab ×8 და Shift+Tab ×8 dialog-ში რჩება;
    - E1/E3/E4/E5 გავიდა;
    - render-ის დროს 656 sample-დან 0 იყო dialog-ის გარეთ.
  - R15-U (Low შენიშვნით, C-R15-03) და R15-Doc.
- **R15-P3:** ფუნქციური sub-check-ები PASS-ია: padding 4 px, scroll-padding auto, \`scrollHeight\` = expand-მდე, ტექსტები, ◀ → ▶ და pending inset 0. ცარიელი ატრიბუტი B-მ მიიღო (D-29g), რადგან ეს B-ის criterion-ის შეცდომაა. C R15-P3-ს round 16-ში quick-ად ხელახლა ამოწმებს.
- **მეზობელი რეგრესიები PASS:** R13-F2 quick (8,450.5-იდან), R13-F3/F4 quick (reduced motion მხოლოდ სიმულაციით), R11A-1 quick, dock quick, RF7-P2. G15-1..3 PASS-ია, vitest 965/965.
- **დაიხურა:** C-R14-01 და C-R14-02. Round-14-ის repro-ები აღარ მეორდება.
- **ახალი Low:**
  - C-R15-01 — მიღებულია (D-29g);
  - C-R15-02 — footer-ის selected-clip ხაზი body-ს 20 px-ით ამოკლებს და ყუთი preview-ის 12 px-ს ფარავს → Round 16, D-29c (2)-ით;
  - C-R15-03 — Export-ის „only Tab“ ტესტი Enter-ის mutation-ს ვერ იჭერს → Round 16.
- **ვერ შემოწმდა:** ნამდვილი \`prefers-reduced-motion\` (R13-RM, Tech Lead).

`;
t = t.slice(0, headStart) + head + t.slice(headEnd);

rep(
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 და C-R14-01 (Medium), C-R11-01..03 და C-R14-02 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §3–§8 | Round 15: C-R14-01/02 (D-29f). Round 16: polish 14a (C-R11-01..03, D-29c). C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM |',
  '| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium), C-R11-01..03, C-R15-02 და C-R15-03 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §3–§8, `c-round-15.md` §3–§8 | Round 16: polish 14a (C-R11-01..03, D-29c) + C-R15-02/03 (D-29g). Round 17–18: 14b/14c. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB |',
);
rep(
  'C-R12-01: milestone RF5-3. Round 15: dock და `video-sync.ts` გაყინულია, sync run არ არის |',
  'C-R12-01: milestone RF5-3. Round 16: dock და `video-sync.ts` გაყინულია, sync run არ არის |',
);
rep(
  'R11A-2 (keys) milestone-ის რეგრესიაში. Round 15 ბიბლიოთეკას მხოლოდ `bottomInsetPx` prop-ს უმატებს (გაფართოებული ვიდეოს დროს ხისა და სიის ქვედა padding) — C ამოწმებს R15-P3-ს და R11A-1 quick-ს |',
  'R11A-2 (keys) milestone-ის რეგრესიაში. Round 15-ის `bottomInsetPx` C-მ შეამოწმა (R15-P2/P3, R11A-1 quick PASS). Round 16-ში ბიბლიოთეკის ფაილი გაყინულია |',
);
rep(
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 და C-R14-01 (Medium), C-R11-01..03 და C-R14-02 (Low)) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §1–§8; D-29, D-29a–D-29f (`plan.md`) | Round 15: C-R14-01/02 (R15-P1, R15-P2, R15-P3, R15-E, R15-U, R15-Doc). Polish 14a–14c Round 16–18. C-R8-01: Tech Lead quiet Chrome |',
  '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium), C-R11-01..03, C-R15-02 და C-R15-03 (Low)) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §1–§8, `c-round-15.md` §1–§8; D-29, D-29a–D-29g (`plan.md`) | Round 16: polish 14a + C-R15-02/03 (R16-L1, R16-F1..F3, R16-H1, R16-G1, R16-T1, R16-U, R16-Doc). Polish 14b–14c Round 17–18. C-R8-01: Tech Lead quiet Chrome |',
);
rep(
  "| C-R14-01 | Medium | **მუშავდება** (Round 15) | `c-round-14/runs/p2-1280-480.txt`, `p2-1280-480-rows.json`, `p2-covered-rows-scrolled-1440.json`, `shots/expanded-1280-480.png`, `shots/p2-list-scrolled-max-1440.png`; `c-round-14.md` §4 | D-29f: ყუთი ≤ body-ს ნახევარი (1280/480) + ხისა და სიის ქვედა padding/scroll-padding = ყუთის სიმაღლე + 16 (1440/288-ის ბოლო row-ები) (R15-P1, R15-P2, R15-P3). B-ის ფორმულის ხარვეზია |\n| C-R14-02 | Low | **მუშავდება** (Round 15) | `c-round-14/runs/e-modalx-1440.txt`; `c-round-14.md` §6 | D-29f: Tab-ციკლი Modal-ის content ელემენტზე (forward-ებული ref), X ციკლშია და ხილული რჩება (R15-E). `Modal.tsx` read-only რჩება |\n",
  "| C-R15-02 | Low | **მუშავდება** (Round 16) | `c-round-15/runs/selection-footer-1280-480.txt`, `shots/selection-footer-box-over-preview-1280-480.png`; `c-round-15.md` §4 | D-29g: მიზეზი იგივეა, რაც C-R11-02-ს აქვს. D-29c (2): footer selected-clip ხაზის ადგილს იტოვებს; ყუთის re-placement არ ემატება (R16-F1..F3) |\n| C-R15-03 | Low | **მუშავდება** (Round 16) | `c-round-15/gates/guard-c15.txt` (G6); `c-round-15.md` §7 | ტესტი: Enter და Space ბოლო ჩართულ control-ზე (WAV) არ ჩერდება და ფოკუსს არ ამოძრავებს. C-ის G6 ამ ტესტს უნდა ჩააგდებდეს (R16-T1) |\n",
);
rep(
  '| C-R11-01 | Low | **ბაგია** | `c-round-11/runs/unfold-manual-1440.json` | Round 16 (polish 14a), D-29c (1)',
  '| C-R11-01 | Low | **მუშავდება** (Round 16) | `c-round-11/runs/unfold-manual-1440.json` | Round 16 (polish 14a), D-29c (1)',
);
rep(
  '| C-R11-02 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-open-selected.json`, `p2a-1280-open-noselect.json` | Round 16, D-29c (2): footer selected-clip ხაზის სიმაღლეს იტოვებს |',
  '| C-R11-02 | Low | **მუშავდება** (Round 16) | `c-round-11/runs/p2a-1280-open-selected.json`, `p2a-1280-open-noselect.json` | Round 16, D-29c (2): footer selected-clip ხაზის სიმაღლეს იტოვებს (C-R15-02-საც ხურავს) |',
);
rep(
  '| C-R11-03 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-afoff-a.json` | Round 16, D-29c (3)',
  '| C-R11-03 | Low | **მუშავდება** (Round 16) | `c-round-11/runs/p2a-1280-afoff-a.json` | Round 16, D-29c (3)',
);
rep(
  '**ბოლოს დაიხურა:** C round 14-ში',
  '**ბოლოს დაიხურა:** C round 15-ში C-R14-01 და C-R14-02 (R15-P1/P2/E; round-14-ის repro-ები აღარ მეორდება). C round 14-ში',
);
rep(
  '**მიღებული (კოდი არ იცვლება):**\n',
  '**მიღებული (კოდი არ იცვლება):**\n- C-R15-01 — ✕-ისა და Esc-ის შემდეგ ხეზე და სიაზე ცარიელი `style=""` რჩება (D-29g). ეს B-ის criterion-ის შეცდომაა, D-19b-ის მსგავსად. R15-P3 ნიშნავს „inline declaration-ები არ არის“. Round 15-ის FAIL ჩანაწერში რჩება.\n- A-ს round-15 deviation-ები (C-მ დაადასტურა):\n  - inset-ის ტესტები `floating-video.test.tsx`-შია;\n  - helper-ის სახელი დავალებიდანაა;\n  - E3-ში Space WAV-ზე დაეჭირა;\n  - E4 ხელახლა გაეშვა;\n  - mechanism probe round-14-ის ყუთზე გაიზომა.\n- A-ს round-15 reviewer-ის შენიშვნები:\n  - (h − 16) წევრი ≥ 32 px-იან body-ზე მკვდარია;\n  - ~196 px-ზე დაბალ body-ზე 160-იანი მინიმუმი ყუთს body-ს ნახევარზე მაღალს ხდის. არცერთ გაზომილ შემთხვევაში ეს არ მიიღწევა.\n',
);
rep(
  'სხვა Modal-ები root/UI owner-ის გადასაწყვეტია.',
  'სხვა Modal-ები root/UI owner-ის გადასაწყვეტია. Round 15-ის ცნობილი ზღვარი (doc 024): ფოკუსი `body`-ზე (მაგ. scrollbar-ზე click-ის შემდეგ) trap-ს ტოვებს. მის დასახურად document listener არის საჭირო, ეს კი საერთო Modal-ის მფლობელის საქმეა.',
);
rep(
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–14-ის Studio სამუშაო (18 M + 16 untracked) დაუკომიტებელია.',
  'Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–15-ის Studio სამუშაო (18 M + 17 untracked) დაუკომიტებელია.',
);
fs.writeFileSync(p, t);
console.log('feature-status updated');
