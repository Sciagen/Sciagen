import Link from 'next/link';
import { Atom, Twitter, Linkedin, Github, Rss } from 'lucide-react';

const FOOTER_LINKS = {
  'Domains': [
    { label: 'Artificial Intelligence', href: '/category/ai'          },
    { label: 'Healthcare',              href: '/category/healthcare'   },
    { label: 'Space & Astronomy',       href: '/category/space'        },
    { label: 'Physics',                 href: '/category/physics'      },
    { label: 'Genomics',                href: '/category/genomics'     },
    { label: 'Neuroscience',            href: '/category/neuroscience' },
  ],
  'Platform': [
    { label: 'About Sciagen',   href: '/about'    },
    { label: 'Editorial Team',  href: '/team'     },
    { label: 'Methodology',     href: '/methodology' },
    { label: 'Newsletter',      href: '/newsletter' },
    { label: 'RSS Feed',        href: '/feed.xml'  },
    { label: 'API Docs',        href: '/api-docs'  },
  ],
  'Legal': [
    { label: 'Privacy Policy',  href: '/privacy'  },
    { label: 'Terms of Service',href: '/terms'    },
    { label: 'Cookie Policy',   href: '/cookies'  },
    { label: 'Contact',         href: '/contact'  },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ion-500/20 border border-ion-400/30 flex items-center justify-center">
                <Atom className="w-4 h-4 text-ion-400" />
              </div>
              <span className="font-display text-xl font-semibold text-[var(--text-primary)]">
                Sci<span className="text-ion-400">agen</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs mb-6">
              The global science knowledge platform. Real-time research, breakthroughs, and discovery across every domain of science.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter,  href: 'https://twitter.com/sciagen',  label: 'Twitter'  },
                { icon: Linkedin, href: 'https://linkedin.com/company/sciagen', label: 'LinkedIn' },
                { icon: Github,   href: 'https://github.com/sciagen',   label: 'GitHub'   },
                { icon: Rss,      href: '/feed.xml',                    label: 'RSS Feed' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="sg-btn-icon"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:text-ion-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sg-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-dim)]">
          <p>© {new Date().getFullYear()} Sciagen. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for the global science community
            <span className="text-ion-400">◆</span>
            Powered by real-time AI
          </p>
        </div>
      </div>
    </footer>
  );
}
