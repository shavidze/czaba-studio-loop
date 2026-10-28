COMMIT: OK

The change is small and does what it says. In `SchemaEditor.tsx`, `handleSave` now skips `onClose()` if this editor instance was unmounted while `await onSave?.()` was pending. Before, a pending `Done` would close an editor the user had reopened afterwards (Back, then Customize Fields again), losing what they had typed. The ref is set to `true` inside the effect, not as the `useRef` initial value. That is correct under `React.StrictMode` (`main.tsx:7`): the effect replay sets it back to `true`, and test (e3) checks this. `MetadataPanel.tsx` is untouched, so the pending re-read (D-40, D-39(b)) still finishes and writes to the store; (e5) checks this. Tests (e1)–(e5) and (w8) pass in `verify.log`, along with the rest of the suite.

**Critical / High / Medium:** none.

**Low**
1. `SchemaEditor.tsx:136-141`: if `onSave` rejects, the `await` throws, `onClose` is never called, and nothing catches the promise from the `Done` click handler. This was already true before this change. A fix is `try { await onSave?.(); } catch { return; }`, or catching inside `MetadataPanel.handleSchemaChanged`, which already shows the toast.
2. `SchemaEditor.tsx:139`: clicking `Done` several times still starts several re-reads, because there is no busy state or re-entrancy guard. The doc says this is deferred to TM-B37. Each stale call now does nothing once its editor is unmounted, so no new harm, but TM-B37 is still open.
3. `tests/renderer/components/schema-change-during-folder-load.test.ts:334-361`: (w8) is a pin test for C-R33-01 from the previous round, bundled into this commit. It's fine to include, but the commit message should mention it so the history stays clear.
4. Docs: the line references I checked match the source (`:37`, `:39-44`, `:139`, `:140`, `:148`), and the README counts are consistent (17 entries, 9 fixed, 5 of the remaining 8 waiting on Saba's decision). No other issues.

No security or IPC surface changed. No leaks: the effect cleanup only resets a ref, and nothing subscribes.

**Architecture note (proposal only):** the stale-close problem comes from `MetadataPanel` passing an async `onSave` and then closing with a shared state setter. A cleaner contract would be to have `MetadataPanel` own the whole "save schema → re-read → close" flow. It would return a token or `AbortSignal` per open editor session, so the close step and the planned TM-B37 busy state come from one place. `SchemaEditor` would then just render `isSaving` and stop tracking whether it is mounted. Do this together with TM-B37 rather than as a separate refactor.