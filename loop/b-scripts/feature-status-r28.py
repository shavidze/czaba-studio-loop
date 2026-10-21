import io

P = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md'
with io.open(P, encoding='utf-8') as f:
    s = f.read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f'expected {count} got {n}: {old[:80]!r}')
    s = s.replace(old, new)

rep('განახლდა: 2026-10-11 · ავტორი: B (round 26 → round 27 დაგეგმვა)',
    'განახლდა: 2026-10-12 · ავტორი: B (round 27 → round 28 დაგეგმვა)')

start = s.index('მიმდინარე რაუნდი: **Round 27**')
end = s.index('## 1. მომხმარებლის თავდაპირველი მოთხოვნები')
new_head = '''**⚠ გარემო (root):** 2026-10-12-ს dev server `127.0.0.1:5173` გაჩერებული იყო (`curl` → `000`). C round 28-ის დაწყებამდე root-მა უნდა გაუშვას; აგენტები მას არ რთავენ. მანქანაზე 34–42 `node.exe` მუშაობს — ეს არის C-R27-01/C-R27-02-ის მთავარი ჰიპოთეზა.

მიმდინარე რაუნდი: **Round 28** (`current-task.md`, D-29s) — **SRW-24**: მომხმარებლის 2026-10-11-ის მოთხოვნა ([delete-selection-update.md](../../docs/technical/studio-real-workspace/delete-selection-update.md)).
- **A:**
  - Delete/Backspace (Shift-ითაც) ნებისმიერ სელექშენზე ყოველთვის ტოვებს სიცარიელეს: playhead და loop არ იცვლება, no-op-ზე ისტორიის ჩანაწერი არ იქმნება.
  - Ctrl+Shift+L არსებულ მონაკვეთს ყველა ხაზზე ავრცელებს: `TimeRange`-ის optional ველი, lane-ის overlay. ეს edit არ არის. Ctrl+L კვლავ loop-ს რთავს.
  - Ctrl+Shift+X ერთადერთი მოქმედებაა, რომელიც სიცარიელეს ხურავს (უცვლელი).
  - Split ყველა ხაზის მონიშვნაზე უარს ამბობს status-ით.
  - Transport-ის და footer-ის ტექსტები ახლდება.
  - ტესტები: `delete-selection.test.ts`, `delete-selection-ui.test.tsx` (≥ 16 `it`); `ArrangementContext.test.ts`-ში მხოლოდ l.567. Doc 034.
- **C:**
  - round 27-ის follow-up-ები: C-R27-01-ის decision table (r26 layout, hardSeek-ის დრო vs Master Mute); C-R27-02-ის 3 batch `node.exe` რაოდენობით; R27-TL-ის გასწორებული oracle; round 27-ის §13 გაუშვებელი ID-ები;
  - SRW-24: R28-DA/DB/DV/DM/VL/VD/CX/UR/PS/TF/UI/K/E/R/S/U/Doc, G28-1..3, Ableton-თან შესაბამისობის სვეტი (Live 12 manual §6.9/§6.11/§42.5, B-მ `/browse`-ით 2026-10-12-ს გადაამოწმა).

შემდეგ:
- C-R23-01 — Tech Lead-ის პასუხისთანავე, ახალ ფუნქციამდე;
- თუ C-R27-01-ის ცხრილის 2/4 სტრიქონი გააქტიურდა, A-ს bug round;
- Round 29: SRW-13 ეტაპი 3 (FB-04 clip gain) → ეტაპი 4 (FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick).

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 28 -StartPhase A`.

**Round 27-ის შედეგი** (C, `c-round-27.md`): **FAIL** — მხოლოდ R27-RB-ის ღირებულების oracle-ზე.
- **PASS:** G27-1..3 (vitest 1096/1096), R27-TL (music/stems/video), R27-TI (დონეები), R27-TM, R27-TV, R27-TW, R27-TO (latch, cue), R27-TR, R27-TF, R27-RB (render), R27-E (ფაილი), R27-K (1280), R27-L (გეომეტრია), R27-S, R27-U (mutation-ები a–f), R27-Doc.
- **FAIL:** R27-RB drift → **C-R27-01** (Medium): 5-დან 4 run > 30.1 ms, dock hardSeeks 2/2. Control run-ები ხაზების read-ის გარეშეც ცუდია (60.4/130.6) → ატრიბუცია ღიაა.
- **ახალი Low:** C-R27-02 — გაყინული ტესტები დატვირთულ batch-ში flaky-ია.
- **Oracle-ის შეცდომა (B):** R27-TL-ის SFX decay ფანჯრებზე literal ±1.0 dB არ გამოდგება (release 20 dB/s). Round 28 §4.1-ში გასწორდა; PASS-ად არ ჩაითვლება, სანამ ხელახლა არ შეფასდება.
- **გაუშვებელი** (server გაჩერდა): R27-K 1440 + Space-on-M, მცურავი ვიდეო, reset არაცარიელ Redo-ზე, OfflineAudioContext-ის node-ები live, ხაზის Mute de-click, loop seam, library drop, video floor-ის დრო, C-R23-01-ის hydration code point-ები → round 28 §4.1.
- **B-მ დამოუკიდებლად შეამოწმა მხოლოდ tree** (server გაჩერებული იყო): HEAD `c5ed47b`, 62 ხაზი = C-ის ბოლო მდგომარეობა, b-round-26 60 OK, 9 owned sha = `c-round-27/gates/owned-sha-now.txt`. Live ხელახლა არ შემოწმებულა.
- **ეტაპი 2b „მზადაა“ არ არის.** SRW-13 → **ბაგია**.

**მომხმარებლის ახალი მოთხოვნა (2026-10-11), წაშლა:** FB-02-ის მიწოდებული ქცევა (Delete მონაკვეთზე = Delete Time, სიცარიელე იხურება) ამ გადაწყვეტილებას ეწინააღმდეგება, ამიტომ FB-02 და SRW-09 გადადის **„მუშავდება“**-ში. ჩანაცვლებულია R1-B5, R1-B12 და R9-C5-ის პირველი პუნქტი.

'''
s = s[:start] + new_head + s[end:]

rep('| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5); milestone run 1: `c-round-20.md` §2.1, §2.12 (R1-B5, R9-C5) | — |',
    '| FB-02 | Cut (სიცარიელით) vs Cut Time | **მუშავდება** (კონტრაქტი შეიცვალა მომხმარებლის 2026-10-11-ის გადაწყვეტილებით: Delete/Backspace ყოველთვის ტოვებს სიცარიელეს, Ctrl+Shift+L ყველა ხაზზე ავრცელებს მონიშვნას, სიცარიელეს მხოლოდ Ctrl+Shift+X ხურავს; ძველი Delete Time ქცევა აღარ შეესაბამება) | Cut/Copy/Paste/Cut Time: `c-round-5.md` (R9-C1..C4), `c-round-20.md` §2.12. ჩანაცვლებული: R1-B5, R1-B12, R9-C5-ის პირველი პუნქტი. მოთხოვნა: `docs/technical/studio-real-workspace/delete-selection-update.md` | SRW-24 — Round 28 |')

rep('| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.12 | — |',
    '| SRW-09 | Clipboard (FB-02) | **მუშავდება** (Cut/Copy/Paste/Cut Time დადასტურებულია; Delete-ის კონტრაქტი ჩანაცვლდა → SRW-24) | `c-round-5.md`; `c-round-20.md` §2.12 | SRW-24 — Round 28 |')

rep('| SRW-13 | Clip gain, pan, master, meters | **მუშავდება** (ეტაპი 1 და 2a მზადაა — C round 25/26 PASS; R13-M3, R13-M4 PASS; ეტაპი 2b — Round 27) | ეტაპი 1: `c-round-25.md`; ეტაპი 2a: `c-round-26.md` (R26-C0/C6/CR/CM) | ეტაპი 2b: ტრეკების meter-ები (Round 27). ეტაპი 3: FB-04 clip gain (R13-M1). ეტაპი 4: FB-05 pan (R13-M2), fader-ის UX (click, 4 px box), round-9 M1/L8, Master-ის hold tick |',
    '| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპი 1 და 2a მზადაა; ეტაპი 2b: C round 27 FAIL მხოლოდ ღირებულების oracle-ზე → C-R27-01, Medium; გაუშვებელი ID-ები round 28 §4.1-შია) | ეტაპი 1: `c-round-25.md`; ეტაპი 2a: `c-round-26.md`; ეტაპი 2b: `c-round-27.md` §1–§10 | C-R27-01-ის decision table და round 27-ის დარჩენილი ID-ები (Round 28 C). ეტაპი 3: FB-04 clip gain (Round 29). ეტაპი 4: FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick |')

rep('| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS) | Tech Lead: რეალური Windows Chrome |',
    '| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS) | Tech Lead: რეალური Windows Chrome |\n| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **მუშავდება** (Round 28) | `delete-selection-update.md`; `current-task.md` §0, §4.2–§4.5 | Round 28: A → C (R28-*). Tech Lead: R28-T |')

rep('| C-R6-02 | Medium |',
    '| **C-R27-01** | Medium | **ბაგია** (R27-RB drift: 81.7/36.2/46.1/20.6/41.6 ms vs 30.1; dock hardSeeks 2/2; control run-ები ხაზების read-ის გარეშეც 60.4/130.6) | `c-round-27.md` §7; `c-round-27/runs/vm-*.txt` | Round 28 C §4.1: r26 layout, decision table, hardSeek vs Master Mute-ის დრო, `node.exe` რაოდენობა |\n| C-R27-02 | Low | **ბაგია** (frozen-8 batch: 151/152, 150/152, 152/152; ცალკე და სრულ suite-ში მწვანეა) | `c-round-27/gates/vitest-frozen8*.txt` | Round 28 C: 3 batch დატვირთვის ჩაწერით; ტესტი არ იცვლება |\n| L3-REMOVED-TRACK-TAPS | Low | **არ დაწყებულა** | `a-round-27.md` §4 (L3); doc 033 | წაშლილი ხაზის tap/state არ იწმინდება (ხაზები დღეს ფიქსირებულია) → საბოლოო რეგრესიამდე |\n| C-R6-02 | Medium |')

rep('Critical/High ღია ბაგი არ არის.\n',
    'Critical/High ღია ბაგი არ არის.\n\n**Round 27:** ბაგი არ დახურულა. ახალია C-R27-01 (Medium) და C-R27-02 (Low). C-R23-01: 4 NUL 28013/28014 და 58733/58734 — offset ისევ გადაინაცვლა, ეს გამოსწორება არ არის.\n')

rep('| **R27-T** |',
    '| **R28-T** | რეალურ Chrome-ში, რეალური მაუსით/კლავიატურით: Delete/Backspace მონაკვეთზე სიცარიელეს ტოვებს; Ctrl+Shift+L-ს browser არ იჭერს და ყველა ხაზზე ავრცელებს; Ctrl+Shift+X ხურავს სიცარიელეს; ყველა ხაზის overlay იკითხება | browser-ის რეზერვირებული მალსახმობები და რეალური input headless-ში ვერ დამტკიცდება |\n| **R27-T** |')

rep('- round 6–26-ის დაუკომიტებელი tree (58 ხაზი);',
    '- round 6–27-ის დაუკომიტებელი tree (62 ხაზი);\n- მანქანის დატვირთვა: A/C-ის run-ების დროს 34–42 `node.exe` (C-R27-01/02-ის ჰიპოთეზა);')

with io.open(P, 'w', encoding='utf-8') as f:
    f.write(s)
print('ok')
