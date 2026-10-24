# A round 128 — VISUAL-A V-0.1 fix-up (C-R127-01 + C-R127-L1)

Implementer: A (Claude Opus 5.5) · 2026-10-24 · Task: `current-task.md` (round 128). No commit, push, stash, install, or dev-server action.

## Start state
- HEAD `608187fdf279d9b579c279f3c536b27be74c0eea`; `git status` 27 entries (24 ` M` + 3 `??`).
- `sha256sum -c --quiet b-round-127-r128-tree-sha256.txt` (from `store/`): OK.
- 10 grant start hashes: all OK. Start copies `b-round-127/r128-granted-start/`: all `cmp` identical.
- Baseline of the §4 list (25 files) before any edit: **15 failed / 300 passed**. The 15 failures are exactly the C-R127-01 set: HE1–HE7, MX1/MX5/MX6, XU3/XU5, NC3, VU4, and master-ui overload.

## Pre-edit grep (`app/**/__tests__/**`, `e2e/**`)
- `in this cycle`, `is created (`, `— No file was created`: only in `strings.ts` and `strings.test.ts`.
- `range ${`: only `strings.ts:87`. The other hits are unrelated `throw new Error(\`range ${selector} missing\`)` lines in fader tests.
- `'range `: `strings.test.ts` l.217/220/227. The other hits are Georgian `range ერთ კლიპზე…` or `'range inputs missing'`, all unrelated.
- `'Close'` / `"Close"`: `strings.ts`/`strings.test.ts` (W0), plus `export-cancel-ui` l.619/647, `export-dialog-tab-stops` l.183, `export-range-ui` l.492, `export-dialog-focus` l.213, `export-dialog-footer` l.151, `export-dialog-focus-restore` l.189, `e2e/accessibility.spec.ts` l.60/62 and `e2e/auth-modal.spec.ts` l.65. Every one of these means the **Modal ✕**, and none was changed. No test queries the footer as `'Close'`. This matches B's finding; no stop rule triggered.

## Changes per granted file (full diff: `a-round-128/granted.diff`)
- `strings.ts`: values only, no key or signature change.
  - W0 `closeButton` `Close`→`Done`.
  - W1 `videoRenderReason` `in this cycle`→`in this version`.
  - W2 `loopRangeNote`/`loopProjectNote` `is created (`→`is exported (`.
  - W3: `— No file was created`→`— no file was created` in exactly 8 keys: `exportCancelled`, `exportCancelledEncoder`, `emptyProjectNoFile`, `invalidRangeNoFile`, `encoderLoadFailed`, `exportFailed`, `mp3Failed`, `encoderLoadTimeout`. `videoDecodingNoFile` is unchanged.
  - W4 `exportedRange` `range ${start}`→`time selection ${start}`.
- `strings.test.ts`: the W0–W4 literals in EXPECTED_PLAIN_STRINGS, ST1 (`closeButton` → `Done`) and ST2 (loop notes, the 2 exportedRange cases, the 6 W3 formatter cases) follow the new text, still `toBe`. **Small extra:** the `mp3Done` sample input/expected at l.227–228 changed `range 00:04…`→`time selection 00:04…`, so the sample matches the real `exportedRange` output. ST1–ST5 structure and count (5) are unchanged.
- `export-dialog-hold-enter.test.tsx`:
  - The import gains `within`.
  - Titles: the describe title (`export dialog Close…`→`Done…`) and HE1–HE7 (footer `Close`→`Done`). "no close" and "closes the dialog" are verbs and stay.
  - **+HE8**, built with the existing helpers (`pendingRenders`, `mountHoldEnterDialog`, `clickExport`, `closeButton`, `cancelButton`, `settleRenders`) and one local closure inside the `it`. It checks both the idle and the WAV-render state:
    - `Close` occurs ×1, with `aria-label="Close"`;
    - the `studioExportStrings.closeButton` name occurs ×1 and is the same element as the `closeButton()` helper;
    - all names (`aria-label ?? trimmed textContent`) are unique, with the list printed on failure;
    - during the render, the footer is `:disabled` and the ✕ is not.
  - After the reviewer's note, the `cancelButton()` query moved below the render-state uniqueness check. That lets the `Set` check be proven red (m6b).
- Title-only files: every hunk is an `it(` title line. This was checked by diffing with all `it(`/`describe(` lines excluded: zero other lines.
  - `export-dialog-focus`: 4 titles (focus to Done, Enter on Done, returns it to Done, `… project scope → Done → Export WAV`).
  - `export-dialog-focus-restore`: FR1, FR3, FR4.
  - `export-toolbar-hold-enter`: TH1.
  - `export-dialog-footer`: FT1, FT3, FC3.
  - `export-cancel-ui`: CU1, CU9.
  - `export-cancel`: `exports the exact Georgian messages…`→`exports the exact messages…`.
  - X/✕ references to the Modal stay.
- Doc 104:
  - status → Completed (A's checks are green; the browser check belongs to C);
  - W3 glossary amendment and the `closeButton` key-name reason (13 files / 35 references);
  - W0–W4 map rows;
  - P1 rewritten as Problem → Solution with the B ruling and the rejected options;
  - round-128 file list, testing and TODO.

## Tests
- `it` counts before → after: strings 5→5, export-dialog-hold-enter **7→8**, export-dialog-focus 19→19, export-dialog-focus-restore 7→7, export-toolbar-hold-enter 5→5, export-dialog-footer 15→15, export-cancel-ui 12→12, export-cancel 19→19. Other files untouched.
- `npx vitest run` on these exact 25 files: `strings`, `export-cancel-ui`, `export-cancel`, `export-dialog-a11y-copy`, `export-dialog-focus-restore`, `export-dialog-focus`, `export-dialog-footer`, `export-dialog-hold-enter`, `export-dialog-tab-stops`, `export-mp3`, `export-progress-ui`, `export-progress`, `export-range-ui`, `export-toolbar-hold-enter`, `export-wav`, `master-ui`, `master`, `meter-ui`, `video-fades-ui`, `export-range`, `export-wav-in-place`, `mp3-encoder`, `graph`, `ArrangementContext`, `status-announcement-ui` (all under `app/lib/arrangement/__tests__/`).
  - Result: **25 files passed, 316 tests passed, 0 failed** (before: 15 failed / 300 passed / 315). The 15 round-127 P1 tests are green.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It reports 218 warnings and 1 info repo-wide; these were already there, and none is in the changed files.
- Read-only `npx biome check` on the 9 changed code files: clean, no fixes.
- Not run (gate's job): the full suite, `npm run verify`, build, e2e.

## Mutations (`strings.ts`, temporary shell `sed`; each restored from a backup and the sha256 checked)
- **m5** `closeButton`→`'Close'`: 17 red = the same 15 P1 tests + HE8 + ST1. Restore OK.
- **m6** `closeButton`→`'Export WAV'`: HE8 red in **idle** (`idle: expected 2 to be 1`, the footer-name count). HE1–HE6 are red too, because the helper finds multiple matches. Restore OK.
- **m6b** (extra, after the reviewer's Low) `busyButton`→`'Cancel'`: HE8 red at the general `Set` check: `rendering button names: ["Close","Cancel","Done","Cancel"]: expected 3 to be 4`. Restore OK.
- **m7a** W1 back to `in this cycle`: ST1 red. Restore OK.
- **m7b** W4 back to `range ${start}`: ST2 red. Restore OK.
- strings.ts sha256 after every restore: `ed9384b6…` (the edited state).

## Shell writes (all temporary)
- `sed -i` on `app/lib/arrangement/strings.ts` ×5 (m5, m6, m6b, m7a, m7b). Each was restored with `cp` from `/tmp/strings.r128.bak` and verified by sha256. The backup was then deleted.
- Report artifacts outside `store/`: `a-round-128/granted.diff`, `/tmp/r128files`, `/tmp/lint.txt`.
- Every lasting store edit used the Edit tool.

## Code review (actual `code-reviewer` subagent)
- Verdict 8.5/10, no Critical/High.
- **Medium:** the doc 104 status line was stale. **Fixed** (set to Completed with the reason).
- Lows:
  - (a) The `Set` check had never been shown red. **Addressed** with m6b and a reorder inside HE8.
  - (b) The name derivation is not a full accessible-name computation. It is exact for this dialog, because no button uses `aria-labelledby`/`title`. Left as is; the spec gave the formula.
  - (c) The helper error message `'Close is not a button'` at l.150 is a non-title line, so it was left (frozen by the rule).
  - (d) `invalidRangeNoFile` still says "range" while W4 says "time selection". This is outside W0–W4 and goes to B.
  - (e) "Done" reads slightly oddly before any export. B already ruled; noted for UX.
- **Architecture note (for B, not acted on):** keep `strings.ts` as a flat value module; this diff adds no structural signal. A cost signal: one label change forced about 20 title edits in 7 files, because the titles embed the visible word. If labels keep moving, the titles could name the role ("footer button") instead. `ARCH-R127-MODAL-CLOSE-LABEL` stays as already recorded.

## End state
- `git status`: the same 27 entries (24 ` M` + 3 `??`), no new path.
- Frozen list `sha256sum -c --quiet`: OK.
- Protected: `git diff 608187f` is empty for `studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts`, `AuthContext.tsx`, `account.downloads.tsx` and `download-routes.test.ts`. `Modal.tsx` is `741c2341`.
- End sha256 of the 10 grants:
  - `strings.ts` ed9384b68d0974540d04f3e0335240c8f8b7f2a4862611618a07e533996b87c0
  - `strings.test.ts` b06f0392b4c2b2b2ec4abf5e0c5289134a1d231a2ab7af1011c3c31dcad0d01f
  - `export-dialog-hold-enter.test.tsx` 78bb38afab88b1cc48ecefecadf210ad356420aadf59b8ce2ac67b307b48745c
  - `export-dialog-focus.test.tsx` f959cc52c08e850efadd11f3a51a920f009d537e60a48cd66871e93ab0159a2c
  - `export-dialog-focus-restore.test.tsx` 1f97e06dbf2716c68fb54d5f17c78bad0667061941ec73affe2e71dbe22f40d4
  - `export-toolbar-hold-enter.test.tsx` d37e72babee0414eb6a3c646f16b022e7fdbe7c5e3ccc934a4dad16372044986
  - `export-dialog-footer.test.tsx` 9f72f96ca843e62acb1329c1b353f6a78d87e1e9beb00c8a8538dfb73f845310
  - `export-cancel-ui.test.tsx` a366938bbcfc9a25f48425f2d78fd3c301e6d11be76ff0a1a2710b001d6f3130
  - `export-cancel.test.ts` 1ee515271924ef58b72a784124cbc99d88e47696aa420923ee0d99dcdec7ee45
  - doc 104 fa6da97541e2e6e95e1eed1c7a68c3048ed4f5a6c4bb9e2a1059124f9b431ca7

## Deviations (for B)
1. The `describe` title of `export-dialog-hold-enter` was also changed (`Close`→`Done`). The §2 rule covers it, because that title names the footer button as `Close`. It is just not in the enumerated HE list.
2. The `mp3Done` sample in ST2 (l.227–228) moved to the `time selection` shape. It is an input/expected literal of the W4 shape, not a key value.
3. Extra mutation m6b, plus moving one `cancelButton()` assertion inside HE8 below the render uniqueness check. This changes only the order inside the new `it`, and no assertion was removed.

## Scope status
- §2 file changes: done. §3.1 HE8: done. §3.2 m5–m7: done, plus m6b. §4 checks: done, and the reviewer was run with its Medium fixed.
- **Not verified by A:** any browser behaviour (EX-KEYS, EX-COPY, EX-LAYOUT, REG-WAV, G128-3, PX-NET). Those are C's rows. A did not use the browser this round.
- I do not mark the B acceptance criteria as passed; that is C's job (T128-TARGETED should reproduce 25 files / 316 passed).

## Next C checks (exact)
- T128-TARGETED: the 25-file list above → expect 25/25 files and 316/316 tests.
- SOURCE-SCOPE: 27 entries, frozen OK, protected unchanged, Modal `741c2341`.
- AN-REVIEW: diff against `b-round-127/r128-granted-start/` (also in `a-round-128/granted.diff`). Note the 3 deviations above.
- EX-KEYS (both viewports): `Close`=1, `Done`=1, no duplicate names, idle and rendering; `Done` disabled and ✕ enabled during the render.
- EX-COPY (a)–(e), EX-LAYOUT, REG-WAV, G128-3, PX-NET as in §5.
