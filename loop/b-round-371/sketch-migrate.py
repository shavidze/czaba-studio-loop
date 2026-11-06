"""B round 371 sketch generator for round 372 (PERF-11c-ii-a, test-only status probe migration).

Usage: python3 -I sketch-migrate.py <store-tree>
Rewrites the shared probe helper and the 16 test files that read committed status
directly from useArrangement() so that they read it through useWorkspaceStatusProbe().
Run Biome (format + organize imports) on the touched files afterwards.
"""

import re
import sys
from pathlib import Path

TREE = Path(sys.argv[1])
TESTS = TREE / 'app/lib/arrangement/__tests__'

FILES = [
    'all-lane-clipboard.test.tsx',
    'context-hygiene.test.tsx',
    'fader-click.test.tsx',
    'fader-focus-order.test.tsx',
    'failed-source-refusal.test.tsx',
    'follow-remount-ui.test.tsx',
    'gesture-guard.test.tsx',
    'grid-adaptive-ui.test.tsx',
    'library-preview.test.tsx',
    'pan-release-recovery.test.tsx',
    'pending-status.test.tsx',
    'range-store.test.tsx',
    'self-disabling-focus.test.tsx',
    'tempo-seed-ui.test.tsx',
    'video-import-status-ui.test.tsx',
    'workspace-session-remount-ui.test.tsx',
]

PROBE = '''import {
  type ArrangementContextValue,
  useArrangement,
  useArrangementActiveTrackId,
  useArrangementIsPlaying,
} from '~/contexts/ArrangementContext';

export interface WorkspaceStatusValue {
  status: string;
  statusSequence: number;
  statusKey: string;
}

export type WorkspaceStatusProbeValue = ArrangementContextValue & WorkspaceStatusValue;

export type WorkspaceProbeValue = WorkspaceStatusProbeValue & {
  isPlaying: boolean;
  activeTrackId: string | null;
};

export function useWorkspaceStatus(): WorkspaceStatusValue {
  const { status, statusSequence, statusKey } = useArrangement();
  return { status, statusSequence, statusKey };
}

export function useWorkspaceStatusProbe(): WorkspaceStatusProbeValue {
  return { ...useArrangement(), ...useWorkspaceStatus() };
}

export function useWorkspaceProbe(): WorkspaceProbeValue {
  return {
    ...useWorkspaceStatusProbe(),
    isPlaying: useArrangementIsPlaying(),
    activeTrackId: useArrangementActiveTrackId(),
  };
}
'''


def migrate(path: Path) -> None:
    src = path.read_text()
    head, sep, body = src.partition("} from '~/contexts/ArrangementContext';")
    if not sep:
        raise SystemExit(f'no ArrangementContext import in {path.name}')
    body = body.replace('api.current = useArrangement();', 'api.current = useWorkspaceStatusProbe();')
    body = body.replace('renderHook(() => useArrangement(),', 'renderHook(() => useWorkspaceStatusProbe(),')
    body = body.replace('({ ...useArrangement(),', '({ ...useWorkspaceStatusProbe(),')
    body = body.replace('= { ...useArrangement(),', '= { ...useWorkspaceStatusProbe(),')
    body = re.sub(r'(api\.current = \{\n\s+)\.\.\.useArrangement\(\),', r'\1...useWorkspaceStatusProbe(),', body)
    body = re.sub(r'\bArrangementContextValue\b', 'WorkspaceStatusProbeValue', body)
    if not re.search(r'\bArrangementContextValue\b', body):
        head = re.sub(r'\n\s*type ArrangementContextValue,', '', head, count=1)
    code = re.sub(r"'[^'\n]*'", "''", body)
    if not re.search(r'\buseArrangement\(', code):
        head = re.sub(r'\n\s*useArrangement,', '', head, count=1)
    head = head.rstrip()
    out = (
        head
        + "\n} from '~/contexts/ArrangementContext';\n"
        + "import { type WorkspaceStatusProbeValue, useWorkspaceStatusProbe } from './helpers/workspace-probe';"
        + body
    )
    if 'useWorkspaceStatusProbe()' not in body:
        raise SystemExit(f'no probe site rewritten in {path.name}')
    path.write_text(out)


(TESTS / 'helpers/workspace-probe.ts').write_text(PROBE)
for name in FILES:
    migrate(TESTS / name)
print('migrated', len(FILES), 'files + helpers/workspace-probe.ts')
