# C — საბაზისო აუდიტი: რეალური Studio vs პროტოტიპი vs FB-01..16

თარიღი: 2026-10-07 · ავტორი: C (დამოუკიდებელი ვერიფიკატორი) · მეთოდი: **მხოლოდ კოდის წაკითხვა**.
Runtime PASS არ არის გამოცხადებული. აუდიო არ მომისმენია. ბრაუზერში არაფერი გამიშვია: რეალური შემოწმება A-ს შემდეგ `/browse`-ით მოხდება.
App source, B-ს ფაილები და დაცული auth ფაილები არ შემიცვლია. git-ში არაფერი ჩამიწერია.

## 0. გარემოს ფაქტები (არსებული ლოგებიდან, ხელახლა არ გამიშვია)

| ფაქტი | წყარო |
| --- | --- |
| build OK (`✓ built in 4.53s`); `baseline-tsc.txt` ცარიელია; vitest: `Test Files 32 passed (32)`, `Tests 464 passed (464)` | `tmp/studio-real-loop/baseline-*.log` |
| Studio-ს UI-ზე ტესტი **არ არსებობს**: `StudioContext`, `components/studio/*` და e2e Studio არ ფარავს. ტესტები მხოლოდ `sfx-*`-ზეა (export 10, scene 8, edit 3, video-transport 2, video 4) | vitest-ის სია, `e2e/` |
| დაცული dirty ფაილები (4) — SHA `protected-baseline.json`-შია. ჩემ მიერ შეუხებელია | `git status` |
| რეალური route `/studio/:productId` auth+purchase-ითაა დაცული, stem-ები hardcoded `middle-east`-ზეა და token-იან URL-ებს იყენებს. **C-ს runtime ტესტები მხოლოდ `/studio-lab` დემო აქტივებზე** ჩატარდება | `routes/studio.$productId.tsx:159-258` |
| StrictMode ჩართული არ არის | `entry.client.tsx` |

## 1. მთავარი მიგნება: სამი ნაწილობრივი ძრავა, არცერთი არ არის საკმარისი

| ძრავა | ძლიერი მხარე | ფუნდამენტური ხარვეზი |
| --- | --- | --- |
| **A. `contexts/StudioContext.tsx`** (რეალური Studio) | ცოცხალი `AudioBufferSourceNode` თითო stem-ზე; gain იცვლება დაკვრისას; IndexedDB cache; OfflineAudioContext export + WAV worker + ffmpeg MP3 | **კლიპის მოდელი არ აქვს.** stem = ტრეკი = ერთი „კლიპი“ timeline-ის 0-ზე. `start`/`offset` ველები არ არსებობს, ამიტომ split, move, duplicate და ერთ ტრეკზე რამდენიმე კლიპი ვერ აისახება |
| **B. `output/studio-workspace-prototype/workspace.js`** | სწორი კლიპის მოდელი `{lane,start,duration,offset}`; `schedule()` სწორად აწყობს მომავალ და მიმდინარე კლიპებს (`start(when, offset+elapsed, duration-elapsed)`); ripple `deleteTime`; JSON-snapshot undo; trim წყაროს საზღვრებით | სინთეზური buffer-ები; **ხისტი 60 წმ** (`Math.min(60,…)`, `freeStart`, `trimClip`); export არ აქვს; 4 ფიქსირებული lane; DOM/ID-ებზე მიბმული vanilla JS |
| **C. `lib/sfx-scene.ts` + `sfx-edit.ts` + `sfx-export*`** (`/scenes/:productId`) | sample-ზუსტი offline render: clip gain (0–2), pan (equal-power, `StereoPannerNode`-ის ფორმულის იდენტური), fadeIn/out, loop+crossfade, peak/`overloaded`; 24-bit WAV encoder; markers-ის და loop-ის მოდელი ვალიდაციით; ტესტებით დაფარული | დაკვრა = **მთელი სცენის წინასწარი render → ერთი buffer**. ყოველი mute/solo/gain ცვლილება ითხოვს სრულ re-render-ს და გადატვირთვას. დეკოდირება მხოლოდ PCM WAV-ზე მუშაობს (`decodeSfxWav`; `sfx-original.client.ts` სხვა გზას არ იყენებს და purchase-ით დაცულ `/api/recording-original`-ს მიმართავს — დემო lab-ში პირდაპირ არ გამოდგება). ლიმიტებია 300 წმ და 12 კლიპი, ხოლო `video.duration` ზუსტად უნდა უდრიდეს `scene.duration`-ს. track/lane ფენა არ აქვს: mute/solo კლიპის დონეზეა |

**ბლოკერი #1 B-სთვის:** მეოთხე ძრავა არ უნდა შეიქმნას. მოდელი = პროტოტიპის კლიპის ფორმა + SFX-ის კლიპის ველები (gain/pan/fade) + track/group ფენა. **ერთი graph-builder ფუნქცია** უნდა კვებავდეს `AudioContext`-საც (დაკვრა) და `OfflineAudioContext`-საც (export), რომ export დაკვრის იდენტური იყოს. სახელების ხაფანგი: SFX-ში `offset` **timeline-ის პოზიციაა**, ხოლო `start/end` წყაროს დიაპაზონი. პროტოტიპში `start` timeline-ია, `offset` კი წყარო. გადატანისას ველები ერთმანეთში აირევა, თუ მკაფიოდ არ დარქმევია `timelineStart / sourceOffset / duration`.

## 2. რეალურ Studio-ში „არსებული“, მაგრამ მკვდარი კოდი (არსებულად არ ჩაითვალოს)

| ელემენტი | ფაქტი |
| --- | --- |
| Undo/Redo | `_pushHistory` არსად იძახება. `canUndo` ყოველთვის false-ია, Ctrl+Z ცარიელი გარსია |
| Snap | `_snapToGrid` არ გამოიყენება. G მხოლოდ badge-ს რთავს, არაფერი სნეპდება |
| Trim | `setTrimStart/End`-ს UI-დან არავინ იძახებს |
| Video sync | `video.startOffset` ინახება, მაგრამ არ გამოიყენება. `_handleOffsetSeek` გამოუყენებელია, „Sync Point Control“ div ცარიელია. ხაზი 666: `No video sync - video controls are independent`. context `videoRef`-ს არ კითხულობს. ვიდეოს Play ცალკე ღილაკია |
| Save | `saveToFirebase/loadFromFirebase` — TODO placeholder |
| Ableton `.als` export | `SampleRef Path=""`. `.als` აუდიოფაილზე არ მიუთითებს, `_fileName` გამოუყენებელია. ეს „ღრუ“ export-ია და honest-export მოთხოვნას არ აკმაყოფილებს |
| WAV quality | worker-ში ყოველთვის `bitDepth = 16`-ია, sampleRate კი hardcoded 48000. `EXPORT_QUALITY_SETTINGS`-ში 24/32-bit ცხადდება, თუმცა არ გამოიყენება |

## 3. დამალული ხაფანგები წყაროდან (runtime-ში დასადასტურებელი)

| # | ხაფანგი | ადგილი | რისკი |
| --- | --- | --- | --- |
| P1 | **Trim ცვლის აუდიოს დროში:** დაკვრა `offset = trimStart + currentTime`, ანუ timeline 0-ზე ჟღერს წყაროს `trimStart`. trim-ის შემდეგ მასალა მარცხნივ გადაიწევს, ხოლო waveform/ruler `stem.duration`-ის პროპორციით რჩება → UI-ს და ხმას შორის აცდენა | `StudioContext:726,784` | High |
| P2 | **Export-ის სიჩუმის კუდი:** `length = max(trimEnd)`, კონტენტი კი `trimEnd−trimStart` სიგრძით 0-დან იწყება | `:1113-1156` | Medium |
| P3 | **Unmute დაკვრისას ჩუმია:** source იქმნება მხოლოდ `shouldStemBeAudible`-ის შემთხვევაში. თუ დაკვრა muted/implicit-solo stem-ით დაიწყო, unmute-ზე ხმა pause/play-მდე არ ჩაირთვება | `:712,771,893` | High |
| P4 | `setVolume` muted/solo-ს უგულებელყოფს: `gain.value = volume` → muted ტრეკი fader-ის მოძრაობისას ისევ ჟღერს | `:1044` | High |
| P5 | **Side effect-ები `setState` updater-ში:** node-ების შექმნა/stop, ref-ის მუტაცია და loop restart. React-ის ხელახალი გაშვების ან StrictMode-ის დროს წყარო გაორმაგდება. დაგეგმვა updater-ის გარეთ უნდა მოხდეს | `:678-741, 606-668, 764` | Medium (ლატენტური) |
| P6 | Seek დაკვრისას: stop → `setTimeout(togglePlayPause,100)` = 100 ms განზრახ სიჩუმე. სწრაფი სერიული seek-ებისას რამდენიმე timeout რიგში დგება | `:845` | Medium |
| P7 | Loop wrap rAF-polling-ით: stop+restart ≈16 ms jitter/ხარვეზი. პროტოტიპიც ასეა (`frame()`→`seek`). SFX `source.loop/loopStart/loopEnd`-ს იყენებს (gapless), რაც ერთი buffer-ისთვის მუშაობს, მრავალკლიპიანი graph-ისთვის კი lookahead დაგეგმვა სჭირდება | `:613`, proto `frame()` | Medium |
| P8 | Waveform-ის პროგრესი `time/stem.duration`-ია და trim/loop-ს არ ითვალისწინებს. loop mask-იც `stem.duration`-ის პროცენტით ითვლება და არა საერთო timeline-ით | `:662`, `StudioTrack:332` | Low |
| P9 | MP3 დამოკიდებულია `unpkg.com/@ffmpeg/core`-ზე runtime-ში. CDN/CSP/offline-ის დროს MP3 ვერ შედგება, ხოლო WAV worker დამოუკიდებელია. UI ეს გულწრფელად უნდა თქვას | `utils/ffmpeg.ts` | Medium |
| P10 | ვიდეოს ჩატვირთვა: MIME-ის მკაცრი allowlist. ცარიელი `file.type` (ზოგი `.mov`/`.mkv`) უარყოფილია. 15 წმ timeout არ იწმინდება; `(file as any)` YouTube hack | `StudioContext:436`, `VideoUploadZone:20` | Medium (FB-15) |
| P11 | Drift: პროტოტიპი ასწორებს მხოლოდ >0.25 წმ-ზე, SFX >0.08 წმ-ზე და მყარად გადაიტვირთება. rate-correction არცერთს არ აქვს. ეს runtime კრიტერიუმია და არა დადასტურებული ბაგი | proto `syncVideo`, `SfxSceneBuilder:259` | — |
| P12 | Mute/Solo-ს მოდელები ერთმანეთს არ ემთხვევა: Studio-ში Mute>Solo, ხოლო exclusive solo Ctrl-ით იკრიბება. პროტოტიპის `laneGain` solo-დან lane 0-ს გამორიცხავს და მხოლოდ lane-ის დონეზე მუშაობს. SFX-ში solo კლიპზეა. ერთი წესი უნდა აირჩეს (Ableton MIX 18.1: exclusive solo, Ctrl/Cmd ამატებს) | — | Medium |
| P13 | SFX-ში `renderSfxEdit` ჯერ clamp-ს და 24-bit quantize-ს **თითო კლიპზე** ასრულებს, შემდეგ კი მიქსს. gain>1-ისას კლიპი მიქსამდე იჭრება; ცოცხალი WebAudio graph ასე არ მოიქცევა, რაც play/export-ს შორის სხვაობას გამოიწვევს | `sfx-edit.ts:renderSfxEdit` | Medium |
| P14 | Master node არსად არის: ყოველი gain პირდაპირ `destination`-ზე უერთდება. Master/peak meter-ისთვის საერთო bus სავალდებულოა | ყველა ძრავა | (FB-14) |

## 4. FB-01..16 — სიმართლის ცხრილი

ლეგენდა: **✔** გამოსაყენებელი (ფაილი:ფუნქცია) · **◐** ნაწილობრივი · **✗** არ არსებობს · **?** არსებობს, runtime-ში შეუმოწმებელი. სვეტები: Studio = რეალური `/studio`, Proto = პროტოტიპი, SFX = `/scenes`.

| FB | ტიპი | Studio | Proto | SFX | შეფასება / გამოყოფა |
| --- | --- | --- | --- | --- | --- |
| 01 დინამიკური ხანგრძლივობა | ქცევა | ✗ (`masterDuration` = max stem) | ✗ (60 წმ hardcode) | ✗ (≤300 წმ) | ახალია. ruler/scroll/overview/export ერთი `arrangementEnd`-დან უნდა გამოითვალოს |
| 02 Cut Time (Ctrl+Shift+X, ripple) vs Cut (Ctrl+X, ხვრელი) | ქცევა | ✗ | ◐ `deleteTime` ripple + Delete ხვრელით; clipboard/paste/Ctrl+X ✗ | ✗ | `deleteTime`-ის ლოგიკა გამოსაყენებელია (ვიდეო lane-ს და loop-ს ასწორებს). Clipboard ახალია |
| 03 სხვა ხაზზე გადატანა (+Ctrl დროის დაფიქსირება), საწყისზე ასლი არ რჩება | ქცევა | ✗ | ✗ (იმავე lane-ზე; CLP-01 ⚖) | ✗ | ახალია. ტესტი: წყაროს lane-ზე კლიპი 0, სამიზნეზე 1, `start` უცვლელი modifier-ით |
| 04 Clip Gain ≠ Volume | ფუნქცია | ✗ (მხოლოდ track volume 0–1) | ✗ | ✔ `clip.gain` 0–2 render-ში | **Clip gain = კლიპის pre-fader მამრავლი (dB), track fader-ამდე.** მოსაუბრის „მგრძნობელობის/მიკროფონის“ მეტაფორას ფაილზე დაფუძნებულ მონტაჟში ფიზიკური ეკვივალენტი არ აქვს. UI-ში/doc-ში მას „input sensitivity“ არ უნდა ერქვას |
| 05 Pan | ფუნქცია | ✗ (ALS-ში ველი არის, აუდიოში არა) | ✗ | ✔ pan-ის ფორმულა | `StereoPannerNode` ცოცხლად + იგივე ფორმულა offline-ში. დასაზუსტებელია: track pan თუ clip pan (FB ტექსტი: track/master) |
| 06 ხმის ავტომაცია კლიპზე | ფუნქცია | ✗ | ✗ | ◐ მხოლოდ წრფივი fadeIn/out | ახალია. Gain/Volume FB-ში აირია. **პარამეტრი შესათანხმებელია**: MVP = clip volume breakpoint-ები `setValueCurveAtTime`/`linearRamp`-ით და იდენტური offline graph-ით |
| 07 ვიდეოს Fade/Opacity | ფუნქცია | ✗ | ✗ | ✗ | ახალია. მხოლოდ preview-ის CSS opacity, თუ ვიდეოს export არ არის. „გულწრფელი“ შეზღუდვა |
| 08 პანელის დანიშნულება/ადგილი | UX | — | ? (Clip Detail) | — | სამიზნე პანელი ერთმნიშვნელოვანი არ არის. კოდით არ ფასდება, მხოლოდ ეკრანზე |
| 09 Bars/Beats ruler + Metronome | ფუნქცია | ✗ | ✗ | ✗ | ახალია. BPM-ის წყარო არ არსებობს: `ProductWithStems`-ს `bpm` არ აქვს, `ExportDialog` `bpm:120 // TODO`-ს იყენებს. catalog API BPM-ით ფილტრავს, ამიტომ მონაცემი backend-ზე სავარაუდოდ არის — B-მ წყარო უნდა დაასახელოს. წამების ruler უნდა დარჩეს |
| 10 სახელდებული Markers/Locators + ნავიგაცია | ფუნქცია | ✗ | ✗ | ◐ `SfxSceneVideo.markers[]` + ვალიდაცია (≤100, სახელი ≤100) | მოდელი და ვალიდაცია გამოსაყენებელია, timeline-ზე UI და „Play from marker“ ახალია |
| 11 Tempo | ფუნქცია | ✗ | ✗ | ✗ | **Grid tempo** (ruler/snap/metronome) ≠ **audio time-stretch**. stretch არსად არის. scope: მხოლოდ grid tempo; UI-მ stretch არ უნდა დაგვპირდეს. ტრანსკრიპტი 2.txt 02:26–03:17 tempo-ს ცვალებადობას ახსენებს, მერე კი ამბობს „ესენი არ გვჭირდება“ — **ორაზროვანია**, შესათანხმებელია |
| 12 Track Groups/Subgroups (Ctrl+G, fold, group mute/volume) | ფუნქცია | ✗ | ✗ | ✗ | **არ აირიოს multi-select-თან:** Studio-ს `selectedStemIds` + „GROUP SOLO MODE“ და პროტოტიპის `selection[]`/`moveGroup` **კლიპების/ტრეკების მონიშვნაა** და არა ჯგუფის ობიექტი. ჯგუფი = ჩალაგებადი entity, საკუთარი summing GainNode bus, fold. წევრების M/S/vol უცვლელი რჩება. ვიდეოზე ჯგუფები არ სჭირდება (2.txt 05:01) |
| 13 Grid დანაყოფები + Snap on/off + free | ქცევა | ◐ მკვდარი (`_snapToGrid`, G=badge) | ✗ (0.1 წმ ფიქსირებული ბიჯი) | ✗ | ახალია. ტრანსკრიპტის „1/4 = თითო ტაქტი“ სპეციფიკაციად **არ** გამოიყენება. snap-ის წყარო: grid + კლიპის კიდეები + markers |
| 14 Master Volume/Mute + overload | ფუნქცია | ✗ (master node არ არის) | ✗ | ◐ `peak/overloaded` (offline) | master GainNode + AnalyserNode peak; export-ზე იგივე master. კომპრესორი/ეფექტები — სამომავლო, scope-ის გარეთ |
| 15 „ვიდეო ვერ შევაგდე“ | **დასადასტურებელი პრობლემა** | ◐ drop zone არსებობს; MIME allowlist (P10) | **სავარაუდო მიზეზი:** lane-ის `ondrop` ეძებს `assets.find(getData("text/plain"))`-ს. OS-იდან ჩაგდებული ფაილი უარყოფილია („გამოიყენე + საკუთარი ვიდეო“), video lane-ზე კი `dropEffect="none"`. მუშაობს მხოლოდ ფაილის არჩევა | ✔ `accept="video/*"` file input | ვიდეოს კადრები (3.mp4 01:05 desktop ფაილებით, 01:12/01:26 პროტოტიპის UI) ამ ჰიპოთეზას ემთხვევა. ჩაწერილი ვერსია უცნობია. **ეს import-ის პრობლემაა და არა sync-ის** |
| 16 საერთო Play/Playhead ვიდეოსთვის + ვიდეოს ორიგინალი ხმის ცალკე Mute | ქცევა | ✗ **sync საერთოდ არ არის** (ცალკე ვიდეოს Play) — ეს ბაგი კი არა, ფუნქციის არარსებობაა | ◐ `syncVideo` ერთ transport-ზე; **ვიდეოს ხმა ყოველთვის `muted`-ია**, ცალკე ხმის lane არ აქვს | ◐ sync + `video.muted/volume` checkbox, თუმცა ხმა ელემენტიდან მოდის და Master/export-ში არ შედის | **sync-ის დარღვევა დადასტურებული არ არის.** მოთხოვნაა: ვიდეოს ხმა = timeline-ის audio lane, დამოუკიდებელი Mute-ით, ხოლო ვიდეო დაკვრას განაგრძობს (3.txt 01:33–02:16) |

## 5. პროტოტიპის ძირითადი flow-ები → რეალურ Studio-ში

| Flow | Proto (კოდი) | Studio | სტატუსი ახალი workspace-სთვის |
| --- | --- | --- | --- |
| Library: ხე/ძიება/preview/კლავიატურა/drag | ✔ `renderLibrary`, `startPreview`, ghost drop | ✗ (fixed stems) | გადასატანია. ცნობილი ✗: LIB-03 AND-ძიება, LIB-07 არჩეული ტრეკი |
| Clip bar = move, waveform = time-select, კიდე = trim | ✔ `moveGroup`, `trimClip` | ✗ (waveform-ზე მხოლოდ time-select/seek) | ახალი real UI. `trimClip`-ის მათემატიკა სწორია |
| Additive multi-select (Ctrl/Shift, „ყველა“) | ✔ `toggleSelection`, `select` | ◐ ტრეკის დონეზე | გადასატანია. **marquee პროტოტიპში არ გადამიმოწმებია — არსებულად არ ჩაითვალოს** |
| Split / Duplicate (Ctrl+D) | ✔ split ღილაკი; duplicate (FB-ში დადებითად შეფასდა) | ✗ | Ctrl+E-ს parity აკლია (EDT-01) |
| Delete clip/range (ხვრელი) + Delete Time (ripple) | ✔ / ✔ `deleteTime` | ✗ | შეთანხმებული ნაგულისხმევი: Delete = Delete Time (ყველა lane, ხურავს). Cut ხვრელს ტოვებს |
| Loop: brace, ჩანაცვლება, off-ისას რჩება | ✔ | ◐ (`TransportBar` brace; Ctrl+L) | LOOP-06: Play loop-ის გარეთ start-ზე ხტება |
| Draggable playhead / ruler seek | ✔ | ◐ (`ScrubZone`, ruler) | TRN-03: selection დაკვრისას ხტება (✗ Ableton S3) |
| Zoom/anchor/Overview/Follow/Fit | ✔ `changeZoom`, `renderOverview`, `updateFollow` | ◐ wavesurfer zoom 0.5–4, anchor-ის გარეშე | გადასატანია |
| Panel collapse/resize, compact/expanded video | ✔ | ◐ (CSS `resize:both`) | გადასატანია |
| Track M/S/Volume | ✔ lane-ზე, `setTargetAtTime` | ◐ (P3/P4 ბაგები) | ერთი წესი (P12) |
| Video import + ერთი თანმიმდევრული video lane | ◐ (მხოლოდ file input; 60 წმ) | ◐ (ერთი ფაილი, sync-ის გარეშე) | FB-15/16 |
| Undo/Redo | ✔ snapshot | ✗ (მკვდარი) | snapshot-ის მიდგომა + no-op-ზე ჩანაწერი არ იქმნება (EDT-06) |
| Export WAV/MP3 | ✗ (არ არის) | ◐ (P1/P2/P9, 16-bit) | იდენტური graph-ით. ვიდეოს export — გულწრფელად მიუწვდომელი, თუ არ არის |

## 6. უმცირესი კრიტიკული ტესტები ახალი workspace-სთვის

გაზომვა: Web Audio-ს მდგომარეობა (აქტიური source-ების რაოდენობა, `gain.value`), `AnalyserNode` RMS, `OfflineAudioContext`-ის/WAV-ის sample-ების შედარება. **„მოვისმინე“ მტკიცებულებად არ ითვლება.** Unit = vitest (graph-builder სუფთა ფუნქციაზე), runtime = `/browse` `/studio-lab`-ზე.

| # | ქმედება | Done-ის კრიტერიუმი |
| --- | --- | --- |
| T1 | Split 6.0-ზე | მეორე კლიპი: `start=6, sourceOffset=6`. render-ის sample-ები [0,len) ემთხვევა გაუყოფელს (±1 LSB) |
| T2 | Move +10 / Trim left +2 | move: `start+10`, `sourceOffset` უცვლელი. trim: `start+2, sourceOffset+2`, აუდიო დროში არ იძვრის (P1-ის საწინააღმდეგო) |
| T3 | Export WAV (T1+T2 მდგომარეობა) | ფაილი არის რეალური RIFF/WAVE; სიგრძე = arrangement-ის სიგრძე (±1 frame); სიჩუმის კუდი არ აქვს (P2). **Oracle დამოუკიდებელია:** export-ის sample-ები შედარდება წყარო-buffer-ის ცნობილ sample-ებს (`out[(start+k)·sr] == src[(sourceOffset+k)·sr]·gain`) ან ცალკე სუფთა-JS მიქსერს (SFX-ის სტილში). export-ის შედარება იმავე graph-ის render-თან ტავტოლოგიაა და არ ითვლება |
| T4 | ტრეკი muted → Play → unmute დაკვრისას | RMS>0 ≤100 ms-ში (P3); fader-ის მოძრაობა muted ტრეკზე RMS=0-ს ტოვებს (P4) |
| T5 | Loop 2–4, 3 wrap | ≤1 აქტიური source კლიპზე; overlap/გაორმაგება არ ხდება; wrap-ის ხარვეზი <20 ms |
| T6 | 10× სწრაფი seek/Space დაკვრისას | აქტიური source-ები = ხილული კლიპები; ძველი ხმა არ რჩება |
| T7 | Delete Time 4–6 (ვიდეოთი) → Undo | ყველა lane, მათ შორის video, გადაიწია; loop შესწორდა; Undo deep-equal-ით აბრუნებს წინა კლიპების მასივს |
| T8 | ვიდეო + seek 5/15/30 წმ | `|video.currentTime − (pos−clip.start+sourceOffset)| < 80 ms` |
| T9 | `.mp4` OS drag ხაზზე და file picker-ით; `.mov` ცარიელი MIME-ით; დაზიანებული ფაილი | კლიპი იქმნება, ან ჩნდება გასაგები უარი. ჩუმი ჩავარდნა არ ხდება (FB-15) |
| T10 | ვიდეოს ორიგინალი ხმის Mute | ვიდეო გრძელდება (`paused=false`), მისი audio lane RMS=0, დანარჩენი ჟღერს (FB-16) |
| T11 | Master mute / Group mute | master → ყველაფერი 0; group mute → წევრები 0, წევრების M/S/vol დროშები უცვლელია; group fader ამრავლებს |
| T12 | Snap on/off + grid 1/4..1/32 | on → `start` grid-ის ჯერადია; off → თავისუფალი; BPM-ის შეცვლა ცვლის მხოლოდ ruler/grid-ს, `playbackRate`/სიგრძე უცვლელია |
| T13 | Clip gain +6 dB vs track volume | clip gain მოქმედებს მხოლოდ იმ კლიპზე, მეზობელზე არა; play-სა და export-ის peak ემთხვევა (P13) |
| T14 | MP3 CDN-ის გარეშე | ჩნდება გულწრფელი შეცდომა; WAV ისევ მუშაობს (P9) |
| T15 | დაცვა | 4 დაცული ფაილის SHA = `protected-baseline.json`; `/studio-lab` token/purchase URL-ს არ ითხოვს |

## 7. Top ბლოკერები B-სთვის (პრიორიტეტით)

1. **ერთიანი clip-model + ერთი graph-builder დაკვრისთვისაც და export-ისთვისაც** (მეოთხე ძრავა არა). ამის გარეშე FB-02/03/04/05/06/12/14 და export-ის გულწრფელობა ვერ შემოწმდება. Done = T1–T3.
2. **სწორი scheduler:** დაგეგმვა updater-ის გარეთ; unmute/seek/loop-ის დროს source-ების სწორი ადმინისტრირება (P3–P7). Done = T4–T6.
3. **Video transport + video-audio lane** (FB-15/16): OS drop, MIME, ერთი playhead, ვიდეოს ხმის ცალკე mute. Done = T8–T10.
4. **Undo ყველა edit-ზე** (რეალური Studio-ში ამჟამად მკვდარია). Done = T7, EDT-05/06.
5. **BPM-ის წყარო FB-09/11/13-სთვის:** პროდუქტის მონაცემი, თუ ხელით შეყვანა; ავტომატურად 120 არ უნდა დაისვას. Done = T12.
6. **Master bus + group bus** (FB-12/14). Done = T11.
7. **Export-ის გულწრფელობა:** 16-bit-ის/quality-ის ცრუ განაცხადი, ღრუ `.als`, MP3-ის CDN-ზე დამოკიდებულება — ან გასწორდეს, ან UI-მ ღიად თქვას (T14).

## 8. შეზღუდვები

- ყველაფერი კოდის წაკითხვას ეფუძნება. runtime-ში არცერთი ქცევა არ დამიკვირვებია; P1–P14 ჰიპოთეზებია ზუსტი ხაზებით.
- სრულად წავიკითხე: `StudioContext`, `types/studio`, `StudioTrack`, `VideoPlayer`, `VideoUploadZone`, route, `sfx-scene`, `sfx-edit`. ნაწილობრივ: `TransportBar` (1–240), `ExportDialog` (1–120), `ffmpeg.ts`, `audio-encoder(.worker)`, `ableton-export`, `SfxSceneBuilder` (დაკვრა/sync), პროტოტიპის `workspace.js` (მოდელი, scheduler, trim, deleteTime, syncVideo, upload/drop, frame).
- არ გადამიმოწმებია: პროტოტიპის marquee, `$("delete")` handler-ის ზუსტი ქცევა, WAV worker-ის `normalize` ლოგიკა, `TransportBar` 240+ ხაზი, ExportDialog 120+. StrictMode-ის არარსებობა მხოლოდ დღევანდელ `entry.client.tsx`-ს ეხება.
- ვიდეოებიდან ვნახე მხოლოდ 3 contact sheet; ტრანსკრიპტები (ASR) სრულად წავიკითხე. ჩაწერილი პროტოტიპის ვერსია უცნობია.
- Ableton-ის კონტრაქტი მოყვანილია მხოლოდ `docs/technical/ableton-live-current-workflow.md` §3/§7/§8-დან. ის, რაც იქ არ წერია, უცნობად ითვლება.
