# აგენტები — ქართული აღწერა

**განახლდა:** 2026-10-30. **სტატუსი:** მოქმედი.

აგენტების ფაილები (`.claude/agents/*.md`) ინგლისურადაა: ინგლისური ინსტრუქცია ნაკლებ token-ს ხარჯავს და Claude მას უფრო ზუსტად მისდევს. მომხმარებელს აგენტები მისსავე ენაზე პასუხობენ, ხოლო repo-ში ჩაწერილი დოკუმენტები (ანგარიშები, spec-ები, ბაგები) ქართულად რჩება, პროექტის წესის მიხედვით.

ეს ფაილი Saba-სთვისაა: რომელი აგენტი რას აკეთებს. **როცა აგენტი იქმნება ან იცვლება, ეს ფაილიც განახლდეს** (და `.codex/agents/*.toml` სარკე, `npm run agents:check`).

## ვინ იძახებს loop-ში

| Loop-ის როლი | კონსულტანტი აგენტები |
|---|---|
| planner (B) | `product-designer`, `tech-lead`, `product-manager`, `design-philosopher`, `flow-sage`, `first-visit-host`, `consequence-tester`, `performance-optimizer`, `ableton-arrangement-expert`, `docs-explorer` |
| implementer (A) | `code-reviewer` |
| verifier (C) | `accessibility-auditor`, `code-reviewer`, `design-auditor`, `ableton-arrangement-expert`, `studio-specialist`, `performance-optimizer`, `design-philosopher`, `flow-sage`, `first-visit-host`, `docs-explorer`, `product-designer` |

სხვა აგენტებს (qa-engineer, analytics-tracker, feature-planner, frontend-architect, relational-architect, polyphony-conductor) ხელით იძახებ, ან ისინი კონკრეტულ პროცესში მონაწილეობენ (მაგ. ფილოსოფიური review, `.claude/compositions/philosophy-review.md`).

## დიზაინი და UX

### product-designer
- **რას აკეთებს:** წყვეტს, როგორ უნდა იმუშაოს ფუნქციამ მომხმარებლისთვის: ქცევა, ინტერაქცია, რა ჩანს ეკრანზე და რა არა, მდგომარეობები, ტექსტი და acceptance row-ები. როცა სხვა დიზაინ-აგენტები ერთმანეთს ეწინააღმდეგებიან, ერთ არჩევანს აკეთებს და ასახელებს, რას თმობს.
- **როდის გამოიყენება:** ყოველი ახალი ხილული ფუნქციის დაგეგმვამდე (B), შემოწმებისას (C) და რეტროსპექტივის ეკრანის review-ზე.
- **ცვლის თუ არა კოდს:** არა.
- **ძირითადი წყაროები/ფოკუსი:** Julie Zhuo-ს სამი კითხვა, Don Norman, Shneiderman (direct manipulation), Calm Technology, Dieter Rams, Laws of UX, Nielsen-ის ევრისტიკები; Ableton-ის გაზომვები და loop-ის წესები.

### design-philosopher
- **რას აკეთებს:** დიზაინ და UX გადაწყვეტილებებს აფასებს Perceived Value Theory-ისა და არნოს Star Brand ჩარჩოს (7 ლინზა) მიხედვით და კონკრეტულ რეკომენდაციებს იძლევა წონიანი შეფასების ცხრილით.
- **როდის გამოიყენება:** როცა საჭიროა დიზაინერული გადაწყვეტილება, UX რჩევა, პრემიუმ პოზიციონირება ან ბრენდის შესაბამისობის შემოწმება.
- **ცვლის თუ არა კოდს:** არა (Read, Glob, Grep).
- **ძირითადი წყაროები/ფოკუსი:**
  - `docs/design/design-philosophy.md`, `brand-vision.md`, `DESIGN_SYSTEM.md`, `style-guide.md`
  - `.claude/primitives/DESIGN_TOKENS.md`
  - Quiet Luxury, Ritual/micro-interactions, Craftsmanship, Desire Gap

### design-auditor
- **რას აკეთებს:** კომპონენტს ან გვერდს ამოწმებს design system-თან შესაბამისობაზე 7 კატეგორიით (ფერები, spacing, typography, border/radius, animation, loading states, premium alignment) და თითო დარღვევაზე კონკრეტულ fix-ს იძლევა (ძველი → ახალი).
- **როდის გამოიყენება:** როცა გინდა დიზაინის, token compliance-ის ან visual QA-ის შემოწმება.
- **ცვლის თუ არა კოდს:** არა
- **ძირითადი წყაროები/ფოკუსი:**
  - `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `SKELETON_LOADING.md`
  - hardcoded ფერები, arbitrary values, inline styles (Grep-ით)
  - Severity: Critical / Warning / Info, weighted score X/10

### accessibility-auditor
- **რას აკეთებს:** კომპონენტებს და გვერდებს ამოწმებს WCAG 2.1 AA-ზე: color contrast, keyboard navigation, screen reader, semantic HTML, focus management, ARIA. განსაკუთრებით Studio controls, Audio Player და Modals.
- **როდის გამოიყენება:** როცა კომპონენტის ან გვერდის accessibility-ის შემოწმება გინდა.
- **ცვლის თუ არა კოდს:** არა
- **ძირითადი წყაროები/ფოკუსი:**
  - `FORWARDREF_COMPONENT.md`, `references/accessibility-patterns.md`
  - WebSearch (WCAG წესებისთვის)
  - ჯერ keyboard navigation და ARIA attributes; შეფასება X/10

## Studio და Ableton

### ableton-arrangement-expert
- **რას აკეთებს:** CZABA Studio-ს workspace პროტოტიპს დამოუკიდებლად აფასებს Ableton Live 12-ის Arrangement View-ის წყაროებით დადასტურებულ workflow-სთან შედარებით. ბრაუზერში რეალურ ინტერაქციას ამოწმებს, screenshot-ებს იღებს და §7 ფუნქციური მატრიცის თითოეულ ID-ს და R1–R10 კრიტერიუმებს ქულას აძლევს.
- **როდის გამოიყენება:** როცა Studio-ს პროტოტიპი (layout, clip move/select/trim, selected-range-ის ხილვადობა, loop, ნავიგაცია, ვიდეო) Ableton-ს უნდა შევადაროთ.
- **ცვლის თუ არა კოდს:** არა (Read, Glob, Grep, Bash; ფაილებს მხოლოდ `tmp/ableton-arrangement-expert/`-ში ქმნის).
- **ძირითადი წყაროები/ფოკუსი:**
  - `docs/technical/ableton-live-current-workflow.md` (§7 მატრიცა, §8 შეუსაბამობები)
  - Ableton-ის საცნობარო კადრები `tmp/ableton-current-training/`-დან
  - `docs/studio-ableton-review-loop.md` (R1–R10, წინა ქულები)
  - `docs/design/DESIGN_SYSTEM.md`, CZABA-ს ტოკენები
  - Selected-range-ის ხილვადობა 1440×900 და 1280×720-ზე

### studio-specialist

- **რას აკეთებს:** Personal Mixdown Studio-ს ექსპერტია — Web Audio API, WaveSurfer.js, stems mixing, Solo/Mute, loop, export (OfflineAudioContext) და FFmpeg.wasm MP3 conversion. ეხმარება debugging-ში, ახალ features-ში, optimization-სა და refactoring-ში.
- **როდის გამოიყენება:** Studio-სთან დაკავშირებულ ნებისმიერ საკითხზე (playback, waveform, stems, export).
- **ცვლის თუ არა კოდს:** არა — Edit/Write არ აქვს, მაგრამ აქვს Bash.
- **ძირითადი წყაროები/ფოკუსი:**
  - `app/contexts/StudioContext.tsx`, `app/components/studio/*`, `routes/studio.$productId.tsx`, `lib/audio-cache.ts`
  - ცნობილი პრობლემები: stale closure, suspended AudioContext, `arrayBuffer.slice(0)`, OfflineAudioContext length (samples)
  - Primitive: `AUDIO_ARCHITECTURE.md`
  - Skills: `web-audio-api`, `wavesurfer-js`, `ffmpeg-wasm`

## პროდუქტი და დაგეგმვა

### product-manager
- **რას აკეთებს:** პასუხობს კითხვას "რა უნდა ავაშენოთ და რატომ" — წერს user stories-ს, აანალიზებს feature request-ებს და პრიორიტეტებს RICE-ით და Impact/Effort მატრიცით ადგენს.
- **როდის გამოიყენება:** როცა საჭიროა გადაწყვეტა რა და რატომ გაკეთდეს, მომხმარებლის პერსპექტივა ან roadmap-ის დაგეგმვა.
- **ცვლის თუ არა კოდს:** არა (Read, Glob, Grep).
- **ძირითადი წყაროები/ფოკუსი:**
  - `docs/future-features/`, `docs/IDEAS.md`, `docs/design/brand-vision.md`
  - სამიზნე აუდიტორიის სეგმენტები და Personal Mixdown Studio, როგორც UVP
  - Roadmap თემები (Studio UX, Checkout Flow — P0)

### feature-planner
- **რას აკეთებს:** ახალ feature-ებს გეგმავს (specification ფაილს template-ით ქმნის), backlog-ს მართავს და არსებული feature-ისთვის implementation plan-ს ადგენს, სტატუსის განახლებით.
- **როდის გამოიყენება:** როცა ახალი ფუნქციონალის დაგეგმვა, არსებულის იმპლემენტაცია ან backlog-ის მიმოხილვა გინდა.
- **ცვლის თუ არა კოდს:** კი (Write — ქმნის/ანახლებს spec ფაილებს და `README.md`-ს `docs/future-features/`-ში).
- **ძირითადი წყაროები/ფოკუსი:**
  - `docs/future-features/` (README.md backlog ცხრილი, spec ფაილები)
  - პრიორიტეტები (მაღალი/საშუალო/დაბალი) და სტატუსები
  - Tech stack კონტექსტი (Remix, Tailwind v4, Web Audio API)

### tech-lead
- **რას აკეთებს:** პასუხობს კითხვას "როგორ?" — არქიტექტურული არჩევანი, refactoring-ის გადაწყვეტილება, technical debt-ის პრიორიტეტი. Decision Framework-ით ადარებს ვარიანტებს (pros/cons/effort) და იძლევა რეკომენდაციას.
- **როდის გამოიყენება:** როცა არქიტექტურული ან refactoring გადაწყვეტილება გჭირდება.
- **ცვლის თუ არა კოდს:** არა (Edit/Write არ აქვს, მაგრამ აქვს Bash)
- **ძირითადი წყაროები/ფოკუსი:**
  - `AUDIO_ARCHITECTURE.md`, `ERROR_TAXONOMY.md`, `SECURITY_AUDIT.md`, `TESTING_QUALITY_GATES.md`
  - `docs/technical/architecture/`, `docs/technical/overview.md`, `.claude/references/architecture-checkpoint.md`
  - Separation of concerns, state management rules, bundle < 200KB

### frontend-architect
- **რას აკეთებს:** CZABA Store-ისა და Studio-ს frontend არქიტექტურის დამოუკიდებელ, მტკიცებულებებზე დაფუძნებულ აუდიტს ატარებს და კომპონენტების საზღვრებს გეგმავს. თითო შენიშვნას ფაილს/ხაზს, სიმძიმეს, მინიმალურ ცვლილებას და შემოწმების გზას ურთავს.
- **როდის გამოიყენება:** არქიტექტურულ აუდიტზე ან checkpoint-ზე — feature/ეტაპის საზღვარზე, დაგროვილ სიგნალებზე ან planner/root-ის მოთხოვნით.
- **ცვლის თუ არა კოდს:** არა — აპლიკაციის კოდს არ ცვლის; Write აქვს, მაგრამ მხოლოდ გამომძახებლის მიერ დასახელებული ერთი ანგარიშის ფაილისთვის.
- **ძირითადი წყაროები/ფოკუსი:**
  - root/store ინსტრუქციები და შესაბამისი primitives
  - `.claude/references/architecture-checkpoint.md`
  - module საზღვრები, state-ის მფლობელობა, rendering, audio engine/UI გამიჯვნა, SSR, accessibility, testability

## ხარისხი და სისწრაფე

### code-reviewer
- **რას აკეთებს:** diff-ის review-ს აკეთებს TypeScript, React/Remix patterns, security, performance და CZABA-ს წესების (Service Layer, design system, Tailwind-first) მიხედვით. კრიტიკულ ლოგიკაზე (auth, checkout, Studio audio) ადარებს მინიმუმ 2 მიდგომას და ნიშნავს architecture risk signal-ებს planner-ისთვის.
- **როდის გამოიყენება:** როცა კოდის ხარისხის, უსაფრთხოების ან best practices-ის შემოწმება გჭირდება.
- **ცვლის თუ არა კოდს:** არა
- **ძირითადი წყაროები/ფოკუსი:**
  - `.claude/primitives/SECURITY_AUDIT.md`, `.claude/primitives/ERROR_TAXONOMY.md`
  - `.claude/references/architecture-checkpoint.md`
  - output: Critical Issues, Suggestions, Architecture note, Alternative Approach, Score X/10

### qa-engineer
- **რას აკეთებს:** აგრესიული bug hunter — კოდბეისს სკანირებს XSS-ზე, token handling-ზე, console.log-ზე, `any`-ზე, memory leak-ებზე და ა.შ., route-ებს ამოწმებს loading/error/empty state-ზე, auth guard-ზე, mobile-ზე. უშვებს tests, build, lint და tsc-ს.
- **როდის გამოიყენება:** როცა კოდბეისში ბაგების პოვნა გინდა.
- **ცვლის თუ არა კოდს:** არა (Edit/Write არ აქვს, მაგრამ აქვს Bash — ბრძანებების გაშვება შეუძლია)
- **ძირითადი წყაროები/ფოკუსი:**
  - `BUG_HUNTING_TESTS.md`, `TESTING_QUALITY_GATES.md`, `SECURITY_AUDIT.md`
  - `references/qa-attack-vectors.md`, `references/qa-bug-report-template.md`
  - `npm run test:run`, `npm run build`, `npm run lint`, `npx tsc --noEmit`

### performance-optimizer

- **რას აკეთებს:** აფასებს აპლიკაციის performance-ს — bundle size, React Context re-renders, code splitting, Core Web Vitals და IndexedDB audio cache — და Performance Audit-ს აბრუნებს პრობლემებით, რეკომენდაციებით და X/10 შეფასებით.
- **როდის გამოიყენება:** როცა გინდა bundle size-ის, loading speed-ის, rendering performance-ის ან Core Web Vitals-ის გაუმჯობესება.
- **ცვლის თუ არა კოდს:** არა — Edit/Write არ აქვს, მაგრამ აქვს Bash (build-ის, Lighthouse-ის, bundle analyzer-ის გასაშვებად).
- **ძირითადი წყაროები/ფოკუსი:**
  - მძიმე dependencies: WaveSurfer.js, FFmpeg.wasm (lazy load), Framer Motion
  - 8 context `app/contexts/`-ში (განსაკუთრებით StudioContext)
  - Target metrics: LCP < 2.5s, CLS < 0.1, INP < 200ms, initial bundle < 300KB
  - `app/lib/audio-cache.ts`, `components/studio/`
  - Skill: `indexeddb-cache`

## ფილოსოფიური review-ის როლები

### flow-sage

- **რას აკეთებს:** არსებულ user flow-ში (preview → Studio → mix → export) პოულობს იძულებით ნაბიჯებს, თავიდან ასაცილებელ გადაწყვეტილებებს და შეფერხებებს (Daoist wu wei-ით შთაგონებული lens). ასახელებს ერთ მოსაშორებელ ნაბიჯს, ერთ safe default-ს და ერთ control-ს, რომელიც explicit უნდა დარჩეს.
- **როდის გამოიყენება:** philosophy review-ში, როცა flow-ის გამარტივება და ზედმეტი ნაბიჯების მოშორება გინდა.
- **ცვლის თუ არა კოდს:** არა (tools: Read, Glob, Grep; read-only reviewer).
- **ძირითადი წყაროები/ფოკუსი:**
  - `.claude/references/philosophy-review-contract.md`
  - Stanford Encyclopedia — Daoism
  - რეალური routes და handlers; consent, destructive-action confirmation და expert control რჩება
  - Measurement: task completion time და შეცდომები

### first-visit-host

- **რას აკეთებს:** ამოწმებს, ესმის თუ არა ახალ სტუმარს სად არის, რისი გაკეთება შეუძლია და რა მოხდება შემდეგ — first-listen, Studio-entry და export-discovery flow-ში. აღრიცხავს უცნობ ტერმინებს, empty/error states-ს და დამალულ შემდეგ ნაბიჯებს (ქართული სტუმართმოყვარეობა როგორც design metaphor).
- **როდის გამოიყენება:** philosophy review-ში, როცა პირველი ვიზიტის გასაგებობა და პირველ სასარგებლო შედეგამდე გზა უნდა შეფასდეს.
- **ცვლის თუ არა კოდს:** არა (tools: Read, Glob, Grep; read-only reviewer).
- **ძირითადი წყაროები/ფოკუსი:**
  - `.claude/references/philosophy-review-contract.md`
  - რეალური first-visit flow-ები; returning-user-ის სისწრაფე უნდა შენარჩუნდეს
  - Measurement: ვინმე ასრულებს task-ს coaching-ის გარეშე (wrong turns, კითხვები, completion)
  - ეკამათება design-philosopher-ს და flow-sage-ს

### relational-architect

- **რას აკეთებს:** აფასებს collaboration-ს, attribution-ს, access-ს და სარგებლისა და ტვირთის განაწილებას composer-ს, buyer-ს, collaborator-სა და operator-ს შორის (Ubuntu-ით შთაგონებული relational ethics). პოულობს დამალულ შრომას ან ასიმეტრიულ control-ს და გვთავაზობს უმცირეს remedy-ს.
- **როდის გამოიყენება:** philosophy review-ში, როცა sharing, attribution, purchase ან access flow-ის სამართლიანობა უნდა შემოწმდეს.
- **ცვლის თუ არა კოდს:** არა (tools: Read, Glob, Grep; read-only reviewer).
- **ძირითადი წყაროები/ფოკუსი:**
  - `.claude/references/philosophy-review-contract.md`
  - Ubuntu relational ethics სტატია (tandfonline)
  - არსებული capabilities vs შემოთავაზებული features; licensing/legal უფლებებს analogy-დან არ ასკვნის
  - Privacy და contractual boundaries რჩება

### consequence-tester

- **რას აკეთებს:** ფილოსოფიურ და product რეკომენდაციებს გარდაქმნის falsifiable, შეზღუდულ ექსპერიმენტებად (pragmatism-ის lens). თითოეულისთვის განსაზღვრავს hypothesis-ს, ყველაზე იაფ reversible ცვლილებას, comparison-ს, countermetric-ს, timebox-ს და stop/reversal პირობებს.
- **როდის გამოიყენება:** philosophy review-ში, როცა სხვა როლების (ან ნებისმიერ) რეკომენდაციას დასამოწმებელი პირველი ექსპერიმენტი სჭირდება.
- **ცვლის თუ არა კოდს:** არა (tools: Read, Glob, Grep; read-only reviewer).
- **ძირითადი წყაროები/ფოკუსი:**
  - `.claude/references/philosophy-review-contract.md`
  - Stanford Encyclopedia — Pragmatism
  - მხოლოდ observed counts, არანაირი გამოგონილი conversion %
  - მაქსიმუმ 3 finding და 1 პირველი ექსპერიმენტი; ყველა როლს თანაბრად ეკამათება

### polyphony-conductor

- **რას აკეთებს:** სხვა როლების დამოუკიდებელ reports-ს აერთიანებს ისე, რომ არსებითი უთანხმოება არ დაიკარგოს (ქართული პოლიფონია როგორც metaphor). ჰყოფს საერთო მოთხოვნებს, user-specific გზებს და გადაუწყვეტელ კონფლიქტებს და ირჩევს reversible გადაწყვეტილებას დასახელებული tradeoff-ით.
- **როდის გამოიყენება:** philosophy review-ის ბოლოს, როცა რამდენიმე როლის report-ის synthesis გჭირდება.
- **ცვლის თუ არა კოდს:** არა (tools: Read, Glob, Grep; read-only reviewer).
- **ძირითადი წყაროები/ფოკუსი:**
  - `.claude/references/philosophy-review-contract.md`
  - მიწოდებული independent reports; თუ არ არის — მხოლოდ აშკარად hypothetical პერსპექტივები
  - composer control vs editor speed vs beginner comprehension
  - Decision table; არ იყენებს ხმის მიცემას ან ქულების გასაშუალოებას; agents-ს თავად არ უშვებს ნებართვის გარეშე

## სხვა

### docs-explorer
- **რას აკეთებს:** კოდის დაწერამდე პოულობს ბიბლიოთეკების და framework-ების სწორ, განახლებულ დოკუმენტაციას (Context7 → llms.txt → GitHub markdown → ოფიციალური საიტი → WebSearch) და აერთიანებს მზა guidance-ად. ამოწმებს დაინსტალირებულ ვერსიას `package.json`-ში.
- **როდის გამოიყენება:** პროაქტიულად, როცა ნებისმიერი ბიბლიოთეკის, framework-ის ან ტექნოლოგიის დოკუმენტაცია გჭირდება.
- **ცვლის თუ არა კოდს:** არა
- **ძირითადი წყაროები/ფოკუსი:**
  - WebFetch, WebSearch, Context7 MCP (თუ ხელმისაწვდომია)
  - llms.txt ფაილები, raw GitHub README/docs
  - `.claude/skills/` (არსებული patterns), version awareness

### analytics-tracker

- **რას აკეთებს:** GA4 და Facebook Pixel events-ის implementation-ში, debugging-სა და validation-ში გეხმარება, ამოწმებს e-commerce funnel-ს და GDPR consent-ს. შედეგს Analytics Audit ფორმატში აბრუნებს (არსებული/გამოტოვებული events, consent check, რეკომენდაციები).
- **როდის გამოიყენება:** როცა ახალ tracking event-ს ამატებ, events არ ჩანს ან ორმაგდება, ან user journey/funnel-ის ანალიზი გჭირდება.
- **ცვლის თუ არა კოდს:** არა (tools: Read, Glob, Grep, WebSearch).
- **ძირითადი წყაროები/ფოკუსი:**
  - `app/lib/analytics.ts`, `app/lib/facebook-pixel.ts`, `app/hooks/useAnalytics.ts`, `CookieConsent.tsx`
  - `hasAnalyticsConsent()` ყველა tracking ფუნქციაში
  - Event validation checklist (snake_case GA4, PascalCase FB, `currency: "USD"`)
  - Studio-specific events (`studio_opened`, `stem_toggled`, `mixdown_exported`...)
  - Skills: `ga4-analytics`, `facebook-pixel`
