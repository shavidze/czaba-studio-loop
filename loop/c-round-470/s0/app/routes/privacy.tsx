import type { MetaFunction } from '@remix-run/node';
import { Footer } from '~/components/layout/Footer';
import { PageContainer } from '~/components/layout/PageContainer';

export const meta: MetaFunction = () => {
  return [
    { title: 'Privacy Policy | CZABA' },
    {
      name: 'description',
      content: 'CZABA Privacy Policy - How we collect, use, and protect your information.',
    },
  ];
};

// Get Termly URL from environment variable
const TERMLY_PRIVACY_POLICY_URL = import.meta.env.VITE_TERMLY_PRIVACY_POLICY_URL || '';

export default function PrivacyPolicy() {
  // If Termly URL is set, show iframe embed
  if (TERMLY_PRIVACY_POLICY_URL) {
    return (
      <>
        <main className="min-h-screen bg-background pt-24 pb-20">
          <PageContainer>
            <div className="max-w-4xl mx-auto">
              <iframe
                src={TERMLY_PRIVACY_POLICY_URL}
                title="Privacy Policy"
                className="w-full min-h-[80vh] rounded-lg border border-outline bg-white"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </PageContainer>
        </main>
        <Footer />
      </>
    );
  }

  // Fallback to static content
  return (
    <>
      <main className="min-h-screen bg-background pt-32 pb-20">
        <PageContainer>
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-16 text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">Privacy Policy</h1>
              <p className="text-muted">Last updated: January 9, 2026</p>
            </header>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <Section title="Summary of Key Points">
                <p>
                  This summary provides key points from our privacy policy. You can find out more
                  details about any of these topics by reading the full policy below.
                </p>
                <ul>
                  <li>
                    <strong>What personal information do we process?</strong> When you visit, use,
                    or navigate our Services, we may process personal information depending on how
                    you interact with us and the Services, the choices you make, and the products
                    and features you use.
                  </li>
                  <li>
                    <strong>Do we process any sensitive personal information?</strong> We do not
                    process sensitive personal information.
                  </li>
                  <li>
                    <strong>Do we collect any information from third parties?</strong> We may
                    collect information from public databases, marketing partners, social media
                    platforms, and other outside sources.
                  </li>
                  <li>
                    <strong>How do we process your information?</strong> We process your information
                    to provide, improve, and administer our Services, communicate with you, for
                    security and fraud prevention, and to comply with law.
                  </li>
                  <li>
                    <strong>How do we keep your information safe?</strong> We have adequate
                    organizational and technical processes and procedures in place to protect your
                    personal information.
                  </li>
                  <li>
                    <strong>What are your rights?</strong> Depending on where you are located
                    geographically, the applicable privacy law may mean you have certain rights
                    regarding your personal information.
                  </li>
                </ul>
              </Section>

              <Section title="What Information Do We Collect?">
                <h3>Personal Information You Disclose to Us</h3>
                <p>We collect personal information that you voluntarily provide to us when you:</p>
                <ul>
                  <li>Register on the Services</li>
                  <li>Express an interest in obtaining information about us or our products</li>
                  <li>Participate in activities on the Services</li>
                  <li>Contact us</li>
                </ul>

                <h3>Personal Information Provided by You</h3>
                <p>
                  The personal information we collect depends on how you interact with us. We may
                  collect:
                </p>
                <ul>
                  <li>
                    <strong>Names</strong>
                  </li>
                  <li>
                    <strong>Phone numbers</strong>
                  </li>
                  <li>
                    <strong>Email addresses</strong>
                  </li>
                  <li>
                    <strong>Mailing addresses</strong>
                  </li>
                  <li>
                    <strong>Usernames</strong>
                  </li>
                  <li>
                    <strong>Passwords</strong>
                  </li>
                  <li>
                    <strong>Contact preferences</strong>
                  </li>
                  <li>
                    <strong>Contact or authentication data</strong>
                  </li>
                  <li>
                    <strong>Billing addresses</strong>
                  </li>
                  <li>
                    <strong>Debit/credit card numbers</strong>
                  </li>
                </ul>

                <h3>Payment Data</h3>
                <p>
                  We may collect data necessary to process your payment if you choose to make
                  purchases, such as your payment instrument number and the security code associated
                  with your payment instrument. All payment data is handled and stored by Stripe.
                  You may find their privacy policy at{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                  >
                    https://stripe.com/privacy
                  </a>
                  .
                </p>

                <h3>Social Media Login Data</h3>
                <p>
                  We offer you the ability to register and log in using your third-party social
                  media account (such as Google or Facebook). When you register using a social media
                  account, we may collect your name, email address, profile picture, and other
                  information you choose to make public.
                </p>

                <h3>Information Automatically Collected</h3>
                <p>
                  We automatically collect certain information when you visit, use, or navigate the
                  Services. This information does not reveal your specific identity but may include:
                </p>
                <ul>
                  <li>
                    <strong>Device and Usage Information:</strong> Browser and device
                    characteristics, operating system, language preferences, referring URLs, device
                    name, country, location, information about how and when you use our Services,
                    and other technical information.
                  </li>
                  <li>
                    <strong>Log and Usage Data:</strong> Service-related, diagnostic, usage, and
                    performance information our servers automatically collect, including IP address,
                    device information, browser type, and pages visited.
                  </li>
                  <li>
                    <strong>Location Data:</strong> We may collect information about your device's
                    location, which can be either precise or imprecise based on your IP address.
                  </li>
                </ul>
              </Section>

              <Section title="How Do We Process Your Information?">
                <p>We process your personal information for a variety of reasons:</p>
                <ul>
                  <li>
                    <strong>To facilitate account creation and authentication:</strong> We may
                    process your information so you can create and log in to your account, as well
                    as keep your account in working order.
                  </li>
                  <li>
                    <strong>To deliver services:</strong> We may process your information to provide
                    you with the requested service.
                  </li>
                  <li>
                    <strong>To respond to inquiries:</strong> We may process your information to
                    respond to your inquiries and solve any potential issues you might have.
                  </li>
                  <li>
                    <strong>To send administrative information:</strong> We may process your
                    information to send you details about our products and services, changes to our
                    terms and policies, and other similar information.
                  </li>
                  <li>
                    <strong>To fulfill orders:</strong> We may process your information to fulfill
                    and manage your orders, payments, returns, and exchanges.
                  </li>
                  <li>
                    <strong>To enable user-to-user communications:</strong> We may process your
                    information if you choose to use any of our offerings that allow for
                    communication with another user.
                  </li>
                  <li>
                    <strong>To request feedback:</strong> We may process your information when
                    necessary to request feedback and to contact you about your use of our Services.
                  </li>
                  <li>
                    <strong>To send marketing communications:</strong> We may process the personal
                    information you send to us for our marketing purposes, if this is in accordance
                    with your marketing preferences.
                  </li>
                  <li>
                    <strong>To protect our Services:</strong> We may process your information as
                    part of our efforts to keep our Services safe and secure.
                  </li>
                  <li>
                    <strong>To identify usage trends:</strong> We may process information about how
                    you use our Services to better understand how they are being used so we can
                    improve them.
                  </li>
                  <li>
                    <strong>To save or protect an individual's vital interest:</strong> We may
                    process your information when necessary to save or protect an individual's vital
                    interest, such as to prevent harm.
                  </li>
                </ul>
              </Section>

              <Section title="What Legal Bases Do We Rely On?">
                <p>
                  <em>If you are located in the EU or UK</em>, the General Data Protection
                  Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely
                  on to process your personal information:
                </p>
                <ul>
                  <li>
                    <strong>Consent:</strong> We may process your information if you have given us
                    permission to use your personal information for a specific purpose. You can
                    withdraw your consent at any time.
                  </li>
                  <li>
                    <strong>Performance of a Contract:</strong> We may process your personal
                    information when we believe it is necessary to fulfill our contractual
                    obligations to you, including providing our Services or at your request prior to
                    entering into a contract with you.
                  </li>
                  <li>
                    <strong>Legitimate Interests:</strong> We may process your information when we
                    believe it is reasonably necessary to achieve our legitimate business interests,
                    provided those interests do not override your interests, rights, and freedoms.
                  </li>
                  <li>
                    <strong>Legal Obligations:</strong> We may process your information where we
                    believe it is necessary for compliance with our legal obligations.
                  </li>
                </ul>
                <p>
                  <em>If you are located in Canada</em>, we may process your information if you have
                  given us specific permission to use your personal information for a specific
                  purpose, or in situations where your permission can be inferred.
                </p>
              </Section>

              <Section title="When and With Whom Do We Share Your Information?">
                <p>We may share your information in the following situations:</p>

                <h3>Business Transfers</h3>
                <p>
                  We may share or transfer your information in connection with, or during
                  negotiations of, any merger, sale of company assets, financing, or acquisition of
                  all or a portion of our business to another company.
                </p>

                <h3>Third-Party Service Providers</h3>
                <p>
                  We may share your data with the following categories of third-party service
                  providers:
                </p>
                <ul>
                  <li>
                    <strong>Communication & Collaboration Tools:</strong> Brevo (email marketing)
                  </li>
                  <li>
                    <strong>Social Networks:</strong> Google Sign-In, Facebook Login
                  </li>
                  <li>
                    <strong>User Account Registration & Authentication:</strong> Firebase
                    Authentication
                  </li>
                  <li>
                    <strong>Retargeting Platforms:</strong> Facebook Custom Audience
                  </li>
                  <li>
                    <strong>Web & Mobile Analytics:</strong> Google Analytics
                  </li>
                  <li>
                    <strong>Website Hosting:</strong> Vercel
                  </li>
                  <li>
                    <strong>Payment Processor:</strong> Stripe
                  </li>
                  <li>
                    <strong>Cloud Storage:</strong> Cloudflare R2
                  </li>
                </ul>
              </Section>

              <Section title="Do We Use Cookies and Other Tracking Technologies?">
                <p>
                  We may use cookies and similar tracking technologies to collect and store your
                  information. Specific information about how we use such technologies and how you
                  can refuse certain cookies is set out in our{' '}
                  <a href="/cookies" className="text-brand hover:underline">
                    Cookie Policy
                  </a>
                  .
                </p>
              </Section>

              <Section title="How Do We Handle Your Social Logins?">
                <p>
                  If you choose to register or log in to our Services using a social media account,
                  we may have access to certain information about you. The information we receive
                  depends on the social media provider and your privacy settings.
                </p>
                <p>
                  We will use the information we receive only for the purposes that are described in
                  this Privacy Policy or that are otherwise made clear to you. Please note that we
                  do not control, and are not responsible for, other uses of your personal
                  information by your third-party social media provider.
                </p>
              </Section>

              <Section title="Is Your Information Transferred Internationally?">
                <p>
                  Our servers are located in the United States. If you are accessing our Services
                  from outside the United States, please be aware that your information may be
                  transferred to, stored, and processed by us in our facilities and by third parties
                  with whom we may share your personal information.
                </p>
                <p>
                  If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or
                  Switzerland, then these countries may not necessarily have data protection laws or
                  other similar laws as comprehensive as those in your country. However, we will
                  take all necessary measures to protect your personal information in accordance
                  with this Privacy Policy and applicable law.
                </p>
                <h3>European Commission's Standard Contractual Clauses</h3>
                <p>
                  We have implemented measures to protect your personal information, including by
                  using the European Commission's Standard Contractual Clauses for transfers of
                  personal information between our group companies and third-party providers.
                </p>
              </Section>

              <Section title="How Long Do We Keep Your Information?">
                <p>
                  We will only keep your personal information for as long as it is necessary for the
                  purposes set out in this Privacy Policy, unless a longer retention period is
                  required or permitted by law.
                </p>
                <p>
                  When we have no ongoing legitimate business need to process your personal
                  information, we will either delete or anonymize such information, or, if this is
                  not possible, then we will securely store your personal information and isolate it
                  from any further processing until deletion is possible.
                </p>
              </Section>

              <Section title="How Do We Keep Your Information Safe?">
                <p>
                  We have implemented appropriate and reasonable technical and organizational
                  security measures designed to protect the security of any personal information we
                  process. However, despite our safeguards and efforts to secure your information,
                  no electronic transmission over the Internet or information storage technology can
                  be guaranteed to be 100% secure.
                </p>
                <p>
                  Although we will do our best to protect your personal information, transmission of
                  personal information to and from our Services is at your own risk. You should only
                  access the Services within a secure environment.
                </p>
              </Section>

              <Section title="What Are Your Privacy Rights?">
                <h3>EU/EEA/UK Residents</h3>
                <p>
                  If you are located in the EU, EEA, or UK, you have certain rights under applicable
                  data protection laws:
                </p>
                <ul>
                  <li>
                    <strong>Right of Access:</strong> Request access to your personal data
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> Request correction of inaccurate data
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> Request deletion of your personal data
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> Request restriction of processing
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> Receive your data in a structured,
                    machine-readable format
                  </li>
                  <li>
                    <strong>Right to Object:</strong> Object to processing based on legitimate
                    interests
                  </li>
                  <li>
                    <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time
                  </li>
                </ul>

                <h3>Account Information</h3>
                <p>
                  If you would at any time like to review or change the information in your account
                  or terminate your account, you can:
                </p>
                <ul>
                  <li>Log in to your account settings and update your user account</li>
                  <li>Contact us using the contact information provided below</li>
                </ul>
                <p>
                  Upon your request to terminate your account, we will deactivate or delete your
                  account and information from our active databases. However, we may retain some
                  information in our files to prevent fraud, troubleshoot problems, assist with any
                  investigations, enforce our legal terms, and/or comply with applicable legal
                  requirements.
                </p>

                <h3>Withdrawing Your Consent</h3>
                <p>
                  If we are relying on your consent to process your personal information, you have
                  the right to withdraw your consent at any time. You can withdraw your consent by
                  contacting us using the contact details provided below.
                </p>

                <h3>Opting Out of Marketing</h3>
                <p>
                  You can unsubscribe from our marketing email list at any time by clicking on the
                  unsubscribe link in the emails we send or by contacting us. You will then be
                  removed from the marketing email list. However, we may still communicate with you
                  regarding your account, purchases, and other service-related matters.
                </p>
              </Section>

              <Section title="US State-Specific Privacy Rights">
                <h3>California Residents</h3>
                <p>
                  If you are a California resident, the California Consumer Privacy Act (CCPA)
                  grants you specific rights regarding your personal information:
                </p>
                <ul>
                  <li>
                    <strong>Right to Know:</strong> Request disclosure of personal information
                    collected
                  </li>
                  <li>
                    <strong>Right to Delete:</strong> Request deletion of personal information
                  </li>
                  <li>
                    <strong>Right to Non-Discrimination:</strong> Not receive discriminatory
                    treatment for exercising your rights
                  </li>
                  <li>
                    <strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information
                    (we do not sell personal information)
                  </li>
                </ul>
                <p>
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:support@czaba.com" className="text-brand hover:underline">
                    support@czaba.com
                  </a>
                  .
                </p>

                <h3>Other US States</h3>
                <p>
                  If you are a resident of Colorado, Connecticut, Delaware, Florida, Indiana, Iowa,
                  Kentucky, Montana, New Hampshire, New Jersey, Oregon, Tennessee, Texas, Utah, or
                  Virginia, you may have similar privacy rights. Please contact us to exercise your
                  rights.
                </p>
              </Section>

              <Section title="Do We Make Updates to This Policy?">
                <p>
                  We may update this Privacy Policy from time to time. The updated version will be
                  indicated by an updated "Last updated" date at the top of this Privacy Policy. If
                  we make material changes to this Privacy Policy, we may notify you either by
                  prominently posting a notice of such changes or by directly sending you a
                  notification.
                </p>
                <p>
                  We encourage you to review this Privacy Policy frequently to be informed of how we
                  are protecting your information.
                </p>
              </Section>

              <Section title="How Can You Contact Us?">
                <p>If you have questions or comments about this policy, you may contact us:</p>
                <ul>
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:support@czaba.com" className="text-brand hover:underline">
                      support@czaba.com
                    </a>
                  </li>
                </ul>
              </Section>

              <Section title="How Can You Review, Update, or Delete Your Data?">
                <p>
                  Based on the applicable laws of your country or state of residence, you may have
                  the right to request access to the personal information we collect from you,
                  details about how we have processed it, correct inaccuracies, or delete your
                  personal information.
                </p>
                <p>
                  To request to review, update, or delete your personal information, please contact
                  us at{' '}
                  <a href="mailto:support@czaba.com" className="text-brand hover:underline">
                    support@czaba.com
                  </a>
                  .
                </p>
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
