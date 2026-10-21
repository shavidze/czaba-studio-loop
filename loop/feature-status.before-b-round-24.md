# Studio — ფუნქციების სტატუსის დაფა

განახლდა: 2026-10-11 · ავტორი: B (round 23 → round 24 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება `tmp/studio-real-loop/`-ს.

მიმდინარე რაუნდი: **Round 24** (`current-task.md`, D-29o) — A-ს round-11 follow-up-ები, ნაწილი 2.
- **A:** Home ფოკუსირებულ `role=separator`-ზე `preventDefault`-ს ინარჩუნებს, მაგრამ seek-ს აღარ აკეთებს (ახალი Home/End ქცევა არ ემატება). `scroller.nextElementSibling` → ცხადი `detailPanelRef`, `ArrangementDetailPanel`-ის `panelRef` prop-ით (`asideRef`-ის precedent; `forwardRef` არა, რადგან გაყინული `render-budget` ტესტი render-ებს სახელით ითვლის). ქცევა არ იცვლება. ტესტები `track-layout.test.tsx`-ში (ჯერ წითლად, ≥ 3 `it`), doc 030.
- **C:** R24-H (Home სამივე separator-ზე, 1440/1280, playback-ის დროსაც), R24-HC (Home სხვაგან ისევ 0-ზე), R24-F (R11-P2a refit, detail drag, მცურავი ვიდეო), R24-R, R24-S, R24-U, R24-Doc, G24-1..3, export sanity (`lay11`), C-R23-01-ის NUL-ის ჩანაწერი (ინფორმაცია).

შემდეგ:
- C-R23-01 — Tech Lead-ის პასუხისთანავე (React 19 ან `entry.server.tsx`-ის ვიწრო grant), ახალ ფუნქციამდე;
- SRW-13 (ეტაპი 1: master bus + export hard-clip, შემდეგ clip gain, pan, meters).

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 24 -StartPhase A`.

**Round 23-ის შედეგი** (C, `c-round-23.md`): **PASS** + ერთი ახალი ბაგი.
- PASS: R23-F1 (4 უნიკალური `aria-controls` lane body-ზე, fold/unfold-ის შემდეგაც), R23-F2 (round 16-ის უარი), R23-N (inset ring, არ იჭრება; folded 36 და tight video 52, 1440/1280), R23-R, R23-S, R23-U (C-ის mutation `store/`-ის გარეთ), R23-Doc, G23-1..3 (vitest 1007/1007, 50 OK, 46 ხაზი), export sanity (864 000 frame, NaN 0).
- **ახალი C-R23-01 (Medium):** `/studio-lab`-ის SSR HTML-ში 4 NUL byte; music-ის სახელის ღილაკის `aria-label`-ში 2 × U+FFFD მთელი სესია რჩება. მიზეზი `react-dom@18.3.1`-ის `writeStringChunk`-ია. B-მ დამოუკიდებლად გაიმეორა (live curl: 4 NUL; `/`, `/products`, `/about`, `/studio/middle-east` — 0). გამოსწორება `entry.server.tsx`-ს ან `package.json`-ს სჭირდება → Tech Lead-ის გადაწყვეტილება (`b-round-23.md` §3).

## 1. მომხმარებლის თავდაპირველი მოთხოვნები (FB-01..FB-16)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** (C-ის ყველა ID PASS-ია; C-R7-02 დაიხურა Round 10-ში) | მოდელი/ruler: `c-round-1.md` (R1-B7). ნავიგაცია: `c-round-6.md` §3, `c-round-7.md` §3 (R10-N5r). C-R7-02: `c-round-10.md` §3 (R10-R1, R10-R2) | Tech Lead: რეალური მაუსი/wheel/pinch (R10-N1/N2) |
| FB-02 | Cut (სიცარიელით) vs Cut Time | **მზადაა** | `c-round-1.md` (Delete Time), `c-round-5.md` (R9-C1..C5); milestone run 1: `c-round-20.md` §2.1, §2.12 (R1-B5, R9-C5) | — |
| FB-03 | კლიპის სხვა ხაზზე გადატანა, დროის ჩაკეტვა | **მზადაა** | `c-round-5.md` (R8-M*), `c-round-6.md` (R26-*, R6-G1/H1), `c-round-7.md` (R26-1..3, R30-*), `c-round-11.md` (R8-M1 სხვადასხვა სიმაღლეზე); milestone run 1: `c-round-20.md` §2.10–§2.11 (R8-M3, R8-M4) | Tech Lead: რეალური მაუსი (R8-M1/M2) |
| FB-04 | Clip Gain, ტრეკის Volume-ისგან ცალკე | **არ დაწყებულა** | — | SRW-13 (round 24-ისა და C-R23-01-ის შემდეგ) |
| FB-05 | Pan | **არ დაწყებულა** | — | SRW-13 |
| FB-06 | ხმის ავტომაცია და fade-ები | **არ დაწყებულა** | — | SRW-18 (SRW-13-ის შემდეგ) |
| FB-07 | ვიდეოს Opacity fade | **არ დაწყებულა** | — | SRW-19 |
| FB-08 | პანელების განლაგება | **ბაგია**. ღიაა C-R8-01 (Medium, Tech Lead quiet Chrome). SRW-11B end to end milestone run 2-ში PASS-ია; lane header-ის a11y ნაწილი 1 C PASS (round 23) | ეტაპები 1–3 და polish: `c-round-8.md`, `c-round-9.md`, `c-round-11.md`, `c-round-13.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; a11y ნაწილი 1: `c-round-23.md` §2.1–§2.4 | Round 24 (მიმდინარე): `StudioWorkspace.tsx` (Home separator-ზე, `panelRef`). M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Tech Lead: R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T |
| FB-09 | Bars/Beats + Metronome | **არ დაწყებულა** | — | SRW-15 |
| FB-10 | Markers/Locators | **არ დაწყებულა** | — | SRW-16 |
| FB-11 | Tempo (მხოლოდ ბადე, stretch-ის გარეშე) | **არ დაწყებულა** | — | SRW-15 (D-10) |
| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **არ დაწყებულა** | — | SRW-17 |
| FB-13 | Grid, Snap, თავისუფალი რეჟიმი | **არ დაწყებულა** | — | SRW-14 |
| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **არ დაწყებულა** | — | SRW-13 |
| FB-15 | „ვიდეო ვერ შევაგდე“ | **მზადაა** | `c-round-2.md`, `c-round-4.md`, `c-round-6.md`, `c-round-7.md`, `c-round-10.md` §4, `c-round-12.md` §3, `c-round-13.md` §4, `c-round-14.md`; milestone run 2: `c-round-21.md` §2.1 (R2-V1) | Tech Lead: MP4/MOV-ის დადებითი გზა რეალურ Chrome-ში |
| FB-16 | საერთო Play/Playhead, ვიდეოს ხმის Mute | **ბაგია** (მხოლოდ C-R6-02 — Tech Lead; C-R21-01 დაიხურა Round 22-ში) | `c-round-7.md` §2; `c-round-9.md`; `c-round-12.md` §2.1; `c-round-13.md` §2.5, §3; `c-round-21.md` §2.2–§2.5; mute: `c-round-22.md` §2.1–§2.6 (R22-M1/M2/V/A1..A3 PASS) | C-R6-02: Tech Lead quiet Chrome (RF7-2/RF7-3). R22-T: click ყურით |

## 2. Backlog-ის ერთეულები (SRW)

| ID | სახელწოდება | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე) | `c-round-1.md` (24/24); `c-round-10.md` §5–6; `c-round-13.md` §4–§5; `c-round-14.md`; `c-round-16.md`–`c-round-20.md` (G-3, WAV 18.000 წმ); `c-round-21.md` §1, §2.8; `c-round-23.md` §2.5–§2.6 (G23-3, WAV 864 000 frame); ბაგი: `c-round-23.md` §3 | C-R23-01: Tech Lead-ის არჩევანი (React 19 ან `entry.server.tsx`-ის grant), შემდეგ ცალკე რაუნდი SSR-ის ფართო რეგრესიით |
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
| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **ბაგია** (C-ის ყველა ID PASS-ია, მათ შორის end to end და a11y ნაწილი 1; ღიაა C-R8-01, Medium) | ეტაპები 1–3, polish: `c-round-8.md`–`c-round-19.md`; milestone run 2: `c-round-21.md` §2.6; a11y ნაწილი 1: `c-round-23.md`; D-29..D-29o (`plan.md`) | Round 24 (მიმდინარე): ნაწილი 2. M1/L8: Tech Lead-ის run-ის შემდეგ ან SRW-13-თან. C-R8-01: Tech Lead quiet Chrome. Doc 029 TODO: დაკეცილი ხაზის clip-ები accessibility tree-ში რჩება (SRW-17-ის კანდიდატი) |
| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **მზადაა** | `c-round-4.md`–`c-round-7.md`; `c-round-10.md` §5; `c-round-17.md` §2–§4; `c-round-20.md` §2.13, §2.16–§2.17 | R12-L4: Tech Lead-ის რეალური HTML5 drag. R17-T: Tech Lead-ის Windows-ის ფონტები |
| SRW-13 | Clip gain, pan, master, meters | **არ დაწყებულა** | — | Round 24-ისა და C-R23-01-ის შემდეგ. ეტაპი 1: master bus + export hard-clip. შედის export-ის 0 dBFS hard-clip (R13-M4; round 22-ში lay11-ზე 1800 sample FS-ზე) და volume slider-ის click-ის ხტომის UX შენიშვნა (C round 22 §5) და M1/L8, თუ Tech Lead-ის run მანამდე არ გაკეთდება. საჭიროებისას ეტაპებად |
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
| **C-R23-01** | Medium | **ბაგია** (ახალი; B-მა დამოუკიდებლად გაიმეორა) | `c-round-23.md` §3; `c-round-23/runs/ssr-1..3.html` | Tech Lead: (a) React 19 ან (b) `entry.server.tsx`-ის ვიწრო grant A-სთვის NUL-ის ფილტრისთვის (`b-round-23.md` §3). C ყოველ round-ში NUL-ის რაოდენობას ინფორმაციად წერს |
| LIB-SEP-REASON | Low | **არ დაწყებულა** | B-მ წაიკითხა: `ArrangementLibrary.tsx:549` | `biome-ignore`-ის მიზეზი პროცესს ასახელებს; პირველ რაუნდში, რომელიც `ArrangementLibrary.tsx`-ს შეცვლის, ან საბოლოო რეგრესიამდე |

Critical/High ღია ბაგი არ არის.

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

## 6. Root-ის გადატანილი საკითხები (`root-pre-push-review.md`, `publication-checkpoint.json`)

ღიაა და გულწრფელად გადაიტანება:
- purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead; round 21-ის mode-D rAF სიაშიც ჩანს `/studio-lab`-ზე);
- instruction-file-ების portable paths;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13);
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით;
- round 6–23-ის დაუკომიტებელი tree;
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
