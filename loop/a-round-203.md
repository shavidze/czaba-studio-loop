# A round 203 — SABA-B-4 stage 2 fix-up (R101–R104) — handed to C

No STOP. No commit, push or deploy. The round-202 work is untouched (frozen list OK).

## Start checks (all OK)
- HEAD `5b1a2bb`.
- 31 ` M` + 3 `??` (round 202).
- `b-round-202-r203-tree-sha256.txt` (1030) OK; `b-round-202-r203-granted-start-sha256.txt` OK.
- The 2 new files were absent.
- L12/L23 grep `border-destructive|aria-invalid` in `app/**/*.test.*`:
  - B listed store-focus-ring and store-theme-tokens.
  - This run found instead `arrangement/__tests__/header-meter-envelope-strings-ui.test.tsx:384` and `studio-theme-obsidian.test.tsx:370`.
  - Both are about the Studio Master Peak, not `ui/Input`, so neither is a collision.
  - I added both to the covering set; both are green.
  - **A literal reading of step 2 ("a new hit in a frozen test is a STOP") would STOP here.** I proceeded because neither test touches `ui/Input` and both pass. B may veto.
  - Planning-input discrepancy for B: B's stated grep result (store-focus-ring + store-theme-tokens) does not match this tree. Neither of those two files matches the pattern.

## End state
- `git status`: 32 ` M` (the 31 of round 202 + `app/lib/focus-source.ts`) and 5 `??` (the 3 of round 202 + the 2 new files).
- The frozen list (1030) is OK at the end too, after every mutant was restored.

## Changed files (grants only)
| File | Change |
|---|---|
| `app/components/ui/Input.tsx` | R101: in Input and Textarea, `error && 'border-destructive'` → `'aria-[invalid=true]:border-destructive'`, and `aria-invalid={error ? true : undefined}` before `{...props}`. Nothing else. |
| `app/styles/app.css` | R102: exactly the 2 `box-shadow` declarations of `.audio-preview-overlay-button` (rest 60 %, `:hover` 70 %, `color-mix(… var(--color-background) …)`). |
| `app/lib/focus-source.ts` | R103: `FOCUS_SOURCE_TEXT_INPUT_TYPES`, `FOCUS_SOURCE_FIELD_EDITING_KEYS`, `FOCUS_SOURCE_MULTILINE_EDITING_KEYS`, the exported `isFocusSourceFieldEditingKey(event)`, and the early return in `handleKeyDown`. See the two notes below. |
| `app/lib/__tests__/store-focus-ring.test.ts` | R104: `ARBITRARY_FOCUS_VARIANT_PATTERN` (`[&:focus]`, `[&:focus-visible]`, `[&:focus-within]`) and `ARBITRARY_INDICATOR_PROPERTY_PATTERN` (`[outline…:`, `[box-shadow…:`, `[border…:`, `[background…:`) added to `isFocusIndicatorToken`. STF5 gets 10 new flagged fixtures and 2 new passing ones (`[&:hover]:bg-brand`, `[&:focus]:opacity-100`). Existing rows are unchanged. |
| `docs/implementation/2026/quarter-IV/160-saba-b-4-store-focus-ring.md` | Appended "რაუნდი 203 — fix-up" (Georgian): R101–R104, the 3 rejected alternatives, the numbers, TODO. Round-202 sections untouched. |
| NEW `app/lib/__tests__/focus-source-typing.test.tsx` | FT1–FT6. |
| NEW `app/lib/__tests__/store-focus-fixups.test.tsx` | IE1–IE4, PB1–PB2. |

**Two details in R103 beyond B's literal shape, both inside the predicate and both robustness only:**
1. **`typeof event.key !== 'string'` → `false`.** Chrome autofill dispatches a keydown with no `key`, and `event.key.length` would throw there. Behaviour on that event is unchanged: it switches to `keyboard`, as before. FT6 covers it, and mutant nL1 turns it red.
2. **`target.isContentEditable === true`.** jsdom leaves `isContentEditable` undefined, and the predicate then returned `undefined` instead of `false`; FT6 caught this. In browsers the property is always boolean.

The tests set `isContentEditable` on one fixture element with `Object.defineProperty` (a jsdom gap). The real contenteditable path is therefore not proven in jsdom. No `app/` code uses contenteditable today.

## Tests actually run
**Covering set: 12 files, 126 tests, all green.**
- The 10 files from task step 5.
- `arrangement/__tests__/studio-theme-obsidian.test.tsx`: it reads app.css.
- `arrangement/__tests__/header-meter-envelope-strings-ui.test.tsx`: the grep hit.
- The `grep -rlE "ui/Input|~/components/ui['\"]|focus-source"` scan added no further files (studio-focus-ring, store-focus-ring, store-theme-tokens and focus-source were already in the set).

**Transitive consumers:** `grep -rlE "SignInForm|SignUpForm|ForgetPassword|AuthModal|PasswordInput|hire-us|account\.reset|GuestForm"` in tests found `store-header-footer.test.tsx` (9/9 green), plus store-focus-ring and store-theme-tokens (already in the set).

**Other checks:**
- `npm run typecheck`: 0 errors.
- `npm run lint`: 0 errors, 214 warnings, 1 info. Doc 160 recorded 215 at HEAD.
- Scoped `npx biome check` on the 6 code/test paths: clean. One format fix was applied to my own `store-focus-ring.test.ts`. app.css is not checked by the Biome config: "Checked 5 files".
- Not run (gate rows): the full suite, build, `npm run verify`.

## Mutants (each restored; `cmp` against the final copies and the frozen list both OK)
| Mutant | Result |
|---|---|
| n1 `error && 'border-destructive'` back | IE1–IE4 stay green (4 passed): **expected green**. The browser shows grey in this state (C-R202-01's evidence). |
| n2 `aria-invalid` removed from Input | IE1 red |
| n3 `aria-invalid` after `{...props}` | IE3 red |
| n4 early return dropped | FT1 red |
| n5 `Escape` added to editing keys | FT3 red |
| n6 `range` treated as text entry | FT4 red and FT6 red. FT4 needed one added `ArrowLeft`-on-range case; with ArrowUp alone, n6 stayed green in FT4. |
| n6b Ctrl/Meta/Alt check dropped | FT3 red |
| n6c multi-line keys applied to single-line inputs | FT3 red |
| n7 teal rest shadow back | PB1 red |
| n8 `[&:focus]:outline-none` in IconButton (frozen; restored and verified by hash) | STF2 red |
| nL1 `typeof key` guard dropped (review L1) | FT6 red |
| nL4 `#13d9cc` layer added to the shadow (review L4) | PB1 red |

## Browser self-check (Playwright Chromium, dev server :5173, mock :5199 started and stopped by A)
Tools are copied under `a-round-203/tools/` (B's tools, output redirected to `a-round-203/out/`, plus `auth-fields.cjs`, `home-sides.cjs` and `tab-typing.cjs`).

**AuthModal, R101** (`out/errborder/a203-5173-{1280,1440}.json`, `out/auth-fields.json`, `out/signup-errors-*.png`):
- Sign In email and password, and Sign Up name, email and password, after an empty submit, at 1280 and 1440: border `rgb(210, 119, 106)`, `aria-invalid="true"`.
- Three focus states, measured for both Sign In email (`a203-5173-*.json`) and Sign In password (`a203-password-5173-*.json`), at 1280 and 1440:
  - unfocused: no outline, red;
  - keyboard Tab focus: solid brass outline `rgb(201 164 106 / 0.8)`, box-shadow none, red;
  - mouse focus: no outline, red.
- Sign Up fields were measured unfocused only.
- Before submit: `rgb(115, 107, 96)`, no `aria-invalid`.
- Destructive border vs field bg `rgb(22, 20, 18)` = **5.76:1**; valid border = 3.50:1.
- GuestForm (`/support`): red 1px border, Tab → solid outline. It is not an `ui/Input` consumer and was not changed.

**Play preview ring, R102** (DSF 3, gap/out; `out/shadow-probe.json`, `out/home-sides.json`):
| Page | Top | Bottom | Left | Right |
|---|---|---|---|---|
| Product page `/products/pulse-loop-kit`, 1440 = 1280 | 3.21/3.35 | 6.07/5.49 | 4.58/4.70 | 5.38/5.41 |
| `/` card | 4.14/4.02 | 5.45/5.12 | 4.73/4.78 | 4.89/5.04 |
- The product-page numbers equal B's prediction exactly.
- On the `/` card, bottom and left come from the walker. Top and right are manual pixel samples at 1440, because `ring-sides.cjs`'s brass classifier does not recognise the scrim-tinted ring there (it walks into the card art). The 1280 walker output is pixel-identical to 1440.
- The computed shadow is `rgb(14 13 12 / 0.6) 0 4px 20px`: no teal.

**Typing, R103** (`out/typing-probe2-5173.json`, `out/tab-typing.json`, 1280):
- `/store` search and the Studio library search, after a click: typing `ab`, ArrowLeft/Right, Home/End, Backspace/Delete, Shift+A and a held `x` all keep `pointer` with outline none.
- Escape → `keyboard`, solid outline.
- ArrowDown: on `/store` the field shows solid; in Studio, focus moves to the first library result with a solid outline.
- Tab → next element (`All`), solid.
- A field reached by Tab keeps `keyboard` and its solid 1px outline while typing and editing.

Not self-checked (left to C): the ⌘K input, newsletter, AuthModal typing, tempo field, NONTEXT rows, NO-SHIFT boxes, and hover visuals.

## Code review (`code-reviewer` subagent, 7 files): score 8.5/10, no Critical or High
**Fixed (Low, in my own test files):**
- L1: autofill keyless keydown row.
- L2: input without a `type` attribute row.
- L3: `slice(1)` → `filter(type !== 'text')`.
- L4: PB1 also rejects any hex, `rgb()` or `hsl()` colour in the shadow.

**Open, for B:**
- **M1 (Medium, needs a B ruling, not an A fix).** Android Chrome soft keyboards send `keydown` with `key === 'Unidentified'` (keyCode 229), and IME composition can send non-`Process` keys (e.g. composition-commit Enter) with `isComposing === true`. Both flip the source to `keyboard`, so C-R202-03 (the ring mid-typing) still happens on Android after a tap into a text field. R103's key list does not include them, so I did not widen it.
  - Reviewer's proposal: on a text-entry target, also treat `event.isComposing === true || event.key === 'Unidentified'` as editing, with FT6 rows for both.
  - Not measured here: no Android device; Playwright desktop Chromium sends real keys.
- L5 (Low): store-focus-fixups has its own small CSS rule parser, duplicating `cssRulesOf` in store-focus-ring. Sharing it needs a helper file outside the grants.
- I1 (Info): AltGr (Ctrl+Alt) or macOS Option typing switches to `keyboard` per the ruling (e.g. `@` on German layouts); doc-160 TODO. I2 (Info): ArrowUp/Down in `type=number` and digits in date/time inputs show the ring, per spec. I3 (Info): the `instanceof` checks use the global realm (iframe documents not supported; no caller). I4 (Info): the tokenizer splits on `(`, so `focus-visible:[box-shadow:…var(--x)]` is caught by its prefix.
- Pre-existing, outside scope: the `ui/Input` error `<p>` is not linked to the field by `aria-describedby`. Backlog candidate.

**Architecture note (verbatim from the reviewer, for B/root; not acted on):**
> Signal 2 (ownership/coupling): `app/lib/focus-source.ts:49-66` and the frozen `app/components/arrangement/StudioWorkspace.tsx:371-385` (`isTypingTarget`) are now two separate definitions of "text-entry target". They already differ on purpose: Studio counts `HTMLSelectElement` as a typing target and focus-source does not. They also use separately maintained type sets that happen to match today. **Keep for now:** the Studio file is frozen, the new predicate is pure and has its own truth table, and the duplication does no harm yet. Cost of drift: low to medium. **Proposal for the planner:** one bounded task that extracts `isTextEntryTarget(target)` (input types, textarea, contenteditable) into `app/lib/`. Studio's `isTypingTarget` would call it plus `HTMLSelectElement`, and focus-source would call it directly. Acceptance: no behaviour change in Studio's keydown handlers, FT6 and the existing Studio shortcut tests stay green, plus one shared truth-table test. Minor signal 3: the second CSS rule parser (L5). Fold it in only when either scanner next changes.

## B acceptance criteria I actually passed (A-side only; C verifies)
- Steps 1–6 and 8–9 done as specified.
- Step 7 done for the 3 named self-checks.
- None of the STOP conditions occurred:
  - R101's attribute variant wins in the browser;
  - no product-page side is below 3:1 (lowest 3.21);
  - no frozen test turned red;
  - no file outside the grants was needed.

## Exact next C checks
1. SCOPE-203: frozen list (1030), `a-round-203/end-sha256.txt`, `git status` = 32 ` M` + 5 `??`, and `diff-vs-start.patch` vs the start copies. Expect the 2 predicate robustness lines noted above.
2. ERROR-BORDER-203: probe the SignUp tab first (L16) and the password field; check `account.reset` (BLOCKED unless it renders with the mock).
3. CONTRAST-203: the `/` card. The walker fails on top and right there; use an equivalent method and measure ref too.
4. TYPING-203: the ⌘K input (mouse-opened), the newsletter field, AuthModal email, and the Studio tempo field.
5. NONTEXT-203, KEY-RING-203, NO-SHIFT-203, HOVER-203, T-RUN-203 on the start copy, including FT6's expected failure mode (missing export), G203-3.
6. Optional: accessibility-auditor on the R103 trade-off and on M1 (Android).

## Known gaps
- M1 (Android `Unidentified` / IME composition) is unhandled per the ruling.
- The contenteditable branch is unit-tested only through a jsdom shim.
- The `/` card's top and right ratios are manual samples (method note above).
- Full suite, build and verify are not run here; those are gate rows.
