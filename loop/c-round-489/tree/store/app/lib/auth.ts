import { type AuthResponse, apiClient } from '~/services/api/client';
import type { RegistrationSource, User } from '~/types/auth';
import { AUTH_ERRORS } from '~/types/auth';
import { getIdToken, initFirebase, signInWithGooglePopup } from './firebase.client';

// ===========================================
// VALIDATION HELPERS
// ===========================================

export interface EmailValidation {
  isValid: boolean;
  suggestion?: string;
  error?: string;
}

export function validateEmailSmart(email: string): EmailValidation {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  const [localPart, domain] = email.split('@');

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email cannot start or end with a dot',
    };
  }

  if (localPart.includes('..')) {
    return {
      isValid: false,
      error: 'Email cannot contain consecutive dots',
    };
  }

  const domainLabels = domain.split('.');
  if (
    domain.length > 253 ||
    domainLabels.some((label) => !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label))
  ) {
    return { isValid: false, error: 'Email must have a valid domain' };
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'Email must have a valid domain',
    };
  }

  const tld = domain.split('.').pop() || '';

  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Email domain must have a valid extension',
    };
  }

  const domainLower = domain.toLowerCase();
  const typoMap: Record<string, string> = {
    'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.con': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmail.co': 'hotmail.com',
    'hotmail.con': 'hotmail.com',
    'outlook.co': 'outlook.com',
    'outlook.con': 'outlook.com',
  };

  for (const [typo, correction] of Object.entries(typoMap)) {
    if (domainLower === typo) {
      const suggestedEmail = `${localPart}@${correction}`;
      return {
        isValid: true,
        suggestion: suggestedEmail,
      };
    }
  }

  return { isValid: true };
}

export function validateEmail(email: string): boolean {
  const result = validateEmailSmart(email);
  return result.isValid;
}

export function validatePassword(password: string): boolean {
  return password.trim().length >= 8;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function authResponseToUser(response: AuthResponse, registrationSource: RegistrationSource): User {
  return {
    id: response.userId,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    name: `${response.firstName || ''} ${response.lastName || ''}`.trim() || response.email,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessTokenExpires: response.accessTokenExpires,
    profileImageUrl: response.profileImageUrl,
    registrationSource,
  };
}

// ===========================================
// AUTHENTICATION FUNCTIONS
// ===========================================

export async function signIn(
  email: string,
  password: string,
  registrationSource: RegistrationSource = 'email',
): Promise<User> {
  if (!email) {
    throw new Error(AUTH_ERRORS.EMAIL_REQUIRED);
  }
  if (!validateEmail(email)) {
    throw new Error(AUTH_ERRORS.INVALID_EMAIL);
  }
  if (!password) {
    throw new Error(AUTH_ERRORS.PASSWORD_REQUIRED);
  }

  try {
    const response = await apiClient.login({ email, password });
    const user = authResponseToUser(response, registrationSource);

    // Set access token for subsequent API calls
    apiClient.setAccessToken(response.accessToken);

    return user;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.toLowerCase().includes('invalid')) {
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }
      throw error;
    }
    throw new Error(AUTH_ERRORS.NETWORK_ERROR);
  }
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  registrationSource: RegistrationSource = 'email',
): Promise<User> {
  if (!name) {
    throw new Error(AUTH_ERRORS.NAME_REQUIRED);
  }
  if (!email) {
    throw new Error(AUTH_ERRORS.EMAIL_REQUIRED);
  }
  if (!validateEmail(email)) {
    throw new Error(AUTH_ERRORS.INVALID_EMAIL);
  }
  if (!password) {
    throw new Error(AUTH_ERRORS.PASSWORD_REQUIRED);
  }
  if (!validatePassword(password)) {
    throw new Error(AUTH_ERRORS.PASSWORD_MIN_LENGTH);
  }

  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    const response = await apiClient.register({
      email,
      password,
      firstName,
      lastName,
    });

    const user = authResponseToUser(response, registrationSource);

    // Set access token for subsequent API calls
    apiClient.setAccessToken(response.accessToken);

    return user;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes('exists') ||
        error.message.toLowerCase().includes('already')
      ) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS);
      }
      throw error;
    }
    throw new Error(AUTH_ERRORS.NETWORK_ERROR);
  }
}

export async function signInWithGoogle(): Promise<User> {
  try {
    // Initialize Firebase
    await initFirebase();

    // Sign in with Google popup
    const result = await signInWithGooglePopup();

    // Get the Firebase ID token
    const idToken = await getIdToken(result.user);

    if (!idToken) {
      throw new Error('Failed to get ID token from Firebase');
    }

    // Send to our backend for verification and user creation
    const response = await apiClient.socialLogin({ idToken });

    const user = authResponseToUser(response, 'google');

    // Set access token for subsequent API calls
    apiClient.setAccessToken(response.accessToken);

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AUTH_ERRORS.NETWORK_ERROR);
  }
}

export async function signOut(_accessToken?: string): Promise<void> {
  // Clear the access token from API client
  apiClient.setAccessToken(undefined);

  // The backend refresh token will expire naturally
  // or we could call a logout endpoint to invalidate it
}

export async function getCurrentCustomer(accessToken: string): Promise<User | null> {
  try {
    apiClient.setAccessToken(accessToken);
    const profile = await apiClient.getProfile();

    // Get stored user for refreshToken and other data
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    const parsedUser = storedUser ? JSON.parse(storedUser) : {};

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
      accessToken,
      refreshToken: parsedUser.refreshToken || '',
      accessTokenExpires: parsedUser.accessTokenExpires || '',
      profileImageUrl: profile.profileImageUrl,
      authProvider: profile.authProvider,
      emailVerified: profile.emailVerified,
      registrationSource: (profile.authProvider?.toLowerCase() as RegistrationSource) || 'email',
    };
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return null;
  }
}

export async function resetPassword(email: string): Promise<void> {
  if (!email) throw new Error(AUTH_ERRORS.EMAIL_REQUIRED);
  if (!validateEmail(email)) {
    throw new Error(AUTH_ERRORS.INVALID_EMAIL);
  }

  try {
    await apiClient.forgotPassword(email);
    // The backend always returns success for security reasons
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AUTH_ERRORS.NETWORK_ERROR);
  }
}

export async function customerResetPassword(
  _userId: string,
  token: string,
  newPassword: string,
): Promise<void> {
  if (!token) throw new Error('Reset token is required');
  if (!newPassword) throw new Error(AUTH_ERRORS.PASSWORD_REQUIRED);
  if (!validatePassword(newPassword)) {
    throw new Error(AUTH_ERRORS.PASSWORD_MIN_LENGTH);
  }

  try {
    await apiClient.resetPassword(token, newPassword);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.toLowerCase().includes('invalid') ||
        error.message.toLowerCase().includes('expired')
      ) {
        throw new Error(AUTH_ERRORS.INVALID_RESET_TOKEN);
      }
      throw error;
    }
    throw new Error(AUTH_ERRORS.NETWORK_ERROR);
  }
}

export async function updateProfile(
  accessToken: string,
  firstName: string,
  lastName: string,
): Promise<User> {
  if (!firstName.trim()) {
    throw new Error(AUTH_ERRORS.NAME_REQUIRED);
  }

  try {
    apiClient.setAccessToken(accessToken);
    const profile = await apiClient.updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    // Get stored user for refreshToken and other data
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    const parsedUser = storedUser ? JSON.parse(storedUser) : {};

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
      accessToken,
      refreshToken: parsedUser.refreshToken || '',
      accessTokenExpires: parsedUser.accessTokenExpires || '',
      profileImageUrl: profile.profileImageUrl,
      authProvider: profile.authProvider,
      emailVerified: profile.emailVerified,
      registrationSource: (profile.authProvider?.toLowerCase() as RegistrationSource) || 'email',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AUTH_ERRORS.PROFILE_UPDATE_FAILED);
  }
}

export async function updatePassword(
  email: string,
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!validatePassword(newPassword)) {
    throw new Error(AUTH_ERRORS.PASSWORD_MIN_LENGTH);
  }

  // Step 1: Verify current password by trying to login
  try {
    await apiClient.login({ email, password: currentPassword });
  } catch {
    throw new Error(AUTH_ERRORS.CURRENT_PASSWORD_INCORRECT);
  }

  // Step 2: Update password
  // Note: Backend needs an endpoint for authenticated password change
  // For now, we'll use forgot-password flow or implement a new endpoint
  throw new Error(
    'Password change is not yet implemented. Please use the forgot password feature.',
  );
}
