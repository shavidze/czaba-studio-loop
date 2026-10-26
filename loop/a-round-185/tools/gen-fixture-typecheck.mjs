import { writeFileSync } from 'node:fs';
const base = 'http://127.0.0.1:5199';
const out = process.argv[2];
const list = await (await fetch(`${base}/api/products?pageSize=100`)).json();
const lines = [
  "import type { Product } from '/home/runner/czaba-project/store/app/services/api/client';",
  'interface ApiResponse<T> { data: T; success: boolean; message?: string; errors?: string[]; }',
  'interface PagedResult<T> { items: T[]; totalCount: number; pageNumber: number; pageSize: number; }',
  `const list: ApiResponse<PagedResult<Product>> = ${JSON.stringify(list, null, 2)};`,
];
const names = ['list'];
for (const [i, p] of list.data.items.entries()) {
  const one = await (await fetch(`${base}/api/products/handle/${p.handle}`)).json();
  lines.push(`const handle${i}: ApiResponse<Product> = ${JSON.stringify(one, null, 2)};`);
  names.push(`handle${i}`);
}
lines.push(`export { ${names.join(', ')} };`, '');
writeFileSync(out, lines.join('\n'));
