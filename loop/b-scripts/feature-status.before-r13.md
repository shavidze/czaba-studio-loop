# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-10 · ავტორი: B (round 11 → round 12 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება `tmp/studio-real-loop/`-ს.

მიმდინარე რაუნდი: **Round 12** — C-R7-01: swap-ის შემდეგ ვიდეოს settle, დაზუსტებული D-19a (`current-task.md`). Round 13: ეტაპი 3 (მცურავი ვიდეო), თუ C-R7-01 დაიხურა ან Tech Lead-მა quiet-Chrome შედეგი მიიღო; სხვა შემთხვევაში polish 14a. შემდეგ polish 14a–14c და milestone-ის სრული რეგრესია.

Round 11-ის შედეგი (C, `c-round-11.md`): **PASS.** SRW-11B ეტაპი 2-ის ყველა ID (R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U, R11-Doc), მეზობელი რეგრესიები და G11-1..3 PASS-ია, vitest 856/856.
- ახალი Low დაკვირვებები: **C-R11-01..03** → polish 14a (`plan.md` D-29c); **C-R11-04** მიღებული კონვენციაა (კოდი არ იცვლება).
- Export-ის 1 LSB სხვაობა clip-ის onset-ზე determinism control-შიც ჩანს → მიღებული ჩანაწერი `export-clip-onset-1lsb`. Export-ის შედარება ≤ 1.2e-7-ით რჩება.

## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5) | R9-C5 milestone-ის რეგრესიაში თავიდან |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*) | Round 11: R8-M1 სხვადასხვა სიმაღლის ხაზებზე. Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (Round 15) |
| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 (Round 15) |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია** (SRW-11A მზადაა; ეტაპი 1-ისა და ეტაპი 2-ის ყველა ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R11-01..03 (Low); ეტაპი 3 არ დაწყებულა) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4 | C-R8-01: Tech Lead quiet Chrome. Round 13: მცურავი ვიდეო. Polish 14a: C-R11-01..03 (D-29c). Tech Lead: R11-P3m, R11-SB |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md` (import), `c-round-4.md`, `c-round-6.md`, `c-round-7.md` (R2-V3), `c-round-10.md` §4 (R2-V3 ×1) | R2-V1 milestone-ის რეგრესიაში თავიდან |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (C-R7-01 მუშავდება, Round 12) | `c-round-7.md` §2; C-R6-02: `c-round-9.md` (N 3/3, RF5-3 3/3, D 2/3); C-R7-01: `c-round-10.md` §2 (6/9, `d` +300 −0.017…−0.020) | Round 12: C-R7-01 (დაზუსტებული D-19a, verdict R12-W1). C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3) | — |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md` | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (C-R7-01 მუშავდება) | `c-round-7.md` §2; `c-round-9.md` §2–§3; `c-round-10.md` §2, §4 | Round 12: C-R7-01 (დაზუსტებული D-19a). C-R6-02: Tech Lead quiet Chrome |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **ბაგია** (ვიდეოს landing wrap-ზე, C-R7-01; აუდიოს wrap და export PASS-ია) | `c-round-10.md` §2 (R10-W1), §4 (R5-L3 seam 0 sample, R5-E1 maxDiff 0) | Round 12: C-R7-01 (D-19a, SRW-03-ის ბაგი) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md` | Round 11: R6-S2 სხვადასხვა სიმაღლეზე. R6-S5 milestone-ის რეგრესიაში |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md` | R7-D2..D5 milestone-ის რეგრესიაში |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md` (R26-*, R30-*) | R8-M3/M4 milestone-ის რეგრესიაში |
| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md` | R9-C5 milestone-ის რეგრესიაში |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა) | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3 (R10-R1/R2) | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; R11A-1/3 `c-round-6.md` | R11A-2 (keys) milestone-ის რეგრესიაში |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (ეტაპი 1-ისა და 2-ის ყველა ID PASS-ია; ღიაა C-R8-01 და C-R11-01..03; ეტაპი 3 არ დაწყებულა და SRW-03-ს ელოდება) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4, `c-round-11/shots/`; D-29, D-29a, D-29b, D-29c (`plan.md`) | Round 13: ეტაპი 3 (ან polish 14a, თუ R12-W1 ჩავარდა). Polish 14a–14c. C-R8-01: Tech Lead quiet Chrome |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e) | R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag |
| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 15, milestone-ის რეგრესიის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის |
| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 16 |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 16, SRW-14-ის შემდეგ |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 17 |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 18, SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 19, SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 20, SRW-03-ის დახურვის შემდეგ |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 21, SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. ცნობილი შეზღუდვა: purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-10.md` §1, §6 (Header იდენტურია, G10-3) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS; R23-1/R23-2 headless-ში ვერ შემოწმდა) | Tech Lead: რეალური Windows Chrome (ვიზუალი, wheel, thumb drag) |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| C-R7-01 | Medium | **მუშავდება** (Round 12; მიზეზი დადგინდა; D-19a დაზუსტდა: settle მთავრდება band-ში ხელახლა შესვლისას, K ∈ [8, 9], rate ≤ 1.45, D-24-ს უპირატესობა) | `c-round-10.md` §2, §7; `c-round-10/runs/w-table.txt`, `*_wrapdetail.json`; `a-round-10/runs/*_wraps.json` | Round 12: დაზუსტებული D-19a (swap-ის შემდეგ settle band ≤ 0.008, მდგრადი წესი უცვლელია). Verdict R12-W1 H3 წესით, 0 escalation და R12-S (rate არ "ნადირობს"). Tech Lead-ის quiet-Chrome RF7-3 სავალდებულო მტკიცებულებაა. ეტაპი 3 მის დახურვას ელოდება |
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია: R9-L1/L2 PASS) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout. ფაილები Round 11–12-ში გაყინულია |
| C-R8-01 | Medium | **ბაგია** (compositor-only contract R9-D3 PASS; R9-D1 2/3, R9-D2 D − N p95 +0.3 ms) | `c-round-9/runs/drift-summary.txt`, `runs/D_3.json`, `c-round-9.md` §2, §7 | Tech Lead quiet Chrome, R3-V1 D layout. Round 11-ში ერთი mode-D info run (round 9-ზე უარესი არ უნდა იყოს) |

| C-R11-01 | Low | **ბაგია** | `c-round-11/runs/unfold-manual-1440.json` | Polish 14a, D-29c (1): დაკეცილ ხაზზე სახელურს pointer-ის hit area არ აქვს; ↑/↓ მხოლოდ შლის |
| C-R11-02 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-open-selected.json`, `p2a-1280-open-noselect.json` | Polish 14a, D-29c (2): footer selected-clip ხაზის სიმაღლეს იტოვებს |
| C-R11-03 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-afoff-a.json` | Polish 14a, D-29c (3): cap-ის გამორთვისას panel rendered სიმაღლეს ინარჩუნებს |

**მიღებული კონვენცია (round 11):** C-R11-04 — დაკეცილ ხაზზე `aria-valuenow` გაშლის სიმაღლეა, `aria-valuetext` კი `დაკეცილია · {h} px` (N2). კოდი არ იცვლება.

**ბოლოს დაიხურა (C, round 10):** C-R7-02 (R10-R1, R10-R2). Named exception R10-N5-U ჩაწერილია `backlog.json`-ში.

**Round 10-ის ჩანაწერები (ბაგი არ არის):**
- Harness-ის წესი **H3** (wrap landing ერთ row-ზე: |vt − expected(ctx)| ≤ 0.01, ან ზუსტ +0.300-ზე ინტერპოლაცია) Round 12-ის verdict-იდან მოქმედებს. Round 10 მით თავიდან არ ფასდება.
- `sfx-library.test.tsx`-ის timeout A-მ round 10-ში ერთხელ ნახა. C-მ ვერ გაიმეორა: ეს load flake-ია და ღია finding-ად `watch` სტატუსითაა ჩაწერილი.
- C round 10 §9-ში root L8 შეცდომით ეწერა. ის დახურულია (R4-B6, `c-round-4.md` §7).
- Hard seek 8.44–8.47 წმ-ზე Pause-ის ცნობილი snap-ია და ახალი არაფერია.

**Round 9-ის ჩანაწერები (ბაგი არ არის):** reviewer M1 (latch), M-R10-1/M2 (preview-ის 20 Hz re-render), L2–L8, design-philosopher (a)–(d) და reviewer L11 ახლა **Round 14-ის panel polish**-შია (14b: detail panel; 14c: context/preview; A-ს round-11 follow-up-ები თავისი ფაილის ქვე-რაუნდში) (`backlog.json` → SRW-11B `polish_round`). მათი ფაილები Tech Lead-ის run-ისა და Round 12-ისთვის გაყინულია. Root-ისთვის: უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` round 10-ის ბოლოსაც ადგილზეა.

**მიღებული შენიშვნები (ბაგი არ არის):** checkpoint-r6 #6 (stale scrub ინარჩუნებს პოზიციას) და #7 (marquee-ს `buttons` check).

## 4. რეგრესიის ვალი (PASS არ არის)

ქვემოთ ჩამოთვლილი ID-ები ადრეულ რაუნდებში გავიდა, მაგრამ C-მ round 6-ის შემდეგ თავიდან არ გაუშვა. სამუშაო წესის მიხედვით, ისინი milestone-ის სრულ რეგრესიაზე შემოწმდება: SRW-11B-ისა და polish-ის დასრულებისას, საერთო ინფრასტრუქტურის ცვლილებისას, ან უფრო ადრე, თუ რეგრესიის კონკრეტული მტკიცებულება გამოჩნდება.

`R1-B5, R2-V1, R3-V2, R3-V4, R4-B1, R5-L3, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R11A-2 (keys), R12-L2, R12-L4, R5-B5, R5-B1u`

შენიშვნა: R5-L3 C-მ round 10-ში მეზობელ რეგრესიად გაუშვა და PASS-ია (`c-round-10.md` §4). სიიდან ის მაინც მხოლოდ milestone-ის სრულ რეგრესიაზე ამოვა.

## 5. Tech Lead-ის ხელით შემოწმებები (რეალური Chrome/მაუსი)

| ID | რა | რატომ |
|---|---|---|
| R23-1 / R23-2 | Scrollbar-ის ვიზუალი; wheel და thumb drag | headless Chromium native scrollbar-ს მალავს; gstack-ს wheel არ აქვს |
| R12-L4 | ბიბლიოთეკიდან ხაზზე HTML5 drag რეალური მაუსით | C synthetic DragEvent-ს იყენებს |
| RF7-2 / RF7-3 | ვიდეოს drift (R3-V1, მათ შორის **mode D**: panel ღია, music მონიშნული) და loop wrap-ის landing (RF5-2, H3 წესით) სუფთა Windows Chrome-ზე, VP9 + H.264 | **სავალდებულოა** C-R8-01-ისა და C-R6-02-ისთვის; C-R7-01-ისთვის Round 12-ის D-19a-ს შემდეგაც. Headless decoder-ის post-start freeze გარემოს თვისებაა |
| R8-M1 / R8-M2 | ხაზებს შორის drag Shift-ით, რეალური მაუსით | synthetic pointer |
| R10-N1 / R10-N2 | Ruler drag, რეალური Ctrl+wheel და pinch | gstack-ს wheel არ აქვს |
| R30-H1 | Volume slider-ი რეალური მაუსით / multi-touch-ით / focus-ის რიგით clip gesture-ის დროს (D-30) | synthetic pointer |
| R11-P3m | Detail-ის გამყოფის, **ხაზის სიმაღლის სახელურის (Round 11)** და მცურავი ვიდეოს drag რეალური მაუსით | synthetic pointer |
| R11-SB | Auto-fit-ის ხილული არე რეალური 10 px-იანი horizontal scrollbar-ით (`clientHeight` − ruler − loop strip − border-ები) | headless-ში scrollbar 0 px-ია |
| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) | `data-lenis-prevent` მხოლოდ `/studio-lab`-ზეა |

## 6. შემდეგი ეტაპი

| ID | სტატუსი | შენიშვნა |
|---|---|---|
| T12-GAIN-VOLUME | **არ დაწყებულა** | იწყება მხოლოდ თავდაპირველი scope-ის (SRW-01..23) დადასტურებული დასრულების შემდეგ. წყაროები: `docs/technical/studio-real-workspace/next-stage-t12/` |

ფარგლებს გარეთაა მთელი პროექტისთვის: plugins/effects, pitch, ვიდეოს რამდენიმე ფენა და აუდიოს time-stretch. Grid-ის tempo აუდიოს stretch არ არის.

## 7. დასრულების პირობა

COMPLETE დგება მხოლოდ მაშინ, როცა ყველა პირობა შესრულებულია:
- FB-01..16 და SRW-01..23 C-ის მტკიცებულებით „მზადაა“ სტატუსშია (SRW-21-ის route mount მხოლოდ ნებართვით);
- critical/high ღია ბაგი არ არის;
- build, tsc, check და ტესტები მწვანეა;
- შესყიდვის დაცვა უცვლელია;
- `/studio-lab` ანონიმურად იხსნება (C round 10-ში G10-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
