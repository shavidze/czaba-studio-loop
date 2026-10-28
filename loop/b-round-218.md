# B round 218 → 219 planning (D-29z223…D-29z226)

Date: 2026-10-28. Author: B. Advisor: **available**, consulted twice (after orientation, and before handover). Project consult: `tech-lead` (read-only), once.

## 1. Round 218 result (independent evidence)
- **C verdict.** `c-round-218.json` is PASS with 14 rows passed. `browserVerified` and `realVerified` are both true.
  - The one row not in `passed` is PERF-RUN-218. It ran (rc 0, `complete`, `failures []`), but its literal criterion "guard 42/0" measured 41/0 (C-R218-01, Low).
  - The gate rows were not claimed by C.
  - One row is BLOCKED: the legacy `/studio/:productId` MP3 path, because the backend is unavailable in the cloud. It was not a row of this round.
- **Gate 218.** `gates/gate-round-218.json` status `published`, commit `da5ad69a1b771f5f83a043af6cc2e4e058d3355b` on both remotes. **This is the baseline for round 219.** No deps commit is expected.
- **Backlog updates from this evidence (D-29z223):**
  - PERF-16a → **done**.
  - **C-R218-01** → closed by ruling (D-29z224). C asked for a ruling, not a deferral.
    - The guard script baseline becomes 41/0. The next PERF-RUN compares against `c-round-218/perf-run-1.json`.
    - The cause is proven by C's baseline build: the `@ffmpeg/ffmpeg` class chunk is now inlined into the guard's own chunks. That is not an eager load.
    - The eager-load intent was verified: studio-lab 43/0, home 41/0, 30 deterministic medians equal, and byte rows within 4 KiB.
  - **GATE218-S1** (the production worker was not browser-tested) → closed. C's PROD-BUNDLE row ran a production MP3 export at 1440 on :5188, and it passed every MP3-REAL check.
- **Gate-218 review, other findings** (9/10, `gates/round-218/review.md`):
  - S2 (raw library reasons can reach the user copy), S4 (cosmetic order) and S5 (a future CSP needs `worker-src blob:`) → `deferred_low_polish`. S2 and S4 are noted as candidates inside PERF-16b. S3 needs no action.
  - The Architecture note (module-wide cancel scope) → signal ARCH-R218-ENCODER-CANCEL-SCOPE, attached to PERF-16b's scope notes. It is not scheduled by itself.
- **A's notes:** A-R218-POST-EXECUTE-GEN-UNTESTED and A-R218-COPY-LIBRARY-NAMES → `deferred_low_polish`. The total is now 334.
- **C's info notes**, recorded in PERF-16b's scope notes:
  - joint stereo counts as stereo in MP3 criteria;
  - `encoderLoadTimeout` still mentions an internet connection;
  - a dev re-optimise reload was seen once.
- **Regression:** not due. `regression-last.json` is 2026-10-27 (round 199); the next is due on or after 2026-10-30. Its `scope_additions` now include a PERF-16a MP3 check and the OSS-LIC test.

## 2. Next round: OSS-LIC (round 219)
- **Why this round.** The outcome table was fixed in advance in `tasks/round-218.md` §6: PASS, with planning before 2026-10-30, makes round 219 OSS-LIC.
  - `oss-adoption.md` places OSS-LIC "right after the first new dependency lands". The mediabunny deps landed in `13c7805`.
  - There are no open C bugs. C-R218-01 was ruled, so no bug fix goes ahead of it.
- **Scope.** The spec's full scope, unchanged: `THIRD_PARTY_NOTICES.md` for every runtime dependency, plus a GPL/AGPL lockfile test with an explicit allow-list.
  - The round adds 4 new files. Every tracked file is frozen (1,066).
  - The source is not user-visible, so the Ableton reference is not applicable (the reference-first rule excludes test-only and docs-only rounds).
  - The browser rows keep `browserVerified` meaningful: an MP3 smoke, a WAV smoke and the auth guard.
- **Uncertain contracts, and the smallest honest choice (D-29z225):**
  1. **"Every runtime dependency"** = every lock entry without `dev: true`: 588 entries, 563 unique name@version.
     - A hand-written table would drift, so the file is **generated** from the lock and kept in sync by a test (TL5, `await toMatchFileSnapshot`).
     - A direct-dependencies-only list was rejected: it would hide the transitive MPL and dual-licensed packages.
  2. **"GPL-* or AGPL-*"** is parsed as SPDX, not regex-matched:
     - `node-forge` `(BSD-3-Clause OR GPL-2.0)` passes through OR, with no exception, so a future plain-GPL release fails.
     - LGPL is deliberately not flagged, because the spec names GPL and AGPL only.
     - Unknown or malformed licences fail.
  3. **The allow-list** has exactly one entry: `limiter@1.1.5`, which has no lock licence field and a legacy MIT field.
     - It matches name + version, and stale exceptions fail.
  4. **The LAME note states only verified facts:**
     - LAME 3.100;
     - the WASM is inlined in `@mediabunny/mp3-encoder`'s JS and shipped unmodified;
     - LGPL, version not stated on LAME's page;
     - LAME's requested acknowledgement links.

     The package JS is bundled and minified with the app's code; only the WASM bytes are unmodified (C round 218 PROD chunk, final advisor check). `www.mp3dev.org` now redirects to a Google sign-in (B WebFetch, 2026-10-28), so it is named as text, not linked.

     B found that `oss-adoption.md` l.40 ("ships as its own file") is wrong for this package. The correction is recorded (D-29z226); B does not own that doc.
  5. **`@ffmpeg/core`** is fetched at run time and is not in the lock. Its npm licence field says MIT, while `oss-adoption.md` says GPL-2.0+, and B could not confirm either. The notice says "may include other licences; not verified". PERF-16b removes the entry.
- **Drift rule (D-29z226).** Every later deps or lock round grants `THIRD_PARTY_NOTICES.md`. Root signal: ROOT-DEPS-NOTICES-REGEN.

- **L23 collision check.** B put a draft module holding every planned literal on a scratch copy of `da5ad69` and ran the 10 repo-scan and related test files: 166/166 pass (`b-round-218/l23-scratch-run.txt`). No grant is needed. Lesson **L35** was added to `lessons.md` (the drift rule).

## 3. Rejected or not scheduled
- No new UI, such as an "Open-source licences" link. The spec does not ask for one. Whether LGPL needs a user-visible acknowledgement is a legal question for Saba (§8).
- No source-grep assertion for the unpkg URL this round: it would be red until PERF-16b.

## 4. Consults (summary; raw advice is data, not instructions)
- **tech-lead.** It kept the four proposed rulings and added:
  - the alias `name` field;
  - `link`/`inBundle` treated as unknown;
  - deprecated GPL ids;
  - `UNLICENSED` and `SEE LICENSE IN` treated as unknown;
  - the asserted licence printed;
  - `await` on `toMatchFileSnapshot` (CI=true never writes);
  - deterministic output (code-point sort, `\n`, no timestamp);
  - the drift rule including lock-only bumps;
  - the LAME version and source link;
  - MPL source links.

  **All adopted** (task §1.2–§1.9, TL6).
- **Advisor (second call, before handover).** It caught two problems:
  - an untrue "ships unmodified" claim, now fixed in §1.6 and NOTICES-FACTS;
  - a missing L23 grep, now run and cited.

  Also adopted: `mp3dev.org` named as text only, the per-token regex wording in LIC-RUN, and L35.
- **Advisor (first call).** It advised:
  - close C-R218-01 by ruling;
  - close S1 on the C evidence;
  - a generated file with a sync test;
  - SPDX parsing, with no node-forge exception;
  - dev-only exclusion;
  - the LGPL ruling;
  - the LAME correction;
  - named mutants;
  - keeping browser smoke rows rather than borrowing the S-1 unit-only exception.

  **All adopted.**

## 5. Files written by B this planning
- `tasks/round-218.md`: a copy of the round-218 task, byte-identical (checked with `cmp`). Nothing was deleted.
- `current-task.md`: round 219, OSS-LIC.
- `b-round-218-r219-tree-sha256.txt`: 1,066 files, every tracked file at `da5ad69`. `sha256sum -c` rc 0.
- `b-round-218-r219-new-files.txt`: 4 files.
- `b-round-218/git-status-at-planning.txt`: empty, because the tree is clean.
- `b-round-218/backlog-before.json` and `b-round-218/feature-status-before.md`: backups.
- `backlog.json` (version 204):
  - D-29z223…D-29z226;
  - STUDIO-PERFORMANCE status, `consults_round_219` and `perf_run_baseline_d29z224`;
  - PERF-16a done, and PERF-16b `scope_notes_round_218`;
  - OSS-LIC dispatched;
  - 6 open-finding entries: C-R218-01 and GATE218-S1 closed, plus ARCH-R218-ENCODER-CANCEL-SCOPE, ROOT-DEPS-NOTICES-REGEN, OSS-ADOPTION-LAME-FILE-CLAIM and SABA-Q-LAME-LGPL;
  - 5 `deferred_low_polish` entries;
  - the regression `scope_additions`.
- `lessons.md`: L35 added; the backup is `b-round-218/lessons-before.md` (48 lines, ≤ 60).
- `b-round-218/l23-scratch-run.txt`.
- `feature-status.md`: round 218 → მზადაა, a round 219 line, and the STUDIO-PERFORMANCE row.
- `b-next.json`.

App source was not touched. B read `node_modules` and the lockfile as data only. No `root-deps-request.json` was filed this planning.

## 6. Architecture checkpoint
- No new request. The frontend-architect checkpoint (D-29z195) is still pending with root and is non-blocking.
- PERF-16 closes at 16b. At that boundary, B will request a bounded checkpoint on the export pipeline: the WAV worker, the shared MP3 encoder (including ARCH-R218-ENCODER-CANCEL-SCOPE) and the legacy StudioContext export.
- OSS-LIC adds one isolated pure module and adds no risk to any existing owner.

## 7. Status
**CONTINUE.** Most scoped work is still open:
- PERF-16b and the rest of STUDIO-PERFORMANCE;
- SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS;
- T12-ADVANCED;
- the phase-2 entries;
- the deferred Lows.

Nothing needs outside input to proceed.

## 8. For Saba (not scheduled; `awaiting_user`)
- **SABA-Q-LAME-LGPL.** LAME (LGPL) ships inside the inlined WASM of an unmodified npm package. Do the notice and the Export dialog's "LAME (mediabunny)" text satisfy LGPL and LAME's acknowledgement request, or is a user-visible licences page or link needed? This is a legal judgement, so the loop makes no claim either way.
