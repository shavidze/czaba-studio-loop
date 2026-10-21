# Studio Lab — მეტრონომის კლიკები horizon-ით, loop-ის გარეშე (SRW-15, ROOT-R66-M1)

**თარიღი:** 2026-10-21
**სტატუსი:** Round 71 — D-29z36; C-ის შემოწმებას ელოდება
**შეცვლილი პროექტი:** Store

## კონტექსტი

- **ROOT-R66-M1 (Medium, perf; `gates/round-66/review.md` #1):** loop-ის გარეშე `startGraph` კლიკებს ერთბაშად გეგმავდა `from`-იდან პროექტის ბოლომდე, თითო კლიკზე ერთი `AudioBufferSourceNode`-ით.
- ყოველი resync ამ სიმრავლეს თავიდან ქმნიდა: Play, seek, schedule-key-ის ცვლილება, მეტრონომის ჩართვა/გამორთვა, ტემპის ცვლილება და scrub-ის reschedule ყოველ 100 ms-ში.
- გადამდგარი graph 250 ms ცოცხალი რჩება, ამიტომ scrub-ის დროს ერთდროულად დაახლოებით სამი graph არსებობს.
- მაგალითი: 133 წმ demo timeline 999 BPM-ზე → ~2200 click node თითო resync-ზე და ~22 000 scrub-ის ყოველ წამში.
- **FB-09 / D-29z31** უცვლელია: მეტრონომი მხოლოდ მოსმენისთვისაა და export-ში არ შედის.

## მიდგომა

**წესი D-29z36:** მომხმარებელი იგივეს ისმენს — კლიკი ყოველ დარტყმაზე, დაკვრის პოზიციიდან პროექტის ბოლომდე, იგივე ხმით, accent-ით და დროით. იცვლება მხოლოდ ის, **როდის** იქმნება source node-ები.

1. **`metronome.ts` (მხოლოდ დამატება):**
   - `METRONOME_SCHEDULE_HORIZON_SECONDS = 2` — იგივე მნიშვნელობა, რაც context-ის private `LOOP_SCHEDULE_HORIZON`. დამალულ tab-ში Chrome timer-ებს ~1 წმ-მდე ზღუდავს, ამიტომ 200 ms-იანი audio pump 2 წმ-იან horizon-ში თავისუფლად ეტევა.
   - `planMetronomeClicks`-ს აქვს არჩევითი მეოთხე პარამეტრი `soundUntil`. მის გარეშე შედეგი ბაიტ-ბაიტ იგივეა. მისი მითითებისას დარტყმების **არჩევა** არ იცვლება (`t ≥ from − EPS` და `t < until − EPS`), იცვლება მხოლოდ ხანგრძლივობა: `min(30 ms − offset, soundUntil − when)`. ასე chunk-ის საზღვრის წინ არჩეული კლიკი სრულ 30 ms-ს უკრავს და მხოლოდ პროექტის ბოლო ჭრის. არასასრული ან `until`-ზე ნაკლები `soundUntil` გამოტოვებულად ითვლება.
   - `MetronomeHorizonState` და pure `nextMetronomeChunk(state, now, horizon, lateMargin)`, რომელიც `refillLoopIterations`-ის ლოგიკას იმეორებს audio clock-ის დროში:
     - დასრულდა (`nextFrom ≥ end − EPS`) → `null`;
     - chunk-ის ctx დრო `now + horizon`-ზე გვიანაა → `null` (ჯერ ადრეა);
     - **late წესი:** თუ chunk-ის ctx დრო `now + lateMargin`-ზე ადრეა, დასაწყისი წინ გადაიწევს `now + lateMargin`-ის პოზიციაზე. გამოტოვებული კლიკები **იკარგება** და წარსულში არასოდეს იწყება (burst არ ჩნდება);
     - სხვა შემთხვევაში `{ from, until: min(end, from + horizon) }`.
2. **`ArrangementContext.tsx`:**
   - ახალი `metronomeHorizonRef`.
   - `startGraph` loop-ის გარეშე, ჩართული მეტრონომით, საწყის კლიკებს მხოლოდ 2 წმ-ით გეგმავს (`soundUntil` = პროექტის ბოლო) და state-ში იმავე `from`/`startAt`-ს წერს, რაც `applySchedule`-ს გადაეცა. სხვა შემთხვევაში (მეტრონომი გამორთულია ან loop აქტიურია) ref `null`-ია.
   - Loop-ის შტო უცვლელია: `planMetronomeClicks(bpm, from, loop.end)` სამი არგუმენტით და `fillLoopIterations`.
   - `fillMetronomeHorizon()` ყოველ მოსულ chunk-ს `handle.appendClicks`-ით ამატებს და `nextFrom`-ს წინ წევს. ის იძახება `startGraph`-ში `fillLoopIterations()`-ის შემდეგ და `pumpPlaybackAudio`-ში loop-ის late დამუშავების შემდეგ, `releaseRetiredGraphs`-მდე.
   - `stopGraph` ref-ს ასუფთავებს, ყოველი `startGraph` კი ცვლის (seek, scrub reschedule, ტემპი, toggle, edit resync). გადამდგარი handle კლიკებს აღარ იღებს.
   - ახალი timer, listener ან interval არ დამატებულა: pump უკვე მუშაობს rAF tick-იდან და 200 ms-იანი interval-იდან. `graph.client.ts` არ შეცვლილა.

**უარყოფილი ალტერნატივები:**

- **chunk-ის საზღვრების დარტყმებზე მიბმა.** მუშაობს მხოლოდ მაშინ, როცა კლიკი (30 ms) დარტყმაზე (999 BPM-ზე 60 ms) მოკლეა, და საზღვრის წესს floating-point არითმეტიკაში მალავს. `soundUntil`-ის ზღვარი ცხადი და ტესტირებადია.
- **late chunk-ზე resync, როგორც loop-ში.** ყველა კლიპს თავიდან მიაბამდა მხოლოდ კლიკების აღსადგენად. გამოტოვებული კლიკების დაკარგვა უმცირესი და პატიოსანი ქცევაა; კლიპები უცვლელია.
- **`createMetronomeBuffers`-ის provider-იდან გატანა** (reviewer Signal 1) — რჩება ARCH (f) სიგნალად.

**Ableton:** Live 12 Reference Manual §19.4 / §19.4.1 ადასტურებს მხოლოდ ხილულ ქცევას — მეტრონომი Play-ზე ყოველ დარტყმაზე ტიკტიკებს. კლიკების შიდა დაგეგმვა Live-ში უცნობია და აქ არ ეხება; არ ვამტკიცებთ, რომ Ableton იგივე ტექნიკას იყენებს.

## არქიტექტურა

```mermaid
sequenceDiagram
  participant P as Play / seek / resync
  participant SG as startGraph
  participant H as ScheduleHandle
  participant Pump as pumpPlaybackAudio (rAF + 200 ms)
  P->>SG: anchor (from, startAt)
  SG->>H: applySchedule(clicks [from, from+2))
  SG->>SG: metronomeHorizonRef = {bpm, from, startAt, end, nextFrom}
  loop ყოველ pump-ზე
    Pump->>Pump: nextMetronomeChunk(state, ctx.currentTime, 2, 0.02)
    Pump->>H: appendClicks(planMetronomeClicks(bpm, a, b, end), from, startAt)
  end
  Note over SG,Pump: stopGraph → ref = null; ყოველი startGraph ref-ს ცვლის
```

## შეცვლილი ფაილები

- `app/lib/arrangement/metronome.ts`: horizon-ის კონსტანტა, `soundUntil`, `MetronomeHorizonState`, `nextMetronomeChunk`. არსებული export-ები უცვლელია.
- `app/contexts/ArrangementContext.tsx`: import, ref, `startGraph`-ის non-loop შტო, `fillMetronomeHorizon`, ორი გამოძახება და `stopGraph`-ის reset.
- `app/lib/arrangement/__tests__/metronome-ui.test.tsx`: მხოლოდ UI2/UI4/UI5/UI10-ის მოლოდინები (§2.2a grant) და import.
- `app/lib/arrangement/__tests__/metronome-horizon.test.ts` (ახალი): MH1–MH5.
- `app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx` (ახალი): HU1–HU8.
- `docs/implementation/2026/quarter-IV/059-…`: სტატუსის ხაზი და ერთი წინადადება ამ დოკუმენტზე.
- `docs/implementation/2026/quarter-IV/062-…`: სტატუსის ხაზი.

## პრობლემები და გადაწყვეტები

- **MH3 სპეციფიკაციის ფორმით მუტაცია c-ს ვერ ხედავდა** (`soundUntil` იგნორირებული). 120 BPM-ზე `[0, 2)` chunk-ში 1.5-ის კლიკი ორივე შემთხვევაში 30 ms-ია. გადაწყვეტა: MH3-ს დაემატა საზღვარზე გადამავალი შემთხვევა — chunk `[0, 1.51)`, `soundUntil` 8 → 30 ms. ახლა c-ს MH2 და MH3 იჭერს. HU2/HU7 მას ვერ ხედავს, რადგან 120 BPM-ზე chunk-ის საზღვრები დარტყმებზე მოდის.
- **HU4-ში spy გვიან იყო დაყენებული** და უკვე დამატებულ chunk-ებს ვერ ხედავდა. გადაწყვეტა: `appendClicks`-ის spy ყოველ handle-ზე მისი შექმნისთანავე ყენდება (`applyScheduleMock.mock.results`).
- **Code review L1:** state-ში NaN-ის შემთხვევაში `nextMetronomeChunk` `{NaN, NaN}`-ს აბრუნებდა და refill-ის `for(;;)` ციკლი tab-ს გაყინავდა. გადაწყვეტა: ფუნქცია `null`-ს აბრუნებს, თუ `from`, `startAt`, `end` ან `nextFrom` სასრული არ არის; MH4-ს დაემატა NaN-ის შემოწმება.
- **მუტაცია h (ref არ სუფთავდება `stopGraph`-ში) ცოცხალი რჩება** — ექვივალენტური მუტანტია: `fillMetronomeHorizon` `handleRef.current === null`-ზე ჩერდება, `stopGraph` handle-ს ასუფთავებს და ყოველი `startGraph` state-ს გადაწერს შევსებამდე. ძველი state ვერსად გამოიყენება.

## ტესტირება

- **MH1–MH5** (pure): 3-არგუმენტიანი შედეგის იდენტურობა; chunk-ების invariant 7 BPM × 2 ბოლო × 5 საზღვრის ოჯახზე; `soundUntil`-ის ზღვარი; `nextMetronomeChunk`-ის literal-ები; შემთხვევითი audio clock (seed 71), სადაც კლიკი წარსულში არასოდეს იწყება და იკარგება მხოლოდ გამოტოვებული დარტყმები.
- **HU1–HU8** (workspace, jsdom, fake `setInterval`/`Date`): საწყისი 4 კლიკი; 120 დარტყმა ზუსტად ერთხელ 61 წმ-ში; seek; late pump (8.0/8.5/9.0 იკარგება, 9.5-იდან გრძელდება, resync არ ხდება); Stop და გამორთვა; ტემპის ცვლილება; პროექტის ბოლო (59.5-ის კლიკი 30 ms); 999 BPM-ზე 20 seek → თითო graph ≤ 35 კლიკი.
- **Red run** (წყაროს ცვლილებამდე): 13 ჩავარდა / 64 გავიდა; frozen `metronome.test.ts`, `graph.test.ts`, `loop.test.ts` მწვანეა.
- **მუტაციები a–l** (`tmp/studio-real-loop/a-round-71/mutations.txt`): h-ის გარდა ყველა დაიჭირეს (h ექვივალენტურია). C-ის დამატებითი m დაიჭირეს; n (late margin 0) და o (`soundUntil` loop-ის შტოში) ცოცხალი დარჩა და ტესტების ხარვეზად ჩაიწერა.
- **Gates:** `tsc` 0; vitest 101 ფაილი / 1696 ტესტი; `npm run build` rc 0; Biome შეცვლილ ფაილებში 0 დიაგნოსტიკა. `npm run verify` სამივე მცდელობაზე ჩავარდა. პირველ ორზე მიზეზი დატვირთულ მანქანაზე სხვა ფაილების timeout-ები იყო (`pan-release-recovery`, `meter-ui`, UI5); ეს ფაილები ცალკე მწვანეა. მესამეზე ჩავარდა რეალურ დროზე დამოკიდებული `render-budget` R9-L2 (Play-ის შემდეგ პოზიცია 0.015 იყო 0-ის ნაცვლად). ეს ტესტი მეტრონომს არ რთავს; საბოლოო ხეზე 8 გაშვებიდან 1-ში ჩავარდა, baseline-ზე 5-დან 0-ში. ღია საკითხია C/root-ისთვის; საბოლოო verify root-ის gate-ია.
- **ბრაუზერის smoke** (A, PASS არ არის): `/studio-lab`, 1440×900, Soft impact 20 წმ-ზე, BPM 40, მეტრონომი ჩართული, Space. 6 წმ-ში master meter-მა 5-ჯერ აიწია (~1.5 წმ-ში ერთხელ), `createBufferSource` +0.5 წმ-ზე 4 იყო, +5 წმ-ზე 8.

## TODO / შემდეგი ნაბიჯები

- C-ის ბრაუზერის შემოწმება: MT-BEATS, MH-LONG, MH-END, MT-SEEK, MT-TEMPO-CHANGE, MT-LIVE-TOGGLE, MH-SCRUB, MH-NODES, MH-SCRUB-PERF და რეგრესიები (MT-LOOP, MT-EXPORT-REG, MT-OFF, REG-HYD).
- დამალულ tab-ში late pump ბრაუზერში არ შემოწმებულა; წესს HU4, MH4 და MH5 ფარავს.
- **ARCH (f):** `createMetronomeBuffers`-ის provider-იდან გატანა — სიგნალი B-სთვის, არა ამ რაუნდის სამუშაო.
- ტესტების ხარვეზები n და o — შესაძლო მომავალი გამაგრება.
