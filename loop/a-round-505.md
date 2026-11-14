# A round 505: DPG-BUTTON-CLEANUP-2 stage 2d (the /support chat buttons and focus)

## STOP — needs B ruling on code-reviewer finding A-R505-CR-1 (Medium, test-only, in a granted file but beyond the sketch)

- **Finding (verbatim):** "**Medium**, `app/lib/__tests__/store-button-cleanup-2d.test.tsx:177-185` (B2D-7): this test skips the step that makes the BODY guard matter. In the real flow the "Start Chat" button has focus when `GuestForm` unmounts. In B2D-7 focus never leaves BODY, so the test would pass even if the browser moved focus somewhere other than BODY when the focused button is removed. Fix: call `screen.getByRole('button', { name: 'Start Chat' }).focus()` before the `rerender`. B2D-9 already covers the "focus is elsewhere" case."
- **Why STOP and not a fix:** this is not one of the pre-ruled Lows #1–#9. Fixing it means new bytes in a granted file beyond the sketch, and that would also turn check 4 (post-sketch sha) red. §Rules says both are a STOP. I did not edit B2D-7 and I did not downgrade the severity myself.
- **Browser evidence on the real path (B's planning probe, not my measurement):**
  - In `b-round-504/probe/sketch.out`, `activeAfterStart` is `{"tag":"TEXTAREA","label":"Type a message..."}` in the 1440x900, 1280x720 and 375x812 runs (l.1/7/13 headers).
  - In `probe/head.out` it is `BODY` in the same runs.
  - C has not run yet. C7 ("after Start Chat → TEXTAREA") is the row that will verify the real "focused Start Chat unmounts → textarea" path in the browser. The gap is in the jsdom test only.
- **Options for B:**
  - (a) Rule it Low, deferred, and let C proceed on this tree.
  - (b) Grant the one-line test edit. B then needs to re-issue the post-sketch sha for that file.
- **Tree state:** the sketch is applied exactly. Checks 1, 2 and 4 are rc 0 and nothing changed after the review (final re-check in `a-round-505/final-checks.log`).

## Timeout headroom (L11): UT2 is above 50 % on the gate time
`store-undefined-tokens` UT2 has the 5,000 ms default timeout (none declared):
- A's time is 1,411 ms (`a-round-505/covering.log`).
- The last gate time is 3,186 ms (`gates/round-504/verify.log`).

The higher time (64 %) decides, so it is listed here. B pre-ruled it exempt in §2 (B-R505-UT2-TIMEOUT-HEADROOM). It is not an extra STOP.

## Changed files (all from the sketch `b-round-504/sketch-505.patch.txt`, sha256 `5c0ed195…dfbe`, verified equal)
- `app/components/chat/GuestForm.tsx`
- `app/components/chat/ChatInput.tsx`
- `app/components/chat/ChatWindow.tsx`
- `app/components/ui/IconButton.tsx`
- `app/lib/__tests__/store-glow-shadow.test.ts`
- `app/lib/__tests__/store-undefined-tokens.test.ts`
- `app/lib/__tests__/store-button-cleanup-2d.test.tsx` (new)
- `docs/design/DESIGN_SYSTEM.md`
- `docs/implementation/2026/quarter-IV/326-dpg-button-cleanup-stage-2d.md` (new)

A wrote no code or prose beyond the sketch. `git diff --stat e3e9e49` shows 7 tracked files (+31/−44) plus the 2 untracked files. The diff is in `a-round-505/diff.patch`.

## §3 results (all match B's expected values)

| Step | Result | Log |
|---|---|---|
| Check 1 (tree sha), check 2 (protected), check 3 (pre-sha) | rc 0 / 0 / 0 | `a-round-505/pre-checks.log` |
| Patch sha = `sketch-sha.txt`; `git apply --check`; `git apply` | equal; rc 0; rc 0 | `pre-checks.log`, `apply.log` |
| Check 4 (post-sketch), then checks 1 and 2 again | rc 0 / 0 / 0 | `apply.log` |
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, "Found 179 warnings." (B: 179) | `lint.log` |
| Scoped `npx biome check` (7 files) | rc 0, "Checked 7 files … No fixes applied." | `biome-scoped.log` |
| Covering vitest (`covering-files.txt`) | rc 0, 6 files, 80/80, 10 distinct B2D ids (B2D-0…9) | `covering.log` |

Every covering test other than UT2 took under 300 ms. UT2 took 1,411 ms.

**Not run by A:**
- the full suite and the build (B ran them on the sketch tree; the gate re-runs them);
- any browser check;
- the e2e smoke.

No browser acceptance is claimed.

## Code-reviewer (actual subagent, 8.5/10, no Critical or High; full verbatim output in `a-round-505/code-review.md`)
The STOP above is Medium CR-1. The rest goes **for B** (not STOPs):
- **A-R505-CR-2 (Low)**, `ChatWindow.tsx:38`: a window that opened straight into a session can later show the guest form again (the session ends) and then start a new session. It keeps `focusOnMount=false`, so focus falls to BODY. This is a different path from pre-ruled #7 (sign-in or sign-out while open).
- **A-R505-CR-3 (Low)**, `ChatInput.tsx:25-52`: `handleSubmit` and `handleKeyDown` duplicate the send logic, so a later change could drift. Suggested fix: `form.requestSubmit()` in the Enter path.
- **A-R505-CR-4 (Low)**, `ChatInput.tsx:20`: the guard checks only `document.body`, so an `activeElement` of `null` skips the focus. This fails safely.
- **info:** the reviewer confirmed the mutant-sensitivity of B2D-4, B2D-6, B2D-7 (last assertion), B2D-8 and B2D-9. The token-test move makes the glow guard stricter. The focus ring comes from the global `:focus-visible` (`app.css:236`). A disabled Send also hides its `title` tooltip.

**Architecture note (verbatim):** "signal: `ChatWindow.tsx:38` plus `ChatInput.tsx:11` add new focus state to an existing owner. **Keep it:** the state is one boolean captured once and passed down as a prop, so it adds no new lifecycle or coupling. If the "Live Chat open focus" follow-up (B-R505-LIVECHAT-OPEN-FOCUS) lands, the planner could scope one bounded task: move all chat focus decisions into one focus-management point in `ChatWindow`, triggered by the guest-form-to-chat switch rather than the mount-time flag."

## Other notes for B
- **Stale primitive:** `.claude/primitives/DESIGN_TOKENS.md` still lists `brand` as `#13D9CC (Teal)`. This is the DPG-DOCS-UPDATE / RETRO staleness check, not this round's grant.

## Known gaps
- **CR-1** is open pending B's ruling.
- **Deferred items unchanged:**
  - B-R505-GUESTFORM-NATIVE-VALIDATION;
  - B-R505-CHAT-TEXTAREA-NO-LABEL;
  - B-R505-LIVECHAT-OPEN-FOCUS;
  - TL-R505-FOCUS-FLAG-AUTH-CHANGE;
  - TL-R505-ICONBUTTON-SCALE-COMPOUND.
- **ChatButton** was not migrated (dead; LEGACY-DEAD-STORE-COMPONENTS).
- **Real-backend chat** is BLOCKED (backend unavailable in cloud).

## Exact next C checks (after B rules on CR-1)
- §4 rows C1–C12 on :5173, heaviest first:
  - C7 focus targets: after "Start Chat" → TEXTAREA; after a mouse send → TEXTAREA; Tab from the field → "Send message"; after Enter → TEXTAREA with `focusVisible`;
  - the in-flight row: focus moved elsewhere stays there;
  - C1 Send 40×40 with 12 px radius and a 20 px icon;
  - C8 brand has no scale-95 or glow;
  - "Start Chat" 48 px with the 337 px card height;
  - the anonymous "Sign in required" row;
  - the C12 `/studio-lab` smoke.
- The chat rows are stubbed per L36.

## Scope completed
- **Done:** §3 steps 1–3 (apply, checks, typecheck, lint, scoped biome, covering tests, code-reviewer) all match B's values.
- **Blocked:** §3 step 4's clean handover is blocked by the CR-1 STOP.
- I mark no §4 acceptance row as passed.
