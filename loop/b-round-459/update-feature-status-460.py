# B round 459 -> 460: feature-status.md update. Run once from the loop root.
import os, sys
P = 'feature-status.md'; MARK = 'b-round-459/update-feature-status-460.done'
if os.path.exists(MARK):
    sys.exit('already applied')
lines = open(P, encoding='utf-8').read().split('\n')
i3 = 2
assert lines[i3].startswith('განახლდა: 2026-11-12 · ავტორი: B (round 458 → round 459'), lines[i3][:80]
lines[i3] = lines[i3].replace('B (round 458 → round 459 დაგეგმვა, D-29z1624…D-29z1625)', 'B (round 459 → round 460 დაგეგმვა, D-29z1626…D-29z1627)')
idx = next(n for n, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1625): **round 459 = SABA-B-13'))
lines[idx] = lines[idx].replace('  შემდეგი (D-29z1625):', '  ძველი: შემდეგი (D-29z1625):', 1)
new = [
    '  - **Round 459 = SABA-B-13 (Store-ის შესასვლელი) — ბაგია (D-29z1626).** C round 459 FAIL (`c-round-459.json`, `browserVerified`/`realVerified` true), gate 459 გამოტოვებულია. C1–C5, C7, C8, C10, C12–C15 PASS (პირველი კადრი შავია, ხანგრძლივობა CPU 1-ზე 1466–1558 ms). ბაგი **A-R459-REVIEW-R1 = C-R459-01** (Medium, origin B spec): თუ ბრაუზერის extension hydration-ის შეცდომას (React #418) იწვევს, React მთელ დოკუმენტს თავიდან ხატავს, ფარდის `<style>` იცვლება და შესასვლელი საერთოდ არ ჩანს (HEAD-ზე ჩანს). A-მ შეაჩერა (STOP), C-მ დამოუკიდებლად გაიმეორა. C-R459-02 (CPU 4-ზე logo/tag ზღვარი) და C-R459-03 (click-ის დაყოვნება probe-ის გამო) — Low, კრიტერიუმები გადაწყვეტილია. round 459-ის ცვლილება ხეში რჩება (არ დაბრუნებულა).',
    '  შემდეგი (D-29z1627): **round 460 = SABA-B-13 გასწორება — მუშავდება.** handshake-ის მდგომარეობა გადადის typed `window.__czabaEntrance`-ზე (React-ის მიერ შეცვლილ კვანძზე აღარ არის დამოკიდებული); boot listener-ები 1250 ms-ში თავად იხსნება; ხელახლა დახატვისას ფარდა ჩართული რჩება overlay-მდე, მაგრამ failsafe-ის შემდეგ ხილულ გვერდს აღარ აშავებს. B-მ Chromium-ში დაამტკიცა: inject-ზე ანიმაცია ჩანს v2-ზე 3/3, v1-ზე 0/3, HEAD-ზე 3/3 (`b-round-459/probe/r1/r1-b.txt`); სრული matrix — `b-round-459/probe/matrix/summary.txt`. tech-lead: review 1 REQUEST CHANGES → review 2 APPROVE (`b-round-459/sketch-review.md`); 27 mutant წითელი. Saba-ს ახალი კითხვა (არ ბლოკავს): SABA-Q-ENTRANCE-BACKGROUND-TAB. Saba ამოწმებს **ახალ tab-ში**; თუ ანიმაცია არ ჩანს — სცადოს extension-ების გარეშე ფანჯარაში. შემდეგ: REGRESSION-2026-11-13 (თუ 11-13-დან იგეგმება), 2b-3c-2b, 2b-3d, 2b-4, STORE-2c…5.',
]
lines[idx:idx] = new
row = next(n for n, l in enumerate(lines) if l.startswith('| SABA-B-13 |'))
cells = lines[row].split(' | ')
lines[row] = ('| SABA-B-13 | Medium (Saba, 2026-11-11; შესასვლელი ანიმაცია ძალიან სწრაფია) | **ბაგია → მუშავდება** — round 459 C FAIL (C-R459-01 = A-R459-REVIEW-R1: hydration-ის შეცდომისას შესასვლელი არ ჩანს), round 460 = გასწორება (window handshake, D-29z1627); Saba ამოწმებს **ახალ tab-ში** | '
              '`c-round-459.md`; `b-round-459/probe/r1/r1-b.txt`; `b-round-459/sketch-review.md`; `user-review/questions-saba-b-13.md` | C round 460 PASS → gate → მზადაა |')
open(P, 'w', encoding='utf-8').write('\n'.join(lines))
open(MARK, 'w').write('applied\n')
print('ok', idx, row)
