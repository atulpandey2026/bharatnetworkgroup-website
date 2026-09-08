'use client';

import React from 'react';

const offerings = [
  {
    num: '01',
    title: 'Media & Publishing',
    subtitle: 'Sector-focused content that informs and inspires',
    desc: 'Reach decision-makers through The Founder, The Banker, Tech Disruptor, and The Educator Magazines — sector-focused news, interviews, and rankings that matter.',
    tags: ['Magazines', 'Interviews', 'Rankings', 'Sector Reports'],
    accent: '#E05A1E',
    accentLight: 'rgba(224,90,30,0.08)',
    accentBorder: 'rgba(224,90,30,0.2)',
    span: 'lg:col-span-2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'IPs & Custom Events',
    subtitle: 'High-impact conclaves, expos, and awards',
    desc: 'Spark leadership conversations and industry-wide networking at scale — powered by our media brands and executed by Boothify.',
    tags: ['Conclaves', 'Expos', 'Awards', 'Summits'],
    accent: '#D97706',
    accentLight: 'rgba(217,119,6,0.08)',
    accentBorder: 'rgba(217,119,6,0.2)',
    span: '',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" /><path d="M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Educational Engagements',
    subtitle: 'Bridging institutions and aspirants',
    desc: 'Student platforms for college discovery, admissions, webinars, and digital outreach via The Educator Media.',
    tags: ['College Discovery', 'Admissions', 'Webinars'],
    accent: '#7C3AED',
    accentLight: 'rgba(124,58,237,0.08)',
    accentBorder: 'rgba(124,58,237,0.2)',
    span: '',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Event Management',
    subtitle: 'Seamless delivery with creative impact',
    desc: 'End-to-end brand activations, booth fabrication, and on-ground event execution by Boothify — from concept to completion.',
    tags: ['Brand Activations', 'Booth Design', 'Fabrication'],
    accent: '#1A6B3A',
    accentLight: 'rgba(26,107,58,0.08)',
    accentBorder: 'rgba(26,107,58,0.2)',
    span: '',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Smart Wearables & Tech',
    subtitle: 'Next-gen audio and lifestyle wearables',
    desc: 'Smartwatches, earbuds, and corporate gifting solutions under O2-Gears — designed for the tech-savvy modern Indian professional.',
    tags: ['Smartwatches', 'Earbuds', 'Corporate Gifting'],
    accent: '#BE185D',
    accentLight: 'rgba(190,24,93,0.08)',
    accentBorder: 'rgba(190,24,93,0.2)',
    span: '',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    num: '06',
    title: 'IT & Digital Solutions',
    subtitle: 'Comprehensive digital services for growth',
    desc: 'Websites, apps, marketing, lead gen, UI/UX, and managed IT by NetconX — built for startups and enterprises ready to scale.',
    tags: ['Web & Apps', 'Digital Marketing', 'UI/UX'],
    accent: '#0369A1',
    accentLight: 'rgba(3,105,161,0.08)',
    accentBorder: 'rgba(3,105,161,0.2)',
    span: 'lg:col-span-2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" />
      </svg>
    ),
  },
];

export default function OfferingsSection() {
  return (
    <section id="offerings" className="w-full bg-[#0D0B09] relative overflow-hidden py-24 md:py-32">

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Warm glow top-right */}
      <div
        className="absolute -top-32 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(224,90,30,0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">

        {/* ── Section header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 reveal">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E05A1E]/30 bg-[#E05A1E]/10 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E05A1E]" />
              <span className="text-[#E05A1E] text-xs font-bold uppercase tracking-widest">Our Offerings</span>
            </div>
            <h2
              className="font-jakarta font-extrabold text-white leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.02em' }}>
              Six specialised areas.{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #E05A1E 0%, #F59E0B 50%, #E05A1E 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'text-shimmer 5s linear infinite',
                }}>
                One team.
              </span>
            </h2>
          </div>
          <p className="text-white/45 text-sm leading-relaxed max-w-sm lg:text-right">
            Driving growth across media, events, technology, and lifestyle — all under one integrated network.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offerings?.map((o, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl reveal reveal-delay-${Math.min((i + 1) * 100, 500)} ${o?.span}`}
              style={{
                backgroundColor: '#111009',
                borderColor: o?.accentBorder,
              }}>

              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${o?.accent}, transparent)` }}
              />

              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top left, ${o?.accentLight} 0%, transparent 60%)`,
                }}
              />

              <div className="relative p-7 flex flex-col h-full min-h-[220px]">
                {/* Icon + number row */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: o?.accentLight, border: `1px solid ${o?.accentBorder}`, color: o?.accent }}>
                    {o?.icon}
                  </div>
                  <span
                    className="font-jakarta font-extrabold text-4xl leading-none select-none"
                    style={{ color: `${o?.accent}18` }}>
                    {o?.num}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="font-jakarta font-bold text-white text-lg mb-1 leading-snug">{o?.title}</h3>
                  <p className="text-xs font-semibold mb-3" style={{ color: o?.accent }}>{o?.subtitle}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{o?.desc}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {o?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: o?.accentLight,
                        color: o?.accent,
                        border: `1px solid ${o?.accentBorder}`,
                      }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 rounded-2xl border border-white/8 bg-white/[0.03] reveal">
          <div>
            <p className="font-jakarta font-semibold text-white text-base">Ready to grow with BNG?</p>
            <p className="text-white/40 text-sm mt-0.5">Let's find the right offering for your goals.</p>
          </div>
          <a
            href="/#contact"
            className="group inline-flex items-center gap-3 bg-[#E05A1E] text-white pl-6 pr-3 py-3 rounded-full font-semibold text-sm hover:bg-[#c94d16] transition-all duration-300 shadow-[0_0_30px_rgba(224,90,30,0.3)] whitespace-nowrap flex-shrink-0">
            Get in Touch
            <span className="bg-white/20 p-2 rounded-full transition-transform group-hover:translate-x-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}