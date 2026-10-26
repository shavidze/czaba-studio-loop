# Studio V-0.4b — track lane-ისა და track header-ის ტექსტები ინგლისურად

**თარიღი:** 2026-10-24
**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 139-ში; C round 139 — PASS, browserVerified; gate 139 — 3f2c187)
**შეცვლილი პროექტი:** Store

## კონტექსტი

VISUAL-A-ს M2 მოთხოვნით Studio-ს მთელი UI ინგლისურია, ტექსტები კი ერთი strings მოდულიდან მოდის. V-0.4a რაუნდ 138-ში დასრულდა (doc 114, gate 138 — `1d4df51`). B-მა `1d4df51`-ზე გაზომა: `ArrangementLane.tsx`-ში 22 ქართული წყაროს ხაზი რჩებოდა, `StudioWorkspace.tsx`-ში კი ერთი — track-header selector (l.331), რომელიც lane-ის aria-label-ს ემთხვევა. D-29z104-ით ეს რაუნდი V-0.4b-ა: track header-ის ღილაკები (Solo, fold, აქტიური ხაზი, Pan reset, ვიდეოს import), ვიდეოხაზის placeholder და file-drag hint-ები, library drop ghost-ები, ვიდეოკლიპის ხმის შენიშვნები, ყველა ხაზის overlay და სიმაღლის separator.

რაუნდი ასევე ხურავს gate-137 finding 1-ს (GATE137-SELECTED-CLIP-HALF-MOVED): მონიშნული კლიპის ხაზის ხილული ნაწილი და მისი `title` ახლა ერთი helper-იდან მოდის.

## მიდგომა

- **ერთი ახალი ობიექტი `studioLaneStrings` (R1)** `studioClipStrings`-ის შემდეგ, 23 key-ით (LN1–LN24; LN13 ორი key-ია, LN18 და LN22 არსებულს იყენებს). მოდული ისევ leaf-ია (import არ აქვს).
- **ხელახალი გამოყენება ასლის ნაცვლად:** ყველა ხაზის overlay `studioClipStrings.seconds(…)`-სა და `studioEditStrings.allTracks`-ს იყენებს (`00:03.000 – 00:05.000 · 2.000 s · all tracks`, კლიპის badge-ის ერთეულით). დაბლოკილი ghost-ის სუფიქსი `studioLaneMoveStrings.noRoom`-ია (`No room here`).
- **ghost ამბობს იმას, რასაც სტატუსი (R2):** უარის ghost — `Audio is not added to the video track` (`studioLibraryStrings.audioOnVideoTrack`-ის ბოლო ნაწილი), ჯერ ჩაუტვირთავი ხმის ghost — `This sound has not loaded yet` (`dropNotLoaded`-ის დასაწყისი). სტატუსის წინადადებები უცვლელია.
- **branch-ები caller-ში რჩება (R3):** `, selected` სუფიქსი, დაკეცილი/გახსნილი valuetext, ghost-ის სამი შემთხვევა, ხმის სამი შენიშვნა და ორი file-drag hint.
- **ლოკალური სახელები რჩება:** `VIDEO_MIX_LABEL`, `VIDEO_IMPORT_LABEL`, `TRACK_FOLD_TITLE` მნიშვნელობას მოდულიდან იღებს.
- **selected-clip ხაზი (§1.2):** `strings.ts`-ში არა-exported helper `selectedClipDetailText` აბრუნებს ` · start … · length … · source offset …`-ს. ახალი key `selectedClipDetail` და `selectedClipTitle` ორივე მას იძახებს. StudioWorkspace-ში inline კუდი `selectedClipDetail(…)`-ით შეიცვალა; `textContent` byte-identical-ია. ეს ერთადერთი ცვლილებაა არსებულ ობიექტში.
- **ქცევა არ იცვლება:** handler-ები, პირობები, ზღვრები, კლავიშები, drag/drop-ის გადაწყვეტილებები, Solo/Mute/fold ლოგიკა, `data-testid`-ები, class-ები, glyph-ები (`▸`, `▾`, `＋`, `·`) და დროის ფორმატები.
- **შეგნებული შერეული მდგომარეობა ერთი რაუნდით (R5):** ინგლისური track header-ების გვერდით ჯგუფის header ჯერ ქართულია (V-0.4c); detail panel (V-0.4e), default track სახელები (V-0.4d), library, dock და route (V-0.5), meter/Master (V-0.4c) მომდევნო ეტაპებშია.

### LN რუკა (მოკლედ)

| # | key | ინგლისური |
|---|---|---|
| LN1–3 | `videoMixLabel` / `videoImportLabel` / `foldTitle` | `Original video sound` / `＋ Your own video` / `Fold / unfold` |
| LN4–5 | `soloLabel` / `soloTitle` | `Solo — {name} (Ctrl/Cmd+click = add to solo)` / `Solo (Ctrl/Cmd+click = add to solo)` |
| LN6–9 | `foldLabel` / `activeTrackLabel` / `selectedSuffix` / `activeBadge` | `Fold or unfold — {name}` / `{name} — set as the active track` / `, selected` / `· active` |
| LN10–12 | `videoImportTitle` / `panResetLabel` / `videoOriginalSound` | `Your own video` / `Reset Pan to centre — {name}` / `Original sound` |
| LN13 | `noVideo` + `videoEmptyHint` | `No video — use “＋ Your own video” or drop a file here` |
| LN14–15 | `dropVideoHere` / `videoNotOnAudioTrack` | `Drop the video here` / `Video is not added here — drop it on the video track` |
| LN16–18 | `ghostAudioOnVideoTrack` / `ghostNotLoaded` / `noRoom` (reuse) | `Audio is not added to the video track` / `This sound has not loaded yet` / `No room here` |
| LN19–21 | `audioDecoding` / `audioUnreadable` / `audioNone` | `Sound is decoding…` / `Sound could not be read` / `No sound` |
| LN22 | `seconds` + `allTracks` (reuse) | `{start} – {end} · {x.xxx} s · all tracks` |
| LN23–24 | `heightLabel` / `foldedValueText` | `Height — {name}` / `folded · {height} px` |

## არქიტექტურა

```mermaid
flowchart LR
  S[strings.ts<br/>studioLaneStrings<br/>selectedClipDetail] --> L[ArrangementLane.tsx<br/>track header, lane, ghost, overlay, separator]
  S --> W[StudioWorkspace.tsx<br/>selected-clip ხაზი]
  L -- aria-label: "— set as the active track" --> W2[StudioWorkspace trackRowNameButton selector]
  T1[strings.test ST31/ST33/ST36/ST37] --> S
  T2[12 pin ფაილი + lane-strings-ui] --> L
```

## შეცვლილი ფაილები

- `app/lib/arrangement/strings.ts` — `studioLaneStrings`; არა-exported `selectedClipDetailText` და ლოკალური ტიპი; `studioWorkspaceStrings.selectedClipDetail`; `selectedClipTitle` helper-ს იძახებს.
- `app/components/arrangement/ArrangementLane.tsx` — strings import და §1.1-ის 22 ხაზი.
- `app/components/arrangement/StudioWorkspace.tsx` — track-header selector (l.331) და selected-clip ხაზის კუდი.
- `app/lib/arrangement/__tests__/strings.test.ts` — import; selector-ის მუდმივა წაიშალა; ST31 (key + sample); ST33 (ახალი სათაური, `[]`); ST36–ST37.
- 12 pin ფაილი: `fader-touch`, `fader-click`, `track-volume-db`, `group-volume-db`, `track-group-mix-ui`, `track-pan`, `track-groups-ui`, `track-group-collapse-ui`, `marker-snap`, `grid-snap-loop-drop`, `delete-selection-ui`, `track-layout` — მხოლოდ ჩამოთვლილი ხაზები, ხელით დაწერილი ინგლისური literal-ებით, იგივე matcher-ებით.
- ახალი `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` — LSU1–LSU6 რეალურ `StudioWorkspace`-ზე jsdom-ში.
- `docs/implementation/2026/quarter-IV/113-studio-v0-workspace-strings.md` — ორმაგი „selector“ გასწორდა (C-R138-01).
- `docs/implementation/2026/quarter-IV/114-studio-v0-clip-strings.md` — სტატუსი Completed (C round 138 PASS, gate 138).

## პრობლემები და გადაწყვეტები

- **პრობლემა:** ST31 ამოწმებს, რომ formatter-ების key-ები sample-ების key-ებს ემთხვევა. **გადაწყვეტა:** `WORKSPACE_FORMATTER_SAMPLES`-ს `selectedClipDetail`-ის ერთი sample დაემატა, და ST31-ს — ერთი ხელით დაწერილი შედარება. ძველი `selectedClipTitle` sample უცვლელია.
- **პრობლემა:** `delete-selection-ui`-ის `/all tracks$/` regex-ს workspace-ის range readout-იც შეიძლება დამთხვეოდა. **გადაწყვეტა:** readout-ის span მთავრდება ` ·`-ით, ამიტომ ის არ ემთხვევა. ტესტი ისევ ზუსტად ერთ ელემენტს პოულობს (`toHaveLength(1)` მწვანეა).
- **პრობლემა:** ხმის სამი შენიშვნის UI ტესტს ვიდეოს import სჭირდება. **გადაწყვეტა:** LSU5 `video.client`-ის probe/decode-ს mock-ავს, იგივე გზით, რასაც `video-import-status-ui` იყენებს. სამივე მდგომარეობა (`decoding`, `error`, `none`) jsdom-ში მიიღწევა.

## ტესტირება

- `npm run typecheck` exit 0, `npm run lint` exit 0; read-only `npx biome check` შეცვლილ კოდისა და ტესტის ფაილებზე: 0 diagnostic.
- `npx vitest run` 22 ფაილზე (strings, 12 pin, lane-strings-ui და 9 მეზობელი): 404/404 მწვანეა. `strings.test` 35 → 37 `it`, `lane-strings-ui` 8. 12 pin ფაილის `it`-ების რაოდენობა უცვლელია.
- მუტაციები m61–m68: თითოეულმა დასახელებული ტესტები გააწითლა; ფაილები backup-იდან აღდგა და sha256-ით შემოწმდა.
- სრული suite, `npm run verify`, build და e2e root-ის gate-ზეა. C round 139 — PASS (browserVerified, 1440×900 და 1280×720).

## TODO / შემდეგი ნაბიჯები

- V-0.4c: `ArrangementGroupHeader.tsx` (R4: `foldTitle` + ` (U)`, `soloTitle`, `selectedSuffix`), `ArrangementClipEnvelope.tsx`, TrackMeter, Master.
- V-0.4e: detail panel-ის valuetext → `studioLaneStrings.foldedValueText(…)`. V-0.5: VideoDock → `studioLaneStrings.noVideo`.
- frontend-architect checkpoint `strings.ts`-ის დაყოფაზე root-ს ელოდება (`b-round-136-checkpoint-request.md`).
