# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-11 · ავტორი: B (round 15 → round 16 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება `tmp/studio-real-loop/`-ს.

მიმდინარე რაუნდი: **Round 16** (`current-task.md`, D-29c/D-29g):
- panel polish 14a: C-R11-01..03 და A-ს round-11 deviation 9;
- C-R15-02, D-29c (2)-ით;
- C-R15-03-ის ტესტი.

შემდეგ polish 14b–14c (Round 17–18) და milestone-ის სრული რეგრესია.

Round 15-ის შედეგი (C, `c-round-15.md`): **FAIL მხოლოდ R15-P3-ის სიტყვასიტყვით sub-check-ზე** („inline `style` ატრიბუტი არ არის“). ✕-ისა და Esc-ის შემდეგ ცარიელი `style=""` რჩება.
- **PASS:**
  - R15-P1: ოთხი შემთხვევა და დროებითი გახსნა. Δ ≤ 0.02, ყუთი ≤ body/2, hit-test 4/4. 160-იანი მინიმუმი არცერთ შემთხვევაში არ მიიღწევა.
  - R15-P2:
    - 1280/480-ზე რეალური click „soft“-ზე → 1 კლიპი, 1 Undo;
    - 1440/288-ის ბოლო row-ები მისაწვდომია;
    - ოთხივე შემთხვევაში 9/9 სიის და 9/9 ხის row მისაწვდომია;
    - ArrowDown-ით ფოკუსირებული row ყუთის ზემოთ რჩება.
  - R15-E:
    - X-ის repro აღარ მეორდება;
    - Tab ×8 და Shift+Tab ×8 dialog-ში რჩება;
    - E1/E3/E4/E5 გავიდა;
    - render-ის დროს 656 sample-დან 0 იყო dialog-ის გარეთ.
  - R15-U (Low შენიშვნით, C-R15-03) და R15-Doc.
- **R15-P3:** ფუნქციური sub-check-ები PASS-ია: padding 4 px, scroll-padding auto, `scrollHeight` = expand-მდე, ტექსტები, ◀ → ▶ და pending inset 0. ცარიელი ატრიბუტი B-მ მიიღო (D-29g), რადგან ეს B-ის criterion-ის შეცდომაა. C R15-P3-ს round 16-ში quick-ად ხელახლა ამოწმებს.
- **მეზობელი რეგრესიები PASS:** R13-F2 quick (8,450.5-იდან), R13-F3/F4 quick (reduced motion მხოლოდ სიმულაციით), R11A-1 quick, dock quick, RF7-P2. G15-1..3 PASS-ია, vitest 965/965.
- **დაიხურა:** C-R14-01 და C-R14-02. Round-14-ის repro-ები აღარ მეორდება.
- **ახალი Low:**
  - C-R15-01 — მიღებულია (D-29g);
  - C-R15-02 — footer-ის selected-clip ხაზი body-ს 20 px-ით ამოკლებს და ყუთი preview-ის 12 px-ს ფარავს → Round 16, D-29c (2)-ით;
  - C-R15-03 — Export-ის „only Tab“ ტესტი Enter-ის mutation-ს ვერ იჭერს → Round 16.
- **ვერ შემოწმდა:** ნამდვილი `prefers-reduced-motion` (R13-RM, Tech Lead).

## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5) | R9-C5 milestone-ის რეგრესიაში თავიდან |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (Round 19) |
| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 (Round 19) |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium), C-R11-01..03, C-R15-02 და C-R15-03 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §3–§8, `c-round-15.md` §3–§8 | Round 16: polish 14a (C-R11-01..03, D-29c) + C-R15-02/03 (D-29g). Round 17–18: 14b/14c. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 (Round 19) |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md` (import), `c-round-4.md`, `c-round-6.md`, `c-round-7.md` (R2-V3), `c-round-10.md` §4, `c-round-12.md` §3 (R2-V3 ×1), `c-round-13.md` §4 (vp9 import), `c-round-14.md` (vp9 OS-drop) | R2-V1 milestone-ის რეგრესიაში თავიდან |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა Round 12-ში) | `c-round-7.md` §2; C-R6-02: `c-round-9.md` (N 3/3, RF5-3 3/3, D 2/3); C-R7-01: `c-round-12.md` §2.1 (R12-W1 9/9); `c-round-13.md` §2.5, §3 (F5 3/3, R12-W1 ×1 გაფართოებულით) | C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap (RF7-2/RF7-3). C-R12-01: milestone RF5-3 |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3); `c-round-13.md` §4–§5 (export, G13-3); `c-round-14.md` §2, §6 (WAV კლავიატურით, G14-3) | — |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md` | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა) | `c-round-7.md` §2; `c-round-9.md` §2–§3; `c-round-10.md` §2, §4; `c-round-12.md` §2–§3; `c-round-13.md` §2.5, §3 | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. C-R12-01: milestone RF5-3. Round 16: dock და `video-sync.ts` გაყინულია, sync run არ არის |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** (ვიდეოს landing wrap-ზე R12-W1 PASS; აუდიოს wrap და export PASS) | `c-round-10.md` §4 (R5-L3, R5-E1); `c-round-12.md` §2.1, §3; `c-round-13.md` §3 (R12-W1 ×1 გაფართოებულით) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md` (R6-S2 სხვადასხვა სიმაღლეზე) | R6-S5 milestone-ის რეგრესიაში |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md` | R7-D2..D5 milestone-ის რეგრესიაში |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md` (R26-*, R30-*) | R8-M3/M4 milestone-ის რეგრესიაში |
| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md` | R9-C5 milestone-ის რეგრესიაში |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა) | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3 (R10-R1/R2); `c-round-13.md` §2.2 (Follow float drag-ისას) | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; R11A-1/3 `c-round-6.md`; `c-round-13.md` §2.4 (controlled collapse, preview ჩერდება); `c-round-14.md` §8 (R11A-1 quick) | R11A-2 (keys) milestone-ის რეგრესიაში. Round 15-ის `bottomInsetPx` C-მ შეამოწმა (R15-P2/P3, R11A-1 quick PASS). Round 16-ში ბიბლიოთეკის ფაილი გაყინულია |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ის ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium), C-R11-01..03, C-R15-02 და C-R15-03 (Low)) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §1–§8, `c-round-15.md` §1–§8; D-29, D-29a–D-29g (`plan.md`) | Round 16: polish 14a + C-R15-02/03 (R16-L1, R16-F1..F3, R16-H1, R16-G1, R16-T1, R16-U, R16-Doc). Polish 14b–14c Round 17–18. C-R8-01: Tech Lead quiet Chrome |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e) | R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag |
| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 19, milestone-ის რეგრესიის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის (round 14-შიც peak 1.0, 1018 sample FS-ზე) |
| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 20 |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 20, SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 21 |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 22, SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 23, SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 24 (C-R6-02 Tech Lead-ზეა) |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 25, SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. ცნობილი შეზღუდვა: purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-13.md` §5 (header link, Header იდენტურია); `c-round-14.md` §2 (G14-3 header link) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS; R23-1/R23-2 headless-ში ვერ შემოწმდა) | Tech Lead: რეალური Windows Chrome (ვიზუალი, wheel, thumb drag) |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია: R9-L1/L2 PASS) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout. ფაილები Round 14-ში გაყინულია |
| C-R8-01 | Medium | **ბაგია** (compositor-only contract R9-D3 PASS; R9-D1 2/3, R9-D2 D − N p95 +0.3 ms) | `c-round-9/runs/drift-summary.txt`, `runs/D_3.json`, `c-round-9.md` §2, §7 | Tech Lead quiet Chrome, R3-V1 D layout |
| C-R15-02 | Low | **მუშავდება** (Round 16) | `c-round-15/runs/selection-footer-1280-480.txt`, `shots/selection-footer-box-over-preview-1280-480.png`; `c-round-15.md` §4 | D-29g: მიზეზი იგივეა, რაც C-R11-02-ს აქვს. D-29c (2): footer selected-clip ხაზის ადგილს იტოვებს; ყუთის re-placement არ ემატება (R16-F1..F3) |
| C-R15-03 | Low | **მუშავდება** (Round 16) | `c-round-15/gates/guard-c15.txt` (G6); `c-round-15.md` §7 | ტესტი: Enter და Space ბოლო ჩართულ control-ზე (WAV) არ ჩერდება და ფოკუსს არ ამოძრავებს. C-ის G6 ამ ტესტს უნდა ჩააგდებდეს (R16-T1) |
| C-R12-01 | Low | **ბაგია** (start transient; გზა უცვლელია; harness-ის reference-ის ზღვარზე) | `c-round-12/runs/r12s-neighbor.txt`, `r12s-split.txt`, `settlecheck-W.json`; `c-round-12.md` §2.2, §7; ახალი მტკიცებულება `c-round-13.md` §8 (W_1: 0.041 წმ, rate 1.1, harness \|d\| 0.012) | Milestone RF5-3: start-ის rate-ის ჩაწერები + dock-ის live position (D-19b). თუ dock-ის \|d\| ≤ 0.02-ზე rate ≠ 1 დადასტურდა → D-19-ის ბაგი, საკუთარი რაუნდით |
| C-R11-01 | Low | **მუშავდება** (Round 16) | `c-round-11/runs/unfold-manual-1440.json` | Round 16 (polish 14a), D-29c (1): დაკეცილ ხაზზე სახელურს pointer-ის hit area არ აქვს; ↑/↓ მხოლოდ შლის |
| C-R11-02 | Low | **მუშავდება** (Round 16) | `c-round-11/runs/p2a-1280-open-selected.json`, `p2a-1280-open-noselect.json` | Round 16, D-29c (2): footer selected-clip ხაზის სიმაღლეს იტოვებს (C-R15-02-საც ხურავს) |
| C-R11-03 | Low | **მუშავდება** (Round 16) | `c-round-11/runs/p2a-1280-afoff-a.json` | Round 16, D-29c (3): cap-ის გამორთვისას panel rendered სიმაღლეს ინარჩუნებს |

Critical/High ღია ბაგი არ არის.

**ბოლოს დაიხურა:** C round 15-ში C-R14-01 და C-R14-02 (R15-P1/P2/E; round-14-ის repro-ები აღარ მეორდება). C round 14-ში C-R13-01, C-R13-02 და C-R13-03 (R14-P1/P2/S/E; round-13-ის repro-ები აღარ მეორდება). C round 12-ში C-R7-01 headless-ში (R12-W1, D-19b); Tech Lead-ის RF7-3 რჩება სავალდებულო მტკიცებულებად. Round 10-ში C-R7-02 (R10-R1, R10-R2).

**მიღებული (კოდი არ იცვლება):**
- C-R15-01 — ✕-ისა და Esc-ის შემდეგ ხეზე და სიაზე ცარიელი `style=""` რჩება (D-29g). ეს B-ის criterion-ის შეცდომაა, D-19b-ის მსგავსად. R15-P3 ნიშნავს „inline declaration-ები არ არის“. Round 15-ის FAIL ჩანაწერში რჩება.
- A-ს round-15 deviation-ები (C-მ დაადასტურა):
  - inset-ის ტესტები `floating-video.test.tsx`-შია;
  - helper-ის სახელი დავალებიდანაა;
  - E3-ში Space WAV-ზე დაეჭირა;
  - E4 ხელახლა გაეშვა;
  - mechanism probe round-14-ის ყუთზე გაიზომა.
- A-ს round-15 reviewer-ის შენიშვნები:
  - (h − 16) წევრი ≥ 32 px-იან body-ზე მკვდარია;
  - ~196 px-ზე დაბალ body-ზე 160-იანი მინიმუმი ყუთს body-ს ნახევარზე მაღალს ხდის. არცერთ გაზომილ შემთხვევაში ეს არ მიიღწევა.
- C-R11-04 — დაკეცილ ხაზზე `aria-valuenow` გაშლის სიმაღლეა, `aria-valuetext` კი `დაკეცილია · {h} px` (N2).
- A-ს round-12 reviewer Low 1 — `sourceChanged`-ზე `endSettle` არ არის (D-19b).
- A-ს round-13 deviation-ები (D-29e): capture-phase Export-ის ნიშანი, reduced-motion-ის პირობა `transitionProperty`-ით, fallback timer + `transitioncancel`. C-მ რეალურ ბრაუზერში დაადასტურა.
- A-ს round-13 reviewer Low-ები: viewport ორჯერ იკითხება, drag-ის დროს ისრები დაბლოკილია, drag-ის ბოლოს ერთი დამატებითი render, ref ბოლო KeyboardEvent-ს ინახავს.
- `export-clip-onset-1lsb` — export-ის შედარება ≤ 1.2e-7-ით.
- A-ს round-14 deviation-ები (C-მ დაადასტურა): effect B + ფოკუსირებადი wrapper render-ის დროს (review H1), exported დაბრუნების constant-ები, ⤢-ით დაბრუნება compact ტექსტს წერს, სიგანის rounding არ არის, E5-ის პროექტი სესიისაა.
- `floating-video.test.tsx`-ის გარე `describe` ისევ „D-29d“-ს ამბობს (სახელის შეცვლა ყველა ტესტის სახელს შეცვლიდა).
- checkpoint-r6 #6 (stale scrub ინარჩუნებს პოზიციას) და #7 (marquee-ს `buttons` check).

**ჩანაწერები (ბაგი არ არის):**
- R13-U guard 2-ის ფორმულირება B-ის შეცდომა იყო: search-precedence ტესტი მხოლოდ M2b-ზე ვარდება (`c-round-13.md` §2.7). Round 13-ის PASS უცვლელია (D-29e).
- Harness-ის წესი **H3** მოქმედებს Round 12-დან; R12-S იზომება პირველი arm-იდან (D-19b).
- `sfx-library.test.tsx`-ის timeout load flake-ია (`watch`); round 12–13-ში არ განმეორებულა.
- Hard seek 8.44–8.48 წმ-ზე Pause-ის ცნობილი snap-ია (round 13-შიც 8.47–8.48, dock-ის `data-video-hard-seeks` 0).
- Round 9-ის ჩანაწერები (reviewer M1, M-R10-1/M2, L2–L8, design-philosopher (a)–(d), L11) და A-ს round-11 follow-up-ები **Round 16–18-ის panel polish**-შია (16: 14a; 17: 14b detail panel; 18: 14c context/preview) (`backlog.json` → SRW-11B `polish_round`).
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` ადგილზეა. Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–15-ის Studio სამუშაო (18 M + 17 untracked) დაუკომიტებელია. ეს წესის შესაბამისია (საბოლოო commit/push root-ისაა), მაგრამ რისკი იზრდება.

## 4. რეგრესიის ვალი (PASS არ არის)

ქვემოთ ჩამოთვლილი ID-ები ადრეულ რაუნდებში გავიდა, მაგრამ C-მ round 6-ის შემდეგ თავიდან არ გაუშვა. სამუშაო წესის მიხედვით, ისინი milestone-ის სრულ რეგრესიაზე შემოწმდება: SRW-11B-ისა და polish-ის დასრულებისას, საერთო ინფრასტრუქტურის ცვლილებისას, ან უფრო ადრე, თუ რეგრესიის კონკრეტული მტკიცებულება გამოჩნდება.

`R1-B5, R2-V1, R3-V2, R3-V4, R4-B1, R5-L3, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R11A-2 (keys), R12-L2, R12-L4, R5-B5, R5-B1u`

შენიშვნა: R5-L3 C-მ round 10-სა და 12-ში მეზობელ რეგრესიად გაუშვა და PASS-ია. სიიდან ის მაინც მხოლოდ milestone-ის სრულ რეგრესიაზე ამოვა. Milestone-ის RF5-3-ს ემატება C-R12-01-ის შემოწმება.

## 5. Tech Lead-ის ხელით შემოწმებები (რეალური Chrome/მაუსი)

| ID | რა | რატომ |
|---|---|---|
| R23-1 / R23-2 | Scrollbar-ის ვიზუალი; wheel და thumb drag | headless Chromium native scrollbar-ს მალავს; gstack-ს wheel არ აქვს |
| R12-L4 | ბიბლიოთეკიდან ხაზზე HTML5 drag რეალური მაუსით | C synthetic DragEvent-ს იყენებს |
| RF7-2 / RF7-3 | ვიდეოს drift (R3-V1, მათ შორის **mode D**: panel ღია, music მონიშნული) და loop wrap-ის landing (RF5-2, H3 წესით) სუფთა Windows Chrome-ზე, VP9 + H.264 | **სავალდებულოა** C-R8-01-ისა და C-R6-02-ისთვის; SRW-03/SRW-05-ისთვის Round 12-ის headless C-R7-01 დახურვის შემდეგაც. Headless decoder-ის post-start freeze გარემოს თვისებაა |
| R8-M1 / R8-M2 | ხაზებს შორის drag Shift-ით, რეალური მაუსით | synthetic pointer |
| R10-N1 / R10-N2 | Ruler drag, რეალური Ctrl+wheel და pinch | gstack-ს wheel არ აქვს |
| R30-H1 | Volume slider-ი რეალური მაუსით / multi-touch-ით / focus-ის რიგით clip gesture-ის დროს (D-30) | synthetic pointer |
| R11-P3m | Detail-ის გამყოფის, ხაზის სიმაღლის სახელურის და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |
| R11-SB | Auto-fit-ის ხილული არე რეალური 10 px-იანი horizontal scrollbar-ით; 1280×720-ზე ბიბლიოთეკის დროებითი გახსნისას (ვიწროვდება timeline) | headless-ში scrollbar 0 px-ია |
| R13-RM | ნამდვილი `prefers-reduced-motion`: დაკეცილი ბიბლიოთეკიდან ⤢ — ყუთი მომდევნო frame-ზე ლაგდება | gstack CDP `Emulation.setEmulatedMedia`-ს არ უშვებს; C-მ round 13-სა და 14-ში სიმულაცია გააკეთა |
| R15-SB | გაფართოებული ვიდეოს დროს ბიბლიოთეკის ხისა და სიის 10 px scrollbar-ები D-29f-ის ქვედა inset-ით; row-ები მისაწვდომია | headless native scrollbar-ს მალავს (R11-SB-ის მსგავსად) |
| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) | `data-lenis-prevent` მხოლოდ `/studio-lab`-ზეა |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება: purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21); Lenis `/studio/*`-ზე (Tech Lead); instruction-file-ების portable paths; export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13; round 13-შიც peak 1.0); საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით. საერთო `components/ui/Modal.tsx`-ს focus management არ აქვს. Round 14–15 მხოლოდ Studio-ს export dialog-ს ასწორებს (round 15: X Tab-ციკლში); სხვა Modal-ები root/UI owner-ის გადასაწყვეტია. Round 15-ის ცნობილი ზღვარი (doc 024): ფოკუსი `body`-ზე (მაგ. scrollbar-ზე click-ის შემდეგ) trap-ს ტოვებს. მის დასახურად document listener არის საჭირო, ეს კი საერთო Modal-ის მფლობელის საქმეა. **ახალი (C round 14):** root GA consent-denied რეჟიმში `page_view`-ის გარდა `scroll` event-საც აგზავნის (root analytics, Studio-ს გარეთ). Root M1–M3, L1–L4, L6, L7 და L8 დახურულია. Scrollbar-ის მოთხოვნა: SRW-23 (Tech Lead-ის ვიზუალი). ბიბლიოთეკისა და სტემების მოთხოვნა: SRW-12 მზადაა.

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
- `/studio-lab` ანონიმურად იხსნება (C round 14-ში G14-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
