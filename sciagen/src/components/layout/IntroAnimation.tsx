'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN INTRO ANIMATION — Cinematic entry experience
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom } from 'lucide-react';

const SESSION_KEY = 'sciagen_intro_shown';

export function IntroAnimation() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase]     = useState<'logo' | 'out'>('logo');

  useEffect(() => {
    // Only show once per browser session
    const already = sessionStorage.getItem(SESSION_KEY);
    if (!already) {
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, '1');

      const timer = setTimeout(() => setPhase('out'), 2200);
      const hide  = setTimeout(() => setVisible(false), 3200);
      return () => { clearTimeout(timer); clearTimeout(hide); };
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: '#040608' }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2 }}
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(6,208,245,0.06), transparent 70%)',
            }}
          />

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(6,208,245,0.5), transparent)' }}
            initial={{ top: '-1px', opacity: 0 }}
            animate={{ top: '100%', opacity: [0, 0.6, 0.6, 0] }}
            transition={{ delay: 0.2, duration: 1.8, ease: 'linear' }}
          />

          {/* Corner decorations */}
          {[
            'top-8 left-8 border-t border-l',
            'top-8 right-8 border-t border-r',
            'bottom-8 left-8 border-b border-l',
            'bottom-8 right-8 border-b border-r',
          ].map((classes, i) => (
            <motion.div
              key={i}
              className={`absolute w-8 h-8 ${classes}`}
              style={{ borderColor: 'rgba(6,208,245,0.3)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            />
          ))}

          {/* Main logo unit */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Atom icon */}
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,208,245,0.15), rgba(6,208,245,0.05))',
                  border: '1px solid rgba(6,208,245,0.3)',
                  boxShadow: '0 0 40px rgba(6,208,245,0.2), inset 0 1px 0 rgba(6,208,245,0.2)',
                }}
              >
                <Atom className="w-10 h-10 text-ion-400" strokeWidth={1.5} />
              </div>
              {/* Orbital rings */}
              {[1, 1.5, 2].map((delay, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: '1px solid rgba(6,208,245,0.15)' }}
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.5, 0] }}
                  transition={{
                    delay,
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h1
                className="font-display font-light tracking-[0.35em] uppercase"
                style={{
                  fontSize: 'clamp(2rem, 7vw, 4.5rem)',
                  background: 'linear-gradient(135deg, #06d0f5 0%, #4cc9f0 50%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Sciagen
              </h1>
              <motion.p
                className="mt-2 font-sans text-xs tracking-[0.4em] uppercase text-ion-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Global Science Platform
              </motion.p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="w-48 h-px overflow-hidden"
              style={{ background: 'rgba(6,208,245,0.1)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.div
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #06d0f5, transparent)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ delay: 0.8, duration: 1.2, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
