import { afterEach, describe, expect, it } from 'vitest';
import { readRouteName } from '~/lib/route-name';

afterEach(() => {
  document.title = '';
  document.body.innerHTML = '';
});

describe('readRouteName (CLIENT-NAV-CONTRACT)', () => {
  it('RN1 prefers the trimmed document title over the page heading', () => {
    document.title = '  FAQ | CZABA  ';
    document.body.innerHTML =
      '<div class="page-transition-wrapper"><h1>Frequently Asked Questions</h1></div>';
    expect(readRouteName(document)).toBe('FAQ | CZABA');
  });

  it('RN2 falls back to the first heading inside the page wrapper when the title is empty', () => {
    document.title = '';
    document.body.innerHTML =
      '<h1>Outside</h1><div class="page-transition-wrapper"><h1> My Orders </h1><h1>Second</h1></div>';
    expect(readRouteName(document)).toBe('My Orders');
  });

  it('RN3 returns an empty name when there is no title and no heading in the wrapper', () => {
    document.title = '';
    document.body.innerHTML = '<h1>Outside</h1><div class="page-transition-wrapper"><p>x</p></div>';
    expect(readRouteName(document)).toBe('');
  });
});
