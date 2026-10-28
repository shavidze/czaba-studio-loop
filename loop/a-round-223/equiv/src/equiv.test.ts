import { describe, expect, it } from 'vitest';
import type { PerfBudgetRow } from '/home/runner/czaba-project/store/perf/lib/budgets';
import { builder as o1a } from './oracle-1a';
import { builder as o1bi } from './oracle-1bi';
import { builder as o1bii } from './oracle-1bii';
import { builder as n1a } from './new-1a';
import { builder as n1bi } from './new-1bi';
import { builder as n1bii } from './new-1bii';
import { builder as mC } from './mutant-MC-1a';
import { builder as mB } from './mutant-MB-1bi';
import { builder as mA } from './mutant-MA-1bii';

type Kind = 'deterministic' | 'wallclock';
type Detail = Record<string, number | string | boolean>;
const row = (
  id: string,
  metric: string,
  kind: Kind,
  mode: 'assert' | 'record',
  budget: PerfBudgetRow['budget'],
): PerfBudgetRow => ({ id, scenario: 's', metric, unit: 'u', kind, mode, budget, owner: 'o', note: `n ${id}` });

interface Pass {
  cpuRate: number;
  pass: number;
  samples: Map<string, { value: number; detail?: Detail }>;
  problems: string[];
  abortedAt: string | null;
  pageErrors: number;
  reactRenderer: string;
  innerWidth: number;
  stepMs: Record<string, number>;
}
const pass = (cpuRate: number, n: number, values: Record<string, number>, extra: Partial<Pass> = {}): Pass => ({
  cpuRate,
  pass: n,
  samples: new Map(Object.entries(values).map(([id, value], i) => [id, i % 2 ? { value, detail: { k: id } } : { value }])),
  problems: [],
  abortedAt: null,
  pageErrors: 0,
  reactRenderer: '18.3.1',
  innerWidth: 1440,
  stepMs: { load: n },
  ...extra,
});

const baseRows: PerfBudgetRow[] = [
  row('a.restarts', 'restarts', 'deterministic', 'assert', { op: '<=', value: 5 }),
  row('a.restarts.6x', 'restarts', 'deterministic', 'record', null),
  row('a.commits', 'commits', 'deterministic', 'record', null),
  row('a.commits.6x', 'commits', 'deterministic', 'record', null),
  row('a.bytes', 'bytes', 'deterministic', 'assert', { op: '<', value: 1000 }),
  row('a.frame-p95', 'frame-p95', 'wallclock', 'record', { op: '<', value: 16 }),
  row('a.frame-p95.6x', 'frame-p95', 'wallclock', 'record', null),
];
const goodValues = (rate: number, n: number): Record<string, number> =>
  rate === 1
    ? { 'a.restarts': 2, 'a.commits': 10, 'a.bytes': 500, 'a.frame-p95': 10 + n }
    : { 'a.restarts.6x': 2, 'a.commits.6x': 10, 'a.frame-p95.6x': 20 + n };
const allPasses = (mutate?: (p: Pass) => Pass): Pass[] =>
  [1, 6].flatMap((rate) => [1, 2, 3].map((n) => (mutate ?? ((p) => p))(pass(rate, n, goodValues(rate, n)))));

interface Case {
  name: string;
  budgets: PerfBudgetRow[];
  passes: Pass[];
  guard: string[];
}
const cases: Case[] = [
  { name: 'complete', budgets: baseRows, passes: allPasses(), guard: [] },
  {
    name: 'aborted pass, short row',
    budgets: baseRows,
    passes: allPasses((p) => {
      if (p.cpuRate === 6 && p.pass === 2) {
        p.abortedAt = 'drag';
        p.problems.push('aborted at drag: boom');
        p.samples.delete('a.commits.6x');
      }
      if (p.cpuRate === 1 && p.pass === 3) p.samples.delete('a.commits');
      return p;
    }),
    guard: [],
  },
  {
    name: 'partial, assert out of budget',
    budgets: baseRows,
    passes: [pass(1, 1, { ...goodValues(1, 1), 'a.bytes': 5000 }), pass(1, 2, { ...goodValues(1, 2), 'a.bytes': 5000 })],
    guard: [],
  },
  {
    name: '1a cross-rate mismatch',
    budgets: baseRows,
    passes: allPasses((p) => {
      if (p.cpuRate === 6) p.samples.set('a.restarts.6x', { value: 40 });
      return p;
    }),
    guard: [],
  },
  {
    name: 'guard problem',
    budgets: baseRows,
    passes: allPasses().slice(0, 4),
    guard: ['time guard: 6x pass 2 not started after 8 min', 'time guard: 6x pass 3 not started after 8 min'],
  },
  {
    name: 'deterministic metric on a wallclock row',
    budgets: [
      ...baseRows,
      row('w.components-per-commit', 'components-per-commit', 'wallclock', 'record', null),
      row('w.commits', 'commits', 'wallclock', 'record', null),
      row('w.bytes', 'bytes', 'wallclock', 'record', null),
    ],
    passes: allPasses((p) => {
      if (p.cpuRate === 1) {
        const v = [1, 50, 100][p.pass - 1];
        p.samples.set('w.components-per-commit', { value: v });
        p.samples.set('w.commits', { value: v });
        p.samples.set('w.bytes', { value: v });
      }
      return p;
    }),
    guard: [],
  },
  {
    name: 'measured id without budget row',
    budgets: baseRows,
    passes: allPasses((p) => {
      p.samples.set('a.orphan', { value: 1 });
      p.problems.push(`problem ${p.cpuRate}/${p.pass}`);
      return p;
    }),
    guard: [],
  },
];

const startedAt = new Date('2026-10-28T00:00:00.000Z');
type Builder = (b: PerfBudgetRow[], p: Pass[], s: Date, c: string, g: string[]) => unknown;
const run = (fn: Builder, c: Case): string => {
  const clone = c.passes.map((p) => ({ ...p, samples: new Map(p.samples), problems: [...p.problems] }));
  const report = JSON.parse(JSON.stringify(fn(c.budgets, clone, startedAt, 'chromium-x', [...c.guard])));
  delete report.startedAt;
  delete report.finishedAt;
  delete report.durationMs;
  return JSON.stringify(report);
};
const call3 = (fn: unknown): Builder => fn as Builder;
const pairs: [string, Builder, Builder][] = [
  ['1a', call3(o1a), call3(n1a)],
  ['1b-i', call3(o1bi), call3(n1bi)],
  ['1b-ii', call3(o1bii), call3(n1bii)],
];

describe('report core equivalence (HEAD 2d4a93f builders vs new core + envelope)', () => {
  for (const c of cases) {
    for (const [spec, oracle, fresh] of pairs) {
      it(`${spec}: ${c.name}`, () => {
        const a = run(oracle, c);
        const b = run(fresh, c);
        console.log(`EQ ${spec} | ${c.name} | failures=${JSON.parse(a).failures.length} | equal=${a === b}`);
        expect(b).toBe(a);
      });
    }
  }
});

describe('named mutants turn it red', () => {
  const mutants: [string, Builder, Builder, string][] = [
    ['M-A assertWhenPartial=false for 1b-ii', call3(o1bii), call3(mA), 'partial, assert out of budget'],
    ['M-B kind filter dropped for 1b-i', call3(o1bi), call3(mB), 'deterministic metric on a wallclock row'],
    ['M-C cross-rate loop removed for 1a', call3(o1a), call3(mC), '1a cross-rate mismatch'],
  ];
  for (const [name, oracle, mutant, caseName] of mutants) {
    it(name, () => {
      const c = cases.find((x) => x.name === caseName);
      if (!c) throw new Error(caseName);
      const differs = run(oracle, c) !== run(mutant, c);
      const differsAny = cases.filter((x) => run(oracle, x) !== run(mutant, x)).map((x) => x.name);
      console.log(`MUTANT ${name} | red on target case=${differs} | red cases=${differsAny.join('; ')}`);
      expect(differs).toBe(true);
    });
  }
});
