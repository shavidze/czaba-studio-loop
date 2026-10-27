/**
 * Firebase Client Configuration
 * Handles Firebase initialization and authentication
 */

import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  type Auth,
  FacebookAuthProvider,
  getIdToken as firebaseGetIdToken,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  type User,
  type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCWZd1kxAgYmHViNnyNFJFZ3966Gq_KLLU',
  authDomain: 'czaba-api.firebaseapp.com',
  projectId: 'czaba-api',
  storageBucket: 'czaba-api.firebasestorage.app',
  messagingSenderId: '466379096804',
  appId: '1:466379096804:web:b386fd5f0cff543bf122f1',
  measurementId: 'G-76P3F8YGMQ',
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    // Check if Firebase is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Google Sign In
export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  return signInWithPopup(auth, provider);
}

// Facebook Sign In
export async function signInWithFacebook(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({
    display: 'popup',
  });
  return signInWithPopup(auth, provider);
}

// Sign Out
export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  return firebaseSignOut(auth);
}

// Get current Firebase user
export function getCurrentFirebaseUser(): User | null {
  const auth = getFirebaseAuth();
  return auth.currentUser;
}

// Get ID token for a user
export async function getIdToken(user: User, forceRefresh = false): Promise<string | null> {
  if (!user) return null;
  return firebaseGetIdToken(user, forceRefresh);
}

// Initialize Firebase (alias for compatibility)
export function initFirebase(): FirebaseApp {
  return getFirebaseApp();
}

// Sign in with Google popup (alias for compatibility)
export async function signInWithGooglePopup(): Promise<UserCredential> {
  return signInWithGoogle();
}

// Listen to auth state changes
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  return auth.onAuthStateChanged(callback);
}
