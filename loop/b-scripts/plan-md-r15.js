const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
if (t.includes('**D-29f')) {
  throw new Error('D-29f already present');
}

function replaceOnce(from, to) {
  const i = t.indexOf(from);
  if (i < 0 || t.indexOf(from, i + 1) >= 0) {
    throw new Error('not exactly one match: ' + from.slice(0, 80));
  }
  t = t.slice(0, i) + to + t.slice(i + from.length);
}

const d29f = `**D-29f — ბიბლიოთეკის row-ები გაფართოებული ვიდეოს დროს და Modal-ის X Tab-ციკლში (C-R14-01, C-R14-02, Round 14-ის შედეგი, Round 15; D-29e-ის დაზუსტება).** C round 14-ის შედეგი (\`c-round-14.md\`): **PASS** — R14-P1, R14-P2, R14-S, R14-E, R14-U, R14-Doc, მეზობელი რეგრესიები (R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2) და G14-1..3. vitest 945/945. C-R13-01..03-ის repro-ები აღარ მეორდება, ამიტომ სამივე დაიხურა. ორი ახალი ბაგი. სადაც D-29f და D-29e განსხვავდება, D-29f იმარჯვებს.
- **C-R14-01 (Medium) — B-ის ფორმულის ხარვეზი.** D-29e-ის ყუთი body-ს ქვედა ნაწილს ფარავს, ხოლო ხეს და სიას ქვედა padding არ აქვს. ამიტომ დაფარული row-ები scroll-ით ყუთის ზემოთ ვერ ამოდის. 1440/288-ზე „პადი“ და „მელოდია“ სიის მაქსიმალურ scroll-ზეც ყუთის ქვეშაა. 1280×720-ზე, ბიბლიოთეკით 480, ყუთი body-ს 265 px-დან 249-ს ფარავს და მაუსით find → add სრულად იბლოკება. ორი მექანიზმი, თითო თავის შემთხვევაზე:
  1. **სიმაღლის ზღვარი (ასწორებს 1280/480-ს):** სიგანე = max(160, min(640, library.width − 16, (body.height − 16) × 16/9, (body.height / 2) × 16/9)). ნებისმიერ რეალურ body-ზე ბოლო წევრი წინაზე მცირეა, ე.ი. ყუთის სიმაღლე ≤ body-ს ნახევარი და body-ს ზედა ნახევარი row-ებისთვის რჩება. left, top = max(body.top + 8, body.bottom − 8 − სიმაღლე), viewport-ის clamp და 160-იანი მინიმუმი უცვლელია. C-ის round-14 rect-ებით: 1440/288 → 8,523 272×153 (უცვლელი); 1440/480 → 8,450.5 429.33×241.5; 1280/288 → 8,379.5 207.11×116.5; 1280/480 → 8,379.5 235.56×132.5.
  2. **ქვედა inset (ასწორებს 1440/288-ის ბოლო row-ებს):** სანამ ვიდეო გაფართოებულია და დალაგებულია, ხის \`nav\`-ს და \`[role=listbox]\`-ს აქვს \`padding-bottom\` და \`scroll-padding-bottom\` = ყუთის სიმაღლე + 16 (ყუთის ქვეშ 8 + ზემოთ 8). ნამდვილი padding \`scrollHeight\`-ს ზრდის, ამიტომ ყოველი row ყუთის ზემოთ ამოდის; \`scroll-padding\` კლავიატურით გადასვლისას focus-ირებულ row-ს ყუთის ქვეშ არ ტოვებს. მნიშვნელობა მხოლოდ დალაგებული ყუთის სიმაღლიდან ითვლება (pure helper \`panels.ts\`-ში), body-ს rect არ ინახება. Inset მოქმედებს მთელი გაფართოების განმავლობაში, ყუთის გადატანის შემდეგაც: ეს მხოლოდ დამატებითი scroll-ის ადგილია და ყველაზე მცირე პატიოსანი ქცევაა. დაბრუნებისას inset 0-ია და ხე/სია round 14-ის იდენტურია (inline style არ არის).
- **C-R14-02 (Low) — Modal-ის X Tab-ციკლის გარეთაა.** \`Modal.tsx\` X-ს children-ის წინ, content \`div\`-ში ხატავს, ამიტომ children-ის wrapper-ის \`onKeyDown\` X-ის keydown-ს ვერ იჭერს. \`[role=dialog]\` backdrop-ია და prop-ით მიუწვდომელია. Modal content \`div\`-ს forward-ებული \`ref\`-ით აწვდის, და მასში X-იც არის და children-იც. გადაწყვეტა: \`ArrangementExportDialog\` Modal-ს \`ref\`-ს (object ref) გადასცემს, გახსნისას ამ ელემენტზე ერთ native \`keydown\` listener-ს ამაგრებს და ფოკუსირებად სიას მისგან ითვლის. წესები round 14-ისაა: მხოლოდ Tab, \`preventDefault\` მხოლოდ ფოკუსის გადატანისას, \`stopPropagation\` არასოდეს, document listener არ არის. Wrapper-ის React \`onKeyDown\` იხსნება (ორმაგი wrap რომ არ მოხდეს). Effect B-ის „ფოკუსს არ ვიპარავ“ შემოწმებაც იმავე, უფრო დიდ სიას იყენებს, ამიტომ render-ის დაწყება/დასრულება ფოკუსს X-იდან არ წაიღებს. ციკლი: X → radio → დახურვა → WAV → X. გახსნისას ფოკუსი ისევ „დახურვა“-ზეა. X ხილული რჩება: \`showCloseButton={false}\` ხილულ control-ს შეცვლიდა და Tech Lead-ის თანხმობას მოითხოვდა. \`Modal.tsx\` read-only რჩება.

მიზეზი: ორივე ყველაზე მცირე ცვლილებაა, რომელიც C-ის repro-ს ხურავს D-29e-ის დანარჩენი წესების, dock-ის, sync-ის და საერთო Modal-ის შეუცვლელად. მომხმარებლის მიზანი — ბიბლიოთეკაში პოვნა და დამატება გაფართოებული ვიდეოს დროსაც — ორივე სავალდებულო viewport-ზე მაუსით შესრულებადი ხდება; ვიდეო 1280×720-ზე უფრო პატარაა, მაგრამ კომპაქტურზე (160×90) ყოველთვის დიდია და მისი გადატანა შესაძლებელია.

`;
replaceOnce('**ვიდეოს import (SRW-02, FB-15).**', d29f + '**ვიდეოს import (SRW-02, FB-15).**');

const fbShift = [
  ['| FB-04 | ფუნქციის მოთხოვნა | Clip Gain, ტრეკის Volume-ისგან ცალკე | SRW-13 | 18 |', '| FB-04 | ფუნქციის მოთხოვნა | Clip Gain, ტრეკის Volume-ისგან ცალკე | SRW-13 | 19 |'],
  ['| FB-05 | ფუნქციის მოთხოვნა | Pan | SRW-13 | 18 |', '| FB-05 | ფუნქციის მოთხოვნა | Pan | SRW-13 | 19 |'],
  ['| FB-06 | ფუნქციის მოთხოვნა | ხმის ავტომაცია და fade-ები | SRW-18 | 22 |', '| FB-06 | ფუნქციის მოთხოვნა | ხმის ავტომაცია და fade-ები | SRW-18 | 23 |'],
  ['| FB-07 | ფუნქციის მოთხოვნა | ვიდეოს Opacity fade | SRW-19 | 23 |', '| FB-07 | ფუნქციის მოთხოვნა | ვიდეოს Opacity fade | SRW-19 | 24 |'],
  ['| FB-09 | ფუნქციის მოთხოვნა | Bars/Beats + Metronome | SRW-15 | 19 |', '| FB-09 | ფუნქციის მოთხოვნა | Bars/Beats + Metronome | SRW-15 | 20 |'],
  ['| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 20 |', '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 21 |'],
  ['| FB-11 | ფუნქციის მოთხოვნა | Tempo | SRW-15 | 19 |', '| FB-11 | ფუნქციის მოთხოვნა | Tempo | SRW-15 | 20 |'],
  ['| FB-12 | ფუნქციის მოთხოვნა | ტრეკების ჯგუფები/ქვეჯგუფები, დაკეცვა | SRW-17 | 21 |', '| FB-12 | ფუნქციის მოთხოვნა | ტრეკების ჯგუფები/ქვეჯგუფები, დაკეცვა | SRW-17 | 22 |'],
  ['| FB-13 | ქცევის/ფუნქციის მოთხოვნა | Grid-ის დანაყოფები, Snap on/off, თავისუფალი რეჟიმი | SRW-14 | 19 |', '| FB-13 | ქცევის/ფუნქციის მოთხოვნა | Grid-ის დანაყოფები, Snap on/off, თავისუფალი რეჟიმი | SRW-14 | 20 |'],
  ['| FB-14 | ფუნქციის მოთხოვნა | Master Volume/Mute, გადატვირთვის ჩვენება | SRW-13 | 18 |', '| FB-14 | ფუნქციის მოთხოვნა | Master Volume/Mute, გადატვირთვის ჩვენება | SRW-13 | 19 |'],
];
for (const [a, c] of fbShift) {
  replaceOnce(a, c);
}
replaceOnce(
  '| SRW-11A, SRW-11B | 4, 8, 9, 11, 13, 14, 15–17 |',
  '| SRW-11A, SRW-11B | 4, 8, 9, 11, 13, 14, 15, 16–18 |',
);
replaceOnce(
  'Round 14: C-R13-01..03 (D-29e). Panel-ის polish Round 15–17-შია.',
  'Round 14: C-R13-01..03 (D-29e, C PASS, დაიხურა). Round 15: C-R14-01/02 (D-29f). Panel-ის polish Round 16–18-შია.',
);

const oldRounds = `| 15 | Panel-ის polish 14a | C-R11-01..03 (D-29c) + A-ს round-11 deviation 9 |
| 16 | Panel-ის polish 14b | detail panel — L11, L2–L7, design-philosopher (a)–(d) |
| 17 | Panel-ის polish 14c | context/preview — M1, M-R10-1/M2, L8 (როცა ფაილები თავისუფლდება). შემდეგ milestone-ის სრული რეგრესია |
| 18 | SRW-13 | Clip gain, pan, master, meters |
| 19 | SRW-14, SRW-15 | Grid/Snap, bars/beats/tempo/metronome (ორ ეტაპად, თუ საჭიროა) |
| 20 | SRW-16 | Markers |
| 21 | SRW-17 | ტრეკების ჯგუფები |
| 22 | SRW-18 | Fades + volume envelope |
| 23 | SRW-19 | ვიდეოს opacity fade |
| 24 | SRW-20 | Range/MP3/ექსპორტის სისრულე |
| 25 | SRW-21 | Mount-ის მზადყოფნა (route დაბლოკილია) + საბოლოო რეგრესია |`;
const newRounds = `| 15 | C-R14-01, C-R14-02 | ბიბლიოთეკის row-ები გაფართოებული ვიდეოს დროს (body-ს ნახევრის ზღვარი + ქვედა inset) და Modal-ის X Export-ის Tab-ციკლში (D-29f) |
| 16 | Panel-ის polish 14a | C-R11-01..03 (D-29c) + A-ს round-11 deviation 9 |
| 17 | Panel-ის polish 14b | detail panel — L11, L2–L7, design-philosopher (a)–(d) |
| 18 | Panel-ის polish 14c | context/preview — M1, M-R10-1/M2, L8 (როცა ფაილები თავისუფლდება). შემდეგ milestone-ის სრული რეგრესია |
| 19 | SRW-13 | Clip gain, pan, master, meters |
| 20 | SRW-14, SRW-15 | Grid/Snap, bars/beats/tempo/metronome (ორ ეტაპად, თუ საჭიროა) |
| 21 | SRW-16 | Markers |
| 22 | SRW-17 | ტრეკების ჯგუფები |
| 23 | SRW-18 | Fades + volume envelope |
| 24 | SRW-19 | ვიდეოს opacity fade |
| 25 | SRW-20 | Range/MP3/ექსპორტის სისრულე |
| 26 | SRW-21 | Mount-ის მზადყოფნა (route დაბლოკილია) + საბოლოო რეგრესია |`;
replaceOnce(oldRounds, newRounds);

replaceOnce(
  'Round 12-ისა და Round 13-ის შემდეგ advisor ხელმისაწვდომი იყო',
  'Round 12-ის, Round 13-ისა და Round 14-ის შემდეგ advisor ხელმისაწვდომი იყო',
);

replaceOnce(
  '- **Round 14: გაგზავნილია.** C-R13-01..03 (D-29e). Polish 14a/14b/14c Round 15–17-ზე გადაინაცვლა. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 14: C PASS** (\`tmp/studio-real-loop/c-round-14.md\`). R14-P1, R14-P2, R14-S, R14-E, R14-U, R14-Doc, მეზობელი რეგრესიები (R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2) და G14-1..3 PASS-ია. vitest 945/945.
  - **დაიხურა:** C-R13-01, C-R13-02, C-R13-03.
  - **ახალი ბაგები:** C-R14-01 (Medium: გაფართოებული ვიდეო ბიბლიოთეკის ქვედა row-ებს ფარავს და ისინი scroll-ით არ ამოდის; 1280/480-ზე მაუსით find → add იბლოკება) და C-R14-02 (Low: Modal-ის X-იდან Shift+Tab dialog-იდან გადის) → D-29f, Round 15.
- **Round 15: გაგზავნილია.** C-R14-01 + C-R14-02 (D-29f). Polish 14a/14b/14c Round 16–18-ზე გადაინაცვლა. პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);
replaceOnce(
  '- SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R13-01..03 (Round 14, D-29e), polish 14a–14c (Round 15–17, C-R11-01..03 ჩათვლით). ეტაპები 2 და 3 C-მ Round 11-სა და 13-ში დაადასტურა;',
  '- SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R14-01/02 (Round 15, D-29f), polish 14a–14c (Round 16–18, C-R11-01..03 ჩათვლით). ეტაპები 2 და 3 C-მ Round 11-ში, 13-სა და 14-ში დაადასტურა;',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
