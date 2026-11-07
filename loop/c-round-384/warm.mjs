import { open } from '../c-round-382/lib.mjs';
const { browser } = await open(process.argv[2], 1440, 900); await browser.close(); console.log('warm ok');
