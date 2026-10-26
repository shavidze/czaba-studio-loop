/**
 * Audio Encoder Web Worker
 *
 * Handles CPU-intensive audio encoding off the main thread:
 * - AudioBuffer to WAV conversion
 * - Peak normalization
 */

// Message types
interface EncodeWavMessage {
  type: 'encode-wav';
  channelData: Float32Array[];
  sampleRate: number;
  normalize: boolean;
}

interface ProgressMessage {
  type: 'progress';
  progress: number;
}

interface CompleteMessage {
  type: 'complete';
  blob: Blob;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

type WorkerMessage = EncodeWavMessage;
export type WorkerResponse = ProgressMessage | CompleteMessage | ErrorMessage;

// Listen for messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  if (type === 'encode-wav') {
    try {
      const { channelData, sampleRate, normalize } = event.data;
      await encodeWav(channelData, sampleRate, normalize);
    } catch (error) {
      const response: ErrorMessage = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      self.postMessage(response);
    }
  }
};

/**
 * Encode Float32Array channel data to WAV Blob
 */
async function encodeWav(
  channelData: Float32Array[],
  sampleRate: number,
  normalize: boolean,
): Promise<void> {
  const numberOfChannels = channelData.length;
  const length = channelData[0].length;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  // Report progress
  const reportProgress = (progress: number) => {
    const response: ProgressMessage = { type: 'progress', progress };
    self.postMessage(response);
  };

  reportProgress(10);

  // Step 1: Normalize if requested
  let processedData = channelData;
  if (normalize) {
    processedData = normalizeChannels(channelData);
    reportProgress(30);
  }

  // Step 2: Interleave channels
  reportProgress(40);
  const interleaved = new Float32Array(length * numberOfChannels);
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      interleaved[i * numberOfChannels + channel] = processedData[channel][i];
    }

    // Report progress every 10%
    if (i % Math.floor(length / 10) === 0) {
      reportProgress(40 + Math.floor((i / length) * 30));
    }
  }

  reportProgress(70);

  // Step 3: Create WAV buffer
  const dataLength = interleaved.length * bytesPerSample;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  reportProgress(80);

  // Step 4: Write audio data (convert float to int16)
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;

    // Report progress every 10%
    if (i % Math.floor(interleaved.length / 10) === 0) {
      reportProgress(80 + Math.floor((i / interleaved.length) * 15));
    }
  }

  reportProgress(95);

  // Step 5: Create Blob
  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });

  reportProgress(100);

  // Send result back
  const response: CompleteMessage = { type: 'complete', blob };
  self.postMessage(response);
}

/**
 * Normalize audio channels (peak normalization)
 */
function normalizeChannels(channelData: Float32Array[]): Float32Array[] {
  // Find peak across all channels
  let peak = 0;
  for (const channel of channelData) {
    for (let i = 0; i < channel.length; i++) {
      const abs = Math.abs(channel[i]);
      if (abs > peak) peak = abs;
    }
  }

  // If already at max or silent, return as-is
  if (peak === 0 || peak >= 0.99) return channelData;

  // Apply gain
  const gain = 0.99 / peak;
  return channelData.map((channel) => {
    const normalized = new Float32Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      normalized[i] = channel[i] * gain;
    }
    return normalized;
  });
}

/**
 * Helper: Write string to DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
