import { APP_ROOT, countZeroOffsetGlowHits, hitsByFile, SCRIPT_SOURCE_EXTENSIONS } from '/home/runner/czaba-project/store/app/lib/__tests__/helpers/style-scan';

const root = process.env.STORE_ROOT ? `${process.env.STORE_ROOT}/app` : APP_ROOT;
console.log(JSON.stringify(hitsByFile(root, SCRIPT_SOURCE_EXTENSIONS, countZeroOffsetGlowHits)));
