'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, Zap, Clock, ChevronRight } from 'lucide-react';
import { NewsItem, Domain } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const DOMAINS: { slug: Domain; label: string }[] = [
  { slug: 'ai',         label: 'AI & ML'      },
  { slug: 'healthcare', label: 'Healthcare'   },
  { slug: 'space',      label: 'Space'        },
  { slug: 'physics',    label: 'Physics'      },
  { slug: 'biology',    label: 'Biology'      },
  { slug: 'technology', label: 'Technology'   },
  { slug: 'genomics',   label: 'Genomics'     },
  { slug: 'environment',label: 'Environment'  },
];

function NewsCard({ item }: { item: NewsItem }) {
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sg-card flex gap-4 p-4 group"
    >
      {item.imageUrl && (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="80px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="sg-badge">{item.domain}</span>
          <span className="text-2xs text-[var(--text-dim)]">{item.sourceName}</span>
        </div>
        <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-ion-400 transition-colors line-clamp-2 leading-snug mb-2">
          {item.title}
        </h4>
        {item.summary && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-2">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-2xs text-[var(--text-dim)]">
          <Clock className="w-3 h-3" />
          {timeAgo}
          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-ion-400" />
        </div>
      </div>
    </motion.a>
  );
}

export function LiveNewsSection() {
  const [activeDomain, setActiveDomain] = useState<Domain>('ai');
  const [items,        setItems]        = useState<NewsItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);

  const fetchNews = async (domain: Domain) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/news?domain=${domain}&page=1`);
      const data = await res.json();
      setItems(data.items ?? []);
      setLastUpdated(new Date());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeDomain);
    const interval = setInterval(() => fetchNews(activeDomain), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeDomain]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <p className="sg-section-label">Live Feed</p>
          <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            Global Science News
            <Zap className="w-6 h-6 text-ion-400" />
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[var(--text-dim)] font-sans">
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          )}
          <button
            onClick={() => fetchNews(activeDomain)}
            disabled={loading}
            className="sg-btn-icon disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Domain tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {DOMAINS.map(({ slug, label }) => (
          <button
            key={slug}
            onClick={() => setActiveDomain(slug)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all
              ${activeDomain === slug
                ? 'bg-ion-400 text-void-950 shadow-ion'
                : 'border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* News grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="sg-card p-4 flex gap-4">
              <div className="sg-skeleton w-20 h-20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="sg-skeleton h-3 w-16 rounded" />
                <div className="sg-skeleton h-3 w-full rounded" />
                <div className="sg-skeleton h-3 w-4/5 rounded" />
                <div className="sg-skeleton h-3 w-3/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>No news items at the moment. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.slice(0, 9).map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* See more */}
      {items.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            href={`/category/${activeDomain}`}
            className="sg-btn-ghost inline-flex"
          >
            More {DOMAINS.find(d => d.slug === activeDomain)?.label} news
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
