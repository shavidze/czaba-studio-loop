import sys, pathlib
root = pathlib.Path(sys.argv[1])
which = sys.argv[2] if len(sys.argv) > 2 else 'all'
def edit(rel, pairs):
    p = root/rel; s = p.read_text()
    for old, new in pairs:
        assert s.count(old) == 1, (rel, old[:70], s.count(old))
        s = s.replace(old, new)
    p.write_text(s)
if which in ('all', 'tests'):
    edit('app/lib/arrangement/__tests__/grid-snap-ui.test.tsx', [(
"""    pressG();
    const parts = clipParts('s1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 7,""",
"""    pressG();
    const parts = clipParts('s1');
    const m1Start = clipOf(api, 'm1').start;
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 7,"""), (
"""    expect(clipOf(api, 's1').start).toBe(4.3);
    fireEvent.pointerUp(parts.root, { pointerId: 7, clientX: 204, clientY: SFX_LANE_Y });""",
"""    expect(clipOf(api, 's1').start).toBe(4.3);
    expect(clipOf(api, 'm1').start).toBe(m1Start);
    expect(parts.root.dataset.clipStart).toBe('5.300');
    fireEvent.pointerUp(parts.root, { pointerId: 7, clientX: 204, clientY: SFX_LANE_Y });""")])
    p = root/'app/lib/arrangement/__tests__/drag-preview-render.test.tsx'; s = p.read_text()
    assert s.endswith('});\n'), 'tail'
    s = s[: -len('});\n')] + """
  it('DP56 a window blur mid group move puts both clips back with no history entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    const first = clipParts('c1');
    const second = clipParts('c2');
    act(() => live(api).selectClips(['c1', 'c2']));
    const before = live(api).arrangement;
    pointerDownAt(first.header, 1, 0);
    pointerMoveTo(first.root, 1, 40);
    pointerMoveTo(first.root, 1, 80);
    expect(second.root.dataset.clipStart).toBe('3.000');
    expect(previewOf(api)).not.toBeNull();
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(first.root.dataset.clipStart).toBe('2.000');
    expect(second.root.dataset.clipStart).toBe('1.000');
    expect(live(api).arrangement).toBe(before);
    expect(live(api).getArrangement()).toBe(before);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    expect(previewOf(api)).toBeNull();
  });
});
"""
    p.write_text(s)
if which in ('all', 'source'):
    edit('app/components/arrangement/ArrangementClip.tsx', [(
"""  return arrangement.clips.some((clip) => ids.includes(clip.id) && videoTrackIds.has(clip.trackId));""",
"""  const groupIds = new Set(ids);
  return arrangement.clips.some((clip) => groupIds.has(clip.id) && videoTrackIds.has(clip.trackId));""")])
print('tl fixes', which)
