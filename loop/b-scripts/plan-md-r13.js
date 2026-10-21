const fs = require('fs');
const file = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(file, 'utf8');
const eol = t.includes('\r\n') ? '\r\n' : '\n';
const L = (lines) => lines.join(eol);

const anchor = '**ვიდეოს import (SRW-02, FB-15).**';
if (!t.includes(anchor) || t.includes('**D-19b')) {
  throw new Error('anchor missing or already applied');
}

const d19b = L([
  '**D-19b — R12-S-ის scope და `sourceChanged` (Round 12-ის შედეგი, Round 13-ის დაგეგმვა; D-19a-ს დამატება).** C round 12-ის შედეგი (`c-round-12.md`): R12-W1 PASS-ია — 9/9 wrap, `d300` −0.0030…+0.0058 (round 10-ში −0.017…−0.020), მხოლოდ swap-ები, `videoSettles` = swap-ების რაოდენობა, 0 escalation. R12-U (C-ის M1–M7 mutation-ებით), R12-Doc, მეზობელი რეგრესიები და G12-1..3 PASS-ია. Round ჩავარდა R12-S-ის სიტყვასიტყვით წაკითხვაზე: 5 ჩაწერა (1.1) პირველ swap-მდე, Play-დან 0.19–0.33 წმ-ზე, როცა იმავე frame-ის harness |d| 0.0192–0.0196-ია.',
  '- **ეს B-ის შეცდომაა criterion-ის scope-ში და არა ტოლერანსის საკითხი.** ამ 5 ჩაწერისას settle unarmed-ია (`videoSettles` 0), unarmed `settleRate` ≡ `videoRateCorrection` (grid ტესტი, C-ის M4), ხოლო `videoRateCorrection` ბაიტამდე უცვლელია (C-ის diff: `video-sync.ts`-ში მხოლოდ დამატებებია). Round 12-ის ცვლილება ამ row-ებს ვერ აღწევს. R12-S ამიერიდან ასე იკითხება: **პირველი arm-იდან**, settle-ის ფანჯრების (swap → +1.0 წმ) გარეთ, rate ≠ 1 იწერება მხოლოდ მაშინ, როცა იმავე row-ზე |d| > 0.02. C-ის მონაცემით (`c-round-12/runs/r12s-split.txt`) ეს 0 ჩაწერაა: 0/147, 0/147, 0/145, V3_1-ში 0/237. ზღვარი 0.02 უცვლელია. Round 12-ის `taskStatus: FAIL` ჩანაწერში რჩება.',
  '- **C-R7-01 headless-ში დაიხურა** R12-W1-ით. Tech Lead-ის quiet-Chrome RF7-3 (VP9 + H.264) SRW-03-ისა და SRW-05-ისთვის სავალდებულო მტკიცებულებად რჩება. SRW-03 C-R6-02-ის გამო ღიაა.',
  '- **C-R12-01 (Low)** — პირველი Play-ის start transient: უცვლელი მდგრადი წესი 1.1-ს წერს harness-ის |d|-ის ზღვართან (სხვაობა ≤ 0.8 ms; harness ctx-ზე დაფუძნებულ `posAt`-ს იყენებს, dock კი live position-ს). ის milestone-ის RF5-3-ში შემოწმდება: C start-ის rate-ის ჩაწერებთან ერთად dock-ის live position-საც წაიკითხავს არსებული harness-ით (source instrumentation-ის გარეშე). თუ dock-ის |d| ≤ 0.02-ზე rate ≠ 1 დადასტურდა, ეს D-19-ის ბაგი ხდება საკუთარი რაუნდით. უცვლელი კოდის ცალკე ხელახალი გაზომვა არ ხდება (`agent-workflow.md`).',
  '- **`sourceChanged` (A-ს reviewer Low 1) მიღებულია მეხუთე end site-ის გარეშე.** `sourceChanged` რთავს `seekWanted`-ს (dock l.535–545), ამიტომ frame rate-ის ჩაწერამდე (l.558) ბრუნდება `issueHoldSeek`-მდე (l.548), რომელიც `endSettle()`-ს იძახებს (l.328). დარჩენილი შემთხვევა — ელემენტის თვითნებური pause → `holdRelease` → play — settle-ს ≤ 1.0 წმ-ით ტოვებს, rate ≤ 1.45-ია.',
  '',
  'მიზეზი: verdict-მა უნდა გაზომოს ის, რაც fix-მა შეცვალა. ზღვრის შენარჩუნებით და start transient-ის RF5-3-ზე გადატანით არცერთი ტოლერანსი არ სუსტდება და უცვლელი კოდის უსასრულო ხელახალი გაზომვაც არ იწყება.',
  '',
]);

const d29d = L([
  '**D-29d — მცურავი ვიდეოს იმპლემენტაციის კონტრაქტი (SRW-11B ეტაპი 3, VID-06, Round 13; D-29-ის დაზუსტება).** პროტოტიპის `expandVideo`/`placeVideo`-ისა და D-29-ის მიხედვით, რეალური კოდის შეზღუდვებით:',
  '- **State:** `videoExpanded`, ბიბლიოთეკის `collapsed` და `libraryOpenedForVideo` view state-ია და `StudioWorkspace`-ში ცხოვრობს. `ArrangementLibrary` controlled ხდება props-ით (collapsed + onCollapsedChange) და placement-ისთვის თავის `<aside>`-ს ref-ით აწვდის. `ArrangementContext` არ იცვლება (C-R8-01/C-R6-02-ის სამიზნეა და გაყინულია). არსებული ქცევა (collapse → library preview ჩერდება, ◀/▶, rail 40 px) უცვლელია.',
  '- **იგივე ყუთი:** dock-ის 16:9 ყუთი (ორი `<video>`-ის მშობელი) `fixed` ხდება inline left/top/width-ით. Portal, reparent და remount არ ხდება; ორივე `<video>` იგივე DOM node რჩება. კომპაქტურ ადგილას ჩანს 160×90 placeholder (`ვიდეო გაფართოებულია` + დაბრუნების ღილაკი), ამიტომ dock-ის ზოლის სიმაღლე Δ 0-ია. Dock-ის ორი sync effect (rAF ციკლი და stopped-video effect) და counter-ები ბაიტამდე უცვლელია.',
  '- **გახსნა (⤢, `aria-label` „ვიდეოს გაფართოება“; გახსნილზე „ვიდეოს პატარა ხედზე დაბრუნება“):** თუ ბიბლიოთეკა დაკეცილია, ის დროებით იხსნება (`libraryOpenedForVideo`). ყუთი ბიბლიოთეკის სიგანის დასრულებული transition-ის შემდეგ ლაგდება (`transitionend` ან, თუ ბიბლიოთეკა უკვე ღიაა, მაშინვე); rAF-ით polling არ გამოიყენება. მდებარეობა = (library.left + 8, library.top + 8), სიგანე = min(640, library.width − 16), სიმაღლე = სიგანე × 9/16.',
  '- **Clamp:** left ∈ [0, innerWidth − w], top ∈ [0, innerHeight − h]; თუ viewport ყუთზე პატარაა, შესაბამისი კოორდინატი 0-ია. Window-ის resize ყუთს ხელახლა clamp-ავს. ბიბლიოთეკის სიგანის შეცვლა გახსნილ ყუთს არ ამოძრავებს.',
  '- **გადატანა:** pointer drag ყუთზე (ღილაკების გარდა) D-26-ის registry-ს იკავებს; ისრები ფოკუსირებულ `⠿` სახელურზე 16 px-ით ამოძრავებს და მოვლენა იქვე სრულდება (clip nudge, ნავიგაცია და seek არ ხდება).',
  '- **დაბრუნება:** ✕, placeholder-ის ღილაკი ან Esc. Esc workspace-ის keydown-ში მუშავდება: თუ მოვლენა უკვე დამუშავდა (`defaultPrevented`, მაგ. ბიბლიოთეკის ძებნის Esc) ან ფოკუსი ტექსტურ ველშია, ან Export-ის ფანჯარა ღიაა, არაფერი ხდება; სხვა შემთხვევაში გახსნილი ვიდეო კომპაქტურს უბრუნდება. თუ ბიბლიოთეკა ვიდეოსთვის გაიხსნა, დაბრუნებისას ის ისევ იკეცება. ◀ გახსნილი ვიდეოს დროს ვიდეოს კომპაქტურს აბრუნებს და ბიბლიოთეკას კეცავს.',
  '- **Status-ის ტექსტები (პროტოტიპიდან სიტყვასიტყვით):** გახსნა — „ვიდეო გაფართოვდა ბიბლიოთეკის თავზე. გადაათრიე სასურველ ადგილას; Esc ან ✕ აბრუნებს.“; ბიბლიოთეკის დროებითი გახსნით — „ბიბლიოთეკა დროებით გაიხსნა გაფართოებული ვიდეოსთვის; ვიდეოს დახურვისას ისევ დაიკეცება. Esc ან ✕ აბრუნებს.“; ◀ გახსნილზე — „ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.“',
  '- **ფენები:** გახსნილი ყუთი ბიბლიოთეკისა და timeline-ის ზემოთაა, მაგრამ Export-ის ფანჯარას არ ფარავს. ყუთი იყენებს მხოლოდ design token-ებს; ახალი CSS ფაილი და `app/styles`-ის ცვლილება არ არის.',
  '- **არ ემატება (D-29):** კომპაქტური ზომის slider და ვიდეოს fold.',
  '',
  'მიზეზი: ეს პროტოტიპის შეთანხმებული ქცევაა. State-ის `StudioWorkspace`-ში აწევა ყველაზე მცირე გზაა გაყინული context-ის შეუცვლელად. Sync effect-ების უცვლელობა და იგივე node-ები SRW-03-ის ახლახან დახურულ C-R7-01-ს იცავს.',
  '',
]);

t = t.replace(anchor, `${d19b}${eol}${d29d}${eol}${anchor}`);

const row13old =
  '| 13 | SRW-11B ეტაპი 3 | მცურავი ვიდეო (C-R7-01-ის დახურვის ან Tech Lead-ის quiet Chrome-ის შემდეგ) |';
if (!t.includes(row13old)) {
  throw new Error('row 13 missing');
}
t = t.replace(
  row13old,
  '| 13 | SRW-11B ეტაპი 3 | მცურავი ვიდეო (D-29d). C-R7-01 Round 12-ში headless-ში დაიხურა (D-19b) |',
);

const r12old =
  '- **Round 12: გაგზავნილია.** C-R7-01 დაზუსტებული D-19a-თი (swap-ის შემდეგ settle). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.';
if (!t.includes(r12old)) {
  throw new Error('round 12 status missing');
}
t = t.replace(
  r12old,
  L([
    '- **Round 12: C FAIL** (`tmp/studio-real-loop/c-round-12.md`) — მხოლოდ R12-S-ის სიტყვასიტყვით წაკითხვაზე. R12-W1, R12-U, R12-Doc, მეზობელი რეგრესიები და G12-1..3 PASS-ია, vitest 877/877.',
    '  - **D-19b:** R12-S-ის scope B-მ შეასწორა (პირველი arm-იდან; ზღვარი 0.02 უცვლელია). **C-R7-01 headless-ში დაიხურა**; Tech Lead-ის quiet-Chrome RF7-3 სავალდებულოა.',
    '  - **ახალი ბაგი:** C-R12-01 (Low) → milestone-ის RF5-3 (dock-ის live position-ით).',
    '  - A-ს reviewer Low 1 (`sourceChanged`) მიღებულია კოდის ცვლილების გარეშე.',
    '- **Round 13: გაგზავნილია.** SRW-11B ეტაპი 3 — მცურავი ვიდეო (D-29d). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  ]),
);

const advOld = 'Round 10-ისა და Round 11-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.';
if (t.includes(advOld)) {
  t = t.replace(
    advOld,
    'Round 10-ის, Round 11-ისა და Round 12-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
  );
} else {
  throw new Error('advisor line missing');
}

const remOld =
  '  - SRW-03 / SRW-05: C-R7-01 (Round 12, დაზუსტებული D-19a), C-R6-02 (Tech Lead quiet Chrome) და რეალური Chrome;';
if (!t.includes(remOld)) {
  throw new Error('remaining line missing');
}
t = t.replace(
  remOld,
  '  - SRW-03 / SRW-05: C-R6-02 (Tech Lead quiet Chrome), C-R12-01 (milestone RF5-3) და რეალური Chrome-ის RF7-3. C-R7-01 headless-ში დაიხურა (Round 12, D-19b);',
);
const sbOld =
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 3 (Round 13), polish 14a–14c (C-R11-01..03 ჩათვლით). ეტაპი 2 C-მ Round 11-ში დაადასტურა;';
if (!t.includes(sbOld)) {
  throw new Error('srw-11b remaining line missing');
}
t = t.replace(
  sbOld,
  '  - SRW-11B: C-R8-01 (Tech Lead quiet Chrome), ეტაპი 3 (Round 13, D-29d — გაგზავნილია), polish 14a–14c (C-R11-01..03 ჩათვლით). ეტაპი 2 C-მ Round 11-ში დაადასტურა;',
);

fs.writeFileSync(file, t);
console.log('ok');
