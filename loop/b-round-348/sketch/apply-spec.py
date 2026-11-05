"""B round 348 -> 349 sketch: video trim-start and fade-in drag rows (record) in the interactions perf spec.
Usage: python3 -I apply-spec.py <store-tree>. Refuses the live store path. Exact-text replacements; each must match once."""
import sys, pathlib
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store' and '--allow-store' not in sys.argv:
    sys.exit('refusing the live store path (pass --allow-store as A)')
p = root / 'perf' / 'studio-lab-interactions.perf.spec.ts'
s = p.read_text()
R = []
R.append(("""type DragName = 'range' | 'fade' | 'trim' | 'move';
type PlaybackState = 'stopped' | 'playing';
""", """type DragName = 'range' | 'fade' | 'trim' | 'move';
type PlaybackState = 'stopped' | 'playing';
type ClipKind = 'audio' | 'video';
type VideoDrag = 'move' | 'trim' | 'fade';
"""))
R.append(("""  '1x only, measured last: import public/videos/hero/1.mp4 through the video lane input (1 video clip at 0, Undo "Add video"), "=" until its name bar is at least 480 px wide (at most 16 keys), move drag on the video clip name bar stopped, then Space and the same drag after Home (seek to 0), Space; reset after each with Ctrl+Z; teardown Ctrl+Z (0 video clips, Undo back at its start entry) (interact.drag.video.*, interact.harness.drag-video-live)',""",
"""  '1x only, measured last: import public/videos/hero/1.mp4 through the video lane input (1 video clip at 0, Undo "Add video"), "=" until its name bar is at least 480 px wide (at most 16 keys); stopped: move drag on the video clip name bar, trim-start drag, fade-in drag; then Space and the same three drags, each after Home (seek to 0), Space; reset after each with Ctrl+Z; teardown Ctrl+Z (0 video clips, Undo back at its start entry) (interact.drag.video.*, interact.drag.video-trim.*, interact.drag.video-fade.*, interact.harness.drag-video-live, interact.harness.drag-video-trim-live, interact.harness.drag-video-fade-live)',"""))
R.append(("""function dragTarget(clip: Locator, drag: DragName): Locator {
  switch (drag) {
    case 'range':
      return clip.getByTitle(perfRangeBodyTitle, { exact: true });
    case 'fade':
      return clip.getByTestId('arrangement-clip-fade-in-handle');""",
"""function dragTarget(clip: Locator, drag: DragName, kind: ClipKind = 'audio'): Locator {
  switch (drag) {
    case 'range':
      return clip.getByTitle(perfRangeBodyTitle, { exact: true });
    case 'fade':
      return clip.getByTestId(
        kind === 'video' ? 'arrangement-video-fade-in-handle' : 'arrangement-clip-fade-in-handle',
      );"""))
R.append(("""  liveId: string;
  rows: 'all' | 'all-but-ratio' | 'thirty';
}
""", """  liveId: string;
  rows: 'all' | 'all-but-ratio' | 'thirty';
  kind?: ClipKind;
}
"""))
R.append(("""  const target = dragTarget(clip, drag);
  const grab = await visibleGrabPoint(target, grabOptions(drag));""",
"""  const target = dragTarget(clip, drag, measure.kind ?? 'audio');
  const grab = await visibleGrabPoint(target, grabOptions(drag));"""))
OLD_BLOCK = s[s.index("      if (video !== null) {\n        step = 'drag video stopped';"):s.index("  } catch (error) {\n    const message = error instanceof Error")]
NEW_BLOCK = """      if (video !== null) {
        for (const drag of videoDrags) {
          step = `drag ${videoDragBaseId(drag)} stopped`;
          await measureDrag(page, videoDragMeasure(drag, 'stopped', video.clip), result);
        }
        step = 'play for the video drags';
        await setPlayback(page, true);
        await waitForPlaybackSettled(page, result.problems, 'play for the video drags');
        for (const drag of videoDrags) {
          step = `drag ${videoDragBaseId(drag)} playing`;
          await measureDrag(page, videoDragMeasure(drag, 'playing', video.clip), result);
        }
        for (const drag of videoDrags) {
          setLive(result, videoDragLiveId(drag), true, { zoomKeys: video.zoomKeys });
        }
        step = 'stop after the video drags';
        await setPlayback(page, false);
        step = 'video teardown';
        await teardownVideoClip(page, video, result);
      } else {
        for (const drag of videoDrags) {
          setLive(result, videoDragLiveId(drag), false, { setup: 'failed' });
        }
      }
    }
"""
assert OLD_BLOCK.rstrip().endswith('}'), OLD_BLOCK[-200:]
R.append((OLD_BLOCK, NEW_BLOCK))
R.append(("""async function teardownVideoClip(""",
"""const videoDrags: VideoDrag[] = ['move', 'trim', 'fade'];

const videoDragBaseId = (drag: VideoDrag): string =>
  drag === 'move' ? 'interact.drag.video' : `interact.drag.video-${drag}`;

const videoDragLiveId = (drag: VideoDrag): string =>
  drag === 'move' ? 'interact.harness.drag-video-live' : `interact.harness.drag-video-${drag}-live`;

const videoDragMeasure = (drag: VideoDrag, state: PlaybackState, clip: Locator): DragMeasure => ({
  drag,
  state,
  clip,
  baseId: `${videoDragBaseId(drag)}.${state}`,
  liveId: videoDragLiveId(drag),
  rows: 'all-but-ratio',
  kind: 'video',
});

async function teardownVideoClip("""))
for old, new in R:
    n = s.count(old)
    if n != 1:
        sys.exit(f'expected 1 match, got {n}: {old[:80]!r}')
    s = s.replace(old, new)
p.write_text(s)
print('spec patched', p)
