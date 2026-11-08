import sys
p = sys.argv[1] + '/app/components/arrangement/ArrangementVideoDock.tsx'
s = open(p).read()
def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:80], s.count(old))
    s = s.replace(old, new)
rep("""  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,""", """  memo,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,""")
rep("""interface VideoLanePreviewReader {
  readVideoLaneArrangement: () => Arrangement;
  subscribeVideoLanePreview: (onChange: () => void) => () => void;
}""", """interface VideoLanePreviewReader {
  readVideoLaneArrangement: () => Arrangement;
  subscribeVideoLanePreview: (onChange: () => void) => () => void;
  publishCommittedVideoClips: (clips: readonly ArrangementClip[]) => void;
}""")
rep("""function useVideoLanePreviewReader(
  arrangement: Arrangement,
  getArrangement: () => Arrangement,
): VideoLanePreviewReader {
  const previewStore = useArrangementPreviewStore();
  return useMemo(() => {
    const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id ?? '';
    let cachedBase""", """function useVideoLanePreviewReader(
  videoTrackId: string,
  getArrangement: () => Arrangement,
): VideoLanePreviewReader {
  const previewStore = useArrangementPreviewStore();
  return useMemo(() => {
    const commitListeners = new Set<() => void>();
    let publishedClips: readonly ArrangementClip[] | null = null;
    let cachedBase""")
rep("""    return {
      readVideoLaneArrangement,
      subscribeVideoLanePreview: (onChange) => previewStore.subscribe(onChange),
    };
  }, [arrangement, getArrangement, previewStore]);
}
""", """    return {
      readVideoLaneArrangement,
      subscribeVideoLanePreview: (onChange) => {
        const listener = () => onChange();
        commitListeners.add(listener);
        const stopPreview = previewStore.subscribe(onChange);
        return () => {
          commitListeners.delete(listener);
          stopPreview();
        };
      },
      publishCommittedVideoClips: (clips) => {
        if (publishedClips === null || publishedClips === clips) {
          publishedClips = clips;
          return;
        }
        publishedClips = clips;
        for (const listener of [...commitListeners]) {
          listener();
        }
      },
    };
  }, [videoTrackId, getArrangement, previewStore]);
}

function useCommittedVideoLaneClips(
  arrangement: Arrangement,
  videoTrackId: string,
): readonly ArrangementClip[] {
  const clipsRef = useRef<readonly ArrangementClip[]>([]);
  const clips = arrangement.clips.filter((clip) => clip.trackId === videoTrackId);
  if (!sameClipList(clipsRef.current, clips)) {
    clipsRef.current = clips;
  }
  return clipsRef.current;
}
""")
rep("""function ArrangementVideoGapCaption(""", """const ArrangementVideoCaptionView = memo(ArrangementVideoCaption);

function ArrangementVideoGapCaption(""")
rep("""  const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id;
  const hasVideoClips = arrangement.clips.some((clip) => clip.trackId === videoTrackId);
  const videoLane = useVideoLanePreviewReader(arrangement, getArrangement);
""", """  const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id ?? '';
  const videoClips = useCommittedVideoLaneClips(arrangement, videoTrackId);
  const hasVideoClips = videoClips.length > 0;
  const videoLane = useVideoLanePreviewReader(videoTrackId, getArrangement);

  useIsomorphicLayoutEffect(() => {
    videoLane.publishCommittedVideoClips(videoClips);
  }, [videoLane, videoClips]);
""")
# split float block + JSX into inner
a = s.index("  const [floatRect, setFloatRect] = useState<FloatingVideoRect | null>(videoFloatAnchor);")
b = s.index("  return (\n    <section\n      ref={rootRef}")
float_block = s[a:b]
jsx_start = s.index("      {isVideoFloating ? (\n        <div\n          className=\"flex aspect-video")
jsx_end = s.index("    </section>\n  );\n}", jsx_start)
jsx = s[jsx_start:jsx_end]
shell_tail = s[b:jsx_start] + """      <ArrangementVideoDockView
        videoLane={videoLane}
        hasVideoClips={hasVideoClips}
        isVideoExpanded={isVideoExpanded}
        videoFloatAnchor={videoFloatAnchor}
        onVideoExpandedChange={onVideoExpandedChange}
        claimPointerGesture={claimPointerGesture}
        firstVideoRef={firstVideoRef}
        secondVideoRef={secondVideoRef}
      />
""" + s[jsx_end:]
shell_tail = shell_tail.replace("<ArrangementVideoCaption videoLane={videoLane} videoSources={videoSources} />", "<ArrangementVideoCaptionView videoLane={videoLane} videoSources={videoSources} />")
assert "ArrangementVideoCaptionView videoLane" in shell_tail
# dedent jsx by 2 (was inside section at 6 spaces; fragment child at 6 too: keep)
inner = """interface ArrangementVideoDockViewProps {
  videoLane: VideoLanePreviewReader;
  hasVideoClips: boolean;
  isVideoExpanded: boolean;
  videoFloatAnchor: FloatingVideoRect | null;
  onVideoExpandedChange: (expanded: boolean) => void;
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
  firstVideoRef: RefObject<HTMLVideoElement>;
  secondVideoRef: RefObject<HTMLVideoElement>;
}

function ArrangementVideoDockViewInner({
  videoLane,
  hasVideoClips,
  isVideoExpanded,
  videoFloatAnchor,
  onVideoExpandedChange,
  claimPointerGesture,
  firstVideoRef,
  secondVideoRef,
}: ArrangementVideoDockViewProps) {
""" + float_block + """  return (
    <>
""" + jsx + """    </>
  );
}

const ArrangementVideoDockView = memo(ArrangementVideoDockViewInner);

"""
head = s[:a]
# insert inner before `interface ArrangementVideoDockProps`
k = head.index("interface ArrangementVideoDockProps {")
s = head[:k] + inner + head[k:] + shell_tail
open(p, 'w').write(s)
print('ok')
