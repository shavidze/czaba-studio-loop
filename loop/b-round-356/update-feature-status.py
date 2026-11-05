import pathlib, sys, shutil
P = pathlib.Path('feature-status.md')
DONE = pathlib.Path('b-round-356/update-feature-status.done')
if DONE.exists():
    sys.exit('already applied')
shutil.copyfile(P, 'b-round-356/feature-status-before-357.md')
s = P.read_text(encoding='utf-8')

old_hdr = 'განახლდა: 2026-11-05 · ავტორი: B (round 355 → round 356 დაგეგმვა, D-29z1145…D-29z1148)'
assert s.count(old_hdr) == 1
s = s.replace(old_hdr, 'განახლდა: 2026-11-05 · ავტორი: B (round 356 → round 357 დაგეგმვა, D-29z1149…D-29z1154)')

old_head = '  - **Round 356 = PERF-CAND-VIDEO-MOVE-BUDGET — მუშავდება (D-29z1147).**'
assert s.count(old_head) == 1
s = s.replace(old_head, '  - **Round 356 = PERF-CAND-VIDEO-MOVE-BUDGET — მზადაა (D-29z1149).** C round 356 PASS, `browserVerified`/`realVerified` true, 0 bug (`c-round-356.json`: PERF 84/84, 0 NEW; C-ის საკუთარი mutant M-C1 სამივე ახალ assert-ზე წითელია; VIDEO-DRAG-SMOKE და G356-AUTH ორივე viewport-ზე); gate 356 გამოქვეყნდა `d49536b`. GATE354-S1 დაიხურა. fake-bearer row BLOCKED (mock :5199 გამორთულია). gate-ის შენიშვნები: GATE356-I1 info, doc 232-ის სათაური → GATE354-ARCH-DOC232-SPLIT, Architecture note → სიგნალი GATE356-ARCH-BUDGET-NOTE-TEMPLATES (D-29z1150). ძველი აღწერა:')

old_next = '  შემდეგი (D-29z1148): round 356 →'
assert s.count(old_next) == 1
add = ('  - **PERF-CAND-FADE-RELEASE-COMMITS — დაიხურა, გამოსწორების გარეშე (D-29z1151).** B-ის probe HEAD `d49536b`-ზე (`b-round-356/fade-release-*.json`): მე-2 commit მხოლოდ სტატუსის ტექსტს არენდერებს (1 კომპონენტი; preview-ის გასუფთავება), მე-3 commit 0 კომპონენტიანია და click-ის შემდეგ ხდება; მისი setState ბოლომდე არ არის დადგენილი. ღირებულება ≤ 1 კომპონენტი, ამიტომ row-ები `record` რჩება; `<= 3` ზედა ზღვარი გადადის PERF-10a-BUDGETS-ში.\n'
       '  - **PERF-9 — არ დაწყებულა, დამოკიდებულების შენიშვნით (D-29z1152).** `/studio-lab`-ში ქსელიდან ჩატვირთული სტემი არ არსებობს, ამიტომ „მეორე გახსნა: 0 ბაიტი“ ბრაუზერში ჯერ ვერ შემოწმდება. მოცულობა არ მცირდება და ეს გადადება არ არის. დაგეგმვისას tech-lead აირჩევს: mock-api-ის კოლექცია ან SRW-21-PLAN.\n'
       '  - **Round 357 = PERF-10a — მუშავდება (D-29z1153).** `isPlaying` ArrangementContext-ის value-დან zustand-ის playback store-ში გადადის. Play/Stop-ზე provider და StudioWorkspace აღარ რენდერდება: დღეს 70 კომპონენტია, მოსალოდნელია ≈ 28 (`b-round-356/perf-summary.txt`). Follow-ის ქცევა არ იცვლება. ტესტების 46 ფაილის probe ერთ helper-ზე გადადის. მე-11 store-მა ARCH-R338-ის trigger-ი გაააქტიურა; root-ის მოთხოვნა განმეორდა (`b-round-356/root-request-arch-checkpoint.md`), მაგრამ ის რაუნდს არ ბლოკავს.\n'
       '  შემდეგი (D-29z1154): round 357 → REGRESSION (თუ დაგეგმვა 2026-11-08-ზე ან შემდეგაა) → PERF-10a-BUDGETS → PERF-10b (activeTrackId/selection, clip click, C-R320-01) → PERF-9 → PERF-11 … PERF-15 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED. RETRO 368-ზე ან STUDIO-PERFORMANCE-ის ბოლოს.\n'
       '  ძველი (round 356-ის დაგეგმვა): ')
s = s.replace(old_next, add + old_next.lstrip(), 1)
P.write_text(s, encoding='utf-8')
DONE.write_text('ok\n')
print('ok')
