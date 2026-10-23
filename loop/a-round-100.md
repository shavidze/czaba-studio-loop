# A round 100 — B-R98-H1-PREVIEW-TOGGLE-HOLD + GATE99-S1-DOC087-STATUS

Status: implementation done; waiting for C. Nothing committed. The round's acceptance is C's, not mine.

## Baseline (verified at start)
- HEAD e2412db337e9015def8dc6855358437b900ff51e, `git status --short` empty, frozen list 531/531 OK, all three snapshots matched SHA256SUMS.

## Changed files (end sha256, in a-round-100/end-hashes.txt)
| File | State | sha256 |
|---|---|---|
| app/components/arrangement/ArrangementLibraryPreview.tsx | M (one +5 hunk at old l.292, inside the toggle `<button>`, between onClick and disabled) | 2c475d18… |
| app/lib/arrangement/__tests__/library-preview.test.tsx | M (one pure-addition hunk, +39, after old l.286) | 7d0126be… |
| docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md | M (l.4 only) | 61c3f646… |
| docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md | ?? new, Georgian, LF, CR=0 | 0a77d036… |

End state: 3 M + 1 ??; frozen list 531/531 OK; HEAD unchanged.

- **T1:** the toggle got `onKeyDown`: if `event.key === 'Enter' && event.repeat`, call `preventDefault()`. This is the same rule as ＋. There is no stopPropagation and no new import, state, ref or effect. onClick, disabled, className, data-testid and both labels are unchanged.
- **Line-number note:** in snapshot b42334fc the last `it` ends at **l.286** and the describe's `});` is l.287. B's task said l.285/286. The hunk `@@ -286,0 +287,39 @@` is still a pure addition after the last `it` and inside the describe.

## Tests added (HT1–HT3)
- **HT1:** on ▶ მოუსმინე, `keyDown Enter repeat=false` returns true. Then two `repeat=true` keydowns each return false. No keydown changes the label. Then `click` gives ■ შეჩერება.
- **HT2:** two fresh `Enter repeat=false` keydowns each return true, and the label stays ▶.
- **HT3:**
  - a repeated `'q'` returns true;
  - a repeated `' '` returns true (added after code-review Low #1);
  - a bubble-phase `document` keydown listener (removed in try/finally) receives the repeated Enter as `[{key:'Enter',repeat:true}]`.
- Assertions use exact `toBe`/`toEqual`. The added lines contain no `as` and no `@ts-`.

## Fail-before and mutations (scratch a-round-100/mut, Vitest cacheDir in scratch; script run-mutations.py, results in mutation-results.json and mutations.log)
- **Fail-before** (snapshot f074a9bb + extended test): **HT1 is red**; HT2, HT3 and the 4 existing tests are green (1 failed, 6 passed). This matches B's list.
  - **Difference during the work:** my first HT3 draft also asserted the prevented return and `defaultPrevented`, so it was red on the baseline. Evidence: mutations-v1.log, mutation-results-v1-ht3-strict.json.
  - I removed those two checks from HT3. HT1 already covers prevention, and HT3 is now a pure lock, as B designed.

| Mutation | Red tests |
|---|---|
| a: guard removed | HT1 |
| b: guard without the key check (any repeated key) | HT3 |
| c: + stopPropagation | HT3 |
| e (extra): guard also on a repeated Space | HT3 |
| d: guard on every Enter | HT1, HT2 |
| unmutated control | 0 red, 7/7 green |

## Browser reproduction (A's own check, not C acceptance)
Script: copy of B's probe at a-round-100/probe-toggle.cjs. Changes from B's version:
- 4 keydowns (held4) instead of 3;
- an output tag argument;
- a waitFor of up to 90 s for the demo row. The first run timed out at 30 s on a cold Vite.

Chromium 1280×720, :5173/studio-lab.

| Run | held4 (4 keydowns, repeat F/T/T/T) | fresh1 (one press) |
|---|---|---|
| **before** (repro-before.json) | **4 clicks** on the toggle; ▶→■→▶→■→▶, ends **stopped**; clips 0→0 | 1 click, ▶→■ |
| **after** (repro-after.json) | **1 click**; one label change ▶→■, still ■ at 1.2 s; clips 0→0; 0 pageerrors | 1 click, ▶→■ |

- Screenshots: a-round-100/toggle-{before,after}-{held4,fresh1}-1280.png.
- **Not measured by A:** audio RMS, the 1440×900 viewport, and the WAVE/PLUS/ROW/EXPORT regression rows. These are for C.
- repro-after ran before the test-only follow-up edit (the Space lock). The component has not changed since.

## Commands run (results)
- `npm run typecheck` → exit 0 (a-round-100/typecheck.log).
- `npm run lint` → exit 0. 218 warnings and 1 info, none in the owned files (lint.log).
- `npx biome check <component> <test>` (read-only) → exit 0, no diagnostics (biome-check-owned.txt).
- `npx vitest run $(cat a-round-100/targeted-list.txt)` → 4 files, **30/30 pass** (targeted-vitest.log):
  - failed-source-refusal 8;
  - library-preview 7;
  - held-enter-add 8;
  - render-budget 7.
- targeted-list.txt holds those 3 files from §2 plus failed-source-refusal.test.tsx, which the grep found.
- Not run, by the speed rules: the full suite, build, `npm run verify` and e2e smoke. These belong to the root gate.

## code-reviewer (real subagent, score 9/10; no Critical, High or Medium)
- **Low 1 (no Space lock):** fixed. HT3 now asserts a repeated `' '` returns true, and mutation e proves it.
- **Low 2 ("six places" could read as codebase-wide):** fixed. Doc 088 now scopes it to the held-Enter series (docs 085–088) and notes that the waveform and some menus have their own earlier filters.
- **Low 3 (doc line described only off→on):** fixed. It now says one toggle in either direction.
- The reviewer had no shell, so it reviewed the files without the diff. The diff and hunk scope were verified by A above.

**Architecture note (verbatim, for B):**
> - **სიგნალი 3 (ერთი და იგივე ძვირი ცვლილება მეორდება).** იდენტური inline guard-ები დგას ოთხ ღილაკზე:
>   - `ArrangementLibraryPreview.tsx:293-297`
>   - `ArrangementLibraryPreview.tsx:312-316`
>   - `ArrangementTransport.tsx:249-253`
>   - `ArrangementExportDialog.tsx:541-545` (აქ `=== true`-ს ვარიანტია)
>
>   თითოეული ცალკე რაუნდში დაემატა და ყოველ ჯერზე ცალკე browser probe დასჭირდა.
> - **keep ამ რაუნდში.** თითო guard სამ ხაზიანია და lifecycle-ს არ ეხება. ფაილებიც გაყინულია.
> - **წინადადება planner-ისთვის.** ერთი შეზღუდული დავალება: საერთო pure helper (დაახლოებით `preventRepeatedEnterActivation(event)`) მხოლოდ ამ ოთხი **ღილაკის** guard-ისთვის, რომლებსაც ერთი contract აქვთ (repeat-ს აჩერებს, ბრაუზერი click-ს თვითონ აგზავნის). Library row, გლობალური Enter, waveform და მენიუები ამ დავალებაში არ უნდა შევიდეს. ისინი action-ს პირდაპირ იძახებენ, ზოგი `stopPropagation`-ითაც, ანუ სხვა contract აქვთ.
>   - მიღების კრიტერიუმები: არსებული HT/HA/TH ტესტები უცვლელად მწვანეა, დაემატება helper-ის unit test და ერთი Chromium hold-probe-ის რეგრესია.
>   - ღირებულება: low–medium.
>   - უკვე ჩაწერილია როგორც `ARCH-R97-EXPORT-FOOTER-KEYBOARD`.
> - ეს მხოლოდ diff-ის review-ა. მოდული სრულად არ შემიმოწმებია.

Out-of-scope observation from the reviewer, for B:
- ▶ starts the preview from 0, while the waveform toggle starts from the cursor.
- This is pre-existing, not changed this round, and not a finding.

## Known gaps
- No RMS measurement or 1440 run by A (these are C rows).
- Browsers that are not Chromium are untested.
- The doc 085 boundary still applies: environments that send auto-repeat as `repeat=false` are not guarded.
- Space on the focused toggle has not been observed in a browser. It is unchanged by design.

## Next C checks (exact)
- HOLD-TOGGLE at 1280 and 1440;
- FRESH-TOGGLE, WAVE-REG, HOLD-PLUS-REG, HOLD-ROW-REG and EXPORT-REG at 1280;
- PX-NET and REG-HYD;
- G100-3, run alone (the fake-Bearer row is BLOCKED: backend unavailable in cloud);
- AN-REVIEW: re-run mutations a/b/c; expected HT1 / HT3 / HT3;
- T100-TARGETED: `npx vitest run $(cat a-round-100/targeted-list.txt)`, expected 4 files and 30 tests;
- SOURCE-UNCHANGED: HEAD e2412db, 3 M + 1 ??, frozen list 531/531, end-hashes.txt.
- Gate rows: full vitest, build, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## Scope completed
- T1, HT1–HT3, doc 087 l.4 and doc 088 are done.
- **A-side criteria met:**
  - fail-before matches;
  - mutations a–d each red as specified;
  - typecheck, lint, owned Biome and targeted tests pass;
  - the reviewer ran and its findings were addressed;
  - the end state is as expected.
- **None of C's browser acceptance rows are claimed.**
