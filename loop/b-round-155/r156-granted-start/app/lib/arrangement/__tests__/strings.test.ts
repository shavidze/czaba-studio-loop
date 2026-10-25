import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VIDEO_RETURNED_COMPACT_MESSAGE,
  VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE,
} from '~/components/arrangement/StudioWorkspace';
import {
  GESTURE_EDIT_BLOCKED_MESSAGE,
  GESTURE_UNDO_BLOCKED_MESSAGE,
  NUDGE_AT_TIME_START_MESSAGE,
  playPastEndMessage,
  WEB_AUDIO_UNAVAILABLE_MESSAGE,
} from '~/contexts/ArrangementContext';
import type { ArrangementTrackGroup, WorkspaceSourceKind } from '~/types/arrangement';
import { formatClipGainMembersStatus } from '../clip-gain-multi';
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
import { formatGridDivision, GRID_DIVISIONS_SECONDS } from '../grid';
import {
  GRID_TRIPLET_MENU_LABEL,
  gridDivisionEndMessage,
  gridDivisionStatusMessage,
  gridDivisionTitle,
  gridMusicalGroupLabel,
  gridTempoClearedMessage,
  gridTripletGroupLabel,
  gridTripletRefusalMessage,
  MUSICAL_GRID_DIVISIONS,
} from '../grid-divisions';
import {
  nextTrackGroupName,
  TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE,
  TRACK_GROUP_NAME_PREFIX,
  trackGroupCreatedMessage,
  trackGroupDissolvedMessage,
  trackGroupRefusalMessage,
} from '../groups';
import {
  LIBRARY_FOLDER_LABELS,
  LIBRARY_KIND_LABELS,
  LIBRARY_KIND_SEARCH_KEYWORDS,
} from '../library';
import { METRONOME_NEEDS_TEMPO_TITLE, METRONOME_TITLE, metronomeStatusMessage } from '../metronome';
import { createArrangement } from '../model';
import { DETAIL_RANGE_INVALID_MESSAGE } from '../panels';
import { CLIP_LANE_REFUSAL_MESSAGES, GROUP_MOVE_BLOCKED_MESSAGE } from '../selection';
import {
  studioClipEnvelopeStrings,
  studioClipStrings,
  studioDetailStrings,
  studioEditStrings,
  studioExportStrings,
  studioGridStrings,
  studioGroupHeaderStrings,
  studioLaneMoveStrings,
  studioLaneStrings,
  studioLibraryPanelStrings,
  studioLibraryStrings,
  studioLoopStrings,
  studioMarkerStrings,
  studioMeterStrings,
  studioMetronomeStrings,
  studioMoveStrings,
  studioPlaybackStrings,
  studioSourceLoadStrings,
  studioTempoStrings,
  studioTrackGroupStrings,
  studioVideoDockStrings,
  studioVideoStrings,
  studioViewStrings,
  studioWorkspaceStrings,
} from '../strings';
import { TEMPO_EMPTY_HINT, TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';
import { audioFileRejectionMessage, unsupportedFileMessage } from '../video';
import { videoAudioNote, videoProbeErrorMessage } from '../video.client';
import { formatZoomReadout } from '../view';
import { waveformZoomStatus } from '../waveform-zoom';

const GEORGIAN_CODEPOINT = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;

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
  splitRangeTitle: 'Split at both edges of the time selection (Ctrl/Cmd+E)',
  splitPlayheadTitle: 'Split at the playhead (Ctrl/Cmd+E)',
  deleteRangeHint:
    'Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
  deleteRangeAllTracksHint:
    'Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
  deleteClipTitle: 'Delete clip — leaves a gap (Delete)',
  deleteClipLabel: '⌫ Delete — the selected clip; leaves a gap',
  deleteButton: '⌫ Delete',
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
    backToStartLabel: 'Back to start',
    backToStartTitle: 'Back to start (0)',
    projectEndPrefix: '/ end',
  },
  studioLibraryStrings: {
    audioOnVideoTrack:
      'Choose an audio track (music, stems or SFX) — audio is not added to the video track.',
    dropBlocked: 'No room here — clips on one track do not overlap.',
    selectSoundFirst: 'Select a sound in the library first.',
    addFailed: 'Could not add the clip.',
    nearestFreeSpot: ' (nearest free spot)',
    dropNotLoaded: 'This sound has not loaded yet — wait and try again.',
    kindMusic: 'Music',
    kindStem: 'Stem',
    folderMusic: 'Music',
    folderStems: 'Stems',
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
    selectionTitle: 'Loop the time selection (Ctrl/Cmd+L)',
    toggleTitle: 'Loop on / off (Ctrl/Cmd+L)',
    braceHint: 'Loop: make a time selection and press ↻ Loop (Ctrl+L)',
    braceKeyboardHint: '← → nudge · Shift + ← → length',
    braceStartTitle: 'Loop start',
    braceEndTitle: 'Loop end',
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
    braceTitle: [lp.braceTitle('00:01.000 — 00:03.000')],
  },
  studioMoveStrings: {},
};

const CONTEXT_REMAINING_GEORGIAN_LINES: string[] = [];

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

  it('ST13: no Georgian lines are left in ArrangementContext', () => {
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
  expanded:
    'The video is expanded over the library. Drag it where you want; Esc or ✕ brings it back.',
  expandedLibraryOpened:
    'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or ✕ brings it back.',
  returnedLibraryCollapsed: 'The library collapsed, so the video went back to the compact view.',
  returnedCompact: 'The video went back to the compact view.',
  returnedLibraryRecollapsed:
    'The video went back to the compact view; the library collapsed again.',
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
    fieldLabel: 'Project tempo (BPM)',
    fieldTitle:
      'Project tempo — bars grid only; audio is not stretched (no time-stretch). Enter — save · Esc — cancel · empty — hide the bars',
  },
  studioMetronomeStrings: {
    needsTempoTitle: 'Metronome — set a BPM first',
    off: 'Metronome is off.',
    toggleLabel: 'Metronome',
  },
  studioViewStrings: {
    followOffTitle: 'Follow off: the view does not follow playback',
    followPausedTitle: 'Follow paused by manual navigation — press Follow or Play',
    followOnTitle: 'Follow: the view follows the playback position',
    zoomSliderLabel: 'Zoom (px/s)',
    zoomSliderTitle: 'Zoom around the playhead · + / − · Ctrl+wheel',
    zoomToSelectionLabel: 'Zoom to selection (Z)',
    zoomToSelectionTitle: 'Zoom to the time selection (Z)',
    zoomToSelectionNeedsRangeTitle: 'Zoom to selection: make a time selection first (Z)',
    zoomBackTitle: 'Back to the previous zoom (X)',
    zoomBackEmptyTitle:
      'Previous zoom: the history is empty — use Fit or Zoom to selection first (X)',
    fitTitle: 'Fit — the entire project is visible (double-click the ruler or the overview)',
    playheadTitle: 'Playhead — drag · ←/→ = ±0.1 s',
    rulerTitle:
      'Click = playhead · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection',
    overviewLabel: 'Overview — entire project (← → = 5 s, double-click = Fit)',
    overviewTitle:
      'Overview: click = centre here · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit',
    followPaused: 'Follow paused by manual navigation. Follow or Play resumes it.',
    zoomNeedsSelection: 'To zoom, make a time selection first.',
    zoomHistoryEmpty: 'The zoom history is empty — there is no view to go back to.',
    zoomBackMore: 'Previous view restored. X goes back one more step.',
    zoomBackDone: 'Previous view restored.',
    followOff: 'Follow off: the view does not move by itself.',
    followResumed: 'Follow is following the playback position again.',
    followOn: 'Follow on: the view follows the playback position during playback.',
    waveformZoomLabel: 'Waveform Zoom — view only, the sound does not change',
  },
};

const EXPECTED_V02C2_KEYS: Record<string, string[]> = {
  studioTempoStrings: ['cleared', 'emptyHint', 'fieldLabel', 'fieldTitle', 'invalid', 'set'],
  studioMetronomeStrings: ['needsTempoTitle', 'off', 'on', 'title', 'toggleLabel'],
  studioViewStrings: [
    'fitStatus',
    'fitTitle',
    'followOff',
    'followOffTitle',
    'followOn',
    'followOnTitle',
    'followPaused',
    'followPausedTitle',
    'followResumed',
    'overviewLabel',
    'overviewTitle',
    'overviewVisibleStart',
    'playheadTitle',
    'rulerTitle',
    'waveformZoomLabel',
    'waveformZoomStatus',
    'waveformZoomTitle',
    'zoomBackDone',
    'zoomBackEmptyTitle',
    'zoomBackMore',
    'zoomBackTitle',
    'zoomHistoryEmpty',
    'zoomNeedsSelection',
    'zoomReadout',
    'zoomSliderLabel',
    'zoomSliderTitle',
    'zoomToSelectionLabel',
    'zoomToSelectionNeedsRangeTitle',
    'zoomToSelectionTitle',
    'zoomedToSelection',
  ],
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
    overviewVisibleStart: [
      studioViewStrings.overviewVisibleStart({ start: '00:02.000', extent: '00:30.000' }),
    ],
    fitStatus: [studioViewStrings.fitStatus('00:30.000')],
    zoomedToSelection: [
      studioViewStrings.zoomedToSelection({ start: '00:01.000', end: '00:03.000' }),
    ],
    waveformZoomTitle: [studioViewStrings.waveformZoomTitle(100)],
    waveformZoomStatus: [studioViewStrings.waveformZoomStatus(200)],
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
    shiftHint: 'Shift — lock the time; only the track changes',
    shiftLockedHint: 'Shift — the time is locked; only the track changes',
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
    defaultNamePrefix: 'Group',
  },
};

const EXPECTED_V02C3_KEYS: Record<string, string[]> = {
  studioLaneMoveStrings: [
    'audioNotOnVideoTrack',
    'groupMoveBlocked',
    'noRoom',
    'noTrackForPart',
    'partBeforeStart',
    'shiftHint',
    'shiftLockedHint',
    'videoClipKeepsTrack',
  ],
  studioTrackGroupStrings: [
    'created',
    'defaultNamePrefix',
    'foldNeedsGroup',
    'groupNeedsTracks',
    'mixedLevels',
    'notAdjacent',
    'quoted',
    'renameEmpty',
    'renamed',
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
    renameEmpty: [studioTrackGroupStrings.renameEmpty('Drums')],
    renamed: [studioTrackGroupStrings.renamed('Drums')],
  },
};

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
    expect(trackGroupCreatedMessage('Group 1', ['მუსიკა', 'სტემები'])).toBe(
      'Group “Group 1” created: მუსიკა, სტემები.',
    );
    const single: ArrangementTrackGroup = { id: 'g1', name: 'Group 2', parentId: null };
    const first: ArrangementTrackGroup = { id: 'ga', name: 'A', parentId: null };
    const second: ArrangementTrackGroup = { id: 'gb', name: 'B', parentId: null };
    expect(trackGroupDissolvedMessage([single])).toBe('Group “Group 2” ungrouped.');
    expect(trackGroupDissolvedMessage([first, second])).toBe('Groups “A”, “B” ungrouped.');
    expect(TRACK_GROUP_NAME_PREFIX).toBe('Group');
  });

  it('ST22: the two objects, selection.ts and groups.ts contain no Georgian codepoint', () => {
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
    const groups = stripSourceComments(readStoreSource('../groups.ts'));
    expect(groups.length).toBeGreaterThan(0);
    expect(groups).not.toMatch(GEORGIAN_CODEPOINT);
  });
});

const gs = studioGridStrings;

const EXPECTED_GRID_PLAIN_STRINGS: Record<string, string> = {
  barLabel: '1 bar',
  tripletMenuLabel: 'Triplets (3)',
  snapOnSuffix: '(Snap on)',
  snapOffSuffix: '(Snap off)',
  tripletNeedsTempo: 'Triplets need a tempo — enter a BPM first (3)',
  tripletNotOnBar: '1 bar has no triplets — choose 1/2 or narrower (3)',
  tripletNeedsBarsGrid: 'Triplets work only on the bars grid — choose 1/2 … 1/32 (3)',
  menuLabel: 'Grid division',
  snapOnTitle: 'Snap on — clips land on the grid (G)',
  snapOff: 'Snap off — free movement (G)',
};

const EXPECTED_GRID_KEYS = [
  'backToSeconds',
  'barLabel',
  'barsGroup',
  'menuLabel',
  'narrowest',
  'seconds',
  'snapOff',
  'snapOffSuffix',
  'snapOnStatus',
  'snapOnSuffix',
  'snapOnTitle',
  'status',
  'statusMusical',
  'titleLinesHidden',
  'titleLinesVisible',
  'tripletMenuLabel',
  'tripletNeedsBarsGrid',
  'tripletNeedsTempo',
  'tripletNotOnBar',
  'tripletsGroup',
  'widest',
];

const GRID_FORMATTER_SAMPLES: Record<string, string[]> = {
  seconds: [gs.seconds('0.25'), gs.seconds('10')],
  narrowest: [gs.narrowest('0.1 s'), gs.narrowest('1/32T')],
  widest: [gs.widest('10 s'), gs.widest('1 bar')],
  status: [gs.status({ label: '0.5 s', snap: gs.snapOnSuffix })],
  statusMusical: [
    gs.statusMusical({ label: '1/4', step: '0.667', bpm: '90', snap: gs.snapOffSuffix }),
  ],
  backToSeconds: [gs.backToSeconds({ tempoCleared: 'Tempo cleared.', label: '0.5 s' })],
  barsGroup: [gs.barsGroup('120')],
  tripletsGroup: [gs.tripletsGroup('92.5')],
  titleLinesVisible: [gs.titleLinesVisible('1/4')],
  titleLinesHidden: [gs.titleLinesHidden('0.1 s')],
  snapOnStatus: [gs.snapOnStatus('1 s')],
};

describe('V-0.3a grid and Snap strings', () => {
  it('ST23: every plain-string property of studioGridStrings and the aliased grid exports equal the exact English', () => {
    expect(Object.keys(gs).sort()).toEqual(EXPECTED_GRID_KEYS);
    const plainKeys = Object.entries(gs)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_GRID_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(gs)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_GRID_PLAIN_STRINGS[key]);
      }
    }
    expect(GRID_TRIPLET_MENU_LABEL).toBe('Triplets (3)');
    expect(MUSICAL_GRID_DIVISIONS.map((division) => division.label)).toEqual([
      '1 bar',
      '1/2',
      '1/4',
      '1/8',
      '1/16',
      '1/32',
    ]);
  });

  it('ST24: every formatter and exported grid function returns the exact English', () => {
    expect(gs.seconds('0.25')).toBe('0.25 s');
    expect(gs.seconds('10')).toBe('10 s');
    expect(gs.narrowest('0.1 s')).toBe('The grid is already at its narrowest — 0.1 s (1)');
    expect(gs.widest('1 bar')).toBe('The grid is already at its widest — 1 bar (2)');
    expect(gs.status({ label: '0.5 s', snap: '(Snap on)' })).toBe('Grid: 0.5 s (Snap on)');
    expect(gs.statusMusical({ label: '1/4', step: '0.667', bpm: '90', snap: '(Snap off)' })).toBe(
      'Grid: 1/4 · 0.667 s at 90 BPM (Snap off)',
    );
    expect(gs.backToSeconds({ tempoCleared: 'Tempo cleared.', label: '0.5 s' })).toBe(
      'Tempo cleared. Grid back to seconds: 0.5 s.',
    );
    expect(gs.barsGroup('120')).toBe('Bars · 120 BPM');
    expect(gs.tripletsGroup('92.5')).toBe('Triplets · 92.5 BPM');
    expect(gs.titleLinesVisible('1/4')).toBe('Grid 1/4 · 1 — narrower, 2 — wider');
    expect(gs.titleLinesHidden('0.1 s')).toBe(
      'Grid 0.1 s — lines are hidden at this zoom; Snap still works. Zoom in. · 1 — narrower, 2 — wider',
    );
    expect(gs.snapOnStatus('1 s')).toBe('Snap on — grid 1 s (G)');
    expect(GRID_DIVISIONS_SECONDS.map((step) => formatGridDivision(step))).toEqual([
      '10 s',
      '5 s',
      '2 s',
      '1 s',
      '0.5 s',
      '0.25 s',
      '0.1 s',
    ]);
    expect(gridDivisionStatusMessage('0.5', null, true)).toBe('Grid: 0.5 s (Snap on)');
    expect(gridDivisionStatusMessage('1/4', 90, true)).toBe(
      'Grid: 1/4 · 0.667 s at 90 BPM (Snap on)',
    );
    expect(gridDivisionStatusMessage('1/4T', 90, false)).toBe(
      'Grid: 1/4T · 0.444 s at 90 BPM (Snap off)',
    );
    expect(gridDivisionEndMessage('bar', 'widen')).toBe(
      'The grid is already at its widest — 1 bar (2)',
    );
    expect(gridTempoClearedMessage(0.5)).toBe(
      'Tempo cleared — the bars ruler is hidden. Audio is unchanged. Grid back to seconds: 0.5 s.',
    );
    expect(gridDivisionTitle('0.1', false)).toBe(
      'Grid 0.1 s — lines are hidden at this zoom; Snap still works. Zoom in. · 1 — narrower, 2 — wider',
    );
    expect(gridDivisionEndMessage('1', 'narrow')).toBe(
      'The grid is already at its narrowest — 0.1 s (1)',
    );
    expect(gridDivisionEndMessage('1', 'widen')).toBe(
      'The grid is already at its widest — 10 s (2)',
    );
    expect(gridDivisionEndMessage('1/4', 'narrow')).toBe(
      'The grid is already at its narrowest — 1/32 (1)',
    );
    expect(gridDivisionEndMessage('1/4', 'widen')).toBe(
      'The grid is already at its widest — 1 bar (2)',
    );
    expect(gridDivisionEndMessage('1/4T', 'narrow')).toBe(
      'The grid is already at its narrowest — 1/32T (1)',
    );
    expect(gridDivisionEndMessage('1/4T', 'widen')).toBe(
      'The grid is already at its widest — 1/2T (2)',
    );
    expect(gridTripletRefusalMessage('1', null)).toBe(
      'Triplets need a tempo — enter a BPM first (3)',
    );
    expect(gridTripletRefusalMessage('bar', 90)).toBe(
      '1 bar has no triplets — choose 1/2 or narrower (3)',
    );
    expect(gridTripletRefusalMessage('0.5', 90)).toBe(
      'Triplets work only on the bars grid — choose 1/2 … 1/32 (3)',
    );
    expect(gridMusicalGroupLabel(92.5)).toBe('Bars · 92.5 BPM');
    expect(gridTripletGroupLabel(92.5)).toBe('Triplets · 92.5 BPM');
    expect(gridDivisionTitle('1/4', true)).toBe('Grid 1/4 · 1 — narrower, 2 — wider');
    expect(gridDivisionTitle('1/4', false)).toBe(
      'Grid 1/4 — lines are hidden at this zoom; Snap still works. Zoom in. · 1 — narrower, 2 — wider',
    );
  });

  it('ST25: studioGridStrings and the grid sources contain no Georgian codepoint', () => {
    expect(GEORGIAN_CODEPOINT.test('ა')).toBe(true);
    expect(GEORGIAN_CODEPOINT.test('Ა')).toBe(true);
    expect(GEORGIAN_CODEPOINT.test('ⴀ')).toBe(true);
    expect(GEORGIAN_CODEPOINT.test('abc — · …')).toBe(false);
    const formatterKeys = Object.entries(gs)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();
    expect(formatterKeys).toEqual(Object.keys(GRID_FORMATTER_SAMPLES).sort());
    for (const [key, value] of Object.entries(gs)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
    for (const [key, outputs] of Object.entries(GRID_FORMATTER_SAMPLES)) {
      expect(outputs.length, key).toBeGreaterThan(0);
      for (const output of outputs) {
        expect(output, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
    for (const path of [
      '../grid.ts',
      '../grid-divisions.ts',
      '../../../components/arrangement/ArrangementGridMenu.tsx',
    ]) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GEORGIAN_CODEPOINT);
    }
  });
});

describe('V-0.3b transport and navigation strings', () => {
  it('ST26: the new loop and view formatters return the exact English for Latin inputs', () => {
    expect(studioLoopStrings.braceTitle('00:01.000 — 00:03.000')).toBe(
      '00:01.000 — 00:03.000 · the bar moves the loop; the edges change its length',
    );
    expect(
      studioViewStrings.overviewVisibleStart({ start: '00:02.000', extent: '00:30.000' }),
    ).toBe('Visible start 00:02.000 / 00:30.000');
    expect(studioViewStrings.fitStatus('00:30.000')).toBe(
      'Fit: the entire project is visible (00:30.000). X goes back.',
    );
    expect(studioViewStrings.zoomedToSelection({ start: '00:01.000', end: '00:03.000' })).toBe(
      'Zoom to selection: 00:01.000 — 00:03.000. X goes back.',
    );
  });

  it('ST27: the transport, tempo row, ruler, overview and loop brace sources contain no Georgian codepoint', () => {
    for (const path of [
      '../../../components/arrangement/ArrangementTransport.tsx',
      '../../../components/arrangement/ArrangementTempoRow.tsx',
      '../../../components/arrangement/ArrangementRuler.tsx',
      '../../../components/arrangement/ArrangementOverview.tsx',
      '../../../components/arrangement/ArrangementLoopBrace.tsx',
    ]) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GEORGIAN_CODEPOINT);
    }
  });
});

const EXPECTED_MARKER_PLAIN_STRINGS: Record<string, string> = {
  menuRename: 'Rename (F2)',
  menuPlay: 'Play from here',
  menuDelete: 'Delete (Delete)',
  flagHint:
    'Click: jump here · Double-click: play from here · Drag or ← →: move · F2: rename · Delete: delete · Right-click or Shift+F10: menu',
  atTimeStart: 'The marker is at the start of the timeline.',
  noneAfter: 'No more markers after the playhead',
  noneBefore: 'No more markers before the playhead',
  notAdded: 'Marker not added',
  addTitle: 'Add a marker at the playhead or at the start of the time selection (M)',
  previousTitle: 'Jump to the previous marker (Ctrl+←)',
  nextTitle: 'Jump to the next marker (Ctrl+→)',
  nameFieldLabel: 'Marker name',
};

const ms = studioMarkerStrings;

const MARKER_FORMATTER_SAMPLES: Record<string, string[]> = {
  menuLabel: [ms.menuLabel('Intro')],
  existsAtTime: [ms.existsAtTime('Drop')],
  added: [ms.added({ name: 'Intro', time: '00:05.000' })],
  renameEmpty: [ms.renameEmpty('Intro')],
  renamed: [ms.renamed('Intro')],
  deleted: [ms.deleted('Intro')],
  moved: [ms.moved({ name: 'Intro', time: '00:07.000' })],
  flagLabel: [ms.flagLabel({ name: 'Hit', time: '00:00.500' })],
  flagHeading: [ms.flagHeading({ name: 'Hit', time: '00:00.500' })],
};

const GUILLEMET = /[«»]/;

describe('V-0.3c marker strings', () => {
  it('ST28: every plain-string property of studioMarkerStrings equals its exact English literal', () => {
    const plainKeys = Object.entries(ms)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_MARKER_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(ms)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_MARKER_PLAIN_STRINGS[key]);
      }
    }
  });

  it('ST29: every marker formatter returns the exact English for Latin inputs', () => {
    const formatterKeys = Object.entries(ms)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();
    expect(formatterKeys).toEqual(Object.keys(MARKER_FORMATTER_SAMPLES).sort());
    expect(ms.menuLabel('Intro')).toBe('Marker “Intro”');
    expect(ms.existsAtTime('Drop')).toBe('A marker already exists at this time: “Drop”');
    expect(ms.renameEmpty('Intro')).toBe('The name is empty — “Intro” is kept');
    expect(ms.renamed('Intro')).toBe('Marker name: “Intro”.');
    expect(ms.deleted('Intro')).toBe('Marker “Intro” deleted.');
    expect(ms.added({ name: 'Intro', time: '00:05.000' })).toBe(
      'Marker “Intro” added at 00:05.000.',
    );
    expect(ms.moved({ name: 'Intro', time: '00:07.000' })).toBe(
      'Marker “Intro” moved to 00:07.000.',
    );
    expect(ms.flagLabel({ name: 'Hit', time: '00:00.500' })).toBe('Marker “Hit” — 00:00.500');
    expect(ms.flagHeading({ name: 'Hit', time: '00:00.500' })).toBe('“Hit” — 00:00.500');
  });

  it('ST30: studioMarkerStrings and the marker row and menu sources contain no Georgian codepoint and no «»', () => {
    expect(GUILLEMET.test('«')).toBe(true);
    expect(GUILLEMET.test('»')).toBe(true);
    expect(GUILLEMET.test('“”')).toBe(false);
    for (const [key, value] of Object.entries(ms)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    for (const [key, outputs] of Object.entries(MARKER_FORMATTER_SAMPLES)) {
      expect(outputs.length, key).toBeGreaterThan(0);
      for (const output of outputs) {
        expect(output, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(output, key).not.toMatch(GUILLEMET);
      }
    }
    for (const path of [
      '../../../components/arrangement/ArrangementMarkerRow.tsx',
      '../../../components/arrangement/ArrangementMarkerMenu.tsx',
    ]) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GEORGIAN_CODEPOINT);
      expect(source, path).not.toMatch(GUILLEMET);
    }
  });
});

const EXPECTED_CLIP_ENVELOPE_STRINGS: Record<string, string> = {
  modeOn: 'Envelope mode: on.',
  modeOff: 'Envelope mode: off.',
  toggleOnTitle: 'Envelope on — double-click a clip to add a point (A)',
  toggleOffTitle: 'Envelope off — edit the clip volume envelope (A)',
  addPointLabel: 'Envelope: add point',
  movePointLabel: 'Envelope: move point',
  deletePointLabel: 'Envelope: delete point',
  editorTitle: 'Envelope — double-click = add point',
};

const EXPECTED_WORKSPACE_PLAIN_STRINGS: Record<string, string> = {
  headingSuffix: '· Workspace',
  rangeDeleteHint: 'Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time',
  clipLabel: 'Clip:',
};

const ws = studioWorkspaceStrings;

const WORKSPACE_FORMATTER_SAMPLES: Record<string, string[]> = {
  rangeReadout: [ws.rangeReadout({ start: '00:03.000', end: '00:05.000', length: '00:02.000' })],
  clipsSelected: [ws.clipsSelected(2), ws.clipsSelected(3)],
  selectedClipDetail: [
    ws.selectedClipDetail({ start: '00:02.000', length: '00:08.000', offset: '00:01.000' }),
  ],
  selectedClipTitle: [
    ws.selectedClipTitle({
      title: 'Song',
      start: '00:02.000',
      length: '00:08.000',
      offset: '00:01.000',
    }),
  ],
};

const V03D_NEW_FORMATTER_OUTPUTS: string[] = [
  ...Object.values(WORKSPACE_FORMATTER_SAMPLES).flat(),
  studioViewStrings.waveformZoomTitle(100),
  studioViewStrings.waveformZoomStatus(200),
  studioTrackGroupStrings.renameEmpty('Drums'),
  studioTrackGroupStrings.renamed('Drums'),
];

describe('V-0.3d workspace strings', () => {
  it('ST31: the clip-envelope and workspace objects have the exact keys, English literals and formatter outputs', () => {
    expect(Object.keys(studioClipEnvelopeStrings).sort()).toEqual([
      'addPointLabel',
      'deletePointLabel',
      'editorTitle',
      'modeOff',
      'modeOn',
      'movePointLabel',
      'pointAdded',
      'pointCommitted',
      'pointDeleted',
      'pointPreview',
      'pointTitle',
      'toggleOffTitle',
      'toggleOnTitle',
    ]);
    const envelopePlainKeys = Object.entries(studioClipEnvelopeStrings)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(envelopePlainKeys).toEqual(Object.keys(EXPECTED_CLIP_ENVELOPE_STRINGS).sort());
    for (const [key, value] of Object.entries(studioClipEnvelopeStrings)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_CLIP_ENVELOPE_STRINGS[key]);
      }
    }
    const envelopeSample = { time: '6.000 s', gain: '0.0 dB' };
    expect(studioClipEnvelopeStrings.pointTitle(envelopeSample)).toBe(
      'Envelope: 6.000 s · 0.0 dB — drag · double-click = delete',
    );
    expect(studioClipEnvelopeStrings.pointAdded(envelopeSample)).toBe(
      'Envelope: point added — 6.000 s · 0.0 dB.',
    );
    expect(studioClipEnvelopeStrings.pointPreview({ time: '6.000 s', gain: '−2.5 dB' })).toBe(
      'Envelope: 6.000 s · −2.5 dB',
    );
    expect(studioClipEnvelopeStrings.pointCommitted({ time: '6.000 s', gain: '−2.5 dB' })).toBe(
      'Envelope: 6.000 s · −2.5 dB.',
    );
    expect(studioClipEnvelopeStrings.pointDeleted('10.000 s')).toBe(
      'Envelope: point deleted — 10.000 s.',
    );
    expect(Object.keys(ws).sort()).toEqual([
      'clipLabel',
      'clipsSelected',
      'headingSuffix',
      'rangeDeleteHint',
      'rangeReadout',
      'selectedClipDetail',
      'selectedClipTitle',
    ]);
    const plainKeys = Object.entries(ws)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_WORKSPACE_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(ws)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_WORKSPACE_PLAIN_STRINGS[key]);
      }
    }
    const formatterKeys = Object.entries(ws)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();
    expect(formatterKeys).toEqual(Object.keys(WORKSPACE_FORMATTER_SAMPLES).sort());
    expect(ws.rangeReadout({ start: '00:03.000', end: '00:05.000', length: '00:02.000' })).toBe(
      'Time selection: 00:03.000 — 00:05.000 · length 00:02.000 ·',
    );
    expect(ws.clipsSelected(2)).toBe('2 clips selected');
    expect(ws.clipsSelected(3)).toBe('3 clips selected');
    expect(
      ws.selectedClipTitle({
        title: 'Song',
        start: '00:02.000',
        length: '00:08.000',
        offset: '00:01.000',
      }),
    ).toBe('Clip: Song · start 00:02.000 · length 00:08.000 · source offset 00:01.000');
    expect(
      ws.selectedClipDetail({ start: '00:02.000', length: '00:08.000', offset: '00:01.000' }),
    ).toBe(' · start 00:02.000 · length 00:08.000 · source offset 00:01.000');
    expect(studioViewStrings.waveformZoomTitle(100)).toBe(
      'Waveform Zoom 100% — view only, the sound does not change',
    );
    expect(studioViewStrings.waveformZoomStatus(200)).toBe(
      'Waveform Zoom 200% — view only, the sound does not change.',
    );
    expect(studioTrackGroupStrings.renameEmpty('Drums')).toBe(
      'The name is empty — “Drums” is kept',
    );
    expect(studioTrackGroupStrings.renamed('Drums')).toBe('Group name: “Drums”.');
  });

  it('ST32: the exported video aliases and waveformZoomStatus return the exact English', () => {
    expect(VIDEO_RETURNED_COMPACT_MESSAGE).toBe('The video went back to the compact view.');
    expect(VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE).toBe(
      'The video went back to the compact view; the library collapsed again.',
    );
    expect(waveformZoomStatus(2)).toBe(
      'Waveform Zoom 200% — view only, the sound does not change.',
    );
    expect(waveformZoomStatus(0.5)).toBe(
      'Waveform Zoom 50% — view only, the sound does not change.',
    );
  });

  it('ST33: the new texts, waveform-zoom.ts and StudioWorkspace have no Georgian and no «»', () => {
    for (const [key, value] of Object.entries(studioClipEnvelopeStrings)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    for (const [key, value] of Object.entries(ws)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    expect(V03D_NEW_FORMATTER_OUTPUTS.length).toBeGreaterThan(0);
    for (const output of V03D_NEW_FORMATTER_OUTPUTS) {
      expect(output).not.toMatch(GEORGIAN_CODEPOINT);
      expect(output).not.toMatch(GUILLEMET);
    }
    const zoomSource = stripSourceComments(readStoreSource('../waveform-zoom.ts'));
    expect(zoomSource.length).toBeGreaterThan(0);
    expect(zoomSource).not.toMatch(GEORGIAN_CODEPOINT);
    const workspace = stripSourceComments(
      readStoreSource('../../../components/arrangement/StudioWorkspace.tsx'),
    );
    const georgianLines = workspace
      .split(/\r?\n/)
      .filter((line) => GEORGIAN_CODEPOINT.test(line))
      .map((line) => line.trim());
    expect(georgianLines).toEqual([]);
    expect(workspace).not.toMatch(GUILLEMET);
    for (const name of ['X', 'Drums', 'SFX ქუჩა']) {
      expect(studioTrackGroupStrings.renameEmpty(name), name).toBe(
        studioMarkerStrings.renameEmpty(name),
      );
    }
  });
});

const cs = studioClipStrings;

const EXPECTED_CLIP_PLAIN_STRINGS: Record<string, string> = {
  foldedTitleLine: 'The track is folded — unfold it to make a time selection',
  videoFadeInTitle:
    'Video Fade In — picture only, the sound does not change · drag · double-click = 0',
  videoFadeOutTitle:
    'Video Fade Out — picture only, the sound does not change · drag · double-click = 0',
  keptLastFreeSpot: 'the clip stayed in its last free spot',
  moveBlocked:
    'Move blocked — a neighbouring clip or the start of the timeline. The clip stayed in its last free spot.',
  trimStartBlocked:
    'Trim stopped: the start of the source, a neighbouring clip or the minimum length (0.05 s).',
  trimEndBlocked:
    'Trim stopped: the end of the source, a neighbouring clip or the minimum length (0.05 s).',
  historyMoveClip: 'Move clip',
  trimStartLabel: 'Trim — left edge',
  trimEndLabel: 'Trim — right edge',
  rangeBodyTitle: 'drag = time selection · click = playhead',
};

const CLIP_GROUP_MOVE_SAMPLE = { label: 'Move (2)', count: 2, distance: '00:01.000' };

const CLIP_FORMATTER_SAMPLES: Record<string, string[]> = {
  fadePreview: [cs.fadePreview('Fade In', '1.000')],
  fadeCommitted: [cs.fadeCommitted('Fade In', '1.000'), cs.fadeCommitted('Fade In', '0.000')],
  historyUnchanged: [cs.historyUnchanged('Move clip'), cs.historyUnchanged('Envelope')],
  historyMoveClips: [cs.historyMoveClips(2), cs.historyMoveClips(3)],
  historyMoveToTrack: [cs.historyMoveToTrack('stems')],
  groupMovedRight: [cs.groupMovedRight(CLIP_GROUP_MOVE_SAMPLE)],
  groupMovedLeft: [cs.groupMovedLeft(CLIP_GROUP_MOVE_SAMPLE)],
  moveTitle: [cs.moveTitle('Song')],
  seconds: [cs.seconds('2.000')],
};

describe('V-0.4a clip strings', () => {
  it('ST34: studioClipStrings has the exact keys, English literals and formatter outputs', () => {
    expect(Object.keys(cs).sort()).toEqual(
      [...Object.keys(EXPECTED_CLIP_PLAIN_STRINGS), ...Object.keys(CLIP_FORMATTER_SAMPLES)].sort(),
    );
    for (const [key, value] of Object.entries(cs)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_CLIP_PLAIN_STRINGS[key]);
      } else {
        expect(CLIP_FORMATTER_SAMPLES[key], key).toBeDefined();
      }
    }
    expect(cs.fadePreview('Fade In', '1.000')).toBe('Fade In: 1.000 s');
    expect(cs.fadeCommitted('Fade In', '1.000')).toBe('Fade In: 1.000 s.');
    expect(cs.fadeCommitted('Fade In', '0.000')).toBe('Fade In: 0.000 s.');
    expect(cs.historyUnchanged('Move clip')).toBe(
      'Move clip: nothing changed — the Undo history is unchanged.',
    );
    expect(cs.historyUnchanged('Envelope')).toBe(
      'Envelope: nothing changed — the Undo history is unchanged.',
    );
    expect(cs.historyMoveClips(2)).toBe('Move (2)');
    expect(cs.historyMoveClips(3)).toBe('Move (3)');
    expect(cs.historyMoveToTrack('stems')).toBe('Move to track — stems');
    expect(cs.groupMovedRight(CLIP_GROUP_MOVE_SAMPLE)).toBe(
      'Move (2): 2 clips moved 00:01.000 to the right.',
    );
    expect(cs.groupMovedLeft(CLIP_GROUP_MOVE_SAMPLE)).toBe(
      'Move (2): 2 clips moved 00:01.000 to the left.',
    );
    expect(cs.moveTitle('Song')).toBe('Song — drag to move');
    expect(cs.seconds('2.000')).toBe('2.000 s');
  });

  it('ST35: studioClipStrings and ArrangementClip have no Georgian and no «»; three Context lines remain', () => {
    for (const [key, value] of Object.entries(cs)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    const outputs = Object.values(CLIP_FORMATTER_SAMPLES).flat();
    expect(outputs.length).toBeGreaterThan(0);
    for (const output of outputs) {
      expect(output).not.toMatch(GEORGIAN_CODEPOINT);
      expect(output).not.toMatch(GUILLEMET);
    }
    const clip = stripSourceComments(
      readStoreSource('../../../components/arrangement/ArrangementClip.tsx'),
    );
    expect(clip.length).toBeGreaterThan(0);
    const georgianLines = clip.split(/\r?\n/).filter((line) => GEORGIAN_CODEPOINT.test(line));
    expect(georgianLines).toEqual([]);
    expect(clip).not.toMatch(GUILLEMET);
    expect(CONTEXT_REMAINING_GEORGIAN_LINES).toHaveLength(0);
  });
});

const ls = studioLaneStrings;

const EXPECTED_LANE_PLAIN_STRINGS: Record<string, string> = {
  videoMixLabel: 'Original video sound',
  videoImportLabel: '＋ Your own video',
  foldTitle: 'Fold / unfold',
  soloTitle: 'Solo (Ctrl/Cmd+click = add to solo)',
  selectedSuffix: ', selected',
  activeBadge: '· active',
  videoImportTitle: 'Your own video',
  videoOriginalSound: 'Original sound',
  noVideo: 'No video',
  videoEmptyHint: 'use “＋ Your own video” or drop a file here',
  dropVideoHere: 'Drop the video here',
  videoNotOnAudioTrack: 'Video is not added here — drop it on the video track',
  ghostAudioOnVideoTrack: 'Audio is not added to the video track',
  ghostNotLoaded: 'This sound has not loaded yet',
  audioDecoding: 'Sound is decoding…',
  audioUnreadable: 'Sound could not be read',
  audioNone: 'No sound',
};

const LANE_FORMATTER_SAMPLES: Record<string, string[]> = {
  soloLabel: [ls.soloLabel('Drums')],
  foldLabel: [ls.foldLabel('Drums')],
  activeTrackLabel: [ls.activeTrackLabel('Drums')],
  panResetLabel: [ls.panResetLabel('Drums')],
  heightLabel: [ls.heightLabel('SFX')],
  foldedValueText: [ls.foldedValueText(80)],
};

describe('V-0.4b lane strings', () => {
  it('ST36: studioLaneStrings has the exact keys, English literals and formatter outputs', () => {
    expect(Object.keys(ls).sort()).toEqual(
      [...Object.keys(EXPECTED_LANE_PLAIN_STRINGS), ...Object.keys(LANE_FORMATTER_SAMPLES)].sort(),
    );
    for (const [key, value] of Object.entries(ls)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_LANE_PLAIN_STRINGS[key]);
      } else {
        expect(LANE_FORMATTER_SAMPLES[key], key).toBeDefined();
      }
    }
    expect(ls.soloLabel('Drums')).toBe('Solo — Drums (Ctrl/Cmd+click = add to solo)');
    expect(ls.foldLabel('Drums')).toBe('Fold or unfold — Drums');
    expect(ls.activeTrackLabel('Drums')).toBe('Drums — set as the active track');
    expect(ls.panResetLabel('Drums')).toBe('Reset Pan to centre — Drums');
    expect(ls.heightLabel('SFX')).toBe('Height — SFX');
    expect(ls.foldedValueText(80)).toBe('folded · 80 px');
  });

  it('ST37: studioLaneStrings and ArrangementLane have no Georgian and no «»', () => {
    for (const [key, value] of Object.entries(ls)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    const outputs = Object.values(LANE_FORMATTER_SAMPLES).flat();
    expect(outputs.length).toBeGreaterThan(0);
    for (const output of outputs) {
      expect(output).not.toMatch(GEORGIAN_CODEPOINT);
      expect(output).not.toMatch(GUILLEMET);
    }
    const lane = stripSourceComments(
      readStoreSource('../../../components/arrangement/ArrangementLane.tsx'),
    );
    expect(lane.length).toBeGreaterThan(0);
    const georgianLines = lane.split(/\r?\n/).filter((line) => GEORGIAN_CODEPOINT.test(line));
    expect(georgianLines).toEqual([]);
    expect(lane).not.toMatch(GUILLEMET);
  });
});

const gh = studioGroupHeaderStrings;
const mt = studioMeterStrings;

const EXPECTED_GROUP_HEADER_PLAIN_STRINGS: Record<string, string> = {
  nameTitle: 'F2: Rename · Ctrl+G: Group Tracks · Ctrl+Shift+G: Ungroup Tracks',
  foldedOneClip: ', folded, 1 clip',
};

const GROUP_HEADER_FORMATTER_SAMPLES: Record<string, string[]> = {
  nameLabel: [gh.nameLabel('Drums')],
  foldedClips: [gh.foldedClips(2)],
  foldLabel: [gh.foldLabel('Drums')],
  nameInputLabel: [gh.nameInputLabel('Drums')],
  muteLabel: [gh.muteLabel('Drums')],
  soloLabel: [gh.soloLabel('Drums')],
  volumeLabel: [gh.volumeLabel('Drums')],
};

const METER_FORMATTER_SAMPLES: Record<string, string[]> = {
  trackPeakTitle: [mt.trackPeakTitle({ name: 'SFX', peak: '−3.0' })],
  trackPeakOverTitle: [mt.trackPeakOverTitle({ name: 'SFX', peak: '+3.5' })],
  trackOverAnnouncement: [mt.trackOverAnnouncement('SFX')],
  masterPeakLabel: [mt.masterPeakLabel('−12.0')],
  masterPeakOverLabel: [mt.masterPeakOverLabel('+3.5')],
};

const V04C_ENVELOPE_FORMATTER_OUTPUTS: string[] = [
  studioClipEnvelopeStrings.pointTitle({ time: '6.000 s', gain: '0.0 dB' }),
  studioClipEnvelopeStrings.pointAdded({ time: '6.000 s', gain: '0.0 dB' }),
  studioClipEnvelopeStrings.pointPreview({ time: '6.000 s', gain: '−2.5 dB' }),
  studioClipEnvelopeStrings.pointCommitted({ time: '6.000 s', gain: '−2.5 dB' }),
  studioClipEnvelopeStrings.pointDeleted('10.000 s'),
];

describe('V-0.4c header, meter and envelope strings', () => {
  it('ST38: the group header and meter objects have the exact keys, English literals and formatter outputs', () => {
    expect(Object.keys(gh).sort()).toEqual(
      [
        ...Object.keys(EXPECTED_GROUP_HEADER_PLAIN_STRINGS),
        ...Object.keys(GROUP_HEADER_FORMATTER_SAMPLES),
      ].sort(),
    );
    for (const [key, value] of Object.entries(gh)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_GROUP_HEADER_PLAIN_STRINGS[key]);
      } else {
        expect(GROUP_HEADER_FORMATTER_SAMPLES[key], key).toBeDefined();
      }
    }
    expect(Object.keys(mt).sort()).toEqual(Object.keys(METER_FORMATTER_SAMPLES).sort());
    for (const [key, value] of Object.entries(mt)) {
      expect(typeof value, key).toBe('function');
    }
    expect(gh.nameLabel('Drums')).toBe('Drums — group');
    expect(gh.foldedClips(2)).toBe(', folded, 2 clips');
    expect(gh.foldLabel('Drums')).toBe('Fold or unfold group — Drums');
    expect(gh.nameInputLabel('Drums')).toBe('Group name — Drums');
    expect(gh.muteLabel('Drums')).toBe('Mute — Drums (group)');
    expect(gh.soloLabel('Drums')).toBe('Solo — Drums (group, Ctrl/Cmd+click = add to solo)');
    expect(gh.volumeLabel('Drums')).toBe('Volume — Drums (group)');
    expect(mt.trackPeakTitle({ name: 'SFX', peak: '−3.0' })).toBe('SFX · Peak −3.0 dBFS');
    expect(mt.trackPeakOverTitle({ name: 'SFX', peak: '+3.5' })).toBe(
      'SFX · Peak +3.5 dBFS — went above 0 dBFS. Click Master Peak to clear',
    );
    expect(mt.trackOverAnnouncement('SFX')).toBe('SFX: the level went above 0 dBFS');
    expect(mt.masterPeakLabel('−12.0')).toBe('Master Peak −12.0 dBFS — click to clear');
    expect(mt.masterPeakOverLabel('+3.5')).toBe(
      'Master Peak +3.5 dBFS — overload (Clip). Click to clear',
    );
  });

  it('ST39: the new texts and the envelope, group header, track meter and Master sources have no Georgian and no «»', () => {
    for (const [key, value] of [
      ...Object.entries(studioClipEnvelopeStrings),
      ...Object.entries(gh),
      ...Object.entries(mt),
    ]) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    const outputs = [
      ...V04C_ENVELOPE_FORMATTER_OUTPUTS,
      ...Object.values(GROUP_HEADER_FORMATTER_SAMPLES).flat(),
      ...Object.values(METER_FORMATTER_SAMPLES).flat(),
    ];
    const formatterCount = [
      ...Object.values(studioClipEnvelopeStrings),
      ...Object.values(gh),
      ...Object.values(mt),
    ].filter((value) => typeof value === 'function').length;
    expect(outputs.length).toBe(17);
    expect(outputs.length).toBeGreaterThanOrEqual(formatterCount);
    expect(V04C_ENVELOPE_FORMATTER_OUTPUTS.length).toBeGreaterThan(0);
    for (const samples of [
      ...Object.values(GROUP_HEADER_FORMATTER_SAMPLES),
      ...Object.values(METER_FORMATTER_SAMPLES),
    ]) {
      expect(samples.length).toBeGreaterThan(0);
    }
    for (const output of outputs) {
      expect(output).not.toMatch(GEORGIAN_CODEPOINT);
      expect(output).not.toMatch(GUILLEMET);
    }
    for (const path of [
      '../../../components/arrangement/ArrangementClipEnvelope.tsx',
      '../../../components/arrangement/ArrangementGroupHeader.tsx',
      '../../../components/arrangement/ArrangementTrackMeter.tsx',
      '../../../components/arrangement/ArrangementMaster.tsx',
    ]) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      const georgianLines = source.split(/\r?\n/).filter((line) => GEORGIAN_CODEPOINT.test(line));
      expect(georgianLines, path).toEqual([]);
      expect(source, path).not.toMatch(GUILLEMET);
    }
  });
});

describe('V-0.4d default names', () => {
  it('ST40: the default group prefix and the studio-lab track names are English', () => {
    expect(studioTrackGroupStrings.defaultNamePrefix).toBe('Group');
    expect(
      nextTrackGroupName(
        createArrangement([
          { id: 'v', kind: 'video', name: 'V' },
          { id: 'a', kind: 'audio', name: 'A' },
        ]),
      ),
    ).toBe('Group 1');
    const route = stripSourceComments(readStoreSource('../../../routes/studio-lab.tsx'));
    expect(route.length).toBeGreaterThan(0);
    const georgianLines = route
      .split(/\r?\n/)
      .filter((line) => GEORGIAN_CODEPOINT.test(line))
      .map((line) => line.trim());
    expect(georgianLines).toEqual([]);
    expect(route).toContain("{ title: 'Studio Lab — Demo workspace | CZABA' },");
    for (const name of ["name: 'Video'", "name: 'Music'", "name: 'Stems'", "name: 'SFX'"]) {
      expect(route, name).toContain(name);
    }
  });
});

const dt = studioDetailStrings;

const EXPECTED_DETAIL_PLAIN_STRINGS: Record<string, string> = {
  panelTitle: 'Clip details',
  nothingSelected: 'Nothing selected',
  noSelectionHint: 'Select a clip to see its details',
  multiClipNote: 'The selected clips move together · Delete deletes them · Ctrl+D duplicates them',
  videoPlaceholder: 'Video clip · no waveform',
  rangeMultiReason: 'A time selection is set on one clip — select only one',
  noneReason: 'Select a clip first',
  sourceUnchanged: 'The source file stays unchanged',
  clipGainMultiReason: 'Clip Gain works on audio clips only — remove the video from the selection',
  clipGainVideoReason: 'A video clip has no Clip Gain — use the track Volume/Mute',
  clipGainInvalid: 'Clip Gain: enter a number in dB (−60…+24).',
  pendingFull: 'Unsaved — Enter saves, Esc reverts',
  pendingLabel: 'Unsaved',
  trackLabel: 'Track',
  tracksLabel: 'Tracks',
  startLabel: 'Start',
  lengthLabel: 'Length',
  sourceOffsetLabel: 'Source offset',
  rangeFromLabel: 'From, s',
  rangeToLabel: 'To, s',
  rangeStartLabel: 'Time selection start (seconds)',
  rangeEndLabel: 'Time selection end (seconds)',
  applyRange: 'Set selection',
  clipGainResetLabel: 'Reset Clip Gain (0 dB)',
  heightLabel: 'Details height',
  expandLabel: 'Expand details',
  collapseLabel: 'Collapse details',
  expandText: 'Expand ▸',
  collapseText: 'Collapse ▾',
  rangeInvalid:
    'The time selection must stay inside the clip, and its end must be after its start.',
};

const DETAIL_FORMATTER_SAMPLES: Record<string, string[]> = {
  rangeApplied: [dt.rangeApplied({ start: '00:03.500', end: '00:07.250', track: 'Music' })],
  clipGainUnchanged: [dt.clipGainUnchanged('+3.0 dB')],
  clipCount: [dt.clipCount(1), dt.clipCount(2)],
  clipGainMembers: [dt.clipGainMembers(2, '0.0 dB')],
  collapsedValueText: [dt.collapsedValueText(130)],
};

describe('V-0.4e detail and library strings', () => {
  it('ST41: every plain-string property of studioDetailStrings equals its exact English literal', () => {
    expect(Object.keys(dt).sort()).toEqual(
      [
        'applyRange',
        'clipCount',
        'clipGainInvalid',
        'clipGainMembers',
        'clipGainMultiReason',
        'clipGainResetLabel',
        'clipGainUnchanged',
        'clipGainVideoReason',
        'collapseLabel',
        'collapseText',
        'collapsedValueText',
        'expandLabel',
        'expandText',
        'heightLabel',
        'lengthLabel',
        'multiClipNote',
        'noSelectionHint',
        'noneReason',
        'nothingSelected',
        'panelTitle',
        'pendingFull',
        'pendingLabel',
        'rangeApplied',
        'rangeEndLabel',
        'rangeFromLabel',
        'rangeInvalid',
        'rangeMultiReason',
        'rangeStartLabel',
        'rangeToLabel',
        'sourceOffsetLabel',
        'sourceUnchanged',
        'startLabel',
        'trackLabel',
        'tracksLabel',
        'videoPlaceholder',
      ].sort(),
    );
    for (const [key, value] of Object.entries(dt)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_DETAIL_PLAIN_STRINGS[key]);
      } else {
        expect(DETAIL_FORMATTER_SAMPLES[key], key).toBeDefined();
      }
    }
  });

  it('ST42: the detail formatters, the pending hint and the aliased exports return the exact English', () => {
    expect(dt.rangeApplied({ start: '00:03.500', end: '00:07.250', track: 'Music' })).toBe(
      'Time selection: 00:03.500 — 00:07.250 · Music.',
    );
    expect(dt.clipGainUnchanged('+3.0 dB')).toBe('Clip Gain unchanged: +3.0 dB.');
    expect(dt.clipCount(1)).toBe('1 clip');
    expect(dt.clipCount(2)).toBe('2 clips');
    expect(dt.clipGainMembers(2, '0.0 dB')).toBe('Clip Gain: 2 clips — 0.0 dB.');
    expect(dt.collapsedValueText(130)).toBe('collapsed · 130 px');
    expect(dt.pendingFull.startsWith(dt.pendingLabel)).toBe(true);
    expect(dt.pendingFull.slice(dt.pendingLabel.length)).toBe(' — Enter saves, Esc reverts');
    expect(DETAIL_RANGE_INVALID_MESSAGE).toBe(
      'The time selection must stay inside the clip, and its end must be after its start.',
    );
    expect(formatClipGainMembersStatus({ clipIds: ['a', 'b'], minDb: 15, maxDb: 22 })).toBe(
      'Clip Gain: 2 clips — +15.0 … +22.0 dB.',
    );
  });

  it('ST43: the library kind and folder labels are English', () => {
    expect(LIBRARY_KIND_LABELS).toEqual({ music: 'Music', stem: 'Stem', sfx: 'SFX' });
    expect(LIBRARY_FOLDER_LABELS).toEqual({ music: 'Music', stem: 'Stems', sfx: 'SFX' });
  });

  it('ST44: the detail panel, panels, clip-gain-multi and library sources and the detail texts have no Georgian and no «»', () => {
    for (const [key, value] of Object.entries(dt)) {
      if (typeof value === 'string') {
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
        expect(value, key).not.toMatch(GUILLEMET);
      }
    }
    const outputs = Object.values(DETAIL_FORMATTER_SAMPLES).flat();
    expect(outputs.length).toBe(6);
    for (const output of outputs) {
      expect(output).not.toMatch(GEORGIAN_CODEPOINT);
      expect(output).not.toMatch(GUILLEMET);
    }
    for (const path of [
      '../../../components/arrangement/ArrangementDetailPanel.tsx',
      '../panels.ts',
      '../clip-gain-multi.ts',
      '../library.ts',
    ]) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      const georgianLines = source.split(/\r?\n/).filter((line) => GEORGIAN_CODEPOINT.test(line));
      expect(georgianLines, path).toEqual([]);
      expect(source, path).not.toMatch(GUILLEMET);
    }
  });
});

const sl = studioSourceLoadStrings;

const EXPECTED_SOURCE_LOAD_PLAIN_STRINGS: Record<string, string> = {
  networkFailed: 'File failed to load (network)',
  decodeFailed: 'File could not be decoded',
  unknownSource: 'Unknown source',
  unknownDemoSource: 'Unknown demo source',
  purchasedNoProductId: 'The purchased collection has no productId',
  purchasedNoStems: 'The purchased collection has no stems',
  purchasedDuplicateStemId: 'A stem id repeats in the purchased collection',
  loadFailedFallback: 'Loading failed',
  rowLoading: 'Loading…',
  rowPreviewing: '▶ Playing',
};

function normalisedGeorgianLines(relativePath: string): string[] {
  return stripSourceComments(readStoreSource(relativePath))
    .split(/\r?\n/)
    .filter((line) => GEORGIAN_CODEPOINT.test(line))
    .map((line) => line.trim().replaceAll('${', '{'));
}

const LIBRARY_REMAINING_GEORGIAN_LINES: readonly string[] = [];

const COLLECTION_REMAINING_GEORGIAN_LINES: readonly string[] = [];

const DEMO_REMAINING_GEORGIAN_LINES = [
  "const SYNTHETIC_COMPOSITION_TITLE = 'ღამის პულსი';",
  "pulse: 'პულსი',",
  "bass: 'ბასი',",
  "pad: 'პადი',",
  "lead: 'მელოდია',",
  "title: 'Middle East — საჯარო preview',",
  "title: 'CZABA hero — საჯარო preview',",
  'title: `{SYNTHETIC_COMPOSITION_TITLE} · სრული მიქსი`,',
  "shortTitle: 'სრული მიქსი',",
];

describe('V-0.5a source-load strings', () => {
  it('ST45: every plain-string property of studioSourceLoadStrings equals its exact English literal', () => {
    expect(Object.keys(sl).sort()).toEqual(
      [
        'decodeFailed',
        'httpFailed',
        'loadFailedFallback',
        'networkFailed',
        'purchasedCollectionLabel',
        'purchasedDuplicateStemId',
        'purchasedNoProductId',
        'purchasedNoStems',
        'rowError',
        'rowLoading',
        'rowPreviewing',
        'unknownDemoSource',
        'unknownSource',
      ].sort(),
    );
    const plainKeys = Object.entries(sl)
      .filter(([, value]) => typeof value === 'string')
      .map(([key]) => key)
      .sort();
    expect(plainKeys).toEqual(Object.keys(EXPECTED_SOURCE_LOAD_PLAIN_STRINGS).sort());
    for (const [key, value] of Object.entries(sl)) {
      if (typeof value === 'string') {
        expect(value, key).toBe(EXPECTED_SOURCE_LOAD_PLAIN_STRINGS[key]);
        expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      }
    }
  });

  it('ST46: the source-load formatters return the exact English', () => {
    expect(sl.httpFailed(404)).toBe('File failed to load (404)');
    expect(sl.rowError('File could not be decoded')).toBe('Error: File could not be decoded');
    expect(sl.purchasedCollectionLabel('Middle East')).toBe('Middle East · purchased stems');
    expect(sl.rowError('')).toBe('Error: ');
  });

  it('ST47: the library, preview and collection sources have no Georgian lines; the demo source keeps only the sound titles', () => {
    expect(
      normalisedGeorgianLines('../../../components/arrangement/ArrangementLibrary.tsx'),
    ).toEqual(LIBRARY_REMAINING_GEORGIAN_LINES);
    expect(normalisedGeorgianLines('../collection.ts')).toEqual(
      COLLECTION_REMAINING_GEORGIAN_LINES,
    );
    expect(normalisedGeorgianLines('../../../data/studio-lab-demo.ts')).toEqual(
      DEMO_REMAINING_GEORGIAN_LINES,
    );
    for (const path of [
      '../library.ts',
      '../strings.ts',
      './library-row-strings-ui.test.tsx',
      '../../../components/arrangement/ArrangementLibrary.tsx',
      '../../../components/arrangement/ArrangementLibraryPreview.tsx',
      '../collection.ts',
      '../../../data/studio-lab-demo.ts',
      '../../../components/arrangement/ArrangementVideoDock.tsx',
      '../../../routes/studio-lab.tsx',
      './video-dock-strings-ui.test.tsx',
    ]) {
      const source = stripSourceComments(readStoreSource(path));
      expect(source.length, path).toBeGreaterThan(0);
      expect(source, path).not.toMatch(GUILLEMET);
    }
    for (const path of [
      '../library.ts',
      '../strings.ts',
      './library-row-strings-ui.test.tsx',
      '../../../components/arrangement/ArrangementLibrary.tsx',
      '../../../components/arrangement/ArrangementLibraryPreview.tsx',
      '../collection.ts',
      '../../../components/arrangement/ArrangementVideoDock.tsx',
      '../../../routes/studio-lab.tsx',
      './video-dock-strings-ui.test.tsx',
    ]) {
      expect(normalisedGeorgianLines(path), path).toEqual([]);
    }
  });

  it('ST48: every kind and folder label, lower-cased, is a search keyword of its kind', () => {
    const kinds: readonly WorkspaceSourceKind[] = ['music', 'stem', 'sfx'];
    for (const kind of kinds) {
      expect(LIBRARY_KIND_SEARCH_KEYWORDS[kind], kind).toContain(
        LIBRARY_KIND_LABELS[kind].toLocaleLowerCase(),
      );
      expect(LIBRARY_KIND_SEARCH_KEYWORDS[kind], kind).toContain(
        LIBRARY_FOLDER_LABELS[kind].toLocaleLowerCase(),
      );
    }
  });
});

const EXPECTED_LIBRARY_PANEL_STRINGS: Record<string, string> = {
  library: 'Library',
  expand: 'Expand library',
  collapse: 'Collapse library',
  searchPlaceholder: 'Search: name, type, collection…',
  searchLabel: 'Search the library',
  clearSearch: 'Clear search',
  filterPrefix: 'Filter: ',
  sidebarLabel: 'Library sidebar',
  all: 'All',
  fold: 'Fold',
  unfold: 'Unfold',
  listLabel: 'Sounds',
  noResults: 'No sounds found.',
  widthLabel: 'Library width',
  previewLabel: 'Preview',
  previewEmpty: 'Select a sound in the list',
  previewWaveLabel: 'Preview waveform — click = play from here · ← → 1 s · Home/End · Space = ▶/■',
  activeTrack: 'Active track:',
  videoTrackNote: ' (audio is not added here)',
  previewPlay: '▶ Preview',
  previewStop: '■ Stop',
  add: '＋ Add',
};

describe('V-0.5b library panel strings', () => {
  it('ST49: studioLibraryPanelStrings has the exact keys, English literals and codepoints, with no Georgian and no «»', () => {
    expect(Object.keys(studioLibraryPanelStrings).sort()).toEqual(
      [
        'activeTrack',
        'add',
        'all',
        'clearSearch',
        'collapse',
        'expand',
        'filterPrefix',
        'fold',
        'library',
        'listLabel',
        'noResults',
        'previewEmpty',
        'previewLabel',
        'previewPlay',
        'previewStop',
        'previewWaveLabel',
        'searchLabel',
        'searchPlaceholder',
        'sidebarLabel',
        'unfold',
        'videoTrackNote',
        'widthLabel',
      ].sort(),
    );
    expect(Object.keys(EXPECTED_LIBRARY_PANEL_STRINGS)).toHaveLength(22);
    for (const [key, value] of Object.entries(studioLibraryPanelStrings)) {
      expect(value, key).toBe(EXPECTED_LIBRARY_PANEL_STRINGS[key]);
      expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      expect(value, key).not.toMatch(GUILLEMET);
    }
    const lp = studioLibraryPanelStrings;
    expect(lp.searchPlaceholder.endsWith(String.fromCodePoint(0x2026))).toBe(true);
    expect(lp.add.startsWith(String.fromCodePoint(0xff0b))).toBe(true);
    expect(lp.previewWaveLabel).toContain(String.fromCodePoint(0x2014));
    expect(lp.previewWaveLabel).toContain(String.fromCodePoint(0x00b7));
    expect(lp.filterPrefix.endsWith(' ')).toBe(true);
    expect(lp.videoTrackNote.startsWith(' ')).toBe(true);
  });
});

const EXPECTED_VIDEO_DOCK_STRINGS: Record<string, string> = {
  dockLabel: 'Video',
  overviewNote: '· Overview',
  captionFallback: 'Video',
  captionSoundNote: '· sound from the video track (M/S/Volume)',
  gapPrefix: 'No video ·',
  empty: 'No video added yet',
  placeholderExpanded: 'Video expanded',
  placeholderReturn: 'Return',
  returnLabel: 'Return the video to the compact view',
  expandLabel: 'Expand video',
  dragLabel: 'Move the video (arrow keys: 16 px)',
  dragTitle: 'Move the video',
  closeLabel: 'Close the expanded video',
  closeTitle: 'Close (Esc)',
  previewLabel: 'Video preview',
  standbyLabel: 'Video preview (standby)',
  playFailed: 'Video playback failed — try MP4 (H.264) or WebM.',
};

function collectWorkspaceSourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = resolve(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      if (entry !== '__tests__') {
        files.push(...collectWorkspaceSourceFiles(fullPath));
      }
      continue;
    }
    if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('V-0.5c video dock strings and the final RV-4 sweep', () => {
  it('ST50: studioVideoDockStrings has the exact keys, English literals and codepoints, with no Georgian and no «»', () => {
    expect(Object.keys(studioVideoDockStrings).sort()).toEqual(
      [
        'captionFallback',
        'captionSoundNote',
        'closeLabel',
        'closeTitle',
        'dockLabel',
        'dragLabel',
        'dragTitle',
        'empty',
        'expandLabel',
        'gapPrefix',
        'overviewNote',
        'placeholderExpanded',
        'placeholderReturn',
        'playFailed',
        'previewLabel',
        'returnLabel',
        'standbyLabel',
      ].sort(),
    );
    expect(Object.keys(EXPECTED_VIDEO_DOCK_STRINGS)).toHaveLength(17);
    for (const [key, value] of Object.entries(studioVideoDockStrings)) {
      expect(value, key).toBe(EXPECTED_VIDEO_DOCK_STRINGS[key]);
      expect(value, key).not.toMatch(GEORGIAN_CODEPOINT);
      expect(value, key).not.toMatch(GUILLEMET);
    }
    const vd = studioVideoDockStrings;
    const middleDot = String.fromCodePoint(0x00b7);
    expect(vd.overviewNote.startsWith(middleDot)).toBe(true);
    expect(vd.captionSoundNote.startsWith(middleDot)).toBe(true);
    expect(vd.playFailed).toContain(String.fromCodePoint(0x2014));
    expect(vd.gapPrefix.endsWith(middleDot)).toBe(true);
    expect(vd.gapPrefix.endsWith(' ')).toBe(false);
  });

  it('ST51: every Studio workspace source, found by a directory walk, has no Georgian lines except the demo sound titles', () => {
    const walked = [
      ...collectWorkspaceSourceFiles(resolve(__dirname, '../../../components/arrangement')),
      ...collectWorkspaceSourceFiles(resolve(__dirname, '..')),
    ];
    expect(walked.length).toBeGreaterThanOrEqual(60);
    const named = [
      resolve(__dirname, '../../../contexts/ArrangementContext.tsx'),
      resolve(__dirname, '../../../routes/studio-lab.tsx'),
      resolve(__dirname, '../../../data/studio-lab-demo.ts'),
    ];
    const demoPath = resolve(__dirname, '../../../data/studio-lab-demo.ts');
    for (const fullPath of [...walked, ...named]) {
      const path = relative(__dirname, fullPath);
      const lines = normalisedGeorgianLines(path);
      if (fullPath === demoPath) {
        expect(lines, path).toEqual(DEMO_REMAINING_GEORGIAN_LINES);
      } else {
        expect(lines, path).toEqual([]);
      }
    }
  });
});
