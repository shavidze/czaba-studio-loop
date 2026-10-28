import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel
    s = p.read_text()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'{rel}: expected {count} of {old!r}, found {n}')
    p.write_text(s.replace(old, new))
S = 'app/lib/arrangement/strings.ts'
sub(S, "  braceHint: 'Loop: make a time selection and press Loop (Ctrl+L)',\n", '')
sub(S, "  toggleTitle: studioShortcutTitle('Loop on / off', 'loop'),\n",
       "  toggleTitle: studioShortcutTitle('Loop on / off', 'loop'),\n  needsSelectionTitle: studioShortcutTitle('Loop: make a time selection first', 'loop'),\n")
sub(S, "  emptyHint: 'Bars: set a BPM — grid only, audio is not stretched',\n", '')
sub(S, "  overviewNote: '· Overview',\n", '')
sub(S, "  captionFallback: 'Video',\n", '')
sub(S, "  captionSoundNote: '· sound from the video track (M/S/Volume)',\n", '')
sub(S, "  empty: 'No video added yet',\n", '')
sub(S, "export const studioLaneStrings = {\n  videoMixLabel: 'Original video sound',\n",
       "const STUDIO_VIDEO_MIX_LABEL = 'Original video sound';\n\nexport const studioLaneStrings = {\n  videoMixLabel: STUDIO_VIDEO_MIX_LABEL,\n  videoMuteTitle: `Mute — ${STUDIO_VIDEO_MIX_LABEL}`,\n")
sub('app/lib/arrangement/tempo.ts', "export const TEMPO_EMPTY_HINT = studioTempoStrings.emptyHint;\n", '')
T = 'app/components/arrangement/ArrangementTempoRow.tsx'
sub(T, "  TEMPO_EMPTY_HINT,\n", '')
sub(T, """      {bpm === null ? (
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center whitespace-nowrap text-xs text-muted">
          {TEMPO_EMPTY_HINT}
        </span>
      ) : (
        barsRulerMarks(""", """      {bpm === null ? null : (
        barsRulerMarks(""")
L = 'app/components/arrangement/ArrangementLoopBrace.tsx'
sub(L, "const LOOP_HINT = studioLoopStrings.braceHint;\n", '')
sub(L, """      ) : (
        <span className="pointer-events-none sticky left-56 inline-block whitespace-nowrap px-2 text-xs leading-4 text-muted">
          {LOOP_HINT}
        </span>
      )}""", "      ) : null}")
R = 'app/components/arrangement/ArrangementTransport.tsx'
sub(R, "title={range ? studioLoopStrings.selectionTitle : studioLoopStrings.toggleTitle}",
       "title={\n          range\n            ? studioLoopStrings.selectionTitle\n            : loop\n              ? studioLoopStrings.toggleTitle\n              : studioLoopStrings.needsSelectionTitle\n        }")
V = 'app/components/arrangement/ArrangementVideoDock.tsx'
sub(V, """      {source ? source.name : studioVideoDockStrings.captionFallback}{' '}
      <span className="text-dim">{studioVideoDockStrings.captionSoundNote}</span>
""", """      {source ? source.name : null}
""")
sub(V, """        <div className="flex items-baseline justify-between gap-2 text-xs leading-4 text-muted">
          <span className="shrink-0">
            <span className="text-label font-medium uppercase tracking-label">Arrangement</span>{' '}
            <span className="text-dim">{studioVideoDockStrings.overviewNote}</span>
          </span>
""", """        <div className="flex min-h-4 items-baseline justify-between gap-2 text-xs leading-4 text-muted">
""")
sub(V, """          <p className="absolute inset-0 z-20 flex items-center justify-center bg-background p-2 text-center text-xs text-muted">
            {studioVideoDockStrings.empty}
          </p>""", """          <div
            className="absolute inset-0 z-20 bg-background"
            data-testid="arrangement-video-empty"
          />""")
N = 'app/components/arrangement/ArrangementLane.tsx'
sub(N, """      aria-label={`Mute — ${mixLabel}`}
      title="Mute"
""", """      aria-label={`Mute — ${mixLabel}`}
      title={isVideo ? studioLaneStrings.videoMuteTitle : 'Mute'}
""")
sub(N, """      title={studioLaneStrings.soloTitle}
""", """      title={isVideo ? studioLaneStrings.soloLabel(mixLabel) : studioLaneStrings.soloTitle}
""")
sub(N, "formatTitle={isVideo && density !== 'full' ? videoMixFaderTitle : undefined}",
       "formatTitle={isVideo ? videoMixFaderTitle : undefined}")
print('applied')
