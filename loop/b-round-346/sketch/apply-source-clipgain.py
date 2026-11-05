# B round 346 -> 347 sketch part 2: ArrangementDetailClipGain memo + stable detail props. Usage: python3 -I apply-source-clipgain.py <tree> (after apply-source.py)
import pathlib, sys
T = pathlib.Path(sys.argv[1])
D = 'app/components/arrangement/ArrangementDetailPanel.tsx'

def sub(old, new, count=1):
    p = T / D
    s = p.read_text()
    n = s.count(old)
    assert n == count, (old[:70], n)
    p.write_text(s.replace(old, new))

sub("import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';\n", "import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';\nimport { useStableHandler } from '~/hooks/useStableHandler';\n")
sub("function useClipGainDraftSnapshot(", """function parseClipGainDbKey(dbKey: string): number[] {
  const parsed: unknown = JSON.parse(dbKey);
  return Array.isArray(parsed)
    ? parsed.filter((db): db is number => typeof db === 'number' && Number.isFinite(db))
    : [];
}

function useClipGainDraftSnapshot(""")
sub("const ArrangementDetailClipGain = forwardRef<HTMLInputElement, ArrangementDetailClipGainProps>(", "const ArrangementDetailClipGainInner = forwardRef<HTMLInputElement, ArrangementDetailClipGainProps>(")
sub("ArrangementDetailClipGain.displayName = 'ArrangementDetailClipGain';\n", "ArrangementDetailClipGainInner.displayName = 'ArrangementDetailClipGain';\n\nconst ArrangementDetailClipGain = memo(ArrangementDetailClipGainInner);\n")
sub("  const handleClipGainKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {", "  const handleClipGainKeyDown = useStableHandler((event: KeyboardEvent<HTMLInputElement>) => {")
sub("      event.preventDefault();\n      setClipGainText(displayedClipGainText);\n    }\n  };\n", "      event.preventDefault();\n      setClipGainText(displayedClipGainText);\n    }\n  });\n")
sub("""  const selectedClipGainIds: readonly string[] | null = clip
    ? [clip.id]
    : (clipGainGroup?.clipIds ?? null);
""", """  const selectedClipGainIdsKey = clip
    ? JSON.stringify([clip.id])
    : clipGainGroup
      ? JSON.stringify(clipGainGroup.clipIds)
      : null;
  const selectedClipGainIds: readonly string[] | null = useMemo(
    () => (selectedClipGainIdsKey === null ? null : parseClipGainIdsKey(selectedClipGainIdsKey)),
    [selectedClipGainIdsKey],
  );
  const storedClipGainsDbKey = JSON.stringify(
    clipGainGroup ? clipGainGroup.clipGainsDb : [clipGainDb ?? 0],
  );
  const storedClipGainsDb: readonly number[] = useMemo(
    () => parseClipGainDbKey(storedClipGainsDbKey),
    [storedClipGainsDbKey],
  );
""")
sub("  const handleClipGainFaderPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {", "  const handleClipGainFaderPointerDown = useStableHandler((event: ReactPointerEvent<HTMLInputElement>) => {")
sub("    clipGainFaderDrag.onPointerDown(event);\n  };\n", "    clipGainFaderDrag.onPointerDown(event);\n  });\n")
sub("  const commitClipGainFaderValue = () => {", "  const commitClipGainFaderValue = useStableHandler(() => {")
sub("      commitClipGainFader?.(firstId);\n    }\n  };\n", "      commitClipGainFader?.(firstId);\n    }\n  });\n")
sub("  const blurClipGainFaderValue = () => {", "  const blurClipGainFaderValue = useStableHandler(() => {")
sub("      blurClipGainFader?.(firstId);\n    }\n  };\n", "      blurClipGainFader?.(firstId);\n    }\n  });\n")
sub("  const resetClipGainFader = () => {", "  const resetClipGainFader = useStableHandler(() => {")
sub("    previewClipGainFader?.(firstId, 0);\n    commitClipGainFader?.(firstId);\n  };\n", "    previewClipGainFader?.(firstId, 0);\n    commitClipGainFader?.(firstId);\n  });\n")
sub("  const isGroupState = !clip && group !== null;\n", """  const handleClipGainFieldChange = useStableHandler((event: ChangeEvent<HTMLInputElement>) => {
    setClipGainText(event.target.value);
  });

  const handleClipGainFieldBlur = useStableHandler(() => {
    commitClipGain('blur');
  });

  const handleClipGainFaderChange = useStableHandler((event: ChangeEvent<HTMLInputElement>) => {
    const clipIds = clipGainTargetIds();
    if (isClipGainFaderEnabled && clipIds !== null) {
      previewClipGainTargets(clipIds, Number(event.target.value));
    }
  });

  const handleClipGainFaderKeyUp = useStableHandler(() => {
    if (!isPointerGestureActive()) {
      commitClipGainFaderValue();
    }
  });

  const handleClipGainResetClick = useStableHandler((event: MouseEvent<HTMLButtonElement>) => {
    resetClipGain(event.currentTarget);
  });

  const isGroupState = !clip && group !== null;
""")
sub("        storedClipGainsDb={clipGainGroup ? clipGainGroup.clipGainsDb : [clipGainDb ?? 0]}\n", "        storedClipGainsDb={storedClipGainsDb}\n")
sub("        onFieldChange={(event) => setClipGainText(event.target.value)}\n", "        onFieldChange={handleClipGainFieldChange}\n")
sub("        onFieldBlur={() => commitClipGain('blur')}\n", "        onFieldBlur={handleClipGainFieldBlur}\n")
sub("""        onFaderChange={(event) => {
          const clipIds = clipGainTargetIds();
          if (isClipGainFaderEnabled && clipIds !== null) {
            previewClipGainTargets(clipIds, Number(event.target.value));
          }
        }}
""", "        onFaderChange={handleClipGainFaderChange}\n")
sub("""        onFaderKeyUp={() => {
          if (!isPointerGestureActive()) {
            commitClipGainFaderValue();
          }
        }}
""", "        onFaderKeyUp={handleClipGainFaderKeyUp}\n")
sub("        onResetClick={(event) => resetClipGain(event.currentTarget)}\n", "        onResetClick={handleClipGainResetClick}\n")
print('applied clipgain')
