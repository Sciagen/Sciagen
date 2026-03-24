'use client';
import { useState } from 'react';
import Link   from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm }   from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z }         from 'zod';
import { motion }    from 'framer-motion';
import { Atom, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  agree:    z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});
type FormData = z.infer<typeof schema>;

const STRENGTH_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',       test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number',                 test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character',      test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const router      = useRouter();
  const [showPass,  setShowPass]  = useState(false);
  const [pass,      setPass]      = useState('');
  const [gLoading,  setGLoading]  = useState(false);
  const [done,      setDone]      = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { user, error } = await signUpWithEmail(data.email, data.password, data.name);
    if (error) { toast.error(error); return; }
    if (user)  { setDone(true); }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    const { user, error } = await signInWithGoogle();
    setGLoading(false);
    if (error) { toast.error(error); return; }
    if (user)  { toast.success('Welcome to Sciagen!'); router.push('/dashboard'); }
  };

  const strength = STRENGTH_RULES.filter(r => r.test(pass)).length;

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-ion-400/10 border border-ion-400/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-ion-400" />
        </div>
        <h1 className="font-display text-4xl font-semibold mb-3">Check your email</h1>
        <p className="text-[var(--text-muted)] mb-6">We sent a verification link to your email. Click it to activate your Sciagen account.</p>
        <Link href="/auth/login" className="sg-btn-primary">Go to sign in</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ background: 'linear-gradient(135deg, #070d12, #0c1520)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative z-10 text-center px-12">
          <Atom className="w-16 h-16 text-ion-400 mx-auto mb-6" />
          <h2 className="font-display text-4xl font-light text-white mb-4">Join the scientific<br />community</h2>
          <p className="text-zinc-400 text-lg max-w-sm mx-auto">Bookmark discoveries, annotate research, and personalize your science feed.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[var(--bg-primary)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="font-display text-4xl font-semibold text-[var(--text-primary)] mb-2">Create account</h1>
          <p className="text-[var(--text-muted)] mb-8">Already have one? <Link href="/auth/login" className="text-ion-400 hover:underline">Sign in</Link></p>

          <button onClick={handleGoogle} disabled={gLoading} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all text-sm font-medium text-[var(--text-primary)] mb-6">
            {gLoading ? <div className="w-4 h-4 border-2 border-ion-400/30 border-t-ion-400 rounded-full animate-spin" /> : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 sg-divider" />
            <span className="text-xs text-[var(--text-dim)]">or with email</span>
            <div className="flex-1 sg-divider" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input {...register('name')} type="text" placeholder="Dr. Jane Smith" className="sg-input pl-9" /></div>
              {errors.name && <p className="mt-1 text-xs text-signal-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><input {...register('email')} type="email" placeholder="you@example.com" className="sg-input pl-9" /></div>
              {errors.email && <p className="mt-1 text-xs text-signal-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="sg-input pl-9 pr-10" onChange={e => setPass(e.target.value)} />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {pass && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= strength ? (strength <= 1 ? '#ff3d57' : strength <= 2 ? '#ffd166' : strength <= 3 ? '#06d0f5' : '#00ff87') : 'var(--bg-elevated)' }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {STRENGTH_RULES.map(r => (
                      <p key={r.label} className={`text-2xs flex items-center gap-1 ${r.test(pass) ? 'text-emerald-400' : 'text-[var(--text-dim)]'}`}>
                        <CheckCircle2 className="w-3 h-3" />{r.label}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-signal-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input {...register('agree')} type="checkbox" id="agree" className="mt-0.5 accent-ion-400" />
              <label htmlFor="agree" className="text-xs text-[var(--text-muted)]">
                I agree to the <Link href="/terms" className="text-ion-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-ion-400 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agree && <p className="text-xs text-signal-red">{errors.agree.message}</p>}

            <button type="submit" disabled={isSubmitting} className="sg-btn-primary w-full justify-center py-3 text-base disabled:opacity-60 mt-2">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-void-950/30 border-t-void-950 rounded-full animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
