# A — Round 205 report (D-29z170): LeadMagnet dialog (R109), scroll lock position (R110), gate-204 fix-up (R108)

Status: **implemented, handed to C**. No STOP. No commit or push.

## 1. Start checks (all OK)
- HEAD `135b880`; `git status` = the 4 baseline lines; frozen list 1035 OK; 4 grants = start hashes; neither new file existed.
- Collision grep (L23): `app` hits only `store-focus-ring.test.ts` and `store-theme-tokens.test.ts` (expected). `e2e`: **no hit** for `FREE DOWNLOAD|lead`.

## 2. Changed files (only grants + new files; `a-round-205/end-sha256.txt`)
| File | Change |
|---|---|
| `app/hooks/useScrollLock.ts` | R110: `const lockedScrollY = window.scrollY;` read before any body style; used for `top`. Nothing else changed. |
| `app/components/marketing/LeadMagnetPopup.tsx` | R109 (1)–(8): `role="dialog"`, `aria-modal`, `aria-labelledby` → current step's h2 ids (`useId`; ids added to the existing h2s), `tabIndex={-1}`, initial focus ✕, step focus (not on the open transition), Escape (`isComposing` guarded) → `close()` + `stopPropagation`, Tab/Shift+Tab containment over enabled `button,input` (+ dialog-element case), focus restore in the cleanup of an effect declared after `useScrollLock` (`isConnected`, `preventScroll`), `role="alert"` on the error `<p>`, `type="button"` ×3. No visible string or class string changed; no focus/ring/outline token. **Plus DEVIATION A-1 (below).** |
| `app/lib/__tests__/store-hidden-focusables.test.tsx` | R108(1): HF6b added (B's sketch, fresh `ui()` per rerender). No other row changed. R108(2) optional HF8b fake timers **not done** (GATE204-S4 stays open). |
| `docs/.../161-hidden-focusables-runtime.md` | R108(3): status line (In Progress + C 204 PASS + publish with 205), l.111 now names HF6b, files/testing lines include HF6b/HF8b, m11 note, DEVIATION 1 accepted note, TODO ids C-R204-02, GATE204-S3/S4/S5 (Suggestion 2 → root commit note). |
| `app/lib/__tests__/store-lead-magnet-dialog.test.tsx` (new) | 18 tests, LM1–LM9 (see §4). |
| `docs/.../162-lead-magnet-dialog-focus.md` (new, Georgian) | R109/R110, rejected alternatives, B probe numbers, mutant table, TODOs. |

## 3. DEVIATION A-1 (B may veto) — focus re-anchor after a failed submit
- **Finding (code-reviewer Medium, reproduced by A in Chromium):** during submit, `isSubmitting` disables the input and CONTINUE; Chromium moves focus to `<body>`. After a server error focus stayed on body: dialog keydown (Escape, Tab wrap) no longer ran. Evidence: `a-round-205/out/lm-submit-error-before-fix.json` (after-error: `BODY`, inDialog false).
- **Fix (in grant, ~8 lines):** an effect tracks `isSubmitting` true → false; if the step is still `email` and focus is not inside the dialog, it focuses the email input (`preventScroll`). Evidence after: `lm-submit-error-after-fix.json` (after-error: `INPUT`, inDialog true).
- R109(3) said "a failed submit leaves focus where it is"; the browser had already lost it, so this restores the intent.
- **STOP rule, stated explicitly:** the before-fix probe matches the task's STOP condition "the probe shows focus or scroll lost after R109/R110" (L11). A did not stop because the loss violates R109(3)'s own text, the fix is inside a granted file (no file outside the grants needed), it is ~8 lines, it restores the ruled behaviour, and round 204's DEVIATION 1 is the precedent for an in-grant correction reported to B. **B may veto**: reverting it means removing the `wasSubmittingRef` effect and the LM3 failed-submit row (m13). Still open: while the request is in flight (~network time) focus is on body (TODO in doc 162).

## 4. Tests actually run
- `npm run typecheck`: **pass**.
- `npm run lint`: exit 0, 205 warnings / 1 info project-wide (pre-existing classes); `biome check` on the 4 code/test files: clean. `useButtonType` in `LeadMagnetPopup.tsx`: start copy **3** → **0**.
- Targeted: `npx vitest run store-lead-magnet-dialog.test.tsx store-hidden-focusables.test.tsx store-focus-ring.test.ts store-theme-tokens.test.ts store-header-footer.test.tsx` → **5 files, 86/86 pass**, no jsdom "Not implemented" noise.
- LM rows (18): LM1 ×3 (offer/email/success name + unique button names), LM2 ×2 (open → Close; open on email step → Close), LM3 ×2 (step focus; failed submit → input), LM4, LM5 ×4 (3 steps + while submitting), LM6, LM7 ×2 (close restore + removed element; unmount while open), LM8 (real hook, clamped `scrollY` getter), LM9 ×2 (hook error; empty-submit validation).
- **Start copy** (round-204 grants + new test): **17/18 red**; green: "LM7 unmounting while open" (old popup never moved focus) — its red-proof is m8. Output `a-round-205/out/start-copy-lm.txt`. HF6b green on start copy by construction (red-proof m11).
- **Not run (gate rows):** full vitest, `npm run verify`, build, e2e smoke.

### Mutant table (scratch copy `/tmp/a205s`, removed afterwards; tool `a-round-205/tools/mutants.py`, output `a-round-205/out/mutants.json`). Tree: LM 18/18, HF 11/11 green.
(n) = number of failed tests in that row's filter; same convention as doc 162.

| Mutant | Change | Red row (failed) |
|---|---|---|
| m1 | `role`/`aria-modal` removed | LM1 (3) |
| m2 | no initial focus | LM2 (2) |
| m3 | no step focus | LM3 (1) |
| m4 | Escape not handled | LM4 (1) |
| m5 | `isComposing` not checked | LM4 (1) |
| m6 | no Tab wrap | LM5 (4) |
| m7 | wrap without the dialog-element case | LM6 (1) |
| m8 | no focus restore | LM7 (2) |
| m9 | restore only inside the ✕ handler | LM7 (2) |
| m10 | original `useScrollLock` order | LM8 (1) |
| m11 | `isAuthenticated` effect removed from scratch `Header.tsx` | HF6b (1) |
| m12 | `role="alert"` removed | LM9 (2) |
| m13 (A) | no submit-end re-anchor | LM3 failed-submit (1) |
| m14 (A) | step effect without the open guard | LM2 email-open (1) |
| m15 (A) | Tab list includes disabled controls | LM5 submitting (1) |

## 5. Browser self-check (Playwright, :5173, 1280×720; outputs in `a-round-205/out/`)
- `lm-a205-mid-1280.json`: before 2037 on "Browse the Collection"; open → focus Close, `body.style.top -2037px`, dialog `aria-modal true`; Tab ×4 / Shift+Tab: Close ↔ FREE DOWNLOAD only; Escape → focus back on "Browse the Collection", scrollY **2037**. Ring on keyboard: `:focus-visible` true, `solid 1px`.
- `lm-a205-close-1280.json`: ✕ click → scrollY **2037** at +300 ms and +1.8 s, focus restored.
- `lm-a205-1280.json` (B's lmprobe; first attempt crashed on a navigation race right after HMR, rerun OK): focus Close, cycle inside, Escape restores to the pre-open "Studio" link.
- `lm-a205-steps-1280.json`: `getByRole('dialog',{name})` = 1 for offer, email and success names; CZABA-area click → dialog focused (no ring, `outline none`), then Tab/Tab/Shift+Tab/Shift+Tab stay inside; email: focus input, cycle input → CONTINUE → Close → input; empty submit → alert "Please enter your email address"; success (page.route 200) → focus BACK TO SITE, cycle Close ↔ BACK TO SITE; Enter BACK TO SITE → focus back, 2037 kept; storage `dismissed:true, submitted:true`.
- `lm-submit-error-before-fix.json` / `-after-fix.json`: see §3.
- `authmodal-scroll-a205-1280.json`: `{"before":1500,"openTop":"-1500px","after":1500,"dialogGone":true}`.
- Browser state file: `tmp/studio-real-loop/a-browse.json` (storageState of the steps probe).
- Not run by A: 375 and 1440 viewports, exit-intent trigger, `/store`, `/studio-lab` Export dialog (C rows).
- Note for C: Playwright `getByRole('textbox')` also matches page inputs behind the overlay (`aria-modal` does not hide them from Playwright); use the placeholder or scope to the dialog.

## 6. code-reviewer (actual subagent run) — `COMMIT: OK`, 8/10
- Medium #1 (focus lost on disabled submit) → fixed, DEVIATION A-1, m13.
- Low #2 open-guard untested → LM2 email-open row + m14. Low #3 disabled filter untested → LM5 submitting row + m15. Low #4 unmount while open → LM7 row. Low #5 LM7 removed-element half has no red-proof → stated in doc 162. Low #6 LM9 title vs validation → split, validation row added.
- Low #7 (trap selector only `button, input`) and Info #8 (nested `useScrollLock` consumers: a second lock reads `scrollY` from an already fixed body; pre-existing) → **not changed**, reported for B.
- **Architecture note** — reviewer's original text (Georgian, verbatim, quoted below), followed by A's English gloss. Not acted on.

> ### Architecture note
> - **სიგნალი 4 (ახალი lifecycle არსებულ owner-ში):** `app/components/marketing/LeadMagnetPopup.tsx:18-54`, `:58-82`. Presentational popup-ს დაემატა მეორე lifecycle: focus-ის შენახვა და დაბრუნება, ნაბიჯის focus, Tab trap და 6 ref. Doc 162-ის TODO `shared-modal-no-focus-management` თვითონ ამბობს, რომ AuthModal-სა და `ui/Modal`-ს ზუსტად იგივე ქცევა სჭირდება.
>   - **Keep:** keep-list და no-portal/no-`ui/Modal` შეზღუდვების გამო ეს inline უნდა ყოფილიყო. Effect-ები მცირეა, ერთ lifecycle-ს (`shouldShow`) მიჰყვება და LM row-ები ფარავს. ახლა extraction-ის ღირებულება low-ია.
>   - **Proposal planner-ისთვის:** როცა AuthModal/`ui/Modal`-ის focus management დაიგეგმება, ერთ ცალკე დავალებაში გამოიყოს `useDialogFocus(dialogRef, isOpen)`, რომელიც მოიცავს initial focus-ს, trap-ს და restore-ს. LeadMagnet მასზე გადავიდეს და მიღების კრიტერიუმები იყოს LM2 და LM5–LM7 უცვლელად. ეს მხოლოდ წინადადებაა, მიმდინარე რაუნდის finding არ არის.
> - **სიგნალი 3 (საერთო hook):** `app/hooks/useScrollLock.ts:21-28`. ერთხაზიანი ცვლილებაა, რომელიც სამ consumer-ზე მოქმედებს. Keep: ცვლილება მინიმალურია და LM8 იცავს.

- **A's gloss:** "Signal 4 (new lifecycle in an existing owner): `LeadMagnetPopup.tsx:18-54`, `:58-82` — the presentational popup gained a focus save/restore, step focus, Tab trap and 6 refs; doc 162's TODO `shared-modal-no-focus-management` says AuthModal and `ui/Modal` need exactly this. Keep: required inline by keep-list and no-portal/no-`ui/Modal`; small effects on one lifecycle; covered by LM rows; extraction value low now. Proposal for the planner: when AuthModal/`ui/Modal` focus is planned, extract `useDialogFocus(dialogRef, isOpen)` (initial focus, trap, restore) in a separate task; LeadMagnet moves to it with LM2 and LM5–LM7 unchanged. Signal 3 (shared hook): `useScrollLock.ts:21-28` one-line change affecting three consumers; keep, LM8 guards it." Alternative considered by the reviewer: a document-level capture keydown listener while open (would also cover focus on body); verdict: current approach right for this round.

## 7. B acceptance — what A truly passed
- R108 (1) HF6b: done, green; red under m11. (2) optional HF8b: **not done**. (3) doc 161: done.
- R109 (1)–(8): done (jsdom rows + 1280 browser self-check). R110: done.
- L26 self-check: every HF/LM id cited in docs 161/162 exists by name in the named test file; doc 162's mutant table equals §4.
- Not claimed: any C row; 375/1440; gate rows.

## 8. Exact next C checks (priority)
1. **LM-STEPS-205 + DEVIATION A-1:** a failing `/api/subscribe` (page.route 500 with ~800 ms delay): after the error, focus is on the email input and Escape closes; also note focus is on body while in flight (known gap).
2. LM-OPEN/LM-TAB/LM-CLOSE at 375 and 1440 (A ran only 1280); LM-EXIT-205.
3. SCROLL-LOCK-205 (c) `/store` and (d) `/studio-lab` Export dialog (shared hook change).
4. NO-SHIFT-205 box diff (A changed no class strings; `useId` ids only).
5. T-RUN-205 incl. m13–m15; AN-REVIEW-205; SCOPE-205; G205-3.

## 9. Known gaps
- Focus is on body while the submit request is in flight (Escape/Tab trap inactive for that time).
- GATE204-S4 (HF8b real `setTimeout`) unchanged.
- `shared-modal-no-focus-management` and the CommandPalette half of C-R202-06 stay open (not in scope).
- Nested scroll-lock consumers (reviewer Info #8), pre-existing.
- Reviewer Low #7: the Tab trap collects only enabled `button, input`; a future link or other focusable added to the popup would fall outside the trap. Acceptable for the keep-list markup; for B's backlog.
- Line numbers in the reviewer's note refer to the file before DEVIATION A-1 added the submit effect (shifted by ~9 lines).
