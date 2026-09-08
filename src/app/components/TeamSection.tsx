'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { teamService } from '@/lib/cms-service';

const FALLBACK_MEMBERS = [
{ id: '1', name: 'Ashish Srivastava', designation: 'Founder & Director', profile_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_1cbee50a4-1763296279384.png", linkedin_url: 'https://www.linkedin.com/in/ashishsriv19/', alt: 'Ashish Srivastava, Founder and Director of Bharat Network Group' },
{ id: '2', name: 'Anupam Gupta', designation: 'Founder & Director', profile_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_14a5ca983-1763300171126.png", linkedin_url: '', alt: 'Anupam Gupta, Founder and Director of Bharat Network Group' },
{ id: '3', name: 'Atul Pandey', designation: 'Director, IT & Digital Strategy', profile_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_19e7400b1-1772340616911.png", linkedin_url: '', alt: 'Atul Pandey, Director of IT and Digital Strategy at BNG' },
{ id: '4', name: 'Vipin Rai', designation: 'AGM, Art & Designing', profile_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_1020c7c21-1763299481237.png", linkedin_url: '', alt: 'Vipin Rai, AGM of Art and Designing at BNG' },
{ id: '5', name: 'Aishwarya Saxena', designation: 'Senior Associate Editor', profile_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_4a7bb8552-1788527759090.png", linkedin_url: '', alt: 'Aishwarya Saxena, Senior Associate Editor at BNG' }];


const CARD_WIDTH = 200;

export default function TeamSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [members, setMembers] = useState<any[]>(FALLBACK_MEMBERS);

  useEffect(() => {
    teamService.getActive().then((data) => {
      if (data && data.length > 0) setMembers(data);
    }).catch(() => {});
  }, []);

  const scrollBy = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === 'right' ? CARD_WIDTH * 2 : -CARD_WIDTH * 2, behavior: 'smooth' });
  };

  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (!sliderRef.current || isPaused) return;
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
        }
      }, 2500);
    };
    startAutoScroll();
    return () => {if (autoScrollRef.current) clearInterval(autoScrollRef.current);};
  }, [isPaused]);

  return (
    <section id="team" className="bg-background w-full px-6 md:px-12 lg:px-16 pt-16 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 reveal">
          <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-4">
            Our Team
          </span>
          <h2 className="font-jakarta font-bold text-foreground leading-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            The driving force behind{' '}
            <span className="text-gradient-warm">BNG's growth</span>
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            A group of passionate professionals committed to excellence, innovation, and delivering impact every day.
          </p>
        </div>

        {/* Team carousel */}
        <div className="relative reveal">
          <button
            onClick={() => scrollBy('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            aria-label="Previous team members">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}>
            {members.map((member, i) =>
            <div key={member.id || i} className="flex-shrink-0 w-44 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-shadow duration-300 relative bg-secondary">
                  <AppImage
                  src={member.profile_image_url || member.img}
                  alt={member.alt || `${member.name}, ${member.designation}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  onError={() => {}} />
                </div>
                <h4 className="font-jakarta font-semibold text-foreground text-sm leading-tight mb-1">{member.name}</h4>
                <p className="text-muted-foreground text-xs leading-tight mb-2">{member.designation}</p>
                {(member.linkedin_url || member.linkedin) &&
              <a
                href={member.linkedin_url || member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/70 transition-colors"
                aria-label={`${member.name} LinkedIn profile`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
              }
              </div>
            )}
          </div>

          <button
            onClick={() => scrollBy('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            aria-label="Next team members">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Career CTA */}
        <div className="mt-10 reveal reveal-delay-300 flex items-center gap-4 flex-wrap">
          <a
            href="/careers"
            className="group flex items-center gap-3 bg-primary text-primary-foreground pl-7 pr-2.5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-md">
            Join Our Team
            <span className="bg-white/20 p-2 rounded-full transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
          <span className="text-muted-foreground text-sm">We're always looking for passionate people.</span>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>);

}