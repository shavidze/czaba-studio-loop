# Studio Lab — ექსპორტის გაუქმება ყველა ფაზაში, abort unmount-ზე, encoder-ის reset და resume-ის შეცდომა (SRW-20 ეტაპი 3b-1)

**თარიღი:** 2026-10-22
**სტატუსი:** Round 90 — C-ის შემოწმებას ელოდება (D-29z55)
**შეცვლილი პროექტი:** Store

## კონტექსტი

R20-X4 მოითხოვს, რომ 5 წუთიანი პროექტის ექსპორტისას UI არ გაიყინოს, პროგრესი ჩანდეს და ექსპორტის გაუქმება შეიძლებოდეს. ეტაპმა 3a-მ (doc 077) WAV-ის ჩაწერა worker-ში გადაიტანა და პროგრესი დაამატა. Cancel ეტაპ 3b-ში დარჩა. 3b ორ ნაწილად გაიყო, მოცულობის შემცირების გარეშე:

- **3b-1 (ეს რაუნდი):** Cancel ყველა ფაზაში; abort provider-ის unmount-ზე (A-R86-L2); encoder-ის reset ჩავარდნილი conversion-ის შემდეგ (A-R87-L5); gate-89-ის Medium GATE89-S1.
- **3b-2 (რაუნდი 91):** WAV + MP3-ის მიწოდების შენიშვნა (GATE86-S2), timeout-ის ტექსტი „გადატვირთე გვერდი“ (R87-L-TIMEOUT-RELOAD-TEXT) და GATE89-S2 (in-place clamp).

GATE89-S1: რენდერის suspend წერტილზე `ctx.resume()`-ის rejection `.catch(() => undefined)`-ით იყლაპებოდა. რენდერი შეჩერებული რჩებოდა, `startRendering()` აღარ სრულდებოდა და dialog სამუდამოდ ჩერდებოდა ფაზაში „რენდერი“, გათიშული „დახურვა“-თი.

A-R87-L5: `encode`-ის ჩავარდნის შემდეგ ffmpeg-ის instance cache-ში რჩებოდა, თუმცა მისი მდგომარეობა უცნობი იყო.

## მიდგომა

**ერთი run token — `AbortController`.** `exportWav` და `exportMp3` `rendering` მდგომარეობის ჩაწერისთანავე წინა controller-ს abort-ს უკეთებენ, ქმნიან ახალს და ინახავენ `exportAbortRef`-ში. მისი `signal` გადაეცემა renderer-ს, worker-ს, encoder-ის ჩატვირთვას და conversion-ს.

ყოველი `await`-ის შემდეგ, `catch` ბლოკების ჩათვლით, მოწმდება `signal.aborted`. გაუქმებული run ამის შემდეგ აღარც state-ს წერს და აღარც ფაილს ტვირთავს. ამიტომ:

- გაუქმება ყოველთვის იმარჯვებს გვიან მოსულ შეცდომაზე.
- შემოწმება დგას download-ის ციკლის წინ, ამიტომ WAV + MP3 ექსპორტი ორიდან ერთ ფაილს ვერასდროს მიაწვდის.
- `finally` პროგრესსა და ref-ს მხოლოდ მაშინ ასუფთავებს, თუ ref ისევ ამ run-ის controller-ია. გაუქმებული run ახალი ექსპორტის პროგრესს ვერ წაშლის.
- პროგრესის callback-ები გაუქმების შემდეგ store-ში აღარაფერს წერენ.

**`cancelExport()`.** ჯერ კითხულობს მიმდინარე პროგრესის ფაზას, შემდეგ აკეთებს abort-ს, ref-ს აბრუნებს `null`-ზე, ასუფთავებს პროგრესს და წერს `{ phase: 'cancelled', message }`-ს:

- ფაზა `load` ან `mp3` → `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.`
- სხვა ფაზაში → `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`

UI-ის მდგომარეობა მყისიერად იცვლება, მიუხედავად იმისა, თუ რამდენ ხანში ჩერდება ფონური სამუშაო.

**მექანიზმი ფაზების მიხედვით:**

| ფაზა | რა ხდება abort-ზე |
|---|---|
| render | renderer-ი suspend წერტილებს გეგმავს, თუ `onProgress` **ან** `signal` გადაცემულია. abort-ის შემდეგ შემდეგ წერტილზე `resume()` აღარ გამოიძახება: context შეჩერებული რჩება და იყრება. `startRendering()` abort-თან race-შია (`raceArrangementExportAbort`), ამიტომ promise მაშინვე `ArrangementExportCancelledError`-ით უარყოფილდება. თუ signal უკვე abort-ებულია, `OfflineAudioContext` საერთოდ არ იქმნება |
| wav | worker-ს უკეთდება `terminate()`, handler-ები იხსნება და promise უარყოფილდება. გვიან მოსული message არაფერს ცვლის. abort-ის listener ყველა საბოლოო გზაზე იხსნება. თუ signal უკვე abort-ებულია, Worker არ იქმნება. Worker-ის გარეშე fallback signal-ს encode-მდე ამოწმებს |
| load | ჩატვირთვა abort-თან race-შია, ამიტომ ჩამოკიდებული import ან CDN ექსპორტს აღარ აჩერებს. encoder-ის reset ზუსტად ერთხელ ხდება: თუ მოდული უკვე იმპორტირებულია, abort-ის მომენტში; თუ import abort-ის შემდეგ დასრულდა, მისი `.then` აკეთებს reset-ს და აბრუნებს `null`-ს (timeout-ის იგივე გზა). load-ის `catch` გაუქმების შემდეგ მეორედ აღარ აკეთებს reset-ს |
| mp3 | `encode` abort-თან race-შია. abort-ის listener encoder-ს reset-ს უკეთებს (ffmpeg worker-ის terminate). შემდეგი MP3 ექსპორტი core-ს თავიდან ჩამოტვირთავს |

MP3 ექსპორტის **render** ფაზაში გაუქმება encoder-ს არ ეხება. წინა ექსპორტიდან cache-ში შენახული encoder რჩება.

**Unmount (A-R86-L2).** provider-ის ცალკე `useEffect`-ის cleanup `exportAbortRef.current?.abort()`-ს იძახებს. იგი ცალკე effect-ია, რომ სხვა cleanup-ის dependency-ის ცვლილებამ მიმდინარე ექსპორტი შემთხვევით არ გააუქმოს. render, worker ან encoder ჩერდება, ფაილი არ იტვირთება და React state არ იწერება.

**GATE89-S1.** suspend-ის ჯაჭვი აღარ არის „fire-and-forget“. renderer ქმნის შიდა promise-ს, რომელიც უარყოფილდება, როცა რომელიმე `resume()` უარყოფილდება (სინქრონული throw-ის ჩათვლით). `startRendering()` ამ promise-თან race-შია, ამიტომ `renderArrangementWav` იმავე შეცდომით სრულდება და dialog შეცდომას აჩვენებს. `suspend()`-ის rejection ისევ იგნორირდება, როგორც ადრე.

**L5 (A-R87-L5).** თუ `encode` უარყოფილდება და ეს გაუქმება არ არის, ჯერ ხდება `resetArrangementMp3Encoder()`, შემდეგ იწერება conversion-ის ჩავარდნის უცვლელი შეტყობინება. შემდეგი MP3 ექსპორტი encoder-ს თავიდან ტვირთავს.

**Dialog.** რენდერის დროს ღილაკების რიგში, „დახურვა“-მდე, ჩნდება „გაუქმება“ (`data-testid="arrangement-export-cancel"`). კლასები ზუსტად „დახურვა“-ს კლასებია, ახალი ფერი არ დამატებულა. `cancelled` ფაზაში შეტყობინება `role="status"`-ია (არა `alert`) და `text-muted` კლასი აქვს.

- **Escape რენდერის დროს ექსპორტს არ აუქმებს.** ეს CZABA-ს შეგნებული კონტრაქტია: Escape და „დახურვა“ რენდერისას არაფერს აკეთებენ, აუქმებს მხოლოდ ცალსახა ღილაკი. ასე შემთხვევითი გაუქმება გამოირიცხება. ეს Ableton-ის ქცევაზე დაფუძნებული მტკიცება არ არის.
- საწყისი focus-ის effect უცვლელია: რენდერისას focus trap wrapper-ზე რჩება და Cancel-ზე არ გადადის. გაუქმების შემდეგ Cancel ქრება და არსებული effect focus-ს „დახურვა“-ზე გადაიტანს.
- რენდერის დროს Tab stop-ებია: [X], [ფორმატის ჯგუფი], [Cancel]. Tab Cancel-იდან X-ზე გადადის, Shift+Tab X-იდან ან wrapper-იდან კი Cancel-ზე. დანარჩენი გადასვლები native-ია. Tab handler-ი არ შეცვლილა; ბოლო stop ახლა Cancel-ია.

**ალტერნატივები.** განიხილებოდა `OfflineAudioContext`-ის სრული შეწყვეტა. ასეთი API არ არსებობს, ამიტომ შეჩერებული context-ის მიტოვება ერთადერთი სტანდარტული გზაა. Escape-ზე გაუქმებაც განიხილებოდა, მაგრამ B-მ შემთხვევითი გაუქმების გამო ცალსახა ღილაკი აირჩია.

## არქიტექტურა

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant D as ExportDialog
    participant C as ArrangementContext
    participant R as renderArrangementWav
    participant W as WAV worker
    participant E as MP3 encoder
    U->>D: Export
    D->>C: exportWav / exportMp3
    C->>C: წინა controller.abort(), ახალი controller → exportAbortRef
    C->>R: renderOptions { onProgress, signal }
    R->>R: suspend წერტილები; startRendering ⟂ abort ⟂ resume-ის შეცდომა
    R->>W: encode(channels, rate, onProgress, signal)
    C->>E: import + load ⟂ abort ⟂ 120 წმ; encode ⟂ abort
    U->>D: გაუქმება
    D->>C: cancelExport()
    C->>C: ფაზის წაკითხვა → abort → ref=null → პროგრესი null → phase 'cancelled'
    Note over R: შემდეგ suspend წერტილზე resume არ ხდება
    Note over W: terminate()
    Note over E: resetArrangementMp3Encoder() ერთხელ (load/mp3 ფაზაში)
    C--xD: ფაილი არ იტვირთება, გვიანი შედეგი იგნორირდება
```

## შეცვლილი ფაილები

| ფაილი | დანიშნულება |
|---|---|
| `app/lib/arrangement/export-cancel.ts` (ახალი) | გაუქმების შეტყობინებები, `ArrangementExportCancelledError`, `isArrangementExportCancelledError`, `raceArrangementExportAbort` |
| `app/lib/arrangement/graph.client.ts` | `ArrangementRenderOptions.signal`, suspend წერტილები signal-ით, resume-ის შეცდომის გავრცელება, startRendering-ის race, signal worker-ისთვის |
| `app/lib/arrangement/export-wav.client.ts` | worker-ის abort: terminate, listener-ის მოხსნა, Worker-ის არშექმნა უკვე abort-ებულ signal-ზე |
| `app/contexts/ArrangementContext.tsx` | ფაზა `cancelled`, `exportAbortRef`, `cancelExport`, abort-ის შემოწმება ყოველი `await`-ის შემდეგ, encoder-ის reset abort-ზე და L5-ზე, abort unmount-ზე |
| `app/components/arrangement/ArrangementExportDialog.tsx` | ღილაკი „გაუქმება“ მხოლოდ რენდერის დროს; `cancelled` სტატუსი `text-muted`-ით |
| `app/lib/arrangement/__tests__/export-cancel.test.ts` (ახალი) | EC1–EC4 |
| `app/lib/arrangement/__tests__/export-cancel-ui.test.tsx` (ახალი) | CU1–CU9 |
| `app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx` | TR1–TR5 ახალი Tab კონტრაქტით; TS1, TS2 და TR6 უცვლელია |

## პრობლემები და გადაწყვეტები

**პრობლემა:** OfflineAudioContext-ს შეწყვეტის API არ აქვს. **გადაწყვეტა:** abort-ის შემდეგ შემდეგ suspend წერტილზე `resume()` აღარ გამოიძახება და context იყრება. UI-ის მდგომარეობა მყისიერია, რადგან `startRendering()` abort-თან race-შია.

**პრობლემა (შეზღუდვა, რომელიც რჩება):**

- Cancel CPU-ს აჩერებს შემდეგ suspend წერტილზე. ეს რენდერის სიგრძის მაქსიმუმ 1/20-ია.
- სადაც `suspend` არ არსებობს (Firefox), რენდერი ფონზე ბოლომდე გრძელდება და შედეგი იყრება.
- ორივე შემთხვევაში UI-ის მდგომარეობა მყისიერია და ფაილი არ იქმნება.
- **ჰიპოთეზა, დაუდასტურებელი:** ათავისუფლებს თუ არა Chromium შეჩერებული და მიტოვებული `OfflineAudioContext`-ის render buffer-ს გვერდის დახურვამდე. ეს არ გაზომილა და ფაქტად არ ითვლება.

**პრობლემა:** encoder-ის reset ორჯერ შეიძლებოდა მომხდარიყო: abort-ის listener-ში და შემდეგ load-ის `catch`-ში, ან import-ის `.then`-ში. **გადაწყვეტა:** abort-ის listener reset-ს მხოლოდ მაშინ აკეთებს, თუ მოდული უკვე ჩატვირთულია. import-ის `.then` reset-ს მხოლოდ მაშინ აკეთებს, თუ abort მანამდე მოხდა. `catch`-ები გაუქმების შემდეგ არაფერს აკეთებენ. listener შეცდომის გზებზე და `finally`-ში იხსნება.

**პრობლემა:** worker-ის abort-ის შემდეგ გვიანი `complete` message-ს შეეძლო `terminate()`-ის მეორედ გამოძახება. **გადაწყვეტა:** abort-ზე worker-ის handler-ები `null`-ზე ბრუნდება.

**პრობლემა:** frozen TR1–TR4 round-89-ის ორ stop-იან კონტრაქტს ამოწმებდა (ფორმატის ჯგუფი იყო ბოლო stop). **გადაწყვეტა:** B-ის grant-ით TR1–TR5 შეიცვალა ახალი კონტრაქტით, სადაც ბოლო stop Cancel-ია.

## ტესტირება

- **Unit (EC1–EC4):** race-ის ქცევა და listener-ის მოხსნა; unhandled rejection-ის არარსებობა; რენდერის abort (context არ იქმნება, resume არ ხდება, Worker არ იქმნება); GATE89-S1 (resume-ის შეცდომა რენდერს `resume failed`-ით ასრულებს, suspend-ის შეცდომა — არა); worker-ის abort (terminate ერთხელ, გვიანი message იგნორირდება, 3-არგუმენტიანი გამოძახება უცვლელია).
- **Provider + dialog (CU1–CU9):** გაუქმება render, load (ჩამოკიდებული import და ჩამოკიდებული load), mp3 და WAV + MP3 ფაზებში; გაუქმების უპირატესობა გვიან შეცდომაზე; ახალი ექსპორტი გაუქმების შემდეგ; unmount; L5; კლავიატურა (Tab stop-ები, Escape არ აუქმებს, focus „დახურვა“-ზე).
- **Mutation proofs (a–l):** თითოეულმა მუტაციამ სიიდან მინიმუმ ერთი ტესტი გააწითლა. გაშვება მოხდა scratch ასლში. დეტალები: `tmp/studio-real-loop/a-round-90.md`.
- **Targeted vitest:** `a-round-90/targeted-list.txt`. typecheck, lint და Biome მფლობელობის ფაილებზე სუფთაა.
- **ბრაუზერში (A-ის smoke, არა C-ის მტკიცებულება):** 1280×720 და 1440×900. შედეგები ჩაწერილია `a-round-90.md`-ში.
- **ბრაუზერში მიუწვდომელია (მხოლოდ unit):** GATE89-S1, L5 და `suspend`-ის გარეშე fallback.

## TODO / შემდეგი ნაბიჯები

- C-ის შემოწმება რეალურ ბრაუზერში (CX-RENDER, CX-WAVPHASE, CX-LOAD, CX-MP3, CX-BOTH, CX-MP3-RENDER, CX-KEYS, TRAP-CANCEL, CX-ESC, CX-UNMOUNT).
- **3b-2 (რაუნდი 91):** WAV + MP3-ის მიწოდების შენიშვნა (GATE86-S2), timeout-ის ტექსტი (R87-L-TIMEOUT-RELOAD-TEXT) და in-place clamp (GATE89-S2).
- Ableton: Live 12 Manual §5.1.3.5 Cancel-ს ადასტურებს მხოლოდ real-time rendering-ისთვის („partially rendered file“ იშლება). offline render-ის Cancel დაუდასტურებელია; CZABA არ ამტკიცებს, რომ Live offline ექსპორტს ასევე აუქმებს.
- SRW-20-ის დასრულების შემდეგ frontend-architect-ის checkpoint q14 (export orchestration, dialog focus hook, export-cancel-ის ადგილი). ეს non-blocking სამუშაოა.
