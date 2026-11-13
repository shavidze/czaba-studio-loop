# tech-lead sketch review (L10/L58), DPG-BUTTON-CLEANUP-2 stage 2a (B round 497 -> 498 planning, 2026-11-13)
Both runs were real read-only `tech-lead` subagent runs.

## v1: b-round-497/sketch-498.patch.txt
- **sha256:** ab532667cf9f865d270b113c9e7ac35cba08d0d1277d922c3f50004ad3cdb776
- **Verdict:** APPROVE-WITH-CHANGES. No Medium or higher finding.
  - Project rules (semicolons, no comments, no colours, no `any` or assertions) are met.
  - Every new assertion can fail: the exact class strings, `data-discover` (Link vs `<a>`), and the B2-5 source guard. FAQ `releaseLinkFocus` is already pinned by store-internal-links.test.ts:74.
- **Changes requested:**
  - (a) ST5 asserts that the theme `--color-background` equals `--color-brand-foreground`. Primary uses `text-background`, and today both tokens are #0e0d0c, but nothing tied them together.
  - (b) The ST5 title becomes "dark text (brand-foreground or the equal background token)".
  - (c) Optional: fake timers in B2-2.
- **Architecture note:** keep it inline for now. There are 10 link callers, 9 of them using `{ size: 'lg', shape: 'pill' }`. Orders must stay a plain `<a>`, and a polymorphic `as` prop is hard to type without assertions. After stage 2, a dedicated round may build a `ButtonLink` that wraps the Remix Link only. Recorded as signal SIG-R498-BUTTONLINK-WRAPPER.

## v3 (dispatched): b-round-497/sketch-498-v3.patch.txt
- **sha256:** 90786f209b69359133debc32a765997f5d71b8a1ad7daed2dfe5fa395dfee7ac
- **Delta from v1:**
  - (a), (b) and (c) are applied: B2-2 uses fake timers with an "absent before" check and `advanceTimersByTime(800)`.
  - DESIGN_SYSTEM `### Buttons`: the pill usage list and the Ghost "Use for" line are updated, with the PD-R498-404-SECONDARY-ALIGN marker.
  - The doc 320 skeleton has the 7 headings and a status line.
- **Verdict:** APPROVE. All three changes are correct, there is no new Medium or higher finding, and the docs fit.
- **Low, optional:** the 800 ms pin in B2-2 makes N10 (timer 800 → 900) red. The reviewer accepts this if the 800 ms is a contract, or suggests `advanceTimersByTime(1000)`.
  - **B ruling: keep the 800 ms pin.** It is HEAD behaviour, the reveal timing of a purchase confirmation page, and a timing change should update B2-2 on purpose. N10 RED is intended (`mutants-498.txt`). Recorded as Low A-R498-TL-B2-2-TIMER-PIN in deferred_low_polish.

## v2 (intermediate, not dispatched)
- b-round-497/sketch-498-v2.patch.txt, sha256 fdb0ffabcc9509b5156be87c406f579c29ba58a9bfee32d6452595cd35bd672c.
- It was superseded by v3 before any dispatch. Its docs delta is contained in v3 and was reviewed there.
