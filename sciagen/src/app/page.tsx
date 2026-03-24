// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN HOMEPAGE
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next';
import { Suspense }      from 'react';

import { getFeaturedArticles, getCategories, getArticles } from '@/lib/sanity/client';
import { HeroSection }       from '@/components/home/HeroSection';
import { EditorialGrid }     from '@/components/home/EditorialGrid';
import { CategoryRow }       from '@/components/home/CategoryRow';
import { LiveNewsSection }   from '@/components/home/LiveNewsSection';
import { NewsletterBlock }   from '@/components/home/NewsletterBlock';
import { DomainChannels }    from '@/components/home/DomainChannels';
import { SkeletonHero }      from '@/components/ui/Skeletons';

export const metadata: Metadata = {
  title: 'Sciagen — Global Science Platform',
};

// Revalidate homepage every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  const [featured, categories, latest] = await Promise.all([
    getFeaturedArticles(5).catch(() => []),
    getCategories().catch(() => []),
    getArticles({ perPage: 8 }).then(r => r.items ?? []).catch(() => []),
  ]);

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Suspense fallback={<SkeletonHero />}>
        <HeroSection articles={featured} />
      </Suspense>

      {/* ── Domain Channels Row ──────────────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-10">
        <div className="max-w-screen-2xl mx-auto">
          <DomainChannels categories={categories} />
        </div>
      </section>

      {/* ── Editorial Grid ───────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-12 border-t border-[var(--border-subtle)]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="sg-section-label">Latest</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--text-primary)] tracking-tight">
                Recent Discoveries
              </h2>
            </div>
            <a href="/search" className="sg-btn-ghost text-sm hidden md:inline-flex">
              View all →
            </a>
          </div>
          <EditorialGrid articles={latest} />
        </div>
      </section>

      {/* ── Live Aggregated News ─────────────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-12 border-t border-[var(--border-subtle)]">
        <div className="max-w-screen-2xl mx-auto">
          <Suspense fallback={<div className="sg-skeleton h-64 w-full rounded-xl" />}>
            <LiveNewsSection />
          </Suspense>
        </div>
      </section>

      {/* ── Category Deep-Dives ──────────────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-12 border-t border-[var(--border-subtle)]">
        <div className="max-w-screen-2xl mx-auto">
          <CategoryRow categories={categories.slice(0, 8)} />
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-16 border-t border-[var(--border-subtle)]">
        <div className="max-w-screen-2xl mx-auto">
          <NewsletterBlock />
        </div>
      </section>
    </div>
  );
}
