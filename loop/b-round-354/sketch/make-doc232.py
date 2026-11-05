import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:90]
    s = s.replace(old, new)
rep("ეტაპი video-trim-fade-cost-2 — video trim/fade row-ები assert-ზე)\n",
    "ეტაპი video-trim-fade-cost-2 — video trim/fade row-ები assert-ზე, ეტაპი dp-test-polish — DP69/DP70/DP72-ის გამკაცრება)\n")
rep("video-trim-fade-cost-1, video-trim-fade-cost-2; C round 354 PASS)",
    "video-trim-fade-cost-1, video-trim-fade-cost-2, dp-test-polish; C round 355 PASS)")
rep("### განხილული ალტერნატივები\n",
"""### ეტაპი dp-test-polish: DP69, DP70 და DP72 ვეღარ გაივლის ცარიელად (round 355, D-29z1142)

109. **რატომ.** code-reviewer-მა (A rounds 350 და 352) და gate 352-ის review-მ ოთხი Low იპოვა (SYS-R353-DP-TEST-POLISH, D-29z1132): A-R350-REVIEW-TEST-NITS, A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE და A-R352-REVIEW-WINDOW-PRECONDITION. ყველა ერთ ფაილს ეხება, `drag-preview-render.test.tsx`-ს; app-ის კოდი არ იცვლება.
110. **ცვლილებები (B-ის `b-round-354/sketch/test.patch.txt`, უცვლელად).**
    - **DP69:** `writtenValues` ზედმეტი იყო (ძველი მნიშვნელობები და საბოლოო მნიშვნელობა უკვე ფარავდა). მის ნაცვლად release-ის შემდეგ `MutationObserver`-ის ჩანაწერები 0-ია: release overlay-ზე არაფერს წერს. ეს უფრო მკაცრია — A-M5 (overlay-ის თანაბარი მნიშვნელობის skip წაშლილი) ახლა DP69-საც აწითლებს. სათაური შესაბამისად შეიცვალა.
    - **DP70:** ამ fixture-ში video source რეგისტრირებული არ არის, ამიტომ caption ყველა მდგომარეობაში ცარიელია, ხოლო fade-ის commit gap-ს არ ცვლის — ორივე check ვერ ჩავარდებოდა. caption-ის check წაიშალა (caption-ს DP64 იცავს, `film.mp4`); gap-ის check-ის ნაცვლად fade-ის შემდეგ committed trimStart-ია (start 2.5, playhead 2 s ღიაა): gap ჩნდება და overlay `1.000`-ია, Undo gap-ს აქრობს და faded-ს აბრუნებს, მეორე Undo → `1.000`, Redo → faded და gap არაა, მეორე Redo → gap და `1.000`; ყოველ ნაბიჯზე preview `null`-ია.
    - **DP72:** (ა) drag-ის მანძილი: `shownStart − imported.start > 0.01` (seek-ის სიზუსტე 3 ციფრია); (ბ) committed start `toBe(shownStart)`, seek-ების რაოდენობის check-ამდე, რომ commit-ის შეცდომა commit-ის შეცდომად გამოჩნდეს; (გ) 20 ms-იანი რეალური ლოდინის ნაცვლად `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })` release-მდე, `act`-ში `vi.runAllTimersAsync()` და `finally`-ში `vi.useRealTimers()`.
    - `'Video Fade In'`-ის literal რჩება (DP13, DP67, DP70): `VIDEO_FADE_LABELS` `ArrangementClip.tsx`-ში export-ირებული არ არის, export კი app-ის კოდის ცვლილებაა.
111. **დაფარვის საზღვარი (A-R352-REVIEW-WINDOW-PRECONDITION).** DP72-ის „release-ის შემდეგ ჩანაწერი არ არის“ ფარავს microtask-ებს და `setTimeout`-ით ნებისმიერი დაყოვნებით დაგეგმილ ჩანაწერს. არ ფარავს: `requestAnimationFrame`-ით დაგეგმილს (ფაილში ის stub-ია, `() => 1`, ამიტომ playing-ის გზაც არ სრულდება), `setTimeout`-ის იმ reference-ს, რომელიც მოდულმა ჩატვირთვისას შეინახა (`tech-lead`, TL-R355), და jsdom-ის `readyState` 0-ის მიღმა ქცევას. playing-ის გზას ბრაუზერის perf row-ები და C-ის video probe ამოწმებს.
112. **B-ის mutant-ები (scratch, `b-round-354/sketch/mutant-summary.txt`; sketch და HEAD-ის ტესტი ერთსა და იმავე app კოდზე).** M-B1-LATE (M-B1 + stopped seek 50 ms-იანი timer-ით) → sketch-ზე DP72 წითელია seek-ების რაოდენობაზე, HEAD-ზე მწვანე (20 ms ვერ ხედავდა); FX-SHORTDRAG (DP72-ის drag 0.3 px) → sketch-ზე წითელი მანძილის ხაზზე (0.008), HEAD-ზე მწვანე; M-B6 → DP72-ის პირველი წითელი ხაზი ახლა `toBe(shownStart)`-ია; A-M5 → sketch-ზე DP69 და DP71, HEAD-ზე მხოლოდ DP71; M-B9 (GapCaption მხოლოდ position-ს იწერს და memo მას არასოდეს ხელახლა არ ხატავს) → sketch-ზე DP70 წითელია trim-ის commit-ის შემდეგ gap-ის ხაზზე, HEAD-ზე DP70 მწვანე; M-B8 (gap mount-ზე იყინება) → sketch-ზე DP70 წითელი. M-B1, M-B3, M-B4 და M-B7-ის წითელი ტესტები უცვლელია. ტესტების რაოდენობა 74.

### განხილული ალტერნატივები
""")
rep("- ეტაპი video-trim-fade-cost-2 (round 354): `perf/budgets.interactions.json` (12 row, იხ. ეტაპი video-trim-fade-cost-2).\n",
    "- ეტაპი video-trim-fade-cost-2 (round 354): `perf/budgets.interactions.json` (12 row, იხ. ეტაპი video-trim-fade-cost-2).\n- ეტაპი dp-test-polish (round 355): `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (DP69, DP70, DP72; იხ. ეტაპი dp-test-polish).\n")
rep("DP69 (fade release: `MutationObserver` `attributeOldValue`-ით — არც ერთი ჩანაწერის ძველი ან ახალი მნიშვნელობა არ არის `1.000`, საბოლოო = release-მდე ნაჩვენები), DP70 (preview-ს გარეშე committed video fade: overlay faded, Undo → `1.000`, caption/gap committed მდგომარეობაში, Redo → faded)",
    "DP69 (fade release: `MutationObserver` `attributeOldValue`-ით — არც ერთი ძველი მნიშვნელობა არ არის `1.000`, release-ის შემდეგ 0 ჩანაწერი, საბოლოო = release-მდე ნანახი; round 355), DP70 (preview-ს გარეშე committed video fade და trimStart: overlay faded, trim → gap და `1.000`, Undo → gap არაა და faded, Undo → `1.000`, Redo → faded, Redo → gap; round 355)")
rep("release ახალ ჩანაწერს არ წერს (20 ms settle-ის შემდეგ ჩანაწერების რაოდენობა უცვლელია) და committed start = preview start;",
    "drag-ის მანძილი > 0.01 s; committed start ზუსტად = preview start; release ახალ ჩანაწერს არ წერს (fake `setTimeout`-ის სრული გასუფთავების შემდეგ ჩანაწერების რაოდენობა უცვლელია, round 355);")
rep("- video-trim-fade-cost-2 (round 354): 12 video row assert-ზე. შემდეგი რიგი: PERF-CAND-MASTER-GROUP-FADER-PROPS →",
    "- ~~video-trim-fade-cost-2 (round 354)~~: დასრულდა; C round 354 PASS (D-29z1140); 12 video row assert-ზე.\n- dp-test-polish (round 355): DP69/DP70/DP72 გამკაცრდა. შემდეგი რიგი (D-29z1144): PERF-CAND-VIDEO-MOVE-BUDGET (budgets-only, GATE354-S1-ის ჩათვლით) → PERF-CAND-MASTER-GROUP-FADER-PROPS →")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
