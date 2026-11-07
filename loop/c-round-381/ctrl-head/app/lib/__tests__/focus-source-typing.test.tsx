import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installFocusSourceTracking, isFocusSourceFieldEditingKey } from '~/lib/focus-source';

interface KeyStroke {
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
}

const FIELD_EDITING_STROKES: ReadonlyArray<KeyStroke> = [
  { key: 'a' },
  { key: 'A', shiftKey: true },
  { key: ' ' },
  { key: 'Backspace' },
  { key: 'Delete' },
  { key: 'ArrowLeft' },
  { key: 'ArrowRight' },
  { key: 'Home' },
  { key: 'End' },
  { key: 'Process' },
  { key: 'Dead' },
];

const MULTILINE_EDITING_STROKES: ReadonlyArray<KeyStroke> = [
  { key: 'Enter' },
  { key: 'ArrowUp' },
  { key: 'ArrowDown' },
  { key: 'PageUp' },
  { key: 'PageDown' },
];

const SINGLE_LINE_SWITCH_STROKES: ReadonlyArray<KeyStroke> = [
  { key: 'Tab' },
  { key: 'Tab', shiftKey: true },
  { key: 'Escape' },
  { key: 'ArrowDown' },
  { key: 'ArrowUp' },
  { key: 'Enter' },
  { key: 'PageDown' },
  { key: 'F6' },
  { key: 'k', ctrlKey: true },
  { key: 'k', metaKey: true },
  { key: 'a', altKey: true },
];

const SINGLE_LINE_TEXT_TYPES: ReadonlyArray<string> = [
  'text',
  'search',
  'email',
  'password',
  'url',
  'tel',
  'number',
];

let uninstallFocusSource: () => void = () => {};

function focusSourceValue(): string | undefined {
  return document.documentElement.dataset.focusSource;
}

function strokeLabel(stroke: KeyStroke): string {
  const flags: ReadonlyArray<[string, boolean | undefined]> = [
    ['shift', stroke.shiftKey],
    ['ctrl', stroke.ctrlKey],
    ['meta', stroke.metaKey],
    ['alt', stroke.altKey],
    ['repeat', stroke.repeat],
  ];
  const modifiers = flags.filter(([, on]) => on === true).map(([name]) => name);
  return [JSON.stringify(stroke.key), ...modifiers].join('+');
}

function mountField<T extends HTMLElement>(element: T): T {
  document.body.appendChild(element);
  return element;
}

function createTextInput(type = 'text'): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  return mountField(input);
}

function createContentEditable(): HTMLDivElement {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  Object.defineProperty(editable, 'isContentEditable', { value: true });
  return mountField(editable);
}

function pressAfterPointer(target: Element | Document, stroke: KeyStroke): string | undefined {
  fireEvent.pointerDown(target);
  expect(focusSourceValue(), `pointerdown before ${strokeLabel(stroke)}`).toBe('pointer');
  fireEvent.keyDown(target, stroke);
  return focusSourceValue();
}

function predicateFor(target: Element | Document, stroke: KeyStroke): boolean {
  let result: boolean | undefined;
  const listener = (event: KeyboardEvent) => {
    result = isFocusSourceFieldEditingKey(event);
  };
  document.addEventListener('keydown', listener, true);
  fireEvent.keyDown(target, stroke);
  document.removeEventListener('keydown', listener, true);
  expect(result, `predicate ran for ${strokeLabel(stroke)}`).toBeTypeOf('boolean');
  return result === true;
}

describe('focus-source typing keys (SABA-B-4 R103, C-R202-03)', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.focusSource;
    uninstallFocusSource = installFocusSourceTracking(document);
  });

  afterEach(() => {
    uninstallFocusSource();
    document.body.replaceChildren();
    delete document.documentElement.dataset.focusSource;
  });

  it('FT1: after a pointer press, typing and caret keys in a text input keep the source on pointer', () => {
    const input = createTextInput();
    fireEvent.pointerDown(input);
    for (const stroke of FIELD_EDITING_STROKES) {
      fireEvent.keyDown(input, stroke);
      expect(focusSourceValue(), strokeLabel(stroke)).toBe('pointer');
    }
  });

  it('FT2: textarea, contenteditable and every single-line text type keep pointer; multi-line fields also keep it on Enter, ArrowUp/Down and PageUp/Down', () => {
    const multiLine: ReadonlyArray<HTMLElement> = [
      mountField(document.createElement('textarea')),
      createContentEditable(),
    ];
    const singleLine = SINGLE_LINE_TEXT_TYPES.filter((type) => type !== 'text').map((type) =>
      createTextInput(type),
    );
    for (const field of [...multiLine, ...singleLine]) {
      const name = field instanceof HTMLInputElement ? `input[${field.type}]` : field.tagName;
      for (const stroke of FIELD_EDITING_STROKES) {
        expect(pressAfterPointer(field, stroke), `${name} ${strokeLabel(stroke)}`).toBe('pointer');
      }
    }
    for (const field of multiLine) {
      for (const stroke of MULTILINE_EDITING_STROKES) {
        expect(pressAfterPointer(field, stroke), `${field.tagName} ${strokeLabel(stroke)}`).toBe(
          'pointer',
        );
      }
    }
  });

  it('FT3: focus-moving and command keys in a single-line text input switch to keyboard', () => {
    const input = createTextInput();
    for (const stroke of SINGLE_LINE_SWITCH_STROKES) {
      expect(pressAfterPointer(input, stroke), strokeLabel(stroke)).toBe('keyboard');
    }
  });

  it('FT4: keys on range, button, select, checkbox and body still switch to keyboard', () => {
    const button = mountField(document.createElement('button'));
    const select = mountField(document.createElement('select'));
    const cases: ReadonlyArray<[string, Element, KeyStroke]> = [
      ['range', createTextInput('range'), { key: 'ArrowUp' }],
      ['range', createTextInput('range'), { key: 'ArrowLeft' }],
      ['button', button, { key: 'a' }],
      ['select', select, { key: 'ArrowDown' }],
      ['checkbox', createTextInput('checkbox'), { key: ' ' }],
      ['body', document.body, { key: 'a' }],
    ];
    for (const [name, target, stroke] of cases) {
      expect(pressAfterPointer(target, stroke), `${name} ${strokeLabel(stroke)}`).toBe('keyboard');
    }
  });

  it('FT5: auto-repeat of a printable key in a text input leaves the source on pointer', () => {
    const input = createTextInput();
    fireEvent.pointerDown(input);
    for (let index = 0; index < 3; index += 1) {
      fireEvent.keyDown(input, { key: 'x', repeat: true });
      expect(focusSourceValue(), `repeat ${index + 1}`).toBe('pointer');
    }
  });

  it('FT6: isFocusSourceFieldEditingKey truth table over target, key and modifiers', () => {
    const textInput = createTextInput();
    const textarea = mountField(document.createElement('textarea'));
    const editable = createContentEditable();
    const typedInputs = SINGLE_LINE_TEXT_TYPES.map((type) => createTextInput(type));
    for (const field of [textInput, textarea, editable, ...typedInputs]) {
      for (const stroke of FIELD_EDITING_STROKES) {
        expect(predicateFor(field, stroke), `${field.tagName} ${strokeLabel(stroke)}`).toBe(true);
      }
      expect(predicateFor(field, { key: 'x', repeat: true }), `${field.tagName} repeat`).toBe(true);
    }
    for (const field of [textarea, editable]) {
      for (const stroke of MULTILINE_EDITING_STROKES) {
        expect(predicateFor(field, stroke), `${field.tagName} ${strokeLabel(stroke)}`).toBe(true);
      }
    }
    for (const field of [textInput, ...typedInputs]) {
      for (const stroke of SINGLE_LINE_SWITCH_STROKES) {
        expect(predicateFor(field, stroke), `input[${field.type}] ${strokeLabel(stroke)}`).toBe(
          false,
        );
      }
    }
    for (const field of [textarea, editable]) {
      for (const stroke of [
        { key: 'Tab' },
        { key: 'Escape' },
        { key: 'F6' },
        { key: 'k', ctrlKey: true },
        { key: 'Enter', metaKey: true },
        { key: 'a', altKey: true },
      ]) {
        expect(predicateFor(field, stroke), `${field.tagName} ${strokeLabel(stroke)}`).toBe(false);
      }
    }
    const nonText: ReadonlyArray<Element> = [
      createTextInput('range'),
      createTextInput('checkbox'),
      createTextInput('file'),
      createTextInput('button'),
      mountField(document.createElement('button')),
      mountField(document.createElement('select')),
      document.body,
    ];
    for (const target of nonText) {
      for (const stroke of [{ key: 'a' }, { key: 'ArrowLeft' }, { key: 'Backspace' }]) {
        expect(predicateFor(target, stroke), `${target.tagName} ${strokeLabel(stroke)}`).toBe(
          false,
        );
      }
    }
    const untypedInput = mountField(document.createElement('input'));
    expect(predicateFor(untypedInput, { key: 'a' }), 'input without type, a').toBe(true);
    expect(predicateFor(untypedInput, { key: 'ArrowDown' }), 'input without type, ArrowDown').toBe(
      false,
    );
    fireEvent.pointerDown(textInput);
    fireEvent(textInput, new Event('keydown', { bubbles: true }));
    expect(focusSourceValue(), 'keyless keydown (autofill) does not throw').toBe('keyboard');
    expect(predicateFor(document, { key: 'a' }), 'document').toBe(false);
    expect(isFocusSourceFieldEditingKey(new KeyboardEvent('keydown', { key: 'a' })), 'null').toBe(
      false,
    );
  });
});
