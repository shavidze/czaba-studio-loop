const fs = require('fs');
const file = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let t = fs.readFileSync(file, 'utf8');
if (t.includes('**D-29a')) throw new Error('already applied');
const rep = (from, to) => {
  if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 80));
  t = t.replace(from, to);
};

const d30Start = '**D-30 — Volume-ის drag gesture-ია';
const d30End = 'ყველაზე მცირე და თანმიმდევრული გამოსწორებაა.\n';
const i = t.indexOf(d30Start);
const j = t.indexOf(d30End, i) + d30End.length;
if (i < 0 || j < d30End.length) throw new Error('D-30 not found');
const d29a = `
**D-29a — Detail panel-ის საწყისი მდგომარეობა და 1280×720-ის სიმაღლის ბიუჯეტი (SRW-11B ეტაპი 1, Round 8; D-29-ის დამატება).** C-ის გაზომვით (\`c-round-7/runs/n8-1280x720.json\`) 1280×720-ზე scroller-ის სიმაღლე 422 px-ია. ruler (28) + loop strip (16) + 4 × 81 px ხაზი = 368 px, horizontal scrollbar ≈ 10 px, ანუ თავისუფალია ≈ 44 px. 1440×900-ზე scroller 660 px-ია.
- Panel-ი mount-ისას ერთხელ წყვეტს საწყის მდგომარეობას. ის 144 px-ით გახსნილია მხოლოდ მაშინ, თუ გახსნის შემდეგ scroller-ში კვლავ ეტევა ruler, loop strip, ყველა ხაზი მიმდინარე სიმაღლით და scrollbar. სხვა შემთხვევაში ის დაკეცილი (36 px) იწყება. შედეგი: 1440×900 → გახსნილი, 1280×720 → დაკეცილი.
- გამყოფი panel-ის ზედა კიდეა და layout-ს 0 px-ს უმატებს.
- თუ მომხმარებელი 1280×720-ზე panel-ს გახსნის, timeline ვერტიკალურად scroll-დება. Auto-fit ეტაპი 2-ია.
- **ეტაპი 2-ისთვის ღია საკითხი:** 144 px-იანი panel-ით 1280×720-ზე ხაზებს ≈ 224 px რჩება, auto-fit-ის მინიმუმი კი 52 + 3 × 60 = 232 px-ია. ეტაპმა 2-მა ეს უნდა შეათანხმოს (მაგალითად, auto-fit-ის დროს detail-ის სიმაღლის შეზღუდვით) და გადაწყვეტილება აქ ჩაწეროს.

მიზეზი: ეს ყველაზე მცირე პატიოსანი ქცევაა, რომელიც ეტაპ 1-ში R11A-3-სა და R10-N8-ს (4 ხაზი + ruler + loop strip ორივე ზომაზე) არ არღვევს და lane-ის სიმაღლის ლოგიკას (ეტაპი 2) წინ არ სწევს.
`;
t = t.slice(0, j) + d29a + t.slice(j);

rep(
  'ნავიგაცია (D-28): C Round 6-ში R10-N5-ის გარდა ყველა ID PASS-ია; R10-N5 (C-R6-03, ruler-ის ბოლო label) Round 7-შია. რეალური მაუსი/wheel Tech Lead-ის სიაშია |',
  'ნავიგაცია (D-28): C-ის ყველა ID PASS-ია (R10-N5r Round 7-ში). ღიაა C-R7-02 (Low, label-ის 1.41–1.47 px overflow zoom sweep-ზე) → Round 9. რეალური მაუსი/wheel Tech Lead-ის სიაშია |',
);
rep(
  '| FB-08 | UX შენიშვნა | პანელის ადგილმდებარეობა | SRW-11A, SRW-11B | 4, 7 | SRW-11A (ბიბლიოთეკის პანელი + dock-ის ადგილი, D-22) Round 4-ში. SRW-11B Round 8-დან სამ ეტაპად (D-29): detail panel → fold/სიმაღლე + auto-fit → მცურავი ვიდეო. design-philosopher-ის მიმოხილვა Round 8-ის დაწყებამდე |',
  '| FB-08 | UX შენიშვნა | პანელის ადგილმდებარეობა | SRW-11A, SRW-11B | 4, 8, 10, 11 | SRW-11A (ბიბლიოთეკის პანელი + dock-ის ადგილი, D-22) Round 4-ში. SRW-11B სამ ეტაპად (D-29, D-29a): detail panel (Round 8) → fold/სიმაღლე + auto-fit (Round 10) → მცურავი ვიდეო (Round 11). design-philosopher-ს A იძახებს pre-flight-ში |',
);
rep(
  '| SRW-03 | 2, 7 | D-24a (RF6-1) C-მ Round 6-ში დაადასტურა, მაგრამ RF6-2-ში drift-ის რეგრესია აღმოჩნდა (C-R6-02, Medium). Round 7-ში ჯერ გაზომვა, მერე გამოსწორება. სუფთა რეალური Chrome ახლა სავალდებულო მტკიცებულებაა |',
  '| SRW-03 | 2, 7, 9 | Round 7: RF7-P1/P2/2 PASS, RF7-3 FAIL (C-R7-01: loop wrap-ის ვიდეოს landing, Medium). C-R6-02 ღიაა (app-attributed rAF LoAF INVALID run-ში). ორივე Round 9-შია. სუფთა რეალური Chrome სავალდებულო მტკიცებულებაა |',
);
rep(
  '| 7 | C-R6-01..03 | სამი დაკავშირებული ბაგი (`agent-workflow.md`): drift-ის რეგრესია (გაზომვით, run-ების ბიუჯეტით), ruler-ის label, Volume-ის gesture (D-30) |\n| 8–10 | SRW-11B | სამი ეტაპი (D-29): detail panel; ტრეკის სიმაღლე/fold + auto-fit; მცურავი ვიდეო. შემდეგ milestone-ის სრული რეგრესია |',
  '| 7 | C-R6-01..03 | სამი დაკავშირებული ბაგი (`agent-workflow.md`): drift-ის რეგრესია (გაზომვით, run-ების ბიუჯეტით), ruler-ის label, Volume-ის gesture (D-30) |\n| 8 | SRW-11B ეტაპი 1 | Clip Detail panel (D-29, D-29a) |\n| 9 | C-R7-01, C-R6-02, C-R7-02 | ბაგების რაუნდი: wrap-ის standby hand-off (ჯერ გაზომვა), დარჩენილი per-frame React consumer-ები, ruler label-ის sweep |\n| 10–11 | SRW-11B ეტაპი 2–3 | fold/სიმაღლე + auto-fit (D-29a-ს შეთანხმება); მცურავი ვიდეო. შემდეგ milestone-ის სრული რეგრესია |',
);
rep(
  'Round 3-ის, Round 4-ის, Round 5-ისა და Round 6-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
  'Round 3-ის, Round 4-ის, Round 5-ის, Round 6-ისა და Round 7-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
);
rep(
  '- **Round 7: გაგზავნილია (შეზღუდული რაუნდი, `agent-workflow.md`).** C-R6-02 (ჯერ გაზომვა, RF7-*), C-R6-03, C-R6-01 (D-30), doc 015/016. SRW-11B Round 8-დან სამ ეტაპად გადის; scope უცვლელია. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  '- **Round 7: C FAIL** (`tmp/studio-real-loop/c-round-7.md`). RF7-3 ჩავარდა, დანარჩენი ID-ები PASS-ია.\n  - **დაიხურა:** C-R6-01 (R30-1/2/U), C-R6-03 (R10-N5r, R10-N5-U), checkpoint-r6 #10.\n  - **SRW-10:** C-ის ყველა ID PASS-ია → `verified_except_manual`.\n  - **SRW-03 / SRW-05:** `regression_open`. C-R6-02 ღიაა: RF7-P1/P2/2 წერილობითი კრიტერიუმით გადის, მაგრამ INVALID run-ში app-attributed rAF LoAF 49/61 ms განმეორდა. ახალი ბაგია C-R7-01: loop wrap-ზე ვიდეოს landing 56 ms-ით გვიანდება, ვალიდურ run-ში.\n  - **ახალი ბაგები:** C-R7-01 (Medium), C-R7-02 (Low).\n- **Round 8: გაგზავნილია.** SRW-11B ეტაპი 1, Clip Detail panel (D-29, D-29a). სინქრონის ბაგები Round 9-შია; ეს `agent-workflow.md`-ის run-ბიუჯეტის წესისა და Round 7-ის §3-ის წინასწარი პირობის შედეგია. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
);
rep('  - SRW-10: R10-N5 (C-R6-03);\n  - SRW-11B: Round 7;', '  - SRW-10: C-R7-02 (Low) და Tech Lead-ის რეალური მაუსი;\n  - SRW-11B: Round 8 (ეტაპი 1), 10, 11;');
rep('  - SRW-03: C-R6-02 და რეალური Chrome;', '  - SRW-03 / SRW-05: C-R6-02, C-R7-01 (Round 9) და რეალური Chrome;');
fs.writeFileSync(file, t);
console.log('plan.md updated');
