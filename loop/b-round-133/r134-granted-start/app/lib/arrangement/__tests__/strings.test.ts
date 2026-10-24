import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  GESTURE_EDIT_BLOCKED_MESSAGE,
  GESTURE_UNDO_BLOCKED_MESSAGE,
  NUDGE_AT_TIME_START_MESSAGE,
  playPastEndMessage,
  WEB_AUDIO_UNAVAILABLE_MESSAGE,
} from '~/contexts/ArrangementContext';
import type { ArrangementTrackGroup } from '~/types/arrangement';
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
import {
  TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE,
  TRACK_GROUP_NAME_PREFIX,
  trackGroupCreatedMessage,
  trackGroupDissolvedMessage,
  trackGroupRefusalMessage,
} from '../groups';
import { METRONOME_NEEDS_TEMPO_TITLE, METRONOME_TITLE, metronomeStatusMessage } from '../metronome';
import { CLIP_LANE_REFUSAL_MESSAGES, GROUP_MOVE_BLOCKED_MESSAGE } from '../selection';
import {
  studioEditStrings,
  studioExportStrings,
  studioLaneMoveStrings,
  studioLibraryStrings,
  studioLoopStrings,
  studioMetronomeStrings,
  studioMoveStrings,
  studioPlaybackStrings,
  studioTempoStrings,
  studioTrackGroupStrings,
  studioVideoStrings,
  studioViewStrings,
} from '../strings';
import { TEMPO_EMPTY_HINT, TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';
import { audioFileRejectionMessage, unsupportedFileMessage } from '../video';
import { videoAudioNote, videoProbeErrorMessage } from '../video.client';
import { formatZoomReadout } from '../view';

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
    "Video is not rendered in this version — the export is audio only (the video's original sound is included if it is on).",
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
  closeButton: 'Done',
  busyButton: 'Rendering…',
  progressEncoderLoad: 'Loading MP3 encoder…',
  exportCancelled: 'Export cancelled — no file was created.',
  exportCancelledEncoder:
    'Export cancelled — no file was created. The MP3 encoder will load again on the next MP3 export.',
  wavWorkerFailed: 'Writing WAV failed (worker).',
  emptyProjectError: 'The project is empty — export needs at least one clip.',
  masterMutedSuffix: ' Master is muted — the file is silent.',
  emptyProjectNoFile: 'The project is empty — no file was created.',
  videoDecodingNoFile:
    "The video's sound is still decoding — wait and try again. No file was created.",
  invalidRangeNoFile: 'The time selection is invalid — no file was created.',
  renderingWav: 'Rendering and creating a 24-bit WAV…',
  encoderLoading: 'Loading the MP3 encoder (ffmpeg.wasm, ~31 MB the first time)…',
  encoderLoadFailed:
    'The MP3 encoder failed to load (ffmpeg.wasm, unpkg CDN) — no file was created. Check your internet connection and try again, or choose WAV.',
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
    expect(s.closeButton).toBe('Done');
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
      'Loop does not change the export — the time selection is exported (00:04.000 — 00:09.000, 5.000 s).',
    );
    expect(s.loopRangeNote({ start: '00:01.000', end: '00:02.000', seconds: '1.000 s' })).toBe(
      'Loop does not change the export — the time selection is exported (00:01.000 — 00:02.000, 1.000 s).',
    );
    expect(s.loopProjectNote('00:00.000', '00:20.000')).toBe(
      'Loop does not change the export — the entire project is exported (00:00.000 — 00:20.000).',
    );
    expect(s.loopProjectNote('00:00.000', '00:07.250')).toBe(
      'Loop does not change the export — the entire project is exported (00:00.000 — 00:07.250).',
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
      'time selection 00:04.000 — 00:09.000 (5.000 s)',
    );
    expect(s.exportedRange({ start: '00:00.000', end: '00:04.000', seconds: '4.000 s' })).toBe(
      'time selection 00:00.000 — 00:04.000 (4.000 s)',
    );
    expect(s.wavDone('00:20.000', '')).toBe('WAV created: 00:20.000, 24-bit · 48 kHz · stereo.');
    expect(s.wavDone('00:20.000', s.masterMutedSuffix)).toBe(
      'WAV created: 00:20.000, 24-bit · 48 kHz · stereo. Master is muted — the file is silent.',
    );
    expect(s.mp3Done('00:20.000', '')).toBe('MP3 created: 00:20.000, 48 kHz · stereo.');
    expect(s.mp3Done('time selection 00:04.000 — 00:09.000 (5.000 s)', s.masterMutedSuffix)).toBe(
      'MP3 created: time selection 00:04.000 — 00:09.000 (5.000 s), 48 kHz · stereo. Master is muted — the file is silent.',
    );
    expect(s.bothDone('00:20.000', '')).toBe(
      'WAV and MP3 created: 00:20.000, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.',
    );
    expect(s.bothDone('00:20.000', s.masterMutedSuffix)).toBe(
      'WAV and MP3 created: 00:20.000, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo. Master is muted — the file is silent.',
    );
    expect(s.exportFailed('boom')).toBe('Export failed — no file was created. boom');
    expect(s.exportFailed('')).toBe('Export failed — no file was created. ');
    expect(s.mp3Failed('lame exploded')).toBe(
      'Creating MP3 failed — no file was created. lame exploded',
    );
    expect(s.mp3Failed('')).toBe('Creating MP3 failed — no file was created. ');
    expect(s.encoderLoadTimeout(120)).toBe(
      'The MP3 encoder did not load within 120 seconds — no file was created. Check your internet connection and try again, or choose WAV.',
    );
    expect(s.encoderLoadTimeout(5)).toBe(
      'The MP3 encoder did not load within 5 seconds — no file was created. Check your internet connection and try again, or choose WAV.',
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

const EXPECTED_EDIT_PLAIN_STRINGS: Record<string, string> = {
  splitAllTracksRefused:
    'Split does not work on a selection across all tracks — make a time selection on one track.',
  splitMissesSelection: 'The playhead does not cross any selected clip.',
  splitRangeFailed: 'Could not split at the time selection.',
  historySplitRange: 'Split at time selection',
  splitRangeDone: 'Clip split at both edges of the time selection; the middle part is selected.',
  splitNeedsTarget:
    'To split, select a clip and place the playhead inside it, or make a time selection.',
  splitPlayheadOutside: 'The playhead must be inside the selected clip.',
  historySplit: 'Split',
  deleteRangeEmpty: 'Nothing to delete in the time selection — nothing changed.',
  historyDeleteRange: 'Delete time selection',
  historyDeleteRangeAllTracks: 'Delete time selection (all tracks)',
  onAllTracks: 'on all tracks',
  deleteNeedsTarget: 'To delete, select a clip or make a time selection.',
  historyDeleteClip: 'Delete clip',
  deleteClipDone: 'Clip deleted; the gap remains.',
  extendNeedsRange: 'Make a time selection first to extend it to all tracks (Ctrl+Shift+L).',
  duplicateRangeRefused: 'Duplicate works on clips; there is no Duplicate Time.',
  duplicateNeedsClip: 'Select a clip to duplicate.',
  copyRangeEmpty: 'No sound to copy in the time selection — the clipboard did not change.',
  allTracks: 'all tracks',
  copyNeedsTarget:
    'To copy, select a clip or make a time selection — the clipboard did not change.',
  cutRangeEmpty: 'No sound to cut in the time selection — nothing changed.',
  cutNeedsTarget: 'To cut, select a clip or make a time selection.',
  cutTimeNeedsRange: 'Make a time selection first for Cut Time (Ctrl+Shift+X).',
  cutTimeNoSound: 'no sound in the time selection, the clipboard did not change',
  loopRemoved: 'The loop range was shorter than 0.1 s after the deletion, so it was removed.',
  pasteMissing: 'Paste failed: the source or track is unavailable. Nothing changed.',
  clipboardEmpty: 'The clipboard is empty — Copy or Cut first.',
};

const e = studioEditStrings;

const EDIT_FORMATTER_SAMPLES: Record<string, string[]> = {
  historySplitClips: [e.historySplitClips(1), e.historySplitClips(3)],
  splitClipsDone: [
    e.splitClipsDone({ count: 1, time: '00:02.500' }),
    e.splitClipsDone({ count: 3, time: '00:02.500' }),
  ],
  splitDone: [e.splitDone('00:02.500')],
  deleteRangeDone: [
    e.deleteRangeDone({ start: '00:03.000', end: '00:05.000', lanes: e.onTrack('SFX') }),
    e.deleteRangeDone({ start: '00:03.000', end: '00:05.000', lanes: e.onTrack('—') }),
    e.deleteRangeDone({ start: '00:01.000', end: '00:05.000', lanes: e.onAllTracks }),
  ],
  onTrack: [e.onTrack('SFX'), e.onTrack('—')],
  historyDeleteClips: [e.historyDeleteClips(1), e.historyDeleteClips(3)],
  deleteClipsDone: [e.deleteClipsDone(1), e.deleteClipsDone(3)],
  extendDone: [e.extendDone({ start: '00:01.000', end: '00:03.000' })],
  duplicateConflict: [
    e.duplicateConflict({ track: 'SFX', start: '00:08.000', end: '00:16.000' }),
    e.duplicateConflict({ track: '—', start: '00:08.000', end: '00:16.000' }),
  ],
  historyDuplicate: [e.historyDuplicate(1), e.historyDuplicate(3)],
  duplicateDone: [
    e.duplicateDone({ count: 1, from: '00:08.000' }),
    e.duplicateDone({ count: 3, from: '00:08.000' }),
  ],
  copyRangeDone: [
    e.copyRangeDone({ lane: 'SFX', start: '00:03.000', end: '00:05.000', parts: 1 }),
    e.copyRangeDone({ lane: e.allTracks, start: '00:03.000', end: '00:05.000', parts: 3 }),
  ],
  copyClipsDone: [e.copyClipsDone(1), e.copyClipsDone(3)],
  cutDone: [e.cutDone(1), e.cutDone(3)],
  cutTimeNothing: [e.cutTimeNothing({ start: '00:15.000', end: '00:15.000' })],
  cutTimeParts: [e.cutTimeParts(1), e.cutTimeParts(3)],
  markersRemoved: [e.markersRemoved(1), e.markersRemoved(3)],
  cutTimeDone: [
    e.cutTimeDone({
      start: '00:24.000',
      end: '00:26.000',
      clipboard: e.cutTimeNoSound,
      suffix: '',
    }),
    e.cutTimeDone({
      start: '00:10.000',
      end: '00:20.000',
      clipboard: e.cutTimeParts(3),
      suffix: ` ${e.loopRemoved}${e.markersRemoved(1)}`,
    }),
  ],
  pasteOverlap: [
    e.pasteOverlap({ track: 'SFX', start: '00:20.000', end: '00:22.000' }),
    e.pasteOverlap({ track: '—', start: '00:20.000', end: '00:22.000' }),
  ],
  pasteLaneKind: [
    e.pasteLaneKind({ track: 'SFX', at: '00:40.000' }),
    e.pasteLaneKind({ track: '—', at: '00:40.000' }),
  ],
  historyPaste: [e.historyPaste(1), e.historyPaste(3)],
  pasteTrackSuffix: [e.pasteTrackSuffix('SFX'), e.pasteTrackSuffix('—')],
  pasteDone: [
    e.pasteDone({ count: 1, at: '00:09.000', trackSuffix: e.pasteTrackSuffix('SFX') }),
    e.pasteDone({ count: 3, at: '00:20.000', trackSuffix: '' }),
    e.pasteDone({ count: 1, at: '00:20.000', trackSuffix: e.pasteTrackSuffix('—') }),
  ],
};

describe('studioEditStrings (V-0.2a)', () => {
  it('ST6: every plain-string property equals its exact English literal', () => {
    const plainKeys = Object.entries(studioEditStrings)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_EDIT_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(studioEditStrings)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_EDIT_PLAIN_STRINGS[key]);
      }
    }
  });

  it('ST7: every formatter returns the exact English text for its inputs', () => {
    expect(e.historySplitClips(1)).toBe('Split (1)');
    expect(e.historySplitClips(3)).toBe('Split (3)');
    expect(e.splitClipsDone({ count: 1, time: '00:02.500' })).toBe(
      '1 clip split at 00:02.500; the right part is selected.',
    );
    expect(e.splitClipsDone({ count: 3, time: '00:02.500' })).toBe(
      '3 clips split at 00:02.500; the right parts are selected.',
    );
    expect(e.splitDone('00:02.500')).toBe('Clip split at 00:02.500.');
    expect(e.onTrack('SFX')).toBe('on the SFX track');
    expect(e.onTrack('—')).toBe('on the — track');
    expect(
      e.deleteRangeDone({ start: '00:03.000', end: '00:05.000', lanes: e.onTrack('SFX') }),
    ).toBe('⌫ Deleted 00:03.000 — 00:05.000 on the SFX track; the gap remains.');
    expect(e.deleteRangeDone({ start: '00:03.000', end: '00:05.000', lanes: e.onTrack('—') })).toBe(
      '⌫ Deleted 00:03.000 — 00:05.000 on the — track; the gap remains.',
    );
    expect(e.deleteRangeDone({ start: '00:01.000', end: '00:05.000', lanes: e.onAllTracks })).toBe(
      '⌫ Deleted 00:01.000 — 00:05.000 on all tracks; the gap remains.',
    );
    expect(e.historyDeleteClips(1)).toBe('Delete clips (1)');
    expect(e.historyDeleteClips(3)).toBe('Delete clips (3)');
    expect(e.deleteClipsDone(1)).toBe('1 clip deleted; the gap remains.');
    expect(e.deleteClipsDone(3)).toBe('3 clips deleted; the gap remains.');
    expect(e.extendDone({ start: '00:01.000', end: '00:03.000' })).toBe(
      'Selection on all tracks: 00:01.000 — 00:03.000.',
    );
    expect(e.duplicateConflict({ track: 'SFX', start: '00:08.000', end: '00:16.000' })).toBe(
      'Duplicate failed: 00:08.000–00:16.000 on the SFX track is occupied. Nothing changed.',
    );
    expect(e.duplicateConflict({ track: '—', start: '00:08.000', end: '00:16.000' })).toBe(
      'Duplicate failed: 00:08.000–00:16.000 on the — track is occupied. Nothing changed.',
    );
    expect(e.historyDuplicate(1)).toBe('Duplicate (1)');
    expect(e.historyDuplicate(3)).toBe('Duplicate (3)');
    expect(e.duplicateDone({ count: 1, from: '00:08.000' })).toBe(
      'Duplicate (1): the copy starts at 00:08.000.',
    );
    expect(e.duplicateDone({ count: 3, from: '00:08.000' })).toBe(
      'Duplicate (3): copies start at 00:08.000.',
    );
    expect(e.copyRangeDone({ lane: 'SFX', start: '00:03.000', end: '00:05.000', parts: 1 })).toBe(
      'Copy: SFX 00:03.000–00:05.000 (1 part).',
    );
    expect(
      e.copyRangeDone({ lane: e.allTracks, start: '00:03.000', end: '00:05.000', parts: 3 }),
    ).toBe('Copy: all tracks 00:03.000–00:05.000 (3 parts).');
    expect(e.copyClipsDone(1)).toBe('Copy: 1 clip on the clipboard.');
    expect(e.copyClipsDone(3)).toBe('Copy: 3 clips on the clipboard.');
    expect(e.cutDone(1)).toBe('Cut: 1 part on the clipboard; the gap remains.');
    expect(e.cutDone(3)).toBe('Cut: 3 parts on the clipboard; the gap remains.');
    expect(e.cutTimeNothing({ start: '00:15.000', end: '00:15.000' })).toBe(
      'Cut Time 00:15.000 — 00:15.000: no time to cut — nothing changed, the clipboard did not change.',
    );
    expect(e.cutTimeParts(1)).toBe('1 part on the clipboard');
    expect(e.cutTimeParts(3)).toBe('3 parts on the clipboard');
    expect(e.markersRemoved(1)).toBe(' 1 marker deleted.');
    expect(e.markersRemoved(3)).toBe(' 3 markers deleted.');
    expect(
      e.cutTimeDone({
        start: '00:24.000',
        end: '00:26.000',
        clipboard: e.cutTimeNoSound,
        suffix: '',
      }),
    ).toBe(
      'Cut Time 00:24.000 — 00:26.000: no sound in the time selection, the clipboard did not change; the gap was closed on all tracks.',
    );
    expect(
      e.cutTimeDone({
        start: '00:10.000',
        end: '00:20.000',
        clipboard: e.cutTimeParts(3),
        suffix: ` ${e.loopRemoved}${e.markersRemoved(1)}`,
      }),
    ).toBe(
      'Cut Time 00:10.000 — 00:20.000: 3 parts on the clipboard; the gap was closed on all tracks. The loop range was shorter than 0.1 s after the deletion, so it was removed. 1 marker deleted.',
    );
    expect(e.pasteOverlap({ track: 'SFX', start: '00:20.000', end: '00:22.000' })).toBe(
      'Paste failed: 00:20.000–00:22.000 on the SFX track is occupied. Nothing changed.',
    );
    expect(e.pasteOverlap({ track: '—', start: '00:20.000', end: '00:22.000' })).toBe(
      'Paste failed: 00:20.000–00:22.000 on the — track is occupied. Nothing changed.',
    );
    expect(e.pasteLaneKind({ track: 'SFX', at: '00:40.000' })).toBe(
      'Paste failed: this material does not fit on the SFX track from 00:40.000 (audio and video do not swap tracks). Nothing changed.',
    );
    expect(e.pasteLaneKind({ track: '—', at: '00:40.000' })).toBe(
      'Paste failed: this material does not fit on the — track from 00:40.000 (audio and video do not swap tracks). Nothing changed.',
    );
    expect(e.historyPaste(1)).toBe('Paste (1)');
    expect(e.historyPaste(3)).toBe('Paste (3)');
    expect(e.pasteTrackSuffix('SFX')).toBe(' · on the SFX track');
    expect(e.pasteTrackSuffix('—')).toBe(' · on the — track');
    expect(e.pasteDone({ count: 1, at: '00:09.000', trackSuffix: e.pasteTrackSuffix('SFX') })).toBe(
      'Paste (1): at 00:09.000 · on the SFX track.',
    );
    expect(e.pasteDone({ count: 3, at: '00:20.000', trackSuffix: '' })).toBe(
      'Paste (3): at 00:20.000.',
    );
    expect(e.pasteDone({ count: 1, at: '00:20.000', trackSuffix: e.pasteTrackSuffix('—') })).toBe(
      'Paste (1): at 00:20.000 · on the — track.',
    );
  });

  it('ST8: no string or formatter output in the module contains a Georgian codepoint', () => {
    const formatterKeys = Object.entries(studioEditStrings)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();
    expect(formatterKeys).toEqual(Object.keys(EDIT_FORMATTER_SAMPLES).sort());
    for (const [key, value] of Object.entries(studioEditStrings)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
    for (const [key, outputs] of Object.entries(EDIT_FORMATTER_SAMPLES)) {
      expect(outputs.length, key).toBeGreaterThan(0);
      for (const output of outputs) {
        expect(output, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
  });

  it('ST9: the edit commands in ArrangementContext contain no Georgian codepoint outside comments', () => {
    const context = readStoreSource('../../../contexts/ArrangementContext.tsx');
    const start = context.indexOf('const splitSelection = useCallback(');
    const end = context.indexOf('const restoreHistory = useCallback(');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(stripSourceComments(context.slice(start, end))).not.toMatch(GEORGIAN_CODEPOINT);
    const constantNames = [
      'LOOP_REMOVED_MESSAGE',
      'CLIPBOARD_EMPTY_MESSAGE',
      'DUPLICATE_RANGE_MESSAGE',
      'DUPLICATE_EMPTY_MESSAGE',
      'GROUP_SPLIT_MISS_MESSAGE',
      'CUT_TIME_NEEDS_RANGE_MESSAGE',
    ];
    const lines = context.split(/\r?\n/);
    for (const name of constantNames) {
      const index = lines.findIndex((line) => line.startsWith(`const ${name} =`));
      expect(index, name).toBe(-1);
    }
  });
});

const EXPECTED_V02B_PLAIN_STRINGS: Record<string, Record<string, string>> = {
  studioPlaybackStrings: {
    webAudioUnavailable:
      'Web Audio is not available in this browser — playback and export will not work.',
    nothingToPlay: 'Nothing to play — add a clip from the library first.',
  },
  studioLibraryStrings: {
    audioOnVideoTrack:
      'Choose an audio track (music, stems or SFX) — audio is not added to the video track.',
    dropBlocked: 'No room here — clips on one track do not overlap.',
    selectSoundFirst: 'Select a sound in the library first.',
    addFailed: 'Could not add the clip.',
    nearestFreeSpot: ' (nearest free spot)',
    dropNotLoaded: 'This sound has not loaded yet — wait and try again.',
  },
  studioLoopStrings: {
    stepBlocked: 'The loop cannot move further: start of the timeline or minimum length.',
    tooShort: 'A loop needs a time selection of at least 0.1 s.',
    historyReplaced: 'Loop replaced',
    historyCreated: 'Loop created',
    needsSelection: 'To set a loop, first make a time selection on the waveform.',
    historyOn: 'Loop on',
    historyOff: 'Loop off',
    on: 'Loop is on.',
    off: 'Loop is off; the range is kept.',
    historyRange: 'Loop range',
  },
  studioMoveStrings: {
    undoBlockedDuringDrag: 'Undo/Redo does not work while dragging — let go first.',
    editBlockedDuringDrag: 'Editing does not work while dragging — let go first.',
    nudgeAtTimeStart: 'Nudge blocked — start of the timeline.',
    nudgeBlocked: 'Nudge blocked — a neighbouring clip or the start of the timeline.',
    historyNudgeClip: 'Nudge clip',
  },
};

const V02B_OBJECTS: Record<string, Record<string, unknown>> = {
  studioPlaybackStrings,
  studioLibraryStrings,
  studioLoopStrings,
  studioMoveStrings,
};

const pb = studioPlaybackStrings;
const lib = studioLibraryStrings;
const lp = studioLoopStrings;

const V02B_FORMATTER_SAMPLES: Record<string, Record<string, string[]>> = {
  studioPlaybackStrings: {
    playPastEnd: [
      pb.playPastEnd({ position: '00:05.000', end: '00:02.000' }),
      pb.playPastEnd({ position: '01:00.250', end: '00:30.000' }),
    ],
  },
  studioLibraryStrings: {
    sourceFailed: [lib.sourceFailed('Hit')],
    sourceNotLoaded: [lib.sourceNotLoaded('Hit')],
    historyAdd: [lib.historyAdd('Hit')],
    clipAdded: [
      lib.clipAdded({ title: 'Hit', track: 'SFX', time: '00:09.400', suffix: '' }),
      lib.clipAdded({
        title: 'Hit',
        track: 'SFX',
        time: '00:09.400',
        suffix: lib.nearestFreeSpot,
      }),
    ],
  },
  studioLoopStrings: {
    replaced: [lp.replaced('00:01.000 — 00:03.000')],
    created: [lp.created('00:01.000 — 00:03.000')],
  },
  studioMoveStrings: {},
};

const CONTEXT_REMAINING_GEORGIAN_LINES = [
  "{ id: 'video', kind: 'video', name: 'ვიდეო' },",
  "{ id: 'audio', kind: 'audio', name: 'აუდიო' },",
  'applyEdit(moved, `გადატანა ({ids.length})`);',
  "error: error instanceof Error ? error.message : 'ჩატვირთვა ვერ მოხერხდა',",
];

describe('V-0.2b playback, library, loop and move strings', () => {
  it('ST10: every plain-string property equals its exact English literal', () => {
    expect(Object.keys(V02B_OBJECTS).sort()).toEqual(
      Object.keys(EXPECTED_V02B_PLAIN_STRINGS).sort(),
    );
    for (const [objectName, object] of Object.entries(V02B_OBJECTS)) {
      const expected = EXPECTED_V02B_PLAIN_STRINGS[objectName] ?? {};
      const plainKeys = Object.entries(object)
        .filter(([, value]) => typeof value === 'string')
        .map(([key]) => key)
        .sort();
      expect(plainKeys, objectName).toEqual(Object.keys(expected).sort());
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') {
          expect(value, `${objectName}.${key}`).toBe(expected[key]);
        }
      }
    }
  });

  it('ST11: every formatter returns the exact English text for its inputs', () => {
    expect(pb.playPastEnd({ position: '00:05.000', end: '00:02.000' })).toBe(
      'Playhead (00:05.000) is past the end of the project (00:02.000) — there is nothing to play here. Home returns to 0.',
    );
    expect(pb.playPastEnd({ position: '01:00.250', end: '00:30.000' })).toBe(
      'Playhead (01:00.250) is past the end of the project (00:30.000) — there is nothing to play here. Home returns to 0.',
    );
    expect(lib.sourceFailed('Hit')).toBe('“Hit” failed to load — details are in the library.');
    expect(lib.sourceNotLoaded('Hit')).toBe('“Hit” has not loaded yet.');
    expect(lib.historyAdd('Hit')).toBe('Add — Hit');
    expect(lib.clipAdded({ title: 'Hit', track: 'SFX', time: '00:09.400', suffix: '' })).toBe(
      '“Hit” added to the SFX track at 00:09.400.',
    );
    expect(
      lib.clipAdded({ title: 'Hit', track: 'SFX', time: '00:09.400', suffix: lib.nearestFreeSpot }),
    ).toBe('“Hit” added to the SFX track at 00:09.400 (nearest free spot).');
    expect(lp.replaced('00:01.000 — 00:03.000')).toBe(
      'Loop replaced with the new range: 00:01.000 — 00:03.000.',
    );
    expect(lp.created('00:01.000 — 00:03.000')).toBe(
      'Loop created and turned on: 00:01.000 — 00:03.000.',
    );
    expect(GESTURE_UNDO_BLOCKED_MESSAGE).toBe(studioMoveStrings.undoBlockedDuringDrag);
    expect(GESTURE_EDIT_BLOCKED_MESSAGE).toBe(studioMoveStrings.editBlockedDuringDrag);
    expect(NUDGE_AT_TIME_START_MESSAGE).toBe(studioMoveStrings.nudgeAtTimeStart);
    expect(WEB_AUDIO_UNAVAILABLE_MESSAGE).toBe(pb.webAudioUnavailable);
    expect(playPastEndMessage(5, 2)).toBe(
      pb.playPastEnd({ position: '00:05.000', end: '00:02.000' }),
    );
  });

  it('ST12: no string or formatter output of the four objects contains a Georgian codepoint', () => {
    for (const [objectName, object] of Object.entries(V02B_OBJECTS)) {
      const samples = V02B_FORMATTER_SAMPLES[objectName] ?? {};
      const formatterKeys = Object.entries(object)
        .filter(([, value]) => typeof value === 'function')
        .map(([key]) => key)
        .sort();
      expect(formatterKeys, objectName).toEqual(Object.keys(samples).sort());
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') {
          expect(value, `${objectName}.${key}`).not.toMatch(GEORGIAN_CODEPOINT);
        }
      }
      for (const [key, outputs] of Object.entries(samples)) {
        expect(outputs.length, `${objectName}.${key}`).toBeGreaterThan(0);
        for (const output of outputs) {
          expect(output, `${objectName}.${key}`).not.toMatch(GEORGIAN_CODEPOINT);
        }
      }
    }
  });

  it('ST13: the only Georgian lines left in ArrangementContext are the later V-0 stages', () => {
    const context = stripSourceComments(
      readStoreSource('../../../contexts/ArrangementContext.tsx'),
    );
    const georgianLines = context
      .split(/\r?\n/)
      .filter((line) => GEORGIAN_CODEPOINT.test(line))
      .map((line) => line.trim().replaceAll('${', '{'));
    expect(georgianLines).toEqual(CONTEXT_REMAINING_GEORGIAN_LINES);
  });
});

const vs = studioVideoStrings;

const EXPECTED_VIDEO_PLAIN_STRINGS: Record<string, string> = {
  unknownType: 'unknown type',
  dropOnVideoTrack: 'Drop the video on the video track.',
  noSound: 'The video has no sound',
  tooLongToRead: 'Sound not read: the video is longer than 20 minutes',
  tooLargeToRead: 'Sound not read: the file is larger than 1 GB',
  soundUnreadable: "The video's sound could not be read — it is not in the export",
  probeCancelled: 'Adding the video was cancelled.',
  decodeCancelled: "Reading the video's sound was cancelled.",
};

const VIDEO_FORMATTER_SAMPLES: Record<string, string[]> = {
  opening: [vs.opening('film.mp4')],
  addToTrackFailed: [vs.addToTrackFailed('film.mp4')],
  historyAddVideo: [vs.historyAddVideo('film.mp4')],
  added: [vs.added({ name: 'film.mp4', start: '00:01.000', end: '00:07.000' })],
  importFailed: [vs.importFailed('boom')],
  audioFileRejected: [vs.audioFileRejected('film.mp4')],
  notVideo: [vs.notVideo('doc.pdf', '.pdf'), vs.notVideo('noext', vs.unknownType)],
  probeFailed: [vs.probeFailed('film.mp4')],
};

describe('V-0.2c1 video import strings', () => {
  it('ST14: every plain-string property of studioVideoStrings equals its exact English literal', () => {
    const plainKeys = Object.entries(vs)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_VIDEO_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(vs)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_VIDEO_PLAIN_STRINGS[key]);
      }
    }
    expect(vs.soundUnreadable).toBe(studioExportStrings.videoSoundUnreadable);
  });

  it('ST15: every formatter and exported video message returns the exact English text', () => {
    expect(vs.opening('film.mp4')).toBe('Opening “film.mp4”…');
    expect(vs.addToTrackFailed('film.mp4')).toBe(
      '“film.mp4”: could not be added to the video track.',
    );
    expect(vs.historyAddVideo('film.mp4')).toBe('Add video — film.mp4');
    expect(vs.added({ name: 'film.mp4', start: '00:01.000', end: '00:07.000' })).toBe(
      '“film.mp4” added to the video track: 00:01.000 — 00:07.000',
    );
    expect(vs.importFailed('boom')).toBe('Could not add the video: boom');
    expect(vs.audioFileRejected('film.mp4')).toBe(
      '“film.mp4”: audio files cannot be added here — only your own video can; sounds are added from the library.',
    );
    expect(vs.notVideo('doc.pdf', '.pdf')).toBe('“doc.pdf”: the format is not video (.pdf).');
    expect(vs.probeFailed('film.mp4')).toBe(
      '“film.mp4”: the browser could not open this video — try MP4 (H.264) or WebM.',
    );
    expect(videoAudioNote('no-audio')).toBe('The video has no sound');
    expect(videoAudioNote('too-long')).toBe('Sound not read: the video is longer than 20 minutes');
    expect(videoAudioNote('too-large')).toBe('Sound not read: the file is larger than 1 GB');
    expect(videoAudioNote('decode-failed')).toBe(
      "The video's sound could not be read — it is not in the export",
    );
    expect(videoProbeErrorMessage('film.mp4')).toBe(
      '“film.mp4”: the browser could not open this video — try MP4 (H.264) or WebM.',
    );
    expect(audioFileRejectionMessage('tone.wav')).toBe(
      '“tone.wav”: audio files cannot be added here — only your own video can; sounds are added from the library.',
    );
    expect(unsupportedFileMessage({ name: 'doc.pdf', type: 'application/pdf' })).toBe(
      '“doc.pdf”: the format is not video (.pdf).',
    );
    expect(unsupportedFileMessage({ name: 'noext', type: '' })).toBe(
      '“noext”: the format is not video (unknown type).',
    );
  });

  it('ST16: studioVideoStrings and the video sources contain no Georgian codepoint', () => {
    const formatterKeys = Object.entries(vs)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();
    expect(formatterKeys).toEqual(Object.keys(VIDEO_FORMATTER_SAMPLES).sort());
    for (const [key, value] of Object.entries(vs)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
    for (const [key, outputs] of Object.entries(VIDEO_FORMATTER_SAMPLES)) {
      expect(outputs.length, key).toBeGreaterThan(0);
      for (const output of outputs) {
        expect(output, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
    for (const path of ['../video.ts', '../video.client.ts']) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GEORGIAN_CODEPOINT);
    }
  });
});

const V02C2_OBJECTS: Record<string, Record<string, unknown>> = {
  studioTempoStrings,
  studioMetronomeStrings,
  studioViewStrings,
};

const EXPECTED_V02C2_PLAIN_STRINGS: Record<string, Record<string, string>> = {
  studioTempoStrings: {
    emptyHint: 'Bars: set a BPM — grid only, audio is not stretched',
    cleared: 'Tempo cleared — the bars ruler is hidden. Audio is unchanged.',
  },
  studioMetronomeStrings: {
    needsTempoTitle: 'Metronome — set a BPM first',
    off: 'Metronome is off.',
  },
  studioViewStrings: {},
};

const EXPECTED_V02C2_KEYS: Record<string, string[]> = {
  studioTempoStrings: ['cleared', 'emptyHint', 'invalid', 'set'],
  studioMetronomeStrings: ['needsTempoTitle', 'off', 'on', 'title'],
  studioViewStrings: ['zoomReadout'],
};

const V02C2_FORMATTER_SAMPLES: Record<string, Record<string, string[]>> = {
  studioTempoStrings: {
    invalid: [studioTempoStrings.invalid({ min: 20, max: 999 })],
    set: [
      studioTempoStrings.set({ bpm: '90', beatsPerBar: 4 }),
      studioTempoStrings.set({ bpm: '92.5', beatsPerBar: 4 }),
    ],
  },
  studioMetronomeStrings: {
    title: [studioMetronomeStrings.title(4)],
    on: [studioMetronomeStrings.on({ bpm: '40', beatsPerBar: 4 })],
  },
  studioViewStrings: {
    zoomReadout: [
      studioViewStrings.zoomReadout(0.5),
      studioViewStrings.zoomReadout(40),
      studioViewStrings.zoomReadout(35.3),
    ],
  },
};

const METRONOME_TITLE_TEXT =
  'Metronome — a click on every beat during playback (4/4, the first beat of each bar is louder). Master volume and Mute also apply to it. Not included in the export.';

describe('V-0.2c2 tempo, metronome and view strings', () => {
  it('ST17: every plain-string property of the three objects equals its exact English literal', () => {
    expect(Object.keys(V02C2_OBJECTS).sort()).toEqual(Object.keys(EXPECTED_V02C2_KEYS).sort());
    for (const [objectName, object] of Object.entries(V02C2_OBJECTS)) {
      expect(Object.keys(object).sort(), objectName).toEqual(EXPECTED_V02C2_KEYS[objectName]);
      const expected = EXPECTED_V02C2_PLAIN_STRINGS[objectName] ?? {};
      const plainKeys = Object.entries(object)
        .filter(([, value]) => typeof value === 'string')
        .map(([key]) => key)
        .sort();
      expect(plainKeys, objectName).toEqual(Object.keys(expected).sort());
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') {
          expect(value, `${objectName}.${key}`).toBe(expected[key]);
        }
      }
    }
    expect(TEMPO_EMPTY_HINT).toBe(studioTempoStrings.emptyHint);
    expect(METRONOME_NEEDS_TEMPO_TITLE).toBe(studioMetronomeStrings.needsTempoTitle);
  });

  it('ST18: every formatter and exported tempo, metronome and zoom text returns the exact English', () => {
    expect(studioTempoStrings.invalid({ min: 20, max: 999 })).toBe(
      'Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.',
    );
    expect(studioTempoStrings.set({ bpm: '90', beatsPerBar: 4 })).toBe(
      'Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
    );
    expect(studioTempoStrings.set({ bpm: '92.5', beatsPerBar: 4 })).toBe(
      'Tempo 92.5 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
    );
    expect(studioMetronomeStrings.title(4)).toBe(METRONOME_TITLE_TEXT);
    expect(studioMetronomeStrings.on({ bpm: '40', beatsPerBar: 4 })).toBe(
      'Metronome is on — 40 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.',
    );
    expect(studioViewStrings.zoomReadout(0.5)).toBe('0.5 px/s');
    expect(studioViewStrings.zoomReadout(40)).toBe('40 px/s');
    expect(studioViewStrings.zoomReadout(35.3)).toBe('35.3 px/s');
    expect(TEMPO_INVALID_MESSAGE).toBe('Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.');
    expect(tempoStatusMessage(90)).toBe(
      'Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
    );
    expect(tempoStatusMessage(null)).toBe(
      'Tempo cleared — the bars ruler is hidden. Audio is unchanged.',
    );
    expect(METRONOME_TITLE).toBe(METRONOME_TITLE_TEXT);
    expect(metronomeStatusMessage(40)).toBe(
      'Metronome is on — 40 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.',
    );
    expect(metronomeStatusMessage(null)).toBe('Metronome is off.');
    expect(formatZoomReadout(35.26)).toBe('35.3 px/s');
  });

  it('ST19: the three objects and the tempo, metronome and view sources contain no Georgian codepoint', () => {
    for (const [objectName, object] of Object.entries(V02C2_OBJECTS)) {
      const samples = V02C2_FORMATTER_SAMPLES[objectName] ?? {};
      const formatterKeys = Object.entries(object)
        .filter(([, value]) => typeof value === 'function')
        .map(([key]) => key)
        .sort();
      expect(formatterKeys, objectName).toEqual(Object.keys(samples).sort());
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') {
          expect(value, `${objectName}.${key}`).not.toMatch(GEORGIAN_CODEPOINT);
        }
      }
      for (const [key, outputs] of Object.entries(samples)) {
        expect(outputs.length, `${objectName}.${key}`).toBeGreaterThan(0);
        for (const output of outputs) {
          expect(output, `${objectName}.${key}`).not.toMatch(GEORGIAN_CODEPOINT);
        }
      }
    }
    for (const path of ['../tempo.ts', '../metronome.ts', '../view.ts']) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GEORGIAN_CODEPOINT);
    }
  });
});

const V02C3_OBJECTS: Record<string, Record<string, unknown>> = {
  studioLaneMoveStrings,
  studioTrackGroupStrings,
};

const EXPECTED_V02C3_PLAIN_STRINGS: Record<string, Record<string, string>> = {
  studioLaneMoveStrings: {
    groupMoveBlocked: 'Group move stopped — a neighbouring clip or the start of the timeline.',
    videoClipKeepsTrack: 'A video clip does not change tracks — the group moves in time only.',
    audioNotOnVideoTrack: 'Audio does not move to the video track',
    noTrackForPart: 'There is no track for part of the group — only the time changes.',
    partBeforeStart:
      'Part of the group would go before the start of the timeline (0) — the track does not change.',
    noRoom: 'No room here',
  },
  studioTrackGroupStrings: {
    foldNeedsGroup: 'To fold a group, select it first — click the group name.',
    groupNeedsTracks:
      'To group tracks, select them first — Ctrl+click or Shift+click a track name.',
    trackGone: 'A selected track no longer exists — select again.',
    videoNotGroupable: 'The video track cannot be grouped.',
    mixedLevels:
      'Only tracks at the same level can be grouped together — the selected tracks are in different groups.',
    notAdjacent: 'Only adjacent tracks can be grouped together — the selection skips a track.',
    ungroupNeedsGroup: 'To ungroup, select a group — click the group name.',
  },
};

const EXPECTED_V02C3_KEYS: Record<string, string[]> = {
  studioLaneMoveStrings: [
    'audioNotOnVideoTrack',
    'groupMoveBlocked',
    'noRoom',
    'noTrackForPart',
    'partBeforeStart',
    'videoClipKeepsTrack',
  ],
  studioTrackGroupStrings: [
    'created',
    'foldNeedsGroup',
    'groupNeedsTracks',
    'mixedLevels',
    'notAdjacent',
    'quoted',
    'trackGone',
    'ungroupNeedsGroup',
    'ungroupedMany',
    'ungroupedOne',
    'videoNotGroupable',
  ],
};

const V02C3_FORMATTER_SAMPLES: Record<string, Record<string, string[]>> = {
  studioLaneMoveStrings: {},
  studioTrackGroupStrings: {
    created: [studioTrackGroupStrings.created({ name: 'Drums', members: 'Kick, Snare' })],
    quoted: [studioTrackGroupStrings.quoted('A')],
    ungroupedOne: [studioTrackGroupStrings.ungroupedOne('“A”')],
    ungroupedMany: [studioTrackGroupStrings.ungroupedMany('“A”, “B”')],
  },
};

const TRACK_GROUP_PREFIX_LINE = "export const TRACK_GROUP_NAME_PREFIX = 'ჯგუფი';";

describe('V-0.2c3 lane-move and track-group strings', () => {
  it('ST20: every plain-string property of the two objects and the aliased exports equal the exact English', () => {
    expect(Object.keys(V02C3_OBJECTS).sort()).toEqual(Object.keys(EXPECTED_V02C3_KEYS).sort());
    for (const [objectName, object] of Object.entries(V02C3_OBJECTS)) {
      expect(Object.keys(object).sort(), objectName).toEqual(EXPECTED_V02C3_KEYS[objectName]);
      const expected = EXPECTED_V02C3_PLAIN_STRINGS[objectName] ?? {};
      const plainKeys = Object.entries(object)
        .filter(([, value]) => typeof value === 'string')
        .map(([key]) => key)
        .sort();
      expect(plainKeys, objectName).toEqual(Object.keys(expected).sort());
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') {
          expect(value, `${objectName}.${key}`).toBe(expected[key]);
        }
      }
    }
    expect(GROUP_MOVE_BLOCKED_MESSAGE).toBe(
      'Group move stopped — a neighbouring clip or the start of the timeline.',
    );
    expect(TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE).toBe(
      'To fold a group, select it first — click the group name.',
    );
    expect(Object.keys(CLIP_LANE_REFUSAL_MESSAGES)).toEqual([
      'video-clip',
      'video-lane',
      'out-of-range',
      'before-start',
      'overlap',
    ]);
    expect(CLIP_LANE_REFUSAL_MESSAGES['video-clip']).toBe(
      'A video clip does not change tracks — the group moves in time only.',
    );
    expect(CLIP_LANE_REFUSAL_MESSAGES['video-lane']).toBe('Audio does not move to the video track');
    expect(CLIP_LANE_REFUSAL_MESSAGES['out-of-range']).toBe(
      'There is no track for part of the group — only the time changes.',
    );
    expect(CLIP_LANE_REFUSAL_MESSAGES['before-start']).toBe(
      'Part of the group would go before the start of the timeline (0) — the track does not change.',
    );
    expect(CLIP_LANE_REFUSAL_MESSAGES.overlap).toBe('No room here');
  });

  it('ST21: every formatter and exported track-group text returns the exact English', () => {
    expect(studioTrackGroupStrings.created({ name: 'Drums', members: 'Kick, Snare' })).toBe(
      'Group “Drums” created: Kick, Snare.',
    );
    expect(studioTrackGroupStrings.quoted('A')).toBe('“A”');
    expect(studioTrackGroupStrings.ungroupedOne('“A”')).toBe('Group “A” ungrouped.');
    expect(studioTrackGroupStrings.ungroupedMany('“A”, “B”')).toBe('Groups “A”, “B” ungrouped.');
    expect(trackGroupRefusalMessage('empty')).toBe(
      'To group tracks, select them first — Ctrl+click or Shift+click a track name.',
    );
    expect(trackGroupRefusalMessage('unknown')).toBe(
      'A selected track no longer exists — select again.',
    );
    expect(trackGroupRefusalMessage('video')).toBe('The video track cannot be grouped.');
    expect(trackGroupRefusalMessage('mixed-parents')).toBe(
      'Only tracks at the same level can be grouped together — the selected tracks are in different groups.',
    );
    expect(trackGroupRefusalMessage('gap')).toBe(
      'Only adjacent tracks can be grouped together — the selection skips a track.',
    );
    expect(trackGroupRefusalMessage('no-group')).toBe(
      'To ungroup, select a group — click the group name.',
    );
    expect(trackGroupCreatedMessage('ჯგუფი 1', ['მუსიკა', 'სტემები'])).toBe(
      'Group “ჯგუფი 1” created: მუსიკა, სტემები.',
    );
    const single: ArrangementTrackGroup = { id: 'g1', name: 'ჯგუფი 2', parentId: null };
    const first: ArrangementTrackGroup = { id: 'ga', name: 'A', parentId: null };
    const second: ArrangementTrackGroup = { id: 'gb', name: 'B', parentId: null };
    expect(trackGroupDissolvedMessage([single])).toBe('Group “ჯგუფი 2” ungrouped.');
    expect(trackGroupDissolvedMessage([first, second])).toBe('Groups “A”, “B” ungrouped.');
    expect(TRACK_GROUP_NAME_PREFIX).toBe('ჯგუფი');
  });

  it('ST22: the two objects, selection.ts and groups.ts (minus the prefix line) contain no Georgian codepoint', () => {
    for (const [objectName, object] of Object.entries(V02C3_OBJECTS)) {
      const samples = V02C3_FORMATTER_SAMPLES[objectName] ?? {};
      const formatterKeys = Object.entries(object)
        .filter(([, value]) => typeof value === 'function')
        .map(([key]) => key)
        .sort();
      expect(formatterKeys, objectName).toEqual(Object.keys(samples).sort());
      for (const [key, value] of Object.entries(object)) {
        if (typeof value === 'string') {
          expect(value, `${objectName}.${key}`).not.toMatch(GEORGIAN_CODEPOINT);
        }
      }
      for (const [key, outputs] of Object.entries(samples)) {
        expect(outputs.length, `${objectName}.${key}`).toBeGreaterThan(0);
        for (const output of outputs) {
          expect(output, `${objectName}.${key}`).not.toMatch(GEORGIAN_CODEPOINT);
        }
      }
    }
    const selection = stripSourceComments(readStoreSource('../selection.ts'));
    expect(selection.length).toBeGreaterThan(0);
    expect(selection).not.toMatch(GEORGIAN_CODEPOINT);
    const groupLines = stripSourceComments(readStoreSource('../groups.ts')).split(/\r?\n/);
    expect(groupLines.filter((line) => line === TRACK_GROUP_PREFIX_LINE)).toHaveLength(1);
    const groupsWithoutPrefix = groupLines
      .filter((line) => line !== TRACK_GROUP_PREFIX_LINE)
      .join('\n');
    expect(groupsWithoutPrefix.length).toBeGreaterThan(0);
    expect(groupsWithoutPrefix).not.toMatch(GEORGIAN_CODEPOINT);
  });
});
