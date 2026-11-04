import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel; s = p.read_text(); n = s.count(old)
    if n != count:
        raise SystemExit(f'{rel}: expected {count} of {old[:70]!r}, got {n}')
    p.write_text(s.replace(old, new))
C = 'app/contexts/ArrangementContext.tsx'
sub(C, "  previewStatus: (text: string) => void;\n", "  previewStatus: (text: string) => void;\n  getStatusPreviewText: () => string | null;\n")
sub(C, """  const previewStatus = useCallback(
    (text: string) => {
      statusPreviewStore.getState().showPreview(text);
    },
    [statusPreviewStore],
  );
""", """  const previewStatus = useCallback(
    (text: string) => {
      statusPreviewStore.getState().showPreview(text);
    },
    [statusPreviewStore],
  );
  const getStatusPreviewText = useCallback(
    () => statusPreviewStore.getState().preview?.text ?? null,
    [statusPreviewStore],
  );
""")
sub(C, "      previewStatus,\n", "      previewStatus,\n      getStatusPreviewText,\n", count=2)
W = 'app/components/arrangement/StudioWorkspace.tsx'
sub(W, """      const current = workspaceRef.current;
      if (
        insertMarkerStatusKind(current.status) !== null ||
        current.status === FOLLOW_PAUSED_MESSAGE
      ) {""", """      const current = workspaceRef.current;
      const shownStatus = current.getStatusPreviewText() ?? current.status;
      if (
        insertMarkerStatusKind(shownStatus) !== null ||
        shownStatus === FOLLOW_PAUSED_MESSAGE
      ) {""")
sub(W, "          if (!event.repeat || current.status !== NUDGE_AT_TIME_START_MESSAGE) {",
       "          if (\n            !event.repeat ||\n            (current.getStatusPreviewText() ?? current.status) !== NUDGE_AT_TIME_START_MESSAGE\n          ) {")
M = 'app/components/arrangement/ArrangementMarkerRow.tsx'
sub(M, "    status,\n    setStatus,\n", "    status,\n    setStatus,\n    getStatusPreviewText,\n")
sub(M, "        if (options?.keyRepeat !== true || status !== message) {", "        if (options?.keyRepeat !== true || (getStatusPreviewText() ?? status) !== message) {")
sub(M, "      if (!keyRepeat || status !== message) {", "      if (!keyRepeat || (getStatusPreviewText() ?? status) !== message) {")
sub(M, "      if (!keyRepeat || status !== MARKER_AT_TIME_START_MESSAGE) {", "      if (!keyRepeat || (getStatusPreviewText() ?? status) !== MARKER_AT_TIME_START_MESSAGE) {")
print('getter sketch applied')
