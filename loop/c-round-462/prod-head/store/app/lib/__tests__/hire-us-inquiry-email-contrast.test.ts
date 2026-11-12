// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { buildHireUsInquiryEmailHtml } from '../hire-us-inquiry-email.server';

const WCAG_AA_TEXT = 4.5;

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const [red = 0, green = 0, blue = 0] = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const [light, dark] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

function inlineColour(element: Element, property: 'color' | 'background-color'): string | null {
  const style = element.getAttribute('style') ?? '';
  const match = style.match(new RegExp(`(?:^|;)\\s*${property}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (match?.[1]) {
    return match[1].toLowerCase();
  }
  if (property === 'background-color') {
    return element.getAttribute('bgcolor')?.toLowerCase() ?? null;
  }
  return null;
}

function nearestColour(element: Element, property: 'color' | 'background-color'): string | null {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const value = inlineColour(node, property);
    if (value) {
      return value;
    }
  }
  return null;
}

function textElements(html: string): Element[] {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return [...document.body.querySelectorAll('*')].filter((element) =>
    [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
    ),
  );
}

const SAMPLE_HTML = buildHireUsInquiryEmailHtml({
  name: 'Nino Probe',
  email: 'nino@example.com',
  projectTypeLabel: 'Film/Video Scoring',
  budgetLabel: '$1,000 - $5,000',
  message: 'Line one.',
});

describe('hire-us inquiry e-mail contrast (STORE-2b-2b)', () => {
  it('HE8: every text element has its own inline colour and a painted background inside the e-mail', () => {
    const elements = textElements(SAMPLE_HTML);
    expect(elements).toHaveLength(12);
    const unpainted = elements
      .filter(
        (element) =>
          !nearestColour(element, 'color') || !nearestColour(element, 'background-color'),
      )
      .map((element) => element.textContent?.trim());
    expect(unpainted).toEqual([]);
  });

  it('HE9: every text element meets WCAG AA 4.5:1 against its nearest painted background', () => {
    const failing = textElements(SAMPLE_HTML)
      .map((element) => {
        const foreground = nearestColour(element, 'color') ?? '#000000';
        const background = nearestColour(element, 'background-color') ?? '#ffffff';
        return { text: element.textContent?.trim(), ratio: contrastRatio(foreground, background) };
      })
      .filter((row) => row.ratio < WCAG_AA_TEXT);
    expect(failing).toEqual([]);
  });
});
