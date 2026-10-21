# CURRENT TASK — Round 37: C-R36-01 (an involuntary blur during another gesture keeps the typed Clip Gain text) + round-36 test nits + doc 036

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: **D-29z2** in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-36.md`.
- Round size: **one Medium bug plus two closely related Lows** (test nits of the same describe, one doc sentence). No feature work this round.

> **Environment prerequisite (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` answered **200** at B time (17:49 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **7 → 7** during B's gate run. Every A and C run records the count (`tasklist | grep -ci node.exe`).
>
> **Root, before A starts (strongly recommended):** rounds 31–34 and 36 (the same 9 status lines) are C-verified. Round 37 touches `fader-guards.test.tsx` and doc 036 for the **sixth** round in a row. Commit **before A starts** or **after C passes round 37**, never in the middle of the round.

## Why this round

Round 36 landed: **C PASS on every ID** (`c-round-36.md`, `c-round-36.json`). **C-R34-01 and C-R34-02 are closed.** B re-ran the gates (`b-round-36/gates.txt`, 17:49–17:50): HEAD `1cefea1`, 9 status lines, 376 OK, protected 4/4, tsc 0, vitest **69 files / 1259/1259**, build ✓, Biome 2 baseline CRLF errors + 218 warnings + 1 info.

C recorded one new, pre-existing bug, **C-R36-01 (Medium)** = A's review finding A-R36-REVIEW-1 (`c-round-36/runs/ot.txt`, block OT-5b):
1. Select SFX, click into Clip Gain, type `3` (no Enter).
2. A **synthetic** `pointerdown` id 41 on the detail separator starts a gesture (it calls `preventDefault`).
3. A **real** click on Master Volume (a second pointer). The root capture correctly does nothing (gesture active, D-29z row 2). The browser moves focus to Master natively.
4. `commitClipGain('blur')` (`ArrangementDetailPanel.tsx` l.325–354) sees the active gesture at l.333, writes the blocked status **and resets the text to `0.0` at l.335**. The typed `3` is gone, and stays gone after `pointerup` 41.

It needs two simultaneous pointers (multi-touch, pen + mouse), but it destroys the only copy of the user's input. Loss of user input goes before new features.

## Baseline

B verified on 2026-10-13 (17:49–17:50, `b-round-36/gates.txt`):
- HEAD **`1cefea1`**; `git status --short` = the same **9** lines (`../tmp/studio-real-loop/b-round-36-git-status.txt`):
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/contexts/ArrangementContext.tsx
   M app/lib/arrangement/graph.client.ts
   M app/lib/arrangement/model.ts
   M app/types/arrangement.ts
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  ?? app/lib/arrangement/__tests__/track-pan.test.tsx
  ?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ```
- **New frozen list** `../tmp/studio-real-loop/b-round-36-tree-sha256.txt` → **376 OK**. It is round 35's list **minus** `ArrangementDetailPanel.tsx` **plus** `StudioWorkspace.tsx` (`7fe98434`, C-verified in round 36). `StudioWorkspace.tsx` is **frozen** this round.
- Protected 4/4 OK; tsc 0; build ✓; vitest **69 files, 1259/1259**.
- Biome `./app`: **2 errors** (CRLF `format` on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`, root's — **do not touch**) + 218 warnings + 1 info. Your files must add 0 errors.
- Dispatch snapshots of your 3 files: `../tmp/studio-real-loop/b-round-36-snapshots/` (`SHA256SUMS.txt` inside):

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/ArrangementDetailPanel.tsx` | `60d24bb0` |
  | `app/lib/arrangement/__tests__/fader-guards.test.tsx` | `ca3153ad` (= C round 36) |
  | `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | `d5f206c1` (= C round 36) |

- If root commits before you start: record the new HEAD; check `b-round-36-tree-sha256.txt` is still 376 OK (if root normalises the CRLF auth files, those lines may change — report it, it is not yours); check none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules: do not revert, re-create or reformat anything. `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's. Nobody but root commits or pushes.

## 0. Scope

**The contract (D-29z2).** It amends one row of the D-29u Clip Gain contract: what happens to the typed text when a commit is refused because another pointer gesture is active. Rows not listed are unchanged.

| Action | Result |
|---|---|
| Clip Gain has typed text that differs from the stored value, a pointer gesture is active (`isPointerGestureActive()`), and the field **blurs** (focus taken by another pointer, or any other blur) | Status `GESTURE_EDIT_BLOCKED_MESSAGE` (as today). **No entry.** The clip is unchanged. **The typed text stays in the field** (new; today it is reset). |
| The same, after the gesture ends: the user focuses the field again and presses **Enter**, or the field blurs with no gesture active (for example a real click on a clip header, round 34) | The usual commit: +1 `Clip Gain`, the clip gets the value, status `Clip Gain: {title} — {±x.x dB}.`, the field shows the normalised value. Invalid text gives the existing invalid status and resets, exactly as a plain blur/Enter does today. |
| The same, but **a different clip is selected** before the commit | The text is discarded with no entry (the existing D-29u selection rule, frozen `clip-gain.test.tsx` l.803 — unchanged). The blocked status was shown when focus was taken, so this is not silent. |
| Clip Gain typed, a pointer gesture is active, the user presses **Enter** | **Unchanged:** status blocked, text reset to the stored value, no entry (frozen `clip-gain.test.tsx` l.815–831). Enter is voluntary and the field keeps focus. |
| Unchanged text / normalised-equal text blurs during a gesture | **Unchanged:** early return, no status, no entry (l.330 runs before the gesture check). |
| Any blur or Enter with **no** gesture active | **Unchanged** (rounds 30, 34, 36). |
| The 0 dB reset button during a gesture | **Unchanged** (refused with status). |
| Every other gesture-refused edit (Mute, Solo, Volume, Apply range, fold, …) | **Unchanged.** |

**Decisions (D-29z2):**
1. **Locus A, one branch only.** In `commitClipGain` the gesture branch becomes: set the blocked status; reset the text **only when `trigger === 'enter'`**; return. Nothing else in the file changes.
2. **Rejected B:** a `preventDefault` on range pointerdown in the root capture while a gesture is active. It would amend D-29z decision 5, and it would suppress every second-pointer range press, Zoom included. Stage 4b's no-jump click may add `preventDefault` anyway.
3. **Rejected C:** an automatic commit when the gesture ends. It needs a new context API across `ArrangementContext.tsx`, `StudioWorkspace.tsx` and the panel for a multi-pointer-only path. That is larger than the problem.
4. **The stale blocked status after the gesture** is not touched here. It is C-R31-INFO-REFUSAL-STATUS, stage 4b.
5. **Test nits (A-R36-TEST-NITS), additive only:** case 7 pins the invalid status literal; case 8 pins `start.value`. l.1272 (redundant after l.1265) keeps the D-29z1 bytes.

**In (A):** §2.1 (the branch), §2.2 (doc 036), §2.3 (the 2 nit pins + 5 new tests, red-first).

**In (C):** §4.

**Not in this round** (queued, not deferred scope):
- **stage 4b (round 38, may split 38/39):** the no-jump fader click; double-click reset (Live §18.1); FADER-KEY-ENTRIES; A-R29-REVIEW-1; the pending-commit order (checkpoint-oct13 review #5); MASTER-HOLD-TICK-EDGE; A-R31-REVIEW-2; A-R32-REVIEW-1; A-R33-REVIEW-TOUCH; the stale refusal status; the A-R34-REVIEW-RESIDUALS that touch the gesture machine. **4b must keep the round-36 root capture working.**
- **stage 4c + polish (rounds 39–40):** round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE.
- any change to `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, or to the Enter / reset / apply-range refusal paths.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- round 36's R36-CR rows (no gesture: Clip Gain `3` → a real click on Volume / Master);
- the Clip Gain contract: Enter commit, Escape revert, the 0 dB reset, the blur commit on a clip-header click (R34-CG CG-1), invalid text;
- the frozen `clip-gain.test.tsx`, `detail-panel*.test.tsx`, `gesture-guard.test.tsx` suites;
- the round-36 case 10 (jsdom; it must stay green unchanged).

## 1. Mandatory before acting (A)

1. **Read the rules and primitives** in full, **before** the first edit: `.claude/rules/read-primitives.md`; the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/studio-feature.md`; then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit: `git rev-parse HEAD`; `git status --short` (the 9 lines, or the post-commit equivalent); `sha256sum -c ../tmp/studio-real-loop/b-round-36-tree-sha256.txt | grep -vc ': OK$'` → 0; your 3 files against the snapshot shas; protected 4/4; the `node.exe` count.
3. **Read:** `c-round-36.md` §5 (OT-5b) and `c-round-36/runs/ot.txt`; `a-round-36.md` §4; `ArrangementDetailPanel.tsx` l.214–380 (`commitClipGain`, `handleClipGainKeyDown`, `resetClipGain`, the layout effect at l.258); `clip-gain.test.tsx` l.690–831; `fader-guards.test.tsx` l.1363–1604 (the round-36 describe and its helpers).
4. **Re-check (report each):**
   - no existing test fires `blur` on the Clip Gain field while a gesture is active and expects the text reset (B's grep: `clip-gain.test.tsx` l.696/700/762/764 are outside gestures; `fader-guards.test.tsx` l.1572 is after release). If you find one, **stop and report**; do not amend it;
   - the round-36 case 10 (l.1556–1575) stays green unchanged under the fix (its blur happens after release);
   - the detail content is remounted per clip (`ArrangementDetailPanel.tsx` l.800–801: `key={selection?.clip.id ?? …}`), so N5 and C's PG-3 discard the kept text on a selection change even when both clips have no gain. If the key is gone, **stop and report**;
   - the invalid status for emptied text is exactly `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).` (`DETAIL_CLIP_GAIN_INVALID_MESSAGE`, l.52). If the emptied text gives another status, report it and pin nothing for case 7.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementDetailPanel.tsx` — one branch

In `commitClipGain` (snapshot l.333–337), replace

```tsx
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      setClipGainText(currentText);
      return;
    }
```

with

```tsx
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      if (trigger === 'enter') {
        setClipGainText(currentText);
      }
      return;
    }
```

Nothing else changes in this file: no new export, no prop, no comment, no other branch.

### 2.2 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

1. **One clause in place (DOC036-R36-REVIEW-SENTENCE).** In the Round 35–36 section (snapshot l.436), replace only `ბრაუზერში არ შემოწმებულა` in the sentence about A-R36-REVIEW-1 with an accurate clause, for example `C-მ round 36-ში ბრაუზერში გაიმეორა (C-R36-01, \`c-round-36/runs/ot.txt\` OT-5b) და round 37-ში გასწორდა (D-29z2)`. Make no other change to earlier sections.
2. **Append** one section in Georgian, technical terms in English (for example `## Round 37 — სხვა gesture-ის დროს blur Clip Gain-ის ტექსტს აღარ შლის`). Cover: C-R36-01's steps and cause (l.333–336); the D-29z2 table rows; decisions 1–5 with the two rejected loci and why; the Enter / blur asymmetry; the selection-change limitation; that the stale status stays for 4b; the 5 new tests and the 2 pins with the red/green numbers; the C IDs; the Ableton note of §4.6.
3. Update the header status line (l.4).

### 2.3 Tests (red-first in `store/`)

**File:** `app/lib/arrangement/__tests__/fader-guards.test.tsx` only.

**A. The two nit pins (additive lines only, inside existing tests):**
- case 7 (`'Clip Gain emptied → Master pointerdown gives exactly the status and history of a plain blur of the same text'`, snapshot l.1499): after `const blurStatus = live(control.api).status;` add `expect(blurStatus).toBe('Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).');`
- case 8 (`'detail start typed without Enter → Master pointerdown …'`, snapshot l.1520): add `expect(start.value).toBe('4.5');` right after each of the two `expect(live(api).range).toEqual(rangeBefore);` lines.

No other existing line changes (including l.1272 and case 10).

**B. One nested `describe` with 5 `it`,** appended at the end of the round-36 describe (`'a range pointerdown first releases a focused text field (C-R34-01; D-29z)'`), i.e. after its last `it` (snapshot l.1594–1602) and before its closing `  });`, so it can use `typeGain`, `gainOfSfx`, `CLIP_GAIN_LABEL`, `inputByTestId`. Suggested title: `'C-R36-01: a blur during another pointer gesture keeps the typed Clip Gain text (D-29z2)'`. The gesture is the detail separator, as in case 10: `fireEvent.pointerDown(view.getByTestId('arrangement-detail-separator'), { ...press, pointerId: 41, clientY: 400 })`, released with `windowPointer('pointerup', 41)`. The fixture SFX clip is `s1` (title `Hit`); the music clip is `m1`.

| # | Case | Asserts |
|---|---|---|
| N1 | `3` typed → gesture 41 → `fireEvent.blur(field)` → release → `field.focus()` + Enter | during the gesture: `field.value` `'3'`, status `GESTURE_EDIT_BLOCKED_MESSAGE`, `gainOfSfx` undefined, `undoLabel` null; after release: still `'3'`, no entry; after Enter: `gainOfSfx` 3, `undoChainLabels(api)` = `[CLIP_GAIN_LABEL]`, status `Clip Gain: Hit — +3.0 dB.`, field `'3.0'` |
| N2 | `3` typed → gesture 41 → `pointerDown` Master id 42 → `fireEvent.blur(field)` (the browser's native focus move; jsdom does not do it) → `pointerUp` Master 42 → release 41 → `field.focus()` + `fireEvent.blur(field)` | after the blur: field `'3'`, status blocked, the Master value and `undoLabel` unchanged; after release: `'3'`; after the final blur: `gainOfSfx` 3, `undoChainLabels` = `[CLIP_GAIN_LABEL]` |
| N3 | emptied `''` → gesture 41 → blur → release → `field.focus()` + Enter | during: field `''`, status blocked (the gesture check precedes the parse), no entry; after Enter: status = the invalid literal, field `'0.0'`, no entry |
| N4 | must-not: `3` typed → gesture 41 → Enter in the field | status blocked, field `'0.0'` (reset — Enter unchanged), no entry; release |
| N5 | must-not (limitation): `3` typed → gesture 41 → blur (`'3'` kept) → release → `selectClip('m1')` → `selectClip('s1')` | field `'0.0'`, `gainOfSfx` undefined, `undoLabel` null (D-29u selection rule) |

**Order:**
1. Verify that `ArrangementDetailPanel.tsx` is still `60d24bb0`.
2. Add the pins and the describe. No source change yet.
3. **Red run:** `npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx`. Expected: **3 failed | 68 passed (71)** — N1, N2 and N3 red (the field shows `0.0`); N4, N5, both pinned cases and every other existing test green. Paste the output. If the result differs, explain before you go on.
4. Apply §2.1. Re-run: **71/71**.

**Rules:**
- The other existing tests and helpers stay byte-identical; only the 3 added `expect` lines touch existing tests.
- **Expected counts:** fader-guards 71; full vitest **1264** (1259 + 5).

### 2.4 After the code

- **Self-check** (report each): the frozen `clip-gain.test.tsx` (including l.815–831), `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `gesture-guard.test.tsx`, `master-ui.test.tsx` are green; round-36 case 10 is green and byte-identical; the full `npx vitest run` passes.
- **Biome:** `npx biome check --write` **only** on your 2 TS files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (3 files changed). Report its findings and your dispositions.
- **Mutations:** only in a scratch copy outside `store/`, never in place. A may skip them; they are C's.
- **`/check`:** run `npm run verify`. `npm run test:e2e:smoke` starts its own dev server — do not run it; say so.
- One browser smoke check is allowed if the server is up (§5).

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1` plus the 9 lines, or root's newer commit that contains rounds 31–34 and 36.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | A | §2.1 only: the `commitClipGain` gesture branch |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | §2.3 only: 3 added `expect` lines in cases 7/8 + one nested `describe` (5 `it`) at the end of the round-36 describe |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | §2.2 only: one clause at l.436, the header status line, an append |
| `../tmp/studio-real-loop/a-round-37.md`, `a-round-37/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-37.md`, `c-round-37.json`, `c-round-37/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

`a-round-36/` and `c-round-36/` are read-only now.

**Expected `git status --short` at the end:**
- root has **not** committed: exactly **10** lines — the 9 baseline lines plus ` M app/components/arrangement/ArrangementDetailPanel.tsx` (tracked since `08b9e53`);
- root **has** committed all 9 files of rounds 31–36: exactly **3** lines (` M` for `ArrangementDetailPanel.tsx`, `fader-guards.test.tsx`, doc 036);
- any other root commit: record it and check every line against this section.

### 3.3 Frozen this round

- all **376** files in `b-round-36-tree-sha256.txt` (including `StudioWorkspace.tsx`), and everything else under `store/`;
- that includes `ArrangementContext.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementClip.tsx`, `ArrangementOverview.tsx`, `ArrangementVideoDock.tsx`, `studio-scrollbar.ts`, `clip-gain.test.tsx`, `master-ui.test.tsx`, `track-pan.test.tsx`;
- docs 001–035; every existing test except the 3 added lines.

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport:** 1440×900 with the detail panel expanded (a real click on `arrangement-detail-toggle`), plus one 1280×720 spot check in R37-PG.

**Harness rules (unchanged):** a "real click" is `$B click` at the element centre; keys are real `$B press`/`$B type`. Pointer events at computed coordinates, the separator gesture, window `pointerup`, drags and blur are synthetic — label them. C may hook browser APIs (fetch/XHR, `AudioParam.prototype.setTargetAtTime`), labelled. No source instrumentation. Mutations only in a scratch copy outside `store/`. **Every run and gate records `node.exe`.**

**Layout L37** = L36: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

Before and after every step record: the clip table `[id, track, start, duration, gainDb]`; `history.past.length` and the tail; the Clip Gain field text; the status line; the Master value; `document.activeElement`; `isPointerGestureActive` when readable.

**Checkpoint order if the session may end:** G37 → R37-PG → R37-S → R37-MN → R37-CR → R37-U → the rest. Write `c-round-37/checkpoint.md` as you go.

### 4.1 R37-PG — C-R36-01 (C's OT-5b harness)

Start every case: a real click on the SFX header; a real click into Clip Gain; Ctrl+A; real typing of `3` (no Enter); a **synthetic** `pointerdown` id 41 on `[data-testid="arrangement-detail-separator"]` (record `defaultPrevented` and that the gesture is active); a **real** click on `[aria-label="Master Volume"]`.

| Case | After the real Master click | After the synthetic window `pointerup` 41 | Then | Expected |
|---|---|---|---|---|
| PG-1 | field `3`, SFX no `gainDb`, status blocked, `past` unchanged, focus `Master Volume`; record the Master value | gesture false; field still `3`; no entry | a real click into Clip Gain, real Enter | +1 `Clip Gain`, SFX `gainDb 3`, status `Clip Gain: Soft impact — +3.0 dB.`, field `3.0`; then a real click on the ruler (focus BODY, record it) and one Ctrl+Z → `Undo: Clip Gain`, SFX back to no `gainDb` |
| PG-2 | as PG-1 | as PG-1 | a real click into Clip Gain, then a real click on the SFX header (round-34 blur) | +1 `Clip Gain`, SFX 3 |
| PG-3 (limitation) | as PG-1 | as PG-1 | a real click on the music header (selection change) | music selected, its field shows its own value, **0** `Clip Gain` entries, SFX no `gainDb` (D-29u selection rule). PASS = matches this row |
| PG-1280 | 1280×720, PG-1 once | | | as PG-1 |

Compare with the round-36 baseline (`c-round-36/runs/ot.txt` OT-5b: field `0.0`, value lost). **FAIL** = the field shows `0.0` after the Master click, or PG-1/PG-2 do not commit 3.

### 4.2 R37-MN — must-not (one run each)

| Case | Expected |
|---|---|
| Enter during a gesture: `3` typed, synthetic separator 41 held, real Enter in the field | status blocked, field reset to `0.0`, 0 entries (unchanged, frozen `clip-gain.test.tsx` l.815) |
| Unchanged `0.0` during a gesture → real Master click | no status from the field, 0 `Clip Gain` entries (early return) |
| Invalid `-` (or `1e`) during a gesture → real Master click | status blocked, the field keeps its displayed text (its `value` may read `""` for `-`, C round 36), 0 entries; after release + refocus + Enter → the invalid status, field `0.0`, 0 entries |
| Invalid `-` with **no** gesture → real Tab | the invalid status, field `0.0`, 0 entries (= round 36 OT) |

### 4.3 R37-CR — round-36 regression (no gesture)

- Clip Gain `3` → a real click on music Volume → SFX 3, tail `[…, Clip Gain, Volume]`, no blocked status; two Ctrl+Z restore both.
- Clip Gain `3` → a real click on Master → tail `[…, Clip Gain, Master Volume]`.
- R34-CG CG-1: Clip Gain `3` → a real click on the music header → +1 `Clip Gain`, focus BODY, Delete deletes.

### 4.4 R37-K — adjacent behaviour

- Clip Gain: Enter commits once (+1); Escape reverts (0 entries) and the following blur writes 0; the `0 dB` reset (+1); the 0 dB reset during a synthetic gesture is refused with status.
- A synthetic Volume drag with no field focused writes exactly one entry.

### 4.5 R37-S, R37-U, R37-Doc

**R37-S** (static, read-only): `diff -u` of `b-round-36-snapshots/` against the live files.
- `ArrangementDetailPanel.tsx`: exactly one hunk — the §2.1 branch (`setClipGainText(currentText);` wrapped in `if (trigger === 'enter') { … }`). Nothing else.
- `fader-guards.test.tsx`: the 3 added `expect` lines in cases 7/8 and one appended nested describe (5 `it`) before the round-36 describe's closing line; no `-` line anywhere.
- Doc 036: the header line, the l.436 clause, an append.
- `b-round-36-tree-sha256.txt`: 376 OK. No hardcoded colour, `any`/`@ts-ignore` or new `// comment`.

**R37-U:**
- The 5 new cases and the 2 pins exist and are green. A's red run on the snapshot source: **3 failed | 68 passed (71)**, failures exactly N1–N3.
- Mutations in a scratch copy outside `store/` (each must make a test fail; report how):
  - (a) restore the unconditional `setClipGainText(currentText);` → N1–N3 fail;
  - (b) invert to `if (trigger === 'blur')` → N1–N4 fail and the frozen `clip-gain.test.tsx` l.815 test fails;
  - (c) delete the `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);` line of the branch → N1–N4 fail (status). `clip-gain.test.tsx` l.815 may survive, because its reset click (l.822) sets the blocked status before the Enter — record it, it is not a B prediction;
  - (d) delete the whole gesture branch → N1–N3 fail (the context refuses, the trailing reset runs);
  - (e) change the `DETAIL_CLIP_GAIN_INVALID_MESSAGE` text → case 7 fails (the pin is live).

**R37-Doc:** the new section covers §2.2 and matches the code; the l.436 clause is accurate against `c-round-36/runs/ot.txt`.

### 4.6 Ableton source and compliance (workflow addendum 2026-10-11)

This is a bug round. **Source:** Ableton Live 12 Reference Manual §18.1 "The Live Mixer", captured as `b-round-29/ableton-mixing-20261012.txt` (gstack `/browse`, 2026-10-12). It describes the mixer controls and the double-click reset; it says nothing about a typed value-box value when focus is taken during another drag. No video. B browsed no new source; no Ableton claim is made.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A typed, uncommitted value-box value survives when another pointer takes focus during a drag | none captured | **Unconfirmed** | CZABA requirement: the text is not destroyed; commit after release by Enter/blur (D-29z2, D-29u spirit) | R37-PG |
| Enter during another drag is refused and reverts | none captured | **Unconfirmed** | CZABA contract since round 30 (gesture guard); unchanged | R37-MN |
| Pan/Volume reset by double-click | §18.1 | **Confirmed** | Stage 4b (round 38) | — |

C reports two separate verdicts per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.7 Gates

**G37-1:** tsc 0; vitest = **1264** (1259 + 5), 0 failures (record `node.exe`; a timeout under load → re-run that file alone and report both); build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218 + 1 info; green: `clip-gain.test.tsx`, `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `gesture-guard.test.tsx`, `delete-selection-ui.test.tsx`, `track-layout.test.tsx`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, `floating-video.test.tsx`, `fader-guards.test.tsx` (71).

**G37-2:** protected 4/4 OK; `sha256sum -c b-round-36-tree-sha256.txt` → 376 OK (or the documented CRLF exception); `git status --short` = §3.2 (10 or 3 lines); HEAD at start and end.

**G37-3:** anonymous `/studio-lab`, directly and via the header link: no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, no `Authorization` header from workspace code (during R37-PG); media only the 2 demo MP3s and `blob:`; anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, a fake Bearer gets no token; `/studio/middle-east` shows "Sign in required". Known and allowed: root `CartContext` `GET /api/cart`, root GA consent-denied events, the dev-module `GET /app/lib/r2.config.ts`, the homepage hero image from `images.unsplash.com`.

**Not re-run this round** (not PASS): exports, audio graph checks (R31-PE/PV/PL), R36-CL live audio (the commit path is the existing `setClipGain`), PUI geometry, video sync, C-R27-01 table, the full find sound → add → fit video → export flow and FB-01..FB-16 (stage regression).

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:** C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 (Tech Lead; record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 36: 2 at 28013/28014, 63 520 bytes); C-R30-01 (polish).

**Open low items:** R26-M1; stage 4b items (§0); R9-REVIEWER-M1-L8 (4c); A-R34-REVIEW-RESIDUALS; DEMO-SFX-FULL-SCALE; L3-REMOVED-TRACK-TAPS; LIB-SEP-REASON; DOC034-UNREACHABLE-NOTE; DOC035-NOTES; DOC015-DELETE-GAP-NOTE; EXPORT-DIALOG-FOCUS-RESTORE.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-36.md` §7): rounds 31–34 + 36 (9 lines) are C-verified and ready for root's checkpoint commit (root runs its own gates/review; commit before A starts round 37 or after C passes it); `npm run test:e2e:smoke` (it starts its own server, so only root runs it); the purchased loader hardcodes middle-east (SRW-21); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS (clamp stays; no limiter); CRLF Biome errors on the auth files; `frontend-architect.md` Write/Bash grant; the shared `Modal.tsx` focus gap; GA `scroll` with consent denied; the fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset; the dev server's availability.

**Tech Lead manual checks:** `feature-status.md` §5, including **R35-T** (now meaningful: real mouse, Clip Gain `3` → Volume/Pan/Master), R30-T, R31-T, R33-T, R34-T; optionally a real two-pointer test of C-R36-01 on a touch device after this round; TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-36-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/components/arrangement/ArrangementDetailPanel.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-36-snapshots/ArrangementDetailPanel.tsx app/components/arrangement/ArrangementDetailPanel.tsx
diff -u ../tmp/studio-real-loop/b-round-36-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
diff -u ../tmp/studio-real-loop/b-round-36-snapshots/036-studio-lab-track-pan.md docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If a test path above does not exist, report it and run the rest. Do not create other test files.

If the server is up, A may do one browser smoke check (`a-browse.json`): Clip Gain `3`, a synthetic separator `pointerdown` 41, a real click on Master → the field still shows `3`; window `pointerup` 41; click into the field + Enter → `+3.0 dB`. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G37-1/2, R37-S, R37-U, R37-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-37.md`:**
1. the pre-flight gate, including the §1.4 re-check;
2. the red run and the green run;
3. the diff summary per file;
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including `node.exe`;
6. deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a stop condition, stop and report; do not widen or narrow the change to avoid it.

**C → `c-round-37.md` and `c-round-37.json`** (the usual schema): per ID PASS, FAIL (with a bug ID) or **not run** (with the reason); the R37-PG and R37-MN tables with the field text, status, history tail and `activeElement`, side by side with `c-round-36/runs/ot.txt` OT-5b; the mutation table; the Ableton two-verdict table (§4.6); the gates; the C-R23-01 record; the carried items. `passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers; **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 38 — SRW-13 stage 4b** (fader UX for Volume, Master and Pan; must keep the round-36 root capture). B splits it: **4b-1** (round 38) the no-jump click + double-click reset (Live §18.1), with a fresh Ableton source table; **4b-2** (round 39+, at most three related bugs per round) FADER-KEY-ENTRIES, A-R29-REVIEW-1, the pending-commit order, the stale refusal status, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, MASTER-HOLD-TICK-EDGE.
- **Then:** stage 4c (round-9 M1/L8) and polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE, EXPORT-DIALOG-FOCUS-RESTORE, DOC015-DELETE-GAP-NOTE); SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10); SRW-17 (FB-12); SRW-18 (FB-06, including edge fades) → SRW-19 (FB-07); SRW-20; R26-M1 hardening; the SRW-21 adapter; the full regression and the root check; then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 37 -StartPhase A` and a higher limit.
