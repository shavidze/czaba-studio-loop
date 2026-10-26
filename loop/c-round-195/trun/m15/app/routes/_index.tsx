import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { debug } from '~/lib/debug';
import { backupLeadToFirebase, type FirebaseLeadBackup } from '~/lib/firebase.server';
import { apiClient, type Product } from '~/services/api/client';

export const meta: MetaFunction = () => {
  return [
    { title: 'CZABA | Premium Cinematic Sound Design' },
    {
      name: 'description',
      content:
        'Professional sound design for producers, artists, and creators. Complete creative freedom with every purchase.',
    },
    { property: 'og:title', content: 'CZABA | Premium Cinematic Sound Design' },
    {
      property: 'og:description',
      content:
        'Professional sound design for producers, artists, and creators. Complete creative freedom with every purchase.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.jpg' },
    { property: 'og:url', content: 'https://czaba.com' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CZABA | Premium Cinematic Sound Design' },
    {
      name: 'twitter:description',
      content: 'Professional sound design for producers, artists, and creators.',
    },
    { name: 'twitter:image', content: '/og-image.jpg' },
  ];
};

import { ScrollReveal } from '~/components/animations';
import { SpotlightLoader } from '~/components/common';
import {
  HeroSection,
  NewsletterSection,
  ProductSection,
  SpecialOffersSection,
  StudioShowcase,
} from '~/components/home';
import { Footer } from '~/components/layout/Footer';

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const result = await apiClient.getProducts({ pageSize: 12, sortDesc: true });

    const musicProducts = result.items.filter((product) => product.isActive);

    return json<{
      musicProducts: Product[];
      sfxProducts: Product[];
      presetsProducts: Product[];
      freeDownloads: Product[];
    }>({
      musicProducts,
      sfxProducts: [],
      presetsProducts: [],
      freeDownloads: [],
    });
  } catch (error) {
    console.error('Error loading homepage products:', error);
    return json<{
      musicProducts: Product[];
      sfxProducts: Product[];
      presetsProducts: Product[];
      freeDownloads: Product[];
    }>({
      musicProducts: [],
      sfxProducts: [],
      presetsProducts: [],
      freeDownloads: [],
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const honeypot = formData.get('website');

  if (honeypot) {
    return json({ success: true, message: 'Welcome to the Inner Circle!' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = Number(process.env.BREVO_LIST_ID);

  if (!BREVO_API_KEY) {
    debug.log('Brevo API key missing');
    return json({ error: 'Server configuration error' }, { status: 500 });
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
          SOURCE: 'newsletter',
          SIGNUP_DATE: new Date().toISOString(),
        },
      }),
    });

    debug.log('Brevo newsletter response:', brevoResponse.status);

    const leadData: FirebaseLeadBackup = {
      email: email as string,
      claimedAt: new Date(),
      brevoSynced: brevoResponse.status === 201 || brevoResponse.status === 204,
      convertedToCustomer: false,
      source: 'newsletter',
    };

    backupLeadToFirebase(leadData).catch((error) => {
      debug.log('Firebase backup error:', error);
    });

    return json({ success: true, message: 'Welcome to the Inner Circle!' });
  } catch (error) {
    debug.log('Newsletter subscription error:', error);
    return json(
      {
        error: 'Something went wrong. Please try again.',
        success: false,
      },
      { status: 500 },
    );
  }
}

export default function Homepage() {
  const { musicProducts, sfxProducts, presetsProducts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isLoading = navigation.state === 'loading';

  const latestReleases = [...musicProducts, ...sfxProducts, ...presetsProducts];

  return (
    <>
      <SpotlightLoader />
      <div className="homepage">
        <HeroSection />

        <ScrollReveal delay={0.1}>
          <ProductSection
            title={
              <>
                Latest <span className="text-glow">Releases</span>
              </>
            }
            description="Cinematic sound libraries, loops, and effects for your productions"
            products={latestReleases}
            viewAllLink="/store"
            viewAllText="Browse the Collection"
            isLoading={isLoading}
          />
        </ScrollReveal>

        <ScrollReveal>
          <StudioShowcase />
        </ScrollReveal>

        <ScrollReveal>
          <NewsletterSection />
        </ScrollReveal>

        <ScrollReveal>
          <SpecialOffersSection />
        </ScrollReveal>

        <Footer />
      </div>
    </>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from '~/components/errors';
