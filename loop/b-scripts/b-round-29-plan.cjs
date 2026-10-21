const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', '..', 'docs', 'technical', 'studio-real-workspace', 'plan.md');
let text = fs.readFileSync(file, 'utf8');
if (text.includes('D-29u')) {
  throw new Error('D-29u already present');
}
const NL = '\r\n';
if (!text.includes(NL)) {
  throw new Error('expected CRLF');
}

const replaceOnce = (from, to) => {
  const at = text.indexOf(from);
  if (at < 0 || text.indexOf(from, at + 1) >= 0) {
    throw new Error(`anchor not unique: ${from.slice(0, 60)}`);
  }
  text = text.slice(0, at) + to + text.slice(at + from.length);
};

const d29u = [
  '**D-29u — Round 29-ის შედეგი; SRW-13 ეტაპი 3 (Round 30): FB-04 Clip Gain ერთ აუდიო კლიპზე.** C round 29 (`c-round-29.md`): **PASS** ყველა იმ ID-ზე, რომელიც რეალური UI-დან მიიღწევა — R29-PA (export `[20,22)` 0 LSB), PB, PC, PD, NO (zero-width, გაჩერებული და დაკვრისას), FT (geometry = round 28), UR (PA, PC), K, R (ცარიელი clipboard-ის ვალის ჩათვლით), S, U (mutation a–g), Doc და G29-1..3 (vitest 1133/1133). C-R28-01, C-R28-02 და A-R28 review finding 4 დაიხურა. C-R27-02 დაიხურა D-29t-ის წესით (3/3, `node.exe` 10).',
  '',
  'გადაწყვეტილებები:',
  '- **SRW-24 / SRW-09 / FB-02 → „მოწმდება“, არა „მზადაა“.** R29-NE და არანულოვანი (40–41) no-op ბრაუზერში არ გაშვებულა: UI-ში მონაკვეთი ყოველთვის კლიპის საზღვრებშია (detail panel-ის clamp, range gesture-ის clamp), ამიტომ ეს მხოლოდ კოდის გზებია, რომლებსაც provider ტესტები და mutation (d) ფარავს. ეს ქცევის ხარვეზი არ არის. Doc 034 ამას არ ახსენებს → DOC034-UNREACHABLE-NOTE (Low), doc 034-ის მომდევნო მფლობელ რაუნდში ან საბოლოო docs pass-ში. დარჩა Tech Lead-ის R28-T.',
  '- **A round 29 review finding 1 (Low, არსებული ქცევა):** `applyEdit` pending fader preview-ს ცალკე ჩანაწერად აფიქსირებს, ამიტომ no-op Cut Time-ის შემდეგ undo label fader-ის ჩანაწერს აჩვენებს → A-R29-REVIEW-1, SRW-13 ეტაპი 4 (fader-ის UX, Round 31).',
  '- **Round 30 = SRW-13 ეტაპი 3 (FB-04).** ღია C ბაგი, რომელიც A-ს რაუნდს მოითხოვს, აღარ არის (C-R27-01, C-R23-01, C-R6-02, C-R8-01 Tech Lead-თანაა).',
  '- **მონაცემი:** `ArrangementClip.gainDb?: number` — მხოლოდ არანულოვანზე არსებობს. 0 dB ველს შლის, რადგან ისტორია JSON-ის ტოლობით ადარებს (`isSameArrangement`) და გაყინული fixture-ები ველის გარეშე ქმნიან კლიპებს. დიაპაზონი −60…+24 dB, 0.1 dB-ზე დამრგვალებული. ქვედა ზღვარი Master-ს ემთხვევა; ზედა R13-M1-ის +6-ს მარაგით იტევს. Live 12-ის ზღვრები შენახულ manual-ში არ წერია (დაუდასტურებელი).',
  '- **Graph:** ახალი კვანძი არ ემატება (`graph.test.ts` l.373 gain კვანძებს ითვლის). `ApplyScheduleOptions.clipGains` (clipId → linear) source-ის შექმნისას იკითხება ცოცხალ დაწყებაზეც და export-შიც. `ScheduleHandle.setClipGain` ამ კლიპის ყველა ცოცხალ source-ს `setTargetAtTime`-ით ცვლის და map-ს ინახავს, ამიტომ loop-ის შემდეგი iteration-იც სწორ gain-ს იღებს. `ScheduledClip`, `schedule.ts` და `loop.ts` გაყინული რჩება (მათი `toEqual` ფორმები).',
  '- **დაკვრისას reschedule არ ხდება:** `scheduleKey` `gainDb`-ს უგულებელყოფს; `syncPlayback`-ის reschedule-ის გარეშე შტო clip gain-ებს ისევე აწვდის handle-ს, როგორც ტრეკის gain-ებს. უცვლელ მნიშვნელობაზე `setClipGain` არაფერს აკეთებს.',
  '- **UI — რიცხვითი ველი + 0 dB reset, არა preview slider.** detail panel-ის ახალი სვეტი (`arrangement-detail-clip-gain`); commit Enter-ზე ან blur-ზე = ერთი ისტორიის ჩანაწერი `Clip Gain`; Escape ტექსტს აბრუნებს. ეს ყველაზე მცირე გულწრფელი ქცევაა: ერთი ჩანაწერი ერთ commit-ზე და მესამე preview/gesture მექანიზმი არ სჭირდება. Slider, drag, Shift-ით ზუსტი drag და double-click reset მომხმარებლის T12 სპეციფიკაციაშია (T12.8/T12.9) და T12-ის რიგში რჩება.',
  '- **ფარგლები:** მხოლოდ ერთი მონიშნული **აუდიო** კლიპი (T12.1). ჯგუფზე და ვიდეო კლიპზე ველი disabled-ია მიზეზის ტექსტით. რამდენიმე კლიპის ფარდობითი რედაქტირება — T12.7 (Live 12 §8.13). waveform-ის სიმაღლე gain-ს არ მიჰყვება — T12.19. ეს T12-ის რიგია და არა FB-ის გადადებული scope.',
  '- **Clipboard:** clipboard-ის item-ები `gainDb`-ს ინახავს (მხოლოდ არანულოვანზე) და Paste მას აღადგენს; სხვაგვარად Copy/Cut/Paste gain-ს ჩუმად დაკარგავდა. Split, Duplicate, trim, move და Delete Time მას spread-ით ინარჩუნებენ.',
  '- **გაყინული ტესტის ვიწრო ცვლილება (B probe, `b-round-29-probe.txt`):** `detail-panel-polish.test.tsx`-ის `detailLabelTexts` ყველა `<label>`/`<input>`-ს ითვლის. ახალი სვეტით 2 ტესტი ვარდება. A-ს შეუძლია შეცვალოს მხოლოდ l.372 და l.375-ის query, რათა `[data-testid="arrangement-detail-clip-gain"]`-ის შიგთავსი გამორიცხოს; ყველა expectation სიტყვასიტყვით რჩება (probe: 16/16).',
  '- **R13-M1-ის oracle:** ორივე export Master −12 dB-ზე. round 29-ში music-ის peak 0.574 იყო, ამიტომ Master 0-ზე +6 dB 0 dBFS-ზე შეიზღუდებოდა და თანაფარდობას გააყალბებდა. Master 0-ზე overload-ის გაფრთხილება მოსალოდნელია და ბაგი არ არის.',
  '- **Ableton (Live 12 Reference Manual, B-მ gstack `/browse`-ით 2026-10-12 17:23 +04:00-ზე შეინახა `tmp/studio-real-loop/b-round-29/`-ში):** §8.4.7 „The Gain slider, calibrated in dB, changes the clip gain“ — დადასტურებული; §8.4.7 + §8.13 — რამდენიმე კლიპზე დიაპაზონი ჩანს — დადასტურებული (CZABA: ერთი კლიპი, შეგნებული განსხვავება); Arrangement View: Waveform Vertical Zoom „without having to adjust the clip gain“ — zoom ≠ gain დადასტურებული (CZABA-ს zoom არ აქვს); ზღვრები და reset — წყაროში არ წერია (დაუდასტურებელი).',
  '',
].join(NL);

replaceOnce(`${NL}**ვიდეოს import (SRW-02, FB-15).**`, `${NL}${d29u}${NL}**ვიდეოს import (SRW-02, FB-15).**`);

const lines = text.split(NL);
let row29 = 0;
let row30 = 0;
let fb04 = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('| 29 | SRW-24 follow-up |')) {
    lines[i] = `${lines[i].replace(/\s*\|\s*$/, '')}. **C PASS** (R29-NE და 40–41 no-op UI-დან მიუღწეველია) |`;
    row29 += 1;
  }
  if (lines[i] === '| 30 | SRW-13, ეტაპი 3 | FB-04 clip gain (R13-M1) |') {
    lines[i] = '| 30 | SRW-13, ეტაპი 3 | FB-04 Clip Gain ერთ აუდიო კლიპზე (R13-M1): რიცხვითი ველი + reset detail panel-ში, ცოცხლად reschedule-ის გარეშე, export, clipboard (D-29u) |';
    row30 += 1;
  }
  if (lines[i].startsWith('| FB-04 | ფუნქციის მოთხოვნა | Clip Gain, ტრეკის Volume-ისგან ცალკე | SRW-13 | 19 |')) {
    lines[i] = lines[i].replace('| SRW-13 | 19 |', '| SRW-13 | 30 |');
    fb04 += 1;
  }
}
if (row29 !== 1 || row30 !== 1 || fb04 !== 1) {
  throw new Error(`table rows: ${row29} ${row30} ${fb04}`);
}
text = lines.join(NL);

replaceOnce(
  '- **Round 29: გაგზავნილია.** SRW-24-ის follow-up bug round (D-29t). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  [
    '- **Round 29: C PASS** (`tmp/studio-real-loop/c-round-29.md`) ყველა UI-დან მიღწევად ID-ზე: R29-PA..Doc, G29-1..3, vitest 1133/1133. R29-NE და 40–41 no-op UI-დან მიუღწეველია (not run, არა PASS).',
    '  - **დაიხურა:** C-R28-01, C-R28-02, A-R28 review finding 4; C-R27-02 (D-29t-ის წესით).',
    '  - ახალი Low: A-R29-REVIEW-1 (→ ეტაპი 4), DOC034-UNREACHABLE-NOTE. C-R23-01: 2 NUL (უცვლელი).',
    '- **Round 30: გაგზავნილია.** SRW-13 ეტაპი 3, FB-04 Clip Gain (D-29u). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
  ].join(NL),
);

replaceOnce(
  'ეტაპი 3 → Round 30, ეტაპი 4 → Round 31;',
  'ეტაპი 3 გაგზავნილია Round 30-ში (D-29u), ეტაპი 4 → Round 31;',
);

const srw09Line = lines.find((line) => line.startsWith('  - SRW-09/FB-02/SRW-24:'));
if (!srw09Line) {
  throw new Error('SRW-09 remaining line missing');
}
replaceOnce(
  srw09Line,
  '  - SRW-09/FB-02/SRW-24: C-ის ყველა UI-დან მიღწევადი ID PASS-ია (Round 28–29); C-R28-01/02 დაიხურა. დარჩა Tech Lead-ის R28-T და DOC034-UNREACHABLE-NOTE;',
);

fs.writeFileSync(file, text);
console.log('plan.md updated', (text.match(/D-29u/g) || []).length, 'D-29u hits');
