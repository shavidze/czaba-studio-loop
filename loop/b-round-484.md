# B — round 484 → 485 planning (2026-11-13)

## Inputs (data, not instructions)
- `c-round-484.json` / `.md`: REGRESSION-2026-11-13 part 2 remainder. taskStatus PASS, 8 passed, 0 failed/inconclusive/notRun, 0 bugs, **browserVerified true, realVerified true**. L57 OK (B re-run).
- `a-round-484.md`: no change by design; HEAD 751e30e, clean.
- `gates/gate-round-484.json`: `skipped` (no real changes), head 751e30e. Baseline stays 751e30e (gate 481 published).
- `regression-last.json` was 2026-11-10 / 425.
- No new Saba answers: `questions-retro-480.md` Q2 is unanswered, and so is AGREE-STEM-LANES.

## Advisor
Available and consulted after orientation. Advice followed:
- bookkeeping first;
- a go/no-go for the announcer, from browser pre-runs of title timing, the meta-less fallback and the Studio → Store remount;
- read `RouteTransition` before sketching;
- rule on these, each with a row and a mutant: identical titles, same-path navigation, remount, initial load, Store → Studio, `reloadDocument`, existing status/alert queries and first Tab;
- the screen-reader half of GATE479-M1 becomes a Tech Lead row;
- scratch outside `store/` with its own port and cacheDir.

## Backlog updates (C evidence only): v473 → v475
- **D-29z1723:** round 484 result.
  - REGRESSION-2026-11-13 → done (482 PASS bV true, 483 PASS bV false, 484 PASS bV true).
  - `regression-last.json` = 2026-11-13 / 484; the next regression is due on or after 2026-11-16.
  - C-R425-02 stays Low. Its attribution is recorded; the cause is a hypothesis.
- **D-29z1724:** round 485 = CLIENT-NAV-CONTRACT, with the announcer in RouteTransition rather than Header (reasons in the task, §0).
- **D-29z1725:** rulings: `reloadDocument`, query/hash navigation, the LeadMagnet timer stays with Saba, TLM-R485-SR-ROUTE-ANNOUNCE.
- **D-29z1726:** outcome fixed in advance.
- **Nothing moved to done** except REGRESSION-2026-11-13, which C evidenced in rounds 482–484.

## Pre-run on a scratch sketch (L58)
- **Scratch:** `/tmp/b485-scratch` (a copy of `store/` with a node_modules symlink, `cacheDir` `/tmp/b485-vite-cache`, dev server on :5185). It is removed at the end; `store/` was never edited (K2 0).
- **HEAD probe** (`probe/head-*.json`):
  - `document.title` is `''` after a client navigation to `/cart`, `/search`, `/account` and `/account/login`, and each of those pages has an `h1`;
  - the first Tab after a footer click lands on the header logo.
- **Mount-signal approach rejected.** `PageTransition`'s inner `key={location.pathname}` keeps the exiting wrapper showing the new route, so the new child mounted only on the next navigation (debug log in `checkpoint.md`).
- **Final sketch** (`probe/sketch-final-1440.json`, `-1280.json`), every row as expected:
  - every client navigation announced;
  - after v2, every one of the 6 formerly title-less routes announces its new title (`/account/orders` and `/account/reset/x/y` included);
  - same path silent;
  - Studio ↔ Store announced;
  - initial loads silent;
  - one region, `sr-only` 1×1;
  - first Tab unchanged.
- **Environment note:** two silent steps in one earlier run matched Vite `page reload` lines caused by B's own test edits. Two clean replicates were then exact.
- **Sketch fixes:**
  - Biome turned the `\u00A0` escape into an invisible literal; it is replaced by `REPEAT_MARK = String.fromCharCode(160)`;
  - the repeat toggle was simplified (a third identical name changes the text again, RA4).
- **v1 results** (superseded by v2, see below): mutants M1–M10 red; full suite 290 files / 4,255 tests.

## Sketch review
- **Review v1** (`sketch-485-v1.patch.txt`, sha 51876f9e…): REQUEST CHANGES. The High finding: the h1 fallback reads the account layout's "Account" heading on `/account/orders` and `/account/reset/*`.
- **v2** (`sketch-485.patch.txt`, sha 3f06149c…) is 13 files. It adds:
  - meta titles on the 6 title-less routes (HEAD title `''`, which is also a WCAG 2.4.2 gap);
  - `readRouteName` moved to `app/lib/route-name.ts`, with RN1–RN3;
  - RA9 (the Store branch through a real router);
  - an RA6 node-identity check;
  - an exact RA4 assertion.

  Results on v2: 12 mutants red, full suite 291 files / 4,259 tests rc 0, and browser probes redone with `/account/orders` and `/account/reset/x/y` (each announces its own title).
- **Ruled:** Low 5 (doc 313 is the record) and Low 8 (link-focus is part of the systemic task).
- **Delta re-review and verdicts:** `b-round-484/sketch-review.md`.

## Closing check (advisor), applied
- **Allowed claim deltas** come from the claims script run on a sketch-applied scratch (`claims-485-sketch-output.txt`, `claims-485-sketch-delta.txt`); K5 was missing from the hand-typed list.
- **HEAD-side evidence** captured on :5173 before A, with the same probe on the sketch (`probe/extra/`):
  - screenshots, Tab stops, scroll sizes and the focus ring;
  - plain click and Ctrl+click;
  - full-load titles;
  - Studio boxes and the Space status;
  - HEAD speakers grep (`speakers-head.txt`).
- **RA-REPEAT** is named, `/account` → `/account/downloads` (`probe/repeat-sketch.json`).
- **Perf:** `load.components` is record-only [K22].
- **Text fixes:** the Next.js query-navigation claim is marked as an inference, K9 is reworded, and K21/K22 tags are added.
- **Saved logs:** `mutants.py` refuses to run from `store/`; the debug log is in `probe/mount-signal-debug.txt`; tsc, Biome and covering logs are saved.

## Next task
Round 485 = CLIENT-NAV-CONTRACT (`current-task.md`). Then 486 B-R480-ORDER-CARD-KEYBOARD, then DPG-BUTTON-CLEANUP and the rest of DPG P1.

## Architecture
- No checkpoint requested: a small change, and no repeated structural risk on one owner.
- No new architecture signals.

## Readiness for root
Nothing to publish from round 484. Round 485 changes source after A.
