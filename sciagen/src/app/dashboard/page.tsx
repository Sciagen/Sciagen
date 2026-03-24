'use client';
import { useAuth }  from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link     from 'next/link';
import { motion } from 'framer-motion';
import { Bookmark, FileText, Clock, Highlighter, BookOpen, Settings, TrendingUp, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?from=/dashboard');
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ion-400/30 border-t-ion-400 rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { icon: BookOpen,    label: 'Articles Read',  value: userProfile?.stats.articlesRead  ?? 0, color: '#06d0f5' },
    { icon: Clock,       label: 'Reading Time',   value: `${userProfile?.stats.readingTime ?? 0}m`, color: '#00ff87' },
    { icon: Bookmark,    label: 'Bookmarks',      value: userProfile?.stats.bookmarks     ?? 0, color: '#ffd166' },
    { icon: Highlighter, label: 'Highlights',     value: userProfile?.stats.highlights    ?? 0, color: '#4cc9f0' },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-ion-400/30">
          {user.photoURL
            ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-ion-500 to-ion-700 flex items-center justify-center text-2xl font-bold text-void-950">{(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}</div>
          }
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
            Welcome back, {user.displayName?.split(' ')[0] ?? 'Scientist'}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="sg-card p-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-0.5">{value}</p>
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Bookmark,    label: 'My Bookmarks',    desc: 'Saved articles',          href: '/dashboard/bookmarks', color: '#06d0f5' },
          { icon: FileText,    label: 'My Notes',        desc: 'Annotations & highlights', href: '/dashboard/notes',     color: '#00ff87' },
          { icon: Settings,    label: 'Preferences',     desc: 'Reading & account settings',href: '/dashboard/settings', color: '#ffd166' },
        ].map(({ icon: Icon, label, desc, href, color }) => (
          <Link key={href} href={href} className="sg-card p-5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color }} />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)] group-hover:text-ion-400 transition-colors">{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
