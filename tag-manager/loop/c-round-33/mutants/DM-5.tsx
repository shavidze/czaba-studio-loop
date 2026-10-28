import { Files, FileWarning, Save, Settings } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SchemaEditor } from '~/components/schema/SchemaEditor';
import { TemplatePicker } from '~/components/templates/TemplatePicker';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { isFolderLoadCurrent, useFileStore, useSelectedFiles } from '~/stores/file-store';
import { useMetadataStore } from '~/stores/metadata-store';
import { useSchemaStore } from '~/stores/schema-store';
import type { BatchWriteResult, FieldValue, WavMetadata } from '~/types';
import { TagsInput } from './TagsInput';

interface SchemaChunkRead {
  readGeneration: number;
  result: Record<string, WavMetadata>;
}

function buildReloadFailedToast(batchResult?: BatchWriteResult): string {
  if (!batchResult) return 'Tags saved, but reloading failed. Rescan to refresh.';
  if (batchResult.failed.length === 0) {
    return `Tags saved to ${batchResult.succeeded} files, but reloading failed. Rescan to refresh.`;
  }
  return `${batchResult.succeeded} saved, ${batchResult.failed.length} failed. Reloading failed. Rescan to refresh.`;
}

function isSameSelectionSet(startPaths: string[], currentPaths: string[]): boolean {
  const start = new Set(startPaths);
  const current = new Set(currentPaths);
  if (start.size !== current.size) return false;
  return [...start].every((path) => current.has(path));
}

function isSameFieldValue(a: FieldValue | undefined, b: FieldValue | undefined): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }
  return a === b;
}

function collectFieldsTypedDuringSave(
  startMetadata: Record<string, FieldValue>,
): Record<string, FieldValue> {
  const { editingMetadata, modifiedFields } = useMetadataStore.getState();
  const typed: Record<string, FieldValue> = {};
  for (const key of modifiedFields) {
    const current = editingMetadata[key];
    if (current !== undefined && !isSameFieldValue(current, startMetadata[key])) {
      typed[key] = current;
    }
  }
  return typed;
}

function mergeFieldsTypedDuringSave(typed: Record<string, FieldValue>): void {
  if (Object.keys(typed).length === 0) return;
  useMetadataStore.getState().mergeFields(typed);
}

function isListedPath(path: string): boolean {
  return useFileStore.getState().files.some((file) => file.path === path);
}

function waitForFolderLoadIdle(): Promise<void> {
  if (!useFileStore.getState().isScanning) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useFileStore.subscribe((state) => {
      if (state.isScanning) return;
      unsubscribe();
      resolve();
    });
  });
}

async function refreshSavedFileStats(writtenPaths: string[]): Promise<void> {
  const { folderPath, updateFileStats } = useFileStore.getState();
  if (folderPath === null) return;
  try {
    const scanned = await window.api.scanFolder(folderPath);
    const written = new Set(writtenPaths);
    updateFileStats(scanned.filter((entry) => written.has(entry.path)));
  } catch {
    return;
  }
}

export function MetadataPanel(): React.ReactElement {
  const selectedFiles = useSelectedFiles();
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  const metadata = useFileStore((s) => s.metadata);
  const setMetadata = useFileStore((s) => s.setMetadata);
  const updateFileMetadata = useFileStore((s) => s.updateFileMetadata);
  const editingMetadata = useMetadataStore((s) => s.editingMetadata);
  const setEditingMetadata = useMetadataStore((s) => s.setEditingMetadata);
  const updateField = useMetadataStore((s) => s.updateField);
  const isDirty = useMetadataStore((s) => s.isDirty);
  const isSaving = useMetadataStore((s) => s.isSaving);
  const setIsSaving = useMetadataStore((s) => s.setIsSaving);
  const showToast = useMetadataStore((s) => s.showToast);
  const fields = useSchemaStore((s) => s.fields);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);

  const isBatch = selectedFiles.length > 1;
  const prevSelectionRef = useRef<string>('');
  const skipSyncRef = useRef(false);

  useEffect(() => {
    const selectionKey = selectedPaths.join('\0');
    const selectionChanged = selectionKey !== prevSelectionRef.current;
    prevSelectionRef.current = selectionKey;

    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      if (!selectionChanged) return;
    }

    const hasEditingData = Object.keys(useMetadataStore.getState().editingMetadata).length > 0;
    if (!selectionChanged && isDirty && hasEditingData) return;

    if (selectionChanged && isDirty && hasEditingData) {
      showToast('Unsaved changes were discarded', 'error');
    }

    if (selectedPaths.length === 0) {
      setEditingMetadata({});
      return;
    }

    if (selectedPaths.length === 1) {
      const meta = metadata[selectedPaths[0]];
      if (meta) {
        setEditingMetadata({ ...meta });
      } else {
        setEditingMetadata({});
      }
      return;
    }

    setEditingMetadata({});
  }, [selectedPaths, metadata, setEditingMetadata, isDirty, showToast]);

  const handleSave = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    const startSelection = useFileStore.getState().selectedPaths;
    const isSelectionUnchanged = (): boolean =>
      isSameSelectionSet(startSelection, useFileStore.getState().selectedPaths);
    const startEditingMetadata = useMetadataStore.getState().editingMetadata;

    setIsSaving(true);
    try {
      if (selectedFiles.length === 1) {
        const path = selectedFiles[0].path;
        await window.api.writeMetadata(path, startEditingMetadata, fields);
        useFileStore.getState().markPathsWritten([path]);
        await refreshSavedFileStats([path]);
        let updated: WavMetadata;
        try {
          updated = await window.api.readMetadata(path, useSchemaStore.getState().fields);
        } catch {
          showToast(buildReloadFailedToast(), 'error');
          return;
        }
        const selectionUnchanged = isSelectionUnchanged();
        const typedDuringSave = selectionUnchanged
          ? collectFieldsTypedDuringSave(startEditingMetadata)
          : {};
        if (selectionUnchanged) skipSyncRef.current = true;
        if (isListedPath(path)) updateFileMetadata(path, updated);
        if (selectionUnchanged) setEditingMetadata({ ...updated });
        mergeFieldsTypedDuringSave(typedDuringSave);
        showToast('Tags saved', 'success');
      } else {
        const paths = selectedFiles.map((f) => f.path);
        const modified = useMetadataStore.getState().modifiedFields;
        const batchMeta: Partial<WavMetadata> = {};
        for (const key of modified) {
          if (startEditingMetadata[key] !== undefined) {
            batchMeta[key] = startEditingMetadata[key];
          }
        }
        const result = await window.api.writeMetadataBatch(paths, batchMeta, fields);
        const failedPaths = new Set(result.failed.map((f) => f.path));
        const writtenPaths = paths.filter((p) => !failedPaths.has(p));
        useFileStore.getState().markPathsWritten(writtenPaths);
        if (result.succeeded > 0) {
          await refreshSavedFileStats(writtenPaths);
        }

        let refreshed: Record<string, WavMetadata>;
        try {
          refreshed = await window.api.readMetadataBatch(paths, useSchemaStore.getState().fields);
        } catch {
          showToast(buildReloadFailedToast(result), 'error');
          return;
        }
        const savedEntries = Object.entries(refreshed).filter(
          ([path]) => !failedPaths.has(path) && isListedPath(path),
        );
        const selectionUnchanged = isSelectionUnchanged();
        if (savedEntries.length > 0 && selectionUnchanged) {
          skipSyncRef.current = true;
        }
        for (const [path, updated] of savedEntries) {
          updateFileMetadata(path, updated);
        }

        if (result.failed.length > 0) {
          showToast(`${result.succeeded} saved, ${result.failed.length} failed`, 'error');
        } else {
          if (selectionUnchanged) {
            const typedDuringSave = collectFieldsTypedDuringSave(startEditingMetadata);
            setEditingMetadata({});
            mergeFieldsTypedDuringSave(typedDuringSave);
          }
          showToast(`Tags saved to ${result.succeeded} files`, 'success');
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [selectedFiles, fields, setIsSaving, setEditingMetadata, showToast, updateFileMetadata]);

  const handleSchemaChanged = useCallback(async () => {
    const { files, folderLoadId: loadId } = useFileStore.getState();
    if (files.length === 0) return;
    const newSchema = useSchemaStore.getState().fields;
    const paths = files.map((f) => f.path);
    const CHUNK_SIZE = 50;
    const chunkReads: SchemaChunkRead[] = [];
    const keptPaths = new Set<string>();
    let failures = 0;
    for (let i = 0; i < paths.length; i += CHUNK_SIZE) {
      const chunk = paths.slice(i, i + CHUNK_SIZE);
      const readGeneration = useFileStore.getState().writeGeneration;
      try {
        const result = await window.api.readMetadataBatch(chunk, newSchema);
        chunkReads.push({ readGeneration, result });
      } catch {
        failures += chunk.length;
        for (const path of chunk) keptPaths.add(path);
      }
    }
    if (!isFolderLoadCurrent(loadId) || useFileStore.getState().files !== files) return;
    const { metadata: currentMetadata, pathWriteGenerations } = useFileStore.getState();
    const accumulated: Record<string, WavMetadata> = {};
    for (const { readGeneration, result } of chunkReads) {
      for (const [path, meta] of Object.entries(result)) {
        if ((pathWriteGenerations[path] ?? 0) > readGeneration) {
          keptPaths.add(path);
        } else {
          accumulated[path] = meta;
        }
      }
    }
    for (const path of keptPaths) {
      const currentEntry = currentMetadata[path];
      if (currentEntry) accumulated[path] = currentEntry;
    }
    setMetadata(accumulated);
    const currentSelection = useFileStore.getState().selectedPaths;
    if (currentSelection.length === 1) {
      const current = accumulated[currentSelection[0]];
      if (current && !keptPaths.has(currentSelection[0])) setEditingMetadata({ ...current });
    } else if (currentSelection.length > 1) {
      setEditingMetadata({});
    }
    if (failures > 0) {
      showToast(`Failed to read ${failures} files`, 'error');
    }
  }, [setMetadata, setEditingMetadata, showToast]);

  if (showSchemaEditor) {
    return <SchemaEditor onClose={() => setShowSchemaEditor(false)} onSave={handleSchemaChanged} />;
  }

  if (selectedFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-dim text-xs text-center px-6">
        <FileWarning className="h-8 w-8 mb-2 text-outline" />
        <p>Select a file to edit metadata</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-outline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isBatch ? (
              <>
                <Files className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">
                  {selectedFiles.length} files selected
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-foreground truncate">
                {selectedFiles[0].name}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSchemaEditor(true)}
            className="text-dim hover:text-foreground p-0.5 transition-colors"
            title="Customize Fields"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {fields.map((field) => {
          if (field.type === 'tags') {
            return (
              <TagsInput
                key={field.key}
                label={field.label}
                value={(editingMetadata[field.key] as string[]) ?? []}
                onChange={(v) => updateField(field.key, v)}
                placeholder={`Add ${field.label.toLowerCase()}...`}
              />
            );
          }

          if (field.type === 'number') {
            const numVal = editingMetadata[field.key];
            return (
              <Input
                key={field.key}
                label={field.label}
                type="number"
                value={numVal === 0 || numVal === undefined ? '' : numVal}
                onChange={(e) =>
                  updateField(field.key, e.target.value === '' ? 0 : Number(e.target.value) || 0)
                }
                placeholder={isBatch ? 'Multiple values' : '0'}
              />
            );
          }

          return (
            <Input
              key={field.key}
              label={field.label}
              value={(editingMetadata[field.key] as string) ?? ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={isBatch ? 'Multiple values' : ''}
            />
          );
        })}

        <div className="border-t border-outline pt-3">
          <TemplatePicker />
        </div>
      </div>

      <div className="p-3 border-t border-outline">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? 'Saving...' : isBatch ? `Save to ${selectedFiles.length} files` : 'Save Tags'}
        </Button>
      </div>
    </div>
  );
}
