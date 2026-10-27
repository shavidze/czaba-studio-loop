# CURRENT TASK — Round 203: SABA-B-4 stage 2 fix-up (C-R202-01 Input error border, C-R202-02 Play preview ring contrast, C-R202-03 typing ring; + Low C-R202-07)

Decision: **D-29z168** · Planned by B on 2026-10-27 (from 04:00 UTC) · Dispatcher B · Implementer A · Verifier C.

**Read first:** `lessons.md` (loop root). This planning step amended L1 (runtime-hidden focusables) and added L24 (B) and L25 (C).

## Baseline: HEAD `5b1a2bb` + the round-202 tree (uncommitted), NOT a clean tree
- Gate 202 was `skipped` (C taskStatus FAIL), so nothing was published. HEAD stays `5b1a2bb`.
- **The round-202 work stays in the tree and must not be reverted:** 31 ` M` + 3 `??` (`a-round-202/end-sha256.txt` checks OK at planning).
- **Frozen list:** `b-round-202-r203-tree-sha256.txt`, **1030 entries** = 1032 tracked + the 3 round-202 new files − the 5 round-203 grants, hashed on the current tree. Check from `store/` with `sha256sum -c --quiet`.
- **Grants (5):** `b-round-202-r203-grants.txt`. Start copies: `b-round-202/r203-granted-start/`, hashes in `b-round-202-r203-granted-start-sha256.txt`. 4 of them equal A's round-202 end hashes; `focus-source.ts` equals HEAD.
- **New files (2):** `b-round-202-r203-new-files.txt`. They must not exist at start.
- **Protected, unchanged as always:** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`. Also `.claude/**`, `CLAUDE.md`, and every frozen file (including the 27 other round-202 files, `Header.tsx`, `AudioPreviewButton.tsx`, `StudioWorkspace.tsx`).
- **Publication:** on C PASS, root publishes rounds 202 + 203 together against `5b1a2bb`: the 31 round-202 grants, the 3 round-202 new files, and this round's changes (same pattern as the 193→194→195 chain).

## 0. Why this round
C round 202 FAILED two rows with `browserVerified = true` (`c-round-202.md`, `c-round-202.json`). Every other row passed, and those passes stand, because their files are frozen now.

| Finding | Severity | What C measured | This round |
|---|---|---|---|
| **C-R202-01** (= A-R202-REVIEW-INPUT-ERROR-BORDER) | Medium, caused by round 202 | AuthModal `ui/Input`: the error border is never visible. `border-outline-strong` beats `error && 'border-destructive'` in the cascade; HEAD showed red only through `focus:border-destructive`, which R94 removed. Consumers: SignInForm, SignUpForm, ForgetPassword, `account.reset.$id.$token`. | **R101** |
| **C-R202-02** | Medium, pre-existing | Product-page "Play preview" (ProductSidebar, overlay variant): top side 2.68:1 out / 2.39:1 gap, against the button's own teal glow `rgba(19,217,204,…)` (an off-palette remnant). | **R102** |
| **C-R202-03** (= A-R202-REVIEW-TYPING-RING) | Medium, design ruling | Click a text field, type one key: `data-focus-source` flips to `keyboard` and the ring appears mid-typing. | **R103** |
| **C-R202-07** | Low | STF2 misses `[&:focus]:outline-none` (C's mutant c3 stayed green). The file is round-202's own new test, so it costs little now. | **R104** |

**Not in this round** (scheduled, see `b-round-202.md` §4): C-R202-04 (closed mobile menu at 375: 5 tab stops at opacity 0), C-R202-05 (StudioShowcase "Browse the Collection" at opacity 0) and B-R201-HEADER-USERMENU-KEYBOARD. Together they are round 204: "hidden focusables, runtime state", with `Header.tsx` granted. Lows C-R202-06/08/09 go to `deferred_low_polish`.

**Saba (2026-10-26, binding), unchanged:** one shared outline on `:focus-visible` only, 1.5px brass at ≤ 80 %, 2px offset, following the element's radius. No fill, pill or glow on focus. No ring after a mouse or pointer press. Contrast ≥ 3:1. R90: Chromium paints 1px, and the criterion is "≥ 1px painted".

## 1. Rulings (recorded in `backlog.json` → `SABA-B-4.stage2_rulings_d29z168`; Saba or root may veto)

| ID | Ruling | Why / B's evidence |
|---|---|---|
| **R101** (C-R202-01) | In `ui/Input.tsx`, for **both** `Input` (`<input>`) and `Textarea` (`<textarea>`):<br>(1) replace the class item `error && 'border-destructive'` with the static item `'aria-[invalid=true]:border-destructive'`;<br>(2) add `aria-invalid={error ? true : undefined}` on the field element, placed **before** `{...props}` so a caller's own `aria-invalid` still wins.<br>`baseInputStyles` and the Textarea's `border-2 border-outline-strong` stay unchanged. Nothing else in the file changes. | The attribute variant (`.x[aria-invalid="true"]`, specificity 0,2,0) beats `border-outline-strong` (0,1,0) whatever the CSS order. The ternary alternative removes `border-outline-strong` from `baseInputStyles` and turns the frozen ST8 **F14** red (L23), so it is rejected. It also gives screen readers the invalid state. **B's scratch copy** (`/tmp/b203s`, deleted): `store-theme-tokens` 38/38, `store-focus-ring` 10/10, `studio-focus-ring` green. In the browser on the scratch server (`b-round-202/out/errborder/b203scratch-5175-1280.json`), the AuthModal email after an empty submit is rgb(210,119,106) unfocused, keyboard-focused (plus the solid brass outline) and mouse-focused; `aria-invalid="true"`; before submit it is rgb(115,107,96). That exceeds HEAD, which showed red only while focused. |
| **R102** (C-R202-02) | In `app/styles/app.css`, change exactly two declarations of `.audio-preview-overlay-button`:<br>rest: `box-shadow: 0 4px 20px color-mix(in srgb, var(--color-background) 60%, transparent);`<br>`:hover`: `box-shadow: 0 8px 30px color-mix(in srgb, var(--color-background) 70%, transparent);`<br>Both replace the two-layer teal shadows. Nothing else changes: not the hover scale, not the inline variant (no consumer renders it), not the other 41 teal fragments (Low B-R202-APPCSS-TEAL-REMNANTS, deferred to the STORE stages). `AudioPreviewButton.tsx` is not touched. | It is the button's own always-on glow, not a focus glow, but it is the "adjacent colour" of the ring. A dark, token-based shadow keeps the depth and removes the off-palette teal. **B's probe** (style injection on the live tree, `b-round-202/tools/shadow-probe.cjs` + `ring-sides.cjs`, `out/ring-sides.txt`, DSF 3). The method reproduces C's failing numbers exactly at the start state: top 2.39 gap / 2.68 out, bottom 3.16/1.01, left 3.12/3.50, right 4.04/4.37. With R102 the product page measures top 3.21/3.35, bottom 6.07/5.49, left 4.58/4.70, right 5.38/5.41 at 1440 and 1280. The alternative `box-shadow: none` gives top 2.78/3.04, which is too marginal, so it is rejected. |
| **R103** (C-R202-03) | In `app/lib/focus-source.ts`: a keydown that is an **in-field editing key on a text-entry target** leaves the attribute unchanged. Every other key switches to `keyboard` exactly as today.<br>**Text-entry target:** `isContentEditable` or `HTMLTextAreaElement` (multi-line), or an `HTMLInputElement` of type text, search, email, password, url, tel or number (single-line). `select`, `range`, checkbox, file and buttons are not text entry.<br>**Editing keys:** with no Ctrl, Meta or Alt held: any key whose `key` has length 1 (printable, including space and Shift+letter), `Backspace`, `Delete`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `Process` (IME) and `Dead`. On multi-line targets only, also `Enter`, `ArrowUp`, `ArrowDown`, `PageUp` and `PageDown`. Auto-repeat changes nothing.<br>**Still switch to `keyboard`** (focus may move, or it is a command): `Tab`, `Escape`, `ArrowUp`/`ArrowDown`/`Enter`/`PageUp`/`PageDown` in single-line inputs, F-keys, and any key with Ctrl, Meta or Alt (e.g. Ctrl+K).<br>Add an exported, local `isFocusSourceFieldEditingKey(event: KeyboardEvent): boolean` with this logic (B's scratch shape: two `ReadonlySet`s and one type set). Do not import Studio's `isTypingTarget` (frozen `StudioWorkspace.tsx`); the duplication is recorded as an architecture signal. Modifier handling, the capture phase, the pointer path and the hook stay unchanged. | Saba: "no ring after a mouse or pointer press". Typing and caret editing in the field you clicked are part of that pointer interaction. Keys that can move focus or act as commands keep showing the ring. **Why the narrower rule:** B's first draft (only Tab switches) would hide the ring when ArrowDown in the Studio library search moves focus to the first result (`ArrangementLibrary.tsx` `handleSearchKeyDown`), and after Escape or Ctrl+K. A keyboard user who Tabbed in is already `keyboard`, so nothing changes for them. The reviewer's option (a), a ring on a pointer press into a text field, would re-open stage 1 (STUDIO-NEIGHBOUR "library search: no ring after a mouse press") and is rejected. Remaining indicator after a click while typing: the caret; `ui/Input` also floats its label and turns it brand. This is a conscious trade-off for Saba (vetoable). **B's scratch + browser probe** (`b-round-202/out/typing-probe2-5176.json` vs the live tree `typing-probe2-5173.json`, 1280). On `/store` search and the Studio library search: after a click, typing `ab`, ArrowLeft/Right, Home/End, Backspace/Delete, Shift+A and a held `x` keep `pointer` with outline none (the live tree flips to `keyboard`/solid on the first key). Escape → `keyboard`, solid outline. In Studio, ArrowDown moves focus to the first library result with a solid outline. Tab → `keyboard`, solid outline on the next element. `focus-source.test.tsx`, `focus-reveal-ui` and `studio-focus-ring` green; `tsc` clean. |
| **R104** (C-R202-07, Low) | `store-focus-ring.test.ts` STF2 also flags (a) arbitrary-variant forms `[&:focus]:…`, `[&:focus-visible]:…`, `[&:focus-within]:…` with an indicator kind (ring, ring-offset, outline, border, bg, shadow) or bare `outline-none`/`outline-hidden`/`outline-0`; (b) arbitrary-property forms with a focus variant, such as `focus:[outline:none]` and `focus-visible:[box-shadow:…]`. Add STF5 fixtures for each, plus a passing `[&:hover]:bg-brand`. Existing rows and assertions stay unchanged. | Closes C's mutant gap c3. It is a test-only change in a file this loop already owns. |

**Ableton:** does not apply (store pages, and focus modality has no Arrangement counterpart). Compliance status: **არ ეხება**. Do not claim parity.

## 2. A — files you own (everything else is frozen)
**Grants (5):**
- `app/components/ui/Input.tsx`: R101 only.
- `app/styles/app.css`: R102 only (the 2 `box-shadow` declarations).
- `app/lib/focus-source.ts`: R103 only.
- `app/lib/__tests__/store-focus-ring.test.ts`: R104 only (additions; no existing row is weakened).
- `docs/implementation/2026/quarter-IV/160-saba-b-4-store-focus-ring.md`: add a section "რაუნდი 203 — fix-up" in Georgian. It covers R101–R104, the rejected alternatives (the ternary × F14; `box-shadow: none`; reviewer option (a)), and the measured numbers. Do not rewrite the round-202 sections.

**New files (2):**
- `app/lib/__tests__/focus-source-typing.test.tsx` (jsdom), rows FT1–FT6 (step 3).
- `app/lib/__tests__/store-focus-fixups.test.tsx` (jsdom for Input, node `readFileSync` for the CSS), rows IE1–IE4 and PB1–PB2 (step 4).

**Primitives to read first:** `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md`.

**Steps:**
1. **Start checks**, from `store/`:
   - HEAD is `5b1a2bb`;
   - `git status --short --untracked-files=all` shows exactly the 31 ` M` and 3 `??` of round 202;
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-202-r203-tree-sha256.txt` is OK;
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-202-r203-granted-start-sha256.txt` is OK;
   - the 2 new files do not exist.
   - If any check fails, STOP (L11).
2. **Apply R101–R104.** L12/L23 pre-check, already done by B: `grep -rn "border-destructive\|aria-invalid" app --include=*.test.*` finds only `store-focus-ring` and `store-theme-tokens`, and both stay green on B's scratch copy. Re-run the grep. A new hit in a frozen test is a STOP.
3. **`focus-source-typing.test.tsx`.** Use `installFocusSourceTracking(document)`, and a fresh attribute per test. Dispatch every keydown **on the target element** (`fireEvent.keyDown(el, {...})`).
   - **FT1:** pointerdown, then `a`, `A` with `shiftKey`, space, `Backspace`, `Delete`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `Process` and `Dead` on an `<input type="text">`: the source stays `pointer` after each.
   - **FT2:** the FT1 keys on a `<textarea>`, a `contenteditable` div, and inputs of type search, email, password, url, tel and number: `pointer`. On the textarea and the contenteditable div, `Enter`, `ArrowUp`, `ArrowDown`, `PageUp` and `PageDown` also stay `pointer`.
   - **FT3:** after a pointerdown, each of these on the text input switches to `keyboard` (fresh pointerdown before each): `Tab`, `Tab` with `shiftKey`, `Escape`, `ArrowDown`, `ArrowUp`, `Enter`, `PageDown`, `F6`, `k` with `ctrlKey`, `k` with `metaKey`, and `a` with `altKey`.
   - **FT4:** non-text targets still switch: `ArrowUp` on `<input type="range">`, `a` on a `<button>`, `ArrowDown` on a `<select>`, ` ` on an `<input type="checkbox">`, and `a` on `document.body` all give `keyboard` (FS-b stays true).
   - **FT5:** auto-repeat: 3 keydowns `x` with `repeat: true` on the text input after a pointerdown leave `pointer`.
   - **FT6:** an `isFocusSourceFieldEditingKey` truth table over (target, key, modifiers), covering every case above, plus a `null` target and `document` → `false`.
4. **`store-focus-fixups.test.tsx`:**
   - **IE1:** `render(<Input label="Email" error="Email is required" />)`: `getByLabelText('Email')` has `aria-invalid="true"`.
   - **IE2:** without `error`, it has no `aria-invalid` attribute.
   - **IE3:** `<Input label="Email" error="x" aria-invalid={false} />`: the caller's value wins (`aria-invalid="false"`).
   - **IE4:** the same as IE1 and IE2 for `Textarea`. Attributes only: no class-token or cascade assertions in jsdom (L12). The colour is a browser row.
   - **PB1** (node): in `app.css`, with comments stripped, the `.audio-preview-overlay-button` rule block and its `:hover` block contain no `rgba(19, 217, 204` and contain `var(--color-background)` in `box-shadow`.
   - **PB2:** `.audio-preview-overlay-button:focus`/`:focus-visible` rules do not exist (the focus look stays the global outline).
5. **Covering tests** (speed rule; no full suite, no `npm run verify`):
   ```
   npx vitest run app/lib/__tests__/focus-source-typing.test.tsx app/lib/__tests__/store-focus-fixups.test.tsx app/lib/__tests__/focus-source.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/sfx-video-choose-button.test.tsx app/lib/arrangement/__tests__/studio-focus-ring.test.ts app/lib/arrangement/__tests__/focus-reveal-ui.test.tsx app/lib/__tests__/audio-preview-player.test.tsx app/lib/__tests__/product-presentation.test.tsx
   ```
   - Add every test file that imports `ui/Input`, `~/components/ui` or `focus-source` (`grep -rlE`), and list it in the report.
   - Then run `npm run typecheck` and `npm run lint`. No frozen test may turn red; if one does, STOP and name it.
6. **Mutants** (each kept out of the final tree; report each result):
   - n1: put `error && 'border-destructive'` back in Input → IE1 stays green, but the browser self-check (step 7) shows grey. This mutant proves why the browser row exists; report it as expected-green.
   - n2: remove the `aria-invalid` prop from Input → IE1 red.
   - n3: put `aria-invalid` after `{...props}` → IE3 red.
   - n4: drop the `isFocusSourceFieldEditingKey` early return in `focus-source.ts` → FT1 red.
   - n5: add `Escape` to the editing keys → FT3 red.
   - n6: treat `range` as text entry → FT4 and FT6 red.
   - n6b: ignore the Ctrl/Meta/Alt check → FT3 red (Ctrl+K).
   - n6c: apply the multi-line keys to single-line inputs too → FT3 red (ArrowDown).
   - n7: put the teal rest shadow back → PB1 red.
   - n8: add `[&:focus]:outline-none` to `IconButton` → STF2 red (C's c3). `IconButton` is frozen: back it up and restore it, then run `sha256sum -c` on the frozen list, or use a scratch copy, so SCOPE-203 finds no residue.
7. **Browser self-check before handover (L15)**, with the mock on :5199, which you start and stop. Use B's tools in `b-round-202/tools/` (`errborder-scratch.cjs <port> <W>`, `typing-probe.cjs <port>`, `shadow-probe.cjs`, `ring-sides.cjs`):
   - **AuthModal at 1280:** email and password after an empty submit. Report the border colour unfocused, keyboard-focused and mouse-focused, plus `aria-invalid`.
   - **Product page "Play preview" at 1280 and 1440:** the per-side gap/out contrast with `ring-sides.cjs`.
   - **Typing on `/store` and `/studio-lab`:** run `typing-probe2.cjs <port>`. Report `data-focus-source` and the outline after click, typing, the edit keys, Escape, ArrowDown (Studio: focus moves to the first result) and Tab.
8. **Code review:** `code-reviewer` subagent (5 files + 2 new). Pass its Architecture note to B verbatim. Fix Medium+ findings inside the grants.
9. **Deliverables:** `a-round-203.md`; `a-round-203/end-sha256.txt` (grants + new files); `a-round-203/diff-vs-start.patch` (grants vs `b-round-202/r203-granted-start/`, new files in full). No commit, no push.

**STOP rules (L11):**
- a start check fails;
- a frozen test turns red;
- R101's attribute variant does not win in the browser;
- R102 leaves any product-page side below 3:1 on both gap and out;
- you need a file outside the grants.

Write "STOP — needs B ruling on <id>" at the top of `a-round-203.md`, with the measurement, and leave the tree at the last consistent state.

## 3. C — what to verify
- Write `c-round-203.md` and `c-round-203.json` as you go.
- Start the mock on :5199, and stop it at the end.
- **Ref = the round-203 start state, built from the working tree (not `git archive`):** copy `store/` with tar, excluding `node_modules`, `.git`, `build` and `.vite*`. Symlink `node_modules`. Restore the 5 grants from `b-round-202/r203-granted-start/` and delete the 2 new files. `b-round-202-r203-tree-sha256.txt` (1030) must check OK on the copy. Serve it on its own port with its own `cacheDir`. `git archive 5b1a2bb` would lack the round-202 changes and fail the frozen list.
- **Viewports:** 1440×900 and 1280×720; also 375×812 where a row says so.
- Keyboard means real Tab/Shift+Tab; pointer means a real mouse click. Settle ≥ 400 ms before crops.
- **Pre-existing failures (L24):** in every row below, a failure that is identical in ref and outside this round's change is listed with its ref result and filed. It does not fail the row, unless the row names that element as its target.

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SCOPE-203** | Frozen list (1030) at C's start and end; A's `end-sha256.txt`; `git status`; each grant's diff vs its start copy. | `git status` = the round-202 31 ` M` + 3 `??`, plus 2 new `??`. Input.tsx is only R101 (2 class items + 2 `aria-invalid` props). app.css is only the 2 R102 declarations. focus-source.ts is only R103 (the type set, the predicate, the early return). store-focus-ring.test.ts only adds R104 scanner cases and fixtures. Doc 160 only appends the round-203 section. | Any other change. |
| **ERROR-BORDER-203** | AuthModal (`/store` → Sign In → empty submit): the email and password `Input`s, unfocused, Tab-focused and mouse-focused. Also SignUp (switch tab, empty submit), GuestForm on `/support` and one `/hire-us` field (if it has an error state; else say so). Ref the same. 1440 + 1280. | The Input border is `border-destructive` (rgb(210,119,106)) in all 3 states, and `aria-invalid="true"`. Keyboard focus adds the solid brass outline, with box-shadow none. Before submit (no error), the border is outline-strong and `aria-invalid` is absent. Destructive border vs surface ≥ 3:1 (measure). GuestForm is unchanged from ref. | Any state without the red border, a changed valid-state look, or a GuestForm change. |
| **CONTRAST-203** | "Play preview": `/products/pulse-loop-kit` (ProductSidebar) and `/` cards (ProductCard, R99 scrim), keyboard focus, 1440 + 1280. Method: B's `ring-sides.cjs` at DSF 3 (walk from 22 CSS px from the centre outward: body → gap → ring → outside), or an equivalent C states. Ref the same. | Each of the 4 sides: ring vs gap **or** ring vs outside ≥ 3:1. On the product page the top side is ≥ 3:1 on both (B: 3.21/3.35). The `/` card variant uses the same criterion (each side ≥ 3:1 on gap or out); B has no valid `/` start numbers, so C measures ref too and reports both. The glow is no longer teal. | Any side < 3:1 on both. |
| **HOVER-203** | Mouse hover on the product-page and `/` "Play preview" buttons. | Scale-up as in ref. The hover shadow is dark (not teal). No ring on hover or after the click. | Teal shadow, or a ring after a pointer press. |
| **TYPING-203** | Fields: `/store` search, the `/` newsletter field, the AuthModal email, the ⌘K input (opened by a mouse click on the header search button), the Studio library search and the tempo field. For each: click; type 2 characters and Shift+letter; press ArrowLeft/Right, Home/End and Backspace/Delete; hold a key (auto-repeat). Then, separately after a fresh click: (i) Escape, (ii) ArrowDown, (iii) Tab. Record the active element and its outline after each. Ref the same. 1440 + 1280. | While typing and editing: `data-focus-source="pointer"` and outline none on the field. Escape, ArrowDown and Tab each switch to `keyboard`, and wherever focus is after the key shows the ring; in the Studio library search, ArrowDown focuses the first result with the ring. A field reached by Tab shows the ring and keeps it while typing. Any Escape/ArrowDown focus change that differs from ref is listed. | A ring appearing mid-typing after a click; no ring after Escape, ArrowDown or Tab; or a Tab-reached field losing its ring. |
| **NONTEXT-203** | Studio Volume fader and Pan: click, then ArrowUp. A store Button: click, then Space. Ref the same. | Identical to ref: the keyboard key switches to `keyboard`, and the ring shows exactly as in ref. | Any difference from ref. |
| **KEY-RING-203 (spot)** | Tab through `/store`, the AuthModal (both tabs) and `/products/pulse-loop-kit` at 1280. Record outline and box-shadow. | Every stop: a solid brass outline ≥ 1px painted, offset 2px, box-shadow unchanged from unfocused; identical to the round-202 C sweep (`c-round-202/out/sweep/*`) except the Play preview's shadow colour. | A second band, a glow, or a missing outline. |
| **NO-SHIFT-203** | Element boxes on `/products/pulse-loop-kit`, the AuthModal before and after the empty submit, and `/store`, tree vs ref, 1440 + 1280. | ±0 px. | Any box moves. |
| **T-RUN-203** | On a scratch copy: the 2 new suites and `store-focus-ring` green on the tree. On the start copy (ref), the expected results are:<br>**red:** IE1, the error half of IE4, FT1, FT2, FT5, PB1, and the new STF2/STF5 cases; FT6 is red by a missing export (import/TypeError), which is the expected failure mode;<br>**green:** IE2, IE3, the no-error half of IE4, FT3, FT4 and PB2.<br>Run A's n2–n8 (including n6b and n6c), plus 2 of C's own, for example `aria-[invalid=true]:` removed from Textarea only, or `'number'` dropped from the type set. | Start-copy results match the table. Each mutant turns its row red (n1 is expected-green by design). | A start-copy result differs from the table, or a mutant stays green. |
| **AN-REVIEW-203** | Added lines: 0 `as`, `any` or `@ts-ignore`; 0 hex in `.tsx`. The new CSS uses `var(--color-background)` only. The doc-160 section is in Georgian and covers R101–R104 and the rejected alternatives. | True. | Otherwise. |
| **BLOCKED-AUTH-203** | `account.reset.$id.$token` (2 `PasswordInput`, the only `ui/Input` consumer outside the AuthModal): if it renders with the mock, check it as in ERROR-BORDER-203; otherwise BLOCKED. The `/studio/:id` components. | Listed under `"blocked"`: "backend unavailable in cloud". | — |
| **G203-3** | Fresh anonymous context, both viewports: `/studio-lab` workspace + demo badge; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `GET /api/studio-token` → 401 with no header, 403 with a fake Bearer. | As stated. | Any bypass is Critical. |

- **Gate rows** (`"gate"`, never in `"passed"`): full vitest, typecheck, build, Biome, `npm run verify`, PROD-MP3-UNVERIFIED.
- **`browserVerified`:** true only if every runnable browser row above ran.
- **Consults (optional):** `accessibility-auditor` on the R103 trade-off (caret-only indicator after a click). A disagreement is a finding for Saba, not an edit.
- **Probe first (L17, L25):** the SignUp tab (longest error state, L16), and the password field (PasswordInput wraps Input).

## 4. Neighbour risk
- **R101:** every `ui/Input`/`Textarea` consumer gains `aria-invalid` when `error` is set. A screen reader now announces "invalid", which is intended. The floating label (`peer-*`) is unaffected.
- **R102:** the hover look changes colour only (teal → dark). The home R99 overlay gets a darker halo inside its scrim.
- **R103:** it changes Studio too. After a mouse click into the library search, tempo field, Clip Gain field or marker rename, typing and caret keys no longer show a ring. Tab, Escape, ArrowDown/ArrowUp in single-line fields (the library search's ArrowDown moves focus to the results) and modifier shortcuts still do. Range faders, buttons and `role=slider` are unchanged. The Studio keydown handlers are untouched (the capture listener only reads).
- **The round-202 rows** that passed stand as evidence for the frozen files. KEY-RING-203 spot-checks them for drift.

## 5. Outcome, fixed in advance
| C result | B at round-204 planning |
|---|---|
| All rows PASS | SABA-B-4 stage 2 → **მზადაა** (round-202 PASS rows + round 203). Close C-R202-01/02/03/07, A-R202-REVIEW-INPUT-ERROR-BORDER, A-R202-REVIEW-TYPING-RING, C-R196-03, B-R200-HIDDEN-FOCUSABLE-GAP, B-R201-PRODUCTCARD-HIDDEN-PREVIEW and the store half of GLOBAL-FOCUS-VISIBLE-UNLAYERED. Round 204 = **hidden focusables, runtime state** (C-R202-04, C-R202-05, B-R201-HEADER-USERMENU-KEYBOARD; `Header.tsx` + StudioShowcase granted). Send the frontend-architect checkpoint request to root. |
| A Medium+ FAIL | Round 204 = a bounded fix-up of those rows (bug gate). |
| A STOP | B rules first (L10); C runs the short round (L22). |
| SCOPE-203 fails | Root inspects; nothing is published. |

## 6. Deliverables and root notes
- **A:** `a-round-203.md`, `a-round-203/end-sha256.txt`, `a-round-203/diff-vs-start.patch`, the 2 new files.
- **C:** `c-round-203.md`, `c-round-203.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, `bugs`), evidence under `c-round-203/`.
- **Root:** on C PASS, publish rounds 202 + 203 against `5b1a2bb` (the 31 + 3 round-202 paths, the 5 grants, the 2 new files). The loop state commit includes `tasks/round-202.md`, `b-round-202/`, `lessons.md`, `backlog.json`, `feature-status.md` and `b-next.json`.
