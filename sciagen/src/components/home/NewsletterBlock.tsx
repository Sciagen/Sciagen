'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, Atom } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email();

export function NewsletterBlock() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      await fetch('/api/newsletter/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(6,208,245,0.08) 0%, rgba(76,201,240,0.04) 50%, rgba(7,13,18,0) 100%)',
        border: '1px solid rgba(6,208,245,0.15)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-64 h-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-ion-400/5 blur-3xl" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="relative z-10 px-8 md:px-16 py-14 md:py-16 flex flex-col md:flex-row items-center gap-10">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 sg-badge mb-4">
            <Atom className="w-3 h-3" />
            Science Newsletter
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[var(--text-primary)] mb-3 leading-tight">
            Stay at the edge<br />of discovery
          </h2>
          <p className="font-body text-[var(--text-secondary)] text-lg leading-relaxed max-w-md">
            Weekly curation of the most significant scientific breakthroughs, handpicked by our editorial team and enhanced with AI insights.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-[var(--text-muted)]">
            {['No spam', 'Unsubscribe anytime', '12,000+ subscribers'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ion-400" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="w-full md:w-auto md:min-w-[380px]">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 rounded-full bg-ion-400/10 border border-ion-400/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-ion-400" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-2">
                You&apos;re subscribed!
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Welcome to the Sciagen community. Expect your first dispatch soon.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="sg-input pl-10 py-3 text-base"
                  required
                />
              </div>
              {error && <p className="text-xs text-signal-red">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="sg-btn-primary w-full justify-center py-3 text-base disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-void-950/30 border-t-void-950 rounded-full animate-spin" />
                ) : (
                  <>Subscribe free <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-xs text-[var(--text-dim)] text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
