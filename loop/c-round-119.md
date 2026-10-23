# C — Round 119 verification: C-R118-01 fix-up (CF11 Master Shift pin) + doc 100/101 lines

Verifier C · 2026-10-23 22:25–22:32 UTC · Playwright Chromium 143.0.7499.4 headless, a fresh context per session · target `http://127.0.0.1:5173/studio-lab` · env-status: store 200.

**Verdict: PASS.** `browserVerified: true`, `realVerified: true`. No app bugs. One process observation (C-R119-01) for B, which does not block.

## Rows

| ID | Result | Evidence |
|---|---|---|
| T119-TARGETED | **PASS**: 25/25 files, **452/452** tests (the 25-file §3 list, run by C) | `c-round-119/out/t119-targeted.log` |
| AN-REVIEW | **PASS** for the test file and doc 100 (exact reverse hash). Doc 101 was checked by content only (see below) | `c-round-119/out/an/` |
| SOURCE-SCOPE | **PASS** | `c-round-119/out/source-scope.txt` |
| SH-MASTER 1440×900 | **PASS**: plain −27.5 dB, Shift −2.5 dB (plain/10 = −2.75, inside ±0.5 step); one `Undo: Master Volume` entry each, and Ctrl+Z restores 0 with the prior title | `out/ui-1440-2.json`, `shots/SH-MASTER-1440-2.png` |
| SH-MASTER 1280×720 | **PASS**: identical numbers (w=96, step 0.5) | `out/ui-1280-1.json`, `shots/SH-MASTER-1280-1.png` |
| GV-DRAG 1440×900 | **PASS**: −20 px on a 48 px fader → −25.0 dB (expected −25.0 ± 1.35); `Undo: Volume`; members stay +0.0; Ctrl+Z → `+0.0 dB`, value 0 | `out/ui-1440-2.json`, `shots/GV-DRAG-1440-2.png` |
| GV-DRAG 1280×720 | **PASS**: identical | `out/ui-1280-1.json`, `shots/GV-DRAG-1280-1.png` |
| G119-3 (alone, last) | **PASS**: `/studio-lab` shows the workspace and the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `/api/studio-token?...` returns **401** `{"error":"Please sign in to access Studio."}` | `out/g119-3.json`, `shots/g119-3-*.png` |
| G119-3 fake-Bearer 403 | **BLOCKED**: backend unavailable in cloud | — |
| PX-NET / REG-HYD | **PASS**: in all 5 sessions, 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration messages, 0 `pageerror`, 0 non-noise console errors (2 known cloud-noise errors per Studio session) | `net` arrays in the run JSONs |

Setup for every UI session: `demo-middle-east` on music @0, `demo-stem-pulse` on stems @2, `demo-soft-impact` on SFX @4, Snap `off`, then a group of stems + SFX made with Ctrl+G (GV-PRESENT, re-run as setup; PASS at both viewports, kept under `carried`). The tool is an unchanged copy of the round-118 `ui.cjs`/`lib.cjs` (`c-round-119/tools/`).

**Invalid attempt:** `ui-1440-1` aborted during setup. `setSnapOff` read a null grid control on the job's first page load; the cause is likely a cold dev-server reload or remount, but I did not observe it directly. The run produced no measurement. Its console and network log was not saved because the crash came before `save()`, so REG-HYD for that session is unrecorded. It was replaced once by `ui-1440-2`, within budget. PX-NET/REG-HYD cover the 5 measured sessions.

### SOURCE-SCOPE detail
- HEAD `9cb820b`. Porcelain: the same 8 ` M` + 2 `??` paths, md5 `554bfcc89afd451f279ac4436c37bf74`, which matches the round-118 end state.
- `sha256sum -c` on `b-round-118-r119-tree-sha256.txt` (929 entries) is OK, checked three times: at start, after vitest, and at the end after all browser runs.
- **Scope of this claim:** the app tree is byte-identical to **B's round-118 end snapshot**, which was taken after C-118 closed. C-118 recorded no per-file hashes. The link to the exact tree C tested in round 118 therefore rests on that snapshot plus the unchanged porcelain path set.
- Protected files: `studio.$productId.tsx` fa2cf0bc, `api.studio-token.ts` 13914809, `auth.ts` 56f5b76f, `AuthContext.tsx` bf9ee257. `git diff 9cb820b` on them is empty.
- Granted files now: test `e4406743…`, doc 101 `bcbf0e71…`, doc 100 `295132f6…`.

### AN-REVIEW detail
- **Test file:** a copy outside `store/` with l.501 put back to `toBe(-1.2)` hashes to sha `261472d6d911…`, the exact round-118 file. Exactly one line changed. `expect(` 92, `it(` 14. CF11 l.498–502 were inspected.
- **Doc 100:** a copy with l.69 replaced by the HEAD line „- 3b: group fader dB-ში და Shift fine drag ხაზის, group-ისა და Master-ის fader-ზე.“ hashes to sha `5912f18f…` (exact). Only l.69 changed, and it now reads „- 3b შესრულდა: ჯგუფის fader dB-ში და Shift fine — იხ. doc 101.“
- **Doc 101 (partly verified):** the file is untracked and no pre-edit copy with sha `f910ed7b…` exists in the loop folder, so the byte-level reverse check cannot be reproduced. Content inspection shows:
  - l.4 matches B's status text;
  - l.50 has „**პრობლემა:**“ with the problem text kept and the B solution text. A kept the bold „**გადაწყვეტა:**“ label, which is acceptable;
  - l.66 matches B's text;
  - the „B-ის გადაწყვეტილება CF11 …“ line is gone, with no blank line left (the TODO block is now 2 bullets);
  - the file has 71 lines.
  → C-R119-01 (Low, process).
- **A's m5 claim** is grounded: `a-round-119/m5-vitest.log` contains `expected -12 to be -1` at l.501.

## Bugs
None (app).

## Observations
- **C-R119-01 (process note for B, not an app defect, not for `deferred_low_polish`):**
  - **Problem:** an AN-REVIEW row asked for a reverse-hash of an untracked granted doc, but no pre-edit copy was archived.
  - **Fix for next time:** B (or A, before editing) stores a copy of each untracked granted file under `b-round-N/` or `a-round-N/`.
  - **Status:** A's edit is correct by content. Only the byte-level check that no other line changed is unverified.

No app findings. C-R118-01 is resolved: CF11 is green with `toBe(-1)`, and the browser shows Master Shift moving in the 0.5 dB Master step.

## Two separate ratings
- **CZABA requirement:** met. Master, group and lane Shift give finer drags. The fine Master value moves in 0.5 dB steps (the browser trace `0,-0.5,…,-2.5` over 40 px), which matches round-118 R4 and D-29z84.
- **Ableton correspondence:**
  - Shift = finer drag is **confirmed**. Source: Live 12 Reference Manual §42.6, from B's capture `b-round-71/ableton-shortcuts-20261021.txt`. C did not re-browse the manual this round.
  - Fine Master snapping to its own 0.5 dB step is **unconfirmed**. The MASTER-FINE-STEP signal stays open for ABLETON-EXPERT-REVIEW.

## Carried (not in `passed`)
These are the round-118 browser rows, carried because the app source is byte-identical (see `c-round-118.json`): GV-PRESENT, GV-INF, GV-DBL, SH-LANE, SH-GROUP, SH-MID, NB-PAN, NB-CLIP, G-GROUP-T3, G-GROUP-INF, GV-PLAY, TV-ANCHOR, NB-TV-DRAG, NB-GROUP-MUTE-SOLO, NB-U-FOCUS-RESCUE.

## Gate (not claimed by C)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Side effects
- No `store/` writes. Only local browser demo state was changed.
- Vitest ran read-only on the 25 files, and the frozen check afterwards was still OK.
