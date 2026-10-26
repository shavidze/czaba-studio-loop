# CURRENT TASK — Round 179: C-R178-BADGE-SELECTOR fix-up (test-only) — two protected suites stop finding the demo / purchased badge by a colour class; DUX-R-5b-3a re-verified on the combined 178+179 tree

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z144** (`backlog.json` → VISUAL-A-OBSIDIAN `dux_r5b3a_fixup_d29z144`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-178.md`, an exact copy of the round-178 `current-task.md` (sha256 `8513b4c6…`, checked with `cmp`). The rationale for this round is in `b-round-178.md`.

## Baseline = HEAD `cc984b6` + the round-178 working tree (gate 178 skipped)
- **Gate:** `gates/gate-round-178.json` is `skipped` ("C taskStatus FAIL"). Nothing was published. HEAD stays `cc984b6`. The round-178 edits (12 ` M` + 2 `??`) are uncommitted and **must be kept as they are**. Do not revert, re-apply or re-format them.
- **Start state:** the tree equals `c-round-178/end-tree-sha256.txt` (1003 files). B confirmed this before and after its own vitest run.
- **Frozen list:** `b-round-178-r179-tree-sha256.txt`, **1000 entries** (1003 minus the 3 grants). It includes every round-178 file at the hash C measured.
- **Grants:** `b-round-178-r179-grants.txt` (3 existing files). **New files:** none (`b-round-178-r179-new-files.txt` is empty).
- **Start hashes:** `b-round-178-r179-granted-start-sha256.txt`. **Start copies:** `b-round-178/r179-granted-start/`.
- **Vitest base:** `b-round-178-r179-vitest-base.txt` (14 files: round 178's `a-round-178/vitest-files.txt` plus `purchased-collection-ui`) is **147/150** on the start tree. The 3 reds are LRS5, PW1 and PW6. Source: B's planning run of the full suite on this tree, **2610/2613** with exactly these 3 reds (`b-round-178/out/vitest-full-r178-tree.json`).
- **A's first step:** check that HEAD = `cc984b6`, `sha256sum -c --quiet b-round-178-r179-tree-sha256.txt` is OK, and the 3 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z144)
- **Round 178: C FAIL, one Medium** (`c-round-178.json`), with `browserVerified` and `realVerified` both true.
  - **Product change: PASS in the browser.** 13 browser rows passed at both viewports: INVENTORY-GREP, CC-TEXT, NO-BRASS-TEXT, CONTRAST-TEXT, REFUSAL, EXPORT-STATES (a/b/c), FUNC-SMOKE-TEXT, ENV-VIS, RV1, RV3-STORE, G178-3, PX-NET and REG-HYD.
  - **The failure is in tests only.** `library-row-strings-ui` LRS5 (l.330) and `purchased-collection-ui` `badgeText()` (l.230; PW1, PW6) find the header badge with `querySelector('span.border-accent')`. Round 178 W2 removed that colour class.
  - Both files were protected in round 178, so A could not fix them. B missed `purchased-collection-ui` while planning (B-R178-PLAN-GAP-TEST-SELECTORS).
  - Root's full vitest would fail on these 3 tests, so the round cannot be published. **5b-3a → ბაგია** until this round passes.
- **This is a bug fix round (one Medium), placed before new scope by the bug gate.** It is test-only: no product source changes. **Regression:** `regression-last.json` = 2026-10-24, due on or after 2026-10-27. Today is 2026-10-26, so it is not due.
- **B rulings on round 178** (recorded in `backlog.json`):
  - **SOURCE-SCOPE / AN-REVIEW: accepted.** Biome re-wrapped StudioWorkspace l.2605 (1 → 4 lines), DetailPanel l.676 (1 → 3 lines) and the `surfaceForbidden` array. C confirmed the reflow is whitespace only, with the same tokens. §3.2 l.143 had anticipated it.
    - **Standing rule from now on:** B's scope criteria say "hunks only at these sites; formatter reflow allowed", not literal line counts.
  - **C-R178-INV-GROUPHEADER-252: classified as K10 (kept).** `ArrangementGroupHeader.tsx` l.252 has `border border-brand` on the group-name rename input, an edit-state text field. The same K10 class covers the MarkerRow name field l.847 and the Library search `focus:border-brand`. The file stays protected and untouched (vetoable, like all K sites). The 5b-3b stage-exit INVENTORY-GREP maps it to K.
  - **C-R178-EXPORT-CLIPS-AT-0DB** and **C-R178-ESC-NO-DRAG-CANCEL**: info signals, not scheduled.
    - The first is the existing overload detection working on a hot demo mix.
    - The second is pre-existing behaviour. B makes **no** Ableton parity claim for Escape during a drag, because no source was captured. Both are listed in `feature-status.md` as product questions.
- **Rule against repeating this gap:** before freezing the grants of every token-swap round, B greps all of `app/**/__tests__` and `e2e/` for **selectors** (`querySelector*`, `closest`, `getElementsByClassName`) on the tokens being removed. For 5b-3b, C's SELECTOR-SWEEP row in this round provides that list in advance.

## 1. What changes (exact)
| ID | File : line (start tree) | Change |
|---|---|---|
| F1 | `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` l.229–231 `badgeText()` | Stop selecting by a colour class. New body: take `headerOf(view).querySelectorAll('span')`, keep the spans whose trimmed `textContent` equals `PURCHASED_BADGE` or `DEMO_BADGE` (the file's own constants, l.32 and l.39). If more than one span matches, throw a labelled `Error` (e.g. `'header shows more than one collection badge'`). Return the single match's trimmed text, or `null` when none matches. The selector must contain no class token at all. |
| F2 | `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` l.329–330 (LRS5) | Replace the `span.border-accent` lookup. If `header` is null, throw a labelled `Error('workspace header missing')`. Then `expect(within(header).getByText(DEMO_BADGE, { selector: 'span' }).textContent?.trim()).toBe(DEMO_BADGE);` (`within` is already imported). |
| F3 | `docs/implementation/2026/quarter-IV/147-studio-dux-r5b3a-label-status-colour.md` | (a) In „პრობლემები და გადაწყვეტები“, add one Problem → Solution entry in Georgian. **Problem:** two protected suites found the badge by the colour class `span.border-accent`, so 3 tests (LRS5, PW1, PW6) failed after W2 (C-R178-BADGE-SELECTOR). **Solution:** round 179 finds the badge by its text, with no class selector. (b) In „შეცვლილი ფაილები“, list the two test files under "Round 179". (c) In „ტესტირება“, record the round-179 counts and mutations m288–m290. (d) Add one sentence for the Biome reflow ruling. Status: `In Progress (awaiting C round 179)`. Nothing else. |

**Constraints:**
- **PW1 and PW6:** every assertion stays as it is, including PW1's `not.toContain('Demo collection')` / `not.toContain('no sign-in required')` lines. These are the discriminating half: `badgeText` returns whichever known badge is shown, so PW1 fails if the demo badge appears.
- **LRS5:** every other line stays the same.
- **Other test content:** no other test, helper, import or expectation changes. The only exception is adding `within` to an import, if F1 needs it, but F1 as written does not.
- **No colour-class selectors:** neither file may hold a selector on a `border-`, `text-`, `bg-`, `accent-` or `ring-` class.
- **No product source changes.** No `data-testid` is added either: that would re-open `StudioWorkspace.tsx`, which is frozen at its round-178 hash.

## 2. A — files you own (everything else is frozen)
- **The 3 grants:** `library-row-strings-ui.test.tsx` (**only l.329–330**), `purchased-collection-ui.test.tsx` (**only `badgeText`, l.229–231**), and doc 147.
- **Frozen at their round-178 hashes:** every round-178 file. That covers the 5 components, the 6 test files, `label-status-colour-ui.test.tsx` and doc 146.
- **Protected, byte-identical** (as in round 178 §2): every other component and test, `app/styles/`, `Modal.tsx`, `strings.ts`, `collection.ts`, `view.ts`, `root.tsx`, every route (including `studio.$productId.tsx` and `studio-lab.tsx`), `app/components/studio/*`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase/download/studio-token files, and `.claude/**`.
- **Process rules:**
  - Make every lasting edit with Edit/Write, so the primitives hook runs. Read `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md` and `.claude/prompts/new-test.md` first.
  - Use shell writes only for the temporary mutations, and restore and sha-check each one.
  - Write `a-round-179/end-sha256.txt` (3 paths) and `a-round-179/diff-vs-start.patch` (against `b-round-178/r179-granted-start/`).
  - Keep helper scripts under `a-round-179/tools/`, and run them with cwd = store. No commit, no push.

## 3. A — tests and commands (speed rules)
- **Before the edits:** run `b-round-178-r179-vitest-base.txt` (14 files). Expect **147/150**, with LRS5, PW1 and PW6 red. Report anything else as a stop.
- **After the edits:** run the same 14 files and write the list to `a-round-179/vitest-files.txt`. Expect **150/150**.
- **Checks:** `npm run typecheck`, `npm run lint`, and `npx biome check` on the 2 test files.
- **Code review:** 3 changed files, so ask the `code-reviewer` subagent, and pass its Architecture note to B verbatim.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and the browser rows.

### 3.1 Mutations (temporary shell edits of frozen product source; restore and `sha256sum -c` after each; one JSON per mutation in `a-round-179/mutations/`)
| ID | Mutation | Must turn red | Must stay green |
|---|---|---|---|
| m288 | `StudioWorkspace.tsx` badge: `workspaceCollectionCopy(collection.origin).badge` → `workspaceCollectionCopy('demo').badge` | PW1 | LRS5, PW6 |
| m289 | `StudioWorkspace.tsx` badge content → `{''}` (empty) | LRS5, PW1, PW6, DXL3 | — |
| m290 | `StudioWorkspace.tsx` badge class: `border-outline-strong` → `border-accent` (colour-only) | DXL3, DXL8 | **LRS5, PW1, PW6** (proves the new selectors no longer depend on colour); DXT8 is also expected green (it counts the old full string, which still does not appear), not a finding |

If a "must turn red" test stays green, or a "must stay green" test turns red, report it and do not weaken anything; B rules on it.

## 4. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720, with a fresh context per session. Pixel reads run at DPR 2 with `--disable-lcd-text`.

| Row | What | Pass |
|---|---|---|
| **T179-TARGETED** | Re-run `a-round-179/vitest-files.txt` (14 files). | **150/150**, the same count as A. |
| **SCOPE-179** | Compare the tree with `c-round-178/end-tree-sha256.txt`; check the frozen list `b-round-178-r179-tree-sha256.txt` at C's start and end; check A's `end-sha256.txt`; run `git status`. | Only the 3 grant paths differ from C's round-178 end tree. Frozen list OK. `git status` is 14 ` M` + 2 `??`. The protected diff against `cc984b6` is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW-179** | Read the diff of the 2 test files and doc 147. | Only F1 / F2 / F3 as written. No assertion removed or weakened. PW1's negative lines are kept. Each new lookup throws a labelled error or returns `null` (no vacuous pass). A grep of both files for `querySelector\w*\(['"\`][^'"\`]*\.(border\|text\|bg\|accent\|ring)-` finds **0** hits. |
| **MUT-179** (read-only) | Read A's m288–m290 JSONs: each diff matches the described mutation, each restore sha equals the frozen hash, and the red / green sets match §3.1. **C does not mutate source** (a cut job would leave the tree dirty); the colour-independence is also shown read-only by AN-REVIEW-179's 0-hit grep plus a green T179-TARGETED. | All three match §3.1; every restore sha OK. |
| **HASH-CARRY** | Confirm that every non-test file (components, routes, styles, `collection.ts`) has the same hash as in `c-round-178/end-tree-sha256.txt`. | Identical, so the 13 round-178 browser rows carry over to the combined tree. Name them in the report. |
| **BADGE-BROWSER** | Anonymous `/studio-lab` at both viewports: the header badge text, computed `color` and `border-color`, and an `R − B ≥ 45` pixel scan of its box. | Text "Demo collection — no sign-in required"; colour rgb(163,155,142); border rgb(115,107,96); **0** brass px; text ≥ 4.5:1 and border ≥ 3:1 over the header. |
| **G179-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **FUNC-SMOKE-179** | One short check at 1440×900: add a Library sound to a lane, play for 1 s, stop, then Undo. | Behaviour unchanged; 0 pageerror. |
| **SELECTOR-SWEEP** (read-only, input for 5b-3b) | Grep `app/**/__tests__` and `e2e/` for every selector or class lock on the tokens at the 5b-3b sites (Lane l.723, 731, 842, 874, 886/887, 922/923; LibraryPreview l.332). Look for `querySelector*`, `closest`, `getElementsByClassName`, `toContain('<token>')`, and `readFileSync` counts. | A list of file : line : token, reported as info. **Not a FAIL.** B uses it to set the 5b-3b grants. |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD).
- Escape does not cancel a drag. Ctrl+click the selected clip to deselect it.
- Every run writes a uniquely named output file. Keep screenshots under `c-round-179/`, never in `store/`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| How tests find the collection badge | Not applicable: internal test hygiene, nothing changes for the user | — | Find the badge by its text, not its colour | AN-REVIEW-179, MUT-179 |
| Badge colour (from round 178) | Not captured (as in round 178 §5) | — (unverified) | CZABA DUX-R-5 brand rule (R34) | BADGE-BROWSER; parity **not applicable / unverified** |

## 6. Evidence and reporting
- **A:** `a-round-179.md` and `a-round-179/`.
- **C:** `c-round-179.md`, `c-round-179.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-179/`.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance (B at round 180 planning)
| Condition | Round 180 |
|---|---|
| **C PASS** | Root publishes **rounds 178 + 179 together**, as one diff against `cc984b6` (14 ` M` + 2 `??`). Then: DUX-R-5b-3a → **მზადაა**; C-R178-BADGE-SELECTOR, C-R177-G1-562 and GATE177-S5 → closed; doc 147 → Completed at the next grant. If B plans on or after **2026-10-27** (expected), round 180 is the **REGRESSION round**: every done / c_pass item, one short check each at both viewports, `npm run test:e2e:smoke`, and the evidence gap C-R167-METRONOME-UNDER-MUTE. **DUX-R-5b-3b** follows it, with grants informed by SELECTOR-SWEEP. |
| C FAIL at Medium or above in F1/F2 (a weakened or vacuous lookup, a colour selector left, a mutation not behaving) | A bounded fix-up by the same owner in the same 3 files. |
| HASH-CARRY differs (a product file changed) | Treated as a scope breach. B re-plans the browser rows for the changed file. Round 178's carried rows do not count for that file. |
| C FAIL on Lows only | Fix-up if it is in F1–F3 and cheap; otherwise `deferred_low_polish`, and publication goes ahead. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate (on C PASS):** publish rounds 178+179 as one commit against `cc984b6`. The round-178 granted paths, the 2 round-178 new files and the 2 round-179 test files change. Every protected file in round 178 §2 stays unchanged, as do `app/styles/`, `app/components/studio/*` and the purchase/auth files. In `StudioWorkspace.tsx`, hunks are only at round-178 W1–W5 (formatter reflow at l.2605 accepted).
- **Planning evidence:** B's full-suite run on the round-178 tree gave 2610/2613, with only LRS5, PW1 and PW6 red. After F1/F2 the gate's full vitest is expected to be green; the gate still decides.
- **Architecture signal (non-blocking):** the round-178 reviewer note is now the fifth round running (shared workspace fakes harness, whitespace-normalised source counts, no colour-class DOM selectors). It is appended to `b-round-173-checkpoint-request.md`. B will send a fresh bounded frontend-architect request at the DUX-R-5 boundary (after 5b-3b passes C), before M1. Proposal on file: extend ROOT-RECON-GRID-HARNESS to a shared workspace mount/fakes harness and one whitespace-normalising `countOccurrences`.
