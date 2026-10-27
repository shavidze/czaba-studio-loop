# B → root: bounded frontend-architect checkpoint at the SABA-B-4 boundary (2026-10-27)

**Status:** requested; non-blocking. Rounds 204 (hidden focusables) and 205 (LeadMagnet popup focus) do not wait for it.

**Why now:**
- SABA-B-4 is done: stage 1 Studio (rounds 196–198) and stage 2 store (rounds 201–203, published `135b880`).
- The focus system now spans several owners:
  - `app/lib/focus-source.ts` (modality attribute and the in-field editing-key predicate);
  - the unlayered global `:focus-visible` rule in `app/styles/app.css`;
  - `lib/focus-reveal.ts`;
  - the Studio `isTypingTarget` in `StudioWorkspace.tsx`.
- Reviewers raised these signals: ARCH-R198-FOCUS-REGION, the round-202 Signal 4 (root.tsx listeners), and the round-203 Signal 2 (text-entry predicate duplication) with minor signal 3 (a second CSS rule parser in tests).
- `b-round-197.md` §6 already listed this request as pending. This file replaces it.

**Method:** follow `store/.claude/references/architecture-checkpoint.md`, with the read-only `frontend-architect`, at `135b880`, or at the commit root publishes for round 204. For each question: keep or extract, the value, the risk, and at most three sentences. "Not worth it now" is a valid answer.

## Questions (at most four)
1. **Text-entry predicate.** `focus-source.ts` (input types, textarea, contenteditable) and `StudioWorkspace.tsx` `isTypingTarget` (the same set plus `select`) are two definitions. Extract `isTextEntryTarget(target)` into `app/lib/` with one truth-table test, with Studio adding `select` on top? Or keep both? SYS-3 will next touch `focus-source.ts` (A-R203 M1/I1), so it could carry the extraction if the answer is "extract".
2. **Focus-modality ownership.** `root.tsx` AppContent owns two document capture listeners and `html[data-focus-source]`; `app.css` owns the unlayered global rule; Studio and store add exceptions. Is one module (hook + CSS contract) worth it, or keep?
3. **Test scanners.** `store-focus-ring.test.ts` (`cssRulesOf`, STF2 tokenizer) and `store-focus-fixups.test.tsx` each have a CSS rule parser. Share one test helper now, or fold it in only when a scanner next changes (the reviewer's suggestion)?
4. **Disclosure pattern.** Round 204 adds a hand-rolled disclosure (Escape, focus-out, outside pointerdown) to `Header.tsx`. CommandPalette and AuthModal lack focus restore (C-R203-02, `shared-modal-no-focus-management`), and the auto-opening LeadMagnet popup has no dialog semantics or focus at all (B-R203-LEADMAGNET-AUTO-OPEN-FOCUS, round 205). Is a shared `useDisclosure` / focus-restore hook worth a bounded task before STORE-3/4, or keep it per component?
