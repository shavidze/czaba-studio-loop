# CURRENT TASK — Round 195: STORE-2a fix-up 2 — visible `/support` guest-form borders (C-R194-01), the `recordings/` field constants (R80), and a whole-tag ST8b guard (C-R194-02)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z160** (`backlog.json` → STORE-REDESIGN `store2a_fixup2_d29z160`, `narrow_grants` round 195, `rounds[195]`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the "Store redesign (Saba approved, 2026-10-25)" section. They take precedence over older text. `loop/lessons.md` exists but is still empty; the first RETRO fills it.
- **Previous task:** `tasks/round-194.md` is an exact copy of the round-194 `current-task.md` (checked with `cmp`). B's reasoning for this round is in `b-round-194.md`.
- **Why this round:**
  - C round 194 was a FAIL with `browserVerified=true`. All 13 granted sites passed in the browser.
  - The round failed on two Medium findings outside the grants:
    - **C-R194-01:** the anonymous `/support` guest-chat fields measure **1.21:1**. At HEAD they were 1.62:1, so this is a round-193 regression.
    - **C-R194-02:** the ST8b guard false-passes that layout.
  - Round 194's §7 row "A stops at K0 with a field outside F1–F16 → B re-grants" applies.
  - The regression round is due at the first planning on or after 2026-10-27. Today is 2026-10-26.

## Baseline = HEAD `caa09af` + the uncommitted round-193 + round-194 tree
- **Gate:** `gates/gate-round-194.json` is `skipped` (C FAIL), so HEAD is still `caa09af`. The tree has **19 ` M` + 2 `??`** (`b-round-194/git-status-at-planning.txt`). A builds on top of it.
- **On C PASS, root publishes rounds 193, 194 and 195 together, against `caa09af`.** There is no separate per-round diff.
- **Frozen list:** `b-round-194-r195-tree-sha256.txt`, **1017 entries**. That is the 1022 tracked files plus the 2 untracked files, minus the 7 grants. It hashes the **round-194 tree**. B checked it from the store root: OK.
- **Grants:** `b-round-194-r195-grants.txt` (7 existing files). Each is narrow (§1). There are no new files: `b-round-194-r195-new-files.txt` is empty.
- **Start hashes:** `b-round-194-r195-granted-start-sha256.txt`. **Start copies:** `b-round-194/r195-granted-start/`.
- **A's first step.** Check all four. If anything differs, stop and report.
  1. HEAD is `caa09af`.
  2. `git status --short` equals `b-round-194/git-status-at-planning.txt`.
  3. `sha256sum -c --quiet ../tmp/studio-real-loop/a-round-194/end-sha256.txt` is OK.
  4. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-194-r195-tree-sha256.txt` and the 7 start hashes are OK. Run both from the store root.
- **Mock API:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` from the loop folder. Stop **only that PID** at the end. Record which you did. Do not edit the mock.

## 1. What changes (exact)

### Rulings (vetoable by Saba; record them in doc 158)
- **R78 extended to GuestForm (C-R194-01).** The two guest-form fields swap `border-outline` → `border-outline-strong` in the non-error branch only.
  - The field is `bg-elevated`. Round 194 predicted about 3.3:1 on elevated, and C measured F8 at 3.30, so this is a tight case.
- **R81, GuestForm fallback (pre-authorised).** If `border-outline-strong` reads below 3:1 on G1 or G2 at any of the four edge midpoints, at any viewport in A's live proof, A uses `border-dim` (`#928a7d`) for **G1 and G2 together**.
  - A records the measurement and the token used in `a-round-195.md`. ST8 accepts either token for G1/G2 only.
  - This is still a token swap; `app.css` stays frozen.
- **R80, `app/components/recordings/**` is store scope, and its 4 field constants get the same R78 swap.**
  - **Why store scope:**
    - The folder is not in `global_forbidden_files`. That list has `app/lib/sfx-*`, which is a different path.
    - It is not on the store-redesign spec's Studio-owned list.
    - The Studio does not import it: `grep` over `components/arrangement`, `lib/arrangement` and `studio-lab.tsx` finds nothing.
    - It mounts only on `/recordings/:productId` and `/scenes/:productId`.
  - **Why fix it now:**
    - Round 193's `--color-outline` change made these 12 fields as faint as GuestForm.
    - The strengthened ST8b (below) follows same-file constants, so it goes red on them anyway.
  - **Rejected alternatives:**
    - (a) Exclude the folder from ST8b. That hides a regression the loop caused.
    - (b) Defer to a later round. The guard would stay red or need a whitelist.
  - **Browser rows:** BLOCKED, "backend unavailable in cloud". ST8 rows cover the source.
- **R82, ST8b scan definition (C-R194-02).** Replace the line-window scan with a whole-tag scan:
  - For each `<input`, `<textarea` and `<select` tag in a `.tsx` file under `app/` (excluding `__tests__`, `components/arrangement` and `components/studio`), take the tag text from `<` to its closing `>` at brace depth 0. Skip quotes and template literals, and do not stop at `=>`.
  - The tag fails if it contains a bare `border-outline` (`/border-outline(?![-\w])/`).
  - It also fails if it references (`\bNAME\b`) a same-file `const NAME =` whose initialiser is a string literal, a template literal, an array literal or a `cn(...)` call containing a bare `border-outline`.
  - The reference shape is B's `b-round-194/tools/fieldscan2.mjs`; A may reimplement it in the test. It captures every `const NAME =` initialiser of any form, up to its `;` at bracket depth 0. On the round-194 tree it reports exactly 14 hits: GuestForm 53/77, and SfxQuickEdit, SfxSceneBuilder, SfxSoundLibrary and SfxVideoSync through `inputClass`.
  - **Not widened** to `-light`/`-hover`/side variants (reviewer Lows #3–#6). No one has measured those; they stay recorded signals.

### Sites (line numbers are in the round-194 tree; locate each by its class string)
| # | File : line | Element | Change |
|---|---|---|---|
| G1 | `chat/GuestForm.tsx:67` | `#guest-name` non-error branch `'border-outline focus:border-brand'` | `border-outline` → `border-outline-strong` (or `border-dim` under R81) |
| G2 | `chat/GuestForm.tsx:91` | `#guest-email`, same string | same, with the same token as G1 |
| R1 | `recordings/SfxSoundLibrary.tsx:68` | `inputClass` (search `:97`, select `:109`) | `border-outline` → `border-outline-strong` |
| R2 | `recordings/SfxSceneBuilder.tsx:112` | `inputClass` (6 inputs + select `:783`) | same |
| R3 | `recordings/SfxVideoSync.tsx:25` | `inputClass` (2 inputs) | same |
| R4 | `recordings/SfxQuickEdit.tsx:183` | `inputClass` (2 number inputs) | same |

Only the field `inputClass` constants change. The sections, fieldsets and cards in these files that use `border border-outline` (for example `SfxSoundLibrary.tsx:72`, `SfxVideoSync.tsx:29`) stay as they are. They are STORE-2b inventory.

| ID | File(s) | Change |
|---|---|---|
| **K0** (evidence first) | none | <ol><li>Run `node ../tmp/studio-real-loop/b-round-194/tools/fieldscan2.mjs app` from the store root. Expected: exactly the 14 hits above.</li><li>**Stop rule:** stop and report only if a hit appears **outside the 5 source grants** in a non-forbidden file.</li><li>Confirm that every `inputClass` consumer in the 4 recordings files is an `<input>` or `<select>` (grep `inputClass`). B's grep shows 2 + 6 + 2 + 2 uses, all fields.</li></ol> |
| **K1** (C-R194-01) | `GuestForm.tsx` | G1 and G2 only. The error branch `border-destructive focus:border-destructive`, `focus:ring-*`, the placeholder, the copy and the behaviour stay byte-identical. |
| **K2** (R80) | the 4 recordings files | R1–R4: one token per constant. Nothing else. A Biome reflow is allowed only under R79. |
| **T1** (extend) | `store-theme-tokens.test.ts` | <ul><li>Keep ST1–ST7 and ST8 F1–F16 unchanged and green.</li><li>**ST8 rows:**<ul><li>Add G1/G2, located by `id="guest-name"` and `id="guest-email"`. Accept `border-outline-strong`, or `border-dim` per R81.</li><li>Add R1–R4, located by `const inputClass =` in each file. Accept `border-outline-strong`.</li><li>The existing `fieldClassRegion` helper works on `className=`. For the constants, use the initialiser text up to its terminating `;`.</li></ul></li><li>**ST8b:** rewrite `bareOutlineFieldHits` to the R82 whole-tag + same-file-constant scan, and delete `FIELD_SCAN_WINDOW_LINES`. The test title and `toEqual([])` stay.</li><li>**ST8c (scanner self-test, in-memory strings, no file IO):** the scan function is pure over `(path, source)`. It flags:<ul><li>(i) a tag whose `className` sits 14+ lines below `<input` (C's m14 shape);</li><li>(ii) `const inputClass = '… border-outline …';` used as `className={inputClass}`;</li><li>(iii) the same inside a template literal `` `${inputClass} mt-3` ``;</li><li>(iv) an `<input>` whose `onChange={(e) => …}` comes **before** a bare `className="border border-outline"`. The `=>` must not end the tag.</li></ul>It does **not** flag:<ul><li>(v) `border-outline-strong`;</li><li>(vi) a non-field `<section className="border border-outline">`.</li></ul></li><li>**Reviewer Lows #4–#6 (optional, allowed in this file only):** A may also close them in the scanner and helpers: #4 the anchor is verified inside its tag, #5 the `const` branch does not depend on `\n]` at column 0, #6 the region excludes its delimiters. #3 (denying `-light`/`-hover`) stays out of scope.</li></ul> |
| **D1** (doc 158) | doc 158 | Status → `In Progress (awaiting C round 195)`. Add a "Round 195" section in Georgian: C-R194-01/02 with C's numbers (tree 1.21, HEAD 1.62), R80–R82 with their rejected alternatives, G1/G2 and R1–R4, A's measured GuestForm ratio and the token used, and the BLOCKED recordings rows. Add a RETRO note: B's round-193 scan missed GuestForm (an off-by-one window) and the constants, so the K0 scan is now B's whole-tag tool. |

**Unchanged on purpose (frozen list, byte-identical):** `app/styles/**`; every round-193/194 file not granted here (LeadMagnet, Newsletter, store, hire-us, free-downloads, gift-cards, GiftCardInput, cart, account, `ui/Input.tsx`, `ChatInput.tsx`, Button, Modal, PurchaseHeader, ChatButton, ForgetPassword, account.orders, doc 157); `ChatWindow.tsx`, `support.tsx`, `recordings.$productId.tsx`, `scenes.$productId.tsx`; `SfxSceneExport.tsx` and `RecordingCatalogRow.tsx` (radio and range only); `root.tsx`, `studio-lab.tsx` and every Studio-owned file; every existing test except T1, and `e2e/**`; the protected purchase/auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth*`, `firebase.client.ts`), `app/lib/sfx-*`, `components/studio/**`, `public/`, `.claude/**`, `package.json` and the configs.

## 2. A — files you own (everything else is frozen)
- The 7 grants, each limited to its scope above. Plus your own `a-round-195.md` and `a-round-195/`.
- **If a frozen test turns red** because of your change, change your implementation so it stays green. If that is impossible without dropping a requirement, stop and report the exact failing assertion.
- **If G1/G2 measure below 3:1** with `border-dim` as well, stop and report with numbers. Never add a token or touch `app.css`.
- **Read first** (rule `read-primitives.md`): `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`; `prompts/new-test.md`.
- Write these files:
  - `a-round-195/end-sha256.txt`: the 7 grants.
  - `a-round-195/diff-vs-start.patch`: the grants against `b-round-194/r195-granted-start/`.
- Use the Edit/Write tools for every lasting edit. Shell writes are for temporary mutations only; restore them and check the sha. No commit and no push.

## 3. A — tests and checks (speed rules)
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: green (ST1–ST8c).
- **Neighbour suites**, all green:
  - `app/lib/__tests__/sfx-library.test.tsx`, `sfx-scene-route.test.tsx` and `sfx-video-transport.test.tsx`;
  - every other test that imports `GuestForm`, `ChatWindow`, `ChatWidget`, the `support` route, or any of the 4 recordings components (grep and list them);
  - `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`.
- **e2e grep:** search `e2e/` for `guest-name`, `guest-email`, `border-outline` and the recordings components. B found none. If a frozen assertion depends on a changed class, **stop and report**.
- **Red proof:** run T1 with `STORE_THEME_TOKENS_ROOT` pointed at a scratch copy of the round-194 tree (the tree with the 7 grants replaced by the start copies, and the new test file). Expected:
  - ST8 G1/G2/R1–R4 and ST8b are red there;
  - ST1–ST7, ST8 F1–F16 and ST8c are green.
- Run `npm run typecheck`. Run `npm run lint` and report the count against round 194's. Run `npx biome check` on every changed file: 0 errors.
- Do not run the full suite; the gate runs it.

**Live proof** (Playwright Chromium on :5173, mock on :5199, DPR 2, `--disable-lcd-text`), saved under `a-round-195/`:
- `/support` → click "Live Chat" → `#guest-name`, `#guest-email`.
  - Sample the unfocused border pixel against the pixel 2 CSS px outside it, at the four edge midpoints.
  - Viewports: 1440×900, 1280×720 and 375×812.
  - Record the token used (R81).
- One F2 (`/store` search) re-sample at 1440: it must still be 3.64.
- `/studio-lab` at 1440: a rest shot vs `c-round-191/shots/c191-1440-1/rest-full.png`, no mask, 0 changed px.

**Code review:** use the `code-reviewer` subagent (≥ 3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
**Setup:**
- Real Playwright Chromium on the shared :5173 server, a fresh anonymous context, and the mock API on :5199. Start the mock if it is not listening, log to `c-round-195/mock.log`, and stop **only that PID** at the end.
- **Before references:**
  - the round-194 tree: the current tree with the 7 grants replaced by `b-round-194/r195-granted-start/`;
  - the `caa09af` archive;
  - or C's round-194 numbers.
  - Say which you used.
- Viewports: store rows at **1440×900, 1280×720 and 375×812**; Studio rows at 1440×900 and 1280×720. Pixel reads at DPR 2 with `--disable-lcd-text`.

| Row | What | Pass |
|---|---|---|
| **GUEST-BORDER-195** (C-R194-01) | `/support` → "Live Chat" → `#guest-name` and `#guest-email`, unfocused, at 3 viewports. Sample the four edge midpoints against the pixel 2 CSS px outside. Then focus each by keyboard (Tab). Then submit empty to show the error state. | All four midpoints ≥ **3:1** at all 3 viewports, and better than HEAD's 1.62. The token is `border-outline-strong`, or `border-dim` only if A recorded R81's reason. On keyboard focus the border turns brass. The error state is still the destructive border, byte-identical class. Field boxes ±0 px vs ref. |
| **FIELD-SPOT-195** | Re-sample F1 (`/` newsletter) and F2 (`/store` search) at 1440. | F1 ≥ 3:1, F2 ≥ 3:1, and both within ±0.05 of C's round-194 values (3.13 / 3.64). |
| **RECORDINGS-195** | `/recordings/:id` and `/scenes/:id` fields (R1–R4). | **BLOCKED: backend unavailable in cloud** (the mock answers sign-in-required). Source is covered by ST8 R1–R4 only. Not passed; this does not make `browserVerified` false. |
| **CONTRAST-195** | `/support` and `/` at 1440: text samples, tree vs ref. | No token-coloured text sample regresses (Δ > 0.05). |
| **KEEP-195** | The LeadMagnet popup steps 1–2 `innerText` and placeholder; Free Samples (desktop and the 375 menu); SpecialOffers; Limited; `/about` stats. | Byte-identical to HEAD and mounted in the same place. |
| **STORE-LAYOUT-195** | `/support` (chat open) and `/` × 3 viewports, tree vs ref: field boxes, section roots, header, footer. | Every box unchanged ± 1 px. |
| **STUDIO-RV-195** | `/studio-lab` rest at 1440 and 1280 vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, no mask. | **0 changed px**. 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **G195-3** | As G194-3. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. studio-token with no header → 401; with a fake Bearer → 403. |
| **SCOPE-195** | Frozen list (1017) at C's start and end, from the store root; A's `end-sha256.txt`; `git status`; `git diff` of each grant against `b-round-194/r195-granted-start/`. | Frozen OK at both ends. `git status --short` is exactly **26 lines: 24 ` M` + 2 `??`**: the 19 round-193/194 ` M`, plus the 5 newly modified `GuestForm.tsx`, `SfxSoundLibrary.tsx`, `SfxSceneBuilder.tsx`, `SfxVideoSync.tsx` and `SfxQuickEdit.tsx`, plus the 2 `??` (`store-theme-tokens.test.ts`, doc 158). Nothing else. Diffs: G1/G2 and R1–R4 one token swap each; reflow only under R79 (prove it with `biome format`); the test file changes only the ST8 site list, the scanner and its helpers (ST8b, plus the optional reviewer Lows #4–#6), and adds ST8c; doc 158 only the status line and the Round 195 section. |
| **T-RUN-195** | T1 on the tree and on the round-194 scratch copy. Mutants on scratch copies: **m14** (C's round-194 probe: token at tag+14 in a scratch `hire-us.tsx`); **m15** a scratch `const fieldClass = 'border border-outline';` used as `className={fieldClass}` on a new `<input>` in a scratch `store.tsx`; **m16** G1 back to `border-outline`; **m17** R2 `inputClass` back to `border-outline`; **m18** a scratch `<section className="border border-outline">` with no field (must stay green). | T1 green on the tree. ST8 G1/G2/R1–R4 and ST8b red on the round-194 copy. m14, m15 → ST8b red; m16 → ST8 G1 and ST8b red; m17 → ST8 R2 and ST8b red; m18 → green. |
| **AN-REVIEW-195** | Read the diff, T1 and doc 158. | Only the listed tokens changed; no `as`, `any` or `@ts-ignore`; ST8b parses whole tags and follows same-file constants; doc 158 in Georgian with R80–R82 and their rejected alternatives. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages; 0 non-font remote requests; 0 Authorization headers from the page. |

**Outcomes written in advance:**
- A reached field below 3:1 after the change, or worse than HEAD → **FAIL (Medium)**. Report its surround colour.
- Any **other** reached anonymous store text field with a bare `border-outline` that B's scan did not list → **FAIL (Medium)**, and report the file and line. The scan says there is none.
- Any Studio pixel change → **regression FAIL (Medium)**. Any store layout move beyond ± 1 px → **regression FAIL (Medium)**. Any keep-list text change → **FAIL (Medium, binding Saba rule)**.
- Non-field `border-outline` surfaces and teal, glow or gradient colours are **STORE-2b inventory**, not a FAIL.
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **SCOPE row honesty:** if A stops without implementing, SCOPE-195 is `notRun` with a `scopeNote`, never `passed`.

**Adjacent behaviour that could break, and the check that catches it:**

| Risk | Check |
|---|---|
| GuestForm's error state loses the destructive border | the error step of GUEST-BORDER-195, plus the SCOPE diff |
| The new ST8b scanner over-matches (an arrow function or a section) or under-matches (a template literal) | ST8c (i)–(vi), m15 and m18 |
| The recordings `inputClass` change leaks onto non-field elements | the K0 consumer grep and the SCOPE diff (constants only) |
| The Studio picks up a shared class | K0 mount grep, STUDIO-RV-195 |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store and recordings text-field borders; the test guard | **None.** These are store web pages, not Arrangement behaviour. | Nothing. | Saba's approved store direction A plus WCAG 1.4.11. | Parity: **არ ეხება**. Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-195.md` and `a-round-195/`.
- **C:** `c-round-195.md`, `c-round-195.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `notRun` / `gate`) and `c-round-195/`.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 196 |
|---|---|
| **C PASS** (`browserVerified=true`) | Root publishes rounds 193 + 194 + 195 (24 M + 2 new) against `caa09af`. STORE-2a → **მზადაა**. If planning is on or after **2026-10-27**, round 196 is the **REGRESSION round** (`REGRESSION-ROUND-2026-10-27`). Otherwise it is STORE-2b, and the regression comes at the first planning on or after 2026-10-27. |
| **C FAIL** on a 195 row | One more bounded fix-up. The RETRO records three fix-up rounds for STORE-2a. |
| A stops at K0 with a hit outside the grants | B re-grants. The planning cost is recorded for the RETRO. |
| A browser row that can run here did not run | `browserVerified=false`. STORE-2a is not done, and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the round-193 + 194 + 195 changes against `caa09af`: **24 modified + 2 new files**.
- **For Saba, vetoable (non-blocking):**
  - R76 (CONTINUE text colour);
  - R77 (placeholder `brand-foreground/60`);
  - R78, now including GuestForm (`outline-strong` on store fields);
  - R80 (recordings fields are store scope).
- **Signals recorded, not scheduled:**
  - `ARCH-R194-TEST-WALKERS`: A's round-194 reviewer note on the two `app/` walkers in the test file. It is decided together with `ARCH-R193-THEME-REGION` at the STORE-2 exit.
  - `STORE2A-INPUT-BORDER-STUDIO-SITES`.
  - `STORE2A-PROTECTED-BRASS-TEXT`.
  - `GLOBAL-FOCUS-VISIBLE-UNLAYERED`.
  - `A-R194-REVIEW-LOWS`: the reviewer's Lows #3–#6 on test robustness.
- **Queue:** the three 2026-10-26 entries `PHASE2B-SPOTTING`, `STUDIO-AGENT-COMMANDS` and `RECORDING-META-S1` were added to the end of `post_current_stage_queue` this planning. They are a copy only; none is started.
- **Still open:**
  - the `root.tsx` narrow grant for STORE-2c/2d;
  - root request C-R188-I3;
  - checkpoint `b-round-183-checkpoint-request.md` (fallback (c); next point: the STORE-REDESIGN exit).
- **RETRO:** at round 200 or the STORE-REDESIGN exit.
