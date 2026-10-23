COMMIT: OK (the code is correct and touches no auth, purchase or download code. Taking ownership of `app/entry.server.tsx` + `app/lib/ssr/` is root's own decision, see F1.)

## Code Review: round 109 — NUL byte-ების მოშორება SSR stream-იდან (`entry.server.tsx`, `strip-nul-bytes.server.ts`, SN1–SN7, docs 093/094)

ეს არის diff-ის review. მოდული სრულად არ შემომიწმებია. წავიკითხე: `paths.txt`, `diff.patch`, 3 ახალი ფაილი, `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`, `architecture-checkpoint.md`, `verify.log`, `c-round-109.md/json`, `b-round-108.md` §D-29z74.

### Critical Issues
- არცერთი კოდში.

### Findings, რიგით

**F1 — Ownership (Medium, root-ის გადაწყვეტილება, კოდის დეფექტი არ არის).** `b-round-{94,96,103,108}-plan-before.md:493,540` წერს: „`entry.server.tsx` round 24-ის frozen list-შია… B ნებართვას ვერ გასცემს (§6)“. იქვე ორი გზაა დასახელებული: Tech Lead-ის ვიწრო grant ან React 19. `b-round-108.md:85` თავად აღიარებს: „This is not an explicit user grant of the file“. C ამ საკითხს არ განსჯის (`c-round-109.md:42`).
- **Fix:** root-მა ჩაწეროს ცხადი გადაწყვეტილება. თუ თანახმაა: „narrow grant ratified: import block + `body` line + new `app/lib/ssr/`“. თუ არა: რაუნდი არ გამოქვეყნდეს და C-R23-01 მომხმარებელს დაუბრუნდეს. კოდის მხრიდან grant-ს ხელს არაფერი უშლის. ცვლილება არც გლობალურად აკრძალულ ფაილს ეხება, არც auth-ს, purchase-ს ან download-ს. C-ის SOURCE-UNCHANGED შემოწმებით 12 დაცული hash და `package.json`/lockfile უცვლელია.

**F2 — PROD-SSR-NUL შემოწმებული არ არის (Low).** `c-round-109.md:29` წერს „production build was not run here“. `verify.log`-ში build მწვანეა (`✓ built`), მაგრამ production-ის HTML-ში NUL-ების რაოდენობა არ გაზომილა. რისკი დაბალია: filter `entry.server`-შია და bundle-ის ტიპზე არ არის დამოკიდებული.
- **Fix:** `npm run build && npm start`, შემდეგ `ssr-baseline.cjs` გაეშვას `/studio-lab`-ზე ორივე UA-ით. მოსალოდნელია NUL 0 და `chunked`.

**F3 — ახალი suppression directive (Low).** `strip-nul-bytes.server.test.ts:22` შეიცავს `biome-ignore lint/a11y/useButtonType`-ს. მიზეზი ახსნილია: `type`-ის დამატებით 2048-byte-იანი view-ის საზღვარი გადაიწევს. მაგრამ სწორედ ამის აღმოსაჩენად არსებობს SN5.
- **Fix:** სცადე `type: 'button'`. თუ SN5 მწვანე რჩება (NUL > 0), suppression ამოიღე. თუ წითლდება, დატოვე ისე, როგორც არის.

**F4 — SN5 განზრახ დაყენებული tripwire-ია (Info).** `test.ts:151`: როცა react-dom-ის ახალი ვერსია bug-ს გაასწორებს, CI წითლდება და ეს ჩაფიქრებულია. ეს flake არ არის, TODO-ში (`094:92`) ჩაწერილია. `test.ts:152`-ის `expect(typeof renderToPipeableStream)` ზედმეტი assertion-ია და შეიძლება წაიშალოს.

**F5 — timer, რომელიც უკვე არსებობდა (Info, diff-ს არ ეკუთვნის).** `entry.server.tsx:52`: `setTimeout(abort, ABORT_DELAY)` არასოდეს წყდება. SN7-ის შემდეგ 5 წამიანი timer რჩება. ეს ცვლილება ახალ listener-ს ან timer-ს არ ამატებს. B-ს უკვე აქვს შეთავაზება `clearTimeout`-ზე, რომელიც `onAllReady`/`onShellError`-ზე უნდა ჩაირთოს.

**F6 — doc-ების წვრილმანი (Info).**
- `094:4`-ის სტატუსი ისევ „C-ის შემოწმებას ელოდება“, არადა C PASS-ია. Commit-ზე განახლდეს, ისევე როგორც 093.
- `094:61` წერს Remix 2.17.2, `CLAUDE.md` კი 2.12. `tsc` გადის, ესე იგი მოძველებულია `CLAUDE.md` (ამ რაუნდის საქმე არ არის).

### რატომ არის სწორი (რეგრესია ტესტებს ვერ დაემალება)
- **Lifecycle:** `PassThrough` თავადაც identity `Transform`-ია. `end`, `destroy`, abort, backpressure და `pipe()`-ის `drain`/`error`/`close` listener-ები უცვლელია, განსხვავება მხოლოდ `transform`-ის ტანშია. `flush` საჭირო არ არის, რადგან state არ ინახება.
- **Chunk-ის ტიპი:** non-object mode-ში Node React-ის `Uint8Array` view-ს `_transform`-მდე `Buffer`-ად აქცევს. ეს C-მ `tools/u8.cjs`-ით გადაამოწმა, SN6/SN7-მაც დაადასტურა. `TypeError`-ის branch-მდე რეალურად ვერაფერი მიდის, ის მხოლოდ თავდაცვითია.
- **Fast path:** NUL-ის გარეშე chunk იგივე object-ად გადის, როგორც `PassThrough`-ში. Chunk-ების რაოდენობა და რიგი არ იცვლება, ამიტომ streaming-ის timing-იც უცვლელია. C-მ გაზომა: `chunked`, 36 data event.
- **UTF-8:** `0x00` არასოდეს არის lead ან continuation byte, ამიტომ chunk-ებს შორის გაყოფილი ქართული სიმბოლო დაზიანებული არ რჩება (SN3). `Buffer.alloc` ზუსტ სიგრძეს იღებს და ნულებით ავსებს, heap-იდან მონაცემი ვერ გაჟონავს.
- **Scope:** `handleRequest` მხოლოდ document request-ს ამუშავებს. ერთადერთი `Content-Length` resource route-შია (`api.proxy.audio.ts:57`) და `entry.server`-ზე არ გადის. ბინარული body ვერ გაფუჭდება.
- **Nuance:** ტექსტში ლიტერალური U+0000 ახლა იშლება, მანამდე კი U+FFFD-ით იცვლებოდა. ორივე არავალიდური HTML-ია, ამიტომ რეგრესია არ არის.

### Suggestions
- F1 ცხადად ჩაიწეროს root-ის gate-ის ჩანაწერში.
- F2 შემოწმდეს commit-ამდე ან ცალკე gate row-ად.
- F3 სცადე წაშლა, F6-ის სტატუსის ხაზი განახლდეს.

### Good Practices Found
- Filter ბაიტებზე მუშაობს და არაფერს კარგავს, decode/encode არ სჭირდება. გამოსავალი ზუსტად ემთხვევა `renderToString`-ს: SN6/SN7 და C-ის sha256-ის 20/20 დამთხვევა.
- Mutation-ები m1–m4 ორჯერ გაიარა, A-მ და C-მ ცალ-ცალკე. Fail-before დოკუმენტირებულია.
- `.server.ts` suffix ფაილს client bundle-ში არ უშვებს. `any`, `as` და `@ts-` არ გამოიყენება. `EntryContext` სრულად აკრეფილი literal-ია.
- a11y: ⌫-ის `aria-label` და სათაური აღარ ფუჭდება, ეს NOJS და HYDRATED რეჟიმებში შემოწმდა.
- Auth, purchase და download კოდს არ ეხება: PX-NET 0 `Authorization`, `/api/studio-token`-ზე anonymous request 401-ს აბრუნებს.
- Tailwind-ის, token-ების და render-ის ღირებულება ცვლილებას არ ეხება.

### Architecture note
- **სიგნალი 2 (coupling):** `entry.server.tsx:6,26` → ახალი `app/lib/ssr/` namespace upstream react-dom-ის დეფექტის გვერდის ავლით. **Keep:** state არ აქვს, lifecycle ერთია, ერთ ხაზზე ერთდება, მოხსნის trigger SN5-შია. ღირებულება low.
- **Proposal planner-ისთვის (ერთი შეზღუდული დავალება, scope დამტკიცებული არ არის):**
  - react-dom-ის განახლებისას `createNulByteStripStream` და SN5 წაიშალოს და `entry.server.tsx:26` `PassThrough`-ზე დაბრუნდეს.
  - მიღების კრიტერიუმი: SN6/SN7-ის ეკვივალენტი ფილტრის გარეშეც მწვანეა.
  - plan §6-ში `app/entry.server.tsx` და `app/lib/ssr/` ცხადად შევიდეს ownership-ის სიაში ან frozen list-ში, რომ F1 აღარ განმეორდეს.

### Alternative Approach (კრიტიკული delivery-ის გზა)
- **Current:** byte-level `Transform` state-ის გარეშე `pipe()`-სა და Response-ს შორის.
- **Alternative A:** React 19 ან react-dom-ის patch, ანუ მიზეზის გამოსწორება წყაროშივე. სჭირდება lockfile-ის ცვლილება, რომელიც ახლა გაყინულია, და მთელ Store-ს რეგრესიის რისკის ქვეშ აყენებს.
- **Alternative B:** `string_decoder` → `replace(/\0/g,'')` → re-encode. chunk-ებს შორის state ჩნდება და ყოველ response-ზე decode/encode სრულდება.
- **Verdict:** ახლა მიმდინარე მიდგომა სჯობს. ის უდანაკარგოა, zero-copy fast path აქვს და ერთ ხაზზე უკან ბრუნდება. ნამდვილი გამოსწორება მაინც A-ა, მისი trigger კი SN5.

### Score: 9/10