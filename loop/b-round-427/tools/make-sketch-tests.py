import sys
root = sys.argv[1]
T = root + '/app/lib/arrangement/__tests__/'
HELPER = """
function pressHeldEnter(target: Element, repeat: boolean): boolean {
  const notPrevented = fireEvent.keyDown(target, { key: 'Enter', code: 'Enter', repeat });
  if (notPrevented && target instanceof HTMLButtonElement && !target.disabled) {
    fireEvent.click(target);
  }
  return notPrevented;
}
"""
def append(name, text):
    p = T + name; s = open(p, encoding='utf-8').read()
    open(p, 'w', encoding='utf-8').write(s + text)
def insert(name, anchor, text):
    p = T + name; s = open(p, encoding='utf-8').read()
    if s.count(anchor) != 1:
        raise SystemExit(f'{name}: anchor count {s.count(anchor)}')
    open(p, 'w', encoding='utf-8').write(s.replace(anchor, text + anchor))

append('shortcut-sheet-ui.test.tsx', HELPER + """
describe('SYS-2 stage 4 (2b-ii-a): a held Enter acts once on the shortcut sheet buttons (D-29z1503)', {
  timeout: 20_000,
}, () => {
  it('HS1 held Enter on the footer Shortcuts button opens the sheet once', async () => {
    const { view } = await mountSheetWorkspace();
    const footer = footerButton(view);
    act(() => footer.focus());
    expect(pressHeldEnter(footer, true)).toBe(false);
    expect(sheet(view)).toBeNull();
    expect(pressHeldEnter(footer, false)).toBe(true);
    expect(sheet(view)).toBeTruthy();
    const search = sheetSearch(view);
    expect(document.activeElement).toBe(search);
    for (let held = 0; held < 3; held++) {
      pressHeldEnter(search, true);
    }
    expect(sheet(view)).toBeTruthy();
    expect(sheetSearch(view).value).toBe('');
    expect(footerButton(view).getAttribute('aria-expanded')).toBe('true');
  });

  it('HS2 held Enter on the sheet Close closes it once; focus returns to the footer button and the repeats do not reopen it', async () => {
    const { view } = await mountSheetWorkspace();
    const footer = footerButton(view);
    act(() => footer.focus());
    fireEvent.click(footer);
    const close = sheetClose(view);
    act(() => close.focus());
    expect(pressHeldEnter(close, true)).toBe(false);
    expect(sheet(view)).toBeTruthy();
    expect(pressHeldEnter(close, false)).toBe(true);
    expect(sheet(view)).toBeNull();
    expect(document.activeElement).toBe(footerButton(view));
    for (let held = 0; held < 3; held++) {
      expect(pressHeldEnter(footerButton(view), true)).toBe(false);
    }
    expect(sheet(view)).toBeNull();
    expect(footerButton(view).getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(footerButton(view));
  });
});
""")

insert('studio-narrow-gate-ui.test.tsx', """    it('NG7d: a failed clipboard write""", """    it('HN1: held Enter on Send link copies once and keeps focus; the repeats are prevented (SYS-2 stage 4, D-29z1503)', async () => {
      const writeText = vi.fn(() => Promise.resolve());
      stubNavigator('share', undefined);
      stubNavigator('clipboard', { writeText });
      const view = renderNarrowScreen();
      const send = screen.getByRole('button', { name: 'Send link' });
      act(() => send.focus());
      await act(async () => {
        expect(pressHeldEnter(send, true)).toBe(false);
      });
      expect(writeText).not.toHaveBeenCalled();
      await act(async () => {
        expect(pressHeldEnter(send, false)).toBe(true);
      });
      for (let held = 0; held < 3; held++) {
        await act(async () => {
          expect(pressHeldEnter(send, true)).toBe(false);
        });
      }
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(view.status()).toBe('Link copied');
      expect(document.activeElement).toBe(send);
    });

""")
insert('studio-narrow-gate-ui.test.tsx', """describe('FIX-PD-1c studio-lab narrow-window gate""", HELPER.lstrip('\n') + '\n')

append('export-cancel-ui.test.tsx', HELPER + """
describe('SYS-2 stage 4 (2b-ii-a): a held Enter acts once on the export dialog buttons (D-29z1503)', {
  timeout: 15_000,
}, () => {
  beforeEach(() => {
    cancelEncoderGate.release();
    setUpCancelEnvironment();
  });
  afterEach(tearDownCancelEnvironment);

  it('HX1 held Enter on the Export button starts one render; the repeats are prevented', async () => {
    const controls = controlledRenders();
    const { view } = await mountCancelDialog();
    const primary = dialogButton(view, WAV_BUTTON);
    act(() => primary.focus());
    expect(pressHeldEnter(primary, true)).toBe(false);
    expect(controls).toHaveLength(0);
    await act(async () => {
      expect(pressHeldEnter(primary, false)).toBe(true);
      await Promise.resolve();
    });
    expect(controls).toHaveLength(1);
    for (let held = 0; held < 3; held++) {
      await act(async () => {
        expect(pressHeldEnter(primary, true)).toBe(false);
        await Promise.resolve();
      });
    }
    expect(controls).toHaveLength(1);
    expect(cancelButton(view)).not.toBeNull();
  });

  it('HX2 held Enter on Cancel cancels once; focus moves to Done and the repeats there keep the dialog open', async () => {
    const controls = controlledRenders();
    const { api, view } = await mountCancelDialog();
    await clickExport(view, WAV_BUTTON);
    const control = controlAt(controls, 0);
    const cancel = requireCancelButton(view);
    act(() => cancel.focus());
    expect(pressHeldEnter(cancel, true)).toBe(false);
    expect(signalOf(control).aborted).toBe(false);
    expect(cancelButton(view)).not.toBeNull();
    await act(async () => {
      expect(pressHeldEnter(cancel, false)).toBe(true);
      await Promise.resolve();
    });
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
    expect(signalOf(control).aborted).toBe(true);
    const done = dialogButton(view, studioExportStrings.closeButton);
    expect(document.activeElement).toBe(done);
    for (let held = 0; held < 3; held++) {
      expect(pressHeldEnter(done, true)).toBe(false);
    }
    expect(view.queryByRole('dialog')).not.toBeNull();
    expect(controls).toHaveLength(1);
  });

  it('HX3 held Enter on Done closes the dialog once; a repeat alone does not close it', async () => {
    const { view } = await mountCancelDialog();
    const done = dialogButton(view, studioExportStrings.closeButton);
    act(() => done.focus());
    expect(pressHeldEnter(done, true)).toBe(false);
    expect(view.queryByRole('dialog')).not.toBeNull();
    expect(pressHeldEnter(done, false)).toBe(true);
    expect(view.queryByRole('dialog')).toBeNull();
  });
});
""")
print('ok')
