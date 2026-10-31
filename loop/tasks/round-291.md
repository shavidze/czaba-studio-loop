# Round 291: FIX-PD-1b2. Library group heading hidden from the accessibility tree (GATE289-S1, Medium), doc 216 wording (GATE289-S2, Medium), stable group keys (GATE289-S3, Low), ST47/ST51 names (A-R289-REVIEW-L2) + RT-FIX-291

**Planned by:** B, at the round 290 → 291 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z719:** round 290 (RETRO 290) is closed. C failed only RT-CAUSE (C-R290-01, Low, origin B spec). Every other row passed, with `browserVerified` and `realVerified` both true. B corrected `retros/retro-290.md` l.87 at this planning; RT-FIX-291 re-checks that line.
- **D-29z720:** this round's scope, the key ruling and the doc split.
- **D-29z721:** the new Low B-R290-LIB-SHAPE-SWITCH-FOCUS goes to `deferred_low_polish`, plus two retro candidates.
- **D-29z722:** the order after this round.

**Owner:** A. **Verifier:** C. **Grants:** §4.
- This round touches no Store, auth, cart, checkout, purchase or protected file.
- It touches no audio, playback, export or video code.

## Baseline: HEAD `5a911ff` [K1], clean tree [K2]
- `gates/gate-round-290.json` is `skipped` (C FAIL), so no commit was added. `gates/gate-round-289.json` is `published 5a911ff` [K1].
- **Frozen list:** `b-round-290-r291-tree-sha256.txt`, 1,157 entries. It is byte-identical to the round-290 list, and `sha256sum -c` gives rc 0 [K3]. Each of the 7 protected files appears once [K4].
- **Claims (L29, L56):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-290/claims-291.sh` **before editing**. Its output must equal `b-round-290/claims-291-output.txt`; any difference is a STOP (§8).
  - After A's edits, K3 rc, K5, K6, K7, K8, K11 and K16 change on purpose; §6 lists the new values.
  - If HEAD moves through a root-only commit and `git diff 5a911ff HEAD -- app docs` stays empty, that is accepted with a note.

## 0. Read first
1. `lessons.md` (every role), especially L4 (ruling lines), L11, L12, L23, L26, L28, L29, L47, L50, L52 and L56.
2. This task.
3. `gates/round-289/review.md` suggestions 1–3. `tasks/round-289.md` §3.2 is the original group-heading contract.
4. A's primitives:
   - `AGENT_DISCOVERABLE_CODE.md` and `FORWARDREF_COMPONENT.md` (component edit);
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (no class changes are expected);
   - `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
   - `GEORGIAN_DOCS.md`.

## 1. Why, and the promise
**Promise (L55):** "a library where a screen reader hears each collection name once, as the group name, and focus never jumps to the page when the result list changes around it."

**What happens at HEAD:**
- **S1, measured in Chromium** (`b-round-290/probe/ax-before.json`, both viewports [K17]):
  - Each `role=group` in the listbox has an un-ignored generic child carrying the heading text. `ariaSnapshot` shows `- text: CZABA public previews + synthetic SFX` and `- text: Synthetic demo · Night Pulse` as items next to the options, and the same strings are the group names.
  - The heading is the `div` with `id={headingId}` [K5]. This is the "read twice" the gate reviewer predicted.
- **S2:** doc 216 l.17 [K8] says the collection "always shows" (`ყოველთვის ჩანს`). That is false:
  - when a search narrows the results to one collection;
  - in a purchased library, which has a single collection.

  In those cases the card shows only the short title. The full title `<composition> · <part>` appears in the option's hover `title` and in the preview title [K9], and the hover `title` is also the option's accessible description.
- **S3:** the group `key` is `headingId`, which is built from `runIndex` [K5]. When results change, a group whose index shifts, or whose first option disappears, remounts with all its options. A focused option then loses its DOM node and focus falls to `body`. B reproduced this on a scratch copy of HEAD; see §5, M1.
- **L2:** the ST47 and ST51 test names [K7] still describe a Georgian exception list that round 289 emptied.

## 2. Reference
**Not applicable:** this is a bug-fix and doc round (reference-first exempts it). The group heading is still the deviation that task 289 §2 listed. Its Ableton status stays "not confirmed" until LIVE-MEAS-BROWSER-SEARCH-LOCATION is measured.

**Screen budget:** nothing visible changes. B-SCREEN proves it.

## 3. What A changes
### 3.1 `app/components/arrangement/ArrangementLibrary.tsx`
1. **S1.** Add `aria-hidden="true"` to the heading `div` (`id={headingId}`) [K5].
   - Do not change its `id`, classes or text.
   - Do not change the group's `aria-labelledby`. `aria-labelledby` still uses aria-hidden content, so the group name stays the same.
2. **S3.** Key each group `div` by a value that stays the same in two cases:
   - (a) a whole run **before** it disappears;
   - (b) the **first option of its own run** disappears.

   B's sketch adds `key: \`${label}#${occurrence}\`` to each run in `libraryResultRuns` [K6], where `occurrence` is the 0-based count of earlier runs with the same label (`b-round-290/sketch-library.diff`). A may use another key that satisfies LG8. **`key={results[run.start].id}` does not satisfy LG8** (M2, §5).
   - `headingId` stays index-based. It only links the `id` and `aria-labelledby`, both on elements that stay mounted.
3. **No other change.** That includes:
   - the run computation's output order;
   - `resultIds`;
   - focus and roving logic;
   - the `biome-ignore` line;
   - the flat branch.

### 3.2 `app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx`
- Add a fixture `threeRunSources`, as in `b-round-290/sketch-tests.diff`:
  - `a-one` "Alpha one" with label A;
  - `b-one` "Beta one" and `b-two` "Kick two" with label B;
  - `c-one` "Kick three" and `c-two` "Kick four" with label C.
- Append these rows. **LG1–LG7 do not change** (ruling line R3).
  - **LG8** (`it.each` over two cases). Mount the fixture. Groups = `['Label A','Label B','Label C']`. Focus the option named below and keep a reference to its element. Then `typeLibraryQuery(view, 'kick')` (`fireEvent.change`, which does not move focus), flush frames and async work. Expect:
    - groups = `['Label B','Label C']`;
    - options = `['b-two','c-one','c-two']`;
    - the kept element `isConnected === true`;
    - `document.activeElement` is that same element.

    The cases: `c-two` (case a: run A disappears) and `b-two` (case b: `b-one` disappears).
  - **LG9.** For each label A/B/C, `within(listbox).getByRole('group', { name: label })` resolves. The element named by its `aria-labelledby` has `textContent === label` and `aria-hidden === 'true'`.

### 3.3 `app/lib/arrangement/__tests__/strings.test.ts`
Rename two test titles only [K7]. Do not change the bodies or the arrays.
- ST47 → `'ST47: the library, preview, collection and demo sources have no Georgian lines'`
- ST51 → `'ST51: every Studio workspace source, found by a directory walk, has no Georgian lines'`

### 3.4 Docs
1. **`docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md`: l.17 only** [K8]. Replace the whole line with exactly:
   `**დაპირება:** ინგლისური Studio UI, სადაც კოლექციის სახელი ყველა ბარათზე აღარ მეორდება. Heading ჩანს მხოლოდ მაშინ, როცა შედეგები ≥ 2 კოლექციას მოიცავს. ერთი კოლექციის ძიებასა და purchased library-ში ბარათი მოკლე სათაურს აჩვენებს, სრული სათაური კი (\`<კომპოზიცია> · <ნაწილი>\`) ჩანს hover \`title\`-ში, accessible description-სა და preview-ის სათაურში (SABA-Q-LIB-SINGLE-RUN — Saba-ს კითხვა, 2026-10-31).`
   - l.4 stays byte-identical (ruling line R2).
2. **New `docs/implementation/2026/quarter-IV/217-fix-pd-library-heading-a11y.md`.** The last number is 216, and 217 is free [K11]. Precedent: doc 215 was the fix-up of 214.
   - Use the TEMPLATE headings (L26), in Georgian with English terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 291 PASS)` (L28).
   - Cite only test ids that exist (LG8, LG9, ST47, ST51).
   - Record the key choice and why the first-id key was rejected (M2).
   - Record the deferred Low B-R290-LIB-SHAPE-SWITCH-FOCUS under TODO.

### 3.5 Ruling lines (L4)
- **R1. Heading `div`:** §3.1(1) `aria-hidden` wins over §3.1(3) "no other change". Its box must stay equal (B-AX bbox, B-SCREEN).
- **R2. Doc 216:** §3.4(1) l.17 wins over L28's "l.4 final"; l.4 does not change. L28's multi-stage clause does not apply, because 217 is a separate fix-up doc.
- **R3. `library-group-heading-ui.test.tsx`:** §3.2 "append" wins over any wish to refactor LG1–LG7; their lines stay byte-identical, and only the fixture and LG8/LG9 are added.
- **R4. `strings.test.ts`:** §3.3 rename wins over A-R289-REVIEW-L3 (deferred). Nothing in the file moves except the two title strings.

## 4. Grants (exact)
| Path | What |
|---|---|
| `app/components/arrangement/ArrangementLibrary.tsx` | §3.1 only |
| `app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx` | §3.2 only |
| `app/lib/arrangement/__tests__/strings.test.ts` | §3.3 only (2 titles) |
| `docs/implementation/2026/quarter-IV/216-fix-pd-demo-names-group-heading.md` | l.17 only (§3.4(1)) |
| `docs/implementation/2026/quarter-IV/217-fix-pd-library-heading-a11y.md` | new |

**Frozen:** everything else in the frozen list. In particular:
- `library.ts`, `collection.ts`, `strings.ts`, `studio-lab-demo.ts`, `ArrangementLibraryPreview.tsx`, `ArrangementContext.tsx` and `library.test.ts`;
- every Store file;
- the 7 protected files [K4];
- `package.json` and the lock file.

**code-reviewer:** required, because 5 files change. Pass its Architecture note on to B. A-R289-ARCH-GROUP-RUNS stays a signal; do not extract `groupLibraryResults` this round.

## 5. B pre-check (L23, L52, L56, on a scratch copy of `5a911ff`)
- **Where:** `/tmp/b290scratch`, a `git archive` copy with `node_modules` symlinked. /tmp does not survive the job; the diffs and logs are kept.
- **The sketch:**
  - `b-round-290/sketch-library.diff` (§3.1);
  - `b-round-290/sketch-tests.diff` (§3.2 and §3.3, after `biome check --write`).

  The sketch is a reference, not a grant: §3 governs.
- **Checks:**
  - `tsc --noEmit`: rc 0.
  - `biome check` on the 3 code files: rc 0.
  - **15 covering files, 258 tests passed** (`b-round-290/scratch-covering.log`): studio-lab-demo, strings, library, collection, library-focus-handoff, library-notice-ui, library-preview, library-row-strings-ui, library-video-return-focus, purchased-collection-ui, collection-load-status, held-enter-add, tempo-seed-ui, floating-video and library-group-heading-ui.
- **Mutants** (log files in `b-round-290/`):

  | Mutant | Change | Result |
  |---|---|---|
  | M1 | HEAD key `key={headingId}` | LG8 c-two and b-two red (`mutant-M1-runindex-key.log`) |
  | M2 | `key={results[run.start].id}` (the reviewer's suggestion) | LG8 b-two red only (`mutant-M2-first-id-key.log`) |
  | M3 | `aria-hidden` removed | LG9 red (`mutant-M3-no-aria-hidden.log`) |

  The first scratch run is in `b-round-290/sketch-results.txt`.
- **Browser:** the sketch ran on a second dev server (:5174, own `cacheDir`, L38), probed by `b-round-290/probe/ax-probe.mjs` (`ax-sketch.json`) [K18]:
  - 0 non-option children and 0 `text:` lines in the groups;
  - group names unchanged;
  - group children 4 and 5;
  - listbox bbox equal to HEAD at both viewports (1440: 144,217 144×463; 1280: 144,255 144×245).
- **Focus origins (L50):** the regex hits 17 lines in the granted component [K12], listed in `b-round-290/l50-hits.txt`.
  - **Ruling:** all 17 are unchanged code and out of scope. The library focus tests in §5's covering set cover them.
  - The changed line is the group render. Its ternary `{libraryResultRuns.length >= 2` is on l.660 [K12], and the regex misses it because the `?` is on the next line (RC-R290-L50-MULTILINE-TERNARY). B adds it by hand: LG8 is its focus row, and the focus target is the same option element (L47).
- **Not covered here:** the grouped ↔ flat switch (≥ 2 runs → 1) still remounts. That is B-R290-LIB-SHAPE-SWITCH-FOCUS, a pre-existing Low, deferred. Typing moves focus to the search box, so the demo cannot reach it.
- **Timeout headroom (L31):** the heading tests take 0.1–0.4 s each under the 5 s default. `strings.test.ts` gains no rows.

**A's covering run** (speed rules):
- `npm run typecheck`;
- `npm run lint`;
- `npx vitest run` on the 15 files above. Expected: 15 files and 258 tests, of which LG8 counts 2 and LG9 counts 1.

## 6. C acceptance (browser rows at 1440×900 and 1280×720)
- Use a fresh context with empty storage, and wait for `Demo collection ready` (L48) [K19]. Warm up first (L38).
- **For HEAD values, use B's `ax-before.json`.** If C wants a live HEAD server, it gets its own `cacheDir`.

| Row | What C checks | Pass |
|---|---|---|
| CLAIMS | <ul><li>**Planning values:** `b-round-290/claims-291-output.txt` was produced at `5a911ff` on a clean tree. C checks every planning value against HEAD with `git show 5a911ff:<path>` where a line depends on the tree (K5–K8, K11, K12, K16).</li><li>**On A's tree,** `claims-291.sh` must give the planning output for K1, K4, K9, K10, K13, K14, K15, K17, K18 and K19. These are expected to differ:<ul><li>K2: the tree is now dirty, with the 5 §4 paths;</li><li>K3: rc ≠ 0, failing only on the 4 granted existing paths;</li><li>K5: the 3 `headingId` lines (moved by the run-key lines), and `aria-hidden` count 8;</li><li>K6: one `runs.push` site;</li><li>K7: 2 titles, 0 stale hits;</li><li>K8: no `ყოველთვის ჩანს` hit, l.4 unchanged;</li><li>K11: `217 1`;</li><li>K12: the ternary line moves; the count stays 17 unless A's key code adds a matching line (a `?` or `&&` render). That is allowed, gets the §5 out-of-scope ruling, and A names it in the report;</li><li>K16: LG1–LG9;</li><li>K19 unchanged.</li></ul></li><li>C also runs the L29 untagged-fact grep over this task.</li></ul> | each value as stated; no untagged fact |
| SOURCE-SCOPE | `git status` and `git diff 5a911ff` | only the §4 paths. Each diff matches §3: doc 216 differs on l.17 only, and strings.test.ts differs in 2 title strings only. `sha256sum -c` of the frozen list fails only on the 4 granted existing paths |
| TYPECHECK | `npm run typecheck` | rc 0 |
| UNIT | the 15 files of §5 | all pass; LG1–LG9, ST47 and ST51 present by name |
| UNIT-MUTANTS | C's own M1, M2 and M3 on a scratch copy | M1 → both LG8 cases red; M2 → LG8 b-two red; M3 → LG9 red. The live tree sha is unchanged |
| B-AX | `node ../tmp/studio-real-loop/b-round-290/probe/ax-probe.mjs <out> after`, All view, fresh load | per viewport: <ul><li>`nonOptionChildrenInGroups` 0 and `textLinesInSnapshot` 0 (HEAD: 2 and 2 [K17]);</li><li>group names exactly `CZABA public previews + synthetic SFX`, then `Synthetic demo · Night Pulse`;</li><li>group child counts 4 and 5, all `option`;</li><li>listbox bbox equal to `ax-before.json` (±0.5 px)</li></ul> |
| B-KEYS-291 | focus the first option, then ArrowDown ×8 and ArrowUp ×8, 250 ms apart | `document.activeElement` visits the 9 ids of task 289 B-KEYS in order and back (`demo-middle-east` … `demo-stem-lead`), never a heading, with a visible ring |
| B-STATES-291 | (a) click the `Synthetic demo · Night Pulse` tree node [K19]; then `All` and the search `Search the library` [K19]: (b) `bass`; (c) `synthetic` | (a) 0 groups, 5 options; (b) 0 groups, 1 option `demo-stem-bass`; (c) 2 groups with the names above and 9 options, and still 0 `text:` lines in the `ariaSnapshot` |
| B-SCREEN (L39) | full-window screenshots of the All view, HEAD (`b-round-290/probe/ax-before-*.png`) vs A, and a clip of the library list | no visible difference in the list. Heading boxes ±0.5 px. No new persistent element (persistent text-line count unchanged) |
| B-JOURNEY-291 (L54) | fresh load → click `Bass` → Enter → Play → after 1.5 s → Stop | status starts `“Night Pulse · Bass” added to the Music track`; `[data-testid=arrangement-position]` ≥ `00:01.000` at 1.5 s; `data-playing` false → true → false [K19] |
| G291-AUTH | dev :5173, fresh context | <ul><li>`/studio-lab` opens anonymously, with the `Demo collection — no sign-in required` badge and `localStorage.auth_user` null [K19];</li><li>`/studio/middle-east` shows `Sign in required` [K19], with 0 `audio[src]`;</li><li>the token API returns 401 with no header, and 403 with a fake bearer when the mock runs (500 with no token when it does not, which fails closed)</li></ul> |
| DOC-216 | doc 216 | l.17 equals §3.4(1) byte for byte; `diff` against `5a911ff` touches l.17 only; l.4 is `**სტატუსი:** Completed (C round 289 PASS)` |
| DOC-217 | doc 217 | l.4 byte-exact; the TEMPLATE headings in order (L26); every cited test id exists; it records the key choice, M2 and the deferred Low |
| RT-FIX-291 | `retros/retro-290.md` | `diff b-round-290/retro-290-before-291.md retros/retro-290.md` = `b-round-290/retro-diff.txt` (l.87 only). The new l.87 matches: <ul><li>`gates/round-276/verify.log` `Test Files 2 failed` [K15] and l.1992–1996 (NS1 old Split title; NS6, TC9 `disabled`);</li><li>GATE276-T1;</li><li>`b-round-289/fails-cause-hand.txt` l.3.</li></ul> Old phrase count 0 [K14] |
| gate | full suite, build, Biome, `verify`, `test:e2e:smoke` | gate rows (not claimed) |

- **`browserVerified`:** true only if B-AX, B-KEYS-291, B-STATES-291, B-SCREEN, B-JOURNEY-291 and G291-AUTH all ran at both viewports.
- **A real screen reader is not available in the cloud.** The Chromium AX tree is the measured proxy, and no row claims NVDA or VoiceOver behaviour.

**Neighbouring behaviour that could break:**
- the library keyboard order and the single `tabIndex=0`;
- option drag start;
- the preview title;
- search states;
- notice dismiss.

B-KEYS-291, B-STATES-291, B-JOURNEY-291 and the 15 covering files cover them.

## 7. Ableton conformity (C reports separately)
- **CZABA requirement:** the collection name is heard once, and focus is stable.
- **Ableton:** not applicable to this fix-up. The group heading stays the listed deviation of task 289 §2.

## 8. STOP conditions (L11)
Write "STOP — needs B ruling" at the top of `a-round-291.md` and change nothing else if:
- the claims output differs before editing;
- a covering test fails, or exceeds 50 % of its timeout;
- Biome asks for a new ignore;
- LG8 cannot pass without touching a frozen file or the flat branch;
- `aria-hidden` changes a group's computed name in jsdom (LG9) or in the browser;
- any two clauses of this task conflict outside the ruling lines R1–R4.

## 9. Why we missed it (gate finding, not Saba-reported; kept short)
- **S1:** task 289 checked group names through DOM and jsdom only. No row read the Chromium accessibility tree, which is where the stray text node shows. Recorded as retro candidate RC-R290-AX-TREE-ROW (watch until RETRO 305). This task applies it as B-AX.
- **S3:** the reviewer's own fix was partial (B-R290-S3-FIRST-ID-KEY-PARTIAL). B found that only because L23/L52 make B run every specified row against a mutant.

## 9b. Deliverables
- **A:** `a-round-291.md`, with the changed files, the covering-run counts (files and tests, LG8 ×2, LG9), the typecheck and lint results, and the code-reviewer output, including its Architecture note. A STOP goes at the top (L11).
- **C:** `c-round-291.md` and `c-round-291.json`, with evidence under `c-round-291/`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `rows`;
  - the HR-C-MANIFEST-FIELDS `manifestPaths`, `missingPaths`, `countMismatches` and `claimCheckMinutes`;
  - an `origin` for each finding (B spec, B pre-check, A, pre-existing or environment).
- **Root:** publish after C PASS and the gate. Changing paths: the 5 in §4.

## 10. Claims (`b-round-290/claims-291.sh`; expected output `b-round-290/claims-291-output.txt`; run from `store/`)
| Tag | Claim |
|---|---|
| K1 | HEAD `5a911ff`; gate 290 `skipped`; gate 289 `published 5a911ff` |
| K2 | `git status --short --untracked-files=all` has 0 lines |
| K3 | frozen list 1157 lines, byte-identical to the r290 list, `sha256sum -c` rc 0 |
| K4 | each of the 7 protected files is listed once |
| K5 | `ArrangementLibrary.tsx` l.666 `key={headingId}`, l.668 `aria-labelledby={headingId}`, l.672 `id={headingId}`; 7 `aria-hidden` in the file |
| K6 | l.205 `runs.push({ label: source.collectionLabel, start: index, end: index + 1 });` |
| K7 | ST47 at l.2482 and ST51 at l.2750 in `strings.test.ts`; 2 stale-title hits |
| K8 | doc 216 l.17 holds `ყოველთვის ჩანს`; l.4 `**სტატუსი:** Completed (C round 289 PASS)` |
| K9 | option `title={source.title}` at `ArrangementLibrary.tsx` l.104; preview `title={source?.title}` at `ArrangementLibraryPreview.tsx` l.251 |
| K10 | the demo has 2 distinct `collectionLabel` constants |
| K11 | the last implementation doc in quarter-IV is 216; 0 files start with 217 |
| K12 | L50 regex: 17 hits in `ArrangementLibrary.tsx`; the group ternary `libraryResultRuns.length >= 2` is at l.660 |
| K13 | every `b-round-290/` artifact this task cites exists, including the 4 probe PNGs and `claims-291-output.txt` (`done`; 21 paths) |
| K14 | retro-290 has the new l.87 phrase once, and the old phrase 0 times |
| K15 | `gates/round-276/verify.log` (ANSI stripped): `Test Files 2 failed \| 218 passed (220)` |
| K16 | `library-group-heading-ui.test.tsx` row ids (`'LG<n>` literals, sorted unique; matches the `it.each` form too): LG1–LG7 |
| K17 | `ax-before.json`: non-option children 2, `text:` lines 2, list heights 463 / 245 |
| K18 | `ax-sketch.json`: 0, 0, 463 / 245 |
| K19 | one hit each: `data-testid="arrangement-position"` and `data-playing=` in `ArrangementTransport.tsx`; the badge `Demo collection — no sign-in required` and `Demo collection ready.` in `collection.ts`; `Sign in required` in `RequireAuth.tsx`; `searchLabel: 'Search the library'` in `strings.ts`; the label `Synthetic demo · <composition>` in `studio-lab-demo.ts` |
