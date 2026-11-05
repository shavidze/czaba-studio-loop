import sys, pathlib
root = pathlib.Path(sys.argv[1])
p = root/'app/components/arrangement/ArrangementClip.tsx'
s = p.read_text()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (old[:60], n)
    s = s.replace(old, new)
rep("  group: { ids: readonly string[]; bounds: GroupMoveBounds } | null;",
    "  group: { ids: readonly string[]; bounds: GroupMoveBounds; hasVideo: boolean } | null;")
rep("      group: groupIds ? { ids: groupIds, bounds: groupMoveBounds(before, groupIds) } : null,",
    "      group: groupIds\n        ? {\n            ids: groupIds,\n            bounds: groupMoveBounds(before, groupIds),\n            hasVideo: groupHasVideoClip(before, groupIds),\n          }\n        : null,")
old_group = """    if (gesture.group) {
      const { requested, allowed } = groupDeltaOnGrid("""
new_group = """    if (gesture.group) {
      const previewGroup = gesture.group.hasVideo ? previewArrangement : previewGeometry;
      const { requested, allowed } = groupDeltaOnGrid("""
rep(old_group, new_group)
rep("""          gesture.blocked = false;
          previewArrangement(gesture.before);
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));""",
"""          gesture.blocked = false;
          previewGroup(gesture.before);
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));""")
rep("""      const next = moveClips(gesture.before, gesture.group.ids, allowed);
      if (next) {
        previewArrangement(next);
      }""",
"""      const next = moveClips(gesture.before, gesture.group.ids, allowed);
      if (next) {
        previewGroup(next);
      }""")
# helper
rep("function ArrangementClipViewInner({",
"""function groupHasVideoClip(arrangement: Arrangement, ids: readonly string[]): boolean {
  const videoTrackIds = new Set(
    arrangement.tracks.filter((track) => track.kind === 'video').map((track) => track.id),
  );
  return arrangement.clips.some((clip) => ids.includes(clip.id) && videoTrackIds.has(clip.trackId));
}

function ArrangementClipViewInner({""")
p.write_text(s)
print('clip ok')
