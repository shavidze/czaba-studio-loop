
  it('PROBE-UNDO: Play, then Undo before the decode settles (A STOP evidence, temporary)', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).addSourceToActiveTrack('big'));
    act(() => live(api).togglePlayback());
    act(() => live(api).undo());
    const afterUndo = live(api).status;
    await settleNext(pending, bigBuffer());
    console.info(
      `PROBE-UNDO record: afterUndo=${JSON.stringify(afterUndo)} afterSettle=${JSON.stringify(live(api).status)} cached=${observedCache().has('big')}`,
    );
  });

  it('PROBE-STOP-PREVIEW: preview, Stop preview before the decode settles (A STOP evidence, temporary)', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    act(() => live(api).stopLibraryPreview());
    const afterStop = live(api).status;
    await settleNext(pending, bigBuffer());
    console.info(
      `PROBE-STOP-PREVIEW record: afterStop=${JSON.stringify(afterStop)} afterSettle=${JSON.stringify(live(api).status)} cached=${observedCache().has('big')}`,
    );
  });

  it('PROBE-SUPERSEDED: preview big, preview keep, settle (A STOP evidence, temporary)', async () => {
    const { api, pending } = await mountEviction();
    act(() => live(api).startLibraryPreview('big', 0));
    act(() => live(api).startLibraryPreview('keep', 0));
    await settleNext(pending, bigBuffer());
    console.info(
      `PROBE-SUPERSEDED record: afterSettle=${JSON.stringify(live(api).status)} preview=${live(api).libraryPreviewSourceId} cached=${observedCache().has('big')}`,
    );
  });
});
