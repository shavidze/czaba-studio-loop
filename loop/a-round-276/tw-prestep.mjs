import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { compile } = require('@tailwindcss/node');
const base = '/home/runner/czaba-project/store/app/styles';
const compiler = await compile('@import "tailwindcss/utilities";', { base, onDependency: () => {} });
const tokens = ['aria-disabled:*:opacity-40','aria-disabled:opacity-40','aria-disabled:cursor-not-allowed','not-aria-disabled:hover:bg-foreground/8','not-aria-disabled:active:bg-foreground/12'];
console.log(compiler.build(tokens));
