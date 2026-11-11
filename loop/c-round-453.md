# C round 453 — STORE-2b-3b glow shadows: PASS (0 bugs)
Real Chromium (Playwright), tree :5173 vs HEAD control ee7cf7c on :5178, mock API :5199, 1440x900 and 1280x720. Evidence in `c-round-453/`.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | 9 paths = grants-453.txt exactly | git status |
| C2 claims | equal to sketch output except K2 (ee7cf7c), K10 (1 files), K15 (outside 0 inside 9); stderr 0 | /tmp claims diff |
| C3 apply | sha256 8 OK; app.css diff hunks md5-identical to the patch's | |
| C4 | `ROWS 22 ALL_OK True`; HEAD control hover shows teal `rgba(19,217,204,.5) 0 0 20px -5px`; tree no glow, fill 201,164,106 -> 217,184,127 | glow-compare.txt, glow-head/tree.json |
| C4b default motion | HEADER-SIGNIN/HERO-CTA: box-shadow none, hover fill 217,184,127, opacity 1, active 0.8 | glow-defmotion.json |
| C5 | GIFTCARD-SELECT disabled: OK in compare | glow-compare.txt |
| C6 | pointer press: no focus-visible ring (compare OK, all targets) | |
| C7 | HEAD addedShadow ends `0px 0px 20px 0px` brass glow; tree `none`; "Added"; posted 1 (both vp) | added-*.json |
| C8 | glowing [] both trees, href unchanged (inlineGlowDecl 2 -> 1) | store-card-*.json |
| C9 | INERT rows OK; /studio-lab computed digest rest 634/634, export 686/686 (1440); 633/633, 685/685 (1280) | glow-compare.txt |
| C10 | covering 5 files / 66 tests pass; 21 mutants identical to B's | covering.log, mutants/ |
| C11 | legacy stubbed: HEAD playhead `0 0 40px` teal, tree none; Export hover HEAD teal 40px, tree `rgba(4,5,6,.3) 0 1px 2px` with fill 217,184,127; boxes equal; pageErrors 0 | legacy-*.json |
| C12 | studio-lab clips 1, Playing posPlay>0, Stopped stopHeld true; anon /studio/middle-east: audioSrc 0, media 0, "Sign in required" — premium not bypassed; equal to HEAD | c12-*.json |
| C13 | doc 296: l.4 exact, 7 headings, 0 "pending" | |
| C14 L57 | see c-round-453/l57-check.txt | |

BLOCKED (not passed): fake-bearer premium path, isLoading state, legacy ownership half — backend unavailable in cloud. Gate rows (full vitest/typecheck/build/biome/verify) not claimed.
Advisory for B (from A's reviewer, unverified by C): stale glow mentions in DESIGN_TOKENS.md:89 / button.md / DESIGN_SYSTEM.md; GS3 lacks a `.button-primary` fill assert.
