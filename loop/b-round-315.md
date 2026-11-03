# B round 315 → 316 planning

**Date:** 2026-11-03 · **Baseline:** HEAD `c136dfd` (gate 315 `published`), clean tree · **Decision:** CONTINUE → round 316 = PERF-7 (self-hosted fonts; target split on evidence)

**Advisor:** available and consulted after orientation. Its advice was adopted:
- measure the sketch before choosing a split;
- settle the `root.tsx`/`app.css` grant question first;
- mirror Inter and Playfair byte-faithfully rather than trim;
- keep the bytes in `app/assets/` rather than `public/`;
- preload only always-used files;
- add a static notices section;
- use exact-equality browser rows;
- do the round-315 bookkeeping.

## 1. Round 315 ruled (D-29z850)
**C round 315: PASS.**
- 10 rows: SOURCE-SCOPE, CLAIMS, SKETCH-EQUAL, UNIT, PK-LOAD, PK-COLD-START, PK-VIDEO-SOUND, PK-PERF-LOAD (164/164), DOC and G315-AUTH.
- `browserVerified` and `realVerified` are true. 0 app defects.
- 2 Low test-coverage findings: C-R315-T1 and C-R315-T2.
- Gate 315 published `c136dfd` on both remotes.

**Results:**
- PERF-5 is done (5a + 5b).
- A-R312-REVIEW-L1…L5 are closed.
- `tasks/round-315.md` is a byte copy of the old `current-task.md`.

**Evidence check:** the numbers come from `c-round-315.json`, `c-round-315.md` and `gates/gate-round-315.json`. B did not re-run C's rows.

## 2. Next scope
- **REGRESSION is not due:** `regression-last.json` is dated 2026-11-02, so the next falls on or after 2026-11-05.
- **RETRO:** at round 320.
- The queue (`execution_order_d29z817`) gives PERF-7 next.

## 3. PERF-7 premise measured; target split (D-29z851)
**Probe** (`b-round-315/probe/`). Production builds of HEAD (5316) and B's sketch (5317), 3 fresh loads each of `/studio-lab`, `/`, `/store` and `/studio/middle-east` at 1440×900.

**Render-blocking third-party requests:**
- HEAD: 3, 2, 2 and 2;
- sketch: 0, 0, 0 and 0, with 0 Google requests.

**Unchanged in the sketch:**
- the loaded font set and the font request count per route;
- `/studio-lab` pixels: 0 px at 1440 and 1280;
- the store pages: their diffs equal the HEAD-vs-HEAD control.

**FCP − DCL on `/studio-lab` did not fall:** HEAD 131–216 ms, sketch 228–301 ms. DCL improved, but FCP stayed at about 300–380 ms.
- **Cause:** SSR wraps the page in `.page-transition-wrapper` with `opacity:0` (root `PageTransition`). `/studio-lab` has no header outside it, so first paint waits for hydration.
- **Ruling:** that target moves to PERF-11, which already owns removing the transition on `/studio*`.
- PERF-7 closes on:
  - 0 Google and 0 blocking third-party requests on all 4 routes;
  - FCP − DCL < 150 ms on `/` and `/store`;
  - `/studio-lab` absolute FCP no worse than HEAD.
- performance-optimizer agrees.
- `docs/technical/performance/perf-plan.md` is outside B's artifacts, so the split is recorded in the backlog (PERF-7 `target_split_d29z851`, PERF-11 status).

## 4. Round 316 scope and B's pre-check (D-29z852, L23, L37)
**Scope:**
- Mirror all 25 Google woff2 files (83 faces, 5 families) byte-identical into `app/assets/fonts/`. sha256 lists are in `b-round-315/fonts-src/`.
- Add `fonts.css`, linked from `root.tsx` before `app.css`. Delete `app.css` l.1.
- Add 2 CORS preloads on `/studio-lab`.
- Add the OFL licences and a static notices section.
- **Grants:** narrow, for `root.tsx` and `app.css` l.1, on the D-29z166 precedent, under Saba-approved PERF-7. `public/**` is not used.
- **Dependencies:** none. Local files are used over `@fontsource`, and no `root-deps-request.json` is filed.

**Pre-check on `/tmp/b316s`:**
| Check | Result |
|---|---|
| tsc | rc 0 |
| Biome | clean |
| Build | 23 hashed woff2 + 2 inlined `data:` stubs |
| `self-hosted-fonts.test.ts` + TH7 | 17/17 |
| Covering files | 16 files, 233/233 |
| Mutants | 12/12 red (`precheck-unit-mutants-316.txt`) |
| `curl -I` on a hashed woff2 | `immutable` |
| Perf spec, alone | rc 0, `failures` empty, `loaf-scripts-live` 80 |
| `rowcmp` against `c-round-315/perf-harness.json` | **164/164 equal** |

`git apply --check b-round-315/sketch.patch.txt` succeeds on HEAD.

**Claims:** `b-round-315/claims-316.sh` (K1–K20), with head and sketch outputs. They were re-run after the last edit.

## 5. Consults (D-29z853)
**performance-optimizer:**
- Agrees with the split; absolute FCP is the no-regression row.
- The preloads need `crossOrigin` (fonts are always CORS).
- Do not trim subsets.
- `remix-serve` already serves `/assets` immutable; add a header row.
- Asked for deterministic rows (Google 0, blocking 0, file set and bytes, loaded set).
- **All adopted.**

**tech-lead:**
- `app/assets/fonts` is the right home, and `@font-face`-only CSS is not a Tailwind-first breach.
- Licences go in a subfolder, and the notices say "unmodified, sha256-pinned".
- The Reserved Font Names "Playfair Display" and "Plex" forbid re-subsetting or renaming.
- Add FN3, FN4, the TH7 preload-to-face link and the root order.
- **All adopted.** One adjustment: in vitest, a CSS `?url` import resolves to `""`, so FN5 checks the order by source and checks only the count and the absence of `http` at runtime.

**Not consulted:** product-designer and ableton-arrangement-expert. Nothing visible changes, and reference-first excludes perf rounds.

## 6. Findings and bookkeeping (D-29z854)
| Id | Severity | Ruling |
|---|---|---|
| A-R312-REVIEW-L1…L5 | Low | Closed (C 315 PASS + gate) |
| C-R315-T1, C-R315-T2 | Low (test coverage) | `deferred_low_polish`, fix home PERF-14 |
| A-R315-REVIEW-L1…L4 (L2 = GATE315-S6, L4 = GATE315-S1) | Low | `deferred_low_polish`, PERF-14 |
| GATE315-S2 (PW18 unmount on failure), GATE315-S8 (doc 228 round attribution) | Low | `deferred_low_polish`, PERF-14 |
| GATE315-S4 (N ready sources while playing → N restarts) | info | Signal → PERF-10 / SRW-21-PLAN |
| GATE315-S5 | info | Merged into B-R314-EXPORT-LOADING-GATE (SRW-21-PLAN) |
| C-R315-VIDEO-END-NO-FADE | info, pre-existing | Signal → T12-ADVANCED (T12.13) |
| INFO-C315-K8-BYDESIGN | info (origin B) | Recorded |
| ARCH-R315-COMMIT-DECODED-SOURCE | architecture signal | Decided at PERF-10 planning; not scheduled |

**Open findings:**
- No Critical, High or Medium finding is open in this stream.
- Store-side backend rows stay BLOCKED in the cloud as before.

**Updated:**
- `backlog.json` v275: `rounds`, PERF-5/5b/7/11/14 statuses, `consults_round_316`, `execution_order_d29z852`, the STORE-2c handoff, 2 `narrow_grants`, 8 `deferred_low_polish`, 4 `open_findings`, 1 `architecture_signals` and D-29z850…854.
- `feature-status.md` and `current-task.md`.
- `lessons.md` is unchanged: no new failure class.

**Backups** in `b-round-315/`: `backlog-before-316.json`, `feature-status-before-316.md`, `lessons-before-316.md` and `b-next-before-316.json`.

## 7. Architecture checkpoint
None requested. PERF-7 touches route links and assets only, and the peaks owner is closed.

The round-315 reviewer's note (ARCH-R315-COMMIT-DECODED-SOURCE) is recorded as a signal for PERF-10, which owns the context split. It is not a scheduled task.

## 8. Commit readiness
After C PASS on round 316 and the gate, root can publish 40 paths:
- 7 modified: `root.tsx`, `app.css`, `studio-lab.tsx`, `studio-theme-obsidian.test.tsx`, `third-party-licenses.ts` and its test, and `THIRD_PARTY_NOTICES.md`;
- 33 new: `self-hosted-fonts.test.ts`, `fonts.css`, the 25 woff2, the 5 OFL files and doc 229.

The woff2 files are binary. Review them by sha256 against `b-round-315/fonts-src/fonts-sha256.txt`. PERF-7 is then done.

## 9. Not COMPLETE, not BLOCKED
**Not complete.** Many scoped items remain:
- PERF-7…15 and PERF-DRAG-PREVIEW;
- STEM-LANES, SRW-21-PLAN and SYS-1…3;
- STORE-2b…5, COPY-PD and REVIEW-RECOMMENDATIONS;
- T12-ADVANCED and the phase-2 entries;
- the deferred Lows.

**Not blocked.** Nothing external blocks round 316: no backend, credentials or Saba answer is needed.

**Environment note:**
- B's scratch builds and vitest runs used `/tmp/b316h` and `/tmp/b316s`, with `node_modules` symlinked to the store.
- The `remix-serve` processes on 5316/5317 were stopped. `store/` itself was not modified (`git status` clean at `c136dfd`).
- One durable side effect: vitest's results cache in `store/node_modules/.vite/` was written through the symlink. It is untracked and cannot affect the gate.
- **Advisor at close:** three acceptance fixes adopted: FONT-NET counts decoded body bytes (`remix-serve` uses `compression`); doc 229's header block mirrors doc 228; a STOP is added if regenerating the notices changes anything beyond the fonts section.
