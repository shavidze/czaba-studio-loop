import { readFileSync } from 'node:fs';

export type PerfBudgetKind = 'deterministic' | 'wallclock';
export type PerfBudgetMode = 'assert' | 'record';
export type PerfBudgetOperator = '<' | '<=' | '==' | '>=' | '>';

export interface PerfBudgetLimit {
  op: PerfBudgetOperator;
  value: number;
}

export interface PerfBudgetRow {
  id: string;
  scenario: string;
  metric: string;
  unit: string;
  kind: PerfBudgetKind;
  mode: PerfBudgetMode;
  budget: PerfBudgetLimit | null;
  owner: string;
  note: string;
}

const operators: readonly PerfBudgetOperator[] = ['<', '<=', '==', '>=', '>'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(row: Record<string, unknown>, key: string, index: number): string {
  const value = row[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`budgets[${index}].${key} must be a non-empty string`);
  }
  return value;
}

function readOperator(value: unknown, index: number): PerfBudgetOperator {
  const match = operators.find((operator) => operator === value);
  if (match === undefined)
    throw new Error(`budgets[${index}].budget.op is not one of ${operators}`);
  return match;
}

function readLimit(value: unknown, index: number): PerfBudgetLimit | null {
  if (value === null) return null;
  if (!isRecord(value) || typeof value.value !== 'number') {
    throw new Error(`budgets[${index}].budget must be null or { op, value: number }`);
  }
  return { op: readOperator(value.op, index), value: value.value };
}

function readRow(value: unknown, index: number): PerfBudgetRow {
  if (!isRecord(value)) throw new Error(`budgets[${index}] must be an object`);
  const kind = value.kind;
  const mode = value.mode;
  if (kind !== 'deterministic' && kind !== 'wallclock') {
    throw new Error(`budgets[${index}].kind must be deterministic or wallclock`);
  }
  if (mode !== 'assert' && mode !== 'record') {
    throw new Error(`budgets[${index}].mode must be assert or record`);
  }
  const budget = readLimit(value.budget, index);
  const id = readString(value, 'id', index);
  if (mode === 'assert' && budget === null) {
    throw new Error(`budgets[${index}] (${id}) is an assert row without a budget`);
  }
  const row: PerfBudgetRow = {
    id,
    scenario: readString(value, 'scenario', index),
    metric: readString(value, 'metric', index),
    unit: readString(value, 'unit', index),
    kind,
    mode,
    budget,
    owner: readString(value, 'owner', index),
    note: typeof value.note === 'string' ? value.note : '',
  };
  return row;
}

export function loadPerfBudgets(filePath: string): PerfBudgetRow[] {
  const parsed: unknown = JSON.parse(readFileSync(filePath, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error(`${filePath} must contain a JSON array`);
  const rows = parsed.map((value, index) => readRow(value, index));
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) throw new Error(`duplicate budget row ${row.id}`);
    seen.add(row.id);
  }
  return rows;
}

export function isWithinBudget(value: number, limit: PerfBudgetLimit): boolean {
  switch (limit.op) {
    case '<':
      return value < limit.value;
    case '<=':
      return value <= limit.value;
    case '==':
      return value === limit.value;
    case '>=':
      return value >= limit.value;
    case '>':
      return value > limit.value;
  }
}
