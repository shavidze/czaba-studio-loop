# Sketch review — round 462 (STORE-2b-3d-1)

**Dispatched sketch:** `b-round-461/sketch-462.patch.txt` **v2**, sha256 `2ce4b5e5c942373cd35de535d86e8ceab0faa4b257be434b9345ea1fb0b9353c`.
**Reviewer:** `tech-lead` (read-only, own clone `/tmp/tl462b`), 2026-11-12, against store HEAD a7fa78e.

## Review 2 — v2 delta: **Verdict: APPROVE**, 0 Medium+
- **Delta:** v1 59a9293f → v2 2ce4b5e5 (`sketch-462-delta-v1-v2.diff.txt`). ArtistBioSection is no longer deleted, because it is the only renderer of the keep-list NEWSLETTER_STATS stats. The question goes to Saba as SABA-Q-ARTISTBIO-STATS.
- **No HEAD pin on ArtistBioSection is lost.** All three are kept: the barrel line, the RETIRED_CLASS_ALLOW_LIST entry (hits 1, checked by GT3) and the DEAD_COMPONENTS entry (checked by GT5). M9 is RED on GT3, GT5 and GT6.
- **The v1 Lows hold, adjusted:**
  - TL-R462-L1 now covers 3 names (VideoShowcase, PianoLoadingAnimation, CinemaCurtainLoader).
  - In TL-R462-L4, doc 301 lists 6 deletions and records ArtistBioSection as held.
- **One new Low:** the after-A claims file was still from the v1 era. B regenerated it after this review (see `claims-462-expected-after-A.txt`), so the Low is closed.

## Review 1 — v1, sha 59a9293fdf6721ea90b67754b08b62db789a9bc21dd74ccb7cde16e17eeb061b: **APPROVE**, 0 Medium+
The full text is in `v1-superseded/sketch-review.md`. B ruled each Low:

| id | finding | B ruling |
|---|---|---|
| TL-R462-L1 | GT5 no longer word-scans the deleted component names (now 3) outside the barrels | accepted: tsc and the build fail on any import, and GT6 guards both resurrection and barrel re-export. Doc 301 states this |
| TL-R462-L2 | GT6's barrel regex has no positive fixture in the test itself; only mutant M2 proves it | deferred_low_polish |
| TL-R462-L3 | `stripe-migration-guide.md` l.556/746 and `video-sync.md` l.463 name deleted files | listed in the doc 301 TODO; not granted |
| TL-R462-L4 | an implementation doc is needed | doc 301 is granted and required (task §2.3) |
