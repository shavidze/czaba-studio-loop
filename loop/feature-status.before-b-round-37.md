# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-13 · ავტორი: B (round 36 → round 37 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება `tmp/studio-real-loop/`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში:**
- **C-R23-01 ისევ ღიაა.** `/studio-lab`-ის SSR HTML-ში 2 NUL byte-ია (28013/28014; round 32: 63 520 byte). გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.
- **C-R27-01 (Medium)** quiet Chrome-ს ელოდება (D-29t), C-R6-02/C-R8-01-თან ერთად.
- **საინფორმაციო კითხვა TL-Q-FB05-FB11 (არ ბლოკავს):** `2.mp4` 03:08–03:17-ში მთავარ mixer-ზე ნათქვამია „პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება“. B scope-ს არ ამცირებს: ტრეკის Pan (FB-05, `1.mp4` 03:39) უკვე გაკეთდა, Tempo-ს ბადე (FB-11) რჩება, თუ Tech Lead სხვას არ იტყვის.
- **R31-T:** Pan რეალური მაუსით და ყურსასმენით; ასევე — რეალურ Chrome-ში range აგრძელებს თუ არა `input`-ს focus-ის დაკარგვის შემდეგ, როცა ღილაკი დაჭერილია.
- **R33-T:** რეალური მაუსით: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება.
- **R35-T (ახლა შესამოწმებელია — Round 36 C PASS):** რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume-ზე, Pan-ზე ან Master-ზე click → SFX-ზე +3.0 dB რჩება, ისტორიაში `Clip Gain`, შემდეგ fader-ის ჩანაწერი (Pan-ის ცენტრზე click Pan-ის ჩანაწერს არ წერს). სურვილისამებრ Round 37-ის შემდეგ: touch მოწყობილობაზე ორი თითით C-R36-01.
- **R34-T:** რეალური მაუსით: (1) ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნის ტექსტი უცვლელია; (2) Clip Gain-ში მნიშვნელობა Enter-ის გარეშე → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება (ერთი `Clip Gain` ჩანაწერი); (3) ძებნაში focus-ით timeline-ის scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის — Chrome-შიც და Firefox-ში overlay scrollbar-ებით. headless 10 px gutter-ს იტოვებს, მაგრამ scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს, ამიტომ (3)-ს მხოლოდ რეალური scrollbar ამტკიცებს.

**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX `Soft impact` full scale-ს აღწევს (DEMO-SFX-FULL-SCALE): (a) ნორმალიზების grant ან (b) მიღება.

**⚠ Root:**
- **Round 31 + 32 + 33 + 34 + 36 (იგივე 9 ხაზი) C-მ შეამოწმა და root-ის checkpoint commit-ისთვის მზადაა** (C round 36 PASS; B-მ gate-ები თავიდან გაუშვა: `b-round-36/gates.txt` — 376 OK, tsc 0, vitest 69/1259, build ✓). Root თავად უშვებს check/typecheck/tests/build-ს, review-ს და `npm run test:e2e:smoke`-ს (A/C სერვერს ვერ უშვებს). **Round 37 მეექვსედ ეხება `fader-guards.test.tsx`-სა და doc 036-ს** და ახლა `ArrangementDetailPanel.tsx`-საც: commit A-ს დაწყებამდე ან C-ის round-37 PASS-ის შემდეგ, არა რაუნდის შუაში. შუალედური commit release არ არის.
- `08b9e53` და `1cefea1` დაკომიტებულია. მეორე remote-ის საკითხი მოგვარებულია: B-ის `git ls-remote` (2026-10-13) — ორივე remote-ის `master` = `1cefea1` (`publication-checkpoint.json` `oct13Checkpoint`).
- Merge-ით შემოსული `app/lib/auth.ts` და `auth-bugs.test.ts` working copy-ში CRLF-ია: Biome 2 format error.
- Tracked `frontend-architect.md` Write/Bash-ს იძლევა.
- Dev server B-ის დაგეგმვისას (17:49) მუშაობდა (200); B-ის gate-ებისას `node.exe` 7 → 7.

მიმდინარე რაუნდი: **Round 37** (`current-task.md`, D-29z2) — C-ის ბაგი პირველ რიგში:
- **C-R36-01 (Medium, არსებული ქცევა — `c-round-36/runs/ot.txt` OT-5b):** Clip Gain-ში `3` Enter-ის გარეშე → სხვა pointer-ის gesture აქტიურია → Master-ზე რეალური click → focus გადადის, `commitClipGain('blur')` blocked status-ს წერს და ტექსტს `0.0`-ზე აბრუნებს. მხოლოდ ორი ერთდროული pointer-ით მიიღწევა, მაგრამ მომხმარებლის შეყვანას შლის.
- **გადაწყვეტა (Locus A):** `ArrangementDetailPanel.tsx`-ში gesture-ის შტო blur-ზე ტექსტს აღარ აბრუნებს (status და „ჩანაწერი არ არის“ უცვლელია); Enter gesture-ის დროს უცვლელია. gesture-ის შემდეგ Enter ან blur ჩაწერს. შეზღუდვა: ჩაწერამდე სხვა კლიპის მონიშვნა ტექსტს უკუაგდებს (D-29u-ს არსებული წესი).
- **იმავე რაუნდში:** round-36 ტესტის nits (case 7 status, case 8 `start.value`) და doc 036-ის მოძველებული წინადადება.
- **C:** R37-PG (OT-5b-ის harness: PG-1 Enter, PG-2 blur, PG-3 შეზღუდვა, 1280), R37-MN, R37-CR, R37-K, S, U (mutation a–e), Doc, G37-1..3. `StudioWorkspace.tsx` ახლა frozen-ია.

შემდეგ: Round 38 — SRW-13 ეტაპი 4b (4b-1: click-ზე არ ხტება + double-click reset; 4b-2: დანარჩენი 4b ბაგები, მაქს. სამი თითო რაუნდში); შემდეგ 4c + polish.

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 37 -StartPhase A`.

**Round 36-ის შედეგი** (A `a-round-36.md`, C `c-round-36.md`): **C PASS — ყველა ID.**
- **PASS:** G36-1..3 (vitest 1259/1259, 376 OK, protected 4/4, ანონიმური `/studio-lab`, studio-token 401, `/studio/middle-east` → Sign in required); R36-CR (Volume, Pan-ის ცენტრი, Master, ვიდეოს Volume, Zoom + ორი Undo + 1280); R36-OT (7 სტრიქონი); R36-CL (3/3 ვალიდური, 2 `setTargetAtTime` ფანჯარაში, 0 restart); R36-R34; R36-K; R36-S; R36-U (mutation a–f მოკლულია); R36-Doc.
- **დაიხურა:** C-R34-01, C-R34-02.
- **ახალი:** C-R36-01 (Medium, არსებული, = A-R36-REVIEW-1); A-R36-TEST-NITS (Low); DOC036-R36-REVIEW-SENTENCE (Low). stale refusal status ისევ ჩანს (→ 4b).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-36/gates.txt`): HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4, tsc 0, vitest 69/1259, build ✓, Biome 2 CRLF error + 218 warning + 1 info.

**Round 35-ის შედეგი** (A `a-round-35.md`, C `c-round-35.md`): **A გაჩერდა §1.4-ზე, `store/` უცვლელია; C — BLOCKED.**
- A-მ იპოვა frozen ტესტი, რომელიც ძებნის focus-ის შენარჩუნებას ელოდება Pan-ზე დაჭერისას; C-მ საკუთარ scratch-ში დაადასტურა (1 failed | 776 passed, მხოლოდ l.1265).
- **PASS:** G35-2 (HEAD `1cefea1`, 9 ხაზი, 376 OK, protected 4/4), G35-3 (ანონიმური `/studio-lab` header-იდან და პირდაპირ; token/recording/download/R2 მოთხოვნა არ არის; Authorization 0 drag-ის დროსაც; `/studio/middle-east` → Sign in required).
- **არ გაშვებულა** (ცვლილება არ იყო): R35-OT, CL, R34, K, S, U, Doc. G35-1 — baseline მწვანეა (1247/1247), მაგრამ ახალი ტესტები არ არის.
- **სტატუსები:** არაფერი გადავიდა „მზადაა“-ში. C-R23-01: 2 NUL 28013/28014 (63 520 byte, უცვლელი).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-35/gates.txt`): ხე უცვლელია, tsc 0, vitest 69/1247, build ✓, Biome 2 CRLF error + 218 warning + 1 info.
**Round 34-ის შედეგი** (C, `c-round-34.md`): **PASS** — ყველა ID.
- **PASS:** G34-1..3 (vitest 1247/1247, 376 OK, protected 4/4, ანონიმური `/studio-lab`); R34-TS (ძებნა → header/lane/clip body/ruler, Delete და Backspace, ძებნის ტექსტი უცვლელი; 1280); R34-CG (CG-1..5, unchanged contract, CG-6 ცოცხალი: 2 `setTargetAtTime` ფანჯარაში — მიმდინარე + დაგეგმილი source, 1 გარეთ, 0 restart); R34-SB (gutter synthetic, ცარიელი ადგილი რეალური click-ით); R34-R33; R34-K; R34-S; R34-U (mutation a–g მოკლულია); R34-Doc.
- **დაიხურა:** FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR (რეალური scrollbar — Tech Lead-ის R34-T).
- **ახალი:** C-R34-01 (Medium), C-R34-02 (Low, doc), A-R34-REVIEW-RESIDUALS (Low: RTL, overlay scrollbar, მარჯვენა ღილაკი).
- **Ableton:** სამივე ქცევა დაუდასტურებელია (§18.1 focus-ზე და value box-ის commit-ზე არაფერს ამბობს).
- **B-მ დამოუკიდებლად შეამოწმა** (2026-10-13, `b-round-34/gates.txt`): 376 OK, protected 4/4, tsc 0, vitest 69/1247, build ✓, Biome 2 CRLF error + 218 warning + 1 info. Frozen სია: `b-round-34-tree-sha256.txt` (376).
## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი ID PASS-ია, Round 28–29; C-R28-01/02 დაიხურა. R29-NE და არანულოვანი no-op UI-დან მიუღწეველია — მხოლოდ provider ტესტები) | Cut/Copy/Paste/Cut Time: `c-round-5.md` (R9-C1..C4), `c-round-20.md` §2.12; SRW-24: `c-round-28.md` §1–§5, `c-round-29.md` §1–§8. მოთხოვნა: `docs/technical/studio-real-workspace/delete-selection-update.md` | Tech Lead: R28-T. DOC034-UNREACHABLE-NOTE |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე); milestone run 1: `c-round-20.md` §2.10–§2.11 (R8-M3, R8-M4) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **ბაგია** (C-ის round-30, 34 და 36 ID-ები PASS-ია; C-R34-01 დაიხურა Round 36-ში. ღიაა C-R36-01, Medium — სხვა pointer-ის gesture-ის დროს იძულებითი blur აკრეფილ ტექსტს შლის, მხოლოდ multi-pointer) | `c-round-30.md` §1–§9; `c-round-34.md` R34-CG; `c-round-36.md` R36-CR/CL; ბაგი: `c-round-36/runs/ot.txt` OT-5b | Round 37: C-R36-01 (D-29z2). შემდეგ Tech Lead: R30-T, R34-T, R35-T. T12.7/8/9/19 — T12-ის რიგში. DOC035-NOTES — polish |
| FB-05 | Pan | **მოწმდება** (C-ის ყველა round-31 ID PASS-ია; C-R31-01, C-R31-02 და C-R32-01 დაიხურა Round 32–33-ში. A-R32-REVIEW-1 review-ის Low-ია — C-მ აჩვენა, რომ რეალური მაუსი მას ხსნის — და 4b-შია double-click reset-თან ერთად) | `c-round-31.md` §1–§7 (R31-PE 50L R 0 LSB, PE2, PV, PL, PH, PG, PD, PUI, PC); `c-round-32.md` (R32-BC); `c-round-33.md` (R33-FT, R33-G) | Tech Lead: R31-T, R33-T. double-click reset და A-R32-REVIEW-1 — ეტაპი 4b (Round 37) |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია**. ღიაა C-R8-01 (Medium, Tech Lead quiet Chrome). SRW-11B end to end milestone run 2-ში PASS-ია; A-ს round-11-ის ყველა follow-up დახურულია (round 23 + round 24 C PASS) | ეტაპები 1–3 და polish: `c-round-8.md`, `c-round-9.md`, `c-round-11.md`, `c-round-13.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; a11y: `c-round-23.md` §2.1–§2.4, `c-round-24.md` §3–§5 | C-R8-01: Tech Lead quiet Chrome. round-9 M1/L8 → SRW-13 ეტაპი 4. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მოწმდება** (C-ის ყველა ID PASS-ია: Master Volume/Mute, export-ის გადატვირთვის გაფრთხილება, ცოცხალი meter და latch-იანი Clip; დარჩა მხოლოდ Tech Lead-ის R25-T/R26-T) | ეტაპი 1: `c-round-25.md` §3–§8 (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L); ეტაპი 2a: `c-round-26.md` §3–§12 (R26-ML/MP/C0/C6/CR/CM/RB/X/E) | Tech Lead: R25-T, R26-T. ტრეკების meter-ები (SRW-13 ეტაპი 2b) ცალკეა |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md`, `c-round-4.md`, `c-round-6.md`, `c-round-7.md`, `c-round-10.md` §4, `c-round-12.md` §3, `c-round-13.md` §4, `c-round-14.md`; milestone run 2: `c-round-21.md` §2.1 (R2-V1) | Tech Lead: MP4/MOV-ის დადებითი გზა რეალურ Chrome-ში |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (მხოლოდ C-R6-02 — Tech Lead; C-R21-01 დაიხურა Round 22-ში) | `c-round-7.md` §2; `c-round-9.md`; `c-round-12.md` §2.1; `c-round-13.md` §2.5, §3; `c-round-21.md` §2.2–§2.5; mute: `c-round-22.md` §2.1–§2.6 (R22-M1/M2/V/A1..A3 PASS) | C-R6-02: Tech Lead quiet Chrome (RF7-2/RF7-3). R22-T: click ყურით |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე, round 26-ში 4, ერთი ხილულ ტექსტში) | `c-round-1.md` (24/24); `c-round-10.md` §5–6; `c-round-13.md` §4–§5; `c-round-14.md`; `c-round-16.md`–`c-round-20.md` (G-3, WAV 18.000 წმ); `c-round-21.md` §1, §2.8; `c-round-23.md` §2.5–§2.6 (G23-3, WAV 864 000 frame); ბაგი: `c-round-23.md` §3 | C-R23-01: Tech Lead-ის არჩევანი (React 19 ან `entry.server.tsx`-ის grant), შემდეგ ცალკე რაუნდი SSR-ის ფართო რეგრესიით |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md`; `c-round-21.md` §2.1 (R2-V1) | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (მხოლოდ C-R6-02) | `c-round-7.md` §2; `c-round-9.md`; `c-round-10.md`; `c-round-12.md`; `c-round-13.md`; `c-round-21.md` §2.2–§2.5; `c-round-22.md` §2 (mute, C-R21-01 დაიხურა) | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. R22-T |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** | `c-round-10.md` §4; `c-round-12.md` §2.1, §3; `c-round-13.md` §3; `c-round-21.md` §2.4 (R5-L3 seam 0, R5-E1 maxDiff 0) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md`; `c-round-20.md` §2.5 | — |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.6–§2.9 | — |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md`; `c-round-20.md` §2.10–§2.11 | — |
| SRW-09 | Clipboard (FB-02) | **მოწმდება** (C-R28-01 დაიხურა Round 29-ში: ყველა ხაზის clipboard ორიგინალ ხაზებზე, D-25 ერთხაზიან/კლიპების clipboard-ზე) | `c-round-5.md`; `c-round-20.md` §2.12; `c-round-28.md` §3, §11; `c-round-29.md` §3 | Tech Lead: R28-T. Round 30-ში clipboard gain-ს ატარებს (R30-GN) |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3; `c-round-13.md` §2.2 | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; `c-round-6.md`; `c-round-13.md` §2.4; `c-round-14.md`, `c-round-16.md`, `c-round-17.md`; `c-round-20.md` §2.15 | — |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (C-ის ყველა ID PASS-ია, მათ შორის end to end და follow-up-ების ორივე ნაწილი; ღიაა C-R8-01, Medium) | ეტაპები 1–3, polish: `c-round-8.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; follow-up-ები: `c-round-23.md`, `c-round-24.md`; D-29..D-29o (`plan.md`) | C-R8-01: Tech Lead quiet Chrome. round-9 M1/L8: SRW-13 ეტაპი 4. Doc 029 TODO: დაკეცილი ხაზის clip-ები accessibility tree-ში (SRW-17) |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მოწმდება** (FOCUS-TEXT-STALE დაიხურა Round 34-ში — C R34-TS; ფუნქციები C-ით დადასტურებულია; დარჩა Tech Lead-ის ხელით შემოწმება) | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17; `c-round-34.md` R34-TS | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Windows-ის ფონტები. R34-T(1)/(3) |
| SRW-13 | Clip gain, pan, master, meters | **ბაგია** (ეტაპები 1, 2a, 3, 4a-fix2, 4a-fix3, 4a-fix4 მზადაა; 2b და 4a — ყველა ID PASS-ია; ღიაა C-R27-01 (Medium, Tech Lead) და C-R36-01 (Medium) → Round 37) | ეტაპი 1: `c-round-25.md`; 2a: `c-round-26.md`; 2b: `c-round-27.md`, `c-round-28.md` §6; 3: `c-round-30.md`; 4a: `c-round-31.md`; 4a-fix: `c-round-32.md`; 4a-fix2: `c-round-33.md`; 4a-fix3: `c-round-34.md`; 4a-fix4: `c-round-36.md` | Round 37: C-R36-01 (D-29z2). Round 38 — 4b-1: click-ზე არ ხტება + double-click reset; 4b-2: FADER-KEY-ENTRIES, A-R29-REVIEW-1, pending რიგი, stale status, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, Master-ის hold tick. შემდეგ 4c: round-9 M1/L8. C-R27-01: Tech Lead |
| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | SRW-14-ის შემდეგ |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | SRW-15-ის შემდეგ |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | SRW-18-ის შემდეგ |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-13.md` §5; `c-round-14.md`–`c-round-18.md`; `c-round-21.md` §1 (G21-3, header-ის ბმული) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS) | Tech Lead: რეალური Windows Chrome |
| SRW-24 | წაშლა სიცარიელით, Ctrl+Shift+L ყველა ხაზზე, Ctrl+Shift+X ერთადერთი ripple (მომხმარებელი, 2026-10-11) | **მოწმდება** (C-ის ყველა UI-დან მიღწევადი R28/R29 ID PASS-ია; fader → კლიპი → Delete Round 33-ში PASS; ძებნა → კლიპი → Delete/Backspace Round 34-ში PASS — R34-TS) | `delete-selection-update.md`; `c-round-28.md` §1–§9; `c-round-29.md`; `c-round-33.md` R33-FT; `c-round-34.md` R34-TS; `tasks/round-28.md`, `tasks/round-29.md` | Tech Lead: R28-T, R34-T(1). DOC034-UNREACHABLE-NOTE |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| **C-R27-01** | Medium | **ბაგია** (round 28, r26 layout: vm-3 125.4 off-procedure, vm-4 19.0, vm-5 287.6 ms; hardSeek 0 ყველგან; row 3) | `c-round-27.md` §7; `c-round-28.md` §6; `c-round-28/runs/vm-*.txt` | Tech Lead quiet Chrome (C-R6-02/C-R8-01-თან ერთად). A-ს რაუნდი არ ინიშნება მექანიზმის ჰიპოთეზის გარეშე (D-29t) |
| C-R27-02 | Low | **დაიხურა** (Round 29: round-27-ის 8 ფაილიანი batch 152/152 ×3, `node.exe` 10 < 30 — D-29t-ის წესი) | `c-round-29/gates/vitest-r27batch-1..3.txt` | — |
| C-R28-01 | Low | **დაიხურა** (Round 29: R29-PA/PB/PC/PD; mutation a–c) | `c-round-29.md` §3 | — |
| C-R28-02 | Low | **დაიხურა** (Round 29: R29-NO zero-width გაჩერებული და დაკვრისას; არანულოვანი — მხოლოდ provider ტესტი) | `c-round-29.md` §4 | — |
| A-R28-REVIEW-4 | Low | **დაიხურა** (Round 29: R29-FT, geometry = round 28) | `c-round-29.md` §4 | — |
| A-R29-REVIEW-1 | Low | **არ დაწყებულა** (არსებული ქცევა; ბრაუზერში არ შემოწმებულა) | `a-round-29.md` §4 finding 1; `c-round-29.md` §9 | pending Volume/Master preview `applyEdit`-ში ცალკე ჩანაწერად იწერება, ამიტომ no-op Cut Time-ის შემდეგ undo label fader-ს აჩვენებს → SRW-13 ეტაპი 4b |
| C-R31-02 | Medium | **დაიხურა** (Round 33: C-R32-01-თან ერთად — რეალური click-ების მატრიცა შლის, round-32-ის must-not 5/5) | `c-round-33.md` R33-FT | — |
| C-R31-01 | Low | **დაიხურა** (Round 32: R32-BC PASS) | `c-round-32/runs/bc-*.txt` | — |
| R31-U-GAP-B2 | Low (ტესტის ხარვეზი) | **დაიხურა — მიღებულია დამცავ კოდად** (Round 32: A-ს ჩამონათვალმა reachable გზა ვერ იპოვა; C-ის b2 გადარჩა, როგორც მოსალოდნელი იყო) | `a-round-32.md` §1.4; `c-round-32.md` R32-U | — |
| A-R31-REVIEW-2 | Low | **არ დაწყებულა** | `a-round-31.md` §4 finding 2 | lane-ის draft gate გლობალურ `isPointerGestureActive()`-ს იყენებს (მხოლოდ ვიზუალური) → ეტაპი 4b (Round 37) |
| C-R32-01 | Medium | **დაიხურა** (Round 33: R33-FT PASS — 5 fader × 4 სამიზნე, Delete და Backspace) | `c-round-33/runs/ft-matrix.txt`, `ft-clipbody-ruler.txt`, `dk-retention-rerun.txt` | — |
| A-R32-REVIEW-1 | Low | **არ დაწყებულა** | `a-round-32.md` §4 finding 1; `c-round-32/runs/bc-pid1-realclick.txt` | Pan-ის blur suppression შეიძლება დარჩეს, თუ ღილაკი ფანჯრის გარეთ აუშვეს; რეალური მაუსის click მას ხსნის (C) → ეტაპი 4b (Round 37) |
| FOCUS-TEXT-STALE | Medium | **დაიხურა** (Round 34: R34-TS — ძებნა → 4 სამიზნე, Delete და Backspace, ძებნის ტექსტი უცვლელი; 1280; must-not) | `c-round-34/runs/ts-1440.txt`, `ts-1280.txt`, `ts-mustnot.txt` | — |
| CLIP-GAIN-CLICK-DISCARD | Medium | **დაიხურა** (Round 34: R34-CG — კლიპის/lane-ის სამიზნეები; range სამიზნე → C-R34-01) | `c-round-34/runs/cg-1to4.txt`, `cg5.txt`, `cg-unchanged.txt`, `cg6-1..4.txt` | — |
| A-R33-REVIEW-SCROLLBAR | Low | **დაიხურა კოდისთვის** (Round 34: gutter synthetic, ცარიელი ადგილი რეალური click-ით, mutation b/c/g მოკლულია) | `c-round-34/runs/sb-*.txt` | რეალური scrollbar — Tech Lead-ის R34-T(3), Firefox-ის overlay ვარიანტით |
| A-R33-REVIEW-TOUCH | Low | **არ დაწყებულა** | `a-round-33.md` §4; `a-round-34.md` §4 R4 | touch scroll timeline-ზე fader-ს და (Round 34-იდან) ტექსტურ ველსაც ათავისუფლებს; pending preview / Clip Gain ადრე იწერება (მონაცემი არ იკარგება) → ეტაპი 4b (Round 37) |
| C-R34-01 | Medium | **დაიხურა** (Round 36: R36-CR 5/5 + ორი Undo + 1280, R36-CL 3/3, mutation a–f) | `c-round-36/runs/cr-1440.txt`, `cr-1280.txt`, `cl.txt` | — |
| C-R34-02 | Low | **დაიხურა** (Round 36: R36-Doc) | `c-round-36/gates/snap-036.diff` | — |
| **C-R36-01** | Medium | **ბაგია** (არსებული; Round 37-ში იგზავნება, D-29z2) | `c-round-36/runs/ot.txt` OT-5b; `c-round-36.json` bugs[0]; `a-round-36.md` §4 | სხვა pointer-ის gesture-ის დროს Master-ზე/range-ზე დაჭერა focus-ს იღებს → Clip Gain-ის აკრეფილი ტექსტი `0.0`-ზე ბრუნდება. Fix: blur-ზე ტექსტი რჩება, Enter უცვლელია |
| A-R36-TEST-NITS | Low | **არ დაწყებულა** → Round 37 | `a-round-36.md` §4 | case 7 status, case 8 `start.value`; l.1272 ზედმეტია, მაგრამ D-29z1-ის ბაიტებით რჩება |
| DOC036-R36-REVIEW-SENTENCE | Low | **არ დაწყებულა** → Round 37 | `c-round-36.md` §9 | doc 036: „ბრაუზერში არ შემოწმებულა“ → C-მ გაიმეორა (C-R36-01) |
| DOC015-DELETE-GAP-NOTE | Low | **არ დაწყებულა** | `checkpoint-oct13-review.md` #1 | doc 015-მა Delete-ის სიცარიელე (SRW-24) უნდა ახსენოს → საბოლოო docs pass |
| EXPORT-DIALOG-FOCUS-RESTORE | Low | **არ დაწყებულა** | `checkpoint-oct13-review.md` #6 | export dialog-ის focus-ის დაბრუნება და hidden ელემენტები → polish |
| A-R34-REVIEW-RESIDUALS | Low | **არ დაწყებულა** | `a-round-34.md` §4 R2, R3, N | RTL-ის მარცხენა scrollbar, Firefox-ის overlay scrollbar (R34-T), მარჯვენა ღილაკი Clip Gain-ს commit-ს უკეთებს (native blur-ის ტოლი), `transform`/zoom → 4b (Round 37) ან საბოლოო რეგრესია |
| OUTSIDE-SCROLLER-DELETE | info | **მიღებულია** (D-29y 4) | `c-round-33/runs/rec-outside.txt` | ბიბლიოთეკის item-ზე click-ის შემდეგ Delete timeline-ის მონიშვნას შლის: ბიბლიოთეკას წაშლის მოქმედება არ აქვს |
| **C-R30-01** | Low | **არ დაწყებულა** (არსებული ქცევა; round 29-ის screenshot-შიც ჩანს) | `c-round-30.md` §10; `c-round-30/shots/gui-1280x720.png` | 1280×720-ზე, ღია detail panel-ით და ხილული range-ით, info სვეტის 5 ხაზს ~88 px სჭირდება, content კი 85 px-ია: სათაური და „ხაზი“ ერთმანეთს ეფარება. round 19-ის 1280-ის გაზომვა range-ის გარეშე იყო → polish რაუნდი 4c-ის შემდეგ |
| DOC035-NOTES | Low | **არ დაწყებულა** | `c-round-30.md` §8, §10 | doc 035-ის სცენარის status-ის სათაური, l.4 სტატუსი და A §6.2a-ის (keyboard, 2 ჩანაწერი) შენიშვნა → polish რაუნდი |
| FADER-KEY-ENTRIES | Low | **არ დაწყებულა** (არსებული ქცევა) | `c-round-30.md` §7 | Volume/Master fader-ზე თითო კლავიში = ერთი ჩანაწერი → ეტაპი 4b (Pan-იც შედის) |
| DOC034-UNREACHABLE-NOTE | Low | **არ დაწყებულა** | `c-round-29.md` §4, §6 | doc 034-მა უნდა თქვას, რომ არანულოვანი Cut Time no-op და „სიცარიელე შემდეგი კლიპით“ მხოლოდ კოდის გზებია → doc 034-ის მომდევნო მფლობელი რაუნდი ან საბოლოო docs pass |
| L3-REMOVED-TRACK-TAPS | Low | **არ დაწყებულა** | `a-round-27.md` §4 (L3); doc 033 | წაშლილი ხაზის tap/state არ იწმინდება (ხაზები დღეს ფიქსირებულია) → საბოლოო რეგრესიამდე |
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout |
| C-R8-01 | Medium | **ბაგია** (R9-D3 PASS; mode D info round 21: max .0183, LoAF 0) | `c-round-9.md` §2, §7; `c-round-21.md` §2.7 (მხოლოდ ინფორმაცია) | Tech Lead quiet Chrome, R3-V1 D layout. L2/L3 მასთან ერთად (D-29h) |
| **C-R23-01** | Medium | **ბაგია** (round 28: 2 NUL — 28013/28014; round 27-ის 58733/58734 footer-ის ტექსტის შეცვლით გაქრა — offset-ის გადაწევა, არა გამოსწორება) | `c-round-23.md` §3; `c-round-25.md` §12; `c-round-26.md` §16; `c-round-26/runs/c-r23-01-record.txt` | Tech Lead: (a) React 19 ან (b) `entry.server.tsx`-ის ვიწრო grant A-სთვის NUL-ის ფილტრისთვის (`b-round-23.md` §3). C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს |
| R9-REVIEWER-M1-L8 | Low | **არ დაწყებულა** | `a-round-9.md` l.227–237 | `ArrangementContext.tsx`: `transportRunningRef` latch და position-store-ის შეცდომის ტექსტი. SRW-13 ეტაპი 4c-ში (root M1/L8-ისგან განსხვავებულია, ისინი დახურულია) |
| R26-M1 | Low | **არ დაწყებულა** | `a-round-26.md` §4 (M1); `c-round-26.md` §17.5 | rAF-ზე მიბმული sampling-ი > 85 ms stall-ზე ან დამალულ tab-ში over-ს შეიძლება გამოტოვებს (C: max gap 28.8 ms). AudioWorklet module URL-ს საჭიროებს, `public/**` კი აკრძალულია → hardening SRW-13 ეტაპი 4-ის შემდეგ, ან Tech Lead-ის მიღება |
| DEMO-SFX-FULL-SCALE | Low | **დაბლოკილია** (Tech Lead-ის გადაწყვეტილება) | `c-round-26.md` §17.3 | `Soft impact` თავისთავად full scale-ს აღწევს (`+0.0` Clip, export 2 sample). (a) `lib/sfx-*`-ის grant ნორმალიზებისთვის ან (b) მიღება. პრედიკატი უცვლელია |
| MASTER-HOLD-TICK-EDGE | Low | **არ დაწყებულა** | `c-round-26.md` §9 | Master-ის hold tick ≥ +6 dBFS-ზე 1 px ჩანს → SRW-13 ეტაპი 4b |
| LIB-SEP-REASON | Low | **არ დაწყებულა** | B-მ წაიკითხა: `ArrangementLibrary.tsx:549` | `biome-ignore`-ის მიზეზი პროცესს ასახელებს; პირველ რაუნდში, რომელიც `ArrangementLibrary.tsx`-ს შეცვლის, ან საბოლოო რეგრესიამდე |

Critical/High ღია ბაგი არ არის.

**Round 36:** დაიხურა C-R34-01 და C-R34-02. ახალი: C-R36-01 (Medium, არსებული, multi-pointer), A-R36-TEST-NITS და DOC036-R36-REVIEW-SENTENCE (Low). checkpoint-oct13 review-ის Low-ები დახარისხდა (`b-round-36.md` §6): #1 → DOC015-DELETE-GAP-NOTE, #2 = L3, #3/#4 → 4c ან მიღება, #5 = 4b, #6 → EXPORT-DIALOG-FOCUS-RESTORE, #7 მიღებულია, #8 → C-R6-02/C-R8-01, #9 → root. C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 35:** A §1.4-ზე გაჩერდა (frozen ტესტი), `store/` უცვლელია; C BLOCKED; C-R34-01 ისევ მეორდება; G35-2/G35-3 PASS. C-R23-01: 2 NUL (უცვლელი).

**Round 34:** დაიხურა FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR. ახალი: C-R34-01 (Medium), C-R34-02 (Low), A-R34-REVIEW-RESIDUALS (Low). C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 33:** დაიხურა C-R32-01 და C-R31-02. ახალი: FOCUS-TEXT-STALE დადასტურდა (Medium), CLIP-GAIN-CLICK-DISCARD (Medium), A-R33-REVIEW-SCROLLBAR და A-R33-REVIEW-TOUCH (Low); OUTSIDE-SCROLLER-DELETE მიღებულია. C-R23-01: 2 NUL 28013/28014 (უცვლელი, 63 520 byte).

**Round 32:** დაიხურა C-R31-01, R31-U-GAP-B2 (მიღებულია), R24-HC-COVERAGE. C-R31-02 იზოლირებულად გასწორდა. ახალი: C-R32-01 (Medium), A-R32-REVIEW-1 (Low), FOCUS-TEXT-STALE (დაკვირვება). C-R23-01: 2 NUL 28013/28014 (უცვლელი).

**Round 31:** ბაგი არ დახურულა. ახალი: C-R31-02 (Medium, არსებული ქცევა — A-მ იპოვა, C-მ ბრაუზერში დაადასტურა), C-R31-01 (Low), R31-U-GAP-B2, A-R31-REVIEW-2. ინფორმაცია: refusal status drag-ის შემდეგაც ჩანს (→ 4b); 50L-ზე track meter-ის over-0 მოსალოდნელია (pre-Master). C-R23-01: 2 NUL 28013/28014 (უცვლელი).

**Round 30:** ბაგი არ დახურულა (რაუნდის scope-ში ახალი არ იყო). ახალი Low: C-R30-01 (არსებული ქცევა), DOC035-NOTES, FADER-KEY-ENTRIES. C-R23-01: 2 NUL 28013/28014 (უცვლელი).

**Round 29:** დაიხურა C-R28-01, C-R28-02, A-R28-REVIEW-4 და C-R27-02. ახალი Low: A-R29-REVIEW-1, DOC034-UNREACHABLE-NOTE. C-R23-01: 2 NUL 28013/28014 (უცვლელი). ინფორმაცია: C-ის პირველი არავალიდური mutation მცდელობისას `npx`-მა `vitest@5.0.4` npm cache-ში ჩამოტვირთა (store უცვლელია) → root-ის ჩანაწერი.

**Round 28:** ბაგი არ დახურულა. ახალია C-R28-01 და C-R28-02 (Low); A-R28 review finding 4 ბაგად ჩაიწერა (Low), finding 5 მიღებულია (Split ღილაკი enabled რჩება და click-ზე status-ით უარს ამბობს). ინფორმაცია: Ctrl+Shift+L-ის შემდეგ ცარიელ ადგილზე click-ზე status ძველია (ცნობილი pattern); ჭრის კიდეებზე fade არ არის → SRW-18. C-R23-01: 2 NUL.

**Round 27:** ბაგი არ დახურულა. ახალია C-R27-01 (Medium) და C-R27-02 (Low). C-R23-01: 4 NUL 28013/28014 და 58733/58734 — offset ისევ გადაინაცვლა, ეს გამოსწორება არ არის.

**Round 26:** ბაგი არ დახურულა და scope-ში ახალი არ არის. C-R23-01: 8 → 4 NUL (28013/28014, 44397/44398) — offset-ების გადაწევა, არა გამოსწორება. ახალი Low ჩანაწერები: R26-M1, DEMO-SFX-FULL-SCALE, MASTER-HOLD-TICK-EDGE.

**Round 25:** ბაგი არ დახურულა და scope-ში ახალი არ არის. C-R23-01 გაუარესდა: 4 → 8 NUL (3536/3537, 11728/11729, 26924/26925, 43308/43309), სამი ხილულ ტექსტში hydration-მდე.

**Round 24:** ბაგი არ დახურულა და ახალი არ არის. C-R23-01 უცვლელია (4 NUL, იგივე offset-ები).

**Round 23:** ბაგი არ დახურულა (ახალია C-R23-01).

**Round 22-ში დაიხურა:** C-R21-01 — mute-ის de-click (`c-round-22.md` §2.1–§2.2: −240 dBFS beep-ზე, რომელიც mute-იდან 60.7 ms-ში დაიწყო; ramp 2.9 dB/ms).

**Round 21-ში დაიხურა:** C-R12-01. Decision table-ის მე-2 სტრიქონით: ყველა pre-arm ჩაწერა |d_dock| > 0.02-ზე იყო (min 0.020129, ზღვარი 0.13 ms; `c-round-21.md` §2.5). ცხრილი წესად რჩება ყოველი მომავალი RF5-3-ისთვის.

**ადრე დაიხურა:** C-R18-01 (Round 19); C-R16-01, M-R10-1/M2 (Round 17); C-R11-01..03, C-R15-02/03 (Round 16); C-R14-01/02 (Round 15); C-R13-01..03 (Round 14); C-R7-01 headless (Round 12; Tech Lead RF7-3 რჩება); C-R7-02 (Round 10).

**მიღებული (კოდი არ იცვლება):** იხ. `feature-status.before-b-round-21.md` §3 (D-29g..D-29j-ის deviation-ები, C-R15-01, C-R11-04, `export-clip-onset-1lsb`, round-12 reviewer Low 1 და სხვ.). სია უცვლელია.

**ჩანაწერები (ბაგი არ არის):**
- C round 21: R11-P3-ის body rect round 15-ის შემდეგ შეიცვალა (1440-ზე body.b 664, round 15-ში 684). D-29f-ის ფორმულა ორაკულია და Δ ≤ 0.02-ით დაემთხვა.
- C round 21: Escape ჯგუფის მონიშვნას არ ხსნის (deselect = click ცარიელ ადგილას). ეს კონტრაქტის ნაწილია.
- C round 21: 1280-ზე detail panel persisted-ად დაკეცილი იტვირთება, cap 142.
- D-29g residual; harness-ის წესი H3; `sfx-library` flake (round 12–21-ში არ განმეორდა); hard seek 8.44–8.48 წმ-ზე Pause-ის snap-ია.
- Lane-ის overlay `/60` (SRW-14/SRW-18).
- `ArrangementLane.tsx:661`-ის მიზეზის ტექსტი → Round 23-ში გასწორდა (C R23-S PASS).
- C round 23: tight video ხაზზე სახელის ღილაკის top = header-ის top (inset 0) — inset ring-ით უსაფრთხოა.
- `entry.server.tsx` `Content-Type: text/html`-ს charset-ის გარეშე აგზავნის — დაკვირვება, C-R23-01-ის Tech Lead-ის კითხვის ნაწილი.
- C round 22: demo ცარიელი arrangement-ით იტვირთება; export-ის 864 000-იანი reference `lay11`-ს ეკუთვნის (`acceptance_amendments`).
- C round 22: volume slider-ზე click მნიშვნელობას click-ის წერტილზე სვამს (native range) — SRW-13-ის UX შენიშვნა, ბაგი არა.
- A round 22 deviation 4: in-place mutation dev server-მა შეიძლება დაინახა; round 23-იდან mutation მხოლოდ `store/`-ის გარეთ.
- **Root-ისთვის:** უცხო agent ფაილები; round 6–21-ის დაუკომიტებელი სამუშაო; A-ს round-17 deviation 4 და round-19 deviation 5; C-ის round-21 გაჭედილი python probe (pid 1045, C-მ თავისი პროცესი თავად გათიშა).

## 4. რეგრესიის ვალი

Milestone-ის სრული რეგრესია **დასრულდა** (D-29k, D-29l):
- **Run 1 (Round 20):** C PASS, 17/17.
- **Run 2 (Round 21):** ყველა ID გაეშვა. ერთადერთი ჩავარდნაა R3-V2 → C-R21-01. Not-run ID არ არის.

R3-V2 Round 22-ში ხელახლა შემოწმდა (R22-M1 + R22-V, PASS).

სრული რეგრესია ისევ საჭიროა ეტაპის დასრულებისას (SRW-13..20-ის შემდეგ) და საბოლოოდ, root-ის შემოწმებამდე.

## 5. Tech Lead-ის ხელით შემოწმებები (რეალური Chrome/მაუსი)

| ID | რა | რატომ |
|---|---|---|
| R23-1 / R23-2 | Scrollbar-ის ვიზუალი; wheel და thumb drag | headless native scrollbar-ს მალავს |
| R12-L4 | ბიბლიოთეკიდან ხაზზე HTML5 drag რეალური მაუსით | C synthetic DragEvent-ს იყენებს |
| RF7-2 / RF7-3 | ვიდეოს drift (R3-V1, **mode D**-ის ჩათვლით) და loop wrap-ის landing სუფთა Windows Chrome-ზე, VP9 + H.264 | **სავალდებულოა** C-R8-01-ისა და C-R6-02-ისთვის |
| R8-M1 / R8-M2 | ხაზებს შორის drag Shift-ით რეალური მაუსით | synthetic pointer |
| R10-N1 / R10-N2 | Ruler drag, რეალური Ctrl+wheel და pinch | gstack-ს wheel არ აქვს |
| R30-H1 | Volume slider რეალური მაუსით / multi-touch / focus-ის რიგით | synthetic pointer |
| R11-P3m | Detail-ის გამყოფის, ხაზის სიმაღლის და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |
| R11-SB | Auto-fit რეალური 10 px scrollbar-ით | headless 10 px gutter-ს იტოვებს (`scrollbar-gutter: stable`), მაგრამ scrollbar-ს არ ხატავს; ჰორიზონტალური 0 px-ია (C round 34) |
| R13-RM | ნამდვილი `prefers-reduced-motion` | CDP emulation დაბლოკილია |
| R15-SB | ბიბლიოთეკის 10 px scrollbar-ები გაფართოებული ვიდეოს დროს | headless native scrollbar-ს მალავს |
| R17-T | Preview-ის ორხაზიანი row Windows-ის Georgian font-ებით | font metrics |
| R18-T | რეალური wheel detail-ის ველზე | gstack-ს wheel არ აქვს |
| R19-T | Detail-ის ქართული label-ები რეალურ Chrome-ში | font metrics |
| Lenis `/studio/*` | Purchased Studio-ს wheel | protected route |
| MP4/MOV | H.264/AAC-ის დადებითი import | headless Chromium-ის კოდეკები |
| **R22-T** | Mute/unmute-ზე click არ ისმის: მოსმენა ყურსასმენით რეალურ Chrome-ში (τ 3 ms) | headless-ში მოსმენა შეუძლებელია |
| **R25-T** | Master-ის fader რეალური მაუსით; Master Mute/unmute-ზე click არ ისმის (ყურსასმენი) | synthetic pointer; headless-ში მოსმენა შეუძლებელია |
| **R26-T** | Master-ის meter და Clip indicator რეალურ Chrome-ში, დინამიკებით, `lay11`-ზე: 0 dB-ზე Clip **~2.0 წმ-ზე** ინთება (stems-ის შემოსვლა), `+5.0` მაქსიმუმი ~4.0 წმ-ზეა; −6 dB-ზე არ ინთება; meter-ის მოძრაობა იკითხება (ტექსტი გასწორდა C round 26 §17.1-ით) | headless-ში მოსმენა და ვიზუალური მოძრაობის შეფასება შეუძლებელია |
| **R28-T** | რეალურ Chrome-ში, რეალური მაუსით/კლავიატურით: Delete/Backspace მონაკვეთზე სიცარიელეს ტოვებს; Ctrl+Shift+L-ს browser არ იჭერს და ყველა ხაზზე ავრცელებს; Ctrl+Shift+X ხურავს სიცარიელეს; ყველა ხაზის overlay (`/60`) იკითხება; Round 29-ის შემდეგ — Ctrl+Shift+L → Ctrl+X → Ctrl+V სხვა active lane-ზე მასალას თავის ხაზზე აბრუნებს | browser-ის რეზერვირებული მალსახმობები და რეალური input headless-ში ვერ დამტკიცდება |
| **R30-T** | Clip Gain-ის ცვლილება დაკვრისას ყურსასმენით: click/zipper არ ისმის (τ 15 ms); +6 dB ერთ კლიპზე მხოლოდ იმ კლიპს ხდის ხმამაღლა | headless-ში მოსმენა შეუძლებელია |
| **R31-T** | Pan-ის drag რეალური მაუსით და ყურსასმენით: მდორეა, zipper-ის გარეშე; 50L მხოლოდ მარცხნივ ისმის, C — ცენტრში. დამატებით: focus-ის დაკარგვისას (მაგ. Alt+Tab) დაჭერილი ღილაკით range აგრძელებს თუ არა `input`-ს (C-R31-01) | headless-ში მოსმენა და რეალური მაუსი შეუძლებელია; C-მ synthetic event-ები გამოიყენა |
| **R33-T** | რეალური მაუსით რეალურ Chrome-ში: fader-ზე click → კლიპზე click → Delete → კლიპი იშლება; ასევე ArrowRight კლიპს აჩოჩებს | C-R32-01: headless-ში click-ის focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |
| **R34-T** | რეალური მაუსით რეალურ Chrome-ში: ძებნაში აკრეფა → კლიპზე click → Backspace → კლიპი იშლება, ძებნა უცვლელია; Clip Gain-ში Enter-ის გარეშე აკრეფა → სხვა კლიპზე click → მნიშვნელობა პირველ კლიპზე რჩება; ძებნაში focus-ით scrollbar-ის drag → აკრეფა ისევ ძებნაში მიდის (Firefox-ში overlay scrollbar-ებითაც) | headless scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს; focus-ის ქცევა მხოლოდ CDP-ით მოწმდება |
| **R35-T** | რეალური მაუსით: Clip Gain-ში `3` Enter-ის გარეშე → ტრეკის Volume/Pan-ზე ან Master-ზე click → +3.0 dB რჩება, ისტორია `[Clip Gain, fader]` (Round 36-ის შემდეგ; Pan-ის ცენტრზე Pan-ის ჩანაწერი არ იწერება) | synthetic/CDP pointer; focus-ის გადატანა რეალურ Chrome-ში |
| **R27-T** | ტრეკების meter-ები რეალურ Chrome-ში: იკითხება ყველა სიმჭიდროვეზე (folded/tight/regular/full); ტრეკის over (warning) Master-ის Clip-ისგან (destructive) განირჩევა; hover `title` Peak-ს აჩვენებს | headless-ში ვიზუალური მოძრაობის შეფასება შეუძლებელია |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება:
- purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead; round 21-ის mode-D rAF სიაშიც ჩანს `/studio-lab`-ზე);
- instruction-file-ების portable paths;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, PASS): Round 25-იდან ხილულია export-ში (R25-EO), Round 26-იდან ცოცხლადაც (R26-C0, Clip `+5.0`). Clamp რჩება, limiter ფარგლებს გარეთაა;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით;
- round 6–30-ის სამუშაო დაკომიტდა (`08b9e53`, შემდეგ merge `1cefea1`). მეორე remote-ის push თავიდან non-fast-forward-ით უარყოფილი იყო; ახლა ორივე remote `1cefea1`-ზეა (B-ის `git ls-remote`, 2026-10-13) — მოგვარებულია. ეს შუალედური checkpoint-ია, არა release;
- merge-ის შემდეგ `app/lib/auth.ts` და `auth-bugs.test.ts` working copy-ში CRLF-ია (`core.autocrlf`): Biome `./app` 2 format error-ს აჩვენებს (Studio-ს ფაილები არ არის);
- tracked `.claude/agents/frontend-architect.md` Write/Bash-ს იძლევა (checkpoint review 9);
- მანქანის დატვირთვა: round 27–28-ის A/C run-ებში 34–42 `node.exe`; round 29-ში 10–12 (C-R27-02 დაიხურა); B-ის round-30 დაგეგმვისას 12;
- dev server round 27–29-ში A/C-ის დაწყებისას რამდენჯერმე გაჩერებული იყო (round 29: 16:51–17:08) — C-მდე root-მა უნდა შეამოწმოს;
- fake Bearer → 500 (token არ გაიცემა);
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს;
- საერთო `components/ui/Modal.tsx`-ის focus gap;
- root GA consent-denied-ით `scroll`-ს აგზავნის;
- agent ფაილები ახლა tracked-ია (root-ის commit-ები); C round 29-ის `npx` cache-ის ჩამოტვირთვა (vitest 5.0.4, store უცვლელი);
- round 31 + 32 + 33 + 34 + 36-ის 9 ფაილი C-მ შეამოწმა (Round 36 PASS) და checkpoint commit-ისთვის მზადაა — round 37-ის დაწყებამდე ან მისი C PASS-ის შემდეგ; root-ის gate-ები, review და `npm run test:e2e:smoke` სავალდებულოა;
- `publication-checkpoint.json`-ის მოთხოვნები: ბიბლიოთეკა/სტემები (SRW-12 მზადაა), scrollbar-ები (SRW-23, Tech Lead), T12, საბოლოო commit/push.

Root M1–M3, L1–L4, L6, L7 და L8 დახურულია.

## 7. შემდეგი ეტაპი

| ID | სტატუსი | შენიშვნა |
|---|---|---|
| T12-GAIN-VOLUME | **არ დაწყებულა** | იწყება მხოლოდ თავდაპირველი scope-ის (SRW-01..24) დადასტურებული დასრულების შემდეგ. წყაროები: `docs/technical/studio-real-workspace/next-stage-t12/` |

ფარგლებს გარეთაა მთელი პროექტისთვის: plugins/effects, pitch, ვიდეოს რამდენიმე ფენა და აუდიოს time-stretch. Grid-ის tempo აუდიოს stretch არ არის.

## 8. დასრულების პირობა

COMPLETE დგება მხოლოდ მაშინ, როცა ყველა პირობა შესრულებულია:
- FB-01..16 და SRW-01..24 C-ის მტკიცებულებით (SRW-24 — მომხმარებლის 2026-10-11-ის წაშლის კონტრაქტი) „მზადაა“ სტატუსშია (SRW-21-ის route mount მხოლოდ ნებართვით);
- critical/high ღია ბაგი არ არის;
- build, tsc, check და ტესტები მწვანეა;
- შესყიდვის დაცვა უცვლელია;
- `/studio-lab` ანონიმურად იხსნება (C round 21-ში G21-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
