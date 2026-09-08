import React from 'react';

const events = [
  {
    name: 'CISO Horizon',
    tagline: 'Exclusive leadership forum for CISOs & enterprise IT leaders.',
    desc: 'Discussing digital transformation, cybersecurity, AI, and the future of enterprise IT.',
    date: '9–11 Oct 2026',
    venue: 'Guwahati',
    href: 'https://cisohorizon.techdisruptormedia.com/',
    badge: 'Tech Disruptor Media',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentBg: 'bg-blue-600',
  },
  {
    name: 'BankTecX 2026',
    tagline: 'India\'s premier cooperative banking tech platform.',
    desc: 'Dedicated exclusively to Cooperative Banks and their digital transformation journey.',
    date: '9 Dec 2026',
    venue: 'Bangalore',
    href: 'https://banktechx.com/',
    badge: 'The Banker Media',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    accentBg: 'bg-emerald-600',
  },
  {
    name: 'FinVision AI Summit',
    tagline: 'The brightest minds in BFSI technology, together.',
    desc: 'Knowledge sharing, collaboration, and inspiration across the financial technology spectrum.',
    date: 'Nov 2026',
    venue: 'Guwahati',
    href: '#',
    badge: 'BFSI Summit',
    badgeColor: 'bg-purple-100 text-purple-700',
    accentBg: 'bg-purple-600',
  },
];

const moreEvents = [
  { name: 'TechVerse 2026', href: 'https://techverse.techdisruptormedia.com/' },
  { name: 'OOH Summit & Awards', href: 'https://oohsum.in/' },
  { name: 'NAFCON', href: 'https://nafcon.in/' },
  { name: 'Bharatcoop', href: 'https://bharatcoop.com/' },
];

export default function EventsSection() {
  return (
    <section id="events" className="bg-background w-full px-6 md:px-12 lg:px-16 pt-16 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-4">
              Upcoming Events
            </span>
            <h2 className="font-jakarta font-bold text-foreground leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Rise of Bharat:{' '}
              <span className="text-gradient-warm">Ideas. Innovation. Impact.</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Join India's most influential industry leaders at BNG's flagship events across the country.
          </p>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {events?.map((ev, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i * 100} bg-card rounded-2xl border border-border overflow-hidden hover-lift flex flex-col`}
            >
              {/* Accent top bar */}
              <div className={`h-1.5 w-full ${ev?.accentBg}`} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ev?.badgeColor}`}>
                    {ev?.badge}
                  </span>
                  <div className={`w-8 h-8 rounded-full ${ev?.accentBg} flex items-center justify-center`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-jakarta font-bold text-foreground text-xl mb-2">{ev?.name}</h3>
                <p className="text-primary font-semibold text-sm mb-2">{ev?.tagline}</p>
                <p className="text-muted-foreground text-xs leading-relaxed mb-5 flex-1">{ev?.desc}</p>

                <div className="border-t border-border pt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <span className="font-semibold text-foreground">{ev?.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{ev?.venue}</span>
                  </div>
                  {ev?.href !== '#' && (
                    <a
                      href={ev?.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-3 transition-all duration-300"
                    >
                      Register Now →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More events strip */}
        <div className="reveal bg-secondary rounded-2xl p-5 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">More Events:</span>
          {moreEvents?.map((ev) => (
            <a
              key={ev?.name}
              href={ev?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-card border border-border text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            >
              {ev?.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}