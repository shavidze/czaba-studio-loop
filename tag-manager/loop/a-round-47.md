# A — Round 47: TM-B05 / D-51 (empty audio data → `Audio data is empty, cannot tag`)

STATUS: DONE (pending C). Unit tests and the gate ran for real (realVerified=true). A did **not** run the real-app checks R47-4..6; they belong to C.

## Baseline
- HEAD `1ea34df5215a87f386a07f9808b969a834b144d2`, tree clean before the first edit.
- Primitives read before the first edit: WAV_METADATA, ELECTRON_IPC, TESTING, TYPESCRIPT_STRICT, AGENT_DISCOVERABLE_CODE.

## შეცვლილი ფაილები (ყველა ownership-ში)
| File | Change |
|---|---|
| `src/main/ipc/metadata.ts` | `CorruptFileError` import (Biome-მა import multi-line-ად დააფორმატა). module-private `LIBRARY_MISSING_DATA_CHUNK_MESSAGE`, `EMPTY_AUDIO_DATA_ERROR_MESSAGE`, `openTagFileForWrite(filePath): TagFile`: mapping მხოლოდ `err instanceof CorruptFileError && err.message === 'WAV file is missing data chunk'`, სხვა ყველაფერი rethrow. `writeTagsToFile` იძახებს helper-ს. Read path და handlers byte-identical. ახალი export არ არის. |
| `tests/main/metadata-empty-audio.test.ts` (new) | (a1)–(a8). double quotes. WAV-ები `tmpdir()`-ში იქმნება. `tests/fixtures/`-ში არაფერი იწერება (sample.wav/corrupt.wav მხოლოდ tmp-ში კოპირდება). |
| `docs/recording-tag-contract.md` | header-ის სიაში D-51. `## ჩაწერის შეცდომები`-ში D-51 bullet: message, single-save prefix-ები, batch `failed[].error` + გაგრძელება, ფაილი არ იცვლება, სამი ფორმა (დაზუსტებული, იხ. review), LIST-იანი 0-sample იწერება, read უცვლელია (Q22). `## შემოწმება`-ში ახალი ტესტი. |
| `.claude/primitives/WAV_METADATA.md` | ერთი D-51 წესი D-50-ის შემდეგ. Edit tool, path (b), standing permission. |

- `git status --porcelain --untracked-files=all` = ზუსტად ეს 4 path.
- **არცერთ Bash ბრძანებას რეპოზიტორიაში არ ჩაუწერია.** ყველა ცვლილება Edit/Write tool-ით გაკეთდა.
- Mutant-ები და baseline-ის ფაილები მხოლოდ `/tmp/a47-baseline`-ში დაიწერა.
- გენერირებული artefacts (`tests/fixtures/*.wav`, `out/`, `test-results/`) gate-მა თავად შექმნა. ისინი gitignored-ია.

## Red / green (ნამდვილად გაშვებული)
- Command: `npx vitest run --config vitest.config.main.ts tests/main/metadata-empty-audio.test.ts`.
- Temp copy `/tmp/a47-baseline`: `git archive 1ea34df` + `node_modules` symlink + A-ს test file. `metadata.ts` ტოლობა baseline-თან შემოწმდა `diff`-ით.

| Case | 1ea34df (temp copy) | A tree |
|---|---|---|
| (a1) 44-byte WAV, ცარიელი data ბოლოში | FAIL (`WAV file is missing data chunk`) | PASS |
| (a2) batch empty + sample | FAIL (`error: "WAV file is missing data chunk"`) | PASS |
| (a3) fmt, data chunk-ის გარეშე | FAIL | PASS |
| (a4) 0-sample + LIST/INFO | PASS | PASS |
| (a5) 1-sample | PASS | PASS |
| (a6) corrupt.wav → `Failed to write metadata: WAV file is missing header chunk` | PASS | PASS |
| (a7) read / read-batch → emptyMetadata | PASS | PASS |
| (a8) ჩვეულებრივი `Error` იგივე ტექსტით (mock `createFromPath`) უცვლელად გადის | PASS | PASS |

- Baseline: 3 failed / 5 passed (`a-round-47/red-tempcopy-1ea34df-v2.log`; v1 log-ში (a8)-მდე 3/4 იყო).
- A tree: 8/8 (`a-round-47/green-in-repo-v2.log`).
- დამატებითი mutant: helper-იდან `instanceof CorruptFileError` ამოღებული → (a8) FAIL, 1 failed / 7 passed (`a-round-47/mutant-no-instanceof.log`). ე.ი. (a8) ამ mutant-ს კლავს.
- (a8) task-ის A2 სიაში არ იყო. ის reviewer-ის finding 3-ის გამო დაემატა owned test file-ში. ტესტი იყენებს ერთ `mockImplementationOnce`-ს, ისე როგორც `metadata-write-guard.test.ts`.

## Gate (ნამდვილად გაშვებული, საბოლოო tree-ზე)
- `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **EXIT=0** (`a-round-47/verify-v2.log`):
  - Biome: 34 files, 0 errors, 8 warnings;
  - tsc: შეცდომა არ არის;
  - renderer 326/326;
  - main **128/128** (120 + 8 ახალი);
  - build OK;
  - E2E 7/7.
- `xvfb-run -a npx playwright test --retries=0` → 7/7, EXIT=0 (`a-round-47/e2e-retries0-v2.log`).
- არცერთი არსებული ტესტი არ ჩავარდა. stop rule არ ამოქმედდა.
- `build:win` / `build:mac`: BLOCKED — "Windows packaging is not available in the cloud".

## Code review (`code-reviewer` subagent, read-only)
reviewer-მა ბლოკერი ვერ იპოვა. მან შეამოწმა:
- `riffFile.js:327` აგდებს `CorruptFileError`-ს ზუსტად ამ message-ით;
- `instanceof` მუშაობს CJS re-export-ზე;
- main bundle-ში `externalizeDepsPlugin`-ის გამო library-ს ერთი ასლია.

Findings და რა გაკეთდა:
1. **Medium, docs:** მტკიცება „truncated data იგივე შეტყობინებას იძლევა“ ზოგადად არასწორია. **დადასტურდა ექსპერიმენტით** (`a-round-47/exp-truncated-data.log`; სკრიპტი `/tmp/a47-exp`-შია, რეპოს გარეთ):
   - data header-ს ბაიტი არ მოსდევს → `CorruptFileError: WAV file is missing data chunk`;
   - header-ს 4 ბაიტი მოსდევს (გამოცხადებული 1000) → write OK.
   - **Fixed:** contract doc-ის ტექსტი დაზუსტდა.
2. **Low, WAV_METADATA:** წესს აკლდა „ფაილის ბოლოს“. **Fixed.**
3. **Low, test gap:** `instanceof`-ის ნახევარს ტესტი არ ჰქონდა. **Fixed** (a8)-ით, mutant მოკლულია.
4. **Low:** (a1)/(a3)-ის sha256 შემოწმება ყოველთვის გაივლის, რადგან open ვარდება `save()`-მდე. დარჩა, რადგან task მას მოითხოვს.
5. **Info:** `{ cause: err }` original error-ს შეინახავდა. **Not done**, რადგან scope-ს ცდება. ეს B-სთვის signal-ია.

## Signal B-სთვის (in-round არ შეცვლილა)
- **A-R47-01 (low):** truncated `data` chunk-ის მქონე WAV (გამოცხადებული 1000 B, რეალური 4 B, ფაილი 48 B) title-ის ჩაწერის შემდეგ **1300 B-მდე გაიზარდა**. library ფაილს გამოცხადებული ზომით წერს. ეს D-51-ს არ ეხება, მაგრამ data-integrity კითხვაა. გაზომილია მხოლოდ ერთ ფაილზე.

## ცნობილი gap-ები
- M5 (`message.includes('data chunk')`) არცერთი ტესტით არ განირჩევა. library-ს სხვა message, რომელიც `data chunk`-ს შეიცავს, ცნობილი არ არის, ამიტომ მოსალოდნელი named survivor-ია.
- Read-path mutant ეკვივალენტურია. მას R47-1 diff check ფარავს.
- A-ს არ გაუშვია real app R47-4..6 და M1–M5. ისინი C-ს საქმეა.

## შემდეგი შემოწმებები C-სთვის
1. **R47-1:** `git diff --stat 1ea34df` = 4 path. `git diff 1ea34df -- src/main/ipc/metadata.ts` უნდა შეიცავდეს მხოლოდ import-ს, 2 const-ს, helper-ს და ერთ call-ს.
2. **R47-2:** M1–M5 temp copy-ში. M2-ს (a6) კლავს, M1/M3/M4-ს (a2). (a8) დამატებით კლავს „instanceof ამოღებულია“ mutant-ს.
3. **R47-3:** gate და შემდეგ `--retries=0`. მოსალოდნელია main **128**.
4. **R47-4/5/6:** real app. toast ზუსტად `Error invoking remote method 'meta:write': Error: Failed to write metadata: Audio data is empty, cannot tag`. batch: `1 saved, 1 failed`. tone.wav-ზე ffprobe + music-metadata.
5. **R47-7:** docs diff, მათ შორის დაზუსტებული truncated ფორმულირება.

## Acceptance, რომელიც A-მ ნამდვილად გაიარა
- **R47-1** ownership: PASS (self-check).
- **R47-2** red/green: PASS. A-ს მხოლოდ ერთი დამატებითი mutant გაუშვია; M1–M5 C-ს საქმეა.
- **R47-3** gate: PASS.
- **R47-7** docs: დაწერილია, C ამოწმებს.
- **R47-4, R47-5, R47-6:** A-ს **არ გაუშვია**.
