# Sketch review: round 516 (B round 515 -> 516 planning, 2026-11-14)

Patch reviewed: `b-round-515/sketch-516.patch.txt`, first version sha256 `2a62b3fa99f68eabd5e6716f80ce04ca4e8584dd76834f07156b4bb7a590ae21` (applied in `/tmp/b516`).
Final patch after the reviewer's one requested change: sha256 `560cdf7947bc520e76deb940705fbeddebccfd358460e9a7a232c5e5a3766c09`. The only delta is one added line in N4-2: `expect((source.match(/<Link\b/g) ?? []).length).toBe(2);`.
Reviewer: `tech-lead` (read-only project agent). B transcribed its final answer; the agent wrote no files. It stated that it read CLAUDE.md, FORWARDREF_COMPONENT, TAILWIND_FIRST, TESTING_QUALITY_GATES and BUG_HUNTING_TESTS (L10 project-rule coverage).

**Verdict: approve-with-changes.** The one change is applied in the final sha above.

## Findings and B's dispositions
1. **Q1, project rules: no violations.** `closeButtonRef` is `useRef<HTMLButtonElement>(null)`, which matches `IconButton`'s `forwardRef<HTMLButtonElement>`. No `any`, `@ts-ignore` or `as`. Semicolons are present, and Tailwind tokens only. The `{/* Close Button */}` comment predates the patch.
2. **Q2: the rows are meaningful.** Comparing against a reference-rendered IconButton is acceptable for a migration pin: local drift fails, and IconButton's own changes move both sides. Focus trap and Escape are covered by LM4–LM6 in `store-lead-magnet-dialog.test.tsx`.
   - **Low, one surviving mutant.** Replacing `<Link to>` with `<a href>` survived, because the mocked Link renders an `<a>`. **Applied:** N4-2 now pins `<Link\b` = 2. B's new mutant M12 (whole element as `<a href>`) is red on N4-2 (`mut-logs/mutants-summary.json`, 12/12 red).
3. **Q3: behaviour.**
   - The focus trap still finds Close first (it is a native `<button>`), and initial focus goes through the ref (M9 kills 6+ rows).
   - Escape is on the dialog's `onKeyDown`.
   - `title="Close"` is new and acceptable.
   - `absolute` with `inline-flex` keeps the glyph centred, and `active:scale-95` is harmless.
   - **Low: confirm the link visual changes were ruled.** Disposition: yes. product-designer ruled them in this planning (`consult-product-designer.md`, Control 1: radius, weight, `transition-all` = restyle). The task lists them in §1 and pre-ruled 1.
   - **Info:** the Close colour and size change is intended (designer ruling).
