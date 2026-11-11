import { resolve } from 'node:path';
export default { resolve: { alias: { '~': resolve(process.env.STORE_ROOT, 'app') } } };
