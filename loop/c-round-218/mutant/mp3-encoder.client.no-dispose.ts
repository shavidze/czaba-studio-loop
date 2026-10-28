import { registerMp3Encoder } from '@mediabunny/mp3-encoder';
import {
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp3OutputFormat,
  Output,
  Quality,
  WAVE,
} from 'mediabunny';

export interface ArrangementMp3Encoder {
  encode(wav: Blob, onProgress?: (fraction: number) => void): Promise<Blob>;
}

const ARRANGEMENT_MP3_BITRATE = 320_000;

interface ArrangementMp3Run {
  conversion: Conversion;
  isCancelled: boolean;
}

let mp3EncoderGeneration = 0;
let mp3EncoderLoadedGeneration: number | null = null;
let mp3EncoderLoading: { generation: number; promise: Promise<void> } | null = null;
const mp3EncoderRuns = new Set<ArrangementMp3Run>();

function assertArrangementMp3Generation(generation: number, reason: string) {
  if (generation !== mp3EncoderGeneration) {
    throw new Error(reason);
  }
}

async function encodeArrangementMp3(
  generation: number,
  wav: Blob,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  assertArrangementMp3Generation(generation, 'MP3 encoder was reset — load it again');
  const input = new Input({ formats: [WAVE], source: new BlobSource(wav) });
  try {
    const target = new BufferTarget();
    const output = new Output({ format: new Mp3OutputFormat(), target });
    const conversion = await Conversion.init({
      input,
      output,
      audio: { codec: 'mp3', quality: new Quality({ bitrate: ARRANGEMENT_MP3_BITRATE }) },
    });
    assertArrangementMp3Generation(generation, 'MP3 encoder reset during encode');
    const run: ArrangementMp3Run = { conversion, isCancelled: false };
    conversion.onProgress = (progress) => {
      if (!run.isCancelled && Number.isFinite(progress)) {
        onProgress?.(Math.min(1, Math.max(0, progress)));
      }
    };
    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map((discarded) => discarded.reason);
      throw new Error(`MP3 conversion is invalid (${reasons.join(', ') || 'no audio track'})`);
    }
    mp3EncoderRuns.add(run);
    try {
      await conversion.execute();
    } finally {
      mp3EncoderRuns.delete(run);
    }
    assertArrangementMp3Generation(generation, 'MP3 encoder reset during encode');
    if (!target.buffer) {
      throw new Error('MP3 encoder produced no data');
    }
    return new Blob([target.buffer], { type: 'audio/mpeg' });
  } finally {
  }
}

function arrangementMp3EncoderFor(generation: number): ArrangementMp3Encoder {
  return {
    encode(wav, onProgress) {
      return encodeArrangementMp3(generation, wav, onProgress);
    },
  };
}

async function registerArrangementMp3Encoder(generation: number): Promise<void> {
  await Promise.resolve();
  assertArrangementMp3Generation(generation, 'MP3 encoder reset during load');
  registerMp3Encoder();
}

export function loadArrangementMp3Encoder(): Promise<ArrangementMp3Encoder> {
  const generation = mp3EncoderGeneration;
  if (mp3EncoderLoadedGeneration === generation) {
    return Promise.resolve(arrangementMp3EncoderFor(generation));
  }
  if (!mp3EncoderLoading) {
    const promise = registerArrangementMp3Encoder(generation).then(
      () => {
        assertArrangementMp3Generation(generation, 'MP3 encoder reset during load');
        mp3EncoderLoading = null;
        mp3EncoderLoadedGeneration = generation;
      },
      (reason: unknown) => {
        if (generation === mp3EncoderGeneration) {
          mp3EncoderLoading = null;
        }
        throw reason;
      },
    );
    promise.catch(() => undefined);
    mp3EncoderLoading = { generation, promise };
  }
  const loading = mp3EncoderLoading;
  return loading.promise.then(() => arrangementMp3EncoderFor(loading.generation));
}

export function resetArrangementMp3Encoder(): void {
  mp3EncoderGeneration += 1;
  mp3EncoderLoading = null;
  mp3EncoderLoadedGeneration = null;
  for (const run of mp3EncoderRuns) {
    run.isCancelled = true;
    run.conversion.cancel().catch(() => undefined);
  }
  mp3EncoderRuns.clear();
}
