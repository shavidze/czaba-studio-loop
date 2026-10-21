# Orchestrator decisions — 2026-10-07

- A is confirmed to be running with claude-opus-5-5 in the actual Claude transcript, not just configured. User explicitly requested Opus 5.5 for implementation.
- Demo source use is authorized by the user's original demo-material requirement and anonymous test workspace request. Use only already-public CZABA preview assets and generated demo sounds. No new purchase authorization or protected media access is implied. Do not ask the user to reconfirm routine demo-source use.
- Keep simple video preview opacity/fade (FB-07) in the scoped backlog; user asked to implement this feedback functionality. Do not silently drop it or wait for optional confirmation. Rendered video export must remain honestly labelled unavailable if it is not implemented.
- Tempo means grid/metronome BPM only; show that audio is not time-stretched. Plugins/professional effects/pitch/multiple video layers remain out of scope.
- Existing protected product Studio route is not owned by A. Make the new workspace and collection adapter fully reusable, test the adapter independently, and continue all unblocked tasks. Do not block the whole backlog merely because eventual purchased-route wiring needs coordination with its owner. Do not modify purchase/token authorization.
- Existing dev server belongs to this task and runs at 127.0.0.1:5173. Use it; do not stop or duplicate it.
- No commit, push or deployment by A/B/C. Root performs final independent gates and handles requested test sharing after readiness. A completed first round is not a completed Studio migration.
