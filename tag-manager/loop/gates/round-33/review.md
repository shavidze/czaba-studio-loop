COMMIT: OK

The change does what it says, and I found no blocking problems. It fixes two bugs in `handleSchemaChanged`, the code that re-reads every file after you click Done in the schema editor:
- **A-R32-01:** clicking Done while another folder was opening re-read the old folder's file list and wrote those results over the new folder's data.
- **RR-R32-04:** a Rescan that started before Done finished last with the old schema and wiped the new field's values.

Done now waits until no folder load is running, then reads the file list and load ID at that moment with the current schema. The existing guard against a folder switch mid-read is unchanged.

What I checked:
- **No hang.** Each of the three load paths (Open Folder, Rescan, drop) sets `isScanning` to true right after it starts and clears it in `finally`, but only if it is still the current load. A superseded load leaves clearing to the load that replaced it, and Close Folder sets `isScanning` to false directly. App's `openFolder` waits for the schema for at most 5s and returns early once superseded, so waiting on the schema and waiting on the scan can't block each other. The subscription only resolves once `isScanning` is false and unsubscribes on the first such state.
- **No old file list.** Removing the `allFiles` selector removes the captured list, and the `useCallback` dependencies shrank to match. The `if (files.length === 0) return;` check is still there, just moved after the wait.
- **Not skipping or comparing lists was the right call.** The docs explain why: returning early while a scan runs would bring back RR-R32-04 (test w3). Comparing file-list identity would drop correct re-reads when a save's stats refresh replaces the files array (w7).
- **Tests:** w1–w7 cover Open Folder B, B's read rejecting, Rescan, Close Folder, Open Folder C taking over, no load running, and the stats refresh. They render the real `FolderBrowser` and `MetadataPanel` with deferred IPC promises, not heavy mocks. I didn't re-run them; the round's verify log and C's check already passed.
- **Conventions:** no comments in code, semicolons present, no `any`. Georgian docs, the STATE_MANAGEMENT primitive and the line-number references in docs/bugs/001 are updated together.

Findings (none blocking):
- **Medium — Done gives no feedback while it waits** (`SchemaEditor.tsx:128-131`). The docs record this (B-R32-01): Done keeps the editor open until the load and the re-read finish, but the button isn't disabled and shows no busy state. On a slow network folder it looks like nothing happened, and clicking again starts more re-reads. The second read is redundant rather than harmful, since both apply the same schema. Fix: keep a pending flag in `SchemaEditor.handleSave`, then disable Done and set `aria-busy` while it is pending.
- **Low — subscription can outlive the panel** (`MetadataPanel.tsx:64-73`). If `MetadataPanel` unmounts while waiting, the subscription stays until the next idle state and then runs the re-read anyway. That's harmless today because the panel is always mounted and the store calls are guarded, but it is a promise not tied to the component. Fix if that ever changes: accept an `AbortSignal` or check an unmount flag after the wait.
- **Low — undocumented edge case.** If schema loading fails on startup, a drop keeps `isScanning` true for up to 5s, so Done also waits up to 5s. This follows from D-40 but neither the docs nor the tests mention it. Worth one line in D-40.

Architecture note (proposal only): `handleSchemaChanged` and the three folder loads now coordinate through `isScanning`, `folderLoadId` and write generations spread over three files. A single "metadata read coordinator" in the file store would own the rules for whose read wins, and a schema change would simply start a new load. That would make D-38, D-39 and D-40 one mechanism and remove the waiting step. Worth considering before adding another read path.