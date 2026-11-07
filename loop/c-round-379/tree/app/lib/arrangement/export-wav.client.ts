import { ArrangementExportCancelledError } from './export-cancel';
import {
  type ArrangementWavEncodeResponse,
  type ArrangementWavEncoding,
  encodeArrangementWav,
} from './export-wav';
import { studioExportStrings } from './strings';

export const ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE = studioExportStrings.wavWorkerFailed;

export const ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS = 30_000;

export const ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE = studioExportStrings.wavWorkerStalled(
  ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS / 1000,
);

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
    let stallTimer = 0;
    const detachWorker = () => {
      window.clearTimeout(stallTimer);
      signal?.removeEventListener('abort', handleAbort);
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
    };
    const handleAbort = () => {
      detachWorker();
      reject(new ArrangementExportCancelledError());
    };
    signal?.addEventListener('abort', handleAbort);
    const fail = (workerMessage?: string) => {
      detachWorker();
      const detail = workerMessage?.trim();
      reject(
        new Error(
          detail
            ? `${ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE} ${detail}`
            : ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
        ),
      );
    };
    const handleStall = () => {
      detachWorker();
      reject(new Error(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE));
    };
    const armStallTimer = () => {
      window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(handleStall, ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS);
    };
    worker.onmessage = (event: MessageEvent<ArrangementWavEncodeResponse>) => {
      const message = event.data;
      if (message.type === 'progress') {
        armStallTimer();
        onProgress?.(message.fraction);
        return;
      }
      if (message.type === 'complete') {
        detachWorker();
        resolve({
          bytes: message.bytes,
          peak: message.peak,
          clippedSamples: message.clippedSamples,
        });
        return;
      }
      fail(message.message);
    };
    worker.onerror = () => fail();
    worker.onmessageerror = () => fail();
    try {
      worker.postMessage(
        { channels, sampleRate },
        channels.map((channel) => channel.buffer).filter((buffer) => buffer instanceof ArrayBuffer),
      );
    } catch {
      fail();
      return;
    }
    armStallTimer();
  });
}
