'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Sun, Moon, Coffee, Type, AlignJustify, X } from 'lucide-react';

interface ReadingToolbarProps {
  visible:           boolean;
  theme:             'dark' | 'light' | 'sepia';
  onThemeChange:     (t: 'dark' | 'light' | 'sepia') => void;
  fontSize:          number;
  onFontSizeChange:  (n: number) => void;
  lineHeight:        number;
  onLineHeightChange:(n: number) => void;
}

export function ReadingToolbar({
  visible, theme, onThemeChange,
  fontSize, onFontSizeChange,
  lineHeight, onLineHeightChange,
}: ReadingToolbarProps) {
  const [open, setOpen] = useState(false);

  const themes = [
    { key: 'dark',  label: 'Dark',  icon: Moon,    bg: '#070d12', fg: '#f8fafc' },
    { key: 'light', label: 'Light', icon: Sun,      bg: '#f8f9fa', fg: '#0f172a' },
    { key: 'sepia', label: 'Sepia', icon: Coffee,   bg: '#f4ead5', fg: '#3d2b1f' },
  ] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0,  opacity: 1 }}
          exit={{   x: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
        >
          {/* Toggle button */}
          <button
            onClick={() => setOpen(o => !o)}
            className="w-10 h-10 rounded-xl sg-glass border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-ion-400 transition-all shadow-card"
          >
            {open ? <X className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1,   y: 0  }}
                exit={{   opacity: 0, scale: 0.9, y: -8  }}
                transition={{ duration: 0.2 }}
                className="sg-glass rounded-2xl border border-[var(--border-default)] p-4 w-56 shadow-card-lg flex flex-col gap-5"
              >
                {/* Theme */}
                <div>
                  <p className="text-2xs text-[var(--text-muted)] uppercase tracking-widest mb-2">Theme</p>
                  <div className="flex gap-2">
                    {themes.map(({ key, label, icon: Icon, bg, fg }) => (
                      <button
                        key={key}
                        onClick={() => onThemeChange(key)}
                        title={label}
                        className="flex-1 h-9 rounded-lg flex items-center justify-center transition-all border"
                        style={{
                          background: bg,
                          color: fg,
                          borderColor: theme === key ? '#06d0f5' : 'transparent',
                          boxShadow: theme === key ? '0 0 0 1px #06d0f5' : 'none',
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-2xs text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                      <Type className="w-3 h-3" /> Font Size
                    </p>
                    <span className="text-2xs text-ion-400 font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range" min={14} max={24} step={1}
                    value={fontSize}
                    onChange={e => onFontSizeChange(Number(e.target.value))}
                    className="w-full accent-ion-400 h-1 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-[var(--text-dim)] mt-1">
                    <span>Aa</span><span>AA</span>
                  </div>
                </div>

                {/* Line height */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-2xs text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                      <AlignJustify className="w-3 h-3" /> Spacing
                    </p>
                    <span className="text-2xs text-ion-400 font-mono">{lineHeight.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min={1.4} max={2.4} step={0.05}
                    value={lineHeight}
                    onChange={e => onLineHeightChange(Number(e.target.value))}
                    className="w-full accent-ion-400 h-1 rounded-full cursor-pointer"
                  />
                </div>

                {/* Font family */}
                <div>
                  <p className="text-2xs text-[var(--text-muted)] uppercase tracking-widest mb-2">Typeface</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: 'Literata', value: "'Literata', serif" },
                      { label: 'Source Serif', value: "'Source Serif 4', serif" },
                      { label: 'DM Sans', value: "'DM Sans', sans-serif" },
                    ].map(f => (
                      <button
                        key={f.value}
                        className="text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        style={{ fontFamily: f.value }}
                      >
                        {f.label} — The quick brown fox
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
