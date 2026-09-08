'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { heroService } from '@/lib/cms-service';

const brandChips = [
  { label: 'The Founder', color: '#E05A1E' },
  { label: 'The Banker', color: '#1A6B3A' },
  { label: 'Boothify', color: '#D97706' },
  { label: 'O2-Gears', color: '#7C3AED' },
  { label: 'NetconX', color: '#0369A1' },
  { label: 'The Educator', color: '#B45309' },
  { label: 'HoardingBook', color: '#BE185D' },
  { label: 'The Autonaut Media', color: '#0F766E' },
  { label: 'HoardingDekho', color: '#9333EA' },
  { label: 'All About Campus', color: '#2563EB' },
];

const FALLBACK_IMAGE = 'https://www.bharatnetworkgroup.com/assets/img/about/about.jpeg';
const FALLBACK_ALT = 'Bharat Network Group team collaborating in a bright modern workspace in Noida';
const OUR_STORY_VIDEO_ID = 'a5e4Ax6aC7A';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [heroImage, setHeroImage] = useState({ url: FALLBACK_IMAGE, alt: FALLBACK_ALT });
  const [showStoryVideo, setShowStoryVideo] = useState(false);

  useEffect(() => {
    setMounted(true);
    heroService.getActive().then((data) => {
      if (data?.image_url) {
        setHeroImage({ url: data.image_url, alt: data.alt_text || FALLBACK_ALT });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handleParallax = () => {
      const scrollY = window.scrollY;
      const bg = el.querySelector('.hero-img-layer') as HTMLElement;
      if (bg) bg.style.transform = `translateY(${scrollY * 0.18}px)`;
    };
    window.addEventListener('scroll', handleParallax, { passive: true });
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0D0B09]"
      style={{ minHeight: '100svh' }}>

      {/* ── Right-side image panel ── */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] hero-img-layer will-change-transform">
        <AppImage
          src={heroImage.url}
          alt={heroImage.alt}
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 55vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B09] via-[#0D0B09]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B09]/80 via-transparent to-[#0D0B09]/30" />
      </div>

      {/* ── Diagonal accent stripe ── */}
      <div
        className="absolute inset-y-0 left-0 w-[45%] pointer-events-none hidden lg:block"
        style={{
          background: 'linear-gradient(160deg, #1a0e07 0%, #0D0B09 60%)',
          clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)'
        }} />

      {/* ── Saffron glow blob ── */}
      <div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(224,90,30,0.12) 0%, transparent 65%)',
          filter: 'blur(40px)'
        }} />

      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }} />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-12 lg:px-16 max-w-7xl mx-auto w-full py-28">

        <div className={`flex items-center gap-3 mb-8 ${mounted ? 'animate-enter delay-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E05A1E] animate-pulse" />
            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">Bharat Network Group</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="text-white/50 text-xs tracking-wide">Est. 2017 · Noida, India</span>
          </div>
        </div>

        <div className={`mb-6 ${mounted ? 'animate-enter delay-200' : 'opacity-0'}`}>
          <h1
            className="font-jakarta font-extrabold text-white leading-[1.02] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 7.5vw, 7rem)', letterSpacing: '-0.03em' }}>
            One Vision.
          </h1>
          <h1
            className="font-jakarta font-extrabold leading-[1.02] tracking-tight"
            style={{
              fontSize: 'clamp(3rem, 7.5vw, 7rem)',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #E05A1E 0%, #F59E0B 45%, #E05A1E 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'text-shimmer 5s linear infinite'
            }}>
            Many Voices.
          </h1>
          <h1
            className="font-jakarta font-extrabold text-white/30 leading-[1.02] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 7.5vw, 7rem)', letterSpacing: '-0.03em' }}>
            One Network.
          </h1>
        </div>

        <p className={`text-white/55 text-base md:text-lg font-light max-w-lg leading-relaxed mb-10 ${mounted ? 'animate-enter delay-300' : 'opacity-0'}`}>
          A unified ecosystem of purpose-driven brands — spanning media, events, education, tech, and lifestyle — built to shape the future of Bharat.
        </p>

        <div className={`flex flex-col sm:flex-row items-start gap-3 mb-14 ${mounted ? 'animate-enter delay-400' : 'opacity-0'}`}>
          <a
            href="/#offerings"
            className="group inline-flex items-center gap-3 bg-[#E05A1E] text-white pl-6 pr-3 py-3 rounded-full font-semibold text-sm hover:bg-[#c94d16] transition-all duration-300 shadow-[0_0_40px_rgba(224,90,30,0.35)]">
            Explore Our Offerings
            <span className="bg-white/20 p-2 rounded-full transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setShowStoryVideo(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-white/70 text-sm font-medium hover:border-white/30 hover:text-white transition-all duration-300">
            Our Story Video
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72c0 .78.85 1.26 1.52.86l10.14-6.86a1.03 1.03 0 0 0 0-1.72L9.52 4.28A1.03 1.03 0 0 0 8 5.14Z" />
              </svg>
            </span>
          </button>
        </div>

        <div className={`flex flex-wrap gap-x-10 gap-y-4 mb-14 ${mounted ? 'animate-enter delay-500' : 'opacity-0'}`}>
          {[
            { value: '8', label: 'Brands' },
            { value: '500+', label: 'Clients Served' },
            { value: '10+', label: 'Years of Impact' },
          ].map((s, i) =>
            <div key={i} className="flex flex-col">
              <span className="font-jakarta font-extrabold text-white text-3xl md:text-4xl leading-none">{s.value}</span>
              <span className="text-white/40 text-xs mt-1 tracking-widest uppercase font-medium">{s.label}</span>
            </div>
          )}
        </div>

        <div className={`${mounted ? 'animate-enter delay-600' : 'opacity-0'}`}>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">Our Brands</p>
          <div className="flex flex-wrap gap-2">
            {brandChips.map((chip, i) =>
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  borderColor: `${chip.color}40`,
                  backgroundColor: `${chip.color}12`,
                  color: chip.color,
                  animationDelay: `${600 + i * 80}ms`
                }}>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: chip.color }} />
                {chip.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {showStoryVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Bharat Network Group Our Story video"
          onClick={() => setShowStoryVideo(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowStoryVideo(false)}
              className="absolute right-3 top-3 z-10 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
              aria-label="Close Our Story video"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${OUR_STORY_VIDEO_ID}?autoplay=1&loop=1&playlist=${OUR_STORY_VIDEO_ID}&rel=0&playsinline=1`}
              title="Bharat Network Group Our Story"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-enter delay-700">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div
            className="w-1 h-2 rounded-full bg-white/50"
            style={{ animation: 'scrollDot 2s ease-in-out infinite' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
