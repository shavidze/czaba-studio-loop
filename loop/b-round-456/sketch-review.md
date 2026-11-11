# tech-lead review of the round-457 delta (A-R456-REVIEW-M1)

These are summaries of the read-only `tech-lead` consults. The originals are subagent output and were not saved as files.

## v1: APPROVE-WITH-CHANGES
- **1, Medium: `export * as N` in a barrel loses the names below it.** The walker passed the barrel's names on through the namespace edge. → v2 adds `namespaceReExports`, and a `'*'` binding forwards `null`.
- **2, Medium: `?worker` and trailing-slash specifiers resolve to no file.** → v2: `resolveSpecifier` strips the query, the hash and trailing slashes.
- **3, Low: the comment-strip hazard needs an LT9 backstop fixture.** → v2 adds the `'audio/*' … '*/'` fixture.
- **4, Medium: LT9 must require a resolved file or a known asset extension.** → v2 adds the `scriptFileFor` / `NON_SCRIPT_MODULE` check.
- **5, Low: LT9 needs a reasoned allow-list.** → v2 adds `UNFOLLOWED_SPECIFIER_ALLOW_LIST`, empty, checked in both directions.
- **6: no assertion lost.**
- **7, Nit: renames.** → `mountGraphImports`, `unfollowedLocalSpecifiers`, `IMPORT_META_URL_MODULE`.
- **8, Low: switch GT5b to the walker's edges.** → v2 makes this the 6th grant.

## v2 (sha 022021b6…): APPROVE-WITH-CHANGES
- **N1, Medium: the namespace-target `.filter` failed open.** A plain `export *` next to an `export * as` of the same target was dropped. → v3 removes the filter. LT8 gains the double-export fixture; mutant M30 re-adds the filter and turns GT5b and LT8 red.
- **N2, Medium: GT5b was weaker for `export * as Aud from '~/components/audio'`.** → Removing the filter in v3 keeps the raw namespace entry. GT5b gains this row, plus a comment-in-brace row and a side-effect row.
- **N3, Low: the trailing-slash and `#` strips were untested.** → v3: LT9 adds `'./dir/'` and `'./h.css#x'`; mutants M31 and M32 are red.
- **Checked and fine:** the query strip cannot weaken GT5b, and no mutant was red for the wrong reason.

## v3 (sha 2b97313c…, dispatched)
The verdict is appended below when it arrives.
**Verdict: APPROVE.**
- **Shas checked:** the patch hash and `git diff HEAD~1 | sha256sum` both match `2b97313c…`.
- **Tests:** `tech-lead` ran store-live-teal and store-gradient-text in the scratch: 17/17 green.
- **Earlier findings:** N1, N2 and N3 are closed.
- **New findings:** no new Medium+.
- **Sibling-barrel over-reach:** accepted as fail-closed. LT7 only relies on "not reached", so extra reach can only make it stricter, and barrels hold no class tokens.
- **Remaining edge (Low, no action):** a leaf in the sibling barrel that exports the same name is also reached. This is extra reach, not missed reach.

Dispatched sha256: `2b97313c98c6d07541e9174d37e92bc143bb359f1a161131740d835b833cef4b` (`sketch-457-delta.patch.txt`). Verdict: APPROVE.
