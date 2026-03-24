'use client';
// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE READER — Advanced reading experience
// Features: Reading progress, TTS, highlights, dictionary, notes, sharing, PDF
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link  from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Calendar, Share2, Bookmark, BookmarkCheck,
  Volume2, VolumeX, Play, Pause, SkipForward,
  Type, Sun, Moon, Eye, Download, Copy,
  MessageSquare, Highlighter, X, ChevronUp,
  Twitter, Linkedin,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Article }    from '@/lib/types';
import { useAuth }    from '@/components/auth/AuthProvider';
import { ReadingToolbar } from './ReadingToolbar';
import { HighlightTooltip } from './HighlightTooltip';
import { DictionaryPopover } from './DictionaryPopover';
import toast from 'react-hot-toast';

interface ArticleReaderProps {
  article: Article;
}

export function ArticleReader({ article }: ArticleReaderProps) {
  const { user }         = useAuth();
  const contentRef       = useRef<HTMLDivElement>(null);
  const [progress,       setProgress]       = useState(0);
  const [isBookmarked,   setIsBookmarked]   = useState(false);
  const [showToolbar,    setShowToolbar]    = useState(true);
  const [lastScrollY,    setLastScrollY]    = useState(0);
  const [ttsActive,      setTtsActive]      = useState(false);
  const [ttsPaused,      setTtsPaused]      = useState(false);
  const [ttsSpeed,       setTtsSpeed]       = useState(1.0);
  const [showTTSBar,     setShowTTSBar]     = useState(false);
  const [selection,      setSelection]      = useState<{ text: string; rect: DOMRect } | null>(null);
  const [dictWord,       setDictWord]       = useState<string | null>(null);
  const [dictRect,       setDictRect]       = useState<DOMRect | null>(null);
  const utterRef         = useRef<SpeechSynthesisUtterance | null>(null);
  const [readingTheme,   setReadingTheme]   = useState<'dark' | 'light' | 'sepia'>('dark');
  const [fontSize,       setFontSize]       = useState(18);
  const [lineHeight,     setLineHeight]     = useState(1.85);

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
  const pubDate  = format(new Date(article.publishedAt), 'MMMM d, yyyy');
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // ── Reading progress ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;

      const rect      = el.getBoundingClientRect();
      const totalH    = el.offsetHeight;
      const scrolled  = Math.max(0, -rect.top);
      const pct       = Math.min(100, (scrolled / (totalH - window.innerHeight)) * 100);
      setProgress(Math.max(0, pct));

      // Hide/show navbar on scroll direction
      const current = window.scrollY;
      setShowToolbar(current < lastScrollY || current < 100);
      setLastScrollY(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  // ── TTS (Text-to-Speech) ───────────────────────────────────────────────────

  const startTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in your browser');
      return;
    }

    const text = contentRef.current?.innerText ?? '';
    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate     = ttsSpeed;
    utt.lang     = 'en-US';
    utt.onend    = () => { setTtsActive(false); setTtsPaused(false); setShowTTSBar(false); };

    utterRef.current = utt;
    window.speechSynthesis.speak(utt);
    setTtsActive(true);
    setTtsPaused(false);
    setShowTTSBar(true);
  }, [ttsSpeed]);

  const pauseResumeTTS = () => {
    if (!window.speechSynthesis) return;
    if (ttsPaused) {
      window.speechSynthesis.resume();
      setTtsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setTtsPaused(true);
    }
  };

  const stopTTS = () => {
    window.speechSynthesis?.cancel();
    setTtsActive(false);
    setTtsPaused(false);
    setShowTTSBar(false);
  };

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  // ── Text selection handling ────────────────────────────────────────────────
  const handleMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 1 && sel?.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelection({ text, rect });
    } else {
      setSelection(null);
    }
  };

  const handleDblClick = (e: React.MouseEvent) => {
    const sel  = window.getSelection();
    const word = sel?.toString().trim();
    if (word && /^[a-zA-Z]+$/.test(word) && word.length > 2) {
      const range = sel?.getRangeAt(0);
      if (range) {
        setDictWord(word);
        setDictRect(range.getBoundingClientRect());
        setSelection(null);
      }
    }
  };

  // ── Bookmark ───────────────────────────────────────────────────────────────
  const handleBookmark = async () => {
    if (!user) { toast.error('Sign in to bookmark articles'); return; }
    setIsBookmarked(b => !b);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Article bookmarked');
    // TODO: Persist to Firestore
  };

  // ── Copy link ──────────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  // ── Download PDF ───────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    const { default: jsPDF }      = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const el = contentRef.current;
    if (!el) return;

    toast.loading('Generating PDF…');
    try {
      const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
      const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgW   = 190;
      const imgH   = (canvas.height * imgW) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgW, imgH);
      pdf.save(`${article.slug}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded');
    } catch {
      toast.dismiss();
      toast.error('PDF generation failed');
    }
  };

  const themeStyle: Record<string, string> = {
    dark:  'bg-[var(--bg-primary)] text-[var(--text-primary)]',
    light: 'bg-[#f8f9fa] text-[#0f172a]',
    sepia: 'bg-[#f4ead5] text-[#3d2b1f]',
  };

  return (
    <div className={`reading-mode min-h-screen ${themeStyle[readingTheme]} transition-colors duration-300`}>

      {/* Reading progress bar */}
      <div
        className="reading-progress"
        style={{ width: `${progress}%` }}
      />

      {/* ── Article Header ──────────────────────────────────────────────── */}
      <header className="px-4 md:px-8 lg:px-12 pt-12 pb-10 max-w-[900px] mx-auto">
        {/* Category + domain */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href={`/category/${article.domain}`}
            className="sg-badge hover:opacity-80 transition-opacity"
          >
            {article.category?.name ?? article.domain}
          </Link>
          {article.isBreaking && <span className="sg-badge sg-badge-live">Breaking</span>}
          {article.isPremium  && <span className="sg-badge sg-badge-ember">Premium</span>}
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-balance mb-6">
          {article.title}
        </h1>

        {/* Description */}
        <p className="font-body text-xl md:text-2xl font-light leading-relaxed text-[var(--text-secondary)] mb-8">
          {article.description}
        </p>

        {/* AI Summary box */}
        {article.summary && (
          <div className="relative mb-8 p-4 rounded-xl border border-ion-400/20 bg-ion-400/5">
            <div className="absolute -top-3 left-4">
              <span className="px-2 py-0.5 bg-[var(--bg-primary)] text-2xs font-sans font-medium text-ion-400 border border-ion-400/30 rounded-full uppercase tracking-widest">
                AI Summary
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-[var(--text-secondary)]">
              {article.summary}
            </p>
          </div>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between gap-4 py-5 border-t border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            {article.author?.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={44}
                height={44}
                className="rounded-full ring-2 ring-[var(--border-subtle)]"
              />
            )}
            <div>
              <p className="font-sans font-medium text-sm text-[var(--text-primary)]">
                {article.author?.name ?? 'Sciagen Editorial'}
              </p>
              {article.author?.credentials && (
                <p className="font-sans text-xs text-[var(--text-muted)]">
                  {article.author.credentials}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={article.publishedAt}>{pubDate}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime} min read
            </span>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <button onClick={handleBookmark} className="sg-btn-icon">
              {isBookmarked
                ? <BookmarkCheck className="w-4.5 h-4.5 text-ion-400" />
                : <Bookmark className="w-4.5 h-4.5" />
              }
            </button>

            {/* TTS */}
            <button
              onClick={ttsActive ? stopTTS : startTTS}
              className={`sg-btn-icon ${ttsActive ? 'text-ion-400' : ''}`}
            >
              {ttsActive ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>

            {/* Download PDF */}
            <button onClick={handleDownloadPDF} className="sg-btn-icon">
              <Download className="w-4.5 h-4.5" />
            </button>

            {/* Copy link */}
            <button onClick={handleCopyLink} className="sg-btn-icon">
              <Copy className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Social share */}
          <div className="flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}&via=sciagen`}
              target="_blank" rel="noopener noreferrer"
              className="sg-btn-icon"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`}
              target="_blank" rel="noopener noreferrer"
              className="sg-btn-icon"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="sg-btn-icon text-xs font-bold"
            >
              WA
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Image ──────────────────────────────────────────────────── */}
      {article.imageUrl && (
        <div className="relative w-full max-w-[1200px] mx-auto px-4 md:px-8 mb-12 aspect-video rounded-2xl overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt ?? article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          {article.imageAlt && (
            <p className="absolute bottom-3 right-4 text-xs text-white/50 font-sans">
              {article.imageAlt}
            </p>
          )}
        </div>
      )}

      {/* ── Article Body ────────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="article-body px-4 md:px-8 pb-24"
        style={{ fontSize: `${fontSize}px`, lineHeight }}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDblClick}
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      {/* Source attribution */}
      {article.sourceName && (
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)] font-sans">
            Originally published on{' '}
            <a
              href={article.sourceUrl}
              target="_blank" rel="noopener noreferrer"
              className="text-ion-400 hover:underline"
            >
              {article.sourceName}
            </a>
          </p>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <Link
              key={tag.id}
              href={`/search?tag=${tag.slug}`}
              className="px-3 py-1 text-xs font-sans rounded-full border border-[var(--border-default)] text-[var(--text-muted)] hover:border-ion-400 hover:text-ion-400 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── Reading Toolbar (floating) ─────────────────────────────────── */}
      <ReadingToolbar
        visible={showToolbar}
        theme={readingTheme}
        onThemeChange={setReadingTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
      />

      {/* ── TTS Control Bar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTTSBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{   y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl sg-glass shadow-card-lg"
          >
            <Volume2 className="w-4 h-4 text-ion-400" />
            <button onClick={pauseResumeTTS} className="sg-btn-icon w-8 h-8">
              {ttsPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Speed:</span>
              {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    setTtsSpeed(speed);
                    if (utterRef.current) utterRef.current.rate = speed;
                  }}
                  className={`px-2 py-0.5 rounded ${ttsSpeed === speed ? 'bg-ion-400 text-void-950 font-medium' : 'hover:bg-[var(--bg-elevated)]'}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <button onClick={stopTTS} className="sg-btn-icon w-7 h-7 ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selection Tooltip ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selection && (
          <HighlightTooltip
            selectedText={selection.text}
            rect={selection.rect}
            articleId={article._id}
            onClose={() => setSelection(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Dictionary Popover ─────────────────────────────────────────── */}
      <AnimatePresence>
        {dictWord && dictRect && (
          <DictionaryPopover
            word={dictWord}
            rect={dictRect}
            onClose={() => { setDictWord(null); setDictRect(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
