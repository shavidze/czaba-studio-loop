import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const STORE_LINK_FILES = [
  'app/components/layout/Footer.tsx',
  'app/components/common/CookieConsent.tsx',
  'app/components/home/ProductSection.tsx',
  'app/routes/privacy.tsx',
  'app/routes/terms.tsx',
  'app/routes/faq.tsx',
];

const EXPECTED_ROUTER_TARGETS: ReadonlyArray<readonly [string, string]> = [
  ['app/components/home/ProductSection.tsx', 'to={viewAllLink}'],
  ['app/routes/privacy.tsx', 'to="/cookies"'],
  ['app/routes/terms.tsx', 'to="/license"'],
  ['app/routes/faq.tsx', 'to="/hire-us"'],
];

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function openingTags(source: string, tagName: string): string[] {
  const tags: string[] = [];
  const pattern = new RegExp(`<${tagName}(?=[\\s>])`, 'g');
  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    let depth = 0;
    let quote = '';
    let end = match.index + match[0].length;
    for (; end < source.length; end++) {
      const char = source[end];
      if (quote) {
        if (char === quote) quote = '';
      } else if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
      } else if (char === '>' && depth === 0) {
        break;
      }
    }
    tags.push(source.slice(match.index, end + 1));
  }
  return tags;
}

function isInternalHref(tag: string): boolean {
  const literal = tag.match(/\bhref=["'](\/(?!\/)[^"']*)["']/);
  if (literal) return true;
  return /\bhref=\{(?:viewAllLink|ROUTES\.\w+)\}/.test(tag);
}

it('IL4 the persistent CookieConsent banner link keeps focus (no release handler)', () => {
  const tags = openingTags(readSource('app/components/common/CookieConsent.tsx'), 'Link');
  const privacy = tags.find((tag) => tag.includes('to="/privacy"'));
  expect(privacy).toBeDefined();
  expect(privacy ?? '').not.toContain('releaseLinkFocus');
});

describe('Store internal links use the router (DPG-FOOTER-LINKS)', () => {
  it.each(STORE_LINK_FILES)('IL1 %s has no <a> with an internal href', (path) => {
    const internalAnchors = openingTags(readSource(path), 'a').filter(isInternalHref);
    expect(internalAnchors).toEqual([]);
  });

  it.each(EXPECTED_ROUTER_TARGETS)('IL2 %s renders %s through Link', (path, target) => {
    const linkTags = openingTags(readSource(path), 'Link');
    const tag = linkTags.find((candidate) => candidate.includes(target));
    expect(tag).toBeDefined();
    expect(tag ?? '').toContain('onClick={releaseLinkFocus}');
  });

  it('IL3 the scanner reads a multi-line anchor with braces in its attributes', () => {
    const sample = '<a\n  className={cn("a", { b: true })}\n  href="/cookies"\n>x</a>';
    expect(openingTags(sample, 'a').filter(isInternalHref)).toHaveLength(1);
    expect(openingTags('<a href="mailto:x@y.z">m</a>', 'a').filter(isInternalHref)).toHaveLength(0);
    expect(
      openingTags('<a href="https://stripe.com/privacy">s</a>', 'a').filter(isInternalHref),
    ).toHaveLength(0);
  });
});
