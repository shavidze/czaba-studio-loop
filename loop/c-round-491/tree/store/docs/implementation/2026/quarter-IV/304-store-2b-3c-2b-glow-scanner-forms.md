# STORE-2b-3c-2b: zero-offset glow scanner-ის ყველა ფორმა

**თარიღი:** 2026-11-12
**სტატუსი:** Completed (C round 467 PASS)
**შეცვლილი პროექტი:** Store (2 ტესტ ფაილი, ეს დოკუმენტი)

## კონტექსტი

`countZeroOffsetGlowHits` არის guard, რომელიც Store-ში zero-offset „glow“ ჩრდილებს (offset 0 0 და blur > 0) არ უშვებს. მას იყენებს TS3 და GS/LT რიგები. HEAD-ზე offset token მხოლოდ `0` ან `0px` იყო, ხოლო blur მხოლოდ ციფრი, `var(` ან `${`. ამიტომ guard ჩუმად უშვებდა (fail-open) შემდეგ ფორმებს:

- სხვა ერთეულები და ნიშნიანი ნული: `0rem`, `0em`, `0pt`, `0dvh`, `-0`, `+0`, `0.0px` (A-R451-REVIEW-L2-ZERO-OFFSET-UNITS; `0pt` და `0dvh` tech-lead-ის review-მ იპოვა);
- ფუნქციური blur: `calc(`, `min(`, `max(`, `clamp(`, და string concatenation, სადაც blur ცვლადიდან მოდის (INFO-TL-R451-GLOW-CALC);
- whole-source regex ეშვებოდა იმ ფაილებზეც, რომლებშიც სიტყვა shadow საერთოდ არ არის (GATE452-L1-GLOW-REGEX-WHOLE-SOURCE).

ეს რაუნდი STORE-2b-3c-2-ის მეორე, ბოლო ეტაპია (პირველი ეტაპი: doc 299).

## მიდგომა

- ახალი `ZERO_LENGTH` ფრაგმენტი: არასავალდებულო ნიშანი, ნული არასავალდებულო ათწილადით და ნებისმიერი ერთეულის ასოები. ის ცვლის ძველ „0 ან 0px“ ფორმას scanner-ის ოთხივე ალტერნატივაში (Tailwind arbitrary shadow utility, arbitrary property კლასი, `drop-shadow(` ფუნქცია, CSS/inline style property).
- `GLOW_BLUR` დამატებით იღებს `calc(`, `min(`, `max(`, `clamp(` ფუნქციებს და დახურულ ბრჭყალს, რომელსაც `+` მოსდევს (concatenated blur).
- `countZeroOffsetGlowHits` ადრე აბრუნებს 0-ს, როცა `/shadow/i` წყაროში არ ემთხვევა. ეს pre-check case-insensitive-ია, ამიტომ upper-case და camel-case ფორმებსაც ხედავს.
- **განხილული ალტერნატივა:** ეს ცვლილება SYS-R465-DEAD-CSS-MATCHER-თან ერთად. უარვყავით: იმ task-ს სხვა matcher აქვს და საკუთარი trigger, ხოლო RETRO 465-ზე tech-lead-მა ერთ რაუნდში ორი port რისკად დაასახელა.
- **backgroundClip ruling:** INFO-TL-R451-GLOW-CALC-ის backgroundClip ნაწილი უცვლელი რჩება. ცვლადი, რომლის სახელია backgroundClip და მნიშვნელობა `'text'`, თითქმის ყოველთვის style-ში ხვდება, ამიტომ false positive fail-safe-ია. info ამ დასაბუთებით იხურება, ახალი რიგის გარეშე: იმ scanner-ის ტესტები ამ რაუნდის grant-ის გარეთაა (tech-lead ეთანხმება).

## არქიტექტურა

```
source ──► /shadow/i pre-check ──(არ არის)──► 0
                │
              (არის)
                ▼
ZERO_OFFSET_GLOW_PATTERN_SOURCE (4 ალტერნატივა)
   LAYER_START + ZERO_LENGTH + ZERO_LENGTH + GLOW_BLUR
                ▼
           countWhole ──► hit-ების რაოდენობა ──► TS3, GS/LT რიგები
```

## შეცვლილი ფაილები

- `app/lib/__tests__/helpers/style-scan.ts`
- `app/lib/__tests__/store-teal-sweep.test.ts`
- `docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md` (ახალი)
- `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md` (მხოლოდ სტატუსის ხაზი)

## პრობლემები და გადაწყვეტები

- **Problem:** Tailwind v4 test ფაილებსაც კითხულობს. TS7-ის სამი className fixture, plain string-ად დაწერილი, production `app.css`-ს 3 utility-ს უმატებდა.
  **Solution:** ეს სამი fixture `['…', '…'].join('')`-ით აიწყობა, ამიტომ Tailwind candidate წყაროში აღარ ჩანს. ამ დოკუმენტშიც ეს ფორმები სიტყვებითაა აღწერილი და არა კლასის ტექსტით. Build HEAD-ის byte-identical-ია.
- **Problem:** HEAD-ის TS6 fixture-ები უკვე 5 utility-ს ამატებს production CSS-ში.
  **Solution:** ეს არის B-R465-TEST-FIXTURE-CSS-LEAK, წინასწარ არსებული და deferred Low. TS6 ამ რაუნდში არ შეხებია (ერთი ელემენტი, ერთი წესი: ახალი ფორმები მხოლოდ TS7-სა და TS8-ში).
- **Problem:** C round 466-მა აჩვენა, რომ TS8 pre-check-ის წაშლის შემდეგაც მწვანე რჩებოდა (C-R466-01, Medium; იგივეა A-R466-REVIEW-M1 და TL-R465-L1). pre-check შედეგს არ ცვლის: ოთხივე ალტერნატივა სიტყვა shadow-ს შეიცავს, ამიტომ shadow-ის გარეშე წყარო ისედაც 0-ს იძლევა. სათაური იმაზე მეტს ამტკიცებდა, ვიდრე ტესტი.
  **Solution:** TS8 ახლა `String.prototype.matchAll`-ზე spy-ით ითვლის pattern scan-ის გამოძახებებს: shadow-ის გარეშე წყაროზე scan-ი არ ეშვება, shadow-იან წყაროზე ეშვება. pre-check-ის წაშლა (mutant M14) TS8-ს წითლად აქცევს. ტესტების რაოდენობა უცვლელია (TS8 ერთი ტესტია).

## ტესტირება

- **TS7:** 15 glow fixture (თითოეული 1 hit) და 8 non-glow fixture (თითოეული 0): ერთეულები, ნიშნები, ფუნქციური და concatenated blur; ასევე offset-იანი ჩრდილები, spread-ring-ები და `margin`.
- **TS8:** `/shadow/i` pre-check: shadow-ის გარეშე წყარო იძლევა 0-ს და pattern scan-ი არ ეშვება (spy-ის გამოძახებები 0); upper-case `BOX-SHADOW` და camel-case `TextShadow` იძლევა 1-ს და თითოეულზე scan-ი ეშვება.
- TS1–TS6 უცვლელია.
- A-მ გაუშვა: `npm run typecheck` (rc 0), `npx biome check` ორ ფაილზე (rc 0), `npx vitest run` 4 covering ფაილზე: `store-teal-sweep`, `store-live-teal`, `store-glow-shadow`, `store-gradient-text` (4 ფაილი, 31 ტესტი, ყველა PASS).
- B-ის pre-check (`b-round-465/`, `b-round-466/`): 14 mutant, ყველა წითელი (M14 შლის pre-check-ს და წითლად აქცევს TS8-ს); 657 წყარო ფაილზე HEAD და sketch counter-ის შედარება ტოლია, fixture ფაილის გარდა; Chromium-ის computed `box-shadow`/`filter` 22 fixture-ზე ემთხვევა TS7-ის მოსალოდნელ მნიშვნელობებს; production build HEAD-ის ტოლია.
- სრული suite და verify root gate-ის საქმეა.

## TODO / შემდეგი ნაბიჯები

- B-R465-TEST-FIXTURE-CSS-LEAK: TS6-ის fixture leak polish pass-ში (deferred Low).
- SYS-R465-DEAD-CSS-MATCHER: ცალკე task, საკუთარ trigger-ზე.
- code-reviewer-ის round 466-ის Low-ები (A-R466-REVIEW-L1…L4: shadow-ის კონტექსტის გარეშე negative fixture, ნულის `.0` და `00` ფორმები, ფუნქციური და concatenated blur Tailwind ალტერნატივებში, concatenated ring) deferred polish-შია.
- STORE-2b ღია რჩება 2b-4-ის რიგებზე, რომლებიც STORE-3/STORE-4-ის acceptance-შია.
