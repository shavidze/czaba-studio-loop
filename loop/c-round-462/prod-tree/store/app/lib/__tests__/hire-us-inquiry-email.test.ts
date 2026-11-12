// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildHireUsInquiryEmailHtml,
  HIRE_US_INQUIRY_EMAIL_PALETTE,
  type HireUsInquiryEmailFields,
} from '../hire-us-inquiry-email.server';

const APP_CSS_PATH = resolve(__dirname, '../../styles/app.css');
const HEX_COLOUR = /#[0-9a-f]{3,8}\b/gi;
const TEAL_PATTERN =
  /teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\b|rgba?\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\)|hsla?\( ?17[0-9][ ,][^)]*\)/i;

const SAMPLE_FIELDS: HireUsInquiryEmailFields = {
  name: 'Nino Probe',
  email: 'nino@example.com',
  projectTypeLabel: 'Film/Video Scoring',
  budgetLabel: '$1,000 - $5,000',
  message: 'Line one.\nLine two.',
};

interface SentBrevoEmail {
  subject: string;
  htmlContent: string;
}

function isSentBrevoEmail(value: unknown): value is SentBrevoEmail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'subject' in value &&
    typeof value.subject === 'string' &&
    'htmlContent' in value &&
    typeof value.htmlContent === 'string'
  );
}

function themeTokenValue(token: string): string | undefined {
  const css = readFileSync(APP_CSS_PATH, 'utf8');
  const themeStart = css.indexOf('@theme {');
  const themeBlock = css.slice(themeStart, css.indexOf('\n}', themeStart));
  const match = themeBlock.match(new RegExp(`--color-${token}:\\s*(#[0-9a-f]{6})\\b`, 'i'));
  return match?.[1]?.toLowerCase();
}

function hireUsForm(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value);
  }
  return form;
}

async function submitHireUsAction(form: FormData) {
  const { action } = await import('../../routes/hire-us');
  return action({
    request: new Request('http://localhost/hire-us', { method: 'POST', body: form }),
    params: {},
    context: {},
  });
}

function stubBrevoFetch(): unknown[] {
  const sent: unknown[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: { body: string }) => {
      sent.push(JSON.parse(init.body));
      return new Response('{}', { status: 201 });
    }),
  );
  return sent;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('hire-us inquiry e-mail (STORE-2b-2b)', () => {
  it('HE1: every palette hex equals its @theme token value in app.css', () => {
    const entries = Object.entries(HIRE_US_INQUIRY_EMAIL_PALETTE);
    expect(entries).toHaveLength(6);
    for (const [token, hex] of entries) {
      expect(themeTokenValue(token), token).toBe(hex);
    }
  });

  it('HE2: the e-mail uses only palette colours and no teal', () => {
    const html = buildHireUsInquiryEmailHtml(SAMPLE_FIELDS);
    const palette = new Set<string>(Object.values(HIRE_US_INQUIRY_EMAIL_PALETTE));
    const used = [...html.matchAll(HEX_COLOUR)].map((match) => match[0].toLowerCase());
    expect(used.length).toBeGreaterThanOrEqual(10);
    expect(used.filter((hex) => !palette.has(hex))).toEqual([]);
    expect(TEAL_PATTERN.test(html)).toBe(false);
  });

  it('HE3: the outer presentation table paints the background with bgcolor and background-color', () => {
    const html = buildHireUsInquiryEmailHtml(SAMPLE_FIELDS).trimStart();
    const background = HIRE_US_INQUIRY_EMAIL_PALETTE.background;
    expect(html.startsWith('<table role="presentation"')).toBe(true);
    const openingTable = html.slice(0, html.indexOf('>') + 1);
    expect(openingTable).toContain(`bgcolor="${background}"`);
    expect(openingTable).toContain(`background-color: ${background};`);
  });

  it('HE4: every user-supplied field is HTML-escaped', () => {
    const payload = `<script>alert("x")</script>'&`;
    const escaped = '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&#39;&amp;';
    const html = buildHireUsInquiryEmailHtml({
      name: `n${payload}`,
      email: `e${payload}`,
      projectTypeLabel: `p${payload}`,
      budgetLabel: `b${payload}`,
      message: `m${payload}`,
    });
    expect(html).not.toContain('<script');
    for (const prefix of ['n', 'e', 'p', 'b', 'm']) {
      expect(html, prefix).toContain(`${prefix}${escaped}`);
    }
    expect(html).toContain(`href="mailto:e${escaped}"`);
  });

  it('HE5: the hire-us action sends the builder output for the submitted form', async () => {
    vi.stubEnv('BREVO_API_KEY', 'test-key');
    const sent = stubBrevoFetch();
    const response = await submitHireUsAction(
      hireUsForm({
        name: 'Nino <b>Probe</b>',
        email: 'nino@example.com',
        projectType: 'film',
        budget: '1000-5000',
        message: 'Line one. Line two.',
      }),
    );
    expect(response.status).toBe(200);
    expect(sent).toHaveLength(1);
    const body = sent[0];
    expect(isSentBrevoEmail(body)).toBe(true);
    if (!isSentBrevoEmail(body)) {
      return;
    }
    expect(body.subject).toBe('🎬 New Project Inquiry: Film/Video Scoring');
    expect(body.htmlContent).toBe(
      buildHireUsInquiryEmailHtml({
        name: 'Nino <b>Probe</b>',
        email: 'nino@example.com',
        projectTypeLabel: 'Film/Video Scoring',
        budgetLabel: '$1,000 - $5,000',
        message: 'Line one. Line two.',
      }),
    );
  });

  it('HE6: unknown project type and budget fall back to General / Not specified as at HEAD', async () => {
    vi.stubEnv('BREVO_API_KEY', 'test-key');
    const sent = stubBrevoFetch();
    await submitHireUsAction(
      hireUsForm({ name: 'Nino', email: 'nino@example.com', message: 'Hello' }),
    );
    const body = sent[0];
    expect(isSentBrevoEmail(body)).toBe(true);
    if (!isSentBrevoEmail(body)) {
      return;
    }
    expect(body.subject).toBe('🎬 New Project Inquiry: General');
    expect(body.htmlContent.match(/>Not specified</g)).toHaveLength(2);
  });

  it('HE7 (characterisation): without a Brevo key the action refuses with 500 and sends nothing', async () => {
    vi.stubEnv('BREVO_API_KEY', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await submitHireUsAction(
      hireUsForm({ name: 'Nino', email: 'nino@example.com', message: 'Hello' }),
    );
    expect(response.status).toBe(500);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
