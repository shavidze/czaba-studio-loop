import { readFileSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { loadPerfBudgets } from '/home/runner/czaba-project/store/perf/lib/budgets';
import {
  buildPerfReportCore,
  type PerfReportPass,
  type PerfSample,
  rowRate,
} from '/home/runner/czaba-project/store/perf/lib/report';

const store = '/home/runner/czaba-project/store/perf';
const reportsDir = process.env.REPLAY_DIR ?? '';
const crossRateMetrics = new Set([
  'components-per-commit',
  'restarts',
  'move-components-max',
  'move-components-per-move',
]);
const specs = [
  { report: 'latest.json', budgets: 'budgets.json', cross: true, assertWhenPartial: false },
  { report: 'latest-interactions.json', budgets: 'budgets.interactions.json', cross: false, assertWhenPartial: false },
  { report: 'latest-resources.json', budgets: 'budgets.resources.json', cross: false, assertWhenPartial: true },
];

interface ReportRow {
  id: string;
  samples: number[];
  details: (Record<string, number | string | boolean> | null)[];
}
interface Report {
  cpuRates: number[];
  passesPerRate: number;
  rows: ReportRow[];
  passes: { cpuRate: number; pass: number; abortedAt: string | null; problems: string[] }[];
}

it('replays reports through the new core', () => {
  const log: string[] = [];
  for (const spec of specs) {
    const report: Report = JSON.parse(readFileSync(`${reportsDir}/${spec.report}`, 'utf8'));
    const passes: PerfReportPass[] = report.passes.map((meta) => {
      const samples = new Map<string, PerfSample>();
      for (const row of report.rows) {
        if (rowRate(row.id) !== meta.cpuRate) continue;
        const index = meta.pass - 1;
        if (index >= row.samples.length) continue;
        const detail = row.details[index];
        samples.set(row.id, detail ? { value: row.samples[index], detail } : { value: row.samples[index] });
      }
      return { cpuRate: meta.cpuRate, pass: meta.pass, samples, problems: meta.problems, abortedAt: meta.abortedAt };
    });
    const core = buildPerfReportCore({
      budgets: loadPerfBudgets(`${store}/${spec.budgets}`),
      passes,
      cpuRates: report.cpuRates,
      passesPerRate: report.passesPerRate,
      assertWhenPartial: spec.assertWhenPartial,
      ...(spec.cross ? { crossRateMetrics } : {}),
    });
    log.push(`== ${spec.report}: complete ${core.complete}, failures ${core.failures.length}`);
    for (const failure of core.failures) log.push(failure);
  }
  writeFileSync(process.env.REPLAY_OUT ?? '/dev/stdout', `${log.join('\n')}\n`);
  expect(log.length).toBeGreaterThan(0);
});
