import { createContext, type ReactNode, useCallback, useEffect, useState } from 'react';
import * as authApi from '~/lib/auth';
import { type AuthResponse, apiClient } from '~/services/api/client';
import type { AuthContextValue, AuthModalView, User } from '~/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<AuthModalView>('signin');

  // Handle token refresh - update localStorage and state with new tokens
  const handleTokenRefreshed = useCallback((response: AuthResponse) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle session expired - clear user and show login
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    apiClient.setAccessToken(undefined);
    setModalView('signin');
    setIsModalOpen(true);
  }, []);

  // Multi-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'auth_user') return;

      if (e.newValue === null) {
        // Logged out in another tab
        setUser(null);
        apiClient.setAccessToken(undefined);
      } else {
        // Token updated in another tab
        try {
          const updated = JSON.parse(e.newValue);
          setUser(updated);
          apiClient.setAccessToken(updated.accessToken);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for stored user session and verify access token on mount
  useEffect(() => {
    // Set up API client callbacks
    apiClient.setTokenRefreshCallback(handleTokenRefreshed);
    apiClient.setSessionExpiredCallback(handleSessionExpired);

    const initAuth = async () => {
      const storedUser = localStorage.getItem('auth_user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Set access token for API client
          if (parsedUser.accessToken) {
            apiClient.setAccessToken(parsedUser.accessToken);

            // Verify the access token is still valid
            const customer = await authApi.getCurrentCustomer(parsedUser.accessToken);
            if (customer) {
              setUser(customer);
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('auth_user');
              apiClient.setAccessToken(undefined);
            }
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('auth_user');
          apiClient.setAccessToken(undefined);
        }
      }

      // Auth check complete
      setIsInitializing(false);
    };

    initAuth();
  }, [handleTokenRefreshed, handleSessionExpired]);

  const openModal = (view: AuthModalView = 'signin') => {
    setModalView(view);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await authApi.signIn(email, password);
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await authApi.signUp(name, email, password);
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userData = await authApi.signInWithGoogle();
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (user?.accessToken) {
      try {
        await authApi.signOut(user.accessToken);
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    }
    setUser(null);
    localStorage.removeItem('auth_user');
    apiClient.setAccessToken(undefined);
  };

  const setAuthView = (view: AuthModalView) => {
    setModalView(view);
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);

    try {
      await authApi.resetPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user?.accessToken) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(user.accessToken, firstName, lastName);
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.accessToken || !user?.email) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      await authApi.updatePassword(user.email, user.accessToken, currentPassword, newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitializing,
    isModalOpen,
    modalView,
    setAuthView,
    openModal,
    closeModal,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
