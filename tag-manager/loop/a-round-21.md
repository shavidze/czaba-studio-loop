# A — Round 21: TM-B24 / D-30 — save-ის დროს აკრეფილი ტექსტი აღარ იკარგება

STATUS: DONE (A-ს მხარე). realVerified A-სთვის: unit/gate/E2E რეალურად გაშვებულია; R21-5 (real app + ffprobe/music-metadata) C-ს საქმეა, A-ს არ გაუშვია.

## Baseline
- HEAD `b373b08f13069b26e89192a1229e3a4a31257e3e`, `git status --porcelain` ცარიელი (12:06Z).

## Process statement
- Primitives: `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md` და `STATE_MANAGEMENT.md` წავიკითხე 12:06Z-ზე (Bash `cat`), პირველ edit-მდე.
- read-primitives hook **არ ამოქმედდა**: არც ერთ Edit-ზე injection არ მინახავს.
- რეპოზიტორიაში ყველა ჩანაწერი გაკეთდა მხოლოდ Edit tool-ით: test-ზე 2 edit, MetadataPanel-ზე 5, STATE_MANAGEMENT-ზე 1.
  - Bash-ით რეპოზიტორიაში მხოლოდ gitignored output იწერებოდა: `out/`, `test-results/`, `tests/fixtures/*.wav`.
  - mutant-ები `/tmp/a-r21-mut` ასლში გაეშვა, script კი `/tmp/a-r21-scripts/mut.py`-შია.
- `.claude/primitives/STATE_MANAGEMENT.md`-ის Edit მიღებულია (path (b)), უარი არ ყოფილა.
- commit/push/install არ გამიკეთებია.

## შეცვლილი ფაილები (3, ყველა `M`, untracked არ არის)
- `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` (+38/−2):
  - ახალი private helper-ები: `isSameFieldValue` (მასივები ადარდება ელემენტ-ელემენტ, რიგის გათვალისწინებით), `collectFieldsTypedDuringSave` და `mergeFieldsTypedDuringSave` (თუ ცარიელია, no-op).
  - `startEditingMetadata = editingMetadata` პირველ await-მდე.
  - single: typed გამოითვლება მხოლოდ same-set შემთხვევაში და `mergeFields` ეშვება `setEditingMetadata`-ის **შემდეგ**.
  - batch all-succeeded + same set: collect → `setEditingMetadata({})` → merge.
  - მეტი ცვლილება არ არის: კომენტარი, `any` და ახალი `as`/export არ დამატებულა.
  - ორივე `as WavMetadata` (RR-R15-02) უკვე არსებობდა და ხელუხლებელია.
  - `mergeFields` იკითხება `useMetadataStore.getState()`-დან, ამიტომ deps არ შეცვლილა.
- `tests/renderer/components/metadata-panel-batch-save.test.ts` (+247, მხოლოდ დამატება):
  - nested `describe("typing while the save is pending (TM-B24, D-30)")` ჩასმულია TM-B23 describe-ის შიგნით, მის დამხურავ `});`-მდე.
  - შეიცავს (y1)–(y13)-ს და (y5b)-ს, სულ 14 ტესტს.
  - `git diff -- tests/ .claude/ | grep '^-[^-]'` ცარიელია.
- `.claude/primitives/STATE_MANAGEMENT.md`: დაემატა 1 ხაზი D-29 ხაზის შემდეგ, სიტყვასიტყვით task-ის ტექსტით.
- სრული diff: `a-round-21/full.diff`, src diff: `a-round-21/src.diff`.

## Red (b373b08 კოდი + ახალი ტესტები) — `a-round-21/red-final.log`
- შედეგი: `Tests 9 failed | 39 passed (48)`.
- ვარდება 9 დაგეგმილი red, თითოეული symptom-ით:
  - (y1): `expected 'A-title' to be 'TypedTitle'`
  - (y2): `expected "vi.fn()" to be called 2 times, but got 1 times`
  - (y3): `expected 'R20Cat' to be 'R21Again'`
  - (y5b): `expected [] to deeply equal [ 'G2', 'G1' ]`
  - (y6): `expected [] to deeply equal [ 'R21Tag' ]`
  - (y7): `expected +0 to be 128`
  - (y8): `expected 'A-title' to be 'BackTyped'`
  - (y9): `expected {} to deeply equal { title: 'BatchTitle' }`
  - (y10): `called 2 times, but got 1 times`
- გადის (y4), (y5), (y11), (y12) და (y13) pin-ები, ასევე (a)–(w) და (x1)–(x11), ანუ ყველა ძველი ტესტი (34).
- პირველ red run-ში (y13) harness-ის leak-ით ჩავარდა.
  - (y12) `startSingleSave`-ით რიგში აყენებდა `readMetadata` `mockResolvedValueOnce`-ს. write reject-ის გამო ის არავინ მოიხმარა, და `mockClear` once-რიგს არ ასუფთავებს.
  - შესწორება: (y12)-ს ახლა საკუთარი setup აქვს `readMetadata`-ის რიგში ჩაყენების გარეშე. მოლოდინი არ შეცვლილა.

## Green — `a-round-21/green.log`
- `Tests 48 passed (48)`.

## Mutants (ასლში, `a-round-21/mutants.log`) — ყველა მოკლულია
| Mutant | მომკვლელი ტესტები |
|---|---|
| M1 merge-ის გარეშე | (y1) (y2) (y3) (y5b) (y6)–(y10) |
| M2 compare-ის გარეშე | (y1) (y4) (y5) (y5b) (y6) (y7) (y9) (y10) + (c) (d) (u) |
| M3 მასივები reference-ით | (y5) |
| M4 მთელი editingMetadata-ს merge | (y8) და სხვები, (x10)-ის ჩათვლით |
| M5 batch-ში merge-ის გარეშე | (y9) (y10) |
| M6 snapshot await-ების შემდეგ | (y1) და სხვები |
| M7 merge setEditingMetadata-მდე | (y1) და სხვები |

M8 არ გამიშვია (მოსალოდნელი equivalent, C-ს საქმეა).

## Gate — ბოლო test edit-ის შემდეგ, სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`)
- `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **exit 0** (`a-round-21/verify.log`).
  - Biome: 0 error და 9 warning. სია იგივეა რაც `b373b08`-ზე, MetadataPanel მასში არ არის: FileList×2, TagsInput, AudioPlayer, FolderBrowser, TemplatePicker, input, select, toast.
  - typecheck: 0.
  - Renderer: **187/187**, 10 ფაილი (173 + 14).
  - Main: **93/93**.
  - E2E: **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0 (`a-round-21/e2e-retries0.log`).

## qa-engineer (read-only regression check)
0 regression. Low notes, შემოთავაზებული ID-ებით B-სთვის:
- **A-R21-01 (low):** ველი, რომელიც start snapshot-ში არ იყო (single-ში ფაილს არ ჰქონდა key, batch-ში ველი save-მდე არ იყო შეცვლილი), save-ის დროს აკრიფე და წაშალე. მნიშვნელობა `''`/`0` ≠ undefined, ამიტომ merge ხდება და ფორმა dirty რჩება.
  - batch-ში შემდეგი Save ამ ველში ყველა ფაილს `''`-ს ჩაუწერს.
  - ეს იგივე ქცევაა, რაც pending save-ის გარეშე აკრეფისას, ამიტომ regression არ არის. თუმცა y4-ის "revert ≠ change" მხოლოდ snapshot-ში არსებულ key-ზე მოქმედებს.
- **A-R21-02 (info):** ველი save-ის დროს snapshot-ის მნიშვნელობაზე დააბრუნე, მაგრამ re-read განსხვავებულ მნიშვნელობას აბრუნებს (writer-მა ნორმალიზება მოახდინა ან ვერ ჩაწერა). ამ შემთხვევაში revert იკარგება. ეს D-30-ის დიზაინიდან გამომდინარეობს.
- **A-R21-03 (low, უკვე არსებობდა):** single save-ის დროს schema შეიცვალა. save start-ის `fields`-ით გაკეთებული re-read გადააწერს `handleSchemaChanged`-ის შედეგს. D-30 ამას არ აუარესებს.

## code-reviewer
blocking finding არ არის.
- #1 "redundant `as` casts" :148-149: ორივე cast უკვე არსებობდა (RR-R15-02) და task მათ ხელის ხლებას კრძალავს, ამიტომ ცვლილება არ გამიკეთებია.
- #2 (medium, risk): once-mock რიგის leak, თუ ტესტი Save-მდე ჩავარდება.
  - ახლა ყველა red/mutant ჩავარდნა click-ის შემდეგ ხდება და ყველა რიგი მოიხმარება. ეს run-ებმა დაადასტურა: მხოლოდ ზემოთ ხსენებული (y12)→(y13) leak იყო და ის გასწორდა.
  - nested `beforeEach` + `mockReset` არ დავამატე, რომ gate აღარ გადამეშვა. შემოთავაზება: **A-R21-04 (low)**.
- #3 single branch-ის readability (ერთი `if` ბლოკი): task მოითხოვდა არსებული სტრუქტურის შენარჩუნებას. არ შევცვალე.
- #4 STATE_MANAGEMENT-ის ფორმულირება "arrays by content": ტექსტი task-ის მიერ სიტყვასიტყვით არის დადგენილი. არ შევცვალე. დაზუსტება ("element-wise, order-sensitive") B-ს შეუძლია მომავალში.
- #5 `docs/bugs/`-ში TM-B23/B24-ის ჩანაწერი არ არსებობს. `docs/**` frozen-ია, ეს B-სთვისაა.

## Known gaps
- R21-5 (real app, delay harness, ffprobe/music-metadata, `b373b08` red reference) A-ს **არ** გაუშვია. ეს C-ს საქმეა.
- M8 არ გამიშვია.

## C-სთვის შემდეგი შემოწმებები
1. R21-1: `git status --porcelain --untracked-files=all` უნდა აჩვენოს 3 `M`. ასევე `git diff --quiet b373b08 -- . ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!tests/renderer/components/metadata-panel-batch-save.test.ts' ':!.claude/primitives/STATE_MANAGEMENT.md'`.
2. R21-2: worktree `b373b08` + ჩემი test ფაილი → უნდა იყოს 9 failed / 39 passed. ჩემს ხეზე → 48/48.
3. R21-3: M1–M7 (+M8 record). დამატებითი შემოწმება: (y12)-ის setup ახლა `readMetadata`-ს რიგში არ აყენებს.
4. R21-4: gate უნდა იყოს 187/93/7, 9 warning.
5. R21-5: real app, ყველა ნაბიჯი 1–8, წაკითხვა ორივე reader-ით.
   - ნაბიჯი 4-ში მოსალოდნელია `Unsaved changes were discarded` toast (B-R19-01).
   - ნაბიჯი 5-ში შემდეგმა batch Save-მა მხოლოდ Copyright უნდა ჩაწეროს.

## Acceptance (A-ს მიერ რეალურად გაშვებული)
- R21-2 red/green: A-ს მხარე გაიარა. სრული ფაილი, ჩემს ხეზე, red ძველ კოდზე, worktree-ს გარეშე: ტესტების ჩამატების შემდეგ src ჯერ არ იყო შეცვლილი.
- R21-3 M1–M7: გაიარა, ყველა მოკლულია.
- R21-4 gate + `--retries=0`: გაიარა.
- R21-1: ownership-ის საკუთარი შემოწმება გაიარა. საბოლოო ვერდიქტი C-ს ეკუთვნის.
- R21-5: **არ გამიშვია** (realVerified=false A-სთვის).
