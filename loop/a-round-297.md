# A round 297: STUDIO-LINK-a2 (test-only fix-up)

**Status:** done, no STOP. Closes A-R296-REVIEW-1 / -2 (Medium) and A-R296-REVIEW-5 (Low) on the unit side; pending C.

## Changed files (exactly the 2 §4 grants)
- `app/lib/arrangement/__tests__/studio-link-hydrate-ui.test.tsx` — new, copied from `b-round-296/sketch-studio-link-hydrate-ui.test.tsx.txt`; `cmp` byte-equal.
- `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` — §3.2 only: l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 296 PASS; tests round 297)`; one Georgian paragraph in `## ტესტირება` (LH1–LH4, reversed collection, hydrate path, mutants e/g red, f equivalent with reason); the new test file in `## შეცვლილი ფაილები` with "(round 297)"; one TODO line GATE296-ARCH-ROUTE-DOM-FOCUS (signal). No other section touched. Cited ids exist (LH1–LH4 in the test file; GATE296-ARCH-ROUTE-DOM-FOCUS in backlog.json).

No app source, frozen or protected file touched. `app/routes/studio-lab.tsx` in the store is `cmp`-equal to HEAD (mutants ran only on `/tmp/a297-scratch`, a `git archive` of HEAD).

## Claims
- **Before editing:** `claims-297.sh` output identical to `b-round-296/claims-297-output.txt` (diff empty). HEAD `bc9d9a7`, clean tree.
- **After:** differs from the expected output only on the allowed deltas: K2 `status lines 2`; K3 `frozen 1166 rc 1` (`sha256sum -c` fails only on doc 220); K8 the new l.4; K9 `LH 4; hydrate test file exists 1; studio-lab-demo vi.mock sites 1`; K10 `link-ui 209 doc220 78`. K1, K4–K7, K11 identical.

## Checks run
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0 (205 warnings, 1 info, 0 errors — existing repo-wide warnings; none in the new file).
- `npx biome check <new test file>`: rc 0, no finding.
- **Covering set** (6 files, `npx vitest run`): **6 files, 58 tests passed**, 7.21 s. Log: `a-round-297/covering.log`; claims: `a-round-297/claims-{before,after}.txt`.
  - LH timings (timeout 15 s): LH1 715 ms, LH2 542 ms, LH3 341 ms, LH4 443 ms. Slowest in the set: NG5 1823 ms of 15 s (12 %). Nothing above 50 %.
  - LH stderr: only React's server-side "useLayoutEffect does nothing on the server" warnings (112, emitted by `renderToString`, before the spy) and one tolerated `Prop \`muted\` did not match` (LH3's documented tolerance). No `act(...)` warnings, no other hydration mismatch. Same counts (112 / 1 / 0 act) as B's `b-round-296/sketch-covering-run.log` with the same classification, so no new stderr lines.

## Mutants (scratch copy `/tmp/a297-scratch`; new file + `studio-link-ui.test.tsx`, 24 tests; restore `cmp`-equal after each)
| Mutant | Result | Expected |
|---|---|---|
| (e) delete `initialSelectedSourceId={previewSourceId}` | 2 failed / 24: **LH1, LH3 red** | match |
| (g) delete `previewFocusSettledRef.current = true;` | 1 failed / 24: **LH4 red** | match |
| (f) `if (!isWide \|\| previewSourceId === null` → `if (previewSourceId === null` | 24 / 24 green | equivalent mutant, as B ruled |
| Self-check vacuity (C's row, informational): drop `.reverse()` in the mock | 2 failed / 4: **LH1, LH2 red**; LH3, LH4 green | match B's log |

Logs: `a-round-297/mutant-{e,g,f}.log`, `a-round-297/vacuity-identity.log`.

## code-reviewer
Not run (2 paths, test copy is B's pre-verified sketch; task says not required). No Architecture note this round.

## Known gaps / notes for B
- Doc 220 TODO l.72 still says "STUDIO-LINK-b (რაუნდი 297)"; D-29z753 moved it to round 298. Left unchanged because §3.2 allows only adding one TODO line. B may fix it in round 298's doc grant.
- Full suite, build, `verify`, `test:e2e:smoke` are root gate rows; not run by A.
- No browser run by A (test-only round; B-COLD-DEEPLINK and G297-AUTH are C rows).

## Next C checks
CLAIMS, SOURCE-SCOPE (incl. `cmp` vs sketch), TYPECHECK, UNIT (6/58, LH1–LH4 by name), UNIT-MUTANTS (e/g/f), UNIT-VACUITY, B-COLD-DEEPLINK at 1440×900 and 1280×720 on http://127.0.0.1:5173, G297-AUTH, DOC-220 (l.4, 7 TEMPLATE headings in order, ids exist).
