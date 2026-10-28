// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { PerfBudgetRow } from './budgets';
import { determinismContract } from './determinism';
import {
  buildPerfReportCore,
  type PerfReportCoreOptions,
  type PerfReportPass,
  type PerfSample,
  rateRowId,
  rowRate,
} from './report';

type Detail = Record<string, number | string | boolean>;

function budgetRow(id: string, overrides: Partial<PerfBudgetRow> = {}): PerfBudgetRow {
  return {
    id,
    scenario: 'unit',
    metric: 'commits',
    unit: 'count',
    kind: 'deterministic',
    mode: 'record',
    budget: null,
    owner: 'PERF-TEST',
    note: '',
    ...overrides,
  };
}

function rowPasses(
  id: string,
  values: readonly number[],
  details: readonly (Detail | null)[] = [],
): PerfReportPass[] {
  return values.map((value, index) => {
    const detail = details[index];
    const sample: PerfSample = detail ? { value, detail } : { value };
    return {
      cpuRate: 1,
      pass: index + 1,
      samples: new Map([[id, sample]]),
      problems: [],
      abortedAt: null,
    };
  });
}

function failuresFor(
  row: PerfBudgetRow,
  values: readonly number[],
  details: readonly (Detail | null)[] = [],
): string[] {
  return buildPerfReportCore({
    budgets: [row],
    passes: rowPasses(row.id, values, details),
    cpuRates: [1],
    passesPerRate: values.length,
    assertWhenPartial: false,
  }).failures;
}

const ratioRow = budgetRow('drag.commits-per-move', {
  metric: 'commits-per-move',
  unit: 'commits / move',
});

function crossOptions(withCross: boolean): PerfReportCoreOptions {
  const sample = (value: number, componentsSum: number, movesInWindow: number): PerfSample => ({
    value,
    detail: { componentsSum, movesInWindow },
  });
  const passes: PerfReportPass[] = [1, 2, 1, 2].map((pass, index) => {
    const cpuRate = index < 2 ? 1 : 6;
    const id = rateRowId('fader.fade.move-components-per-move', cpuRate);
    const value = cpuRate === 1 ? sample(0.75, 45, 60) : sample(0.742, 89, 120);
    return { cpuRate, pass, samples: new Map([[id, value]]), problems: [], abortedAt: null };
  });
  const base = budgetRow('fader.fade.move-components-per-move', {
    metric: 'move-components-per-move',
    unit: 'components',
  });
  return {
    budgets: [base, { ...base, id: `${base.id}.6x` }],
    passes,
    cpuRates: [1, 6],
    passesPerRate: 2,
    assertWhenPartial: false,
    ...(withCross ? { crossRateMetrics: new Set(['move-components-per-move']) } : {}),
  };
}

describe('buildPerfReportCore determinism contract', () => {
  it('DC-INT: a count row that differs by 1 is nondeterministic', () => {
    expect(failuresFor(budgetRow('click.commits'), [12, 12, 13])).toEqual([
      'nondeterministic count click.commits: [12, 12, 13]',
    ]);
  });

  it('DC-INT-OK: identical count samples pass', () => {
    expect(failuresFor(budgetRow('click.commits'), [12, 12, 12])).toEqual([]);
  });

  it('DC-RATIO: a numerator change fails the ratio row', () => {
    const details = [
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 59, movesInWindow: 60 },
    ];
    expect(failuresFor(ratioRow, [1, 1, 0.983], details)).toEqual([
      'nondeterministic ratio drag.commits-per-move: numerators [60, 60, 59], denominators [60, 60, 60]',
    ]);
  });

  it('DC-DENOM: a denominator change fails even when the values are identical', () => {
    const both = [
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 59, movesInWindow: 59 },
    ];
    expect(failuresFor(ratioRow, [1, 1, 1], both)).toEqual([
      'nondeterministic ratio drag.commits-per-move: numerators [60, 60, 59], denominators [60, 60, 59]',
    ]);
    const denominatorOnly = [
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 60, movesInWindow: 61 },
    ];
    expect(failuresFor(ratioRow, [1, 1, 1], denominatorOnly)).toEqual([
      'nondeterministic ratio drag.commits-per-move: numerators [60, 60, 60], denominators [60, 60, 61]',
    ]);
  });

  it('DC-RATIO-ALT: the 1a {commits, moves} pair is used when the window pair is absent', () => {
    const row = budgetRow('fader.track.stopped.commits-per-move', {
      metric: 'commits-per-move',
      unit: 'ratio',
    });
    const details = [1, 2, 3].map(() => ({ commits: 45, moves: 60 }));
    expect(failuresFor(row, [0.75, 0.75, 0.75], details)).toEqual([]);
    const varied = [
      { commits: 45, moves: 60 },
      { commits: 45, moves: 60 },
      { commits: 46, moves: 60 },
    ];
    expect(failuresFor(row, [0.75, 0.75, 0.75], varied)).toEqual([
      'nondeterministic ratio fader.track.stopped.commits-per-move: numerators [45, 45, 46], denominators [60, 60, 60]',
    ]);
    const mixed: Detail[] = [
      { windowCommits: 1, movesInWindow: 2, commits: 45, moves: 60 },
      { commits: 45, moves: 60 },
      { commits: 46, moves: 60 },
    ];
    expect(failuresFor(row, [0.75, 0.75, 0.75], mixed)).toEqual([
      'nondeterministic ratio fader.track.stopped.commits-per-move: numerators [45, 45, 46], denominators [60, 60, 60]',
    ]);
  });

  it('DC-MISSING: a ratio row without its detail pair fails', () => {
    expect(failuresFor(ratioRow, [1, 1, 1], [null, null, null])).toEqual([
      'ratio detail missing drag.commits-per-move: needs one of windowCommits/movesInWindow, commits/moves',
    ]);
    const partial: (Detail | null)[] = [
      { windowCommits: 60, movesInWindow: 60 },
      { windowCommits: 60 },
      null,
    ];
    expect(failuresFor(ratioRow, [1, 1, 1], partial)).toEqual([
      'ratio detail missing drag.commits-per-move: needs one of windowCommits/movesInWindow, commits/moves',
    ]);
  });

  it('DC-MIB-OK: a MiB spread of 0.1 passes', () => {
    const row = budgetRow('res.mem.used-ready-mib', { metric: 'used-ready-mib', unit: 'MiB' });
    expect(failuresFor(row, [65.1, 65, 65])).toEqual([]);
  });

  it('DC-MIB: a MiB spread over 0.1 fails', () => {
    const row = budgetRow('res.mem.used-ready-mib', { metric: 'used-ready-mib', unit: 'MiB' });
    expect(failuresFor(row, [65.3, 65, 65])).toEqual([
      'nondeterministic MiB res.mem.used-ready-mib: [65.3, 65, 65] (spread over 0.1)',
    ]);
  });

  it('DC-UNKNOWN: a deterministic row with an unknown unit fails closed, even with 0 or 1 samples', () => {
    const row = budgetRow('odd.distance', { metric: 'distance', unit: 'furlongs' });
    const text = 'no determinism contract odd.distance: metric distance, unit furlongs';
    expect(failuresFor(row, [3, 3, 3])).toEqual([text]);
    expect(failuresFor(row, [3])).toEqual([text]);
    const empty = buildPerfReportCore({
      budgets: [row],
      passes: [],
      cpuRates: [1],
      passesPerRate: 3,
      assertWhenPartial: false,
    });
    expect(empty.failures).toEqual([text]);
  });

  it('DC-CONTRACT: every metric and unit class resolves in the documented order', () => {
    const contract = (metric: string, unit: string) =>
      determinismContract(budgetRow('x', { metric, unit }));
    expect(contract('commits-per-move', 'ratio')).toEqual({
      kind: 'ratio',
      pairs: [
        ['windowCommits', 'movesInWindow'],
        ['commits', 'moves'],
      ],
    });
    expect(contract('move-components-per-move', 'components')).toEqual({
      kind: 'ratio',
      pairs: [['componentsSum', 'movesInWindow']],
    });
    expect(contract('used-ready-mib', 'MiB')).toEqual({ kind: 'tenths' });
    for (const unit of [
      'count',
      'components',
      'elements',
      'bytes',
      'start() calls',
      'boolean (1 = true)',
      'commits / key',
      'components / key',
    ]) {
      expect(contract('any', unit)).toEqual({ kind: 'exact' });
    }
    expect(contract('any', 'commits / move')).toBeNull();
    expect(contract('any', 'ms')).toBeNull();
  });

  it('DC-WALL: a wallclock row is never determinism-checked', () => {
    const row = budgetRow('load.longtasks-over-50', {
      metric: 'longtasks-over-50',
      kind: 'wallclock',
    });
    expect(failuresFor(row, [1, 1, 2])).toEqual([]);
    expect(failuresFor({ ...row, unit: 'furlongs' }, [1, 1, 2])).toEqual([]);
  });

  it('DC-CROSS: a 1x vs 6x median difference fails exactly, with the cross set', () => {
    expect(buildPerfReportCore(crossOptions(true)).failures).toEqual([
      'nondeterministic count fader.fade.move-components-per-move: 1x 0.75 vs 6x 0.742',
    ]);
  });

  it('DC-CROSS-OFF: the same 6x shape has no cross failure without the cross set', () => {
    expect(buildPerfReportCore(crossOptions(false)).failures).toEqual([]);
  });

  it('DC-PARTIAL: a partial run reports a failed assert only with assertWhenPartial', () => {
    const row = budgetRow('res.export.1.bytes', {
      metric: 'bytes',
      unit: 'bytes',
      mode: 'assert',
      budget: { op: '<=', value: 100 },
    });
    const partial = (assertWhenPartial: boolean) =>
      buildPerfReportCore({
        budgets: [row],
        passes: rowPasses(row.id, [500]),
        cpuRates: [1],
        passesPerRate: 3,
        assertWhenPartial,
      });
    expect(partial(true).complete).toBe(false);
    expect(partial(true).failures).toEqual([
      'assert failed res.export.1.bytes: measured median 500 [500], budget <= 100',
    ]);
    expect(partial(false).failures).toEqual([]);
  });

  it('DC-ORDER: failures keep the documented order', () => {
    const assertRow = budgetRow('a.count', { mode: 'assert', budget: { op: '<=', value: 0 } });
    const countRow = budgetRow('b.count');
    const ratio = budgetRow('d.commits-per-move', { metric: 'commits-per-move', unit: 'ratio' });
    const unknown = budgetRow('e.distance', { metric: 'distance', unit: 'furlongs' });
    const cross = budgetRow('c.components-per-commit', {
      metric: 'components-per-commit',
      unit: 'components',
    });
    const pass = (
      cpuRate: number,
      passNumber: number,
      samples: [string, PerfSample][],
      problems: string[] = [],
      abortedAt: string | null = null,
    ): PerfReportPass => ({
      cpuRate,
      pass: passNumber,
      samples: new Map(samples),
      problems,
      abortedAt,
    });
    const core = buildPerfReportCore({
      budgets: [assertRow, countRow, ratio, unknown, cross, { ...cross, id: `${cross.id}.6x` }],
      passes: [
        pass(
          1,
          1,
          [
            ['a.count', { value: 1 }],
            ['b.count', { value: 1 }],
            ['d.commits-per-move', { value: 1 }],
            ['c.components-per-commit', { value: 5 }],
            ['z.extra', { value: 1 }],
          ],
          ['pass problem'],
        ),
        pass(1, 2, [
          ['a.count', { value: 1 }],
          ['b.count', { value: 2 }],
          ['d.commits-per-move', { value: 1 }],
          ['c.components-per-commit', { value: 5 }],
        ]),
        pass(6, 1, [['c.components-per-commit.6x', { value: 6 }]]),
        pass(6, 2, [], [], 'aborted'),
      ],
      cpuRates: [1, 6],
      passesPerRate: 2,
      assertWhenPartial: false,
      crossRateMetrics: new Set(['components-per-commit']),
      guardProblems: ['guard problem'],
    });
    expect(core.complete).toBe(true);
    expect(core.failures).toEqual([
      'guard problem',
      '1x pass 1: pass problem',
      'measured row without a budget row: z.extra',
      'assert failed a.count: measured median 1 [1, 1], budget <= 0',
      'nondeterministic count b.count: [1, 2]',
      'ratio detail missing d.commits-per-move: needs one of windowCommits/movesInWindow, commits/moves',
      'row not measured 2 times: e.distance (0)',
      'no determinism contract e.distance: metric distance, unit furlongs',
      '1 rows short of 2 samples because a pass aborted',
      'nondeterministic count c.components-per-commit: 1x 5 vs 6x 6',
    ]);
  });

  it('DC-RATE: rowRate inverts rateRowId', () => {
    for (const rate of [1, 6]) {
      expect(rowRate(rateRowId('res.harness.mem-polls-1', rate))).toBe(rate);
    }
    expect(rowRate('x.6x')).toBe(6);
  });
});
