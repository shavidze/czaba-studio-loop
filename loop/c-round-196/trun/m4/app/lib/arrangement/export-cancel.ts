import { studioExportStrings } from './strings';

export const ARRANGEMENT_EXPORT_CANCELLED_MESSAGE = studioExportStrings.exportCancelled;

export const ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE =
  studioExportStrings.exportCancelledEncoder;

export class ArrangementExportCancelledError extends Error {
  constructor(message = 'Export cancelled') {
    super(message);
    this.name = 'ArrangementExportCancelledError';
  }
}

export function isArrangementExportCancelledError(
  error: unknown,
): error is ArrangementExportCancelledError {
  return error instanceof ArrangementExportCancelledError;
}

export function raceArrangementExportAbort<T>(work: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) {
    return work;
  }
  work.catch(() => undefined);
  if (signal.aborted) {
    return Promise.reject(new ArrangementExportCancelledError());
  }
  return new Promise<T>((resolve, reject) => {
    const handleAbort = () => {
      signal.removeEventListener('abort', handleAbort);
      reject(new ArrangementExportCancelledError());
    };
    signal.addEventListener('abort', handleAbort);
    work.then(
      (value) => {
        signal.removeEventListener('abort', handleAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', handleAbort);
        reject(error);
      },
    );
  });
}
