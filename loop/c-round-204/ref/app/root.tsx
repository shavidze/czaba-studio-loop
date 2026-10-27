import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from '@remix-run/react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '~/components/animations';
import { AudioPlayer, StemsPlayerModal } from '~/components/audio';
import { AuthModal } from '~/components/auth';
import { CookieConsent } from '~/components/common';
import { Header } from '~/components/layout';
import { LeadMagnetPopup } from '~/components/marketing';
import { ToastContainer } from '~/components/ui';
import { useAuth, useCart, useSmoothScroll, useToast } from '~/hooks';
import { GA4_MEASUREMENT_ID } from '~/lib/analytics';
import { FB_PIXEL_ID } from '~/lib/facebook-pixel';
import { useFocusSourceAttribute } from '~/lib/focus-source';
import { AudioProvider } from './contexts/AudioContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ChatProvider } from './contexts/ChatContext';
import { FiltersProvider } from './contexts/FiltersContext';
import { PurchasesProvider } from './contexts/PurchasesContext';
import { StemsProvider } from './contexts/StemsContext';
import { ToastProvider } from './contexts/ToastContext';
import appStyles from './styles/app.css?url';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
  },
  { rel: 'stylesheet', href: appStyles },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* GA4 Script - ყოველთვის ჩაიტვირთება, consent mode აკონტროლებს tracking-ს */}
        {GA4_MEASUREMENT_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}

                  // Default consent - denied სანამ მომხმარებელი არ დათანხმდება
                  gtag('consent', 'default', {
                    'analytics_storage': 'denied',
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                  });

                  // თუ უკვე აქვს consent, განაახლე
                  if (typeof localStorage !== 'undefined' && localStorage.getItem('czaba_analytics_consent') === 'granted') {
                    gtag('consent', 'update', {
                      'analytics_storage': 'granted',
                    });
                  }
                `,
              }}
            />
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  gtag('js', new Date());
                  gtag('config', '${GA4_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        {/* Facebook Pixel */}
        {FB_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('consent', 'revoke');
                fbq('init', '${FB_PIXEL_ID}');

                // თუ უკვე აქვს consent
                if (typeof localStorage !== 'undefined' && localStorage.getItem('czaba_analytics_consent') === 'granted') {
                  fbq('consent', 'grant');
                  fbq('track', 'PageView');
                }
              `,
            }}
          />
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigation = useNavigation();

  // Smooth scroll - premium scrolling experience
  useSmoothScroll();
  useFocusSourceAttribute();

  // Hide header and other UI elements for studio page (full-screen DAW experience)
  const isStudioPage = location.pathname.startsWith('/studio');

  // Show loading indicator during navigation
  const isNavigating = navigation.state === 'loading';

  return (
    <>
      {!isStudioPage && <Header cartCount={cartCount} />}
      {/* Navigation loading bar */}
      {isNavigating && <div className="nav-loading-bar" />}
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
      {!isStudioPage && (
        <>
          <AudioPlayer />
          <StemsPlayerModal />
          <LeadMagnetPopup isLoggedIn={isAuthenticated} />
        </>
      )}
      <AuthModal />
      <ToastContainer />
      <CookieConsent />
    </>
  );
}

// Wrapper component that connects CartProvider to ToastProvider
function CartWithToast({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  return <CartProvider onToast={showToast}>{children}</CartProvider>;
}

export default function App() {
  return (
    <AuthProvider>
      <PurchasesProvider>
        <ToastProvider>
          <CartWithToast>
            <AudioProvider>
              <StemsProvider>
                <FiltersProvider>
                  <ChatProvider>
                    <AppContent />
                  </ChatProvider>
                </FiltersProvider>
              </StemsProvider>
            </AudioProvider>
          </CartWithToast>
        </ToastProvider>
      </PurchasesProvider>
    </AuthProvider>
  );
}

export { RootErrorBoundary as ErrorBoundary } from '~/components/errors';
