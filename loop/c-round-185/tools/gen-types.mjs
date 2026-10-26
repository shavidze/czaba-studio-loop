import fs from 'node:fs';
const B='http://127.0.0.1:5199';
const list=await (await fetch(B+'/api/products?pageSize=100')).json();
let s=`import type { Product } from '/home/runner/czaba-project/store/app/services/api/client';\n`;
s+=`interface ApiResponse<T> { data: T; success: boolean; message?: string; errors?: string[]; }\ninterface PagedResult<T> { items: T[]; totalCount: number; pageNumber: number; pageSize: number; }\n`;
s+=`export const list: ApiResponse<PagedResult<Product>> = ${JSON.stringify(list,null,1)};\n`;
for (const p of list.data.items){const r=await (await fetch(B+'/api/products/handle/'+p.handle)).json();s+=`export const h_${p.id}: ApiResponse<Product> = ${JSON.stringify(r,null,1)};\n`;}
fs.writeFileSync(process.argv[2],s);
