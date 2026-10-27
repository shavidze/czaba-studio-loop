/**
 * Free Downloads Page
 * Premium presentation of free content with email capture
 */

import { type ActionFunctionArgs, json, type MetaFunction } from '@remix-run/node';
import * as React from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Free Samples | CZABA - Complimentary Sound Packs' },
    {
      name: 'description',
      content:
        'Experience CZABA quality firsthand. Complimentary professional sound packs, loops, and SFX. Same studio standards, no credit card required.',
    },
    { property: 'og:title', content: 'Complimentary Sound Packs from CZABA' },
    {
      property: 'og:description',
      content: 'Professional sound packs, loops, and SFX. Studio quality, complimentary.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Complimentary Sound Packs from CZABA' },
    {
      name: 'twitter:description',
      content: 'Professional sound packs, loops, and SFX. Studio quality, complimentary.',
    },
  ];
};

import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { Check, Download, Mail, Mic, Music, Sliders } from 'lucide-react';
import { debug } from '~/lib/debug';
import { backupLeadToFirebase, type FirebaseLeadBackup } from '~/lib/firebase.server';

interface FreeItem {
  id: string;
  title: string;
  description: string;
  type: 'loop' | 'sfx' | 'preset';
  fileSize: string;
  format: string;
  image?: string;
}

export async function loader() {
  const freeItems: FreeItem[] = [
    {
      id: '1',
      title: 'Lo-Fi Essentials Starter',
      description: '10 carefully crafted lo-fi loops to kickstart your production',
      type: 'loop',
      fileSize: '45 MB',
      format: 'WAV 24-bit',
    },
    {
      id: '2',
      title: 'Cinematic Impacts',
      description: '5 powerful cinematic impact sounds',
      type: 'sfx',
      fileSize: '28 MB',
      format: 'WAV 24-bit',
    },
    {
      id: '3',
      title: 'Ambient Textures',
      description: '8 atmospheric ambient textures for your projects',
      type: 'sfx',
      fileSize: '52 MB',
      format: 'WAV 24-bit',
    },
  ];

  return json({ freeItems });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const itemId = formData.get('itemId');
  const itemTitle = formData.get('itemTitle');
  const honeypot = formData.get('website');

  if (honeypot) {
    return json({ success: true, message: 'Check your email for the download link!', itemId });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return json({ error: 'Please enter a valid email address', success: false });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID);

  if (!BREVO_API_KEY) {
    debug.log('Brevo API key missing');
    return json({ error: 'Server configuration error', success: false }, { status: 500 });
  }

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
        attributes: {
          SOURCE: 'free-downloads',
          FREE_ITEM: itemTitle || itemId,
          SIGNUP_DATE: new Date().toISOString(),
        },
      }),
    });

    debug.log('Brevo response:', brevoResponse.status);

    const leadData: FirebaseLeadBackup = {
      email: email as string,
      claimedAt: new Date(),
      brevoSynced: brevoResponse.status === 201 || brevoResponse.status === 204,
      convertedToCustomer: false,
      source: 'free-downloads',
    };

    backupLeadToFirebase(leadData).catch((error) => {
      debug.log('Firebase backup error:', error);
    });

    return json({
      success: true,
      message: 'Check your email for the download link!',
      itemId,
    });
  } catch (error) {
    debug.log('Free download subscription error:', error);
    return json(
      { error: 'Something went wrong. Please try again.', success: false },
      { status: 500 },
    );
  }
}

export default function FreeDownloadsPage() {
  const { freeItems } = useLoaderData<typeof loader>();

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, hsl(220, 20%, 4%) 0%, hsla(140, 70%, 35%, 0.08) 50%, hsl(220, 20%, 4%) 100%)`,
      }}
    >
      <header className="pt-32 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand rounded-full" />
          <span className="text-brand text-sm font-medium">Complimentary</span>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground tracking-tight mb-4">
          Start Creating Today
        </h1>
        <p className="text-lg text-muted max-w-4xl mx-auto px-4">
          Experience our quality firsthand. Same professional standards, completely free. No credit
          card required.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValueCard
            icon={<Music size={24} />}
            title="Studio Quality"
            description="Same quality as our premium packs"
          />
          <ValueCard
            icon={<Check size={24} />}
            title="Full Creative Freedom"
            description="Use in any project, commercial or personal"
          />
          <ValueCard
            icon={<Download size={24} />}
            title="Instant Access"
            description="Download immediately after signup"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-32">
        <div className="space-y-8">
          {freeItems.map((item) => (
            <FreeItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 bg-surface/60 border border-outline rounded-2xl">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-brand/10 text-brand rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-foreground font-medium mb-1">{title}</h3>
      <p className="text-muted text-sm">{description}</p>
    </div>
  );
}

function FreeItemCard({ item }: { item: FreeItem }) {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isSubmitting = navigation.state === 'submitting';
  const isSuccess = actionData?.success && 'itemId' in actionData && actionData.itemId === item.id;

  const typeIcons: Record<string, React.ReactNode> = {
    loop: <Music size={20} />,
    sfx: <Mic size={20} />,
    preset: <Sliders size={20} />,
  };

  const typeClasses: Record<string, { bg: string; text: string; badgeBg: string }> = {
    loop: { bg: 'bg-brand/10', text: 'text-brand', badgeBg: 'bg-brand/15' },
    sfx: { bg: 'bg-accent/10', text: 'text-accent', badgeBg: 'bg-accent/15' },
    preset: { bg: 'bg-brand/10', text: 'text-brand', badgeBg: 'bg-brand/15' },
  };

  const typeStyle = typeClasses[item.type] || typeClasses.loop;

  return (
    <div className="bg-surface/60 border border-outline rounded-2xl overflow-hidden transition-all duration-300 hover:border-outline-hover">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div
            className={`flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center ${typeStyle.bg}`}
          >
            <div className={typeStyle.text}>{typeIcons[item.type]}</div>
          </div>

          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <span
                className={`text-[10px] font-medium tracking-wider uppercase px-2 py-1 rounded-full ${typeStyle.badgeBg} ${typeStyle.text}`}
              >
                {item.type}
              </span>
            </div>
            <p className="text-muted mb-3">{item.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>{item.format}</span>
              <span className="w-1 h-1 bg-muted-bg rounded-full" />
              <span>{item.fileSize}</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            {isSuccess ? (
              <div className="flex items-center gap-2 text-brand">
                <Check size={20} />
                <span className="text-sm">On its way to your inbox</span>
              </div>
            ) : (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-6 py-3 bg-brand hover:bg-brand/90 text-background font-medium rounded-full transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        {isExpanded && !isSuccess && (
          <div className="mt-6 pt-6 border-t border-outline">
            <Form method="post" className="flex flex-col sm:flex-row gap-3">
              <input type="hidden" name="itemId" value={item.id} />
              <input type="hidden" name="itemTitle" value={item.title} />
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] opacity-0 pointer-events-none"
              />
              <div className="flex-grow relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-elevated border border-outline-strong rounded-full text-foreground placeholder:text-muted transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-foreground text-background font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Sending...' : 'Send Download Link'}
              </button>
            </Form>
            {actionData && 'error' in actionData && actionData.error && (
              <p className="mt-3 text-destructive text-sm">{actionData.error}</p>
            )}
            <p className="mt-3 text-muted text-xs">
              We'll send you the download link and occasional updates. Unsubscribe anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
