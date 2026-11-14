# C round 507 — FAIL (short, L22)

Verdict: A STOPped with an unruled Medium (A-R507-CR-1-N1-2-SWAP-MUTANT), so per L22 only C0, C11, C12 ran. Browser rows C1–C10 (the actual stage N1 acceptance) were NOT run: not verified, not passed. browserVerified=false.

## Run
- C0: `git status` shows exactly the 2 granted tracked + 2 untracked paths; frozen checks 1, 2, 4 rc 0.
- C11 (Playwright Chromium, fresh no-credential context, 1440×900 and 1280×720; script `c-round-507/c11.cjs`, result `c-round-507/c11.json`, shots `studio-lab-1440.png`, `studio-lab-1280.png`): `/studio/1` and `/account/downloads` render "Sign in required", no download link (only `/free-downloads` nav links) — premium auth not bypassed. `/studio-lab` opens the demo, 9 clips, 0 page errors.
- C12: claims-507.sh 0 MISSING; diff vs sketch output only K1 (HEAD 3021b30) and K2 (4 changed).

## Bug for B
A-R507-CR-1-N1-2-SWAP-MUTANT (Medium): I read N1-2 in the test file; all four clicks precede the assertions and each mock is only counted once, so a Previous/Next handler swap passes. Fix proposal exists (`a-round-507/proposed-n1-2-fix.diff.txt`, untested). B: rule severity (Low is defensible since product handlers are correct) or issue sketch v3, then re-dispatch; C then runs C1–C10 with real audio at 1440/1280/375.

## Not verified
C1–C10 (sizes, radius, hover/press, focus ring, contrast, layout, real audio Mute/Close, scanner, covering tests, mutants, docs). Gate rows (full suite, build) are the root gate's.
