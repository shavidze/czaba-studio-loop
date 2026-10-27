p='feature-status.md'
L=open(p,encoding='utf-8').read().split('\n')
assert L[2].startswith('განახლდა: 2026-10-27, B round 25.')
L[2]=("განახლდა: 2026-10-27, B round 26. round 26 **BLOCKED** დასრულდა (A და C: HEAD `6c956b4` ≠ baseline `c2c19a7`). TM-B29-ის (D-34) კოდი უკვე origin/master-ზეა `6c956b4`-ით, "
 "მაგრამ loop folder-ში მისი C report, gate და review არ არის (folder round 26-ის დასაწყისზე აღდგა, B-R26-01). ამიტომ TM-B29 **in_progress** რჩება, realVerified=false. "
 "round 27 = TM-B29-ის ხელახალი შემოწმება baseline `6c956b4`-ზე: C ამოწმებს diff-ს `c2c19a7..6c956b4` (R27-1…R27-6 = R26-1…R26-6), A არაფერს ცვლის. "
 "სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.\n\n"
 "**round 26 დახურულია BLOCKED-ით (realVerified=false):** A სწორად გაჩერდა (repository-ში ჩაწერა არ მომხდარა). C-მ დაადასტურა, რომ `6c956b4` მხოლოდ round 26-ის 8 owned path-ს ცვლის და tree სუფთაა. "
 "C-ის sanity run `6c956b4`-ზე (fixtures + `npm run check` exit 0, Biome 0/8, renderer 216/216, main 93/93) მხოლოდ დამხმარე მონაცემია (C-R26-01), acceptance არ არის. E2E და real app არ გაშვებულა. gate: skipped.")
i=[k for k,l in enumerate(L) if l.startswith('| TM-B29 |')][0]
L[i]=L[i].replace('| in_progress (**medium**), round 26 | B R25 red reproduction (B-R25-02): ძველ src-ზე 5 red / 2 pin, store-ზე დაფუძნებული prototype 215/215, Biome 8, MG-1…MG-9 მოკლულია |',
 '| in_progress (**medium**), round 27 (re-verify) | B R25 red reproduction (B-R25-02): ძველ src-ზე 5 red / 2 pin, prototype 215/215, MG-1…MG-9 მოკლულია. R26: კოდი გამოქვეყნდა `6c956b4`-ით loop-ის გარეთ, C-ის მტკიცებულება loop folder-ში არ არის (B-R26-01); C sanity 216/93, Biome 0/8 (არა acceptance) |')
assert 'round 27 (re-verify)' in L[i]
j=[k for k,l in enumerate(L) if l.startswith('| B-R25-02 |')][0]
L.insert(j+1,'| B-R26-01 | medium | loop folder ↔ repository desync: `6c956b4` ("verified loop rounds 26-26", 15:37Z) C PASS-სა და review-ზე მიუთითებს, მაგრამ loop folder 18:43Z-ზე round 26-ის დასაწყისზე აღდგა; round 26 გადაადგილებულ HEAD-ზე ხელახლა გაეშვა. ორიგინალი C report/gate/review და A-ს process მტკიცებულება (A-R17-02) დაკარგულია | root (restore process); TM-B29 ხელახლა მოწმდება round 27-ში |')
L.insert(j+2,'| C-R26-01 | info | C sanity `6c956b4`-ზე: check exit 0, Biome 0/8, renderer 216/216 (11 file), main 93/93; E2E/real app არა (`c-round-26/check.log`) | TM-B29 R27 (არა acceptance) |')
k=[k for k,l in enumerate(L) if l.startswith('| D-34 |')][0]
assert L[k].endswith('| planned R26 (TM-B29) |')
L[k]=L[k][:-len('| planned R26 (TM-B29) |')]+'| implemented in `6c956b4` (published); C verification pending R27 (TM-B29) |'
open(p,'w',encoding='utf-8').write('\n'.join(L))
print('ok')
