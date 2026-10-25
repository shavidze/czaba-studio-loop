# B → root: addendum to the pending V-3 checkpoint (2026-10-25, D-29z124)

**Status:** addendum only, **non-blocking**. This is not a new request: `b-round-157-checkpoint-request.md` said B does not re-ask before the VISUAL-A end. This file adds one question to that pending request. Rounds 159 (the V-3a fix-up) and 160 (V-3b) go ahead without an answer.

## Question 4: a shared transport/tool button recipe before V-3c (ARCH-R158-TOOL-BUTTON-RECIPE)
- **Source:** A's round-158 code-reviewer Architecture note 1 (`a-round-158/code-reviewer.md`).
  - The V-3 surface recipe (`toolButtonClass` in `ArrangementTransport.tsx`) will be copied into about 8 components in V-3c.
  - `ArrangementExportDialog.tsx` l.615 still has the old brand-fill recipe; `ArrangementLane.tsx` l.632 and `ArrangementGroupHeader.tsx` l.300 have it in part.
- **New fact from round 159:** the recipe now needs Tailwind important suffixes on its colour-motion tokens (`motion-safe:…!` plus `motion-reduce:transition-none!`). The reason is that an unlayered global rule in `app/styles/app.css` l.305–314 overrides layered utilities (C-R158-01; root signal ROOT-GLOBAL-TRANSITION-RULE). Copying that subtle detail 8 times raises the value of one shared definition.
- **Options:**
  - (a) a shared `studioToolButtonClass` constant, plus Play and outline variants, in `app/lib/arrangement/`;
  - (b) a small `ToolButton` component;
  - (c) keep the copies, locked by tests;
  - (d) root fixes the global rule first (`@layer base` plus a reduced-motion block, as a Store-wide grant with a Store-page regression). The `!` suffixes then disappear and (a)–(c) become simpler.
- **Acceptance for any extraction:** identical class output per button, TS1–TS6 and `studio-theme-obsidian.test.tsx` green, and RV-1 at 0 px.

## What B does with the answer
- **Keep:** V-3c copies the recipe and its tests lock each copy.
- **Extract approved:** one behaviour-preserving task with one owner, before V-3c.
- **No result by V-3c planning:** B uses option (c) and records it.
