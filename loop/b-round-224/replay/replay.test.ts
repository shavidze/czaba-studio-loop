// @vitest-environment node
import { readFileSync, writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { loadPerfBudgets } from '/tmp/b225/perf/lib/budgets.ts';
import { buildPerfReportCore, rowRate } from '/tmp/b225/perf/lib/report.ts';

const S = '/tmp/b225';
const spec1a = readFileSync(`${S}/perf/studio-lab.perf.spec.ts`, 'utf8');
const crossBlock = /const crossRateMetrics = new Set\(\[([\s\S]*?)\]\);/.exec(spec1a)?.[1] ?? '';
const cross = new Set([...crossBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]));
const kinds: Record<string, { budgets: string; assertWhenPartial: boolean; cross?: Set<string> }> = {
  'PERF-1a': { budgets: 'perf/budgets.json', assertWhenPartial: false, cross },
  'PERF-1b-i': { budgets: 'perf/budgets.interactions.json', assertWhenPartial: false },
  'PERF-1b-ii': { budgets: 'perf/budgets.resources.json', assertWhenPartial: true },
};
const reports = (process.env.B225_REPORTS ?? '').split(',').filter(Boolean);
const out = process.env.B225_OUT ?? '/tmp/c224-replay/out.json';

it('replay', () => {
  const result: Record<string, unknown> = { cross: [...cross] };
  for (const file of reports) {
    const rep = JSON.parse(readFileSync(file, 'utf8'));
    const cfg = kinds[rep.harness];
    const budgets = loadPerfBudgets(`${S}/${cfg.budgets}`);
    const passes = rep.passes.map((p: { cpuRate: number; pass: number; abortedAt: string | null; problems: string[] }) => ({
      cpuRate: p.cpuRate, pass: p.pass, abortedAt: p.abortedAt, problems: p.problems, samples: new Map(),
    }));
    for (const row of rep.rows) {
      const rate = rowRate(row.id);
      const ofRate = passes.filter((p: { cpuRate: number }) => p.cpuRate === rate);
      row.samples.forEach((raw: number, i: number) => {
        const value = row.id === process.env.B225_NAN_ID && i === 1 ? Number.NaN : raw;
        const detail = row.details?.[i];
        ofRate[i].samples.set(row.id, detail === null || detail === undefined ? { value } : { value, detail });
      });
    }
    const core = buildPerfReportCore({ budgets, passes, cpuRates: rep.cpuRates, passesPerRate: rep.passesPerRate, assertWhenPartial: cfg.assertWhenPartial, crossRateMetrics: cfg.cross });
    result[file] = { harness: rep.harness, complete: core.complete, nFailures: core.failures.length, failures: core.failures, originalFailures: rep.failures };
  }
  writeFileSync(out, JSON.stringify(result, null, 1));
});
