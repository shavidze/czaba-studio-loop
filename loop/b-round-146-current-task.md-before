# CURRENT TASK — Round 146: V-0.5a fix-up — the library "▶ Playing" marker on its own line (C-R145-01 + ABL-B-1) and two V-0.5a test-strength gaps

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 145 = **skipped**, "C taskStatus FAIL")
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-145.md`, an exact copy of the round-145 `current-task.md` (sha256 `24e4e438…d571`). Rationale: `b-round-145.md`. Decision record: **D-29z111** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline = the round-145 working tree, not a clean HEAD.** Gate 145 skipped, so HEAD is still **`9a67abd78b41162262c0882544dbdd4544afef1b`**, and A's round-145 changes are uncommitted in the tree: `git status --short` = 15 ` M` + 2 `??`, all byte-equal to `a-round-145/end-sha256.txt` (B checked: `sha256sum -c` OK). **Never revert, stash or rewrite any round-145 change.** Root publishes rounds 145 + 146 together after C PASS (as with rounds 142–144).
- **Frozen list:** `tmp/studio-real-loop/b-round-145-r146-tree-sha256.txt`, **960 entries** = `git ls-files -co --exclude-standard` (965) minus the 5 grants, hashed on the current tree. B ran `sha256sum -c --quiet` from `store/`: OK. The 12 round-145 files that are not granted now are frozen at their round-145 end state.
- **Grants:** `b-round-145-r146-grants.txt` (5 existing files, no new file). **Start hashes:** `b-round-145-r146-granted-start-sha256.txt` (equal to their `a-round-145/end-sha256.txt` lines). **Start copies:** `b-round-145/r146-granted-start/` (paths relative to `store/`). A checks all three first. Any difference → A stops and reports.

## 0. Why this round (D-29z111)
- **Round 145: C FAIL**, `browserVerified` = `realVerified` = true. Every row passed except **LAYOUT-LIB (vi)**: **C-R145-01 (Low)**. While a library preview plays, the row marker `▶ Playing` (42 px) overflows the 126 px option and is clipped at the list edge, so it reads **`▶ Play`**. The row then shows the opposite of its state. This is the deferred **ABL-B-1**, made worse by round 145's longer text.
- **§7 gap, ruled:** round 145 §7 had no row for "C FAIL only on a Low". B rules: **bounded fix-up, same owner.** A waiver was possible under the 2026-10-23 bug gate. B chose the fix because (vi) was the round's own criterion, the round itself made the defect worse, nothing publishes without C PASS, and a waiver re-run would cost a round while still leaving `▶ Play` on screen during playback. The fix is cheap, and it closes ABL-B-1, which this round owns: the 2026-10-23 rule lets a Low be fixed early when the round owns the code. From now on, §7 tables include the row **"C FAIL only on a Low the round caused → bounded fix-up"**.
- **Fix choice (written before C runs).** The marker leaves the meta row and becomes its own line inside the option. It is rendered only while previewing. B rejected `flex-wrap` on the meta row after a real-Chromium probe (`b-round-145/tools/flexprobe.cjs` → `b-round-145/out/flexprobe.json`): with wrapping, the `Error: …` span jumps to its own line (x 47 → 8, y 0 → 16), which would move the `error` state off the baseline. The marker-as-own-line fix leaves `ready` and `error` unchanged, because no new node renders there. In `previewing` the baseline option was already 63.5 px tall, because the clipped marker wrapped onto a second meta line, so the option height should stay the same.
- **Two reviewer Lows of round 145** (A's code-reviewer, test strength, same stage, test-only): exact DM1–DM4 values are unpinned in the unit tests (`A-R145-REVIEW-DM-VALUES`), and the purchased guard errors are checked only with `toThrow(Error)` (`A-R145-REVIEW-GUARD-TEXTS`). With C-R145-01 that is three tightly related items, the policy maximum.
- **m91 (spec error by B, no task):** round-145 §3.5 expected `failed-source-refusal` and `status-announcement-ui` to turn red. Their fake loaders reject with their own hand-written `LOADER_ERROR` literal, so no source mutation reaches them. The m91 list was wrong. These fixtures stay hand-written (GATE132-S4: pins must not be wired module-against-module). Nothing is scheduled.
- **Checks at planning:** regression due on/after 2026-10-27 (today 2026-10-24, not due); `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist; no Critical/High open; no Medium open except Tech Lead manual items.

## 1. What changes (user-visible)
| ID | Where | Before (round-145 tree) | After (exact) |
|---|---|---|---|
| PM1 | `ArrangementLibrary.tsx`, `ArrangementLibraryOptionInner`, l.126–128 | `{isPreviewing ? (<span className="text-brand">{studioSourceLoadStrings.rowPreviewing}</span>) : null}` is the **third child of the meta row** `<span className="flex gap-2 text-xs tabular-nums text-muted">` | The meta row ends after its second child. Its className and both children are byte-identical. Directly after the meta row's closing `</span>`, as the **last child of the `role="option"` button**: `{isPreviewing ? (<span className="whitespace-nowrap text-xs text-brand" data-testid="arrangement-library-option-previewing">{studioSourceLoadStrings.rowPreviewing}</span>) : null}` |

- Text stays `▶ Playing` (`studioSourceLoadStrings.rowPreviewing`, unchanged). The button stays `flex w-full flex-col …`, so the marker becomes its own line under `SFX 00:02.000`.
- No other line of `ArrangementLibrary.tsx` changes: no class, condition, testid (except the one new testid above), import or Georgian line. Biome may wrap the JSX. ST47's content ledger is unaffected because no Georgian line moves.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLibrary.tsx` | PM1 only |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | one new `it` **LRS3** (§3.1). LRS1/LRS2 unchanged |
| `app/data/__tests__/studio-lab-demo.test.ts` | one new `it` **DL-VAL** (§3.2); the 4 `it` titles at l.115, l.126, l.132, l.173: the word `Georgian` → `English` (they would be false now). Nothing else |
| `app/lib/arrangement/__tests__/collection.test.ts` | PC2 (l.140–157): the three `.toThrow(Error)` at l.143, l.153, l.156 → exact-message assertions (§3.3). `it` title and fixtures unchanged |
| `docs/implementation/2026/quarter-IV/119-studio-v0-library-source-strings.md` | status line l.4 → `In Progress (C round 145 — FAIL: C-R145-01 Low; round 146 fix-up — C ჯერ არ გაშვებულა)`. One new Problem → Solution bullet (C-R145-01/ABL-B-1, why the marker gets its own line, why `flex-wrap` was rejected: B probe). The m91 bullet gets one appended sentence saying B confirmed it as a spec error (D-29z111). Testing: the `C round 145 … ჯერ არ გაშვებულა` line → the real round-145 result (PASS rows, FAIL LAYOUT-LIB (vi)), plus one line for round 146 (A tests; C pending). "შეცვლილი ფაილები" gets the 4 round-146 code/test files. Georgian, `GEORGIAN_DOCS.md` |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Before the first Edit** read the primitives the hook maps for these files: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md` (Studio), `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`. Round 145 deviated by reading four of them after the first edits. Do not repeat that.
- **Edit rule (C-R120-01):** lasting edits only through Edit/Write; no shell writes under `store/`. A Biome-forced rewrap is allowed and reported; no `--write`/`check:fix`.
- **Stop rule:** A stops and reports, without widening scope, if a start check fails, a non-granted test fails, a diff appears outside the grants, or a needed change is not in this table.

## 3. A — tests and mutations
### 3.1 LRS3 (`library-row-strings-ui.test.tsx`, 2 → 3 `it`). This is a structural pin. The real check is C's browser row
Use the existing `mountRows` / `libraryRow` harness. Before the preview: no `[data-testid="arrangement-library-option-previewing"]` in the `song` row. After the preview starts: exactly one such element, with text `▶ Playing` (hand-written), and its `parentElement` is the `role="option"` button of `song` (`libraryRow(view, 'song')`), **not** the meta row. The meta row (the button's child that contains the duration text) has exactly 2 child elements, and its `className` contains `flex` and does not contain `flex-wrap`. After stop: the element is gone.
### 3.2 DL-VAL (`studio-lab-demo.test.ts`, +1 `it`)
Against `studioLabDemoCollection`, with hand-written literals (no import from the data module's constants):
- `label` === `Demo collection · CZABA public previews + synthetic sounds`;
- `notice` === `The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.` (U+2014);
- the **set** of `collectionLabel` values over `sources` equals exactly `{ 'CZABA public previews + synthetic SFX', 'Synthetic demo · ღამის პულსი' }`. The Georgian sound title is test data (R3). B checked: this file currently has 0 Georgian lines, and no test sweeps it for Georgian (`strings.test.ts` ST13/ST47 do not list it), so this one literal is allowed here.
- Also assert the codepoints: `·` is U+00B7 and `—` is U+2014.
### 3.3 PC2 exact messages (`collection.test.ts`)
- l.143 (empty stems) → `.toThrow('The purchased collection has no stems')`;
- l.153 (duplicate id) → `.toThrow('A stem id repeats in the purchased collection')`;
- l.156 (empty productId) → `.toThrow('The purchased collection has no productId')`.

Hand-written literals; no import of `studioSourceLoadStrings` for these. If `toThrow(string)` matches a substring, that is accepted, because each literal is the whole message.
### 3.4 Mutations (Edit, restore by Edit, verify by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m97 | PM1 reverted: the marker span back inside the meta row (as in the round-145 tree) | LRS3 |
| m98 | `ArrangementLibrary.tsx` meta row className gets `flex-wrap` | LRS3 |
| m99 | `studio-lab-demo.ts` DM4 notice: `—` → `-` | DL-VAL |
| m100 | `strings.ts` `purchasedNoStems` → `'The purchased collection has no stem'` | PC2 (and ST45) |

m99 and m100 mutate frozen files. Edit each one temporarily, restore it, and check it with `sha256sum -c b-round-145-r146-tree-sha256.txt --quiet` before any other step. A frozen-list failure at the end = stop and report.
### 3.5 Commands (speed rules)
- **Start:** frozen list (960) OK; 5 start hashes and copies OK; `sha256sum -c a-round-145/end-sha256.txt` OK; HEAD = 9a67abd; `git status --short` = the same 15 ` M` + 2 `??` as A round 145.
- `npm run typecheck` and `npm run lint` exit 0; read-only `npx biome check` on the 4 changed code/test files → 0 diagnostics.
- `npx vitest run` on: library-row-strings-ui, studio-lab-demo, collection, strings, library, collection-load-status, purchased-collection-ui, library-preview, held-enter-add, render-budget. Save `a-round-146/vitest.json`. Report per-file runtime `it` counts against A round 145 (`a-round-145.md`). Only library-row-strings-ui (2 → 3) and studio-lab-demo (12 → 13) may change.
- **code-reviewer** required (3+ changed files); pass its Architecture note to B.
- **End:** frozen list OK; `git status --short` = the round-145 set (15 ` M` + 2 `??`, unchanged list); the paths whose hash changed vs `a-round-145/end-sha256.txt` are a subset of the 5 grants; `git diff 9a67abd -- <protected>` empty; `diff b-round-145/r146-granted-start/app/components/arrangement/ArrangementLibrary.tsx app/components/arrangement/ArrangementLibrary.tsx` = PM1 only; end sha256 of the 5 grants in `a-round-146/end-sha256.txt`; diff vs start copies in `a-round-146/diff-vs-start.patch`.
- Not run: full suite, `npm run verify`, build, e2e (gate). No commit, stash, checkout, install.
- Optional A-only sanity probe in real Chromium (not acceptance). Write `a-round-146.md` as you go.

## 4. C — rows (bounded: round-145 rows that passed with evidence are not repeated)
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, fresh context per session, Snap state recorded at start (default off). Both viewports: 1440×900 and 1280×720. Reuse `c-round-145/tools/{lib,layout145,overflow145,c145}.cjs` freely; every output new under `c-round-146/`. **Harness notes:** (1) the rows now read `Loading…`; keep the wait that accepts both. (2) `layout145.cjs` named the marker `opt:…:meta2` (third meta-row child). It is now a **sibling after the meta row**, `[data-testid="arrangement-library-option-previewing"]`. Relocate the locator and say so in the report.

| Row | Start state → action → expected |
|---|---|
| T146-TARGETED | A's vitest list; counts equal A's |
| SOURCE-SCOPE | frozen 960 OK at start and end; only granted paths differ from `b-round-145/r146-granted-start/`; end hashes = `a-round-146/end-sha256.txt`; `git status --short` = the round-145 set; the `ArrangementLibrary.tsx` diff vs the start copy = PM1 only; protected diff vs 9a67abd empty; the non-granted round-145 files still match `a-round-145/end-sha256.txt`; no source change during C's phase |
| AN-REVIEW | PM1 exact (classes, testid, position = last child of the option button, meta row byte-identical); LRS3, DL-VAL and PC2 assert what §3 says with hand-written literals; doc 119 has only the §2 edits, is Georgian and consistent with the evidence |
| PLAY-MARKER | fresh `ready` → click the **Soft impact** option → press the preview play button: (a) the marker element shows `▶ Playing` **in full on screen**: its box (may be the full 110 px content width: flex stretch) and its text glyph extent (Range rect) lie inside the option content box (x ≥ option x + 8 − 1, right edge ≤ option x + 126 − 8 + 1), one line (h 16 ± 1), and `elementFromPoint` at its centre and near its right end returns the marker. Element screenshot at both viewports. (b) real playback: the preview waveform's `aria-valuenow` advances within 1.5 s and ≥ 1 `createBufferSource`. (c) press the button again → the marker is gone and the option returns to its `ready` box. (d) start a preview on a second source (Slow rise): the marker moves to that row and Soft impact has none |
| LAYOUT-LIB | states reproduced exactly as in round 145 (`ready`: fresh, loaded, Snap off; `previewing`: from `ready`, click Soft impact, press preview play; `error`: separate fresh context with `page.route('**/middle-east.mp3', abort)` before navigation; no scroll, search or other selection), compared with `b-round-144/out/libbase-{W}.json`:<br>(i) `ready` and `error`: **every** library node d ≤ 1 px vs libbase (as measured in round 145; no exception applies);<br>(ii) `previewing`: the Soft impact option box = libbase previewing ± 1 px (1440 `[148,370,126,63.5]`, 1280 `[148,408,126,63.5]`); its meta row, `meta0` and `meta1` = their libbase **ready** boxes ± 1 px (h 16, one line); the marker box x = 156 ± 1, y = meta-row y + 16 ± 1, h 16 ± 1, right edge ≤ 266 + 1. The span box may span the full 110 px content width (flex-col stretch); w = 110 is expected, not a delta. Legibility is judged by the glyph extent (a Range rect of its text) lying inside the option and by `elementFromPoint`;<br>(iii) every other library node in `previewing` = libbase previewing ± 1 px (no y shift);<br>(iv) option and list: `scrollWidth == clientWidth` in all three states (round 145: list 155 vs 134 while previewing);<br>(v) tree and list still scroll to their last item; no horizontal page overflow; no clipped row text.<br>Report every > 1 px delta with its cause. An unexplained delta = FAIL. If (ii) differs from B's prediction but has no overflow, clipping or overlap, report the measured boxes as inconclusive for B, not as FAIL |
| LAYOUT-REST | outside the library column nothing moves: d ≤ 1 px between `ready` and the same viewport's `previewing` / `error`; library root = libbase ± 1 px |
| LIB-ROW-TEXT-SMOKE | one short re-check per viewport: abort `**/middle-east.mp3` → row meta `Music` + `Error: File failed to load (network)`, on the same line layout as round 145, and **no** previewing marker anywhere |
| PURCHASED-LABEL | BLOCKED (backend unavailable in cloud); unit evidence only (collection.test l.84 + PC2) |
| G146-3 (alone, last) | `/studio-lab` shows the workspace and demo badge in a fresh anonymous context; `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`; `GET /api/studio-token?…` → 401; fake-Bearer 403 BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror (the known cart noise is expected) |

- **Gate rows (not claimed by C):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbour risk:** the option's click/double-click/drag/Enter handlers. The new span sits inside the button, so clicks on it must still select the source: C clicks the marker itself once and checks `aria-selected` stays true. Library preview start/stop; render-budget (the memo option re-renders on `isPreviewing`, unchanged).

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Visible "now previewing" state of a browser item | Live 12 Reference Manual, "Working with the Browser", Previewing Files (§4.x), https://www.ableton.com/en/live-manual/12/working-with-the-browser/ (capture `b-round-144/live/working-with-the-browser.html`, fetched 2026-10-24) | B did not confirm a text marker in the capture; Live shows preview state in the browser's preview area, not as a row badge (unconfirmed) | CZABA-only row marker (existing since before round 17); the fix only makes it legible; no Live parity claim | PLAY-MARKER |

C rates "CZABA requirement met" and "Ableton correspondence" separately. Correspondence here is "unconfirmed / not applicable".

## 6. Evidence and reporting
- C writes `c-round-146.md` and `c-round-146.json` as it goes: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `measurements` (marker boxes, option/list scroll widths, LAYOUT-LIB deltas with causes), `invalidRuns`, `notesForB`. Evidence goes under `c-round-146/{tools,out,shots}/`; no writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.

## 7. Outcome, fixed in advance (B at round 147 planning)
| Condition | Round 147 |
|---|---|
| B plans on or after **2026-10-27** | the **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | a bounded fix-up (≤ 3 related bugs) |
| C FAIL only on a Low this round caused | a bounded fix-up, same owner |
| C FAIL only on a literal criterion with no app defect, or LAYOUT-LIB (ii) inconclusive only | B rules in writing; the next round is a re-check only, or V-0.5b carries the ruling |
| C PASS (new unrelated Lows → `deferred_low_polish`) | root publishes rounds 145 + 146 together; V-0.5a → `c_pass`; C-R145-01, ABL-B-1, C-R142-02 and the two A-R145 review Lows close; round 147 = **V-0.5b**: the rest of `ArrangementLibrary.tsx` (16 lines, incl. `All` per Live §4.2, fold/unfold per §4.5, search copy), `ArrangementLibraryPreview.tsx` (8), `collection.ts` status messages (10) |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Root notes
- **Commit readiness:** nothing is publishable now (gate 145 skipped). After C round 146 PASS, root may publish rounds 145 + 146 together as V-0.5a.
- **Architecture:** the strings-split checkpoint request (`b-round-136-checkpoint-request.md` + addenda, now with a round-145 addendum) stays open and non-blocking. Best before V-0.5c.
