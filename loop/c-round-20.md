# C — Round 20 შემოწმება: milestone regression run 1 (non-sync editing IDs) + doc 027 relabel (D-29k)

შემმოწმებელი: C (Claude Opus 5.5) · თარიღი: 2026-10-11 · დავალება: `current-task.md` (round 20) · A-ს ანგარიში: `a-round-20.md`
Browser: gstack browse, state `c-browse.json`, სერვერი `http://127.0.0.1:5173` (არ გამიშვია/გამიჩერებია). Source-ში ცვლილება არ შემიტანია. Commit არ ყოფილა. ყველა ფაილი: `c-round-20/`.

## 0. ვერდიქტი — **PASS** (ახალი ბაგი არ არის)

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R1-B5 (FB-02) | **PASS** | `runs/r1-b5-r9-c5.txt`, `shots/b5-range-1440.png` |
| R4-B1 | **PASS** (clip, brace, trim) | `runs/r4-b1-r5-l4.txt` |
| R5-L4 | **PASS** | `runs/r4-b1-r5-l4.txt` |
| R5-L5 | **PASS** (ა–ე) | `runs/r5-l5.txt` |
| R6-S5 | **PASS** (Ctrl+E ქვეპუნქტი D-25-ით; იხ. §2.5) | `runs/r6-s5.txt` |
| R7-D2 | **PASS** | `runs/r7-d2-d4-d5.txt` |
| R7-D3 | **PASS** | `runs/r7-d3.txt` |
| R7-D4 | **PASS** | `runs/r7-d4.txt` |
| R7-D5 | **PASS** | `runs/r7-d2-d4-d5.txt` |
| R8-M3 (FB-03) | **PASS** | `runs/r8-m3-m4.txt` |
| R8-M4 (FB-03) | **PASS** | `runs/r8-m3-m4.txt` |
| R9-C5 (FB-02) | **PASS** | `runs/r1-b5-r9-c5.txt` |
| R5-B5 | **PASS** | `runs/r5-b5.txt`, `shots/r5b5-zzz-1440.png` |
| R5-B1u | **PASS** (static read + 14/14) | `gates/vitest-reentry.txt` |
| R11A-2 keys + synthetic drag | **PASS** (1440×900, 1280×720) | `runs/r11a2-r12l2-{1440x900,1280x720}.txt` |
| R12-L2 | **PASS** (1440×900, 1280×720) | იგივე; `shots/r12l2-*.png` |
| R12-L4 (synthetic half) | **PASS**; რეალური HTML5 drag → Tech Lead (არა PASS) | `runs/r12-l4.txt` |
| R20-Doc | **PASS** | `gates/doc027-diff.txt`, `gates/doc027-sha.txt`, §4 |
| G20-1 | **PASS** | `gates/tsc.txt`, `vitest-all.txt`, `biome-app.txt`, `build.txt` |
| G20-2 | **PASS** | `gates/sha-b19*.txt`, `protected.txt`, `git-status-*.txt`, `header-diff.txt`, `forbidden-status.txt`, `diff-stat.txt` |
| G20-3 | **PASS** — premium auth bypass არ არის | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| Real export sanity | **გაიარა** (hard-clip — ცნობილი carry R13-M4) | `runs/export-sanity.txt`, `shots/export-dialog-1440.png` |

ქვემოთ ყველა რიცხვი ჩემი გაზომვაა. A-ს ციფრები მხოლოდ შესადარებლად გამოვიყენე.

## 1. Gates

### G20-1 (`gates/run-gates.sh`)
- `tsc --noEmit`: exit 0, output ცარიელი.
- `vitest run`: **57 files, 999/999**, exit 0. `sfx-library` flake არ განმეორდა.
- `vitest run gesture-reentry.test.tsx --reporter=verbose`: 14/14.
- `biome check ./app` (read-only): 323 ფაილი, „No fixes applied“, 218 warning + 1 info (არსებული), **0 error**, exit 0.
- `npm run build`: exit 0, „built in 2.30s“.

### G20-2
- Protected-baseline: **4/4 OK**.
- `sha256sum -c b-round-19-tree-sha256.txt`: **49 OK, მხოლოდ doc 027 FAILED** — დასაწყისში და ბოლოს (`sha-b19.txt`, `sha-b19-end.txt`).
- Backup `a-round-20/bak/027.base.md` = `d2e4e8df…` (b-round-19-ის ჩანაწერი). ახალი doc 027 = `9a75b672…` (A-ს §2-ს ემთხვევა).
- `git status --short`: 42 ხაზი, დასაწყისი და დასასრული ორივე **იდენტურია** `c-round-19/gates/git-status-end.txt`-ის.
- `git diff --stat`: 18 ფაილი (§3.1-ის M ფაილები), +2857/−385. HEAD `c5ed47b`.
- `git diff -- Header.tsx` ცარიელია; `git diff --stat cc1e531 -- Header.tsx` = +21/−0.
- `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `components/layout`, `public`, `package.json`/lock, `studio-lab-demo.ts`: `git status`-ში 0 ხაზი.
- უცხო `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` არ წამიკითხავს და არ შემხებია.

### G20-3 (`$B restart`, ახალი context, credentials არა, harness არ ჩამიტვირთავს)
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, `network-anon-direct.txt`, 156 მოთხოვნა): `auth_user` null, cookie ცარიელი, localStorage-ში მხოლოდ `czaba_session_id`; workspace ჩაიტვირთა. `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 host: **0**. ერთადერთი API — ცნობილი root `GET localhost:5199/api/cart` (pending). Media: მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`.
- **fetch/XHR hook სესიაში** (`anon-session-hook.json`): search `soft` → რეალური click option-ზე → რეალური Enter (1 clip დაემატა). `Authorization` **0**, fetch 0, XHR 0.
- **Header-ის „Studio LabDemo“ ბმულზე რეალური `$B click`** `/`-დან (`anon-header.json`, 198 მოთხოვნა): შედეგი `/studio-lab`, auth null, აკრძალული მოთხოვნა 0. Pattern hit მხოლოდ `GET /app/lib/r2.config.ts` (Vite dev module, არა R2 host) და `/api/cart`.
- **`curl`** (`curl-token.txt`): anonymous → **401** `Please sign in to access Studio.`; fake Bearer → 500 `Unable to prepare Studio access`, token არ გაიცა (carry).
- **`/studio/middle-east`** → „Sign in required“, workspace არა, media 0 (`anon-studio-me.json`, `network-anon-studio-me.txt`; `DownloadDialog.tsx` მხოლოდ Vite module-ია).

### Real export sanity (`runs/export-sanity.txt`)
Layout ტოლია `lay11`-ის: video 0–6.008, music 0–16, stems (pulse) 2–18, SFX (impact) 4–6. `Export`-ზე და `WAV-ის ექსპორტი`-ზე რეალური `$B click`, შემდეგ `დახურვა`-ზე რეალური click (dialog დაიხურა).
- RIFF/WAVE, PCM, 2 ch, 48 kHz, 24-bit; **864 000 frame = 18.000 წმ**; dialog: „WAV შეიქმნა: 00:18.000, 24-bit · 48 kHz · stereo.“
- **NaN 0**. Full-scale (|x| ≥ 1 − 2⁻²³) **1800 sample**, peak 1.0 — ცნობილი R13-M4 hard-clip (SRW-13), ახალი არ არის. ბოლო არანულოვანი sample 17.99998 წმ-ზე.

## 2. Regression run 1 — დეტალები

Harness: „რეალური click“ = `$B click` ელემენტის ცენტრზე; ყველა key = რეალური `$B press`. Pointer drag-ები **synthetic-ია** `buttons: 1`-ით (clip, brace, trim, range, separator, marquee), როგორც წინა round-ებში. Layout-ები ავაწყე UI-ით (`lay11`) ან arrangement-ის საკუთარი `commitArrangement`-ით (task-ით ნებადართული), ზუსტი cliptable თითოეულ run ფაილში წერია (`lane, start, length, offset`). State-ის წასაკითხად გამოვიყენე context value-ის read-only reader (`scripts/st20.js`). Viewport 1440×900, თუ სხვა არ წერია.

### 2.1 R1-B5 (FB-02) — mapping: music = `demo-synth-mix` 8–15 offset 3; hero = `demo-hero-music` **stems ხაზზე 20–26** (ორიგინალში სიგრძე არ იყო მითითებული; 6 წმ ავიღე export-ის ზომის შესამცირებლად); impact SFX 4–6; range 9–11 (synthetic drag music clip-ზე); playhead 30.
- Range-ის დროს: footer-ში ხილულია `Delete = დროის წაშლა, სიცარიელე დაიხურება ყველა ხაზზე`. Transport ღილაკის ხილული label მუდმივია `⌫ წაშლა`; title = `დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე (Delete)`, aria-label = `⌫ წაშლა — დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე`. Range-ის გარეშე: `კლიპის წაშლა — სიცარიელე დარჩება`. ეს არის C-R3-06-ით დაშვებული „მუდმივი label + hint“.
- რეალური `Delete` → music `8–9 (off 3)` + `9–13 (off 6)`; hero 20→**18**; impact უცვლელია; playhead **30→28**; ერთი ჩანაწერი `დროის წაშლა`; status `⌫ წაიშალა 00:09.000 — 00:11.000; სიცარიელე დაიხურა ყველა ხაზზე.`
- Export oracle (ორი export, 26.000 → 24.000 წმ): 0–9 ≡ 0–9 **maxDiff 0**; music 11+k ≡ 9+k (4 წმ) **0**; hero 20+k ≡ 18+k (6 წმ) **0**; 13–18 = **ზუსტი ნულები** (240 000 frame, 0 არანულოვანი). ზღვარი 2⁻²² (2.38e-7) — ყველა 0.
- ერთი რეალური Ctrl+Z → arrangement **deep-equal** (JSON). Playhead 28-ზე რჩება — კრიტერიუმი მხოლოდ arrangement-ს ეხება.

### 2.2 R4-B1 — layout: video 0–6.008, music 0–16, stems (pulse) 2–18, SFX 4–6; loop 2–4 შექმნილი range + რეალური Ctrl+L-ით (`Loop შეიქმნა`); შემდეგ trim + Ctrl+Z, რომ Redo ხელმისაწვდომი ყოფილიყო (`Trim — მარჯვენა კიდე`).
- **Clip drag** (header +80 px, synthetic, ხელი არ აუშვია) → რეალური Ctrl+Z: status ზუსტად `Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`; Undo `Loop შეიქმნა`, Redo `Trim — მარჯვენა კიდე` — უცვლელი; loop 2–4 enabled. Release → ერთი ჩანაწერი `კლიპის გადატანა` (stems 2→4). ერთი Undo → base-ის deep-equal.
- **Brace body drag** (+1 წმ) → იგივე status, history უცვლელი; release → `Loop-ის დიაპაზონი` (3–5); Undo → deep-equal.
- **Trim** (stems მარჯვენა კიდე −40 px) → იგივე status, history უცვლელი; release → `Trim — მარჯვენა კიდე` (length 15); Undo → deep-equal.
- Redo release-ის შემდეგ null-ია — ახალი commit-ის ბუნებრივი ქცევა; drag-ის განმავლობაში უცვლელი იყო.

### 2.3 R5-L4 — loop 2–4, playhead 9.
- End edge drag +1 წმ → 2–5 (length 3); body drag +2 → 4–7 (length 3 შენარჩუნდა); body 0 px (no-op) → ჩანაწერი არ დაემატა.
- Focus brace-ზე (`aria-label`: `Loop 00:04.000 — 00:07.100 · ← → გადაადგილება · Shift + ← → სიგრძე`), რეალური → 4.1–7.1; ← 4–7; Shift+→ 4–7.1 (ბიჯი 0.1).
- 6 რეალური Ctrl+Z ზუსტად უკან მიჰყვება: 4–7 → 4.1–7.1 → 4–7 → 2–5 → 2–4 (`Loop შეიქმნა`) → null. ე.ი. 5 ჟესტი/key = 5 ჩანაწერი, no-op = 0.
- Playhead მთელ დროს 9-ზე იყო (seek არა), range null (range არა).

### 2.4 R5-L5 (D-17) — layout: music 0–16, SFX impact 3–5, video 30–36; loop 2–4 enabled. Space და Ctrl+L რეალურია. Source-ები დავთვალე `AudioBufferSourceNode.start/stop` patch-ით (`scripts/l5.js`: node-ის `when/offset/duration/stop`), პოზიცია — `getLivePosition()` ყოველ RAF-ზე `ctx.currentTime`-თან ერთად.
- **(ა)** Play 6-დან: პოზიცია 6 → 8.11 წრფივად, უკან სვლა 0, wrap 0. ერთადერთი >20 ms გადახრა არის start-ის 21 ms (playback-ის 50 ms lookahead-ის დროს პოზიცია 6-ზე დგას; ნახტომი არ არის). Music source 1 (off 6).
- **(ბ)** Play 1-დან, wrap 3.99→2.0087 (dev 0), შემდეგ რეალური Ctrl+L mapped 2.78-ზე: status `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.`; ახალი music source `when 8.010`, **off 2.968**, ძველი loop source-ები stop-ით ზუსტად 8.010-ზე. Toggle-ის გარშემო გადახრა ≤ 20 ms (jump სიაში მხოლოდ start და wrap-ია), პოზიცია გრძელდება 4.758-მდე (loop-ის ბოლოს გადასცდა). Max concurrent per buffer **1**.
- **(გ)** Play 2.5-დან, brace body drag +1 დაკვრისას (2–4 → 3–5): 16 wrap 4.9993→3.0207 (dev 0), სხვა ნახტომი არ არის, max concurrent 1. (Drag-ის mark-ის 30 წმ დაგვიანება harness-ის polling timeout-ია; drag თავად წამიერია.)
- **(დ)** Delete Time 1–2 → brace **1–3**. Delete Time 1.5–4.5 (loop 2–4-ს ფარავს) → loop null, brace 0, status: `… Loop-ის დიაპაზონი წაშლის შემდეგ 0.1 წამზე მოკლე დარჩა, ამიტომ მოიხსნა.` Undo → 2–4.
- **(ე)** Space ×10 (რეალური, 150 ms ინტერვალი) loop-ში 2.5-დან → 20 source, max concurrent **1** ორივე buffer-ზე, ბოლოს გაჩერებულია.

### 2.5 R6-S5 — `lay11`.
- რეალური Ctrl+A → 4/4 მონიშნული (`4 კლიპი მონიშნულია`).
- Add (`Slow rise` SFX 20-ზე) → Ctrl+A (5) → რეალური Ctrl+Z → მონიშვნაში 4 დარჩა, წაშლილი id არ არის, ring-ები 4.
- **Ctrl+E 2+ მონიშნულით:** ამ ქვეპუნქტის ორიგინალური ტექსტი („refusal“) D-25-მა განზრახ ჩაანაცვლა ჯგუფის split-ით (`plan.md` D-25; `c-round-5.md` l.85). D-25-ით ვაფასებ: playhead 3 → `გაყოფა (3)`, მარჯვენა ნაწილები მონიშნულია; playhead 40 (არცერთს არ კვეთს) → `Playhead არცერთ მონიშნულ კლიპს არ კვეთს.`, history და arrangement უცვლელი. Refusal-ის ძველი ტექსტი PASS-ად არ ჩამითვლია.
- ჯგუფიდან stems-ის trim → მონიშვნა მხოლოდ stems (1).
- Library search input-ში რეალური Ctrl+A → input-ის ტექსტი სრულად მოინიშნა (0–3), arrangement-ის მონიშვნა უცვლელია.

### 2.6 R7-D2 — mapping (ორიგინალის იდენტური): video 0–6.008, music 0–8, impact SFX 2–4.
- რეალური Ctrl+A (3) → რეალური Ctrl+D → ასლები video 8, music 8, SFX 10 (span 8, offsets 0), სამივე ასლი მონიშნულია, ერთი ჩანაწერი `დუბლირება (3)`. Undo → deep-equal.
- `Slow rise` SFX 11–16 → იგივე 3 მონიშნული → Ctrl+D: `დუბლირება ვერ შესრულდა: SFX ხაზზე 00:10.000–00:12.000 დაკავებულია. არაფერი შეცვლილა.`, arrangement და history უცვლელი.
- Range 1–3 → Ctrl+D: `დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.`, უცვლელი.
- Dock counter-ები (swaps/fallbacks/hardSeeks/escalations) 0 → 0.

### 2.7 R7-D3 — impact SFX 0.5–2.5 (მონიშნული), video 30; loop null. Play 0-დან, რეალური Ctrl+D 0.64-ზე.
- ასლი 2.5–4.5, `დუბლირება (1)`. პოზიცია monotone 0 → 5.73, ნახტომი 0.
- ძველი source `stop 106.362` = re-anchor source-ის `when 106.362` (off 0.332) — seamless; ასლის source `when` = project **2.500**. Max concurrent per buffer 1.
- Master tap: 2.30–2.48 −57.8 dB → 2.52–2.70 **−8.2 dB**, onset project **2.4993**; 4.6–5.0 −240 dB.

### 2.8 R7-D4 — music 0–8, bass stems 2–10, impact SFX 4–6, video 20; playhead 3.0; სამი მონიშნული.
- რეალური Ctrl+E → music `0–3` + `3–8 off 3`; bass `2–3` + `3–10 off 1` (= 0 + 3 − 2); impact ხელუხლებელი. `გაყოფა (2)`; status `2 კლიპი გაიყო 00:03.000-ზე; არჩეულია მარჯვენა ნაწილები.`; მონიშვნა = 2 მარჯვენა ნაწილი.
- Export split-მდე/შემდეგ (26.008 წმ, 1 248 384 frame ორივე): **maxDiff 1.19e-7** ≤ 2⁻²² (2.38e-7).
- Playhead 12, მონიშნული music + impact → `Playhead არცერთ მონიშნულ კლიპს არ კვეთს.`, arrangement და history უცვლელი.

### 2.9 R7-D5 — music clip-ის header drag ხელაუშვებლად → რეალური Ctrl+D: `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, clip-ების რაოდენობა 6 → 6. Release → no-op status, history უცვლელი.

### 2.10 R8-M3 (FB-03) — video 0–6.008, music 10–14, stems 12–16, SFX 30–32. Header drag-ები synthetic.
- Music → ვიდეოხაზი: ghost `data-blocked=true`, `border-accent` (amber), hint/status `აუდიო ვიდეოხაზზე არ გადადის`; release → `ცვლილება არ მოხდა — ისტორია არ შეიცვალა`, arrangement იდენტურია.
- ვიდეოკლიპი ვერტიკალურად music-ზე +1 წმ → ვიდეოხაზზე დარჩა, start 1.0, `კლიპის გადატანა`.
- Impact music-ზე music clip-ის თავზე → ბოლო ნაბიჯზე amber ghost 11.000 + `აქ ადგილი არ არის`; release → ბოლო ვალიდური ადგილი **14.8** (music).

### 2.11 R8-M4 (FB-03) — იგივე layout.
- Music (ხაზი 1) + stems (ხაზი 2) მონიშნული, music-ის header ერთი ხაზით ქვემოთ +1 წმ → music → stems 11, stems → SFX 13 (ფარდობითი დრო შენარჩუნდა), ერთი ჩანაწერი `გადატანა (2)`.
- ვიდეო + music → `ვიდეოკლიპი ხაზს არ იცვლის — ჯგუფი მხოლოდ დროში გადაადგილდება.`; ორივე +1 წმ, ხაზები უცვლელი.
- Music + SFX (ქვედა ხაზი) ერთით ქვემოთ → `ჯგუფის ნაწილისთვის ხაზი არ არსებობს — მხოლოდ დრო იცვლება.`; ორივე +1 წმ.
- Dock counter-ები 0 → 0.

### 2.12 R9-C5 (FB-02)
- Delete range-ით = Delete Time (§2.1-ის ციფრები).
- Library search input focused (რეალური click), `padpulse`: რეალური Ctrl+A → 0–8 მონიშნული; Ctrl+C → უცვლელი; Ctrl+X → ცარიელი; Ctrl+V → `padpulse`. Arrangement, მონიშვნა, history უცვლელი. შემდეგ timeline-ზე Ctrl+V → `ბუფერი ცარიელია — ჯერ Copy ან Cut.` (ე.ი. input-ის Ctrl+C/X შიდა ბუფერს არ შეხებია).
- Drag-ის შუაში რეალური Ctrl+X / Ctrl+V / Ctrl+D → სამივეზე `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, clip-ები 3 → 3; release-ის შემდეგ ბუფერი ისევ ცარიელია.

### 2.13 R5-B5 — video 0–6.008, music 2–10 (მონიშნული), SFX 4–6; transport 7.000.
- `სრული მიქსი` option-ზე და `▶ მოუსმინე`-ზე რეალური click; wave-ზე focus.
- რეალური → : offset 1.512 → 2.781 0.269 წმ-ში ⇒ **+1.000** (±0.1). Home → 0.141 0.271 წმ-ში (ე.ი. 0-დან).
- Space → `▶ მოუსმინე`, preview source stop-დება; Space → `■ შეჩერება`. სამ ციკლში audio source-ის resume offset = pause-ის audio პოზიციას: 1.280 / 1.280, 1.6906 / 1.6907, **1.7013 / 1.7013**. Pause-ის დროს `aria-valuetext` 1.680-ზე სტაბილურია 1 წმ (render snapshot, ≤ 0.021-ით უკან).
- მთელ დროს: transport 7.000, `isPlaying` false, music start 2, მონიშვნა `m1`, history `C20 B5p setup` — უცვლელი.
- `zzz`: `ხმა ვერ მოიძებნა…` ხილულია, listbox-ის გარეთაა; listbox ცარიელია (0 შვილი).

### 2.14 R5-B1u — `gesture-reentry.test.tsx` წავიკითხე (l.166–327) და გავუშვი: 14/14.
- ორი pointerdown + ორი release → `isPointerGestureActive() === false`: `two pointers on the header / trim edge / body (range)`, brace `body / edge`.
- ორი pointerdown + unmount → false: `releases every gesture when the clip unmounts…`, brace-ის იგივე.
- Capture throws (`'throw'` mode) → false: `releases an uncaptured gesture on a window pointerup after a second pointerdown` (clip, brace), `starts no gesture for a pointerdown without a pressed button`.
- Stale → false, history null, შემდეგ ისევ draggable (`კლიპის გადატანა` / `Loop-ის დიაპაზონი`): `ends a stale gesture of the same pointer…`, `ends a stale brace gesture…`.
- ტესტი gesture-ს boolean-ით ამოწმებს (`isPointerGestureActive`), არა რიცხვით; false = count 0.

### 2.15 R11A-2 (ორივე viewport) — separator-ზე JS focus, შემდეგ რეალური key-ები.
- 1440×900 და 1280×720 იდენტურია: 288 → ← 288 (clamp); → 304; → 320; ← 304; 11 × → → 480; → 480 (clamp). `aria-valuenow` = width ყველგან; min 288, max 480.
- Clip-ები deep-equal, history უცვლელი.
- Synthetic drag: +10 px/ნაბიჯი → 298…388 ზუსტად, შემდეგ +500 → 480; history და arrangement უცვლელი.

### 2.16 R12-L2 (ორივე viewport)
- `სტემები`-ზე რეალური click → `პულსი, ბასი, პადი, მელოდია` (4), `aria-current=true`, `text-brand border-brand bg-brand/10`, `ფილტრი: სტემები`.
- SFX + `slow` → `Slow rise`; × (რეალური click) → search ცარიელი, ხილულია `ფილტრი: SFX`, SFX `aria-current`, სია `Soft impact, Slow rise`.
- `სტემები`, playhead 20, აქტიური stems; search-იდან რეალური ↓ → `პულსი` (focus + `aria-selected`); ↓↓ → `პადი`; Enter → `დამატება — ღამის პულსი · პადი` სტემები ხაზზე 00:20.000-ზე; ერთი Ctrl+Z → შლის.
- 1280×720 გაეშვა იმავე გვერდზე viewport-ის შეცვლის შემდეგ (ახალი ჩატვირთვის გარეშე).

### 2.17 R12-L4 synthetic (`DragEvent` + `DataTransfer`) — video 0–6.008, music 0–8, pulse stems 30–34.
- ბასი → stems 10 წმ: ghost `00:10.000`, left 400 px (= 10 × 40), `border-brand`; drop → clip **10.0** (left 400 px); `დამატება — ღამის პულსი · ბასი`; Undo → deep-equal.
- ბასი → stems 20 (გადაფარავს 30–34-ს, ბასი 16 წმ-ია) → amber `00:20.000 · აქ ადგილი არ არის`, ცვლილება არა, history უცვლელი.
- ბასი → ვიდეოხაზი → `00:02.000 · აუდიო ვიდეოხაზზე არ ემატება`, status `აირჩიე აუდიო ხაზი…`, history უცვლელი.
- რეალური HTML5 mouse drag რჩება Tech Lead-ის სიაში — **არა PASS**.

## 3. არავალიდური გაზომვები და ჩანაცვლება (budget-ის ფარგლებში, მიზეზით)

| ID | არავალიდური ფაილი | მიზეზი | ჩანაცვლება |
|---|---|---|---|
| R7-D2, R7-D4, R7-D5 | `runs/r7-d2-d4-d5.INVALID-harness-setLayout.txt` | ჩემი harness-ის ბაგი: `setLayout` arrow ფუნქციაში `arguments` → layout არ დაყენდა | 1-ლი; R7-D2/D5 ვალიდური `r7-d2-d4-d5.txt`-ში |
| R7-D4 | `runs/r7-d2-d4-d5.txt`-ის D4 ნაწილი | ჩემი setup: D2-ის range (1–3) დარჩა; Escape range-ს არ ასუფთავებს (დიზაინით) → Ctrl+E range-ის split გახდა | მე-2; ვალიდური `r7-d4.txt` |
| R8-M3, R8-M4 | `runs/r8-m3-m4.INVALID-harness-novideo.txt` | წინა layout-ში ვიდეოკლიპი არ იყო → script-მა undefined source ჩასვა, `$B` timeout | 1-ლი; გვერდი თავიდან ჩავტვირთე |
| R5-L5 (დ) | `r5-l5.txt` `Ld_RANGE2` | `rangeOn` split-ის შემდეგ 0–1 clip-ით შეიზღუდა, loop-ს არ ფარავდა | 1-ლი; `Ld2_*` |
| R5-B5 Space | `r5-b5.txt` `SP_*` | პირველ ორ ცდაში paused offset-ის ზუსტი readout არ მქონდა (bounds მხოლოდ) | 2; საბოლოო — source node offset-ები სამივე ციკლიდან |
| R12-L4 | `runs/r12-l4.INVALID-layout-overlap.txt` | ჩემი layout: 16 წმ ბასი 10-ზე pulse 14–18-ს ფარავდა; app-მა სწორად უარყო | 1-ლი; ვალიდური `r12-l4.txt` |

არცერთი რეალური ჩავარდნა retry-ით PASS-ად არ ქცეულა; ყველა არავალიდური ცდა harness/setup-ის შეცდომაა და app-ის ქცევა ყველა მათგანში კორექტული იყო.

## 4. R20-Doc (`gates/doc027-diff.txt`)
- სათაური, სტატუსი (§2-ის ზუსტი სტრიქონი + Tech Lead R19-T pending), „მიდგომა“-ს (d) პუნქტი, „გაზომვა და ფასი“-ს lead line, „შეცვლილი ფაილები“ (5 text node + 1 width token; 13 → 16), „ტესტირება“ (mutation 6 → guard 6/6b/7 + C-ის 6c–6e; round 18/19 gate-ები ცალ-ცალკე), (d)-ის heading `C PASS (round 19)` და შენიშვნა ერთ ხაზად, TODO (R19-T, `ArrangementLane.tsx:661` round 22, footer Latin + group hint `range`) — ყველა §2-ს ემთხვევა.
- ყოველი PASS არის `c-round-18.md` §0-ში ან `c-round-19.md` §0-ში. „6c–6e“ და „Apply normalization = M6“ დადასტურებულია (`c-round-19.md` §4, `c-round-18.md` l.157).
- Diff-ში გაზომილი რიცხვი არ შეცვლილა და არ წაშლილა; ახალი რიცხვები არსებული ფაქტების მითითებაა.
- Round 19-ის შენიშვნა ღია წინააღმდეგობად აღარ რჩება. ტექსტი ქართულია.
- Cosmetic (არა ბაგი): heading-ში ჩაშენებული ფრჩხილები „(D-29j, C PASS (round 19))“ — A-ს deviation 3.

## 5. დაკვირვებები B-სთვის (არა ბაგი)
- R6-S5-ის „Ctrl+E 2+ → refusal“ ტექსტი D-25-ით ჩანაცვლებულია; B-მ ორიგინალური acceptance ტექსტი round 21/22-ის სიაში D-25-ის ფორმულირებით უნდა განაახლოს, რომ შემდეგ regression-ში წინააღმდეგობა აღარ იყოს.
- Delete Time-ის Undo playhead-ს არ აბრუნებს (28 რჩება). კრიტერიუმი მხოლოდ arrangement-ს ითხოვს; Ableton-ის ქცევასაც ემთხვევა. მხოლოდ ჩანაწერია.
- Trim/move status-ში ლათინური `start / length / source offset` — უკვე ჩაწერილი (doc 027 TODO), არ დაგეგმილა.
- Run 1-ში sync არ გამიზომავს. Setup-ში stall, hard seek ან dock counter-ის ცვლილება არ შემინიშნავს (counter-ები 0 → 0).

## 6. Carried (უცვლელი; არა PASS, არა ახალი ბაგი)
Root (`root-pre-push-review.md`, `publication-checkpoint.json`): purchased loader middle-east-ზე hardcoded (SRW-21); Lenis `/studio/*`-ზე; portable instruction-file paths; export hard-clip 0 dBFS (R13-M4, SRW-13; ამ round-ში 1800 full-scale sample); საბოლოო commit/push მხოლოდ ბოლოს; uncommitted round-6..19 tree; საერთო `Modal.tsx` focus gap; root GA `scroll` consent denied-ით; ორი უცხო agent ფაილი; A round-17 dev. 4 და round-19 dev. 5 (python, root); fake Bearer → 500 token-ის გარეშე; CDP allowlist `Input.dispatchMouseEvent`-ს კრძალავს; publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, საბოლოო commit/push).
Tech Lead-ის ხელით შემოწმება: R23-1/2, R12-L4 (რეალური drag), RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, Lenis `/studio/*`.
ღია C ბაგები სხვა round-ებისთვის: C-R6-02, C-R8-01 (Tech Lead quiet Chrome), C-R12-01 (run 2, RF5-3).

## 7. შემდეგი (B)
- Round 21 = run 2: R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 RF5-3-ით dock-ის live პოზიციით (D-19b), SRW-11B end to end. Run 1-დან გადასატანი ID არ არის — ყველა გაეშვა.
- Round 22 (milestone fix): run 1-მა regression ბაგი არ იპოვა; რჩება A round-11 follow-up-ები და `ArrangementLane.tsx:661`.

## 8. Harness და გარემო
- Scripts: `c-round-20/{b.sh,r.sh,setup.sh,lib.sh,s5.sh,d.sh,d4.sh,b1.sh,b5.sh,m.sh,l5.sh,d3.sh,pb5.sh,lib12.sh}`, `scripts/{st20.js,g20.js,l5.js,l4.js,hook.js}` + წინა round-ების helper-ები (`setup.sh`-ში).
- Browser side effects: მხოლოდ demo-ს local state (layout, library width localStorage). Separator ბოლოს 288-ზე დავაბრუნე. G20-3-ისთვის `$B restart` გავაკეთე.
- Python/Node პროცესები არ დამიტოვებია; dev server არ შემიხებია.
