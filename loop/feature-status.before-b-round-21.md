# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-11 · ავტორი: B (round 20 → round 21 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება `tmp/studio-real-loop/`-ს.

მიმდინარე რაუნდი: **Round 21** (`current-task.md`, D-29l) — milestone-ის სრული რეგრესია, **run 2 / 2**, იმავე გაყინულ app tree-ზე:
- **C:** R2-V1, R3-V2, R3-V4 (D-19-ის ფორმა), R5-L3 + R5-E1, C-R12-01 RF5-3-ით (dock-ის live position), SRW-11B end to end (R11-P1b, P1c, P2, P3, P4, U) + ერთი mode-D run მხოლოდ ინფორმაციისთვის;
- **A:** ფაილი არ იცვლება, მხოლოდ tree-ის attestation (`b-round-20-tree-sha256.txt`, 50 OK).

შემდეგ: milestone-ის fix-ის რაუნდი (run 2-ის ბაგები, A-ს round-11 follow-up-ები, `ArrangementLane.tsx:661`), შემდეგ SRW-13.

**Loop runner:** `run-loop.ps1`-ის `RoundLimit` ნაგულისხმევად 20-ია. Round 21-ისთვის runner-ის გადატვირთვა შეიძლება დასჭირდეს (`-StartRound 21 -StartPhase A`, უფრო მაღალი `-RoundLimit`).

Round 20-ის შედეგი (C, `c-round-20.md`): **PASS**, ახალი ბაგი არ არის.
- **Run 1 PASS (17/17):** R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (ორივე viewport), R12-L2 (ორივე viewport), R12-L4 (synthetic ნაწილი; რეალური drag — Tech Lead).
- **ასევე PASS:** R20-Doc, G20-1..3 (vitest 999/999, tsc 0, Biome 0 error, build; frozen 49 OK + doc 027; ანონიმური `/studio-lab` სუფთაა). რეალური WAV: 18.000 წმ, NaN 0, 1800 FS sample (R13-M4 carry).
- **B-ის შესწორება:** R6-S5-ის „Ctrl+E 2+ → უარი“ ტექსტი D-25-ის ჯგუფის split-ით ჩანაცვლდა (`backlog.json` → `regression_debt_g6r.acceptance_amendments`).
- **C-ის შენიშვნები (ბაგი არ არის):** Delete Time-ის Undo playhead-ს არ აბრუნებს (კრიტერიუმი მხოლოდ arrangement-ს ეხება); doc 027-ის heading-ში ჩაშენებული ფრჩხილები (cosmetic).

## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5); milestone run 1: `c-round-20.md` §2.1, §2.12 (R1-B5, R9-C5) | — |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე); milestone run 1: `c-round-20.md` §2.10–§2.11 (R8-M3, R8-M4) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (milestone-ის შემდეგ) |
| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 (milestone-ის შემდეგ) |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის, polish 14a/14b-ის, Round 17-ისა და Round 19-ის C ID-ები PASS-ია; ღიაა მხოლოდ C-R8-01, Medium, Tech Lead quiet Chrome) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §3–§8, `c-round-15.md` §3–§8; polish 14a: `c-round-16.md` §3–§8; C-R16-01 + M-R10-1/M2: `c-round-17.md` §2–§5; polish 14b: `c-round-18.md` §2–§7; design (d): `c-round-19.md` §2–§4 | Milestone run 2 (Round 21; run 1 C PASS), შემდეგ fix-ის რაუნდი. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 (milestone-ის შემდეგ) |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md` (import), `c-round-4.md`, `c-round-6.md`, `c-round-7.md` (R2-V3), `c-round-10.md` §4, `c-round-12.md` §3 (R2-V3 ×1), `c-round-13.md` §4 (vp9 import), `c-round-14.md` (vp9 OS-drop) | R2-V1: milestone run 2 (Round 21, მიმდინარე) |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა Round 12-ში) | `c-round-7.md` §2; C-R6-02: `c-round-9.md` (N 3/3, RF5-3 3/3, D 2/3); C-R7-01: `c-round-12.md` §2.1 (R12-W1 9/9); `c-round-13.md` §2.5, §3 (F5 3/3, R12-W1 ×1 გაფართოებულით); `c-round-16.md` §8 (დაკვრის sanity: \|Δ\| ≤ 11 ms, counter-ები 0); `c-round-17.md` §4 (counter-ები 0) | C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap (RF7-2/RF7-3). C-R12-01: milestone run 2 (RF5-3, Round 21) |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3); `c-round-13.md` §4–§5 (export, G13-3); `c-round-14.md` §2, §6 (WAV კლავიატურით, G14-3); `c-round-16.md` §2, §8 (G16-3; WAV 864 000 frame = 18.000 წმ); `c-round-17.md` §1, §7 (G17-3; WAV 18.000 წმ); `c-round-18.md` §1, §7 (G18-3; WAV 864 000 frame = 18.000 წმ); `c-round-19.md` §1, §6 (G19-3; WAV 18.000 წმ); `c-round-20.md` §1 (G20-3; WAV 18.000 წმ, NaN 0) | — |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md` | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა) | `c-round-7.md` §2; `c-round-9.md` §2–§3; `c-round-10.md` §2, §4; `c-round-12.md` §2–§3; `c-round-13.md` §2.5, §3 | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. C-R12-01: milestone run 2 (Round 21). R3-V2/R3-V4: run 2 |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** (ვიდეოს landing wrap-ზე R12-W1 PASS; აუდიოს wrap და export PASS) | `c-round-10.md` §4 (R5-L3, R5-E1); `c-round-12.md` §2.1, §3; `c-round-13.md` §3 (R12-W1 ×1 გაფართოებულით) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md` (R6-S2 სხვადასხვა სიმაღლეზე); `c-round-20.md` §2.5 (R6-S5, D-25) | — |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.6–§2.9 (R7-D2..D5) | — |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md` (R26-*, R30-*); `c-round-20.md` §2.10–§2.11 | — |
| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.12 (R9-C5) | — |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა) | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3 (R10-R1/R2); `c-round-13.md` §2.2 (Follow float drag-ისას) | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; R11A-1/3 `c-round-6.md`; `c-round-13.md` §2.4 (controlled collapse, preview ჩერდება); `c-round-14.md` §8, `c-round-16.md` §8, `c-round-17.md` §7 (R11A-1 quick); `c-round-20.md` §2.15 (R11A-2, ორივე viewport) | — |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის, polish 14a/14b-ის და Round 17/19-ის C ID-ები PASS-ია; ღიაა მხოლოდ C-R8-01, Medium) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §1–§8, `c-round-15.md` §1–§8; polish 14a: `c-round-16.md` §1–§8; Round 17: `c-round-17.md` §1–§7; polish 14b: `c-round-18.md` §1–§7; design (d): `c-round-19.md` §1–§6; D-29, D-29a–D-29k (`plan.md`) | Milestone run 2 (Round 21, მიმდინარე): SRW-11B end to end. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. A-ს round-11 follow-up-ები: milestone-ის fix-ის რაუნდი. C-R8-01: Tech Lead quiet Chrome |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e); `c-round-17.md` §2–§4 (preview-ის row, wave/toggle/keys, find → add = ერთი Undo); `c-round-20.md` §2.13, §2.16–§2.17 (R5-B5, R12-L2, R12-L4 synthetic) | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Tech Lead-ის Windows-ის ფონტები |
| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Milestone-ის რეგრესიისა და fix-ის რაუნდის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის (round 16-ის WAV-შიც peak 1.0, 1802 sample FS-ზე). M1/L8 აქ შედის, თუ Tech Lead-ის run მანამდე არ გაკეთდება |
| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | SRW-13-ის შემდეგ (SRW-10-ზეა დამოკიდებული) |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | SRW-15-ის შემდეგ |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | SRW-18-ის შემდეგ (C-R6-02 Tech Lead-ზეა) |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. ცნობილი შეზღუდვა: purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-13.md` §5 (header link, Header იდენტურია); `c-round-14.md` §2, `c-round-16.md` §2, `c-round-17.md` §1, `c-round-18.md` §1 (G-3 header link) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS; R23-1/R23-2 headless-ში ვერ შემოწმდა) | Tech Lead: რეალური Windows Chrome (ვიზუალი, wheel, thumb drag) |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია: R9-L1/L2 PASS) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout. ფაილები გაყინულია |
| C-R8-01 | Medium | **ბაგია** (compositor-only contract R9-D3 PASS; R9-D1 2/3, R9-D2 D − N p95 +0.3 ms) | `c-round-9/runs/drift-summary.txt`, `runs/D_3.json`, `c-round-9.md` §2, §7 | Tech Lead quiet Chrome, R3-V1 D layout. L2/L3 (detail playhead) მასთან ერთად წყდება (D-29h) |
| C-R12-01 | Low | **ბაგია** (start transient; გზა უცვლელია; harness-ის reference-ის ზღვარზე) | `c-round-12/runs/r12s-neighbor.txt`, `r12s-split.txt`, `settlecheck-W.json`; `c-round-12.md` §2.2, §7; ახალი მტკიცებულება `c-round-13.md` §8 (W_1: 0.041 წმ, rate 1.1, harness \|d\| 0.012) | Milestone run 2 (Round 21, მიმდინარე), RF5-3: start-ის rate-ის ჩაწერები + dock-ის live position (D-19b, D-29l-ის ცხრილი). თუ dock-ის \|d\| ≤ 0.02-ზე rate ≠ 1 დადასტურდა → D-19-ის ბაგი, საკუთარი რაუნდით |

Critical/High ღია ბაგი არ არის.

**ბოლოს დაიხურა (Round 19):** C-R18-01 — design (d)-ის ქართული label-ები `w-72`-ით (`c-round-19.md` §2–§4; R19-D1/D2 8/8 რიგი ±0 px, guard G6/G6b/G7).

**Round 18-ში C-ის მტკიცებულებით დასრულდა (ბაგი არ ყოფილა):** polish 14b-ის L4, L11, design (b), L6 (`c-round-18.md` §2, §4–§6; guard M1–M7).

**ბოლოს დაიხურა:** C round 17-ში C-R16-01 (`c-round-17/runs/p2-*.txt`: body Δ0, ყუთში 0 sample) და round-9 reviewer M-R10-1/M2 (R17-M, guard G3/G4). C round 16-ში C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და A-ს round-11 deviation 9 (R16-L1/F1/F2/F3/H1/G1/T1; repro-ები აღარ მეორდება). C round 15-ში C-R14-01 და C-R14-02. C round 14-ში C-R13-01, C-R13-02 და C-R13-03. C round 12-ში C-R7-01 headless-ში (R12-W1, D-19b); Tech Lead-ის RF7-3 რჩება სავალდებულო მტკიცებულებად. Round 10-ში C-R7-02.

**მიღებული (კოდი არ იცვლება):**
- A-ს round-18 deviation-ები (D-29j):
  - 2: წარმატებული Apply ველებში `rangeInputText(clamped)`-ს წერს (C guard M6);
  - 4: სიგანე page-state-ის inline `style.width`-ით იზომება, რადგან გამოუყენებელი Tailwind კლასი კომპილირებული არ არის;
  - 5: W480-ის raw row-ები `header`-ით იკითხება;
  - 6: 1280-ზე ჯგუფის panel 122-ია (D-29g residual). „142“ ჯგუფისთვის B-ის ფორმულირების შეცდომა იყო;
  - 7: R18-D-ის სურათები as-is ჩანაწერია.
- A-ს round-17 deviation-ები (D-29i):
  - 1 და 2 B-ის ფორმულირების შეცდომაა (`rangeLines`; separator-ის სვეტი);
  - 3: CDP-ის კოორდინატული click დაბლოკილია, „რეალური click“ = `$B click` ელემენტის ცენტრში;
  - 5: `—` მდგომარეობა მხოლოდ ტესტით მოწმდება.
- D-29h-ის ფასი: preview +16 px ერთხაზიან მდგომარეობებში (C-მ A-ს ცხრილს შეადარა).
- A-ს round-16 deviation-ები (C-მ დაადასტურა, D-29h):
  - დაკეცილი pointerdown branch `return`-ს აკეთებს, არ არის წაშლილი;
  - cancel-ით მოსრული lane drag cap-მდე სიმაღლეს აბრუნებს;
  - clamp დაკეცილ panel-ზეც მოქმედებს (reopen announced მნიშვნელობას უდრის);
  - `&nbsp;` (DOM-ში U+00A0);
  - „მხოლოდ range“ UI-დან მიუწვდომელია;
  - CDP-ის კოორდინატული click დაბლოკილია.
- Round-16-ის deviation 5 **B-ის ფორმულირების შეცდომაა**: Esc კლიპის არჩევას არასოდეს ხსნიდა. Deselect = click ცარიელ ადგილას იმავე ხაზზე.
- Polish 14b-ის გადაწყვეტილებები (D-29h):
  - design (a): footer-ის ხაზი რჩება;
  - design (c): სახელი header-შიც და content-შიც;
  - round-9 L5 (pointer capture) და L7 (6 px separator) — round 8-ის მსგავსად.
- A-ს round-16 reviewer: „panel-ის სიმაღლე workspace snapshot-ში“ ახლა არ ხდება (C-ის ბაგის გარეშე).
- C-R15-01 — ✕-ისა და Esc-ის შემდეგ ცარიელი `style=""` (D-29g). R15-P3 ნიშნავს „inline declaration-ები არ არის“; C round 16-ში quick-ად დაადასტურა.
- A-ს round-15 deviation-ები და reviewer-ის შენიშვნები: (h − 16) წევრი მკვდარია, ~196 px-ზე დაბალ body-ზე 160-იანი მინიმუმი (არ მიიღწევა), ფოკუსი `body`-ზე trap-ს ტოვებს (root/UI owner).
- C-R11-04 — დაკეცილ ხაზზე `aria-valuenow` გაშლის სიმაღლეა, `aria-valuetext` კი `დაკეცილია · {h} px` (N2).
- A-ს round-12 reviewer Low 1 — `sourceChanged`-ზე `endSettle` არ არის (D-19b).
- A-ს round-13 და round-14 deviation-ები (D-29e/D-29f) და reviewer-ის Low-ები.
- `export-clip-onset-1lsb` — export-ის შედარება ≤ 1.2e-7-ით.
- `floating-video.test.tsx`-ის გარე `describe` ისევ „D-29d“-ს ამბობს.
- checkpoint-r6 #6 და #7.

**ჩანაწერები (ბაგი არ არის):**
- **D-29g residual (C round 16):** range ან ≥ 2 კლიპი footer-ს +20 px-ს უმატებს. 1280/480-ზე გაფართოებული ყუთი შემდეგ preview-ის ზედა 162/360 sample-ს ფარავს, control-ების გარეშე. დაფარული control ახალი ბაგი იქნება.
- R13-U guard 2-ის ფორმულირება B-ის შეცდომა იყო (D-29e). Harness-ის წესი **H3** მოქმედებს Round 12-დან.
- `sfx-library.test.tsx`-ის timeout load flake-ია; round 12–16-ში არ განმეორებულა.
- Hard seek 8.44–8.48 წმ-ზე Pause-ის ცნობილი snap-ია.
- Round 9-ის reviewer-ის ჩანაწერები და A-ს round-11 follow-up-ები განაწილებულია (`backlog.json` → SRW-11B `polish_round.split`):
  - Round 17: M-R10-1/M2 (C PASS, დაიხურა);
  - Round 18: L4, L11, design (b), L6 (C PASS); design (d) → C-R18-01, Round 19 (D-29j, C PASS);
  - L2/L3: C-R8-01-თან;
  - M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან;
  - A-ს round-11 დარჩენილი follow-up-ები (`aria-controls` lane-ის fold ღილაკზე, Home separator-ებზე seek-ს აკეთებს, ring-inset track name-ზე, panel `nextElementSibling`-ით, fold-ის ჩუმი უარი gesture-ის დროს): milestone-ის fix-ის რაუნდი (Round 22, D-29k), რეგრესიის შემდეგ.
- Lane-ის clip overlay (`ArrangementClip.tsx`) `bg-foreground/60`-ზე რჩება, detail-ისა კი Round 18-ში `/30` გახდა (C PASS). ეს სხვაობა გასწორდება, როცა `ArrangementClip.tsx` გაიხსნება (SRW-14/SRW-18), ან C-ის/დიზაინის ბაგით.
- `ArrangementLane.tsx:661`-ზე იმავე `biome-ignore` rule-ს სხვა მიზეზის ტექსტი აქვს (L6-ის ანალოგი, frozen ფაილი). გასწორდება milestone-ის fix-ის რაუნდში ან SRW-17-ში.
- C round 18-ის harness-ის შენიშვნა: ველის გასუფთავება `Control+a`-ით მხოლოდ ჩართულ, ფოკუსირებულ ველზეა უსაფრთხო. სხვაგან workspace-ის Ctrl+A ყველა კლიპს მონიშნავს.
- C round 17-ის ინციდენტი: guard-ის ფოლდერში `ln -s node_modules`-მა 547 MB-იანი ასლი შექმნა. C-მ ის წაშალა; store-ის `node_modules` ხელუხლებელია.
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` ადგილზეა. Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–19-ის Studio სამუშაო (18 M + 22 untracked) დაუკომიტებელია. A-ს round-17 deviation 4: `taskkill //IM python.exe`-მა 2 python პროცესი მოკლა (ერთი უცნობი). Root-მა უნდა დაადასტუროს, რომ საჭირო helper არ მოკლულა. ეს წესის შესაბამისია, მაგრამ რისკი იზრდება. A-ს round-19 deviation 5: საკუთარი გაჭედილი python heredoc timeout-ზე დატოვა; C-ის შემოწმებისას python პროცესი აღარ ჩანდა (root-ს არ გადაუმოწმებია).

## 4. რეგრესიის ვალი

Milestone-ის სრული რეგრესია ორ run-ად მიდის (D-29k, D-29l):
- **Run 1 (Round 20) — C PASS, 17/17** (`c-round-20.md` §2): R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (კლავიშები), R12-L2, R12-L4 (synthetic ნაწილი; რეალური drag — Tech Lead);
- **Run 2 (Round 21) — მიმდინარე, PASS არ არის:** R2-V1, R3-V2, R3-V4, R5-L3 (+ R5-E1), C-R12-01 (RF5-3), SRW-11B end to end.

დარჩენილი ვალი: `R2-V1, R3-V2, R3-V4, R5-L3`. PASS მხოლოდ C-ის ახალი მტკიცებულებით ჩაიწერება.

## 5. Tech Lead-ის ხელით შემოწმებები (რეალური Chrome/მაუსი)

| ID | რა | რატომ |
|---|---|---|
| R23-1 / R23-2 | Scrollbar-ის ვიზუალი; wheel და thumb drag | headless Chromium native scrollbar-ს მალავს; gstack-ს wheel არ აქვს |
| R12-L4 | ბიბლიოთეკიდან ხაზზე HTML5 drag რეალური მაუსით | C synthetic DragEvent-ს იყენებს |
| RF7-2 / RF7-3 | ვიდეოს drift (R3-V1, მათ შორის **mode D**: panel ღია, music მონიშნული) და loop wrap-ის landing (RF5-2, H3 წესით) სუფთა Windows Chrome-ზე, VP9 + H.264 | **სავალდებულოა** C-R8-01-ისა და C-R6-02-ისთვის; SRW-03/SRW-05-ისთვის Round 12-ის headless C-R7-01 დახურვის შემდეგაც |
| R8-M1 / R8-M2 | ხაზებს შორის drag Shift-ით, რეალური მაუსით | synthetic pointer |
| R10-N1 / R10-N2 | Ruler drag, რეალური Ctrl+wheel და pinch | gstack-ს wheel არ აქვს |
| R30-H1 | Volume slider-ი რეალური მაუსით / multi-touch-ით / focus-ის რიგით clip gesture-ის დროს (D-30) | synthetic pointer |
| R11-P3m | Detail-ის გამყოფის, ხაზის სიმაღლის სახელურის და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |
| R11-SB | Auto-fit-ის ხილული არე რეალური 10 px-იანი horizontal scrollbar-ით (1280-ის cap-ის ჩათვლით); 1280×720-ზე ბიბლიოთეკის დროებითი გახსნისას | headless-ში scrollbar 0 px-ია |
| R13-RM | ნამდვილი `prefers-reduced-motion`: დაკეცილი ბიბლიოთეკიდან ⤢ — ყუთი მომდევნო frame-ზე ლაგდება | gstack CDP `Emulation.setEmulatedMedia`-ს არ უშვებს |
| R15-SB | გაფართოებული ვიდეოს დროს ბიბლიოთეკის ხისა და სიის 10 px scrollbar-ები D-29f-ის ქვედა inset-ით; row-ები მისაწვდომია | headless native scrollbar-ს მალავს |
| R17-T | ბიბლიოთეკის preview-ის ორხაზიანი row რეალურ Windows-ის Georgian font-ებით (288 და 480) — ტექსტი ორ ხაზში ეტევა ან ellipsis-ით მთავრდება, `title` სრულია. მესამე ხაზის შემთხვევაში clamp `· playhead`-ის დროს მალავს (C: `c-round-17/shots/forced-overflow-1440-288.png`) | headless-ის font metrics შეიძლება განსხვავდებოდეს |
| R18-T | რეალური wheel ფოკუსირებულ detail-ის start/end ველზე მნიშვნელობას არ ცვლის; არაფოკუსირებულ ველსა და waveform-ზე კონტენტი ისევ სქროლდება | gstack-ს wheel არ აქვს; jsdom number input-ს wheel-ით არ ცვლის |
| R19-T | Detail-ის ქართული label-ები რეალურ Windows Chrome-ში 1280×720-სა და 1440×900-ზე, ბიბლიოთეკით 288 და 480: info-ს ყოველი ხაზი ერთ ხაზზეა (ჯგუფის შენიშვნის გარდა), სათაური და ხაზის row არ იჭრება (`w-72`) | headless იმავე მანქანაზე იგივე font-ებს იყენებს, მაგრამ 28 px-იანი რეზერვი მომხმარებლის ბრაუზერში დასტურდება |
| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) | `data-lenis-prevent` მხოლოდ `/studio-lab`-ზეა |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება:
- purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead);
- instruction-file-ების portable paths;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13; round 16-შიც peak 1.0, 1802 sample);
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით;
- round 6–20-ის დაუკომიტებელი tree (Round 20–21-ში app-ის კოდი არ იცვლება);
- fake Bearer → 500 (token არ გაიცემა; 401 უფრო სწორი იქნებოდა);
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს (real-mouse harness-ებისთვის);
- საერთო `components/ui/Modal.tsx`-ს focus management არ აქვს (Studio-ს export dialog round 14–15-ში გასწორდა; ფოკუსი `body`-ზე trap-ს ტოვებს — root/UI owner);
- root GA consent-denied რეჟიმში `page_view`-ის გარდა `scroll` event-საც აგზავნის (root analytics);
- ორი უცხო agent ფაილი (root);
- `publication-checkpoint.json`-ის მოთხოვნები: ბიბლიოთეკა/სტემები (SRW-12 მზადაა), scrollbar-ები (SRW-23, Tech Lead-ის ვიზუალი), T12, საბოლოო commit/push.

Root M1–M3, L1–L4, L6, L7 და L8 დახურულია.

## 7. შემდეგი ეტაპი

| ID | სტატუსი | შენიშვნა |
|---|---|---|
| T12-GAIN-VOLUME | **არ დაწყებულა** | იწყება მხოლოდ თავდაპირველი scope-ის (SRW-01..23) დადასტურებული დასრულების შემდეგ. წყაროები: `docs/technical/studio-real-workspace/next-stage-t12/` |

ფარგლებს გარეთაა მთელი პროექტისთვის: plugins/effects, pitch, ვიდეოს რამდენიმე ფენა და აუდიოს time-stretch. Grid-ის tempo აუდიოს stretch არ არის.

## 8. დასრულების პირობა

COMPLETE დგება მხოლოდ მაშინ, როცა ყველა პირობა შესრულებულია:
- FB-01..16 და SRW-01..23 C-ის მტკიცებულებით „მზადაა“ სტატუსშია (SRW-21-ის route mount მხოლოდ ნებართვით);
- critical/high ღია ბაგი არ არის;
- build, tsc, check და ტესტები მწვანეა;
- შესყიდვის დაცვა უცვლელია;
- `/studio-lab` ანონიმურად იხსნება (C round 17-ში G17-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
