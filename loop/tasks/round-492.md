# Round 492: B-R488-PASSWORD-MODAL-DIALOG. The Account "Change Password" window becomes a real modal dialog: named, focus moves in, Tab stays in, Esc closes, focus returns

**Planned by:** B, at the round 491 → 492 planning on 2026-11-13 (`b-round-491.md`, `b-round-491/checkpoint.md`).
- **Archive:** the round-491 task is copied byte-equal (`cmp`) to `tasks/round-491.md`. B's second copy is `b-round-491/current-task-before-492.md`.
- **Decisions:** D-29z1755 … D-29z1757 (`backlog.json`, `decisions_log_b`).

## Read first
- `lessons.md`, in full.
- This task.
- `b-round-491/sketch-review.md`: three `tech-lead` reviews and B's ruling on every finding.
- `b-round-491/claims-492.sh` and its two saved outputs.

Look up any other id with `python3 -I tools/find-ids.py "$(pwd -P)" <ID>`.

## Baseline: HEAD `e4e1d1c`, clean
- Gate 491 was published at `e4e1d1c` on both remotes [K1].
- Planning ran on the clean tree. `claims-492-planning-output.txt` is the start check.

## 0. Why this round
- **Bug gate.** Open Mediums are fixed first, so this round takes B-R488-PASSWORD-MODAL-DIALOG, as scheduled in D-29z1754.
- **No REGRESSION is due.** The last one was 2026-11-13; the next is due on or after 2026-11-16. RETRO comes at round 495.
- **HEAD bug, measured by B** on a production build of `e4e1d1c`, at 1440×900, 1280×720 and 375×812 [K11], with the signed-in stub. Both `/api/downloads` and `/api/auth/login` are stubbed.
  - The page has no `role="dialog"` [K4] and no `aria-modal`.
  - After opening, focus stays on the trigger.
  - Esc does not close the window.
  - Cancel drops focus to `<body>`.
  - The three password fields have no accessible name (bare `<label>` with no `htmlFor`) [K4].
  - The three eye buttons have an empty name.
  - The error text is not announced.
- **Three Mediums share one owner** (≤ 3 tightly related bugs):
  - B-R488-PASSWORD-MODAL-DIALOG;
  - B-R492-PASSWORD-FIELDS-UNNAMED (WCAG 1.3.1 / 4.1.2; L14: empty duplicate button names in a dialog we touch);
  - B-R492-PASSWORD-ERROR-NOT-ANNOUNCED (WCAG 4.1.3).
- **Also closes A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW** (Low, its recorded home): focus now returns to the trigger at close.
- **Found by B and out of scope:** B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High, root).
  - `app/lib/auth.ts` `updatePassword` checks the current password through login.
  - It then always throws "Password change is not yet implemented. Please use the forgot password feature." [K19].
  - A real password change therefore never succeeds. The fix needs a backend endpoint and a change to the protected `auth.ts`, so it goes to root and Saba. This round makes the error path accessible. The success path is jsdom-only (PD6, PD7).

## Rulings on round 491 findings (L7, L10)
- **C round 491 PASS** (`browserVerified` true, 0 bugs), and gate 491 published `e4e1d1c`. B-R487-PROFILE-EDITOR-NARROW-OVERFLOW is **done** for the client path (D-29z1755).
- **A's reviewer notes:**
  - A-R491-REVIEW-PWMODAL-WORDING (Low) is closed by this sketch: the doc 317 TODO line is rewritten.
  - A-R491-REVIEW-420-WORDING, -PS-LABELS and -RESOLVED-IN-TODO are info and go to `deferred_low_polish`.
  - The Architecture note is "keep". It is recorded as `confirmedBy` on SIG-R487-PROFILE-NAME-EDITOR-EXTRACT.
- **Gate 491 reviewer:**
  - "No focus-visible on ✓/✕" came from a code-only read. C's evidence contradicts it: C8 `tree-ring-320x640` shows the global `:focus-visible` ring on ✕, unclipped, and C6 records `kbSave`/`kbCancel` with `focusVisible` true. Ruled **not a bug** (GATE491-I1, closed).
  - The 32 px target passes WCAG 2.5.8 AA. This is info, as A's reviewer said.
  - "94 px input at 320" → `confirmedBy` on TLM-R491-PHONE-NAME-EDITOR.
  - "No automated guard" → `confirmedBy` on B-R491-NARROW-EDITOR-E2E-GUARD.
- **C info** C-R491-INFO-STUDIO-ROWS-SMOKE-ONLY: noted. Studio audio and export were outside round 491.

## Reference: how established practice does it
Source: WAI-ARIA APG, Dialog (Modal) pattern, https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (fetched 2026-11-13). Store page, so there is no Ableton claim. The in-repo precedent is the LeadMagnet dialog ruling R109 (`leadmagnet_dialog_rulings_d29z170`): role, labelled, initial focus, Esc ignored while `isComposing`, Tab containment, focus restore.

| APG point | CZABA after this round | C row |
|---|---|---|
| Container `role="dialog"`, `aria-modal="true"`, `aria-labelledby` the visible title | yes: title "Change Password" [K4] | PD1; C5 P1 |
| On open, focus moves into the dialog, generally the first focusable | Current Password field | PD1; C5 P2, P7 |
| Tab / Shift+Tab move inside and wrap | yes; also from `<body>` or from a control that became disabled | PD8, PD9, PD11, PD15; C5 P5, P10 |
| Escape closes | yes; ignored while an IME composition ends (`isComposing`) | PD4, PD13; C5 P6 |
| On close, focus returns to the invoking element | trigger "Click to change password", for Cancel, Esc, backdrop and success | PD4–PD6; C5 P6, P8, P9 |
| Content outside is inert | pointer: the backdrop covers the header and page (C5 P4); keyboard: the Tab trap | C5 P4, P5 |

**Deviations (with reasons):**
- **Mouse-opened dialog: no ring on the first field.** The site-wide focus rule (Saba, SABA-B-4) hides rings after a pointer press: `html[data-focus-source="pointer"] :focus-visible { outline: none }` [K19]. The caret still shows focus. A keyboard-opened dialog shows the ring (C5 P7). Recorded, not a STOP.
- **No scroll lock and no `inert` on the background while open.** APG asks for neither. The backdrop blocks the pointer and the trap blocks the keyboard. The shared protected `Modal.tsx` is not used, because it would change the backdrop (`bg-black/95`, `z-[1000]`, portal), and it also lacks initial focus, the trap and focus return (shared-modal-no-focus-management, root) [K20].
- **No extraction.** ARCH-CHECKPOINT-ACCOUNT-PROFILE has no root answer, so the request is re-sent (`b-round-491/checkpoint-request-account-492.md`) and does not block.

**product-designer:** not consulted. There is no new element, no copy change and no layout change. At rest the open dialog is pixel-equal to HEAD at all three viewports (`b-round-491/probe/open-pxdiff.txt`: 0 px) [K12]. **Screen budget:** no persistent element is added.

## 1. What changes (sketch `b-round-491/sketch-492.patch.txt`, sha256 in `b-round-491/sketch-492.sha256`)
Six paths. A applies the sketch byte-equal and changes no sketch line.
1. `app/routes/account.tsx`:
   - `PasswordModal`:
     - `useIsPresent()`;
     - an `[isPresent]` effect: `inert = !isPresent`, and focus on Current Password when present;
     - a document `keydown` effect, active only while present: Esc (not composing) → `onClose`, and the Tab trap over enabled `input, button`;
     - `role="dialog"`, `aria-modal`, `aria-labelledby`;
     - `htmlFor`/`id` on the three labels;
     - eye-button `aria-label`s ("Show/Hide current password", "Show/Hide new password", "Show/Hide password confirmation");
     - `role="alert"` on the error box;
     - `data-testid="password-dialog-backdrop"`.
   - `ProfileContent`:
     - `passwordTriggerRef` and `type="button"` on the trigger;
     - `closePasswordModal` returns early when already closed, otherwise closes and focuses the trigger [K4].
2. `app/lib/__tests__/account-password-dialog.test.tsx` (new): PD1–PD15.
3. `app/lib/__tests__/account-profile-name.test.tsx`: PN10f and PN10g.
   - New contract: after the open click, focus is on Current Password.
   - Then a `blur()` (focus on `<body>`, as a click on the dialog heading does in Chromium, C5 P10). The old body asserts follow, unchanged.
   - No assertion is lost: the body asserts stay and one stronger assert is added. Mutant MK (the ref guard removed) is red only through these rows.
4. `docs/implementation/2026/quarter-IV/318-password-dialog-semantics.md` (new). l.4 is `**სტატუსი:** Completed (C round 492 PASS)` (L28) [K10].
5. `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`, three lines:
   - the ref rationale;
   - PN10f/PN10g;
   - the B-R488 TODO, now marked fixed [K10].
6. `docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`: the B-R488 TODO line [K10].

**Ruling lines (L4):**
- PN10f/PN10g's "focus on `<body>` right after opening": the new dialog contract wins. The body asserts stay after the explicit blur.
- Reopen during the fade keeps the typed values: the deferred Low TL-R492-V2-L1 wins over "fresh dialog". This is the same as at HEAD.

**Sweep (L23):**
- The added testid `password-dialog-backdrop` is pinned only by the new test [K6].
- Tests that use the dialog's names are listed by K6.
- Tests that read `account.tsx`: at HEAD `account-profile-name.test.tsx`, `store-focus-ring.test.ts`, `store-theme-tokens.test.ts`; the sketch adds the new `account-password-dialog.test.tsx` [K6]. All of them are in the covering set.
- Biome on `account.tsx`: 0 warnings on the sketch (HEAD had 4 a11y warnings, all fixed here) [K9].

**L50 focus origins.**
- The grep: `grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' app/routes/account.tsx`. It gives 18 hits at HEAD and 22 on the sketch [K18].
- Rulings:

| Hits (sketch line numbers, K18 `lines=`) [K18] | Ruling |
|---|---|
| l.48, 65, 82, 100 (account nav and layout) | Out of scope, unchanged |
| l.135, 140, 188, 202, 233, 283 (name editor) | PN1–PN10h unchanged |
| l.155 (trigger focus at close) | PD4–PD7, P6/P8/P9 |
| l.295 (`canChangePassword` trigger) | Static per user |
| l.308 (dialog unmount) | Target = trigger: PD4–PD6 |
| l.349 (initial focus) | PD1, PD14, P2/P7/P18 |
| l.383 / 386 (trap wrap) | PD8, PD9, PD15 |
| l.475, 500, 526 (eye icon swap; the button stays mounted) | PD3 |
| l.530, 532 (match indicator, not focusable) | No row |
| l.548 (alert render) | PD12, P15 |

**Pre-checks B ran on the sketch-applied scratch:**
- typecheck: rc 0 [K9];
- covering: 6 files / 97 tests [K7];
- full suite: 294 files / 4309 tests, rc 0 [K8];
- 20 jsdom mutants, all red [K13].

## 2. A: grants, forbidden, checks
- **Granted paths (only these):** the 6 paths of §1, changed only by the sketch. A changes no sketch line.
- **Forbidden:**
  - every other path;
  - `global_forbidden_files`, including `app/root.tsx`, `app/styles/**`, `app/contexts/AuthContext.tsx`, `app/lib/auth*`, and the shared `app/components/ui/Modal.tsx`;
  - the protected purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`) [K3];
  - `global_forbidden_actions`: commit, push, stash, checkout, reset, deploy, and restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10).** STOP and report, editing nothing, if:
  - the start check differs (except K14 if root rewrote the task);
  - `git apply` fails, or K5 is not `======`;
  - a covering test fails or exceeds 50 % of its timeout;
  - a Medium+ finding from your code-reviewer is not ruled in this task or in `b-round-491/sketch-review.md`;
  - a doc 318, 315 or 317 line is false at hand-over;
  - a path outside the grants would need to change.
- **Already ruled, not a STOP, whatever severity your reviewer gives them:**
  - TL-R492-L2: a late success from an earlier open closes the next one; unreachable today;
  - TL-R492-L4: Ctrl+K palette over the dialog, pre-existing;
  - TL-R492-V2-L1: reopen during the fade keeps values;
  - TL-R492-V3-N1/N2;
  - no ring after a mouse open (SABA-B-4 rule);
  - no scroll lock;
  - shared `Modal` not used;
  - no extraction (checkpoint pending);
  - `inert` read as a jsdom property (PD10/PD14); the behaviour proof is browser rows P11, P12 and P18;
  - doc l.4 written before C (L28).
- **A runs:**
  - the start check: `bash ../tmp/studio-real-loop/b-round-491/claims-492.sh`, which must equal `claims-492-planning-output.txt`;
  - `git apply ../tmp/studio-real-loop/b-round-491/sketch-492.patch.txt`;
  - the claims script again, which must equal `claims-492-sketch-output.txt`;
  - `npm run typecheck`, `npm run lint`, and `npx biome check app/routes/account.tsx` (expected: 0 warnings) [K9];
  - `npx vitest run app/lib/__tests__/account-password-dialog.test.tsx app/lib/__tests__/account-profile-name.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-internal-links.test.ts app/lib/arrangement/__tests__/held-enter-source-scan.test.ts` (expected: 6 files / 97 tests) [K7];
  - the code-reviewer on the changed files (6 paths, 3+ files).
- **A does not run** the full suite, the build or browser probes. B ran the full suite on the sketch [K8], and the gate runs it again.
- **Report in `a-round-492.md`:**
  - the start HEAD and `git status`;
  - the start check;
  - the `git apply` output and K5;
  - the commands with their pass counts;
  - the reviewer findings, each mapped to a ruling id or a STOP;
  - the Architecture note.

## 3. C: rows
**Setup.** Production builds. L38: probes run alone, after one untimed warm-up load of `/account`.
- **Tree server:** `bash b-round-491/probe/serve-prod.sh start <abs c-round-492>/tree 5193 TREE > <abs c-round-492>/serve-start.log 2>&1`. SRC unset means the store tree. Use a free port.
- **HEAD control:** B's `b-round-491/probe/headprod-pw.json`, a production build of `e4e1d1c`. C may rebuild it with `serve-prod.sh start <abs>/head 5194 e4e1d1c`.
- **Environment facts:**
  - `pw-492.mjs` stubs `/api/downloads` with 200 `[]` (HF-MOCKAPI-DOWNLOADS-401-SIGNOUT), `/api/auth/profile`, and `/api/auth/login` (200 after 1.5 s).
  - A signed-out page is environment-invalid, not a FAIL.
  - Stubbed rows prove the client path only (L36).

| Row | What | Pass when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --porcelain --untracked-files=all`; K3 | Exactly these 6 paths: ` M` `account.tsx`, ` M` `account-profile-name.test.tsx`, ` M` docs 315 and 317, `??` `account-password-dialog.test.tsx`, `??` doc 318. K3 reads `0 … 0 … 0` |
| C2 CLAIMS | `bash b-round-491/claims-492.sh`, at start and at end; L29's grep over this task | Every line equals `b-round-491/claims-492-sketch-output.txt`. K14 may differ only if root rewrote this task. Stderr empty |
| C3 APPLY | K5 | `======`, and the patch sha equals `recorded` |
| C4 COVERING | A's covering command | 6 files / 97 tests green |
| C5 DIALOG (browser) | `node b-round-491/probe/pw-492.mjs http://127.0.0.1:5193 <abs out>/tree-pw.json <abs out>/shots tree`, then `python3 -I b-round-491/probe/pw-check.py <abs out>/tree-pw.json` | rc 0 and the last line `PW-CHECK PASS`: 18 rows × 1440×900, 1280×720 and 375×812. B's sketch run: `b-round-491/probe/pw-check-sketch.txt`. HEAD: `pw-check-head.txt`, 48 RED, with only P4 and P17 passing [K11, K12]. Rows: P1 semantics; P2 mouse-open focus; P3 names; P4 pointer outside hits the backdrop; P5 Tab trap (8 Tabs, wrap, Shift+Tab); P6 Esc returns focus to the trigger with a ring; P7 keyboard open with the ring `solid`; P8 mouse Cancel; P9 backdrop; P10 heading click → `<body>` → Tab enters; P11 Esc during a pending submit plus `inert`; P12 Tab in the exit window equals the no-dialog control R0; P13 late settle steals nothing; P14 double Esc; P15 error in `role="alert"`; P16 name save during the dialog steals nothing; P17 no console errors; P18 reopen during the fade |
| C6 MUTANTS | jsdom, on a **copy** of the tree, never the store tree (L60): `rsync -a --exclude node_modules --exclude build --exclude .git <store>/ <abs c-round-492>/mut-tree/ && ln -s <store>/node_modules <abs c-round-492>/mut-tree/node_modules`, then `python3 -I b-round-491/mutants/run-mutants.py <abs c-round-492>/mut-tree <abs c-round-492>/mutants` | `M0` 33 passed; MA … MT: 20 RED, 0 SURVIVED, 0 NOT-APPLIED, as in `b-round-491/mutants/mutants-summary.txt` [K13]. Browser mutant (B only): `b-round-491/probe/pw-check-mutO.txt`, with `inert` removed: P11, P12 and P13 RED at all three viewports |
| C7 VISUAL | Screenshots from C5 (`tree-open-*`, `tree-error-*`), plus one keyboard-opened crop of the Current Password field per viewport | Open-dialog screenshots look like HEAD's (B: 0 px difference, `b-round-491/probe/open-pxdiff.txt`). The keyboard-open crop shows the brass ring on the field. The error screenshot shows the error box |
| C8 AUTH + STUDIO | Fresh context, no credentials, at 1440×900 and 1280×720 | `/account` shows "Sign in required" and no "Change Password". `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`. `/studio-lab` opens anonymously (`auth_user` null) and shows `Demo collection ready`. Enter on a library item adds 1 clip. Space → `Playing`, with the clock above `00:00.000` about 1.5 s later (record the value). Space → `Stopped`. One screenshot per step |
| C9 DOC | Docs 318, 315 and 317 | Doc 318 l.4 byte-exact `**სტატუსი:** Completed (C round 492 PASS)`. Its `## ` headings equal TEMPLATE's 7, in order (L26). `C round N pending` count 0 (K10). Every PD id doc 318 names exists in the test file (`grep -c "it('PD<n> "`). "20" mutants matches `mutants-summary.txt`. Docs 315 and 317 hold the K10 lines |
| C10 L57 | `python3 -I tools/l57-check.py c-round-492.json c-round-492/l57-check.txt` | rc 0. All L57 fields are written. `mutantRedOnSketch` = `b-round-491/mutants/mutants-summary.txt` and `b-round-491/probe/pw-check-mutO.txt` |
| OWN-BACKEND | A real password change against the .NET backend | BLOCKED: backend unavailable in cloud. Also, `updatePassword` always throws (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED). Not in `passed` |
| gate | Full vitest, typecheck, build, Biome, `npm run verify` | Root gate only; never in `passed` |

- **L22:** if A STOPs with no diff, C runs only C1, C2 and C8 and reports "STOPPED — routed to B".
- **Manual row (does not block; deadline RETRO 510, L46):** TLM-R492-SR-PASSWORD-DIALOG, with NVDA or VoiceOver plus real WebKit and Firefox. Checks:
  - the dialog is announced as "Change Password, dialog";
  - the fields read their labels;
  - the eye buttons read Show/Hide;
  - the error is announced;
  - Esc and Tab behave as in C5.

## 4. Sketch review and mutants (L58)
- `b-round-491/sketch-review.md` names the dispatched sha256 (v3) and the history: v1 got CHANGES REQUIRED, v2 got APPROVE WITH LOWS, v3 (docs only) got APPROVE [K14].
  - Every finding is ruled there.
  - The Medium TL-R492-M1 (reopen during the fade) was fixed in v2. Its rows are PD14 and P18.
  - The file also holds the ordering matrix.
- **Mutants:**
  - 20 jsdom mutants on the sketch, all red (`b-round-491/mutants/mutants-summary.txt`).
  - 1 browser mutant, a production build with `inert` removed: `pw-check-mutO.txt` is RED on P11, P12 and P13.
  - HEAD is the pre-fix control: `pw-check-head.txt`, RED 48.

## 5. Outcome fixed in advance
- **C PASS with `browserVerified` true:**
  - B-R488-PASSWORD-MODAL-DIALOG, B-R492-PASSWORD-FIELDS-UNNAMED and B-R492-PASSWORD-ERROR-NOT-ANNOUNCED become done for the client path.
  - A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW and A-R491-REVIEW-PWMODAL-WORDING close.
  - OWN-BACKEND and B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED stay open (root).
- **Next:** DPG-BUTTON-CLEANUP (DPG-FIX P1). If planning happens on or after 2026-11-16, a REGRESSION round comes first. RETRO is at round 495.
- **FAIL:** a fix-up comes first.
- **PARTIAL (time):** the same round resumes from `c-round-492/progress.json`.
