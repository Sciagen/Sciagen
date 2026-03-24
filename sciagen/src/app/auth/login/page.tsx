'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import Link         from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm }  from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z }        from 'zod';
import { motion }   from 'framer-motion';
import { Atom, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const verified     = params.get('verified') === 'true';
  const [showPass,   setShowPass]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { user, error } = await signInWithEmail(data.email, data.password);
    if (error) { toast.error(error); return; }
    if (user)  { toast.success('Welcome back!'); router.push('/dashboard'); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { user, error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) { toast.error(error); return; }
    if (user)  { toast.success('Welcome!'); router.push('/dashboard'); }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (decorative) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #070d12 0%, #0c1520 100%)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-ion-500/20 border border-ion-400/30 flex items-center justify-center">
              <Atom className="w-6 h-6 text-ion-400" />
            </div>
            <span className="font-display text-3xl font-semibold text-white">
              Sci<span className="text-ion-400">agen</span>
            </span>
          </div>
          <h2 className="font-display text-4xl font-light text-white leading-tight mb-4">
            Where science<br />meets discovery
          </h2>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-sm mx-auto">
            Real-time research, AI-powered insights, and premium reading experience across every domain of science.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
            {['50K+ Articles', '16 Domains', 'AI Summaries', 'Free Forever'].map(s => (
              <div key={s} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Atom className="w-6 h-6 text-ion-400" />
            <span className="font-display text-2xl font-semibold">Sci<span className="text-ion-400">agen</span></span>
          </div>

          <h1 className="font-display text-4xl font-semibold text-[var(--text-primary)] mb-2">Sign in</h1>
          <p className="font-body text-[var(--text-muted)] mb-8">
            New here?{' '}
            <Link href="/auth/signup" className="text-ion-400 hover:underline">Create a free account</Link>
          </p>

          {/* Email verified banner */}
          {verified && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Email verified! You can now sign in.
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] transition-all text-sm font-medium text-[var(--text-primary)] mb-6 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-ion-400/30 border-t-ion-400 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 sg-divider" />
            <span className="text-xs text-[var(--text-dim)]">or sign in with email</span>
            <div className="flex-1 sg-divider" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="sg-input pl-9"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-signal-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
                <Link href="/auth/reset" className="text-xs text-ion-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="sg-input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-signal-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="sg-btn-primary w-full justify-center py-3 text-base disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-void-950/30 border-t-void-950 rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-[var(--text-dim)] text-center">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[var(--text-muted)] hover:text-ion-400">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[var(--text-muted)] hover:text-ion-400">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
