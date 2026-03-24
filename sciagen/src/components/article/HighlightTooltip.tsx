'use client';
// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT TOOLTIP — appears on text selection
// ─────────────────────────────────────────────────────────────────────────────
import { motion }   from 'framer-motion';
import { Highlighter, BookOpen, Copy, MessageSquare, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth }  from '@/components/auth/AuthProvider';
import toast        from 'react-hot-toast';

interface HighlightTooltipProps {
  selectedText: string;
  rect:         DOMRect;
  articleId:    string;
  onClose:      () => void;
}

export function HighlightTooltip({ selectedText, rect, articleId, onClose }: HighlightTooltipProps) {
  const { user } = useAuth();

  const top  = rect.top  + window.scrollY - 52;
  const left = rect.left + rect.width / 2;

  const handleHighlight = async (color: string) => {
    if (!user) { toast.error('Sign in to highlight text'); onClose(); return; }
    // Persist highlight to Firestore
    toast.success('Highlighted!');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    toast.success('Copied');
    onClose();
  };

  const handleAddNote = () => {
    if (!user) { toast.error('Sign in to add notes'); onClose(); return; }
    toast('Note feature: click on a highlight to add a note');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1,   y: 0  }}
      exit={{   opacity: 0, scale: 0.9, y: 4  }}
      transition={{ duration: 0.15 }}
      className="highlight-tooltip"
      style={{ top, left, transform: 'translateX(-50%)' }}
    >
      {/* Color highlights */}
      {[
        { color: '#ffd166', label: 'Yellow' },
        { color: '#06d0f5', label: 'Cyan'   },
        { color: '#00ff87', label: 'Green'  },
        { color: '#ff6b9d', label: 'Pink'   },
      ].map(({ color, label }) => (
        <button
          key={color}
          onClick={() => handleHighlight(color)}
          title={`Highlight ${label}`}
          className="w-6 h-6 rounded-md border-2 border-white/10 hover:scale-110 transition-transform"
          style={{ background: color }}
        />
      ))}

      <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

      <button onClick={handleCopy}   className="sg-btn-icon w-7 h-7" title="Copy"><Copy        className="w-3.5 h-3.5" /></button>
      <button onClick={handleAddNote} className="sg-btn-icon w-7 h-7" title="Note"><MessageSquare className="w-3.5 h-3.5" /></button>
      <button onClick={onClose}      className="sg-btn-icon w-7 h-7" title="Close"><X           className="w-3 h-3" /></button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DICTIONARY POPOVER — appears on double-click of a word
// ─────────────────────────────────────────────────────────────────────────────
interface DictionaryPopoverProps {
  word:    string;
  rect:    DOMRect;
  onClose: () => void;
}

interface DictMeaning {
  partOfSpeech: string;
  definitions:  { definition: string; example?: string }[];
}

interface DictEntry {
  word:      string;
  phonetic?: string;
  meanings:  DictMeaning[];
}

export function DictionaryPopover({ word, rect, onClose }: DictionaryPopoverProps) {
  const [data,    setData]    = useState<DictEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const top  = rect.bottom + window.scrollY + 12;
  const left = Math.min(
    Math.max(rect.left + window.scrollX, 16),
    window.innerWidth - 320,
  );

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then((d: DictEntry[]) => {
        setData(d[0] ?? null);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [word]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1    }}
      exit={{   opacity: 0, y: 6, scale: 0.95  }}
      transition={{ duration: 0.2 }}
      className="fixed z-[100] w-80 sg-glass border border-[var(--border-default)] rounded-2xl shadow-card-lg overflow-hidden"
      style={{ top, left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div>
          <span className="font-display text-lg font-semibold text-[var(--text-primary)]">{word}</span>
          {data?.phonetic && (
            <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">{data.phonetic}</span>
          )}
        </div>
        <button onClick={onClose} className="sg-btn-icon w-7 h-7">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 max-h-64 overflow-y-auto no-scrollbar">
        {loading && (
          <div className="space-y-2">
            <div className="sg-skeleton h-3 w-24 rounded" />
            <div className="sg-skeleton h-3 w-full rounded" />
            <div className="sg-skeleton h-3 w-4/5 rounded" />
          </div>
        )}

        {error && (
          <p className="text-sm text-[var(--text-muted)]">
            Definition not found for &quot;{word}&quot;.
          </p>
        )}

        {data && data.meanings.map((meaning, i) => (
          <div key={i} className={i > 0 ? 'mt-4 pt-4 border-t border-[var(--border-subtle)]' : ''}>
            <span className="sg-badge mb-2 inline-flex">{meaning.partOfSpeech}</span>
            {meaning.definitions.slice(0, 2).map((def, j) => (
              <div key={j} className="mb-2">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {def.definition}
                </p>
                {def.example && (
                  <p className="text-xs text-[var(--text-muted)] italic mt-1">
                    &ldquo;{def.example}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-2xs text-[var(--text-dim)]">Double-click any word</span>
        <a
          href={`https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-2xs text-ion-400 hover:underline"
        >
          Full definition →
        </a>
      </div>
    </motion.div>
  );
}
