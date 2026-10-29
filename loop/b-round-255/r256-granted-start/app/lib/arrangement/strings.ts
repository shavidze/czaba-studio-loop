import { studioShortcutTitle } from './shortcuts';

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
  mp3FormatNote: 'LAME (mediabunny) — 320 kbps CBR; the encoder loads with the first MP3 export',
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
  encoderLoading: 'Loading the MP3 encoder (LAME)…',
  encoderLoadFailed:
    'The MP3 encoder failed to load — no file was created. Reload the page and try again, or choose WAV.',
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
  splitMissesSelection: 'The insert marker does not cross any selected clip.',
  splitRangeFailed: 'Could not split at the time selection.',
  historySplitRange: 'Split at time selection',
  splitRangeDone: 'Clip split at both edges of the time selection; the middle part is selected.',
  splitNeedsTarget:
    'To split, click inside a clip to select it and place the insert marker, or make a time selection.',
  splitInsertMarkerOutside: 'The insert marker must be inside the selected clip.',
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
  splitRangeTitle: studioShortcutTitle('Split at both edges of the time selection', 'split'),
  splitAtInsertMarkerTitle: studioShortcutTitle('Split at the insert marker', 'split'),
  deleteRangeHint:
    'Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
  deleteRangeAllTracksHint:
    'Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
  deleteClipTitle: studioShortcutTitle('Delete clip — leaves a gap', 'delete'),
  undoTitle: (label: string | null): string =>
    studioShortcutTitle(label ? `Undo: ${label}` : 'Undo', 'undo'),
  redoTitle: (label: string | null): string =>
    studioShortcutTitle(label ? `Redo: ${label}` : 'Redo', 'redo'),
  deleteClipLabel: 'Delete — the selected clip; leaves a gap',
  deleteButton: 'Delete',
  historySplitClips: (count: number): string => `Split (${count})`,
  splitClipsDone: ({ count, time }: { count: number; time: string }): string =>
    count === 1
      ? `1 clip split at ${time}; the right part is selected.`
      : `${count} clips split at ${time}; the right parts are selected.`,
  splitDone: (time: string): string => `Clip split at ${time}.`,
  deleteRangeDone: ({ start, end, lanes }: StudioTimeRangeText & { lanes: string }): string =>
    `Deleted ${start} — ${end} ${lanes}; the gap remains.`,
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
  backToStartLabel: 'Back to start',
  backToStartTitle: studioShortcutTitle('Back to start', 'back-to-start'),
  playLabel: 'Play',
  pauseLabel: 'Pause',
  playTitle: studioShortcutTitle('Play', 'play-stop'),
  pauseTitle: studioShortcutTitle('Pause', 'play-stop'),
  projectEndPrefix: '/ end',
  playPastEnd: ({
    subject,
    position,
    end,
  }: {
    subject: string;
    position: string;
    end: string;
  }): string =>
    position === end
      ? `${subject} (${position}) is at the end of the project — there is nothing to play here. Home returns to 0.`
      : `${subject} (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.`,
  startPointInsertMarker: 'Insert marker',
  startPointSelection: 'Time selection start',
  startPointPlayhead: 'Playhead',
  insertMarkerWhilePlaying: (time: string): string =>
    `Insert marker at ${time} — playback continues. Stop, then Space plays from here.`,
  insertMarkerWhilePlayingFollowPaused: (time: string): string =>
    `Insert marker at ${time} — playback continues, Follow paused. Stop, then Space plays from here.`,
  insertMarkerAfterStop: (time: string): string =>
    `Stopped — Space plays from the insert marker at ${time}.`,
  insertMarkerToPlayhead: (time: string): string =>
    `Insert marker moved to the playhead (${time}). Space plays from here.`,
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
  kindMusic: 'Music',
  kindStem: 'Stem',
  folderMusic: 'Music',
  folderStems: 'Stems',
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
  selectionTitle: studioShortcutTitle('Loop the time selection', 'loop'),
  toggleTitle: studioShortcutTitle('Loop on / off', 'loop'),
  needsSelectionTitle: studioShortcutTitle('Loop: make a time selection first', 'loop'),
  braceKeyboardHint: '← → nudge · Shift + ← → length',
  braceStartTitle: 'Loop start',
  braceEndTitle: 'Loop end',
  replaced: (span: string): string => `Loop replaced with the new range: ${span}.`,
  created: (span: string): string => `Loop created and turned on: ${span}.`,
  braceTitle: (span: string): string =>
    `${span} · the bar moves the loop; the edges change its length`,
};

export const studioMoveStrings = {
  undoBlockedDuringDrag: 'Undo/Redo does not work while dragging — let go first.',
  editBlockedDuringDrag: 'Editing does not work while dragging — let go first.',
  nudgeAtTimeStart: 'Nudge blocked — start of the timeline.',
  nudgeBlocked: 'Nudge blocked — a neighbouring clip or the start of the timeline.',
  historyNudgeClip: 'Nudge clip',
};

export const studioVideoStrings = {
  unknownType: 'unknown type',
  dropOnVideoTrack: 'Drop the video on the video track.',
  noSound: 'The video has no sound',
  tooLongToRead: 'Sound not read: the video is longer than 20 minutes',
  tooLargeToRead: 'Sound not read: the file is larger than 1 GB',
  soundUnreadable: studioExportStrings.videoSoundUnreadable,
  probeCancelled: 'Adding the video was cancelled.',
  decodeCancelled: "Reading the video's sound was cancelled.",
  opening: (name: string): string => `Opening “${name}”…`,
  addToTrackFailed: (name: string): string => `“${name}”: could not be added to the video track.`,
  historyAddVideo: (name: string): string => `Add video — ${name}`,
  added: ({ name, start, end }: { name: string; start: string; end: string }): string =>
    `“${name}” added to the video track: ${start} — ${end}`,
  importFailed: (detail: string): string => `Could not add the video: ${detail}`,
  audioFileRejected: (name: string): string =>
    `“${name}”: audio files cannot be added here — only your own video can; sounds are added from the library.`,
  notVideo: (name: string, detail: string): string =>
    `“${name}”: the format is not video (${detail}).`,
  probeFailed: (name: string): string =>
    `“${name}”: the browser could not open this video — try MP4 (H.264) or WebM.`,
  expanded:
    'The video is expanded over the library. Drag it where you want; Esc or Close brings it back.',
  expandedLibraryOpened:
    'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or Close brings it back.',
  returnedLibraryCollapsed: 'The library collapsed, so the video went back to the compact view.',
  returnedCompact: 'The video went back to the compact view.',
  returnedLibraryRecollapsed:
    'The video went back to the compact view; the library collapsed again.',
};

export const studioTempoStrings = {
  scrubStripTitle: 'Click = play from here',
  cleared: 'Tempo cleared — the bars ruler is hidden. Audio is unchanged.',
  fieldLabel: 'Project tempo (BPM)',
  fieldTitle:
    'Project tempo — bars grid only; audio is not stretched (no time-stretch). Enter — save · Esc — cancel · empty — hide the bars',
  invalid: ({ min, max }: { min: number; max: number }): string =>
    `Tempo must be ${min}–${max} BPM (e.g. 90 or 92.5) — not changed.`,
  set: ({ bpm, beatsPerBar }: { bpm: string; beatsPerBar: number }): string =>
    `Tempo ${bpm} BPM · ${beatsPerBar}/4 — bars ruler updated. Grid only: audio is not stretched.`,
  seeded: ({ bpm, title }: { bpm: string; title: string }): string =>
    `Tempo ${bpm} BPM from “${title}” — bars ruler on. Grid only: audio is not stretched.`,
};

export const studioMetronomeStrings = {
  needsTempoTitle: 'Metronome — set a BPM first',
  off: 'Metronome is off.',
  toggleLabel: 'Metronome',
  title: (beatsPerBar: number): string =>
    `Metronome — a click on every beat during playback (${beatsPerBar}/4, the first beat of each bar is louder). Master volume and Mute also apply to it. Not included in the export.`,
  on: ({ bpm, beatsPerBar }: { bpm: string; beatsPerBar: number }): string =>
    `Metronome is on — ${bpm} BPM, ${beatsPerBar}/4: a click on every beat, louder on the first beat of each bar. Not included in the export.`,
};

export const studioViewStrings = {
  followOffTitle: 'Follow off: the view does not follow playback',
  followPausedTitle: 'Follow paused — press Follow, or stop playback, to resume',
  followOnTitle: 'Follow: the view follows the playback position',
  zoomSliderLabel: 'Zoom (px/s)',
  zoomSliderTitle: 'Zoom around the playhead · + / − · Ctrl+wheel',
  zoomToSelectionLabel: 'Zoom to selection (Z)',
  zoomToSelectionTitle: 'Zoom to the time selection (Z)',
  zoomToSelectionNeedsRangeTitle: 'Zoom to selection: make a time selection first (Z)',
  zoomBackTitle: 'Back to the previous zoom (X)',
  zoomBackEmptyTitle:
    'Previous zoom: the history is empty — use Fit or Zoom to selection first (X)',
  fitTitle:
    'Fit — the entire project is visible (double-click the overview, or the ruler with no time selection)',
  playheadTitle: 'Playhead — drag · ←/→ = ±0.1 s',
  rulerTitle:
    'Click = insert marker · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection',
  overviewLabel: 'Overview — entire project (← → = 5 s, double-click = Fit)',
  overviewTitle:
    'Overview: click = centre here · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit',
  followPaused: 'Follow paused by manual navigation. Press Follow, or stop playback, to resume it.',
  zoomNeedsSelection: 'To zoom, make a time selection first.',
  zoomHistoryEmpty: 'The zoom history is empty — there is no view to go back to.',
  zoomBackMore: 'Previous view restored. X goes back one more step.',
  zoomBackDone: 'Previous view restored.',
  followOff: 'Follow off: the view does not move by itself.',
  followResumed: 'Follow is following the playback position again.',
  followOn: 'Follow on: the view follows the playback position during playback.',
  overviewHidden: 'Overview hidden. Ctrl+Alt+O shows it again.',
  overviewShown: 'Overview shown. Ctrl+Alt+O hides it.',
  zoomReadout: (value: number): string => `${value} px/s`,
  overviewVisibleStart: ({ start, extent }: { start: string; extent: string }): string =>
    `Visible start ${start} / ${extent}`,
  fitStatus: (extent: string): string =>
    `Fit: the entire project is visible (${extent}). X goes back.`,
  zoomedToSelection: ({ start, end }: StudioTimeRangeText): string =>
    `Zoom to selection: ${start} — ${end}. X goes back.`,
  waveformZoomLabel: 'Waveform Zoom — view only, the sound does not change',
  waveformZoomTitle: (percent: number): string =>
    `Waveform Zoom ${percent}% — view only, the sound does not change`,
  waveformZoomStatus: (percent: number): string =>
    `Waveform Zoom ${percent}% — view only, the sound does not change.`,
};

export const studioLaneMoveStrings = {
  groupMoveBlocked: 'Group move stopped — a neighbouring clip or the start of the timeline.',
  videoClipKeepsTrack: 'A video clip does not change tracks — the group moves in time only.',
  audioNotOnVideoTrack: 'Audio does not move to the video track',
  noTrackForPart: 'There is no track for part of the group — only the time changes.',
  partBeforeStart:
    'Part of the group would go before the start of the timeline (0) — the track does not change.',
  noRoom: 'No room here',
  shiftHint: 'Shift — lock the time; only the track changes',
  shiftLockedHint: 'Shift — the time is locked; only the track changes',
};

export const studioTrackGroupStrings = {
  foldNeedsGroup: 'To fold a group, select it first — click the group name.',
  groupNeedsTracks: 'To group tracks, select them first — Ctrl+click or Shift+click a track name.',
  trackGone: 'A selected track no longer exists — select again.',
  videoNotGroupable: 'The video track cannot be grouped.',
  mixedLevels:
    'Only tracks at the same level can be grouped together — the selected tracks are in different groups.',
  notAdjacent: 'Only adjacent tracks can be grouped together — the selection skips a track.',
  ungroupNeedsGroup: 'To ungroup, select a group — click the group name.',
  created: ({ name, members }: { name: string; members: string }): string =>
    `Group “${name}” created: ${members}.`,
  quoted: (name: string): string => `“${name}”`,
  ungroupedOne: (names: string): string => `Group ${names} ungrouped.`,
  ungroupedMany: (names: string): string => `Groups ${names} ungrouped.`,
  renameEmpty: (name: string): string => `The name is empty — “${name}” is kept`,
  renamed: (name: string): string => `Group name: “${name}”.`,
  defaultNamePrefix: 'Group',
};

export const studioGridStrings = {
  seconds: (step: string): string => `${step} s`,
  barLabel: '1 bar',
  tripletMenuLabel: 'Triplets (3)',
  narrowest: (label: string): string => `The grid is already at its narrowest — ${label} (1)`,
  widest: (label: string): string => `The grid is already at its widest — ${label} (2)`,
  snapOnSuffix: '(Snap on)',
  snapOffSuffix: '(Snap off)',
  status: ({ label, snap }: { label: string; snap: string }): string => `Grid: ${label} ${snap}`,
  statusMusical: ({
    label,
    step,
    bpm,
    snap,
  }: {
    label: string;
    step: string;
    bpm: string;
    snap: string;
  }): string => `Grid: ${label} · ${step} s at ${bpm} BPM ${snap}`,
  backToSeconds: ({ tempoCleared, label }: { tempoCleared: string; label: string }): string =>
    `${tempoCleared} Grid back to seconds: ${label}.`,
  barsGroup: (bpm: string): string => `Bars · ${bpm} BPM`,
  tripletsGroup: (bpm: string): string => `Triplets · ${bpm} BPM`,
  tripletNeedsTempo: 'Triplets need a tempo — enter a BPM first (3)',
  tripletNotOnBar: '1 bar has no triplets — choose 1/2 or narrower (3)',
  tripletNeedsBarsGrid: 'Triplets work only on the bars grid — choose 1/2 … 1/32 (3)',
  titleLinesVisible: (label: string): string => `Grid ${label} · 1 — narrower, 2 — wider`,
  titleLinesHidden: (label: string): string =>
    `Grid ${label} — lines are hidden at this zoom, so Snap is paused. Zoom in. · 1 — narrower, 2 — wider`,
  menuLabel: 'Grid division',
  snapOnStatus: (label: string): string => `Snap on — grid ${label} (G)`,
  snapOnTitle: 'Snap on — clips land on the grid (G)',
  snapPausedTitle: 'Snap on — paused: grid lines are hidden at this zoom. Zoom in. (G)',
  snapPausedNote: '· Lines are hidden at this zoom, so Snap is paused — zoom in.',
  snapOff: 'Snap off — free movement (G)',
  adaptiveOn: (label: string): string => `Adaptive grid — follows zoom, now ${label} (5)`,
  fixedOn: (label: string): string => `Fixed grid — ${label} at every zoom (5)`,
  adaptiveNarrowest: (label: string): string =>
    `The adaptive grid is already at its narrowest density — now ${label} (1)`,
  adaptiveWidest: (label: string): string =>
    `The adaptive grid is already at its widest density — now ${label} (2)`,
  adaptiveTitleSuffix: ' · Adaptive: follows zoom — 5 for fixed',
  fixedTitleSuffix: ' · Fixed at every zoom — 5 for adaptive',
  menuAdaptiveGroup: 'Adaptive grid',
  menuFixedGroup: 'Fixed grid',
  widthWidest: 'Widest',
  widthWide: 'Wide',
  widthMedium: 'Medium',
  widthNarrow: 'Narrow',
  widthNarrowest: 'Narrowest',
  adaptiveWidthOn: (width: string, label: string): string =>
    `Adaptive grid — ${width}, now ${label}`,
};

interface StudioMarkerTimeText {
  name: string;
  time: string;
}

export const studioMarkerStrings = {
  menuRename: 'Rename (F2)',
  menuPlay: 'Play from here',
  menuDelete: 'Delete (Delete)',
  flagHint:
    'Click: jump here · Double-click: play from here · Drag or ← →: move · F2: rename · Delete: delete · Right-click or Shift+F10: menu',
  atTimeStart: 'The marker is at the start of the timeline.',
  noneAfter: 'No more markers after the playhead',
  noneBefore: 'No more markers before the playhead',
  noneAfterInsertMarker: 'No more markers after the insert marker',
  noneBeforeInsertMarker: 'No more markers before the insert marker',
  notAdded: 'Marker not added',
  addTitle:
    'Add a marker at the time selection start, the insert marker, or the playback position while playing (M)',
  previousTitle: 'Jump to the previous marker (Ctrl+←)',
  nextTitle: 'Jump to the next marker (Ctrl+→)',
  nameFieldLabel: 'Marker name',
  menuLabel: (name: string): string => `Marker “${name}”`,
  existsAtTime: (name: string): string => `A marker already exists at this time: “${name}”`,
  added: ({ name, time }: StudioMarkerTimeText): string => `Marker “${name}” added at ${time}.`,
  renameEmpty: (name: string): string => `The name is empty — “${name}” is kept`,
  renamed: (name: string): string => `Marker name: “${name}”.`,
  deleted: (name: string): string => `Marker “${name}” deleted.`,
  moved: ({ name, time }: StudioMarkerTimeText): string => `Marker “${name}” moved to ${time}.`,
  flagLabel: ({ name, time }: StudioMarkerTimeText): string => `Marker “${name}” — ${time}`,
  flagHeading: ({ name, time }: StudioMarkerTimeText): string => `“${name}” — ${time}`,
};

interface StudioClipEnvelopePointText {
  time: string;
  gain: string;
}

export const studioClipEnvelopeStrings = {
  modeOn: 'Envelope mode: on.',
  modeOff: 'Envelope mode: off.',
  toggleOnTitle: 'Envelope on — double-click a clip to add a point (A)',
  toggleOffTitle: 'Envelope off — edit the clip volume envelope (A)',
  addPointLabel: 'Envelope: add point',
  movePointLabel: 'Envelope: move point',
  deletePointLabel: 'Envelope: delete point',
  editorTitle: 'Envelope — double-click = add point',
  pointTitle: ({ time, gain }: StudioClipEnvelopePointText): string =>
    `Envelope: ${time} · ${gain} — drag · double-click = delete`,
  pointAdded: ({ time, gain }: StudioClipEnvelopePointText): string =>
    `Envelope: point added — ${time} · ${gain}.`,
  pointPreview: ({ time, gain }: StudioClipEnvelopePointText): string =>
    `Envelope: ${time} · ${gain}`,
  pointCommitted: ({ time, gain }: StudioClipEnvelopePointText): string =>
    `Envelope: ${time} · ${gain}.`,
  pointDeleted: (time: string): string => `Envelope: point deleted — ${time}.`,
};

interface StudioWorkspaceRangeText {
  start: string;
  end: string;
  length: string;
}

interface StudioWorkspaceClipText {
  title: string;
  start: string;
  length: string;
  offset: string;
}

type StudioWorkspaceClipDetail = Omit<StudioWorkspaceClipText, 'title'>;

interface StudioExportTimeBounds {
  start: string;
  end: string;
}

export interface StudioTimeTextPart {
  id: string;
  text: string;
  isTime: boolean;
}

export const studioTimeTextParts = {
  rangeReadout: ({ start, end, length }: StudioWorkspaceRangeText): StudioTimeTextPart[] => [
    { id: 'range-prefix', text: 'Time selection: ', isTime: false },
    { id: 'range-start', text: start, isTime: true },
    { id: 'range-to', text: ' — ', isTime: false },
    { id: 'range-end', text: end, isTime: true },
    { id: 'range-length-label', text: ' · length ', isTime: false },
    { id: 'range-length', text: length, isTime: true },
    { id: 'range-suffix', text: ' ·', isTime: false },
  ],
  selectedClipDetail: ({
    start,
    length,
    offset,
  }: StudioWorkspaceClipDetail): StudioTimeTextPart[] => [
    { id: 'clip-start-label', text: ' · start ', isTime: false },
    { id: 'clip-start', text: start, isTime: true },
    { id: 'clip-length-label', text: ' · length ', isTime: false },
    { id: 'clip-length', text: length, isTime: true },
    { id: 'clip-offset-label', text: ' · source offset ', isTime: false },
    { id: 'clip-offset', text: offset, isTime: true },
  ],
  exportProjectScope: ({ start, end }: StudioExportTimeBounds): StudioTimeTextPart[] => [
    { id: 'export-project-prefix', text: 'Entire project · ', isTime: false },
    { id: 'export-project-start', text: start, isTime: true },
    { id: 'export-project-to', text: ' — ', isTime: false },
    { id: 'export-project-end', text: end, isTime: true },
  ],
  exportRangeScope: ({ start, end, seconds }: StudioTimeSpanText): StudioTimeTextPart[] => [
    { id: 'export-range-prefix', text: 'Time selection · ', isTime: false },
    { id: 'export-range-start', text: start, isTime: true },
    { id: 'export-range-to', text: ' — ', isTime: false },
    { id: 'export-range-end', text: end, isTime: true },
    { id: 'export-range-seconds', text: ` (${seconds})`, isTime: false },
  ],
  exportLoopRangeNote: ({ start, end, seconds }: StudioTimeSpanText): StudioTimeTextPart[] => [
    {
      id: 'export-loop-range-prefix',
      text: 'Loop does not change the export — the time selection is exported (',
      isTime: false,
    },
    { id: 'export-loop-range-start', text: start, isTime: true },
    { id: 'export-loop-range-to', text: ' — ', isTime: false },
    { id: 'export-loop-range-end', text: end, isTime: true },
    { id: 'export-loop-range-seconds', text: `, ${seconds}).`, isTime: false },
  ],
  exportLoopProjectNote: ({ start, end }: StudioExportTimeBounds): StudioTimeTextPart[] => [
    {
      id: 'export-loop-project-prefix',
      text: 'Loop does not change the export — the entire project is exported (',
      isTime: false,
    },
    { id: 'export-loop-project-start', text: start, isTime: true },
    { id: 'export-loop-project-to', text: ' — ', isTime: false },
    { id: 'export-loop-project-end', text: end, isTime: true },
    { id: 'export-loop-project-suffix', text: ').', isTime: false },
  ],
};

const joinStudioTimeTextParts = (parts: readonly StudioTimeTextPart[]): string =>
  parts.map((part) => part.text).join('');

const selectedClipDetailText = (detail: StudioWorkspaceClipDetail): string =>
  joinStudioTimeTextParts(studioTimeTextParts.selectedClipDetail(detail));

export const studioWorkspaceStrings = {
  headingSuffix: '· Workspace',
  rangeReadout: (range: StudioWorkspaceRangeText): string =>
    joinStudioTimeTextParts(studioTimeTextParts.rangeReadout(range)),
  rangeDeleteHint: 'Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time',
  clipsSelected: (count: number): string => `${count} clips selected`,
  clipLabel: 'Clip:',
  selectedClipDetail: (detail: StudioWorkspaceClipDetail): string => selectedClipDetailText(detail),
  selectedClipTitle: ({ title, ...detail }: StudioWorkspaceClipText): string =>
    `Clip: ${title}${selectedClipDetailText(detail)}`,
};

interface StudioClipGroupMoveText {
  label: string;
  count: number;
  distance: string;
}

export const studioClipStrings = {
  foldedTitleLine: 'The track is folded — unfold it to make a time selection',
  videoFadeInTitle:
    'Video Fade In — picture only, the sound does not change · drag · double-click = 0',
  videoFadeOutTitle:
    'Video Fade Out — picture only, the sound does not change · drag · double-click = 0',
  keptLastFreeSpot: 'the clip stayed in its last free spot',
  fadePreview: (label: string, seconds: string): string => `${label}: ${seconds} s`,
  fadeCommitted: (label: string, seconds: string): string => `${label}: ${seconds} s.`,
  moveBlocked:
    'Move blocked — a neighbouring clip or the start of the timeline. The clip stayed in its last free spot.',
  trimStartBlocked:
    'Trim stopped: the start of the source, a neighbouring clip or the minimum length (0.05 s).',
  trimEndBlocked:
    'Trim stopped: the end of the source, a neighbouring clip or the minimum length (0.05 s).',
  historyUnchanged: (label: string): string =>
    `${label}: nothing changed — the Undo history is unchanged.`,
  historyMoveClips: (count: number): string => `Move (${count})`,
  historyMoveToTrack: (name: string): string => `Move to track — ${name}`,
  historyMoveClip: 'Move clip',
  trimStartLabel: 'Trim — left edge',
  trimEndLabel: 'Trim — right edge',
  groupMovedRight: ({ label, count, distance }: StudioClipGroupMoveText): string =>
    `${label}: ${count} clips moved ${distance} to the right.`,
  groupMovedLeft: ({ label, count, distance }: StudioClipGroupMoveText): string =>
    `${label}: ${count} clips moved ${distance} to the left.`,
  moveTitle: (title: string): string => `${title} — drag to move`,
  rangeBodyTitle: 'drag = time selection · click = insert marker',
  seconds: (value: string): string => `${value} s`,
};

const STUDIO_VIDEO_IMPORT_LABEL = 'Your own video';

const STUDIO_VIDEO_MIX_LABEL = 'Original video sound';

export const studioLaneStrings = {
  videoMixLabel: STUDIO_VIDEO_MIX_LABEL,
  videoMuteTitle: `Mute — ${STUDIO_VIDEO_MIX_LABEL}`,
  videoSoloTitle: `Solo — ${STUDIO_VIDEO_MIX_LABEL} (Ctrl/Cmd+click = add to solo)`,
  videoImportLabel: STUDIO_VIDEO_IMPORT_LABEL,
  foldTitle: 'Fold / unfold',
  soloLabel: (name: string): string => `Solo — ${name} (Ctrl/Cmd+click = add to solo)`,
  soloTitle: 'Solo (Ctrl/Cmd+click = add to solo)',
  foldLabel: (name: string): string => `Fold or unfold — ${name}`,
  activeTrackLabel: (name: string): string => `${name} — set as the active track`,
  selectedSuffix: ', selected',
  activeBadge: '· active',
  videoImportTitle: 'Your own video',
  panResetLabel: (name: string): string => `Reset Pan to centre — ${name}`,
  videoOriginalSound: 'Original sound',
  noVideo: 'No video',
  videoEmptyHint: `use “${STUDIO_VIDEO_IMPORT_LABEL}” or drop a file here`,
  audioEmptyHint: 'Drag a sound here, or press Enter to add it',
  dropVideoHere: 'Drop the video here',
  videoNotOnAudioTrack: 'Video is not added here — drop it on the video track',
  ghostAudioOnVideoTrack: 'Audio is not added to the video track',
  ghostNotLoaded: 'This sound has not loaded yet',
  audioDecoding: 'Sound is decoding…',
  audioUnreadable: 'Sound could not be read',
  audioNone: 'No sound',
  heightLabel: (name: string): string => `Height — ${name}`,
  foldedValueText: (height: number): string => `folded · ${height} px`,
};

export const studioGroupHeaderStrings = {
  nameTitle: 'F2: Rename · Ctrl+G: Group Tracks · Ctrl+Shift+G: Ungroup Tracks',
  nameLabel: (name: string): string => `${name} — group`,
  foldedOneClip: ', folded, 1 clip',
  foldedClips: (count: number): string => `, folded, ${count} clips`,
  foldLabel: (name: string): string => `Fold or unfold group — ${name}`,
  nameInputLabel: (name: string): string => `Group name — ${name}`,
  muteLabel: (name: string): string => `Mute — ${name} (group)`,
  soloLabel: (name: string): string => `Solo — ${name} (group, Ctrl/Cmd+click = add to solo)`,
  volumeLabel: (name: string): string => `Volume — ${name} (group)`,
};

interface StudioMeterPeakText {
  name: string;
  peak: string;
}

export const studioMeterStrings = {
  trackPeakTitle: ({ name, peak }: StudioMeterPeakText): string => `${name} · Peak ${peak} dBFS`,
  trackPeakOverTitle: ({ name, peak }: StudioMeterPeakText): string =>
    `${name} · Peak ${peak} dBFS — went above 0 dBFS. Click Master Peak to clear`,
  trackOverAnnouncement: (name: string): string => `${name}: the level went above 0 dBFS`,
  masterPeakLabel: (peak: string): string => `Master Peak ${peak} dBFS — click to clear`,
  masterPeakOverLabel: (peak: string): string =>
    `Master Peak ${peak} dBFS — overload (Clip). Click to clear`,
};

interface StudioDetailRangeText {
  start: string;
  end: string;
  track: string;
}

const detailClipCountText = (count: number): string => (count === 1 ? '1 clip' : `${count} clips`);

export const studioDetailStrings = {
  panelTitle: 'Clip details',
  noSelectionHint: 'Select a clip to edit its time selection and Clip Gain.',
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
  rangeApplied: ({ start, end, track }: StudioDetailRangeText): string =>
    `Time selection: ${start} — ${end} · ${track}.`,
  clipGainUnchanged: (value: string): string => `Clip Gain unchanged: ${value}.`,
  clipCount: (count: number): string => detailClipCountText(count),
  clipGainMembers: (count: number, range: string): string =>
    `Clip Gain: ${detailClipCountText(count)} — ${range}.`,
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
  collapsedValueText: (height: number): string => `collapsed · ${height} px`,
  expandLabel: 'Expand details',
  collapseLabel: 'Collapse details',
  expandText: 'Expand',
  collapseText: 'Collapse',
  rangeInvalid:
    'The time selection must stay inside the clip, and its end must be after its start.',
};

export const studioSourceLoadStrings = {
  networkFailed: 'File failed to load (network)',
  httpFailed: (status: number): string => `File failed to load (${status})`,
  decodeFailed: 'File could not be decoded',
  unknownSource: 'Unknown source',
  unknownDemoSource: 'Unknown demo source',
  purchasedNoProductId: 'The purchased collection has no productId',
  purchasedNoStems: 'The purchased collection has no stems',
  purchasedDuplicateStemId: 'A stem id repeats in the purchased collection',
  purchasedCollectionLabel: (productTitle: string): string => `${productTitle} · purchased stems`,
  loadFailedFallback: 'Loading failed',
  rowLoading: 'Loading…',
  rowError: (message: string): string => `Error: ${message}`,
  rowPreviewing: 'Playing',
};

export const studioLibraryPanelStrings = {
  library: 'Library',
  expand: 'Expand library',
  collapse: 'Collapse library',
  searchPlaceholder: 'Search: name, type, collection…',
  searchLabel: 'Search the library',
  clearSearch: 'Clear search',
  dismissNotice: 'Dismiss this notice',
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
  previewWaveLabel:
    'Preview waveform — click = play from here · ← → 1 s · Home/End · Space = play/stop',
  activeTrack: 'Active track:',
  videoTrackNote: ' (audio is not added here)',
  insertMarker: 'insert marker',
  previewPlay: 'Preview',
  previewStop: 'Stop',
  add: 'Add',
};

export const studioVideoDockStrings = {
  dockLabel: 'Video',
  gapPrefix: 'No video ·',
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

export const studioShortcutSheetStrings = {
  title: 'Keyboard shortcuts',
  subline: 'Ctrl means ⌘ on Mac · Alt means ⌥ · Esc closes.',
  searchLabel: 'Search shortcuts',
  searchPlaceholder: 'Search: split, zoom, loop…',
  noMatch: (query: string): string => `Nothing matches “${query}”.`,
  close: 'Close (Esc)',
  footerButton: 'Shortcuts',
  footerButtonLabel: 'Keyboard shortcuts (?)',
};
