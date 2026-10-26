# A round 194 — STORE-2a fix-up (C-R193-01 / C-R193-02), D-29z159

**Status: IMPLEMENTED within the 13 grants, but the K0 stop rule was triggered after code review.**
- Fields outside F1–F16, in files that are not forbidden, still use a bare `border-outline`. One of them, GuestForm, is reachable anonymously on `/support` and measured **1.21:1** live.
- Round outcome: §7 row "A stops at K0 with a field outside F1–F16 → B re-grants with that site".
- **STORE-2a is not done (not „მზადაა“) from this round.** Nothing was reverted. The grant edits are correct and stay in the tree for B's re-grant round to build on.

A's browser evidence is A's own. It does not replace C's rows. `browserVerified` and `realVerified` are C's to set.

## Preconditions (all OK, before any edit)
- HEAD is `caa09af`.
- `git status --short` was the 10 ` M` + 2 `??` that round 193 left.
- `a-round-193/end-sha256.txt` OK. Frozen list `b-round-193-r194-tree-sha256.txt` (1011) OK. The 13 start hashes OK.
- Mock :5199 was not listening. A started `node mock-api/server.mjs` (PID 5140, log `a-round-194/mock.log`) and stopped **only that PID** at the end. :5173 was not touched.

## K0
- B's `fieldscan.mjs` re-run gave exactly F1–F16 except F14 (ui/Input `:225`, ChatInput `:70` and 13 JSX sites; F14 `Input.tsx:34` came from the constant grep) plus the two expected forbidden hits: `components/studio/ExportDialog.tsx:283` and `VideoUploadZone.tsx:169`.
- Constant grep: `Input.tsx:34`, `ChatInput.tsx:70` and `VersionSelector.tsx:71`. VersionSelector is a `<button>` card, not a field.
- Studio: `components/arrangement` imports only `Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle` from `~/components/ui` (`ArrangementExportDialog.tsx:2`). No `Input`, `Textarea` or `ChatInput`.
- **Missed by K0, found by the code-reviewer and confirmed from source:**
  - `app/components/chat/GuestForm.tsx:67` (name) and `:91` (email), `'border-outline focus:border-brand'`. Mounted on `/support` (`support.tsx:69` → `ChatWindow.tsx:57`) for an anonymous visitor. **Live: 1.21:1 at all four midpoints** (1440, `out/support-guestform.json`). Brass border on keyboard focus.
  - Constant-styled fields on `bg-background`, routes `/scenes/:id` and `/recordings/:id` (backend):
    - `recordings/SfxSoundLibrary.tsx:68` (→ the `:97` search and the `:109` select);
    - `SfxSceneBuilder.tsx:112` (→ the number inputs and the `:783` select);
    - `SfxVideoSync.tsx:25`;
    - `SfxQuickEdit.tsx:183`.
  - B may rule `recordings/` Studio-adjacent; that is B's call.
  - **Why the scan missed them (RETRO input):**
    - `fieldscan.mjs` uses `i+14` exclusive, which is the tag plus 13 lines, and GuestForm's token is at tag+14.
    - Constants: the class string is on the line after `const xClass =`, so a grep filtered by line content (`input|field|…`) missed them.
    - Proposal: a 15-line window, plus `grep -A1 'Class\w*\s*=\s*$'` and `className=\{\w+\}`.
- Not touched (no grant): GuestForm and recordings.

## Changed files (13 grants only; `diff-vs-start.patch`, `end-sha256.txt`)
- **P1** `LeadMagnetPopup.tsx`: `placeholder:text-dim` → `placeholder:text-brand-foreground/60`. No other byte changed.
- **K2, one token per site** (`border-outline` → `border-outline-strong`, 16 sites, no reflow, so R79 was not needed):
  - `NewsletterSection.tsx` (F1);
  - `store.tsx` (F2);
  - `hire-us.tsx` (F3–F6);
  - `free-downloads.tsx` (F7);
  - `gift-cards.tsx` (F8);
  - `GiftCardInput.tsx` (F9);
  - `cart.tsx` (F10);
  - `account.tsx` (F11–F13);
  - `ui/Input.tsx` (F14 `baseInputStyles`, F15 `Textarea`);
  - `chat/ChatInput.tsx` (F16).
- **F1 fallback not used:** `border-outline-strong` measured ≥ 3.11 everywhere.
- **T1** `store-theme-tokens.test.ts`:
  - adds ST7, ST8 (an `it.each` over F1–F16, located by stable anchors) and ST8b (the B-specified 14-line class guard);
  - ST1–ST6 are unchanged.
- **D1** doc 158:
  - status → `In Progress (awaiting C round 194)`;
  - a Georgian "Round 194" section with C's numbers, R77–R79 and the rejected alternatives, F1–F16, and the two forbidden legacy sites;
  - a "K0 stop rule" subsection on the missed fields;
  - the F16 reachability is corrected: `/support` via `ChatWindow.tsx:75`, once a chat session exists;
  - TODOs: the 2b non-field inventory, the B re-grant, and `FilterBar.tsx:99` `.sort-select` (`app.css:2219`).
- `git status --short`: **21 lines (19 ` M` + 2 `??`)**, exactly the expected set. The frozen list is OK after the work.

## Tests and checks actually run
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: **24/24 green**.
- **Red proof** (scratch `app/` with the 13 start copies, `STORE_THEME_TOKENS_ROOT`): ST1–ST6 green; ST7, ST8 ×16 and ST8b red (18 failed / 6 passed). See `a-round-194/redproof.txt`.
- **Mutants:**
  - m10 (P1 back) → ST7 red;
  - m11 (F2 back) → ST8 F2 and ST8b red;
  - m12 (Input base back) → ST8 F14 red;
  - m13 (scratch `<input className="border border-outline" />` in hire-us) → ST8b red.
  - The scratch copies are deleted (temporary).
- **Neighbours:** `gift-card-input`, `store-header-footer`, `store-theme-tokens`, `studio-theme-obsidian`: 48/48 green. A grep finds no other test that imports the changed components or routes.
- **e2e grep:** only `store-page.spec.ts:19` (the placeholder `/Search/`, unchanged) and pill `toHaveClass(/bg-brand/)`. No dependence on the changed classes.
- `npm run typecheck`: 0 errors.
- `npm run lint`: 214 warnings + 1 info (the same as round 193).
- `npx biome check` on the 12 code/test grants: 0 errors, 26 warnings. The start copies give the same 26.
- **Not run (gate):** full vitest, build, verify, e2e.

## Live proof (Playwright Chromium, :5173, mock :5199, DPR 2, `--disable-lcd-text`; `out/fields.json`, `shots/fields/`)
Border vs the pixel just outside, at the four edge midpoints, unfocused:

| Field | Viewports | min ratio (t/r/b/l) | Keyboard focus |
|---|---|---|---|
| F1 newsletter `/` | 1440 / 1280 / 375 | 3.12 / 3.12 / 3.11 (3.11–3.47) | brass `rgb(201,164,106)` |
| F2 `/store` search | 1440 / 375 | 3.64 / 3.64 | brand/50 |
| F3–F6 `/hire-us` | 1440 / 375 | 3.70 all | brand/50 |
| F7 `/free-downloads` (after clicking Download) | 1440 | 3.50 | brand/50 |
| F8 `/gift-cards` | 1440 | 3.30 | brass |
| F14 sign-in modal (email, password) | 1440 | 3.50 | — |
| F9 / F10 `/cart` | 1440 | not rendered (empty cart) | — |
| GuestForm `/support` (not granted) | 1440 | **1.21** | brass |

- HEAD was 1.35–1.62:1 and the round-193 tree was 1.03–1.21:1, both from C round 193's numbers.
- The sign-up view was not reached by the script; it uses the same `Input` (F14).
- F11–F13 need a signed-in user, so backend. F15/F16 were not measured.
- **LeadMagnet placeholder** (scroll 55 %, wait 9 s, click FREE DOWNLOAD):
  - 1440 and 375: placeholder `rgb(110,110,109)` on white = **5.1:1**, typed value = 21:1;
  - the attribute is `Enter your email address`.
- **`/studio-lab` rest 1440** vs `c-round-191/shots/c191-1440-1/rest-full.png`: **0 changed px**, 0 console errors.
  - The first load hit the Vite dep-reload invalid-hook hydration glitch (ENV-FIRST-LOAD) and was replaced once.

## Code review (`code-reviewer` subagent, actually run; score 6/10)
- **High #1, unresolved (outside the grants):** the K0 miss above. Reported to B, not fixed.
- **Medium #2, unresolved:** ST8b false-passes in two cases:
  - the off-by-one window (14 exclusive);
  - constant indirection.
  - Strengthening it would turn ST8b red on ungranted files, so it was left as B specified. Proposed shape: a balanced className parser, following same-file constants, and a deny-list (`border-outline`, `-light`, `-hover`, side variants).
- **Lows #3–#6** (test robustness), listed for the re-grant round and not fixed:
  - #3: `border-outline-light`/`-hover` are not denied;
  - #4: the anchor is not verified inside its tag;
  - #5: the `const` branch relies on `\n]` at column 0;
  - #6: the region includes its delimiters.
- **#7:** the doc's F16 claim was corrected.
- **#8:** `.sort-select` was added to the 2b TODO.
- **Architecture note (verbatim, for B):** "Signal 3 (one region changed repeatedly): `app/lib/__tests__/store-theme-tokens.test.ts:278` and `:357` — the file now holds two independent `app/` directory walkers (`studioThemeMarkerLinesByFile`, `bareOutlineFieldHits`) whose scan rules are growing round by round. Keep for now: test-only, no runtime coupling, no audio/Undo/hook invariants touched. Proposal for planner B: one shared source-walker helper (or a separate field-border guard test), decided together with the existing `ARCH-R193-THEME-REGION` point at the STORE-2 exit."

## B acceptance — what A truly passed
- K1 ✓.
- K2 ✓ (F1–F16, one token each).
- T1 ✓ (ST7/ST8/ST8b green; red proof and m10–m13 as specified).
- D1 ✓, including the correction.
- typecheck, lint count and Biome ✓.
- Live ratios for every reached granted field ≥ 3:1 ✓; placeholder ≥ 4.5 ✓; Studio 1440 0 px ✓.
- **K0 ✗:** the stop condition exists, and it was found after the implementation.

## Exact next C checks (if B lets C verify the granted part, or for the re-grant round)
1. Run SCOPE-194 as written: frozen list 1011, 21 status lines, the grant diffs against `b-round-193/r194-granted-start/`.
2. FIELD-BORDER for F1 / F2 / F3–F6 at 3 viewports, plus F7 (click "Download" first), F8 and the F14 modal at 1440. **F1 is the tight case (3.11 at the top midpoint), so re-measure it at 1280 too.**
3. Add GuestForm `/support` (anonymous; open chat; `#guest-name`, `#guest-email`): currently 1.21, expected to FAIL until it is re-granted. Measure F16 on `/support` if the mock gives a chat session.
4. PLACEHOLDER-194, KEEP-194, STORE-LAYOUT-194, STUDIO-RV-194 (1440 + 1280), G194-3, PX-NET as written. F11–F13 BLOCKED (backend).

## Proposals for B / root (not done)
- Re-grant GuestForm.tsx (2 sites). Rule on `recordings/` (4 constants).
- Rework ST8b per the reviewer's alternative in the same round, so that it goes red on any of them before the fix.
- Fix `fieldscan.mjs` (15-line window, constants).
