import sys,io
root=sys.argv[1]
def rep(path, pairs):
    p=f"{root}/docs/implementation/2026/quarter-IV/{path}"
    t=open(p,encoding='utf-8').read()
    for a,b in pairs:
        n=t.count(a)
        if n!=1: raise SystemExit(f"{path}: expected 1 hit, got {n}: {a[:60]}")
        t=t.replace(a,b)
    open(p,'w',encoding='utf-8').write(t)
rep('318-password-dialog-semantics.md',[
 ('**სტატუსი:** Completed (C round 493 PASS)','**სტატუსი:** Completed (C round 494 PASS)'),
 ('- **Scroll lock და `inert` ფონზე ღია ფანჯრის დროს:** APG scroll lock-ს არ მოითხოვს. Pointer-ს ფონზე backdrop ბლოკავს, keyboard-ს Tab-ის ჩაკეტვა.',
  '- **Scroll lock და `inert` ფონზე ღია ფანჯრის დროს:** არ დაემატა (round 492-ის გადაწყვეტილება). Pointer-ს ფონზე backdrop ბლოკავს, გარდა ეკრანის ქვედა 40 px ზოლისა: backdrop viewport-ზე 40 px-ით მოკლეა (B-ის გაზომვა 1440×900, 1280×720 და 375×812-ზე), ამ ზოლში click გვერდის ფონს ხვდება და ფანჯარას არ ხურავს (B-R492-PASSWORD-BACKDROP-SHORT, deferred Low). Keyboard-ით Tab და Shift+Tab ფანჯარაში რჩება; Ctrl+K-ის გამონაკლისი TODO-შია.'),
 ('- **პრობლემა:** B-ის პირველ sketch-ზე browser-მა აჩვენა, რომ გაქრობის ანიმაციის დროს trigger-იდან Tab ქრებად ფანჯარაში შედიოდა, ხოლო ანიმაციის ბოლოს focus `<body>`-ზე ეცემოდა. → **გადაწყვეტა:** `useIsPresent()` false-ზე კონტეინერი `inert` ხდება (PD10, browser P11, P12).',
  '- **პრობლემა:** `inert`-ის გარეშე (B-ის browser mutant O) გაქრობის ანიმაციის დროს trigger-იდან Tab ქრებად ფანჯრის Current Password-ზე შედიოდა, ხოლო ანიმაციის ბოლოს focus `<body>`-ზე ეცემოდა. → **გადაწყვეტა:** `useIsPresent()` false-ზე კონტეინერი `inert` ხდება (PD10, browser P11, P12, P13: mutant O-ზე წითელი, sketch-ზე მწვანე).'),
 ('- B-ის მუტანტები (20): თითოეული ცვლილების წაშლა მინიმუმ ერთ PD/PN ტესტს წითლად აქცევს.',
  '- B-ის jsdom მუტანტები (20): ყველა წითელია, თითოეული მინიმუმ ერთ PD/PN ტესტს წითლად აქცევს. Trigger-ის `type="button"`-ს არც მუტანტი აქვს და არც ტესტი.'),
 ('- Browser (B-ის გაზომვა, Chromium, production build, 1440×900, 1280×720, 375×812, signed-in stub; C ამოწმებს ამ რაუნდში):',
  '- Browser (Chromium, production build, 1440×900, 1280×720, 375×812, signed-in stub; B-ის გაზომვა და C round 492-ის PW-CHECK PASS იგივე კოდზე, 18 row × 3 viewport):'),
 ('- წინა გახსნის დაგვიანებული წარმატება შემდეგ გახსნილ ფანჯარას დახურავს',
  '- Backdrop viewport-ზე 40 px-ით მოკლეა: ქვედა ზოლი არ ბნელდება და იქ click ფანჯარას არ ხურავს — B-R492-PASSWORD-BACKDROP-SHORT, deferred Low.\n- 375 px-ზე ფანჯარა ეკრანის ორივე კიდეს ეხება (გვერდითი დაშორება არ აქვს) — B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW, deferred Low.\n- "Update Password"-ზე click ღილაკს disabled ხდის; Chromium-ში focus მოთხოვნის დროს `<body>`-ზე ეცემოდა და შეცდომის შემდეგ იქ რჩება (შემდეგი Tab ფანჯარაში შედის) — B-R492-PASSWORD-SUBMIT-FOCUS-LOST, deferred Low.\n- წინა გახსნის დაგვიანებული წარმატება შემდეგ გახსნილ ფანჯარას დახურავს'),
])
rep('315-profile-name-keyboard.md',[
 ('(round 493-დან dialog','(round 494-დან dialog'),
 ('(round 493, doc 318)','(round 494, doc 318)'),
 ('გამოსწორდა round 493-ში (doc 318): `role','გამოსწორდა round 494-ში (doc 318): `role'),
])
rep('317-profile-editor-narrow-overflow.md',[('გამოსწორდა round 493-ში (doc 318)','გამოსწორდა round 494-ში (doc 318)')])
print("v6 ok")
