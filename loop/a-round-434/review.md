# code-reviewer (subagent a2ecfd16e9782678e), round 434, 6 files — verbatim key findings
Critical/High: none. Medium: none.
Low: doc 282 used `ConfirmModal`; the real component is `ConfirmDialog` (Modal.tsx:271, cart.tsx:634). Lines 15, 31, 66, 89. -> fixed in doc (A).
Info: `.styled-scrollbar` also set overscroll-behavior-y: contain (utilities.css:110); panel keeps `overscroll-contain` (Modal.tsx:112), DS2 asserts it.
Info: scrollbarClassName="" is dropped by .filter(Boolean) (Modal.tsx:118).
Info: `ref as React.RefObject` (Modal.tsx:63) and inline comments pre-exist in HEAD.
Info: DS3 literal byte-identity vs HEAD not confirmable by reviewer (no git); evidence = mutant M6 + covering run.
Info: DS4 uses process.cwd() (existing pattern).
Doc consistency: file list, "one import + one prop", default/replace semantics, legacy single <Modal> without prop, DS1–DS4 descriptions accurate (DS4 also pins the exact two-file set -> added to doc), teal hsl(175 85% 46% / 0.4) = rgba(18,217,200,0.4).
Architecture note: shared store primitive Modal.tsx now carries a Studio-specific use enforced by source scan (DS4) not types. Keep (small, default unchanged, 2 callers). Proposal: bounded StudioDialog wrapper (skin + focus trap) if a third Studio dialog appears; already queued as ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS q4.
Score 9/10.
