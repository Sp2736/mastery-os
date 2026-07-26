'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from '@/lib/quotes/getDailyQuote';

export default function QuoteSplashScreen({ quote }: { quote: Quote }) {
  const [showSplash, setShowSplash] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [typedAuthor, setTypedAuthor] = useState('');
  const [showAuthor, setShowAuthor] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeen = sessionStorage.getItem('hasSeenDailyQuote');
    if (!hasSeen) {
      setShowSplash(true);
    } else {
      setSplashFinished(true);
    }
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!showSplash) return;
    
    let currentIndex = 0;
    const quoteText = `"${quote.text}"`;
    
    const interval = setInterval(() => {
      if (currentIndex < quoteText.length) {
        setTypedText(quoteText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowAuthor(true);
          // Now type author
          let authorIndex = 0;
          const authorText = `- ${quote.author}`;
          const authorInterval = setInterval(() => {
            if (authorIndex < authorText.length) {
              setTypedAuthor(authorText.substring(0, authorIndex + 1));
              authorIndex++;
            } else {
              clearInterval(authorInterval);
              // Wait a moment then dismiss splash
              setTimeout(() => {
                setShowSplash(false);
                sessionStorage.setItem('hasSeenDailyQuote', 'true');
                setTimeout(() => setSplashFinished(true), 1000); // Wait for fade out
              }, 2000);
            }
          }, 50); // author typing speed
        }, 500); // pause before author
      }
    }, 40); // quote typing speed
    
    return () => clearInterval(interval);
  }, [showSplash, quote]);

  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090c] p-6 cursor-pointer"
            onClick={() => {
              // Allow skip by clicking
              setShowSplash(false);
              sessionStorage.setItem('hasSeenDailyQuote', 'true');
              setTimeout(() => setSplashFinished(true), 1000);
            }}
          >
            <div className="max-w-3xl text-center space-y-6">
              <motion.h1 
                className="text-2xl md:text-4xl lg:text-5xl font-serif text-white/90 leading-relaxed tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {typedText}
                {!showAuthor && <span className="animate-pulse">|</span>}
              </motion.h1>
              
              <div className="h-8">
                {showAuthor && (
                  <motion.p 
                    className="text-amber-500/80 font-medium tracking-widest uppercase text-sm md:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {typedAuthor}
                    <span className="animate-pulse">|</span>
                  </motion.p>
                )}
              </div>
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="absolute bottom-10 text-white/20 text-xs tracking-widest uppercase"
            >
              Click anywhere to skip
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topbar Version - smoothly fades in when splash is gone or if already seen */}
      <AnimatePresence>
        {splashFinished && (
          <motion.div 
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1 }}
            className="text-xs text-white/30 italic hidden md:block max-w-xs truncate"
            title={`"${quote.text}" - ${quote.author}`}
          >
            &quot;{quote.text}&quot;
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
