# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-11 · ავტორი: B (round 25 → round 26 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება `tmp/studio-real-loop/`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში — C-R23-01 გაუარესდა.** `/studio-lab`-ის SSR HTML-ში ახლა **8 NUL** byte-ია (იყო 4). სამი მათგანი hydration-მდე **ხილულ ქართულ ტექსტშია**: header-ის დემო badge, ბიბლიოთეკის ტექსტი და `Arrangement ·` სათაური. ეს ჩანს პირველ paint-ზე, JS-ის გარეშე და crawler-ებისთვის. Offset-ები markup-ის ყოველ ცვლილებაზე იძვრის. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). B ამ ნებართვას ვერ გასცემს. პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.

მიმდინარე რაუნდი: **Round 26** (`current-task.md`, D-29q) — SRW-13, ეტაპი 2a: Master-ის ცოცხალი meter და Master Peak/Clip indicator.
- **A:**
  - `meter.ts` (ახალი): peak, release, 1.5 წმ-იანი peak hold, latch. გადატვირთვის პრედიკატი export-ისაა (`x > MAX_24BIT_SAMPLE` ან `x < −1`), ამიტომ ცოცხალი indicator და export ერთნაირად ითვლის.
  - Graph: optional `tap`, master-ის შემდეგ (post-fader), fan-out. `master → destination` უცვლელია, export-ში tap არ არის. B-ის probe: required `createAnalyser` გაყინულ ტესტებში 28 tsc შეცდომას იძლევა, optional tap კი 0-ს (`b-round-25-probe.txt`).
  - Context: AnalyserNode (`getFloatTimeDomainData`, fftSize ≥ 4096), დაცული fake context-ებისთვის. კითხვა `tick`-შია, ცალკე store-ით და frame-ზე 0 render-ით. Stop-ზე meter იწერება floor-ზე.
  - UI `ArrangementMaster`-ში: meter-ის ზოლი და `Master Peak` ღილაკი. ღილაკი აჩვენებს მაქსიმალურ peak-ს dBFS-ში; გადატვირთვისას `+X.X`-ს და warning token-ს. Latch მხოლოდ click-ით სუფთავდება; reset edit არ არის.
  - **R26-X:** Master Mute-ის დროს export dialog gain note-ს აღარ აჩვენებს (C round 25 §5.4).
  - ტესტები: `meter.test.ts`, `meter-ui.test.tsx` (≥ 14 `it`), doc 032.
- **C:** R26-ML, MP, C0, C6, CR, CM, RB, X, E, K, L, R, S, U, Doc, G26-1..3 და C-R23-01-ის ჩანაწერი.

შემდეგ:
- C-R23-01 — Tech Lead-ის პასუხისთანავე, ახალ ფუნქციამდე;
- SRW-13 ეტაპი 2b (ტრეკების meter-ები, lane-ის geometry) → ეტაპი 3 (FB-04 clip gain) → ეტაპი 4 (FB-05 pan, fader-ის UX, round-9 M1/L8).

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 26 -StartPhase A`.

**Round 25-ის შედეგი** (C, `c-round-25.md`): **PASS**, scope-ში ახალი ბაგის გარეშე.
- PASS: R25-MV (Δ −6.000 dB ×3), R25-MM (≤ −60 dBFS click-იდან 14 ms-ში, monotone decay, ვიდეოს ხმაც ჩუმდება), R25-ML (ახალი graph 0, seam 0), R25-E0/EO/E6/EM (1800 FS, alert +5.0 dBFS, −5.0 dB-ზე FS 0, ratio 0.501187, mute-ზე ჩუმი ნამდვილი ფაილი), R25-H, R25-K, R25-L, R25-R, R25-S, R25-U, R25-Doc, G25-1..3 (vitest **1045/1045**, 50 OK, 54 ხაზი).
- B-მ დამოუკიდებლად შეამოწმა: 54 ხაზი = C-ის ბოლო მდგომარეობა, 50 OK, 11 owned sha ემთხვევა, live curl `/studio-lab` NUL **8**.
- დაკვირვებები: export bit-deterministic არ არის (±1 LSB) → byte-იდენტურობა oracle-ად აღარ გამოიყენება; mute + gain note → R26-X; fader-ის 4 px box → ეტაპი 4.

## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5); milestone run 1: `c-round-20.md` §2.1, §2.12 (R1-B5, R9-C5) | — |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე); milestone run 1: `c-round-20.md` §2.10–§2.11 (R8-M3, R8-M4) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 ეტაპი 3 |
| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 ეტაპი 4 |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია**. ღიაა C-R8-01 (Medium, Tech Lead quiet Chrome). SRW-11B end to end milestone run 2-ში PASS-ია; A-ს round-11-ის ყველა follow-up დახურულია (round 23 + round 24 C PASS) | ეტაპები 1–3 და polish: `c-round-8.md`, `c-round-9.md`, `c-round-11.md`, `c-round-13.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; a11y: `c-round-23.md` §2.1–§2.4, `c-round-24.md` §3–§5 | C-R8-01: Tech Lead quiet Chrome. round-9 M1/L8 → SRW-13 ეტაპი 4. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მუშავდება** (ეტაპი 1 — Master Volume/Mute და export-ის გადატვირთვის გაფრთხილება — C-ით დადასტურებულია; ცოცხალი meter და Clip indicator — Round 26) | ეტაპი 1: `c-round-25.md` §3–§8 (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L) | Round 26 → C (R26-ML/MP/C0/C6/CR/CM). Tech Lead: R25-T, R26-T |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md`, `c-round-4.md`, `c-round-6.md`, `c-round-7.md`, `c-round-10.md` §4, `c-round-12.md` §3, `c-round-13.md` §4, `c-round-14.md`; milestone run 2: `c-round-21.md` §2.1 (R2-V1) | Tech Lead: MP4/MOV-ის დადებითი გზა რეალურ Chrome-ში |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (მხოლოდ C-R6-02 — Tech Lead; C-R21-01 დაიხურა Round 22-ში) | `c-round-7.md` §2; `c-round-9.md`; `c-round-12.md` §2.1; `c-round-13.md` §2.5, §3; `c-round-21.md` §2.2–§2.5; mute: `c-round-22.md` §2.1–§2.6 (R22-M1/M2/V/A1..A3 PASS) | C-R6-02: Tech Lead quiet Chrome (RF7-2/RF7-3). R22-T: click ყურით |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე, round 25-ში 8, მათ შორის ხილულ ტექსტში) | `c-round-1.md` (24/24); `c-round-10.md` §5–6; `c-round-13.md` §4–§5; `c-round-14.md`; `c-round-16.md`–`c-round-20.md` (G-3, WAV 18.000 წმ); `c-round-21.md` §1, §2.8; `c-round-23.md` §2.5–§2.6 (G23-3, WAV 864 000 frame); ბაგი: `c-round-23.md` §3 | C-R23-01: Tech Lead-ის არჩევანი (React 19 ან `entry.server.tsx`-ის grant), შემდეგ ცალკე რაუნდი SSR-ის ფართო რეგრესიით |
| SRW-02 | ვიდეოს import (FB-15) | **მზადაა** | `c-round-2.md`, `c-round-4.md`; `c-round-21.md` §2.1 (R2-V1) | — |
| SRW-03 | საერთო transport, ვიდეოს sync, ხმის mute (FB-16) | **ბაგია** (მხოლოდ C-R6-02) | `c-round-7.md` §2; `c-round-9.md`; `c-round-10.md`; `c-round-12.md`; `c-round-13.md`; `c-round-21.md` §2.2–§2.5; `c-round-22.md` §2 (mute, C-R21-01 დაიხურა) | C-R6-02: Tech Lead quiet Chrome. RF7-3 სავალდებულოა. R22-T |
| SRW-04 | Playhead, ruler-ის click/seek | **მზადაა** | `c-round-2.md`; D-27: `c-round-6.md`, `c-round-7.md` (R27-1) | — |
| SRW-05 | Loop brace, sample-accurate wrap | **მოწმდება** | `c-round-10.md` §4; `c-round-12.md` §2.1, §3; `c-round-13.md` §3; `c-round-21.md` §2.4 (R5-L3 seam 0, R5-E1 maxDiff 0) | Tech Lead: quiet-Chrome RF7-3 (VP9 + H.264) |
| SRW-06 | Multi-select, marquee | **მზადაა** | `c-round-3.md`; `c-round-11.md`; `c-round-20.md` §2.5 | — |
| SRW-07 | Duplicate, ჯგუფის split | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.6–§2.9 | — |
| SRW-08 | ხაზებს შორის გადატანა (FB-03) | **მზადაა** | `c-round-5.md`, `c-round-6.md`, `c-round-7.md`; `c-round-20.md` §2.10–§2.11 | — |
| SRW-09 | Clipboard (FB-02) | **მზადაა** | `c-round-5.md`; `c-round-20.md` §2.12 | — |
| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** | `c-round-6.md` §3; `c-round-7.md` §3, §6; `c-round-10.md` §3; `c-round-13.md` §2.2 | Tech Lead: რეალური მაუსი, Ctrl+wheel, pinch |
| SRW-11A | ბიბლიოთეკის პანელი + video dock | **მზადაა** | `c-round-4.md`; `c-round-6.md`; `c-round-13.md` §2.4; `c-round-14.md`, `c-round-16.md`, `c-round-17.md`; `c-round-20.md` §2.15 | — |
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (C-ის ყველა ID PASS-ია, მათ შორის end to end და follow-up-ების ორივე ნაწილი; ღიაა C-R8-01, Medium) | ეტაპები 1–3, polish: `c-round-8.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; follow-up-ები: `c-round-23.md`, `c-round-24.md`; D-29..D-29o (`plan.md`) | C-R8-01: Tech Lead quiet Chrome. round-9 M1/L8: SRW-13 ეტაპი 4. Doc 029 TODO: დაკეცილი ხაზის clip-ები accessibility tree-ში (SRW-17) |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17 | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Tech Lead-ის Windows-ის ფონტები |
| SRW-13 | Clip gain, pan, master, meters | **მუშავდება** (ეტაპი 1 მზადაა — C round 25 PASS; ეტაპი 2a — Round 26) | ეტაპი 1: `c-round-25.md` (R13-M3 PASS; R13-M4-ის export ნაწილი PASS, R25-EO) | ეტაპი 2a: Master-ის meter + latch-იანი Peak/Clip (R13-M4 meter). ეტაპი 2b: ტრეკების meter-ები. ეტაპი 3: FB-04 clip gain (R13-M1). ეტაპი 4: FB-05 pan (R13-M2), fader-ის UX (click, 4 px box), round-9 M1/L8 |
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

## 3. ღია ბაგები

| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| C-R6-02 | Medium | **ბაგია** (app-side კანდიდატები მოგვარებულია) | `c-round-7.md` §2.1; `c-round-8.md` §4; `c-round-9.md` §3 | Tech Lead quiet Chrome, R3-V1 D layout |
| C-R8-01 | Medium | **ბაგია** (R9-D3 PASS; mode D info round 21: max .0183, LoAF 0) | `c-round-9.md` §2, §7; `c-round-21.md` §2.7 (მხოლოდ ინფორმაცია) | Tech Lead quiet Chrome, R3-V1 D layout. L2/L3 მასთან ერთად (D-29h) |
| **C-R23-01** | Medium | **ბაგია — გაუარესდა** (round 25: 8 NUL, 3 ხილულ SSR ტექსტში; B live curl: 8) | `c-round-23.md` §3; `c-round-25.md` §12; `c-round-25/runs/c-r23-01-record.txt` | Tech Lead: (a) React 19 ან (b) `entry.server.tsx`-ის ვიწრო grant A-სთვის NUL-ის ფილტრისთვის (`b-round-23.md` §3). C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს |
| R9-REVIEWER-M1-L8 | Low | **არ დაწყებულა** | `a-round-9.md` l.227–237 | `ArrangementContext.tsx`: `transportRunningRef` latch და position-store-ის შეცდომის ტექსტი. SRW-13 ეტაპი 4-ში (root M1/L8-ისგან განსხვავებულია, ისინი დახურულია) |
| LIB-SEP-REASON | Low | **არ დაწყებულა** | B-მ წაიკითხა: `ArrangementLibrary.tsx:549` | `biome-ignore`-ის მიზეზი პროცესს ასახელებს; პირველ რაუნდში, რომელიც `ArrangementLibrary.tsx`-ს შეცვლის, ან საბოლოო რეგრესიამდე |

Critical/High ღია ბაგი არ არის.

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
| R11-SB | Auto-fit რეალური 10 px scrollbar-ით | headless-ში scrollbar 0 px-ია |
| R13-RM | ნამდვილი `prefers-reduced-motion` | CDP emulation დაბლოკილია |
| R15-SB | ბიბლიოთეკის 10 px scrollbar-ები გაფართოებული ვიდეოს დროს | headless native scrollbar-ს მალავს |
| R17-T | Preview-ის ორხაზიანი row Windows-ის Georgian font-ებით | font metrics |
| R18-T | რეალური wheel detail-ის ველზე | gstack-ს wheel არ აქვს |
| R19-T | Detail-ის ქართული label-ები რეალურ Chrome-ში | font metrics |
| Lenis `/studio/*` | Purchased Studio-ს wheel | protected route |
| MP4/MOV | H.264/AAC-ის დადებითი import | headless Chromium-ის კოდეკები |
| **R22-T** | Mute/unmute-ზე click არ ისმის: მოსმენა ყურსასმენით რეალურ Chrome-ში (τ 3 ms) | headless-ში მოსმენა შეუძლებელია |
| **R25-T** | Master-ის fader რეალური მაუსით; Master Mute/unmute-ზე click არ ისმის (ყურსასმენი) | synthetic pointer; headless-ში მოსმენა შეუძლებელია |
| **R26-T** | Master-ის meter და Clip indicator რეალურ Chrome-ში, დინამიკებით, `lay11`-ზე (0 dB-ზე 4–6 წმ-ში ინთება, −6 dB-ზე არა); meter-ის მოძრაობა იკითხება | headless-ში მოსმენა და ვიზუალური მოძრაობის შეფასება შეუძლებელია |

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება:
- purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead; round 21-ის mode-D rAF სიაშიც ჩანს `/studio-lab`-ზე);
- instruction-file-ების portable paths;
- export-ის hard-clip 0 dBFS-ზე (R13-M4): Round 25-იდან ხილულია (R25-EO: გაფრთხილება + Master-ის შემცირება), Round 26 ცოცხალ Clip indicator-საც ამატებს. Clamp რჩება, limiter ფარგლებს გარეთაა;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით;
- round 6–25-ის დაუკომიტებელი tree (54 ხაზი);
- fake Bearer → 500 (token არ გაიცემა);
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს;
- საერთო `components/ui/Modal.tsx`-ის focus gap;
- root GA consent-denied-ით `scroll`-ს აგზავნის;
- ორი უცხო agent ფაილი;
- `publication-checkpoint.json`-ის მოთხოვნები: ბიბლიოთეკა/სტემები (SRW-12 მზადაა), scrollbar-ები (SRW-23, Tech Lead), T12, საბოლოო commit/push.

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
- `/studio-lab` ანონიმურად იხსნება (C round 21-ში G21-3 დაადასტურა);
- გაკეთებულია სრული რეგრესია და root-ის შემოწმება.

ამის შემდეგ იწყება T12.
