# B round 408 -> 409: builds the PERF-11c-iii-e-ii Lane sketch in scratch S (argv[1]); edits ArrangementLane.tsx only.
import sys
S = sys.argv[1]
p = f'{S}/app/components/arrangement/ArrangementLane.tsx'
src = open(p).read()
def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n == count, (old[:80], n)
    src = src.replace(old, new)
rep("  type KeyboardEvent,\n  type MouseEvent,\n  type PointerEvent,\n  useCallback,\n",
    "  type KeyboardEvent,\n  type MouseEvent,\n  memo,\n  type PointerEvent,\n  useCallback,\n")
rep("import {\n  selectLaneDragGhosts,\n  selectLaneMoveSourceKey,\n} from '~/lib/arrangement/clip-lane-drag-store';",
    "import {\n  type ClipLaneGhost,\n  selectLaneDragGhosts,\n  selectLaneMoveSourceKey,\n} from '~/lib/arrangement/clip-lane-drag-store';")
rep("import type { ArrangementTrack } from '~/types/arrangement';",
    "import type {\n  ArrangementClip,\n  ArrangementTrack,\n  WorkspaceVideoAudioStatus,\n} from '~/types/arrangement';")
rep("""function noLaneWindowSubscription(): () => void {""",
"""interface ArrangementLaneSource {
  title: string;
  peaks: Float32Array | undefined;
  videoAudio: WorkspaceVideoAudioStatus | undefined;
}

interface ArrangementLaneViewProps extends ArrangementLaneProps {
  clips: readonly ArrangementClip[];
  pxPerSecond: number;
  laneSources: ReadonlyMap<string, ArrangementLaneSource>;
  sourceDurations: ReadonlyMap<string, number>;
  laneGhosts: readonly ClipLaneGhost[];
  laneGhostTitles: readonly string[];
  hasArrangementClips: boolean;
}

function isSameLaneTrack(a: ArrangementTrack, b: ArrangementTrack): boolean {
  return (
    a === b ||
    (a.id === b.id &&
      a.kind === b.kind &&
      a.name === b.name &&
      a.volume === b.volume &&
      a.mute === b.mute &&
      a.solo === b.solo &&
      a.pan === b.pan &&
      a.groupId === b.groupId)
  );
}

function isSameLaneSources(
  a: ReadonlyMap<string, ArrangementLaneSource>,
  b: ReadonlyMap<string, ArrangementLaneSource>,
): boolean {
  if (a === b) {
    return true;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const [sourceId, source] of a) {
    const other = b.get(sourceId);
    if (
      other === undefined ||
      other.title !== source.title ||
      other.peaks !== source.peaks ||
      other.videoAudio !== source.videoAudio
    ) {
      return false;
    }
  }
  return true;
}

function isSameLaneGhostTitles(a: readonly string[], b: readonly string[]): boolean {
  return a === b || (a.length === b.length && a.every((title, index) => title === b[index]));
}

function areArrangementLaneViewPropsEqual(
  previous: ArrangementLaneViewProps,
  next: ArrangementLaneViewProps,
): boolean {
  const { track, laneSources, laneGhostTitles, ...previousRest } = previous;
  const {
    track: nextTrack,
    laneSources: nextLaneSources,
    laneGhostTitles: nextLaneGhostTitles,
    ...nextRest
  } = next;
  if (
    !isSameLaneTrack(track, nextTrack) ||
    !isSameLaneSources(laneSources, nextLaneSources) ||
    !isSameLaneGhostTitles(laneGhostTitles, nextLaneGhostTitles)
  ) {
    return false;
  }
  const previousEntries: [string, unknown][] = Object.entries(previousRest);
  const nextValues: ReadonlyMap<string, unknown> = new Map(Object.entries(nextRest));
  return (
    previousEntries.length === nextValues.size &&
    previousEntries.every(
      ([key, value]) => nextValues.has(key) && Object.is(value, nextValues.get(key)),
    )
  );
}

function noLaneWindowSubscription(): () => void {""")
rep("""export function ArrangementLane({
  track,""", """function ArrangementLaneViewInner({
  track,""")
rep("""  waveformZoom = 1,
  timelineWindow,
}: ArrangementLaneProps) {
  const { arrangement, collection, sourcePeaks, sourceDurations, pxPerSecond, videoSources } =
    useArrangement();
  const {""", """  waveformZoom = 1,
  timelineWindow,
  clips,
  pxPerSecond,
  laneSources,
  sourceDurations,
  laneGhosts,
  laneGhostTitles,
  hasArrangementClips,
}: ArrangementLaneViewProps) {
  const {""")
rep("  const clips = useArrangementPreviewLaneClips(arrangement, track.id);\n", "")
rep("""  const laneGhosts = useArrangementClipLaneDrag(
    useShallow((state) => selectLaneDragGhosts(state.drag, track.id)),
  );
""", "")
rep("""  const sourceTitle = (sourceId: string) =>
    videoSources.get(sourceId)?.name ??
    collection.sources.find((source) => source.id === sourceId)?.title ??
    sourceId;

""", "")
rep("""        arrangement.clips.length === 0 &&""", """        !hasArrangementClips &&""")
rep("""        {laneGhosts.map((ghost) => {
          const ghostClip = arrangement.clips.find((entry) => entry.id === ghost.clipId);
          return (""", """        {laneGhosts.map((ghost, ghostIndex) => {
          return (""")
rep("""                <span className="min-w-0 truncate">
                  {ghostClip ? sourceTitle(ghostClip.sourceId) : ''}
                </span>""", """                <span className="min-w-0 truncate">{laneGhostTitles[ghostIndex] ?? ''}</span>""")
rep("""          const videoSource = isVideo ? videoSources.get(clip.sourceId) : undefined;
          return (
            <ArrangementClipView
              key={clip.id}
              clip={clip}
              title={sourceTitle(clip.sourceId)}
              peaks={sourcePeaks.get(clip.sourceId)}
              isVideo={isVideo}
              audioNote={
                videoSource && videoSource.audio !== 'ready'
                  ? videoSource.audio === 'decoding'
                    ? studioLaneStrings.audioDecoding
                    : videoSource.audio === 'error'
                      ? studioLaneStrings.audioUnreadable
                      : studioLaneStrings.audioNone
                  : null
              }""", """          const laneSource = laneSources.get(clip.sourceId);
          const videoAudio = isVideo ? laneSource?.videoAudio : undefined;
          return (
            <ArrangementClipView
              key={clip.id}
              clip={clip}
              title={laneSource?.title ?? clip.sourceId}
              peaks={laneSource?.peaks}
              isVideo={isVideo}
              audioNote={
                videoAudio !== undefined && videoAudio !== 'ready'
                  ? videoAudio === 'decoding'
                    ? studioLaneStrings.audioDecoding
                    : videoAudio === 'error'
                      ? studioLaneStrings.audioUnreadable
                      : studioLaneStrings.audioNone
                  : null
              }""")
assert src.endswith("""        data-testid="arrangement-track-height"
      />
    </div>
  );
}
""")
src += """
const ArrangementLaneView = memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual);

export function ArrangementLane(props: ArrangementLaneProps) {
  const { arrangement, collection, sourcePeaks, sourceDurations, pxPerSecond, videoSources } =
    useArrangement();
  const trackId = props.track.id;
  const clips = useArrangementPreviewLaneClips(arrangement, trackId);
  const laneGhosts = useArrangementClipLaneDrag(
    useShallow((state) => selectLaneDragGhosts(state.drag, trackId)),
  );
  const sourceTitle = (sourceId: string) =>
    videoSources.get(sourceId)?.name ??
    collection.sources.find((source) => source.id === sourceId)?.title ??
    sourceId;
  const laneSources = new Map<string, ArrangementLaneSource>();
  for (const clip of clips) {
    if (!laneSources.has(clip.sourceId)) {
      laneSources.set(clip.sourceId, {
        title: sourceTitle(clip.sourceId),
        peaks: sourcePeaks.get(clip.sourceId),
        videoAudio: videoSources.get(clip.sourceId)?.audio,
      });
    }
  }
  const laneGhostTitles = laneGhosts.map((ghost) => {
    const ghostClip = arrangement.clips.find((entry) => entry.id === ghost.clipId);
    return ghostClip ? sourceTitle(ghostClip.sourceId) : '';
  });
  return (
    <ArrangementLaneView
      {...props}
      clips={clips}
      pxPerSecond={pxPerSecond}
      laneSources={laneSources}
      sourceDurations={sourceDurations}
      laneGhosts={laneGhosts}
      laneGhostTitles={laneGhostTitles}
      hasArrangementClips={arrangement.clips.length > 0}
    />
  );
}
"""
open(p, 'w').write(src)
print('sketch written')
