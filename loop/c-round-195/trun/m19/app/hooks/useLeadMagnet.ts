import { useEffect, useState } from 'react';

interface LeadMagnetState {
  viewCount: number;
  lastResetDate: string;
  dismissed: boolean;
  submitted: boolean;
}

type Step = 'offer' | 'email' | 'success';

interface UseLeadMagnetReturn {
  shouldShow: boolean;
  currentStep: Step;
  setStep: (step: Step) => void;
  close: () => void;
  submitEmail: (email: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

const STORAGE_KEY = 'czaba_lead_magnet';
const MAX_VIEWS_PER_DAY = 10; // Max 2 views per day (less annoying)
const SHOW_DELAY_MS = 8000; // Wait 8 seconds before checking
const SCROLL_THRESHOLD = 40; // User must scroll 40% to be considered engaged

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getState(): LeadMagnetState {
  if (typeof window === 'undefined') {
    return {
      viewCount: 0,
      lastResetDate: getTodayDate(),
      dismissed: false,
      submitted: false,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        viewCount: 0,
        lastResetDate: getTodayDate(),
        dismissed: false,
        submitted: false,
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      viewCount: 0,
      lastResetDate: getTodayDate(),
      dismissed: false,
      submitted: false,
    };
  }
}

function setState(state: LeadMagnetState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save lead magnet state:', error);
  }
}

export function useLeadMagnet(isLoggedIn: boolean): UseLeadMagnetReturn {
  const [shouldShow, setShouldShow] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('offer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't run on server
    if (typeof window === 'undefined') return;

    // 1. Check if user is logged in
    if (isLoggedIn) {
      setShouldShow(false);
      return;
    }

    // Get current state
    let state = getState();
    const today = getTodayDate();

    // 2. Check if already submitted
    if (state.submitted) {
      setShouldShow(false);
      return;
    }

    // 3. Check if dismissed this session
    if (state.dismissed) {
      setShouldShow(false);
      return;
    }

    // 4. Reset count if new day
    if (state.lastResetDate !== today) {
      state = {
        ...state,
        viewCount: 0,
        lastResetDate: today,
      };
      setState(state);
    }

    // 5. Check if under max views
    if (state.viewCount >= MAX_VIEWS_PER_DAY) {
      setShouldShow(false);
      return;
    }

    // 6. HYBRID APPROACH: Time delay + Scroll engagement
    let timeoutId: NodeJS.Timeout;
    let hasScrolled = false;
    let hasShownPopup = false;

    // Track scroll engagement
    function handleScroll() {
      if (hasShownPopup) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;

      if (scrollPercent >= SCROLL_THRESHOLD) {
        hasScrolled = true;
      }
    }

    // Exit intent (desktop only)
    function handleMouseLeave(e: MouseEvent) {
      if (hasShownPopup) return;

      // If mouse leaves at top (closing tab gesture)
      if (e.clientY <= 0 && hasScrolled) {
        hasShownPopup = true;
        setShouldShow(true);
        setState({
          ...state,
          viewCount: state.viewCount + 1,
        });
      }
    }

    // Start timeout for delayed check
    timeoutId = setTimeout(() => {
      // Only show if user scrolled (engaged)
      if (hasScrolled && !hasShownPopup) {
        hasShownPopup = true;
        setShouldShow(true);
        setState({
          ...state,
          viewCount: state.viewCount + 1,
        });
      }
    }, SHOW_DELAY_MS);

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isLoggedIn]);

  const close = () => {
    setShouldShow(false);
    const state = getState();
    setState({
      ...state,
      dismissed: true,
    });
  };

  const submitEmail = async (email: string): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Call API to submit email
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      // Mark as submitted
      const state = getState();
      setState({
        ...state,
        submitted: true,
      });

      // Move to success step
      setCurrentStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    shouldShow,
    currentStep,
    setStep: setCurrentStep,
    close,
    submitEmail,
    isSubmitting,
    error,
  };
}
