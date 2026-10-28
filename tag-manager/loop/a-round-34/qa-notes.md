# QA round 34 — regression check for D-41 (SchemaEditor isMountedRef)

Scratch harness: vitest.qa.config.ts + qa-probe.test.ts + qa-setup.ts (copy of tests/renderer/setup.ts) + node_modules symlink, all in this dir.
Run: npx vitest run --config vitest.qa.config.ts (from this dir).

## Ran (confirmed), --testTimeout=60000 because concurrent gate loads the box
- schema-editor-stale-close.test.ts e1-e5: PASS
- schema-editor.test.ts: PASS; schema-change-during-folder-load.test.ts: PASS; metadata-panel-schema-change.test.ts: PASS
  (first combined run at 5s default timeout: timeouts + cascade failures = load artifact, not regression)
- P1 (non-strict + StrictMode): Done A during pending Open Folder, Back, reopen B, add field, Done B -> B closes after load, metadata has both fields. PASS
- P3 (StrictMode): Done A slow re-read, Back, reopen B, type; A lands -> B stays open with text. PASS
- P4: two Done clicks, slow re-reads -> closes after first, no throw. PASS
- P2: FAIL (pre-existing, not caused by fix) — see below.

## Finding QA-R34-01 (pre-existing, Low/Medium): concurrent schema re-reads, last-writer-wins with older schema
MetadataPanel.tsx:229 captures newSchema per call; :262 setMetadata(accumulated) / :266 setEditingMetadata unconditional
(only folderLoadId guard at :246, no schema-generation guard).
Repro: folder open, file selected; Customize Fields; add field Qone; Done (re-read #1 slow, schema [.., qone]);
Back; reopen; add Qtwo; Done (re-read #2 with qtwo); #2 lands -> editor closes; #1 lands last -> metadata/form for
all files lose qtwo values (schema still has qtwo). Shown empty until Rescan / next Done.
Save does not erase the chunk (metadata.ts:171 skips undefined), so display-only staleness.
Related to TM-B37 (two re-reads) but trigger is Back+reopen+edit, not double-click; fix independent of D-41.

## Added after review
- P5/P6 (non-strict + StrictMode): SchemaEditor alone, no folder, with async onSave / without onSave -> Done closes exactly once. PASS
- P7 (StrictMode): MetadataPanel with files=[] -> real handleSchemaChanged early return (:228) -> Done closes. PASS
- schema-editor.test.ts has no Done/onClose assertion (only renders with onClose noop); no-folder Done close was not pinned in repo tests before P5-P7.
- "Pre-existing" for QA-R34-01 is by inspection: the diff only adds the early return after `await onSave?.()`; handleSchemaChanged's read/apply path is unchanged. D-34 write-generation guard does not apply (no write occurs); only guard is isFolderLoadCurrent (:246).
- Timing hypothesis: under gate load e1 = 2.6s, e2 = 3.3s against the 5s default timeout (real timers + waitMs). The first combined run at default timeout hit timeouts and cascading failures. If the gate reports e1/e2 timeouts, the likely cause is machine load, not the fix. Still a flakiness risk.
