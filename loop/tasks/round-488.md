# Round 488: B-R486-PROFILE-NAME-KEYBOARD fix-up. A save that settles must not take focus away from where the user moved it (C-R487-01)

**Planned by:** B, at the round 487 → 488 planning on 2026-11-13 (`b-round-487.md`, `b-round-487/checkpoint.md`).
- **Archive:** the round-487 task is archived as `tasks/round-487.md`, copied byte-equal (`cmp`) before this task was written. K13 compares it with B's second copy `b-round-487/current-task-before-488.md`.
- **Advisor:** see `b-round-487.md`.
- **Decisions:** D-29z1738 … D-29z1740 (`backlog.json`, `decisions_log_b`).

## Read first
- **`lessons.md` in full.** Directly relevant: L10 (one STOP threshold), L11, L22 (STOP with a diff), L23, L28 (doc l.4), L36 (stubbed rows prove the client path only), L38, L47 (focus targets named; BODY is never an expected value), L50, L52, L56/L58 (claims, sketch, mutants, review), L57.
- **Claims:** `bash b-round-487/claims-488.sh` (`ROOT=` and `LOOP=` can be overridden).
  - `b-round-487/claims-488-planning-output.txt` is the script's output on the store tree at planning. **A** runs it before applying: it must be equal (A's start check).
  - `b-round-487/claims-488-sketch-output.txt` is its output on B's sketch-applied scratch (`ROOT=/tmp/b488-scratch`, with the round-487 doc 315). **C** only ever sees the sketch-applied tree. The scratch is a separate git checkout, so its K1–K5 lines are artifacts and are never compared. C's rule: K1–K4 equal the **planning** output (`bb82154`, the same 3 status lines, rc 0, rc 0); K5 shows `differs` for the 3 files (A applied the sketch and edited doc 315); K6–K8, K10–K15 and K17 equal the **sketch** output; K9 shows the new l.4; K16 may differ only if root rewrote the gate file.

## Baseline: HEAD `bb82154` + the round-487 working tree (not clean)
- `gates/gate-round-487.json` is `skipped` (C FAIL); nothing was published. The baseline is HEAD `bb82154` [K1] **plus** A's round-487 uncommitted tree [K2]:
  - ` M app/routes/account.tsx`, `?? app/lib/__tests__/account-profile-name.test.tsx`, `?? docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`;
  - their sha256 are pinned in `b-round-487/a-tree-start.sha256` (K5 `equal`); the 2 code files equal `b-round-486/sketch-487/` (C round 487 C-APPLY).
  - Every other tracked file equals the round-487 frozen manifest (K3 rc 0); protected files rc 0 [K4].
- Do **not** revert or re-apply the round-487 sketch. This round applies only the delta below on top of it. A root-only commit after planning that leaves `git diff bb82154 HEAD -- app` empty is accepted with a note. Anything else is "STOP — baseline differs".

## 0. Why this round
- **C-R487-01 (Medium, = A-R487-REVIEW-FOCUS-STEAL; origin: A's code-reviewer, reproduced by A and C).** Round 487 added two focus moves when a name save settles: success → name button (via `restoreNameFocusRef` and the `isEditingName` effect), API failure → First name. Both run unconditionally. "Click to change password" stays enabled during the save [K17], so a user can open the password modal while the PUT runs; when the PUT settles, focus is pulled behind the open modal.
- **Safari/Firefox-mac mouse model (tech-lead, v1 review):** there a mouse click does not focus a button, so `activeElement` stays `<body>` after the click on the password link. A body-only guard would still steal. B emulated it in Chromium (`element.click()` without focus, scenario `click-password-nofocus`): round-487 tree → name button / First name behind the modal (`probe/r487tree-v2-inflight.json`).
- **B reproduced the whole matrix in Chromium on the round-487 tree** (`b-round-487/probe/inflight-488-v2.mjs` → `probe/r487tree-v2-inflight.json`; v1 of the probe without the no-focus scenario: `probe/r487tree-inflight.json`; PUT delayed 1500 ms, 200 and 500; 1440×900 and 1280×720; 1 PUT in every run):
  - click-password: modal open; final focus = name button (200) / First name (500). **Bug.**
  - tab-away (Enter-save, then Tab ×2 to "Click to change password"): final focus = name button / First name. **Bug** (same cause, keyboard path).
  - stay-enter and stay-mouse (user does nothing): name button / First name. Correct, must stay.
  - orders-tab (user leaves the page): `BODY`, on `/account/orders`. Unchanged; the client-nav focus contract belongs to round 485.
- By the 2026-10-23 bug gate a Medium caused by the current round blocks it. The round-487 rows that passed stay passed; this round adds the fix and its rows. The item cannot be done until this passes (C-R487-01 open).
- **Task-text conflict A reported (L11) — resolved here:** round 487 §1/C-APPLY let A change a sketch line for an unruled reviewer Medium while §2 said STOP. A followed §2, which was correct. From this round on, §2 below is the only rule: A never changes a sketch line; any unruled Medium+ is a STOP.
- **Order after this round (D-29z1740):** 489 = SABA-B-17-ENTRANCE-3-4S, 490 = B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, 491 = B-R488-PASSWORD-MODAL-DIALOG (new Medium, §4), then DPG-BUTTON-CLEANUP. None of these is in this round (L10). If planning happens on or after 2026-11-16, the REGRESSION round comes first.

## Reference
| Point | Reference (source) | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|
| Do not move focus the user did not ask for | WCAG 2.2 SC 3.2.1 On Focus / 3.2.2 On Input (https://www.w3.org/TR/WCAG22/#on-focus and #on-input; cited from the standard, not re-fetched this round): a change of context is not initiated without the user's request; B applies the same principle to focus moved by an async completion (an inference, not a quoted rule) | an async completion is not a user request | on settle, focus moves only while the editor still "owns" focus: the password dialog is not open, and `activeElement` is null, `<body>`, or inside the editor row | PN10, PN10b, PN10e, PN10f, PN10g, IF-PASSWORD, IF-PASSWORD-NOFOCUS, IF-TABAWAY |
| Return focus after the editor closes | WAI-ARIA APG Dialog pattern, focus return (as in round 487) | return to the invoker | kept for the unowned cases: Enter-save, ✓-click save (✓ is disabled while saving, so focus is on `<body>`), Esc during a save | PN4, PN9, PN10c, PN10d, IF-STAY |

No Ableton parity claim (Store account page). `product-designer` is not consulted: Medium bug fix with no visible change.

## 1. What changes (sketch `b-round-487/sketch-488.patch.txt`, sha256 in `b-round-487/sketch-488.sha256`)
A applies it from `store/` with `git apply ../tmp/studio-real-loop/b-round-487/sketch-488.patch.txt` on top of the round-487 tree. The result must be byte-equal to `b-round-487/sketch-488/` (K12 `2 of 2`).
1. **`app/routes/account.tsx` (`ProfileContent`):**
   - `nameEditorRef = useRef<HTMLDivElement>(null)` on the editor row `<div className="flex items-center gap-3">`.
   - `passwordModalOpenRef = useRef(false)`; `openPasswordModal()` sets it to true then `setIsPasswordModalOpen(true)`; `closePasswordModal()` sets it to false then `setIsPasswordModalOpen(false)`. The link uses `onClick={openPasswordModal}`, the modal `onClose={closePasswordModal}` (every close path — submit success, backdrop, Cancel — goes through `onClose`). A ref, not the state: a running `handleNameSave` would read a stale `isPasswordModalOpen`.
   - `isNameEditorFocusUnclaimed()`: false while `passwordModalOpenRef.current`; otherwise true when `document.activeElement` is null or `document.body`, or is inside the editor row.
   - Success: `restoreNameFocusRef.current = isNameEditorFocusUnclaimed();` (was `true`). Failure: `nameInputRef.current?.focus()` only when the guard is true.
   - `handleNameSave();` in the keydown handler becomes `void handleNameSave();` (reviewer Low, explicit fire-and-forget).
   - Unchanged: open → First name, Esc/Cancel → name button, validation failure → First name (synchronous, the user is in the editor), the in-flight ref, held-Enter guards, labels, classes.
2. **`app/lib/__tests__/account-profile-name.test.tsx`:** adds PN10 (success, focus moved to the password link → stays), PN10b (failure, same → stays, editor open, ✓ re-enabled), PN10c (✓-click save with focus on `<body>` → name button), PN10d (same, failure → First name), PN10e (focus on the Orders tab link during the save → stays), PN10f/PN10g (an unfocused click opens the password dialog during a ✓ save; success/failure → focus stays `<body>`, not the name button / First name), PN10h (after the dialog is cancelled, a later Enter-save returns focus to the name button). PN1–PN9 unchanged.

## 2. A: grants, forbidden, checks
- **Granted paths (only these):**
  - the 2 sketch files (§1);
  - `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md` (existing, A's round-487 doc). Changes:
    - l.4 becomes exactly `**სტატუსი:** Completed (C round 488 PASS)` (L28);
    - the focus-target table gets a row "save settles after the user moved focus elsewhere or opened the password dialog → focus is not moved" and the rule (dialog closed, and null/body/inside the editor row), with the reason the dialog uses a ref (Safari/Firefox-mac mouse clicks do not focus buttons);
    - a "პრობლემები და გადაწყვეტები" entry for C-R487-01 (Problem → Solution);
    - the cited rows include PN10, PN10b–PN10h and §3's new rows (IF-*); TODOs for B-R488-PASSWORD-MODAL-DIALOG and B-R488-SAFARI-MENU-SETTLE-FOCUS; all other content stays.
- **Forbidden:** `global_forbidden_files` (including `app/root.tsx`, `app/styles/**`, `app/contexts/AuthContext.tsx`, `app/lib/auth*`) and `global_forbidden_actions`; the protected files; `app/components/arrangement/**`; `RequireAuth.tsx`; `app/services/**`; the `PasswordModal` component body (`function PasswordModal` and below; its dialog semantics are B-R488-PASSWORD-MODAL-DIALOG, a later round). The password link's `onClick` and the modal's `onClose` at the call site in `ProfileContent` change only as the sketch says; commit, push, stash, checkout, reset, deploy; restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10):** STOP and report, without editing any sketch line, if:
  - `git apply` fails or K12 is not `2 of 2`;
  - a Medium+ finding (your code-reviewer, or a failing covering test) is not ruled in §4;
  - any path outside the grants would need to change.
- **A runs:**
  - `npm run typecheck`; `npm run lint`;
  - `npx biome check 'app/routes/account.tsx' 'app/lib/__tests__/account-profile-name.test.tsx'`: expected 4 warnings, all pre-existing (3 × `noLabelWithoutControl` in PasswordModal, 1 × `useButtonType` on the password link) [K8, `b-round-487/sketch-488-biome.log`];
  - `npx vitest run app/lib/__tests__/account-profile-name.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-internal-links.test.ts app/lib/arrangement/__tests__/held-enter-source-scan.test.ts`. B's sketch run: 5 files, 82 tests passed (`b-round-487/sketch-488-covering.log`);
  - the code-reviewer (3 files).
- **A does not run** the full suite (B ran it on the v3 sketch: `b-round-487/precheck-full-488.log`; the gate runs it again).
- **A's start check:** `bash ../tmp/studio-real-loop/b-round-487/claims-488.sh` equals `claims-488-planning-output.txt` (K14/K16 may differ only if root rewrote the gate file or B's task).
- **Report in `a-round-488.md`:** start HEAD and `git status`; the start-check result; `git apply` output; `cmp` of both files against `b-round-487/sketch-488/`; commands with pass counts; reviewer findings and Architecture note.

## 3. C: rows (1440×900 and 1280×720)
- **Probes:**
  - `node b-round-487/probe/inflight-488-v2.mjs <base> <out.json>`: signed-in stub, LeadMagnet seeded dismissed; `PUT /api/auth/profile` delayed 1500 ms and counted, 200 or 500; scenarios `stay-enter`, `stay-mouse`, `click-password`, `click-password-nofocus` (`element.click()` without focus: the Safari/Firefox-mac mouse model, **emulated in Chromium, not a Safari check**), `tab-away`, `orders-tab`. Each value is `TAG|aria-label|text|fv=`. B's evidence: round-487 tree `probe/r487tree-v2-inflight.json`; sketch v2 `probe/sketch-v2-inflight.json` (scratch at port 5188, own Vite cache; v3 changes only the test file, so the app code is the same). The scratch's `app/` equals the store's except the 2 sketch files (`probe/v3/scratch-app-diff.txt`).
  - `node b-round-487/probe/overlays-488.mjs <base> <out.json>`: unfocused click on each header button during a ✓ save, and Tab/Esc on the password modal (`probe/overlays-sketch.json`).
  - Also replay A/C's `c-round-487/focus-steal-replay.mjs`.
- **Before any row:** warm `/account` once (L38). A run with a Vite `optimized dependencies changed` reload is environment-invalid (the probe sets `envInvalid`); replace it once.
- Stubbed rows prove the client path only (L36).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE | claims at start and end (C runs in `store/`) | the comparison rule in "Read first" holds at start and end: K1–K4 = planning output; K6–K8, K10–K15, K17 = sketch output; K12 `2 of 2`; K14 `L58 OK` |
| C-APPLY | K12 | `2 of 2` (both files byte-equal `b-round-487/sketch-488/`) |
| IF-PASSWORD | `click-password`, 200 and 500 | the modal is open before and after (`modalOpenAfter` true); final focus `BUTTON||Click to change password` (as `probe/sketch-v2-inflight.json`; round-487 tree `probe/r487tree-v2-inflight.json`: name button / First name — assert the difference); 1 PUT; on 500 the editor stays open, on 200 it closes |
| IF-PASSWORD-NOFOCUS (emulated Safari model) | `click-password-nofocus`, 200 and 500 | modal open before and after; final focus is **not** the name button and **not** First name (round-487 tree: it is, assert the difference); 1 PUT; editor closed on 200, open on 500. The final value (`BODY`, because the modal does not take focus) is `record` only, not an expected value (L47; the modal's focus is B-R488-PASSWORD-MODAL-DIALOG) |
| IF-TABAWAY | `tab-away`, 200 and 500 | final focus `BUTTON||Click to change password|fv=true`; 1 PUT; editor closed on 200, open on 500 |
| IF-STAY | `stay-enter`, `stay-mouse`, 200 and 500 | 200 → `BUTTON||Probe User` (fv true after Enter, false after a mouse ✓); 500 → `INPUT|First name|` with fv true; `BODY` never final; 1 PUT |
| IF-LEAVE | `orders-tab`, 200 and 500 | URL `/account/orders`; focus as round-487 tree (`BODY`, unchanged; the route-change focus contract is round 485's) |
| IF-OVERLAYS | `overlays-488.mjs` | asserted: Search (⌘K) keeps focus in its own input after the settle (as `probe/overlays-sketch.json`). `record` only: User menu / Toggle menu / Logout results (known Safari-model Low B-R488-SAFARI-MENU-SETTLE-FOCUS) and `password-modal-keys` |
| IF-REPLAY | `c-round-487/focus-steal-replay.mjs` | no steal: in all 4 runs `afterSettle` is `BUTTON||Click to change password` with the modal open, 1 PUT (B on v3: `probe/v3/focus-steal-replay.json`; C round 487: name button / First name) |
| PN-REG | round-487 browser rows most likely to break: PN-FOCUS-STUBBED, PN-ESC-INFLIGHT-STUBBED, PN-HELD-STUBBED, PN-HELD-FAST-STUBBED, PN-KBSAVE-500-STUBBED (same probes and expected values as `tasks/round-487.md` §3) | equal to C round 487 values (`c-round-487/named.json`, `extra.json`); B on v3: `probe/v3/sketch-named.json`, `probe/v3/x-sketch.json`, 0 differing fields apart from `base`/`tag` |
| PN-UNIT | A's covering run, plus `python3 -I b-round-487/mutants-488.py <C outdir> <C scratch with the sketch applied>` (never from `store/`) | PN1–PN10h pass on A's tree (18 tests in the file); each of the 24 mutants is red on the same rows as `b-round-487/mutants/mutants-summary.txt` (M00 round-487 file and M000 v1 file prove the new tests fail on the old code; M19–M21 prove the modal ref) |
| DOC | doc 315 | l.4 byte-exact `**სტატუსი:** Completed (C round 488 PASS)`; the new focus row (including the open-dialog rule) and the C-R487-01 Problem → Solution entry exist; every cited row exists |
| G488-AUTH | fresh context, no credentials, both viewports | `/account` shows "Sign in required" with no "Full Name"; `/studio-lab` opens the demo anonymously (`auth_user` null); `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` |
| OWN-BACKEND | real profile update against the .NET backend | BLOCKED: backend unavailable in cloud (not in `passed`) |
| gate | full vitest, typecheck, build, Biome, `npm run verify` | root gate only; never in `passed` |

C writes all L57 fields, including an `origin` per finding.

## 4. Rulings (L4, L10)
- **Guard scope:** the guard applies to both settle paths (success and API failure). It returns false while the password dialog is open, whatever `activeElement` is. It does not apply to validation failure (synchronous, the user is still in the editor) or to open/Esc/Cancel (user-initiated).
- **`<body>` counts as unclaimed:** a mouse ✓ disables the button while saving and Chromium drops focus to `<body>`; that case must still end on the name button / First name (PN10c, PN10d, IF-STAY). Clicking non-focusable page text during a save also leaves `<body>` and therefore also gets the restore; accepted (the user has not chosen another control).
- **Esc during a save (A's question, PN9):** Esc keeps the editor open and focus in the input, which is inside the row, so the settle still restores focus. No change.
- **Success with focus elsewhere:** the editor closes, focus stays where the user put it (PN10, PN10e). The toast still says "Name updated".
- **Failure with focus elsewhere:** the editor stays open with ✓ re-enabled; focus is not moved (PN10b). The toast announces the error.
- **PasswordModal dialog semantics** (no `role="dialog"`/`aria-modal`, no initial focus, Esc does not close it, no focus return; `probe/overlays-sketch.json`) are pre-existing and out of scope: recorded as **Medium B-R488-PASSWORD-MODAL-DIALOG**, scheduled after round 490.
- **Other overlays (Safari model):** the command palette focuses its own input, so it is safe. A non-modal User/Toggle menu opened by an unfocused click during a save still gets the restore; Chromium is unaffected. Recorded as **Low B-R488-SAFARI-MENU-SETTLE-FOCUS** (`deferred_low_polish`; its real half is in SAFARI-CHECKS). Generalising the guard to every overlay is not this round (L10).
- **Real Safari / Firefox-mac:** IF-PASSWORD-NOFOCUS is an emulation. The real WebKit and Firefox-mac checks of this guard join SAFARI-CHECKS and FIREFOX-CHECKS (non-blocking).
- **Unmount during a save** (reviewer Low): safe per tech-lead (optional chaining, React 18); stays a deferred Low test gap. **Dialog closed before the save settles** with focus on `<body>`: the name button gets focus; accepted (deferred Low test gap A-R488-SKETCH-L2-CLOSED-DIALOG-TEST).
- **Out of scope:** the `PasswordModal` component body, toast announcements, the 375 px overflow (round 490), the protected `account.downloads.tsx`.

## 5. Sketch review (L58)
- `b-round-487/sketch-review.md` names the dispatched sha256 and records `tech-lead`'s verdict and B's ruling on each finding.
- Versions: v1 (body/inside-row guard) → tech-lead APPROVE WITH CHANGES (Safari Medium) → v2 (modal ref, PN10f–h) → tech-lead APPROVE → v3 (reviewer Low 3: PN10f/g also assert `<body>`). Dispatched: v3.
- **Mutants:** 24 (M0 HEAD file, M00 the round-487 file, M000 the v1 file, M1–M21). Logs in `b-round-487/mutants/`, summary in `mutants-summary.txt`. Run from `/tmp/b488-mut`; the script refuses `store/`.

## 6. Outcome fixed in advance
- **C PASS with browserVerified true:** B-R486-PROFILE-NAME-KEYBOARD and C-R487-01 → done for the client path (OWN-BACKEND stays open evidence, does not block). Round 489 = SABA-B-17-ENTRANCE-3-4S unless the regression is due.
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes.
