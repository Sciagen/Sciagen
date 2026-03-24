// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN CLOUDFLARE WORKER — EDGE API LAYER
// Handles: News aggregation, AI summarization, caching, rate limiting
// Deploy: wrangler deploy
// ─────────────────────────────────────────────────────────────────────────────

export interface Env {
  // KV Namespaces
  CACHE:          KVNamespace;
  RATE_LIMITS:    KVNamespace;
  NEWS_DEDUP:     KVNamespace;

  // Secrets
  NEWS_API_KEY:        string;
  PUBMED_API_KEY:      string;
  ANTHROPIC_API_KEY:   string;
  DEEPL_API_KEY:       string;
  DICTIONARY_API_URL:  string;
  ALLOWED_ORIGINS:     string;
}

// ── Domain → keyword mapping for news filtering ───────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  ai:            ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'LLM', 'GPT', 'AI'],
  healthcare:    ['medicine', 'health', 'drug', 'clinical', 'patient', 'disease', 'therapy', 'FDA', 'hospital'],
  physics:       ['physics', 'quantum', 'particle', 'CERN', 'relativity', 'gravitational', 'cosmology'],
  biology:       ['biology', 'evolution', 'ecology', 'species', 'genome', 'cell', 'protein', 'bacteria'],
  space:         ['space', 'NASA', 'ESA', 'asteroid', 'planet', 'galaxy', 'telescope', 'launch', 'orbit', 'Mars'],
  technology:    ['technology', 'semiconductor', 'chip', 'robot', 'software', 'internet', 'cyber', 'quantum computing'],
  chemistry:     ['chemistry', 'molecule', 'reaction', 'catalyst', 'polymer', 'synthesis', 'compound'],
  neuroscience:  ['neuroscience', 'brain', 'neuron', 'cognition', 'memory', 'synapse', 'alzheimer'],
  environment:   ['climate', 'environment', 'carbon', 'emissions', 'renewable', 'pollution', 'ecosystem'],
  genomics:      ['genomics', 'genome', 'CRISPR', 'gene editing', 'DNA', 'RNA', 'sequencing', 'epigenetics'],
  quantum:       ['quantum', 'qubit', 'superposition', 'entanglement', 'quantum computing', 'quantum supremacy'],
  energy:        ['energy', 'solar', 'nuclear fusion', 'battery', 'hydrogen', 'grid', 'renewable energy'],
};

const ALLOWED_CORS = [
  'https://sciagen.com',
  'https://www.sciagen.com',
  'https://sciagen.pages.dev',
  'http://localhost:3000',
];

// ── CORS Helper ───────────────────────────────────────────────────────────────

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = ALLOWED_CORS.includes(origin ?? '') ? origin! : ALLOWED_CORS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age':       '86400',
  };
}

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Powered-By': 'Sciagen Edge',
      ...extraHeaders,
    },
  });
}

// ── Rate Limiter (sliding window) ─────────────────────────────────────────────

async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const now    = Date.now();
  const stored = await env.RATE_LIMITS.get(key);
  const data   = stored ? JSON.parse(stored) : { count: 0, resetAt: now + windowSeconds * 1000 };

  if (now > data.resetAt) {
    data.count   = 1;
    data.resetAt = now + windowSeconds * 1000;
  } else {
    data.count++;
  }

  await env.RATE_LIMITS.put(key, JSON.stringify(data), { expirationTtl: windowSeconds });
  return data.count <= limit;
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function generateArticleHash(title: string, url: string): string {
  const normalized = (title + url).toLowerCase().replace(/\s+/g, ' ').trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function isDuplicate(env: Env, hash: string): Promise<boolean> {
  const existing = await env.NEWS_DEDUP.get(hash);
  if (existing) return true;
  await env.NEWS_DEDUP.put(hash, '1', { expirationTtl: 86400 * 7 }); // 7 days
  return false;
}

// ── Classify article domain ───────────────────────────────────────────────────

function classifyDomain(text: string): string {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length;
  }

  const topDomain = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .find(([, score]) => score > 0);

  return topDomain?.[0] ?? 'technology';
}

// ── AI Summarization via Claude ───────────────────────────────────────────────

async function summarizeWithClaude(env: Env, text: string, maxWords = 60): Promise<string> {
  const prompt = `Summarize this science article in exactly ${maxWords} words or fewer. 
Be precise, accurate, and engaging. Start directly with the main finding.
Do not start with "The article" or "This article".

Article: ${text.slice(0, 3000)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:     'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages:  [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return text.slice(0, 200) + '…';

  const data = await res.json() as { content: { text: string }[] };
  return data.content[0]?.text ?? text.slice(0, 200) + '…';
}

// ── Fetch from NewsAPI ────────────────────────────────────────────────────────

async function fetchFromNewsAPI(env: Env, query: string, page = 1): Promise<unknown[]> {
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q',        query);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy',   'publishedAt');
  url.searchParams.set('pageSize', '20');
  url.searchParams.set('page',     String(page));
  url.searchParams.set('apiKey',   env.NEWS_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json() as { articles?: unknown[] };
  return data.articles ?? [];
}

// ── Fetch from PubMed (Research Papers) ──────────────────────────────────────

async function fetchFromPubMed(query: string, maxResults = 10): Promise<unknown[]> {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=pub+date`;
  const searchRes  = await fetch(searchUrl);
  const searchData = await searchRes.json() as { esearchresult?: { idlist?: string[] } };
  const ids        = searchData.esearchresult?.idlist ?? [];

  if (ids.length === 0) return [];

  const summaryUrl  = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
  const summaryRes  = await fetch(summaryUrl);
  const summaryData = await summaryRes.json() as { result?: Record<string, unknown> };
  const result      = summaryData.result ?? {};

  return ids
    .map(id => result[id])
    .filter(Boolean);
}

// ── Main Router ───────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url    = new URL(request.url);
    const origin = request.headers.get('Origin');
    const cors   = corsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Rate limiting by IP
    const ip      = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const allowed = await checkRateLimit(env, `ip:${ip}`, 120, 60); // 120 req/min
    if (!allowed) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429, {
        ...cors,
        'Retry-After': '60',
        'X-RateLimit-Limit': '120',
      });
    }

    const path = url.pathname;

    try {
      // ── GET /news?domain=ai&page=1 ────────────────────────────────────────
      if (path === '/news' && request.method === 'GET') {
        const domain = url.searchParams.get('domain') ?? 'ai';
        const page   = parseInt(url.searchParams.get('page') ?? '1');
        const cacheKey = `news:${domain}:${page}`;

        // Check KV cache first (5min TTL)
        const cached = await env.CACHE.get(cacheKey);
        if (cached) {
          return jsonResponse(JSON.parse(cached), 200, {
            ...cors,
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=300',
          });
        }

        const keywords = DOMAIN_KEYWORDS[domain]?.slice(0, 3) ?? ['science'];
        const query    = keywords.join(' OR ');
        const rawItems = await fetchFromNewsAPI(env, query, page);

        // Process and deduplicate articles
        const processed: unknown[] = [];
        for (const item of rawItems as Record<string, string>[]) {
          const hash = generateArticleHash(item.title ?? '', item.url ?? '');
          if (await isDuplicate(env, hash)) continue;

          const classifiedDomain = classifyDomain(`${item.title} ${item.description}`);
          const summary          = await summarizeWithClaude(
            env, `${item.title}. ${item.description}`, 50,
          );

          processed.push({
            id:          hash,
            externalId:  hash,
            title:       item.title,
            description: item.description,
            url:         item.url,
            imageUrl:    item.urlToImage ?? null,
            sourceName:  item.source?.name ?? 'Unknown',
            sourceUrl:   item.source?.url ?? item.url,
            author:      item.author ?? null,
            publishedAt: item.publishedAt,
            domain:      classifiedDomain,
            summary,
            isDuplicate: false,
            fetchedAt:   new Date().toISOString(),
          });
        }

        const response = { items: processed, domain, page, cached: false };
        await env.CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 300 });

        return jsonResponse(response, 200, {
          ...cors,
          'X-Cache': 'MISS',
          'Cache-Control': 'public, max-age=300',
        });
      }

      // ── GET /news/breaking ────────────────────────────────────────────────
      if (path === '/news/breaking' && request.method === 'GET') {
        const cacheKey = 'news:breaking';
        const cached = await env.CACHE.get(cacheKey);
        if (cached) return jsonResponse(JSON.parse(cached), 200, { ...cors, 'X-Cache': 'HIT' });

        const articles = await fetchFromNewsAPI(env, 'science breakthrough discovery', 1);
        const breaking = (articles as Record<string, string>[])
          .slice(0, 6)
          .map(a => ({ title: a.title, url: a.url, source: a.source?.name }));

        await env.CACHE.put(cacheKey, JSON.stringify(breaking), { expirationTtl: 180 });
        return jsonResponse(breaking, 200, { ...cors, 'X-Cache': 'MISS' });
      }

      // ── GET /research?domain=biology&limit=10 ─────────────────────────────
      if (path === '/research' && request.method === 'GET') {
        const domain    = url.searchParams.get('domain') ?? 'biology';
        const limit     = parseInt(url.searchParams.get('limit') ?? '10');
        const cacheKey  = `research:${domain}:${limit}`;
        const cached    = await env.CACHE.get(cacheKey);
        if (cached) return jsonResponse(JSON.parse(cached), 200, { ...cors, 'X-Cache': 'HIT' });

        const keywords = DOMAIN_KEYWORDS[domain]?.slice(0, 2) ?? ['biology'];
        const papers   = await fetchFromPubMed(keywords.join(' AND '), limit);

        await env.CACHE.put(cacheKey, JSON.stringify(papers), { expirationTtl: 3600 });
        return jsonResponse(papers, 200, { ...cors, 'X-Cache': 'MISS' });
      }

      // ── POST /ai/summarize ────────────────────────────────────────────────
      if (path === '/ai/summarize' && request.method === 'POST') {
        const body     = await request.json() as { text: string; maxWords?: number };
        const summary  = await summarizeWithClaude(env, body.text, body.maxWords ?? 60);
        return jsonResponse({ summary }, 200, cors);
      }

      // ── POST /ai/recommend ────────────────────────────────────────────────
      if (path === '/ai/recommend' && request.method === 'POST') {
        const body = await request.json() as {
          readHistory: string[];
          domains: string[];
          count?: number;
        };

        const prompt = `Based on reading history of topics: ${body.readHistory.slice(-10).join(', ')}, 
and preferred domains: ${body.domains.join(', ')}, 
suggest ${body.count ?? 5} search queries for finding relevant science articles.
Return ONLY a JSON array of query strings, no explanation.`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key':   env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 300,
            messages:   [{ role: 'user', content: prompt }],
          }),
        });

        const data = await res.json() as { content: { text: string }[] };
        let queries: string[] = [];
        try {
          queries = JSON.parse(data.content[0]?.text ?? '[]');
        } catch {
          queries = body.domains.map(d => `latest ${d} discoveries`);
        }

        return jsonResponse({ queries }, 200, cors);
      }

      // ── GET /dictionary?word=photosynthesis ───────────────────────────────
      if (path === '/dictionary' && request.method === 'GET') {
        const word     = url.searchParams.get('word');
        if (!word) return jsonResponse({ error: 'word parameter required' }, 400, cors);

        const cacheKey = `dict:${word.toLowerCase()}`;
        const cached   = await env.CACHE.get(cacheKey);
        if (cached) return jsonResponse(JSON.parse(cached), 200, cors);

        const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const data = await res.json();

        await env.CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 });
        return jsonResponse(data, 200, cors);
      }

      // ── POST /translate ───────────────────────────────────────────────────
      if (path === '/translate' && request.method === 'POST') {
        const body = await request.json() as { text: string; targetLang: string; sourceLang?: string };

        const res = await fetch('https://api-free.deepl.com/v2/translate', {
          method:  'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            text:        [body.text],
            target_lang: body.targetLang.toUpperCase(),
            source_lang: body.sourceLang?.toUpperCase(),
          }),
        });

        const data = await res.json() as { translations?: { text: string; detected_source_language: string }[] };
        const translation = data.translations?.[0];

        return jsonResponse({
          originalText:   body.text,
          translatedText: translation?.text ?? '',
          sourceLang:     translation?.detected_source_language ?? body.sourceLang ?? 'auto',
          targetLang:     body.targetLang,
          confidence:     1.0,
        }, 200, cors);
      }

      // ── POST /newsletter/subscribe ────────────────────────────────────────
      if (path === '/newsletter/subscribe' && request.method === 'POST') {
        // Delegate to Next.js API – just validate and forward
        const body = await request.json() as { email: string };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
          return jsonResponse({ error: 'Invalid email address' }, 400, cors);
        }
        // In production: store in KV and sync with Resend/Mailchimp
        await env.CACHE.put(`subscriber:${body.email}`, '1', { expirationTtl: 86400 });
        return jsonResponse({ success: true, message: 'Subscribed successfully' }, 200, cors);
      }

      // ── Health ────────────────────────────────────────────────────────────
      if (path === '/health') {
        return jsonResponse({
          status:    'ok',
          version:   '1.0.0',
          platform:  'Sciagen Edge',
          timestamp: new Date().toISOString(),
          region:    (request as Request & { cf?: { colo?: string } }).cf?.colo ?? 'unknown',
        }, 200, cors);
      }

      return jsonResponse({ error: 'Not found' }, 404, cors);

    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal server error' }, 500, cors);
    }
  },

  // ── Scheduled job: refresh news cache every 10 minutes ───────────────────
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const domains = Object.keys(DOMAIN_KEYWORDS).slice(0, 6);
    for (const domain of domains) {
      const keywords = DOMAIN_KEYWORDS[domain]?.slice(0, 2) ?? ['science'];
      const query    = keywords.join(' OR ');
      const articles = await fetchFromNewsAPI(env, query, 1);

      for (const item of articles as Record<string, string>[]) {
        const hash = generateArticleHash(item.title ?? '', item.url ?? '');
        await env.NEWS_DEDUP.put(hash, '1', { expirationTtl: 86400 * 7 });
      }

      await env.CACHE.delete(`news:${domain}:1`); // Bust cache
    }
  },
};
