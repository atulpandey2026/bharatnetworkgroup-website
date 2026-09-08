'use client';

import React, { useEffect, useState, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  display_order: number;
}

export default function ClientsPartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/clients-partners')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data && data.length > 0) setPartners(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (partners.length === 0) return null;

  // Duplicate list enough times to ensure seamless loop
  const repeated = [...partners, ...partners, ...partners];

  return (
    <section id="clients-partners" className="bg-background w-full pt-16 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 mb-12">
      
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-4">
              Our Network
            </span>
            <h2
              className="font-jakarta font-bold text-foreground leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              Trusted {' '}
              <span className="text-gradient-warm">Partners</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Trusted by leading organizations across industries. We are proud to collaborate with brands that share our vision for growth and innovation.
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 h-full w-16 md:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 h-full w-16 md:w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />

        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex items-center gap-6"
            style={{
              animation: `marquee-scroll ${partners.length * 4}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {repeated.map((partner, idx) => {
              const card = (
                <div
                  key={`${partner.id}-${idx}`}
                  className="flex-shrink-0 flex items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{ width: '160px', height: '90px', padding: '16px' }}
                >
                  <AppImage
                    src={partner.logo_url}
                    alt={`${partner.name} logo`}
                    width={120}
                    height={60}
                    className="object-contain w-full h-full"
                  />
                </div>
              );

              if (partner.website_url) {
                return (
                  <a
                    key={`${partner.id}-${idx}`}
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${partner.name} website`}
                    className="flex-shrink-0"
                  >
                    <div
                      className="flex items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                      style={{ width: '160px', height: '90px', padding: '16px' }}
                    >
                      <AppImage
                        src={partner.logo_url}
                        alt={`${partner.name} logo`}
                        width={120}
                        height={60}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </a>
                );
              }

              return card;
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  );
}
