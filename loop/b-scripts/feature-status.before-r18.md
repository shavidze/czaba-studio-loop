# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-11 · ავტორი: B (round 16 → round 17 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება `tmp/studio-real-loop/`-ს.

მიმდინარე რაუნდი: **Round 17** (`current-task.md`, D-29h):
- C-R16-01: ბიბლიოთეკის preview-ის აქტიური ხაზის row-ს ფიქსირებული სიმაღლე აქვს, ზუსტად ორი ტექსტური ხაზი;
- round-9 reviewer M-R10-1/M2: `LibraryPlayheadText` 20 Hz-იანი preview cursor-ით აღარ render-დება (`memo`).

ორივე `ArrangementLibraryPreview.tsx`-შია. შემდეგ Round 18 — polish 14b (detail panel), შემდეგ milestone-ის სრული რეგრესია.

Round 16-ის შედეგი (C, `c-round-16.md`): **PASS**.
- **PASS:**
  - R16-L1 7/7: დაკეცილ ხაზზე სახელურს pointer-ის hit area არ აქვს; trim edge და drop ხაზის ქვედა კიდეზე მუშაობს; ↑/↓ მხოლოდ შლის.
  - R16-F1: footer 69, scroller, ხაზები, panel და body Δ0 select ↔ deselect-ზე, ორივე viewport-ზე. 1280-ზე ხაზი 60 და cap 142 მუდმივია. Footer-ის ფასი გამჟღავნებულია: 1440-ზე +20 px.
  - R16-F2/F3: D-29f-ის ფორმულა ახალი body-დან; C-R15-02-ის flow-ში body Δ0, preview-ის sample-ები 0/360 ყუთში.
  - R16-H1: cap-ის დროს auto-fit-ის გამორთვა panel-ს 142-ზე ტოვებს resize-ზე და collapse/reopen-ზე; 1440-ის control 144.
  - R16-G1, R16-T1 (C-ის G6 და every-key mutation-ები ახალ ტესტს აგდებს), R16-U, R16-Doc.
- **მეზობელი რეგრესიები PASS:** R15-P3 quick (D-29g-ის წაკითხვით), R13-F2/F3 quick, R11-P2/P2a quick, R14-E quick, R11A-1 quick, dock quick, RF7-P2. G16-1..3 PASS-ია, vitest 979/979. ნამდვილი WAV export 18.000 წმ.
- **დაიხურა:** C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და A-ს round-11 deviation 9.
- **ახალი Low:** C-R16-01 — აქტიური ხაზის შეცვლა გაფართოებული ვიდეოს დროს preview-ის ხაზს ორ ხაზზე შლის, body 16 px-ით მოკლდება და ყუთი preview-ის ზედა 8 px-ს ფარავს. Control არ იფარება, რეგრესია არ არის → Round 17 (D-29h).

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
| FB-08 | პანელების განლაგება | **ბაგია** (ეტაპები 1–3-ისა და polish 14a-ს ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R16-01 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §3–§8, `c-round-15.md` §3–§8; polish 14a: `c-round-16.md` §3–§8 | Round 17: C-R16-01 + M-R10-1/M2 (D-29h). Round 18: polish 14b. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 (Round 19) |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md` (import), `c-round-4.md`, `c-round-6.md`, `c-round-7.md` (R2-V3), `c-round-10.md` §4, `c-round-12.md` §3 (R2-V3 ×1), `c-round-13.md` §4 (vp9 import), `c-round-14.md` (vp9 OS-drop) | R2-V1 milestone-ის რეგრესიაში თავიდან |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა Round 12-ში) | `c-round-7.md` §2; C-R6-02: `c-round-9.md` (N 3/3, RF5-3 3/3, D 2/3); C-R7-01: `c-round-12.md` §2.1 (R12-W1 9/9); `c-round-13.md` §2.5, §3 (F5 3/3, R12-W1 ×1 გაფართოებულით); `c-round-16.md` §8 (დაკვრის sanity: \|Δ\| ≤ 11 ms, counter-ები 0) | C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap (RF7-2/RF7-3). C-R12-01: milestone RF5-3 |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3); `c-round-13.md` §4–§5 (export, G13-3); `c-round-14.md` §2, §6 (WAV კლავიატურით, G14-3); `c-round-16.md` §2, §8 (G16-3; WAV 864 000 frame = 18.000 წმ) | — |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md` | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა) | `c-round-7.md` §2; `c-round-9.md` §2–§3; `c-round-10.md` §2, §4; `c-round-12.md` §2–§3; `c-round-13.md` §2.5, §3 | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. C-R12-01: milestone RF5-3. Round 17: dock, `video-sync.ts` და `ArrangementContext.tsx` გაყინულია, sync run არ არის |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** (ვიდეოს landing wrap-ზე R12-W1 PASS; აუდიოს wrap და export PASS) | `c-round-10.md` §4 (R5-L3, R5-E1); `c-round-12.md` §2.1, §3; `c-round-13.md` §3 (R12-W1 ×1 გაფართოებულით) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md` (R6-S2 სხვადასხვა სიმაღლეზე) | R6-S5 milestone-ის რეგრესიაში |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md` | R7-D2..D5 milestone-ის რეგრესიაში |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md` (R26-*, R30-*) | R8-M3/M4 milestone-ის რეგრესიაში |
| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md` | R9-C5 milestone-ის რეგრესიაში |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა) | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3 (R10-R1/R2); `c-round-13.md` §2.2 (Follow float drag-ისას) | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; R11A-1/3 `c-round-6.md`; `c-round-13.md` §2.4 (controlled collapse, preview ჩერდება); `c-round-14.md` §8, `c-round-16.md` §8 (R11A-1 quick) | R11A-2 (keys) milestone-ის რეგრესიაში. Round 17-ში `ArrangementLibrary.tsx` და dock გაყინულია; იცვლება მხოლოდ preview-ის ფაილი (SRW-12) |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპები 1–3-ისა და polish 14a-ს ყველა C ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R16-01 (Low)) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; ეტაპი 3: `c-round-13.md` §2–§3, `c-round-14.md` §1–§8, `c-round-15.md` §1–§8; polish 14a: `c-round-16.md` §1–§8; D-29, D-29a–D-29h (`plan.md`) | Round 17: C-R16-01 + M-R10-1/M2 (R17-P1..P3, R17-M, R17-U, R17-Doc). Round 18: polish 14b. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e) | Round 17 preview-ის ფაილს ცვლის: C ამოწმებს preview-ის wave/toggle/add-ს და find → add-ს (R17-P3). R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag |
| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 19, milestone-ის რეგრესიის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის (round 16-ის WAV-შიც peak 1.0, 1802 sample FS-ზე). M1/L8 აქ შედის, თუ Tech Lead-ის run მანამდე არ გაკეთდება |
| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 20 |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 20, SRW-14-ის შემდეგ (საჭიროებისას ცალკე ეტაპად) |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 21 |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 22, SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 23, SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 24 (C-R6-02 Tech Lead-ზეა) |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 25, SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. ცნობილი შეზღუდვა: purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-13.md` §5 (header link, Header იდენტურია); `c-round-14.md` §2, `c-round-16.md` §2 (G-3 header link) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS; R23-1/R23-2 headless-ში ვერ შემოწმდა) | Tech Lead: რეალური Windows Chrome (ვიზუალი, wheel, thumb drag) |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია: R9-L1/L2 PASS) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout. ფაილები გაყინულია |
| C-R8-01 | Medium | **ბაგია** (compositor-only contract R9-D3 PASS; R9-D1 2/3, R9-D2 D − N p95 +0.3 ms) | `c-round-9/runs/drift-summary.txt`, `runs/D_3.json`, `c-round-9.md` §2, §7 | Tech Lead quiet Chrome, R3-V1 D layout. L2/L3 (detail playhead) მასთან ერთად წყდება (D-29h) |
| C-R16-01 | Low | **მუშავდება** (Round 17) | `c-round-16/runs/active-lane-residual-1440-288.txt`, `shots/active-lane-residual-1440-288.png`; confounder 1280: `runs/f1-extra-1280.txt`; `c-round-16.md` §9 | D-29h: preview-ის აქტიური ხაზის row ფიქსირებული ორხაზიანია (clamp + `title`). ყუთის re-placement არ ემატება (R17-P1..P3) |
| C-R12-01 | Low | **ბაგია** (start transient; გზა უცვლელია; harness-ის reference-ის ზღვარზე) | `c-round-12/runs/r12s-neighbor.txt`, `r12s-split.txt`, `settlecheck-W.json`; `c-round-12.md` §2.2, §7; ახალი მტკიცებულება `c-round-13.md` §8 (W_1: 0.041 წმ, rate 1.1, harness \|d\| 0.012) | Milestone RF5-3: start-ის rate-ის ჩაწერები + dock-ის live position (D-19b). თუ dock-ის \|d\| ≤ 0.02-ზე rate ≠ 1 დადასტურდა → D-19-ის ბაგი, საკუთარი რაუნდით |

Critical/High ღია ბაგი არ არის.

**ბოლოს დაიხურა:** C round 16-ში C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და A-ს round-11 deviation 9 (R16-L1/F1/F2/F3/H1/G1/T1; repro-ები აღარ მეორდება). C round 15-ში C-R14-01 და C-R14-02. C round 14-ში C-R13-01, C-R13-02 და C-R13-03. C round 12-ში C-R7-01 headless-ში (R12-W1, D-19b); Tech Lead-ის RF7-3 რჩება სავალდებულო მტკიცებულებად. Round 10-ში C-R7-02.

**მიღებული (კოდი არ იცვლება):**
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
  - Round 17: M-R10-1/M2;
  - Round 18: L4, L11, design (b), L6, design (d);
  - L2/L3: C-R8-01-თან;
  - M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან;
  - A-ს round-11 დარჩენილი follow-up-ები (`aria-controls` lane-ის fold ღილაკზე, Home separator-ებზე seek-ს აკეთებს, ring-inset track name-ზე, panel `nextElementSibling`-ით): Round 18 ან milestone.
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` ადგილზეა. Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–16-ის Studio სამუშაო (18 M + 18 untracked) დაუკომიტებელია. ეს წესის შესაბამისია, მაგრამ რისკი იზრდება.

## 4. რეგრესიის ვალი (PASS არ არის)

ქვემოთ ჩამოთვლილი ID-ები ადრეულ რაუნდებში გავიდა, მაგრამ C-მ round 6-ის შემდეგ თავიდან არ გაუშვა. ისინი milestone-ის სრულ რეგრესიაზე შემოწმდება: SRW-11B-ისა და polish-ის დასრულებისას, საერთო ინფრასტრუქტურის ცვლილებისას, ან უფრო ადრე, თუ რეგრესიის კონკრეტული მტკიცებულება გამოჩნდება.

`R1-B5, R2-V1, R3-V2, R3-V4, R4-B1, R5-L3, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R11A-2 (keys), R12-L2, R12-L4, R5-B5, R5-B1u`

შენიშვნა: R5-L3 C-მ round 10-სა და 12-ში მეზობელ რეგრესიად გაუშვა და PASS-ია. სიიდან ის მაინც მხოლოდ milestone-ის სრულ რეგრესიაზე ამოვა. Milestone-ის RF5-3-ს ემატება C-R12-01-ის შემოწმება.

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
| R17-T | ბიბლიოთეკის preview-ის ორხაზიანი row რეალურ Windows-ის Georgian font-ებით (288 და 480) — ტექსტი ორ ხაზში ეტევა ან ellipsis-ით მთავრდება, `title` სრულია | headless-ის font metrics შეიძლება განსხვავდებოდეს |
| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) | `data-lenis-prevent` მხოლოდ `/studio-lab`-ზეა |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება:
- purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead);
- instruction-file-ების portable paths;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13; round 16-შიც peak 1.0, 1802 sample);
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით;
- round 6–16-ის დაუკომიტებელი tree;
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
- `/studio-lab` ანონიმურად იხსნება (C round 16-ში G16-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
