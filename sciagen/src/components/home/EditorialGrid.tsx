'use client';
// ─────────────────────────────────────────────────────────────────────────────
// HOME COMPONENTS — EditorialGrid, CategoryRow, DomainChannels
// ─────────────────────────────────────────────────────────────────────────────
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Atom, Brain, Orbit, FlaskConical, Dna, Leaf, Zap, Cpu, Activity, Microscope } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ArticleMeta, Category } from '@/lib/types';

// ── Editorial Grid ────────────────────────────────────────────────────────────

export function EditorialGrid({ articles }: { articles: ArticleMeta[] }) {
  if (!articles.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {articles.map((article, i) => (
        <motion.div
          key={article.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <Link href={`/article/${article.slug}`} className="sg-card block group h-full overflow-hidden">
            {/* Image */}
            {article.imageUrl && (
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.imageAlt ?? article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <span className="sg-badge mb-2 inline-flex">{article.domain}</span>
              <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-ion-400 transition-colors leading-snug line-clamp-3 mb-3">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime}m
                </span>
                <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────

export function CategoryRow({ categories }: { categories: Category[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="sg-section-label">Explore</p>
          <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--text-primary)]">
            Browse by Domain
          </h2>
        </div>
        <Link href="/search" className="sg-btn-ghost text-sm hidden md:inline-flex">
          All domains →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(0, 8).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/category/${cat.slug}`}
              className="sg-card flex flex-col items-start p-5 gap-3 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${cat.color ?? '#06d0f5'}15`, border: `1px solid ${cat.color ?? '#06d0f5'}25` }}
              >
                <span style={{ color: cat.color ?? '#06d0f5' }} className="text-lg">{cat.icon ?? '⚛'}</span>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-[var(--text-primary)] group-hover:text-ion-400 transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">{cat.articleCount} articles</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Domain Channels ───────────────────────────────────────────────────────────

const DOMAIN_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  ai:           { icon: Brain,       color: '#06d0f5' },
  healthcare:   { icon: Activity,    color: '#00ff87' },
  physics:      { icon: Atom,        color: '#ffd166' },
  space:        { icon: Orbit,       color: '#4cc9f0' },
  biology:      { icon: Microscope,  color: '#06d0f5' },
  technology:   { icon: Cpu,         color: '#ff7c0a' },
  genomics:     { icon: Dna,         color: '#00ff87' },
  chemistry:    { icon: FlaskConical,color: '#ffd166' },
  environment:  { icon: Leaf,        color: '#00ff87' },
  quantum:      { icon: Zap,         color: '#06d0f5' },
};

const DEFAULT_CHANNELS = [
  { slug: 'ai',         name: 'AI & ML'    },
  { slug: 'healthcare', name: 'Healthcare' },
  { slug: 'space',      name: 'Space'      },
  { slug: 'physics',    name: 'Physics'    },
  { slug: 'biology',    name: 'Biology'    },
  { slug: 'technology', name: 'Technology' },
  { slug: 'genomics',   name: 'Genomics'   },
  { slug: 'quantum',    name: 'Quantum'    },
];

export function DomainChannels({ categories }: { categories: Category[] }) {
  const channels = categories.length > 0
    ? categories
    : DEFAULT_CHANNELS.map((c, i) => ({ id: String(i), slug: c.slug, name: c.name, articleCount: 0, domain: c.slug, description: '', color: '', icon: '' }));

  return (
    <div>
      <p className="sg-section-label">Channels</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {channels.slice(0, 12).map((cat, i) => {
          const meta    = DOMAIN_ICONS[cat.slug] ?? { icon: Atom, color: '#06d0f5' };
          const Icon    = meta.icon;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-all flex-shrink-0 group"
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-colors" style={{ color: meta.color }} />
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] whitespace-nowrap transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
        <Link
          href="/search"
          className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-ion-400/20 text-ion-400 text-sm font-medium whitespace-nowrap hover:bg-ion-400/5 transition-colors flex-shrink-0"
        >
          All Channels <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
