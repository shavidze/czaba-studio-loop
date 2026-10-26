/**
 * Hire Us Page
 * Professional contact form for custom work inquiries
 * Apple-style clean design
 */

import { type ActionFunctionArgs, json, type MetaFunction } from '@remix-run/node';
import * as React from 'react';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Hire Us | CZABA - Custom Sound Design & Music Production' },
    {
      name: 'description',
      content:
        'Need custom music or sound design? Work with CZABA for original compositions, scoring, game audio, and voice over projects.',
    },
    // Open Graph
    { property: 'og:title', content: 'Hire CZABA - Custom Sound Design' },
    {
      property: 'og:description',
      content: 'Custom music production, film scoring, game audio, and sound design services.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.jpg' },
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Hire CZABA - Custom Sound Design' },
    {
      name: 'twitter:description',
      content: 'Custom music production, film scoring, game audio, and sound design services.',
    },
  ];
};

import { Form, useActionData, useNavigation } from '@remix-run/react';
import { Check, Film, Gamepad2, Mic, Music, Send } from 'lucide-react';
import { debug } from '~/lib/debug';

const PROJECT_TYPES = [
  { id: 'music', label: 'Original Music', icon: Music },
  { id: 'film', label: 'Film/Video Scoring', icon: Film },
  { id: 'game', label: 'Game Audio', icon: Gamepad2 },
  { id: 'voiceover', label: 'Voice Over', icon: Mic },
];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const projectType = formData.get('projectType') as string;
  const budget = formData.get('budget') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return json({ error: 'Please fill in all required fields', success: false });
  }

  if (!email.includes('@')) {
    return json({ error: 'Please enter a valid email address', success: false });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'contact@czaba.store';

  if (!BREVO_API_KEY) {
    debug.error('Brevo API key missing for hire-us form');
    return json({ error: 'Server configuration error', success: false }, { status: 500 });
  }

  const projectTypeLabels: Record<string, string> = {
    music: 'Original Music',
    film: 'Film/Video Scoring',
    game: 'Game Audio',
    voiceover: 'Voice Over',
  };

  const budgetLabels: Record<string, string> = {
    'under-500': 'Under $500',
    '500-1000': '$500 - $1,000',
    '1000-5000': '$1,000 - $5,000',
    '5000-plus': '$5,000+',
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'CZABA Website', email: 'noreply@czaba.store' },
        to: [{ email: NOTIFICATION_EMAIL }],
        replyTo: { email, name },
        subject: `🎬 New Project Inquiry: ${escapeHtml(projectTypeLabels[projectType] || 'General')}`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #13D9CC;">New Project Inquiry</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #888;">Name</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #888;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;"><a href="mailto:${escapeHtml(email)}" style="color: #13D9CC;">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #888;">Project Type</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;">${escapeHtml(projectTypeLabels[projectType] || 'Not specified')}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #888;">Budget</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: #fff;">${escapeHtml(budgetLabels[budget] || 'Not specified')}</td>
              </tr>
            </table>

            <h3 style="color: #13D9CC; margin-top: 30px;">Message</h3>
            <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; color: #fff; white-space: pre-wrap;">${escapeHtml(message)}</div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Sent from CZABA Hire Us form
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      debug.error('Brevo email failed:', response.status);
      return json(
        { error: 'Failed to send message. Please try again.', success: false },
        { status: 500 },
      );
    }

    return json({
      success: true,
      message: "Thanks for reaching out! We'll get back to you within 24 hours.",
    });
  } catch (error) {
    debug.error('Hire-us form error:', error);
    return json(
      { error: 'Something went wrong. Please try again.', success: false },
      { status: 500 },
    );
  }
}

export default function HireUsPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = React.useState<string>('');

  const isSubmitting = navigation.state === 'submitting';
  const isSuccess = actionData?.success;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-32 pb-12 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground tracking-tight mb-4">
          Your Vision, Our Sound
        </h1>
        <p className="text-lg text-muted max-w-4xl mx-auto px-4 mb-4">
          Custom compositions crafted exclusively for your project.
        </p>
        <p className="text-dim max-w-4xl mx-auto">
          From cinematic scores to immersive game audio, we bring professional studio quality to
          your creative vision.
        </p>
      </header>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-8 pb-32">
        {isSuccess ? (
          <SuccessMessage />
        ) : (
          <textarea onChange={(e) => e} rows={3}
  className={`${'a'} border border-outline`} />
<Form method="post" className="space-y-8">
            {/* Project Type Selection */}
            <div>
              <label className="block text-foreground font-medium mb-4">
                What type of project?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PROJECT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand/10 border-brand text-brand'
                          : 'bg-surface/30 border-outline text-muted hover:border-outline-hover hover:text-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="projectType" value={selectedType} />
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-foreground font-medium mb-2">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-surface/50 border border-outline-strong rounded-xl text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-foreground font-medium mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-surface/50 border border-outline-strong rounded-xl text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label htmlFor="budget" className="block text-foreground font-medium mb-2">
                Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                className="w-full px-4 py-3 bg-surface/50 border border-outline-strong rounded-xl text-foreground focus:outline-none focus:border-brand/50 transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem',
                }}
              >
                <option value="" className="bg-elevated">
                  Select a range
                </option>
                <option value="under-500" className="bg-elevated">
                  Under $500
                </option>
                <option value="500-1000" className="bg-elevated">
                  $500 - $1,000
                </option>
                <option value="1000-5000" className="bg-elevated">
                  $1,000 - $5,000
                </option>
                <option value="5000-plus" className="bg-elevated">
                  $5,000+
                </option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-foreground font-medium mb-2">
                Tell us about your project <span className="text-destructive">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Describe your project, timeline, and any specific requirements..."
                className="w-full px-4 py-3 bg-surface/50 border border-outline-strong rounded-xl text-foreground placeholder:text-dim focus:outline-none focus:border-brand/50 transition-colors resize-none"
              />
            </div>

            {/* Error Message */}
            {actionData && 'error' in actionData && actionData.error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <p className="text-destructive text-sm">{actionData.error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>

            <p className="text-center text-dim text-sm">We typically respond within 24 hours.</p>
          </Form>
        )}
      </section>
    </div>
  );
}

function SuccessMessage() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-brand/10 text-brand rounded-full mb-6">
        <Check size={40} />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Message Sent!</h2>
      <p className="text-muted max-w-4xl mx-auto">
        Thanks for reaching out! We'll review your project details and get back to you within 24
        hours.
      </p>
    </div>
  );
}
