import os, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-486/update-feature-status.done'
if os.path.exists(M): sys.exit('already')
L=open(P).read().split('\n')
old='2026-11-13 · ავტორი: B (round 485 → round 486 დაგეგმვა, D-29z1727…D-29z1733)'
assert old in L[2], L[2][:120]
L[2]=L[2].replace(old,'2026-11-13 · ავტორი: B (round 486 → round 487 დაგეგმვა, D-29z1734…D-29z1736)')
i=next(k for k,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1729…D-29z1731): **round 486'))
L[i]='  ძველი: '+L[i][2:]
new=[
"  - **Round 486 = B-R480-ORDER-CARD-KEYBOARD — C PASS; მზადაა client path-ისთვის (D-29z1734).** C round 486: 16 სტრიქონი PASS, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-486.json`); gate 486 გამოქვეყნდა `bb82154`-ზე (ორივე remote). შეკვეთის ბარათი Tab-ით მიიღწევა, Enter/Space ხსნის და ხურავს, ხილული სახე HEAD-ის ტოლია (12/12 წყვილი 0 px). ნამდვილი backend შეკვეთები → BLOCKED (cloud), ღია მტკიცებულებად რჩება. reviewer-ის შენიშვნები: B-R486-FOCUS-OFFSET-GUARD-ს დაემატა confirmedBy; ახალი Low A-R486-REVIEW-L1-OC-TEST-GAPS → `deferred_low_polish`.",
"  შემდეგი (D-29z1735, D-29z1736): **round 487 = B-R486-PROFILE-NAME-KEYBOARD — მუშავდება.** Profile-ის სახელი (`<p onClick>`) მხოლოდ მაუსით რედაქტირდებოდა. B-მ ბრაუზერში HEAD-ზე გაიმეორა: სახელზე Tab-ის გაჩერება არ არის; Esc, ✕ და შენახვის შემდეგ focus `<body>`-ზე ვარდება; Enter-ის დაჭერით დაჭერისას 6 PUT იგზავნება. sketch v3: ნამდვილი `button` სახელით „Full Name …“, focus ბრუნდება სახელზე (Esc, Cancel, შენახვა) ან First name-ზე (შეცდომა), დაჭერილი Enter — 1 PUT (საერთო helper), ველებსა და ✓/✕-ს სახელები აქვთ. ხილული სახე უცვლელია (18 წყვილი 0 px header-ის ქვემოთ), 14 mutant წითელია, sketch-ზე სრული suite 4,273/4,273, tech-lead: APPROVE. backend-ით ნამდვილი შენახვა → BLOCKED (cloud).",
"  - **ახალი (D-29z1736):** **SABA-B-17-ENTRANCE-3-4S** (Medium, Saba 2026-11-13: შესასვლელი ანიმაცია პირველ ვიზიტზე მინიმუმ 3–4 წამი უნდა გრძელდებოდეს; ახლა 1.45–1.9 წმ) → round 488. **B-R487-PROFILE-EDITOR-NARROW-OVERFLOW** (Medium, 375 px-ზე სახელის რედაქტორის ✓/✕ ეკრანს გარეთაა) → round 489. შემდეგ DPG-BUTTON-CLEANUP და DPG P1-ის დანარჩენი. თუ დაგეგმვა 2026-11-16-ზე ან მის შემდეგ ხდება, ჯერ REGRESSION.",
]
L[i:i]=new
open(P,'w').write('\n'.join(L))
open(M,'w').write('ok\n'); print('ok')
