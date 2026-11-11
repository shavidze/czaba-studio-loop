# RETRO 450-ის კითხვები Saba-სთვის (L46 ვადები)

**ავტორი:** B, round 449 → 450 დაგეგმვა, 2026-11-11 (D-29z1599). **დეტალები:** `retros/retro-450.md` §8 და §12.
ეს კითხვებია, გადაწყვეტილებები არა. პასუხამდე loop სხვა დავალებებით გრძელდება და ქვემოთ ჩამოთვლილის გამო არ ჩერდება.

## Q1. Firefox — ორი შემოწმება ერთად (TLM-PERF15-FIREFOX, TLM-SABA-B-12-FIREFOX-SAFARI-ის Firefox-ის ნაწილი)
- TLM-PERF15-FIREFOX-ზე ეს **მეოთხე** კითხვაა (RETRO 416, 420, 435). RETRO 435-ზე ის task-ად ხელახლა გაიხსნა, მაგრამ root-ის ROOT-REQ-PLAYWRIGHT-FIREFOX ჯერ არ შესრულებულა: runner-ზე დღესაც მხოლოდ Chromium-ია (`~/.cache/ms-playwright`: chromium-1200).
- TLM-SABA-B-12-FIREFOX-SAFARI-ზე ეს **მეორე** კითხვაა (RETRO 435 Q1). L46-ის მიხედვით, მეორე RETRO-ს შემდეგ პასუხის გარეშე ის task-ად იხსნება. Firefox-ის ნაწილი ახლა იმავე root-ის მოთხოვნაზე ბლოკირებულ task-ად ხდება, PERF15-ის გვერდით.

**კითხვა:** დავაყენებინოთ root-ს Playwright Firefox runner-ზე (`npx playwright install --with-deps firefox`, package არ იცვლება), თუ Studio-სთვის Firefox ჯერ სამიზნე ბრაუზერად არ ჩაითვალოს?
**Default:** ორივე Firefox-ის task ბლოკირებული რჩება root-ის მოთხოვნაზე, ახალი ვადით RETRO 465. დახურვა მხოლოდ შენი თანხმობით.

## Q2. Safari — ხელით შემოწმებების ერთი სია (Tech Lead)
Cloud-ში WebKit არ არის, ამიტომ ეს მხოლოდ შენს კომპიუტერზე შემოწმდება:
1. TLM-SABA-B-12-FIREFOX-SAFARI-ის Safari-ის ნაწილი: Clip details-ის რიცხვით ველებზე spin-ისრები არ ჩანს; Export-ის radio-ები და progress bar; `?` sheet-ის ძებნაში ბრაუზერის ✕ არ ჩანს; dialog-ის scrollbar.
2. TLM-R449-WEBKIT-HEADING-INK: მთავარი გვერდის, `/about`-ის, 404-ისა და LeadMagnet popup-ის გამოყოფილი სიტყვები ღია ფერისაა და არა გამჭვირვალე (ვადა RETRO 465).

**კითხვა:** გაუშვებ ამ სიას Safari-ში? **Default:** Tech Lead-ის სიაში რჩება; ვადა RETRO 465. T12-სა და დანარჩენ სამუშაოს არ აჩერებს (2026-10-23-ის წესი).

## Q3. IME — Studio-ს ველები რეალურ IME-ით (TLM-SYS3-IME-PLATFORMS, TL-R444-L1) — პირველად
SYS-3 (რაუნდები 442–445) Chromium-ში გადამოწმდა და გამოქვეყნდა. რეალური IME (იაპონური/ჩინური macOS-ზე Safari-სა და Chrome-ში, Microsoft IME Windows-ზე, Android-ის კლავიატურა) cloud-ში არ არის.
- შეამოწმე: BPM, marker-ის სახელი, group-ის სახელი, Detail-ის From და Clip Gain; Library-ის ძებნა. IME-ში Enter ადასტურებს კანდიდატს და ველი ღია რჩება; Escape აუქმებს კანდიდატს და ველი ღია რჩება; მეორე Enter ინახავს.
- Android: ჩვეულებრივი Enter BPM-ის ველში ისევ ინახავს.

**კითხვა:** გაუშვებ ამ შემოწმებას? **Default:** Tech Lead-ის სიაში რჩება; ვადა RETRO 465. თუ მაშინაც პასუხი არ იქნება, L46-ის მიხედვით task-ად გაიხსნება, მაგრამ cloud-ში შეუსრულებელი იქნება — ამიტომ მაშინ კვლავ შენ გკითხავთ.

## Q4. STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები — მეორედ
RETRO 435 Q3-ზე პასუხი არ მოსულა. ჯერ კიდევ შენს პასუხს ელოდება: PERF-4b, 9c, 11b, 12b, 14c-ii/iii (`questions-perf12b.md`, `questions-perf13b-ii.md`, `questions-perf14c-pyramid-canvas.md`). root-ს — PERF-9d; backend-ს — PERF-4c.

**კითხვა:** რომელიმე ჯერ კიდევ გინდა? **Default:** ყველა გაჩერებული რჩება, ვადით RETRO 465. loop მათ არ იწყებს და მათ გამო არ ჩერდება. ეს ის ნაწილებია, რომელიც შენს დიზაინის არჩევანს ელოდება და არა ხელით შემოწმებას, ამიტომ L46-ის „task-ად გახსნა“ მათ არ ეხება.

## Q5. წესის წინადადება (პროექტის `.claude/`, loop არ ცვლის): sketch-ის `git apply` და primitives hook
Round 447-ში A-მ წყაროს 7 ცვლილება shell-ში python-ის string replace-ით გააკეთა, ამიტომ `.claude/hooks/inject-primitives.mjs` არ გაეშვა, და primitives ცვლილების შემდეგ წაიკითხა (RETRO450-A-SHELL-EDITS-BYPASS-HOOK). loop-ის `lessons.md` L60 ახლა კრძალავს shell-ის string replace-ს, `git stash`-სა და `git checkout --`-ს store-ში. B-ის განხილული sketch-ის `git apply` ნებადართული რჩება, primitives-ის წაკითხვის შემდეგ. ეს hook-საც გვერდს უვლის.
**კითხვა:** ითვლება თუ არა განხილული sketch-ის `git apply` hook-ის ეკვივალენტურ ცვლილებად? თუ არა, root-ს შეუძლია hook-ი Bash-ის `git apply`-ზეც გააფართოვოს. ეს `.claude/`-ის ცვლილებაა და მხოლოდ შენი თანხმობით კეთდება.
**Default:** `git apply` რჩება ნებადართული; hook არ იცვლება.

## Q6. ინფორმაცია: მკვდარი Store კომპონენტების წაშლა (LEGACY-DEAD-STORE-COMPONENTS)
შენი 2026-11-10-ის წესით („Legacy code that is not used anywhere must be removed incrementally“) B გეგმავს STORE-2b-3d-ში იმ Store ფაილების წაშლას, რომლებსაც barrel-ის გარდა არცერთი importer არ აქვს: ArtistBioSection, VideoShowcase, PianoLoadingAnimation (+ `.loading-brand`), PianoCurtainLoader, CinemaCurtainLoader, Timeline და `email.server.ts`. ჩამონათვალი B ხელახლა შეამოწმებს grep-ით იმ რაუნდის დაგეგმვისას.
- `tech-lead` მიუთითებს CLAUDE.md-ზე („არაფერი წაშალო … ჩემი ნებართვის გარეშე“). B ამ ნებართვად შენს 2026-11-10-ის წესს მიიჩნევს.
- **TestimonialsSection არ წაიშლება**, რადგან keep-list-ის შინაარსი აქვს. ის SABA-Q-TESTIMONIALS-UNMOUNTED-ის პასუხს ელოდება.

**კითხვა:** თუ ამ წაშლას არ ეთანხმები, თქვი 2b-3d-მდე. **Default:** 2b-3d აშლის ჩამოთვლილ ფაილებს, Testimonials-ის გარდა.

## Q7. ტესტის source pin-ები Overview-ში (SIG-R441-SOURCE-PIN-RULING) — ტექნიკური, ინფორმაციისთვის
Overview-ის ტესტების ნაწილი ჯერ ისევ წყაროს ტექსტს ამოწმებს (PANEL list, PNR2/PNR4) და არა გამოსახულ შედეგს. `tech-lead` გირჩევს, ეს ერთად განიხილო L4-ის ახალ წესთან („Port preserves HEAD“).
**Default (B):** ისინი source contract-ებად რჩება. rendered assertion-ებად გადაკეთდება ARCH-SPLIT-ის დროს, როცა ის Overview-ს ან Lane-ს შეეხება, L4-ის წესით (HEAD-ის ყოველი pin row-ზე აისახება, mutant-ები ორივე მიმართულებით). პასუხი საჭირო არ არის, თუ არ გინდა სხვანაირად.
