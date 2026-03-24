'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
import { useState }         from 'react';
import Link                 from 'next/link';
import Image                from 'next/image';
import { motion }           from 'framer-motion';
import { Clock, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import { ArticleMeta }      from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface HeroSectionProps {
  articles: ArticleMeta[];
}

const DOMAIN_COLORS: Record<string, string> = {
  ai:           '#06d0f5',
  healthcare:   '#00ff87',
  physics:      '#ffd166',
  space:        '#4cc9f0',
  biology:      '#06d0f5',
  technology:   '#ff7c0a',
  genomics:     '#00ff87',
  chemistry:    '#ffd166',
  environment:  '#00ff87',
  neuroscience: '#4cc9f0',
  quantum:      '#06d0f5',
};

function HeroCard({ article, isMain }: { article: ArticleMeta; isMain: boolean }) {
  const color = DOMAIN_COLORS[article.domain] ?? '#06d0f5';
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  if (isMain) {
    return (
      <Link href={`/article/${article.slug}`} className="block group relative h-full">
        {/* Background image */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.imageAlt ?? article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-mesh bg-grid-pattern" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-8 lg:p-10">
          {/* Domain badge */}
          <div className="flex items-center gap-3 mb-4">
            {article.isBreaking && (
              <span className="sg-badge-live sg-badge">Breaking</span>
            )}
            <span
              className="sg-badge"
              style={{
                background: `${color}15`,
                color,
                borderColor: `${color}30`,
              }}
            >
              {article.category?.name ?? article.domain}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.12] tracking-tight mb-4 text-balance group-hover:text-ion-100 transition-colors duration-300">
            {article.title}
          </h1>

          {/* Description */}
          <p className="font-body text-white/70 text-base md:text-lg leading-relaxed mb-6 line-clamp-2 hidden md:block">
            {article.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="font-sans font-medium text-white/80">{article.author?.name}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime} min read
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{timeAgo}</span>
          </div>

          {/* Hover CTA */}
          <div className="mt-5 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span style={{ color }}>Read article</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color }} />
          </div>
        </div>

        {/* Border glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-ion-400/30 transition-all duration-300"
          style={{ boxShadow: '0 0 0 0 transparent' }}
        />
      </Link>
    );
  }

  // Secondary card
  return (
    <Link href={`/article/${article.slug}`} className="block group sg-card p-0 overflow-hidden">
      <div className="flex gap-4 p-4 h-full">
        {/* Thumbnail */}
        {article.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt ?? article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="96px"
            />
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <span
              className="sg-badge mb-2 inline-flex"
              style={{
                background: `${color}15`,
                color,
                borderColor: `${color}30`,
              }}
            >
              {article.domain}
            </span>
            <h3 className="font-display text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-ion-400 transition-colors">
              {article.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-2">
            <Clock className="w-3 h-3" />
            <span>{article.readingTime}m</span>
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HeroSection({ articles }: HeroSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (articles.length === 0) {
    return (
      <section className="px-4 md:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
        <div className="max-w-screen-2xl mx-auto h-[600px] sg-skeleton rounded-2xl" />
      </section>
    );
  }

  const main       = articles[activeIdx] ?? articles[0];
  const secondaries = articles.filter((_, i) => i !== activeIdx).slice(0, 3);

  return (
    <section className="px-4 md:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
      <div className="max-w-screen-2xl mx-auto">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ion-400" />
            <p className="sg-section-label m-0">Editor&apos;s Pick</p>
          </div>
          <Link href="/search?featured=true" className="text-xs text-[var(--text-muted)] hover:text-ion-400 transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            All featured
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[600px]">

          {/* Main hero card */}
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="lg:col-span-2 h-[400px] lg:h-full"
          >
            <HeroCard article={main} isMain={true} />
          </motion.div>

          {/* Side stack */}
          <div className="flex flex-col gap-3">
            {secondaries.map((article, i) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                onClick={() => {
                  const originalIdx = articles.indexOf(article);
                  setActiveIdx(originalIdx);
                }}
                className="flex-1 cursor-pointer"
              >
                <HeroCard article={article} isMain={false} />
              </motion.div>
            ))}

            {/* Indicator dots */}
            {articles.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {articles.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeIdx
                        ? 'w-6 h-1.5 bg-ion-400'
                        : 'w-1.5 h-1.5 bg-[var(--border-default)] hover:bg-ion-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
