import sys
p=sys.argv[1]+'/app/lib/arrangement/__tests__/self-disabling-focus.test.tsx'
s=open(p).read()
anchor="  it('FL4: Redo keeps focus while redo entries remain and hands it to Undo on the last step', async () => {"
assert s.count(anchor)==1
row='''  it('FL11: an Undo click whose commit leaves the transport labels unchanged does not leave a handoff armed for a later undo (TL-R376-M1)', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const { api, undoButton } = await mountTransportHarness();
    act(() => {
      live(api).setClipGain('music-1', 3);
    });
    makeTwoGainEdits(api);
    undoButton().focus();
    fireEvent.click(undoButton());
    expect(document.activeElement).toBe(undoButton());
    fireEvent.click(undoButton());
    expect(live(api).undoLabel).toBe('Clip Gain');
    expect(live(api).redoLabel).toBe('Clip Gain');
    expect(document.activeElement).toBe(undoButton());
    act(() => {
      for (const frame of frames.splice(0)) {
        frame(0);
      }
    });
    act(() => {
      live(api).undo();
    });
    expect(live(api).undoLabel).toBe(null);
    expect(undoButton().getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(undoButton());
  });

'''
s=s.replace(anchor,row+anchor)
open(p,'w').write(s); print('ok')
