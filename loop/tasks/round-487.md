# Round 487: B-R486-PROFILE-NAME-KEYBOARD. Account Profile name editor becomes keyboard and screen-reader usable

**Planned by:** B, at the round 486 → 487 planning on 2026-11-13 (`b-round-486.md`, `b-round-486/checkpoint.md`).
- **Archive:** the round-486 task is archived as `tasks/round-486.md`, copied byte-equal (`cmp`) from `current-task.md` before this task was written; K16 compares it with B's second copy `b-round-486/current-task-before-487.md` (a tamper check, not an independent proof).
- **Advisor:** available and consulted (`b-round-486.md`).
- **Decisions:** D-29z1734 … D-29z1737 (`backlog.json` v481, `decisions_log_b`).

## Read first
- **`lessons.md` in full.** Directly relevant:
  - L10: one STOP threshold;
  - L23: full suite on the sketch;
  - L29/L56: claims;
  - L36: stubbed rows prove the client path only;
  - L47/L50: focus targets named, origins enumerated;
  - L52: asserts that can fail;
  - L58: sketch, mutants, review;
  - L59: progress.json;
  - L61: hover and pressed paint.
- **L29 tagging scope:** §1, the "CZABA decision" column of the reference table and the §4 rulings describe the sketch's contents (future code); §2 lists grants, forbidden paths and the future doc. B's run of C's L29 grep leaves 13 untagged hits, all of these kinds. It is pinned by K15 (byte equality with `b-round-486/sketch-487/`) and the patch sha256 (K14), not by separate tags. Facts about current code carry `[K#]`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` and the loop policy (speed rules, the 2026-10-23 bug gate, the cloud-runner section).
- **Claims:** run `bash b-round-486/claims-487.sh` (`ROOT=` and `LOOP=` can be overridden). The planning output is `b-round-486/claims-487-planning-output.txt`.
  - C runs it at C-SCOPE start and end. The output must equal the planning output, except the deltas in `b-round-486/claims-487-sketch-delta.txt`. That delta is the script's output on B's sketch-applied scratch with a placeholder doc 315 (`claims-487-sketch-output.txt`), not typed by hand (L56).
  - K18 ids may move to the archive, but none may be `NOT-FOUND`.
  - K20 may differ by a mock you start.

## Baseline: HEAD `bb82154`, clean tree
- `gates/gate-round-486.json` is `published` at commit `bb82154` on both remotes [K21]. Its `head` field says `0341229`; the commit field and `git rev-parse` are the truth [K1].
- At planning:
  - status empty [K2];
  - tracked tree manifest `b-round-486/r487-tree-sha256.txt`: 1,399 entries, rc 0 [K3];
  - protected files rc 0 [K4].
- A root-only commit after planning that leaves `git diff bb82154 HEAD -- app` empty is accepted with a note (L29). Anything else is "STOP — baseline differs".

## 0. Why this round
- **B-R486-PROFILE-NAME-KEYBOARD (Medium, B's full Biome sweep, round 485 planning):** on `/account` the "Full Name" value is a `<p>` with a mouse-only click handler [K5]. Biome flags it (`lint/a11y/useKeyWithClickEvents`) [K6].
- **Reproduced by B in Chromium at HEAD `bb82154`** (`b-round-486/probe/head-named.json`, signed-in stub, 1440×900, 1280×720, 375×812):
  - the name is not a Tab stop: after the account nav "Orders", Tab goes to "Click to change password", then `<body>` (`tabStops`, `nameStop` 0);
  - after Esc, the ✕ button and a successful save, `document.activeElement` is `BODY` (`afterEsc`, `afterMouseCancel`, `afterSaveEnter`/`afterMouseSave`);
  - holding Enter in the First name field sends **6** `PUT /api/auth/profile` (`heldEnterInInput.puts`);
  - the two inputs have placeholders only, and the ✓/✕ icon buttons have no accessible name (`afterClick.name.inputs`/`buttons`);
  - with no stored name the visible text is "Click to add name" and the aria tree shows it as a `paragraph` (`noname-head.json`).
- These are three tightly related defects of one editor (no keyboard entry, focus lost on close, repeated saves on a held key). It is the oldest open loop-fixable Medium, so it goes first under the 2026-10-23 bug gate. No Critical or High is open.
- **Previous round:** B-R480-ORDER-CARD-KEYBOARD (round 486) C PASS, browserVerified true, published `bb82154` (D-29z1734). The next regression round is due on or after 2026-11-16 [K19].
- **Order after this round (D-29z1736):**
  - 488 = SABA-B-17-ENTRANCE-3-4S: Saba, 2026-11-13, "the entrance animation must last at least 3–4 s"; today the minimum is 1450 ms and the maximum 1900 ms [K23];
  - 489 = B-R487-PROFILE-EDITOR-NARROW-OVERFLOW (see §4);
  - then DPG-BUTTON-CLEANUP.

  If planning happens on or after 2026-11-16, the REGRESSION round comes first. None of these are in this round (L10: no widening).

## Reference: how others do it
| Point | Reference (source) | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|
| Trigger | WAI-ARIA APG, Button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/, read 2026-11-13) | an action is a `button`; Enter and Space activate it | native `<button type="button">` replaces the `<p onClick>` | PN1, PN-TAB-STUBBED, PN-KEYS-STUBBED |
| Name | WCAG 2.2 SC 2.5.3 Label in Name; SC 4.1.2 Name, Role, Value | the accessible name contains the visible text | `aria-labelledby="<Full Name label> <self>"`, which gives "Full Name Probe User". The visible copy is unchanged | PN1, PN1b, PN-AX-STUBBED |
| Field labels | WCAG 2.2 SC 3.3.2 / 4.1.2; a placeholder is not a label | — | `aria-label` "First name" / "Last name" (the same words as the placeholders); icon buttons "Save name" / "Cancel name edit" | PN2, PN-AX-STUBBED |
| Focus after the editor closes | APG Dialog pattern, focus return (closest published rule for an inline editor that disappears) | focus returns to the element that invoked it | Esc, Cancel and a successful save focus the name button. A failed save (validation or API) focuses First name | PN3, PN4, PN6, PN7, PN-FOCUS-STUBBED |
| Held key | project rule SYS-2 (`preventRepeatedEnterKeyDown`, scan test HS1) [K9] | one shared held-Enter guard | the helper guards both the input handler and the trigger | PN5, PN8, PN-HELD-STUBBED |
| Ableton | not applicable (Store account page) | — | — | — |

No Ableton parity claim. `product-designer` was not consulted: this is a Medium bug fix with no visible change (the policy exempts fix-ups); the screen budget is unchanged (PN-PIXEL).

## 1. What changes (sketch `b-round-486/sketch-487.patch.txt`, sha256 in `b-round-486/sketch-487.sha256`)
A applies the sketch with `git apply b-round-486/sketch-487.patch.txt` from `store/`, then writes the doc (§2). Byte-equal application is the expected result. A may change a sketch line only to fix a Medium+ finding from its own code-reviewer that §4/§5 do not rule. Each such change is listed old → new.

1. **`app/routes/account.tsx` (`ProfileContent`):**
   - The value becomes `<button ref={nameButtonRef} id={nameValueId} type="button" aria-labelledby={`${nameLabelId} ${nameValueId}`} onClick={handleNameClick} onKeyDown={preventRepeatedEnterKeyDown}>`, with classes `block w-full text-left text-foreground text-lg hover:text-brand active:transform-none! transition-colors`. `cursor-pointer` goes, because the global `button { cursor:pointer }` gives the same cursor [K7]. The "Full Name" `<p>` gets `id={nameLabelId}`. Both ids come from `useId`.
   - `active:transform-none!` cancels the global unlayered `button:active` 0.98 scale [K7] on this button only. HEAD's `<p>` had no press scale; B's browser mutant without it reads `matrix(0.98…)` (`probe/x/x-mutant-no-select-no-press.json`). No `select-text`: removing it changed no measured gesture (same file vs `probe/x/x-sketch.json`), so v4 dropped it (L58).
   - **Focus:** a one-shot `restoreNameFocusRef` is set by Cancel/Esc and by a successful save. The effect on `isEditingName` focuses First name on open, or else the name button when the flag is set. A validation or API failure calls `nameInputRef.current?.focus()`.
   - **Repeats:** `nameSaveInFlightRef` blocks a second save while one is running and is reset in `finally`. `handleNameKeyDown` returns early on `preventRepeatedEnterKeyDown(e)`. Escape cancels only when no save is in flight. The handler's type becomes `React.KeyboardEvent<HTMLInputElement>`.
   - **Names:** the inputs get `aria-label` "First name" / "Last name"; the ✓/✕ buttons get `type="button"` and `aria-label` "Save name" / "Cancel name edit".
   - `useId` joins the React import, and `preventRepeatedEnterKeyDown` is imported from `~/components/arrangement/studio-repeat-safe` [K9].
2. **`app/lib/__tests__/account-profile-name.test.tsx` (new):** PN1, PN1b and PN2–PN9 (mocked `~/hooks` `useAuth`/`useToast`, `RequireAuth` pass-through, `MemoryRouter`).
   - PN1: native button named "Full Name Probe User", in the tab order.
   - PN1b: with no name, the name is "Full Name Click to add name".
   - PN2: opening focuses the labelled First name field; the Save/Cancel names are unique and `type=button`.
   - PN3: Esc and Cancel return focus to the name button.
   - PN4: Enter saves once, trimmed, and returns focus.
   - PN5: a repeated Enter, and a second Enter while the save runs, send no second save.
   - PN6: an empty first name focuses First name.
   - PN7: a failed save keeps the editor open, re-enabled, with focus on First name.
   - PN8: a repeated Enter on the name button is `defaultPrevented`; a first Enter and a repeated Space are not.
   - PN9: Esc during a pending save keeps the editor open, and the save then returns focus.

## 2. A: grants, forbidden, checks
- **Granted paths (only these):**
  - the 2 sketch files (§1; `git apply` creates the test file);
  - `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md` (new; Georgian; `docs/implementation/TEMPLATE.md` sections) [K12].
- **The doc must contain:**
  - l.4 exactly `**სტატუსი:** Completed (C round 487 PASS)` (L28);
  - the seven TEMPLATE `## ` headings in order, after its `## Prompt` section (L26);
  - the APG Button and WCAG 2.5.3 references;
  - the focus-target table (open, Esc, Cancel, save success, validation failure, API failure, Esc during a save);
  - why the button is full width (HEAD hit area);
  - why `active:transform-none!` is there (the global press scale) and why `select-text` is not (no measured effect);
  - the §4 rulings;
  - a TODO for SIG-R487-REPEAT-SAFE-HOME and for B-R487-PROFILE-EDITOR-NARROW-OVERFLOW.
  - It cites only rows that exist (PN1, PN1b, PN2–PN9 and the C row names of §3).
- **Forbidden:**
  - `global_forbidden_files` (including `app/root.tsx`, `app/styles/**`, `app/contexts/AuthContext.tsx`, `app/lib/auth*`) and `global_forbidden_actions`;
  - the protected files;
  - `app/components/arrangement/**` (the helper is imported, not edited);
  - `RequireAuth.tsx`, `app/services/**`;
  - commit, push, stash, checkout, deploy;
  - restarting the :5173 dev server.
- **STOP threshold (this is the only statement of it; L10):** STOP and report if you hit any of these:
  - a Medium+ finding (your code-reviewer, or a failing covering test) that §4/§5 do not rule;
  - any need to touch a path outside the grants.
- **A runs:**
  - `npm run typecheck`;
  - `npm run lint`;
  - `npx biome check 'app/routes/account.tsx' 'app/lib/__tests__/account-profile-name.test.tsx'`. Quote the paths. Expected: 4 warnings, all pre-existing in `PasswordModal`/the password link (3 × `noLabelWithoutControl`, 1 × `useButtonType` on "Click to change password") [K6 sketch delta]. HEAD had 7, including the 2 icon-button `useButtonType` and the `useKeyWithClickEvents` this round removes;
  - `npx vitest run app/lib/__tests__/account-profile-name.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-internal-links.test.ts app/lib/arrangement/__tests__/held-enter-source-scan.test.ts`. B's sketch run: 5 files, 74 tests passed (`b-round-486/sketch-covering.log`; tsc rc 0 in `sketch-tsc.log`). `store-focus-ring` and `store-theme-tokens` scan the route file [K8]; HS1 scans every source file for an inline held-Enter check [K9];
  - the code-reviewer (3 files).
- **A does not run** the full suite. B already ran it on the sketch (`b-round-486/precheck-full.log`: 293 files, 4,273 tests, rc 0; v1 failed HS1, `precheck-full-v1.log`, which is why the sketch uses the shared helper), and the gate runs it again.
- **Report in `a-round-487.md`:**
  - start HEAD;
  - `git apply` output;
  - `cmp` of both sketch files against `b-round-486/sketch-487/`;
  - the commands, with their pass counts;
  - the reviewer findings and Architecture note.

## 3. C: rows (1440×900 and 1280×720; plus 375×812 where B measured it)
- **Probes** (in `b-round-486/probe/`):
  - `profile-probe.mjs <base> <out.json> <shotdir> <tag> named|empty`: signed-in stub, LeadMagnet seeded as dismissed. `GET` and `PUT /api/auth/profile` are stubbed by method; the PUT is delayed 600 ms and counted; a 500 status is switchable. Viewports 1440×900, 1280×720 and 375×812. `empty` stores empty first and last names, so the shown name falls back to the e-mail [K10];
  - `noname-probe.mjs <base> <out.json>`: `auth_user` without `accessToken` or name, so the "Click to add name" state shows with no backend call (L1);
  - `extra-487.mjs <base> <out.json>`: pressed transform, drag from outside the row, drag starting on the text, double-click, held Enter with an instant PUT (repeats outlive the save, so they reach the name button), and keyboard ✓ with PUT 500;
  - `pxdiff.mjs` / `pxdiff-region.mjs` (env `YMIN`: rows above it are ignored).
- **B's evidence:**
  - HEAD: `probe/head-named.json`, `head-empty.json`, `noname-head.json`, `probe/shots/head-*`;
  - same-period HEAD control: `probe/headctl/*`;
  - sketch v4: `probe/v4/sketch-named.json`, `sketch-empty.json`, `noname-sketch.json`, `probe/v4/*.png`; `probe/x/x-head.json`, `probe/x/x-sketch.json`;
  - browser mutants: `probe/x/x-mutant-no-select-no-press.json` (pressed `matrix(0.98…)`, gestures otherwise equal) and `probe/x/x-mutant-no-trigger-guard.json` (held Enter re-opens the editor);
  - pixels: `probe/v4/pxdiff-region.txt` (`YMIN=80`, 18 pairs, all 0) and `probe/v4/pxdiff-full.txt` (all 0 in this capture).
  - **Header band (INFO-B487-HEADER-BAND-1280):** at 1280 the header's top edge (bbox `[1047,16,1122,17]`, 11 px) differs between captures of the same tree. HEAD vs HEAD: `probe/headctl/pxdiff-control.txt`, 11 px, then 0. B attributes it to environment drift outside the profile, which this change cannot reach. The pixel row is therefore bounded below the header.
- **Stubs:** rows named `…-STUBBED` prove the client path only (L36). The unstubbed guard and the backend row stay separate.
- **Before any row:** warm `/account` once in a browser (L38). A run that coincides with a Vite `optimized dependencies changed. reloading` line is environment-invalid (B's first sketch run hit it: `probe/v1/sketch-named-envinvalid-1.err`), and its replacement counts against the budget.

| Row | What | Pass when |
|---|---|---|
| C-SCOPE | claims at start and end, plus K17 | output equals the planning output except the deltas in `claims-487-sketch-delta.txt`; K17 `L58 OK` |
| C-APPLY | the 2 sketch files equal `b-round-486/sketch-487/` (K15 `2 of 2`), or A's listed changes are each justified by a reviewer Medium+ | — |
| PN-TAB-STUBBED (L47, L1) | `profile-probe.mjs … named`, Tab walk from the top | the name button is a Tab stop right after the account nav "Orders" (stop 12 at 1440/1280, 8 at 375, as `v4/sketch-named.json` `nameStop`; HEAD 0); `focusVisible` true with the shared brass outline (`kbFocused`) |
| PN-KEYS-STUBBED | Enter on the name button; Esc; Space; then Tab to "Cancel name edit" and Enter | Enter opens the editor with focus on the "First name" input (`kbEnterOpens`, 0 PUT); Esc closes it with focus on the name button and `focusVisible` true (`kbEsc`); Space opens it (`kbSpaceOpens`); editor Tab order is First name → Last name → Save name → Cancel name edit (`editorOrder`); Enter on Cancel closes with focus on the name button (`kbCancelButton`) |
| PN-FOCUS-STUBBED | mouse open/✕, Enter-save, mouse ✓-save, empty first name + Enter, PUT 500 + Enter | ✕ → name button, no ring (`afterMouseCancel`, 1440/1280); Enter-save → name button showing "Ada User", 1 PUT `{firstName:"Ada",lastName:"User"}` (`afterSaveEnter`); ✓-save → name button (`afterMouseSave`, 1440/1280); validation → First name, 0 PUT, toast "First name is required" (`afterValidation`); 500 → editor open, First name focused, 1 PUT (`afterApiFail`). `BODY` is never a final value. `mouseSaveInFlight` = `BODY` while the save runs (disabled ✓ button), so it is `record` only |
| PN-ESC-INFLIGHT-STUBBED | Enter-save, then Esc 150 ms later | the editor stays open (`escInFlight.editing` true); after the PUT settles it closes, 1 PUT, focus on the name button (`escInFlightSettled`) |
| PN-HELD-STUBBED | held Enter (1 + 5 repeats, 40 ms) in First name with the 600 ms PUT; held Enter on the name button | in the input: **1** PUT, editor closed, focus on the name button (`heldEnterInInput`; HEAD **6**, assert). On the button: 0 PUT, editor open, focus in First name (`heldEnterOnTrigger`) |
| PN-HELD-FAST-STUBBED | `extra-487.mjs`: instant PUT, held Enter 1 + 15 repeats at 40 ms in First name (the repeats outlive the save and reach the name button) | 1 PUT, editor closed, focus on the name button with `focusVisible` (`x/x-sketch.json` `heldEnterFastSave`; HEAD 2 PUTs and `BODY`). The browser mutant without the trigger guard ends with the editor re-opened (`x-mutant-no-trigger-guard.json`) |
| PN-KBSAVE-500-STUBBED | `extra-487.mjs`: open, Tab twice to "Save name", Enter, PUT 500 | 1 PUT, editor open, final focus on First name with `focusVisible` (`kbSaveApiFail`; HEAD `BODY`) |
| PN-AX-STUBBED | aria snapshot | the name is a `button` named "Full Name " + the shown name (`v4/sketch-named.json` `aria`: `button "Full Name Eve User"`, the last stubbed save of that context; PN1 pins "Full Name Probe User" in jsdom); `noname-probe.mjs`: `button "Full Name Click to add name"` (`v4/noname-sketch.json`; HEAD `paragraph`) |
| PN-RING | crop of the keyboard-focused name button at both viewports | the shared brass outline is visible around the full-width row (compare `probe/v4/sketch-named-ring-*.png`) |
| PN-PIXEL (L39) | `YMIN=80 node pxdiff-region.mjs` on C's `rest`/`hover`/`editing` shots (named and empty, 3 viewports) against `probe/headctl/head-*.png` | 0 differing px in all 18 pairs below the header (B: `v4/pxdiff-region.txt`). If a pair is non-zero below y 80, C re-captures HEAD from a `git archive bb82154` scratch on its own port and `cacheDir` (L38), and that same-run pair decides |
| PN-BOX | `rest`/`hover` in C's JSON vs `head-named.json` | name box, text box, font, colour at rest `rgb(236, 230, 218)` and hovered `rgb(201, 164, 106)`, hovered at the row end too (`hoverRowEnd`), cursor `pointer`; `display` `block` at all 3 viewports |
| PN-PRESS-SELECT | `extra-487.mjs` `pressedTransform`, `dragFromOutside`, `dragOnText`, `dblclick` | pressed transform `none` at 3 viewports (HEAD `none`; mutant `matrix(0.98…)`, assert). The three selection gestures equal `x/x-head.json` (from outside: "Probe User", editor closed; on the text: editor opens, selection empty; double-click: editor open). These are HEAD-equality observations: no class pins them |
| PN-UNIT | A's covering run, plus `python3 -I b-round-486/mutants.py <C outdir> <C scratch with the sketch applied>`, run from a scratch copy and never from `store/` | PN1–PN9 pass on A's tree; each of the 14 mutants in `b-round-486/mutants/mutants-summary.txt` is red on the same rows |
| HS1-SCAN | `npx vitest run app/lib/arrangement/__tests__/held-enter-source-scan.test.ts` | 2/2 pass (no inline held-Enter copy) [K9] |
| DOC | doc 315 | l.4 byte-exact; the TEMPLATE headings in order; every row it cites exists; the §2 contents are present |
| G487-AUTH | fresh context with no credentials, both viewports | `/account` shows "Sign in required" [K11] with no "Full Name"; `/studio-lab` opens the demo anonymously (`auth_user` null); `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` |
| OWN-BACKEND | a real profile update against the .NET backend | BLOCKED: backend unavailable in cloud (not a FAIL; not in `passed`) |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS | root gate only; never in `passed` |

C writes all L57 fields (`tools/l57-check.py` rc 0), including an `origin` per finding.

## 4. Rulings (L4, L10)
- **Press and selection:** `active:transform-none!` stays and is pinned by PN-PRESS-SELECT with its browser mutant. `select-text` is not added: in Chromium it changed no measured gesture. This is also why the order-card guard B-R486-FOCUS-OFFSET-GUARD now names this button (D-29z1737).
- **Hit area vs a compact ring:** the name button keeps HEAD's full-row hit and hover area (`block w-full`; PN-BOX wins). The keyboard ring therefore spans the row. A shrink-to-fit button would change what a mouse user can click.
- **Copy:** the visible "Click to add name" stays (no copy change in a bug round). The accessible name adds the "Full Name" label through `aria-labelledby`; no hidden text is added.
- **Focus on failure:** validation and API failures focus First name, even when the user was in Last name (tech-lead L2: kept; one named target).
- **In-flight focus:** while a mouse- or keyboard-activated ✓ save runs, the disabled button drops focus to `BODY` until the save settles (`mouseSaveInFlight`, `record`). Only the final target is asserted. Changing ✓ to `aria-disabled` is out of scope.
- **Shared helper import:** the Store route imports `~/components/arrangement/studio-repeat-safe` because HS1 forbids an inline held-Enter check [K9]. Moving the helper to `app/lib` is signal SIG-R487-REPEAT-SAFE-HOME (tech-lead L3), not this round.
- **Narrow viewport:** at 375×812 the editor row (2 × `w-40` inputs plus 2 icon buttons, 420 px) is wider than the 343 px column [K22], so ✓/✕ are off-screen and a mouse click misses them (`afterMouseSave`/`afterMouseCancel` at 375, HEAD equal). This is pre-existing and recorded as Medium B-R487-PROFILE-EDITOR-NARROW-OVERFLOW for round 489. C does not fail this round on it; the PN-FOCUS rows for ✕/✓ by mouse are asserted at 1440/1280 only.
- **Focus origins (L50).** Command (run by C on A's tree; HEAD and sketch counts in K24) [K24]: `grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' app/routes/account.tsx`. On B's sketch it gives 18 hits (`b-round-486/l50-hits.txt`); `undo()`/`redo()` callers: 0. Rulings:
  - the 4 `.focus(` calls: open → First name (PN2, PN-KEYS-STUBBED); close → name button (PN3, PN4, PN9, PN-KEYS-, PN-FOCUS-, PN-ESC-INFLIGHT-, PN-HELD-STUBBED); validation → First name (PN6, PN-FOCUS-STUBBED); API failure → First name (PN7, PN-FOCUS-, PN-KBSAVE-500-STUBBED);
  - the `isEditingName ?` editor/button switch: covered by the same rows;
  - the `user?.name ||` fallback: text only (PN1b, PN-AX-STUBBED);
  - the 3 tab-indicator `&&` renders (non-focusable `motion.div`): out of scope;
  - the `isProfilePage ?` Profile/Outlet switch: leaving the page while editing unmounts the editor, but focus stays on the clicked account NavLink, which stays mounted. The client-nav focus contract belongs to round 485. Out of scope, unchanged;
  - the `canChangePassword &&` link, the `isPasswordModalOpen &&` modal and the 6 PasswordModal-internal renders (eye toggles, match hint, error): out of scope, unchanged.
- **Out of scope:**
  - `PasswordModal` (its `noLabelWithoutControl` warnings and the password link's missing `type`);
  - toast announcements;
  - the protected `account.downloads.tsx`.

## 5. Sketch review (L58)
- `b-round-486/sketch-review.md` names the dispatched v4 sha256 and records `tech-lead`'s verdicts and B's ruling on each Low:
  - review 1 on v2 (`sketch-487-v2.patch.txt`): **APPROVE-WITH-CHANGES**, with L1 and L4 fixed in v3;
  - delta re-review on v3 (`sketch-487-v3.patch.txt`): **APPROVE**;
  - delta re-review on v4 (dispatched, `select-text` removed): **APPROVE**.
- **Mutants:** 14 (M0 HEAD file, M1–M13). Logs are in `b-round-486/mutants/`, summary in `mutants-summary.txt`. They run from `/tmp/b487-mut`, never from `store/` (the script refuses it).

## 6. Outcome fixed in advance
- **C PASS with browserVerified true:**
  - B-R486-PROFILE-NAME-KEYBOARD → done for the client path. OWN-BACKEND stays open evidence and does not block.
  - Round 488 = SABA-B-17-ENTRANCE-3-4S, unless the regression is due (on or after 2026-11-16).
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes.
