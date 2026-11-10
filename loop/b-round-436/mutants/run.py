# usage: python3 -I run.py <scratch> <dir with covering-files.txt> — each mutant undoes one sketch decision in source only,
# runs the covering files, logs the red rows; then the sketch itself must be green.
import subprocess, sys, pathlib, re
S, B = sys.argv[1], pathlib.Path(sys.argv[2])
cov = (B / 'covering-files.txt').read_text().split()
EXP = 'app/components/arrangement/ArrangementExportDialog.tsx'
WS = 'app/components/arrangement/StudioWorkspace.tsx'
NS = 'app/components/arrangement/StudioNarrowScreen.tsx'
LANE = 'app/components/arrangement/ArrangementLane.tsx'
DET = 'app/components/arrangement/ArrangementDetailPanel.tsx'
M = {
 'M1-export-fill': (EXP, 'border border-transparent bg-brand px-4 py-2 text-sm font-medium text-brand-foreground', 'border border-brand bg-foreground/5 px-4 py-2 text-sm font-medium text-brand'),
 'M2-export-hover': (EXP, 'enabled:hover:bg-brand-hover enabled:active:bg-brand', 'enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12'),
 'M3-aria-busy': (EXP, '                aria-busy={isRendering}\n', ''),
 'M4-busy-opacity': (EXP, "isRendering ? 'opacity-70' : 'disabled:cursor-not-allowed disabled:opacity-40'", "'disabled:cursor-not-allowed disabled:opacity-40'"),
 'M5-header-exit': (WS, 'group inline-flex items-center gap-0.75 rounded-sm px-1 text-sm font-medium text-foreground"', 'inline-flex items-center gap-0.75 rounded-sm px-1 text-sm font-medium text-muted hover:text-foreground"'),
 'M6-header-arrow': (WS, 'className="size-3 shrink-0 text-muted group-hover:text-foreground"', 'className="size-3 shrink-0"'),
 'M7-narrow-exit': (NS, 'group inline-flex items-center gap-1 self-start rounded-sm px-1 text-sm font-medium text-foreground"', 'inline-flex items-center gap-1 self-start rounded-sm px-1 text-sm font-medium text-muted hover:text-foreground"'),
 'M8-narrow-arrow': (NS, 'className="size-3 shrink-0 text-muted group-hover:text-foreground"', 'className="size-3 shrink-0"'),
 'M9-lane-hover-fill': (LANE, "isHeightDragging ? 'after:bg-foreground/40' : 'hover:after:bg-foreground/25'", "isHeightDragging ? 'bg-foreground/50' : 'hover:bg-foreground/50'"),
 'M10-lane-drag-no-swap': (LANE, "isHeightDragging ? 'after:bg-foreground/40' : 'hover:after:bg-foreground/25'", "isHeightDragging ? 'after:bg-foreground/40 hover:after:bg-foreground/25' : 'hover:after:bg-foreground/25'"),
 'M11-lane-line-above-border': (LANE, 'after:inset-x-0 after:-bottom-px after:h-px', 'after:inset-x-0 after:bottom-0 after:h-px'),
 'M12-detail-fill': (DET, 'after:absolute after:inset-x-0 after:top-0 after:h-px hover:after:bg-foreground/25', 'hover:bg-foreground/50'),
}
(B / 'mutants').mkdir(parents=True, exist_ok=True)
summary = []
for mid, (f, new, old) in M.items():
    p = pathlib.Path(S) / f; orig = p.read_text(); assert orig.count(new) == 1, mid
    p.write_text(orig.replace(new, old))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *cov], cwd=S, capture_output=True, text=True, timeout=900)
        log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
        (B / 'mutants' / f'mutant-{mid}.log').write_text(log)
        red = sorted(set(m.group(1).strip() for m in re.finditer(r'^ +(?:×|✗|FAIL) +(.+?)(?: \d+ms)?$', log, re.M)))
        summary.append(f"{mid} rc {r.returncode} red: {' | '.join(red) if red else 'none'}")
    finally:
        p.write_text(orig)
r = subprocess.run(['npx', 'vitest', 'run', *cov], cwd=S, capture_output=True, text=True, timeout=900)
summary.append(f"sketch-green rc {r.returncode}")
(B / 'mutants' / 'summary.txt').write_text('\n'.join(summary) + '\n')
print('\n'.join(summary))
