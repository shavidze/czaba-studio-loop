import type { MetaFunction } from '@remix-run/node';
import { Footer } from '~/components/layout/Footer';
import { PageContainer } from '~/components/layout/PageContainer';

export const meta: MetaFunction = () => {
  return [
    { title: 'Cookie Policy | CZABA' },
    {
      name: 'description',
      content: 'CZABA Cookie Policy - How we use cookies and similar technologies.',
    },
  ];
};

export default function CookiePolicy() {
  return (
    <>
      <main className="min-h-screen bg-background pt-32 pb-20">
        <PageContainer>
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-16 text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">Cookie Policy</h1>
              <p className="text-muted">Last updated: January 9, 2026</p>
            </header>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <Section title="Introduction">
                <p>
                  This Cookie Policy explains how CZABA ("Company," "we," "us," and "our") uses
                  cookies and similar technologies to recognize you when you visit our website. It
                  explains what these technologies are and why we use them, as well as your rights
                  to control our use of them.
                </p>
              </Section>

              <Section title="What are cookies?">
                <p>
                  Cookies are small data files that are placed on your computer or mobile device
                  when you visit a website. Cookies are widely used by website owners to make their
                  websites work, or to work more efficiently, as well as to provide reporting
                  information.
                </p>
                <p>
                  Cookies set by the website owner (in this case, CZABA) are called "first-party
                  cookies." Cookies set by parties other than the website owner are called
                  "third-party cookies." Third-party cookies enable third-party features or
                  functionality to be provided on or through the website (e.g., advertising,
                  interactive content, and analytics).
                </p>
              </Section>

              <Section title="Why do we use cookies?">
                <p>
                  We use first- and third-party cookies for several reasons. Some cookies are
                  required for technical reasons in order for our Website to operate, and we refer
                  to these as "essential" or "strictly necessary" cookies. Other cookies enable us
                  to track and target the interests of our users to enhance the experience on our
                  website.
                </p>
              </Section>

              <Section title="Types of cookies we use">
                <h3>Essential Cookies</h3>
                <p>
                  These cookies are strictly necessary for the website to function. They enable core
                  functionality such as security, account authentication, and remembering your cart
                  items.
                </p>

                <h3>Analytics Cookies</h3>
                <p>
                  These cookies collect information about how you use our website, such as which
                  pages you visit and if you experience any errors. We use this data to improve our
                  website.
                </p>
                <CookieTable
                  cookies={[
                    {
                      name: '_ga, _ga_*',
                      provider: 'Google Analytics',
                      purpose: 'Distinguish unique users and track site usage',
                      expiry: '2 years',
                    },
                  ]}
                />

                <h3>Marketing Cookies</h3>
                <p>
                  These cookies track your online activity to help advertisers deliver more relevant
                  advertising or to limit how many times you see an ad.
                </p>
                <CookieTable
                  cookies={[
                    {
                      name: '_fbp',
                      provider: 'Facebook Pixel',
                      purpose: 'Identify browsers for advertising and analytics',
                      expiry: '3 months',
                    },
                  ]}
                />

                <h3>Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalization, such as
                  remembering your preferences and settings.
                </p>
                <CookieTable
                  cookies={[
                    {
                      name: 'czaba_cookie_consent',
                      provider: 'CZABA',
                      purpose: 'Remember your cookie preferences',
                      expiry: '1 year',
                    },
                    {
                      name: 'czaba_lead_magnet',
                      provider: 'CZABA',
                      purpose: 'Track lead magnet interactions',
                      expiry: 'Persistent',
                    },
                  ]}
                />
              </Section>

              <Section title="How can I control cookies?">
                <p>
                  You have the right to decide whether to accept or reject cookies. You can exercise
                  your cookie rights by setting your preferences in the Cookie Consent Manager that
                  appears when you first visit our website.
                </p>
                <p>
                  You can also set or amend your web browser controls to accept or refuse cookies.
                  If you choose to reject cookies, you may still use our website though your access
                  to some functionality may be restricted.
                </p>

                <h3>Browser Controls</h3>
                <p>Most browsers allow you to manage cookies through their settings:</p>
                <ul>
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Chrome
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Firefox
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Safari
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      Edge
                    </a>
                  </li>
                </ul>
              </Section>

              <Section title="Other tracking technologies">
                <p>
                  Cookies are not the only way to track visitors. We may use other similar
                  technologies like web beacons (sometimes called "tracking pixels"). These are tiny
                  graphics files that contain a unique identifier that enables us to recognize when
                  someone has visited our website or opened an email.
                </p>
              </Section>

              <Section title="Updates to this policy">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes to the
                  cookies we use or for other operational, legal, or regulatory reasons. Please
                  revisit this policy regularly to stay informed about our use of cookies.
                </p>
              </Section>

              <Section title="Contact us">
                <p>If you have any questions about our use of cookies, please contact us:</p>
                <ul>
                  <li>
                    Email:{' '}
                    <a href="mailto:support@czaba.com" className="text-brand hover:underline">
                      support@czaba.com
                    </a>
                  </li>
                </ul>
              </Section>
            </div>
          </article>
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-4 pb-2 border-b border-outline">
        {title}
      </h2>
      <div className="text-muted space-y-4 [&>h3]:text-foreground [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p>a]:text-brand [&>p>a]:hover:underline">
        {children}
      </div>
    </section>
  );
}

interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
}

function CookieTable({ cookies }: { cookies: CookieInfo[] }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-outline">
      <table className="w-full text-sm">
        <thead className="bg-elevated">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Provider</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Purpose</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Expiry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline">
          {cookies.map((cookie, i) => (
            <tr key={i} className="bg-surface">
              <td className="px-4 py-3 text-muted font-mono text-xs">{cookie.name}</td>
              <td className="px-4 py-3 text-muted">{cookie.provider}</td>
              <td className="px-4 py-3 text-muted">{cookie.purpose}</td>
              <td className="px-4 py-3 text-muted">{cookie.expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
