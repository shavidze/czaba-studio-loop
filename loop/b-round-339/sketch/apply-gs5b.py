import sys, pathlib
p = pathlib.Path(sys.argv[1])/'app/lib/arrangement/__tests__/grid-snap-ui.test.tsx'
s = p.read_text()
old = """    expect(view.getByTestId('arrangement-status').textContent).toBe(GROUP_BLOCKED_STATUS);
    expect(clipOf(api, 's1').start).toBe(5.3);
    expect(clipOf(api, 'm1').start).toBe(8);
    fireEvent.pointerUp(parts.root, { pointerId: 7, clientX: 204, clientY: SFX_LANE_Y });"""
new = """    expect(view.getByTestId('arrangement-status').textContent).toBe(GROUP_BLOCKED_STATUS);
    expect(shownClipOf(api, 's1').start).toBe(5.3);
    expect(shownClipOf(api, 'm1').start).toBe(8);
    expect(clipOf(api, 's1').start).toBe(4.3);
    fireEvent.pointerUp(parts.root, { pointerId: 7, clientX: 204, clientY: SFX_LANE_Y });"""
assert s.count(old) == 1
s = s.replace(old, new)
old = "function clipOf(api: GridApiRef, clipId: string): ArrangementClip {"
new = """function shownClipOf(api: GridApiRef, clipId: string): ArrangementClip {
  const clip = live(api)
    .getArrangement()
    .clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function clipOf(api: GridApiRef, clipId: string): ArrangementClip {"""
assert s.count(old) == 1
s = s.replace(old, new)
p.write_text(s)
print('gs5b ok')
