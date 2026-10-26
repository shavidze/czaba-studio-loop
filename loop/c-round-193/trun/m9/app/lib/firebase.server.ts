/**
 * Firebase Admin SDK (Server-side only)
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';

let firestore: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK
 * Requires service account credentials in environment variables
 */
export function getFirebaseAdmin(): Firestore {
  if (firestore) {
    return firestore;
  }

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length === 0) {
    // Initialize with service account
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  firestore = getFirestore();

  // undefined მნიშვნელობების იგნორირება
  firestore.settings({ ignoreUndefinedProperties: true });

  return firestore;
}

/**
 * User backup data structure
 */
export interface FirebaseUserBackup {
  email: string;
  name: string;
  createdAt: Date;
  userId: string;
  registrationSource: 'email' | 'social-google' | 'social-facebook';
  lastSyncedAt: Date;
}

/**
 * Lead magnet backup data structure
 */
export interface FirebaseLeadBackup {
  email: string;
  claimedAt: Date;
  brevoSynced: boolean;
  convertedToCustomer: boolean;
  source: 'popup' | 'footer' | 'landing-page' | 'newsletter' | 'free-downloads';
}

/**
 * Backup user to Firebase
 */
export async function backupUserToFirebase(userData: FirebaseUserBackup): Promise<void> {
  try {
    const db = getFirebaseAdmin();

    // Use email as document ID for easy lookup
    const userRef = db.collection('users').doc(userData.email);

    await userRef.set(userData, { merge: true });
  } catch (_error) {
    // Backup failure shouldn't break main flow
  }
}

/**
 * Backup lead magnet submission to Firebase
 */
export async function backupLeadToFirebase(leadData: FirebaseLeadBackup): Promise<void> {
  try {
    const db = getFirebaseAdmin();

    const leadRef = db.collection('lead_magnets').doc(leadData.email);

    await leadRef.set(leadData, { merge: true });
  } catch (_error) {
    // Lead backup failure shouldn't break main flow
  }
}

/**
 * Check if user exists in Firebase backup
 */
export async function checkUserBackupExists(email: string): Promise<boolean> {
  try {
    const db = getFirebaseAdmin();
    const userDoc = await db.collection('users').doc(email).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error checking Firebase backup:', error);
    return false;
  }
}

/**
 * Update user's last synced timestamp
 */
export async function updateUserSyncTimestamp(email: string): Promise<void> {
  try {
    const db = getFirebaseAdmin();
    await db.collection('users').doc(email).update({
      lastSyncedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating sync timestamp:', error);
  }
}

/**
 * Mark lead as converted to customer
 */
export async function markLeadAsConverted(email: string): Promise<void> {
  try {
    const db = getFirebaseAdmin();
    await db.collection('lead_magnets').doc(email).update({
      convertedToCustomer: true,
      convertedAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking lead as converted:', error);
  }
}
