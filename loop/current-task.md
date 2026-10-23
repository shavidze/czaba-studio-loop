# CURRENT TASK — Round 110: the library's ◀ / ▶ / × keep keyboard focus (B-R108-LIB-FOCUS-LOSS, Medium)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned ~13:05–13:40 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner, speed rules and the **2026-10-23 bug-gate decision** in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-109.md` (exact copy). Rationale: `b-round-109.md`. Decision record: **D-29z75** in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug class in one component: three library buttons unmount themselves on activation (◀ collapse, ▶ expand, × search clear). One file of product code, one implementer (A).
- **Why now:**
  - The 2026-10-23 user decision says: fix the open Medium findings first, then open T12. Round 109 (C-R23-01) is C PASS and published (`1fe3ba2`).
  - B-R108-LIB-FOCUS-LOSS is the next open Medium that A can fix and C can verify on the cloud runner.
  - The regression round is **not due**: `regression-last.json` is 2026-10-21; today is 2026-10-23 (2 days). The next B planning on or after 2026-10-24 is the regression round.

## The defect (B re-measured at `1fe3ba2`, 2026-10-23 ~13:10 UTC)
- **Evidence:** `b-round-109/probe/lib-focus-probe-result.json` (real Chromium, 1280×720; same result as round 108's `b-round-108/probe/`).
- **Repro:** fresh `/studio-lab` → Decline → wait for the library → focus the Middle East option → ArrowDown (CZABA hero becomes the selected option) → focus the button → Enter → Enter.

  | Button | After Enter 1 | After Enter 2 |
  |---|---|---|
  | ◀ `arrangement-library-collapse` | collapsed, `activeElement` = BODY | **clips 0 → 1** („CZABA hero … დაემატა მუსიკა ხაზზე 00:00.000-ზე“) |
  | ▶ `arrangement-library-expand` | expanded, BODY | **clips 0 → 1** |
  | × `arrangement-library-search-clear` | query empty, BODY | **clips 0 → 1** |

- **Cause:** each button is rendered only in one state (`ArrangementLibrary.tsx` l.374–386, l.391–400, l.414–424). Its click handler changes that state, so the button that has focus unmounts. Chromium then drops focus to `<body>`. The workspace Enter handler (`StudioWorkspace.tsx` l.1971–1981, **frozen**) adds the active library item when Enter lands on BODY.
- **Same class as** C-R107-01 / FL-HISTORY (round 108, doc 093). There the buttons became `disabled`; here they **unmount**. The round-108 predicate `source.disabled` does not apply.
- **Not this round:** whether Enter on BODY should add anything is the open user question **B-R107-ENTER-ON-BODY**. As in round 108, this round closes the Medium by keeping focus in place, without changing that contract.

## Swept neighbours (B probe, `b-round-109/probe/video-focus-probe-result.json`, 1280 and 1440)
- Video placeholder „დაბრუნება“, float ✕ and ⤢: after Enter, focus is on ⤢ (`arrangement-video-expand`); Enter 2 adds no clip. **Not reproduced.** The existing `ArrangementVideoDock` float-cleanup effect already restores focus.
- Track pan reset: on success it focuses the Pan slider, also after a mouse click (focus is never lost to BODY). It stays a deferred Low (A-R108-SWEEP-HITS); not this round.

## Decision (D-29z75)

### F1 — focus goes to the button's partner

| Activated button (had focus) | Partner that receives focus | When | Why this partner |
|---|---|---|---|
| ◀ collapse | ▶ expand (mounts in the next render) | after the render that mounts it (layout effect) | It is the same toggle in its other state, at the same top-left spot of the library. One more Enter undoes the action. |
| ▶ expand | ◀ collapse (mounts in the next render) | after the render that mounts it (layout effect) | Same reason, mirrored. |
| × search clear | the search input `arrangement-library-search` | synchronously in `onClick`, after `setQuery('')` | The input is always mounted while the library is expanded. Escape in the input already clears the query and keeps focus there (l.222–225). Enter in a text input is ignored by the workspace (`isTypingTarget`, l.1683), so a following Enter adds nothing. |

- **"Had focus"** means `document.activeElement === event.currentTarget` at click time. This covers keyboard Enter/Space, and a mouse click (Chromium focuses a button on click). The same rule as doc 093 F1: after a mouse ◀ click, focus is on ▶.
- **Only if focus did not go elsewhere:** at the layout effect, move focus only when `document.activeElement` is `document.body` or `null`. (A removed focused element leaves `activeElement` = body in both Chromium and jsdom.) Do not steal focus that another component moved meanwhile (e.g. the video dock's float cleanup focusing ⤢).
- **Only armed clicks move focus.** Collapse/expand that does **not** come from these buttons must not move focus:
  - ⤢ opening the collapsed library for the floating video (`expandFloatingVideo`, `StudioWorkspace.tsx`);
  - returning the video re-collapsing the library (`returnFloatingVideo`, also through window Escape);
  - any first render.
- **Mechanism (refs only, no new state):** `render-budget.test.tsx` counts `ArrangementLibrary` renders.
  - In ◀/▶ `onClick`: if the button had focus, arm a ref with the partner kind (`'expand'` or `'collapse'`), then call `onCollapsedChange(...)`.
  - Add a ref to the ▶ button and to the ◀ button.
  - One `useIsomorphicLayoutEffect` (`~/hooks/useIsomorphicLayoutEffect`) **without a dependency array**: read and clear the armed ref on every render. If armed, the partner ref is mounted (`isConnected`), and `activeElement` is body or `null` → `partner.focus()`.
  - If the parent refuses the change (no re-render with the new state), the armed ref is cleared on the next render, and nothing moves because the source button still has focus.
  - × does not need the ref: focus the input ref right after `setQuery('')` in the same handler, only if × had focus (the input stays mounted, so this is safe before the commit).
- **The names** are A's choice per `AGENT_DISCOVERABLE_CODE.md` (e.g. `libraryToggleFocusRef`, `armLibraryToggleFocus`). No shared helper extraction in this round (see Architecture).

### F2 — each of the three buttons acts once per Enter press
- **Required, not optional.** Today a held Enter on ◀ collapses once, and the repeats land on BODY, where the workspace ignores `event.repeat`. After F1, without a guard, the repeats would land on ▶ → expand → ◀ → collapse… (ping-pong). F1 alone would create a regression.
- Add `onKeyDown`: `event.key === 'Enter' && event.repeat` → `preventDefault()`. No `stopPropagation`. This is the existing convention (`ArrangementTransport.tsx` `preventRepeatedEnterKeyDown`, doc 093 F2). Apply it to ◀, ▶ and ×.
- A local copy in `ArrangementLibrary.tsx` is fine. Do **not** import from or edit `ArrangementTransport.tsx`; it is frozen.
- Space and every other key are unchanged.

### Rejected
- **Keep both buttons mounted and hide one** with CSS: this changes the rail and panel layout, the width transition and the floating-video measurements (`floating-video.test.tsx`). The diff is larger and riskier.
- **Change the workspace Enter-on-body contract:** user question B-R107-ENTER-ON-BODY; `StudioWorkspace.tsx` is frozen.
- **A document-level focus listener:** global, implicit, and already rejected in D-29z73.
- **× → the first option:** the user was in the search; returning to the input is the standard search-clear behaviour and matches Escape.

## Baseline (measured by B, 2026-10-23 ~13:12 UTC)
- **HEAD `1fe3ba21bd4e6467d6aa2e869604f948e6b8cc2a`** (gate 109 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-109-r110-tree-sha256.txt`, **544** entries.
  - It is the round-109 list (542), minus `app/components/arrangement/ArrangementLibrary.tsx`, plus the three published round-109 code paths (`app/entry.server.tsx`, `app/lib/ssr/strip-nul-bytes.server.ts`, `app/lib/ssr/__tests__/strip-nul-bytes.server.test.ts`), re-hashed from the tree at `1fe3ba2`.
  - Docs are not in the list. The doc rule is checked by `git status` and `git diff`.
  - Check it with `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-109-r110-tree-sha256.txt`. B checked it: OK.
- **Snapshot:** `../tmp/studio-real-loop/b-round-109-r110-snapshots/ArrangementLibrary.tsx` (sha256 `32613fe1…`, 568 lines). Fail-before runs against it.
- **Owned files:**

  | File | Permission |
  |---|---|
  | `app/components/arrangement/ArrangementLibrary.tsx` (`32613fe1`) | **owned, narrow:** the `react` import list and one new `import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';`; new refs, the arm helper, the layout effect, the local repeat guard and a search-input ref inside `ArrangementLibrary`; the ◀ button (l.376–385), the ▶ button (l.391–400), the × button (l.415–423) and `ref` on the search `<input>` (l.404–413). Byte-identical: the option component, the option handlers, search filtering and `handleSearchKeyDown`, the tree, the list, the separator and resize code, `ArrangementLibraryPreview`, every class string, label, title and `data-testid`. |
  | `app/lib/arrangement/__tests__/library-focus-handoff.test.tsx` | **owned (new).** |
  | `docs/implementation/2026/quarter-IV/095-studio-library-toggle-focus.md` | **owned (new doc, whole).** |
  | `docs/implementation/2026/quarter-IV/094-studio-ssr-nul-bytes.md` (`e412a50b`) | **owned, one line:** l.4, the status line only. It must say that round 109 is C PASS and published in `1fe3ba2` (gate 109). Every other line stays byte-identical (gate-109 F6). |

- **Expected end state:** `git status --short --untracked-files=all` = **2 M + 2 ??** (exactly the four paths above).
- **Frozen neighbours that must stay green and unedited:** `StudioWorkspace.tsx` (`e83fa485`), `ArrangementContext.tsx` (`3c02b824`), `ArrangementTransport.tsx`, `ArrangementVideoDock.tsx`, `floating-video.test.tsx` (l.710–726: after a focused ◀ click focus is **not** ⤢; ▶ satisfies this), `render-budget.test.tsx`, `self-disabling-focus.test.tsx`.
- **Protected (frozen, never edited; B re-checked at `1fe3ba2`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`), `app/root.tsx` (`c4793004`), `app/entry.client.tsx` (`b804dc00`);
  - the auth files: `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`);
  - `app/entry.server.tsx` and `app/lib/ssr/**` are frozen again after round 109 (plan §6, D-29z75);
  - `package.json` (`cf14e3b1`) and the lockfile (`74a5f435`); no new dependency.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`, round 109). The backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean, commit or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-110/mut/`, with a `node_modules` symlink and the Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if, at the start, HEAD differs, the status is not empty, or a frozen file changed.

## 1. What changes (A)
Read first:
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (component edit), `DESIGN_TOKENS.md` / `TAILWIND_FIRST.md` (no class changes are expected; confirm), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
- `.claude/prompts/new-test.md`, `docs/implementation/TEMPLATE.md`, and doc 093 (`093-studio-self-disabling-button-focus.md`) for the F1/F2 precedent.

No visual change: no class, label, title or `data-testid` changes.

### Tests (`app/lib/arrangement/__tests__/library-focus-handoff.test.tsx`)
- Mount the real `StudioWorkspace` with the demo collection, the way the existing UI tests do (e.g. the `floating-video.test.tsx` or `self-disabling-focus.test.tsx` harness; copy the harness, do not import from or edit a frozen test).
- Exact assertions only (`toBe`, `toEqual`). No `as` (including `as const`), no `@ts-` and no `any`.
- Count clips through the context API or `[data-clip-id]`, not through status text alone.

Cases:
- **LF1:** focus ◀ → `fireEvent.click` → the library is collapsed and `document.activeElement` is ▶ (`arrangement-library-expand`).
- **LF2:** focus ▶ (collapsed) → click → expanded, and `activeElement` is ◀.
- **LF3:** type a query, focus × → click → the query is empty, × is gone and `activeElement` is the search input.
- **LF4 (the user-visible oracle):** after LF1, LF2 and LF3, a following Enter keydown on `document.activeElement` (bubbling to `window`) adds **no** clip: the clip count is unchanged. For LF3, the Enter goes to the input.
- **LF5 (not armed → no move):** with focus on another element (e.g. Play), call the ◀ click without focusing ◀ first (`fireEvent.click` on an unfocused ◀). Focus stays on Play. The same for ▶.
- **LF5b (nothing focused → no move; the case that separates the two guards):** blur everything so `document.activeElement` is `document.body`, then `fireEvent.click` on the unfocused ◀ → the library collapses and `activeElement` stays `body` (▶ does **not** receive focus). The same for ▶.
- **LF6 (video-driven collapse/expand does not move focus):** library collapsed, focus on Play; click ⤢ (`arrangement-video-expand`) → the library opens for the video; then return the video (⤢ or ✕) → the library re-collapses. In both steps, focus is not moved to ◀ or ▶ by the library. Assert the exact `activeElement` you observe before and after, and explain it in the report if the video dock's own focus rule applies.
- **LF7 (focus moved elsewhere wins):** arm ◀ (focused click), but before the layout effect runs, focus moves to another element. Write it the honest way you can in jsdom, e.g. a wrapper whose `onCollapsedChange` focuses Play before calling the real setter, or skip LF7 and say why. Focus must stay on Play.
- **LF8 (F2):** a keydown `Enter` with `repeat: true` on ◀, ▶ and × has `defaultPrevented === true`. A non-repeat Enter is not prevented by the guard. Space is not prevented.
- **LF9 (held Enter, ping-pong guard):** focus ◀ → click → focus is now ▶ → dispatch `keydown` Enter `repeat: true` on ▶ → `defaultPrevented` is true, and the library is still collapsed (the guard runs; jsdom does not synthesise the click, so assert the guard, and leave the real hold to C's LF-HOLD).

**Fail-before** (scratch; `ArrangementLibrary.tsx` = the snapshot):
- B expects LF1, LF2, LF3, LF4, LF8 and LF9 red; LF5, LF5b and LF6 green (no handoff exists); LF7 green or skipped.
- Report the exact list.

**Mutations** (scratch only; one unmutated control before and after; record the red tests):
- **m1:** no handoff (remove the `focus()` calls) → LF1, LF2, LF3, LF4 red.
- **m2:** arm unconditionally (ignore "had focus") → LF5b red. (LF5 stays green under m2, because the body/null check still protects focus on Play; LF5 is the "focus elsewhere is untouched" case.)
- **m3:** drop the body/null check in the effect → LF7 red (if LF7 is written; otherwise write "survives; covered by C's LF-VIDEO-NEUTRAL").
- **m4:** remove the repeat guard from ◀/▶ → LF8 and LF9 red.
- **m5:** focus the wrong partner (◀ → the search input) → LF1 red.

### Docs
- **Doc 095 (new):** `docs/implementation/TEMPLATE.md`, in Georgian with English technical terms.
  - **Status:** round 110 waits for C (D-29z75).
  - **Context:** B-R108-LIB-FOCUS-LOSS with B's probes at `32a6b08` and `1fe3ba2`; the link to doc 093.
  - **Approach:** F1 table (partner per button), the "had focus" / body-or-null / armed-only rules, F2, and the rejected alternatives.
  - **Architecture:** a Mermaid sequence diagram (as in doc 093).
  - **Problems and solutions, Testing:** fail-before, m1–m5 and the targeted count.
  - **TODO:** B-R107-ENTER-ON-BODY (user question); the shared focus-handoff helper question (architecture checkpoint).
- **Doc 094:** l.4 only (see Baseline).

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint` with 0 diagnostics in the owned files (`--max-diagnostics` and grep, as in round 109).
- `npx biome check` on the 2 owned code/test files, without `--write`.
- **Targeted vitest:**
  - Build the list: `grep -rlE "ArrangementLibrary|arrangement-library-|library-focus-handoff" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-110/targeted-list.txt`. B's grep at `1fe3ba2` gives 11 files; with the new one, 12.
  - Also add `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` (the round-108 neighbour) to the list if the grep misses it.
  - Run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-110/targeted-list.txt)`. Report the files and the counts.
- Do **not** run the full suite or `npm run verify` (gate).
- **Code-reviewer:** run it (4 files change). Ask it to check: the layout effect cannot steal focus from the video dock; render count unchanged; no ping-pong on held Enter. Pass its Architecture note through verbatim.
- **Self-check (A evidence, not C acceptance):** `mkdir -p ../tmp/studio-real-loop/a-round-110/probe && cd ../tmp/studio-real-loop/a-round-110/probe && node ../../b-round-109/probe/lib-focus-probe.cjs` (the script writes into its working directory). Expected: after Enter 1 focus is on the partner; after Enter 2 the clip count is unchanged.

## 2. Acceptance — what C checks
**Environment:** the dev server at `:5173`, real Chromium (Playwright). Every browser session is a fresh incognito context with no credentials. Setup for every LF row: `/studio-lab` → Decline → wait until no option shows „იტვირთება…“ → focus the Middle East option → ArrowDown (CZABA hero selected), so that an Enter on BODY **would** add a clip (the hazard is armed).

| ID | Steps | PASS when |
|---|---|---|
| **LF-COLLAPSE** (1280 and 1440) | Focus ◀ (keyboard: Tab or `locator.focus()`), Enter, Enter. | After Enter 1: `data-collapsed="true"`, `activeElement` is ▶ (`arrangement-library-expand`). After Enter 2: the library is expanded again, `activeElement` is ◀, and the `[data-clip-id]` count is **unchanged**. |
| **LF-EXPAND** (1280 and 1440) | Collapse with the mouse, focus ▶, Enter, Enter. | After Enter 1: expanded, focus on ◀. After Enter 2: collapsed, focus on ▶. Clip count unchanged. |
| **LF-CLEAR** (1280 and 1440) | Type `mid` in the search, focus ×, Enter, Enter. | After Enter 1: the query is empty, × is gone, focus is on the search input. After Enter 2: nothing changes and the clip count is unchanged. |
| **LF-MOUSE** (1280) | Mouse click ◀, then press Enter; mouse click ▶, then Enter; type `mid`, mouse click ×, then Enter. | Each time, focus after the click is on the partner, and the Enter adds no clip. (For ◀/▶, Enter toggles the library back; that is expected.) |
| **LF-HOLD** (1280) | Focus ◀, hold Enter ~600 ms (`keyboard.down('Enter')`, repeated keydowns with `repeat` by the browser, then `keyboard.up`). Record every `data-collapsed` change (a MutationObserver). | Exactly **one** change (collapsed), focus ends on ▶, clip count unchanged. Repeat for ▶ (one change: expanded, focus ◀). If Playwright's hold sends no `repeat` keydowns, say so and send repeated `keydown` with `repeat: true` via CDP `Input.dispatchKeyEvent` (`autoRepeat: true`), recording the method. |
| **LF-VIDEO-NEUTRAL** (1440) | Library collapsed, focus Play (the transport button). Click ⤢ with the **mouse** → the library opens for the video. Focus Play again. Return the video with ✕ (mouse) → the library re-collapses. Then also: library collapsed, focus Play, press Escape after ⤢ (window Escape returns the video). | The library never moves focus to ◀ or ▶ in these steps. Record `activeElement` after each step. Focus moved by the video dock's own rule (⤢ after ✕ from a float control) is that component's existing behaviour, not a failure; report it. |
| **LF-SWEEP-NEG** (1280 and 1440) | Re-run `b-round-109/probe/video-focus-probe.cjs` from C's own directory (it writes into its working directory). | Video placeholder „დაბრუნება“, float ✕ and ⤢: after Enter 1, focus on ⤢; Enter 2 adds no clip (A-R108-SWEEP-HITS video part closed by C evidence). Pan reset: record the result only (deferred Low). |
| **R12-L2-ENTER-ADD** (1280) | Regression: focus an option and press Enter. | Exactly one clip is added (SRW-12 R12-L2 unchanged). |
| **REG-LIB** (1280) | ArrowDown/ArrowUp in the list, Escape in the search clears the query and keeps focus in the input, the separator ArrowLeft/Right resizes by 16 px, collapse and expand by mouse animate width as before (rail 40 px, panel ≥ 288 px). | All behave as before; widths measured. |
| **FV-710** (1440) | The `floating-video.test.tsx` l.710 contract in the browser: open the floating video, focus ◀, Enter. | Focus is **not** on ⤢; it is on ▶. |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror, no non-noise console error. A first-load failure after a dep re-optimization: retry once and record both. |
| **G110-3** | anonymous, run alone, after all rows | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in, no workspace and 0 `audio[src]`. `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud) and goes under `blocked`. |
| **AN-REVIEW** (offline) | Review A's tests. | The fail-before list matches §1, or A explains the difference. C re-runs m1, m2 (expect LF5b red) and m4 with its own mutation strings and gets the same red tests. LF4 counts clips (not status text). Exact assertions only; no `as`, `@ts-` or `any`. |
| **T110-TARGETED** | `npx vitest run $(cat a-round-110/targeted-list.txt)`, in scratch with its own `cacheDir`. | All pass. C re-runs the grep and reports any missing file. `floating-video.test.tsx`, `render-budget.test.tsx` and `self-disabling-focus.test.tsx` are in the list. |
| **DOC-095 / DOC-094-L4** (offline) | Read doc 095; diff doc 094 against `1fe3ba2`. | Doc 095 has the TEMPLATE sections, the F1 table, F2 and the rejected alternatives. In doc 094 only l.4 changed, and it names round 109 as C PASS and published in `1fe3ba2`. |
| **SOURCE-UNCHANGED** | start and end | HEAD `1fe3ba2`; the start status is empty and the end status is **2 M + 2 ??** (`--untracked-files=all`). The frozen list checks 544/544. The `ArrangementLibrary.tsx` diff against the snapshot touches only the parts listed in Baseline (no class/label/testid change). The protected hashes are unchanged. |

- **Gate rows** (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Neighbouring behaviour that could break:**
  - **Floating video:** ⤢ opening the collapsed library and the return re-collapsing it (LF-VIDEO-NEUTRAL, FV-710).
  - **Held Enter ping-pong:** LF-HOLD.
  - **Library keyboard and layout:** REG-LIB, R12-L2-ENTER-ADD.
  - **Render budget:** T110-TARGETED (`render-budget.test.tsx`).
  - **Purchase protection:** G110-3.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Keyboard focus after the library toggle / search clear | None checked this round. Live's Browser is shown and hidden from the View menu or its toggle; Live has no DOM keyboard focus model, so there is nothing to compare. | — | CZABA's own a11y/keyboard rule (doc 093 F1/F2 extended to unmounting buttons); no Ableton claim is made. | არ ეხება |

## 4. Report (A)
Write `a-round-110.md` and `a-round-110/a-round-110-summary.json` as you go (the harness writes `a-round-110-result.json`). Include:
- the changed files with end sha256 (`a-round-110/end-hashes.txt`);
- the exact commands and their results;
- the fail-before list;
- the m1–m5 table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the self-check probe result;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
