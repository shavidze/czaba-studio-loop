# შეკითხვები Saba-სთვის — რაუნდი 507 (ხელით აწყობილი ღილაკები brand ფონის გარეშე, NONBRAND)

არცერთი კითხვა ლუპს არ აჩერებს. პასუხამდე მოქმედებს default.

1. **გლობალური audio player-ის icon ღილაკების ფორმა.** player-ის „Close“, „Previous“, „Next“ და „Mute“ დღეს წრეებია. რაუნდი 507 მათ საერთო `IconButton`-ზე გადაიყვანს, რომელსაც მომრგვალებული კვადრატის ფორმა აქვს (`rounded-lg`, Chromium-ში 12px). ღილაკს ფონი მხოლოდ hover-ზე და focus-ზე უჩნდება, ამიტომ ფორმაც მხოლოდ მაშინ ჩანს. Play ღილაკი წრედ რჩება. **Default: მომრგვალებული კვადრატი**, product-designer-ის რჩევით (DESIGN_SYSTEM-ში IconButton „square“ ღილაკია). წრის შენარჩუნებას `IconButton`-ში `shape` prop-ის დამატება სჭირდება, ცალკე მცირე ეტაპად. (SABA-Q-507-PLAYER-ICON-SHAPE)
2. **Cookie banner-ის ღილაკები.** დღეს „Accept“ თეთრი pill-ია (hardcoded `bg-white`), „Decline“ კი ჩუმი ტექსტი. ორივე `Button`-ზე გადადის. **Default: თანაბარი წონა, ორივე secondary sm pill** (product-designer). თანაბარი წონა უფრო სამართლიანი თანხმობაა, მაგრამ შეიძლება შეცვალოს, რამდენი მომხმარებელი დაეთანხმება cookie-ს. Accept-ის გამოყოფა შენი გადასაწყვეტია. თუ N3 ეტაპის რიგამდე პასუხი არ მოვა, ის default-ით გაეშვება. (SABA-Q-507-COOKIE-WEIGHT)
3. **სპილენძისფერი outline ღილაკები.** product გვერდის „Open in Studio“, „Downloads“ და recordings-ის „Quick edit“ დღეს brass ან accent ფერის ჩარჩოთი არიან დახატული. `Button`-ს outline variant არ აქვს. **Default: secondary (ნეიტრალური ჩარჩო).** ალტერნატივა არის ახალი `outline` variant `Button`-ში, ანუ საერთო კომპონენტის ცვლილება. (SABA-Q-507-OUTLINE-VARIANT)

**ინფორმაციისთვის (კითხვა არ არის):**
- player-ის ღილაკებზე კიდევ ორი ხილული ცვლილებაა. „Previous“, „Next“ და „Mute“ მოსვენებულ მდგომარეობაში ოდნავ ჩუმდება (muted ფერი), რათა მთავარ ღილაკად Play დარჩეს. „Close“ hover-ზე აღარ წითლდება და 34-დან 32px-მდე პატარავდება; ნახევრად გამჭვირვალეც აღარ არის.
- product-designer-მა 59 ხელით აწყობილი control-იდან 28 სტატუსით „რჩება“ შეაფასა. ესენია მენიუს სტრიქონები, tab-ები, არჩევადი ბარათები, ფილტრის სტრიქონები, accordion და Google/Facebook ღილაკები: ისინი `Button`-ის ტიპის ღილაკები არ არიან. მათთვის მომავალში საკუთარი საერთო კომპონენტები შეიძლება გაკეთდეს (signal SIG-R507-NONBRAND-KEEP-PRIMITIVES).
- **ნაპოვნი ბაგი:** product გვერდზე უფასო პროდუქტის „Complimentary Download“ ღილაკი არაფერს აკეთებს. მას არც click handler აქვს და არც ბმული (2026 წლის მარტიდან). ჩაწერილია B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD სახელით, Medium. გამოსწორება დაიგეგმება რაუნდ 508-ში.
- დეტალები: `current-task.md`, `b-round-506/consult-product-designer.md`.
