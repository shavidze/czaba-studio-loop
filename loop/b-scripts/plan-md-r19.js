const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync('C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/plan.before-r19.md', t);

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const d29j = `**D-29j — Round 18-ის შედეგი და C-R18-01-ის გადაწყვეტა (Round 19; D-29i-ის დამატება).** C round 18-ის შედეგი (\`c-round-18.md\`): **FAIL** მხოლოდ R18-D-ზე. PASS-ია R18-L4, R18-W, R18-B, R18-L6, R18-A, R18-Doc, მეზობელი რეგრესიები (R8 detail quick, R16-H1 quick, R16-F1 quick, R9-D3/RF7-P2, lane-ის range) და G18-1..3. vitest 996/996.

- **C-R18-01 (Medium):** design (d) არ მიწოდებულა. A-მ §1.4-ის წესით შეაჩერა, ხოლო C-მ გაჩერება დამოუკიდებლად დაადასტურა:
  - \`დასაწყისი 00:00.000 · სიგრძე 00:16.000\` ხაზს max-content-ად 259.81 px სჭირდება, \`w-64\` კი 256 px-ია;
  - 224/240/256 სიგანეზე ხაზი ორად იშლება. Single მდგომარეობაში \`truncate\` სათაური და ხაზის row 16 px-დან 10 px-მდე იკუმშება 1440-ზე და 9 px-მდე 1280-ზე;
  - ჯგუფი 1440-ზე იწყებს სქროლს (110/107).
- **გადაწყვეტა: info-ს სვეტი \`w-56\` → \`w-72\` (288 px).**
  - 288 − 259.81 = 28 px რეზერვი რჩება რეალური Windows-ის Georgian font-ებისთვის (R17-T-ის რისკი).
  - Single მდგომარეობა 11111-ად რჩება. ჯგუფი 1112-ად რჩება, რადგან ჯგუფის შენიშვნა (395 px) ისედაც ორ ხაზზეა. ამიტომ ახალი სქროლი არ ჩნდება.
  - **ფასი:** waveform −64 px. 1440/288-ზე 704 → 640, 1280/480-ზე 352 → 288. ყველგან ≥ 128 რჩება.
  - A 288-ს კოდამდე page-state-ში ზომავს (inline \`style.width\`, რადგან კომპილირებულ CSS-ში \`w-72\` არ არის). A ჩერდება, თუ რომელიმე info \`<p>\` ორ ხაზზე გადავა, \`truncate\` row 16 px-ზე დაბალი გახდება, ან \`scrollHeight\` pre-code ჩანაწერს გადააჭარბებს.
- **უარყოფილი ვარიანტები:**
  - ორი row: A-ს არითმეტიკით +18 px-ია, slack კი 3 px;
  - უფრო მოკლე label: პროტოტიპის ლექსიკას (\`დასაწყისი\`) შორდება;
  - მხოლოდ range-ის label-ები: (d) ნაწილობრივი რჩება და panel ნახევრად ქართული ხდება;
  - \`w-68\`: მხოლოდ 12 px რეზერვი რჩება.
- **B-ის ფორმულირების შეცდომა:** „1280-ზე panel 142“ ჯგუფის მდგომარეობაში მიუღწეველია. Footer 69 → 89-ია (D-29g residual), ამიტომ panel 122-ია და ჯგუფის კონტენტი დღესაც სქროლდება (106/85). Fit-ის კრიტერიუმი ამიერიდან A-ს/C-ის pre-code ჩანაწერს ადარებს.
- **A-ს round-18 deviation-ები:**
  - **2 მიღებულია:** წარმატებული Apply ველებში \`rangeInputText(clamped)\`-ს წერს. C-მ ის guard M6-ით დაადასტურა;
  - **4–7 მიღებულია:** page-state სიგანე; W480-ის row-ები \`header\`-ით იკითხება; 1280-ის ჯგუფი 122-ზეა; R18-D-ის სურათები as-is ჩანაწერია.
- **ჩანაწერი:** \`ArrangementLane.tsx:661\`-ზე იმავე rule-ს სხვა მიზეზის ტექსტი აქვს. ეს L6-ის ანალოგია და გასწორდება, როცა ფაილი შემდეგ გაიხსნება (milestone-ის fix-ის რაუნდი ან SRW-17).

მიზეზი: C-ის ბაგი ახალ ფუნქციამდე სრულდება. (d) დიზაინის დამტკიცებული follow-up-ია, ამიტომ მოცულობა არ მცირდება. ერთი width token ყველაზე მცირე ცვლილებაა, რომელიც სამივე stop-მიზეზს ხსნის.

`;
rep('**ვიდეოს import (SRW-02, FB-15).**', d29j + '**ვიდეოს import (SRW-02, FB-15).**');

rep(
  'Round 18: polish 14b (D-29i). M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ.',
  'Round 18: polish 14b (D-29i; C PASS, გარდა design (d)-ისა → C-R18-01). Round 19: C-R18-01 (D-29j, `w-72`). M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ.',
);

rep(
  '| 19 | SRW-13 | Clip gain, pan, master, meters |',
  '| 19 | C-R18-01 | design (d)-ის ქართული label-ები, info-ს სვეტი `w-72` (D-29j). შემდეგ milestone-ის სრული რეგრესია და fix-ის რაუნდი; ქვემოთ ნომრები ორიენტირია და იძვრება |\n| — | SRW-13 | Clip gain, pan, master, meters (milestone-ის შემდეგ) |',
);

rep(
  'Round 16-ისა და Round 17-ის შემდეგ advisor ხელმისაწვდომი იყო',
  'Round 16-ის, Round 17-ისა და Round 18-ის შემდეგ advisor ხელმისაწვდომი იყო',
);

rep(
  '- **Round 18: გაგზავნილია.** Polish 14b (D-29i), მხოლოდ `ArrangementDetailPanel.tsx`. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 18: C FAIL მხოლოდ R18-D-ზე** (\`tmp/studio-real-loop/c-round-18.md\`). R18-L4, R18-W, R18-B, R18-L6, R18-A, R18-Doc, მეზობელი რეგრესიები და G18-1..3 PASS-ია. vitest 996/996.
  - **ახალი Medium:** C-R18-01 (design (d) არ მიწოდებულა; A-მ წესის მიხედვით შეაჩერა, C-მ დაადასტურა) → D-29j, Round 19.
- **Round 19: გაგზავნილია.** C-R18-01 (D-29j), მხოლოდ \`ArrangementDetailPanel.tsx\`. პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);

rep(
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), polish 14b (Round 18),',
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R18-01 (Round 19),',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
