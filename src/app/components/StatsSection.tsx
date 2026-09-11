'use client';

import React, { useEffect, useRef, useState } from 'react';

const stats = [
  { end: 50, suffix: '+', label: 'Successful Events', sublabel: 'Pan-India' },
  { end: 100, suffix: 'K+', label: 'Social Media Followers', sublabel: 'Across Platforms' },
  { end: 500, suffix: '+', label: 'Satisfied Clients', sublabel: 'And Growing' },
  { end: 10, suffix: '', label: 'Brands Under BNG', sublabel: 'One Ecosystem' },
];

function CountUp({ end, suffix, active }: { end: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, end]);

  return (
    <span className="stat-number text-foreground">
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-primary w-full px-6 md:px-12 lg:px-16 py-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <CountUp end={stat.end} suffix={stat.suffix} active={active} />
              <div className="font-semibold text-primary-foreground text-sm mt-1">{stat.label}</div>
              <div className="text-primary-foreground/60 text-xs mt-0.5">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
