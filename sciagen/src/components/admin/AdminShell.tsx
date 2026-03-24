'use client';
import { useState, useEffect } from 'react';
import Link       from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Tag, BarChart3,
  Plus, Eye, Edit3, Trash2, Search, RefreshCw,
  TrendingUp, BookOpen, Globe, Bookmark,
  Shield, ChevronRight, CheckCircle, XCircle, Clock,
} from 'lucide-react';

interface AdminShellProps { adminRole: string; }

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',   href: '/admin'              },
  { icon: FileText,        label: 'Articles',   href: '/admin/articles'     },
  { icon: Users,           label: 'Users',      href: '/admin/users'        },
  { icon: Tag,             label: 'Categories', href: '/admin/categories'   },
  { icon: BarChart3,       label: 'Analytics',  href: '/admin/analytics'    },
];

function StatCard({ label, value, delta, icon: Icon, color }: {
  label: string; value: string | number; delta?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sg-card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {delta && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            delta.startsWith('+')
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {delta}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-semibold text-[var(--text-primary)] mb-1">
        {value}
      </p>
      <p className="text-xs text-[var(--text-muted)] font-sans uppercase tracking-wide">{label}</p>
    </motion.div>
  );
}

function RecentArticleRow({ title, status, domain, views }: {
  title: string; status: string; domain: string; views: number;
}) {
  const statusColors: Record<string, string> = {
    published: 'text-emerald-400', draft: 'text-yellow-400', scheduled: 'text-ion-400',
  };
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-ion-400 transition-colors">
          {title}
        </p>
        <span className="sg-badge mt-1 inline-flex">{domain}</span>
      </div>
      <span className={`text-xs font-medium capitalize ${statusColors[status] ?? 'text-[var(--text-muted)]'}`}>
        {status}
      </span>
      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 w-16 justify-end">
        <Eye className="w-3 h-3" />{views.toLocaleString()}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="sg-btn-icon w-7 h-7"><Edit3 className="w-3.5 h-3.5" /></button>
        <button className="sg-btn-icon w-7 h-7 hover:text-signal-red"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

export function AdminShell({ adminRole }: AdminShellProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats]         = useState({
    totalArticles: 0, publishedToday: 0, totalViews: 0, totalUsers: 0,
    bookmarks: 0, subscribers: 0, newsItems: 0, activeUsers: 0,
  });

  // In production: fetch from Firestore
  useEffect(() => {
    setStats({
      totalArticles: 284, publishedToday: 7, totalViews: 148293,
      totalUsers: 3841, bookmarks: 12043, subscribers: 11872,
      newsItems: 1203, activeUsers: 891,
    });
  }, []);

  const STAT_CARDS = [
    { label: 'Total Articles',   value: stats.totalArticles,              delta: '+7 today',  icon: FileText,   color: '#06d0f5' },
    { label: 'Total Views',      value: stats.totalViews.toLocaleString(), delta: '+2.4k',     icon: Eye,        color: '#00ff87' },
    { label: 'Registered Users', value: stats.totalUsers.toLocaleString(), delta: '+23',       icon: Users,      color: '#ffd166' },
    { label: 'Subscribers',      value: stats.subscribers.toLocaleString(),delta: '+41',       icon: Globe,      color: '#4cc9f0' },
    { label: 'Bookmarks',        value: stats.bookmarks.toLocaleString(),  delta: '+156',      icon: Bookmark,   color: '#ff7c0a' },
    { label: 'Live News Items',  value: stats.newsItems.toLocaleString(),  icon: TrendingUp,   color: '#ff3d57' },
  ];

  const MOCK_ARTICLES = [
    { title: 'CRISPR breakthrough enables in vivo base editing at scale', status: 'published', domain: 'genomics',   views: 12841 },
    { title: 'Quantum advantage demonstrated in drug discovery pipeline',   status: 'published', domain: 'quantum',    views: 9203  },
    { title: 'New AI model outperforms radiologists in cancer detection',   status: 'published', domain: 'healthcare', views: 31042 },
    { title: 'Webb Telescope captures earliest galaxy formation ever seen', status: 'published', domain: 'space',      views: 44123 },
    { title: 'Room-temperature superconductor candidate under review',      status: 'draft',     domain: 'physics',    views: 0     },
    { title: 'mRNA vaccine platform shows 94% efficacy against glioblast.', status: 'scheduled', domain: 'healthcare', views: 0    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col fixed top-[calc(var(--ticker-height)+var(--navbar-height))] bottom-0 left-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 gap-1 overflow-y-auto">
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <Shield className="w-4 h-4 text-ion-400" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Admin Panel</span>
          <span className="sg-badge ml-auto capitalize">{adminRole}</span>
        </div>

        {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}

        <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]">
          <a
            href={`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Open Sanity Studio
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </a>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 p-6 pt-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="sg-btn-ghost text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link href="/admin/articles/new" className="sg-btn-primary text-sm">
              <Plus className="w-4 h-4" /> New Article
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Articles */}
          <div className="xl:col-span-2 sg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                Recent Articles
              </h2>
              <Link href="/admin/articles" className="text-xs text-ion-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {MOCK_ARTICLES.map((article, i) => (
              <RecentArticleRow key={i} {...article} />
            ))}
          </div>

          {/* Quick stats / status */}
          <div className="flex flex-col gap-4">
            {/* Status overview */}
            <div className="sg-card p-5">
              <h3 className="font-sans font-semibold text-sm text-[var(--text-primary)] mb-4">
                Content Status
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Published', count: 241, icon: CheckCircle, color: '#00ff87' },
                  { label: 'Draft',     count: 28,  icon: Clock,       color: '#ffd166' },
                  { label: 'Scheduled', count: 15,  icon: Clock,       color: '#4cc9f0' },
                  { label: 'Archived',  count: 12,  icon: XCircle,     color: '#64748b' },
                ].map(({ label, count, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span className="text-sm text-[var(--text-secondary)] flex-1">{label}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{count}</span>
                    <div className="w-20 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(count / 296) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top domains */}
            <div className="sg-card p-5">
              <h3 className="font-sans font-semibold text-sm text-[var(--text-primary)] mb-4">
                Top Domains (Views)
              </h3>
              <div className="space-y-3">
                {[
                  { domain: 'Healthcare', pct: 91, color: '#00ff87' },
                  { domain: 'Space',      pct: 84, color: '#4cc9f0' },
                  { domain: 'AI & ML',    pct: 76, color: '#06d0f5' },
                  { domain: 'Genomics',   pct: 63, color: '#ffd166' },
                  { domain: 'Physics',    pct: 48, color: '#ff7c0a' },
                ].map(({ domain, pct, color }) => (
                  <div key={domain} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{domain}</span>
                      <span className="text-[var(--text-muted)]">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="sg-card p-5">
              <h3 className="font-sans font-semibold text-sm text-[var(--text-primary)] mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'New Article',   href: '/admin/articles/new',  icon: Plus       },
                  { label: 'Manage Users',  href: '/admin/users',          icon: Users      },
                  { label: 'View Search',   href: '/search',               icon: Search     },
                  { label: 'Analytics',     href: '/admin/analytics',      icon: BarChart3  },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
