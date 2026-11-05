import sys, pathlib
root = pathlib.Path(sys.argv[1])
p = root/'app/components/arrangement/StudioWorkspace.tsx'
s = p.read_text()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (old[:70], n)
    s = s.replace(old, new)
rep("""> & {
  overviewClips: readonly TrackGroupOverviewClip[];
};

function ArrangementGroupHeaderWithSelectionInner({
  overviewClips,
  ...headerProps
}: ArrangementGroupHeaderWithSelectionProps) {
  const selectionKey = useArrangementSelection((state) =>
    selectedClipIdsKeyAmong(
      state.selectedClipIds,
      overviewClips.map((block) => block.clipId),
    ),
  );""",
"""> & {
  overviewClips: readonly TrackGroupOverviewClip[];
  overviewGroupId: string;
};

function sameTrackGroupOverviewClips(
  a: readonly TrackGroupOverviewClip[],
  b: readonly TrackGroupOverviewClip[],
): boolean {
  return (
    a === b ||
    (a.length === b.length &&
      a.every(
        (clip, index) =>
          clip.clipId === b[index].clipId &&
          clip.trackId === b[index].trackId &&
          clip.start === b[index].start &&
          clip.duration === b[index].duration,
      ))
  );
}

function ArrangementGroupHeaderWithSelectionInner({
  overviewClips: committedOverviewClips,
  overviewGroupId,
  ...headerProps
}: ArrangementGroupHeaderWithSelectionProps) {
  const overviewClips = useArrangementPreview(
    useEqualityStableSelector(
      (state: ArrangementPreviewState) =>
        headerProps.collapsed && state.preview !== null
          ? trackGroupOverviewClips(state.preview, overviewGroupId)
          : committedOverviewClips,
      sameTrackGroupOverviewClips,
    ),
  );
  const selectionKey = useArrangementSelection((state) =>
    selectedClipIdsKeyAmong(
      state.selectedClipIds,
      overviewClips.map((block) => block.clipId),
    ),
  );""")
rep("""                    overviewClips={trackGroupOverviews.get(row.id) ?? NO_TRACK_GROUP_OVERVIEW_CLIPS}
""","""                    overviewClips={trackGroupOverviews.get(row.id) ?? NO_TRACK_GROUP_OVERVIEW_CLIPS}
                    overviewGroupId={row.id}
""")
p.write_text(s)
print('ws ok')
