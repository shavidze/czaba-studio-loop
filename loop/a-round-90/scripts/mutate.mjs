import { readFileSync, writeFileSync } from 'node:fs';
const [, , root, id] = process.argv;
const ctx = `${root}/app/contexts/ArrangementContext.tsx`;
const dialog = `${root}/app/components/arrangement/ArrangementExportDialog.tsx`;
const graph = `${root}/app/lib/arrangement/graph.client.ts`;
const wav = `${root}/app/lib/arrangement/export-wav.client.ts`;
const swap = (file, from, to) => {
  const text = readFileSync(file, 'utf8');
  if (text.split(from).length !== 2) throw new Error(`pattern not unique for ${id}: ${from}`);
  writeFileSync(file, text.replace(from, to));
};
const muts = {
  a: () => swap(ctx, '    controller.abort();\n    exportAbortRef.current = null;', '    exportAbortRef.current = null;'),
  b: () => {
    swap(ctx, "        if (signal.aborted) {\n          return;\n        }\n        const url", '        const url');
    swap(ctx, "        if (signal.aborted) {\n          return;\n        }\n        try {\n          const files", '        try {\n          const files');
  },
  c: () => swap(graph, '          if (signal?.aborted) {\n            return;\n          }\n          Promise.resolve()', '          Promise.resolve()'),
  d: () => {
    swap(wav, '  if (signal?.aborted) {\n    return Promise.reject(new ArrangementExportCancelledError());\n  }\n', '');
    swap(wav, "    signal?.addEventListener('abort', handleAbort);\n", '');
  },
  e: () => swap(ctx, "        signal.addEventListener('abort', resetEncoderOnAbort, { once: true });\n", ''),
  f: () => swap(ctx, '        } catch {\n          if (signal.aborted) {\n            return;\n          }\n', '        } catch {\n'),
  g: () => swap(ctx, "      } finally {\n        if (exportAbortRef.current === controller) {\n          exportAbortRef.current = null;\n          exportProgress.setProgress(null);\n        }\n      }\n    },\n    [exportProgress],\n  );\n\n  const exportMp3", "      } finally {\n        exportProgress.setProgress(null);\n        if (exportAbortRef.current === controller) {\n          exportAbortRef.current = null;\n        }\n      }\n    },\n    [exportProgress],\n  );\n\n  const exportMp3"),
  h: () => swap(ctx, '  useEffect(() => {\n    return () => {\n      exportAbortRef.current?.abort();\n    };\n  }, []);\n', ''),
  i: () => swap(ctx, "          signal.removeEventListener('abort', resetEncoderOnAbort);\n          encoderSlot.module?.resetArrangementMp3Encoder();\n          setExportState({\n            phase: 'error',\n            message: `MP3-ის", "          signal.removeEventListener('abort', resetEncoderOnAbort);\n          setExportState({\n            phase: 'error',\n            message: `MP3-ის"),
  j: () => swap(graph, '.catch(rejectRender)', '.catch(() => undefined)'),
  k: () => swap(dialog, '              {isRendering ? (\n                <button\n                  type="button"\n                  data-testid="arrangement-export-cancel"', '              {exportState.phase !== null ? (\n                <button\n                  type="button"\n                  data-testid="arrangement-export-cancel"'),
  l: () => swap(dialog, '                  data-testid="arrangement-export-cancel"\n', '                  data-testid="arrangement-export-cancel"\n                  tabIndex={-1}\n'),
  m: () => swap(wav, '  if (signal?.aborted) {\n    return Promise.reject(new ArrangementExportCancelledError());\n  }\n', ''),
  n: () => swap(`${root}/app/lib/arrangement/export-cancel.ts`, '  work.catch(() => undefined);\n', ''),
};
if (id !== 'orig') muts[id]();
console.log(`applied ${id}`);
