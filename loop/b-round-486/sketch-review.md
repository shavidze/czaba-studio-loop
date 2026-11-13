# Sketch review — round 487 (B-R486-PROFILE-NAME-KEYBOARD)

Dispatched sketch: `b-round-486/sketch-487.patch.txt` sha256 **d8f8c4ffc0c0295c36c892bbba98fcba3a1824cbc54ece2590712fad863d9baa** (v4). Earlier: v1 `sketch-487-v1.patch.txt` (failed HS1, not reviewed), v2 `sketch-487-v2.patch.txt` (62ec743e…), v3 `sketch-487-v3.patch.txt` (b2eee700…).

Reviewer: `tech-lead` (read-only project agent), three calls, 2026-11-13.

## Review 1 — v2 sha256 62ec743e877a0e2fab52c59a1d04aa0d467f192e640e87ba3203706a8b116228 (`sketch-487-v2.patch.txt`)
Verdict: **APPROVE-WITH-CHANGES** (no Medium+).
- Q1 focus return (effect on `isEditingName` + one-shot ref): correct; failure after cancel is a safe no-op focus.
- Q2 importing `~/components/arrangement/studio-repeat-safe` into a Store route: acceptable now (HS1 forbids an inline copy); move later → L3.
- Q3 `aria-labelledby` self-reference: keep (name contains visible text, WCAG 2.5.3).
- Q4 `block w-full`: keep (HEAD hit area).
- **L1 Low** Escape cancelled during an in-flight save (Cancel button was disabled) → **fixed in v3**: `e.key === 'Escape' && !nameSaveInFlightRef.current`, row PN9, mutant M13.
- **L2 Low** failed save focuses First name even from Last name → **ruled: kept** (designed and tested, one named target, L47).
- **L3 Low** first Store dependency on `components/arrangement` → **ruled: signal** SIG-R487-REPEAT-SAFE-HOME (move helper to `app/lib`, update HS1 `HELPER_PATH`; not this round's grants).
- **L4 Low** `tabIndex === 0` vacuous in jsdom → **fixed in v3**: `getAttribute('tabindex')` null + not disabled.
- Info 1 Enter/Space-to-click and visible ring are browser-only → browser rows PN-KEYS-STUBBED / PN-RING in the task.
- Info 2 `select-text` inside a button measured in Chromium only (Firefox historically blocks) → moot in v4: B's browser mutant showed `select-text` changes no measured gesture, so v4 drops it.
- Info 3 `active:transform-none!` justified (global `button:active` scale).

## Review 2 — delta v2 → v3 (sha b2eee700…)
Verdict: **APPROVE**. L1 and L4 resolved; nothing new from the delta. L2/L3 stay as ruled.

## Review 3 — delta v3 → v4 (sha d8f8c4ff…, dispatched)
Change: `select-text` removed from the name button (B browser mutant `probe/x/x-mutant-no-select-no-press.json`: selections equal with and without it; pressed transform `matrix(0.98…)` without `active:transform-none!`, which stays). Verdict: **APPROVE** (diff = that class + the patch index hash; v4 probes ok; 18 pairs 0 px).

## Project-rule check (L10)
Semicolons, no `any`, no assertions, no hardcoded colours, Tailwind-only, removed comment allowed by the comments policy — confirmed by review 1.
