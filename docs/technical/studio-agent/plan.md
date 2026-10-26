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

**შედეგი:** `{ ok: true, arrangement, created: string[], adjusted?: {field, requested, applied}[] }` ან `{ ok: false, code, field?, message }`. კოდები: `unknown_command`, `invalid_param`, `not_found`, `wrong_lane_kind`, `overlap`, `out_of_range`, `source_not_ready`, `no_change`, `limit_exceeded`, `stale_base`, `gesture_active`.

**ვალიდაცია:** რიცხვები სასრულია. დრო წამებშია და ms-მდე მრგვალდება. დამატებითი ველი = `invalid_param`; სტრიქონი რიცხვის ნაცვლად = `invalid_param`; ID უნდა არსებობდეს. Lane-ის ტიპი მოწმდება. უარყოფისას დაბრუნებული arrangement **იგივე reference-ია** (`===`).

#### პირველი 14 command (ფაზა CMD-1/CMD-2)

| # | `type` | params | Pure ფუნქცია (file:line) | UI-ის ეკვივალენტი | შენიშვნა |
|---|---|---|---|---|---|
| 1 | `add_clip` | `{trackId, sourceId, start}` | `addClip` `model.ts:135` + `canPlaceLibraryClip` `library.ts:166` | `dropLibrarySource` `ArrangementContext.tsx:1454-1509` | R1: ზუსტი ადგილი, სხვაგან გადატანის გარეშე. `source_not_ready`, თუ წყარო მზად არ არის. Audio lane-ის გარდა არ მუშაობს |
| 2 | `move_clip` | `{clipId, start}` | `moveClip` `model.ts:173` | nudge `:1752-1787`, drag `ArrangementClip.tsx:727` | overlap → `overlap` |
| 3 | `move_clips` | `{clipIds[], delta}` | `moveClips` `selection.ts:119` | group nudge `:1757-1765` | ზღვრები `groupMoveBounds` `selection.ts:93` |
| 4 | `trim_clip` | `{clipId, edge:'start'\|'end', time}` | `trimClipStart` `model.ts:194`, `trimClipEnd` `:226` (`sourceDurations`) | trim drag `ArrangementClip.tsx:613-614` | R2: `adjusted` ჩანაწერი. D-10 ზედა ზღვარი `:241` |
| 5 | `split_clip` | `{clipId, time}` | `splitClipAt` `model.ts:256` | `splitSelection` `:1824-1837` | აბრუნებს `created:[rightId]` |
| 6 | `delete_clips` | `{clipIds[]}` | `deleteClip` `model.ts:391`, `deleteClips` `selection.ts:143` | `deleteSelection` `:1883-1899` | |
| 7 | `delete_range` | `{start, end, trackId}` ან `{start, end, allTracks:true}` | `deleteRangeKeepingGap` `clipboard.ts:181` | `deleteSelection` range-ით `:1854-1881` | სიცარიელე რჩება (delete-selection-update) |
| 8 | `set_clip_fade` | `{clipId, edge:'in'\|'out', seconds}` | `setClipFade` `fades.ts:58` / `setVideoClipFade` `video-fades.ts:26` | fade handle `ArrangementClip.tsx:669`, `:778` | ტიპი lane-ის მიხედვით ირჩევა. `adjusted`, თუ შეზღუდა |
| 9 | `set_clip_gain` | `{clipIds[], gainDb}` | `setClipGainDb` `model.ts:505`, `setClipGainsDb` `clip-gain-multi.ts:93` | `setClipGain` `:2717-2722` | −60…+24, 0.1 dB |
| 10 | `set_track_mix` | `{trackId, volumeDb?, mute?}` | `setTrackMix` `model.ts:461` + `trackVolumeFromDb` `track-volume-db.ts:16` | `toggleTrackMute` `:2335-2348`, fader | −60…0 dB. >0 → `out_of_range` |
| 11 | `set_track_pan` | `{trackId, pan}` | `setArrangementTrackPan` `model.ts:546` | `setTrackPan` `:2594-2606` | −1…1, ნაბიჯი 1/50 |
| 12 | `set_track_solo` | `{trackId, solo:boolean, exclusive:boolean}` | `toggleSolo` `model.ts:583` | `toggleTrackSolo` `:2350-2363` | **idempotent**: `solo` უკვე სწორია → `no_change`, toggle-ის გარეშე |
| 13 | `set_master` | `{gainDb?, mute?}` | `setMasterMix` `model.ts:480` | master fader / mute `:2714` | −60…+6 |
| 14 | `marker` ოჯახი: `add_marker {time, name?}`, `update_marker {markerId, name?, time?}`, `delete_marker {markerId}`; `set_loop {start, end, enabled}` | | `addMarker` `markers.ts:71`, `renameMarker` `:91`, `moveMarker` `:107`, `deleteMarker` `:134`; `setLoopFromRange` `loop.ts:37`, `toggleLoop` `:49` | `ArrangementMarkerRow.tsx:327/360/373/404`; `toggleLoopSelection` `:1648-1688` | marker conflict → `overlap` + არსებული ID. Loop <0.1 s → `out_of_range` |

რიცხვი 14-ზე მეტია, თუ marker ოჯახს და `set_loop`-ს ცალ-ცალკე დავთვლით (სულ 17 tool).

**წაკითხვის tool-ები (state არ იცვლება):**
- `get_arrangement_summary` — tracks (dB-ში), clips (ID, lane, წყაროს მოკლე სათაური, start/end, fades, gain), markers, loop, master, groups, მზა წყაროები, playhead, selection. `url`, `blob:` და token არ შედის. სახელები ≤64 სიმბოლოა.
- `arrangementDigest(arrangement)` — ID-ები შეიცვლება სტაბილური რიგით (lane → start), შემდეგ ხდება hash. ეს ხსნის R4-ს.

**CMD-5 (მოგვიანებით):**
- envelope: `add/move/remove_envelope_point` (`envelope.ts:138/170/205`);
- `duplicate_clips` (`model.ts:348`);
- `delete_time` (ripple, `model.ts:395`). **Preview აქ სავალდებულოა**, რადგან ყველა lane-ს, marker-სა და loop-ს გადაწევს;
- `duck_range {trackId, start, end, depthDb, rampMs}` — envelope-ის 4 წერტილის კომპოზიცია. Envelope-ის gain წრფივია, 0…1-ის ფარგლებში (`envelope.ts:197`), ამიტომ boost შეუძლებელია.

**CMD-6** (მხოლოდ SRW-44-ის შემდეგ): `set_duck_under {trackId, sourceTrackId, depthDb}`.

#### განზრახ გამორიცხული

- **Export** (`exportWav` `ArrangementContext.tsx:363/3088`) და ნებისმიერი ჩამოტვირთვა. AI-ს command სიაში ის არ არის. მომავალში შესაძლებელია მხოლოდ `request_export`, რომელიც ჩვეულებრივ Export დიალოგს ხსნის და მომხმარებლის დასტურს ელოდება.
- Purchase, download და auth: `api.*`, `studio.$productId.tsx`, `account.downloads.tsx`, `AuthContext.tsx`, `lib/auth*`, `lib/r2*`, `lib/firebase*`. Import-boundary ტესტი ამოწმებს, რომ `commands.ts`-ის import-ები მხოლოდ `~/types/arrangement` და `./(model|fades|video-fades|markers|loop|selection|clipboard|clip-gain-multi|track-volume-db|library|envelope)`-ია.
- წყაროს ჩატვირთვა (`loadSource`) და ფაილის/ვიდეოს import. AI მხოლოდ უკვე `ready` წყაროს იყენებს. ჩატვირთვას purchased route-ზე token-იანი URL სჭირდება.
- **D-10:** schema-ში არ არის `rate`, `pitch`, `stretch`, `playbackRate` ან `speed`. ტესტი ამოწმებს: ნებისმიერი command-ის შემდეგ ყოველი კლიპისთვის `duration ≤ sourceDuration − sourceOffset + ε`, და `ArrangementClip`-ის გარდა სხვა გასაღები არ ჩნდება.
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
| UI: `app/components/arrangement/ArrangementCommandConsole.tsx`, mount `studio-lab.tsx`-ში provider-ის შიგნით | `StudioWorkspace.tsx` (2639 ხაზი) არ იცვლება. Default pixel baseline-ი უცვლელი რჩება, რადგან console მხოლოდ `?console=1`-ით ჩნდება |

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

**Ableton-ის ცხრილი ყველა CMD რაუნდისთვის:** ქცევა: „პროგრამული edit API“. წყარო: Live Object Model (Max for Live docs). **დაუდასტურებელია**: B-მ `/browse`-ით უნდა გადაამოწმოს. თუ ვერ გადაამოწმა, Parity = **არ ეხება**. CZABA-ს parity-ის ეტალონი საკუთარი UI-ა და არა Ableton.

### (i) Command layer — Studio cloud loop (backend-ის გარეშე, /studio-lab)

#### CMD-1 — Command core: კლიპის 7 command + summary + digest
- **მიზანი:** pure მოდულები. Command 1–7 §1.3-დან, `get_arrangement_summary`, `arrangementDigest`. UI ცვლილება არ არის.
- **დამოკიდებულება:** Saba-ს go და queue-ში პოზიცია (§3). კოდზე დამოკიდებულება არ არის.
- **ფაილები (A):** ახალი `app/lib/arrangement/commands.ts`, `app/lib/arrangement/command-summary.ts`, `app/lib/arrangement/__tests__/commands-clip.test.ts`, `app/lib/arrangement/__tests__/commands-parity-clip.test.tsx`, doc `docs/implementation/2026/quarter-IV/NNN-studio-commands-1.md` (NNN-ს B ანიჭებს; 156 round 189-შია). შემოწმდა, რომ არცერთი ფაილი ჯერ არ არსებობს.
- **გაყინულია:** ყველაფერი დანარჩენი, მათ შორის `model.ts`, `ArrangementContext.tsx`, `strings.ts` და დაცული ფაილები. თუ რომელიმე command-ს model-ის ცვლილება დასჭირდა, A ჩერდება და B-ს ატყობინებს.

| id | action | expected | verify |
|---|---|---|---|
| CMD1-PAR | 7 command fixture-ზე (`ArrangementProvider` + `initialArrangement`, `helpers/workspace-test-environment.ts`) vs UI action (`dropLibrarySource`, `nudgeSelectedClip`, `splitSelection`, `deleteSelection` range-ით/გარეშე) | ≡ digest ყველა წყვილში | vitest |
| CMD1-REJ | თითო command-ზე ≥3 არასწორი შემთხვევა: უცნობი ID, NaN, უარყოფითი დრო, video lane, overlap, ზედმეტი ველი, `"12"` სტრიქონი | `ok:false` + კოდი; შედეგი `=== before` | vitest |
| CMD1-ADD-EXACT | `add_clip` დაკავებულ ადგილას | `overlap`, სხვაგან გადატანა არ ხდება (R1) | vitest |
| CMD1-ADJ | `trim_clip end` წყაროს ბოლოს გარეთ | `ok:true`, `adjusted:[{field:'time', requested, applied}]` | vitest |
| CMD1-D10 | ყველა command-ის შემდეგ ყველა კლიპზე | `duration ≤ srcDur − offset + 1e-4`; ახალი გასაღები არ ჩნდება; schema-ში stretch/rate/pitch არ არის | vitest |
| CMD1-IMP | import graph | მხოლოდ დაშვებული მოდულები; `fetch` და `routes/` არ არის | vitest (source scan) |
| CMD1-SUM | summary ვიდეოთი და გრძელი სახელებით | `url`/`blob:` არ არის, სახელები ≤64, რიგი დეტერმინისტულია | vitest |
| CMD1-RV | `/studio-lab` rest 1440/1280 | 0 changed px vs ბოლო baseline, 0 console error | C, browser |

- **რეგრესიის რისკი:** runtime-ზე არცერთი, რადგან UI-დან import არ ხდება. Parity harness შეიძლება ცვალებადი იყოს (`crypto.randomUUID` jsdom-ში).
- **გადაუწყვეტელი საკითხები (default):**
  - clamp თუ reject → `adjusted`;
  - კლიპზე მითითება სახელით → არა, მხოლოდ ID-ით;
  - CMD-1 „მზადაა“ ვერ გახდება, რადგან browser UI არ აქვს → სტატუსი `c_pass_unit`, browser-ის ნახევარი CMD-4-ში.

#### CMD-2 (ჩვეულებრივ 2a + 2b) — Mix, fade, marker, loop
- **2a:** command 8–13 (fade, clip gain, track mix/pan/solo, master). **2b:** marker ოჯახი და `set_loop`.
- **ფაილები:** `commands.ts` (grant), ახალი `__tests__/commands-mix.test.ts` და `__tests__/commands-marker-loop.test.ts`, doc.
- **გაყინულია:** CMD-1-ის მსგავსად. `command-summary.ts` გაყინულია, თუ summary-ის ველი არ აკლია.

| id | action | expected | verify |
|---|---|---|---|
| CMD2-PAR | `toggleTrackMute`/`toggleTrackSolo`/`setTrackPan`/`setClipGain`/master mute (context) vs command | ≡ digest | vitest |
| CMD2-FADE | `set_clip_fade` audio და video lane-ზე | `setClipFade`/`setVideoClipFade`-ის შედეგს ემთხვევა; შეზღუდვისას `adjusted` | vitest |
| CMD2-SOLO-IDEM | `set_track_solo solo:true` ორჯერ | მეორე: `no_change`, history უცვლელია | vitest |
| CMD2-DB | `set_track_mix volumeDb:-6` / `+1` | `trackVolumeFromDb(-6)` / `out_of_range` | vitest |
| CMD2-MARK | add ერთსა და იმავე დროზე; სახელი 80 სიმბოლო; move conflict-ზე | `overlap` + ID; 64 სიმბოლომდე შეკვეცა (`markers.ts:58`); conflict-ის უარყოფა | vitest |
| CMD2-LOOP | `set_loop` 0.05 s; `enabled:false` | `out_of_range`; `toggleLoop`-ის parity | vitest |
| CMD2-RV | `/studio-lab` rest | 0 changed px | C, browser |

- **რისკი:** dB↔linear-ის დამრგვალება (`track-volume-db.ts:16-30`). Marker-ის ID-ები digest-ში უნდა ნორმალიზდეს.
- **Default:** pan-ის ერთეული −1…1 და არა „L/R ერთეულები“.

#### CMD-3 — Plan executor და apply adapter
- **მიზანი:** `runCommandPlan` (draft, თანმიმდევრული, პირველ შეცდომაზე ჩერდება, ატომური) და `applyCommandPlan(api, plan)` §1.4-ის guard-ებით. Label-ის გენერატორი და ლიმიტები.
- **ფაილები:** ახალი `app/lib/arrangement/command-plan.ts`, `__tests__/command-plan.test.tsx`, doc. **გაყინულია:** `ArrangementContext.tsx` (API უკვე არსებობს: `:282/:311/:315/:1532/:1619/:1621`), `commands.ts`.

| id | action | expected | verify |
|---|---|---|---|
| PLAN-ATOM | 3 ნაბიჯი, მესამე არასწორია | commit არ ხდება, `past.length` უცვლელია | vitest + provider |
| PLAN-UNDO | 5 ნაბიჯი → apply → undo → redo | `past.length +1`; undo ≡ base; redo ≡ draft; status `Undo: AI — …` | vitest + provider |
| PLAN-STALE | plan-ის შემდეგ ხელით nudge, მერე apply | `stale_base`, commit არ ხდება | vitest |
| PLAN-GESTURE | apply აქტიური pointer gesture-ის დროს | `gesture_active`, commit არ ხდება | vitest (`claimPointerGesture`) |
| PLAN-FADER | ჯერ fader preview, მერე apply | entry-ები `Volume` → `AI — …` (`applyEdit`-ის flush) | vitest |
| PLAN-SEL | მონიშნული კლიპი plan-ით წაიშალა | `selectedClipIds ⊆ clips`, range null | vitest |
| PLAN-LIMIT | 21 ნაბიჯი; JSON 33 KB | `limit_exceeded` | vitest |
| PLAN-PLAY | apply დაკვრის დროს | throw არ ხდება; schedule-ის resync | vitest + C browser spot |

- **რისკი:** `commitArrangement` პირველი არა-UI გამომძახებელი ხდება. ამიტომ R3-ის guard-ები სავალდებულოა.
- **Default:** apply-ის შემდეგ მონიშვნა სუფთავდება და შექმნილი კლიპები არ მოინიშნება.

#### CMD-4 — Lab command console (`/studio-lab?console=1`)
- **მიზანი:** პირველი browser-ით შემოწმებადი ზედაპირი. Textarea-ში JSON plan → Validate → preview `<ol>` → Apply/Discard. Summary ჩანს `<pre>`-ში ღილაკზე დაჭერით, digest — `data-arrangement-digest`-ში. ეს კომპონენტი ხელახლა გამოიყენება form (a)-ს preview-ში და form (c)-ის driver-ში.
- **ფაილები:** ახალი `app/components/arrangement/ArrangementCommandConsole.tsx` (barrel `index.ts`-ის გარეშე), `__tests__/command-console-ui.test.tsx`, `app/routes/studio-lab.tsx` (grant: provider-ის შიგნით პირობითი mount), doc. **გაყინულია:** `StudioWorkspace.tsx`, context, დაცული ფაილები.

| id | action | expected | verify |
|---|---|---|---|
| CON-DEFAULT | `/studio-lab` param-ის გარეშე, 1440/1280 | console არ არის; 0 changed px | C, browser |
| CON-PARITY | 17 command: fresh context-ში UI action და console-ით შესრულებული command | digest-ები ტოლია | C, browser (ორი context თითო command-ზე) |
| CON-UNDO | 3-ნაბიჯიანი plan → Apply → focus timeline-ზე → Ctrl+Z → Ctrl+Shift+Z | ≡ before / ≡ after; status `Undo: AI — …` | C, browser |
| CON-REJECT | გაფუჭებული JSON; უცნობი `type`; არასწორი ID | ჩანს შეცდომის ტექსტი; digest და history უცვლელია | C, browser |
| CON-KEYS | textarea-ში Space, Delete, Ctrl+Z | დაკვრა არ იწყება, არაფერი იშლება, arrangement-ის undo არ ხდება (`StudioWorkspace.tsx:1725`) | C, browser |
| CON-A11Y | label-ები, focus-ის რიგი, preview-ის სია, `role="status"` | axe-ზე 0 serious; Apply/Discard კლავიატურით მუშაობს | C + accessibility-auditor |
| CON-SSR | SSR `?console=1`-ით | hydration warning არ არის | vitest + C |
| CON-NET | Validate/Apply | 0 network request | C, browser |
| G-PROT | `/studio/middle-east`; `api.studio-token` | „Sign in required“; 401/403 როგორც ადრე | C (mock) |

- **რისკი:** layout-ის overlay workspace-ს ფარავს. ამიტომ console უნდა იყოს fixed და ჩაკეცვადი.
- **Default:** console მხოლოდ query param-ით ჩნდება, ტექსტი ინგლისურად (strings-ის პოლიტიკის მიხედვით). ხილვადობა param-ის გარეშე Saba-ს გადასაწყვეტია.

#### CMD-5 — Envelope, duplicate, ripple, `duck_range`
- **ფაილები:** `commands.ts` (grant), ახალი ტესტი, doc.
- **Row-ები:** envelope-ის parity `ArrangementClipEnvelope.tsx:171/305/341`-თან; `delete_time` vs `cutTimeSelection` (`:2029`, clipboard-ის გარეშე); `duck_range` −10 dB → წრფივი 0.316 ±0.001, 4 წერტილი, gain ≤1; ripple-ის preview-ში ჩანს გაფრთხილება „ყველა lane“.
- **რისკი:** ripple marker-ებსა და loop-ს გადაწევს (`model.ts:429-432`).

#### CMD-6 — `set_duck_under` (მხოლოდ SRW-44c C PASS-ის შემდეგ)
- **დამოკიდებულება:** PHASE2-VIDEO-SCORING და Saba-ს go. ამ რაუნდამდე „duck it under dialogue“ form (a)-ში იძლევა ახსნას და `duck_range` შემოთავაზებას, ავტომატურ ducking-ს არა.

**Checkpoint:** CMD-4-ის ან CMD-5-ის დასრულებისას root იძახებს frontend-architect-ს (`agent-workflow.md`, „არქიტექტურული checkpoint“). ეს რაუნდად არ ითვლება.

### (ii) Form (a) პროტოტიპი — loop-ის გარეთ (key და backend სჭირდება)

`phase-2-requirements.md:33`: „AI — ჯერ პროტოტიპი ლუპის გარეთ“.

| label | მიზანი | დამოკიდებულება | ფაილები (store-ის გარეთ, თუ არ არის აღნიშნული) |
|---|---|---|---|
| PA-0 | Eval set: 30 ინსტრუქცია (ka + en), 5 fixture arrangement, მოსალოდნელი digest ან დასაშვები ვარიანტების ნაკრები. ბიუჯეტის ზღვრები. მოდელების სია | Saba | `czaba-project/tools/studio-agent-eval/cases.json` (ახალი, ცალკე საქაღალდე) |
| PA-1 | **Offline eval Node-ში:** LLM API (`fetch`) + command core. თუ CMD-1/2 ჯერ არ არსებობს, store-ის `model.ts` read-only import-ით და throwaway adapter-ით | PA-0, local key | იგივე საქაღალდე. Store-ის `package.json` არ იცვლება |
| PA-2 | Endpoint spike, მხოლოდ localhost (§1.6) | G1 PASS | Remix `.server` route ცალკე branch-ზე ან .NET spike |
| PA-3 | In-Studio prompt-ის ველი → endpoint → tool loop → CMD-4-ის preview → Apply | CMD-4, PA-2 | ახალი პანელი (branch). Loop-ის გაყინულ ფაილებს არ ეხება |
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
- თუ G1 ვერ სრულდება: form (a) ჩერდება. CMD-1…4 მაინც ღირს, თუ (c)-ის ღირებულება დადასტურდება (§(iv)).

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
| MB-3 | Tab-ის bridge client: „გარე AI დაკავშირებულია“ + გათიშვა; ყველა plan გადის CMD-4-ის preview-ზე | MB-2, CMD-4 |
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
| (i) loop, command layer | 4 (CMD-1, 2, 3, 4) | 7 (2a/2b-ად გაყოფა, CMD-5, 1 fix-up) | +CMD-6 SRW-44-ის შემდეგ; loop-ის overhead (regression ~3 დღეში ერთხელ, RETRO ყოველ entry-ზე) +1–2 |
| (ii) form (a), loop-ის გარეთ | 3 (PA-1, PA-3, PA-4) | 5 (PA-1…PA-5; PA-0 კოდის გარეშე) | G1/G2 gate-ები |
| (iii) form (b) | 3 | 5 (MB-0…MB-4) | (a)-ს G2-ის შემდეგ |
| (iv) form (c) | 1 | 2 | CMD-4-ის შემდეგ |

**რეკომენდებული რიგი:**
1. **ახლა, loop-ის გარეთ, store-ის ცვლილების გარეშე:** PA-0 და PA-1 (offline eval). ეს ყველაზე იაფი ექსპერიმენტია და ძირითად კითხვას პასუხობს: დაგეგმავს თუ არა მოდელი სწორად. Loop არ ჩერდება.
2. Queue entry `STUDIO-AGENT-COMMANDS` (CMD-1…5) — approved (Saba, 2026-10-26), status `queued`; პოზიცია `loop/policy.local.md`-ის მიხედვით.
3. CMD-1…4 → VD-1/2 → PA-2…5 → CMD-5 → (SRW-44) CMD-6 → MB-0…4.

**Queue-ში პოზიცია (არაფერს ანაცვლებს):**
- **Default:** STUDIO-AGENT-COMMANDS **T12-ADVANCED-ის შემდეგ** ჩაემატება. თუ იმ დროისთვის PHASE2-VIDEO-SCORING-ს go ექნება, ჩაემატება **PHASE2-ის შემდეგ**.
- STORE-REDESIGN (in_progress, round 190 fix-up), REVIEW-RECOMMENDATIONS (22 item) და T12-ADVANCED უცვლელად რჩება.
- **არგუმენტი:** REVIEW-RECOMMENDATIONS და T12-ADVANCED model-ს ამატებს (crossfades, automation). CMD მათ შემდეგ დაიწყება და ახალ ფუნქციებს მცირე რაუნდებით დაფარავს, გადაწერის გარეშე.
- **ალტერნატივა Saba-სთვის:** CMD-1…4 STORE-REDESIGN-ის შემდეგ. ეს REVIEW-RECOMMENDATIONS-ს გადაწევს, ამიტომ მისი პირდაპირი გადაწყვეტილებაა საჭირო.

**ღია გადაწყვეტილებები Saba-სთვის (default-ით):**
1. Clamp თუ reject → `adjusted` შენიშვნა.
2. ერთი history entry მოთხოვნაზე → დიახ.
3. Console-ის ხილვადობა → მხოლოდ `?console=1`.
4. Bar/beat დრო v1-ში → არა (R6).
5. Production endpoint → .NET.
6. AI ნამდვილი მყიდველისთვის → R8-ის (SRW-21 purchased mount, დაცული route) გადაწყვეტამდე მხოლოდ `/studio-lab`.
7. „Duck under dialogue“ → SRW-44-მდე `duck_range` ხელით მითითებული მონაკვეთით.
