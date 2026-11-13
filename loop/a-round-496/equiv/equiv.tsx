import React from "react";
import { renderToStaticMarkup } from 'react-dom/server';
import { Button as H } from './ButtonHead';
import { Button as N } from './ButtonNew';
const variants = ['primary','secondary','ghost','accent','buy','destructive'] as const;
const sizes = ['sm','md','lg'] as const;
let total = 0; let diff = 0;
for (const variant of variants) for (const size of sizes) for (const fullWidth of [false,true]) for (const disabled of [false,true]) for (const isLoading of [false,true]) for (const className of ['', 'x custom']) {
  const p = { variant, size, fullWidth, disabled, isLoading, className };
  const a = renderToStaticMarkup(<H {...p}>t</H>);
  const b = renderToStaticMarkup(<N {...p}>t</N>);
  total++; if (a !== b) { diff++; console.log('DIFF', JSON.stringify(p)); }
}
console.log(`combos=${total} diff=${diff}`);
