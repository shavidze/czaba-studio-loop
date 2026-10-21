const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
const dir = 'C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/';
let t = fs.readFileSync(p, 'utf8');
fs.writeFileSync(dir + 'plan.before-r21.md', t);
const rep = (a, b) => {
  if (!t.includes(a)) throw new Error('anchor missing: ' + a.slice(0, 80));
  t = t.replace(a, b);
};

const anchor =
  'მიზეზი: ღია C ბაგი აღარ არის (C-R6-02 და C-R8-01 Tech Lead-ის quiet Chrome-ზეა, C-R12-01 run 2-ში შედის). SRW-11B-ისა და polish-ის დასრულება წესით milestone-ის რეგრესიას მოითხოვს. მოცულობა არ მცირდება: ყველა 21 ID და SRW-11B end to end ორ run-ში იფარება.\n';
const d29l = `
**D-29l — Round 20-ის შედეგი და milestone-ის რეგრესიის run 2 (Round 21).** C round 20-ის შედეგი (\`c-round-20.md\`): **PASS**, ახალი ბაგი არ არის. Run 1-ის 17-ვე ID PASS-ია (R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2..D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2, R12-L2, R12-L4-ის synthetic ნაწილი), ასევე R20-Doc და G20-1..3. vitest 999/999. ექვსი არავალიდური გაზომვა harness-ის ან setup-ის შეცდომა იყო და ბიუჯეტის ფარგლებში ჩანაცვლდა (\`c-round-20.md\` §3).
- **R6-S5-ის ტექსტი შესწორდა D-25-ით.** „Ctrl+E 2+ მონიშნულით → უარი“ ძველი ფორმულირებაა. მოქმედი ტექსტია: playhead-ის მიერ გადაკვეთილი ყველა მონიშნული კლიპი იყოფა (ერთი ჩანაწერი \`გაყოფა (n)\`, მონიშნულია მარჯვენა ნაწილები); თუ playhead არცერთს არ კვეთს → \`Playhead არცერთ მონიშნულ კლიპს არ კვეთს.\`, arrangement და history უცვლელია. ეს B-ის ფორმულირების ვალი იყო, არა ბაგი.
- **Round 21 = run 2, იმავე გაყინულ tree-ზე** (\`b-round-20-tree-sha256.txt\`, 50 ფაილი):
  - R2-V1 (FB-15-ის quick);
  - R3-V2;
  - R3-V4 D-19-ის ფორმით: Space ×10-ის შემდეგ ზუსტად 2 \`<video>\`, ორივე paused და rate 1 (\`tasks/round-4.md\`);
  - R5-L3 და მის გვერდით R5-E1 (loop-on export = loop-off, ≤ 1.2e-7, \`export-clip-onset-1lsb\`);
  - C-R12-01 RF5-3-ით. C \`playbackRate\`-ის setter spy-ში იმავე მომენტში კითხულობს dock-ის live position-ს (\`getLivePosition()\`) არსებული read-only context reader-ით, source instrumentation-ის გარეშე. **გადაწყვეტილების ცხრილი:** პირველ arm-მდე rate ≠ 1-ის ჩაწერა dock-ის |d| ≤ 0.02-ზე → D-19-ის ახალი ბაგი, საკუთარი რაუნდით; ყველა ასეთი ჩაწერა dock-ის |d| > 0.02-ზე → C-R12-01 იხურება, როგორც harness-ის reference-ის არტეფაქტი. ზღვარი 0.02 უცვლელია; H1, H2, H3 ძალაშია;
  - SRW-11B end to end მომხმარებლის flow-ად: R11-P1b, R11-P1c, R11-P2, R11-P3, R11-P4, R11-U, მიმდინარე oracle-ებით (round 13–19-ის PASS-ები). ამას ემატება ერთი R3-V1 mode-D run მხოლოდ ინფორმაციისთვის; ეს C-R8-01-ის ვერდიქტი არ არის.
- **A Round 21-ში ფაილს არ ცვლის:** მხოლოდ tree-ის attestation (50 OK, gate-ები, 42 ხაზი). Round 20-ში C-ს მოძველებული store doc არ მოუნიშნავს, ამიტომ A-ს ახალი doc-ის დავალება არ ეძლევა.
- **Loop runner:** \`run-loop.ps1\`-ის ნაგულისხმევი \`RoundLimit\` 20-ია. Round 20 დასრულდა, ამიტომ runner შეიძლება \`ROUND_LIMIT_REACHED\`-ით გაჩერდეს (დაუსრულებელია, არა წარმატება). Round 21-ისთვის საჭიროა გადატვირთვა: \`-StartRound 21 -StartPhase A\` და უფრო მაღალი \`-RoundLimit\`.
- **შემდეგ:** milestone-ის fix-ის რაუნდი (ჯერ run 2-ის ბაგები, შემდეგ A-ს round-11 follow-up-ები და \`ArrangementLane.tsx:661\`), შემდეგ SRW-13.

მიზეზი: run 1-მა ბაგი არ იპოვა, ამიტომ D-29k-ის თანმიმდევრობა უცვლელია. Run 2 იგივე გაყინულ tree-ზე მიდის, რომ შედეგი ცალსახად მიეკუთვნოს round-19-ის კოდს. მოცულობა არ მცირდება.
`;
rep(anchor, anchor + d29l);

rep(
  'Round 20–21: milestone-ის რეგრესია (D-29k).',
  'Round 20–21: milestone-ის რეგრესია (D-29k; run 1 C PASS; run 2 — D-29l).',
);
rep(
  '| 20 | Milestone-ის რეგრესია, run 1 | სინქრონის გარეშე რედაქტირების ID-ები (D-29k), C გაყინულ tree-ზე; A — მხოლოდ doc 027-ის relabel |',
  '| 20 | Milestone-ის რეგრესია, run 1 | სინქრონის გარეშე რედაქტირების ID-ები (D-29k), C გაყინულ tree-ზე; A — მხოლოდ doc 027-ის relabel. **C PASS** |',
);
rep(
  '| 21 | Milestone-ის რეგრესია, run 2 | ვიდეო/სინქრონი: R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 (RF5-3), SRW-11B end to end |',
  '| 21 | Milestone-ის რეგრესია, run 2 | ვიდეო/სინქრონი: R2-V1, R3-V2, R3-V4, R5-L3 + R5-E1, C-R12-01 (RF5-3), SRW-11B end to end (D-29l); A — მხოლოდ attestation |',
);
rep(
  '- **Round 20: გაგზავნილია.** Milestone-ის რეგრესია, run 1 (D-29k): C — სინქრონის გარეშე რედაქტირების ID-ები; A — მხოლოდ doc 027-ის relabel, `app/` გაყინულია. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  '- **Round 20: C PASS** (`tmp/studio-real-loop/c-round-20.md`). Milestone-ის რეგრესიის run 1-ის 17-ვე ID, R20-Doc და G20-1..3 PASS-ია. vitest 999/999. ახალი ბაგი არ არის.\n- **Round 21: გაგზავნილია.** Milestone-ის რეგრესია, run 2 (D-29l): C — ვიდეო/სინქრონი, C-R12-01 (RF5-3), SRW-11B end to end; A — მხოლოდ attestation, ფაილი არ იცვლება. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
);
rep(
  'SRW-11B: C-R8-01 (Tech Lead quiet Chrome), milestone-ის რეგრესია (Round 20–21),',
  'SRW-11B: C-R8-01 (Tech Lead quiet Chrome), milestone-ის რეგრესიის run 2 (Round 21; run 1 C PASS),',
);
fs.writeFileSync(p, t);
console.log('plan.md updated');
