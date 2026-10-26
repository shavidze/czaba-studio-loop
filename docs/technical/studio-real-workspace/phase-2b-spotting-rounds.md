# ფაზა 2b — spotting: რაუნდების პროექტი B-სთვის (SP-1…SP-6)

Oct 26, 2026 · სტატუსი: **draft, მომხმარებლის დასტურს ელოდება** · კოდი შემოწმდა store `master` HEAD `850445c`-ზე (round 188-მდე)

ეს ფაილი B-ს მასალაა და არა ინსტრუქცია. B თითო რაუნდს ცალკე `current-task.md`-ში გადაიტანს round-187…189-ის ფორმატით: Baseline, §0 რატომ, §1 რა იცვლება (K-რიგები), Rulings, §2 ფაილები, §3 ტესტები, §4 C-ის რიგები, §5 Ableton, §6–§8. ქვემოთ თითო რაუნდისთვის მოცემულია ის, რაც B-ს ამ სექციების შესავსებად სჭირდება.

წყაროები: draft `phase-2b-spotting.md`; `loop/backlog.json` (`post_current_stage_queue`, `items`); `plan.md` (D-წესები); `phase-2-requirements.md`; `agent-workflow.md`; `cloud/policy.cloud.md`; store-ის კოდი.

---

## 0. შესწორებები draft-ში (მტკიცებულებით)

| # | draft ამბობს | კოდი/წესი ამბობს | მტკიცებულება | რა იცვლება |
| --- | --- | --- | --- | --- |
| C1 | „SFX ლეინი“: მონიშნული SFX ლეინი, თორემ პირველი თავისუფალი SFX ლეინი | ხაზის ტიპი მხოლოდ `'audio' \| 'video'`-ია. „SFX“ `/studio-lab`-ში მხოლოდ ერთი audio ხაზის სახელია. D-21: Enter/＋ **აქტიურ აუდიოხაზზე** ამატებს | `app/types/arrangement.ts:1`; `app/routes/studio-lab.tsx` (`{ id: 'sfx', kind: 'audio', name: 'SFX' }`); `plan.md:150` (D-21, R1-B1) | დასმა ხდება **აქტიურ აუდიოხაზზე** (`activeTrackId`). ვიდეო-ხაზზე — `studioLibraryStrings.audioOnVideoTrack`. ავტომატური ხაზის ძებნა არ ემატება. |
| C2 | დაკავებულ ადგილზე „`ClipPlacementConflict`-ის არსებული წესი“ | ბიბლიოთეკას ორი გზა აქვს. Enter/＋ (`addSourceToActiveTrack`) `addClip`→`findFreeStart`-ით **უახლოეს თავისუფალ ადგილზე გადასვამს**. Drop (`dropLibrarySource`) `canPlaceLibraryClip`-ით **უარს ამბობს** და `dropBlocked` ტექსტს წერს. `ClipPlacementConflict` მხოლოდ duplicate/paste-ს ეკუთვნის | `model.ts:104-151` (`findFreeStart`, `addClip`, `sourceOffset: 0`); `ArrangementContext.tsx:1375-1430`, `1456-1490`; `library.ts:166`; `strings.ts:230`; `model.ts:326`, `clipboard.ts:261` | sync-ის დასმა drop-ის წესს მიჰყვება: ზუსტი ადგილი ან უარი `dropBlocked`-ით. `addClip` არ გამოიყენება: ის `sourceOffset`-ს 0-ზე აყენებს და ადგილს ცვლის, ორივე sync-ს არღვევს. საჭიროა ახალი სუფთა ფუნქცია. |
| C3 | დარტყმის მარკერები „დარტყმა 1“, ჭრილები „ჭრილი 1“; „ხმა აქ“ | VISUAL-A-ის შემდეგ Studio-ს UI ინგლისურია. ნაგულისხმევი სახელი `Marker N`-ია | `strings.ts:7-40`, `strings.ts:454-474`; `markers.ts:4`, `:47` | სახელები: `Hit 1…`, ღილაკი `Find hits`, პანელი `Find sound`. სტატუსები/ლეიბლები `strings.ts`-ში ინგლისურად. დოკები ქართულად რჩება. |
| C4 | CSV-ში ტიპი (ხელით/ჭრილი/დარტყმა/მოძრაობა) და „დასმული ხმა“ | `ArrangementMarker = {id, time, name}` — წყაროს ველი არ აქვს. მარკერი კლიპს არ უკავშირდება | `app/types/arrangement.ts:52-56`; D-29z37 R2 (`plan.md:2390`) | ტიპისთვის საჭიროა არჩევითი `origin?: 'cut' \| 'hit' \| 'motion'`, **მიღების მომენტში** ჩაწერილი (SP-4 ან SRW-43b). „დასმული ხმა“ = აუდიო კლიპები, რომლებიც მარკერის დროს ფარავს. ახალი კავშირი არ ემატება. |
| C5 | timecode `HH:MM:SS:FF` ვიდეოს fps-ით; R48-2 29.97 drop-frame | Studio ვიდეოს fps-ს არ ინახავს | `app/types/arrangement.ts:102-111` (`WorkspaceVideoSource`: duration, width, height, audio) | v1: `HH:MM:SS.mmm`. კადრების სვეტი მხოლოდ მაშინ, თუ fps ცნობილია (SRW-42/43-ის Mediabunny probe). drop-frame v1-ში არ შედის. |
| C6 | R48-1 „Excel-სა და LibreOffice-ში იხსნება“ C-ის რიგად | ღრუბელში Excel არ არის; LibreOffice-ის არსებობა დადასტურებული არ არის | `cloud/policy.cloud.md:4-8` | C: BOM, RFC 4180 parse, round-trip. Excel → Tech Lead-ის ხელით რიგი (R48-T). |
| C7 | sync point = „პირველი დარტყმა პირველ 2 წამში“ | demo-ში ორი SFX-ია: `Soft impact` (დარტყმა t=0) და `Slow rise` (5 წმ crescendo, დარტყმა არ აქვს) | `demo-synth.ts:2-29`; `studio-lab-demo.ts:57-70` | riser-ს ეს წესი sync=0-ს მისცემს და ის locator-ზე **დაიწყება**, არადა ხმის დიზაინში riser locator-ზე **მთავრდება**. შეთავაზება B-სთვის: sync = დარტყმა, რომელიც უძლიერეს პიკს წინ უსწრებს (იხ. SP-2, B2). იგივე ეხება `001-recording-analysis-pipeline.md`-ის `SyncPointMs`-ს. |
| C8 | R47-1 ±1 ms, მაგრამ 46a იძლევა მხოლოდ „≤ 10 ms“ | დასმის სიზუსტე sync-ის სიზუსტეს უდრის | — | sync-ის დაზუსტებას სუფთა სიგნალზე ≤ 1 ms სჭირდება (unit, 44.1 და 48 kHz). R46-ის ≤ 10 ms ხმაურიან ვიდეოს ეხება. |
| C9 | R47-1 „სინთეზური SFX: 0.37 წმ სიჩუმე, შემდეგ დარტყმა“ | `/studio-lab`-ში ასეთი წყარო არ არის; C წყაროს ვერ შეიტანს. `public/**` გაყინულია | `studio-lab-demo.ts:43-90` (9 წყარო); `backlog.json` `global_forbidden_files` | SP-2 ამატებს სინთეზურ demo SFX-ს „Delayed impact“ (`demo-synth.ts` + `studio-lab-demo.ts`). ბიბლიოთეკის სია იცვლება: STUDIO-RV-ის baseline განახლდება. |
| C10 | R47-6 „30 წყარო“ fixture `/studio-lab`-ში | demo კოლექციაში 9 წყაროა (+C9-ით 10) | `studio-lab-demo.ts:43-90` | 30-წყაროიანი fixture მხოლოდ unit ტესტშია. ბრაუზერში 3 შეკითხვა demo-ს `meta`-ზე. |
| C11 | R46-2 „თანაბარი ხმაური და **მუსიკის** ფონი“ ყალბი ≤ 2 | spectral flux აკორდის ცვლაზეც რეაგირებს. demo pad-ს ყოველ 2 წმ-ში swell და აკორდის ცვლა აქვს | `demo-synth.ts:51`, `:102-119` | ფონი: ვარდისფერი ხმაური + **ერთი აკორდის** მდგრადი ტონი, აკორდის ცვლის და დარტყმების გარეშე. demo stem ფონად არ გამოიყენება. |
| C12 | მთელი ჩანაწერის პირობა „SRW-43b done“ | 46a, 47a, 47b, 48 SRW-43-ს და Mediabunny-ს არ საჭიროებს. მხოლოდ 46b-ს სჭირდება SRW-43b-ის შეთავაზებების ფენა, 46c-ს — SRW-43a | `phase-2-requirements.md:180`, `:184-194` | `depends_on` თითო დავალებაზე. ჩანაწერის გახსნა მომხმარებლის გადაწყვეტილებაა (§4, Q1). |
| C13 | „SRW-16 done“ | SRW-16-ის სტატუსია `c_pass_tech_lead_manual`; ზუსტად `done` არასდროს გახდება, სანამ Tech Lead R72-T…R78-T ღიაა | `backlog.json` `items[SRW-16].status` | პირობა: „SRW-16 C PASS (`c_pass_tech_lead_manual` საკმარისია)“. ასევე წერია PHASE2-ის SRW-43-ში. |
| C14 | შეთავაზებები „ruler-ზე“ (SRW-43b-დან) | `ArrangementRuler.tsx` ნაგულისხმევად გაყინულია; გაყინვა მხოლოდ რაუნდის grant-ით იხსნება | D-29z37 R7 (`plan.md:2395`); D-29z43 R4 (`plan.md:2319`) | SP-4-ის ფაილები SRW-43b-ის საბოლოო არჩევანზეა დამოკიდებული. B მათ SRW-43b-ის `done` ჩანაწერიდან იღებს. |
| C15 | worker `app/workers/hits.worker.ts` | Studio-ს worker `app/lib/arrangement/export-wav.worker.ts`-შია; gate-ის frozen სიებში „Studio-owned“ = `app/lib/arrangement/*` | `export-wav.client.ts:32`; round-189 §2 | `app/lib/arrangement/hits.worker.ts` (B-ს გადასაწყვეტია; შეთავაზება). |
| C16 | „ხმა აქ“ — ახალი ტექსტური რანჟირება | ბიბლიოთეკის ძებნა **AND**-ია, რანჟირების გარეშე (D-21) | `library.ts` `libraryQueryWords`, `matchesLibraryQuery`; `plan.md:145` | პანელი იგივე ტოკენიზაციას იყენებს. ბიბლიოთეკის ძებნა v1-ში არ იცვლება, რომ SRW-12-ის რიგები უცვლელი დარჩეს. |
| C17 | ხმის buffer-ები ანალიზისთვის | `buffersRef` შიდაა და context-ის value-ში არ გადის | `ArrangementContext.tsx:614`, `:2188` | ანალიზი context-ის ახალ მეთოდში ხდება (`ArrangementContext.tsx` grant SP-2/SP-4-ში). |

**D-წესებთან შემოწმება** (`plan.md`-ში grep):
- **D-10** (`plan.md:62`): ტემპი მხოლოდ ბადეა, აუდიო არ იწელება. spotting აუდიოს არ წელავს. sync-ის დასმა მხოლოდ `start`/`sourceOffset`-ს ცვლის: **კონფლიქტი არ არის**. draft-ის „გაწელვა locator-ებს შორის — არ შედის“ სწორია.
- **D-29z30** (`plan.md:1107-1112`): BPM-ს მომხმარებელი წერს, ნაგულისხმევი არ აქვს. spotting ტემპს არ ეხება: **კონფლიქტი არ არის**. hit-ებიდან BPM-ის შეთავაზება არ შედის.
- **D-21** (`plan.md:143-151`): ახალი წყაროს ველი არჩევითია; ძებნა AND; Enter აქტიურ ხაზზე; preview ერთი წყაროთი და არასდროს ტრანსპორტთან ერთად (PRE-03). `meta?` ამას ემთხვევა; C1 და C16 ამ წესიდან მოდის.
- **D-29z37** (`plan.md:2385-2396`): მარკერი `{id, time, name}`, დრო ms-მდე, ერთ ms-ზე ერთი, `[]` არასდროს, მარკერის რედაქტირება resync-ს არ იწვევს. „ყველას დამატება“ იმავე ms-ზე არსებულ მარკერს გამოტოვებს.
- **D-15**: CZABA-ს ერთი პოზიცია = Ableton-ის insert marker. spotting-ს არ ეწინააღმდეგება.
- **D-29z64** (held Enter ერთ კლიპს ამატებს): პანელის Enter-ზეც ვრცელდება (R47-10).

---

## 1. საერთო ყველა რაუნდისთვის

### 1.1 Root-ის ნაბიჯი R-SP0 (რაუნდი არ არის, SP-1-მდე)

C-ს სტაბილური fixture-ები სჭირდება. პრეცედენტი: `loop/media/` + `SHA256SUMS.txt` (`beeps-6s-h264-aac.mp4` და სხვ.). შეთავაზება: `loop/media/spotting/` გენერატორის სკრიპტით და `truth.json`-ით.

| ფაილი | შინაარსი |
| --- | --- |
| `hits-30s-vp9-opus.webm` | 30 წმ, 25 fps, კადრის ნომერი ეკრანზე. ხმა: ვარდისფერი ხმაური + 20 სინთეზური დარტყმა (5 ms ფართოზოლოვანი იმპულსი, 80 ms exp decay), ერთმანეთისგან ≥ 0.5 წმ, SNR 20 dB (დარტყმის 10 ms RMS / ხმაურის RMS) |
| `hits-30s-h264-aac.mp4` | იგივე ხმა MP4/AAC-ში — codec delay-ის შემოწმებისთვის |
| `quiet-30s-vp9-opus.webm` | ვარდისფერი ხმაური + ერთი აკორდის მდგრადი ტონი, დარტყმების და აკორდის ცვლის გარეშე (C11) |
| `hits-10min-vp9-opus.webm` | 600 წმ, დაბალი გარჩევადობა, 1-ის ნიმუში 20-ჯერ (400 დარტყმა) |
| `motion-30s-vp9.webm` (მხოლოდ 46c) | მოძრავი კვადრატი ცნობილ კადრებზე + 1 ჭრილი |
| არსებული `noaudio-2s-vp9.webm` | აუდიოს გარეშე (R46-5) |

**ჭეშმარიტი დრო:** `truth.json` წყაროს დროს წერს. C მაინც ითვლის „decode-truth“-ს: იმავე Chromium-ში `decodeAudioData` → matched filter ცნობილ იმპულსზე. შედარება decode-truth-თან ხდება. ასე AAC/Opus-ის priming შედეგზე არ მოქმედებს (SRW-40c-ის თემაა და აქ არ მეორდება).

**გენერაცია:** ღრუბელში native `ffmpeg`-ის არსებობა **დადასტურებული არ არის**. რიგით: (1) `ffmpeg -version` OK → ffmpeg; (2) ffmpeg.wasm Chromium-ში (CDN ღრუბელში მისაწვდომია — C round-ების მტკიცებულება); (3) MediaRecorder რეალურ დროში მხოლოდ ≤ 60 წმ ფაილებისთვის. root ფიქსირებს გამოყენებულ გზას და hash-ებს.

### 1.2 გაზომვის მეთოდები (C)

- **დრო ექსპორტში:** ვიდეო-ხაზი Mute, დანარჩენი ცარიელი ან Mute. WAV ექსპორტი Playwright download-ით. Node-ში onset = პირველი sample, რომელიც სიჩუმის შემდეგ −40 dBFS-ს სცდება. პრეცედენტი: TB-NOSTRETCH (round 65).
- **worker რეალურ ბრაუზერში UI-ის გარეშე:** `/studio-lab`-ზე `await import('/app/lib/arrangement/hits.client.ts')` Vite dev server-იდან. პრეცედენტი: `loop/b-round-86/probe/probe.cjs:10`.
- **Long tasks:** `PerformanceObserver({type: 'longtask'})` ანალიზის მთელ დროს.
- **history:** Undo/Redo ღილაკების `title` (`Undo: <label>`), `past.length` არაპირდაპირ — ერთი Ctrl+Z-ით ყველაფერი ქრება.
- **პროექტი უცვლელია:** Undo-ს title უცვლელია და მარკერების/კლიპების DOM რაოდენობა უცვლელია.

### 1.3 მუდმივი წესები

- Grants-ის გარეთ ყველა tracked ფაილი გაყინულია (round-189 §2 ფორმატი, sha256 სია).
- დაცული ფაილები არ იცვლება: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `package.json`, `public/**`. ახალი დამოკიდებულება არ ემატება; Meyda/aubio/Essentia არ დგება. Bello 2005 და Meyda (MIT) მხოლოდ ნიმუშია, ავტორის მითითებით.
- აღმოჩენა პროექტს თანხმობამდე არ ცვლის. შეთავაზებები history-ში და პროექტში არ შედის.
- ყოველი რაუნდი: implementation doc `docs/implementation/2026/quarter-IV/NNN-…md` ქართულად; code-reviewer; gate-ის რიგები (vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL) — C-ის არა.
- ყოველ რაუნდში C-ის მუდმივი რიგები: **G-3** (anonymous `/studio-lab`, token 401/403 mock-ზე — backend-ის რეალური შემოწმება BLOCKED: „backend unavailable in cloud“), **STUDIO-RV** (rest screenshot vs წინა baseline), **SCOPE**, **T-RUN** (red proof + mutants), **AN-REVIEW**, **PX-NET/REG-HYD**.

---

## 2. რიგი (შეთავაზება)

| რაუნდი | SRW | რატომ ამ ადგილას |
| --- | --- | --- |
| SP-1 | 46a | საერთო ანალიზის ბირთვი; SP-2-ს და SP-4-ს სჭირდება |
| SP-2 | 47a | დამოუკიდებელი ღირებულება ხელით დასმულ მარკერებზე; SRW-43 არ სჭირდება |
| SP-3 (a,b) | 47b | `meta` + რანჟირება, შემდეგ პანელი; შეიძლება ერთ რაუნდად, თუ B ფაილებს მცირედ შეაფასებს |
| SP-4 | 46b | SRW-43b-ის შეთავაზებების ფენაზე; ბოლოში, რომ ის უკვე სტაბილური იყოს |
| SP-5 (არჩევითი) | 48 | `origin`-ს SP-4-ის შემდეგ იყენებს |
| SP-6 (არჩევითი) | 46c | SRW-43a-ის კადრებს იყენებს |

draft-ის რიგი (46a → 46b → 47a → 47b) დასაშვებია, თუ SRW-43b ჩანაწერის გახსნამდე `done`-ია. ჩემი რიგი სასარგებლოა, თუ მომხმარებელი Q1-ზე „ადრე“ გადაწყვეტს.

---

## 3. რაუნდები

<a id="sp-1"></a>

### SP-1 = SRW-46a — დარტყმების ანალიზი worker-ში (UI-ის გარეშე)

**მიზანი:** სუფთა, დეტერმინისტული ფუნქცია მონო სიგნალში დარტყმებს პოულობს. worker მას მთავარი thread-ის გარეშე უშვებს. იგივე ფუნქციას SP-2 sync point-ისთვის იყენებს.

**დამოკიდებულება:** არცერთი (R-SP0 fixture-ები).

**K-რიგები:**
- **K1 `hits.ts` (ახალი, სუფთა):** `detectHits(mono: Float32Array, sampleRate: number, options?) → { time: number; strength: number }[]` (სახელი B-ს/A-ს, შეთავაზება).
  - STFT: ფანჯარა 1024, ბიჯი 256, Hann; magnitude-ის log შეკუმშვა `log(1 + γ·|X|)`; spectral flux = დადებითი ნაზრდების ჯამი.
  - ზღვარი: მოძრავი მედიანა ±0.25 წმ × k + δ. k, δ და γ ფიქსირდება კონსტანტებად და unit ტესტით.
  - პიკი = ლოკალური მაქსიმუმი ზღვარს ზემოთ; დარტყმებს შორის ≥ 150 ms (ძლიერი რჩება).
  - დაზუსტება: STFT ფრეიმის მონაკვეთში (~21 ms 48 kHz-ზე), პირველი 1 ms ბლოკი, რომლის RMS მონაკვეთის პიკიდან −20 dB-ს სცდება. სუფთა სიგნალზე ≤ 1 ms (C8).
  - შედეგი დალაგებულია დროით; `strength` = flux − ზღვარი, ნორმალიზებული.
- **K2 `hits.worker.ts` (ახალი):** `export-wav.worker.ts`-ის სტრუქტურა: `progress` / `complete` / `error`.
- **K3 `hits.client.ts` (ახალი):** `findHitsOffMainThread(buffer: AudioBuffer, signal) → Promise<Hit[]>`.
  - მონო-მიქსი **ნაწილებად** (მაგ. 10 წმ), თითო ნაწილი ახალ `Float32Array`-ში და `transfer`-ით. ნაწილებს შორის yield.
  - **არასდროს** გადაიცემა `buffer.getChannelData(i).buffer`: transfer დაკვრის buffer-ს გაანადგურებდა.
  - `Worker` არ არის (jsdom) → იგივე ფუნქცია სინქრონულად (export-wav-ის პრეცედენტი).
  - abort → `worker.terminate()`, `ArrangementExportCancelledError`-ის მსგავსი შეცდომა; stall timeout.
  - ქეში: არა ამ რაუნდში (SP-4-ში, მეხსიერებაში, `sourceId`-ით).

**ფაილები:**
- **ახალი:** `app/lib/arrangement/hits.ts`, `hits.worker.ts`, `hits.client.ts`, `__tests__/hits.test.ts`, `__tests__/hits-client.test.ts`, implementation doc.
- **grants:** არცერთი არსებული ფაილი. შეცდომის ტექსტი worker-ის შიგნით ტექნიკურია; UI ტექსტი SP-4-ში ემატება `strings.ts`-ში.
- **გაყინულია (სახელით):** `ArrangementContext.tsx`, `video.client.ts`, `export-wav*.ts`, `strings.ts`, ყველა კომპონენტი.

**ტესტები (A):** H1 20 სინთეზური დარტყმა ხმაურზე (seeded PRNG); H2 მდგრადი ტონი + ხმაური → ყალბი ≤ 2/30 წმ; H3 დაზუსტება 0.370 წმ-ზე 44.1 და 48 kHz-ზე ≤ 1 ms; H4 ორი დარტყმა 120 ms-ით → ერთი; H5 სიჩუმე → `[]`; H6 ცარიელი/1-sample input → `[]`, შეცდომის გარეშე; H7 NaN/Infinity sample → შეცდომის გარეშე; H8 client: ნაწილების რაოდენობა, abort → terminate, `getChannelData` buffer არ detach-დება (`byteLength` უცვლელია).

**C-ის რიგები:**

| id | action | expected | verify |
| --- | --- | --- | --- |
| R46-1 | F1 (`hits-30s-vp9-opus.webm`) — ჯერ unit-ის fixture, შემდეგ ბრაუზერში: decode → `findHitsOffMainThread` | ≥ 19/20 ნაპოვნი, ყალბი ≤ 1, თითოეული decode-truth-იდან ≤ 10 ms | C, unit + browser (dev-server import) |
| R46-1b | იგივე MP4/AAC-ზე | იგივე პირობა decode-truth-ის მიმართ | C, browser |
| R46-2 | F2 (`quiet-30s`) | ყალბი ≤ 2 | C, unit + browser |
| R46-3 | F3 (10 წთ) | ანალიზი ≤ 20 წმ; longtask > 50 ms = 0 ანალიზის დროს | C, browser + measurement |
| R46-4a | abort შუა გზაზე | worker-ი terminate; შემდეგ `message` აღარ მოდის; promise reject-დება | C, browser |
| R46-SYNC0 | 0.370 წმ სიჩუმე + დარტყმა (unit) | 0.370 ± 1 ms, 44.1 და 48 kHz | C, unit |
| R46-NODETACH | ანალიზის შემდეგ ვიდეოს დაკვრა | ვიდეოს ხმა ისმის/არ წყდება; `getChannelData(0).length` უცვლელია | C, browser |

R46-4 (history უცვლელია), R46-5…R46-9 — SP-4-ში, სადაც UI ჩნდება.

**რა შეიძლება დაზიანდეს:** არაფერი ძველი, რადგან grants ცარიელია. რისკი: ტრანსფერმა ვიდეოს buffer გაანადგუროს (R46-NODETACH); worker-ის URL build-ში (gate build + preview).

**Ableton:**

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
| --- | --- | --- | --- | --- |
| აუდიოში დარტყმების ავტომატური პოვნა | Live 12 Reference Manual, „Audio Clips, Tempo and Warping“ (transient-ები) — B ამოწმებს Playwright-ით; ბმული და სექცია **აქ დადასტურებული არ არის** | ჯერ არაფერი | CZABA-ს საკუთარი ანალიზი; Live-ის შიდა ალგორითმზე მტკიცება არ კეთდება | R46-1…3; შესაბამისობა: დაუდასტურებელი |

**B-ს გადაწყვეტილებები:**
- **B1 worker-ის ადგილი:** `app/lib/arrangement/` (შეთავაზება, C15) vs `app/workers/`.
- **B2 sample rate:** ანალიზი buffer-ის ბუნებრივ rate-ზე, decimation-ის გარეშე (შეთავაზება). ალტერნატივა: ×2 decimation 48 kHz-ზე, თუ R46-3 ვერ ჯდება.

---

<a id="sp-2"></a>

### SP-2 = SRW-47a — sync point და ხმის დასმა მარკერზე

**მიზანი:** მომხმარებელი მარკერის მენიუდან ბიბლიოთეკის მონიშნულ ხმას სვამს. ხმა ისე ჯდება, რომ მისი sync point მარკერს ზუსტად ემთხვევა. კლიპზე sync-ის ნიშანი ჩანს.

**დამოკიდებულება:** SRW-16 C PASS; SP-1 C PASS.

**K-რიგები:**
- **K1 `sync-point.ts` (ახალი, სუფთა):** `computeSyncPoint(mono, sampleRate) → number`.
  - ფანჯარა: პირველი min(duration, 10 წმ).
  - 10 ms RMS-ის გლობალური პიკი; sync = `detectHits`-ის დარტყმა, რომელიც პიკს ≤ 150 ms-ით უსწრებს. ასეთი არ არის → ენერგიის აწევის დასაწყისი პიკამდე (K1-ის დაზუსტების წესით). სიჩუმე → 0 (B2).
- **K2 `spot-placement.ts` (ახალი, სუფთა):** `placeSourceAtTime(arrangement, {trackId, sourceId, sourceDuration, syncPoint, at})`.
  - `start = at − syncPoint`. თუ `start < 0`: `start = 0`, `sourceOffset = syncPoint − at`, `duration = sourceDuration − sourceOffset`.
  - `duration < MIN_CLIP_DURATION` (`model.ts:15`) → უარი.
  - ადგილის შემოწმება `canPlaceLibraryClip`-ის სემანტიკით (`library.ts:166`); გადატანა არ ხდება (C2).
  - შედეგი: `{arrangement, clip}` ან `{reason: 'occupied' | 'video-track' | 'too-short'}`.
- **K3 context:** sync point ითვლება, როცა ბიბლიოთეკის წყარო `ready` ხდება (worker-ით SP-1-იდან), და ინახება `Map<sourceId, number>`-ში. ახალი მეთოდი (შეთავაზება) `placeSelectedSourceAtMarker(markerId)`:
  - წყარო = `selectedSourceId`; ხაზი = `activeTrackId` (C1);
  - `refuseEditDuringGesture()` პატივს სცემს;
  - წარმატება → `applyEdit(…, studioLibraryStrings.historyAdd(title))` — ერთი ნაბიჯი; კლიპი მოინიშნება; სტატუსი `clipAdded`-ის მსგავსი + „aligned to marker“;
  - უარი → `dropBlocked` / `audioOnVideoTrack` / `selectSoundFirst` / `sourceNotLoaded`; პროექტი უცვლელია.
- **K4 მენიუ:** `MarkerMenuAction`-ს (`ArrangementMarkerMenu.tsx:10`) ემატება `'place'` — „Place selected sound“. გამორთულია, თუ წყარო არ არის მონიშნული ან არ არის ready, და მიზეზი ჩანს (D-29z6: გამორთვის მიზეზი ყოველთვის ჩანს). კლავიატურით: Shift+F10 / ContextMenu → ↓ → Enter.
- **K5 sync-ის ნიშანი:** `ArrangementClip.tsx`-ზე 1 px ვერტიკალური ნიშანი `x = (syncPoint − sourceOffset) · pxPerSecond`, მხოლოდ თუ ეს წერტილი კლიპის ხილულ ნაწილშია და sync > 0. design token-ით, ახალი ფერის გარეშე. v1-ში ხელით არ იცვლება.
- **K6 demo:** `demo-synth.ts` → `generateDelayedImpactSamples()` (0.370 წმ სიჩუმე + `Soft impact`-ის სხეული). `studio-lab-demo.ts` → წყარო `demo-delayed-impact`, `kind: 'sfx'`, სათაური „Delayed impact“ (C9).

**ფაილები:**
- **ახალი:** `app/lib/arrangement/sync-point.ts`, `spot-placement.ts`, `__tests__/sync-point.test.ts`, `__tests__/spot-placement.test.ts`, `__tests__/marker-place-sound-ui.test.tsx`, doc.
- **grants (არსებობს, შემოწმებულია):** `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementMarkerMenu.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementClip.tsx`, `app/lib/arrangement/strings.ts`, `demo-synth.ts`, `app/data/studio-lab-demo.ts`.
- **გაყინულია:** `model.ts`, `library.ts`, `markers.ts`, `ArrangementLibrary.tsx`, `ArrangementLane.tsx`, `ArrangementRuler.tsx`, `hits*.ts` (SP-1; მხოლოდ იმპორტი).
- B-ს შეუძლია K5 (`ArrangementClip.tsx`) ცალკე SP-2b-ად გაიტანოს, თუ ownership დიდია.

**C-ის რიგები:**

| id | action | expected | verify |
| --- | --- | --- | --- |
| R47-1 | Delayed impact; მარკერი 5.000; Place → WAV ექსპორტი (ვიდეო Mute) | დარტყმა 5.000 ± 1 ms | C, browser + measurement |
| R47-2 | Soft impact; მარკერი 3.000 | კლიპი 3.000-ზე, `sourceOffset` 0 (Detail panel/DOM); ექსპორტში 3.000 ± 1 ms | C, browser + measurement |
| R47-3 | Delayed impact; მარკერი 0.100 | კლიპი 0-ზე, თავი 0.270-ით შეჭრილი; ექსპორტში 0.100 ± 1 ms | C, browser + measurement |
| R47-3b | Slow rise; მარკერი 8.000 | sync B2-ის წესით; ექსპორტის პიკი 8.000-ის ახლოს (ჩაწერილი რიცხვი); riser **არ იწყება** 8.000-ზე | C, browser + measurement |
| R47-4 | ადგილი დაკავებულია | `No room here — …` ჩანს; კლიპების რაოდენობა და Undo title უცვლელია | C, browser |
| R47-5 | Place → Ctrl+Z → Ctrl+Shift+Z | ერთი ნაბიჯი `Add — Delayed impact`; Redo იმავე ადგილას | C, browser |
| R47-6 | აქტიური ხაზი Video / წყარო არ არის მონიშნული / წყარო იტვირთება | მენიუს პუნქტი გამორთულია მიზეზით ან სტატუსი ჩანს; პროექტი უცვლელია | C, browser |
| R47-7 | sync-ის ნიშანი | ნიშნის x კლიპის მარცხნიდან = (sync − offset)·px/s ± 1 px ორ zoom-ზე; sync = 0-ზე ნიშანი არ არის | C, browser |
| R47-8 | კლავიატურით: მარკერზე Shift+F10 → Place → Enter, Enter-ის დაჭერით შენახვა | ერთი კლიპი (D-29z64); ფოკუსი მარკერზე ბრუნდება | C, browser |
| R47-9 | Place დაკვრისას | დაკვრა გრძელდება, ახალი კლიპი ისმის შემდეგ გავლაზე (resync); ტკაცუნი არ ისმის | C, browser + measurement |
| R47-REG | ბიბლიოთეკის drag-drop, Enter/＋, preview, snap, მარკერის მენიუ Rename/Play/Delete | უცვლელი ქცევა | C, browser |

**რა შეიძლება დაზიანდეს:** ბიბლიოთეკის სია (+1 SFX) → STUDIO-RV baseline-ის განახლება (outcome წინასწარ: info, არა FAIL); მარკერის მენიუს Tab-ციკლი და focus restore; `ArrangementClip`-ის render budget (`render-budget.test.tsx`); preview/transport ექსკლუზიურობა.

**Ableton:**

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
| --- | --- | --- | --- | --- |
| ხმის sync point (დარტყმის მომენტის მიბმა დროზე) | **ცნობილი Ableton-ის ექვივალენტი არ არის.** (Pro Tools-ს აქვს Sync Point — არა-Ableton წყაროა, B ამოწმებს, თუ მოიხსენიებს) | არაფერი | CZABA-ს ფუნქცია; Ableton-ზე მტკიცება არ კეთდება | R47-1…3; შესაბამისობა: არ ეხება |
| ბრაუზერიდან დამატება არჩეულ ხაზზე | Live 12 §5.10 (round 63-ის excerpt `b-round-63/ableton-5.10-excerpt-20261019.txt`) | D-21-ის R1-B1 | იგივე აქტიური ხაზი | R47-6; შესაბამისობა: არსებული ჩანაწერით |
| locator-ის მენიუ | Live 12 §6.4 (round 72 §0.2) | Rename/Delete/launch | ახალი პუნქტი CZABA-ს დამატებაა | R47-8 |

**B-ს გადაწყვეტილებები:**
- **B1 ხაზი:** აქტიური აუდიოხაზი (შეთავაზება, D-21). უარყოფილია: „პირველი თავისუფალი SFX ხაზი“ — `kind` არ არსებობს და ახალი ქცევაა.
- **B2 sync-ის წესი:** დარტყმა უძლიერეს პიკამდე (შეთავაზება). უარყოფილია: „პირველი დარტყმა 2 წმ-ში“ — riser-ს ცუდად სვამს (C7).
- **B3 history label:** არსებული `Add — <title>` (შეთავაზება) vs ახალი `Place at marker — <title>`.
- **B4 Snap:** დასმა Snap-ს არ ემორჩილება; მიზანი თავად მარკერის დროა.

---

<a id="sp-3"></a>

### SP-3 = SRW-47b — „Find sound“ მარკერთან (შეიძლება SP-3a + SP-3b)

**მიზანი:** მარკერიდან იხსნება პანელი საძიებო ველით. შედეგები დალაგებულია ტექსტური შესაბამისობით. თითოს აქვს preview და „Place“ (SP-2-ის მეთოდი).

**დამოკიდებულება:** SP-2 C PASS.

**K-რიგები:**
- **K1 ტიპი:** `WorkspaceSource.meta?: { description?: string; category?: string; keywords?: string[] }` (`app/types/arrangement.ts:78`). არჩევითია (D-21, SRW-21 adapter-ის კონტრაქტი).
- **K2 `spot-search.ts` (ახალი, სუფთა):** `rankSourcesForQuery(sources, query) → WorkspaceSource[]`.
  - ტოკენები `libraryQueryWords`-ით (`library.ts`), ყველა ტოკენი უნდა დაემთხვეს (AND, D-21), პრეფიქსით.
  - წონები: სათაური > category > keywords > description > collection. ტოლობისას — კოლექციის თავდაპირველი რიგი (დეტერმინისტული).
  - `meta`-ს გარეშე წყარო: სათაური + kind-ის keywords + კოლექცია, ზუსტად როგორც ბიბლიოთეკაში.
  - ცარიელი შეკითხვა → `kind: 'sfx'` პირველად, შემდეგ დანარჩენი (B2).
- **K3 demo meta:** `studio-lab-demo.ts`-ის 10 წყაროს ემატება `meta` (ინგლისური keywords). ბიბლიოთეკის ძებნა **არ იცვლება** (C16).
- **K4 პანელი `ArrangementSpotPanel.tsx` (ახალი, forwardRef-ის primitive-ით):**
  - გახსნა: მარკერის მენიუს პუნქტი „Find sound…“ (`MarkerMenuAction` `'find'`).
  - ველი ფოკუსით; ↑/↓ შედეგებში; Enter = Place; Space = preview (არსებული `startLibraryPreview`/`stopLibraryPreview`); Esc = დახურვა + preview-ს გაჩერება; ფოკუსი მარკერზე ბრუნდება.
  - შედეგის რიგში `ArrangementLibraryPreview` (`sourceId` prop) ან მისი მოკლე ვერსია — B წყვეტს.
  - ცარიელი შედეგი: საკუთარი ტექსტი. არ-ready წყარო: Place გამორთულია მიზეზით.
  - ქსელი არ გამოიყენება; კატალოგის upsell არ შედის.

**ფაილები:**
- **ახალი:** `app/lib/arrangement/spot-search.ts`, `__tests__/spot-search.test.ts` (30-წყაროიანი fixture, 5 შეკითხვა), `app/components/arrangement/ArrangementSpotPanel.tsx`, `__tests__/spot-panel-ui.test.tsx`, doc.
- **grants:** `app/types/arrangement.ts`, `app/data/studio-lab-demo.ts`, `ArrangementMarkerMenu.tsx`, `ArrangementMarkerRow.tsx`, `strings.ts`; `StudioWorkspace.tsx` მხოლოდ თუ პანელი workspace-ის დონეზე უნდა დაემონტაჟოს (B ამოწმებს მენიუს მონტაჟის ადგილს).
- **გაყინულია:** `library.ts`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx` (თუ მხოლოდ იმპორტდება), `collection.ts`, `ArrangementContext.tsx` (SP-2-ის მეთოდი საკმარისია; თუ არა — B grant-ს ამატებს მიზეზით).
- **SP-3a / SP-3b დაყოფა (თუ B საჭიროდ ჩათვლის):** 3a = K1–K3 (ტიპი, ძებნა, demo meta; ბრაუზერში dev-server import); 3b = K4 (პანელი).

**C-ის რიგები:**

| id | action | expected | verify |
| --- | --- | --- | --- |
| R47-10 | unit: 30 წყარო, 5 შეკითხვა წინასწარ ჩაწერილი სასურველი top-3-ით | 5/5 სასურველი top-3-შია; შედეგი დეტერმინისტულია (2 გაშვება = იგივე რიგი) | C, unit |
| R47-11 | ბრაუზერი: 3 შეკითხვა demo meta-ზე (მაგ. `impact`, `riser`, `hit`) | ჩაწერილი top-1 ემთხვევა | C, browser |
| R47-12 | შეკითხვა შედეგის გარეშე; meta-ს გარეშე წყარო სათაურით | ცარიელი მდგომარეობის ტექსტი ჩანს; სათაურით პოულობს; console error 0 | C, browser |
| R47-13 | მხოლოდ კლავიატურა: მარკერი → Shift+F10 → Find sound → ტექსტი → ↓ → Enter | ხმა ჯდება sync-ით (ექსპორტში ± 1 ms); ფოკუსი მარკერზე; Enter-ის დაჭერა = ერთი კლიპი | C, browser + measurement |
| R47-14 | Space preview → Esc; preview → Play ტრანსპორტზე | preview ჩერდება; preview და ტრანსპორტი ერთად არ ჟღერს (PRE-03) | C, browser |
| R47-15 | პანელი ღიაა: M, Delete, Ctrl+Z ველში | აკრეფა ველში რჩება; მარკერი/კლიპი არ იქმნება და არ იშლება | C, browser |
| R47-REG2 | ბიბლიოთეკის ძებნა SRW-12-ის შეკითხვებით | შედეგები ბაიტ-ბაიტ ძველია (DOM სია) | C, browser |

**რა შეიძლება დაზიანდეს:** ბიბლიოთეკის ძებნა (თუ A haystack-ს შეეხება — გაყინულია); გლობალური hotkey-ები ველში (M, Delete, Space); focus restore; `meta`-ს სერიალიზაცია (პროექტში არ ინახება — წყაროს ველია).

**Ableton:**

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
| --- | --- | --- | --- | --- |
| ბრაუზერის ძებნა/ტეგები | Live 12 „Working with the Browser“ (https://www.ableton.com/en/live-manual/12/working-with-the-browser/) — B ამოწმებს ძებნისა და tags-ის სექციას | **აქ არ შემოწმებულა** | CZABA-ს რანჟირება საკუთარია; Live-ის რიგზე მტკიცება არ კეთდება | R47-10, R47-11; შესაბამისობა: დაუდასტურებელი |
| ძებნა locator-იდან | ცნობილი ექვივალენტი არ არის | არაფერი | CZABA-ს დამატება | R47-13; არ ეხება |

**B-ს გადაწყვეტილებები:**
- **B1 AND vs OR:** AND (შეთავაზება, D-21-თან თანხვედრა). OR უფრო მეტს პოულობს, მაგრამ ორ სემანტიკას ქმნის.
- **B2 ცარიელი შეკითხვა:** SFX პირველად (შეთავაზება) vs ცარიელი სია.
- **B3 ბიბლიოთეკაში meta-ს ძებნა:** v1-ში არა (შეთავაზება) — SRW-12-ის რეგრესია ნულია.

---

<a id="sp-4"></a>

### SP-4 = SRW-46b — დარტყმები შეთავაზებების ფენაზე

**მიზანი:** ვიდეო-ხაზზე `Find hits` ვიდეოს აუდიოს აანალიზებს. დარტყმები SRW-43b-ის შეთავაზებებთან ერთად ჩანს, ტიპის ფილტრით. მიღებული დარტყმა ჩვეულებრივი მარკერი ხდება.

**დამოკიდებულება:** SP-1 C PASS; **SRW-43b C PASS** (შეთავაზებების ფენა და მიბმის საბოლოო წესი).

**K-რიგები:**
- **K1 context:** `findVideoHits(videoSourceId)` (შეთავაზება): `buffersRef`-იდან buffer → `findHitsOffMainThread`; ქეში მეხსიერებაში `sourceId`-ით (არა IndexedDB); გაუქმება `AbortController`-ით.
- **K2 დროის რუკა:** შეთავაზების დრო = `clip.start + (t − clip.sourceOffset)` თითო ვიდეო-კლიპზე, მხოლოდ `[sourceOffset, sourceOffset + duration]`-ში. შემდეგ — SRW-43b-ის წესი (კლიპს მიჰყვება თუ არა).
- **K3 UI:** ფილტრი `Cuts / Hits / Both`; თითო ტიპს საკუთარი ნიშანი (token, არა ახალი ფერი). მიღება/უარყოფა თითოზე და `Add all`.
- **K4 `Add all`:** ერთი `commitArrangement(next, label, before)` (`ArrangementContext.tsx:315`), label `Add hit markers (N)`.
  - სახელები `Hit N`, დროის მიხედვით, უდიდესი არსებული `Hit N`-იდან.
  - იმავე ms-ზე არსებული მარკერი რჩება; სტატუსი: „N added, M already marked“.
  - ზედა ზღვარი (B1): უძლიერესი 100; სტატუსი ამას ამბობს.
  - მარკერის რედაქტირება resync-ს არ იწვევს (D-29z37 R2).
- **K5 `origin`:** მიღებულ მარკერს `origin: 'hit'` (თუ SRW-43b-მ `origin` უკვე დაამატა, იგივე ველი; თუ არა — აქ ემატება, არჩევითად). move/rename/Delete Time ველს ინარჩუნებს (spread, `markers.ts:91-205`).
- **K6 გამორთვა:** `WorkspaceVideoSource.audio` = `'decoding'` / `'none'` / `'error'` → ღილაკი გამორთულია, მიზეზი ჩანს (`app/types/arrangement.ts:109`).

**ფაილები:**
- **ახალი:** `__tests__/hits-suggestions-ui.test.tsx`, `__tests__/hits-markers.test.ts`, doc.
- **grants:** `ArrangementContext.tsx`, `strings.ts`, `markers.ts` (`Hit N` helper), `app/types/arrangement.ts` (თუ `origin` აქ ემატება), და SRW-43b-ის შეთავაზებების ფენის ფაილები — **სახელები SRW-43b-ის `done` ჩანაწერიდან** (სავარაუდოდ `ArrangementMarkerRow.tsx` ან `ArrangementRuler.tsx`, C14).
- **გაყინულია:** `hits*.ts` (SP-1), `video.client.ts`, `model.ts`, `ArrangementClip.tsx`, `ArrangementLane.tsx`.

**C-ის რიგები:**

| id | action | expected | verify |
| --- | --- | --- | --- |
| R46-1u | F1 → Find hits (UI) | ჩანს ≥ 19 შეთავაზება; დროები (`data-*` ატრიბუტი) decode-truth-იდან ≤ 10 ms | C, browser + measurement |
| R46-4 | ანალიზის გაუქმება შუა გზაზე | worker ჩერდება; Undo title და მარკერების რაოდენობა უცვლელია | C, browser |
| R46-5 | `noaudio-2s-vp9.webm`; ჯერ კიდევ decoding; `broken.mp4` | ღილაკი გათიშულია, სამივეს მიზეზი ჩანს | C, browser |
| R46-6 | Add all → Ctrl+Z → Ctrl+Shift+Z | ერთი ნაბიჯი; ერთი Undo ყველას შლის; Redo აბრუნებს | C, browser |
| R46-6b | Add all, როცა 2 დარტყმა არსებულ მარკერთან ერთ ms-შია | ისინი არ მეორდება; სტატუსი „2 already marked“ | C, browser |
| R46-7 | ფილტრი Cuts/Hits/Both; Tab/Enter/Delete შეთავაზებაზე | ჩანს მხოლოდ არჩეული ტიპი; Delete მხოლოდ შეთავაზებას უარყოფს — კლიპი/მარკერი არ იშლება (SRW-24); ფოკუსი არ იკარგება | C, browser |
| R46-8 | ვიდეო-კლიპი გადატანილი 2 წმ-ით და თავი შეჭრილი 1 წმ-ით | შეთავაზებები გადაითვლება K2-ით; შეჭრილ ნაწილში არ ჩანს; მიღებული მარკერები SRW-43b-ის წესს მიჰყვება | C, browser + measurement |
| R46-9 | F3 (400 დარტყმა) → Add all | 100 მარკერი, სტატუსი ზღვარს ამბობს; `render-budget` გადის; scroll/zoom longtask > 50 ms = 0 | C, browser + measurement |
| R46-10 | Add all დაკვრისას | `createBufferSource`-ის ახალი გამოძახება 0 (MK-NO-RESYNC-ის მსგავსად) | C, browser |
| R46-REG | SRW-43b-ის ჭრილების რიგები; MK-* (დამატება, F2, Delete, Ctrl+←/→); snap მარკერებზე | უცვლელი | C, browser |

**რა შეიძლება დაზიანდეს:** ჭრილების შეთავაზებები (ერთი ფენაა); 100 მარკერით snap-ის სიხშირე (განზრახ, მაგრამ R46-REG ამოწმებს, რომ snap სწორად მუშაობს); მარკერის ხაზის label-ების სიგანე (`markerLabelWidth`) მჭიდრო მარკერებზე; Delete-ის მარშრუტი.

**Ableton:**

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
| --- | --- | --- | --- | --- |
| დარტყმების locator-ებად გადაქცევა | **ცნობილი წყარო არ არის.** Live-ის transient-ები clip-ის შიგნით ჩანს (SP-1-ის რიგი, დაუდასტურებელი) | არაფერი | CZABA-ს ფუნქცია | R46-6; არ ეხება / დაუდასტურებელი |
| locator-ის სახელი და Undo | Live 12 §6.4, §5.4.2 (round 72, round 38 excerpts) | locator-ები და undo history | ერთი Undo ჯგუფურ დამატებაზე — CZABA-ს წესი (SRW-43b-ის მსგავსად) | R46-6 |

**B-ს გადაწყვეტილებები:**
- **B1 ზღვარი:** 100 (შეთავაზება). მიზეზი: ყველა მარკერი ერთდროულად იხატება; 400 მარკერზე render budget-ის რისკია.
- **B2 სახელი:** `Hit N` (შეთავაზება, C3).
- **B3 `origin`-ის ჩაწერა:** დიახ, თუ მომხმარებელი SRW-48-ის ტიპის სვეტს ტოვებს (Q3).

---

<a id="sp-5"></a>

### SP-5 = SRW-48 — მარკერების სია CSV-ად (არჩევითი)

**მიზანი:** მარკერების სია ფაილად გადის, რომ ხმის რეჟისორმა ან მონტაჟისტმა გადახედოს.

**დამოკიდებულება:** SRW-16 C PASS; ტიპის სვეტისთვის SP-4 (`origin`).

**K-რიგები:**
- **K1 `spotting-list.ts` (ახალი, სუფთა):** `buildMarkerListCsv(arrangement, sources) → string`.
  - სვეტები: `#`, `Time` (`HH:MM:SS.mmm`), `Name`, `Type` (`manual` როცა `origin` არ არის), `Sounds` (აუდიო კლიპები, რომლებიც მარკერის დროს ფარავს, `; `-ით).
  - UTF-8 BOM; RFC 4180 quoting (`,`, `"`, ხაზის გადატანა); `\r\n`.
  - კადრები: მხოლოდ ცნობილი fps-ით (C5), v1-ში არა.
- **K2 UI:** ღილაკი `Download marker list (CSV)`. ადგილი B-ს გადასაწყვეტია (B1). მარკერების გარეშე გამორთულია მიზეზით.

**ფაილები:** ახალი `spotting-list.ts`, `__tests__/spotting-list.test.ts`, UI-ის ტესტი; grant — B1-ის მიხედვით ერთი კომპონენტი + `strings.ts`.

**C-ის რიგები:**

| id | action | expected | verify |
| --- | --- | --- | --- |
| R48-1 | 10 მარკერი (ქართული სახელი, მძიმე, ბრჭყალი) → ჩამოტვირთვა | BOM `EF BB BF`; RFC 4180 parser-ით 10 რიგი; სახელები ზუსტად ემთხვევა; დრო = მარკერის დრო (ms) | C, browser + node parse |
| R48-2 | ტიპი და ხმები | SP-4-ით მიღებული = `hit`; ხელით = `manual`; Sounds = დამფარავი კლიპების სათაურები | C, browser |
| R48-3 | მარკერების გარეშე | ღილაკი გამორთულია, მიზეზი ჩანს | C, browser |
| R48-T | Excel (Windows) და LibreOffice-ში გახსნა | ქართული სწორად ჩანს, სვეტები სწორია | **Tech Lead, ხელით** (ღრუბელში არა) |

**რისკი:** Excel ზოგ ლოკალში `;`-ს ელის; მაშინ ყველაფერი ერთ სვეტში ჩანს. R48-T ამას ამოწმებს. ალტერნატივა B-სთვის: `;` ან TSV.

**Ableton:** ცნობილი ექვივალენტი არ არის (locator-ების CSV ექსპორტი Live-ში ჩემთვის ცნობილი არ არის; B არ ამტკიცებს). შესაბამისობა: არ ეხება.

**B-ს გადაწყვეტილებები:** B1 ღილაკის ადგილი: Export დიალოგის ქვედა ზოლი (შეთავაზება; მის Tab-რიგს ტესტები აქვს — `export-dialog-tab-stops.test.tsx`) vs მარკერების ხაზის თავი (20 px, ადგილი მცირეა). B2 გამყოფი: `,` (შეთავაზება).

---

<a id="sp-6"></a>

### SP-6 = SRW-46c — მოძრაობის დაწყება/შეწყვეტა (არჩევითი)

**მიზანი:** SRW-43a-ის 160×90 კადრებზე მოძრაობის ენერგიის აწევა და დაცემა „Motion“ შეთავაზებად ჩანს.

**დამოკიდებულება:** SRW-43a C PASS (Mediabunny); SP-4 C PASS.

**შესწორება draft-ში:** „სიკაშკაშის სხვაობის პიკი“ მოძრაობის **განმავლობაში** მაღალია და არა დასაწყისში. შეთავაზება: სხვაობის მრუდზე ადაპტური ზღვრის **გადაკვეთა** (აწევა = დაწყება, დაცემა = შეწყვეტა). ჭრილის ±2 კადრში მოვლენა არ ითვლება.

**სიზუსტე:** SRW-43a კადრებს ~10 fps-ით იღებს. „≤ 1 კადრი“ მხოლოდ სრული fps-ით დაზუსტების შემდეგ მიიღწევა (43a-ის დაზუსტების მექანიზმით). სხვა შემთხვევაში ტოლერანსი = 1 ნიმუშის ბიჯი (~100 ms) და B ამას წერს.

**ფაილები:** ახალი `app/lib/arrangement/motion-events.ts` + ტესტი; SRW-43a-ის worker-ის ფაილი (სახელი მისი `done` ჩანაწერიდან); SP-4-ის ფილტრის ფაილი.

**C-ის რიგები:**

| id | action | expected | verify |
| --- | --- | --- | --- |
| R46-11 | `motion-30s-vp9.webm` (კვადრატი იწყებს/წყვეტს ცნობილ კადრებზე, 1 ჭრილი) | ყველა დაწყება/შეწყვეტა ნაპოვნია ≤ 1 კადრით (ან ≤ 1 ბიჯით, B-ს წესით); ჭრილზე მოვლენა არ არის | C, browser + measurement |
| R46-12 | ფილტრი Motion | ჩანს მხოლოდ მოძრაობა; R46-7 უცვლელია | C, browser |

**Ableton:** ვიდეოს ანალიზი Live-ში ცნობილი არ არის. შესაბამისობა: არ ეხება.

---

## 4. ღია კითხვები მომხმარებლისთვის (რეკომენდებული პასუხით)

1. **Q1 როდის იხსნება:** (a) ფაზა 2-ის შემდეგ — draft-ის ნაგულისხმევი; (b) **SP-1/SP-2/SP-3 ფაზა 2-მდე**, მომხმარებლის go-ს შემდეგ, რადგან Mediabunny-ს და SRW-43-ს არ საჭიროებს (რეკომენდაცია, თუ spotting უფრო პრიორიტეტულია, ვიდრე MP4 ექსპორტი); SP-4 მაინც SRW-43b-ს ელოდება.
2. **Q2 46c და 48 v1-ში:** რეკომენდაცია — SRW-48 დიახ (1 რაუნდი, იაფი), SRW-46c მოგვიანებით.
3. **Q3 CSV-ის ტიპის სვეტი:** თუ დიახ — SP-4 `origin`-ს წერს (არჩევითი ველი მოდელში). თუ არა — მოდელი უცვლელია.
4. **Q4 sync-ის ხელით შეცვლა:** v1-ში არა (რეკომენდაცია).
5. **Q5 demo-ში ახალი SFX „Delayed impact“:** საჭიროა R47-1-ისთვის (C9). ბიბლიოთეკის სია იცვლება.
6. **Q6 production:** `meta` და კატალოგის `SyncPointMs` შეძენილ კოლექციაში root/მომხმარებლის ცალკე ნაბიჯია (`studio.$productId.tsx` დაცულია). კატალოგის `SyncPointMs` გამოთვლილს უნდა ჯობდეს — ეს ცალკე დავალებაა.

---

## 5. რაუნდების რაოდენობა

| სცენარი | რაუნდები | შემადგენლობა |
| --- | --- | --- |
| **მინიმუმი** | **4** | SP-1, SP-2, SP-3 (ერთი), SP-4 |
| **მოსალოდნელი** | **5 + 1–2 fix-up = 6–7** | SP-3 იყოფა 3a/3b-ად; ისტორიულად ახალი ეტაპების ~⅓ Low-ზე FAIL-დება (მაგ. V-0.5a, V-1a, V-2a, STORE-1d) |
| **არჩევითებით** | **7 + 2 fix-up = 8–9** | + SP-5 (SRW-48), + SP-6 (SRW-46c) |

რეგრესიის რაუნდები (ყოველ ~3 დღეში, `regression-last.json`) აქ არ ითვლება.

---

## 6. წინაპირობების ჯაჭვი მიმდინარე რიგიდან

მიმდინარე `post_current_stage_queue` (2026-10-26): STORE-REDESIGN (`in_progress`, round 190 = STORE-1d fix-up, შემდეგ REGRESSION, STORE-2…5) → REVIEW-RECOMMENDATIONS (`not_started`) → T12-ADVANCED (`not_started`) → PHASE2-VIDEO-SCORING (`queued_after_t12_awaiting_user_go`).

```
SRW-16  c_pass_tech_lead_manual  ✔ (C PASS; Tech Lead R72-T…R78-T ღიაა, არ ბლოკავს)
   │
   ├── R-SP0 (root: fixture-ები loop/media/spotting/)
   │      │
   │      └── SP-1 SRW-46a ──┬── SP-2 SRW-47a ── SP-3 SRW-47b
   │                         │
   │                         └── SP-4 SRW-46b ◄── SRW-43b C PASS
   │                                  │                ▲
   │                                  ├── SP-5 SRW-48  │
   │                                  └── SP-6 SRW-46c ◄── SRW-43a C PASS
   │
   └── PHASE2: root `npm i mediabunny` → SRW-41 → SRW-40 → SRW-42 → SRW-43a → SRW-43b → SRW-44
```

- **SP-1, SP-2, SP-3, SP-5:** მხოლოდ SRW-16 + მომხმარებლის go.
- **SP-4:** + SRW-43b C PASS (ფაზა 2-ის რიგით ~9–10 რაუნდი ფაზა 2-ის დაწყებიდან: 41a,b; 40a–d; 42a–c; 43a,b).
- **SP-6:** + SRW-43a C PASS.

---

## 7. JSON: `PHASE2B-SPOTTING`-ის `tasks`

ჩანაწერის დანარჩენი ველები draft-ის §„ზუსტად რა ჩაიწერება“-დან რჩება, ორი ცვლილებით: `prerequisites` → `["SRW-16 C PASS (c_pass_tech_lead_manual is sufficient)", "SRW-43b C PASS for SRW-46b only", "SRW-43a C PASS for SRW-46c only", "SP-0 fixture round C PASS (Node generator + SHA256SUMS in loop/media/spotting, no store change)"]; `status` → `"queued"`, `gate` → `"Approved by Saba 2026-10-26; position per loop/policy.local.md. No further go-ahead."``; `order` → `["SRW-46a", "SRW-47a", "SRW-47b", "SRW-46b (after SRW-43b)", "SRW-48 optional", "SRW-46c optional (after SRW-43a)"]`.

```json
"tasks": [
  {
    "id": "SRW-46",
    "title": "დარტყმები ვიდეოს აუდიოში → შეთავაზებები → მარკერები (Hit N)",
    "spec": "docs/technical/studio-real-workspace/phase-2b-spotting.md#srw-46",
    "depends_on": ["SRW-16", "SRW-43b (46b only)", "SRW-43a (46c only)"],
    "stages": [
      "46a worker: STFT 1024/256 Hann, log-compressed spectral flux, moving median ±0.25 s × k + δ, min gap 150 ms, onset refinement inside the STFT frame (≤ 1 ms on clean signals); chunked mono copies with transfer, never transfer getChannelData buffers; abort + stall timeout; sync fallback without Worker",
      "46b UI on the SRW-43b suggestion layer: Find hits on the video track, disabled with reason for decoding/none/error, filter Cuts/Hits/Both, accept/reject, Add all = one history step 'Add hit markers (N)', cap 100 strongest, skip existing same-ms markers, names 'Hit N', optional marker origin 'hit', in-memory cache per source, suggestion time = clip.start + (t − sourceOffset)",
      "46c motion start/stop from SRW-43a frames: threshold crossings of the frame-difference curve, none within ±2 frames of a cut, full-fps refinement or 1-step tolerance (optional)"
    ],
    "acceptance": [
      {"id": "R46-1", "action": "F1 hits-30s-vp9-opus.webm: 20 known hits on pink noise, SNR 20 dB (unit fixture + dev-server import in Chromium)", "expected": "≥ 19 found, ≤ 1 false, each ≤ 10 ms from decode-truth", "verify": "C, unit + browser", "status": "todo"},
      {"id": "R46-1b", "action": "same audio in hits-30s-h264-aac.mp4", "expected": "same condition against decode-truth", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R46-2", "action": "F2 quiet-30s: pink noise + one sustained chord, no hits", "expected": "≤ 2 false", "verify": "C, unit + browser", "status": "todo"},
      {"id": "R46-3", "action": "F3 10-minute video", "expected": "analysis ≤ 20 s; 0 long tasks > 50 ms during analysis", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R46-SYNC0", "action": "unit: 0.370 s silence then a hit at 44.1 and 48 kHz", "expected": "onset 0.370 ± 1 ms", "verify": "C, unit", "status": "todo"},
      {"id": "R46-NODETACH", "action": "play the video after analysis", "expected": "video sound intact; channel data length unchanged", "verify": "C, browser", "status": "todo"},
      {"id": "R46-4", "action": "cancel analysis midway (46b)", "expected": "worker stops; Undo title and marker count unchanged", "verify": "C, browser", "status": "todo"},
      {"id": "R46-5", "action": "video without audio / still decoding / broken.mp4", "expected": "Find hits disabled, reason visible for all three", "verify": "C, browser", "status": "todo"},
      {"id": "R46-6", "action": "Add all → Ctrl+Z → Ctrl+Shift+Z; plus 2 hits on existing same-ms markers", "expected": "one history step; one Undo removes all, Redo restores; duplicates skipped and reported", "verify": "C, browser", "status": "todo"},
      {"id": "R46-7", "action": "filter Cuts/Hits/Both; Tab/Enter/Delete on a suggestion", "expected": "only the chosen type shows; Delete rejects only the suggestion (no clip/marker deleted, SRW-24); focus kept", "verify": "C, browser", "status": "todo"},
      {"id": "R46-8", "action": "video clip moved +2 s and head trimmed 1 s", "expected": "suggestions recomputed as clip.start + (t − sourceOffset); none in the trimmed part; accepted markers follow the SRW-43b rule", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R46-9", "action": "F3 (400 hits) → Add all", "expected": "100 markers, status states the cap; render-budget passes; 0 long tasks > 50 ms on scroll/zoom", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R46-10", "action": "Add all during playback", "expected": "0 new createBufferSource calls (no resync)", "verify": "C, browser", "status": "todo"},
      {"id": "R46-11", "action": "46c: motion-30s-vp9.webm, square starts/stops on known frames, 1 cut", "expected": "every start/stop ≤ 1 frame (or ≤ 1 sampling step by B rule); no event at the cut", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R46-REG", "action": "SRW-43b cut rows, MK-* marker rows, snap to markers", "expected": "unchanged", "verify": "C, browser", "status": "todo"}
    ],
    "status": "queued",
    "evidence": []
  },
  {
    "id": "SRW-47",
    "title": "ხმა მარკერზე sync point-ით და „Find sound“ პანელი",
    "spec": "docs/technical/studio-real-workspace/phase-2b-spotting.md#srw-47",
    "depends_on": ["SRW-16", "SRW-46a"],
    "stages": [
      "47a sync point (strongest-peak rule: onset ≤ 150 ms before the global 10 ms RMS peak in the first min(duration,10 s), else energy-rise start, silence → 0) computed in the 46a worker when a source becomes ready; pure placeSourceAtTime: start = marker − sync, negative start → start 0 + sourceOffset, refuse when occupied (canPlaceLibraryClip semantics, dropBlocked text), never relocate; marker menu 'Place selected sound' on the active audio track; one history step; sync tick on the clip; synthetic demo SFX 'Delayed impact'",
      "47b optional WorkspaceSource.meta {description, category, keywords}; pure rankSourcesForQuery (libraryQueryWords tokens, AND, prefix, weights title > category > keywords > description > collection, stable order); demo meta; ArrangementSpotPanel from the marker menu 'Find sound…' with preview (PRE-03), Enter = place, Esc closes, focus returns to the marker; library search unchanged"
    ],
    "acceptance": [
      {"id": "R47-1", "action": "Delayed impact (sync 0.370), marker 5.000 → Place → WAV export with the video muted", "expected": "hit at 5.000 ± 1 ms", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-2", "action": "Soft impact (sync 0), marker 3.000", "expected": "clip at 3.000, sourceOffset 0; export 3.000 ± 1 ms", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-3", "action": "Delayed impact, marker 0.100", "expected": "clip at 0, head trimmed by 0.270; export 0.100 ± 1 ms", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-3b", "action": "Slow rise, marker 8.000", "expected": "export peak near 8.000 (value recorded); the riser does not start at 8.000", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-4", "action": "target place occupied", "expected": "dropBlocked text visible; clip count and Undo title unchanged", "verify": "C, browser", "status": "todo"},
      {"id": "R47-5", "action": "Place → Ctrl+Z → Ctrl+Shift+Z", "expected": "one step; Redo restores the same place", "verify": "C, browser", "status": "todo"},
      {"id": "R47-6", "action": "active track Video / no selected source / source still loading", "expected": "menu item disabled with reason or status shown; project unchanged", "verify": "C, browser", "status": "todo"},
      {"id": "R47-7", "action": "sync tick at two zoom levels", "expected": "x = (sync − sourceOffset)·px/s ± 1 px; no tick when sync = 0", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-8", "action": "keyboard: marker → Shift+F10 → Place → held Enter", "expected": "exactly one clip (D-29z64); focus back on the marker", "verify": "C, browser", "status": "todo"},
      {"id": "R47-9", "action": "Place during playback", "expected": "playback continues; the new clip sounds on the next pass; no click", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-10", "action": "unit: 30-source fixture, 5 queries with expected top-3", "expected": "5/5 in top-3; deterministic order", "verify": "C, unit", "status": "todo"},
      {"id": "R47-11", "action": "browser: 3 queries on the demo meta", "expected": "recorded top-1 matches", "verify": "C, browser", "status": "todo"},
      {"id": "R47-12", "action": "query with no result; source without meta", "expected": "empty-state text; title search works; 0 console errors", "verify": "C, browser", "status": "todo"},
      {"id": "R47-13", "action": "keyboard only: marker → Find sound → type → ↓ → Enter", "expected": "sound placed by sync (± 1 ms in export); focus on the marker; held Enter = one clip", "verify": "C, browser + measurement", "status": "todo"},
      {"id": "R47-14", "action": "Space preview → Esc; preview then transport Play", "expected": "preview stops; preview and transport never sound together (PRE-03)", "verify": "C, browser", "status": "todo"},
      {"id": "R47-15", "action": "panel open: type M, Delete, Ctrl+Z in the field", "expected": "typing stays in the field; no marker/clip created or deleted", "verify": "C, browser", "status": "todo"},
      {"id": "R47-REG", "action": "library drag-drop, Enter/+, preview, SRW-12 search queries, snap, marker menu Rename/Play/Delete", "expected": "unchanged (search result lists identical)", "verify": "C, browser", "status": "todo"}
    ],
    "status": "queued",
    "evidence": []
  },
  {
    "id": "SRW-48",
    "title": "მარკერების სია CSV-ად (არჩევითი)",
    "spec": "docs/technical/studio-real-workspace/phase-2b-spotting.md#srw-48",
    "depends_on": ["SRW-16", "SRW-46b (Type column)"],
    "stages": [
      "48 pure buildMarkerListCsv: #, Time HH:MM:SS.mmm, Name, Type (origin or manual), Sounds (audio clips covering the marker time); UTF-8 BOM, RFC 4180 quoting, CRLF; no frame column until fps is known; download button disabled with reason when there are no markers"
    ],
    "acceptance": [
      {"id": "R48-1", "action": "10 markers incl. Georgian names, comma and quote → download", "expected": "BOM EF BB BF; 10 rows by an RFC 4180 parser; names exact; times equal marker times (ms)", "verify": "C, browser + node parse", "status": "todo"},
      {"id": "R48-2", "action": "Type and Sounds columns", "expected": "accepted hits = hit; manual = manual; Sounds = titles of covering clips", "verify": "C, browser", "status": "todo"},
      {"id": "R48-3", "action": "no markers", "expected": "button disabled, reason visible", "verify": "C, browser", "status": "todo"},
      {"id": "R48-T", "action": "open in Excel (Windows) and LibreOffice", "expected": "Georgian shown correctly, columns split", "verify": "Tech Lead manual (not in cloud)", "status": "todo"}
    ],
    "status": "queued",
    "evidence": []
  }
]
```

---

## 8. რაც ვერ გადავამოწმე

- ღრუბლის runner-ზე native `ffmpeg`-ის და LibreOffice-ის არსებობა.
- ffmpeg.wasm-ის core-ში `lavfi`, VP9/Opus encoder-ების არსებობა (fixture-ის გზა 2).
- Chrome-ის `decodeAudioData` MP4/AAC-ის priming/edit list-ს როგორ ექცევა. ამიტომ შედარება decode-truth-თან ხდება (§1.1).
- Ableton Live 12-ის manual-ის „Audio Clips, Tempo and Warping“ და „Working with the Browser“ სექციების ზუსტი შინაარსი. §3-ში მოცემული ბმულები B-მ Playwright-ით უნდა გადაამოწმოს; Ableton-ზე არცერთი მტკიცება აქ არ კეთდება.
- SRW-43b-ის შეთავაზებების ფენის ფაილების სახელები: SRW-43 ჯერ არ დაწყებულა (`queued`). SP-4-ის grants მისი `done` ჩანაწერიდან ივსება.
- R46-3-ის 20 წმ და R46-9-ის 100-იანი ზღვარი runner-ზე გაზომვამდე სამიზნეებია; B-ს შეუძლია გაზომვის შემდეგ შეცვალოს, მიზეზით.
