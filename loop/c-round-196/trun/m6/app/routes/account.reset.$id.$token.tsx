import { useNavigate, useParams } from '@remix-run/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PasswordInput } from '~/components/ui';
import { useAuth } from '~/hooks';
import { customerResetPassword, validatePassword } from '~/lib/auth';
import { AUTH_ERRORS } from '~/types/auth';

export default function ResetPassword() {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const { signIn, openModal } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  useEffect(() => {
    if (!id || !token) {
      setErrors({
        general: 'Invalid password reset link. Please request a new one.',
      });
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = AUTH_ERRORS.PASSWORD_REQUIRED;
    } else if (!validatePassword(password)) {
      newErrors.password = AUTH_ERRORS.PASSWORD_MIN_LENGTH;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = AUTH_ERRORS.PASSWORDS_DONT_MATCH;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!id || !token) {
      setErrors({ general: 'Invalid reset link' });
      return;
    }

    setIsLoading(true);

    try {
      await customerResetPassword(id, token, password);

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/');
        openModal('signin');
      }, 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setErrors({
        general: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/');
    openModal('forgotPassword');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-background border border-outline rounded-xl w-full max-w-[480px] p-8">
        <h1 className="text-[32px] font-semibold text-foreground mb-2">Reset Your Password</h1>
        <p className="text-muted text-sm mb-8">Please enter your new password below</p>

        {errors.general && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-error-light text-sm leading-relaxed mb-3">{errors.general}</p>
              {errors.general.includes('invalid') || errors.general.includes('expired') ? (
                <button
                  onClick={handleRequestNewLink}
                  className="text-foreground text-sm font-semibold hover:underline"
                >
                  Request a new reset link →
                </button>
              ) : null}
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="bg-positive/10 border border-positive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-positive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-positive text-sm font-semibold mb-1">Password Reset Successful!</p>
              <p className="text-positive/80 text-sm">Signing you in and redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-4">
            <PasswordInput
              label="New Password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={isLoading || isSuccess}
              autoComplete="new-password"
            />
            <p className="text-muted text-xs mt-1.5">Must be at least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              disabled={isLoading || isSuccess}
              autoComplete="new-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess || !!errors.general}
            className="
              w-full py-4
              bg-accent
              text-black font-semibold cursor-pointer
              rounded-lg
              hover:brightness-110
              transition-all
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Resetting Password...</span>
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-muted text-sm mt-8">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => {
              navigate('/');
              openModal('signin');
            }}
            className="text-foreground font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
