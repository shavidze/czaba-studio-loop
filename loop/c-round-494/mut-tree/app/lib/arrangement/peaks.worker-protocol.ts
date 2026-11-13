import { accumulatePeakChunk, peakBucketCount } from './peaks';

export type PeaksWorkerRequest =
  | { type: 'begin'; jobId: number; length: number; sampleRate: number; bucketsPerSecond: number }
  | {
      type: 'chunk';
      jobId: number;
      start: number;
      length: number;
      channels: Float32Array<ArrayBuffer>[];
    }
  | { type: 'end'; jobId: number }
  | { type: 'cancel'; jobId: number };

export type PeaksWorkerResponse =
  | { type: 'ack'; jobId: number; channels: Float32Array<ArrayBuffer>[] }
  | { type: 'done'; jobId: number; peaks: Float32Array<ArrayBuffer> };

interface PeaksWorkerJob {
  jobId: number;
  peaks: Float32Array<ArrayBuffer>;
  sampleRate: number;
  bucketsPerSecond: number;
}

export interface PeaksWorkerState {
  job: PeaksWorkerJob | null;
}

export function handlePeaksWorkerRequest(
  state: PeaksWorkerState,
  request: PeaksWorkerRequest,
  post: (response: PeaksWorkerResponse, transfer: ArrayBuffer[]) => void,
): void {
  if (request.type === 'begin') {
    state.job = {
      jobId: request.jobId,
      peaks: new Float32Array(
        peakBucketCount(request.length, request.sampleRate, request.bucketsPerSecond),
      ),
      sampleRate: request.sampleRate,
      bucketsPerSecond: request.bucketsPerSecond,
    };
    return;
  }
  const job = state.job;
  if (request.type === 'chunk') {
    if (job && job.jobId === request.jobId) {
      accumulatePeakChunk(
        job.peaks,
        request.channels,
        request.start,
        request.length,
        job.sampleRate,
        job.bucketsPerSecond,
      );
    }
    post(
      { type: 'ack', jobId: request.jobId, channels: request.channels },
      request.channels.map((channel) => channel.buffer),
    );
    return;
  }
  if (!job || job.jobId !== request.jobId) {
    return;
  }
  state.job = null;
  if (request.type === 'end') {
    post({ type: 'done', jobId: job.jobId, peaks: job.peaks }, [job.peaks.buffer]);
  }
}
