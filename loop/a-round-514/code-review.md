# code-reviewer: round 514 (real subagent run; agentId a904547ee683b6f5e, 12 tool uses)

**Input.** `a-round-514/diff-4c85587.patch.txt` (351 lines), both source files and doc 332.

**Verdict.** approve-with-changes. There are no Critical, High or Medium findings.

| # | Sev | Finding | A's disposition |
|---|---|---|---|
| R1 | Low | **The stored element can go stale.** Steps: enter the banner from A, Tab out to B, click empty space (focus goes to BODY), then make a pointer click in Safari, which does not focus the clicked button. Focus returns to the old A. The reviewer suggests an `onBlur` reset on the root and a test. | Not applied. Source is pinned byte-equal (check 4, task §2 "make no other edit"). This is a new Low, not on the pre-ruled list. **For B.** |
| R2 | Low | No row covers the `header button` fallback branch. | **For B** (test file pinned) |
| R3 | Low | R514-F8 does not pin `document.activeElement` (BODY) when there is no candidate. | **For B** (test file pinned) |
| R4 | Low | Doc line 4 "Completed (C round 514 PASS)" contradicts the Testing section. | **Rejected.** L28 and task §2 require exactly this l.4 string. C checks it byte for byte. |
| R5 | Nit | The flowchart has no "all candidates failed" edge. | **Applied** in doc 332, with a ledger row (R514-F8) |
| R6 | Nit | The tests are out of order: F9 comes before F7 and F8. | **For B** (pinned) |

**Confirmed by the reviewer** (code read only):
- SSR safety: `document` is used only in handlers.
- Event typing is correct, and so is the `instanceof` narrowing.
- None of `any`, a type assertion or ts-ignore appears.
- Semicolons are in place.
- F1–F7 and F9 assert exact `activeElement` values and exact `focus` call arguments.
- Every doc row id exists.
- The pointer ring suppression is real: `focus-source.ts:87-89` and `app.css:241`.

**Architecture note (proposal for B and root, not acted on).** Keep the focus tracking in `CookieConsent.tsx`. It is about 25 lines and has one user, so extracting it now would be a one-off abstraction. The SIG-R513-COOKIE-FOCUS-GROWTH trigger is still right: extract it when a second non-modal surface needs it.
