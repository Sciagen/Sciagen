// ─────────────────────────────────────────────────────────────────────────────
// SANITY CLIENT — SCIAGEN CMS
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@sanity/client';
import imageUrlBuilder  from '@sanity/image-url';
import { SanityImageAsset } from '../types';

export const sanityClient = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:     process.env.NODE_ENV === 'production',
  token:      process.env.SANITY_API_TOKEN,  // Server-side writes
  perspective: 'published',
});

// ── Write client (mutations, used server-side only) ──────────────────────────

export const sanityWriteClient = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:     false,
  token:      process.env.SANITY_WRITE_TOKEN!,
});

// ── Image URL builder ────────────────────────────────────────────────────────

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageAsset) {
  return builder.image(source);
}

export function getImageUrl(
  source: SanityImageAsset,
  { width = 1200, height = 675 } = {},
): string {
  return builder
    .image(source)
    .width(width)
    .height(height)
    .fit('crop')
    .auto('format')
    .quality(85)
    .url();
}

// ── GROQ Query helpers ───────────────────────────────────────────────────────

// Article fragment (reused across queries)
const ARTICLE_FRAGMENT = `
  _id,
  "slug": slug.current,
  title,
  description,
  "imageUrl": mainImage.asset->url,
  "imageAlt": mainImage.alt,
  domain,
  category->{ _id, name, "slug": slug.current, color, icon },
  tags[]->{ _id, name, "slug": slug.current },
  author->{ _id, name, "slug": slug.current, credentials, "avatar": photo.asset->url },
  source,
  sourceUrl,
  sourceName,
  publishedAt,
  _updatedAt,
  readingTime,
  wordCount,
  isFeatured,
  isPremium,
  isBreaking,
  status,
`;

// ── Fetch published articles with pagination ──────────────────────────────────

export async function getArticles({
  page    = 1,
  perPage = 12,
  domain,
  category,
  tag,
  featured,
}: {
  page?:     number;
  perPage?:  number;
  domain?:   string;
  category?: string;
  tag?:      string;
  featured?: boolean;
} = {}) {
  const offset = (page - 1) * perPage;
  const conditions = [
    `_type == "article"`,
    `status == "published"`,
    domain    ? `domain == "${domain}"` : null,
    category  ? `category->slug.current == "${category}"` : null,
    tag       ? `"${tag}" in tags[]->slug.current` : null,
    featured  ? `isFeatured == true` : null,
  ].filter(Boolean).join(' && ');

  const query = `{
    "items": *[${conditions}] | order(publishedAt desc) [${offset}...${offset + perPage}] {
      ${ARTICLE_FRAGMENT}
    },
    "total": count(*[${conditions}])
  }`;

  return sanityClient.fetch(query);
}

// ── Fetch single article by slug ─────────────────────────────────────────────

export async function getArticleBySlug(slug: string) {
  const query = `*[_type == "article" && slug.current == $slug && status == "published"][0] {
    ${ARTICLE_FRAGMENT}
    body,
    summary,
    "relatedIds": related[]->_id,
    viewCount,
    shareCount,
    seo {
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url,
      keywords,
      canonicalUrl,
    }
  }`;
  return sanityClient.fetch(query, { slug });
}

// ── Fetch related articles ───────────────────────────────────────────────────

export async function getRelatedArticles(
  currentSlug: string,
  domain: string,
  limit = 4,
) {
  const query = `*[
    _type == "article"
    && slug.current != $slug
    && domain == $domain
    && status == "published"
  ] | order(publishedAt desc) [0...$limit] {
    ${ARTICLE_FRAGMENT}
  }`;
  return sanityClient.fetch(query, { slug: currentSlug, domain, limit });
}

// ── Fetch all categories ─────────────────────────────────────────────────────

export async function getCategories() {
  return sanityClient.fetch(`
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      domain,
      color,
      icon,
      "articleCount": count(*[_type == "article" && references(^._id) && status == "published"])
    }
  `);
}

// ── Fetch featured / hero articles ───────────────────────────────────────────

export async function getFeaturedArticles(limit = 5) {
  return sanityClient.fetch(`
    *[_type == "article" && isFeatured == true && status == "published"]
    | order(publishedAt desc) [0...$limit] { ${ARTICLE_FRAGMENT} }
  `, { limit });
}

// ── Search articles ──────────────────────────────────────────────────────────

export async function searchArticles(q: string, limit = 20) {
  return sanityClient.fetch(`
    *[_type == "article" && status == "published" && (
      title match $q + "*"
      || description match $q + "*"
      || pt::text(body) match $q + "*"
    )] | order(_score desc) | order(publishedAt desc) [0...$limit] {
      ${ARTICLE_FRAGMENT}
    }
  `, { q, limit });
}

// ── Increment view count (server action) ─────────────────────────────────────

export async function incrementViewCount(id: string) {
  return sanityWriteClient
    .patch(id)
    .setIfMissing({ viewCount: 0 })
    .inc({ viewCount: 1 })
    .commit({ visibility: 'async' });
}
