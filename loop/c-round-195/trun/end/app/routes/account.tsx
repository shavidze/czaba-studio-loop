/**
 * My Account Page - მინიმალისტური პროფილის გვერდი
 */

import { NavLink, Outlet, useLocation } from '@remix-run/react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RequireAuth } from '~/components/auth';
import { Button } from '~/components/ui';
import { useAuth, useToast } from '~/hooks';
import { AUTH_ERRORS } from '~/types/auth';

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

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Check if user registered with email (can change password)
  const canChangePassword = user?.registrationSource === 'email';

  // Focus name input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
    setIsEditingName(true);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
  };

  const handleNameSave = async () => {
    if (!editFirstName.trim()) {
      showToast('First name is required', 'error');
      return;
    }

    setNameSaving(true);
    try {
      await updateProfile(editFirstName.trim(), editLastName.trim());
      showToast('Name updated', 'success');
      setIsEditingName(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update name', 'error');
    } finally {
      setNameSaving(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
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
        <p className="text-sm text-muted mb-2">Full Name</p>
        {isEditingName ? (
          <div className="flex items-center gap-3">
            <input
              ref={nameInputRef}
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="First name"
              className="bg-transparent text-foreground text-lg border-b border-brand/50 focus:border-brand outline-none py-1 w-40"
            />
            <input
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="Last name"
              className="bg-transparent text-foreground text-lg border-b border-brand/50 focus:border-brand outline-none py-1 w-40"
            />
            <button
              onClick={handleNameSave}
              disabled={nameSaving}
              className="p-1.5 text-brand hover:bg-brand/10 rounded transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleNameCancel}
              disabled={nameSaving}
              className="p-1.5 text-muted hover:bg-elevated rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <p
            onClick={handleNameClick}
            className="text-foreground text-lg cursor-pointer hover:text-brand transition-colors"
          >
            {user?.name || 'Click to add name'}
          </p>
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
          onClick={() => setIsPasswordModalOpen(true)}
          className="text-brand/80 hover:text-brand underline underline-offset-4 text-sm transition-colors"
        >
          Click to change password
        </button>
      )}

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <PasswordModal
            onClose={() => setIsPasswordModalOpen(false)}
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-modal bg-surface border border-outline rounded-2xl p-6 z-50"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm text-muted mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-elevated border border-outline-strong rounded-xl text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-muted mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-3 pr-12 bg-elevated border border-outline-strong rounded-xl text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-muted mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-elevated border border-outline-strong rounded-xl text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
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
