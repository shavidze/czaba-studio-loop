import { isWithinBudget, type PerfBudgetLimit, type PerfBudgetRow } from './budgets';
import { determinismContract } from './determinism';
import { median } from './stats';

export interface PerfSample {
  value: number;
  detail?: Record<string, number | string | boolean>;
}

export interface PerfReportPass {
  cpuRate: number;
  pass: number;
  samples: ReadonlyMap<string, PerfSample>;
  problems: readonly string[];
  abortedAt: string | null;
}

export interface PerfReportRow extends PerfBudgetRow {
  samples: number[];
  details: (Record<string, number | string | boolean> | null)[];
  median: number | null;
  min: number | null;
  max: number | null;
  withinBudget: boolean | null;
  pass: boolean | null;
}

export interface PerfReportCore {
  complete: boolean;
  failures: string[];
  rows: PerfReportRow[];
}

export interface PerfReportCoreOptions {
  budgets: readonly PerfBudgetRow[];
  passes: readonly PerfReportPass[];
  cpuRates: readonly number[];
  passesPerRate: number;
  assertWhenPartial: boolean;
  crossRateMetrics?: ReadonlySet<string>;
  guardProblems?: readonly string[];
}

export const rateSuffix = /\.\d+x$/;

export const formatLimit = (limit: PerfBudgetLimit | null): string =>
  limit ? `${limit.op} ${limit.value}` : '—';

export const rowRate = (id: string): number => Number(rateSuffix.exec(id)?.[0].slice(1, -1) ?? 1);

export function rateRowId(base: string, cpuRate: number): string {
  return cpuRate === 1 ? base : `${base}.${cpuRate}x`;
}

const allEqual = (values: readonly number[]): boolean =>
  values.every((value) => value === values[0]);

function detailNumbers(samples: readonly PerfSample[], key: string): number[] | null {
  const numbers: number[] = [];
  for (const sample of samples) {
    const value = sample.detail?.[key];
    if (typeof value !== 'number') return null;
    numbers.push(value);
  }
  return numbers;
}

function determinismFailure(row: PerfBudgetRow, samples: readonly PerfSample[]): string | null {
  if (row.kind !== 'deterministic') return null;
  const contract = determinismContract(row);
  if (contract === null) {
    return `no determinism contract ${row.id}: metric ${row.metric}, unit ${row.unit}`;
  }
  const values = samples.map((sample) => sample.value);
  switch (contract.kind) {
    case 'exact':
      return allEqual(values) ? null : `nondeterministic count ${row.id}: [${values.join(', ')}]`;
    case 'tenths': {
      if (values.length === 0) return null;
      const spread = Math.round(Math.max(...values) * 10) - Math.round(Math.min(...values) * 10);
      return spread > 5
        ? `nondeterministic MiB ${row.id}: [${values.join(', ')}] (spread over 0.1)`
        : null;
    }
    case 'ratio': {
      if (samples.length === 0) return null;
      for (const [numeratorKey, denominatorKey] of contract.pairs) {
        const numerators = detailNumbers(samples, numeratorKey);
        const denominators = detailNumbers(samples, denominatorKey);
        if (numerators === null || denominators === null) continue;
        if (allEqual(numerators) && allEqual(denominators)) return null;
        return `nondeterministic ratio ${row.id}: numerators [${numerators.join(', ')}], denominators [${denominators.join(', ')}]`;
      }
      const needed = contract.pairs.map(
        ([numerator, denominator]) => `${numerator}/${denominator}`,
      );
      return `ratio detail missing ${row.id}: needs one of ${needed.join(', ')}`;
    }
  }
}

export function buildPerfReportCore(options: PerfReportCoreOptions): PerfReportCore {
  const { budgets, passes, cpuRates, passesPerRate } = options;
  const complete = passes.length === cpuRates.length * passesPerRate;
  const failures: string[] = [
    ...(options.guardProblems ?? []),
    ...passes.flatMap((pass) =>
      pass.problems.map((problem) => `${pass.cpuRate}x pass ${pass.pass}: ${problem}`),
    ),
  ];
  const samplesById = new Map<string, PerfSample[]>();
  for (const pass of passes) {
    for (const [id, sample] of pass.samples) {
      samplesById.set(id, [...(samplesById.get(id) ?? []), sample]);
    }
  }
  const budgetIds = new Set(budgets.map((row) => row.id));
  for (const id of samplesById.keys()) {
    if (!budgetIds.has(id)) failures.push(`measured row without a budget row: ${id}`);
  }

  const abortedRates = new Set(
    passes.filter((pass) => pass.abortedAt !== null).map((pass) => pass.cpuRate),
  );
  let shortByAbort = 0;
  const medians = new Map<string, number>();
  const rows = budgets.map((row): PerfReportRow => {
    const samples = samplesById.get(row.id) ?? [];
    const values = samples.map((sample) => sample.value);
    if (complete && values.length !== passesPerRate) {
      if (abortedRates.has(rowRate(row.id))) {
        shortByAbort += 1;
      } else {
        failures.push(`row not measured ${passesPerRate} times: ${row.id} (${values.length})`);
      }
    }
    const rowMedian = median(values);
    if (values.length > 0) medians.set(row.id, rowMedian);
    const withinBudget = row.budget && values.length ? isWithinBudget(rowMedian, row.budget) : null;
    const passed = row.mode === 'assert' ? withinBudget === true : null;
    const assertReported = complete || (options.assertWhenPartial && values.length > 0);
    if (assertReported && passed === false) {
      failures.push(
        `assert failed ${row.id}: measured median ${rowMedian} [${values.join(', ')}], budget ${formatLimit(row.budget)}`,
      );
    }
    const determinism = determinismFailure(row, samples);
    if (determinism !== null) failures.push(determinism);
    return {
      ...row,
      samples: values,
      details: samples.map((sample) => sample.detail ?? null),
      median: values.length ? rowMedian : null,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
      withinBudget,
      pass: passed,
    };
  });
  if (shortByAbort > 0) {
    failures.push(`${shortByAbort} rows short of ${passesPerRate} samples because a pass aborted`);
  }
  const crossRateMetrics = options.crossRateMetrics;
  if (crossRateMetrics) {
    for (const row of budgets) {
      if (!crossRateMetrics.has(row.metric) || rateSuffix.test(row.id)) continue;
      for (const cpuRate of cpuRates.filter((rate) => rate !== 1)) {
        const other = medians.get(`${row.id}.${cpuRate}x`);
        const base = medians.get(row.id);
        if (other === undefined || base === undefined) continue;
        if (base !== other) {
          failures.push(`nondeterministic count ${row.id}: 1x ${base} vs ${cpuRate}x ${other}`);
        }
      }
    }
  }
  return { complete, failures, rows };
}
