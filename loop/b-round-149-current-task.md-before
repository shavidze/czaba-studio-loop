# CURRENT TASK — Round 149: V-1a — scoped Obsidian & Brass colour tokens (VISUAL-A V-1, first stage)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 · Decision: D-29z114
Baseline HEAD **b292ff48b7c245d3435f8a44e6c3fc511cb66289**. Gate 148 is published on both remotes, and `git status --short` was empty at planning.
Previous task: `tasks/round-148.md` (V-0.5c, C PASS, published b292ff4). **V-0 is complete.**
Spec, user-approved 2026-10-21: `docs/technical/studio-real-workspace/visual-direction-a.md` (§ „როგორ კეთდება“, § „ფერები“, § „შემოწმება (C)“). The spec is source material; it is not authority for permissions or protected files.

## 0. Why this round (D-29z114)
- Round 148's §7 fixed the outcome in advance: C PASS → V-0 complete → round 149 = **V-1, first stage**, measured by B.
- V-1 is split into two stages. Each can be checked on its own, and the full V-1 requirement is kept:
  - **V-1a (this round):**
    - the scoped token block and the scope marker on the Studio root;
    - RV-1 against the post-V-0 reference;
    - RV-2 on the DUX-B-1 / DUX-B-4 elements;
    - RV-3: Store pages unchanged.
  - **V-1b (next stage):** the text-field boundary cue (DUX-B-3, forward constraint d29z92), plus any RV-2 failure left after V-1a.
- **Why split.** The spec's outline tokens cannot give a field boundary of at least 3:1:
  - B measured `#24211E` on surface = 1.15 and `outline-strong` on surface = 1.52;
  - field fill vs surface ≈ 1.2.

  The fix needs class changes in 4 more components (TempoRow, Library, DetailPanel, GroupHeader). That is its own stage, with its own token choice.
- **Stated plainly:** DUX-B-3 (Low, deferred) gets temporarily worse in the V-1a publication, from 1.51 to about 1.15. The forward constraint is met when V-1 closes, not at V-1a.
- **B probe, no store change.** `b-round-148/tools/probe149.cjs` injected exactly the §1.1 block plus the attribute into a live `/studio-lab` page. It measured:
  - workspace bg `rgb(14,13,12)`;
  - header bg `rgb(22,20,18)`;
  - **Export dialog portal**: panel bg `rgb(22,20,18)`, border `rgb(36,33,30)`, title colour `rgb(236,230,218)`;
  - `html` keeps the Store `--color-brand`.

  Evidence is in `b-round-148/out/probe149.json` and `shots/probe149-*`.
- **Served CSS.** `.bg-brand` compiles to `var(--color-brand)`. `bg-accent/20` compiles to an inlined-hex `color-mix(in srgb, #f9a91f …)` fallback, followed by `color-mix(in oklab, var(--color-accent) 20%, transparent)` inside `@supports`. So the scope mechanism works in Chromium without touching any component class. C: the hex fallback in the served CSS is Tailwind output, not a component hex.

## 1. What changes (user-visible), exact
### 1.1 `app/styles/app.css`: append exactly this block at the **end of the file**
Place it after the final `}` of `.glass-button:hover`. It stays outside any `@layer` / `@theme`. Nothing else in the file changes, and the block has no comment.
```css

[data-studio-theme="obsidian"],
body:has([data-studio-theme="obsidian"]) {
  --color-background: #0e0d0c;
  --color-surface: #161412;
  --color-elevated: #1d1a17;
  --color-muted-bg: #24201c;
  --color-outline: #24211e;
  --color-outline-hover: #2e2a26;
  --color-outline-strong: #3a3530;
  --color-outline-light: rgb(36 33 30 / 0.5);
  --color-foreground: #ece6da;
  --color-muted: #a39b8e;
  --color-dim: #928a7d;
  --color-brand: #c9a46a;
  --color-brand-hover: #d9b87f;
  --color-brand-foreground: #0e0d0c;
  --color-accent: #c9a46a;
  --color-positive: #8fa382;
  --color-warning: #d9a35b;
  --color-destructive: #d2776a;
}
```
- **Contents:** 18 custom properties, 16 from the spec table plus 2 B decisions (R2, R3).
- **Format:** 2-space indent, lowercase hex, double quotes, one blank line before the selector. The file keeps its trailing newline.
- **`git diff`:** exactly **22 added lines** (1 blank + 21 block lines) and 0 removed.

### 1.2 `app/components/arrangement/StudioWorkspace.tsx`: the root `<div>` (l.2184–2188 at b292ff4)
Add the single attribute line `data-studio-theme="obsidian"` to the element whose `className` starts with `studio-container`. The diff is exactly 1 added line and 0 removed. No class, handler, testid or other line changes.

### 1.3 B decisions recorded (D-29z114)
- **R1, scope selector.** The selector is `[data-studio-theme="obsidian"], body:has([data-studio-theme="obsidian"])`, not the attribute alone.
  - **Why:** two Studio surfaces render through `createPortal(…, document.body)`:
    - the Export dialog, via the frozen shared `Modal.tsx`;
    - `ArrangementMarkerMenu` (`ArrangementMarkerRow` l.845).

    An attribute-only scope would leave them in the Store's cold palette inside a warm Studio, and `Modal.tsx` cannot take the attribute.
  - **Precedent:** `body:has(...)` follows the existing `body:has(.studio-container)` rules (`app.css` l.284, l.458). Pages that do not contain the Studio workspace are untouched.
  - **Known side effect:** on `/studio-lab`, the Store chrome rendered there (cookie banner, toasts) also takes the warm tokens. That chrome is part of the Studio page. M4 (the cookie banner) stays its own later stage.
  - The protected `studio.$productId.tsx` has `studio-container` but no attribute, so it is unaffected.
- **R2, `--color-dim` = `#928a7d`** instead of the spec's `#8A8276`.
  - The spec marks dim as "≥ 4.5:1 … (შესამოწმებელი)", and its TODO asks for a measurement on real surfaces.
  - B's WCAG math uses the sRGB composite of `brand/10` over surface, rgb(40,34,27). On the selected library row, `#8A8276` gives **4.13**, which still fails DUX-B-1's elements there. `#928A7D` gives **4.60**.
  - `#928A7D` stays dimmer than muted (muted/dim = 1.24). It is the smallest change that meets the user-approved RV-2 threshold.
- **R3, `--color-outline-light`.** It is not in the spec table, but `ArrangementLane.tsx:843` paints the lane grid with `var(--color-outline-light)`. The new value keeps today's relation (the outline at 50 % alpha), using the new outline `#24211E`. Otherwise the grid would stay cold blue on warm lanes.
- **R4, not overridden:**
  - `--color-brand-rgb` and `--color-accent-rgb`. No Studio consumer: checked by matching `app.css` rules against the arrangement classes.
  - `secondary`, `bg-alt`, `info`, `error*`, `buy`, social and video-player tokens. No Studio consumer.
- **R5, accent = brand.** The spec says „მეორე აქცენტი ქრება“.
  - States that differed only by teal vs orange now share one hue: the loop brace and the Loop button (accent) vs the playhead, the selected clip and markers (brand).
  - This is user-approved. C records whether each such state can still be told apart by a non-hue cue (row STATE-DISTINCT). A lost distinction is a finding, not a waiver.
- **R6, unchanged in V-1a:**
  - fonts (V-2);
  - icons, button surfaces, radius and motion (V-3);
  - field borders (V-1b);
  - M1/M3/M4, and M5 (not approved).

## 2. A — files you own (everything else is frozen)
- **Modify (3)**, as listed in `tmp/studio-real-loop/b-round-148-r149-grants.txt`:
  1. `app/styles/app.css`: a **narrow grant** inside the globally forbidden `app/styles/**`. Only the §1.1 append.
  2. `app/components/arrangement/StudioWorkspace.tsx`: only the §1.2 attribute.
  3. `docs/implementation/2026/quarter-IV/121-studio-v0-video-dock-strings.md` (GATE148-S1). Exactly three lines:
     - l.4 → `**სტატუსი:** Completed (C round 148 — PASS, browserVerified; gate 148, b292ff4)`;
     - in l.125, replace the last sentence `C round 148 ჯერ არ გაშვებულა.` with `C round 148 — PASS (browserVerified), gate 148 — b292ff4.`;
     - l.129 → `- C round 148 — PASS: COPY-DOCK, PLAY-FAIL, VIDEO-SYNC, TITLE-LANG, NO-GEORGIAN, LAYOUT-DOCK, LAYOUT-REST, RV1-RECAPTURE (tmp/studio-real-loop/c-round-148.md).`
- **New (2)**, as listed in `b-round-148-r149-new-files.txt`:
  - `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`;
  - `docs/implementation/2026/quarter-IV/122-studio-v1a-obsidian-color-tokens.md`: in Georgian, with the TEMPLATE sections and the status `In Progress (C round 149 — ჯერ არ გაშვებულა)`.
- **Frozen:** the 965 tracked files in `b-round-148-r149-tree-sha256.txt`. Start hashes are in `b-round-148-r149-granted-start-sha256.txt` and start copies in `b-round-148/r149-granted-start/`.
- **Protected:** the diff vs b292ff4 stays empty for:
  - `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`;
  - `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
  - `Modal.tsx`, `root.tsx`.
- **Not allowed:**
  - any other style file, any component class change, `package.json`, a new dependency;
  - commit, push, stash, install, or `npm run build` (it writes under `store/`).

## 3. A — tests and mutations (hand-written literals; no module-against-module pins)
### 3.1 New `studio-theme-obsidian.test.tsx`
- **TH1, SSR.** Use the `default-track-names-ssr` setup and `renderToString(<StudioLabRoute />)`.
  - Exactly one element carries `data-studio-theme="obsidian"`.
  - That element's `class` starts with `studio-container`.
  - `console.error` is not called.
- **TH2, the CSS block pin.** Read `app/styles/app.css` with `readFileSync`.
  - The text `[data-studio-theme="obsidian"],\nbody:has([data-studio-theme="obsidian"]) {` occurs **exactly once**.
  - That block's parsed declarations equal a hand-written map of the 18 §1.1 properties and values. The match is exact (order irrelevant) and allows no extra declaration.
  - The selector is top-level: brace depth 0 when the scan reaches it.
  - `data-studio-theme` appears nowhere else in `app/styles/**`.
- **TH3, the raw-colour guard.**
  - Walk `app/components/arrangement/` recursively: `.ts`/`.tsx` files, excluding `__tests__`, with a guard of at least 20 files.
  - Strip comments the way the existing `stripSourceComments` does, using a local copy. Do not import helpers across test files.
  - Assert 0 matches of `/#[0-9a-fA-F]{3,8}\b/` and 0 matches of `/\b(?:rgba?|hsla?|oklch|oklab)\(/`. B measured 0 of each at b292ff4.
- **TH4, the scope marker is unique.** In `app/` (non-test files), the literal `data-studio-theme` occurs only:
  - in `StudioWorkspace.tsx`, once;
  - in `app/styles/app.css`, twice, both in the selector.

### 3.2 Mutations
Procedure: Edit → run → restore by Edit → sha256 equals the post-edit hash. Save the JSON in `a-round-149/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m114 | remove the §1.2 attribute | TH1, TH4 |
| m115 | `--color-brand: #c9a46a` → `#c9a46b` | TH2 only |
| m116 | replace the two selector lines with `:root {` | TH2, TH4 |
| m117 | add `--color-info: #3b82f6;` inside the block | TH2 only |
| m118 | add the class `text-[#fff]` to the StudioWorkspace root `className` | TH3 only |

### 3.3 Commands (speed rules)
- **At the start:**
  - HEAD is b292ff4 and `git status --short` is empty;
  - `sha256sum -c --quiet b-round-148-r149-tree-sha256.txt` passes, and so do the granted start hashes.
- **Baseline at b292ff4:** `npx vitest run app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx app/lib/arrangement/__tests__/studio-lab-demo.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/strings.test.ts` → `a-round-149/vitest-baseline.json`.
- **After the edits:**
  - `npm run typecheck` and `npm run lint`;
  - read-only `npx biome check` on the changed `.ts`/`.tsx` files (Biome does not cover CSS);
  - `npx vitest run` on the same 4 files plus the new file. Their per-file `it` counts must be unchanged, and the new file has 4.
- **Code-reviewer:** run it (3+ files with docs) and pass its Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build and e2e. These are gate rows.
- **At the end:**
  - frozen 965 OK;
  - `git status --short` = exactly 3 ` M` + 2 `??`;
  - protected diff empty;
  - write `a-round-149/end-sha256.txt` (5 paths) and `a-round-149/diff-vs-start.patch`.

## 4. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, Snap state recorded at the start. Both viewports: 1440×900 and 1280×720.

| Row | Check |
|---|---|
| T149-TARGETED | Re-run A's 5 vitest files; the counts must equal A's. |
| SOURCE-SCOPE | <ul><li>Frozen 965 OK at the start and the end.</li><li>End hashes = `a-round-149/end-sha256.txt`.</li><li>`git status` = 3 M + 2 ??.</li><li>The protected diff vs b292ff4 is empty.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>The `app.css` diff is the §1.1 block at EOF, byte-equal, with 22 + and 0 −.</li><li>The StudioWorkspace diff is 1 +.</li><li>Doc 121 changes only its 3 lines.</li><li>Doc 122 is in Georgian and has the TEMPLATE sections.</li><li>TH1–TH4 use hand-written literals.</li></ul> |
| TOKENS-SCOPED | <ul><li>Read `getComputedStyle(...).getPropertyValue('--color-<t>')` for the 18 tokens of §1.1 on four surfaces:<ul><li>`.studio-container`;</li><li>`body`;</li><li>the Export-dialog panel: `[role=dialog][aria-labelledby=arrangement-export-title] > div`;</li><li>the marker context menu: add a marker with M, then right-click its flag, or focus the flag and press Shift+F10 (`ArrangementMarkerRow` l.637, l.766).</li></ul>Each value must equal §1.1.</li><li>On `document.documentElement`, each value must equal the Store value (`root` in `b-round-148/out/storebase149.json`).</li><li>Computed backgrounds (B probe values):<ul><li>workspace `rgb(14, 13, 12)`;</li><li>header `rgb(22, 20, 18)`;</li><li>Export panel `rgb(22, 20, 18)` with border `rgb(36, 33, 30)`.</li></ul></li></ul> |
| RV-1 | <ul><li>Run C round 148's d6 chain from `c-round-148/tools/`. Change only the output dir, the label and the filenames.</li><li>Output: `c-round-149/out/bbox-post-v1a-{1280,1440}.json`.</li><li>Compare with `c-round-148/out/bbox-post-v0-{1280,1440}.json` in S0/S1/S2. Every element must be **≤ 1 px** in x/y/w/h, and no key may be missing or added. 0 px is expected, because only colour changes.</li><li>Run twice; determinism 0 px.</li><li>Write nothing under `c-round-125/` or `c-round-148/out/`.</li></ul> |
| RV-2 | Use the contrast output of the same d6 run (`c-round-149/out/d6/`).<br>**Thresholds for every enabled text element:**<ul><li>≥ 4.5;</li><li>≥ 3 for large text (≥ 24 px, or ≥ 18.66 px bold);</li><li>≥ 3 for single-symbol glyphs, counted as icons. These are ▣ ▶ ◀ ▾ ↻ ↶ ↷ ✂ ⌫ ⤢ ⠿ ＋ and similar (≤ 2 non-letter characters).</li></ul>**Exempt, listed separately:**<ul><li>inactive controls (the element or an ancestor is `disabled` or `aria-disabled="true"`; WCAG 1.4.3 exception);</li><li>elements on an unknown backdrop (waveform, canvas, video). C pixel-samples these instead.</li></ul>**Required:** every element that failed as DUX-B-1 (`text-dim`, 53 elements) or DUX-B-4 (`text-muted` on the selected library row) in `c-round-125/out/contrast-baseline.json` must now be ≥ 4.5.<br>**B's predicted values (sRGB composite):**<ul><li>dim: 5.38 on surface, 5.69 on background, 5.08 on elevated, 4.60 on the selected library row;</li><li>muted: 6.68 on surface, 5.70 on the selected row;</li><li>brand: 7.88 on surface;</li><li>brand-foreground on brand: 8.32;</li><li>the group glyph `▣` (muted on brand/20 over elevated): 4.33, which passes as an icon.</li></ul>Report every failure with the element, its colours and the ratio.<br>**Tooling:** before relying on the d6 contrast JSON, confirm that the selected-row background (`bg-brand/10`) resolves to a concrete rgb, not `?` or null. In Chromium, `getComputedStyle` returns `oklab(… / 0.1)` for it (B probe). If it does not resolve, pixel-sample those elements.<br>**Verdict rule:** PASS needs every DUX-B-1/B-4 element at ≥ 4.5 and no other enabled-text failure. At c-round-125, every enabled-text failure was DUX-B-1/B-4; the rest were inactive controls. So any other enabled element below its threshold is a regression this round caused. Record it as `C-R149-n` (Low unless a user impact is stated). The row is then FAIL-Low and §7 routes it. |
| RV-2-FIELDS (record only) | Measure the boundary ratio of these fields against their real surface: the BPM field, the library search field, the detail From/To/Clip Gain fields and the group-name field. Expected ≈ 1.15–1.21 (DUX-B-3, scheduled for V-1b). **This is not a V-1a FAIL**; it is input for V-1b. |
| RV-3 | <ul><li>(a) TH3 and TH4 hold:<ul><li>grep `app/components/arrangement` for hex values and colour functions: 0;</li><li>`data-studio-theme` appears only in StudioWorkspace and the `app.css` block.</li></ul></li><li>(b) Check `/`, `/cart` and the 404 page (`/login` renders 404 in the cloud) at both viewports:<ul><li>the computed `--color-*` on `html` and `body` equal `b-round-148/out/storebase149.json`;</li><li>0 `[data-studio-theme]` elements;</li><li>body background `rgb(8, 10, 12)`;</li><li>screenshots next to `b-round-148/shots/storebase149-*`. The home page has motion, so compare visually rather than pixel-diffing.</li></ul></li></ul> |
| STATE-DISTINCT | <ul><li>At 1440, screenshot and describe each state that, before V-1a, differed only by brand vs accent hue: the playhead, the selected clip, a clip inside the time selection, the loop brace on/off, the Loop button on/off, a marker, Solo on and Follow on.</li><li>For each pair, say whether a non-hue cue (fill, outline, position, text, shape) still tells them apart.</li><li>Classify any lost distinction under the 2026-10-23 bug gate. Medium needs a stated user impact; otherwise it is Low and goes to `deferred_low_polish`.</li></ul> |
| FUNC-SMOKE | Behaviour must be unchanged (colour-only round):<ul><li>Play 2 s from 0: the playhead advances and `createBufferSource` +1.</li><li>Drag a clip 1 s, then Ctrl+Z restores it.</li><li>Open the Export dialog, then close it with Escape.</li><li>Open and close the marker menu.</li></ul> |
| VISUAL | <ul><li>Full-window screenshots of S0/S1 and the Export dialog at both viewports.</li><li>Compare them with `b-round-148/shots/probe149-*`, B's injected preview.</li><li>Report anything inside the Studio that is still teal or orange.</li></ul> |
| G149-3 | <ul><li>`/studio-lab` works anonymously and shows the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>The fake-Bearer 403 is BLOCKED: backend unavailable in cloud.</li></ul> |
| PX-NET / REG-HYD | In every session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. The expected cart noise is allowed. |

**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
- the Store pages' palette (RV-3b);
- portal surfaces (TOKENS-SCOPED);
- the lane grid lines (R3, seen in VISUAL);
- hue-only state cues (STATE-DISTINCT);
- layout (RV-1). Colour must not move anything.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Studio colour palette (Obsidian & Brass) | None used. This is a CZABA brand decision: `docs/design/brand-vision.md` (monochrome plus one gold accent) and `visual-direction-a.md` (approved 2026-10-21). | Not checked this round. Live's own theme options were not captured, so no parity is claimed. | **Not applicable; CZABA-only.** The user-approved visual identity takes priority (agent-workflow, reverse-engineering section). | Parity: none. Requirement: RV-2, RV-3. |
| One accent for the playhead, selection and loop | None captured. | Unconfirmed. | CZABA user decision (the spec removes the second accent). | STATE-DISTINCT records the remaining cues. |

## 6. Evidence and reporting
- **A:** `a-round-149.md`, `a-round-149-result.json`, and `a-round-149/` (vitest JSON files, mutations, end-sha256, diff patch).
- **C:** `c-round-149.md` and `c-round-149.json`, with:
  - `browserVerified`, `realVerified`, `passed`, `failed`, `blocked` and `gate`;
  - measurements: tokens per viewport, the RV-1 maximum delta, the RV-2 failure list, the RV-2-FIELDS ratios and the STATE-DISTINCT table.

  Tools, outputs and shots go in `c-round-149/{tools,out,shots}/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 150 planning)
| Condition | Round 150 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below. |
| C FAIL Critical / High / Medium, or a Medium+ regression caused by V-1a | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL only on a Low this round caused (RV-2 non-DUX failures, STATE-DISTINCT lost cue, D-29z111 R1) | A bounded fix-up with the same owner: not a waiver and not deferred. RV-2 colour-value failures join **V-1b** with DUX-B-3 (one stage: fields plus contrast). A STATE-DISTINCT Low gets its own bounded fix-up, or joins V-1b if it is a colour-only change. |
| C FAIL only on a literal criterion, with no app defect | B rules in writing; the next round is a re-check only. |
| C PASS (new unrelated Lows → `deferred_low_polish`) | <ul><li>Root publishes round 149.</li><li>V-1a → `c_pass`.</li><li>DUX-B-1 and DUX-B-4 close if RV-2 shows ≥ 4.5 on every listed element.</li><li>GATE148-S1 closes.</li><li>**Round 150 = V-1b:** a field boundary of ≥ 3:1 or another visible cue (DUX-B-3). B does the token math from the RV-2-FIELDS values. V-1 then closes.</li></ul> |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`. Both were absent at round 149 planning.

## 8. Root notes
- **V-0 is complete** (gate 148, b292ff4). B checked that the published tree equals `a-round-148/end-sha256.txt` (11/11), so `c-round-148/out/bbox-post-v0-*` is the RV-1 reference.
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` (the V-0 boundary, 3 questions) is requested now. It is **non-blocking** for V-1a and V-1b, which touch neither `strings.ts` nor its tests.
- **Gate e2e:** B grepped `store/e2e/` for screenshot, `backgroundColor`, `rgb(`/`hsl(` and teal pins and found 0. A colour-only change should not affect `test:e2e:smoke`.
- **Narrow `app/styles/app.css` grant:** one top-level block whose exact text is in §1.1. The justification is the user-approved spec (`visual-direction-a.md`, „როგორ კეთდება“ step 2) and forward constraint d29z92. Root's gate should check that this file's diff equals §1.1.
