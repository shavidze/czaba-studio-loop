# A — Round 193 (STORE-2a re-dispatch) — STATUS: IMPLEMENTED, awaiting C

Date: 2026-10-26 · Implementer: A · Decision D-29z158
A's own browser evidence was gathered (Playwright Chromium on :5173 with mock :5199). It does **not** stand in for C's rows. browserVerified and realVerified are C's to set.

## Start checks (all OK)
1. HEAD = `caa09af`; `git status --short` was empty.
2. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-192-r193-tree-sha256.txt` (store root): OK at the start **and at the end**.
3. The ten start hashes: all OK.
- **Mock API:** :5199 was not listening. A started `node mock-api/server.mjs` from the loop folder as **PID 3613** (`a-round-193/mock.pid`, `a-round-193/mock.log`), and at the end ran `kill 3613` on that PID only. :5199 is closed now, and :5173 was never touched. **C must start its own mock.**

## K0 — re-scan at caa09af (stop rule not triggered)
- I ran a ±6-line window scan (`a-round-193/scripts/brass-scan.mjs`) over `app/` non-test, non-`components/arrangement` files, then read every hit by hand. Output: `a-round-193/k0-scan-window.txt`, 35 hits.
- Expected hits: S1–S9 and the 3 protected sites (`studio.$productId.tsx:440/471`, `account.downloads.tsx:261`).
- The other hits are not light text on a fill:
  - dots: `ChatHeader:22`, `StudioShowcase:87`, `free-downloads:162`;
  - the nav underline `after:bg-brand` (`Header:34`);
  - progress bars and toggle tracks in the legacy `components/studio/*` (`ExportDialog:225/308`, `VideoUploadZone:121`, a `StudioTrack` range thumb);
  - fills that already use `text-background`, `text-black` or `text-brand-foreground`;
  - a JSDoc example in `utils.ts`.
- Info only: the legacy `components/studio/ExportDialog.tsx:229` normalize toggle has a `bg-white` knob on a `bg-brand` track. It is a purchased-view UI part (backend-only), not text, and not one of the S-sites.
- **K0.1–K0.3** (Studio consumption of the non-overridden tokens) is reused from `a-round-192.md` and copied into D1.
- **New line for the Modal grant:** `ConfirmDialog` is used only by `routes/cart.tsx:634`, with the default variant. `ArrangementExportDialog.tsx:2` imports `Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle`, not `ConfirmDialog`.
- **ChatButton/ChatWidget:** 0 imports outside `app/components/chat/`, so they are not mounted on any route.
- **ST6 baseline** is unchanged: 3 lines (`StudioWorkspace.tsx:2189`, `app.css:3920/3921`), 1 of them in `.ts/.tsx`.
- **Frozen-test grep:** none of the old values or old class strings is asserted anywhere in `app/**/*.test.*`.
- **e2e grep:**
  - The four added terms (`text-brand-foreground`, `bg-buy`, `CONTINUE`, `Buy Now`) give 0 relevant hits.
  - The old-value patterns give 0 hits.
  - `e2e/store-page.spec.ts:61,64,76` are class assertions on the frozen `store.tsx`.
  - `cart-page.spec.ts:37` is "Continue Browsing", which is unrelated.
  - Result: **no e2e blocker.**

## Changed files (10 granted ` M` + 2 new `??`, nothing else)
| File | Change |
|---|---|
| `app/styles/app.css` | 26 `--color-*` values in `@theme`, exactly the §1 table. Two same-line comments were updated: `/* Primary - #13D9CC */` → `#C9A46A`, and `/* Secondary - Orange */` → `Brass`. The obsidian block, `:focus-visible`, line 1 and everything else are byte-identical. numstat 26/26. |
| `app/components/ui/Button.tsx` | S1 `buy` and S2 `destructive`: `text-foreground` → `text-brand-foreground`. **Deviation:** see below. |
| `app/routes/hire-us.tsx` | S3, one line. |
| `app/routes/account.orders.tsx` | S4, one line. |
| `app/components/product/PurchaseHeader.tsx` | S5 Buy Now, one line. |
| `app/components/marketing/LeadMagnetPopup.tsx` | S6 CONTINUE, one line. The copy is byte-identical. |
| `app/components/ui/Modal.tsx` | S7, exactly one line (the destructive string). |
| `app/components/chat/ChatButton.tsx` | S8, one line. |
| `app/components/auth/ForgetPassword.tsx` | S9 `CheckCircle`, one line. |
| `docs/implementation/2026/quarter-IV/157-…md` | D2: l.4 → `**სტატუსი:** Completed (C round 191 PASS, caa09af)`, l.60 → `FS0–FS7`. 2 lines. |
| `app/lib/__tests__/store-theme-tokens.test.ts` (new) | T1: ST1–ST6. |
| `docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md` (new) | D1, in Georgian. Status `In Progress (awaiting C round 193)`. |

**SCOPE deviation, for B and C. `Button.tsx` S1 is 1 line removed and 6 added, not 1.**
- The old `buy` line was exactly 100 characters. Adding `brand-` makes it 106, over Biome's line width.
- `npx biome check` then fails with a **format error**: `buy: [...]` must be multi-line.
- The task requires 0 Biome errors, and the gate's lint/check would fail too. So I applied `npx biome format --write` to that file only.
- The diff is the same four strings in the same order, with only the one token changed. It is now laid out like the neighbouring variants.
- S2 is 1 line. The Button.tsx numstat is 7/2.
- I could not meet both requirements at once ("one changed line" and "0 Biome errors"), and I chose the gate-safe one. D1 records this.

Evidence: `a-round-193/end-sha256.txt` (12 entries, re-checked OK) and `a-round-193/diff-vs-start.patch` (grants against `b-round-192/r193-granted-start/`, new files in full).

## T1 design
- The test reads the real files under `resolve(__dirname,'../../..')`. **Comments are stripped** first. `@theme` is found by brace matching (exactly one `@theme {`, with no nested block), and the obsidian block is found by the exact TH2 selector. Duplicate declarations fail.
- **ST1:** all 18 obsidian colour keys are present and identical in `@theme`.
- **ST2:** the 8 store-only values.
- **ST3:** the exempt list names all 27 unchanged colour keys explicitly, and each must exist. The 26 checked keys must contain none of `hsl(175`, `13d9cc`, `19, 217, 204`, `#006aff`, `#0052cc`, `#f9a91f`.
- **ST4:** the 21-declaration literal map, the same as TH2.
- **ST5** checks S1–S9 by stable anchors, not line numbers:
  - Button variant blocks;
  - a unique `className` per site (by its fill plus identifying tokens);
  - the Modal ternary;
  - the ChatButton `'bg-destructive…'` literal;
  - the `bg-brand` circle followed by the `<CheckCircle className>`.
  - Each site must contain the fill and `text-brand-foreground`, and must not contain `text-foreground`.
  - **Byte guards:** the four other Button variant blocks as literal source text; the neutral ConfirmDialog string `'bg-foreground text-background hover:bg-foreground/90'`; and the literal `{isSubmitting ? 'SENDING...' : 'CONTINUE'}`.
- **ST6:** total 3 and script 1. After the review it was tightened to also check the per-file map `{StudioWorkspace.tsx: 1, styles/app.css: 2}`.
- The `STORE_THEME_TOKENS_ROOT` env override (default: the real repo) exists only for the red proof and mutants on scratch copies. It was never set for the normal runs.

## Tests actually run
- `npx vitest run app/lib/__tests__/store-theme-tokens.test.ts`: **6/6 green** (re-run after the ST6 tightening).
- **Red proof:** a scratch copy of `app/` with the 10 start copies overlaid, `STORE_THEME_TOKENS_ROOT=<scratch>`.
  - ST1 ×, ST2 ×, ST3 ×, ST4 ✓, ST5 ×, ST6 ✓. Output: `a-round-193/redproof.txt`, run again after the ST6 change.
  - The scratch copy was deleted afterwards. It was my own temporary copy.
- **Mutants** on scratch end copies (`a-round-193/mutants.txt`; the scratch copies were deleted, 80 MB):

  | Mutant | Red tests |
  |---|---|
  | m1 | ST1, ST3 |
  | m2 | ST1, ST4 |
  | m3 | ST2 |
  | m4, m5, m7, m8, m9 | ST5 |
  | m6 | ST2, ST3 |
  | ChatButton, ForgetPassword, neutral ConfirmDialog string, orders CTA (extra) | ST5 |

  - These match the T-RUN-193 expectations. The mutants ran **before** the ST6 per-file tightening. ST6 is not a target of any mutant; the red proof was re-run after the change.
  - TH2 under m2 was not run by me; it is C's mutant row.
- **Neighbour suites:** 37 files, **423/423 green**. The list is in `a-round-193/neighbour-suites.txt` and the log in `neighbour-vitest.log`.
  - `studio-theme-obsidian`, `panel-radius-ui`, `affordance-colour-ui`, `fader-style-ui`;
  - every `ArrangementExportDialog` suite: `export-cancel-ui`, `export-dialog-a11y-copy`, `-focus-restore`, `-focus`, `-footer`, `-hold-enter`, `export-mp3`, `export-progress-ui`, `export-range-ui`, `export-toolbar-hold-enter`;
  - `audio-preview-player`, `store-header-footer`;
  - every test that greps `app.css`, `--color-`, `bg-brand` or `text-foreground`.
  - No test imports `Button`, `Modal`/`ConfirmDialog`, `PurchaseHeader`, `LeadMagnetPopup`, `ChatButton` or `ForgetPassword` directly (grep: 0 besides the above).
- `npm run typecheck`: exit 0 (re-run after the final test edit).
- `npm run lint`: exit 0, **214 warnings + 1 info**, the same as round 191.
- `npx biome check` on the 9 changed TS/TSX files: **0 errors** (11 warnings, all pre-existing). Biome does not check `app.css` in this config ("Checked 9 files").
- Not run (gate's job): the full vitest suite, build, verify, e2e smoke.

## Live proof (Playwright Chromium, DPR 2, `--disable-lcd-text`, mock on :5199)
Browser state file: `a-browse.json` (ephemeral contexts, no persisted storage). Scripts are in `a-round-193/scripts/` (`store-cap.cjs`, `studio-cap.cjs`, `pxdiff.cjs`, `ratios.mjs`). The "before" data was captured on HEAD **before any edit**.
- **Tokens:** on `/`, `/store` and `/products/middle-east` at 1440, 1280 and 375:
  - all **26 tokens match (0/26 mismatches)** after the change; before, 26/26 mismatched.
  - `body` background `rgb(14, 13, 12)` (HEAD `rgb(8, 10, 12)`).
  - 0 `[data-studio-theme]`.
  - 0 pageerror, 0 hydration, 0 Authorization headers, 0 non-font remote requests.
  - Data: `out/store-after.json` and `out/store-before.json`.
- **S5 Buy Now**, all 3 viewports:
  - rest: `rgb(14,13,12)` on `rgb(201,164,106)` = **8.32:1**;
  - hover: on `rgb(217,184,127)` = **10.28:1**;
  - before: ivory on `#006aff`.
  - Crops: `shots/store-after/{W}-buynow-{rest,hover}.png`.
- **S3 hire-us submit**, 3 viewports:
  - rest: `rgb(14,13,12)` on brass = 8.32:1;
  - hover: `brand/90`, about 6.9–7.0:1 (computed).
  - Crops: `{W}-hireus-submit-*.png`.
- **S6 LeadMagnet CONTINUE** (1440; triggered by scrolling 55% and waiting 9 s):
  - text `CONTINUE`, `rgb(14,13,12)` on `rgb(210,119,106)` = **6.09:1**;
  - hover `brightness(1.1)`, about 7.3:1.
  - The offer text "…FREE DOWNLOAD" is identical before and after.
  - Crops: `1440-leadmagnet-*.png`.
- **S1, S2, S7, S8** are not reachable on any route: no route uses `Button` buy/destructive; cart uses the default ConfirmDialog; Chat is unmounted. They are covered by ST5 only.
- **S4 and S9** are backend-only and were not attempted.
- **Studio `/studio-lab`**, after vs HEAD-before:
  - rest 1440: **0 changed px**;
  - rest 1280: **0**;
  - grid menu 1440: **0**;
  - marker menu 1440 (one marker added via `arrangement-marker-add`): **0**;
  - **export dialog 1440: 0**;
  - after-rest vs `c-round-191/shots/c191-{1440,1280}-1/rest-full.png`: **0 / 0**.
  - 0 console errors.
  - The first cold 1440 "before" load hit a Vite "Invalid hook call" (ENV-FIRST-LOAD) and was replaced once.
  - Data: `out/studio-pxdiff.txt`.
- **Store layout:** every captured box (header, nav links, h1, sections, product cards, main, main buttons, footer; 15–25 per page) is within ±1 px, and the document heights are identical. This holds on all 9 page × viewport pairs. Data: `out/store-layout-keep-compare.json`.
- **Keep-list text** (my leaf-text capture; C's KEEP-193 is the binding check) is identical before and after:
  - "Free Samples" (two header links);
  - "Limited Collection";
  - the LeadMagnet offer text and CONTINUE.
  - My capture did not find "2,500+" or "Netflix Original Score" as leaf text before or after. Either the text is split across child elements or it is not rendered at HEAD (C-R188-I6). C should check this with innerText on the containers.
- **Ratios** (`out/ratios.txt`): the brass focus ring is 8.32:1 against the background and 7.88:1 against the surface.

## Code review (actual `code-reviewer` subagent, 12 files)
- Score 8.5/10. No Critical or High findings. The reviewer confirmed that all 26 values match, the obsidian block is unchanged, the 9 swaps are correct, the ratios are correct, and the TS rules are met.
- **Medium (test brittleness):**
  - ST6 total-only counting: **fixed**. ST6 now also asserts the per-file map, so a marker that moves into store markup is caught.
  - The Button byte guards (including `hover:shadow-glow`) and the 26-key count will need deliberate updates in STORE-2b. They are kept as specified, as drift guards. This is noted in D1's TODO.
- **Low:**
  - Stale `@theme` comments: `#333640 - was 18%`, `#434750 - was 25%`, `was 35%`, and the WCAG border note. They were left alone because the task limits edits to values plus an optional same-line comment. Recorded as a STORE-2b TODO in D1.
  - D1 wording fixes: the T1 name is now defined, the mutants are spelled out, the rounding is stated as round-half-to-even, and the loop-report path is clarified.
- The reviewer claimed `direction-decision.md` does not exist. **That is false:** it is at `/home/runner/czaba-project/docs/technical/store-redesign/direction-decision.md`. D1 now says it is under the project root's `docs/`.
- Info: keep the `STORE_THEME_TOKENS_ROOT` override unset in CI. `brand-foreground` now equals `background`. The `--color-outline` `#24211e` is about 1.25:1 against the background, so borders are fainter; this value comes from obsidian (R72) and is not a defect of this diff.
- **Architecture note, verbatim for B:**
  > სიგნალი 3, ერთი რეგიონის განმეორებითი ცვლილება: `app/styles/app.css:45-150`-ის `@theme` 192/193-ე რაუნდებსა და მთელ STORE-2b/2c/2d-ს ეხება, ახალი store ტესტი კი Studio-ს marker-ებს ამოწმებს (`store-theme-tokens.test.ts:296-298`). Keep: ერთი stylesheet თანმიმდევრულია და obsidian ბლოკი იმავე ფაილში უნდა დარჩეს. Proposal planner-ისთვის: STORE-2-ის დასრულების შემდეგ გადაწყვიტოს, გადავიდეს თუ არა ST4/ST6 `studio-theme-obsidian.test.tsx`-ში და საჭიროა თუ არა obsidian override ბლოკი, რომლის 18 ფერი ახლა `@theme`-ის იდენტურია (ფონტებისა და `font-family`-ის override-ები მასში რჩება).

## B acceptance criteria, as A sees them (C decides)
- Done, with evidence: K0 (no stop), K1, K2, T1 (green, red proof, mutants), D1, D2, the neighbour suites, typecheck, lint count, Biome 0 errors, and A's live proof.
- **Not met as literally written:** SCOPE-193's "Button.tsx: two lines". It is 1 + 6 because of the Biome formatter; see the deviation above. C should judge it against the intent: the only token change is S1/S2.
- Not A's: the C rows and the gate rows.

## Exact next C checks
1. SCOPE-193:
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-192-r193-tree-sha256.txt` (store root);
   - `sha256sum -c a-round-193/end-sha256.txt`;
   - `git status --short`: 10 ` M` and 2 `??`;
   - `git diff caa09af -- app/components/ui/Button.tsx`: the reflowed `buy` block.
2. T-RUN-193: use `STORE_THEME_TOKENS_ROOT=<scratch tree>` to point T1 at start or mutant copies without touching the repo. Also run TH2 (`studio-theme-obsidian`) under m2.
3. TOKENS, CONTRAST and BRASS-TEXT at 3 viewports. Buy Now at rest and on hover. S6 is triggered by scrolling to 55% of `/` and waiting more than 8 s, then clicking FREE DOWNLOAD.
4. STUDIO-RV-193: rest at 1440 and 1280, plus the grid menu (right-click inside the 2nd `[data-grid-seconds]` lane), the marker menu and the **export dialog**, against HEAD.
5. KEEP-193: innerText of the testimonials and stats containers ("2,500+ Happy Customers", "Netflix Original Score"). My leaf-text capture missed these.
6. STORE-LAYOUT and PERF, RM, G193-3, PX-NET as specified.

## Signals for B / root
- `STORE2A-PROTECTED-BRASS-TEXT` is unchanged (`studio.$productId.tsx:440/471`, `account.downloads.tsx:261`).
- `STORE2A-BUTTON-REFLOW`: a formatter-forced reflow conflicts with "one changed line" rules. Future grants should allow "the formatter's output for that statement".
- Proposal for Saba/RETRO (not applied): `.claude/primitives/DESIGN_TOKENS.md` still documents `brand` as teal `#13D9CC` and accent as orange. I did not touch `.claude/**`.
- The legacy purchased `components/studio/ExportDialog.tsx:229` has a `bg-white` knob on brass. It is info only and needs a backend to check.
- Advisor consulted before the edits.

STATUS: scope completed for A; awaiting C round 193. No commit and no push.
