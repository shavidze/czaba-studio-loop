# B → root: bounded frontend-architect checkpoint before the V-3c surfaces (2026-10-25, D-29z126)

**Status:** `requested_from_root`, **non-blocking**. This request is the obligation set by `tasks/round-160.md` §7 ("C PASS" row). Procedure: `store/.claude/references/architecture-checkpoint.md` (read-only `frontend-architect`; keep/extract argument, value, risk, at most three sentences per question).

**It consolidates and replaces the open checkpoint requests:**
- `b-round-148-checkpoint-request.md`
- `b-round-155-checkpoint-request.md`
- `b-round-157-checkpoint-request.md`
- `b-round-158-checkpoint-request.md` (Q4, ARCH-R158-TOOL-BUTTON-RECIPE)

Those files stay as written; their questions are carried here by reference. The older V-0/V-1 pending items (`b-round-91`, `b-round-130`, `b-round-136`) are not re-asked.

## Why now
- **V-3b is done** (round 160, `aeba543`), and the transport glyph migration is complete.
- **V-3c-1..3 (icons in the library, lanes, dock and similar)** do not copy the surface recipe, so they go ahead without an answer.
- **V-3c-4** copies the button surface recipe into about 8 components. That is the point where an answer changes the work.

## Questions (bounded)
**Q1. A shared tool-button recipe** (ARCH-R158-TOOL-BUTTON-RECIPE, strengthened twice):
- **Round 159:** the recipe now needs important suffixes (`motion-safe:…!`, `motion-reduce:transition-none!`), because of the unlayered global transition rule (C-R158-01).
- **Round 160:** A's code-reviewer (Signal 3, `a-round-160.md`) found that the size/strokeWidth/gap triple is repeated by hand on 7 transport buttons. That region needed browser measurement plus d6 in each of rounds 158–160 (ARCH-R160-TRANSPORT-ICON-TRIPLE). The reviewer's verdict for the transport is keep.
- **Options:**
  - (a) a `studioToolButtonClass` constant (+ Play and outline variants) in `app/lib/arrangement/`;
  - (b) a small `ToolButton` component;
  - (c) keep the copies, locked by tests (B's fallback);
  - (d) root fixes the global rule first, then (a)–(c).
- **Acceptance for any extraction:** identical class output per button, TS1–TS6 and `studio-theme-obsidian.test.tsx` green, RV-1 0 px.

**Q2. The global transition coupling** (ARCH-R159-GLOBAL-TRANSITION-COUPLING / ROOT-GLOBAL-TRANSITION-RULE):
- The two unlayered rules are `app/styles/app.css` l.305–314 and `app/styles/base/utilities.css` l.7–15.
- **Question:** should one root-approved, Store-wide task move them into `@layer base` before V-3c-4? That would let the `!` suffixes go.
- **It needs:** a Store-page regression and an audit of elements whose utilities would start working.

**Q3. Icon sizing as a helper.**
- V-3c will repeat R2'' (`size-2.5`/`2.4`, `size-3`/`2`) in about 6 more components.
- **Options:**
  - a tiny `studioIconProps(textSize)` helper or two class constants;
  - keep the explicit literals, locked by the LI/TS tests.
- Value low to medium; the risk of drift is low because tests pin each site.

**Q4. Carried-over questions** from 148/155/157 (class locks TH8/TH10/TH11 and the part-templating shape, the strings module split, export orchestration):
- Is any of them now urgent enough to schedule before the VISUAL-A end?
- The default is no: they remain signals.

## What B does with the answer
- **Keep / no answer by V-3c-4 planning:** B applies (c), copies locked by tests, and records it.
- **Extract approved:** one behaviour-preserving task with one owner, scheduled before V-3c-4, with its acceptance written as above.
- **Q2 approved:** a separate root-granted Store-wide task. Not mixed into a Studio round.
