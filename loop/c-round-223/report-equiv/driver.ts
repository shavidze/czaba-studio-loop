type Budget = {
  id: string;
  scenario: string;
  metric: string;
  unit: string;
  kind: 'deterministic' | 'wallclock';
  mode: 'assert' | 'record';
  budget: { op: '<' | '<=' | '==' | '>=' | '>'; value: number } | null;
  owner: string;
  note: string;
};
type Sample = { value: number; detail?: Record<string, number | string | boolean> };

const variants = ['head', 'new', 'mutA', 'mutB', 'mutC'];
const specs = ['studio-lab', 'studio-lab-interactions', 'studio-lab-resources'];
const metrics = ['components-per-commit', 'commits', 'page-0'];

const row = (id: string, metric: string, kind: Budget['kind'], mode: Budget['mode'], limit: number | null): Budget => ({
  id,
  scenario: 's',
  metric,
  unit: 'n',
  kind,
  mode,
  budget: limit === null ? null : { op: '<=', value: limit },
  owner: 'o',
  note: `note ${id}`,
});

function budgetsFor(): Budget[] {
  const out: Budget[] = [];
  for (const metric of metrics) {
    out.push(row(`d.${metric}`, metric, 'deterministic', 'record', null));
    out.push(row(`d.${metric}.6x`, metric, 'deterministic', 'record', null));
    out.push(row(`w.${metric}`, metric, 'wallclock', 'record', null));
  }
  out.push(row('a.limit', 'latency', 'wallclock', 'assert', 10));
  out.push(row('a.limit.6x', 'latency', 'wallclock', 'assert', 10));
  return out;
}

type Plan = (rate: number, pass: number) => Map<string, Sample>;

function makePass(rate: number, pass: number, samples: Map<string, Sample>, extra: Partial<{ problems: string[]; abortedAt: string | null }> = {}) {
  return {
    cpuRate: rate,
    pass,
    samples,
    problems: extra.problems ?? [],
    abortedAt: extra.abortedAt ?? null,
    pageErrors: 0,
    reactRenderer: '18.3.1',
    innerWidth: 1440,
    stepMs: { load: 1 },
  };
}

const basic: Plan = (rate) => {
  const sfx = rate === 1 ? '' : '.6x';
  const m = new Map<string, Sample>();
  for (const metric of metrics) {
    m.set(`d.${metric}${sfx}`, { value: 5, detail: { k: 1 } });
    m.set(`w.${metric}`, { value: 3 });
  }
  m.set(`a.limit${sfx}`, { value: 4 });
  return m;
};

function allPasses(plan: Plan, count = 6) {
  const passes = [];
  for (const rate of [1, 6]) for (let p = 1; p <= 3; p += 1) passes.push(makePass(rate, p, plan(rate, p)));
  return passes.slice(0, count);
}

const cases: Record<string, () => { passes: ReturnType<typeof makePass>[]; guard: string[] }> = {
  complete: () => ({ passes: allPasses(basic), guard: [] }),
  abortedShort: () => {
    const passes = allPasses(basic);
    const p = passes[4];
    p.abortedAt = 'clip click';
    p.problems = ['aborted at clip click: x'];
    p.samples.delete('d.commits.6x');
    p.samples.delete('a.limit.6x');
    return { passes, guard: [] };
  },
  partialAssertOver: () => ({
    passes: allPasses((rate, pass) => {
      const m = basic(rate, pass);
      m.set(rate === 1 ? 'a.limit' : 'a.limit.6x', { value: 50 });
      return m;
    }, 2),
    guard: [],
  }),
  crossRateMismatch: () => ({
    passes: allPasses((rate, pass) => {
      const m = basic(rate, pass);
      if (rate === 6) for (const metric of metrics) m.set(`d.${metric}.6x`, { value: 40 });
      return m;
    }),
    guard: [],
  }),
  guardProblem: () => ({ passes: allPasses(basic), guard: ['route guard: studio-guard served audio'] }),
  wallclockDeterministicMetric: () => ({
    passes: allPasses((rate, pass) => {
      const m = basic(rate, pass);
      for (const metric of metrics) m.set(`w.${metric}`, { value: [1, 20, 60][pass - 1] });
      return m;
    }),
    guard: [],
  }),
  unbudgetedId: () => ({
    passes: allPasses((rate, pass) => {
      const m = basic(rate, pass);
      m.set('no.such.row', { value: 1 });
      return m;
    }),
    guard: [],
  }),
};

const strip = (r: Record<string, unknown>): string => {
  const { startedAt: _s, finishedAt: _f, durationMs: _d, ...rest } = r;
  return JSON.stringify(rest);
};

async function main(): Promise<void> {
  const root = process.argv[2];
  const out: Record<string, Record<string, Record<string, string>>> = {};
  for (const v of variants) {
    out[v] = {};
    for (const spec of specs) {
      const mod = await import(`${root}/${v}/perf/${spec}.perf.spec.ts`);
      out[v][spec] = {};
      for (const [name, make] of Object.entries(cases)) {
        const { passes, guard } = make();
        const report = mod.__build(budgetsFor(), passes, new Date(0), 'chromium-x', guard);
        out[v][spec][name] = strip(report);
      }
    }
  }
  let equal = 0;
  let total = 0;
  const lines: string[] = [];
  for (const spec of specs) {
    for (const name of Object.keys(cases)) {
      total += 1;
      const same = out.head[spec][name] === out.new[spec][name];
      if (same) equal += 1;
      const failures = JSON.parse(out.head[spec][name]).failures.length;
      lines.push(`NEW  ${spec.padEnd(26)} ${name.padEnd(30)} ${same ? 'EQUAL' : 'DIFF'} (head failures=${failures})`);
    }
  }
  for (const m of ['mutA', 'mutB', 'mutC']) {
    for (const spec of specs) {
      for (const name of Object.keys(cases)) {
        if (out.head[spec][name] !== out[m][spec][name]) {
          lines.push(`${m} RED ${spec} ${name}`);
        }
      }
    }
    if (!lines.some((l) => l.startsWith(`${m} RED`))) lines.push(`${m} STAYED GREEN`);
  }
  lines.push(`SUMMARY new==head ${equal}/${total}`);
  console.log(lines.join('\n'));
  console.log('SAMPLE head 1b-ii partialAssertOver failures:', JSON.parse(out.head['studio-lab-resources'].partialAssertOver).failures);
  console.log('SAMPLE head 1a crossRateMismatch failures:', JSON.parse(out.head['studio-lab'].crossRateMismatch).failures);
  console.log('SAMPLE head 1b-i wallclockDeterministicMetric failures:', JSON.parse(out.head['studio-lab-interactions'].wallclockDeterministicMetric).failures);
  process.exitCode = equal === total ? 0 : 1;
}

void main();
