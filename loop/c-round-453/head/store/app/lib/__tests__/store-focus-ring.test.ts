// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '../..');
const APP_CSS = 'styles/app.css';
const ROOT_PATH = 'root.tsx';
const STUDIO_WORKSPACE_PATH = 'components/arrangement/StudioWorkspace.tsx';
const FOCUS_SOURCE_PATH = 'lib/focus-source.ts';
const VIDEO_SYNC_PATH = 'components/recordings/SfxVideoSync.tsx';
const PRODUCT_CARD_PATH = 'components/product/ProductCard.tsx';
const FOCUS_SOURCE_CALL = 'useFocusSourceAttribute(';
const POINTER_RULE_SELECTOR = 'html[data-focus-source="pointer"] :focus-visible';
const EXPECTED_FOCUS_SELECTORS: ReadonlyArray<string> = [':focus-visible', POINTER_RULE_SELECTOR];
const RETIRED_FOCUS_SELECTORS: ReadonlyArray<string> = [
  '.sort-select:focus',
  '.newsletter-input-large:focus',
  '.glass-input:focus',
];
const MIN_SCANNED_SOURCES = 200;

const GRANTED_STORE_SOURCES: ReadonlyArray<string> = [
  'components/cart/GiftCardInput.tsx',
  'components/chat/ChatButton.tsx',
  'components/chat/ChatInput.tsx',
  'components/chat/GuestForm.tsx',
  'components/home/NewsletterSection.tsx',
  'components/marketing/LeadMagnetPopup.tsx',
  'components/product/ProductAccordion.tsx',
  'components/product/ProductCard.tsx',
  'components/product/VersionSelector.tsx',
  'components/recordings/RecordingCatalogRow.tsx',
  'components/recordings/SfxQuickEdit.tsx',
  'components/recordings/SfxSceneBuilder.tsx',
  'components/recordings/SfxSceneExport.tsx',
  'components/recordings/SfxSoundLibrary.tsx',
  'components/recordings/SfxVideoSync.tsx',
  'components/studio/ExportDialog.tsx',
  'components/studio/VideoUploadZone.tsx',
  'components/ui/Button.tsx',
  'components/ui/IconButton.tsx',
  'components/ui/Input.tsx',
  'root.tsx',
  'routes/account.tsx',
  'routes/cart.tsx',
  'routes/free-downloads.tsx',
  'routes/gift-cards.tsx',
  'routes/hire-us.tsx',
  'routes/recordings.$productId.tsx',
  'routes/scenes.$productId.tsx',
  'routes/store.tsx',
];

const FOCUS_VARIANT_PATTERN =
  /^(focus|focus-visible|focus-within|group-focus(-visible|-within)?(\/[\w-]+)?|peer-focus-visible(\/[\w-]+)?|has-\[:focus[\w-]*\])$/;
const ARBITRARY_FOCUS_VARIANT_PATTERN = /^\[&:focus(-visible|-within)?\]$/;
const BARE_OUTLINE_RESETS: ReadonlyArray<string> = ['outline-none', 'outline-hidden', 'outline-0'];
const INDICATOR_KIND_PATTERN = /^-?(ring|ring-offset|outline|border|bg|shadow)(-|$)/;
const ARBITRARY_INDICATOR_PROPERTY_PATTERN = /^\[(outline|box-shadow|border|background)[\w-]*:/;

function readAppSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function isExcludedFromStoreScan(path: string): boolean {
  return (
    path.startsWith('components/arrangement/') ||
    path.startsWith('lib/arrangement/') ||
    path === 'routes/studio-lab.tsx' ||
    /\.test\.(ts|tsx)$/.test(path)
  );
}

function listAppSources(): string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== '__tests__') {
          walk(path);
        }
      } else if (/\.(ts|tsx)$/.test(entry)) {
        files.push(relative(APP_ROOT, path).split('\\').join('/'));
      }
    }
  };
  walk(APP_ROOT);
  return files.sort();
}

function listStoreSources(): string[] {
  return listAppSources().filter((path) => !isExcludedFromStoreScan(path));
}

function splitVariantChain(token: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of token) {
    if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
    }
    if (char === ':' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

function isFocusIndicatorToken(token: string): boolean {
  const parts = splitVariantChain(token);
  const utility = (parts.pop() ?? '').replace(/^!/, '');
  if (parts.length === 0) {
    return BARE_OUTLINE_RESETS.includes(utility);
  }
  if (
    !parts.some(
      (variant) =>
        FOCUS_VARIANT_PATTERN.test(variant) || ARBITRARY_FOCUS_VARIANT_PATTERN.test(variant),
    )
  ) {
    return false;
  }
  return INDICATOR_KIND_PATTERN.test(utility) || ARBITRARY_INDICATOR_PROPERTY_PATTERN.test(utility);
}

function focusIndicatorTokensOf(source: string): string[] {
  return source
    .split(/[\s'"`,;(){}]+/)
    .filter((token) => token.length > 0 && isFocusIndicatorToken(token));
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

interface CssRuleText {
  selector: string;
  body: string;
}

function cssRulesOf(css: string): CssRuleText[] {
  const source = stripCssComments(css);
  const rules: CssRuleText[] = [];
  const open: { rule: CssRuleText; bodyStart: number }[] = [];
  let segmentStart = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      const rule = { selector: source.slice(segmentStart, index).trim(), body: '' };
      rules.push(rule);
      open.push({ rule, bodyStart: index + 1 });
      segmentStart = index + 1;
    } else if (char === '}') {
      const closing = open.pop();
      if (closing) {
        closing.rule.body = source.slice(closing.bodyStart, index);
      }
      segmentStart = index + 1;
    } else if (char === ';') {
      segmentStart = index + 1;
    }
  }
  return rules;
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

interface JsxOpeningTag {
  text: string;
  end: number;
  selfClosing: boolean;
}

function jsxOpeningTagsOf(source: string, tag: string): JsxOpeningTag[] {
  const tags: JsxOpeningTag[] = [];
  const opener = new RegExp(`<${tag}(?=[\\s/>])`, 'g');
  for (const match of source.matchAll(opener)) {
    const start = match.index ?? 0;
    let depth = 0;
    let quote = '';
    for (let index = start + 1; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === '\\') {
          index += 1;
        } else if (char === quote) {
          quote = '';
        }
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
      } else if (char === '>' && depth === 0) {
        tags.push({
          text: source.slice(start, index + 1),
          end: index + 1,
          selfClosing: source[index - 1] === '/',
        });
        break;
      }
    }
  }
  return tags;
}

function hasClassToken(text: string, token: string): boolean {
  return new RegExp(`(^|[\\s:'"\`])${token}(?=[\\s'"\`]|$)`).test(text);
}

function hiddenTabbableInputsOf(source: string): string[] {
  return jsxOpeningTagsOf(source, 'input')
    .map((tag) => tag.text)
    .filter(
      (text) =>
        (hasClassToken(text, 'opacity-0') || hasClassToken(text, 'invisible')) &&
        !text.includes('tabIndex={-1}'),
    );
}

function hoverRevealWrappersOf(source: string): JsxOpeningTag[] {
  return jsxOpeningTagsOf(source, 'div').filter((tag) => {
    if (tag.selfClosing || !tag.text.includes('opacity-0 group-hover:opacity-100')) {
      return false;
    }
    const content = source.slice(tag.end, source.indexOf('</div>', tag.end));
    return content.includes('<AudioPreviewButton');
  });
}

describe('SABA-B-4 stage 2 — one store focus ring (D-29z166/D-29z167, R92–R100)', () => {
  it('STF1 walker: the store scan covers every granted store source and at least 200 files', () => {
    const files = listStoreSources();
    expect(files.length).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    for (const granted of GRANTED_STORE_SOURCES) {
      expect(files, granted).toContain(granted);
    }
    expect(files).not.toContain(STUDIO_WORKSPACE_PATH);
    expect(files.some((file) => file.includes('__tests__'))).toBe(false);
  });

  it('STF2: no store source carries a focus-variant ring, ring-offset, outline, border, bg or shadow token, and no bare outline-none', () => {
    const offenders: string[] = [];
    for (const file of listStoreSources()) {
      for (const token of focusIndicatorTokensOf(readAppSource(file))) {
        offenders.push(`${file}: ${token}`);
      }
    }
    expect(offenders).toStrictEqual([]);
  });

  it('STF3: app.css keeps only the global and pointer :focus-visible rules, and outline: none only inside the pointer rule', () => {
    const css = readAppSource(APP_CSS);
    const rules = cssRulesOf(css);
    const focusSelectors = rules
      .map((rule) => rule.selector)
      .filter((selector) => selector.includes(':focus'));
    expect(focusSelectors).toStrictEqual(EXPECTED_FOCUS_SELECTORS);
    const stripped = stripCssComments(css);
    expect(stripped.match(/outline\s*:\s*none/g) ?? []).toHaveLength(1);
    const pointerRule = rules.find((rule) => rule.selector === POINTER_RULE_SELECTOR);
    expect(pointerRule?.body ?? '').toMatch(/outline\s*:\s*none/);
    for (const retired of RETIRED_FOCUS_SELECTORS) {
      expect(stripped, retired).not.toContain(retired);
    }
  });

  it('STF4: useFocusSourceAttribute is called once, in root.tsx, and not in StudioWorkspace.tsx', () => {
    const callSites: Record<string, number> = {};
    for (const file of listAppSources()) {
      if (file === FOCUS_SOURCE_PATH || /\.test\.(ts|tsx)$/.test(file)) {
        continue;
      }
      const count = countOccurrences(readAppSource(file), FOCUS_SOURCE_CALL);
      if (count > 0) {
        callSites[file] = count;
      }
    }
    expect(callSites).toStrictEqual({ [ROOT_PATH]: 1 });
    expect(countOccurrences(readAppSource(STUDIO_WORKSPACE_PATH), 'useFocusSourceAttribute')).toBe(
      0,
    );
  });

  describe('STF5: scanner self-test', () => {
    it('flags focus indicator tokens in multi-line cn arrays, constants, template literals and bare outline-none', () => {
      const fixtures: ReadonlyArray<string> = [
        "cn([\n  'px-4',\n  'focus-visible:ring-2',\n  className,\n])",
        "const CHAT_FOCUS_CLASS = 'focus:outline-none';",
        ['const cls = `px-2 $', '{active ? "a" : "b"} hover:focus:ring-brand/20`;'].join(''),
        '<input className="w-full outline-none" />',
        '<input className="w-full outline-hidden" />',
        '<label className="inline-flex focus-within:ring-2">',
        'className="group-focus-visible:border-brand"',
        'className="peer-focus-visible:bg-brand/10"',
        'className="[&:focus]:outline-none"',
        'className="[&:focus-visible]:ring-2"',
        'className="[&:focus-within]:border-brand"',
        "className={cn('[&:focus]:shadow-lg')}",
        'className="[&:focus-visible]:outline-hidden"',
        'className="[&:focus]:outline-0"',
        'className="focus:[outline:none]"',
        'className="focus-visible:[box-shadow:0_0_0_2px_var(--color-brand)]"',
        'className="focus-within:[border-color:red]"',
        'className="[&:focus]:[background:none]"',
      ];
      for (const fixture of fixtures) {
        expect(focusIndicatorTokensOf(fixture), fixture).toHaveLength(1);
      }
    });

    it('passes peer-focus, non-focus rings, a class named ring and a focus-within reveal', () => {
      const fixtures: ReadonlyArray<string> = [
        'className="peer-focus:text-brand peer-focus:top-2"',
        "className={cn('ring-1 ring-inset ring-brand/50')}",
        'className="ring"',
        'className="opacity-0 group-hover:opacity-100 focus-within:opacity-100"',
        "className={cn('[--focus-offset:-2px]')}",
        'Keyboard focus: press Tab',
        'className="[&:hover]:bg-brand"',
        'className="[&:focus]:opacity-100"',
      ];
      for (const fixture of fixtures) {
        expect(focusIndicatorTokensOf(fixture), fixture).toStrictEqual([]);
      }
    });

    it('parses whole JSX opening tags across lines and arrow-function attributes', () => {
      const flagged =
        '<input\n  className="absolute inset-0 opacity-0"\n  onChange={(event) => {\n    if (event) run();\n  }}\n  type="file"\n/>';
      const arrowBeforeClass =
        '<input\n  onChange={(event) => {\n    if (event) run();\n  }}\n  className="absolute opacity-0"\n  type="file"\n/>';
      const honeypot =
        '<input type="text" name="website" tabIndex={-1} className="absolute opacity-0" />';
      expect(hiddenTabbableInputsOf(flagged)).toHaveLength(1);
      expect(hiddenTabbableInputsOf(arrowBeforeClass)).toHaveLength(1);
      expect(hiddenTabbableInputsOf(honeypot)).toStrictEqual([]);
      const wrapper =
        '<div className="hidden md:flex opacity-0 group-hover:opacity-100">\n  <AudioPreviewButton track={track} />\n</div>';
      expect(hoverRevealWrappersOf(wrapper)).toHaveLength(1);
    });
  });

  describe('STF6: hidden focusables', () => {
    it('(a) every store input hidden by opacity-0 or invisible is out of the tab order', () => {
      const offenders: string[] = [];
      for (const file of listStoreSources()) {
        for (const text of hiddenTabbableInputsOf(readAppSource(file))) {
          offenders.push(`${file}: ${text.replace(/\s+/g, ' ')}`);
        }
      }
      expect(offenders).toStrictEqual([]);
    });

    it('(b) SfxVideoSync: the file input is hidden and untabbable, and a visible "Choose video" button opens it', () => {
      const source = readAppSource(VIDEO_SYNC_PATH);
      const fileInputs = jsxOpeningTagsOf(source, 'input').filter((tag) =>
        tag.text.includes('type="file"'),
      );
      expect(fileInputs).toHaveLength(1);
      const fileInput = fileInputs[0]?.text ?? '';
      expect(fileInput).toContain('tabIndex={-1}');
      expect(fileInput).toContain('className="hidden"');
      expect(hasClassToken(fileInput, 'opacity-0')).toBe(false);
      const chooseButtons = jsxOpeningTagsOf(source, 'button').filter((tag) => {
        const content = source.slice(tag.end, source.indexOf('</button>', tag.end));
        return tag.text.includes('type="button"') && content.trim() === 'Choose video';
      });
      expect(chooseButtons).toHaveLength(1);
    });

    it('(c) ProductCard: the hover-only preview overlay is also revealed while its button has focus', () => {
      const wrappers = hoverRevealWrappersOf(readAppSource(PRODUCT_CARD_PATH));
      expect(wrappers).toHaveLength(1);
      expect(hasClassToken(wrappers[0]?.text ?? '', 'focus-within:opacity-100')).toBe(true);
    });
  });
});
