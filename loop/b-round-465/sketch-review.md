# Sketch review: round 466 (STORE-2b-3c-2b)

**Dispatched sketch:** `b-round-465/sketch-466.patch.txt`, sha256 `06b2af46191097c06a45e63c2b32171b73dcef17f1bda25e2a9249c0d58244da`.
**Reviewer:** `tech-lead` (read-only; mutants run in its own `/tmp/tl466` copy).

## Review 1, on v1 (sha256 `fc2c0836c72df78e83b9c9d0da27709ef5cbe8bb96a2ddd627b5bf189a9bd7ba`)
**Verdict: APPROVE-WITH-CHANGES.** No Medium+.
- **Changed in v2:**
  - The closed unit list in `ZERO_LENGTH` missed `0pt`, `0in`, `0dvh` and `0cqw`, which Chromium renders as glows. It is now `[a-z]*`, and the `0pt` and `0dvh` rows were added.
  - A concat negative row was added.
- **Lows, deferred (B ruling D-29z1643)** as TL-R465-L1…L6:
  - L1: TS8 row 1 is a no-op.
  - L2: new fail-safe over-matches (`'0 0 ' + '0 1px red'`, `'0 0 ' + spread`, `calc(0px)`).
  - L3: concat with no space before the quote is missed.
  - L4: `round(` and `env(` blurs are missed.
  - L5: the probe's case list is hand-copied.
  - L6, info, pre-existing: colour-first shadows are missed, and two glow layers in one declaration count as 1.
- **backgroundClip:** kept as fail-safe. The info is closed with a rationale. No row is added, because that scanner's tests are outside the grant.

## B change between the reviews (intermediate sha256 `a9d2f2524d0085bf2ba7a449d9aa3fe985a916def30d5a8df5d786b243b1dc4a`)
Tailwind v4 scans test files. Three TS7 className fixtures added three utilities to the production `app.css`, so they are now built with `join('')`. After that change, the build of the sketch, with and without the doc-304 placeholder, is byte-identical to HEAD: `build-compare.txt` and `build-compare-with-doc.txt` both report 0 differing lines over 180 files. HEAD's own TS6 fixtures leak 5 utilities (`data/head-fixture-leak.txt`). That leak is pre-existing and filed as B-R465-TEST-FIXTURE-CSS-LEAK (Low, deferred).

## Review 2, delta on the dispatched sha256 `06b2af46191097c06a45e63c2b32171b73dcef17f1bda25e2a9249c0d58244da`
**Verdict: APPROVE.** No new Medium+.
- The `gi` flags cover uppercase units.
- The corpus counts change only in the fixture file.
- 13 of 13 mutants are red.
- `join('')` passes the same string to the scanner, so no TS7 row is weakened.

## Ordering matrix
Not applicable: this is a pure function with no concurrency or ordering contract.
## Host
The reviewer found nothing host-dependent. G10's 12.8 px depends on the viewport, but its verdict (blur > 0) does not.
