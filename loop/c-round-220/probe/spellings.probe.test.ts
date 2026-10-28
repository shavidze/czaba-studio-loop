import { classifyLicenseExpression } from '/home/runner/czaba-project/store/app/lib/third-party-licenses';
const ids = ['GPLv3','GPLv2','GPL2','AGPLv3','GPL-3.0-or-later','GPL v3','LicenseRef-Proprietary','Proprietary','Commercial','LGPL-2.1','LGPLv3','(MIT OR GPLv3)','MIT AND GPLv2','SSPL-1.0','EUPL-1.2','OSL-3.0','CC-BY-NC-4.0','BUSL-1.1','GPLv2+','LGPL-2.1-only','licenseref-foo','GPLv','GPL.3'];
test('probe', () => { const out = Object.fromEntries(ids.map((i) => [i, classifyLicenseExpression(i)])); console.log('PROBE ' + JSON.stringify(out)); });
