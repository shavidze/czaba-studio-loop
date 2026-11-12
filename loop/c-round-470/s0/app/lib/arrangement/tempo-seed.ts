import type {
  ArrangementClip,
  ArrangementTrack,
  ArrangementTrackKind,
  WorkspaceSource,
} from '~/types/arrangement';
import { TEMPO_BPM_MAX, TEMPO_BPM_MIN } from './tempo';

export interface AssetTempoSeed {
  bpm: number;
  source: WorkspaceSource;
}

function catalogueTempoBpm(source: WorkspaceSource): number | null {
  if (source.kind !== 'music' && source.kind !== 'stem') {
    return null;
  }
  const raw = source.bpm;
  if (raw === undefined || !Number.isFinite(raw)) {
    return null;
  }
  const bpm = Math.round(raw * 100) / 100;
  return bpm >= TEMPO_BPM_MIN && bpm <= TEMPO_BPM_MAX ? bpm : null;
}

export function hasAssetTempoSource(sources: readonly WorkspaceSource[]): boolean {
  return sources.some((source) => catalogueTempoBpm(source) !== null);
}

export function findAssetTempoSeed(
  clips: readonly ArrangementClip[],
  tracks: readonly ArrangementTrack[],
  sources: readonly WorkspaceSource[],
): AssetTempoSeed | null {
  const trackKinds = new Map<string, ArrangementTrackKind>(
    tracks.map((track) => [track.id, track.kind]),
  );
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  let best: { start: number; seed: AssetTempoSeed } | null = null;
  for (const clip of clips) {
    if (trackKinds.get(clip.trackId) !== 'audio') {
      continue;
    }
    const source = sourcesById.get(clip.sourceId);
    if (!source) {
      continue;
    }
    const bpm = catalogueTempoBpm(source);
    if (bpm === null) {
      continue;
    }
    if (best === null || clip.start < best.start) {
      best = { start: clip.start, seed: { bpm, source } };
    }
  }
  return best?.seed ?? null;
}
