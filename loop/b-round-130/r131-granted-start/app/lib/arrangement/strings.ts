interface StudioTimeSpanText {
  start: string;
  end: string;
  seconds: string;
}

export const studioExportStrings = {
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
  rangeSeconds: (seconds: number): string => `${seconds.toFixed(3)} s`,
  projectScope: (start: string, end: string): string => `Entire project · ${start} — ${end}`,
  rangeScope: (rangeLabel: string): string => `Time selection · ${rangeLabel}`,
  loopRangeNote: ({ start, end, seconds }: StudioTimeSpanText): string =>
    `Loop does not change the export — the time selection is exported (${start} — ${end}, ${seconds}).`,
  loopProjectNote: (start: string, end: string): string =>
    `Loop does not change the export — the entire project is exported (${start} — ${end}).`,
  videoSoundLabel: (videoName: string): string => `Original video sound (${videoName}):`,
  noSoundNote: (creates: string, length: string): string =>
    `There is no clip with sound in the project — ${creates} with ${length} of silence.`,
  masterMutedNote: (creates: string, length: string): string =>
    `Master is muted (M) — ${creates} with ${length} of silence. Unmute Master if you need sound.`,
  masterGainNote: (gain: string): string => `Master: ${gain} — included in the export.`,
  progressRendering: (percent: number): string => `Rendering · ${percent}%`,
  progressWavWrite: (percent: number): string => `Writing WAV · ${percent}%`,
  progressMp3Encode: (percent: number): string => `Creating MP3 · ${percent}%`,
  wavWorkerStalled: (seconds: number): string =>
    `Writing WAV stalled — the worker has not responded for ${seconds} seconds.`,
  overloadWarning: ({
    peakDb,
    clippedSamples,
    reductionDb,
  }: {
    peakDb: string;
    clippedSamples: number;
    reductionDb: string;
  }): string =>
    `Overload: peak +${peakDb} dBFS — ${clippedSamples} ${clippedSamples === 1 ? 'sample' : 'samples'} clipped to 0 dBFS. Lower Master by at least ${reductionDb} dB and export again.`,
  exportedRange: ({ start, end, seconds }: StudioTimeSpanText): string =>
    `time selection ${start} — ${end} (${seconds})`,
  wavDone: (exportedLength: string, masterSuffix: string): string =>
    `WAV created: ${exportedLength}, 24-bit · 48 kHz · stereo.${masterSuffix}`,
  mp3Done: (exportedLength: string, masterSuffix: string): string =>
    `MP3 created: ${exportedLength}, 48 kHz · stereo.${masterSuffix}`,
  bothDone: (exportedLength: string, masterSuffix: string): string =>
    `WAV and MP3 created: ${exportedLength}, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.${masterSuffix}`,
  exportFailed: (reason: string): string => `Export failed — no file was created. ${reason}`,
  mp3Failed: (reason: string): string => `Creating MP3 failed — no file was created. ${reason}`,
  encoderLoadTimeout: (seconds: number): string =>
    `The MP3 encoder did not load within ${seconds} seconds — no file was created. Check your internet connection and try again, or choose WAV.`,
};

interface StudioTimeRangeText {
  start: string;
  end: string;
}

interface StudioTrackSpanText extends StudioTimeRangeText {
  track: string;
}

export const studioEditStrings = {
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
  historySplitClips: (count: number): string => `Split (${count})`,
  splitClipsDone: ({ count, time }: { count: number; time: string }): string =>
    count === 1
      ? `1 clip split at ${time}; the right part is selected.`
      : `${count} clips split at ${time}; the right parts are selected.`,
  splitDone: (time: string): string => `Clip split at ${time}.`,
  deleteRangeDone: ({ start, end, lanes }: StudioTimeRangeText & { lanes: string }): string =>
    `⌫ Deleted ${start} — ${end} ${lanes}; the gap remains.`,
  onTrack: (track: string): string => `on the ${track} track`,
  historyDeleteClips: (count: number): string => `Delete clips (${count})`,
  deleteClipsDone: (count: number): string =>
    count === 1 ? '1 clip deleted; the gap remains.' : `${count} clips deleted; the gap remains.`,
  extendDone: ({ start, end }: StudioTimeRangeText): string =>
    `Selection on all tracks: ${start} — ${end}.`,
  duplicateConflict: ({ track, start, end }: StudioTrackSpanText): string =>
    `Duplicate failed: ${start}–${end} on the ${track} track is occupied. Nothing changed.`,
  historyDuplicate: (count: number): string => `Duplicate (${count})`,
  duplicateDone: ({ count, from }: { count: number; from: string }): string =>
    count === 1
      ? `Duplicate (1): the copy starts at ${from}.`
      : `Duplicate (${count}): copies start at ${from}.`,
  copyRangeDone: ({
    lane,
    start,
    end,
    parts,
  }: StudioTimeRangeText & { lane: string; parts: number }): string =>
    `Copy: ${lane} ${start}–${end} (${parts} ${parts === 1 ? 'part' : 'parts'}).`,
  copyClipsDone: (count: number): string =>
    `Copy: ${count} ${count === 1 ? 'clip' : 'clips'} on the clipboard.`,
  cutDone: (parts: number): string =>
    `Cut: ${parts} ${parts === 1 ? 'part' : 'parts'} on the clipboard; the gap remains.`,
  cutTimeNothing: ({ start, end }: StudioTimeRangeText): string =>
    `Cut Time ${start} — ${end}: no time to cut — nothing changed, the clipboard did not change.`,
  cutTimeParts: (parts: number): string =>
    `${parts} ${parts === 1 ? 'part' : 'parts'} on the clipboard`,
  markersRemoved: (count: number): string =>
    ` ${count} ${count === 1 ? 'marker' : 'markers'} deleted.`,
  cutTimeDone: ({
    start,
    end,
    clipboard,
    suffix,
  }: StudioTimeRangeText & { clipboard: string; suffix: string }): string =>
    `Cut Time ${start} — ${end}: ${clipboard}; the gap was closed on all tracks.${suffix}`,
  pasteOverlap: ({ track, start, end }: StudioTrackSpanText): string =>
    `Paste failed: ${start}–${end} on the ${track} track is occupied. Nothing changed.`,
  pasteLaneKind: ({ track, at }: { track: string; at: string }): string =>
    `Paste failed: this material does not fit on the ${track} track from ${at} (audio and video do not swap tracks). Nothing changed.`,
  historyPaste: (count: number): string => `Paste (${count})`,
  pasteTrackSuffix: (track: string): string => ` · on the ${track} track`,
  pasteDone: ({
    count,
    at,
    trackSuffix,
  }: {
    count: number;
    at: string;
    trackSuffix: string;
  }): string => `Paste (${count}): at ${at}${trackSuffix}.`,
};

export const studioPlaybackStrings = {
  webAudioUnavailable:
    'Web Audio is not available in this browser — playback and export will not work.',
  nothingToPlay: 'Nothing to play — add a clip from the library first.',
  playPastEnd: ({ position, end }: { position: string; end: string }): string =>
    `Playhead (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.`,
};

export const studioLibraryStrings = {
  audioOnVideoTrack:
    'Choose an audio track (music, stems or SFX) — audio is not added to the video track.',
  dropBlocked: 'No room here — clips on one track do not overlap.',
  selectSoundFirst: 'Select a sound in the library first.',
  addFailed: 'Could not add the clip.',
  nearestFreeSpot: ' (nearest free spot)',
  dropNotLoaded: 'This sound has not loaded yet — wait and try again.',
  sourceFailed: (title: string): string =>
    `“${title}” failed to load — details are in the library.`,
  sourceNotLoaded: (title: string): string => `“${title}” has not loaded yet.`,
  historyAdd: (title: string): string => `Add — ${title}`,
  clipAdded: ({
    title,
    track,
    time,
    suffix,
  }: {
    title: string;
    track: string;
    time: string;
    suffix: string;
  }): string => `“${title}” added to the ${track} track at ${time}${suffix}.`,
};

export const studioLoopStrings = {
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
  replaced: (span: string): string => `Loop replaced with the new range: ${span}.`,
  created: (span: string): string => `Loop created and turned on: ${span}.`,
};

export const studioMoveStrings = {
  undoBlockedDuringDrag: 'Undo/Redo does not work while dragging — let go first.',
  editBlockedDuringDrag: 'Editing does not work while dragging — let go first.',
  nudgeAtTimeStart: 'Nudge blocked — start of the timeline.',
  nudgeBlocked: 'Nudge blocked — a neighbouring clip or the start of the timeline.',
  historyNudgeClip: 'Nudge clip',
};
