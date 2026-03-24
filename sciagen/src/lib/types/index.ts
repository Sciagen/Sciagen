// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN — GLOBAL TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

// ── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'editor' | 'admin';

export interface SciUser {
  uid:          string;
  email:        string;
  displayName:  string | null;
  photoURL:     string | null;
  role:         UserRole;
  emailVerified: boolean;
  createdAt:    string;
  updatedAt:    string;
  preferences:  UserPreferences;
  stats:        UserStats;
}

export interface UserPreferences {
  theme:        'dark' | 'light' | 'sepia';
  fontSize:     number;        // 14–22 (px)
  fontFamily:   string;        // 'reading' | 'sans' | 'display'
  lineSpacing:  number;        // 1.4–2.2
  blueLight:    boolean;
  readingMode:  'scroll' | 'paginated';
  ttsSpeed:     number;        // 0.5–2.0
  newsletter:   boolean;
  language:     string;        // ISO 639-1
}

export interface UserStats {
  articlesRead:   number;
  readingTime:    number;  // minutes
  bookmarks:      number;
  highlights:     number;
  notes:          number;
}

// ── Content & Articles ────────────────────────────────────────────────────────

export type Domain =
  | 'ai'          | 'healthcare'  | 'physics'     | 'biology'
  | 'space'       | 'technology'  | 'chemistry'   | 'neuroscience'
  | 'environment' | 'mathematics' | 'genomics'    | 'psychology'
  | 'business'    | 'energy'      | 'materials'   | 'quantum';

export type ContentSource = 'editorial' | 'aggregated' | 'research';
export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Author {
  id:          string;
  name:        string;
  slug:        string;
  bio:         string;
  avatar:      string;
  credentials: string;
  social: {
    twitter?:  string;
    linkedin?: string;
    website?:  string;
  };
}

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description: string;
  domain:      Domain;
  color:       string;
  icon:        string;
  articleCount: number;
}

export interface Tag {
  id:    string;
  name:  string;
  slug:  string;
  count: number;
}

export interface ArticleMeta {
  title:       string;
  slug:        string;
  description: string;
  imageUrl:    string;
  imageAlt:    string;
  domain:      Domain;
  category:    Category;
  tags:        Tag[];
  author:      Author;
  source:      ContentSource;
  sourceUrl?:  string;
  sourceName?: string;
  publishedAt: string;
  updatedAt:   string;
  readingTime: number;  // minutes
  wordCount:   number;
  isFeatured:  boolean;
  isPremium:   boolean;
  isBreaking:  boolean;
  status:      ContentStatus;
}

export interface Article extends ArticleMeta {
  body:         string;        // HTML / Portable Text rendered
  summary:      string;        // AI-generated summary
  relatedIds:   string[];
  viewCount:    number;
  shareCount:   number;
  seo: {
    metaTitle:       string;
    metaDescription: string;
    ogImage:         string;
    keywords:        string[];
    canonicalUrl:    string;
    jsonLd:          Record<string, unknown>;
  };
}

// ── Aggregated News ───────────────────────────────────────────────────────────

export interface NewsItem {
  id:          string;
  externalId:  string;
  title:       string;
  description: string;
  url:         string;
  imageUrl:    string | null;
  sourceName:  string;
  sourceUrl:   string;
  author:      string | null;
  publishedAt: string;
  domain:      Domain;
  summary:     string;  // AI-generated
  isDuplicate: boolean;
  fetchedAt:   string;
}

// ── User Interactions ─────────────────────────────────────────────────────────

export interface Bookmark {
  id:          string;
  userId:      string;
  articleId:   string;
  articleMeta: ArticleMeta;
  createdAt:   string;
  folder?:     string;
}

export interface Highlight {
  id:         string;
  userId:     string;
  articleId:  string;
  text:       string;
  color:      'yellow' | 'cyan' | 'green' | 'pink';
  startOffset: number;
  endOffset:   number;
  createdAt:  string;
}

export interface Note {
  id:         string;
  userId:     string;
  articleId:  string;
  content:    string;
  highlightId?: string;
  position:   { x: number; y: number };
  createdAt:  string;
  updatedAt:  string;
}

export interface ReadingHistory {
  userId:     string;
  articleId:  string;
  progress:   number;  // 0–100 percent
  lastRead:   string;
  completed:  boolean;
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  articles:   ArticleMeta[];
  news:       NewsItem[];
  categories: Category[];
  total:      number;
  query:      string;
  took:       number;  // ms
}

export interface SearchSuggestion {
  text:  string;
  type:  'query' | 'article' | 'category' | 'tag';
  count?: number;
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id:          string;
  email:       string;
  name?:       string;
  domains:     Domain[];
  confirmed:   boolean;
  createdAt:   string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers:      number;
  activeUsers:     number;
  totalArticles:   number;
  publishedToday:  number;
  totalViews:      number;
  totalBookmarks:  number;
  subscribers:     number;
  newsItems:       number;
}

export interface AuditLog {
  id:        string;
  userId:    string;
  userEmail: string;
  action:    string;
  resource:  string;
  resourceId: string;
  metadata:  Record<string, unknown>;
  ip:        string;
  createdAt: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:    T | null;
  error:   string | null;
  status:  number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items:   T[];
  total:   number;
  page:    number;
  perPage: number;
  hasMore: boolean;
}

// ── Reading Experience ────────────────────────────────────────────────────────

export interface ReadingSettings {
  theme:      'dark' | 'light' | 'sepia';
  fontSize:   number;
  fontFamily: string;
  lineHeight: number;
  maxWidth:   'narrow' | 'medium' | 'wide';
  blueLight:  boolean;
  ttsActive:  boolean;
  ttsSpeed:   number;
  ttsVoice:   string;
}

// ── Dictionary / Translation ──────────────────────────────────────────────────

export interface DictionaryEntry {
  word:        string;
  phonetic?:   string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?:   string;
      synonyms:   string[];
    }[];
  }[];
}

export interface TranslationResult {
  originalText:   string;
  translatedText: string;
  sourceLang:     string;
  targetLang:     string;
  confidence:     number;
}

// ── Sanity ────────────────────────────────────────────────────────────────────

export interface SanityImageAsset {
  _type:  'image';
  asset: {
    _ref:  string;
    _type: 'reference';
  };
  alt?:    string;
  caption?: string;
}

export interface SanityPortableText {
  _key:   string;
  _type:  string;
  [key: string]: unknown;
}

// ── Cloudflare Worker ─────────────────────────────────────────────────────────

export interface WorkerNewsRequest {
  domain?:  Domain;
  page?:    number;
  limit?:   number;
  q?:       string;
}

export interface WorkerAISummaryRequest {
  text:     string;
  maxWords: number;
  lang?:    string;
}
