# CURRENT TASK — Round 88: fix R87-PROGRESS-BELOW-FOLD-1280 — the Export dialog's status, progress and buttons stay visible (sticky footer) (D-29z53)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-87.md` (exact copy, sha256 `ffdb2a42…`). Rationale: `b-round-87.md`. Decision record: D-29z53 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one C bug (medium), one owner (A), one source file plus one new test file and one doc. It is a fix round, not a feature stage.

## Why this round
- **C round 87: FAIL**, `browserVerified=true`, `realVerified=true`.
  - All 18 B rows PASS at both viewports. The 5-minute WAV max rAF gap fell from 445 ms to 105–107 ms; MP3 97–111 ms. PX-RETRY proves that a retry now works in the same page.
  - **One medium bug, R87-PROGRESS-BELOW-FOLD-1280.** At 1280×720 the dialog panel (`max-h-[90vh] overflow-auto`, 36–684 px, clientHeight 646, scrollHeight 758) shows the progress label cut off (677–693 px). The `<progress>` bar (709–717) and the busy button (740–778) are fully below the fold. The user has to scroll and nothing tells them to. At 1440×900 everything is visible.
  - Even before any export, the 1280 panel already overflowed by 12 px at `971141d` (658 vs 646), so the export button's bottom edge is cut too.
- **Gate 87 was skipped** (`gates/gate-round-87.json`: "C taskStatus FAIL"). Nothing from round 87 is published. HEAD is still `971141d`, and the round-87 work sits uncommitted in the tree. It is the baseline below.
- **Regression round:** due on or after 2026-10-24 (`regression-last.json` = 2026-10-21). Not today.

## Baseline (measured by B, 2026-10-22)
- **HEAD `971141d67a1dd33da8f1165de1d895bd62b4e022`**. `git status --short` = **7 M + 10 ??**, exactly the round-87 end state. `a-round-87/end-hashes.txt` matches, and `b-round-86-r87-tree-sha256.txt` is 490/490 OK.
- **Frozen list:** `../tmp/studio-real-loop/b-round-87-r88-tree-sha256.txt`, **505** entries, **505/505 OK**. It covers every tracked and untracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files below. That includes the 9 other round-87 files at their round-87 content. Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-87-r88-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-87-r88-snapshots/` (`SHA256SUMS.txt`). LF, CR=0:

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `2082951a` | 483 | owned |
  | `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | `eeeb7327` | 118 | owned (listed lines) |
  | `app/components/ui/Modal.tsx` | `741c2341` | — | frozen, reference |
  | `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | `ac53f685` | — | frozen, reference |
  | `app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx` | `e4ad8336` | — | frozen, reference |

- **Protected files:** 4/4 OK. Never touch the auth files, `app/contexts/StudioContext.tsx` (`caa388e7`) or `app/utils/ffmpeg.ts` (`0995ae78`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean or re-create anything. Do not revert any round-87 file.
  - A mismatch (another HEAD, another status, a changed frozen file) means stop and report.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-88/mut/`), never in `store/`.

## 1. What changes (A)

### Today (B read the source of the round-87 tree)
- `ArrangementExportDialog.tsx` renders `<Modal ref={dialogContentRef} size="lg">` → focus-trap `<div>` → `ModalHeader` → `<ModalBody className="space-y-4">`. ModalBody contains, in order:
  1. the format fieldset;
  2. the scope fieldset;
  3. the notes (loop, video sound, master mute, master gain, empty project);
  4. the status `<p>` (l.~413–425);
  5. the progress label and `<progress>` (l.426–439);
  6. the overload warning (l.440–448);
  7. the button row `div.flex.justify-end.gap-2` with Close and Export (l.449–478).
- The scroll container is the **shared Modal panel** (`Modal.tsx` l.105–111: `bg-surface … max-h-[90vh] overflow-auto overscroll-contain`). Its element is `dialogContentRef.current`, because the dialog passes `ref={dialogContentRef}` to `Modal`, which forwards it to that panel. `ModalBody` is `px-8 py-4`. `Modal.tsx` is **frozen**.
- The frozen focus tests use `modalClose.parentElement` (= the panel) and `exportDialogFocusableElements(content)`. The Tab order must stay exactly as it is: X → format radios → scope radios → Close → Export.

### F1 — sticky footer (the fix)
- Wrap items 4–7 (status `<p>`, progress label + bar, overload warning, button row) in **one** element:

  ```tsx
  <div ref={footerRef} data-testid="arrangement-export-footer" className="sticky bottom-0 -mx-8 space-y-4 border-t border-outline bg-surface px-8 pt-4 pb-4">
  ```

  - Token classes only (`bg-surface` is the panel's own background, `border-outline` the panel's border). No custom CSS, no inline style.
  - The children keep their elements, classes, attributes, texts and **relative order**. No child is added or removed.
  - The footer has no `tabIndex`, no role and no `aria-*`. It is a layout element only.
- The footer is ModalBody's last child, so the DOM order, and with it the Tab order, does not change.
- Nothing else in the dialog changes: radios, texts, the Close rule, the button rules, the focus-trap effects and the progress rendering condition stay as they are.

### F2 — focus is never hidden behind the footer
A sticky footer can cover a focused control above it. The browser does not scroll an element that is already inside the scrollport, even when the footer covers it. So:
- Add one `useEffect` (deps `[isOpen]`) with a `focusin` listener on `dialogContentRef.current`.
- When the target is an `HTMLElement` outside the footer and `target.getBoundingClientRect().bottom > footer.getBoundingClientRect().top`, set `content.scrollTop += overlap + 8`, where `overlap` is that difference. Use exported constant `ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX = 8`.
- Do nothing when the footer or content is missing, when the target is inside the footer, or when the target **contains** the footer. The last case is the focus-trap `<div ref={focusTrapRef} tabIndex={-1}>`, which wraps the whole body: the existing effect (l.140–156) calls `trap.focus()` the moment a render starts, because Close becomes disabled. Its rect always overlaps the stuck footer, so without this check every export click would scroll the panel on its own. Act only on targets that sit strictly above the footer in flow.
- Remove the listener on cleanup.
- Use no `scrollIntoView`. jsdom lacks it, and setting `scrollTop` works in jsdom and in the browser.

### Docs
- **Doc 077:**
  - Change l.4 to exactly:

    ```text
    **სტატუსი:** Round 88 — C round 87: 18/18 PASS, ერთი medium ბაგი (R87-PROGRESS-BELOW-FOLD-1280) — გასწორდა sticky footer-ით, C-ის შემოწმებას ელოდება (D-29z53)
    ```

  - Add one Problem → Solution entry under `## პრობლემები და გადაწყვეტები`: the 1280 measurement, why sticky and not `scrollIntoView`, and the focus guard F2.
  - Add one line under `## შეცვლილი ფაილები` and one under `## ტესტირება`.
  - No other change.
- No new implementation doc. The fix completes stage 3a, which doc 077 already documents.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | F1 + F2 only (`footerRef`, the wrapper, the `focusin` effect, the exported constant) |
| `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` | **new** |
| `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | l.4 + the three additions above |

**Expected end state: 7 M + 11 ??.** The status adds exactly one line: `?? app/lib/arrangement/__tests__/export-dialog-footer.test.tsx`. All 505 frozen entries stay unchanged (both owned existing files are outside the list).
- If any frozen test turns red (especially `export-dialog-focus*.test.tsx`, `export-range-ui`, `export-mp3`, `export-progress-ui`, `master-ui`, `video-fades-ui`), **stop and report**; do not edit it.

### Required tests (`export-dialog-footer.test.tsx`; IDs for C to cite)
jsdom has **no layout**. These tests prove structure, order and the F2 arithmetic, not visual visibility; visibility is C's browser measurement. Write that limitation in the file's describe name or A's report.
- **FT1** idle dialog:
  - `arrangement-export-footer` exists and its `className` contains `sticky`, `bottom-0` and `bg-surface`;
  - it contains Close and Export;
  - it does not contain the format or scope fieldsets or the notes;
  - it is the last element child of ModalBody.
- **FT2** during a render (renderer mocked as in `export-progress-ui.test.tsx`, calling `onProgress('render', 0.5)`):
  - the status `<p>`, the progress label and the `<progress>` are inside the footer;
  - their DOM order is status → label → bar → button row.
  - After a done render with an overload warning, the done message and `arrangement-export-overload` are inside the footer, before the button row.
- **FT3** focus order unchanged:
  - the focusable sequence from the same selector the frozen focus tests use (`exportDialogFocusableElements` is module-private; do not export it) gives the same element sequence as before the change: X, the enabled format radios, the enabled scope radios, Close, Export;
  - the footer has no `tabindex` attribute.
- **FT4** focus guard, with mocked `getBoundingClientRect`:
  - a scope radio with bottom 600 and a footer with top 560 → after `focus()`, `panel.scrollTop` is `0 + 40 + 8`;
  - a radio fully above the footer → `scrollTop` unchanged;
  - focusing Close (inside the footer) → unchanged;
  - focusing the focus-trap wrapper (which contains the footer, with a mocked bottom far below the footer top) → `scrollTop` unchanged; also through a real render start, when the existing effect focuses the trap;
  - after the dialog unmounts, a `focusin` dispatched on the old panel does nothing and throws nothing.

**Mutation proofs** (scratch copy; each must turn at least one listed test red):
- (a) remove `sticky` → FT1;
- (b) move the progress block out of the footer → FT2;
- (c) footer gets `tabIndex={0}` → FT3;
- (d) remove the focusin effect → FT4;
- (e) drop the `+ 8` margin → FT4;
- (f) handler ignores the inside-footer check → FT4;
- (g) handler does not skip a target that contains the footer (the trap wrapper) → FT4.

## 2. Pre-flight for A
- **Primitives:**
  - `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md` (new export name);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `SKELETON_LOADING.md` (progress visibility).
- **Prompts:** `studio-feature.md`, `new-test.md`.
- **Verify the baseline before the first edit:**
  - HEAD;
  - the 7 M + 10 ?? status;
  - the frozen list 505/505;
  - the snapshots;
  - protected 4/4;
  - LF/CR.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the two owned code files (no `--write`).
  - Targeted vitest: the new test; `export-dialog-focus.test.tsx`, `export-dialog-focus-restore.test.tsx`, `export-range-ui.test.tsx`, `export-mp3.test.tsx`, `export-progress-ui.test.tsx`, `master-ui.test.tsx`, `video-fades-ui.test.tsx`; and every test that imports `ArrangementExportDialog` or `StudioWorkspace`.
  - List the files in `a-round-88/targeted-list.txt`. Do not run the full suite.
- **A's own Playwright smoke at 1280×720 and 1440×900** (not C evidence). Use the 5M recipe: drop music 0.35, stems 2 and sfx 4, click the music clip, press Ctrl+D ×2. During a WAV export and an MP3 export, log:
  - the panel rect;
  - the footer, label, bar and busy-button rects;
  - `elementFromPoint` at the bar's centre.
  Then Tab through the idle dialog and the done-with-warning dialog (101.702 s project) and log whether any focused element intersects the footer.
- **Code-reviewer: required.** You change exactly 3 files, and `read-primitives.md` asks for it at 3 or more. Pass its Architecture note to B verbatim. The root gate's reviewer does not replace yours.

## 3. File ownership (exact)
- **A** owns only the §1 Files table.
- **C** owns `c-round-88*`.
- **B** owns the planning artifacts.
- **Root** owns gates, commits and pushes.
- **Protected (never edited):**
  - `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`;
  - the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`);
  - for this loop, `app/contexts/StudioContext.tsx`, `app/utils/ffmpeg.ts` and the shared `app/components/ui/Modal.tsx`.
- **`/studio-lab`** stays the public **demo-only** workspace:
  - it shows the demo badge;
  - it has no purchased audio and makes no token/R2 requests;
  - its only third-party requests are to the unpkg ffmpeg core, after an MP3 click;
  - user video stays local.

## 4. Ableton source table
This is a layout defect in CZABA's own dialog. **Not applicable:** B did not research the layout of Live's Export dialog, and it gives no basis for any claim here. The round-87 §4 rows are carried unchanged (`tasks/round-87.md` §4):
- progress bar in the dialog: confirmed for real-time and video rendering, unconfirmed for offline audio;
- the bar resets per pass: conscious adaptation;
- Cancel: stage 3b;
- UI does not freeze: CZABA requirement;
- VBR vs CBR 320: conscious difference.

## 5. C acceptance (real browser, Playwright Chromium, **both 1440×900 and 1280×720** unless the row says otherwise, `/studio-lab` anonymous, real `page.mouse` and keyboard)

**Setup:**
- Check `env-status.json` and that `:5173` returns 200. Do one warm-up load.
- Use the demo setup from round 87: music 0.35 s, stem 2 s, sfx 4 s, snap off. **5M** = click the music clip, then press Ctrl+D twice (`05:04.406`). The **101.702 s project** is the same setup without Ctrl+D (it shows the overload warning).
- Run route probes in a separate session.

**Visibility definition (HR-VISIBLE):**
- The element's `getBoundingClientRect()` lies fully inside the panel's visible box: top ≥ panel top + `clientTop`, bottom ≤ panel top + `clientTop` + `clientHeight`.
- `document.elementFromPoint` at the element's centre returns the element or a descendant of it.
- No scroll by C unless the row says so. Record the panel `scrollTop`.

**Rects:** report every rect, plus a screenshot per state.

| ID | Action | Pass evidence |
|---|---|---|
| VIS-IDLE | Open Export on the 101.702 s project and on 5M; no export | Close and the export button are HR-VISIBLE at `scrollTop` 0 at both viewports. This also closes the old 12 px cut at 1280. Report `scrollHeight` and `clientHeight`. Opening the dialog does not change `scrollTop` |
| VIS-RENDER (primary) | 5M: WAV, MP3 (fresh page, so the load phase appears), WAV + MP3 (1440 only) | In **every phase** that appears (render, wav, load, mp3), sampled at least once each with HR-PROGRESS, the progress label, the `<progress>` and the busy button `მიმდინარეობს…` are HR-VISIBLE. The status `<p>` is HR-VISIBLE. **No self-scroll:** the panel `scrollTop` right after the export click (and through the render) equals its value before the click. Only the keyboard focus guard (FOCUS-NOT-OBSCURED) may change it |
| VIS-SCROLL | During a 5M WAV render: wheel the panel to the bottom, then back to the top | At every position (≥ 3 samples) the footer, label and bar are HR-VISIBLE. At three points across the footer, `elementFromPoint` returns a footer descendant (no content shows through). At the bottom, the last non-footer element's bottom ≤ the footer top (nothing is covered). Screenshots |
| VIS-DONE | 101.702 s WAV export | After done: the done message and the overload warning are HR-VISIBLE at the current `scrollTop`. Their texts are exact as in round 87 |
| VIS-ERROR | `page.route('**/unpkg.com/**', abort)`, then MP3 | The exact load-failure alert (`role=alert`) and an enabled Close are HR-VISIBLE; progress is cleared; 0 downloads. Unroute |
| VIS-VIDEO (1280) | Add a video clip (the longest dialog content); WAV export | The video option is disabled with the unchanged reason. During the render the label, bar and busy button are HR-VISIBLE. `.wav` downloads |
| FOCUS-NOT-OBSCURED | Keyboard only, in three states: (1) idle; (2) during a 5M render; (3) done with the overload warning. Tab through every focusable once around | Each focused element outside the footer has `rect.bottom ≤ footer.top` after focus, i.e. it is not covered. Focus never leaves the dialog. The Tab order is X → format radios → enabled scope radios → Close → Export, the same as round 87 |
| PX-PHASES-R | One MP3 5M export per viewport (fresh page) | Same evidence as round-87 PX-PHASES: render → wav → load (no `value`) → mp3, non-decreasing values, label = floor(value × 100), absent before the click and after done |
| PX-KEYS-R | As round-87 PX-KEYS | Enter opens Export, ArrowDown → MP3, Tab → button, Enter; 3 Tabs during the render stay inside the dialog; the `<progress>` never takes focus; `.mp3` downloads; Escape after done returns focus to Export |
| PX-WAV5-R (1280) | One 5M WAV export with HR-RAF | Report the max and top-5 rAF gaps. ≤ 150 ms passes; 150–250 is reported for B's triage; above 250 is a FAIL (the sticky repaint must not bring the freeze back). Frames 14 611 488 |
| PX-NET | All sessions | No unpkg request before the first MP3 click; then only `ffmpeg-core.js`/`.wasm`; the worker is same-origin; 0 studio-token / R2 / download requests; 0 auth headers |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning and no non-noise console error. Induced aborts are reported as induced |
| G88-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace. `/api/studio-token?…` anonymous → 401. The header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T88-TARGETED | A's `a-round-88/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD `971141d`; 7 M + 11 ??; frozen 505/505; A's end hashes; protected 4/4; `Modal.tsx` = `741c2341`; `ffmpeg.ts` = `0995ae78` |

- **Why the regression is reduced:** the change is one file, layout and focus scrolling only. The other 17 round-87 rows passed on the identical tree, with the dialog file being the only one that differs. PX-PHASES, PX-KEYS and a 1280 rAF run re-check the paths the footer touches. Round 87's other PASS rows stand as evidence for that tree.
- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Production bundle** (worker + MP3): still cannot run in the cloud. B asks root to try it at gate 88 (PROD-MP3-UNVERIFIED).
- **Ableton match:** not applicable this round (§4).
- **Neighbour behaviour that could break:**
  - the focus trap and its order;
  - focus return after Escape;
  - the round-86 scope and format defaults;
  - the overload warning text;
  - the 1440 layout;
  - the export-button disabled rules.
- **Known and intended (not new bugs):**
  - Close stays disabled while rendering;
  - Cancel arrives in stage 3b;
  - the timeout text still says "reload the page" (Low R87-L-TIMEOUT-RELOAD-TEXT, Lows batch);
  - the headless fill colour of `<progress>` (Tech Lead check R87-T).

## 6. After this round
- **If C PASS**, SRW-20 stage 3a is C-verified at both viewports. Root can publish rounds 87 and 88 together.
- **Round 89:**
  - If its planning falls on or after **2026-10-24**: a **regression round** (one short browser check per done or c_pass item at both viewports, plus `npm run test:e2e:smoke`; GATE85-S6 is one of its rows).
  - Otherwise: **SRW-20 stage 3b**:
    - Cancel in every phase, with no file, an exact cancelled message and a working next export;
    - abort on unmount (A-R86-L2);
    - the WAV + MP3 delivery note (GATE86-S2);
    - reviewer L5 (a failed conversion leaves the cached encoder).
  - 3b completes R20-X4.
- **Then:** the Lows batch (incl. R87-L-TIMEOUT-RELOAD-TEXT) → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- **Architecture:** the round-87 reviewer note (move the MP3 export orchestration into `lib/arrangement/` after 3b) is recorded as signal ARCH-EXPORT-MP3-ORCHESTRATION under ARCH-EXPORT-PIPELINE. Checkpoint request q14 (`b-round-83-checkpoint-request.md`) asks root for the bounded frontend-architect checkpoint at the SRW-20 boundary, after 3b. Neither blocks this round.
