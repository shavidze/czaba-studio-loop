# C round 492 — FAIL (STOPPED — routed to B), browserVerified true

Task: B-R488-PASSWORD-MODAL-DIALOG (Store /account dialog; no Studio change). A stopped on doc 318 l.22 with the sketch applied (L22 "STOP with a diff"). Per the task, C ran C1, C2, C8 and the STOP's named check, and in addition C5 (browser) as extra evidence.

## Results
- **C1** SCOPE: PASS — exactly the 6 granted paths (` M` account.tsx, account-profile-name.test.tsx, docs 315/317; `??` account-password-dialog.test.tsx, doc 318). HEAD e4e1d1c.
- **C2** CLAIMS: PASS — claims-492.sh output equals claims-492-sketch-output.txt (`c-round-492/claims-end.txt`), stderr empty; K3 `0 0 0`.
- **C3** APPLY: PASS — K5 `====== patch=f530e0f3f9661e5d recorded=f530e0f3f9661e5d`.
- **C5** DIALOG (production build of the working tree, port 5193, B's pw-492.mjs): `PW-CHECK PASS`, rc 0, 0 RED lines (`c-round-492/pw-check.txt`, `tree-pw.json`, screenshots `c-round-492/shots/`). Client path with stubbed API only (L36). Mouse-open shows `outline none 0px` (pointer source); keyboard-open shows `solid 1px`.
- **C8** AUTH + STUDIO (fresh context, no credentials, dev server :5173, 1440×900 and 1280×720; `c-round-492/c8.json`, `c8.mjs`, shots `shots/c8-*`):
  - `/account`: "Sign in required", no "Change Password". `/studio/middle-east`: "Sign in required", 0 `audio[src]`. Premium auth not bypassed.
  - `/studio-lab`: `auth_user` null, "Demo collection ready"; Enter on a library item added a clip (screenshot shows Middle East on Music); Space → clock 00:01.781 (1440) / 00:01.773 (1280) after ~1.8 s, playhead moved, meter active.
  - Not verified: the "Stopped" status text after the second Space (my status regex found no text; no screenshot taken). Not claimed.
- **STOP's named check — doc 318 l.22: CONFIRMED FALSE.** See bug C-R492-01 (Low). A's stop was correct.
- Not run: C6 mutants, full C9, C10 L57, C4 rerun (A's 97 passed; gate covers it). Backend rows BLOCKED (cloud).

## For B
1. Rule doc 318 l.22: grant a one-line edit (A's suggested wording is acceptable: keyboard open shows the ring, mouse open does not; keyboard close shows ring on the trigger).
2. After the edit C reruns C1–C10 in full; the browser rows already pass on this tree.
3. A's new Lows (A-R492-REVIEW-L1…L9) were not reviewed by C beyond reading; L1 (keyCode 229) and L6 (PD8 vacuous) are flagged for B by A.
