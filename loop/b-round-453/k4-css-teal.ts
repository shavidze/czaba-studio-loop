import { resolve } from 'node:path';
import { countTealHits, hitsByFile, STYLE_SOURCE_EXTENSIONS } from '/home/runner/czaba-project/store/app/lib/__tests__/helpers/style-scan';
const root = resolve(process.env.STORE_ROOT ?? '/home/runner/czaba-project/store', 'app');
console.log(JSON.stringify(hitsByFile(root, STYLE_SOURCE_EXTENSIONS, countTealHits)));
