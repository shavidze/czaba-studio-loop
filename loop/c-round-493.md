# C round 493: STOPPED — routed to B (A STOP on doc 318 l.36)

**Verdict: FAIL (not a PASS).** A stopped (`a-round-493.md`): doc 318 l.36 says the backdrop "blocks the pointer on the background", but a bottom strip is not covered. The task's STOP threshold includes "a doc 318 line false at hand-over". A's tree is not empty (v3→v5 delta applied), so under L22 I ran C1, C2, C8 and one targeted browser check of the STOP, not the full table.

## Rows run
| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS | `git status`: the same 6 paths. K3 `0 … 0 … 0` (`c-round-493/claims-start.txt`) |
| C2 CLAIMS (start) | PASS | Output equals `b-round-492/claims-493-sketch-output.txt`; stderr empty; K5 `sketch-493-files ======`, patch and delta sha equal |
| C3 APPLY | PASS (from K5) | same K5 line |
| C8 AUTH + STUDIO | PASS (browser, Playwright, new incognito contexts) | `c-round-493/c8.json`, `shots/c8-*`. `/account` and `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no "Change Password", both viewports. `/studio-lab`: `auth_user` null, `Demo collection ready`; Space → `Playing` (clock > 00:00.000), Space → `Stopped`, read from `arrangement-playback-state`. Premium auth not bypassed |
| F1 STOP check | **CONFIRMED** | `c-round-493/f1.json`, `shots/f1-open-*.png`: signed-in stub, dialog open by mouse. `elementFromPoint(300,y)`: y 10…840 (1440×900) and 10…660 (1280×720) inside the overlay; y 870, 895 and y 690, 715 are outside it. A mouse click at `h-10` leaves the dialog open (count 1) at both viewports. This matches B-R492-PASSWORD-BACKDROP-SHORT |

## Not run (L22 short route; none counts as passed)
C4 covering tests, C5 PW-CHECK 18 rows × 3, C6 mutants, C7 visual, C9 full doc truth check, C10 L57, and the `c-round-493.json` L57 harness fields (null, with this reason). C8 clip count: my selector matched 8 elements, so "Enter adds 1 clip" is not verified. OWN-BACKEND: BLOCKED (backend unavailable in cloud, `updatePassword` always throws).

## Bug for B
- **C-R493-01 (Low, origin B spec/doc)**: doc 318 l.36 is false as written. Fix with v6 (docs only), A's wording: "Pointer-ს ფონზე backdrop ბლოკავს (ქვედა ~40 px ზოლის გარდა, B-R492-PASSWORD-BACKDROP-SHORT, deferred Low)". Also consider A's reviewer F3/F7/F8: the TODO list lacks BACKDROP-SHORT, DIALOG-NO-MARGIN-NARROW, SUBMIT-FOCUS-LOST. The code and tests are unchanged. The three Mediums stay open until a C PASS.

Env: `env-status.json` store 200, round 493. I did not edit app source, commit or push.
