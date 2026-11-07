/**
 * Server-side Authentication Backup Service
 */

import {
  backupUserToFirebase,
  type FirebaseUserBackup,
  markLeadAsConverted,
} from './firebase.server';

/**
 * Backup user after successful registration
 */
export async function backupNewUser(params: {
  email: string;
  name: string;
  userId: string;
  source: 'email' | 'social-google' | 'social-facebook';
}): Promise<void> {
  const userData: FirebaseUserBackup = {
    email: params.email,
    name: params.name,
    createdAt: new Date(),
    userId: params.userId,
    registrationSource: params.source,
    lastSyncedAt: new Date(),
  };

  backupUserToFirebase(userData).catch((error) => {
    console.error('Failed to backup user:', error);
  });

  if (params.email) {
    markLeadAsConverted(params.email).catch((error) => {
      console.error('Failed to mark lead as converted:', error);
    });
  }
}

/**
 * Update user backup on sign-in
 */
export async function updateUserBackupOnSignIn(params: {
  email: string;
  name: string;
  userId: string;
}): Promise<void> {
  const userData: FirebaseUserBackup = {
    email: params.email,
    name: params.name,
    createdAt: new Date(),
    userId: params.userId,
    registrationSource: 'email',
    lastSyncedAt: new Date(),
  };

  backupUserToFirebase(userData).catch((error) => {
    console.error('Failed to update user backup:', error);
  });
}
