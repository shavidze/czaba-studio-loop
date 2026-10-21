const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', '..', 'docs', 'technical', 'studio-real-workspace', 'plan.md');
let text = fs.readFileSync(file, 'utf8');

const once = (find, replace) => {
  const first = text.indexOf(find);
  if (first < 0) throw new Error(`not found: ${find.slice(0, 80)}`);
  if (text.indexOf(find, first + 1) >= 0) throw new Error(`not unique: ${find.slice(0, 80)}`);
  text = text.replace(find, replace);
};
const afterLine = (anchor, insert) => {
  const start = text.indexOf(anchor);
  if (start < 0) throw new Error(`anchor not found: ${anchor.slice(0, 80)}`);
  if (text.indexOf(anchor, start + 1) >= 0) throw new Error(`anchor not unique: ${anchor.slice(0, 80)}`);
  const end = text.indexOf('\n', start);
  text = `${text.slice(0, end + 1)}${insert}${text.slice(end + 1)}`;
};

if (text.includes('D-19a-ს დაზუსტება (Round 11-ის დაგეგმვა')) {
  throw new Error('plan.md already has the round-12 edits');
}

afterLine(
  'Verdict: R12-W1 (= R10-W1-ის წესი H3 ფორმით)',
  `
**D-19a-ს დაზუსტება (Round 11-ის დაგეგმვა, Round 12-ში სრულდება).** D-19a-ს სიტყვასიტყვითი წესი ("settle მთავრდება, როცა |d| პირველად შევა band-ში") არაფერს შეცვლიდა. C-ის Round 10-ის სერიაში (W_2, wrap 1) swap-ის შემდეგ პირველი row-ია d ≈ −0.0007, ანუ უკვე band-შია, და settle პირველსავე frame-ზე დასრულდებოდა. K = 10 d = −0.05-ზე rate-ს 1.50-ს აძლევს, რაც ზუსტად \`VIDEO_STALL_LAG_RATE\`-ია. ამიტომ:
- settle ირთვება standby swap-ზე (wrap, boundary, gap-entry — სამივე \`nextPredictableDiscontinuity\`-დან). ის **არ** ირთვება hold-release-ის start-ზე და პირველ Play-ზე;
- settle მთავრდება **band-ში ხელახლა შესვლისას, მას შემდეგ რაც |d| band-ს ერთხელ მაინც გასცდა**, ან swap-იდან 1.0 წმ-ში, ან შემდეგ seek-ზე (\`issueHoldSeek\`), swap-ზე, pause/stop-ზე ან hold-ზე;
- settle-ის დროს deadband 0.008-ია, K ∈ [8, 9], rate ∈ [0.5, 1.45] (მკაცრად \`VIDEO_STALL_LAG_RATE\`-ის ქვემოთ), არსებული 0.05-იანი ბიჯით. მდგრადი \`videoRateCorrection\` უცვლელია;
- B-ის მარტივი მოდელით (60 Hz, rate-ის 1 frame-იანი დაგვიანება, 0.05 ბიჯი, ≈ 30 ms freeze +22 ms-დან): K = 4 → d(+300) −0.0175 (C-მ გაზომა −0.017…−0.020); K = 8 → −0.006; K = 9 → −0.006. Rate 1.35-ს არ აჭარბებს.

მიზეზი: ეს D-19a-ს განზრახვის ყველაზე მცირე სწორი ფორმაა. ტოლერანსი და ფანჯარა უცვლელია, stall escalation-ის ზღვარს კი settle ვერ მიაღწევს.
`,
);

afterLine(
  'A კოდამდე მიმდინარე layout-ზე budget-ს ხელახლა ზომავს.',
  `
- **Round 11-ის შედეგი (C, \`c-round-11.md\`): PASS.** 1280×720-ზე cap 142-ზე ირთვება, როცა კლიპი მონიშნულია (footer-ის ხაზი scroller-ს 20 px-ით ამცირებს), არჩევის გარეშე კი panel 144-ზე რჩება. 1440×900-ზე cap არ მოქმედებს.
- **ფორმულის შესწორება (A-ს deviation 1, მიღებულია):** scroller-ის \`clientHeight\` horizontal scrollbar-ს უკვე აკლებს. ამიტომ ხაზების ხილული არე = \`clientHeight\` − ruler − loop strip − row-ების border-ები. Scrollbar მეორედ არ აკლდება. Headless-ში scrollbar 0 px-ია, ამიტომ რეალური 10 px-იანი scrollbar-ით ამ ფორმულას Tech Lead-ის Chrome ამოწმებს.

**D-29c — ეტაპი 2-ის Low დაკვირვებები (C-R11-01..04, Round 11-ის დაგეგმვა; panel polish 14a-ში სრულდება).**
1. **C-R11-01:** დაკეცილ ხაზზე სიმაღლის სახელურს pointer-ის hit area არ აქვს (\`pointer-events-none\`, cursor-ის გარეშე). ის focus-ირებადი რჩება, და ↑/↓ მასზე ხაზს მხოლოდ შლის (როგორც ახლა). Pointer-ით ხაზი fold ღილაკით იშლება. ასე 36 px-იან row-ში folded clip-ის trim edge-ს მთელი სიმაღლე ეკუთვნის, drag კი დაკეცილი მდგომარეობიდან არასოდეს გრძელდება, ამიტომ 36 → 80-ის ნახტომი ვერ მოხდება.
2. **C-R11-02:** footer selected-clip ხაზის სიმაღლეს მუდმივად იტოვებს (ცარიელი ხაზი სიმაღლეს ინარჩუნებს და ცარიელისას \`aria-hidden\`-ია). კლიპის არჩევა/მოხსნა scroller-ის სიმაღლეს აღარ ცვლის, ამიტომ ხაზები და cap ერთნაირი რჩება. Footer-ის ტექსტი და id-ები უცვლელია.
3. **C-R11-03:** თუ auto-fit cap-ის მოქმედებისას ითიშება, panel rendered (capped) სიმაღლეს ინარჩუნებს: შენახული გახსნილი სიმაღლე rendered სიმაღლე ხდება (D-29b-ის user resize-ის no-jump წესი). Cap შემდეგაც გამორთულია.
4. **C-R11-04:** მიღებული კონვენციაა და კოდი არ იცვლება. დაკეცილ ხაზზე \`aria-valuenow\` არის სიმაღლე, რომლითაც ხაზი გაიშლება, \`aria-valuetext\` კი \`დაკეცილია · {h} px\`-ს ამბობს (N2-ის მსგავსად).
5. **A-ს deviation 9:** gesture-ის დროს fold ჩუმად იგნორირდება. Polish 14a-ში ის, Mute-ის მსგავსად, \`GESTURE_EDIT_BLOCKED_MESSAGE\`-ს აჩვენებს (D-26-ის უარის თანმიმდევრულობა).

მიზეზი: თითოეული ყველაზე მცირე ქცევაა, რომელიც ერთ ჩვეულებრივ მოქმედებაზე (click, fold, ხაზის შეცვლა) layout-ს არ არყევს და D-29b-ის "ზომა არ ხტება" წესს ინარჩუნებს.
`,
);

once(
  '| 12 | C-R7-01 | D-19a: swap-ის შემდეგ settle, verdict R10-W1 H3 წესით |',
  '| 12 | C-R7-01 | D-19a (დაზუსტებით): swap-ის შემდეგ settle, verdict R12-W1 H3 წესით, 0 escalation |',
);
once(
  '| 14 | Panel-ის polish | reviewer L11, M1, M-R10-1/M2, L2–L8, design-philosopher (a)–(d). შემდეგ milestone-ის სრული რეგრესია |',
  '| 14 | Panel-ის polish (14a, 14b, 14c) | 14a: C-R11-01..03 (D-29c). 14b: detail panel — L11, L2–L7, design-philosopher (a)–(d). 14c: context/preview — M1, M-R10-1/M2, L8. თითოში მაქსიმუმ სამი დაკავშირებული პუნქტი. შემდეგ milestone-ის სრული რეგრესია |',
);
once(
  'Round 8-ის, Round 9-ისა და Round 10-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
  'Round 8-ის, Round 9-ის, Round 10-ისა და Round 11-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
);
once(
  '- **Round 11: გაგზავნილია.** SRW-11B ეტაპი 2: fold, სიმაღლე, auto-fit და D-29b. Panel-ის polish Round 14-ში გადავიდა (ჩაწერილია, არ არის მოხსნილი). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 11: C PASS** (\`tmp/studio-real-loop/c-round-11.md\`). SRW-11B ეტაპი 2-ის ყველა ID (R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U, R11-Doc), მეზობელი რეგრესიები და G11-1..3 PASS-ია. ვიტესტი 856/856.
  - **ახალი Low დაკვირვებები:** C-R11-01..03 → panel polish 14a (D-29c); C-R11-04 მიღებული კონვენციაა.
  - SRW-11B done არ არის: C-R8-01 ღიაა, ეტაპი 3 და polish დარჩა.
- **Round 12: გაგზავნილია.** C-R7-01 დაზუსტებული D-19a-თი (swap-ის შემდეგ settle). პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);
once(
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 2 (Round 11), ეტაპი 3 (Round 13), polish (Round 14);',
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 3 (Round 13), polish 14a–14c (C-R11-01..03 ჩათვლით). ეტაპი 2 C-მ Round 11-ში დაადასტურა;',
);
once(
  '  - SRW-03 / SRW-05: C-R7-01 (Round 12, D-19a), C-R6-02 (Tech Lead quiet Chrome) და რეალური Chrome;',
  '  - SRW-03 / SRW-05: C-R7-01 (Round 12, დაზუსტებული D-19a), C-R6-02 (Tech Lead quiet Chrome) და რეალური Chrome;',
);

fs.writeFileSync(file, text);
console.log('plan.md updated');
