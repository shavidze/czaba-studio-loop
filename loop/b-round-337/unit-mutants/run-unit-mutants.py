# Usage: python3 -I run-unit-mutants.py <sketch-root> <out-dir>   (each mutant edits one file in place, runs DP49/DP5b/DP50, restores)
import sys, pathlib, subprocess
root = pathlib.Path(sys.argv[1]).resolve(); out = pathlib.Path(sys.argv[2]).resolve()
if str(root) == '/home/runner/czaba-project/store':
    sys.exit('refusing to edit the real store')
M = {
 'MU-WS-SUB': ('app/components/arrangement/StudioWorkspace.tsx',
   "export function StudioWorkspace() {\n  const workspace = useArrangement();\n",
   "export function StudioWorkspace() {\n  const workspace = useArrangement();\n  useArrangementClipLaneDrag((state) => state.drag);\n"),
 'MU-CLIP-GUARD': ('app/components/arrangement/ArrangementClip.tsx',
   "          gesture.laneRefusal = null;\n          previewGeometry(gesture.before);\n",
   "          gesture.laneRefusal = null;\n          previewArrangement(gesture.before);\n"),
 'MU-GUARD-V2': ('app/components/arrangement/ArrangementClip.tsx',
   "          gesture.laneRefusal = null;\n          previewGeometry(gesture.before);\n",
   "          gesture.laneRefusal = null;\n          if (getArrangement() !== gesture.before) {\n            previewGeometry(gesture.before);\n          }\n"),
 'MU-LANE-ALL': ('app/components/arrangement/ArrangementLane.tsx',
   "  const laneGhosts = useArrangementClipLaneDrag(\n",
   "  useArrangementClipLaneDrag((state) => state.drag);\n  const laneGhosts = useArrangementClipLaneDrag(\n"),
 'MU-REFUSAL': ('app/lib/arrangement/clip-lane-drag-store.ts',
   "  return drag?.ghosts.find((ghost) => ghost.blocked && ghost.message)?.message ?? null;\n",
   "  return drag === null ? null : null;\n"),
 'MU-CLEAR': ('app/contexts/ArrangementContext.tsx',
   "      if (next === publishedHistoryRef.current.present) {\n",
   "      if (next === publishedHistoryRef.current.present && next !== next) {\n"),
}
for name, (rel, old, new) in M.items():
    p = root / rel; s = p.read_text()
    if s.count(old) != 1: sys.exit(f'{name}: anchor count {s.count(old)}')
    p.write_text(s.replace(old, new))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', 'app/lib/arrangement/__tests__/drag-preview-render.test.tsx', '-t', 'DP49|DP5b|DP50'], cwd=root, capture_output=True, text=True, timeout=600)
        (out / f'{name}.log').write_text(r.stdout + r.stderr)
        lines = [l for l in (r.stdout + r.stderr).splitlines() if ('×' in l or '✓' in l) and 'DP' in l]
        print(name, 'rc', r.returncode, '|', ' / '.join(l.strip()[:60] for l in lines))
    finally:
        p.write_text(s)
