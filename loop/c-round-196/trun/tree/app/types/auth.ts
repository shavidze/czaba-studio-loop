export type RegistrationSource = 'email' | 'google' | 'facebook' | 'apple';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string; // Full name (firstName + lastName)
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  profileImageUrl?: string;
  authProvider?: string;
  emailVerified?: boolean;
  registrationSource: RegistrationSource;
}

export type AuthModalView = 'signin' | 'signup' | 'forgotPassword';

export interface AuthContextValue {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean; // True while checking localStorage/verifying token

  // Modal Control
  isModalOpen: boolean;
  modalView: AuthModalView;
  setAuthView: (view: AuthModalView) => void;
  openModal: (view?: AuthModalView) => void;
  closeModal: () => void;

  // Auth Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export interface AuthError {
  field?: 'email' | 'password' | 'name' | 'general';
  message: string;
}

export const AUTH_ERRORS = {
  INVALID_EMAIL: 'Please enter a valid email address',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  NAME_REQUIRED: 'Name is required',
  EMAIL_EXISTS: 'This email is already registered',
  INVALID_CREDENTIALS: 'Incorrect email or password',
  NETWORK_ERROR: 'Connection failed. Please try again.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_RESET_TOKEN: 'This password reset link is invalid or has expired',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  PASSWORD_UPDATE_FAILED: 'Failed to update password. Please try again.',
} as const;
