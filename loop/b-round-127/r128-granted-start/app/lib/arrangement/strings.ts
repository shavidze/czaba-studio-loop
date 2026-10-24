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
  rangeSeconds: (seconds: number): string => `${seconds.toFixed(3)} s`,
  projectScope: (start: string, end: string): string => `Entire project · ${start} — ${end}`,
  rangeScope: (rangeLabel: string): string => `Time selection · ${rangeLabel}`,
  loopRangeNote: ({ start, end, seconds }: StudioTimeSpanText): string =>
    `Loop does not change the export — the time selection is created (${start} — ${end}, ${seconds}).`,
  loopProjectNote: (start: string, end: string): string =>
    `Loop does not change the export — the entire project is created (${start} — ${end}).`,
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
    `range ${start} — ${end} (${seconds})`,
  wavDone: (exportedLength: string, masterSuffix: string): string =>
    `WAV created: ${exportedLength}, 24-bit · 48 kHz · stereo.${masterSuffix}`,
  mp3Done: (exportedLength: string, masterSuffix: string): string =>
    `MP3 created: ${exportedLength}, 48 kHz · stereo.${masterSuffix}`,
  bothDone: (exportedLength: string, masterSuffix: string): string =>
    `WAV and MP3 created: ${exportedLength}, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.${masterSuffix}`,
  exportFailed: (reason: string): string => `Export failed — No file was created. ${reason}`,
  mp3Failed: (reason: string): string => `Creating MP3 failed — No file was created. ${reason}`,
  encoderLoadTimeout: (seconds: number): string =>
    `The MP3 encoder did not load within ${seconds} seconds — No file was created. Check your internet connection and try again, or choose WAV.`,
};
