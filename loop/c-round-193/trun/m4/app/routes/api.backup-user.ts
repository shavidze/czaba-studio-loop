import { type ActionFunctionArgs, json } from '@remix-run/node';
import { backupNewUser, updateUserBackupOnSignIn } from '~/lib/auth-backup.server';

interface BackupUserRequest {
  email: string;
  name: string;
  userId: string;
  source: 'email' | 'social-google' | 'social-facebook';
  isNewUser: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = (await request.json()) as BackupUserRequest;
    const { email, name, userId, source, isNewUser } = body;

    if (!email || !name || !userId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isNewUser) {
      await backupNewUser({
        email,
        name,
        userId,
        source,
      });
    } else {
      await updateUserBackupOnSignIn({
        email,
        name,
        userId,
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Firebase backup error:', error);
    return json({ success: true });
  }
}

export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}
