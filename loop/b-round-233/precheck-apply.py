import sys, re
root = sys.argv[1]
def edit(path, old, new, count=1):
    p = f"{root}/{path}"
    s = open(p, encoding='utf-8').read()
    assert s.count(old) == count, (path, old[:60], s.count(old))
    s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)

edit('app/types/arrangement.ts',
     "  kind: WorkspaceSourceKind;\n  origin: WorkspaceOrigin;\n}\n",
     "  kind: WorkspaceSourceKind;\n  origin: WorkspaceOrigin;\n  bpm?: number;\n}\n")
edit('app/data/studio-lab-demo.ts', "import {\n  DEMO_SYNTH_SAMPLE_RATE,", "import {\n  DEMO_STEM_BEAT_SECONDS,\n  DEMO_SYNTH_SAMPLE_RATE,")
edit('app/data/studio-lab-demo.ts', "const SYNTHETIC_COLLECTION_LABEL = `Synthetic demo · ${SYNTHETIC_COMPOSITION_TITLE}`;\n",
     "const SYNTHETIC_COLLECTION_LABEL = `Synthetic demo · ${SYNTHETIC_COMPOSITION_TITLE}`;\nconst SYNTHETIC_COMPOSITION_BPM = 60 / DEMO_STEM_BEAT_SECONDS;\n")
edit('app/data/studio-lab-demo.ts', "    kind: 'music',\n    origin: 'demo',\n  },\n  ...Object", "    kind: 'music',\n    origin: 'demo',\n    bpm: SYNTHETIC_COMPOSITION_BPM,\n  },\n  ...Object")
edit('app/data/studio-lab-demo.ts', "      kind: 'stem',\n      origin: 'demo',\n", "      kind: 'stem',\n      origin: 'demo',\n      bpm: SYNTHETIC_COMPOSITION_BPM,\n")
open(f"{root}/app/lib/arrangement/tempo-seed.ts", 'w').write('''import type { ArrangementClip, ArrangementTrack, WorkspaceSource } from '~/types/arrangement';
import { TEMPO_BPM_MAX, TEMPO_BPM_MIN } from './tempo';

export interface AssetTempoSeed {
  bpm: number;
  source: WorkspaceSource;
}

function validAssetBpm(bpm: number | undefined): number | null {
  if (bpm === undefined || !Number.isFinite(bpm)) {
    return null;
  }
  const rounded = Math.round(bpm * 100) / 100;
  return rounded >= TEMPO_BPM_MIN && rounded <= TEMPO_BPM_MAX ? rounded : null;
}

export function findAssetTempoSeed(
  clips: readonly ArrangementClip[],
  tracks: readonly ArrangementTrack[],
  sources: readonly WorkspaceSource[],
): AssetTempoSeed | null {
  const audioTrackIds = new Set(tracks.filter((track) => track.kind === 'audio').map((track) => track.id));
  let best: { clip: ArrangementClip; seed: AssetTempoSeed } | null = null;
  for (const clip of clips) {
    if (!audioTrackIds.has(clip.trackId)) {
      continue;
    }
    const source = sources.find((entry) => entry.id === clip.sourceId);
    if (!source || source.kind === 'sfx') {
      continue;
    }
    const bpm = validAssetBpm(source.bpm);
    if (bpm === null) {
      continue;
    }
    if (!best || clip.start < best.clip.start) {
      best = { clip, seed: { bpm, source } };
    }
  }
  return best?.seed ?? null;
}
''')
edit('app/lib/arrangement/strings.ts',
     "  set: ({ bpm, beatsPerBar }: { bpm: string; beatsPerBar: number }): string =>\n    `Tempo ${bpm} BPM · ${beatsPerBar}/4 — bars ruler updated. Grid only: audio is not stretched.`,\n};",
     "  set: ({ bpm, beatsPerBar }: { bpm: string; beatsPerBar: number }): string =>\n    `Tempo ${bpm} BPM · ${beatsPerBar}/4 — bars ruler updated. Grid only: audio is not stretched.`,\n  seeded: ({ bpm, title }: { bpm: string; title: string }): string =>\n    `Tempo ${bpm} BPM from “${title}” — bars ruler on. Grid only: audio is not stretched.`,\n};")
sw = 'app/components/arrangement/StudioWorkspace.tsx'
edit(sw, "import { markerSnapTimes } from '~/lib/arrangement/markers';\n",
     "import { markerSnapTimes } from '~/lib/arrangement/markers';\nimport { findAssetTempoSeed } from '~/lib/arrangement/tempo-seed';\n")
edit(sw, "  const [tempoBpm, setTempoBpm] = useState<number | null>(null);\n",
     "  const [tempoBpm, setTempoBpm] = useState<number | null>(null);\n  const tempoSeedOpenRef = useRef(true);\n  const gridHandChosenRef = useRef(false);\n  const snapHandChosenRef = useRef(false);\n")
edit(sw, "  const toggleSnap = useCallback(() => {\n    const next = !snapEnabledRef.current;\n",
     "  const toggleSnap = useCallback(() => {\n    snapHandChosenRef.current = true;\n    const next = !snapEnabledRef.current;\n")
edit(sw, "  const changeGridDivision = useCallback((id: string) => {\n    const tempo = tempoBpmRef.current;\n",
     "  const changeGridDivision = useCallback((id: string) => {\n    gridHandChosenRef.current = true;\n    const tempo = tempoBpmRef.current;\n")
edit(sw, "  const changeTempo = useCallback((next: number | null) => {\n    tempoBpmRef.current = next;\n",
     "  const changeTempo = useCallback((next: number | null) => {\n    tempoSeedOpenRef.current = false;\n    tempoBpmRef.current = next;\n")
edit(sw, "  const toggleMetronome = useCallback(() => {\n",
     '''  useEffect(() => {
    if (!tempoSeedOpenRef.current || tempoBpmRef.current !== null) {
      return;
    }
    const seed = findAssetTempoSeed(arrangement.clips, arrangement.tracks, collection.sources);
    if (!seed) {
      return;
    }
    tempoSeedOpenRef.current = false;
    tempoBpmRef.current = seed.bpm;
    setTempoBpm(seed.bpm);
    const parts = [studioTempoStrings.seeded({ bpm: formatTempoBpm(seed.bpm), title: seed.source.title })];
    if (!gridHandChosenRef.current) {
      musicalGridDivisionRef.current = '1/4';
      gridSecondsRef.current = musicalGridDivisionSeconds('1/4', seed.bpm);
      gridDivisionIdRef.current = '1/4';
      setMusicalGridDivision('1/4');
    }
    if (!snapHandChosenRef.current) {
      snapEnabledRef.current = true;
      setSnapEnabled(true);
      parts.push(studioGridStrings.snapOnStatus(gridDivisionLabel(gridDivisionIdRef.current)));
    }
    const current = workspaceRef.current.status;
    workspaceRef.current.setStatus([current, ...parts].join(' '));
  }, [arrangement.clips, arrangement.tracks, collection.sources]);

  const toggleMetronome = useCallback(() => {
''')
print("ok")
