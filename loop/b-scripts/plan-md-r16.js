const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');

function rep(from, to) {
  const n = t.split(from).length - 1;
  if (n !== 1) {
    throw new Error('expected exactly one match for: ' + from.slice(0, 80) + ' (got ' + n + ')');
  }
  t = t.replace(from, to);
}

const d29g = `**D-29g — Round 15-ის შედეგი: \`style=""\`, footer-ი ყუთის ქვეშ და Export-ის Enter-ის ტესტი (C-R15-01..03, Round 16; D-29f-ისა და D-29c-ის დაზუსტება).** C round 15-ის შედეგი (\`c-round-15.md\`): **taskStatus FAIL** მხოლოდ R15-P3-ის სიტყვასიტყვით sub-check-ზე „inline \`style\` ატრიბუტი არ არის“. R15-P1, R15-P2, R15-E, R15-U, R15-Doc, მეზობელი რეგრესიები (R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2) და G15-1..3 PASS-ია. vitest 965/965. C-R14-01-ისა და C-R14-02-ის repro-ები აღარ მეორდება, ამიტომ ორივე დაიხურა.

- **C-R15-01 (Low) — მიღებულია, კოდი არ იცვლება. ეს B-ის criterion-ის შეცდომაა** (D-19b-ის კლასის).
  - D-29f-ის მიზანი იყო: „inset-ის declaration-ები აღარ არის, layout round 14-ის იდენტურია“. C-მ ზუსტად ეს გაზომა: padding 4 px, \`scroll-padding-bottom: auto\`, \`scrollHeight\` = expand-მდე, ტექსტები სიტყვასიტყვით.
  - React-ი \`style\` prop-ის object-იდან \`undefined\`-ზე გადასვლისას ცარიელ ატრიბუტს ტოვებს. Dock-ის ყუთიც \`style=""\`-ს ტოვებს, და ეს R13-F3-ში მიღებულია.
  - \`key\`-ით remount-ი სიის scroll-ს და ფოკუსირებულ row-ს დაკარგავდა, ანუ იმ flow-ს, რომელიც round 15-მა გაასწორა.
  - **R15-P3 ამიერიდან ასე იკითხება:** „inline style-ის declaration-ები არ არის (ატრიბუტი არ არის ან ცარიელია, \`style.cssText === ''\`)“. C ამას round 16-ში R15-P3 quick-ად ხელახლა ამოწმებს, რადგან \`StudioWorkspace.tsx\` ისევ იცვლება.
  - Round 15-ის \`taskStatus: FAIL\` ჩანაწერში რჩება.
- **C-R15-02 (Low) — იგივე ძირეული მიზეზი, რაც C-R11-02-ს აქვს.**
  - კლიპის არჩევა footer-ს selected-clip ხაზს უმატებს (+20 px). Workspace და ბიბლიოთეკის body მოკლდება, ხოლო placement-ის შემდეგ ყუთი უცვლელ ადგილას რჩება და preview-ის ზედა 12 px-ს ფარავს.
  - გადაწყვეტა D-29c (2)-ია: footer selected-clip ხაზის ადგილს მუდმივად იტოვებს. ყუთის ხელახალი placement **არ** ემატება: ResizeObserver, polling და re-anchor არ არის. ახალი anchor გაყინულ dock-ში მომხმარებლის drag-ს გააუქმებდა.
  - D-29d-ის წესი რჩება: placement-ის შემდეგ layout-ის ცვლილება გაფართოებულ ყუთს არ ამოძრავებს, მხოლოდ window resize აკეთებს re-clamp-ს.
  - **Footer-ის რეზერვის კონტრაქტი:**
    - selected-clip ხაზი footer-ის საკუთარი სრული სიგანის, ერთხაზიანი row-ია (\`basis-full\`, \`truncate\`, სრული ტექსტი \`title\`-ში);
    - ცარიელ მდგომარეობაში იმავე სიმაღლის ცარიელი row-ია, \`aria-hidden\`-ით;
    - footer-ის ტექსტები და არსებული test id-ები უცვლელია.
  - A კოდამდე footer-ის \`offsetHeight\`-ს ზომავს: {არჩევანის გარეშე, ერთი კლიპი, range, კლიპი + range, ≥ 2 კლიპი} × {1440×900, 1280×720}. თუ selected-clip-ის გარდა სხვა ხაზი footer-ის სიმაღლეს ცვლის, A აჩერებს და B-ს ატყობინებს.
- **C-R15-03 (Low) — ტესტის სისუსტე.** \`export-dialog-focus.test.tsx\`-ს ემატება ტესტი: ბოლო ჩართულ control-ზე (\`WAV-ის ექსპორტი\`) Enter და Space \`preventDefault\`-ს არ იწვევს და ფოკუსს არ ამოძრავებს. C-ის G6 mutation (Tab-ის handler Enter-საც ამუშავებს) ამ ტესტს უნდა ჩააგდებდეს. Product-ის ცვლილება არ არის.
- **Round 16 = panel polish 14a** (C-R11-01..03, A-ს deviation 9). მასში შედის C-R15-02 (C-R11-02-ის მექანიზმით, დამატებითი acceptance-ით) და C-R15-03-ის ტესტი.

მიზეზი: სამივე ყველაზე მცირე პატიოსანი ქცევაა. C-R15-01 კრიტერიუმის ფორმულირების შეცდომაა და არა ქცევის ბაგი. C-R15-02 უკვე დამტკიცებული D-29c (2)-ით იხურება, ახალი მექანიზმისა და გაყინული dock-ის შეუცვლელად. C-R15-03 მხოლოდ regression-ის დაცვას აძლიერებს.

**ვიდეოს import (SRW-02, FB-15).**`;

rep('**ვიდეოს import (SRW-02, FB-15).**', d29g);

rep(
  '| 16 | Panel-ის polish 14a | C-R11-01..03 (D-29c) + A-ს round-11 deviation 9 |',
  '| 16 | Panel-ის polish 14a + C-R15-02/03 | C-R11-01..03 (D-29c) + A-ს round-11 deviation 9; C-R15-02 D-29c (2)-ით, C-R15-03-ის ტესტი (D-29g) |',
);

rep(
  'Round 15: C-R14-01/02 (D-29f). Panel-ის polish Round 16–18-შია.',
  'Round 15: C-R14-01/02 (D-29f, C-მ დახურა). Round 16: polish 14a + C-R15-02/03 (D-29g). Panel-ის polish 14b/14c Round 17–18-შია.',
);

rep(
  '- **Round 15: გაგზავნილია.** C-R14-01 + C-R14-02 (D-29f). Polish 14a/14b/14c Round 16–18-ზე გადაინაცვლა. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 15: C FAIL** (\`tmp/studio-real-loop/c-round-15.md\`), მხოლოდ R15-P3-ის სიტყვასიტყვით sub-check-ზე („inline \`style\` ატრიბუტი არ არის“). R15-P1, R15-P2, R15-E, R15-U, R15-Doc, მეზობელი რეგრესიები (R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2) და G15-1..3 PASS-ია. vitest 965/965.
  - **დაიხურა:** C-R14-01 და C-R14-02.
  - **D-29g:** C-R15-01 (\`style=""\`) მიღებულია, როგორც B-ის criterion-ის შეცდომა; R15-P3 იკითხება, როგორც „declaration-ები არ არის“.
  - **ახალი Low:** C-R15-02 (footer-ის selected-clip ხაზი body-ს ამოკლებს და ყუთი preview-ის 12 px-ს ფარავს) → D-29c (2), Round 16. C-R15-03 (Export-ის „only Tab“ ტესტის სისუსტე) → Round 16.
- **Round 16: გაგზავნილია.** Panel polish 14a (C-R11-01..03, A-ს deviation 9) + C-R15-02 + C-R15-03 (D-29c, D-29g). პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);

rep(
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R14-01/02 (Round 15, D-29f), polish 14a–14c (Round 16–18, C-R11-01..03 ჩათვლით). ეტაპები 2 და 3 C-მ Round 11-ში, 13-სა და 14-ში დაადასტურა;',
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), polish 14a + C-R15-02/03 (Round 16), 14b–14c (Round 17–18). ეტაპები 2 და 3 C-მ Round 11-ში და 13–15-ში დაადასტურა;',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
