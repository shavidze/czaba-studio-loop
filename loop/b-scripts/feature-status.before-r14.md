# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-10 · ავტორი: B (round 12 → round 13 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

„მზადაა“ ნიშნავს, რომ შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება. „მოწმდება“ ნიშნავს, რომ C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება. ბმულები ეხება `tmp/studio-real-loop/`-ს.

მიმდინარე რაუნდი: **Round 13** — SRW-11B ეტაპი 3: მცურავი ვიდეო (VID-06, D-29d) (`current-task.md`). შემდეგ polish 14a–14c და milestone-ის სრული რეგრესია.

Round 12-ის შედეგი (C, `c-round-12.md`): **FAIL** — მხოლოდ R12-S-ის სიტყვასიტყვით წაკითხვაზე.
- **PASS:** R12-W1 (9/9 wrap, `d300` −0.0030…+0.0058; round 10-ში −0.017…−0.020; `videoSettles` = swap-ები, 0 escalation), R12-U (58/58, C-ის mutation-ები M1–M7), R12-Doc, R2-V3, RF5-3 (H2; პირველი Play settle-ს არ რთავს), R5-L3, R5-E1, RF7-P2, dock-ის სწრაფი შემოწმება, G12-1..3. vitest 877/877.
- **R12-S:** 5 ჩაწერა (1.1) პირველ swap-მდე, settle unarmed-ია და გზა უცვლელი. B-მ criterion-ის scope შეასწორა (`plan.md` **D-19b**): R12-S იზომება პირველი arm-იდან, სადაც C-მ 0 ჩაწერა გაზომა. ზღვარი 0.02 უცვლელია.
- **C-R7-01 headless-ში დაიხურა.** Tech Lead-ის quiet-Chrome RF7-3 სავალდებულოა. ახალი Low: **C-R12-01** → milestone-ის RF5-3.
- A-ს reviewer Low 1 (`sourceChanged`-ზე `endSettle` არ არის) მიღებულია კოდის ცვლილების გარეშე (D-19b).

## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5) | R9-C5 milestone-ის რეგრესიაში თავიდან |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (Round 15) |
| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 (Round 15) |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **მუშავდება** (ეტაპი 3, Round 13; SRW-11A მზადაა; ეტაპი 1-ისა და 2-ის ყველა ID PASS-ია; ღიაა C-R8-01 (Medium) და C-R11-01..03 (Low)) | SRW-11A: `c-round-4.md`; ეტაპი 1: `c-round-8.md` §2, `c-round-9.md` §3; ეტაპი 2: `c-round-11.md` §2–§4 | Round 13: მცურავი ვიდეო (D-29d). Polish 14a: C-R11-01..03 (D-29c). C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md` (import), `c-round-4.md`, `c-round-6.md`, `c-round-7.md` (R2-V3), `c-round-10.md` §4, `c-round-12.md` §3 (R2-V3 ×1) | R2-V1 milestone-ის რეგრესიაში თავიდან |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა Round 12-ში) | `c-round-7.md` §2; C-R6-02: `c-round-9.md` (N 3/3, RF5-3 3/3, D 2/3); C-R7-01: `c-round-12.md` §2.1 (R12-W1 9/9) | C-R6-02: Tech Lead quiet Chrome (D layout), VP9 + H.264, drift + loop wrap (RF7-2/RF7-3). C-R12-01: milestone RF5-3 |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **მზადაა** | `c-round-1.md` (24/24); `c-round-10.md` §5–6 (e2e export, G10-3); `c-round-12.md` §6 (G12-3) | — |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md` | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (C-R6-02 ღიაა; C-R7-01 headless-ში დაიხურა) | `c-round-7.md` §2; `c-round-9.md` §2–§3; `c-round-10.md` §2, §4; `c-round-12.md` §2–§3 | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. C-R12-01: milestone RF5-3. Round 13: dock-ის sync effect-ები ბაიტამდე უცვლელია, C უშვებს ერთ wrap run-ს |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** (ვიდეოს landing wrap-ზე R12-W1 PASS; აუდიოს wrap და export PASS) | `c-round-10.md` §4 (R5-L3, R5-E1); `c-round-12.md` §2.1 (R12-W1), §3 (R5-L3 seam 0, R5-E1 maxDiff 0) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md` (R6-S2 სხვადასხვა სიმაღლეზე) | R6-S5 milestone-ის რეგრესიაში |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md` | R7-D2..D5 milestone-ის რეგრესიაში |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md` (R26-*, R30-*) | R8-M3/M4 milestone-ის რეგრესიაში |
| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md` | R9-C5 milestone-ის რეგრესიაში |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა) | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3 (R10-R1/R2) | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; R11A-1/3 `c-round-6.md` | R11A-2 (keys) milestone-ის რეგრესიაში. Round 13 ბიბლიოთეკის collapse-ს controlled-ად აქცევს — C ამოწმებს ◀/▶-ს და preview-ის გაჩერებას |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **მუშავდება** (ეტაპი 3, Round 13; ეტაპი 1-ისა და 2-ის ყველა ID PASS-ია; ღიაა C-R8-01 და C-R11-01..03) | `c-round-8.md` §2, §4; `c-round-9.md` §3–§4; ეტაპი 2: `c-round-11.md` §2–§4; D-29, D-29a–D-29d (`plan.md`) | Round 13: ეტაპი 3 (R13-F1..F6, R13-U, R13-Doc). Polish 14a–14c. C-R8-01: Tech Lead quiet Chrome |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5 (search, stems, e2e) | R12-L2 milestone-ზე. R12-L4: Tech Lead-ის რეალური HTML5 drag |
| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 15, milestone-ის რეგრესიის შემდეგ. Export-ის 0 dBFS hard-clip (R13-M4) აქ შედის |
| SRW-14 | Grid/Snap | **არ დაწყებულა** | — | Round 16 |
| SRW-15 | Bars/Beats, BPM (მხოლოდ ბადე), მეტრონომი | **არ დაწყებულა** | — | Round 16, SRW-14-ის შემდეგ |
| SRW-16 | Markers/Locators | **არ დაწყებულა** | — | Round 17 |
| SRW-17 | ტრეკების ჯგუფები | **არ დაწყებულა** | — | Round 18, SRW-13-ის შემდეგ |
| SRW-18 | Fades + volume envelope | **არ დაწყებულა** | — | Round 19, SRW-13-ის შემდეგ |
| SRW-19 | ვიდეოს opacity fade (preview) | **არ დაწყებულა** | — | Round 20 (SRW-03-ის C-R7-01 headless-ში დაიხურა; C-R6-02 Tech Lead-ზეა) |
| SRW-20 | Range export, MP3 | **არ დაწყებულა** | — | Round 21, SRW-13-ის შემდეგ |
| SRW-21 | შეძენილი ბიბლიოთეკის mount + საბოლოო რეგრესია | **დაბლოკილია** (მხოლოდ route mount) | `backlog.json` SRW-21 | Adapter contract (R21-I1) დამოუკიდებლად სრულდება SRW-20-ის შემდეგ. Route mount-ს Tech Lead-ის ან auth-ის მფლობელის ნებართვა სჭირდება. ცნობილი შეზღუდვა: purchased loader-ში middle-east hardcoded-ია |
| SRW-22 | Studio Lab-ის შესასვლელი header-ში | **მზადაა** | `c-round-4.md`; `c-round-12.md` §6 (header link, Header იდენტურია) | — |
| SRW-23 | Studio-ს scrollbar-ები | **მოწმდება** | `c-round-4.md` (R23-3/R23-4 PASS; R23-1/R23-2 headless-ში ვერ შემოწმდა) | Tech Lead: რეალური Windows Chrome (ვიზუალი, wheel, thumb drag) |

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია: R9-L1/L2 PASS) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout. ფაილები Round 13-ში გაყინულია |
| C-R8-01 | Medium | **ბაგია** (compositor-only contract R9-D3 PASS; R9-D1 2/3, R9-D2 D − N p95 +0.3 ms) | `c-round-9/runs/drift-summary.txt`, `runs/D_3.json`, `c-round-9.md` §2, §7 | Tech Lead quiet Chrome, R3-V1 D layout |
| C-R12-01 | Low | **ბაგია** (start transient; გზა უცვლელია; harness-ის reference-ის ზღვარზე) | `c-round-12/runs/r12s-neighbor.txt`, `r12s-split.txt`, `settlecheck-W.json`; `c-round-12.md` §2.2, §7 | Milestone RF5-3: start-ის rate-ის ჩაწერები + dock-ის live position (D-19b). თუ dock-ის \|d\| ≤ 0.02-ზე rate ≠ 1 დადასტურდა → D-19-ის ბაგი, საკუთარი რაუნდით |
| C-R11-01 | Low | **ბაგია** | `c-round-11/runs/unfold-manual-1440.json` | Polish 14a, D-29c (1): დაკეცილ ხაზზე სახელურს pointer-ის hit area არ აქვს; ↑/↓ მხოლოდ შლის |
| C-R11-02 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-open-selected.json`, `p2a-1280-open-noselect.json` | Polish 14a, D-29c (2): footer selected-clip ხაზის სიმაღლეს იტოვებს |
| C-R11-03 | Low | **ბაგია** | `c-round-11/runs/p2a-1280-afoff-a.json` | Polish 14a, D-29c (3): cap-ის გამორთვისას panel rendered სიმაღლეს ინარჩუნებს |

Critical/High ღია ბაგი არ არის.

**ბოლოს დაიხურა (C, round 12):** C-R7-01 headless-ში (R12-W1, D-19b). Tech Lead-ის RF7-3 რჩება სავალდებულო მტკიცებულებად. **Round 10-ში:** C-R7-02 (R10-R1, R10-R2).

**მიღებული (კოდი არ იცვლება):**
- C-R11-04 — დაკეცილ ხაზზე `aria-valuenow` გაშლის სიმაღლეა, `aria-valuetext` კი `დაკეცილია · {h} px` (N2).
- A-ს round-12 reviewer Low 1 — `sourceChanged`-ზე `endSettle` არ არის: `seekWanted` rate-ის ჩაწერამდე `issueHoldSeek`-მდე მიდის, რომელიც settle-ს ამთავრებს (D-19b).
- `export-clip-onset-1lsb` — export-ის შედარება ≤ 1.2e-7-ით.
- checkpoint-r6 #6 (stale scrub ინარჩუნებს პოზიციას) და #7 (marquee-ს `buttons` check).

**ჩანაწერები (ბაგი არ არის):**
- Harness-ის წესი **H3** მოქმედებს Round 12-დან; R12-S იზომება პირველი arm-იდან (D-19b).
- `sfx-library.test.tsx`-ის timeout load flake-ია (`watch`); round 12-ში არ განმეორებულა.
- Hard seek 8.44–8.48 წმ-ზე Pause-ის ცნობილი snap-ია.
- Round 9-ის ჩანაწერები (reviewer M1, M-R10-1/M2, L2–L8, design-philosopher (a)–(d), L11) და A-ს round-11 follow-up-ები **Round 14-ის panel polish**-შია (14b: detail panel; 14c: context/preview) (`backlog.json` → SRW-11B `polish_round`).
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` ადგილზეა. Commit `c5ed47b`-ის შემდეგ არ ყოფილა: round 6–12-ის Studio სამუშაო (17 M + 12 untracked) დაუკომიტებელია. ეს წესის შესაბამისია (საბოლოო commit/push root-ისაა), მაგრამ რისკი იზრდება.

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
| R11-P3m | Detail-ის გამყოფის, ხაზის სიმაღლის სახელურის და **მცურავი ვიდეოს drag (Round 13)** რეალური მაუსით | synthetic pointer |
| R11-SB | Auto-fit-ის ხილული არე რეალური 10 px-იანი horizontal scrollbar-ით; Round 13-იდან ასევე 1280×720-ზე ბიბლიოთეკის დროებითი გახსნისას (ვიწროვდება timeline) | headless-ში scrollbar 0 px-ია |
| Lenis `/studio/*` | Purchased Studio-ს wheel (protected route) | `data-lenis-prevent` მხოლოდ `/studio-lab`-ზეა |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება: purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21); Lenis `/studio/*`-ზე (Tech Lead); instruction-file-ების portable paths; export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13; round 12-შიც peak 1.0); საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით. Root M1–M3, L1–L4, L6, L7 და L8 დახურულია. Scrollbar-ის მოთხოვნა: SRW-23 (Tech Lead-ის ვიზუალი). ბიბლიოთეკისა და სტემების მოთხოვნა: SRW-12 მზადაა.

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
- `/studio-lab` ანონიმურად იხსნება (C round 12-ში G12-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
