import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input, Textarea } from '~/components/ui/Input';

const APP_CSS_PATH = resolve(__dirname, '../../styles/app.css');
const OVERLAY_SELECTOR = '.audio-preview-overlay-button';
const OFF_PALETTE_TEAL = 'rgba(19, 217, 204';

interface OverlayCssRule {
  selector: string;
  body: string;
}

function overlayCssRulesOf(css: string): OverlayCssRule[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: OverlayCssRule[] = [];
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (match[1] ?? '').trim();
    if (selector.includes(OVERLAY_SELECTOR)) {
      rules.push({ selector, body: match[2] ?? '' });
    }
  }
  return rules;
}

function boxShadowOf(body: string): string {
  return body.match(/box-shadow\s*:([^;]*);/)?.[1]?.trim() ?? '';
}

describe('SABA-B-4 stage 2 fix-up (D-29z168, R101/R102)', () => {
  it('IE1: an Input with an error marks its field aria-invalid="true"', () => {
    const view = render(<Input label="Email" error="Email is required" />);
    expect(view.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true');
  });

  it('IE2: an Input without an error has no aria-invalid attribute', () => {
    const view = render(<Input label="Email" />);
    expect(view.getByLabelText('Email').hasAttribute('aria-invalid')).toBe(false);
  });

  it('IE3: a caller aria-invalid wins over the error-derived value', () => {
    const view = render(<Input label="Email" error="x" aria-invalid={false} />);
    expect(view.getByLabelText('Email').getAttribute('aria-invalid')).toBe('false');
  });

  it('IE4: Textarea marks aria-invalid only when it has an error, and a caller value wins', () => {
    const withError = render(<Textarea label="Message" error="Message is required" />);
    expect(withError.getByLabelText('Message').getAttribute('aria-invalid')).toBe('true');
    withError.unmount();
    const withoutError = render(<Textarea label="Message" />);
    expect(withoutError.getByLabelText('Message').hasAttribute('aria-invalid')).toBe(false);
    withoutError.unmount();
    const callerWins = render(<Textarea label="Message" error="x" aria-invalid={false} />);
    expect(callerWins.getByLabelText('Message').getAttribute('aria-invalid')).toBe('false');
  });

  it('PB1: the overlay preview button rest and hover shadows use the background token, not teal', () => {
    const rules = overlayCssRulesOf(readFileSync(APP_CSS_PATH, 'utf8'));
    for (const selector of [OVERLAY_SELECTOR, `${OVERLAY_SELECTOR}:hover`]) {
      const matching = rules.filter((rule) => rule.selector === selector);
      expect(matching, selector).toHaveLength(1);
      const body = matching[0]?.body ?? '';
      expect(body, selector).not.toContain(OFF_PALETTE_TEAL);
      expect(boxShadowOf(body), selector).toContain('var(--color-background)');
      expect(boxShadowOf(body), selector).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
    }
  });

  it('PB2: the overlay preview button has no own :focus or :focus-visible rule', () => {
    const rules = overlayCssRulesOf(readFileSync(APP_CSS_PATH, 'utf8'));
    const focusRules = rules.filter((rule) => rule.selector.includes(':focus'));
    expect(focusRules.map((rule) => rule.selector)).toStrictEqual([]);
  });
});
