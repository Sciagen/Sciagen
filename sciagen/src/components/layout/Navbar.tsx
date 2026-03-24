'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN NAVBAR — Premium Global Navigation
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import Link                            from 'next/link';
import { useRouter, usePathname }      from 'next/navigation';
import { motion, AnimatePresence }     from 'framer-motion';
import {
  Search, Menu, X, ChevronDown,
  Bookmark, User, Settings, LogOut, Shield,
  Atom, Brain, Zap, Globe, Microscope, Cpu, Dna,
  FlaskConical, Leaf, Orbit, Activity,
} from 'lucide-react';

import { useAuth }         from '@/components/auth/AuthProvider';
import { signOutUser }     from '@/lib/firebase/auth';
import { useTheme }        from '@/components/layout/ThemeProvider';
import { SearchModal }     from '@/components/search/SearchModal';
import { ThemeToggle }     from '@/components/layout/ThemeToggle';
import toast               from 'react-hot-toast';

const DOMAINS = [
  { label: 'Artificial Intelligence', slug: 'ai',           icon: Brain,        color: '#06d0f5' },
  { label: 'Healthcare & Medicine',   slug: 'healthcare',   icon: Activity,     color: '#00ff87' },
  { label: 'Physics',                 slug: 'physics',      icon: Atom,         color: '#ffd166' },
  { label: 'Space & Astronomy',       slug: 'space',        icon: Orbit,        color: '#4cc9f0' },
  { label: 'Biology',                 slug: 'biology',      icon: Microscope,   color: '#06d0f5' },
  { label: 'Technology',              slug: 'technology',   icon: Cpu,          color: '#ff7c0a' },
  { label: 'Genomics',                slug: 'genomics',     icon: Dna,          color: '#00ff87' },
  { label: 'Chemistry',               slug: 'chemistry',    icon: FlaskConical, color: '#ffd166' },
  { label: 'Environment',             slug: 'environment',  icon: Leaf,         color: '#00ff87' },
  { label: 'Neuroscience',            slug: 'neuroscience', icon: Brain,        color: '#4cc9f0' },
  { label: 'Quantum',                 slug: 'quantum',      icon: Zap,          color: '#06d0f5' },
  { label: 'Global Science',          slug: 'global',       icon: Globe,        color: '#ff7c0a' },
];

const NAV_LINKS = [
  { label: 'News',    href: '/search?type=news'     },
  { label: 'Research',href: '/search?type=research' },
  { label: 'Topics',  href: '#', hasDropdown: true   },
];

export function Navbar() {
  const router      = useRouter();
  const pathname    = usePathname();
  const { user, userProfile } = useAuth();
  const { theme }   = useTheme();

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [topicsOpen,     setTopicsOpen]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);

  const topicsRef  = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (topicsRef.current && !topicsRef.current.contains(e.target as Node)) {
        setTopicsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    setProfileOpen(false);
    toast.success('Signed out successfully');
    router.push('/');
  };

  return (
    <>
      <nav
        className={`
          fixed top-[var(--ticker-height)] left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'sg-glass border-b border-[var(--border-subtle)]'
            : 'bg-transparent border-b border-transparent'
          }
        `}
        style={{ height: 'var(--navbar-height)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-ion-400 to-ion-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                <Atom className="w-4 h-4 text-void-950 stroke-[2.5]" />
              </div>
              <div className="absolute inset-0 rounded-lg ring-1 ring-ion-400/30 group-hover:ring-ion-400/60 transition-all" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Sci<span className="text-ion-400">agen</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ───────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} ref={topicsRef} className="relative">
                  <button
                    onClick={() => setTopicsOpen(o => !o)}
                    className={`
                      flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${topicsOpen
                        ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                      }
                    `}
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${topicsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {topicsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{  opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] p-4 rounded-2xl sg-glass shadow-card-lg"
                      >
                        <div className="grid grid-cols-3 gap-1">
                          {DOMAINS.map((domain) => {
                            const Icon = domain.icon;
                            return (
                              <Link
                                key={domain.slug}
                                href={`/category/${domain.slug}`}
                                onClick={() => setTopicsOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors group"
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: `${domain.color}18`, border: `1px solid ${domain.color}30` }}
                                >
                                  <Icon
                                    className="w-3.5 h-3.5 transition-colors"
                                    style={{ color: domain.color }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-tight">
                                  {domain.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${pathname === link.href
                      ? 'text-ion-400 bg-[var(--bg-elevated)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* ── Right Controls ──────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border-subtle)] hover:border-[var(--border-default)]"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-elevated)] text-[var(--text-dim)] border border-[var(--border-subtle)]">
                <span>⌘</span>K
              </kbd>
            </button>

            <ThemeToggle />

            {/* Auth */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[var(--border-subtle)] hover:ring-ion-400 transition-all"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt={user.displayName ?? 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ion-500 to-ion-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-void-950">
                        {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{  opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 py-2 rounded-2xl sg-glass shadow-card-lg"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {user.displayName ?? 'Scientist'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                        {userProfile?.role !== 'user' && (
                          <span className="sg-badge mt-1.5 inline-flex">{userProfile?.role}</span>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        {[
                          { icon: User,     label: 'Dashboard',  href: '/dashboard' },
                          { icon: Bookmark, label: 'Bookmarks',  href: '/dashboard/bookmarks' },
                          { icon: Settings, label: 'Settings',   href: '/dashboard/settings' },
                          ...(userProfile?.role === 'admin'
                            ? [{ icon: Shield, label: 'Admin Panel', href: '/admin' }]
                            : []
                          ),
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="py-1 border-t border-[var(--border-subtle)]">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-signal-red hover:bg-[var(--bg-elevated)] transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login"  className="sg-btn-ghost text-sm py-1.5 px-4">Sign in</Link>
                <Link href="/auth/signup" className="sg-btn-primary text-sm py-1.5 px-4">Join Free</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden sg-btn-icon"
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{   rotate:  90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{   rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{  opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden sg-glass border-t border-[var(--border-subtle)]"
            >
              <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-1">
                <Link href="/search?type=news"     className="px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">News</Link>
                <Link href="/search?type=research" className="px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">Research</Link>

                <div className="py-2 border-t border-[var(--border-subtle)] mt-1">
                  <p className="px-3 py-1 text-2xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Domains</p>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {DOMAINS.slice(0, 8).map((domain) => {
                      const Icon = domain.icon;
                      return (
                        <Link key={domain.slug} href={`/category/${domain.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
                          <Icon className="w-3.5 h-3.5" style={{ color: domain.color }} />
                          {domain.label.split(' ')[0]}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {!user && (
                  <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <Link href="/auth/login"  className="sg-btn-ghost text-sm py-2 flex-1 justify-center">Sign in</Link>
                    <Link href="/auth/signup" className="sg-btn-primary text-sm py-2 flex-1 justify-center">Join Free</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
