import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE,
  ARRANGEMENT_EXPORT_CANCELLED_MESSAGE,
} from '../export-cancel';
import { formatArrangementExportProgress } from '../export-progress';
import {
  ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE,
  ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS,
  ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE,
} from '../export-wav.client';
import { studioExportStrings } from '../strings';

const GEORGIAN_CODEPOINT = /[Ⴀ-ჿ]/;

const EXPECTED_PLAIN_STRINGS: Record<string, string> = {
  formatButtonWav: 'Export WAV',
  formatButtonMp3: 'Export MP3',
  formatButtonBoth: 'Export WAV + MP3',
  formatCreatesWav: 'WAV will be created',
  formatCreatesMp3: 'MP3 will be created',
  formatCreatesBoth: 'WAV and MP3 will be created',
  formatLegend: 'Format',
  scopeLegend: 'Range',
  rangeOptionName: 'Time selection',
  bothOptionName: 'WAV + MP3 · two files',
  videoOptionName: 'Video (with audio)',
  mp3FormatNote:
    'LAME (ffmpeg.wasm) — the encoder loads from a CDN on the first MP3 export (~31 MB)',
  bothFormatNote:
    'The same mix as two files — either both are created or neither. Your browser may ask for permission to download the second file.',
  rangeMissingReason: 'Make a time selection in the Arrangement (drag on a clip or on the ruler)',
  videoRenderReason:
    "Video is not rendered in this cycle — the export is audio only (the video's original sound is included if it is on).",
  videoFadesPreviewNote:
    'Video fades are preview only — video is not rendered, the export is audio only.',
  wavNoteRangeLoop: 'Time selection played straight through, with the same mix — loop is ignored',
  wavNoteRange: 'Time selection, the same graph as playback',
  wavNoteProjectLoop:
    'Entire project played straight through from 0 to the end, with the same mix — loop is ignored',
  wavNoteProject: 'Entire project, the same graph as playback',
  videoSoundDecoding: 'Decoding — please wait',
  videoSoundUnreadable: "The video's sound could not be read — it is not in the export",
  videoSoundIncluded: 'Included',
  videoSoundOff: 'Off (M/Solo)',
  emptyProjectNote: 'Export is disabled: the project is empty — add at least one clip.',
  progressAriaLabel: 'Export progress',
  cancelButton: 'Cancel',
  closeButton: 'Close',
  busyButton: 'Rendering…',
  progressEncoderLoad: 'Loading MP3 encoder…',
  exportCancelled: 'Export cancelled — No file was created.',
  exportCancelledEncoder:
    'Export cancelled — No file was created. The MP3 encoder will load again on the next MP3 export.',
  wavWorkerFailed: 'Writing WAV failed (worker).',
  emptyProjectError: 'The project is empty — export needs at least one clip.',
  masterMutedSuffix: ' Master is muted — the file is silent.',
  emptyProjectNoFile: 'The project is empty — No file was created.',
  videoDecodingNoFile:
    "The video's sound is still decoding — wait and try again. No file was created.",
  invalidRangeNoFile: 'The range is invalid — No file was created.',
  renderingWav: 'Rendering and creating a 24-bit WAV…',
  encoderLoading: 'Loading the MP3 encoder (ffmpeg.wasm, ~31 MB the first time)…',
  encoderLoadFailed:
    'The MP3 encoder failed to load (ffmpeg.wasm, unpkg CDN) — No file was created. Check your internet connection and try again, or choose WAV.',
  mp3Encoding: 'Creating MP3…',
};

const s = studioExportStrings;

const FORMATTER_SAMPLES: Record<string, string[]> = {
  rangeSeconds: [s.rangeSeconds(4), s.rangeSeconds(0.5)],
  projectScope: [s.projectScope('0:00', '00:20.000'), s.projectScope('00:00.000', '01:02.500')],
  rangeScope: [s.rangeScope('00:04.000 — 00:09.000 (5.000 s)'), s.rangeScope('x')],
  loopRangeNote: [s.loopRangeNote({ start: '00:04.000', end: '00:09.000', seconds: '5.000 s' })],
  loopProjectNote: [s.loopProjectNote('00:00.000', '00:20.000')],
  videoSoundLabel: [s.videoSoundLabel('clip.mp4'), s.videoSoundLabel('')],
  noSoundNote: [s.noSoundNote(s.formatCreatesWav, '00:20.000')],
  masterMutedNote: [s.masterMutedNote(s.formatCreatesMp3, '5.000 s')],
  masterGainNote: [s.masterGainNote('−6.0 dB')],
  progressRendering: [s.progressRendering(0), s.progressRendering(57)],
  progressWavWrite: [s.progressWavWrite(0), s.progressWavWrite(57)],
  progressMp3Encode: [s.progressMp3Encode(0), s.progressMp3Encode(57)],
  wavWorkerStalled: [s.wavWorkerStalled(30), s.wavWorkerStalled(45)],
  overloadWarning: [
    s.overloadWarning({ peakDb: '0.8', clippedSamples: 3, reductionDb: '0.9' }),
    s.overloadWarning({ peakDb: '0.0', clippedSamples: 1, reductionDb: '0.1' }),
  ],
  exportedRange: [s.exportedRange({ start: '00:04.000', end: '00:09.000', seconds: '5.000 s' })],
  wavDone: [s.wavDone('00:20.000', ''), s.wavDone('00:20.000', s.masterMutedSuffix)],
  mp3Done: [s.mp3Done('00:20.000', ''), s.mp3Done('00:20.000', s.masterMutedSuffix)],
  bothDone: [s.bothDone('00:20.000', ''), s.bothDone('00:20.000', s.masterMutedSuffix)],
  exportFailed: [s.exportFailed('boom'), s.exportFailed('')],
  mp3Failed: [s.mp3Failed('lame exploded'), s.mp3Failed('')],
  encoderLoadTimeout: [s.encoderLoadTimeout(120), s.encoderLoadTimeout(5)],
};

function stripSourceComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function readStoreSource(relativePath: string): string {
  return readFileSync(resolve(__dirname, relativePath), 'utf8');
}

describe('studioExportStrings (V-0.1)', () => {
  it('ST1: every plain-string property equals its exact English literal', () => {
    const plainKeys = Object.entries(studioExportStrings)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(studioExportStrings)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_PLAIN_STRINGS[key]);
      }
    }
    expect(s.formatLegend).toBe('Format');
    expect(s.scopeLegend).toBe('Range');
    expect(s.rangeOptionName).toBe('Time selection');
    expect(s.cancelButton).toBe('Cancel');
    expect(s.closeButton).toBe('Close');
    expect(s.busyButton).toBe('Rendering…');
    expect(s.progressAriaLabel).toBe('Export progress');
    expect(s.videoSoundIncluded).toBe('Included');
    expect(s.videoSoundOff).toBe('Off (M/Solo)');
    expect(s.videoSoundDecoding).toBe('Decoding — please wait');
    expect(s.videoOptionName).toBe('Video (with audio)');
  });

  it('ST2: every formatter returns the exact English text for its inputs', () => {
    expect(s.rangeSeconds(4)).toBe('4.000 s');
    expect(s.rangeSeconds(0.5)).toBe('0.500 s');
    expect(s.projectScope('0:00', '00:20.000')).toBe('Entire project · 0:00 — 00:20.000');
    expect(s.projectScope('00:00.000', '01:02.500')).toBe('Entire project · 00:00.000 — 01:02.500');
    expect(s.rangeScope('00:04.000 — 00:09.000 (5.000 s)')).toBe(
      'Time selection · 00:04.000 — 00:09.000 (5.000 s)',
    );
    expect(s.rangeScope('x')).toBe('Time selection · x');
    expect(s.loopRangeNote({ start: '00:04.000', end: '00:09.000', seconds: '5.000 s' })).toBe(
      'Loop does not change the export — the time selection is created (00:04.000 — 00:09.000, 5.000 s).',
    );
    expect(s.loopRangeNote({ start: '00:01.000', end: '00:02.000', seconds: '1.000 s' })).toBe(
      'Loop does not change the export — the time selection is created (00:01.000 — 00:02.000, 1.000 s).',
    );
    expect(s.loopProjectNote('00:00.000', '00:20.000')).toBe(
      'Loop does not change the export — the entire project is created (00:00.000 — 00:20.000).',
    );
    expect(s.loopProjectNote('00:00.000', '00:07.250')).toBe(
      'Loop does not change the export — the entire project is created (00:00.000 — 00:07.250).',
    );
    expect(s.videoSoundLabel('clip.mp4')).toBe('Original video sound (clip.mp4):');
    expect(s.videoSoundLabel('ფილმი.mov')).toBe('Original video sound (ფილმი.mov):');
    expect(s.noSoundNote('WAV will be created', '00:20.000')).toBe(
      'There is no clip with sound in the project — WAV will be created with 00:20.000 of silence.',
    );
    expect(s.noSoundNote('MP3 will be created', '5.000 s')).toBe(
      'There is no clip with sound in the project — MP3 will be created with 5.000 s of silence.',
    );
    expect(s.masterMutedNote('WAV will be created', '00:20.000')).toBe(
      'Master is muted (M) — WAV will be created with 00:20.000 of silence. Unmute Master if you need sound.',
    );
    expect(s.masterMutedNote('WAV and MP3 will be created', '5.000 s')).toBe(
      'Master is muted (M) — WAV and MP3 will be created with 5.000 s of silence. Unmute Master if you need sound.',
    );
    expect(s.masterGainNote('−6.0 dB')).toBe('Master: −6.0 dB — included in the export.');
    expect(s.masterGainNote('+3.0 dB')).toBe('Master: +3.0 dB — included in the export.');
    expect(s.progressRendering(0)).toBe('Rendering · 0%');
    expect(s.progressRendering(57)).toBe('Rendering · 57%');
    expect(s.progressWavWrite(0)).toBe('Writing WAV · 0%');
    expect(s.progressWavWrite(57)).toBe('Writing WAV · 57%');
    expect(s.progressMp3Encode(0)).toBe('Creating MP3 · 0%');
    expect(s.progressMp3Encode(57)).toBe('Creating MP3 · 57%');
    expect(formatArrangementExportProgress({ phase: 'render', fraction: 0 })).toBe(
      'Rendering · 0%',
    );
    expect(formatArrangementExportProgress({ phase: 'render', fraction: 0.575 })).toBe(
      'Rendering · 57%',
    );
    expect(formatArrangementExportProgress({ phase: 'wav', fraction: 0 })).toBe('Writing WAV · 0%');
    expect(formatArrangementExportProgress({ phase: 'wav', fraction: 0.575 })).toBe(
      'Writing WAV · 57%',
    );
    expect(formatArrangementExportProgress({ phase: 'load', fraction: 0 })).toBe(
      'Loading MP3 encoder…',
    );
    expect(formatArrangementExportProgress({ phase: 'load', fraction: 0.575 })).toBe(
      'Loading MP3 encoder…',
    );
    expect(formatArrangementExportProgress({ phase: 'mp3', fraction: 0 })).toBe(
      'Creating MP3 · 0%',
    );
    expect(formatArrangementExportProgress({ phase: 'mp3', fraction: 0.575 })).toBe(
      'Creating MP3 · 57%',
    );
    expect(s.wavWorkerStalled(30)).toBe(
      'Writing WAV stalled — the worker has not responded for 30 seconds.',
    );
    expect(s.wavWorkerStalled(45)).toBe(
      'Writing WAV stalled — the worker has not responded for 45 seconds.',
    );
    expect(s.overloadWarning({ peakDb: '0.8', clippedSamples: 3, reductionDb: '0.9' })).toBe(
      'Overload: peak +0.8 dBFS — 3 samples clipped to 0 dBFS. Lower Master by at least 0.9 dB and export again.',
    );
    expect(s.overloadWarning({ peakDb: '1.6', clippedSamples: 2, reductionDb: '1.6' })).toBe(
      'Overload: peak +1.6 dBFS — 2 samples clipped to 0 dBFS. Lower Master by at least 1.6 dB and export again.',
    );
    expect(s.overloadWarning({ peakDb: '0.0', clippedSamples: 1, reductionDb: '0.1' })).toBe(
      'Overload: peak +0.0 dBFS — 1 sample clipped to 0 dBFS. Lower Master by at least 0.1 dB and export again.',
    );
    expect(s.overloadWarning({ peakDb: '1.7', clippedSamples: 12, reductionDb: '1.8' })).toBe(
      'Overload: peak +1.7 dBFS — 12 samples clipped to 0 dBFS. Lower Master by at least 1.8 dB and export again.',
    );
    expect(s.exportedRange({ start: '00:04.000', end: '00:09.000', seconds: '5.000 s' })).toBe(
      'range 00:04.000 — 00:09.000 (5.000 s)',
    );
    expect(s.exportedRange({ start: '00:00.000', end: '00:04.000', seconds: '4.000 s' })).toBe(
      'range 00:00.000 — 00:04.000 (4.000 s)',
    );
    expect(s.wavDone('00:20.000', '')).toBe('WAV created: 00:20.000, 24-bit · 48 kHz · stereo.');
    expect(s.wavDone('00:20.000', s.masterMutedSuffix)).toBe(
      'WAV created: 00:20.000, 24-bit · 48 kHz · stereo. Master is muted — the file is silent.',
    );
    expect(s.mp3Done('00:20.000', '')).toBe('MP3 created: 00:20.000, 48 kHz · stereo.');
    expect(s.mp3Done('range 00:04.000 — 00:09.000 (5.000 s)', s.masterMutedSuffix)).toBe(
      'MP3 created: range 00:04.000 — 00:09.000 (5.000 s), 48 kHz · stereo. Master is muted — the file is silent.',
    );
    expect(s.bothDone('00:20.000', '')).toBe(
      'WAV and MP3 created: 00:20.000, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.',
    );
    expect(s.bothDone('00:20.000', s.masterMutedSuffix)).toBe(
      'WAV and MP3 created: 00:20.000, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo. Master is muted — the file is silent.',
    );
    expect(s.exportFailed('boom')).toBe('Export failed — No file was created. boom');
    expect(s.exportFailed('')).toBe('Export failed — No file was created. ');
    expect(s.mp3Failed('lame exploded')).toBe(
      'Creating MP3 failed — No file was created. lame exploded',
    );
    expect(s.mp3Failed('')).toBe('Creating MP3 failed — No file was created. ');
    expect(s.encoderLoadTimeout(120)).toBe(
      'The MP3 encoder did not load within 120 seconds — No file was created. Check your internet connection and try again, or choose WAV.',
    );
    expect(s.encoderLoadTimeout(5)).toBe(
      'The MP3 encoder did not load within 5 seconds — No file was created. Check your internet connection and try again, or choose WAV.',
    );
  });

  it('ST3: no string or formatter output in the module contains a Georgian codepoint', () => {
    const formatterKeys = Object.entries(studioExportStrings)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();
    expect(formatterKeys).toEqual(Object.keys(FORMATTER_SAMPLES).sort());
    for (const [key, value] of Object.entries(studioExportStrings)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
    for (const [key, outputs] of Object.entries(FORMATTER_SAMPLES)) {
      expect(outputs.length, key).toBeGreaterThan(0);
      for (const output of outputs) {
        expect(output, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
  });

  it('ST4: the Export sources contain no Georgian codepoint outside comments', () => {
    const wholeFiles = [
      '../../../components/arrangement/ArrangementExportDialog.tsx',
      '../export-progress.ts',
      '../export-cancel.ts',
      '../export-wav.client.ts',
      '../graph.client.ts',
      '../strings.ts',
    ];
    for (const path of wholeFiles) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GEORGIAN_CODEPOINT);
    }
    const context = readStoreSource('../../../contexts/ArrangementContext.tsx');
    const start = context.indexOf('const exportWav = useCallback(');
    const end = context.indexOf('const cancelExport = useCallback(');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(stripSourceComments(context.slice(start, end))).not.toMatch(GEORGIAN_CODEPOINT);
    const suffixLine = context
      .split(/\r?\n/)
      .find((line) => line.startsWith('const MASTER_MUTED_EXPORT_SUFFIX'));
    expect(suffixLine).toBeDefined();
    expect(suffixLine ?? '').not.toMatch(GEORGIAN_CODEPOINT);
  });

  it('ST5: the existing exported message constants alias the module values', () => {
    expect(ARRANGEMENT_EXPORT_CANCELLED_MESSAGE).toBe(s.exportCancelled);
    expect(ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE).toBe(s.exportCancelledEncoder);
    expect(ARRANGEMENT_WAV_WORKER_FAILED_MESSAGE).toBe(s.wavWorkerFailed);
    expect(ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE).toBe(
      s.wavWorkerStalled(ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS / 1000),
    );
  });
});
