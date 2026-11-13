import { Link } from '@remix-run/react';
import { CollapsibleSocialLinks } from '~/components/ui';
import { releaseLinkFocus } from '~/lib/link-focus';
import { PageContainer } from './PageContainer';

const APP_NAME = 'CZABA';
const APP_TAGLINE = 'Cinematic Sound Design for Creators';
const ROUTES = {
  store: '/store',
  giftCards: '/gift-cards',
  contact: '/hire-us',
  support: '/support',
  faq: '/faq',
  license: '/license',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
};

export function Footer() {
  const link = 'block text-muted hover:text-brand mb-4 transition-colors cursor-pointer';

  return (
    <footer className="border-t border-outline bg-background py-12">
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 pb-12 border-b border-outline mb-8">
          {/* Brand + Social */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-brand">{APP_NAME}</h3>
              <CollapsibleSocialLinks />
            </div>
            <p className="text-muted">{APP_TAGLINE}</p>
          </div>

          {/* Navigation - 2 columns */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-6">Navigation</h4>
              <Link to={ROUTES.store} className={link} onClick={releaseLinkFocus}>
                Store
              </Link>
              <Link to={ROUTES.giftCards} className={link} onClick={releaseLinkFocus}>
                Gift Cards
              </Link>
              <Link to={ROUTES.contact} className={link} onClick={releaseLinkFocus}>
                Hire Us
              </Link>
              <Link to={ROUTES.support} className={link} onClick={releaseLinkFocus}>
                Support
              </Link>
              <Link to={ROUTES.faq} className={link} onClick={releaseLinkFocus}>
                FAQ
              </Link>
              <Link to={ROUTES.license} className={link} onClick={releaseLinkFocus}>
                License
              </Link>
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground mb-6">Legal</h4>
              <Link to={ROUTES.privacy} className={link} onClick={releaseLinkFocus}>
                Privacy Policy
              </Link>
              <Link to={ROUTES.terms} className={link} onClick={releaseLinkFocus}>
                Terms of Service
              </Link>
              <Link to={ROUTES.cookies} className={link} onClick={releaseLinkFocus}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-base text-muted">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
