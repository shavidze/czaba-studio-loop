# Checkpoint request to root: PERF-8 store pattern (B, round 324 → 325 planning, D-29z915)

**Type:** a bounded frontend-architect checkpoint, run per `store/.claude/references/architecture-checkpoint.md`. It is **non-blocking**: round 325 (PERF-DRAG-PREVIEW stage a) goes ahead.

**Trigger:** feature boundary. PERF-8 is complete (8a range store, C round 320 PASS, gate `53c5c79`; 8b selection store, C round 324 PASS, gate `b925434`). ARCH-CHECKPOINT-PERF8-STORE-PATTERN was parked until this point (`b-round-323.md` "Architecture"). The next stage (PERF-DRAG-PREVIEW) is about to add one more per-provider store on the same owner, `app/contexts/ArrangementContext.tsx`.

**Questions (bounded, three):**
1. **Store count and shape.** The provider now owns several per-provider stores (position, insert marker, mix draft, range, selection; created with `useState(() => create…)`). Keep one store per concern, or fold them into one slices store before PERF-DRAG-PREVIEW adds a preview store?
2. **In-file selection wrappers.** `StudioWorkspace.tsx` holds four memoised selection wrapper components (~190 lines; gate-324 review "Signal 1", backlog A-R322-ARCH-SELECTION-WRAPPERS). Keep, or extract to `components/arrangement/selection-readouts.tsx` with PERF-10 (names must stay identical: render-log tests key on them)?
3. **Async commit ordering.** Range/selection are external stores, history is React state. After an `await` the two commit separately (gate-324 review Suggestion 2; `ArrangementContext.tsx` video add writes the selection after an `await`). Is a written rule enough ("async code does not select a clip it just created until history is visible"), or should the preview/history path move behind the same store?

**Evidence to read:** `gates/round-324/review.md` (Architecture note, Alternative Approach, Suggestions 2–5); `docs/implementation/2026/quarter-IV/230-perf-range-store.md`, `231-perf-selection-store.md`; `app/lib/arrangement/{range,selection,position,mix-draft}-store.ts`; `current-task.md` (round 325) §2 for the preview store contract.

**Wanted output:** a keep/extract argument per question, its value and risk, at most three sentences each.

**Deadline:** before PERF-10 is planned. If the answer to Q1 or Q2 is "extract", B writes one bounded task with one owner and behaviour-preserving tests (render-log names unchanged), scheduled with PERF-10. Q3's answer, if it is a rule, goes into doc 231 in the next round that owns it.
