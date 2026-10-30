# Round 264: L46-CONTRACT-CHECKS. Handler contract check; the platform check stays parked with Saba

**Planned by:** B, at the round 263 → 264 planning, 2026-10-30. **Decisions:** D-29z546 (SABA-B-9 done), D-29z547 (this round), D-29z548 (GATE244-S4 ruling), D-29z549 (A's grant: one new test file and implementation doc 197), D-29z550 (outcome table), D-29z551 (root checkpoint addendum at the SABA-B-9 boundary).
- **Read first:** `lessons.md` in full. These apply directly:
  - L11 (STOP);
  - L12 (selectors by testid or role);
  - L29 (claims, §6);
  - L46 (this round is its reopening);
  - L47 (BODY is never an *expected* focus value; row CC-CTRLCLICK below *observes and records* it).
- **Previous task:** `tasks/round-263.md` (an exact copy of the round-263 `current-task.md`). C's result: `c-round-263.json` (PASS, 8 rows, `browserVerified` true). The gate's result: `gates/gate-round-263.json` = **published**, commit `28c4f83`. B's reasoning: `b-round-263.md`.
- **Reference-first:** not in scope. This round verifies handlers and adds test rows only. No behaviour changes.
- **Source of the scope:** `retros/retro-260.md` §12 item 2, plus the backlog `systemic_tasks` entry `L46-CONTRACT-CHECKS` (D-29z521). Saba did not answer the parked platform checks by RETRO 260. Under L46, the half that the cloud can check honestly is reopened here. **The real-platform half stays with Saba:** Windows AltGr layouts, the native macOS Cmd and Ctrl+click, VoiceOver/NVDA, and Safari. This round does not claim it, and C writes no row that claims it.

## Baseline: published HEAD `28c4f83`
- `gates/gate-round-263.json`: `published`, commit `28c4f83bf3a9c59606ee141032ee4f267137dfc2`, pushed to both remotes.
- `git rev-parse HEAD` = `28c4f83…`, and the working tree is clean (`b-round-263/head-at-planning.txt`, `b-round-263/git-status-at-planning.txt`, which is empty) [K1].
- **Frozen:** every tracked file, **1,121** entries, in `b-round-263-r264-tree-sha256.txt`. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-263-r264-tree-sha256.txt` returns rc 0 at planning. Each of the 7 protected auth and purchase files appears in it exactly once [K2].
- **Grant (edit):** none. `b-round-263-r264-grants.txt` is empty.
- **Grant (new files):** `b-round-263-r264-new-files.txt` has two entries:
  - `app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` [K3];
  - `docs/implementation/2026/quarter-IV/197-l46-meta-shortcut-contract.md` [K3].

  Neither exists at planning, and 197 is the next free number [K3].
- **Not granted:** everything else. That includes `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `shortcuts.ts`, `strings.ts`, every existing test file, `e2e/**`, `perf/**`, every other doc, `package.json`, `.claude/**`, `CLAUDE.md` and the 7 protected files [K2].
- **Implementation doc:** doc 197 (D-29z549). This round adds a whole test file, so it follows the round-261 precedent (test/perf-only, doc 195), not round 263's two-hunk edit. The doc follows L26 (headings as an in-order subsequence of TEMPLATE's) and L28 (l.4 exactly `Completed (C round 264 PASS)`) [K3]. It is written in Georgian, and it cites only rows that exist in the new file.

## 0. Why this round
- SABA-B-9 is complete: stage 1 was published in `d732d26`, and stage 2 by rounds 262 and 263 in `28c4f83`.
- The pre-fixed outcome table of `tasks/round-263.md` §4 names this round. Planning is on 2026-10-30, and the next regression round is due on or after 2026-11-02.
- **Open Critical/High:** none. C round 263 reported 0 bugs.
- After this round: **SABA-B-11c** (the `ableton-arrangement-expert` consult on the off-grid offset first), then **SYS-6**.

### The four contracts and what is already covered
| # | Finding (severity) | Cloud contract | jsdom coverage now | Browser coverage now | This round |
|---|---|---|---|---|---|
| 1 | GATE232-S2 / TLM-R232-ALTGR-WIN (Medium, open_tech_lead_manual) | A `keydown` with `getModifierState('AltGraph')` true never toggles the Overview [K4] | OV-T2 in `overview-visibility-ui.test.tsx` [K4] | none | C browser rows CC-ALTGR |
| 2 | TLM-R232-MAC / TLM-R228-META-KEYS | The Meta bit alone (no Ctrl) runs the same handlers as Ctrl: Z, Shift+Z, Y, E, L and Alt+O. That is what `aria-keyshortcuts` advertises [K5][K6] | Meta+Alt+O (OV-T1) and Meta+Shift+Space (insert-marker-ui) only. **No handler row for Meta+Z / Shift+Z / Y / E / L** [K7] | none | **A adds jsdom rows MS1–MS6**; C browser rows CC-META |
| 3 | TLM-R233-SR-ORDER (GATE233-S4, info) | After Ctrl+Alt+O on the focused Overview, focus moves to the next dock button, and then the polite status gets the hidden text. This proves DOM/ARIA order, not what a screen reader speaks [K8] | OV-T6 (focus to "Expand video", never body) [K8] | none | C browser row CC-SR-ORDER |
| 4 | GATE244-S4 / A-R244-REVIEW-L6 (Low, deferred_low_polish) | The grid-menu focus return when the menu is opened by the macOS Ctrl+click path: `pointerdown` button 0 + `ctrlKey`, then `contextmenu`. `pressFocus` is recorded only for `button === 2` [K9] | right-button order only (L47) | none | C browser row CC-CTRLCLICK (**observe and record**) |

### B's baseline probe (run once, L29)
Scripts are `b-round-263/probe-l46.mjs` and `b-round-263/probe-meta.mjs`; results are in `probe-l46.json` and `probe-meta.json`. Both ran at 1440×900 and 1280×720 against HEAD `28c4f83` with 0 page errors [K10][K11]:
- **Meta [K11]:** Linux Chromium delivers `metaKey: true, ctrlKey: false` for `Meta+KeyZ`. For each of Z, Shift+Z, Z, Y, E and L, Meta gives the same clip count, Loop `aria-pressed` and status text as Control.
- **AltGraph:** a synthetic `Ctrl+Alt+O` with `modifierAltGraph: true` has `getModifierState('AltGraph')` true. It is not prevented, and the Overview stays. The same event without AltGraph is prevented, and the Overview hides.
- **Overview order:** focused Overview → `Control+Alt+KeyO` → the active element is `BUTTON "Expand video"`, which matches `:focus-visible`, with outline `solid` / computed `1px` / offset `2px`. The status becomes "Overview hidden. Ctrl+Alt+O shows it again." [K10].
- **Ctrl+click path:** started from the library search field, it ends at **BODY**. A real right-click returns focus to the field. Started from a focused button, the button keeps focus on both paths.

So GATE244-S4 **reproduces in cloud Chromium when the origin is a typing field**.

## 1. Ruling on GATE244-S4 (D-29z548)
- **Severity:** it stays Low and stays in `deferred_low_polish`. It gains the cloud evidence `b-round-263/probe-l46.json` `p5_ctrl`, and C's CC-CTRLCLICK evidence after this round.
- **Why not reopened as a normal task:** L46's reopening clause covers parked checks that hold a Medium. The 2026-10-23 bug gate defers Lows to the polish pass. This round does not own `StudioWorkspace.tsx`, and that file is not granted.
- **Unconfirmed premise:** that macOS Chrome sends `button 0 + ctrlKey` before `contextmenu` is a hypothesis. It belongs to Saba's platform half, and C does not state it as fact.
- **Not a round FAIL:** a BODY result in CC-CTRLCLICK is the expected reproduction of a known deferred Low.
- **What would be a finding:** the menu fails to open on the explicit `contextmenu`, or the right-button control row does not return focus to the field. That is a Medium regression.

## 2. A: what to do (one new test file)
1. **Create** `app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` [K3]. Read `.claude/prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` first.
   - Reuse the render scaffolding pattern of `overview-visibility-ui.test.tsx`: the `@remix-run/react` mock, the fake audio classes, `ArrangementProvider` with `createArrangement`, and `StudioWorkspace`. Copy it; do not import from another test file.
   - Dispatch keys on `document.body`. The handler listens on `window` [K5].
2. **Rows.** Each row runs the same step twice: once with `ctrlKey: true` (the control), once with `metaKey: true, ctrlKey: false`. Each asserts the **effect**, never only `defaultPrevented`.
   - **MS1 Z (undo):** after one history edit, Meta+Z restores the previous clip count. The Undo history title or label changes the same way as with Ctrl. The recipe for the edit is the add-then-undo pattern of OV-E1 in `overview-visibility-ui.test.tsx` [K12].
   - **MS2 Shift+Z (redo):** after MS1, Meta+Shift+Z re-applies the edit.
   - **MS3 Y (redo):** after an undo, Meta+Y re-applies the edit.
   - **MS4 E (split):** a selected clip with the insert marker inside it splits into 2 clips. The status equals the Ctrl run's status. Recipe: the Ctrl+E split rows of `insert-marker-ui.test.tsx` [K12].
   - **MS5 L (loop):** with a time selection, Meta+L turns the loop on (`aria-pressed` true), and a second Meta+L turns it off (`aria-pressed` false) [K11]. The Loop button is the one whose `aria-keyshortcuts` advertises `Meta+L` [K5]. Recipe: the plain Ctrl+L row of `delete-selection-ui.test.tsx` [K12].
   - **MS6 negative:** Alt alone (no Ctrl or Meta) + Z, E or L changes no clip count and no loop state. This proves the rows above do not pass on a missing modifier check.
3. **Red-proofs** (L23, L52). Run them on a scratch copy **outside** `store/`, and report each one as a file + line.
   - Each mutant run executes **the new file only**.
   - M1 also turns the Meta+Shift+Space rows of `insert-marker-ui.test.tsx` red, because they use the same `modifier` line. That collateral red is expected and is not a finding.
   - **M1:** l.2232 `const modifier = event.ctrlKey || event.metaKey;` → `const modifier = event.ctrlKey;` [K6]. Every Meta half of MS1–MS5 must go red, and every Ctrl half must stay green.
   - **M2:** in the `key === 'y'` branch, delete `current.redo();` [K6]. MS3 must go red.
4. **Checks** (speed rules), from `store/`:
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` [K3][K12];
   - `npx biome check app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` [K3];
   - report the new file's slowest test time against its timeout (L31);
   - no full suite, no `npm run verify` and no code-reviewer (2 files, below the 3-file rule).
5. **STOP conditions** (L11, at the top of `a-round-264.md`):
   - any row needs a change outside the two new files;
   - a Meta half is red on unmodified code (that is a product bug: report it with the measurement and do not fix it);
   - M1 leaves a Meta half green;
   - `sha256sum -c` of the frozen list is not rc 0 before or after.
6. **Report:** `a-round-264.md` lists the doc path, the rows (id → what is asserted), the command results, the M1 and M2 red lines, and the `sha256sum -c` result before and after.

## 3. C: what to verify
C writes `c-round-264.md` and `c-round-264.json` as it goes.
- "Both viewports" means 1440×900 and 1280×720, in a fresh anonymous context on `/studio-lab`, after `Demo collection ready` (L48).
- C may reuse B's two probe scripts or write its own equivalent under `c-round-264/`. The verdicts come from C's run, not from B's JSON.
- **Ableton conformance** for every row: "not applicable". The rows check CZABA handler contracts, not Live behaviour.

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | From `store/`:<ul><li>`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-263-r264-tree-sha256.txt`;</li><li>`git status --short --untracked-files=all`;</li><li>HEAD.</li></ul> | <ul><li>rc 0;</li><li>status is exactly the two `??` entries of `b-round-263-r264-new-files.txt` [K1][K3];</li><li>HEAD is `28c4f83`.</li></ul> | Any other change. |
| **MS-REVIEW** | Read the new file. | <ul><li>MS1–MS6 exist, and each has a Ctrl half and a Meta half (MS6: Alt only);</li><li>each asserts a clip count, `aria-pressed` or the status text [K11];</li><li>no styling-class selectors (L12).</li></ul> | A row is missing, or a row asserts only `defaultPrevented`. |
| **TESTS-TARGETED** | The 3 files of §2.4. | 3/3 green. | Red. |
| **MUTANTS** (scratch outside `store/`) | Control, M1, M2 as in §2.3, with the new file only. A red in another file under M1 is expected (§2.3). | <ul><li>Control: green.</li><li>M1: every Meta half red, every Ctrl half green.</li><li>M2: MS3 red.</li></ul> | Any mutant stays green. |
| **CC-META-1440 / -1280** (browser) | <ul><li>Install a capture `keydown` listener on `window`. `Meta+KeyZ` must record `metaKey true, ctrlKey false`.</li><li>Then run the recipe once with `Control` and once with `Meta`, each in a fresh context:<ol><li>focus the first library `option`, then Enter;</li><li>Z;</li><li>Shift+Z;</li><li>Z;</li><li>Y;</li><li>click the clip at its left edge x + 300 px, mid-height;</li><li>E;</li><li>drag on the clip from left edge x + 100 px to x + 400 px;</li><li>L;</li><li>L.</li></ol></li><li>After each step, record the `[data-clip-id]` count, the Loop button's `aria-pressed` (the button with `aria-keyshortcuts="Control+L Meta+L"`) and the `arrangement-status` text.</li></ul> | <ul><li>Meta equals Control at every step.</li><li>Clip counts: 1, 0, 1, 0, 1 → split 2.</li><li>Loop: true, then false.</li><li>Statuses: "Clip split at 00:07.500.", "Loop created and turned on: 00:02.500 — 00:07.500.", "Loop is off; the range is kept." [K11]</li></ul> | Any Meta step differs from Control. |
| **CC-ALTGR-1440 / -1280** (browser) | <ol><li>Dispatch on `document.body`: `new KeyboardEvent('keydown', {key:'o', code:'KeyO', ctrlKey:true, altKey:true, modifierAltGraph:true, bubbles:true, cancelable:true})`.</li><li>Dispatch the same event without `modifierAltGraph`.</li><li>Real `page.keyboard.press('Control+Alt+KeyO')` twice.</li></ol> | <ol><li>`getModifierState('AltGraph')` is true, `dispatchEvent` returns true, `[data-timeline-overview]` stays and the status is unchanged.</li><li>Prevented; the Overview hides; the status is "Overview hidden. Ctrl+Alt+O shows it again.".</li><li>Hides, then shows ("Overview shown. Ctrl+Alt+O hides it.") [K10].</li></ol> | The AltGraph event toggles, or a control does not. |
| **CC-SR-ORDER-1440 / -1280** (browser) | Focus `[data-timeline-overview]`, then `Control+Alt+KeyO`. Read `document.activeElement` right after the press, then the `arrangement-status` text after 600 ms, then `ariaSnapshot()` of `[data-testid="arrangement-video-dock"]`. | <ul><li>Active is the button "Expand video". It matches `:focus-visible`, and its computed outline is style `solid`, width ≥ `1px` (Chromium computes the 1.5px ring as 1px, L9) and offset `2px` [K10].</li><li>The status is "Overview hidden. Ctrl+Alt+O shows it again.".</li><li>The snapshot shows region "Video" with the button "Expand video", and no Overview [K8][K10].</li></ul> | Active is BODY or another element, or the status is missing. |
| **CC-CTRLCLICK-1440 / -1280** (browser; observe and record, §1) [K9][K10] | The origin is the library search field (`Search the library`), and the target is an audio lane background (`[data-grid-seconds]:not([data-testid])`, x + 400 px, mid-height). Two cases:<ul><li>**(a) control:** a real right-click, then Escape;</li><li>**(b) Ctrl+click path:** hold Control, then left `mouse.down`/`up` (no native menu on Linux), then dispatch `contextmenu` (`button: 0, ctrlKey: true`) at the same point, then Escape.</li></ul> Record `document.activeElement` after each of: the press, the menu open (`[role="menu"]` count) and Escape. | <ul><li>(a) The menu opens, and focus returns to the search field.</li><li>(b) The menu opens. The final focus is **recorded** as observed (B's baseline: BODY). A BODY result here is GATE244-S4 reproduced: attach it as evidence; it is not a FAIL.</li></ul> | (a) does not return focus, or the menu does not open in (a) or (b) (Medium regression). |
| **G264-AUTH** (browser; reuse `c-round-262/g262-auth.cjs` or an equivalent) | A fresh anonymous context at 1440×900:<ul><li>`/studio-lab`;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token` with no header.</li></ul> | <ul><li>`/studio-lab`: the workspace and the demo badge show; `auth_user` is null.</li><li>`/studio/middle-east`: "Sign in required" shows, and 0 `audio[src]`.</li><li>`/api/studio-token`: 401, and no token is issued.</li></ul> | Any bypass (Critical). |

- **Gate rows:** the full vitest, the build, Biome, `npm run verify` and e2e smoke. List them under `"gate"`, never under `"passed"`.
- **`browserVerified`** is true only if every CC-* row and G264-AUTH ran in the browser.
- **Not re-run, on purpose:** layout, audio, tab order and screen budget. No app byte changes, and SOURCE-SCOPE proves it.
- **Platform halves:** list these under `"notRunHere"` with the reason "cloud is Linux Chromium only; Saba's platform check":
  - Windows AltGr;
  - macOS Cmd and Ctrl+click;
  - VoiceOver and NVDA;
  - Safari (A-R204-SAFARI-USERMENU-CLICK).

  They are neither PASS nor FAIL.

## 4. Outcome, fixed in advance (D-29z550)
| Result | B at the round-265 planning |
|---|---|
| C PASS and gate 264 `published` | <ul><li>L46-CONTRACT-CHECKS → **მზადაა**.</li><li>GATE232-S2, TLM-R232-MAC, TLM-R228-META-KEYS and TLM-R233-SR-ORDER: "contract half verified (C round 264); platform half open_tech_lead_manual". The platform half does not block (2026-10-23 root clarification).</li><li>GATE244-S4 stays `deferred_low_polish`, now with cloud repro evidence.</li><li>Round 265 = **REGRESSION** if planned on or after 2026-11-02. Otherwise **SABA-B-11c** stage 1: the expert consult on the off-grid offset first, plus the R49-T Saba question, which is already asked in retro-260 §12.</li></ul> |
| C PASS, gate fails | A bounded fix-up for that step. |
| A Meta half red on unmodified code (A's STOP, or C's CC-META) | A new finding, Medium. It changes what a Mac user must learn. Fix it next with a grant on `StudioWorkspace.tsx`. |
| CC-ALTGR / CC-SR-ORDER fail | A new finding with C's severity. Fix it next. |
| Another row fails | A bounded fix-up with the same grant. |

## 5. Neighbouring behaviour at risk
None in the product, because no app byte changes. The only risk is a vacuous test, which MUTANTS covers. A slow new file is covered by the timeout report in §2.4.

## 6. Claims (L29; C re-runs each command verbatim; commands from `store/` unless marked "loop root")
| Tag | Claim | Command | Expected |
|---|---|---|---|
| K1 | HEAD, clean tree | `git rev-parse HEAD; git status --short --untracked-files=all \| wc -l` | `28c4f83bf3a9c59606ee141032ee4f267137dfc2`; `0` (at planning) |
| K2 | 1,121 frozen entries; each protected file once | loop root: `wc -l < b-round-263-r264-tree-sha256.txt; for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-263-r264-tree-sha256.txt; done \| tr '\n' ' '` | `1121`; `1 1 1 1 1 1 1` |
| K3 | the two new files are absent at planning; 197 is the next doc number | `test -e app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx; echo $?; ls docs/implementation/2026/quarter-IV/ \| sort -n \| tail -1` | `1` (at planning); `196-saba-b-9-master-bottom-right.md` |
| K4 | AltGraph guard and its jsdom row | `grep -n "getModifierState('AltGraph')" app/components/arrangement/StudioWorkspace.tsx; grep -n "modifierAltGraph: true" app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx; grep -n "it('OV-T2" app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx \| cut -c1-12` | `2215:`; `247:`; `241:  it('OV` |
| K5 | the handler is on `window`; advertised Meta shortcuts | `grep -n "window.addEventListener('keydown', handleKeyDown)" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -nE "ariaKeyShortcuts: '(Control\+L Meta\+L\|Control\+Z Meta\+Z\|Control\+Shift\+Z Meta\+Shift\+Z Control\+Y Meta\+Y\|Control\+E Meta\+E\|Control\+Alt\+O Meta\+Alt\+O)'" app/lib/arrangement/shortcuts.ts \| cut -d: -f1 \| tr '\n' ' '` | `2569`; `52 60 65 92 153` |
| K6 | the modifier line and the four branches | `grep -n "const modifier = event.ctrlKey \|\| event.metaKey;" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -nE "if \(modifier && key === '(e\|z\|y\|l)'\)" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1 \| tr '\n' ' '` | `2232`; `2307 2314 2323 2328` |
| K7 | no handler row with Meta for Z, Y, E or L (the one hit is the pure `timelineNavigationKey` unit row) | `grep -rnE "metaKey: true" app/lib/arrangement/__tests__ \| grep -E "Key(Z\|Y\|E\|L)'" \| cut -d: -f1,2` | `app/lib/arrangement/__tests__/view.test.ts:307` (1 line) |
| K8 | focus rescue and its jsdom row | `grep -n "^function focusPastHiddenOverview" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "it('OV-T6" app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx \| cut -d: -f1` | `451`; `279` |
| K9 | press focus recorded for button 2 only | `grep -n "event.button === 2 && focused instanceof HTMLElement" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1` | `2020` |
| K10 | browser baseline: AltGraph, Overview order, Ctrl+click (both viewports) | loop root: `node b-round-263/probe-l46.mjs /tmp/k10.json` then read the JSON | per viewport: `p2_altGraph.hidden false`, `p2_control.hidden true`; `p3_activeAfter "BUTTON\|Expand video"`, `p3_ring {outlineStyle solid, outlineWidth 1px, outlineOffset 2px, focusVisible true}`, `p3_status "Overview hidden. Ctrl+Alt+O shows it again."`; `p5_right.afterEsc "INPUT\|Search the library"`, `p5_ctrl.menu 1`, `p5_ctrl.afterEsc "BODY"` |
| K11 | browser baseline: Meta equals Control (both viewports) | loop root: `node b-round-263/probe-meta.mjs /tmp/k11.json` | the 4 runs print identical step lines; split → 2 clips, "Clip split at 00:07.500."; loop → `true`, "Loop created and turned on: 00:02.500 — 00:07.500."; again → `false`, "Loop is off; the range is kept." |
| K12 | recipe sources for MS1, MS4, MS5 | `grep -n "it('OV-E1" app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx \| cut -d: -f1; grep -c "key: 'e', code: 'KeyE', ctrlKey: true" app/lib/arrangement/__tests__/insert-marker-ui.test.tsx; grep -n "key: 'l', code: 'KeyL', ctrlKey: true })" app/lib/arrangement/__tests__/delete-selection-ui.test.tsx \| cut -d: -f1` | `183`; `4`; `453` |
