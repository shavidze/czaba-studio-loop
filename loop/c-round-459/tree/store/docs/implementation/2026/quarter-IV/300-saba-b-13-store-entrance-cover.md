# SABA-B-13: Store-ის შესასვლელი პირველივე კადრიდან შავია და სრულად თამაშობს

**თარიღი:** 2026-11-12
**სტატუსი:** Completed (C round 459 PASS)
**შეცვლილი პროექტი:** Store (`app/components/loading/EntranceCover.tsx`, `app/components/loading/SpotlightLoader.tsx`, `app/root.tsx`, `app/lib/__tests__/store-entrance-loader.test.tsx`)

## კონტექსტი

- Saba-მ (2026-11-11) შენიშნა, რომ Store-ის შესასვლელი ანიმაცია hard refresh-ზეც (Ctrl+F5, ცარიელი cache) ძალიან სწრაფად სრულდება: „ციმციმებს“ და ბოლომდე არ თამაშობს. მან მოითხოვა მინიმალური ჩვენების დრო (1.2–1.5 წმ). ეს Medium-ია, რადგან Saba-მ თავად დაინახა (bug gate 2026-10-23).
- B-მ HEAD `891dc0f` გაზომა production build-ზე, რეალურ Chromium-ში, mock API-ით (`b-round-458/probe/frames.mjs`, `entrance-timing.mjs`):
  - **პრობლემა paint-ის თანმიმდევრობაა და არა მხოლოდ სიგრძე.** გვერდი ჯერ იხატება, შავი overlay კი hydration-ის შემდეგ ჩნდება: 1× CPU-ზე 140–170 ms-ით, 4× CPU-ზე 330–380 ms-ით გვიან. პირველი დახატული კადრის luminance 13.4-ია (გვერდის ფონი და header).
  - K12 (HEAD `fresh`): 1440/cpu1 fp 200, firstCov 260, logo 433, tag 166; 1440/cpu4 fp 244, firstCov 603, logo 446, tag 138; 1280/cpu1 fp 208, firstCov 263, logo 433, tag 166; 1280/cpu4 fp 148, firstCov 689, logo 438, tag 172.
  - overlay ჩანს დაახლოებით 1.16–1.21 წმ. ლოგო სრულად ჩანს 433–446 ms, ტექსტი „Cinematic Sound Design“ — მხოლოდ 138–172 ms.
  - timeline timer-ზე იყო დამოკიდებული (`SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150`), tab-ზე ერთხელ თამაშობდა (`czaba_entrance_seen`), `EntranceCover` მოდული არ არსებობდა.
- Route-ის შიგნით ფარდა ვერ იმუშავებდა: route content `PageTransition`-შია, რომელიც სერვერზე `opacity: 0`-ით რენდერდება. B-ის პირველმა route-local ესკიზმა header მაინც ~45 ms-ით აჩვენა ფარდამდე.

## მიდგომა

- **ფარდა `<head>`-შია.** `EntranceCoverHead` რენდერავს `<style media="not all">`-ს (`body::before` შავი ფენა, z-index 60) და პატარა boot script-ს. script პირველ paint-მდე ეშვება: მხოლოდ `/`-ზე, reduced motion-ის გარეშე და tab-ზე ერთხელ (`sessionGate`) რთავს ფარდას (`media='all'`), წერს `data-start`-ს (`performance.now()`) და ამატებს capture keydown/click skip listener-ებს.
- **Hydration-ის შემდეგ** `SpotlightLoader`-ის `claimEntranceStart` ცოცხალი ფარდის start-ს იღებს და timer-ებს აბსოლუტური start-იდან აწყობს. 1000 ms-ის შემდეგ ან start-ის გარეშე ფარდას `expired`-ად აუქმებს. ფარდის გარეშე HEAD-ის session claim-ზე გადადის. React-ის skip listener-ები ჯერ ემატება, შემდეგ ან მოლოდინში მყოფ `skipped`-ს პატივს სცემს, ან ფარდას თიშავს (`live`) და `czaba-entrance-takeover` event-ს აგზავნის, რომელიც boot listener-ებს შლის.
- **Clock:** start არის boot script-ის `performance.now()`. C ხანგრძლივობას პირველი დაფარული rAF sample-იდან ზომავს. მინიმუმი 1450 ms (`ENTRANCE_MIN_TOTAL_MS`), კოდის ზედა ზღვარი 1900 ms (`ENTRANCE_MAX_TOTAL_MS`), exit fade 250 ms.
- **Failsafe:** თუ JS ნელია ან დაბლოკილი, შავი ფარდა მხოლოდ CSS-ით ქრება 1.0 წმ-ის შემდეგ, 250 ms fade-ით. გვიანი hydration ანიმაციას აღარ იმეორებს.
- **Skip:** Esc, Tab (focus მაინც გადადის) ან click ნებისმიერ დროს, hydration-მდეც. ფარდაზე click ქვემოთ მდებარე გვერდს არ აღწევს (ეს მხოლოდ ბრაუზერში მოწმდება, C-ის C9 რიგით; jsdom ვერ ამოწმებს).
- **Reload და reduced motion:** იმავე tab-ში reload-ზე (Ctrl+F5-ის ჩათვლით) და reduced motion-ზე შავი კადრი საერთოდ არ ჩანს; tab-ზე ერთხელ რჩება (SABA-Q-ENTRANCE-RELOAD default (a)).
- **`app/root.tsx`-ის narrow grant:** `root.tsx` global_forbidden-ია, მაგრამ ფარდა `<head>`-ში უნდა იყოს. ამიტომ ზუსტად 2 ხაზი დაემატა: `EntranceCoverHead`-ის import და `<EntranceCoverHead />` პირდაპირ `<Links />`-ის შემდეგ. სხვა არაფერი შეცვლილა (precedent: round 201, D-29z166; `tech-lead`-მა დაადასტურა, რომ ეს უმცირესი არჩევანია).
- **Tailwind-ის გამონაკლისი:** `ENTRANCE_COVER_CSS` string-ია, რადგან hydration-მდე `body::before` React-ის node-ზე utility class ვერ იქნება, ხოლო `app/styles/**` grant-ში არ შედის. ფერი theme ცვლადია (`var(--color-black)`), რომელიც გამოიცემა, რადგან `SpotlightLoader` `bg-black`-ს იყენებს. Biome-ს 2 ახალი `noDangerouslySetInnerHtml` warning აქვს (სტატიკური string-ები, user input არ არის); lint 205-დან 207 warning-მდე.
- **Reference — Android 12+ SplashScreen** (`https://developer.android.com/develop/ui/views/launch/splash-screen`, წაკითხულია 2026-11-12): ფარდა გაუმჭვირვალე ერთ ფერია პირველივე კადრიდან; მოძრაობა ადვილად გამოსატოვებელია; დარჩენილი დრო ანიმაციის start-იდან ითვლება; დაუმთავრებელი ინტერფეისი არ ჩანს. **გადახრა:** Android ხატულის ანიმაციისთვის გვირჩევს „not exceeding 1,000 ms“, ჩვენთან მინიმუმი 1.45 წმ-ია — Saba-ს გადაწყვეტილება (2026-11-11) perceived value-ისთვის.
- **უარყოფილი ალტერნატივები** (`product-designer`): hydration-იდან დაწყებული clock (მომხმარებელი პირველი paint-იდან შავს ხედავს) და სტატიკური wordmark ფარდაზე hydration-მდე (ლოგო ორჯერ გამოჩნდებოდა; ვიზუალის ცვლილება Saba-ს სჭირდება).
- ანიმაციის იერი უცვლელია, გარდა იმისა, რომ ფაზები გრძელია და `dark` ფაზა აღარ არის (სტატიკური ფარდა თავადაა dark ფაზა). ტექსტი, პოზიციები და keep-list არ შეცვლილა.

## არქიტექტურა

```mermaid
sequenceDiagram
  participant B as Browser
  participant H as head: style + boot script
  participant R as React (SpotlightLoader)
  B->>H: HTML parse (paint-მდე)
  H->>H: path "/" + no reduced motion + sessionGate
  H->>B: media='all', data-start=performance.now()
  B->>B: პირველი კადრი შავია (body::before, z-60)
  alt hydration < 1000 ms
    R->>H: claimEntranceStart → start
    R->>H: ფარდა off (live) + takeover event
    R->>B: overlay timeline start-იდან (1450 ms, ≤ 1900 ms)
  else JS ნელი / დაბლოკილი
    H->>B: CSS failsafe: 1000 ms + 250 ms fade
    R->>H: გვიანი claim → expired, replay არა
  end
  B->>H: Esc / Tab / click hydration-მდე → skipped
```

## შეცვლილი ფაილები

- `app/components/loading/EntranceCover.tsx` (ახალი) — ფარდის კონსტანტები, `ENTRANCE_COVER_CSS`, `ENTRANCE_BOOT_SCRIPT` და `EntranceCoverHead`.
- `app/components/loading/SpotlightLoader.tsx` — `entranceTimeline` (phase-ების სუფთა მათემატიკა), `claimEntranceStart` და start-იდან დაწყობილი timer-ები; `dark` ფაზა მოიხსნა.
- `app/root.tsx` — 2 ხაზი (import და `<EntranceCoverHead />` `<Links />`-ის შემდეგ).
- `app/lib/__tests__/store-entrance-loader.test.tsx` — L1–L11 (L3 1450/1900-ზე, L1 console spy, L9 დამატებითი `TOTAL` ნაბიჯი) და ახალი describe „SABA-B-13 static head cover and takeover“.
- `docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md` — ეს დოკუმენტი.

## პრობლემები და გადაწყვეტები

- **პრობლემა:** overlay hydration-ის შემდეგ ჩნდებოდა, ამიტომ პირველი კადრი გვერდს აჩვენებდა. **გადაწყვეტა:** სტატიკური ფარდა `<head>`-ში, რომელიც paint-მდე ირთვება.
- **პრობლემა:** route-ის შიგნით ფარდა `PageTransition`-ის `opacity: 0`-ის ქვეშ უჩინარი იყო, body-ში ჩასმული script-ი კი header-ს ~45 ms-ით აჩვენებდა. **გადაწყვეტა:** root-ის narrow grant (2 ხაზი).
- **პრობლემა:** mount-ზე დაფუძნებული timer ხანგრძლივობას hydration-ის გვიანობით ამოკლებდა. **გადაწყვეტა:** timer-ები ფარდის `data-start`-იდან ითვლება.
- **პრობლემა:** თუ boot script-მა ფარდა ჩართო, მაგრამ bundle ნელია ან ვერ ჩაიტვირთა, ფარდა სამუდამოდ დარჩებოდა (JS-ის სრულად გამორთვისას boot script ფარდას საერთოდ არ რთავს). **გადაწყვეტა:** მხოლოდ CSS failsafe 1000 ms-ზე; React-ის გვიანი claim ფარდას `expired`-ად აუქმებს და ანიმაციას არ იმეორებს.

### Why we missed it

STORE-1d-ის (doc 156, spec D10) რიგები jsdom-ის timer-ებით, mount-იდან იზომებოდა („at most 1200 ms“) და ბრაუზერში მხოლოდ overlay-ის გამოჩენა მოწმდებოდა. არცერთი რიგი არ უყურებდა, რას აჩვენებს production build-ის პირველი დახატული კადრები; D10-მა სიგრძეს ზედა ზღვარი დაუწესა და არა მინიმუმი. წესი: L18-ს დაემატა „first painted frame“ პუნქტი — ნებისმიერი timed entrance, splash ან overlay იზომება production build-ის პირველი დახატული კადრიდან, frame მტკიცებულებით 1× და 4× CPU-ზე.

## ტესტირება

- `app/lib/__tests__/store-entrance-loader.test.tsx`:
  - L1–L11 — არსებული ქცევა; L3 ახლა ამოწმებს 1450 ms მინიმუმს და 1900 ms ზღვარს.
  - E1 — სერვერი რენდერავს გამორთულ cover style-ს და boot script-ს.
  - E2 — ახალ tab-ზე `/`-ზე boot script რთავს ფარდას და session-ს იჭერს.
  - E3 (`it.each`) — seen tab, reduced motion და სხვა path ფარდას არ რთავს.
  - E4 — დაბლოკილი storage ფარდას გამორთულს ტოვებს და არ აგდებს.
  - E5 — animated overlay მართვას იღებს და ფარდას თიშავს (overlay ჯერ commit-დება, ფარდა passive effect-ში ითიშება).
  - E6 — timeline პირველი cover კადრიდან ითვლება: 1450 ms მინიმუმი, 1900 ms ზღვარი.
  - E7 — failsafe-ის შემდეგ takeover ანიმაციას არ იმეორებს.
  - E8 (`it.each`) — Escape, Tab და click hydration-მდე გამოტოვებს; E8b — სხვა კლავიშები ფარდას ტოვებს.
  - E9 — takeover-ის შემდეგ boot listener-ები აღარ არის და skip-ს overlay ფლობს.
  - E10 — უკვე ნანახი entrance-ის შემდეგ client navigation `/`-ზე არაფერს აჩვენებს.
  - E11 — root layout ფარდას stylesheet link-ების შემდეგ რენდერავს.
  - E12 — ახალ tab-ზე client navigation `/`-ზე მაინც თამაშობს, როგორც HEAD-ზე.
  - E13 — start-ის გარეშე ჩართული ფარდა უქმდება და არ ანიმირდება.
  - E14 — click claim-სა და hand-off-ს შორის animated overlay-საც გამოტოვებს.
- covering set (`b-round-458/covering-459.txt`), mutants (`b-round-458/mutants.py`, M1–M19 წითელი) და A-ს production-ის frame probe — იხ. `a-round-459.md`. C-ის ბრაუზერის მატრიცა (C5–C12) — `c-round-459`.
- **არ ტესტდება cloud-ში:** Firefox და Safari (`body::before` + `media` toggle, WebKit-ის first-paint timing). Tech Lead-ის რიგი TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465.
- Saba-ს შემოწმება საჭიროებს **ახალ tab-ს** (იმავე tab-ში reload ანიმაციას არ აჩვენებს).

## TODO / შემდეგი ნაბიჯები

- Saba-ს კითხვები (`user-review/questions-saba-b-13.md`; პასუხამდე default):
  - SABA-Q-ENTRANCE-RELOAD — default (a): tab-ზე ერთხელ.
  - SABA-Q-ENTRANCE-WORDMARK — default: სტატიკური wordmark არა.
  - SABA-Q-ENTRANCE-ARRIVE — default: in-app ნავიგაციით `/`-ზე მისვლისას თამაშობს, როგორც HEAD-ზე.
  - SABA-Q-ENTRANCE-HERO — default: hero-ს ანიმაციები ისე რჩება.
- TLM-R459-FIREFOX-SAFARI-ENTRANCE — Firefox/Safari-ის ხელით შემოწმება.
- `SpotlightLoader`-ის inline `'#000'` უცვლელია (owner: 2b-3d / STORE-5).
