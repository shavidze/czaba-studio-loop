# B round 344 sketch: c5-ii source. Usage: python3 -I apply-source.py <store-root>
import pathlib, sys
root = pathlib.Path(sys.argv[1])


def sub(path, old, new, count=1):
    p = root / path
    text = p.read_text()
    assert text.count(old) == count, (path, old[:60], text.count(old))
    p.write_text(text.replace(old, new))


clip = 'app/components/arrangement/ArrangementClip.tsx'
sub(clip, '  group: { ids: readonly string[]; bounds: GroupMoveBounds; hasVideo: boolean } | null;\n',
    '  group: { ids: readonly string[]; bounds: GroupMoveBounds } | null;\n')
sub(clip, '''  const previewGeometry = isVideo
    ? previewArrangement
    : (previewClipGeometry ?? previewArrangement);
''', '''  const previewGeometry = previewClipGeometry ?? previewArrangement;
''')
sub(clip, '''      group: groupIds
        ? {
            ids: groupIds,
            bounds: groupMoveBounds(before, groupIds),
            hasVideo: groupHasVideoClip(before, groupIds),
          }
        : null,
''', '''      group: groupIds ? { ids: groupIds, bounds: groupMoveBounds(before, groupIds) } : null,
''')
sub(clip, '      if (previewStatus && !isVideo) {\n', '      if (previewStatus) {\n')
sub(clip, '      const previewGroup = gesture.group.hasVideo ? previewArrangement : previewGeometry;\n', '')
sub(clip, '          previewGroup(gesture.before);\n', '          previewGeometry(gesture.before);\n')
sub(clip, '        previewGroup(next);\n', '        previewGeometry(next);\n')
p = root / clip
text = p.read_text()
start = text.index('function groupHasVideoClip(')
end = text.index('\n}\n', start) + 3
assert text[end] == '\n', repr(text[end:end + 20])
text = text[:start] + text[end + 1:]
p.write_text(text)
assert 'groupHasVideoClip' not in text and 'hasVideo' not in text and 'previewGroup' not in text

dock = 'app/components/arrangement/ArrangementVideoDock.tsx'
sub(dock, '''  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
''', '''  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
  useArrangementPreviewLaneClips,
} from '~/contexts/ArrangementContext';
''')
sub(dock, '''  useEffect,
  useRef,
''', '''  useEffect,
  useMemo,
  useRef,
''')
sub(dock, '''function useVideoSourceIdAtPlayhead(arrangement: Arrangement): string | null {
''', '''function useVideoLaneArrangement(arrangement: Arrangement): Arrangement {
  const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id ?? '';
  const videoLaneClips = useArrangementPreviewLaneClips(arrangement, videoTrackId);
  return useMemo(
    () => ({ ...arrangement, clips: videoLaneClips }),
    [arrangement, videoLaneClips],
  );
}

function useVideoSourceIdAtPlayhead(arrangement: Arrangement): string | null {
''')
sub(dock, '''  const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id;
  const hasVideoClips = arrangement.clips.some((clip) => clip.trackId === videoTrackId);
''', '''  const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id;
  const hasVideoClips = arrangement.clips.some((clip) => clip.trackId === videoTrackId);
  const videoLaneArrangement = useVideoLaneArrangement(arrangement);
''')
sub(dock, '      const target = resolveVideoTarget(arrangement, positionStore.getPosition());\n',
    '      const target = resolveVideoTarget(videoLaneArrangement, positionStore.getPosition());\n')
sub(dock, '  }, [arrangement, isPlaying, positionStore, videoSources]);\n',
    '  }, [videoLaneArrangement, isPlaying, positionStore, videoSources]);\n')
sub(dock, '          <ArrangementVideoCaption arrangement={arrangement} videoSources={videoSources} />\n',
    '          <ArrangementVideoCaption\n            arrangement={videoLaneArrangement}\n            videoSources={videoSources}\n          />\n')
sub(dock, '        <ArrangementVideoFadeOverlay arrangement={arrangement} />\n',
    '        <ArrangementVideoFadeOverlay arrangement={videoLaneArrangement} />\n')
sub(dock, '        {hasVideoClips ? <ArrangementVideoGapCaption arrangement={arrangement} /> : null}\n',
    '        {hasVideoClips ? <ArrangementVideoGapCaption arrangement={videoLaneArrangement} /> : null}\n')
print('ok')
