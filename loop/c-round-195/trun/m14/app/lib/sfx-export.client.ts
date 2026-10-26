import {
  guardSfxExportMemory,
  type SfxExportProgress,
  type SfxExportRequest,
  type SfxExportResponse,
} from './sfx-export';

export function runSfxExport(
  request: SfxExportRequest,
  signal: AbortSignal,
  onProgress: (progress: SfxExportProgress) => void,
) {
  return new Promise<{ blob: Blob; overloaded: boolean }>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Export cancelled', 'AbortError'));
      return;
    }
    const guarded = guardSfxExportMemory(request);
    const worker = new Worker(new URL('./sfx-export.worker.ts', import.meta.url), {
      type: 'module',
    });
    const clean = () => {
      worker.terminate();
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      clean();
      reject(new DOMException('Export cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = (event: MessageEvent<SfxExportResponse>) => {
      if (event.data.type === 'progress') onProgress(event.data.progress);
      else {
        clean();
        if (event.data.type === 'complete') resolve(event.data);
        else reject(new Error(event.data.message));
      }
    };
    const fail = () => {
      clean();
      reject(
        new Error(
          'Export could not be prepared. Your scene is preserved. Try fewer sounds or a shorter scene.',
        ),
      );
    };
    worker.onerror = fail;
    worker.onmessageerror = fail;
    try {
      worker.postMessage(
        guarded,
        [...guarded.originals.values()].flatMap((audio) =>
          audio.channels.flatMap((channel) =>
            channel.buffer instanceof ArrayBuffer ? [channel.buffer] : [],
          ),
        ),
      );
    } catch (reason) {
      clean();
      reject(reason);
    }
  });
}
