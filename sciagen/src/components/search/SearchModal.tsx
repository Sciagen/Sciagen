'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SEARCH MODAL — Advanced search with instant suggestions
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import { useRouter }                    from 'next/navigation';
import { useDebouncedCallback }         from 'use-debounce';
import Link                             from 'next/link';
import Image                            from 'next/image';
import {
  Search, X, Mic, MicOff, Clock, TrendingUp,
  ArrowRight, Atom, Brain, Orbit, FlaskConical,
} from 'lucide-react';
import { searchArticles }   from '@/lib/sanity/client';
import { ArticleMeta }      from '@/lib/types';

const TRENDING = [
  'CRISPR gene therapy', 'Quantum computing breakthrough',
  'Alzheimer treatment', 'James Webb telescope', 'AI drug discovery',
  'mRNA vaccine cancer', 'Nuclear fusion energy',
];

const DOMAINS = [
  { slug: 'ai',          label: 'AI & ML',   icon: Brain  },
  { slug: 'space',       label: 'Space',      icon: Orbit  },
  { slug: 'genomics',    label: 'Genomics',   icon: Atom   },
  { slug: 'chemistry',   label: 'Chemistry',  icon: FlaskConical },
];

interface SearchModalProps {
  open:    boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router            = useRouter();
  const inputRef          = useRef<HTMLInputElement>(null);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [voiceOn, setVoiceOn] = useState(false);
  const recognitionRef        = useRef<unknown>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sg_search_history');
    if (saved) setHistory(JSON.parse(saved).slice(0, 5));
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search
  const doSearch = useDebouncedCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const res = await searchArticles(q, 6).catch(() => []);
    setResults(res);
    setLoading(false);
  }, 280);

  const handleInput = (q: string) => {
    setQuery(q);
    doSearch(q);
  };

  const handleSubmit = (q = query) => {
    if (!q.trim()) return;
    const updated = [q, ...history.filter(h => h !== q)].slice(0, 8);
    setHistory(updated);
    localStorage.setItem('sg_search_history', JSON.stringify(updated));
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sg_search_history');
  };

  // Voice search
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search not supported in your browser.');
      return;
    }

    if (voiceOn) {
      (recognitionRef.current as { stop: () => void })?.stop();
      setVoiceOn(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    const recog = new (SpeechRecognition as new () => {
      lang: string; continuous: boolean; interimResults: boolean;
      start(): void; stop(): void;
      onresult: (e: { results: { [0]: { transcript: string } }[] }) => void;
      onend: () => void;
    })();

    recog.lang            = 'en-US';
    recog.continuous      = false;
    recog.interimResults  = false;
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      handleInput(text);
      setVoiceOn(false);
    };
    recog.onend = () => setVoiceOn(false);
    recog.start();
    recognitionRef.current = recog;
    setVoiceOn(true);
  };

  const showEmpty = !query && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1     }}
            exit={{   opacity: 0, y: -20, scale: 0.97   }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-[91] w-full max-w-2xl px-4"
          >
            <div className="sg-glass rounded-2xl border border-[var(--border-default)] shadow-card-lg overflow-hidden">
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border-subtle)]">
                <Search className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Search science, research, topics…"
                  className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-dim)] text-base"
                />
                <div className="flex items-center gap-1">
                  {/* Voice */}
                  <button
                    onClick={toggleVoice}
                    className={`sg-btn-icon w-8 h-8 ${voiceOn ? 'text-signal-red animate-pulse' : ''}`}
                    title="Voice search"
                  >
                    {voiceOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  {/* Clear / Close */}
                  {query ? (
                    <button onClick={() => handleInput('')} className="sg-btn-icon w-8 h-8">
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={onClose} className="sg-btn-icon w-8 h-8">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results area */}
              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                {/* Empty state */}
                {showEmpty && (
                  <div className="p-5">
                    {/* History */}
                    {history.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xs text-[var(--text-muted)] uppercase tracking-widest font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Recent
                          </span>
                          <button onClick={clearHistory} className="text-2xs text-[var(--text-dim)] hover:text-[var(--text-muted)]">
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {history.map(h => (
                            <button
                              key={h}
                              onClick={() => handleSubmit(h)}
                              className="px-3 py-1.5 text-xs rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-ion-400 hover:text-ion-400 transition-colors"
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending */}
                    <div className="mb-5">
                      <span className="text-2xs text-[var(--text-muted)] uppercase tracking-widest font-medium flex items-center gap-1 mb-2">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </span>
                      <div className="flex flex-col gap-1">
                        {TRENDING.map(t => (
                          <button
                            key={t}
                            onClick={() => handleSubmit(t)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-left"
                          >
                            <Search className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Domain shortcuts */}
                    <div>
                      <span className="text-2xs text-[var(--text-muted)] uppercase tracking-widest font-medium mb-2 block">
                        Browse Domains
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {DOMAINS.map(({ slug, label, icon: Icon }) => (
                          <Link
                            key={slug}
                            href={`/category/${slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-colors text-sm text-[var(--text-secondary)]"
                          >
                            <Icon className="w-4 h-4 text-ion-400" />
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="p-5 space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="sg-skeleton w-16 h-16 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="sg-skeleton h-3 w-3/4 rounded" />
                          <div className="sg-skeleton h-3 w-full rounded" />
                          <div className="sg-skeleton h-3 w-1/2 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                  <div className="p-2">
                    {results.map(article => (
                      <Link
                        key={article.slug}
                        href={`/article/${article.slug}`}
                        onClick={onClose}
                        className="flex gap-3 p-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors group"
                      >
                        {article.imageUrl && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={article.imageUrl} alt={article.title} fill className="object-cover" sizes="64px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="sg-badge mb-1 inline-flex">{article.domain}</span>
                          <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-ion-400 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{article.readingTime} min · {article.author?.name}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-ion-400 transition-colors flex-shrink-0 self-center opacity-0 group-hover:opacity-100" />
                      </Link>
                    ))}

                    {/* Full search link */}
                    <button
                      onClick={() => handleSubmit()}
                      className="w-full mt-2 py-3 text-sm text-ion-400 hover:bg-[var(--bg-elevated)] rounded-xl transition-colors font-medium"
                    >
                      See all results for &quot;{query}&quot; →
                    </button>
                  </div>
                )}

                {/* No results */}
                {!loading && query && results.length === 0 && (
                  <div className="p-8 text-center text-[var(--text-muted)]">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No results for &quot;{query}&quot;</p>
                    <p className="text-xs mt-1 opacity-60">Try different keywords</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
