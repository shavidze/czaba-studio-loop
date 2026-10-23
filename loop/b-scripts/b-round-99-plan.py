P='/home/runner/czaba-project/docs/technical/studio-real-workspace/plan.md'
t=open(P,encoding='utf-8').read()
anchor='**D-29z64 — Round 98-ის შედეგი;'
assert t.count(anchor)==1
new='''**D-29z65 — Round 99-ის შედეგი; Round 100: ▶ მოუსმინე-ზე დაჭერილი Enter preview-ს ერთხელ რთავს (B-R98-H1-PREVIEW-TOGGLE-HOLD) + doc 087-ის სტატუსი (GATE99-S1).**

C round 99 (`tmp/studio-real-loop/c-round-99.md`, `c-round-99.json`) — **PASS, `browserVerified: true`, `realVerified: true`**, ბაგები 0: HOLD-ROW, HOLD-BODY, HOLD-PLUS ორივე viewport-ზე (0 → 1 კლიპი), FRESH-ADD (+2/+2/+1, double-click +1), HELD-ARROW-REG, SPACE-REG, CLOSE-HOLD-REG, EXPORT-REG (რეალური 24-bit/48 kHz WAV, 101.352 s), PX-NET, REG-HYD, G99-3, AN-REVIEW (C-მ mutation-ები a, b, c, g გაიმეორა), T99-TARGETED (55 / 969), SOURCE-UNCHANGED. fake-Bearer — BLOCKED (backend cloud-ში არ არის). Gate 99 — გამოქვეყნდა `e2412db` (reviewer 9/10, Critical/High არ არის).

- **R1 — დახურვა მტკიცებულებით:** B-R98-HELD-ENTER-MULTI-ADD, GATE98-S5 დაიხურა.
- **R2 — ჰიპოთეზის შემოწმება:** gate 99-ის Low #2 guard-ს ითხოვდა, როცა B ბრაუზერში გაიმეორებდა. B-ის probe (`tmp/studio-real-loop/b-round-99-probe/probe-toggle-result.json`, Chromium 1280×720): ▶ მოუსმინე-ზე focus, `keyboard.down('Enter')` ×3 → 3 click, ▶ → ■ → ▶ → ■; ერთი `press` → 1 click. დადასტურებული ფაქტია; ეს არის SRW-12-ის ბიბლიოთეკის პანელზე held-Enter-ის ოჯახის ბოლო ღია ადგილი და ხმას ცვლის, ამიტომ footer-ის 16 px ზოლს წინ უსწრებს. რეგრესიის რაუნდი ჯერ არ დამდგარა (2026-10-21 → 2026-10-23, 2 დღე); შემდეგი B-ის დაგეგმვა 2026-10-24-ზე ან შემდეგ რეგრესიის რაუნდია.
- **R3 — ყველაზე მცირე პატიოსანი გადაწყვეტა:** ერთი დაჭერა = ერთი გადართვა (SRW-12 R12-L2-ის და waveform-ის handler-ის წესი). ღილაკზე `Enter && event.repeat` → `preventDefault`, `stopPropagation`-ის გარეშე; დაჭერილი Enter-ის შემდეგ preview ჟღერს. უარყოფილია: guard `startLibraryPreview`/`stopLibraryPreview`-ში (frozen context, mouse-ს ვერ არჩევს), debounce (სწრაფ მეორე დაჭერას ბლოკავს), საერთო helper (frozen ფაილები, root-ის checkpoint ჯერ).
- **R4 — ნებართვები:** `ArrangementLibraryPreview.tsx` l.281–303 (მხოლოდ toggle-ის ელემენტი); `library-preview.test.tsx` — მხოლოდ დამატება ბოლო `it`-ის შემდეგ (HT1–HT3), harness-ის ახალი ასლის ნაცვლად (ARCH-R93-TEST-HARNESS); doc 087 l.4; ახალი doc 088. `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementExportDialog.tsx`, `ArrangementTransport.tsx` frozen. Baseline `e2412db`, frozen 531, მოსალოდნელი 3 M + 1 ??.
- **R5 — C:** HOLD-TOGGLE ორივე viewport-ზე (4 keydown, რომ საბოლოო მდგომარეობა განასხვავებდეს: 1 click, label ერთხელ იცვლება, RMS > 0), FRESH-TOGGLE, WAVE-REG, HOLD-PLUS-REG, HOLD-ROW-REG, EXPORT-REG, PX-NET, REG-HYD, G100-3 (ცალკე, C-R99-N1), AN-REVIEW, T100-TARGETED, SOURCE-UNCHANGED. Ableton — დაუდასტურებელი, პრეტენზია არ არის.
- **სიგნალები:** gate 99-ის Architecture note (Signal 3, keep): repeat-Enter-ის guard round 100-ის შემდეგ 6 ადგილზეა; მცირე საერთო helper-ის წინადადება. A-ს reviewer-ი: harness-ის ~60-ე ასლი. checkpoint-ის მოთხოვნის დამატება (l): root-ს SRW-12-ის held-Enter ოჯახის საზღვარზე ერთი შეზღუდული read-only checkpoint ეთხოვა (g)/(k)/(l)-ზე. არ ბლოკავს.
- **შემდეგ:** რეგრესიის რაუნდი → Export footer-ის Low-ები (GATE89-S4 + A-R88 #4 + GATE97-S4, GATE89-S6) → GATE89-S3, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER → GATE96-S2 → grid/tempo Low-ები → R21-I2 → T12 → VISUAL-A-OBSIDIAN. SRW-21-PREMOUNT და mount — auth-ის მფლობელის ნებართვის შემდეგ. ფარგლები არ მცირდება.

'''
t=t.replace(anchor,new+anchor,1)
open(P,'w',encoding='utf-8').write(t)
print('ok')
