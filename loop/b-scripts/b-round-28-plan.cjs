const fs = require('fs');
const file = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
const raw = fs.readFileSync(file, 'utf8');
const crlf = raw.includes('
');
let text = raw.replace(/
/g, '
');
if (text.includes('**D-29t')) {
  throw new Error('D-29t already present');
}

function replaceOnce(anchor, replacement) {
  const first = text.indexOf(anchor);
  if (first < 0 || text.indexOf(anchor, first + 1) >= 0) {
    throw new Error('anchor not unique: ' + anchor.slice(0, 60));
  }
  text = text.replace(anchor, replacement);
}

const d29t = [
  '**D-29t — Round 28-ის შედეგი; SRW-24-ის follow-up (Round 29): ყველა ხაზის clipboard ხაზებს ინარჩუნებს, Cut Time-ის no-op გულწრფელია, footer ყველა ხაზის მდგომარეობას აჩვენებს.** C round 28 (`c-round-28.md`): SRW-24-ის ყველა ID **PASS**-ია (R28-DA..Doc, G28-1..3; vitest 1119/1119). Round-ის სტატუსი **FAIL**-ია მხოლოდ C-R27-01-ის გამო. round 27-ის ყველა დავალიანება (R27-TL restated, K 1440, მცურავი ვიდეო, TO Redo-თი, E offline, R, TI) PASS-ია. ახალია C-R28-01 და C-R28-02 (ორივე Low).',
  '',
  'გადაწყვეტილებები:',
  '- **C-R27-01 → ცხრილის row 3 (Tech Lead quiet Chrome).** ცხრილი „იგივე procedure“-ზე ადარებს. vm-3-ის ყველა მოქმედება procedure-იდან ~2 წმ-ით გადაიწია, ანუ ის იმავე კატეგორიისაა, რომლითაც C-მ vm-1/vm-2 ჩაანაცვლა. ვალიდური რჩება ორი run: vm-4 PASS და vm-5 FAIL. ბიუჯეტი ამოწურულია, შედეგი შერეულია → row 3. ცხრილი „3+2-დან 2 ვალიდურს“ არ ითვალისწინებდა — ეს B-ის ცხრილის ხარვეზია. A-ს bug round **არ** ინიშნება, რადგან მექანიზმის ჰიპოთეზა არ არსებობს: ხაზების read round 27-ში გამოირიცხა, hardSeek 0-ია, vm-3-ის excursion კი ნებისმიერ click-მდე დაიწყო. ასეთი რაუნდი ღია სინქრონის კვლევა იქნებოდა, რასაც workflow კრძალავს. Tech Lead-ისთვის მთავარი მონაცემია vm-5: 287.6 ms procedure-ის ფარგლებში, excursion Master Mute-ის click-იდან ~130 ms-ში. მუდმივი confound: 35–41 `node.exe`. Row 4 არ ამოქმედდა.',
  '- **C-R27-02 → watch.** დახურვის პირობა („3/3 დაბალ, ჩაწერილ დატვირთვაზე“) ვერ შეფასდება, რადგან C round 27-მა ჩავარდნილი batch-ების `node.exe` არ ჩაწერა. ოთხი batch ზედიზედ მწვანეა, ამიტომ ის არ იხურება და ტესტი არ იცვლება. C ყოველ სრულ suite-ს `node.exe`-ით წერს; განმეორება ხელახლა ხსნის მას, როგორც ტესტის მდგრადობის საკითხს.',
  '- **Round 29 = bug round, ეტაპი 3 → Round 30.** „C-ის ბაგები პირველ რიგში“ — მომხმარებლის ინსტრუქცია და round 14/17-ის პრეცედენტი. ერთ რაუნდშია სამი მჭიდროდ დაკავშირებული ერთეული: C-R28-01, C-R28-02 და A-ს round-28 review-ის finding 4. ყველა SRW-24-ის კონტრაქტს ეხება.',
  '- **C-R28-01 — D-25-ის შესწორება (clipboard-ის წარმოშობა).** D-25-ის „ერთ აუდიო ხაზზე მასალა → active track“ წესი რჩება ერთხაზიანი მონაკვეთისა და კლიპების Copy/Cut-ისთვის. ახალი წესი: clipboard, რომელიც ყველა ხაზის დროის მონიშვნიდან მოდის (ყველა ხაზის Copy/Cut და Cut Time), Paste-ზე ორიგინალ ხაზებს ინარჩუნებს. ამისთვის `ArrangementClipboard` იღებს ერთ optional ველს. მას `copyRangeToClipboard` აყენებს ყველა ხაზის მონაკვეთზე, ხოლო Cut Time-ისთვის — context. `cutTimeToClipboard`-ის შედეგი byte-identical რჩება, რადგან გაყინული `clipboard.test.ts` l.133 მის clipboard-ს `toEqual`-ით ამოწმებს. მომხმარებლის მოთხოვნა („Ctrl+Shift+X-ის clipboard სემანტიკა შემოწმდეს“) და ვერტიკალური მონიშვნის აზრი ამას მოითხოვს. Ableton-ის Paste-ის სამიზნე ხაზი B-ის წყაროში არ ჩანს → **დაუდასტურებელი**.',
  '- **C-R28-02 — Cut Time-ის no-op.** როცა `applyEdit` `false`-ს აბრუნებს (zero-width მონაკვეთი, ან მონაკვეთი, რომელიც არაფერს ცვლის): ისტორია არ იცვლება, გაჩერებული playhead-ის remap არ ხდება, მონაკვეთი და მონიშვნა რჩება, status კი გულწრფელია და შეიცავს `ბუფერი არ შეცვლილა`-ს. ამ ფრაზას გაყინული „Cut Time over silence“ ტესტი ამოწმებს.',
  '- **Finding 4:** footer-ის `arrangement-range` ხაზს ყველა ხაზის მონაკვეთზე ემატება `· ყველა ხაზი`. overlay `aria-hidden`-ია, ამიტომ ეს ხაზი მდგომარეობის მუდმივი ტექსტური წყაროა.',
  '- **Finding 5 (Split ღილაკი ყველა ხაზის მონიშვნაზე enabled-ია) — მიღებულია.** დაწკაპებისას ის Ctrl+E-ის მსგავსად უარს ამბობს status-ით (C R28-TF PASS). ღილაკის გამორთვა მიზეზს დამალავდა.',
  '- **Ableton-ის ცხრილის შესწორება (B-ის შეცდომა, round 27).** B-ის საკუთარ წყაროშივე (`b-round-27/ableton-keyboard-shortcuts-20261012.txt`, Live 12 §42.8 და §42.16) Ctrl+Shift+L = „Select Material in Loop“ / „Select Loop Brace Contents“, Delete Time = Ctrl+Shift+Delete, Toggle Loop Brace = Ctrl+L. B-მა round 27-ში Ctrl+Shift+L „არ შემოწმებულა“ დაწერა — ეს მცდარი იყო. CZABA-ში Ctrl+Shift+L მომხმარებლის მოთხოვნით ყველა ხაზზე ავრცელებს, ხოლო Ctrl+Shift+Delete-ს არაფერი უკავშირდება. ორივე შეგნებული განსხვავებაა. Doc 034-ს A ასწორებს.',
  '- **ინფორმაცია (ბაგი არ არის):** Ctrl+Shift+L-ის შემდეგ ცარიელ ადგილზე click-ის მერე status ძველ ტექსტს აჩვენებს (ცნობილი pattern); ჭრის კიდეებზე fade არ არის → SRW-18 (FB-06); overlay `/60` → R28-T. C-R23-01: 2 NUL (28013/28014). offset ისევ გადაიწია, ეს გამოსწორება არ არის.',
  '',
].join('\n');

replaceOnce('**ვიდეოს import (SRW-02, FB-15).**', d29t + '\n**ვიდეოს import (SRW-02, FB-15).**');

replaceOnce(
  '| 28 | SRW-24 + C-ის round-27 follow-up-ები | Delete/Backspace სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11; D-29s); C-R27-01-ის decision table |\n| 29 | SRW-13, ეტაპი 3 | FB-04 clip gain (R13-M1), თუ C-R27-01-ის ცხრილი A-ს bug round-ს არ მოითხოვს |',
  '| 28 | SRW-24 + C-ის round-27 follow-up-ები | Delete/Backspace სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11; D-29s). **SRW-24-ის ყველა ID C PASS**; round FAIL მხოლოდ C-R27-01-ზე (row 3 → Tech Lead); ახალი Low C-R28-01/02 |\n| 29 | SRW-24 follow-up | C-R28-01 (ყველა ხაზის clipboard ორიგინალ ხაზებზე), C-R28-02 (Cut Time no-op), footer-ის „ყველა ხაზი“, doc 034-ის Ableton-ის შესწორება (D-29t) |\n| 30 | SRW-13, ეტაპი 3 | FB-04 clip gain (R13-M1) |\n| 31 | SRW-13, ეტაპი 4 | FB-05 pan + fader-ის UX + round-9 M1/L8 + Master-ის hold tick |',
);
replaceOnce(
  '| — | SRW-13 ეტაპი 4 | FB-05 pan + fader-ის UX + round-9 M1/L8 + Master-ის hold tick |\n',
  '',
);

replaceOnce(
  '- **Round 28: გაგზავნილია.** SRW-24 — მომხმარებლის 2026-10-11-ის წაშლის მოთხოვნა — და C-ის round-27 follow-up-ები (D-29s). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  '- **Round 28: C FAIL** (`tmp/studio-real-loop/c-round-28.md`) მხოლოდ C-R27-01-ზე. SRW-24-ის ყველა ID (R28-DA..Doc) და G28-1..3 PASS-ია, vitest 1119/1119. round 27-ის დავალიანება PASS-ია.\n  - C-R27-01 → row 3 (Tech Lead quiet Chrome); C-R27-02 → watch (D-29t).\n  - ახალი Low: C-R28-01, C-R28-02. C-R23-01: 2 NUL (offset-ის გადაწევა).\n- **Round 29: გაგზავნილია.** SRW-24-ის follow-up bug round (D-29t). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
);
replaceOnce(
  '  - SRW-13: ეტაპები 1 და 2a C PASS (Round 25–26), ეტაპი 2b C FAIL მხოლოდ C-R27-01-ზე (Round 27), ეტაპი 3 → Round 29, ეტაპი 4 `todo`;\n  - SRW-09/FB-02: კონტრაქტი ჩანაცვლდა მომხმარებლის 2026-10-11-ის გადაწყვეტილებით → SRW-24 (Round 28);',
  '  - SRW-13: ეტაპები 1 და 2a C PASS (Round 25–26); ეტაპი 2b-ის ყველა ID PASS-ია (Round 27–28), ღიაა მხოლოდ C-R27-01 (Tech Lead quiet Chrome); ეტაპი 3 → Round 30, ეტაპი 4 → Round 31;\n  - SRW-09/FB-02/SRW-24: მომხმარებლის 2026-10-11-ის კონტრაქტი C-მ Round 28-ში დაადასტურა; ღიაა C-R28-01/02 (Low) → Round 29;',
);

fs.writeFileSync(file, crlf ? text.replace(/
/g, '
') : text, 'utf8');
/g, '
') : text, 'utf8');
console.log('plan.md updated');
