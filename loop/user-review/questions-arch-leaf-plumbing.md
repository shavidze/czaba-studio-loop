# კითხვა Saba-სთვის: Studio-ს workspace context-ის გაყოფა (ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING)

**თარიღი:** 2026-11-07 · **ავტორი:** B, RETRO 385 (D-29z1290) · **წესი:** L46 — ვადაგასული parked check Saba-ს ერთ კონკრეტულ კითხვად მიდის.

## რატომ მოდის თქვენთან
- root-ს 2026-11-06-ს (round 373-ის დაგეგმვა, D-29z1238) read-only `frontend-architect`-ის checkpoint ვთხოვეთ (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`). 11 echo-ს შემდეგ პასუხი ჯერ არ არის. ვადა იყო „RETRO 384“, რომელიც ახლა ტარდება round 385-ში.
- ეს ძირითად სამუშაოს **არ აჩერებს**: PERF-13b-ii, 13c და 13d მასზე არ არის დამოკიდებული.

## კითხვა
PERF-11c-ის დარჩენილი ორი leaf-ია: **d — VideoDock** და **e — Lane** (4 ხაზი, ~35 ველი). რომელი გზით გავაგრძელოთ?

- **(A) არსებული გზა.** თითოეულ leaf-ს მხოლოდ საჭირო props გადაეცემა და `memo`-ს comparator-ით რენდერი ჩერდება (round 371–379, 7 leaf). კოდის ცვლილება მცირეა, მაგრამ comparator-ები ხელით ნარჩუნდება.
- **(B) გაყოფა.** ერთი სტაბილური „actions“ context (ფუნქციები, რომლებიც არასოდეს იცვლება) + მონაცემების store-ები (zustand, უკვე დამტკიცებული PERF-8/10-ისთვის). უფრო დიდი ცვლილებაა, მაგრამ ხელით comparator-ების კლასი ქრება.
- **(B-actions) რეკომენდაცია (`tech-lead`-ის აზრი):** ახლა მხოლოდ (B)-ის actions ნახევარი, ერთი owner-ით და ქცევის შემნახველი ტესტებით. zustand data store-ები მოგვიანებით. ეს ხურავს action-identity კლასს (A-R376-M1, GATE379-L3) და რისკი შეზღუდულია.

## რას ვაკეთებთ პასუხამდე (default)
- **d და e ჩერდება.** VideoDock render-ის დროს მთელ `arrangement` ობიექტს კითხულობს (`b-round-373/consult-perf.md` l.3), ამიტომ (A) იქ ცოტას დაზოგავს. Lane-ს ყველაზე დიდი გადაკეთება დასჭირდება, თუ (B) აირჩევა.
- **თუ RETRO 400-მდე პასუხი არ იქნება,** B (B-actions)-ს ჩვეულებრივ, შეზღუდულ ამოცანად დაგეგმავს და სანამ ის შესრულდება, d/e-ს არ დაიწყებს.

## მტკიცებულება (Low-ები, რომლებიც ამ ერთ მიზეზს ეხება)
GATE371-L2-COMPARATOR-PER-KEY, GATE375-L2-COMPARATOR-UNSTABLE-PROP, GATE379-L3-ACTIONS-STABILITY-NOTE, GATE378-L2-LOOP-IMMUTABILITY-PIN, A-R371-REVIEW-GH5-IDENTITY, B-R374-MASTER-VACUOUS-NAME-COUNTS, GATE375-L1-UNUSED-WRAPPERS, GATE377-L1-TRANSITION-GUARD-NOT-IN-REPO. ამ ჩანაწერს ასევე ეხება: SIG-R382-DECODED-CACHE-IN-PROVIDER, SIG-R383-SOURCE-LOAD-ORCHESTRATION, SIG-R384-USE-DECODED-SOURCES-HOOK.

**პასუხი:** ჩაწერეთ აქ ან `ableton-decisions.md`-ის მსგავს ფაილში. root გადმოიტანს policy-ში.
