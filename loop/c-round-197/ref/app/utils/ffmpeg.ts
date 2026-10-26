import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { debug } from '~/lib/debug';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;

/**
 * Load FFmpeg.wasm (lazy loading)
 * This downloads the FFmpeg core (~31MB) only when needed
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  // Return existing instance if already loaded
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  // Wait if currently loading
  if (isLoading) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (isLoaded && ffmpegInstance) {
          clearInterval(checkInterval);
          resolve(ffmpegInstance);
        }
      }, 100);
    });
  }

  isLoading = true;
  debug.log('📦 Loading FFmpeg.wasm...');

  try {
    const ffmpeg = new FFmpeg();

    // Load FFmpeg core from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    isLoaded = true;
    isLoading = false;

    debug.log('✅ FFmpeg.wasm loaded successfully');
    return ffmpeg;
  } catch (error) {
    isLoading = false;
    console.error('❌ Failed to load FFmpeg.wasm:', error);
    throw error;
  }
}

/**
 * Convert WAV Blob to MP3 Blob
 * @param wavBlob - Input WAV file as Blob
 * @param bitrate - MP3 bitrate (e.g., '128k', '192k', '320k')
 * @returns MP3 file as Blob
 */
export async function convertWavToMp3(wavBlob: Blob, bitrate: string = '320k'): Promise<Blob> {
  debug.log(`🔄 Converting WAV to MP3 (${bitrate})...`);

  const ffmpeg = await loadFFmpeg();

  try {
    // Write input WAV to FFmpeg virtual filesystem
    const inputFileName = 'input.wav';
    const outputFileName = 'output.mp3';

    await ffmpeg.writeFile(inputFileName, await fetchFile(wavBlob));

    debug.log('⚙️ Running FFmpeg conversion...');

    // Run FFmpeg command
    // -i input.wav: input file
    // -codec:a libmp3lame: use LAME MP3 encoder
    // -b:a 320k: bitrate
    // -q:a 0: highest quality
    await ffmpeg.exec([
      '-i',
      inputFileName,
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      '-q:a',
      '0',
      outputFileName,
    ]);

    // Read output MP3 from virtual filesystem
    const data = await ffmpeg.readFile(outputFileName);

    // Clean up virtual filesystem
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // Convert Uint8Array to Blob
    const mp3Blob = new Blob([typeof data === 'string' ? data : new Uint8Array(data)], {
      type: 'audio/mpeg',
    });

    debug.log('✅ MP3 conversion complete:', mp3Blob.size, 'bytes');
    return mp3Blob;
  } catch (error) {
    console.error('❌ FFmpeg conversion failed:', error);
    throw error;
  }
}

/**
 * Get FFmpeg progress (for future use)
 */
export function onFFmpegProgress(callback: (progress: number) => void) {
  if (ffmpegInstance) {
    ffmpegInstance.on('progress', ({ progress }) => {
      callback(progress * 100);
    });
  }
}
