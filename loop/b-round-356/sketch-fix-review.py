"""B round 356: apply the sketch-review fixes (tech-lead Medium 1, Lows 5 and 6) to /home/runner/b356-scratch/sc StudioWorkspace.tsx."""
p = '/home/runner/b356-scratch/sc/app/components/arrangement/StudioWorkspace.tsx'
s = open(p).read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)
rep("  type ComponentProps,\n  memo,\n", "  type ComponentProps,\n  type MutableRefObject,\n  memo,\n")
rep("""function ArrangementPlaybackFollowSyncInner({
  committedRef,
  onPlayingChange,
}: {
  committedRef: { current: boolean };
  onPlayingChange: (isPlaying: boolean) => void;
}) {""", """interface ArrangementPlaybackFollowSyncProps {
  committedRef: MutableRefObject<boolean>;
  onPlayingChange: (isPlaying: boolean) => void;
}

function ArrangementPlaybackFollowSyncInner({
  committedRef,
  onPlayingChange,
}: ArrangementPlaybackFollowSyncProps) {""")
rep("""        const current = workspaceRef.current;
        const shownStatus = current.getStatusPreviewText() ?? current.status;
        if (insertMarkerStatusKind(shownStatus) !== null || shownStatus === FOLLOW_PAUSED_MESSAGE) {
          current.setStatus(current.describeSpaceStart());
        }
        return;""", """        const current = workspaceRef.current;
        const previewText = current.getStatusPreviewText();
        if (previewText !== null) {
          if (insertMarkerStatusKind(previewText) !== null || previewText === FOLLOW_PAUSED_MESSAGE) {
            current.setStatus(current.describeSpaceStart());
          }
          return;
        }
        current.setStatus((text) =>
          insertMarkerStatusKind(text) !== null || text === FOLLOW_PAUSED_MESSAGE
            ? current.describeSpaceStart()
            : text,
        );
        return;""")
rep("""          <ArrangementStatusText status={status} statusKey={statusKey} />
          <ArrangementPlaybackFollowSync
            committedRef={committedIsPlayingRef}
            onPlayingChange={syncFollowWithPlayback}
          />
        </output>
""", """          <ArrangementStatusText status={status} statusKey={statusKey} />
        </output>
        <ArrangementPlaybackFollowSync
          committedRef={committedIsPlayingRef}
          onPlayingChange={syncFollowWithPlayback}
        />
""")
open(p, 'w').write(s)
print('fixed')
