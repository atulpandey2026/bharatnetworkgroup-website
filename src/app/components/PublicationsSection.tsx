'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import { magazinesService } from '@/lib/cms-service';

type Category = 'ALL' | string;

interface Magazine {
  id: string;
  title: string;
  brand_id: string;
  edition: string;
  publication_date: string;
  thumbnail_url: string;
  pdf_url: string;
  description: string;
  mag_status: string;
  brands?: { id: string; name: string };
}

const BRAND_COLORS: Record<string, { accent: string; badge: string }> = {
  'The Founder Media': { accent: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  'The Banker Media': { accent: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  'Tech Disruptor Media': { accent: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
};

const DEFAULT_COLORS = { accent: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700' };

export default function PublicationsSection() {
  const [activeTab, setActiveTab] = useState<Category>('ALL');
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [tabs, setTabs] = useState<{ key: string; label: string }[]>([{ key: 'ALL', label: 'ALL' }]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    magazinesService.getPublished().then((data) => {
      if (data && data.length > 0) {
        setMagazines(data);
        // Build unique brand tabs
        const seen = new Set<string>();
        const brandTabs: { key: string; label: string }[] = [{ key: 'ALL', label: 'ALL' }];
        data.forEach((m: Magazine) => {
          const name = m.brands?.name;
          if (name && !seen.has(name)) {
            seen.add(name);
            brandTabs.push({ key: name, label: name });
          }
        });
        setTabs(brandTabs);
      }
    }).catch(() => {});
  }, []);

  const filtered = activeTab === 'ALL' ? magazines : magazines.filter((m) => m.brands?.name === activeTab);

  const scroll = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const amount = 280;
    sliderRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section id="publications" className="bg-secondary w-full px-6 md:px-12 lg:px-16 pt-16 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 reveal">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-4">
              Publications
            </span>
            <h2 className="font-jakarta font-bold text-foreground leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Our Magazine{' '}
              <span className="text-gradient-warm">Library</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            Editions across our flagship brands — each issue packed with insights, interviews, and industry intelligence.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 reveal">
          {tabs.map((tab) =>
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}>
              {tab.label}
            </button>
          )}
        </div>

        {/* Slider */}
        <div className="relative reveal">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            aria-label="Scroll left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {filtered.map((mag, i) => {
              const colors = BRAND_COLORS[mag.brands?.name || ''] || DEFAULT_COLORS;
              return (
                <a
                  key={mag.id}
                  href={mag.pdf_url || '#'}
                  target={mag.pdf_url ? '_blank' : undefined}
                  rel={mag.pdf_url ? 'noopener noreferrer' : undefined}
                  className="group flex-shrink-0 w-44 md:w-48 flex flex-col cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] w-full mb-3 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                    <AppImage
                      src={mag.thumbnail_url || 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf'}
                      alt={`${mag.brands?.name || ''} ${mag.edition} magazine cover`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="192px" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        Read PDF →
                      </span>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1 w-fit ${colors.badge}`}>
                    {mag.brands?.name || 'Magazine'}
                  </span>
                  <span className="text-muted-foreground text-xs">{mag.edition}</span>
                </a>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-muted-foreground text-sm py-8">No magazines available.</p>
            )}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            aria-label="Scroll right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
