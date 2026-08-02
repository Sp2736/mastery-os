'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { Quote } from '@/lib/quotes/getDailyQuote';
import { easings } from '@/lib/motion/easings';
import { speakQuote } from '@/lib/audio/speakQuote';

interface AccessGateProps {
  quote?: Quote;
}

const DEFAULT_QUOTE: Quote = {
  text: "Discipline equals freedom.",
  author: "Jocko Willink",
  category: "discipline",
};

export default function AccessGate({ quote = DEFAULT_QUOTE }: AccessGateProps) {
  const [status, setStatus] = useState<'denied' | 'authenticating' | 'granted'>('denied');
  const [typedText, setTypedText] = useState('');
  const [typedAuthor, setTypedAuthor] = useState('');
  const [showAuthor, setShowAuthor] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const router = useRouter();
  const exitingRef = useRef(false);
  const stopSpeechRef = useRef<(() => void) | null>(null);

  // Transition into dashboard
  const proceedToDashboard = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsExiting(true);
    
    // Stop ongoing speech
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Smooth delay to allow Framer Motion exit animation to dissolve
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 700);
  }, [router]);

  useEffect(() => {
    // Expose the global function to the window object
    (window as any).getAccess = async (userId: string) => {
      const sanitized = userId?.toLowerCase().trim();
      if (sanitized !== 'swayam') {
        console.error(`ACCESS DENIED — unrecognized identity: '${userId}'`);
        return;
      }
      
      setStatus('authenticating');
      
      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: sanitized }),
        });
        
        if (res.ok) {
          console.log(`ACCESS GRANTED — Welcome back, ${sanitized}.`);
          setStatus('granted');
        } else {
          console.error('ACCESS DENIED — System rejected the token.');
          setStatus('denied');
        }
      } catch (e) {
        console.error('ACCESS DENIED — Connection failed.');
        setStatus('denied');
      }
    };

    (window as any).getAccess.logout = async () => {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    };

    return () => {
      delete (window as any).getAccess;
    };
  }, [router]);

  // Typewriter effect when access is granted
  useEffect(() => {
    if (status !== 'granted' || isExiting) return;

    let currentIndex = 0;
    const fullQuoteText = `"${quote.text}"`;
    let quoteInterval: NodeJS.Timeout;
    let authorInterval: NodeJS.Timeout;
    let autoDismissTimer: NodeJS.Timeout;

    quoteInterval = setInterval(() => {
      if (currentIndex < fullQuoteText.length) {
        setTypedText(fullQuoteText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(quoteInterval);
        setTimeout(() => {
          setShowAuthor(true);
          let authorIndex = 0;
          const fullAuthorText = `— ${quote.author}`;

          authorInterval = setInterval(() => {
            if (authorIndex < fullAuthorText.length) {
              setTypedAuthor(fullAuthorText.substring(0, authorIndex + 1));
              authorIndex++;
            } else {
              clearInterval(authorInterval);
              // Hold for 3s after author typing completes for peaceful reading before fading to dashboard
              autoDismissTimer = setTimeout(() => {
                proceedToDashboard();
              }, 3000);
            }
          }, 50);
        }, 500);
      }
    }, 60);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(authorInterval);
      clearTimeout(autoDismissTimer);
    };
  }, [status, isExiting, quote, proceedToDashboard]);

  // Speech narration when access is granted
  useEffect(() => {
    if (status !== 'granted' || isExiting || isMuted) {
      if (stopSpeechRef.current) {
        stopSpeechRef.current();
        stopSpeechRef.current = null;
      }
      return;
    }

    // Small delay (250ms) to begin narration seamlessly with typewriter start
    const speechTimer = setTimeout(() => {
      const cancel = speakQuote({
        text: quote.text,
        author: quote.author,
      });
      stopSpeechRef.current = cancel;
    }, 250);

    return () => {
      clearTimeout(speechTimer);
      if (stopSpeechRef.current) {
        stopSpeechRef.current();
        stopSpeechRef.current = null;
      }
    };
  }, [status, isExiting, isMuted, quote]);

  // Keyboard shortcut (Enter, Space, Escape) or click to skip directly to dashboard
  useEffect(() => {
    if (status !== 'granted') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        proceedToDashboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, proceedToDashboard]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#08090c] text-white overflow-hidden ${
        status === 'granted' ? 'cursor-pointer select-none' : ''
      }`}
      onClick={status === 'granted' ? proceedToDashboard : undefined}
    >
      {/* Subtle animated background mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#101319] to-[#08090c] opacity-50 pointer-events-none" />
      
      {/* Ambient luxury glow on granted */}
      {status === 'granted' && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] animate-pulse" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />
        </>
      )}

      <AnimatePresence mode="wait">
        {status === 'denied' && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: easings.easeOutExpo }}
            className="relative flex flex-col items-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-white/5 rounded-full" />
              <Shield className="w-16 h-16 text-white/40 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" strokeWidth={1} />
            </div>
            <p className="font-mono text-sm tracking-widest text-white/40 uppercase">
              awaiting identity confirmation…
            </p>
          </motion.div>
        )}
        
        {status === 'authenticating' && (
          <motion.div
            key="authenticating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col items-center space-y-6"
          >
            <Shield className="w-16 h-16 text-amber-400/90 animate-pulse drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" strokeWidth={1.5} />
            <p className="font-mono text-sm tracking-widest text-amber-300/90 uppercase">
              verifying identity…
            </p>
          </motion.div>
        )}
        
        {status === 'granted' && !isExiting && (
          <motion.div
            key="granted-quote"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              scale: 0.98,
              filter: 'blur(16px)',
              transition: { duration: 0.7, ease: easings.easeOutExpo },
            }}
            transition={{ duration: 0.8, ease: easings.easeOutExpo }}
            className="relative flex flex-col items-center text-center max-w-4xl px-6 py-10 space-y-8 z-10"
          >
            {/* Top Badge & Voice Indicator */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: easings.easeOutExpo }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs tracking-widest text-amber-300 uppercase font-medium">
                  Access Confirmed — Welcome back, Swayam
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((prev) => !prev);
                }}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors"
                title={isMuted ? 'Unmute voice readout' : 'Mute voice readout'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-white/40" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            </motion.div>

            {/* Daily Quote Headline */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white/95 leading-relaxed tracking-wide font-normal">
                {typedText}
                {!showAuthor && (
                  <span className="inline-block w-2.5 h-6 md:h-8 ml-1.5 bg-amber-400 align-middle animate-pulse" />
                )}
              </h1>

              <div className="min-h-8 flex items-center justify-center">
                {showAuthor && (
                  <motion.p
                    className="text-amber-400/90 font-medium tracking-widest uppercase text-xs sm:text-sm md:text-base font-mono"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {typedAuthor}
                    <span className="inline-block w-2 h-4 ml-1 bg-amber-400 align-middle animate-pulse" />
                  </motion.p>
                )}
              </div>
            </div>

            {/* Click/Key Skip hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-white/30 text-xs tracking-widest uppercase font-mono pt-4"
            >
              Click anywhere or press Enter to continue
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
