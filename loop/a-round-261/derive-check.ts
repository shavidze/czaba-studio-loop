import * as L from '/home/runner/czaba-project/store/perf/lib/app-labels.ts';
const old = {
  wavText: /^WAV created:/,
  wavLen: /WAV created: (\d+):(\d+\.\d+)/,
  move: / — drag to move$/,
  group: /^Volume — .+ \(group\)$/,
  undo: /^Undo/,
};
const out: Record<string, unknown> = {
  wavTextSrcEq: L.perfWavDoneTextPattern.source === old.wavText.source,
  wavLenSrcEq: L.perfWavDoneLengthPattern.source === old.wavLen.source,
  moveSrcEq: L.perfMoveTitlePattern.source === old.move.source,
  groupSrcEq: L.perfGroupVolumePattern.source === old.group.source,
  undoSrcEq: L.perfUndoButtonPattern.source === old.undo.source,
  sources: [L.perfWavDoneTextPattern.source, L.perfWavDoneLengthPattern.source, L.perfMoveTitlePattern.source, L.perfGroupVolumePattern.source, L.perfUndoButtonPattern.source],
  groupMatchesGroup1: L.perfGroupVolumePattern.test('Volume — Group 1 (group)'),
  groupRejectsTrack: !L.perfGroupVolumePattern.test('Volume — Music'),
  values: [L.perfPlayLabel, L.perfExportWavLabel, L.perfExportDoneLabel, L.perfZoomSliderLabel, L.perfRangeBodyTitle, L.perfTrimStartTitle, L.perfLibraryAddLabel, L.perfActiveTrackLabel('Stems'), L.perfActiveTrackLabel('SFX'), L.perfTrackVolumeLabel('Music'), L.perfTrackPanLabel('Music'), L.perfWavDonePrefix, L.perfWavDoneMarker, L.perfWavDoneName, L.perfMembersSourceTitle],
  allowlistCount: Object.keys(L.perfInlineLabels).length,
};
console.log(JSON.stringify(out, null, 1));
