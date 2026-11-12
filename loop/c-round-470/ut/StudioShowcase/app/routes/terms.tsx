import type { MetaFunction } from '@remix-run/node';
import { Footer } from '~/components/layout/Footer';
import { PageContainer } from '~/components/layout/PageContainer';

export const meta: MetaFunction = () => {
  return [
    { title: 'Terms of Service | CZABA' },
    {
      name: 'description',
      content: 'CZABA Terms of Service - Terms and conditions for using our platform and products.',
    },
  ];
};

export default function TermsOfService() {
  return (
    <>
      <main className="min-h-screen bg-background pt-32 pb-20">
        <PageContainer>
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-16 text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
                Terms of Service
              </h1>
              <p className="text-muted">Last updated: January 9, 2026</p>
            </header>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <Section title="Agreement to Terms">
                <p>
                  By accessing or using CZABA's website and services, you agree to be bound by these
                  Terms of Service. If you do not agree to these terms, please do not use our
                  services.
                </p>
              </Section>

              <Section title="Products and Services">
                <p>
                  CZABA provides digital audio products including music tracks, sound effects, audio
                  presets, and related digital content for use in creative projects.
                </p>
                <h3>Digital Product Delivery</h3>
                <p>
                  All products are delivered digitally via download links sent to your registered
                  email address. Downloads are available immediately after purchase confirmation.
                </p>
              </Section>

              <Section title="License Terms">
                <p>
                  When you purchase a product from CZABA, you receive a license to use the audio
                  content according to the license type selected at purchase:
                </p>
                <ul>
                  <li>
                    <strong>Standard License:</strong> For personal and commercial projects with
                    standard distribution
                  </li>
                  <li>
                    <strong>Premium License:</strong> Extended rights including high-resolution
                    formats and additional usage rights
                  </li>
                </ul>
                <p>
                  Full license details are available on our{' '}
                  <a href="/license" className="text-brand hover:underline">
                    License page
                  </a>
                  .
                </p>
              </Section>

              <Section title="Prohibited Uses">
                <p>You may NOT:</p>
                <ul>
                  <li>Redistribute, resell, or share the original audio files</li>
                  <li>Claim ownership of the audio content</li>
                  <li>Use content in a way that competes with CZABA</li>
                  <li>Remove or alter any watermarks or metadata</li>
                  <li>Use content for illegal or defamatory purposes</li>
                  <li>Sell or otherwise transfer your account or profile</li>
                  <li>Use automated systems, bots, or scripts to access the Services</li>
                  <li>Circumvent security features or attempt unauthorized access</li>
                  <li>Interfere with or disrupt the Services or connected networks</li>
                </ul>
              </Section>

              <Section title="Account Responsibilities">
                <p>
                  You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account. Please notify us
                  immediately of any unauthorized use.
                </p>
              </Section>

              <Section title="Payments and Refunds">
                <h3>Payments</h3>
                <p>
                  All payments are processed securely through Stripe. Prices are displayed in USD
                  and may be subject to applicable taxes.
                </p>
                <h3>Refund Policy</h3>
                <p>
                  Due to the digital nature of our products, all sales are final. However, we may
                  consider refund requests in cases of:
                </p>
                <ul>
                  <li>Technical issues preventing download access</li>
                  <li>Duplicate purchases</li>
                  <li>Product not as described</li>
                </ul>
                <p>
                  Refund requests must be submitted within 14 days of purchase to{' '}
                  <a href="mailto:support@czaba.com" className="text-brand hover:underline">
                    support@czaba.com
                  </a>
                  .
                </p>
              </Section>

              <Section title="Intellectual Property">
                <p>
                  All content on this website, including audio files, images, text, and design, is
                  the property of CZABA or its licensors and is protected by copyright and other
                  intellectual property laws.
                </p>
              </Section>

              <Section title="Disclaimer of Warranties">
                <p>
                  Our services are provided "as is" without warranties of any kind. We do not
                  guarantee that our services will be uninterrupted, secure, or error-free.
                </p>
              </Section>

              <Section title="Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, CZABA shall not be liable for any
                  indirect, incidental, special, or consequential damages arising from your use of
                  our services, even if we have been advised of the possibility of such damages.
                </p>
                <p>
                  Notwithstanding anything to the contrary, our liability to you for any cause
                  whatsoever shall at all times be limited to the amount paid, if any, by you to us
                  during the period prior to the cause of action.
                </p>
              </Section>

              <Section title="User Representations">
                <p>By using our Services, you represent and warrant that:</p>
                <ul>
                  <li>You have the legal capacity and agree to comply with these Terms</li>
                  <li>You are not a minor in your jurisdiction of residence</li>
                  <li>You will not access the Services through automated or non-human means</li>
                  <li>You will not use the Services for any illegal or unauthorized purpose</li>
                  <li>
                    Your use of the Services will not violate any applicable law or regulation
                  </li>
                </ul>
              </Section>

              <Section title="Term and Termination">
                <p>
                  These Terms remain in effect while you use our Services. We reserve the right to
                  deny access to and use of the Services to any person for any reason, including for
                  breach of any representation, warranty, or covenant contained in these Terms.
                </p>
                <p>
                  We may terminate your use of the Services or delete any content you have posted at
                  any time, without warning, in our sole discretion. If we terminate your account,
                  you are prohibited from registering a new account under your name, a fake name, or
                  the name of any third party.
                </p>
              </Section>

              <Section title="Modifications and Interruptions">
                <p>
                  We reserve the right to change, modify, or remove the contents of the Services at
                  any time for any reason at our sole discretion without notice. We are not liable
                  for any modification, price change, suspension, or discontinuance of the Services.
                </p>
                <p>
                  We cannot guarantee the Services will be available at all times. We may experience
                  hardware, software, or other problems resulting in interruptions, delays, or
                  errors. You agree that we have no liability for any loss, damage, or inconvenience
                  caused by your inability to access the Services during any downtime.
                </p>
              </Section>

              <Section title="Governing Law">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of
                  Georgia, without regard to its conflict of law provisions.
                </p>
              </Section>

              <Section title="Dispute Resolution">
                <h3>Informal Negotiations</h3>
                <p>
                  To expedite resolution and control costs, you and CZABA agree to first attempt to
                  negotiate any dispute informally for at least 30 days before initiating
                  arbitration. Informal negotiations begin upon written notice from one party to the
                  other.
                </p>
                <h3>Binding Arbitration</h3>
                <p>
                  If informal negotiations fail, any dispute shall be finally resolved by binding
                  arbitration in Tbilisi, Georgia. The arbitration shall be conducted in English and
                  governed by the laws of Georgia.
                </p>
                <h3>Restrictions</h3>
                <p>
                  Any arbitration shall be limited to the dispute between the parties individually.
                  No arbitration shall be joined with any other proceeding, and there is no right
                  for any dispute to be arbitrated on a class-action basis.
                </p>
              </Section>

              <Section title="Electronic Communications">
                <p>
                  Visiting our website, sending us emails, and completing online forms constitute
                  electronic communications. You consent to receive electronic communications, and
                  you agree that all agreements, notices, disclosures, and other communications we
                  provide electronically satisfy any legal requirement that such communication be in
                  writing.
                </p>
              </Section>

              <Section title="Changes to Terms">
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective
                  immediately upon posting. Your continued use of our services constitutes
                  acceptance of the modified terms.
                </p>
              </Section>

              <Section title="Gift Cards">
                <p>CZABA digital gift cards are subject to the following terms:</p>
                <ul>
                  <li>
                    <strong>Non-refundable:</strong> Gift card purchases cannot be refunded or
                    exchanged for cash
                  </li>
                  <li>
                    <strong>No expiration:</strong> CZABA gift cards never expire
                  </li>
                  <li>
                    <strong>Universal use:</strong> Gift cards can be used for any product on the
                    CZABA store
                  </li>
                  <li>
                    <strong>Balance retention:</strong> If your purchase is less than your gift card
                    balance, the remaining balance stays on your gift card for future use
                  </li>
                  <li>
                    <strong>Combinable:</strong> Multiple gift cards can be applied to a single
                    order
                  </li>
                  <li>
                    <strong>Non-transferable:</strong> Gift cards cannot be resold or transferred
                    for value
                  </li>
                  <li>
                    <strong>Lost cards:</strong> CZABA is not responsible for lost or stolen gift
                    card codes
                  </li>
                </ul>
                <p>
                  For gift card support, please contact{' '}
                  <a href="mailto:support@czaba.com" className="text-brand hover:underline">
                    support@czaba.com
                  </a>
                  .
                </p>
              </Section>

              <Section title="Contact">
                <p>For questions about these Terms, please contact us:</p>
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
