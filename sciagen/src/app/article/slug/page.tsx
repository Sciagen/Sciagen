// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE PAGE — Dynamic route /article/[slug]
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata }        from 'next';
import { notFound }             from 'next/navigation';
import { Suspense }             from 'react';
import {
  getArticleBySlug,
  getRelatedArticles,
  incrementViewCount,
} from '@/lib/sanity/client';
import { ArticleReader }        from '@/components/article/ArticleReader';
import { RelatedArticles }      from '@/components/article/RelatedArticles';
import { ArticleSkeleton }      from '@/components/ui/Skeletons';

// ── Dynamic metadata ──────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  const { title, description, imageUrl, author, publishedAt, seo } = article;

  return {
    title,
    description: seo?.metaDescription ?? description,
    authors:     [{ name: author?.name }],
    openGraph: {
      title,
      description: seo?.metaDescription ?? description,
      images: [{ url: seo?.ogImage ?? imageUrl ?? '', width: 1200, height: 630 }],
      type:      'article',
      authors:   [author?.name ?? 'Sciagen Editorial'],
      publishedTime: publishedAt,
    },
    twitter: {
      card:  'summary_large_image',
      title,
      description: seo?.metaDescription ?? description,
      images: [seo?.ogImage ?? imageUrl ?? ''],
    },
    alternates: {
      canonical: seo?.canonicalUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/article/${params.slug}`,
    },
    keywords: seo?.keywords,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.slug, article.domain, 4)
    .catch(() => []);

  // Async view count increment (non-blocking)
  incrementViewCount(article._id).catch(console.error);

  // Article JSON-LD
  const articleJsonLd = {
    '@context':     'https://schema.org',
    '@type':        'Article',
    headline:       article.title,
    description:    article.description,
    image:          article.imageUrl,
    author: {
      '@type': 'Person',
      name:    article.author?.name,
    },
    publisher: {
      '@type': 'Organization',
      name:    'Sciagen',
      logo: {
        '@type': 'ImageObject',
        url:     `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified:  article.updatedAt,
    mainEntityOfPage: {
      '@type': '@id',
      '@id':   `${process.env.NEXT_PUBLIC_APP_URL}/article/${article.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleReader article={article} />
      </Suspense>

      {related.length > 0 && (
        <section className="px-4 md:px-8 lg:px-12 xl:px-16 py-16 border-t border-[var(--border-subtle)]">
          <div className="max-w-screen-2xl mx-auto">
            <RelatedArticles articles={related} />
          </div>
        </section>
      )}
    </>
  );
}
