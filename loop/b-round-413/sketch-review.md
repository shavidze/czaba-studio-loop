Reviewed sketch sha256 5279fce53efec3003828470edc3397f4711e86b4c097197a62faeda47e824117 (b-round-413/sketch-414.patch.txt, v2). v1 sha 3a155bc68fb075770d8935542b0231fa3e94d9f7a0b8c1cf76a3e604d4e53910 (sketch-414-v1.patch.txt) was rejected.

# Round 414 sketch review (tech-lead, read-only)

## v1: REJECT (one Medium)
- **TL-R414-M1 (Medium, fixed in v2):** the protected `request` fake (workers/r2-proxy.test.mjs l.26 at HEAD) returned objects without `httpEtag`. `etagMatches` is false without it, even for `*`, so a copy of the public 304 logic into `handleProtected` survived PR21. It also contradicted ruling 1. Fix: the fake objects carry `etag`/`httpEtag` `"etag-1"`, plus MU-414-PROTECTED-ETAG-304.
- Rulings 1, 2 (labelled inference), 4 and 5 judged sound; ruling 6: PR22 shows only that `Headers` trims, so its title was reworded.
- Asked for: `goneOnHead` + MU-414-CATCH-HEAD-NULL-UNGUARDED; a mutant dropping the throw-path meta ETag (MU-414-CATCH-META-ETAG-DROPPED); a 304-before-scope mutant (MU-414-PROTECTED-INM-BEFORE-SCOPE).
- **TL-R414-L-UNSAFE-START (Low → pointer):** `r2RangeOf` passes an unsafe start unchecked; this is the round-311 §4.1 contract (A-R311-REVIEW-L1). GATE311-L1 closes by a fake-model change, not by evidence about R2.

## v2 delta: APPROVE WITH LOWS
- The v1 Medium is fixed: MU-414-PROTECTED-ETAG-304 is red only on PR21 (both workers) and survives the HEAD tests.
- **TL-R414-L1 (Low, fixed before dispatch):** MU-414-PROTECTED-INM-BEFORE-SCOPE answered 304 for every non-studio If-None-Match, so the granted 200 assert failed first and the denied 403 assert was never exercised. B replaced it with a variant that answers 304 only for out-of-scope requests (the 403 site); re-run: red on PR21 in both workers, survives the HEAD tests.
- **TL-R414-L2 (Low, recorded):** MU-414-RANGE-NO-TRIM is equivalent because of a platform guarantee (fetch `Headers` trims values), not because the tests prove it. Ruling 6 and doc 266 say so.

## Evidence on /tmp/b414 (committed sketch, scratch status 0)
- `node --test workers/r2-proxy.test.mjs`: 83/83 (HEAD 75/75).
- mutants/summary.txt: 14 mutants; 13 SKETCH RED with the expected row; NO-TRIM equivalent; 11 survive the HEAD tests (new coverage), SHORT-416-NO-RELEASE and CATCH-META-ETAG-DROPPED are red on HEAD tests too; pristine 4 × rc 0.
