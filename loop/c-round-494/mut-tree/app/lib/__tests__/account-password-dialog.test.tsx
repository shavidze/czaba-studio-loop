import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccountPage from '~/routes/account';

const spies = vi.hoisted(() => ({
  updateProfile: vi.fn<(firstName: string, lastName: string) => Promise<void>>(),
  updatePassword: vi.fn<(currentPassword: string, newPassword: string) => Promise<void>>(),
  showToast: vi.fn(),
  user: {
    id: 7,
    email: 'buyer@example.invalid',
    firstName: 'Probe',
    lastName: 'User',
    name: 'Probe User',
    registrationSource: 'email',
  },
}));

vi.mock('~/hooks', () => ({
  useAuth: () => ({
    user: spies.user,
    updateProfile: spies.updateProfile,
    updatePassword: spies.updatePassword,
    isLoading: false,
  }),
  useToast: () => ({ showToast: spies.showToast }),
}));
vi.mock('~/components/auth', () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/account']}>
      <AccountPage />
    </MemoryRouter>,
  );
}

function trigger() {
  return screen.getByRole('button', { name: 'Click to change password' });
}

function openDialog() {
  fireEvent.click(trigger());
  return screen.getByRole('dialog', { name: 'Change Password' });
}

function deferred() {
  let resolve: () => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function fillValid() {
  fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'old-pass-1' } });
  fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new-pass-12' } });
  fireEvent.change(screen.getByLabelText('Confirm New Password'), {
    target: { value: 'new-pass-12' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  spies.updatePassword.mockResolvedValue(undefined);
  spies.updateProfile.mockResolvedValue(undefined);
});
afterEach(() => cleanup());

describe('Account password dialog (B-R488-PASSWORD-MODAL-DIALOG)', () => {
  it('PD1 opening is a labelled modal dialog with focus on Current Password', () => {
    renderProfile();
    expect(screen.queryByRole('dialog')).toBeNull();
    const dialog = openDialog();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const current = screen.getByLabelText('Current Password');
    expect(dialog.contains(current)).toBe(true);
    expect(document.activeElement).toBe(current);
  });

  it('PD2 the three fields are labelled and every dialog button has one unique name', () => {
    renderProfile();
    const dialog = openDialog();
    for (const label of ['Current Password', 'New Password', 'Confirm New Password']) {
      const field = within(dialog).getByLabelText(label);
      expect(field.tagName).toBe('INPUT');
      expect(field.getAttribute('type')).toBe('password');
    }
    const names = within(dialog)
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '');
    expect(names).toEqual([
      'Show current password',
      'Show new password',
      'Show password confirmation',
      'Cancel',
      'Update Password',
    ]);
    for (const name of names) {
      expect(within(dialog).getAllByRole('button', { name })).toHaveLength(1);
    }
  });

  it('PD3 a visibility toggle shows the field and renames itself', () => {
    renderProfile();
    openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Show new password' }));
    expect(screen.getByLabelText('New Password').getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide new password' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Show new password' })).toBeNull();
  });

  it('PD4 Escape closes the dialog and returns focus to the trigger', async () => {
    renderProfile();
    openDialog();
    fireEvent.keyDown(screen.getByLabelText('Current Password'), { key: 'Escape' });
    expect(document.activeElement).toBe(trigger());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(spies.updatePassword).not.toHaveBeenCalled();
  });

  it('PD5 Cancel and a backdrop click return focus to the trigger', async () => {
    renderProfile();
    openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(document.activeElement).toBe(trigger());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    openDialog();
    fireEvent.click(screen.getByTestId('password-dialog-backdrop'));
    expect(document.activeElement).toBe(trigger());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('PD6 a successful update closes the dialog and returns focus to the trigger', async () => {
    renderProfile();
    openDialog();
    fillValid();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });
    expect(spies.updatePassword).toHaveBeenCalledWith('old-pass-1', 'new-pass-12');
    expect(spies.showToast).toHaveBeenCalledWith('Password updated successfully', 'success');
    expect(document.activeElement).toBe(trigger());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('PD7 an update that settles after Escape does not pull focus back to the trigger', async () => {
    const pending = deferred();
    spies.updatePassword.mockReturnValue(pending.promise);
    renderProfile();
    openDialog();
    fillValid();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger());
    const nameButton = screen.getByRole('button', { name: 'Full Name Probe User' });
    nameButton.focus();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.updatePassword).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(nameButton);
  });

  it('PD8 Tab wraps from the last control to the first and Shift+Tab from the first to the last', () => {
    renderProfile();
    const dialog = openDialog();
    const current = screen.getByLabelText('Current Password');
    const update = within(dialog).getByRole('button', { name: 'Update Password' });
    update.focus();
    expect(fireEvent.keyDown(update, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(current);
    expect(fireEvent.keyDown(current, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(update);
    const middle = within(dialog).getByLabelText('New Password');
    middle.focus();
    expect(fireEvent.keyDown(middle, { key: 'Tab' })).toBe(true);
    expect(document.activeElement).toBe(middle);
  });

  it('PD9 Tab with focus outside the open dialog moves focus into it', () => {
    renderProfile();
    openDialog();
    act(() => {
      screen.getByLabelText('Current Password').blur();
    });
    expect(document.activeElement).toBe(document.body);
    expect(fireEvent.keyDown(document.body, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(screen.getByLabelText('Current Password'));
    act(() => {
      screen.getByLabelText('Current Password').blur();
    });
    expect(fireEvent.keyDown(document.body, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Update Password' }));
  });

  it('PD10 after the dialog closes, it is inert while it fades and Tab and Escape are no longer handled by it', async () => {
    renderProfile();
    const dialog = openDialog();
    expect(dialog.inert).not.toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(document.activeElement).toBe(trigger());
    expect(dialog.inert).toBe(true);
    expect(fireEvent.keyDown(trigger(), { key: 'Tab' })).toBe(true);
    expect(fireEvent.keyDown(trigger(), { key: 'Escape' })).toBe(true);
    expect(document.activeElement).toBe(trigger());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it('PD11 while an update is pending, Shift+Tab from the first field skips the disabled Update button', async () => {
    const pending = deferred();
    spies.updatePassword.mockReturnValue(pending.promise);
    renderProfile();
    const dialog = openDialog();
    fillValid();
    act(() => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Update Password' }));
    });
    expect(
      within(dialog).getByRole('button', { name: 'Loading...' }).hasAttribute('disabled'),
    ).toBe(true);
    const current = screen.getByLabelText('Current Password');
    current.focus();
    expect(fireEvent.keyDown(current, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' }));
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });
  it('PD12 a failed update is announced as an alert and keeps the dialog open', async () => {
    spies.updatePassword.mockRejectedValue(new Error('Stub failure'));
    renderProfile();
    openDialog();
    fillValid();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });
    expect(screen.getByRole('alert').textContent).toContain('Stub failure');
    expect(screen.getByRole('dialog', { name: 'Change Password' })).toBeTruthy();
    expect(spies.showToast).not.toHaveBeenCalled();
  });
  it('PD13 an Escape that ends an IME composition does not close the dialog', () => {
    renderProfile();
    openDialog();
    const current = screen.getByLabelText('Current Password');
    expect(fireEvent.keyDown(current, { key: 'Escape', isComposing: true })).toBe(true);
    expect(screen.getByRole('dialog', { name: 'Change Password' })).toBeTruthy();
    expect(document.activeElement).toBe(current);
    fireEvent.keyDown(current, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger());
  });
  it('PD14 reopening while the closed dialog still fades gives a live dialog with focus on Current Password', () => {
    renderProfile();
    const dialog = openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(dialog.inert).toBe(true);
    fireEvent.click(trigger());
    const reopened = screen.getByRole('dialog', { name: 'Change Password' });
    expect(reopened.inert).toBe(false);
    expect(document.activeElement).toBe(screen.getByLabelText('Current Password'));
    fireEvent.keyDown(screen.getByLabelText('Current Password'), { key: 'Escape' });
    expect(document.activeElement).toBe(trigger());
  });

  it('PD15 Tab from a control that became disabled while focused moves focus to the first field', async () => {
    const pending = deferred();
    spies.updatePassword.mockReturnValue(pending.promise);
    renderProfile();
    const dialog = openDialog();
    fillValid();
    const update = within(dialog).getByRole('button', { name: 'Update Password' });
    update.focus();
    act(() => {
      fireEvent.click(update);
    });
    expect(update.hasAttribute('disabled')).toBe(true);
    expect(document.activeElement).toBe(update);
    expect(fireEvent.keyDown(update, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(screen.getByLabelText('Current Password'));
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });
});
