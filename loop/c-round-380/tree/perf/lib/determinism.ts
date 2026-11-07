import type { PerfBudgetRow } from './budgets';

export type DeterminismContract =
  | { kind: 'exact' }
  | { kind: 'tenths' }
  | { kind: 'ratio'; pairs: readonly (readonly [string, string])[] };

const ratioPairsByMetric: ReadonlyMap<string, readonly (readonly [string, string])[]> = new Map([
  [
    'commits-per-move',
    [
      ['windowCommits', 'movesInWindow'],
      ['commits', 'moves'],
    ],
  ],
  ['move-components-per-move', [['componentsSum', 'movesInWindow']]],
]);

const exactUnits: ReadonlySet<string> = new Set([
  'count',
  'components',
  'elements',
  'bytes',
  'start() calls',
  'boolean (1 = true)',
  'commits / key',
  'components / key',
]);

export function determinismContract(row: PerfBudgetRow): DeterminismContract | null {
  const pairs = ratioPairsByMetric.get(row.metric);
  if (pairs !== undefined) return { kind: 'ratio', pairs };
  if (row.unit === 'MiB') return { kind: 'tenths' };
  if (exactUnits.has(row.unit)) return { kind: 'exact' };
  return null;
}
