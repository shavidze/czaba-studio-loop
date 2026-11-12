/**
 * Audio Encoder Utility
 *
 * Uses Web Worker for CPU-intensive encoding to avoid blocking the main thread.
 */

type ProgressCallback = (progress: number) => void;

/**
 * Encode AudioBuffer to WAV Blob using Web Worker
 */
export async function encodeAudioBufferToWav(
  buffer: AudioBuffer,
  normalize: boolean = false,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create worker
    const worker = new Worker(new URL('../workers/audio-encoder.worker.ts', import.meta.url), {
      type: 'module',
    });

    // Extract channel data and create copies for transfer
    // Using slice() to get transferable ArrayBuffers
    const channelData: Float32Array[] = [];
    const transferList: ArrayBuffer[] = [];

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      // Create a copy (original buffer stays with AudioContext)
      const copy = buffer.getChannelData(i).slice();
      channelData.push(copy);
      transferList.push(copy.buffer);
    }

    // Handle worker messages
    worker.onmessage = (event) => {
      const { type } = event.data;

      if (type === 'progress') {
        onProgress?.(event.data.progress);
      } else if (type === 'complete') {
        worker.terminate();
        resolve(event.data.blob);
      } else if (type === 'error') {
        worker.terminate();
        reject(new Error(event.data.error));
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    // Send data to worker with transferable objects
    // This MOVES the ArrayBuffers to worker (zero-copy), freeing main thread memory
    worker.postMessage(
      {
        type: 'encode-wav',
        channelData,
        sampleRate: buffer.sampleRate,
        normalize,
      },
      transferList, // ← ArrayBuffers are transferred, not copied!
    );
  });
}
