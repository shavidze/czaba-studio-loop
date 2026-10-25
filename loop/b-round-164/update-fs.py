import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 163 → round 164 დაგეგმვა, D-29z129', 'round 164 → round 165 დაგეგმვა, D-29z130')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z129):** თეთრი ხაზი მუქი halo-თი, თეთრი სახელური მუქი საზღვრით და hover-ზე გადიდება, frame-ის 6 px radius, REVIEW-RECOMMENDATIONS-ის რიგი.\n"
bullet = ("- **Round 164 (SABA-B-1 + SABA-B-2) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 164 გამოქვეყნდა `7952439`. SABA-B-1 და SABA-B-2 — **მზადაა** (დაიხურა).** "
  "ENV-VIS: ხაზის ბირთვი halo-სთან min 15.62:1 ყველა 12 უჯრაში (იყო 1.74), სახელური ≥ 3.48 hover-ზე / 15.62 მშვიდ მდგომარეობაში (იყო 1.88); ENV-FUNC რეალური აუდიოთი (gain 0 → peak 0.00000); OV-CORNERS: ჭრილი 1/0/1/0 და 0 მარჯვნივ (იყო 3/13/3/15); RV1-SABA 0 px; G164-3 — PASS (`c-round-164.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "C-ის შენიშვნები N1 (overview frame-ი უჩინარია პროექტის ბოლოს მიღმა) და N2 (0 dB-ზე სახელური კლიპის სახელს ფარავს), gate review-ის Low-ები (pill-ის ფორმის frame, OV1-ის მყიფე ტესტი) და A-ს reviewer-ის EV1-ის Low → `deferred_low_polish` (სულ 231); a11y სიგნალი A11Y-R164-ENV-POINT-TARGET (10 px სახელური, 24 px სამიზნეზე ნაკლები, კლავიატურით მიუწვდომელი). "
  "**Round 165 (D-29z130): ROOT-RECON-MARKER-ENTER — დადასტურდა ბრაუზერში, Medium.** კლიპის header-ზე მაუსის დაჭერილ drag-ში Shift+Tab ×14 → marker-ის flag → F2 → სახელი → Enter: „Rename Marker“ ჩაიწერება drag-ის შუაში, შემდეგი მოძრაობა preview-ს `gesture.before`-იდან აღადგენს — სახელი იკარგება, Undo-ში რჩება ცარიელი ნაბიჯი (`b-round-164/out/enter-stab-probe.json`, ორივე ზომა). "
  "გამოსწორება: F2 drag-ის დროს უარყოფილია (როგორც M, ისრები, Delete და მენიუ); Enter drag-ის დროს უარყოფილია, editor ღია რჩება აკრეფილი ტექსტით. ტესტები MU15–MU17 (ჯერ წითელი), მუტაციები m182–m184. ცალკე სიგნალი B-R164-COMMIT-DURING-PREVIEW (context-ის დონე, დაცული ფაილი — არ იგეგმება). შემდეგ: Round 166 — V-3c-3b. "
  "**⚠ ვეტოს შესაძლებლობით (D-29z130):** Enter drag-ის დროს editor-ს ღიად ტოვებს (ალტერნატივა — დახურვა blur-ის მსგავსად, აკრეფილი ტექსტის დაკარგვით).\n")
rep(anchor, anchor + bullet)
rep("| SABA-B-1 | Medium | **ბაგია** — envelope-ის ხაზი", "| SABA-B-1 | Medium | **მზადაა (დაიხურა, Round 164 C PASS, `7952439`; `c-round-164.json` ENV-VIS min 15.62:1)** — იყო: envelope-ის ხაზი")
rep("| SABA-B-2 | Low (ახლავე, არა გადადებული) | **ბაგია** — overview-ის", "| SABA-B-2 | Low (ახლავე, არა გადადებული) | **მზადაა (დაიხურა, Round 164 C PASS, `7952439`; OV-CORNERS ჭრილი 1/0/1/0)** — იყო: overview-ის")
rep("| ROOT-RECON-MARKER-ENTER | დაუდასტურებელი (წყაროს ჰიპოთეზა) | **არ დაწყებულა** — marker-ის add/rename editor-ში Enter აქტიური pointer gesture-ის დროს შეიძლება commitArrangement-მდე მივიდეს (blur-ს იცავს, Enter-ს — არა) | `docs/technical/studio-real-workspace/agent-workflow.md` (2026-10-25 შეჯერება); PC MU14 | Round 165: ჯერ რეგრესიის ტესტი (add და rename); ფიქსი მხოლოდ განმეორების შემთხვევაში |",
    "| ROOT-RECON-MARKER-ENTER | Medium (დადასტურდა B-ის ბრაუზერის რეპროდუქციით) | **მუშავდება** — მაუსით დაჭერილ clip drag-ში Shift+Tab → flag → F2 → Enter ჩაწერს „Rename Marker“-ს; შემდეგი preview სახელს შლის, Undo-ში ცარიელი ნაბიჯი რჩება. მიზეზი: F2-ს `runUnlessGesture` არ აქვს (l.654), `settleEditor` მხოლოდ blur-ს ამოწმებს (l.294) | `b-round-164/out/enter-stab-probe.json`, `enter-f2-probe.json`; agent-workflow.md (2026-10-25 შეჯერება) | Round 165 (D-29z130): MU15–MU17 ჯერ წითლად, შემდეგ K1/K2; C MK-GESTURE რეალური Shift+Tab-ით ორივე ზომაზე |")
rep("**SABA-B-1 + SABA-B-2 — მუშავდება** (Round 164, D-29z129; Saba-ს 2026-10-25-ის ბაგები, დანარჩენ V-3/M ეტაპებამდე). შემდეგ ROOT-RECON-MARKER-ENTER (Round 165), V-3c-3b",
    "**SABA-B-1 + SABA-B-2 — მზადაა** (Round 164, C PASS `browserVerified`, `7952439`; `c-round-164.json`). **ROOT-RECON-MARKER-ENTER — მუშავდება** (Round 165, D-29z130; ბრაუზერში დადასტურებული Medium). შემდეგ V-3c-3b")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
