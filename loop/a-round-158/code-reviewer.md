# code-reviewer result — round 158 (actual Agent call, subagent_type code-reviewer, agentId a5657edd2ba1041b1)

Score 8/10. Critical: none. High: none. Medium: none.

Conformance: T0–T5 match §1 exactly (toolButtonClass byte-exact, Play/Loop-on/Export strings exact, MoveHorizontal on zoom-range, no handler/width/aria/other glyph change, no hex/style=/custom CSS). D1 only line 4. twMerge drops overridden classes correctly (bg-foreground/5 vs bg-foreground; enabled:hover /8 vs /92 and vs accent/20; border-transparent vs border-brand/accent; text-sm kept with colour). A11y: icons aria-hidden, names unchanged, focus ring kept, enabled: fixes hover-on-disabled. Contrast estimates all ≥ 4.5:1 (Play ≥13:1, Export ~7:1, Loop on ~5.5:1).

Findings and A's handling:
- Low: TS2/TS3 could not tell which icon is drawn → FIXED: asserts lucide-play / lucide-pause / lucide-move-horizontal classes; extra mutation m155 (Pause renders <Play/>) turns TS2 red.
- Low: TS1 did not lock bare `border`, focus ring, `disabled:opacity-40`; TS2 not `w-24` → FIXED (asserted).
- Low: no assertion against a bare `hover:` token → FIXED (TS1 asserts no token starting with `hover:`).
- Info: Follow-paused cue and Loop-on border-accent not asserted (not required by §3) → not changed; C SURFACE-STYLE covers.
- Info: focus ring on ivory Play has ~1.9:1 inner edge, ~7:1 outer edge vs surface → for C SURFACE-STYLE (i).
- Info: lucide renders width/height="24" attrs; size-4 sets 16 px box → C ICON-STYLE must measure rendered box.
- Info: Zoom-to-selection `text-xs` is now inert (spec says leave class unchanged).
- Low UX (user-vetoable, not a bug): at S0, 7/12 buttons disabled; opacity-40 on 5 % fill ≈ 2 % effective → idle toolbar reads mostly as unframed text. Belongs to the D-29z123 R3 veto list.
- Info: doc 128 file list did not list itself → FIXED.

## Architecture note (verbatim, for B; NOT implemented)
- **Signal 3 (one region changed repeatedly): the surface recipe will be copied.** `ArrangementTransport.tsx:40-41` (`toolButtonClass`) is the first copy of the V-3 surface recipe. V-3c will spread it to about 8 components. `ArrangementExportDialog.tsx:615` still carries the old `rounded-sm border border-brand bg-brand … text-brand-foreground` recipe. Brand-filled toggles at `ArrangementLane.tsx:632` and `ArrangementGroupHeader.tsx:300` use part of it.
  - **Keep now:** one file, spec-frozen scope, no invariant at risk.
  - **Proposal for the planner (before V-3c, the checkpoint moment §8 already names):** decide between one shared exported `studioToolButtonClass` (plus Play/outline variants) under `app/components/arrangement/` and a small `ToolButton` component.
    - Acceptance: identical class output, verified by the existing TS1–TS6 and the obsidian test, with no change to handlers or aria.
    - Cost: low to medium.
- **Signal 3 (test harness duplication):** the new test copies about 100 lines of Fake* audio, ResizeObserver and media stubs. 81 files under `app/lib/arrangement/__tests__/` now define `class FakeAudioContext` (grep count).
  - **Keep now:** N1 explicitly said to copy.
  - **Proposal:** a shared test fixture module (stubs plus a `stubStudioGlobals()` helper) under `__tests__/helpers/`, adopted file by file when a file is touched anyway.
    - Acceptance: no test behaviour change, and the 24-file baseline stays green.
    - Cost: low per file, medium overall.
