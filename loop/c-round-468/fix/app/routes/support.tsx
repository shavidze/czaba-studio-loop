import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { FileText, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { ChatWindow } from '~/components/chat/ChatWindow';
import type { GuestInfo } from '~/components/chat/types';
import { useAuth, useChat } from '~/hooks';

export const meta: MetaFunction = () => {
  return [
    { title: 'Support | CZABA' },
    {
      name: 'description',
      content: 'Get help with your CZABA purchases, downloads, and licensing questions.',
    },
  ];
};

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const { session, messages, isTyping, isAdminOnline, startSession, sendMessage, closeSession } =
    useChat();

  const [isChatOpen, setIsChatOpen] = useState(false);

  const showGuestForm = !isAuthenticated && !session;

  const handleOpenChat = async () => {
    setIsChatOpen(true);
    if (!session && isAuthenticated) {
      await startSession();
    }
  };

  const handleGuestSubmit = async (info: GuestInfo) => {
    await startSession(info);
  };

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const chatMessages = messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender,
    text: msg.text,
    time: msg.time,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-32 pb-12 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground tracking-tight mb-4">
          How can we help?
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto px-4">
          Get help with your purchases, downloads, licensing, or any other questions.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-8 pb-32">
        {isChatOpen ? (
          <div className="max-w-md mx-auto">
            <div className="bg-surface rounded-2xl overflow-hidden shadow-xl">
              <ChatWindow
                messages={chatMessages}
                isTyping={isTyping}
                isGuestFormVisible={showGuestForm}
                isAdminOnline={isAdminOnline}
                embedded={true}
                onSendMessage={handleSendMessage}
                onGuestSubmit={handleGuestSubmit}
                onMinimize={handleCloseChat}
                onClose={() => {
                  closeSession();
                  handleCloseChat();
                }}
              />
            </div>
            <button
              onClick={handleCloseChat}
              className="mt-6 w-full text-center text-muted hover:text-foreground transition-colors"
            >
              Back to support options
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleOpenChat}
              className="group p-8 bg-surface border border-outline rounded-2xl text-left hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted">
                Chat with our support team in real-time. Usually respond within minutes.
              </p>
            </button>

            <a
              href="mailto:support@czaba.com"
              className="group p-8 bg-surface border border-outline rounded-2xl text-left hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all"
            >
              <div className="w-12 h-12 bg-elevated rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/10 transition-colors">
                <Mail className="w-6 h-6 text-muted group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-muted">
                Send us an email at support@czaba.com. We respond within 24 hours.
              </p>
            </a>

            <Link
              to="/faq"
              className="group p-8 bg-surface border border-outline rounded-2xl text-left hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all"
            >
              <div className="w-12 h-12 bg-elevated rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/10 transition-colors">
                <HelpCircle className="w-6 h-6 text-muted group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">FAQ</h3>
              <p className="text-muted">
                Find answers to common questions about licensing, downloads, and more.
              </p>
            </Link>

            <Link
              to="/license"
              className="group p-8 bg-surface border border-outline rounded-2xl text-left hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all"
            >
              <div className="w-12 h-12 bg-elevated rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand/10 transition-colors">
                <FileText className="w-6 h-6 text-muted group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">License Info</h3>
              <p className="text-muted">
                Learn about our licensing terms and what you can do with your purchases.
              </p>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
