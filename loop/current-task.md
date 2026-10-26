# CURRENT TASK — Round 194: STORE-2a fix-up — readable LeadMagnet placeholder (C-R193-01) and visible store text-field borders (C-R193-02); SCOPE reflow ruling (C-R193-03)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z159** (`backlog.json` → STORE-REDESIGN `store2a_fixup_d29z159`, `narrow_grants` round 194, `rounds[194]`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the "Store redesign (Saba approved, 2026-10-25)" section. They take precedence over older text. There is no `lessons.md` yet; the first RETRO writes it.
- **Previous task:** `tasks/round-193.md` is an exact copy of the round-193 `current-task.md` (checked with `cmp`). B's reasoning for this round is in `b-round-193.md`.
- **Why this round:** C round 193 was a FAIL with `browserVerified=true`. Every STORE-2a row passed except CONTRAST-193, which failed on two Medium regressions that round 193 caused. Round 193's §7 row 3 says a bounded fix-up comes before the regression round. The regression is due at the first planning on or after 2026-10-27; today is 2026-10-26.

## Baseline = HEAD `caa09af` + the uncommitted round-193 tree
- **Gate:** `gates/gate-round-193.json` is `skipped` (C FAIL), so HEAD is still `caa09af`. The round-193 work is uncommitted in the working tree: 10 ` M` and 2 `??`. A builds on top of it.
- **On C PASS, root publishes round 193 and round 194 together, against `caa09af`.** There is no separate round-194-only diff.
- **Frozen list:** `b-round-193-r194-tree-sha256.txt`, **1011 entries**. That is the 1022 tracked files plus the 2 round-193 untracked files, minus the 13 grants. It hashes the **round-193 tree**, not `caa09af`. B checked it from the store root: OK.
- **Grants:** `b-round-193-r194-grants.txt` (13 existing files). Each is narrow (§1). There are no new files: `b-round-193-r194-new-files.txt` is empty.
- **Start hashes:** `b-round-193-r194-granted-start-sha256.txt`. **Start copies:** `b-round-193/r194-granted-start/`.
- **A's first step.** Check all four. If anything differs, stop and report.
  1. HEAD is `caa09af`.
  2. `git status --short` is exactly the 10 ` M` and 2 `??` that round 193 left.
  3. `sha256sum -c --quiet ../tmp/studio-real-loop/a-round-193/end-sha256.txt` is OK.
  4. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-193-r194-tree-sha256.txt` and the 13 start hashes are OK. Run both from the store root.
- **Mock API:** if :5199 is not listening (`ss -ltn`), start `node mock-api/server.mjs > <your-folder>/mock.log 2>&1 &` from the loop folder. Stop **only that PID** at the end. Record which you did. Do not edit the mock.

## 1. What changes (exact)

### Rulings (vetoable by Saba; record them in doc 158)
- **R77 (C-R193-01): the keep-list LeadMagnet email placeholder becomes `placeholder:text-brand-foreground/60`.**
  - The field is `bg-white`. `--color-dim` (`#928a7d`) is a dark-surface token and gives 3.41:1 on white; HEAD gave 5.06:1.
  - `brand-foreground` (`#0e0d0c`) at 60 % over white composites to about `rgb(110,110,109)`, about **5.1:1**, back at HEAD's level.
  - Rejected: (a) C's hint `placeholder:text-brand-foreground` at full strength (≈19:1). The placeholder would look like the typed value (`text-black`), and a placeholder that reads as a filled field is not honest. (b) `placeholder:text-outline-strong` (`#736b60`, ≈5:1). It is a border token, so its meaning would be wrong. (c) A hardcoded grey, which Tailwind-first forbids.
  - This is a colour-only restyle of a keep-list item, the same reasoning as R76. The copy `Enter your email address`, the size, the position and the behaviour stay.
- **R78 (C-R193-02): store text-entry fields use `border-outline-strong` instead of `border-outline`.**
  - `--color-outline` (`#24211e`, the R72 Studio value) gives 1.03–1.21:1 against the page. HEAD gave 1.35–1.62:1.
  - `--color-outline-strong` (`#736b60`) is an existing token, identical in the store and the obsidian block. It gives about 3.7:1 on `#0e0d0c`, 3.5:1 on `surface` and 3.3:1 on `elevated`. On the newsletter section's brass radial it gives about 3.1:1, which is the tight case and **must be measured**.
  - **F1 fallback (pre-authorised):** if `border-outline-strong` on F1 reads below 3:1 at any of the four edge midpoints at any viewport in A's live proof, A uses `border-dim` (`#928a7d`, about 4.8:1 on the radial) for **F1 only**. A records the measurement and the token used in `a-round-194.md`; ST8 accepts either token for F1 only. This is still a token swap and `app.css` stays frozen.
  - Scope is **text-entry fields only**: `<input>` (text, email, search, password), `<textarea>` and `<select>`. Pills, cards, dividers and chips that use `border-outline` stay as they are; they are STORE-2b inventory.
  - Rejected: (a) changing `--color-outline` in `@theme`. That breaks R72/ST1 (store = Studio) and changes every card and divider. (b) A new store-only `--color-input-border` token. It needs a new `app.css` declaration plus the same per-site edits, so it is not smaller. (c) Leaving it as it is, which keeps a regression this round caused.
- **R79 (C-R193-03, ruling; no code change): a formatter-forced reflow is allowed.** A grant of "one changed line per site" means **one semantic token change per site**. A reflow is allowed when `npx biome format` on the one-line form reproduces the tree file byte for byte. C proved this for `Button.tsx` S1 in round 193. C-R193-03 is closed as ruled; it is not a deferred Low. The RETRO lesson `STORE2A-BUTTON-REFLOW`: B checks Biome `lineWidth` (100) before writing "exactly N lines".

### Sites (line numbers are in the round-193 tree; A locates each by its class string)
| # | File : line | Element | Change |
|---|---|---|---|
| P1 | `marketing/LeadMagnetPopup.tsx:126` | email input (`bg-white`) | `placeholder:text-dim` → `placeholder:text-brand-foreground/60` |
| F1 | `home/NewsletterSection.tsx:78` | newsletter email input | `border-outline` → `border-outline-strong` |
| F2 | `routes/store.tsx:179` | store search input | same |
| F3–F6 | `routes/hire-us.tsx:233, 246, 259, 296` | name and email inputs, the `<select>`, the `<textarea>` | same, 4 lines |
| F7 | `routes/free-downloads.tsx:312` | search input (keep-list page; restyle only) | same |
| F8 | `routes/gift-cards.tsx:161` | code input | same |
| F9 | `cart/GiftCardInput.tsx:107` | gift-code input | same |
| F10 | `routes/cart.tsx:221` | input at l.213 | same |
| F11–F13 | `routes/account.tsx:330, 351, 371` | three inputs | same, 3 lines |
| F14 | `ui/Input.tsx:34` | `baseInputStyles` entry `'border-2 border-outline'` | `'border-2 border-outline-strong'` |
| F15 | `ui/Input.tsx:225` | `Textarea` class entry `'bg-surface border-2 border-outline rounded-md'` | `border-outline` → `border-outline-strong` |
| F16 | `chat/ChatInput.tsx:70` | textarea entry `'bg-elevated border border-outline rounded-lg'` | same (ChatWidget is mounted on no route, so this is test-only) |

| ID | File(s) | Change |
|---|---|---|
| **K0** (evidence first, short) | none | <ol><li>Re-run B's field scan (`b-round-193/tools/fieldscan.mjs`, run from the store root) or an equivalent. It looks at `<input|textarea|select>` plus the next 14 lines for a bare `border-outline`, over `app/` excluding `__tests__` and `components/arrangement`. Also grep class arrays/constants that style fields (the `Input.tsx:34` pattern).</li><li>**Stop rule:** stop and report **only** if a field outside F1–F16 appears in a **non-forbidden** file. The two hits in `components/studio/**` (`ExportDialog.tsx:283` checkbox, `VideoUploadZone.tsx:169`) are expected. They are in `global_forbidden_files` and are not touched (signal `STORE2A-INPUT-BORDER-STUDIO-SITES`).</li><li>Confirm that the Studio does not mount `Input`/`Textarea`/`ChatInput` (`components/arrangement` imports only `Modal*` from `~/components/ui`; cite the grep).</li></ol> |
| **K1** (R77) | `LeadMagnetPopup.tsx` | P1 only. Every other byte stays identical, including `CONTINUE`, `SENDING...` and the placeholder text. |
| **K2** (R78) | the 10 field files | F1–F16: one token per site, `border-outline` → `border-outline-strong`. No other token, class order, copy or behaviour changes. `focus:*` classes stay. A Biome reflow is allowed only under R79. |
| **T1** (extend) | `store-theme-tokens.test.ts` | Keep ST1–ST6 unchanged and green. Add:<ul><li>**ST7:** in `LeadMagnetPopup.tsx`, the email input class (located by `placeholder="Enter your email address"`) contains `placeholder:text-brand-foreground/60` and does not contain `placeholder:text-dim`.</li><li>**ST8:** for each of F1–F16, read the file and locate the element by a stable substring, not by line number. Its class contains `border-outline-strong` (for F1 only, `border-outline-strong` or `border-dim`, per the R78 fallback) and no bare `border-outline` (regex `border-outline(?![-\w])`).</li><li>**ST8b (class guard):** across `app/` excluding `__tests__`, `components/arrangement` and `components/studio`, no `<input|textarea|select>` element's class (the same 14-line window) carries a bare `border-outline`. So a new field with the faint border turns red.</li></ul> |
| **D1** (doc 158) | doc 158 | Status → `In Progress (awaiting C round 194)`. Add a "Round 194" section in Georgian: C-R193-01/02 with C's numbers (tree vs HEAD), R77–R79 with their rejected alternatives, the F1–F16 list, the two forbidden legacy sites, and a TODO for the non-field `border-outline` inventory (2b). Also note: A's round-193 reviewer flagged `--color-outline` at ≈1.25:1 as info, but no one measured the fields before handover (RETRO input). |

**Unchanged on purpose (frozen list, byte-identical):** `app/styles/**` (including the round-193 `@theme` values and the obsidian block); every other round-193 file (`Button.tsx`, `Modal.tsx`, `PurchaseHeader.tsx`, `ChatButton.tsx`, `ForgetPassword.tsx`, `account.orders.tsx`, doc 157); `root.tsx`, `studio-lab.tsx` and every Studio-owned file; every existing test and `e2e/**`; the protected purchase/auth files (`studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `AuthContext.tsx`, `app/lib/auth*`, `firebase.client.ts`), `components/studio/**`, `public/`, `.claude/**`, `package.json` and the configs.

## 2. A — files you own (everything else is frozen)
- The 13 grants, each limited to its scope above. Plus your own `a-round-194.md` and `a-round-194/`.
- **If a frozen test turns red** because of your change, change your implementation so it stays green. If that is impossible without dropping a requirement, stop and report the exact failing assertion.
- **If a field measures below 3:1 with `border-outline-strong`** in your live proof: for F1, apply the R78 fallback (`border-dim`). For any other field, stop and report it with numbers. Never add a token or touch `app.css`.
- **Read first** (rule `read-primitives.md`): `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md` (Input), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`; `prompts/new-test.md`.
- Write these files:
  - `a-round-194/end-sha256.txt`: the 13 grants.
  - `a-round-194/diff-vs-start.patch`: the grants against `b-round-193/r194-granted-start/`.
- Use the Edit/Write tools for every lasting edit. Shell writes are for temporary mutations only; restore them and check the sha. No commit and no push.

## 3. A — tests and checks (speed rules)
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: green (ST1–ST8b).
- **Neighbour suites**, all green:
  - `gift-card-input.test.tsx` and `store-header-footer.test.tsx`;
  - every test that imports `Input`/`Textarea`/`PasswordInput`, `SignInForm`/`SignUpForm`/`AuthModal`/`ForgetPassword`, `NewsletterSection`, `LeadMagnetPopup`, `GiftCardInput`, `ChatInput`/`ChatWidget`, or renders the routes `store`, `hire-us`, `free-downloads`, `gift-cards`, `cart`, `account` (grep and list them);
  - `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`.
- **e2e grep (the gate runs e2e):** search `e2e/` for `border-outline`, `placeholder`, `Enter your email` and `toHaveClass` on fields. If a frozen assertion depends on a changed class, **stop and report**.
- **Red proof:** run T1 against the start copies. ST7, ST8 and ST8b must be red there. ST1–ST6 stay green, because they test the round-193 tree.
- Run `npm run typecheck`. Run `npm run lint` and report the count against round 193's 214 warnings + 1 info. Run `npx biome check` on every changed file: 0 errors.
- Do not run the full suite; the gate runs it.

**Live proof** (Playwright Chromium on :5173, mock on :5199, DPR 2), saved under `a-round-194/`:
- **Border ratio on rendered pixels for each reachable field.** Measure the field's border pixel against the pixel just outside it at the **four edge midpoints** (top, right, bottom, left), unfocused, at 1440×900 (and 375×812 for `/`, `/store`, `/hire-us`). The fields are F1, F2, F3–F6, F7, F8, F10 (if it renders with an empty cart), and the `Input` fields in the sign-in/sign-up modal opened from the header (F14).
- The LeadMagnet placeholder pixel ratio at 1440 and 375, using the round-193 trigger (scroll to 55 %, wait about 8 s, click FREE DOWNLOAD).
- `/studio-lab` at 1440: a rest shot vs `c-round-191/shots/c191-1440-1/rest-full.png`, no mask, 0 changed px.

**Code review:** use the `code-reviewer` subagent (≥ 3 files). Pass its Architecture note to B verbatim. Fix its Medium+ findings within the grants.

## 4. C — rows
**Setup:**
- Real Playwright Chromium on the shared :5173 server, a fresh anonymous context, and the mock API on :5199. Start the mock if it is not listening, log to `c-round-194/mock.log`, and stop **only that PID** at the end.
- For "before" evidence, use either a reference of the **round-193 tree**, the `caa09af` archive from round 193 (`c-round-193/head`), or C's round-193 numbers. Say which you used.
- Viewports: store rows at **1440×900, 1280×720 and 375×812**; Studio rows at 1440×900 and 1280×720. Pixel reads at DPR 2 with `--disable-lcd-text`.

| Row | What | Pass |
|---|---|---|
| **PLACEHOLDER-194** (C-R193-01) | The LeadMagnet popup, step 2, at 3 viewports: placeholder pixel vs the white field. Also the typed value after you type `a@b.co`. | Placeholder ≥ **4.5:1** on rendered pixels (expected ≈ 5.1). It is visibly lighter than the typed value (`text-black`). The placeholder text is byte-identical to HEAD. |
| **FIELD-BORDER-194** (C-R193-02) | Unfocused border pixel vs the pixel just outside it. Pages: `/` newsletter (F1), `/store` search (F2), `/hire-us` 4 fields (F3–F6), `/free-downloads` search (F7), `/gift-cards` code (F8), `/cart` (F9/F10 where they render with the mock), and the header's sign-in/sign-up modal `Input` fields (F14). Use 3 viewports for F1, F2 and F3–F6, and 1440 for the rest. Then focus each by keyboard. | Sample the border vs the outside pixel at the **four edge midpoints**. Every reached field: all four ≥ **3:1** against its surround (WCAG 1.4.11), and better than HEAD. F1 may use `border-dim` under the R78 fallback if A recorded why. On keyboard focus the brass border/ring still shows. F11–F13 (`/account`): **BLOCKED — backend unavailable in cloud** (needs a signed-in user), ST8 only. F15 (`Textarea`) and F16 (`ChatInput`): "not reachable" if no route renders them, ST8 only. |
| **CONTRAST-194** | Re-run the round-193 CONTRAST sample set on `/`, `/store`, `/products/middle-east` at 1 viewport (1440), plus the changed fields' placeholders. | No token-coloured sample regresses against round 193's numbers (`c-round-193/out/store-compare.json`). The pre-existing → Low escape does not apply to F1–F16 or P1, because this round fixes them. |
| **KEEP-194** | The LeadMagnet popup steps 1–2 `innerText` (including `CONTINUE` and the placeholder attribute), Free Samples (desktop and mobile menu), SpecialOffers, Limited, `/about` stats, and the `/free-downloads` page heading and search placeholder. | Byte-identical to HEAD and mounted in the same place. |
| **STORE-LAYOUT-194** | `/`, `/store`, `/hire-us`, `/free-downloads` × 3 viewports, tree vs the round-193 reference: field boxes, section roots, header, footer. | Every box unchanged ± 1 px (the border widths do not change). |
| **STUDIO-RV-194** | `/studio-lab` rest at 1440 and 1280 vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`, no mask. | **0 changed px**. 0 console errors. One cold blank 1440 load may be replaced once (ENV-FIRST-LOAD). |
| **G194-3** | As G193-3. | `/studio-lab`: no `auth_user`, 0 cookies, workspace and demo badge present. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. studio-token with no header → 401; with a fake Bearer → 403. |
| **SCOPE-194** | Frozen list (1011) at C's start and end, from the store root; A's `end-sha256.txt`; `git status`; `git diff` of each grant against `b-round-193/r194-granted-start/`. | Frozen OK at both ends. `git status --short` is exactly **21 lines: 19 ` M` + 2 `??`**: the 10 round-193 ` M` (2 of which, `LeadMagnetPopup.tsx` and `hire-us.tsx`, are also round-194 grants), plus the 9 newly modified `NewsletterSection.tsx`, `store.tsx`, `free-downloads.tsx`, `gift-cards.tsx`, `GiftCardInput.tsx`, `cart.tsx`, `account.tsx`, `ui/Input.tsx` and `chat/ChatInput.tsx`, plus the 2 round-193 `??` (`store-theme-tokens.test.ts`, doc 158). Nothing else. Diffs: P1 one semantic change; every F-site one token swap; reflow only under R79 (prove it with `biome format`); the test file only adds ST7/ST8/ST8b; doc 158 only the status line and the Round 194 section. |
| **T-RUN-194** | T1 on the tree and on the start copies. Mutants on scratch copies: **m10** P1 back to `placeholder:text-dim`; **m11** F2 (`store.tsx`) back to `border-outline`; **m12** F14 `Input.tsx` base back; **m13** a new scratch `<input className="border border-outline">` added to a scratch copy of `hire-us.tsx`. | T1 green on the tree. ST7/ST8/ST8b red on the start copies. m10 → ST7 red; m11, m12 → ST8 red; m13 → ST8b red. |
| **AN-REVIEW-194** | Read the diff, T1 and doc 158. | Only the listed tokens changed; no `as`, `any` or `@ts-ignore`; ST8b would catch a new faint field; doc 158 in Georgian with R77–R79 and their rejected alternatives. |
| **PX-NET / REG-HYD** | Every session. | 0 pageerror; 0 hydration messages; 0 non-font remote requests; 0 Authorization headers from the page. |

**Outcomes written in advance:**
- Any reached field below 3:1 after the change → **FAIL (Medium)**. Report its surround colour.
- A placeholder below 4.5:1, or one that looks like the typed value → **FAIL (Medium)**.
- Any Studio pixel change → **regression FAIL (Medium)**. Any store layout move beyond ± 1 px → **regression FAIL (Medium)**. Any keep-list text change → **FAIL (Medium, binding Saba rule)**.
- Remaining teal, glow or gradient colours and non-field `border-outline` surfaces are **STORE-2b inventory**, not a FAIL.
- New Lows go to `deferred_low_polish`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **SCOPE row honesty:** if A stops without implementing, SCOPE-194 is `notRun` with a `scopeNote`, never `passed`.

**Adjacent behaviour that could break, and the check that catches it:**

| Risk | Check |
|---|---|
| The auth modal fields (shared `Input`) change size | STORE-LAYOUT-194 and FIELD-BORDER-194 on the modal (same border width, so ±0) |
| A field's focus state loses its brass cue | the keyboard-focus step of FIELD-BORDER-194 |
| The keep-list popup copy changes by accident | ST5 literals, ST7, KEEP-194 |
| The Studio picks up a shared class | K0 grep, STUDIO-RV-194 |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Store text-field borders and the popup placeholder | **None.** These are store web pages, not Arrangement behaviour. | Nothing. | Saba's approved store direction A plus WCAG 1.4.3/1.4.11. | Parity: **არ ეხება**. Do not claim "Ableton does the same". |

## 6. Evidence and reporting
- **A:** `a-round-194.md` and `a-round-194/`.
- **C:** `c-round-194.md`, `c-round-194.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `notRun` / `gate`) and `c-round-194/`.
- **Both:** write the report files as you go.

## 7. Outcome, fixed in advance
| Condition | Round 195 |
|---|---|
| **C PASS** (`browserVerified=true`), whatever the date | Root publishes rounds 193 + 194 (19 M + 2 new). STORE-2a → **მზადაა**. If planning is on or after **2026-10-27**, round 195 is the **REGRESSION round** (`REGRESSION-ROUND-2026-10-27`), adding the STORE-2a token probe and one field-border spot check. Otherwise round 195 is STORE-2b, and the regression comes at the first planning on or after 2026-10-27. |
| **C FAIL** on a 194 row | One more bounded fix-up, before the regression round. |
| A stops at K0 with a field outside F1–F16 | B re-grants with that site. The planning cost is recorded for the RETRO. |
| A browser row that can run here did not run | `browserVerified=false`. STORE-2a is not done, and B re-plans the browser half. |

## 8. Root notes
- **Gate (on C PASS):** the round-193 diff **plus** the round-194 changes, all against `caa09af`. Together that is **19 modified + 2 new files**.
- **For Saba, vetoable (non-blocking):** R76 (CONTINUE text colour), R77 (placeholder `brand-foreground/60`), R78 (`outline-strong` on store fields).
- **Signals recorded, not scheduled:**
  - `STORE2A-INPUT-BORDER-STUDIO-SITES`: the legacy `components/studio/**` fields are forbidden files.
  - `STORE2A-PROTECTED-BRASS-TEXT`.
  - `ARCH-R193-THEME-REGION`: A's round-193 reviewer note on moving ST4/ST6 into `studio-theme-obsidian.test.tsx` and whether the obsidian block is still needed after STORE-2. B's decision point is the STORE-2 exit.
  - `GLOBAL-FOCUS-VISIBLE-UNLAYERED`.
- **Still open:** the `root.tsx` narrow grant for STORE-2c/2d; root request C-R188-I3; checkpoint `b-round-183-checkpoint-request.md` (fallback (c); next point: the STORE-REDESIGN exit). RETRO: at round 200 or the STORE-REDESIGN exit.
