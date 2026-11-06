# B round 373 -> 374 sketch: context-hygiene rows L8e-L8m for B-R370-HOOK-ERROR-NAMES. Run from the tree root.
p = 'app/lib/arrangement/__tests__/context-hygiene.test.tsx'
s = open(p).read()
old_imp = "  useArrangementIsPlaying,\n  useArrangementIsPlayingReader,\n  useArrangementPositionStore,\n"
assert s.count(old_imp) == 1
new_imp = ("  useArrangementActiveTrackId,\n  useArrangementClipLaneDrag,\n  useArrangementIsPlaying,\n  useArrangementIsPlayingReader,\n"
           "  useArrangementPosition,\n  useArrangementPositionStore,\n  useArrangementPositionWriter,\n  useArrangementPreview,\n"
           "  useArrangementRange,\n  useArrangementRangeStore,\n  useArrangementSelection,\n  useMasterMeterWriter,\n  useTrackMeterWriter,\n")
s = s.replace(old_imp, new_imp)
anchor = "function thrownOutsideProvider(child: ReactNode): string | null {"
assert s.count(anchor) == 1
probes = '''function HookOutsideProvider({ use }: { use: () => void }) {
  use();
  return null;
}

const WRAPPER_HOOKS_OUTSIDE_PROVIDER: ReadonlyArray<readonly [string, () => void]> = [
  ['useArrangementRange', () => useArrangementRange((state) => state.range)],
  ['useArrangementClipLaneDrag', () => useArrangementClipLaneDrag((state) => state)],
  ['useArrangementSelection', () => useArrangementSelection((state) => state.activeTrackId)],
  ['useArrangementPreview', () => useArrangementPreview((state) => state.preview)],
  ['useArrangementActiveTrackId', () => useArrangementActiveTrackId()],
  ['useArrangementPosition', () => useArrangementPosition()],
  ['useArrangementPositionWriter', () => useArrangementPositionWriter(() => undefined)],
  ['useMasterMeterWriter', () => useMasterMeterWriter(() => undefined)],
  ['useTrackMeterWriter', () => useTrackMeterWriter('music', () => undefined)],
];

'''
s = s.replace(anchor, probes + anchor)
row_anchor = "    it('L8d: useArrangementIsPlayingReader outside a provider throws its own name (A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT)', () => {"
assert s.count(row_anchor) == 1
i = s.index(row_anchor)
j = s.index("    });\n", i) + len("    });\n")
rows = '''
    it.each(WRAPPER_HOOKS_OUTSIDE_PROVIDER)(
      'L8e: %s outside a provider throws its own name (B-R370-HOOK-ERROR-NAMES)',
      (name, use) => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(thrownOutsideProvider(<HookOutsideProvider use={use} />)).toBe(
          `${name} must be used within an ArrangementProvider`,
        );
      },
    );

    it('L8f: a store hook called directly outside a provider keeps its own name', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      expect(
        thrownOutsideProvider(<HookOutsideProvider use={() => useArrangementRangeStore()} />),
      ).toBe('useArrangementRangeStore must be used within an ArrangementProvider');
    });
'''
s = s[:j] + rows + s[j:]
open(p, 'w').write(s)
print('ok')
