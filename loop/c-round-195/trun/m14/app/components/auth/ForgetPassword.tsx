import { AlertTriangle, CheckCircle, Mail, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button, Input } from '~/components/ui';
import { resetPassword, validateEmailSmart } from '~/lib/auth';

interface ForgetPasswordFormProps {
  onSwitchToSignIn: () => void;
}

export function ForgotPasswordForm({ onSwitchToSignIn }: ForgetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailSuggestion(null);
    setErrors({});

    // Check for typos as user types (debounced would be better in production)
    if (value.includes('@')) {
      const validation = validateEmailSmart(value);
      if (validation.suggestion) {
        setEmailSuggestion(validation.suggestion);
      }
    }
  };

  const handleUseSuggestion = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion);
      setEmailSuggestion(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSuccess(false);

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    const validation = validateEmailSmart(email);
    if (!validation.isValid) {
      setErrors({ email: validation.error || 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred while resetting password';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Success State - Replaces entire form */}
      {isSuccess ? (
        <div className="text-center py-8">
          {/* Large Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-brand" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-brand-foreground" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-semibold text-foreground mb-3">Check your inbox</h2>

          {/* Body Text */}
          <p className="text-muted text-base mb-2 leading-relaxed">
            We have sent password recovery instructions to
          </p>
          <p className="text-foreground font-semibold text-base mb-6">{email}</p>

          {/* Security Note */}
          <div className="bg-surface border border-outline rounded-lg p-4 mb-8">
            <p className="text-muted text-sm leading-relaxed">
              If you don't see the email, please check your{' '}
              <span className="text-foreground font-medium">Spam</span> or{' '}
              <span className="text-foreground font-medium">Junk</span> folder.
            </p>
          </div>

          {/* Back to Login Button */}
          <Button type="button" variant="accent" size="lg" fullWidth onClick={onSwitchToSignIn}>
            Back to Login
          </Button>
        </div>
      ) : (
        <>
          {/* Form State - Hidden when success */}
          <h2 className="text-2xl font-semibold text-foreground mb-2">Forgot Password?</h2>
          <p className="text-muted text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password
          </p>

          {errors.general && (
            <div className="bg-error-bg border border-error-border rounded-lg p-4 mb-6 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-error-light text-sm leading-relaxed">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={errors.email}
                disabled={isLoading}
                autoComplete="email"
              />

              {/* Email Suggestion */}
              {emailSuggestion && !errors.email && (
                <div className="mt-3 bg-accent/10 border border-accent/20 rounded-lg p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-foreground/80 text-sm mb-2">
                      Did you mean{' '}
                      <span className="font-semibold text-foreground">{emailSuggestion}</span>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleUseSuggestion}
                        className="text-xs px-3 py-1.5 bg-accent hover:bg-accent/90 text-background rounded transition-colors"
                      >
                        Use this
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailSuggestion(null)}
                        className="text-xs px-3 py-1.5 bg-transparent hover:bg-surface text-foreground/70 border border-outline rounded transition-colors"
                      >
                        No, keep {email.split('@')[1]}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              Reset Password
            </Button>
          </form>

          <p className="text-center text-muted text-sm mt-8">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-foreground font-semibold hover:underline cursor-pointer transition-colors"
            >
              &larr; Back to Sign in
            </button>
          </p>
        </>
      )}
    </div>
  );
}
