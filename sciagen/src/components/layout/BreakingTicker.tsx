'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface TickerItem { title: string; url: string; source: string; }

export function BreakingTicker() {
  const [items,   setItems]   = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_WORKER_URL ?? ''}/news/breaking`,
          { next: { revalidate: 180 } },
        );
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : []);
        }
      } catch {
        // Fallback: empty ticker
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || items.length === 0) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4"
        style={{ height: 'var(--ticker-height)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Zap className="w-3 h-3 text-ion-400" />
          <span className="text-2xs font-sans font-semibold uppercase tracking-widest text-ion-400">Live</span>
        </div>
        <div className="w-px h-4 bg-[var(--border-default)]" />
        <div className="sg-skeleton h-2 w-80 rounded" />
      </div>
    );
  }

  // Duplicate for seamless loop
  const doubled = [...items, ...items, ...items];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3"
      style={{ height: 'var(--ticker-height)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* Live label */}
      <div className="flex items-center gap-1.5 pl-4 flex-shrink-0 pr-3 border-r border-[var(--border-default)]">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse-ion" />
        <span className="text-2xs font-sans font-bold uppercase tracking-widest text-signal-red">
          Breaking
        </span>
      </div>

      {/* Ticker */}
      <div className="ticker-wrap flex-1 overflow-hidden">
        <div className="ticker-content">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-sans">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ion-400 transition-colors whitespace-nowrap"
              >
                {item.title}
              </a>
              <span className="text-[var(--text-dim)]">—</span>
              <span className="text-[var(--text-dim)] text-2xs whitespace-nowrap">{item.source}</span>
              <span className="text-[var(--border-default)] mx-4">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
