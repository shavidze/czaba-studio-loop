# CZABA Studio — AI აგენტის გეგმა: command layer და რაუნდები

**სტატუსი:** approved (Saba, 2026-10-26); queue position per `loop/policy.local.md`. Loop-ში შედის მხოლოდ (i) command layer; (ii)–(iv) loop-ის გარეთაა.
**თარიღი:** 2026-10-26 · **ავტორი:** frontend-architect (read-only, checkpoint რეჟიმი)

## 0. შემოწმებული მდგომარეობა

| რეპო | ბრენჩი | HEAD | დაუკომიტებელი |
|---|---|---|---|
| `/home/claude/czaba-store` | `master` | `850445c` ("verified loop rounds 188-188") | არცერთი (`git status --short` ცარიელია) |
| `/home/claude/shavidze/czaba-studio-loop` | `main` | `b285aa3` ("round 189 ROUND_LIMIT_REACHED") | არცერთი |
| `/home/claude/czaba-api` | — | `7792aca` | არცერთი |

**Drift, რაც აღვნიშნე:**
- Loop-ის `backlog.json`-ში round 189 C FAIL-ია (C-R189-01/02), ხოლო round 190 STORE-1d-ის fix-up-ია (D-29z155). Round 189-ის სამუშაო ხე (`SpotlightLoader.tsx`, T1, doc 156) ამ მანქანაზე არ არის, რადგან ის cloud runner-ზეა. აქ შემოთავაზებული ფაილები ამ ფაილებს არ კვეთს.
- Round 189 მიუთითებს `agent-workflow.md`-ის სექციებზე (Store redesign, speed rules), რომლებიც loop რეპოს ასლში (87 ხაზი) არ არის. ისინი runner-ის `/home/runner/czaba-project/docs/...` ასლშია. ეს ვერ გადავამოწმე.
- **Re-check `caa09af`-ზე (round 191, tech-lead review):** ხაზების უმეტესობა ძალაშია. შეიცვალა `splitSelection` (ახლა `ArrangementContext.tsx:1789`) და `deleteSelection` (`:1848`); ქვემოთ განახლებულია. ახლად დამატებული მითითებები ამავე commit-ზე შემოწმდა.
- `AUDIO_ARCHITECTURE.md` ძველ, დაცულ `StudioContext`-ის 3-ფენიან სისტემას აღწერს. რეალური workspace `ArrangementContext` + `app/lib/arrangement/*`-ია. Primitive ამ გეგმისთვის მხოლოდ ზოგად პრინციპებს იძლევა.

---

## 1. არქიტექტურული შენიშვნა

### 1.1 რა აქვს კოდს უკვე (მტკიცებულება)

- **Arrangement სრულად serializable-ია.** `app/types/arrangement.ts:58-65` — მხოლოდ plain ობიექტებია, ფუნქციების გარეშე. `isSameArrangement` (`model.ts:618`) `JSON.stringify`-ით ადარებს.
- **History pure-ია და label-ებიანი.** `ArrangementHistory`, `commitHistory`, `undoHistory`, `redoHistory` — `model.ts:40-49`, `626-664`. თითო entry არის `{label, snapshot}`. Cap არ აქვს.
- **გარე commit-ის API უკვე არსებობს.** `useArrangement()` (`ArrangementContext.tsx:3765`) აბრუნებს:
  - `getArrangement()` (`:1532`);
  - `commitArrangement(next, label, before)` (`:315`, იმპლემენტაცია `:1542-1548` → `applyEdit` `:1165-1185`). `applyEdit` ჯერ pending fader-ებს ასუფთავებს, მერე commit-ს აკეთებს და `syncPlayback`-ს იძახებს;
  - `isPointerGestureActive()` (`:1621`) და `isArrangementPreviewActive()` (`:1619`);
  - `selectClip` (`:282`), `setTimeRange` (`:311`), `setStatus` (`:361`), `sourceDurations` (`:268`, memo `:3514`).

  **დასკვნა:** command layer-ს `ArrangementContext.tsx`-ის შეცვლა არ სჭირდება.
- **Studio-ს keydown გვერდს უვლის ტექსტურ ველებს.** `StudioWorkspace.tsx:1720-1728`-ში `isTypingTarget` (`:371`) textarea/input-ზე Space-ს, Delete-ს და Ctrl+Z-ს არ ამუშავებს. ამიტომ prompt/console textarea Studio-ს shortcut-ებს არ გამოიწვევს. ეს რაუნდში ტესტით უნდა დადასტურდეს.

### 1.2 რისკები და შეუსაბამობები, რომლებიც command layer-მა უნდა დაფაროს

| # | ფაქტი (ფაილი:ხაზი) | გავლენა | სიმძიმე |
|---|---|---|---|
| R1 | **UI-ს წესები pure ფუნქციის გარეთაა.** `dropLibrarySource` (`ArrangementContext.tsx:1483`) უარყოფს, თუ `addClip` კლიპს სხვაგან გადაიტანდა. თავად `addClip` (`model.ts:147`) `findFreeStart`-ით **ჩუმად გადაადგილებს**. | თუ command პირდაპირ `addClip`-ს გამოიძახებს, კლიპი UI-სგან განსხვავებულ ადგილას აღმოჩნდება. | მაღალი (parity) |
| R2 | **Trim და fade ჩუმად ზღუდავს მნიშვნელობას.** `trimClipStart` `:208`, `trimClipEnd` `:246`, `setClipFade` (`fades.ts:70-71`). | AI ითხოვს 0:40-ს, მიიღებს 0:36-ს და ამის შესახებ არ ეცოდინება. | საშუალო |
| R3 | **`commitArrangement` დაუცველია.** მას gesture-ის უარყოფა არ აქვს (განსხვავებით `refuseEditDuringGesture`-ისგან `:716`). მონიშვნას ასუფთავებს მხოლოდ `restoreHistory` (`:2128-2133`). | AI-ის commit drag-ის დროს ან წაშლილ კლიპზე დარჩენილი მონიშვნა. Delete მერე „target not found“-ს იტყვის. | მაღალი |
| R4 | **ID-ები არადეტერმინისტულია.** `createClipId` → `crypto.randomUUID` (`model.ts:62-64`), marker-ის ID (`markers.ts:78`). | „იგივე Arrangement“ ტოლობით ვერ შემოწმდება. ID-ების ნორმალიზაციის digest-ია საჭირო. | საშუალო (ტესტირებადობა) |
| R5 | **History label-ები გაფანტულია.** `CLIP_FADE_LABELS` (`ArrangementClip.tsx:48`) და `VIDEO_FADE_LABELS` (`:53`) კომპონენტის private-ია. `'Add Marker'` (`ArrangementMarkerRow.tsx:327`) და `'Group Tracks'` (`StudioWorkspace.tsx:912`) literal-ებია. `MASTER_VOLUME_LABEL`/`CLIP_GAIN_LABEL` (`ArrangementContext.tsx:202-204`) private-ია და 15 ტესტში დუბლირებულია. | ნაბიჯ-ნაბიჯ label-ების parity-ს დუბლირება სჭირდება. ერთი AI entry ამ პრობლემას გვერდს უვლის. | დაბალი |
| R6 | **Tempo არ არის Arrangement-ში.** `tempoBpm` არის `StudioWorkspace.tsx:495`-ის local state (context-ში მხოლოდ ref-ია, `:616`). | „Bar 9“-ზე command ვერ დაიწერება state-ის გადატანის გარეშე. v1-ში მხოლოდ წამებია. | შეზღუდვა |
| R7 | **Ducking არ არსებობს.** „Duck under dialogue“ არის SRW-44 (phase 2, `queued_after_t12_awaiting_user_go`; `phase-2-requirements.md:225-269`). | მაგალითის მეორე ნახევარი ახლა მხოლოდ ხელით შესრულდება: envelope-ის წერტილებით მითითებულ მონაკვეთზე. დიალოგის ამოცნობის გარეშე. | პროდუქტის ფაქტი |
| R8 | **Workspace მხოლოდ `/studio-lab`-ზეა mount-ებული** (`studio-lab.tsx:24-31`). შეძენილი `/studio/$productId` ძველ `StudioContext`-ს იყენებს (`studio.$productId.tsx:27`). `createPurchasedWorkspaceCollection` (`collection.ts:54`) არცერთ route-ს არ აქვს მიერთებული (D-06, SRW-21). | ნამდვილი მყიდველისთვის AI დამოკიდებულია დაცული ფაილის ცვლილებაზე, რაც loop-ის გარეთაა. | ბლოკერი (form a/b, production) |

### 1.3 Command layer-ის დიზაინი

**ფორმა.** Discriminated union `ArrangementCommand = { type, ...params }`. თითო ტიპს ერთი descriptor აქვს:
- `jsonSchema` — LLM tool definition-ისა და MCP-სთვის;
- `parse(unknown) → Result` — ხელით დაწერილი ვალიდატორი. `zod`/`ajv` store-ში არ არის, `package.json` loop-ში აკრძალულია;
- `apply(arrangement, params, env) → Result`;
- `describe(params, arrangement) → string` — preview-ის ტექსტი.

**Env** (React-ის გარეშე): `sourceDurations`, მზა წყაროების სია (`{id, title, kind, duration}`) და `limits`. Command ქსელს, `loadSource`-ს, `fetch`-ს, auth-ს და route-ებს **არ** ეხება.

**შედეგი:** `{ ok: true, arrangement, created: string[], adjusted?: {field, requested, applied}[] }` ან `{ ok: false, code, field?, message }`. კოდები: `unknown_command`, `invalid_param`, `not_found`, `wrong_lane_kind`, `overlap`, `source_not_ready`, `no_change`, `limit_exceeded`, `stale_base`, `gesture_active`. `out_of_range` კოდი არ არსებობს.

**ვალიდაცია — ერთი წესი: clamp + `adjusted`** (Saba-ს default, გადაწყვეტილია):
- დიაპაზონს გარეთ რიცხვი (დრო, dB, pan, fade, loop-ის სიგრძე, envelope gain) ზღვრამდე იზღუდება. შედეგი `ok:true`-ია და `adjusted`-ში ჩანს `{field, requested, applied}`. იგივე ეხება ტექსტის შეკვეცას (marker-ის სახელი >64 სიმბოლო).
- **Reject მხოლოდ** NaN/Infinity-სა და ტიპის შეცდომაზე: სტრიქონი რიცხვის ნაცვლად (`"12"`), ზედმეტი ან გამოტოვებული ველი → `invalid_param`.
- სტრუქტურული შეცდომა clamp-ით არ სწორდება: უცნობი ID → `not_found`, არასწორი lane → `wrong_lane_kind`, დაკავებული ადგილი → `overlap`, ლიმიტი (§1.4) → `limit_exceeded`.
- დრო წამებშია. ms-მდე, 0.1 dB-მდე და pan-ის 1/50-მდე დამრგვალება `adjusted`-ს არ ქმნის.
- უარყოფისას დაბრუნებული arrangement **იგივე reference-ია** (`===`).

#### პირველი 14 command (ფაზა CMD-1/CMD-2)

| # | `type` | params | Pure ფუნქცია (file:line) | UI-ის ეკვივალენტი | შენიშვნა |
|---|---|---|---|---|---|
| 1 | `add_clip` | `{trackId, sourceId, start}` | `placeSourceAtTime` (`spot-placement.ts`, SP-2, `syncPoint: 0`) → `addClip` `model.ts:135` + `canPlaceLibraryClip` `library.ts:166` | `dropLibrarySource` `ArrangementContext.tsx:1454-1509` | R1: ზუსტი ადგილი, სხვაგან გადატანის გარეშე. ერთი საერთო helper spotting-ის stream-თან. `source_not_ready`, თუ წყარო მზად არ არის. Audio lane-ის გარდა არ მუშაობს |
| 2 | `move_clip` | `{clipId, start}` | `moveClip` `model.ts:173` | nudge `:1752-1787`, drag `ArrangementClip.tsx:727` | overlap → `overlap` |
| 3 | `move_clips` | `{clipIds[], delta}` | `moveClips` `selection.ts:119` | group nudge `:1757-1765` | ზღვრები `groupMoveBounds` `selection.ts:93` |
| 4 | `trim_clip` | `{clipId, edge:'start'\|'end', time}` | `trimClipStart` `model.ts:194`, `trimClipEnd` `:226` (`sourceDurations`) | trim drag `ArrangementClip.tsx:613-614` | R2: `adjusted` ჩანაწერი. D-10 ზედა ზღვარი `:241` |
| 5 | `split_clip` | `{clipId, time}` | `splitClipAt` `model.ts:256` | `splitSelection` `:1789` (ერთი კლიპის branch `:1824-1837`) | აბრუნებს `created:[rightId]` |
| 6 | `delete_clips` | `{clipIds[]}` | `deleteClip` `model.ts:391`, `deleteClips` `selection.ts:143` | `deleteSelection` `:1848` (კლიპის branch `:1883-1899`) | |
| 7 | `delete_range` | `{start, end, trackId}` ან `{start, end, allTracks:true}` | `deleteRangeKeepingGap` `clipboard.ts:181` | `deleteSelection` `:1848`, range branch `:1854-1881` | სიცარიელე რჩება (delete-selection-update) |
| 8 | `set_clip_fade` | `{clipId, edge:'in'\|'out', seconds}` | `setClipFade` `fades.ts:58` / `setVideoClipFade` `video-fades.ts:26` | fade handle `ArrangementClip.tsx:669`, `:778` | ტიპი lane-ის მიხედვით ირჩევა. `adjusted`, თუ შეზღუდა |
| 9 | `set_clip_gain` | `{clipIds[], gainDb}` | `setClipGainDb` `model.ts:505`, `setClipGainsDb` `clip-gain-multi.ts:93` | `setClipGain` `:2717-2722` | −60…+24, 0.1 dB |
| 10 | `set_track_mix` | `{trackId, volumeDb?, mute?}` | `setTrackMix` `model.ts:461` + `trackVolumeFromDb` `track-volume-db.ts:16` | `toggleTrackMute` `:2335-2348`, fader | −60…0 dB. >0 → 0 + `adjusted` |
| 11 | `set_track_pan` | `{trackId, pan}` | `setArrangementTrackPan` `model.ts:546` | `setTrackPan` `:2594-2606` | −1…1, ნაბიჯი 1/50 |
| 12 | `set_track_solo` | `{trackId, solo:boolean, exclusive:boolean}` | `toggleSolo` `model.ts:583` | `toggleTrackSolo` `:2350-2363` | **idempotent**: `solo` უკვე სწორია → `no_change`, toggle-ის გარეშე |
| 13 | `set_master` | `{gainDb?, mute?}` | `setMasterMix` `model.ts:480` | master fader / mute `:2714` | −60…+6 |
| 14 | `marker` ოჯახი: `add_marker {time, name?}`, `update_marker {markerId, name?, time?}`, `delete_marker {markerId}`; `set_loop {start, end, enabled}` | | `addMarker` `markers.ts:71`, `renameMarker` `:91`, `moveMarker` `:107`, `deleteMarker` `:134`; `setLoopFromRange` `loop.ts:37`, `toggleLoop` `:49` | `ArrangementMarkerRow.tsx:327/360/373/404`; `toggleLoopSelection` `:1648-1688` | marker conflict → `overlap` + არსებული ID. სახელი >64 → შეკვეცა + `adjusted`. Loop < `MIN_LOOP_LENGTH` (0.1 s, `loop.ts:43`) → `end = start + 0.1` + `adjusted` |

რიცხვი 14-ზე მეტია, თუ marker ოჯახს და `set_loop`-ს ცალ-ცალკე დავთვლით (სულ 17 tool).

**წაკითხვის tool-ები (state არ იცვლება):**
- `get_arrangement_summary` — tracks (dB-ში), clips (ID, lane, წყაროს მოკლე სათაური, start/end, fades, gain), markers, loop, master, groups, მზა წყაროები, playhead, selection. `url`, `blob:` და token არ შედის. სახელები ≤64 სიმბოლოა.
- `arrangementDigest(arrangement)` — ID-ები შეიცვლება სტაბილური რიგით (lane → start), შემდეგ ხდება hash. ეს ხსნის R4-ს.

**CMD-5a (მოგვიანებით):**
- envelope: `add/move/remove_envelope_point` (`envelope.ts:138/170/205`);
- `duplicate_clips` (`model.ts:348`; UI: `duplicateSelection` `ArrangementContext.tsx:1935`).

**CMD-5b (მოგვიანებით):**
- `delete_time` (ripple, `model.ts:395`). **Preview აქ სავალდებულოა**, რადგან ყველა lane-ს, marker-სა და loop-ს გადაწევს;
- `duck_range {trackId, start, end, depthDb, rampMs}` — envelope-ის 4 წერტილის კომპოზიცია ხელით მითითებულ მონაკვეთზე. Envelope-ის gain წრფივია, 0…1-ის ფარგლებში (`envelope.ts:197`), ამიტომ boost შეუძლებელია (`depthDb > 0` → 0 + `adjusted`). **SRW-44-მდე დაშვებულია.**

**CMD-6** (მხოლოდ SRW-44-ის შემდეგ): `set_duck_under {trackId, sourceTrackId, depthDb}`.

#### განზრახ გამორიცხული

- **Export** (`exportWav` `ArrangementContext.tsx:363/3088`) და ნებისმიერი ჩამოტვირთვა. AI-ს command სიაში ის არ არის. მომავალში შესაძლებელია მხოლოდ `request_export`, რომელიც ჩვეულებრივ Export დიალოგს ხსნის და მომხმარებლის დასტურს ელოდება.
- Purchase, download და auth: `api.*`, `studio.$productId.tsx`, `account.downloads.tsx`, `AuthContext.tsx`, `lib/auth*`, `lib/r2*`, `lib/firebase*`. Import-boundary ტესტი ამოწმებს, რომ `commands.ts`-ის import-ები მხოლოდ `~/types/arrangement` და `./(model|fades|video-fades|markers|loop|selection|clipboard|clip-gain-multi|track-volume-db|library|envelope|spot-placement)`-ია. `spot-placement.ts` SP-2-ის (PHASE2B-SPOTTING, queue-ში წინ) საერთო placement helper-ია.
- წყაროს ჩატვირთვა (`loadSource`) და ფაილის/ვიდეოს import. AI მხოლოდ უკვე `ready` წყაროს იყენებს. ჩატვირთვას purchased route-ზე token-იანი URL სჭირდება.
- **D-10:** schema-ში არ არის `rate`, `pitch`, `stretch`, `playbackRate` ან `speed`. ტესტი ამოწმებს: ნებისმიერი command-ის შემდეგ ყოველი კლიპისთვის `duration ≤ sourceDuration − sourceOffset + ε`, და კლიპზე მხოლოდ runtime allowlist-ის გასაღებები ჩნდება.
  - **Runtime allowlist** (`app/types/arrangement.ts:28-39`, `caa09af`): `id`, `trackId`, `sourceId`, `start`, `sourceOffset`, `duration`, `gainDb`, `fadeIn`, `fadeOut`, `envelope`. ტესტში ის ხელით ჩამოწერილი მასივია და type-იდან არ გამოიყვანება, რომ ახალი გასაღები ცხადად გამოჩნდეს.
  - ABL-R-12 (fade curve) და T12-ADVANCED (crossfades, micro fades, volume automation) ახალ გასაღებს დაამატებს. B allowlist-ს რაუნდის დაგეგმვისას type-იდან ახლებს. Stretch/rate-ის გასაღები allowlist-ში არასდროს შედის.
- Track-ის დამატება ან წაშლა. Model-ში ასეთი ფუნქცია არ არის, video lane კი ზუსტად ერთია (`model.ts:87-91`).
- Tempo, metronome, transport/play (R6; autoplay-ს user gesture სჭირდება) და `.claude/**`. დაცული ფაილები: `cloud/config.template.json:21` და `backlog.json` → `global_forbidden_files`.

### 1.4 Plan, preview და history

- **Plan** = `{ base: Arrangement (reference), steps: ArrangementCommand[] }`. `runCommandPlan` ნაბიჯებს **draft**-ზე თანმიმდევრულად ასრულებს. ყოველი ნაბიჯის შედეგი (ახალი ID-ების ჩათვლით) LLM-ს tool result-ად უბრუნდება. ასე იცის მოდელმა `split`-ის შემდეგ შექმნილი `rightId`.
- **Preview-before-apply:** „AI-ს უნდა N ნაბიჯის გაკეთება“. სია `<ol>`-ია `describe()`-ის ტექსტით და `adjusted` შენიშვნებით, ღილაკებით Apply და Discard. v1-ში ავტომატური apply არ არის.
- **რეკომენდაცია: ერთი history entry ერთ AI მოთხოვნაზე.** `commitArrangement(draft, label, base)` ერთხელ იძახება. ერთი Ctrl+Z მთელ მოთხოვნას აბრუნებს.
  - **Label კოდი აგენერირებს** და არა LLM: `AI — Trim, Fade Out` (≤3 ტიპი, დანარჩენი `+N`). ასე LLM-ის ტექსტი history-სა და status-ში არ ხვდება (prompt injection-ის წინააღმდეგ).
  - **უარყოფილი ვარიანტი — entry ყოველ ნაბიჯზე.** Undo-ს ატომურობა ირღვევა: 5 ნაბიჯს 5 Ctrl+Z სჭირდება და ნახევრად გაუქმებული მდგომარეობა რჩება. გარდა ამისა, label-ების parity-სთვის R5-ის დუბლირება დასჭირდებოდა.
- **Apply-ის guard-ები** (`applyCommandPlan(api, plan)`, React-ის გარეშე, ვიწრო interface-ით):
  1. `isPointerGestureActive() || isArrangementPreviewActive()` → `gesture_active`, commit არ ხდება (R3);
  2. `getArrangement() !== plan.base` → `stale_base`: „პროექტი შეიცვალა, თავიდან დაგეგმე“ (optimistic concurrency);
  3. commit, მერე `selectClip(null)` + `setTimeRange(null)` (R3). Default: შექმნილ კლიპებს არ ვნიშნავთ;
  4. `syncPlayback` `applyEdit`-ის შიგნით უკვე ხდება.
- **ლიმიტები (default):** ≤20 ნაბიჯი, plan JSON ≤32 KB, ≤64 ID ერთ ნაბიჯში, დრო [0, 7200] s. LLM tool loop-ში ≤8 მოდელის turn-ი თითო მოთხოვნაზე. Summary-ში ≤300 კლიპი; მეტი იჭრება და ეს მოდელს ეცნობება.

### 1.5 სად იცხოვროს — keep vs extract

| ვარიანტი | შეფასება |
|---|---|
| **Keep:** `runCommand`-ის დამატება `ArrangementContext.tsx`-ში | **უარყოფილია.** ფაილი 3832 ხაზია და 2026-10-13-დან მასზე სიგნალები გროვდება (ARCH-CHECKPOINT-SRW13, metronome horizon და სხვ.). საჭირო API (`getArrangement`, `commitArrangement`, guard-ები) უკვე საჯაროა. ცვლილება ახალ owner-პასუხისმგებლობას დაამატებდა და `useArrangement()`-ის ფორმას შეცვლიდა, რაც checkpoint-ის უცვლელი წესით აკრძალულია |
| **Extract (ახალი pure მოდულები):** `app/lib/arrangement/commands.ts`, `command-summary.ts`, `command-plan.ts` | **რეკომენდებულია.** Coupling არ იცვლება: lib → types/lib მხოლოდ ერთი მიმართულებით. Context უცვლელია. Node-შიც გაეშვება, ამიტომ form (a)-ს offline eval, form (b)-ის სერვერი და vitest ერთსა და იმავე კოდს იყენებს. ღირებულება მაღალია, რისკი დაბალი. გამოყოფა ფაილის სიგრძის გამო **არ** ხდება: მიზეზი ახალი, დამოუკიდებლად შემოწმებადი ქვესისტემაა |
| UI: `app/components/arrangement/ArrangementCommandConsole.tsx`, mount `studio-lab.tsx`-ში provider-ის შიგნით | `StudioWorkspace.tsx` (2639 ხაზი) არ იცვლება. Default pixel baseline-ი უცვლელი რჩება, რადგან console მხოლოდ dev build-ში (`import.meta.env.DEV`) და მხოლოდ `/studio-lab?console=1`-ზე ჩნდება. Production build-ში mount-ის branch dead code-ია |

**Checkpoint-ის ვერდიქტი (შეხებული ქვესისტემა):** ახლა refactor არ ღირს. პრიორიტეტული ცვლილებები სამია:
1. ახალი pure command მოდული context-ის ცვლილების გარეშე;
2. `applyCommandPlan`-ის guard-ები R3-ზე, context-ის გარეთ;
3. digest-ის helper R4-ზე.

უცვლელი რჩება `model.ts` (ფუნქციები სწორია; command layer მათ ზემოთ wrapper-ია), `ArrangementContext.tsx` და `StudioWorkspace.tsx`.

**ერთი შეზღუდული დავალება:** ქვემოთ CMD-1 (§2.i).

### 1.6 Form (a)-ს endpoint: Remix server route თუ .NET

| კრიტერიუმი | Remix (`app/routes/api.studio-agent.ts`, Vercel) | .NET (`czaba-api`, `StudioAgentController`) |
|---|---|---|
| API key-ის შენახვა | Vercel env | appsettings/user-secrets/env; Brevo-ს `AddHttpClient`-ის ნიმუში არსებობს (`ServiceCollectionExtensions.cs:81`) |
| Auth | Bearer-ს backend-ზე ამოწმებს. ნიმუშია `api.studio-token.ts:21-31` (`/api/downloads`). ზედმეტი hop-ია | JWT მშობლიურად (`Program.cs:61-62`), `[Authorize]` |
| Rate limit | Serverless-ს გაზიარებული მეხსიერება არ აქვს. KV სჭირდება | `AddRateLimiter` არსებობს (`Program.cs:93`), მაგრამ **დასახელებული limiter-ები partition-ის გარეშეა** (`:111-150`; მაგ. `login` 5/წთ ყველასთვის საერთოა). AI-სთვის user-id partition აუცილებელია. ეს ნიმუში არ დააკოპიროთ |
| Cost cap | მდგრადი მთვლელი არ აქვს | `AgentUsage` ცხრილი: დღიური token/cost ლიმიტი მომხმარებელზე |
| Tool schema | TS-ში იგივე მოდულიდან, ერთი წყაროდან | დუბლირებულია. გამოსავალი: TS-იდან გენერირებული `studio-agent-tools.json` + hash contract test |
| Logging | Vercel logs | Serilog. ორივეში იწერება მხოლოდ request id, user hash, token-ები, tool-ების სახელები, ნაბიჯების რაოდენობა, latency და შედეგი. **არ იწერება** მომხმარებლის ტექსტი, track/marker სახელები და მოდელის პასუხი |
| Loop | `app/routes/api.*` loop-ში აკრძალულია (`global_forbidden_files`) | backend loop-ის გარეთაა |

**Default:** პროტოტიპი (PA-2) შეიძლება იყოს Remix route მხოლოდ localhost-ზე, `NODE_ENV=development` + env flag-ით. Production (PA-4) **.NET**-ზეა. სერვერი ფლობს system prompt-სა და tool-ების სიას. Client-ი აგზავნის მხოლოდ ტექსტს (≤1000 სიმბოლო), summary-ს (≤32 KB) და tool result-ებს. ასე ჩვენი key ზოგად LLM proxy-დ ვერ გადაიქცევა. ახალი npm dependency არ ემატება: Messages API-ს `fetch`-ით ვიძახებთ.

---

## 2. რაუნდები

ყოველ რაუნდს loop-ის ფორმატი აქვს: grants + frozen list + acceptance rows + Ableton-ის ცხრილი. სიმბოლო „≡ digest“ ნიშნავს `arrangementDigest`-ის ტოლობას.

**ხელახალი შემოწმება დაგეგმვისას.** B ყველა file:line-ს და grant-ს რაუნდის დაგეგმვისას ხელახლა ამოწმებს: PERF-8/10/13-ისა და REVIEW-RECOMMENDATIONS-ის შემდეგ ეს გეგმა მოძველებული იქნება. კონკრეტულად:
- PERF-8/10 ცვლის `useArrangement()`-ის ფორმას: range და selection გარე store-ში გადადის, context კი stable actions-ად და ცალკე state store-ებად იყოფა (`docs/technical/performance/perf-plan.md:34/36`). `applyCommandPlan`-ის ვიწრო interface (`getArrangement`, `commitArrangement`, `isPointerGestureActive`, `isArrangementPreviewActive`, `selectClip`, `setTimeRange`) B-მ ახალ API-ზე უნდა მიაბას. §1.1-ის ხაზები (`:282/:311/:315/:1532/:1619/:1621`) მაშინ აღარ იქნება ზუსტი.
- PERF-13-ის lazy decode + LRU: `ready` წყაროს buffer შეიძლება მეხსიერებაში არ იყოს. Command layer მხოლოდ `sourceDurations`-ს კითხულობს; B ამოწმებს, რომ ეს ისევ ასეა.
- ABL-R-12/13 და T12-ADVANCED ცვლის fade/envelope/crossfade-ის param-ებს. B ახლებს `set_clip_fade`-ის და envelope command-ების schema-ს და D-10-ის runtime allowlist-ს (§1.3).

**ვინ უშვებს რას.** ყოველ row-ში წერია შემსრულებელი:
- `C, unit (T-RUN)` — C თვითონ უშვებს `npx vitest run <რაუნდის ტესტ-ფაილი>`-ს და ამოწმებს, რომ შესაბამისი შემთხვევა start კოდზე ან mutation-ზე წითელია;
- `gate` — root gate-ის სრული `npm run test:run`, typecheck, lint და build. ყოველ რაუნდს აქვს `G-SUITE` row (`gate`);
- `C, browser` — C, Playwright, dev server.

**სტატუსი browser-ის გარეშე.** Loop v2-ში მხოლოდ unit-ით PASS „მზადაა“ არ ითვლება. CMD-1, CMD-2 და CMD-3 C PASS-ის შემდეგ რჩება სტატუსით `verifying` („მოწმდება“) და `next: CMD-4a` (კლიპი) ან `next: CMD-4b` (mix/marker/loop) — იქ, სადაც მათ CON-PARITY ფარავს. `c_pass_unit` სტატუსი workflow-ში არ არსებობს და არ გამოიყენება.

**Ableton-ის ცხრილი ყველა CMD რაუნდისთვის:** ქცევა: „პროგრამული edit API“. წყარო: Live Object Model (Max for Live docs). **დაუდასტურებელია**: B-მ Playwright-ით (docs გვერდის გახსნით) უნდა გადაამოწმოს. თუ ვერ გადაამოწმა, Parity = **არ ეხება**. CZABA-ს parity-ის ეტალონი საკუთარი UI-ა და არა Ableton.

### (i) Command layer — Studio cloud loop (backend-ის გარეშე, /studio-lab)

#### CMD-1 — Command core: კლიპის 7 command + summary + digest
- **მიზანი:** pure მოდულები. Command 1–7 §1.3-დან, `get_arrangement_summary`, `arrangementDigest`. UI ცვლილება არ არის.
- **დამოკიდებულება:** queue-ში პოზიცია (§3, go-ahead-ის gate არ არის). კოდზე: SP-2-ის `spot-placement.ts` (`placeSourceAtTime`). PHASE2B-SPOTTING queue-ში წინაა, ამიტომ ფაილი უკვე უნდა არსებობდეს. თუ არ არსებობს, B CMD-1-ს `add_clip`-ის გარეშე გეგმავს და `add_clip`-ს SP-2-ის შემდეგ ამატებს. `spot-placement.ts` CMD-1-ში read-only import-ია.
- **ფაილები (A):** ახალი `app/lib/arrangement/commands.ts`, `app/lib/arrangement/command-summary.ts`, `app/lib/arrangement/__tests__/commands-clip.test.ts`, `app/lib/arrangement/__tests__/commands-parity-clip.test.tsx`, doc `docs/implementation/2026/quarter-IV/NNN-studio-commands-1.md` (NNN-ს B ანიჭებს; 156 round 189-შია). შემოწმდა, რომ არცერთი ფაილი ჯერ არ არსებობს.
- **გაყინულია:** ყველაფერი დანარჩენი, მათ შორის `model.ts`, `ArrangementContext.tsx`, `strings.ts` და დაცული ფაილები. თუ რომელიმე command-ს model-ის ცვლილება დასჭირდა, A ჩერდება და B-ს ატყობინებს.

| id | action | expected | verify |
|---|---|---|---|
| CMD1-PAR | 7 command fixture-ზე (`ArrangementProvider` + `initialArrangement`, `helpers/workspace-test-environment.ts`) vs UI action (`dropLibrarySource` `:1454`, `nudgeSelectedClip` `:1752`, `splitSelection` `:1789`, `deleteSelection` `:1848` range-ით/გარეშე) | ≡ digest ყველა წყვილში | C, unit (T-RUN) |
| CMD1-REJ | თითო command-ზე ≥3 არასწორი შემთხვევა: უცნობი ID, NaN, Infinity, video lane, overlap, ზედმეტი ველი, `"12"` სტრიქონი | `ok:false` + კოდი (`not_found`/`invalid_param`/`wrong_lane_kind`/`overlap`); შედეგი `=== before` | C, unit (T-RUN) |
| CMD1-ADD-EXACT | `add_clip` დაკავებულ ადგილას | `overlap`, სხვაგან გადატანა არ ხდება (R1); შედეგი ემთხვევა `placeSourceAtTime`-ს | C, unit (T-RUN) |
| CMD1-ADJ | `trim_clip end` წყაროს ბოლოს გარეთ; `move_clip start:-2`; `split_clip` time −1 | `ok:true`, `adjusted:[{field, requested, applied}]`; უარყოფითი დრო → 0 (clamp, არა reject) | C, unit (T-RUN) |
| CMD1-D10 | ყველა command-ის შემდეგ ყველა კლიპზე | `duration ≤ srcDur − offset + 1e-4`; გასაღებები ⊆ runtime allowlist (§1.3); schema-ში stretch/rate/pitch არ არის | C, unit (T-RUN) |
| CMD1-IMP | import graph | მხოლოდ allowlist-ის მოდულები (§1.3, `spot-placement`-ის ჩათვლით); `fetch` და `routes/` არ არის | C, unit (T-RUN, source scan) |
| CMD1-SUM | summary ვიდეოთი და გრძელი სახელებით | `url`/`blob:` არ არის, სახელები ≤64, რიგი დეტერმინისტულია | C, unit (T-RUN) |
| CMD1-RV | `/studio-lab` rest 1440/1280 | 0 changed px vs ბოლო baseline, 0 console error | C, browser |
| G-SUITE | სრული suite | მწვანე | gate |

- **რეგრესიის რისკი:** runtime-ზე არცერთი, რადგან UI-დან import არ ხდება. Parity harness შეიძლება ცვალებადი იყოს (`crypto.randomUUID` jsdom-ში).
- **გადაწყვეტილი:**
  - clamp + `adjusted`; reject მხოლოდ NaN-სა და ტიპის შეცდომაზე (§1.3);
  - კლიპზე მითითება სახელით → არა, მხოლოდ ID-ით;
  - browser UI არ აქვს → C PASS-ის შემდეგ სტატუსი `verifying`, `next: CMD-4a` (CON-PARITY-A).

#### CMD-2 (ჩვეულებრივ 2a + 2b) — Mix, fade, marker, loop
- **2a:** command 8–13 (fade, clip gain, track mix/pan/solo, master). **2b:** marker ოჯახი და `set_loop`.
- **ფაილები:** `commands.ts` (grant), ახალი `__tests__/commands-mix.test.ts` და `__tests__/commands-marker-loop.test.ts`, doc.
- **გაყინულია:** CMD-1-ის მსგავსად. `command-summary.ts` გაყინულია, თუ summary-ის ველი არ აკლია.

| id | action | expected | verify |
|---|---|---|---|
| CMD2-PAR | `toggleTrackMute`/`toggleTrackSolo`/`setTrackPan`/`setClipGain`/master mute (context) vs command | ≡ digest | C, unit (T-RUN) |
| CMD2-FADE | `set_clip_fade` audio და video lane-ზე | `setClipFade`/`setVideoClipFade`-ის შედეგს ემთხვევა; შეზღუდვისას `adjusted` | C, unit (T-RUN) |
| CMD2-SOLO-IDEM | `set_track_solo solo:true` ორჯერ | მეორე: `no_change`, history უცვლელია | C, unit (T-RUN) |
| CMD2-DB | `set_track_mix volumeDb:-6` / `+1`; `set_master gainDb:+9`; `volumeDb:"-6"` | `trackVolumeFromDb(-6)` / `trackVolumeFromDb(0)` + `adjusted:[{field:'volumeDb', requested:1, applied:0}]` / +6 + `adjusted` / `invalid_param` | C, unit (T-RUN) |
| CMD2-MARK | add ერთსა და იმავე დროზე; სახელი 80 სიმბოლო; move conflict-ზე | `overlap` + ID; 64 სიმბოლომდე შეკვეცა (`normalizeMarkerName` `markers.ts:58-61`) + `adjusted:[{field:'name', requested:80, applied:64}]` (სიგრძეები); conflict-ზე `overlap` | C, unit (T-RUN) |
| CMD2-LOOP | `set_loop` 0.05 s; `enabled:false` | `end = start + 0.1` + `adjusted`; `toggleLoop`-ის parity | C, unit (T-RUN) |
| CMD2-RV | `/studio-lab` rest | 0 changed px | C, browser |
| G-SUITE | სრული suite | მწვანე | gate |

- **სტატუსი:** C PASS-ის შემდეგ `verifying`, `next: CMD-4b` (CON-PARITY-B).

- **რისკი:** dB↔linear-ის დამრგვალება (`track-volume-db.ts:16-30`). Marker-ის ID-ები digest-ში უნდა ნორმალიზდეს.
- **Default:** pan-ის ერთეული −1…1 და არა „L/R ერთეულები“.

#### CMD-3 — Plan executor და apply adapter
- **მიზანი:** `runCommandPlan` (draft, თანმიმდევრული, პირველ შეცდომაზე ჩერდება, ატომური) და `applyCommandPlan(api, plan)` §1.4-ის guard-ებით. Label-ის გენერატორი და ლიმიტები.
- **ფაილები:** ახალი `app/lib/arrangement/command-plan.ts`, `__tests__/command-plan.test.tsx`, doc. **გაყინულია:** `ArrangementContext.tsx` (API უკვე არსებობს: `:282/:311/:315/:1532/:1619/:1621`), `commands.ts`.

| id | action | expected | verify |
|---|---|---|---|
| PLAN-ATOM | 3 ნაბიჯი, მესამე არასწორია | commit არ ხდება, `past.length` უცვლელია | C, unit (T-RUN, provider) |
| PLAN-UNDO | 5 ნაბიჯი → apply → undo → redo | `past.length +1`; undo ≡ base; redo ≡ draft; status `Undo: AI — …` | C, unit (T-RUN, provider) |
| PLAN-STALE | plan-ის შემდეგ ხელით nudge, მერე apply | `stale_base`, commit არ ხდება | C, unit (T-RUN) |
| PLAN-GESTURE | apply აქტიური pointer gesture-ის დროს | `gesture_active`, commit არ ხდება | C, unit (T-RUN, `claimPointerGesture`) |
| PLAN-FADER | ჯერ fader preview, მერე apply | entry-ები `Volume` → `AI — …` (`applyEdit`-ის flush) | C, unit (T-RUN) |
| PLAN-SEL | მონიშნული კლიპი plan-ით წაიშალა | `selectedClipIds ⊆ clips`, range null | C, unit (T-RUN) |
| PLAN-LIMIT | 21 ნაბიჯი; JSON 33 KB | `limit_exceeded` | C, unit (T-RUN) |
| PLAN-PLAY | apply დაკვრის დროს | throw არ ხდება; schedule-ის resync | C, unit (T-RUN); browser-ის ნაწილი = CON-PLAY (CMD-4b) |
| G-SUITE | სრული suite | მწვანე | gate |

- **სტატუსი:** C PASS-ის შემდეგ `verifying`, `next: CMD-4a` (CON-UNDO) და `CMD-4b` (CON-PLAY).

- **რისკი:** `commitArrangement` პირველი არა-UI გამომძახებელი ხდება. ამიტომ R3-ის guard-ები სავალდებულოა.
- **Default:** apply-ის შემდეგ მონიშვნა სუფთავდება და შექმნილი კლიპები არ მოინიშნება.

#### CMD-4a — Lab command console (`/studio-lab?console=1`, dev only) + კლიპის parity
- **მიზანი:** პირველი browser-ით შემოწმებადი ზედაპირი. Textarea-ში JSON plan → Validate → preview `<ol>` → Apply/Discard. Summary ჩანს `<pre>`-ში ღილაკზე დაჭერით, digest — `data-arrangement-digest`-ში. ეს კომპონენტი ხელახლა გამოიყენება form (a)-ს preview-ში და form (c)-ის driver-ში.
- **ხილვადობა:** mount-ის პირობა `import.meta.env.DEV && searchParams.get('console') === '1'`, მხოლოდ `studio-lab.tsx`-ში. Production build-ში console არ ჩნდება, სხვა route-ზე — არც dev-ში.
- **ფაილები:** ახალი `app/components/arrangement/ArrangementCommandConsole.tsx` (barrel `index.ts`-ის გარეშე), `__tests__/command-console-ui.test.tsx`, `app/routes/studio-lab.tsx` (grant: provider-ის შიგნით პირობითი mount), doc. **გაყინულია:** `StudioWorkspace.tsx`, context, დაცული ფაილები.

| id | action | expected | verify |
|---|---|---|---|
| CON-DEFAULT | `/studio-lab` param-ის გარეშე, 1440/1280 | console არ არის; 0 changed px | C, browser |
| CON-PARITY-A | 7 კლიპის command (§1.3 #1–7): fresh context-ში UI action და console-ით შესრულებული command | digest-ები ტოლია | C, browser (ორი context თითო command-ზე) |
| CON-UNDO | 3-ნაბიჯიანი plan → Apply → focus timeline-ზე → Ctrl+Z → Ctrl+Shift+Z | ≡ before / ≡ after; status `Undo: AI — …` | C, browser |
| CON-REJECT | გაფუჭებული JSON; უცნობი `type`; არასწორი ID; დიაპაზონს გარეთ დრო | შეცდომის ტექსტი ჩანს, digest და history უცვლელია; დიაპაზონს გარეთ დრო → preview-ში `adjusted` შენიშვნა | C, browser |
| CON-KEYS | textarea-ში Space, Delete, Ctrl+Z | დაკვრა არ იწყება, არაფერი იშლება, arrangement-ის undo არ ხდება (`StudioWorkspace.tsx:1725`) | C, browser |
| CON-KEYS-LETTERS | textarea-ში S, W, H, O, U, `?`, `/` (REVIEW-RECOMMENDATIONS-ის ახალი shortcut-ები) და არსებული M, G, A (`StudioWorkspace.tsx:1919/1926/1933`) | სიმბოლოები textarea-ში იწერება; არცერთი shortcut-ის ქმედება არ ხდება (panel/help/search არ იხსნება, mute/group/selection არ იცვლება); digest და history უცვლელია; focus textarea-ში რჩება. B დაგეგმვისას ამოწმებს, რომელი კლავიში არსებობს | C, browser |
| CON-A11Y | label-ები, focus-ის რიგი, preview-ის სია, `role="status"` | axe: 0 serious/critical console-ის რეგიონში; Apply/Discard კლავიატურით მუშაობს; focus ring ჩანს | C, browser + accessibility-auditor |
| CON-SSR | SSR `/studio-lab?console=1`-ით (dev) | hydration warning არ არის | C, unit (T-RUN) + C, browser |
| CON-NET | Validate/Apply | 0 network request | C, browser |
| CON-ROUTE | `/studio/middle-east?console=1` და `/?console=1` dev-ში | console არ არის | C, browser |
| CON-PROD | production build, `/studio-lab?console=1` | console არ არის; `build/client`-ში `ArrangementCommandConsole`-ის კოდი არ გვხვდება (grep) | gate (build) + C (grep) |
| G-PROT | `/studio/middle-east`; `api.studio-token` | „Sign in required“; 401/403 როგორც ადრე | C (mock) |
| G-SUITE | სრული suite | მწვანე | gate |

- **CON-A11Y-ის axe:** axe-core store-ის `package.json`-ში არ არის, `package.json` კი loop-ში გაყინულია. ამიტომ C axe-core-ს **loop-ის საქაღალდეში** აყენებს: `npm install --prefix tmp/studio-real-loop/harness/axe axe-core@4.10.2`, და Playwright-ში `page.addScriptTag({ path: '<prefix>/node_modules/axe-core/axe.min.js' })`-ით ტვირთავს. Store-ის ფაილები არ იცვლება. თუ install ვერ მოხერხდა, row BLOCKED-ია და არა PASS.
- **რისკი:** layout-ის overlay workspace-ს ფარავს. ამიტომ console უნდა იყოს fixed და ჩაკეცვადი.
- **Default:** ტექსტი ინგლისურად (strings-ის პოლიტიკის მიხედვით).
- **დახურავს:** CMD-1-ს (CON-PARITY-A) და CMD-3-ის undo-ს (CON-UNDO). მათი `verifying` სტატუსი აქ სრულდება.

#### CMD-4b — Console parity: mix, marker, loop
- **მიზანი:** CMD-2-ის 10 flow-ის (§1.3 #8–14: 6 mix + 4 marker/loop) browser parity და CMD-3-ის დაკვრის შემოწმება.
- **ფაილები:** `ArrangementCommandConsole.tsx` (grant მხოლოდ ამ რაუნდში ნაპოვნი fix-ისთვის), doc. თუ fix არ დასჭირდა, A-ს სამუშაო მხოლოდ doc-ია. **გაყინულია:** CMD-4a-ს მსგავსად, `commands.ts`-ის ჩათვლით.

| id | action | expected | verify |
|---|---|---|---|
| CON-PARITY-B | 10 command (fade, clip gain, track mix/pan/solo, master, marker add/update/delete, `set_loop`): fresh context-ში UI action და console-ით შესრულებული command | digest-ები ტოლია | C, browser (ორი context თითო command-ზე) |
| CON-ADJ | `set_track_mix volumeDb:+1`, marker-ის 80-სიმბოლოიანი სახელი | preview-ში `adjusted` შენიშვნა; apply-ის შემდეგ 0 dB / 64 სიმბოლო | C, browser |
| CON-PLAY | 3-ნაბიჯიანი plan-ის apply დაკვრის დროს | console error არ არის; დაკვრა გრძელდება ახალ arrangement-ზე | C, browser |
| CON-RV | `/studio-lab` rest 1440/1280 | 0 changed px | C, browser |
| G-SUITE | სრული suite | მწვანე | gate |

- **დახურავს:** CMD-2-ს (CON-PARITY-B) და CMD-3-ის PLAN-PLAY-ს (CON-PLAY).

#### CMD-5a — Envelope და duplicate
- **ფაილები:** `commands.ts` (grant), `command-summary.ts` (grant: envelope-ის წერტილები summary-ში, რადგან move/remove მათ `{clipId, pointTime}`-ით მიმართავს), ახალი `__tests__/commands-envelope-duplicate.test.ts`, doc. **გაყინულია:** `envelope.ts`, `model.ts`, context, console.

| id | action | expected | verify |
|---|---|---|---|
| CMD5A-ENV-PAR | `add/move/remove_envelope_point` vs UI commit (`ArrangementClipEnvelope.tsx:171/305/341`) | ≡ digest | C, unit (T-RUN) |
| CMD5A-ENV-ADJ | gain 1.4; წერტილის დრო კლიპის გარეთ | gain → 1, დრო → კლიპის ზღვარი, ორივე `adjusted`-ით (`envelope.ts:190-197` ჩუმად ზღუდავს) | C, unit (T-RUN) |
| CMD5A-ENV-REJ | უცნობი `pointTime`; video lane; NaN | `not_found` / `wrong_lane_kind` / `invalid_param`; `=== before` | C, unit (T-RUN) |
| CMD5A-DUP | `duplicate_clips` vs `duplicateSelection` (`ArrangementContext.tsx:1935`); ადგილი დაკავებულია | ≡ digest, `created` შეიცავს ახალ ID-ებს / `overlap` | C, unit (T-RUN) |
| CMD5A-UI | console-ით envelope add + duplicate vs UI action, fresh context-ებში | digest-ები ტოლია | C, browser |
| G-SUITE | სრული suite | მწვანე | gate |

#### CMD-5b — Ripple (`delete_time`) და `duck_range`
- **ფაილები:** `commands.ts` (grant), `ArrangementCommandConsole.tsx` (grant: ripple-ის გაფრთხილება preview-ში), ახალი `__tests__/commands-ripple-duck.test.ts`, doc. **გაყინულია:** `model.ts`, `envelope.ts`, context.
- **`duck_range` SRW-44-მდე დაშვებულია:** მონაკვეთს მომხმარებელი ან მოდელი ხელით უთითებს. `set_duck_under` (დიალოგის ამოცნობა) SRW-44-ს ელოდება და CMD-6-შია.

| id | action | expected | verify |
|---|---|---|---|
| CMD5B-RIPPLE | `delete_time` vs `cutTimeSelection` (`ArrangementContext.tsx:2029`) clipboard-ის გარეშე, ანუ `deleteTime` (`model.ts:395`) | ≡ digest; marker-ები და loop გადაიწია (`model.ts:429-432`) | C, unit (T-RUN) |
| CMD5B-DUCK | `duck_range` −10 dB, `rampMs:50` | 4 წერტილი, წრფივი 0.316 ±0.001, gain ≤1 | C, unit (T-RUN) |
| CMD5B-DUCK-ADJ | `depthDb:+3`; მონაკვეთი, სადაც track-ზე კლიპი არ არის | 0 dB + `adjusted`; `not_found` | C, unit (T-RUN) |
| CMD5B-DUCK-EXIST | მონაკვეთში უკვე არის envelope წერტილი | `overlap`, `=== before` | C, unit (T-RUN) |
| CMD5B-WARN | console-ში `delete_time` plan | preview-ში ჩანს გაფრთხილება „ყველა lane, marker და loop“ | C, browser |
| CMD5B-UI | console-ით `delete_time` vs UI Cut Time (clipboard-ის გარეშე შედარება), fresh context-ებში | digest-ები ტოლია | C, browser |
| G-SUITE | სრული suite | მწვანე | gate |

- **რისკი:** ripple marker-ებსა და loop-ს გადაწევს (`model.ts:429-432`).

#### CMD-6 — `set_duck_under` (მხოლოდ SRW-44c C PASS-ის შემდეგ)
- **დამოკიდებულება:** SRW-44c C PASS (PHASE2-VIDEO-SCORING; ამ entry-ს საკუთარი go gate policy-შია). ამ რაუნდამდე „duck it under dialogue“ form (a)-ში იძლევა ახსნას და `duck_range` შემოთავაზებას, ავტომატურ ducking-ს არა.

**Checkpoint:** CMD-4b-ის ან CMD-5b-ის დასრულებისას root იძახებს frontend-architect-ს (`agent-workflow.md`, „არქიტექტურული checkpoint“). ეს რაუნდად არ ითვლება.

### (ii) Form (a) პროტოტიპი — loop-ის გარეთ (key და backend სჭირდება)

`phase-2-requirements.md:33`: „AI — ჯერ პროტოტიპი ლუპის გარეთ“.

| label | მიზანი | დამოკიდებულება | ფაილები (store-ის გარეთ, თუ არ არის აღნიშნული) |
|---|---|---|---|
| PA-0 | Eval set: 30 ინსტრუქცია (ka + en), 5 fixture arrangement, მოსალოდნელი digest ან დასაშვები ვარიანტების ნაკრები. ბიუჯეტის ზღვრები. მოდელების სია | Saba | `czaba-project/tools/studio-agent-eval/cases.json` (ახალი, ცალკე საქაღალდე) |
| PA-1 | **Offline eval Node-ში:** LLM API (`fetch`) + command core. თუ CMD-1/2 ჯერ არ არსებობს, store-ის `model.ts` read-only import-ით და throwaway adapter-ით | PA-0, local key | იგივე საქაღალდე. Store-ის `package.json` არ იცვლება |
| PA-2 | Endpoint spike, მხოლოდ localhost (§1.6) | G1 PASS | Remix `.server` route ცალკე branch-ზე ან .NET spike |
| PA-3 | In-Studio prompt-ის ველი → endpoint → tool loop → CMD-4a-ს preview → Apply | CMD-4a, PA-2 | ახალი პანელი (branch). Loop-ის გაყინულ ფაილებს არ ეხება |
| PA-4 | Production: `StudioAgentController` (`[Authorize]`, 1–2 ხაზიანი body — MINIMAL_CONTROLLER), per-user limiter, `AgentUsage` + დღიური cap, scrubbed logging, `SECURITY_AUDIT` ორივე რეპოში, feature flag | G2 | czaba-api; store-ში მხოლოდ client |
| PA-5 | მომხმარებლის ტესტი: Saba + 3 ტესტერი, 20 ამოცანა | PA-4, **R8** (purchased mount) ან მხოლოდ lab | — |

**რა გავზომოთ, რომ გადავწყვიტოთ გაგრძელება (default ზღვრები, Saba ცვლის):**
- **G1 (PA-1-ის შემდეგ):**
  - ზუსტი წარმატება ≥80% eval set-ზე;
  - schema-ს გარეთ შესრულებული ნაბიჯი = 0;
  - არასწორი tool call ≤10% ნაბიჯებისა, მათგან თვითგამოსწორება ≥70%;
  - ქართული ინსტრუქციების წარმატება ინგლისურს ≤10 პუნქტით ჩამორჩება;
  - p95 დრო preview-მდე ≤8 s;
  - median ღირებულება ≤$0.02 მოთხოვნაზე;
  - summary-ის ზომა 50 კლიპზე ≤6k token.
- **G2 (PA-3-ის შემდეგ):** Saba-ს ხარისხის შეფასება; Apply-ის შემდეგ 30 წამში undo ≤20%; Discard-ის წილი; შეცდომის ტექსტების გასაგებობა.
- თუ G1 ვერ სრულდება: form (a) ჩერდება. CMD-1…4b მაინც ღირს, თუ (c)-ის ღირებულება დადასტურდება (§(iv)).

### (iii) Form (b) — Remote MCP bridge (მოგვიანებით)

**Bridge-ის ვარიანტები:**

| ვარიანტი | აღწერა | რისკი |
|---|---|---|
| B1 (default) | Studio-ს tab გამავალ კავშირს ხსნის: SignalR hub czaba-api-ში (`.claude/prompts/new-signalr-hub.md`). Pairing ხდება ერთჯერადი კოდით (TTL 10 წთ), ჯგუფი = user + session. Remote MCP server (.NET) tool call-ს tab-ს უგზავნის. Tab ასრულებს draft-ს და აჩვენებს preview-ს. **Apply მხოლოდ tab-შია** | Pairing-ის მოტაცება; რამდენიმე tab; tab დახურულია; latency; მონაცემები (სახელები) მომხმარებლის AI client-თან გადის; MCP-ის OAuth-ის სირთულე |
| B2 | Local stdio MCP + Playwright/CDP ბრაუზერზე | მომხმარებლისთვის არ გამოდგება. სასარგებლოა მხოლოდ dev-სა და (c)-სთვის |
| B3 | Browser extension | დამატებითი distribution და უსაფრთხოების ზედაპირი. არ არის რეკომენდებული |
| B4 | Browser-ის native model-context API (WebMCP-ის ტიპის) | **დაუდასტურებელია** და ექსპერიმენტული. ბაზისად არ გამოდგება |

| label | მიზანი | დამოკიდებულება |
|---|---|---|
| MB-0 | docs-explorer: MCP-ის მიმდინარე სპეციფიკაცია (remote transport, authorization) და C# SDK-ის არსებობა. **დაუდასტურებელია** | G2 |
| MB-1 | Hub + pairing, ტესტები: უცხო user-ის ჯგუფში შეღწევა = 403 | MB-0 |
| MB-2 | Remote MCP server: tool-ები `studio-agent-tools.json`-იდან (hash contract) | MB-1 |
| MB-3 | Tab-ის bridge client: „გარე AI დაკავშირებულია“ + გათიშვა; ყველა plan გადის CMD-4a-ს preview-ზე | MB-2, CMD-4a |
| MB-4 | უსაფრთხოების მიმოხილვა, abuse ლიმიტები, მონაცემების გაზიარების თანხმობის ტექსტი | MB-3 |

### (iv) Form (c) — verifier-driver

| label | მიზანი | ფაილები | Row-ები |
|---|---|---|---|
| VD-1 | Playwright helper `applyPlan(page, steps)` console-ით და `readDigest(page)` | loop-ის საქაღალდე: `tmp/studio-real-loop/harness/studio-commands.mjs` (root/C, არა store) | VD1-SELF: 3 command helper-ით vs UI → ტოლი digest; 0 network |
| VD-2 | პოლიტიკის დამატება `agent-workflow.md`-ში (root): command-ები დაშვებულია **მხოლოდ setup-სა და parity-სთვის**. UI-ის ქცევის row-ის მტკიცებულებად არასდროს ითვლება. Row-ის tag: `setup:commands` vs `ui` | root | VD2-TIME: regression-ის setup-ის დრო „მანამდე/მერე“ (C-ის გაზომვა) |

**რისკი:** C-მა რეალური მომხმარებლის ქმედების შემოწმება შეიძლება command-ით ჩაანაცვლოს და loop-ის მთავარი გარანტია დაკარგოს. დაცვა: tag და B-ის row-ების აკრძალვა.

---

## 3. ჯამი, რიგი და queue-ში პოზიცია

| გარემო | min | expected | შენიშვნა |
|---|---|---|---|
| (i) loop, command layer | 5 (CMD-1, 2, 3, 4a, 4b) | 9 (2a/2b, 4a/4b, 5a/5b, 1 fix-up) | +CMD-6 SRW-44-ის შემდეგ; loop-ის overhead (regression ~3 დღეში ერთხელ, RETRO ყოველ entry-ზე) +1–2 |
| (ii) form (a), loop-ის გარეთ | 3 (PA-1, PA-3, PA-4) | 5 (PA-1…PA-5; PA-0 კოდის გარეშე) | G1/G2 gate-ები |
| (iii) form (b) | 3 | 5 (MB-0…MB-4) | (a)-ს G2-ის შემდეგ |
| (iv) form (c) | 1 | 2 | CMD-4a-ს შემდეგ |

**რეკომენდებული რიგი:**
1. **ახლა, loop-ის გარეთ, store-ის ცვლილების გარეშე:** PA-0 და PA-1 (offline eval). ეს ყველაზე იაფი ექსპერიმენტია და ძირითად კითხვას პასუხობს: დაგეგმავს თუ არა მოდელი სწორად. Loop არ ჩერდება.
2. Queue entry `STUDIO-AGENT-COMMANDS` (CMD-1…5b) — approved (Saba, 2026-10-26), status `queued`; პოზიცია `loop/policy.local.md`-ის მიხედვით.
3. Loop-ში: CMD-1 → 2a → 2b → 3 → 4a → 4b → 5a → 5b; (SRW-44-ის შემდეგ) CMD-6. Loop-ის გარეთ: VD-1/2 (CMD-4a-ს შემდეგ) → PA-2…5 → MB-0…4.

**Queue-ში პოზიცია (არაფერს ანაცვლებს):**
- `loop/policy.local.md`-ის მიხედვით („Three new queue entries“): `post_current_stage_queue`-ის ბოლოს, `PHASE2-VIDEO-SCORING`-ისა და `PHASE2B-SPOTTING`-ის შემდეგ. Entry approved-ია; საკუთარი prerequisites-ის გარდა go-ahead არ სჭირდება.
- უფრო ადრე მდგარი entry-ები (STORE-REDESIGN, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE, T12-ADVANCED, PHASE2) უცვლელად რჩება. `PHASE2-VIDEO-SCORING`-ს თავისი go gate რჩება; ეს მხოლოდ CMD-6-ს ეხება (SRW-44).
- **არგუმენტი:** REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE და T12-ADVANCED context-ს და model-ს ცვლის (§2-ის „ხელახალი შემოწმება“). CMD მათ შემდეგ იწყება და ახალ ფუნქციებს მცირე რაუნდებით ფარავს, გადაწერის გარეშე.
- Saba-ს შეუძლია entry-ის წინ გადმოწევა; root ამას policy-ში ჩაწერს.

**ღია გადაწყვეტილებები Saba-სთვის (default-ით):**
1. Clamp თუ reject → **გადაწყვეტილია:** clamp + `adjusted`; reject მხოლოდ NaN-სა და ტიპის შეცდომაზე (§1.3).
2. ერთი history entry მოთხოვნაზე → დიახ.
3. Console-ის ხილვადობა → **გადაწყვეტილია:** მხოლოდ dev build-ში (`import.meta.env.DEV`) და მხოლოდ `/studio-lab?console=1`-ზე.
4. Bar/beat დრო v1-ში → არა (R6).
5. Production endpoint → .NET.
6. AI ნამდვილი მყიდველისთვის → R8-ის (SRW-21 purchased mount, დაცული route) გადაწყვეტამდე მხოლოდ `/studio-lab`.
7. „Duck under dialogue“ → SRW-44-მდე `duck_range` ხელით მითითებული მონაკვეთით.
