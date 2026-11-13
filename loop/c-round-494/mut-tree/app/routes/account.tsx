import type { MetaFunction } from '@remix-run/node';
/**
 * My Account Page - მინიმალისტური პროფილის გვერდი
 */

import { NavLink, Outlet, useLocation } from '@remix-run/react';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { preventRepeatedEnterKeyDown } from '~/components/arrangement/studio-repeat-safe';
import { RequireAuth } from '~/components/auth';
import { Button } from '~/components/ui';
import { useAuth, useToast } from '~/hooks';
import { AUTH_ERRORS } from '~/types/auth';

export const meta: MetaFunction = () => [{ title: 'Account | CZABA' }];

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountLayout />
    </RequireAuth>
  );
}

function AccountLayout() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/account';

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Title - no animation to prevent jumping */}
        <h1 className="text-3xl font-bold text-foreground mb-8">Account</h1>

        {/* Tab Navigation - static, no animation */}
        <nav className="flex items-center gap-8 mb-12 border-b border-outline">
          <NavLink
            to="/account"
            end
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors relative ${
                isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`
            }
          >
            Profile
            {isProfilePage && (
              <motion.div
                layoutId="account-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </NavLink>

          <NavLink
            to="/account/downloads"
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors relative ${
                isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`
            }
          >
            Downloads
            {location.pathname === '/account/downloads' && (
              <motion.div
                layoutId="account-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </NavLink>

          <NavLink
            to="/account/orders"
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors relative ${
                isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`
            }
          >
            Orders
            {location.pathname === '/account/orders' && (
              <motion.div
                layoutId="account-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </NavLink>
        </nav>

        {/* Content with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {isProfilePage ? <ProfileContent /> : <Outlet />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, updateProfile, updatePassword, isLoading } = useAuth();
  const { showToast } = useToast();

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [nameSaving, setNameSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameButtonRef = useRef<HTMLButtonElement>(null);
  const nameEditorRef = useRef<HTMLDivElement>(null);
  const passwordModalOpenRef = useRef(false);
  const passwordTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreNameFocusRef = useRef(false);
  const nameSaveInFlightRef = useRef(false);
  const nameLabelId = useId();
  const nameValueId = useId();

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Check if user registered with email (can change password)
  const canChangePassword = user?.registrationSource === 'email';

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      return;
    }
    if (restoreNameFocusRef.current) {
      restoreNameFocusRef.current = false;
      nameButtonRef.current?.focus();
    }
  }, [isEditingName]);

  const openPasswordModal = () => {
    passwordModalOpenRef.current = true;
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (!passwordModalOpenRef.current) {
      return;
    }
    passwordModalOpenRef.current = false;
    setIsPasswordModalOpen(false);
    passwordTriggerRef.current?.focus();
  };

  const isNameEditorFocusUnclaimed = () => {
    if (passwordModalOpenRef.current) {
      return false;
    }
    const active = document.activeElement;
    if (active === null || active === document.body) {
      return true;
    }
    return nameEditorRef.current?.contains(active) ?? false;
  };

  const handleNameClick = () => {
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
    setIsEditingName(true);
  };

  const handleNameCancel = () => {
    restoreNameFocusRef.current = true;
    setIsEditingName(false);
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
  };

  const handleNameSave = async () => {
    if (nameSaveInFlightRef.current) {
      return;
    }
    if (!editFirstName.trim()) {
      showToast('First name is required', 'error');
      nameInputRef.current?.focus();
      return;
    }

    nameSaveInFlightRef.current = true;
    setNameSaving(true);
    try {
      await updateProfile(editFirstName.trim(), editLastName.trim());
      showToast('Name updated', 'success');
      restoreNameFocusRef.current = isNameEditorFocusUnclaimed();
      setIsEditingName(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update name', 'error');
      if (isNameEditorFocusUnclaimed()) {
        nameInputRef.current?.focus();
      }
    } finally {
      nameSaveInFlightRef.current = false;
      setNameSaving(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (preventRepeatedEnterKeyDown(e)) {
      return;
    }
    if (e.key === 'Enter') {
      void handleNameSave();
    } else if (e.key === 'Escape' && !nameSaveInFlightRef.current) {
      handleNameCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="space-y-10"
    >
      {/* Full Name */}
      <div>
        <p id={nameLabelId} className="text-sm text-muted mb-2">
          Full Name
        </p>
        {isEditingName ? (
          <div ref={nameEditorRef} className="flex items-center gap-3">
            <input
              ref={nameInputRef}
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="First name"
              aria-label="First name"
              className="min-w-0 bg-transparent text-foreground text-lg border-b border-brand/50 py-1 w-40"
            />
            <input
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="Last name"
              aria-label="Last name"
              className="min-w-0 bg-transparent text-foreground text-lg border-b border-brand/50 py-1 w-40"
            />
            <button
              type="button"
              aria-label="Save name"
              onClick={handleNameSave}
              disabled={nameSaving}
              className="p-1.5 text-brand hover:bg-brand/10 rounded transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Cancel name edit"
              onClick={handleNameCancel}
              disabled={nameSaving}
              className="p-1.5 text-muted hover:bg-elevated rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            ref={nameButtonRef}
            id={nameValueId}
            type="button"
            aria-labelledby={`${nameLabelId} ${nameValueId}`}
            onClick={handleNameClick}
            onKeyDown={preventRepeatedEnterKeyDown}
            className="block w-full text-left text-foreground text-lg hover:text-brand active:transform-none! transition-colors"
          >
            {user?.name || 'Click to add name'}
          </button>
        )}
      </div>

      {/* Email */}
      <div>
        <p className="text-sm text-muted mb-2">Email</p>
        <p className="text-foreground text-lg">{user?.email}</p>
      </div>

      {/* Change Password Link */}
      {canChangePassword && (
        <button
          ref={passwordTriggerRef}
          type="button"
          onClick={openPasswordModal}
          className="text-brand/80 hover:text-brand underline underline-offset-4 text-sm transition-colors"
        >
          Click to change password
        </button>
      )}

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <PasswordModal
            onClose={closePasswordModal}
            onSubmit={updatePassword}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface PasswordModalProps {
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

function PasswordModal({ onClose, onSubmit, isLoading }: PasswordModalProps) {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isPresent = useIsPresent();
  const dialogRef = useRef<HTMLDivElement>(null);
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.inert = !isPresent;
    }
    if (isPresent) {
      currentPasswordRef.current?.focus();
    }
  }, [isPresent]);

  useEffect(() => {
    if (!isPresent) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (e.isComposing) {
          return;
        }
        e.preventDefault();
        onClose();
        return;
      }
      const dialog = dialogRef.current;
      if (e.key !== 'Tab' || !dialog) {
        return;
      }
      const tabbable = [...dialog.querySelectorAll('input, button')].filter(
        (el): el is HTMLInputElement | HTMLButtonElement =>
          (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) && !el.disabled,
      );
      const first = tabbable[0];
      const last = tabbable[tabbable.length - 1];
      if (!first || !last) {
        return;
      }
      const active = document.activeElement;
      const inside = tabbable.some((el) => el === active);
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPresent, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setError(AUTH_ERRORS.PASSWORD_MIN_LENGTH);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(AUTH_ERRORS.PASSWORDS_DONT_MATCH);
      return;
    }

    setSaving(true);
    try {
      await onSubmit(currentPassword, newPassword);
      showToast('Password updated successfully', 'success');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-testid="password-dialog-backdrop"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-modal bg-surface border border-outline rounded-2xl p-6 z-50"
      >
        <h2 id={titleId} className="text-xl font-semibold text-foreground mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor={currentPasswordId} className="block text-sm text-muted mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                ref={currentPasswordRef}
                id={currentPasswordId}
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-elevated border border-outline-strong rounded-xl text-foreground placeholder:text-dim transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor={newPasswordId} className="block text-sm text-muted mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id={newPasswordId}
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-3 pr-12 bg-elevated border border-outline-strong rounded-xl text-foreground placeholder:text-dim transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor={confirmPasswordId} className="block text-sm text-muted mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id={confirmPasswordId}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-elevated border border-outline-strong rounded-xl text-foreground placeholder:text-dim transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password match indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-1 mt-2">
                {newPassword === confirmPassword ? (
                  <>
                    <Check className="w-4 h-4 text-brand" />
                    <span className="text-xs text-brand">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={saving}
              disabled={saving || isLoading}
              className="rounded-xl"
            >
              Update Password
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from '~/components/errors';
