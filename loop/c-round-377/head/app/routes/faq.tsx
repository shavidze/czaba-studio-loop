import type { MetaFunction } from '@remix-run/node';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Footer } from '~/components/layout/Footer';
import { PageContainer } from '~/components/layout/PageContainer';

export const meta: MetaFunction = () => {
  return [
    { title: 'FAQ | CZABA' },
    {
      name: 'description',
      content: 'Frequently asked questions about CZABA products, licensing, downloads, and more.',
    },
  ];
};

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Purchasing & Downloads',
    items: [
      {
        question: 'How do I download my purchased products?',
        answer:
          'After completing your purchase, you will receive an email with download links. You can also access all your purchases from your Account Dashboard under the "Downloads" section.',
      },
      {
        question: 'What formats are included?',
        answer:
          'Standard purchases include WAV (48kHz/24-bit) and MP3 formats. Premium purchases include additional high-resolution WAV (96kHz/24-bit) and stem files for maximum creative flexibility.',
      },
      {
        question: 'How long do I have to download my files?',
        answer:
          'Download links remain active indefinitely. You can re-download your purchased products anytime from your account.',
      },
      {
        question: 'Can I get a refund?',
        answer:
          'Due to the digital nature of our products, all sales are final. However, we consider refunds for technical issues, duplicate purchases, or if the product is significantly different from its description. Contact support within 14 days of purchase.',
      },
    ],
  },
  {
    title: 'Licensing',
    items: [
      {
        question: 'What can I use the audio for?',
        answer:
          'You can use our audio in films, videos, games, podcasts, advertisements, social media content, and other creative projects. The specific usage rights depend on your license type.',
      },
      {
        question: 'What is the difference between Standard and Premium?',
        answer:
          'Standard includes essential formats (WAV 48kHz, MP3) for most projects. Premium adds high-resolution audio (96kHz), individual stems for custom mixing, and extended commercial rights.',
      },
      {
        question: 'Do I need to credit CZABA?',
        answer:
          'Credit is not required but always appreciated. If you want to credit us, you can mention "Music by CZABA" or link to czaba.com.',
      },
      {
        question: 'Can I use the audio in multiple projects?',
        answer:
          'Yes! Once purchased, you can use the audio in unlimited personal and commercial projects according to your license terms.',
      },
      {
        question: 'Can I resell or redistribute the audio files?',
        answer:
          'No. You cannot resell, redistribute, or share the original audio files. The license is for your use in end products only.',
      },
    ],
  },
  {
    title: 'Account & Technical',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Sign In" button in the header and select "Create Account." You can register with your email or sign in with Google.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer:
          'Click "Forgot Password" on the sign-in page and enter your email. You will receive a link to reset your password.',
      },
      {
        question: 'The download link is not working. What should I do?',
        answer:
          'First, try refreshing the page or using a different browser. If the issue persists, contact us at support@czaba.com with your order number.',
      },
      {
        question: 'What browsers are supported?',
        answer:
          'CZABA works best on modern browsers including Chrome, Firefox, Safari, and Edge. For the best audio preview experience, we recommend Chrome.',
      },
    ],
  },
  {
    title: 'Products',
    items: [
      {
        question: 'What is the Studio feature?',
        answer:
          'The Studio is our unique audio preview system that lets you listen to individual stems, adjust volumes, and create custom mixes before purchasing. It is like having a mini DAW in your browser.',
      },
      {
        question: 'Can I preview the full track before buying?',
        answer:
          'Yes! All tracks have full-length previews. Premium products also include stem previews in the Studio view.',
      },
      {
        question: 'Do you offer custom audio production?',
        answer:
          'Yes! We offer custom composition and sound design services. Visit our "Hire Us" page or contact us directly to discuss your project.',
      },
      {
        question: 'Will you add more products?',
        answer:
          'Absolutely! We regularly release new music packs, sound effects, and presets. Subscribe to our newsletter to be notified of new releases.',
      },
    ],
  },
];

export default function FAQ() {
  return (
    <>
      <main className="min-h-screen bg-background pt-32 pb-20">
        <PageContainer>
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-16 text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-muted text-lg">
                Find answers to common questions about our products and services
              </p>
            </header>

            {/* FAQ Categories */}
            <div className="space-y-12">
              {faqData.map((category) => (
                <FAQSection key={category.title} category={category} />
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-20 text-center p-8 bg-surface rounded-xl border border-outline">
              <h2 className="font-serif text-2xl font-semibold mb-3">Still have questions?</h2>
              <p className="text-muted mb-6">
                Our team is here to help with any questions you might have.
              </p>
              <a
                href="/hire-us"
                className="inline-block px-8 py-3 bg-brand text-background font-semibold rounded-lg hover:bg-brand-hover transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}

function FAQSection({ category }: { category: FAQCategory }) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 pb-2 border-b border-outline">
        {category.title}
      </h2>
      <div className="space-y-3">
        {category.items.map((item, index) => (
          <FAQAccordion key={index} item={item} />
        ))}
      </div>
    </section>
  );
}

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-outline rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-surface hover:bg-elevated transition-colors cursor-pointer"
      >
        <span className="font-medium text-foreground pr-4">{item.question}</span>
        <ChevronDown
          size={20}
          className={`text-muted flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="p-5 pt-0 text-muted">{item.answer}</div>
      </div>
    </div>
  );
}
