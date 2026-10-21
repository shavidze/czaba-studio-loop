import shutil, sys
p = sys.argv[1]
shutil.copyfile(p, sys.argv[2])
s = open(p, encoding='utf-8').read()

def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)

anchor = 'მიზეზი: run 1-მა ბაგი არ იპოვა, ამიტომ D-29k-ის თანმიმდევრობა უცვლელია. Run 2 იგივე გაყინულ tree-ზე მიდის, რომ შედეგი ცალსახად მიეკუთვნოს round-19-ის კოდს. მოცულობა არ მცირდება.\n'
d29m = anchor + '''
**D-29m — Round 21-ის შედეგი; C-R21-01 (Round 22) და fix-ის რაუნდების დაყოფა.** C round 21 (`c-round-21.md`): **FAIL** მხოლოდ R3-V2-ზე → **C-R21-01 (Low)**. Mute-ის შემდეგ ვიდეოს ხმა master-ზე ~120 ms რჩება: −52.3 dBFS, თუ mute beep-ამდე 40 ms-ით ადრე დაჯდა. მიზეზია `GAIN_TIME_CONSTANT = 0.015` (`setTargetAtTime`). Run 2-ის ყველა სხვა ID PASS-ია: R2-V1, R3-V4, R5-L3, R5-E1, RF5-3 3/3, SRW-11B end to end, G21-1..3, R21-A და export sanity. **C-R12-01 დაიხურა** decision table-ის მე-2 სტრიქონით (ზღვარი 0.13 ms; ცხრილი წესად რჩება). **Milestone-ის რეგრესია დასრულდა.**
- **Round 22 = მხოლოდ C-R21-01.** `setTrackGain` 0-ისკენ ან 0-იდან ყოველ გადასვლაზე `MUTE_TIME_CONSTANT = 0.003`-ს იყენებს (mute, unmute, solo). Volume-ის ცვლილება ორ არანულოვან მნიშვნელობას შორის რჩება 0.015-ზე, რომ slider-ზე zipper არ გაჩნდეს. წინა target თითო track-ზე construction-ის მნიშვნელობით ინიცირდება. უარყოფილია: გლობალური τ (volume-ის zipper) და მხოლოდ criterion-ის შეცვლა (კუდი რჩება; Ableton-ის mute პრაქტიკულად მყისიერია).
- **R3-V2-ის mute-ის მხარის ტექსტი შესწორდა** (B-ის ფორმულირების შეცდომა; −80 dBFS-ის დონე უცვლელია):
  - ძველ ტექსტს mute-ის მხარეს გარდამავალი ფანჯარა არ ჰქონდა, unmute-ს კი 100 ms ჰქონდა;
  - **ახალი წესი:** მუტის დროს ყოველი beep-ის ფანჯარა, რომელიც t_m + W-ზე ან მის შემდეგ იწყება, < −80 dBFS. **W = 35 ms**: 0 → −80 dBFS = 9.21·τ = 27.6 ms + ერთი render quantum (2.7 ms), მომრგვალებული;
  - t_m არის spy-ით დაფიქსირებული `setTargetAtTime`-ის დრო, არა click-ის;
  - ერთი run-ი სავალდებულოდ იმეორებს round 21-ის პირობას (mute beep-ამდე 40–100 ms-ით ადრე);
  - დამატებით R22-M2 ამოწმებს, რომ ramp ნამდვილად არსებობს: −3-დან −23 dB-მდე ≥ 3 ms. ასე hard cut-ით „გასწორება“ გამოირიცხება.
- **ტექსტის კიდევ ორი შესწორება:** R11-P1c-ის range-ის apply history-ს ჩანაწერს არ ქმნის (`tasks/round-8.md` l.205); R2-V1-ის MP4/MOV მიიღება metadata probe-ით, არა `canPlayType`-ით.
- **Fix-ის რაუნდები ფაილების მიხედვით:**
  - Round 23 — `ArrangementLane.tsx`: `aria-controls`, `ring-inset`, fold-ის ჩუმი უარი gesture-ის დროს, `:661`-ის მიზეზის ტექსტი;
  - Round 24 — `StudioWorkspace.tsx`: Home separator-ებზე, `nextElementSibling` → ცხადი ref;
  - შემდეგ SRW-13.
- **Tech Lead-ის სიას ემატება R22-T:** mute/unmute-ის click-ის არარსებობა მოსმენით.

მიზეზი: C-ის ბაგი ახალ ფუნქციამდე სრულდება. ერთი ფუნქციის ცვლილება ყველაზე მცირე პატიოსანი გამოსავალია, რომელიც მომხმარებლის mute-ის მოთხოვნას ასრულებს. მოცულობა არ მცირდება.
'''
rep(anchor, d29m)

rep('| 22 | Milestone-ის fix-ის რაუნდი | A-ს round-11 follow-up-ები, `ArrangementLane.tsx:661`, რეგრესიის ბაგები |\n',
    '| 21 → | (შედეგი) | Run 2: C FAIL მხოლოდ R3-V2-ზე (C-R21-01); C-R12-01 დაიხურა; milestone-ის რეგრესია დასრულდა |\n'
    '| 22 | C-R21-01 | Mute-ის de-click: `setTrackGain` τ 3 ms 0-ისკენ/0-იდან, volume 15 ms (D-29m) |\n'
    '| 23 | Fix-ის რაუნდი, ნაწილი 1 | A-ს round-11 follow-up-ები `ArrangementLane.tsx`-ში + `:661` |\n'
    '| 24 | Fix-ის რაუნდი, ნაწილი 2 | A-ს round-11 follow-up-ები `StudioWorkspace.tsx`-ში |\n')

rep('და Round 19-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.',
    'Round 19-ის, Round 20-ისა და Round 21-ის შემდეგ advisor ხელმისაწვდომი იყო და მისი რჩევა გამოყენებულია.')

rep('- **Round 21: გაგზავნილია.** Milestone-ის რეგრესია, run 2 (D-29l): C — ვიდეო/სინქრონი, C-R12-01 (RF5-3), SRW-11B end to end; A — მხოლოდ attestation, ფაილი არ იცვლება. პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.\n',
    '- **Round 21: C FAIL მხოლოდ R3-V2-ზე** (`tmp/studio-real-loop/c-round-21.md`). Run 2-ის ყველა სხვა ID PASS-ია: R2-V1, R3-V4, R5-L3, R5-E1, RF5-3 3/3, SRW-11B end to end, G21-1..3. vitest 999/999. Milestone-ის რეგრესია დასრულდა.\n'
    '  - **დაიხურა:** C-R12-01 (decision table, ზღვარი 0.13 ms).\n'
    '  - **ახალი Low:** C-R21-01 (mute-ის ~120 ms-იანი კუდი) → D-29m, Round 22.\n'
    '- **Round 22: გაგზავნილია.** C-R21-01 (D-29m). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.\n')

open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok')
