import subprocess, sys, pathlib
M = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-84/mut/store')
S = pathlib.Path('/home/runner/czaba-project/store')
LOG = M.parent
VFM = 'app/lib/arrangement/video-fades.ts'
DOCK = 'app/components/arrangement/ArrangementVideoDock.tsx'
AC = 'app/components/arrangement/ArrangementClip.tsx'
EXP = 'app/components/arrangement/ArrangementExportDialog.tsx'
UI = 'app/components/arrangement/ArrangementClipEnvelope.tsx'
VF = 'app/lib/arrangement/__tests__/video-fades.test.ts'
VU = 'app/lib/arrangement/__tests__/video-fades-ui.test.tsx'
FU = 'app/lib/arrangement/__tests__/clip-fades-ui.test.tsx'
EU = 'app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx'
muts = {
 'a-video-setter-accepts-audio': (VFM, "track?.kind !== 'video'", "track === undefined", [VF]),
 'b-opacity-ignores-fade-out': (VFM, "clipFadeGainAt(located.clip, position)", "clipFadeGainAt({ ...located.clip, fadeOut: 0 }, position)", [VF, VU]),
 'c-overlay-writes-gain': (DOCK, "overlay.style.opacity = videoFadeOverlayOpacity(pictureOpacity);", "overlay.style.opacity = pictureOpacity;", [VU]),
 'd-video-handle-reuses-clip-testid': (AC, "isVideo ? 'arrangement-video-fade' : 'arrangement-clip-fade'", "'arrangement-clip-fade'", [VU, FU]),
 'e-export-line-without-fade': (EXP, "{hasVideoFades ? (", "{true ? (", [VU]),
 'f-video-setter-for-audio': (AC, "const setFade = isVideo ? setVideoClipFade : setClipFade;", "const setFade = setVideoClipFade;", [VU, FU]),
 'g-x1-double-click-from-body': (UI, "const root = event.currentTarget.closest<HTMLElement>('[data-clip-id]');", "const root = event.currentTarget.parentElement;", [EU]),
 'i-x1-point-offset-removed': (UI, "* pxPerSecond - CLIP_ENVELOPE_ROOT_BORDER_PX,", "* pxPerSecond,", [EU]),
 'j-x1-svg-back-in-body': (UI, "style={{ left: -CLIP_ENVELOPE_ROOT_BORDER_PX, width: lineWidth }}", "style={{ left: 0, width: lineWidth - 2 }}", [EU]),
 'h-overlay-rewrites-equal': (DOCK, "if (pictureOpacity === writtenOpacityRef.current) {", "if (pictureOpacity === 'never') {", [VU]),
}
only = sys.argv[1:]
summary = []
for name, (path, old, new, tests) in muts.items():
    if only and name not in only: continue
    target = M / path
    original = (S / path).read_text()
    assert original.count(old) == 1, (name, original.count(old))
    for t in tests + [path]:
        (M / t).write_text((S / t).read_text())
    target.write_text(original.replace(old, new))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=M, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        (LOG / f'{name}.log').write_text(out)
        failed = [l.strip() for l in out.splitlines() if '×' in l]
        summary.append(f"{name}: exit={r.returncode} red={len(failed)} :: " + ' | '.join(failed[:4]))
    finally:
        target.write_text(original)
    assert target.read_text() == original
print('\n'.join(summary))
(LOG / 'summary.txt').write_text('\n'.join(summary) + '\n')
