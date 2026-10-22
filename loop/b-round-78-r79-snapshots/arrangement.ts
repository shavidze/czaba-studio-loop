export type ArrangementTrackKind = 'audio' | 'video';

export interface ArrangementTrack {
  id: string;
  kind: ArrangementTrackKind;
  name: string;
  volume: number;
  mute: boolean;
  solo: boolean;
  pan?: number;
}

export interface ArrangementClip {
  id: string;
  trackId: string;
  sourceId: string;
  start: number;
  sourceOffset: number;
  duration: number;
  gainDb?: number;
}

export interface ArrangementLoop {
  start: number;
  end: number;
  enabled: boolean;
}

export interface ArrangementMaster {
  gainDb: number;
  mute: boolean;
}

export interface ArrangementMarker {
  id: string;
  time: number;
  name: string;
}

export interface Arrangement {
  tracks: ArrangementTrack[];
  clips: ArrangementClip[];
  loop: ArrangementLoop | null;
  master: ArrangementMaster;
  markers?: ArrangementMarker[];
}

export interface TimeRange {
  start: number;
  end: number;
  trackId: string;
  allTracks?: true;
}

export type WorkspaceSourceKind = 'music' | 'stem' | 'sfx';

export type WorkspaceOrigin = 'demo' | 'purchased';

export interface WorkspaceSource {
  id: string;
  title: string;
  shortTitle?: string;
  collectionLabel: string;
  kind: WorkspaceSourceKind;
  origin: WorkspaceOrigin;
}

export interface WorkspaceCollection {
  id: string;
  label: string;
  origin: WorkspaceOrigin;
  notice?: string;
  sources: WorkspaceSource[];
  loadSource: (
    source: WorkspaceSource,
    ctx: BaseAudioContext,
    signal: AbortSignal,
  ) => Promise<AudioBuffer>;
}

export type WorkspaceVideoAudioStatus = 'decoding' | 'ready' | 'none' | 'error';

export interface WorkspaceVideoSource {
  id: string;
  name: string;
  url: string;
  duration: number;
  width: number;
  height: number;
  audio: WorkspaceVideoAudioStatus;
  audioNote: string | null;
}

export interface ScheduledClip {
  clipId: string;
  trackId: string;
  sourceId: string;
  when: number;
  sourceOffset: number;
  duration: number;
}
