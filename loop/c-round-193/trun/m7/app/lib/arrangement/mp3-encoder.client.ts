import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const ARRANGEMENT_MP3_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

export interface ArrangementMp3Encoder {
  encode(wav: Blob, onProgress?: (fraction: number) => void): Promise<Blob>;
}

const MP3_INPUT_FILE = 'input.wav';
const MP3_OUTPUT_FILE = 'output.mp3';

let mp3EncoderGeneration = 0;
let mp3EncoderInstance: FFmpeg | null = null;
let mp3EncoderLoading: { ffmpeg: FFmpeg; promise: Promise<FFmpeg> } | null = null;

function arrangementMp3EncoderFor(ffmpeg: FFmpeg): ArrangementMp3Encoder {
  return {
    async encode(wav, onProgress) {
      const handleProgress = ({ progress }: { progress: number }) => {
        if (Number.isFinite(progress)) {
          onProgress?.(Math.min(1, Math.max(0, progress)));
        }
      };
      ffmpeg.on('progress', handleProgress);
      try {
        await ffmpeg.writeFile(MP3_INPUT_FILE, new Uint8Array(await wav.arrayBuffer()));
        const code = await ffmpeg.exec([
          '-i',
          MP3_INPUT_FILE,
          '-codec:a',
          'libmp3lame',
          '-b:a',
          '320k',
          '-q:a',
          '0',
          MP3_OUTPUT_FILE,
        ]);
        if (code !== 0) {
          throw new Error(`ffmpeg exit code ${code}`);
        }
        const data = await ffmpeg.readFile(MP3_OUTPUT_FILE);
        return new Blob([typeof data === 'string' ? data : new Uint8Array(data)], {
          type: 'audio/mpeg',
        });
      } finally {
        ffmpeg.off('progress', handleProgress);
        for (const path of [MP3_INPUT_FILE, MP3_OUTPUT_FILE]) {
          await ffmpeg.deleteFile(path).catch(() => undefined);
        }
      }
    },
  };
}

function assertArrangementMp3Generation(generation: number) {
  if (generation !== mp3EncoderGeneration) {
    throw new Error('MP3 encoder reset during load');
  }
}

async function loadArrangementMp3Core(ffmpeg: FFmpeg, generation: number): Promise<FFmpeg> {
  const blobUrls: string[] = [];
  try {
    const coreURL = await toBlobURL(
      `${ARRANGEMENT_MP3_CORE_BASE_URL}/ffmpeg-core.js`,
      'text/javascript',
    );
    blobUrls.push(coreURL);
    assertArrangementMp3Generation(generation);
    const wasmURL = await toBlobURL(
      `${ARRANGEMENT_MP3_CORE_BASE_URL}/ffmpeg-core.wasm`,
      'application/wasm',
    );
    blobUrls.push(wasmURL);
    assertArrangementMp3Generation(generation);
    await ffmpeg.load({ coreURL, wasmURL });
    return ffmpeg;
  } finally {
    for (const url of blobUrls) {
      URL.revokeObjectURL(url);
    }
  }
}

export function loadArrangementMp3Encoder(): Promise<ArrangementMp3Encoder> {
  if (mp3EncoderInstance) {
    return Promise.resolve(arrangementMp3EncoderFor(mp3EncoderInstance));
  }
  if (!mp3EncoderLoading) {
    const generation = mp3EncoderGeneration;
    const ffmpeg = new FFmpeg();
    const promise = loadArrangementMp3Core(ffmpeg, generation).then(
      (loaded) => {
        assertArrangementMp3Generation(generation);
        mp3EncoderLoading = null;
        mp3EncoderInstance = loaded;
        return loaded;
      },
      (reason: unknown) => {
        if (generation === mp3EncoderGeneration) {
          mp3EncoderLoading = null;
          ffmpeg.terminate();
        }
        throw reason;
      },
    );
    promise.catch(() => undefined);
    mp3EncoderLoading = { ffmpeg, promise };
  }
  return mp3EncoderLoading.promise.then(arrangementMp3EncoderFor);
}

export function resetArrangementMp3Encoder(): void {
  mp3EncoderGeneration += 1;
  const current = mp3EncoderLoading?.ffmpeg ?? mp3EncoderInstance;
  mp3EncoderLoading = null;
  mp3EncoderInstance = null;
  current?.terminate();
}
