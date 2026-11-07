import pathlib
P = pathlib.Path('retros/retro-385.md'); s = P.read_text()
S3 = """| რაუნდი | რა მოხდა (ფაქტი, წყარო) | კლასი (`tech-lead`-ის აზრი) | წესი: არსებობდა / იცვლება |
|---|---|---|---|
| 376 BLOCKED | A-მ STOP გააკეთა (`a-round-376.md` l.3): TC10 დატვირთვისას 5 s-ის 62 %-ს იკავებდა (C standalone-ზე 33 %, `c-round-376.md`); reviewer-ის M1-ს („Edit group“-ის სტაბილურობის row არ არის") ruling არ ჰქონდა. 377-მა ორივე გადაწყვიტა და PASS მიიღო. | B-ის დაგეგმვა: წესები ერთმანეთს ეწინააღმდეგებოდა. L11 A-ს STOP-ს ავალებს ყველა covering ტესტზე, რომელიც 50 %-ს აჭარბებს; L31 B-ს მხოლოდ იმ ფაილების შემოწმებას ავალებს, რომლებსაც row-ები ემატება. TC10-ის ფაილი არ შეცვლილა. M1: L58 არსებობდა, მაგრამ არ გამოიყენეს. | **L31 იცვლება** (§10): covering set-იც. |
| 382 FAIL | C-R382-01 (Medium): 150.37 s hero buffer React updater-ის closure-ში რჩებოდა (D-29z1277). round sketch-ის გარეშე გაიგზავნა (`data/l58-l30-application.txt`). K32 („other holders release it") წყაროს წაკითხვით დამტკიცდა. C-R382-02 C-ის locator-ის შეცდომა იყო. A-ს STOP-ი (M2) L4-ის ტიპის ორი clause-ის შეჯახება იყო. | B-ის pre-check-მა არასწორი მეთოდი გამოიყენა: release-ს მხოლოდ Chromium-ის GC×2 liveness/heap probe ამტკიცებს. წარმოშობა შერეულია: B premise + A + HEAD-ზე უკვე არსებული updater. | **წესი არსებობდა, მაგრამ ვერ ამბობდა, როგორ დამტკიცდეს release** → **L58 clause** (§10). |
| 383 BLOCKED | C-ს დრო ამოეწურა: production heap, PERF-RES, mutant-ები არ გაეშვა; `progress.json` და L57 ველები არ იყო; auth row bare URL-ით 400-ს იღებდა (`c-round-383.json`). 384-მა იგივე row-ები გაიარა. | C-ის დროის მართვა. L59 სიტყვასიტყვით არსებობდა: **მესამედ არ შესრულდა** (340, 341, 383). `tools/l57-check.py` ამას არ ამოწმებს. | **L59 clause** (heaviest first, `progressFile`/`stopSignal`); checker = ROOT-REQ-L57-CHECK-PROGRESS. auth recipe → **L29 clause**. |

- **ფანჯრის counter-ი „A-ს მიერ B-ის sketch-ზე ნაპოვნი გადაუწყვეტელი Medium":** 2/16 (376 M1, 382 M2). სამიზნე 0 იყო, retro 369-შიც 2/16 იყო. **inference:** L58-ის sketch-review-ის clause ფანჯრის ბოლოს აღარ გამოიყენებოდა: 380–383-ის დაგეგმვას `sketch-review.md` არ ჰქონდა, მათ შორის 382-ს.
- **B-ის წარმოშობის C FAIL:** 1/16 (382, ნაწილობრივ). ზღვარი 3 იყო; retro 369-ში იყო 3/16."""
S7 = """- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING:**
  - `tech-lead` (აზრი): (B)-ის actions ნახევარი და d/e-ის შეჩერება.
  - B ეთანხმება და კითხვას Saba-ს უგზავნის L46-ით. root-ს ის 11 echo-ს განმავლობაში ჰქონდა.
  - B შეგნებულად **არ** იწყებს d/e-ს pattern A-თი, რომ ძირითადი სამუშაო არ შეჩერდეს. PERF-13b-ii/13c/13d მასზე არ არის დამოკიდებული.
- **round 385 = RETRO და არა GATE384-M1-ის გასწორება.** bug gate-ით Medium პირველია, მაგრამ RETRO კოდს არ ცვლის. RETRO-ს ვადა უკვე გადაცილებული იყო, ანალიზი კი მზადაა. M1 არც უსაფრთხოებაა და არც მონაცემების დაკარგვა. ამიტომ round 386 = M1 + A-R383-REVIEW-L1 (ერთი ფუნქცია, D-29z1291). REGRESSION მის შემდეგ მოდის.
- **`tech-lead`-ის L59 წინადადება** („`l57-check.py` ჩავარდება") გადავაკეთე: `tools/` B-ის საკუთრება არ არის, ამიტომ წესი C-ის ველებს ითხოვს და checker-ის ცვლილება root-ის მოთხოვნაა."""
S8 = """| ჩანაწერი | ბედი (D-29z1289/D-29z1290) |
|---|---|
| ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (ვადა RETRO 384) | Saba-ს: `user-review/questions-arch-leaf-plumbing.md`. default: d/e ჩერდება; RETRO 400-ზე პასუხი თუ არ იქნება → SYS-R385-LEAF-ACTIONS-CONTEXT ჩვეულებრივი ამოცანაა |
| PERF-11c-iii-d/e (ვადა RETRO 384) | hold, იგივე default |
| SYS-R369-STEM-CACHE-WRITE-COORDINATOR | root-ის პასუხი არ არის; RETRO 400-ზე default: PERF-13-ის შემდეგ ჩვეულებრივი ამოცანა |
| RC-R305-LESSON-CHAR-CAP | watch RETRO 400-მდე: L23 5058, L58 3717 bytes (< 5500) |
| B-R365-COUNT-CLAIM-PLANNING-VS-FINAL | retired: 369–384-ში მეორე შემთხვევა არ ყოფილა |
| B-R382-SCOPED-LOCATORS | watch (1×) |
| B-R382-UPDATER-CLOSURE-RETENTION, C-R383-L59-EARLY-STOP, C-R382-AUTH-CLAIM-MISMATCH | applied: L58, L59, L29 |
| RC-R376-COVERING-HEADROOM (ახალი) | applied: L31 |
| TL-R376-M1-HANDOFF-ARM-LIFETIME | დაიხურა როგორც stale-open (377 PASS, D-29z1286; L7) |"""
S9 = """- A-ს მიერ B-ის sketch-ზე ნაპოვნი გადაუწყვეტელი Medium+: სამიზნე 0 (ახლა 2/16).
- B-ის წარმოშობის C FAIL: ზღვარი 3 (ახლა 1).
- დროის გამო BLOCKED: სამიზნე 0 (ახლა 1).
- B-ის მედიანა < $13.94 (ახლა $12.505); B-ის წილი (ახლა 60.9 %).
- L57 16/16 (ახლა 15/16).
- lessons 60; L58 < 5500 bytes (ახლა 3717).
- ახალი clause-ები L29/L31/L58/L59 გამოყენებულია თუ არა (grep task-ებში: `GC×2`, `progressFile`, covering 50 %).
- ARCH-ზე პასუხი მოვიდა თუ არა, ან default ამოცანა დაიგეგმა თუ არა. SYS-R369-ის გადაწყვეტილება."""
S10 = """`lessons.md`: **60 ხაზი**, ახალი ხაზი არ დამატებულა. before-ასლი: `b-round-384/lessons-before-385.md`; diff: `b-round-384/lessons-diff.txt` (`3c3 18c18 20c20 41c41 59c59`). ყველა clause-ის ავტორია `tech-lead`, B-ის ფორმულირებით.
- **l.3:** pointer → retro-385 (ფანჯარა 369–384).
- **L29 (l.18):** „Recipe reaches the branch": ერთ branch-ზე მიმართული row ისეთ input-ებს იყენებს, რომლებიც ყველა წინა შემოწმებას გადის. B მას baseline-ზე უშვებს.
- **L31 (l.20):** covering set-იც 50 %-ის შემოწმებაში შედის.
- **L58 (l.41):** release/eviction/retention-ს ამტკიცებს ბრაუზერის GC×2 probe sketch-ზე და mutant. წყაროს წაკითხვა და jsdom ამის მტკიცებულება არ არის.
- **L59 (l.59):** ჯერ ყველაზე მძიმე row-ები; BLOCKED-for-time JSON-ში `progressFile` და `stopSignal`."""
S11 = """- **SYS-R385-LEAF-ACTIONS-CONTEXT** (`tech-lead`): 8 Low ერთი მიზეზით, pattern A-ს leaf-memo ვალით. ესენია: GATE371-L2, GATE375-L2, GATE379-L3, GATE378-L2, A-R371-GH5-IDENTITY, B-R374-MASTER-VACUOUS-NAME-COUNTS, GATE375-L1 და GATE377-L1. `classify.txt` რამდენიმე მათგანს „keyboard"-ად აჯგუფებს; აქ ისინი id-ით არის დაჯგუფებული.
- **სტატუსი `awaiting_user`:** ამოცანა არქიტექტურულ კითხვაზეა დამოკიდებული. `queued_conditional` არ გამოვიყენე, რადგან SYS-R369-მა აჩვენა, რომ ასეთი ამოცანა ჩერდება. მის ნაცვლად RETRO 400-ზე ვადა და default არის."""
S12 = """1. **Saba:** `user-review/questions-arch-leaf-plumbing.md`: A / B / B-actions.
2. **Saba:** Q-SR-385-1: „Try it in the Studio"-ის ადგილი (მხოლოდ კითხვა).
3. **root:** ROOT-REQ-L57-CHECK-PROGRESS (`tools/l57-check.py` BLOCKED-ზე `progressFile`/`stopSignal`-ს ამოწმებს).
4. **root:** ARCH-CHECKPOINT-PERF9-STEM-CACHE ისევ უპასუხოა (RETRO 400-ის default).
5. **root:** ROOT-REQ-B-RETRO-CONSULTS (retro 369 §12.3) ისევ ღიაა: `consequence-tester` და `qa-engineer` B-ის სიაში არ არიან, თუმცა retro_policy მათ ასახელებს."""
S13 = """- **round 385:** ეს RETRO. C ამოწმებს RT-* row-ებს.
- **round 386:** GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION + A-R383-REVIEW-L1 (+ GATE384-L2, თუ იაფია), ყველა `ensureDecoded`/`startLibraryPreview`-შია.
- შემდეგ:
  1. REGRESSION-2026-11-08;
  2. PERF-13b-ii;
  3. PERF-13c, 13d, 14, 15;
  4. SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM;
  5. STEM-LANES;
  6. SYS-1…3;
  7. STORE-2b…5;
  8. REVIEW-RECOMMENDATIONS;
  9. T12-ADVANCED;
  10. phase 2 (skip rule).
- **შემდეგი RETRO:** round 400 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა."""
for h, body in [('## 3.', S3), ('## 7.', S7), ('## 8.', S8), ('## 9.', S9), ('## 10.', S10), ('## 11.', S11), ('## 12.', S12), ('## 13.', S13)]:
    i = s.index(h); j = s.index('\n', i); k = s.index('(filled after the tech-lead consult)', j)
    s = s[:j+1] + body + s[k+len('(filled after the tech-lead consult)'):]
s = s.replace('## 3. FAIL/BLOCKED და ჯაჭვები: რატომ და რომელი წესი აიცილებდა\n', '## 3. FAIL/BLOCKED და ჯაჭვები: რატომ და რომელი წესი აიცილებდა (`data/fails-detail.txt`, `a-round-N.md` STOP ხაზები)\n')
assert 'filled after' not in s and 'see §3 table' not in s
P.write_text(s); print('ok')
