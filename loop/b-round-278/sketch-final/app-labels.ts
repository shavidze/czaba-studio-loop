import {
  studioClipStrings,
  studioExportStrings,
  studioGroupHeaderStrings,
  studioLaneStrings,
  studioLibraryPanelStrings,
  studioMasterStrings,
  studioPlaybackStrings,
  studioViewStrings,
} from '../../app/lib/arrangement/strings';
import { workspaceCollectionCopy } from '../../app/lib/arrangement/collection';

const sentinel = '\u0000';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function splitAtSentinel(rendered: string): { prefix: string; suffix: string } {
  const at = rendered.indexOf(sentinel);
  if (at < 0 || rendered.indexOf(sentinel, at + sentinel.length) >= 0) {
    throw new Error(`label template needs exactly one placeholder: ${JSON.stringify(rendered)}`);
  }
  return { prefix: rendered.slice(0, at), suffix: rendered.slice(at + sentinel.length) };
}

export const perfPlayLabel = studioPlaybackStrings.playLabel;
export const perfExportWavLabel = studioExportStrings.formatButtonWav;
export const perfExportDoneLabel = studioExportStrings.closeButton;
export const perfZoomSliderLabel = studioViewStrings.zoomSliderLabel;
export const perfRangeBodyTitle = studioClipStrings.rangeBodyTitle;
export const perfTrimStartTitle = studioClipStrings.trimStartLabel;
export const perfLibraryAddLabel = studioLibraryPanelStrings.add;
export const perfCollectionReadyPattern = new RegExp(
  `^${escapeRegExp(workspaceCollectionCopy('demo').ready)}`,
);
export const perfActiveTrackLabel = (name: string): string =>
  studioLaneStrings.activeTrackLabel(name);

const wavDoneParts = splitAtSentinel(studioExportStrings.wavDone(sentinel, ''));
export const perfWavDonePrefix = wavDoneParts.prefix;
export const perfWavDoneMarker = wavDoneParts.prefix.trimEnd();
export const perfWavDoneName = perfWavDoneMarker.replace(/:$/, '');
export const perfWavDoneTextPattern = new RegExp(`^${escapeRegExp(perfWavDoneMarker)}`);
export const perfWavDoneLengthPattern = new RegExp(
  `${escapeRegExp(wavDoneParts.prefix)}(\\d+):(\\d+\\.\\d+)`,
);

const moveTitleParts = splitAtSentinel(studioClipStrings.moveTitle(sentinel));
export const perfMoveTitlePattern = new RegExp(`${escapeRegExp(moveTitleParts.suffix)}$`);

const groupVolumeParts = splitAtSentinel(studioGroupHeaderStrings.volumeLabel(sentinel));
export const perfGroupVolumePattern = new RegExp(
  `^${escapeRegExp(groupVolumeParts.prefix)}.+${escapeRegExp(groupVolumeParts.suffix)}$`,
);

interface PerfInlineLabel {
  label: string;
  sourceFile: string;
  sourceNeedle: string;
}

export const perfMasterVolumeLabel = studioMasterStrings.volumeLabel;

export const perfInlineLabels = {
  clipGainFader: {
    label: 'Clip Gain — fader',
    sourceFile: 'app/components/arrangement/ArrangementDetailPanel.tsx',
    sourceNeedle: 'aria-label="Clip Gain — fader"',
  },
  trackVolumePrefix: {
    label: 'Volume — ',
    sourceFile: 'app/components/arrangement/ArrangementLane.tsx',
    sourceNeedle: 'aria-label={`Volume — ${mixLabel}`}',
  },
  trackPanPrefix: {
    label: 'Pan — ',
    sourceFile: 'app/components/arrangement/ArrangementLane.tsx',
    sourceNeedle: 'aria-label={`Pan — ${track.name}`}',
  },
  exportButton: {
    label: 'Export',
    sourceFile: 'app/components/arrangement/ArrangementTransport.tsx',
    sourceNeedle: '          Export',
  },
  undoButtonPrefix: {
    label: 'Undo',
    sourceFile: 'app/components/arrangement/ArrangementTransport.tsx',
    sourceNeedle: '<span className="truncate">Undo',
  },
} satisfies Record<string, PerfInlineLabel>;

export const perfTrackVolumeLabel = (name: string): string =>
  `${perfInlineLabels.trackVolumePrefix.label}${name}`;
export const perfTrackPanLabel = (name: string): string =>
  `${perfInlineLabels.trackPanPrefix.label}${name}`;
export const perfUndoButtonPattern = new RegExp(
  `^${escapeRegExp(perfInlineLabels.undoButtonPrefix.label)}`,
);

export const perfFixtureTracks = {
  music: 'Music',
  stems: 'Stems',
  sfx: 'SFX',
};
export const perfMembersSourceTitle = 'Soft impact';
