COMMIT: OK

I read the diff and the new files. I did not run the browser or the tests. I only looked at the first lines of `verify.log`, so the pass of `npm run verify` rests on what you told me. The change touches no auth, purchase or download code.

## Findings, ranked

1. **Low, `app/contexts/ChatContext.tsx:141-143`.** If the provider unmounts while `await import(...)` or `connection.start()` is pending, `connectionRef.current` is still set afterwards and nothing stops that connection. The old code had the same gap around `start()`. The lazy import only makes the window slightly wider. Fix, in a later round: add a mounted ref and call `connection.stop()` if the provider has unmounted after the await.
2. **Low, `ChatContext.tsx:27`.** `loadedSignalR` is module-level state shared across provider instances. It is only read after `connect()` has set it, and `isHubConnected` returns false when it is null, so it is safe. It can't be wrong unless a second provider is mounted. The chat provider sits in `root.tsx`, so one instance is the realistic case. No change needed.
3. **Low, `RouteTransition.tsx:13-16`.** On the studio branch the wrapper is a plain `div` with `key={pathname}`.
   - It remounts on every studio path change, and this drops the fade and the SSR `opacity:0`. Tests RT1–RT4 cover this.
   - Moving between studio and store routes swaps the element type (`div` vs `AnimatePresence`). The store page therefore gets no exit animation when you leave Studio, and gets a fresh enter animation when you arrive.
   - This is acceptable and probably intended. It is also a visible UX change, so confirm it's wanted.
4. **Info, `perf/budgets.resources.json`.** The three JS byte budgets change from record to assert (372000, 258000 and 278000 encoded bytes). Their notes tie each value to a measured sketch. They will fail on any deliberate dependency bump, which the note already says is by design. No fix needed.
5. **Info, `ChatContext.tsx:130-165`.** `connect` still has `state.connectionStatus` in its deps, as before. I saw no new timers or listeners, and the cleanup paths are unchanged.

I found nothing on accessibility, Tailwind or tokens, TS strict, or render cost. Specifically, there is no `any`, no assertion and no `@ts-ignore`. `import type` is used correctly. `typeof import('@microsoft/signalr')` is a type-level use, which is fine. The `.page-transition-wrapper` class on the studio branch is the same one `PageTransition` already uses.

## Architecture note
- Signal: `app/components/animations/RouteTransition.tsx:11-24`. It adds one conditional on `isStudioPage` inside an animation wrapper. `root.tsx:134` already computes that flag for hiding the header and players. **Keep it:** the component is small and has one job, and tests RT1–RT4 pin its behaviour.
- Signal: `ChatContext.tsx:27-35`. It adds module-level lazy-load state next to the context's per-instance refs. **Keep it** for now. If a mounted/abort guard (finding 1) is added, a small task for the planner would be to move connection setup into a `lib/chat-hub` helper that owns the lazy import and the connection lifecycle, with `ChatContext` keeping only React state. The public `useChat` shape must stay unchanged and CL1–CL4 must keep passing. This is a proposal only, not something to do in this round.