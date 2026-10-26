import { XCircle } from 'lucide-react';
import { useState } from 'react';
import { FacebookIcon, GoogleIcon, LoaderIcon } from '~/components/icons';
import { Button, Input, PasswordInput } from '~/components/ui';
import { useAuth } from '~/hooks/useAuth';
import { validateEmail } from '~/lib/auth';
import { getErrorMessage } from '~/lib/utils/getErrorMessage';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

export function SignInForm({ onSwitchToSignUp, onSwitchToForgotPassword }: SignInFormProps) {
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const isAnyLoading = isLoading || loadingProvider !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    try {
      await signIn(email, password);
    } catch (error: unknown) {
      setErrors({ general: getErrorMessage(error) });
    }
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google') => {
    setErrors({});
    setLoadingProvider(provider);

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        // Facebook not implemented yet
        throw new Error('Facebook login is not available yet');
      }
    } catch (error: unknown) {
      console.error(`${provider} sign in error:`, error);
      setErrors({
        general: getErrorMessage(error),
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="p-8">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-foreground mb-6">Sign in</h2>

      {/* General Error */}
      {errors.general && (
        <div className="bg-error-bg border border-error-border rounded-lg p-4 mb-6 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <p className="text-error-light text-sm leading-relaxed">{errors.general}</p>
        </div>
      )}

      {/* Social Buttons */}
      <div className="flex gap-3 mb-6">
        {/* Facebook Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={isAnyLoading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 cursor-pointer bg-social-facebook text-foreground font-medium rounded-lg hover:bg-social-facebook-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProvider === 'facebook' ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <FacebookIcon />
              <span>Facebook</span>
            </>
          )}
        </button>

        {/* Google Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={isAnyLoading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 cursor-pointer bg-social-google text-social-google-text font-medium rounded-lg border border-social-google-border hover:bg-social-google-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProvider === 'google' ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin text-social-google-text" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Google</span>
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-outline" />
        <span className="text-dim text-sm">or</span>
        <div className="flex-1 h-px bg-outline" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="mb-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            disabled={isAnyLoading}
            autoComplete="email"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={isAnyLoading}
            autoComplete="current-password"
          />
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between">
          {/* Forgot Password */}
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-muted text-sm underline hover:text-foreground transition-colors cursor-pointer"
          >
            Forgot password?
          </button>

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isLoading}
            disabled={isAnyLoading}
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Footer - Sign Up Link */}
      <p className="text-center text-muted text-sm mt-8">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-foreground font-semibold hover:underline cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
