import { type ActionFunctionArgs, json } from '@remix-run/node';
import { backupLeadToFirebase, type FirebaseLeadBackup } from '~/lib/firebase.server';

interface BrevoContact {
  email: string;
  listIds?: number[];
  updateEnabled?: boolean;
  attributes?: {
    [key: string]: string | number | boolean;
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID);

  if (!BREVO_API_KEY) {
    return json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Create contact in Brevo
    const contactData: BrevoContact = {
      email,
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,
      attributes: {
        SOURCE: 'lead-magnet',
        SIGNUP_DATE: new Date().toISOString(),
      },
    };
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(contactData),
    });

    // Brevo returns 204 with no body for existing contacts - don't try to parse JSON
    let responseData: Record<string, unknown> = {};
    if (response.status !== 204) {
      const text = await response.text();
      if (text) {
        try {
          responseData = JSON.parse(text);
        } catch {
          // JSON parse failed - continue with empty responseData
        }
      }
    }

    // Brevo returns 201 for new contact, 204 or 400 for existing
    if (response.status === 201) {
      // New contact created successfully

      // Backup to Firebase (async, don't block)
      const leadData: FirebaseLeadBackup = {
        email,
        claimedAt: new Date(),
        brevoSynced: true,
        convertedToCustomer: false,
        source: 'popup',
      };
      backupLeadToFirebase(leadData).catch(() => {});

      return json({ success: true, message: 'Subscribed successfully!' });
    } else if (
      response.status === 204 ||
      (response.status === 400 && responseData.code === 'duplicate_parameter')
    ) {
      // Contact already exists - still a success from user perspective

      // Backup to Firebase even for existing (update timestamp)
      const leadData: FirebaseLeadBackup = {
        email,
        claimedAt: new Date(),
        brevoSynced: true,
        convertedToCustomer: false,
        source: 'popup',
      };
      backupLeadToFirebase(leadData).catch(() => {});

      return json({ success: true, message: 'Email already subscribed!' });
    } else {
      return json(
        { error: responseData.message || 'Failed to subscribe' },
        { status: response.status },
      );
    }
  } catch {
    return json({ error: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}

// Don't allow GET requests
export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}
