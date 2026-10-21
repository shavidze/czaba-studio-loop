const fs = require('fs');
const path = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(path, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
const L = (lines) => lines.join(eol);

function replaceOnce(from, to) {
  const i = s.indexOf(from);
  if (i < 0 || s.indexOf(from, i + 1) >= 0) {
    throw new Error('anchor not unique: ' + from.slice(0, 60));
  }
  s = s.slice(0, i) + to + s.slice(i + from.length);
}

const d29e = L([
  '**D-29e — მცურავი ვიდეოს შემდგომი შესწორებები (C-R13-01..03, Round 13-ის შედეგი, Round 14; D-29d-ის დაზუსტება).** C round 13-ის შედეგი (`c-round-13.md`): **PASS** — R13-F1..F6, R13-U, R13-Doc, მეზობელი რეგრესიები (R12-W1 ×1 გაფართოებული ვიდეოთი, RF5-3 ×1, dock-ის sync diff 0, dock-ის შემოწმება, R11A-1, RF7-P2) და G13-1..3. vitest 914/914. სამი ახალი Low ბაგი, სამივე მცურავ ვიდეოზე. სადაც D-29e და D-29d განსხვავდება, D-29e იმარჯვებს.',
  '- **Placement (C-R13-01).** D-29d-ის (library.left + 8, library.top + 8) ყუთს ბიბლიოთეკის header-ზე (◀) და ძებნაზე დებს. ძებნა find → add flow-ის შესასვლელია. ახალი წესი: ყუთი ბიბლიოთეკის body-ში (ხე + სია, `ArrangementLibrary.tsx` l.427) ლაგდება, მის ქვედა კიდეზე:',
  '  - availableHeight = body.bottom − body.top − 16;',
  '  - სიგანე = max(160, min(640, library.width − 16, availableHeight × 16/9)), სიმაღლე = სიგანე × 9/16;',
  '  - left = library.left + 8; top = max(body.top + 8, body.bottom − 8 − სიმაღლე); შემდეგ viewport-ის არსებული clamp.',
  '',
  '  ყუთი ფარავს მხოლოდ scroll-ირებად სიისა და ხის row-ებს. ის არასოდეს ფარავს header-ს/◀-ს, ძებნას, separator-ს და preview-ის ზოლს (preview body-ს ქვემოთაა, l.535, ამიტომ aside-ის ქვედა კიდეზე მიბმა მას დაფარავდა). ქვედა კიდე იმიტომ, რომ ძებნის შედეგების პირველი row-ები ზედა ნაწილშია. 160 px-იანი მინიმუმი D-22-ის კომპაქტური ზომაა; მხოლოდ ამ გადაგვარებულ შემთხვევაში შეიძლება ყუთმა ძებნა დაფაროს. სხვა ყველაფერი (timing, drag, ისრები, clamp, resize, ◀, დროებითი გახსნა, ფენები, expand-ის ტექსტები) D-29d-ით რჩება.',
  '- **დაბრუნების status (C-R13-02).** პროტოტიპი დაბრუნებისას ტექსტს არ წერს. ყველაზე მცირე პატიოსანი ქცევა: ✕/placeholder/Esc-ით დაბრუნებისას — „ვიდეო პატარა ხედს დაუბრუნდა.“; თუ ბიბლიოთეკა ვიდეოსთვის გაიხსნა და ისევ დაიკეცა — „ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.“ ◀-ის ტექსტი უცვლელია. ▶/◀ გაფართოებული ვიდეოს გარეშე ახალ ტექსტს არ წერს.',
  '- **Export-ის ფოკუსი (C-R13-03).** საერთო `components/ui/Modal.tsx`-ს focus management არ აქვს და ის read-only-ა. ამიტომ შესწორება მხოლოდ `ArrangementExportDialog.tsx`-შია: გახსნისას ფოკუსი „დახურვა“ ღილაკზე გადადის, Tab/Shift+Tab dialog-ის შიგნით ტრიალებს, დახურვისას ფოკუსი წინა ელემენტს უბრუნდება, თუ ის კვლავ document-შია. Workspace-ის Export-ის capture-phase ნიშანი და early return უცვლელია. Modal-ის საერთო ხარვეზი root/UI owner-ს გადაეცემა.',
  '- **A-ს round-13 deviation-ები მიღებულია** (C-მ რეალურ ბრაუზერში დაადასტურა):',
  '  1. capture-phase `window` keydown ნიშნავს მოვლენას, თუ Export ღიაა, და early return ამ ნიშანსაც ამოწმებს (Modal-ის `document` listener-ი `onClose`-ს workspace-ის `window` listener-მდე ასრულებს);',
  '  2. reduced-motion-ის პირობაა „width ან `all` `transitionProperty`-ში **და** duration > 0“, რადგან `motion-reduce:transition-none` მხოლოდ `transition-property: none`-ს წერს;',
  '  3. ერთი fallback timer (duration + delay + 100 ms) და `transitioncancel` — placement ვერ ჩაიკიდება. Polling არ არის.',
  '- **R13-U guard 2-ის ფორმულირება (B-ის შეცდომა):** literal hoist-ზე search-precedence ტესტი მწვანე რჩება და ასეც უნდა იყოს (ძებნის Escape `preventDefault`-ს იძახებს). ის მხოლოდ `defaultPrevented`-ის მოხსნით (M2b) ვარდება. Round 13-ის PASS ამით არ იცვლება.',
  '',
  'მიზეზი: სამივე ყველაზე მცირე ცვლილებაა, რომელიც C-ის repro-ს ხურავს D-29d-ის სხვა წესების, dock-ის და sync-ის შეუცვლელად.',
  '',
  '',
]);
replaceOnce('**ვიდეოს import (SRW-02, FB-15).**', d29e + '**ვიდეოს import (SRW-02, FB-15).**');

const oldRows = s.slice(s.indexOf('| 14 | Panel-ის polish'), s.indexOf('| 22 | SRW-21 |'));
const row22 = '| 22 | SRW-21 | Mount-ის მზადყოფნა (route დაბლოკილია) + საბოლოო რეგრესია |';
replaceOnce(oldRows + row22, L([
  '| 14 | C-R13-01..03 | მცურავი ვიდეოს შემდგომი შესწორებები (D-29e): placement ბიბლიოთეკის body-ში, დაბრუნების status, Export-ის ფოკუსი |',
  '| 15 | Panel-ის polish 14a | C-R11-01..03 (D-29c) + A-ს round-11 deviation 9 |',
  '| 16 | Panel-ის polish 14b | detail panel — L11, L2–L7, design-philosopher (a)–(d) |',
  '| 17 | Panel-ის polish 14c | context/preview — M1, M-R10-1/M2, L8 (როცა ფაილები თავისუფლდება). შემდეგ milestone-ის სრული რეგრესია |',
  '| 18 | SRW-13 | Clip gain, pan, master, meters |',
  '| 19 | SRW-14, SRW-15 | Grid/Snap, bars/beats/tempo/metronome (ორ ეტაპად, თუ საჭიროა) |',
  '| 20 | SRW-16 | Markers |',
  '| 21 | SRW-17 | ტრეკების ჯგუფები |',
  '| 22 | SRW-18 | Fades + volume envelope |',
  '| 23 | SRW-19 | ვიდეოს opacity fade |',
  '| 24 | SRW-20 | Range/MP3/ექსპორტის სისრულე |',
  '| 25 | SRW-21 | Mount-ის მზადყოფნა (route დაბლოკილია) + საბოლოო რეგრესია |',
]));

replaceOnce('Round 11-ისა და Round 12-ის შემდეგ advisor', 'Round 11-ის, Round 12-ისა და Round 13-ის შემდეგ advisor');

replaceOnce(
  '- **Round 13: გაგზავნილია.** SRW-11B ეტაპი 3 — მცურავი ვიდეო (D-29d). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  L([
    '- **Round 13: C PASS** (`tmp/studio-real-loop/c-round-13.md`). SRW-11B ეტაპი 3-ის (მცურავი ვიდეო, D-29d) ყველა ID — R13-F1..F6, R13-U, R13-Doc — PASS-ია. მეზობელი რეგრესიები (R12-W1 ×1 გაფართოებულით, RF5-3 ×1, dock-ის sync diff 0) და G13-1..3 PASS-ია. vitest 914/914.',
    '  - **ახალი Low ბაგები:** C-R13-01 (placement ფარავს ძებნას და ◀-ს), C-R13-02 (მოძველებული status), C-R13-03 (Export-ის dialog ფოკუსს არ იღებს) → D-29e, Round 14.',
    '  - SRW-11B done არ არის: C-R8-01 ღიაა, C-R13-01..03 და polish 14a–14c დარჩა.',
    '- **Round 14: გაგზავნილია.** C-R13-01..03 (D-29e). Polish 14a/14b/14c Round 15–17-ზე გადაინაცვლა. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  ]),
);

replaceOnce(
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 3 (Round 13, D-29d — გაგზავნილია), polish 14a–14c (C-R11-01..03 ჩათვლით). ეტაპი 2 C-მ Round 11-ში დაადასტურა;',
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), C-R13-01..03 (Round 14, D-29e), polish 14a–14c (Round 15–17, C-R11-01..03 ჩათვლით). ეტაპები 2 და 3 C-მ Round 11-სა და 13-ში დაადასტურა;',
);

fs.writeFileSync(path, s);
console.log('ok', s.length);
