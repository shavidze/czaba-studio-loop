# Sketch review: round 512 (N2 doc close-out)

Reviewed sketch: `b-round-511/sketch-512-docs.patch.txt` sha256 `ad47fec454fb51e7bef53c6bdd9ab34fa3261473419a16dfad93e8fee8e25c14` (= dispatched).
Reviewer: `tech-lead` (read-only consult, two passes, 2026-11-14). B's transcription.

## Pass 1 (sketch v1, sha c31da35a…, DESIGN_SYSTEM + ui-components + doc 330)
Verdict: approve. Every fact matched Button.tsx, PurchaseHeader.tsx, cart.tsx, ProductSidebar.tsx and app.css.
1. Low: the Buy block said `rounded-md` only. **Applied:** `rounded-md (default) ან rounded-full (pill)`.
2. Low: write a "pending" status in doc 330 l.4. **Rejected:** L28 requires `Completed (C round N PASS)` and forbids the pending form. In pass 2 the reviewer accepted this under L28.
3. info: the Modal example "Add to Cart" in ui-components.md l.645 is a generic example, not a variant rule. Not granted.

## Pass 2 (v2 delta: Low 1 + button.md + doc 330 three-doc wording)
Verdict: approve.
1. Low: the button.md Focus row did not mention that pointer focus hides the outline (`html[data-focus-source="pointer"]`). **Applied.**
2. Low: the DESIGN_SYSTEM Shape row should say "Go to Downloads" is a Link built with `buildButtonClassName`. **Applied.**
3. Low: in ui-components Examples, the buy example sat under "Using convenience exports". **Applied:** it is now its own "Direct purchase" example, and the convenience line reads `<PrimaryButton size="lg">Submit</PrimaryButton>`.

All three pass-2 changes are wording-only. The final sha above includes them.
