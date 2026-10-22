import { ArrangementExportCancelledError } from './export-cancel';
import {
  type ArrangementWavEncodeResponse,
  type ArrangementWavEncoding,
  encodeArrangementWav,
} from './export-wav';

export const ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE = 'WAV-ის ჩაწერა ვერ მოხერხდა (worker).';

export function encodeArrangementWavOffMainThread(
  channels: Float32Array[],
  sampleRate: number,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<ArrangementWavEncoding> {
  if (signal?.aborted) {
    return Promise.reject(new ArrangementExportCancelledError());
  }
  if (typeof Worker === 'undefined') {
    return Promise.resolve(encodeArrangementWav(channels, sampleRate, onProgress));
  }
  return new Promise<ArrangementWavEncoding>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./export-wav.worker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      reject(new Error(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE));
      return;
    }
    const handleAbort = () => {
      signal?.removeEventListener('abort', handleAbort);
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      reject(new ArrangementExportCancelledError());
    };
    signal?.addEventListener('abort', handleAbort);
    const fail = () => {
      signal?.removeEventListener('abort', handleAbort);
      worker.terminate();
      reject(new Error(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE));
    };
    worker.onmessage = (event: MessageEvent<ArrangementWavEncodeResponse>) => {
      const message = event.data;
      if (message.type === 'progress') {
        onProgress?.(message.fraction);
        return;
      }
      if (message.type === 'complete') {
        signal?.removeEventListener('abort', handleAbort);
        worker.terminate();
        resolve({
          bytes: message.bytes,
          peak: message.peak,
          clippedSamples: message.clippedSamples,
        });
        return;
      }
      fail();
    };
    worker.onerror = fail;
    worker.onmessageerror = fail;
    try {
      worker.postMessage(
        { channels, sampleRate },
        channels.map((channel) => channel.buffer).filter((buffer) => buffer instanceof ArrayBuffer),
      );
    } catch {
      fail();
    }
  });
}
