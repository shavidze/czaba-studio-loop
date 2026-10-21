const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync('C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/plan.before-r17.md', t);

function rep(from, to) {
  if (!t.includes(from)) {
    throw new Error('anchor not found: ' + from.slice(0, 80));
  }
  t = t.replace(from, to);
}

const d29h = `**D-29h — Round 16-ის შედეგი: preview-ის აქტიური ხაზის row, A-ს deviation-ები და polish-ის რიგი (C-R16-01, Round 17; D-29g-ის დამატება).** C round 16-ის შედეგი (\`c-round-16.md\`): **PASS** — R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U, R16-Doc, მეზობელი რეგრესიები (R15-P3 quick D-29g-ის წაკითხვით, R13-F2/F3 quick, R11-P2/P2a quick, R14-E quick, R11A-1 quick, dock quick, RF7-P2) და G16-1..3. vitest 979/979. დაიხურა C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და A-ს round-11 deviation 9. Footer-ის ფასი (D-29g) გამჟღავნებულია: 1440×900-ზე footer 49 → 69 (+20 px მუდმივი row), 1280×720-ზე დამატებითი row არ არის.

- **C-R16-01 (Low) — გასწორდება და ფასად არ მიიღება.**
  - გაფართოებული ვიდეოს დროს აქტიური ხაზის შეცვლა (SFX → მუსიკა) ბიბლიოთეკის preview-ის ხაზს „აქტიური ხაზი: …“ ერთიდან ორ ხაზზე შლის. 1440/288-ზე body 233–680-დან 233–664-მდე მოკლდება, ადრე დალაგებული ყუთი (bottom 672) კი preview-ის ზედა 8 px-ს ფარავს. Control არ იფარება. მექანიზმი round 16-მდეც არსებობდა.
  - **გადაწყვეტა:** preview-ის აქტიური ხაზის \`<p>\`-ს აქვს ფიქსირებული სიმაღლე, ზუსტად ორი ტექსტური ხაზი: ორ ხაზზე clamp ellipsis-ით, სრული ტექსტი \`title\`-ში. Body-ს სიმაღლე აღარ არის დამოკიდებული აქტიური ხაზის სახელსა და ბიბლიოთეკის სიგანეზე.
  - **რატომ ორი ხაზი და არა ერთი \`truncate\`:** ვიდეოხაზის განმარტება „(აუდიო აქ არ ემატება)“ 288 px-ზე ხილული რჩება. ერთ ხაზზე ის ellipsis-ის ქვეშ დაიმალებოდა.
  - **ფასი:** სადაც ყველა მდგომარეობა ერთ ხაზზე ეტევა (მაგ. 480-ზე), preview მუდმივად 16 px-ით იზრდება, body კი იმდენივეთი მცირდება. A ამას კოდამდე ზომავს და doc 026-ში წერს.
  - **გაჩერების პირობა:** თუ 288-ზე რომელიმე მდგომარეობას ორზე მეტი ხაზი სჭირდება, A აჩერებს და B-ს ატყობინებს.
  - ყუთის re-placement არ ემატება: D-29d-ისა და D-29g-ის წესები უცვლელია.
- **M-R10-1/M2 (round-9 reviewer) იმავე ფაილშია:** \`LibraryPlayheadText\` 20 Hz-იანი library preview cursor-ით აღარ ხელახლა render-დება (\`memo\`). შიდა ფუნქციის სახელი \`LibraryPlayheadText\` რჩება, რადგან \`render-budget.test.tsx\` (გაყინულია) render-ებს სახელით ითვლის.
- **A-ს round-16 deviation-ები:** 1–4, 6 და 7 მიღებულია, C-მ დაადასტურა. Collapsed panel-ის clamp-იც მიღებულია, რადგან reopen announced მნიშვნელობას უდრის. **Deviation 5 B-ის ფორმულირების შეცდომაა:** Esc კლიპის არჩევას არასოდეს ხსნიდა (workspace-ის Esc გაფართოებულ ვიდეოს აბრუნებს, Ableton PNL-02/VID-06). Deselect = click ცარიელ ადგილას **იმავე** ხაზზე, რადგან აქტიური ხაზის შეცვლა C-R16-01-ის confounder-ია.
- **Polish 14b-ის გადაწყვეტილებები (კოდის გარეშე):**
  - (a) footer-ის selected-clip ხაზი რჩება: D-29g-მ ის ახლახან რეზერვირებულ row-ად აქცია და მისი მოხსნა C-R11-02-ს ხელახლა გახსნიდა;
  - (c) კლიპის სახელი header-შიც და content-შიც — მიღებულია: header დაკეცილი panel-ის იდენტიფიკაციაა;
  - L2 (writer დაკეცილ panel-ზე) და L3 (\`translateX(100%)\` კლიპის ბოლოს) C-R8-01-თან ერთად წყდება: დაკეცილი panel-ით R3-V1 3/3 PASS-ია, writer-ის შეცვლა კი Tech Lead-ის მოლოდინში R9-D3-ის გაყინულ კონტრაქტს დაარღვევდა;
  - round-9 L5 (pointer capture) და L7 (6 px separator) round 8-ის მსგავსად მიღებულია: synthetic pointer-ზე capture exception-ს აგდებს; 6 px lane-ის სახელურს უდრის და toggle-ს არ ფარავს;
  - panel-ის სიმაღლის workspace snapshot-ში აწევა ახლა არ ხდება. ის საჭიროებისას მხოლოდ C-ის ბაგით დაიგეგმება.
- **რიგი („C-ის ბაგები პირველია“):**
  - Round 17 = C-R16-01 + M-R10-1/M2, ორივე \`ArrangementLibraryPreview.tsx\`-ში. ეს ფაილი sync-ის სამიზნე არ არის;
  - Round 18 = polish 14b: L4 (ველების reset დაუკავშირებელ range-ზე), L11 (wheel number input-ზე), design (b) (range overlay waveform-ს არ ფარავს), L6 (\`biome-ignore\`-ის ტექსტი), design (d) (detail-ის label-ები ქართულად, პროტოტიპის მიხედვით; footer-ის ტექსტი სიტყვასიტყვით რჩება);
  - M1 და L8 (\`ArrangementContext\` / position-store) Tech Lead-ის C-R8-01/C-R6-02 run-ის შემდეგ სრულდება, ან, გვიანდელ შემთხვევაში, SRW-13-თან ერთად, რომელსაც \`ArrangementContext\` ისედაც სჭირდება.

მიზეზი: C-R16-01 ლოკალური და იაფია, ამიტომ მისი ფასად მიღება მოთხოვნის შემცირება იქნებოდა. ორხაზიანი რეზერვი იგივე პრინციპია, რაც footer-ში (D-29g), ყუთის მოძრაობისა და გაყინული dock-ის გარეშე. 14b-ის კოდის გარეშე გადაწყვეტილებები ან დამტკიცებულ კონტრაქტს იცავს (D-29g, R9-D3), ან round 8-ის reviewer-ის უკვე მიღებულ დასაბუთებას იმეორებს.

`;
rep('**ვიდეოს import (SRW-02, FB-15).**', d29h + '**ვიდეოს import (SRW-02, FB-15).**');

rep(
  'Round 16: polish 14a + C-R15-02/03 (D-29g). Panel-ის polish 14b/14c Round 17–18-შია.',
  'Round 16: polish 14a + C-R15-02/03 (D-29g, C PASS, დაიხურა). Round 17: C-R16-01 + M-R10-1/M2 (D-29h). Round 18: polish 14b. M1/L8 — Tech Lead-ის run-ის ან SRW-13-ის შემდეგ.',
);

rep(
  '| 17 | Panel-ის polish 14b | detail panel — L11, L2–L7, design-philosopher (a)–(d) |',
  '| 17 | C-R16-01 + M-R10-1/M2 | ბიბლიოთეკის preview: აქტიური ხაზის ორხაზიანი ფიქსირებული row და `LibraryPlayheadText`-ის memo (D-29h) |',
);
rep(
  '| 18 | Panel-ის polish 14c | context/preview — M1, M-R10-1/M2, L8 (როცა ფაილები თავისუფლდება). შემდეგ milestone-ის სრული რეგრესია |',
  '| 18 | Panel-ის polish 14b | detail panel — L4, L11, design (b), L6-ის ტექსტი, design (d) label-ები (D-29h). M1/L8 — Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. შემდეგ milestone-ის სრული რეგრესია |',
);

rep(
  'Round 13-ისა და Round 14-ის შემდეგ advisor ხელმისაწვდომი იყო',
  'Round 13-ის, Round 14-ის, Round 15-ისა და Round 16-ის შემდეგ advisor ხელმისაწვდომი იყო',
);

rep(
  '- **Round 16: გაგზავნილია.** Panel polish 14a (C-R11-01..03, A-ს deviation 9) + C-R15-02 + C-R15-03 (D-29c, D-29g). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  `- **Round 16: C PASS** (\`tmp/studio-real-loop/c-round-16.md\`). R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U, R16-Doc, მეზობელი რეგრესიები და G16-1..3 PASS-ია. vitest 979/979.
  - **დაიხურა:** C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და A-ს round-11 deviation 9.
  - **ახალი Low:** C-R16-01 (აქტიური ხაზის შეცვლა preview-ის ხაზს ორ ხაზზე შლის, body მოკლდება და ყუთი preview-ის 8 px-ს ფარავს; რეგრესია არ არის) → D-29h, Round 17.
- **Round 17: გაგზავნილია.** C-R16-01 + M-R10-1/M2 (D-29h), მხოლოდ \`ArrangementLibraryPreview.tsx\`. პროგრესის დაფა: \`tmp/studio-real-loop/feature-status.md\`.`,
);

rep(
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), polish 14a + C-R15-02/03 (Round 16), 14b–14c (Round 17–18). ეტაპები 2 და 3 C-მ Round 11-ში და 13–15-ში დაადასტურა;',
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R16-01 + M-R10-1/M2 (Round 17), polish 14b (Round 18), M1/L8 (Tech Lead-ის run-ის შემდეგ ან SRW-13-თან). ეტაპები 2 და 3 C-მ Round 11-ში, 13–16-ში დაადასტურა; polish 14a Round 16-ში C PASS-ია;',
);

fs.writeFileSync(p, t);
console.log('plan.md updated');
