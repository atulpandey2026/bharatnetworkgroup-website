'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { aboutService } from '@/lib/cms-service';

const FALLBACK_ABOUT_IMAGE =
  'https://www.bharatnetworkgroup.com/assets/img/about/about.jpeg';

const beliefs = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Deep Insights & Customised Solutions',
    desc: 'Turning data into strategy with solutions tailored precisely to your business goals.',
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Unified Platform for Seamless Access',
    desc: 'One ecosystem for all services — simple, fast, and remarkably efficient.',
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Strategic Connections for Growth',
    desc: 'Building partnerships that drive expansion, reach, and lasting success.',
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'Empowering Ecosystems with Innovation',
    desc: 'Fueling niche sectors through content, events, and purpose-built products.',
  },
];

export default function AboutSection() {
  const [aboutImage, setAboutImage] = useState(FALLBACK_ABOUT_IMAGE);
  const [aboutAlt, setAboutAlt] = useState(
    'Bharat Network Group team collaborating in a bright modern workspace in Noida'
  );

  useEffect(() => {
    const loadAboutImage = async () => {
      try {
        const activeImage = await aboutService.getActive();

        if (activeImage?.image_url) {
          setAboutImage(activeImage.image_url);
        }

        if (activeImage?.alt_text) {
          setAboutAlt(activeImage.alt_text);
        }
      } catch (error) {
        console.error('Failed to load About image:', error);
      }
    };

    loadAboutImage();
  }, []);

  return (
    <section
      id="about"
      className="bg-background w-full px-6 md:px-12 lg:px-16 pt-20 pb-0"
    >
      <div className="max-w-7xl mx-auto">

        {/* ================================================================
            IMAGE + ABOUT CONTENT
        ================================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Image + visual accent */}
          <div className="lg:col-span-5 reveal-left">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                <AppImage
                  src={aboutImage}
                  alt={aboutAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-primary text-primary-foreground rounded-2xl p-5 shadow-xl">
                <div className="font-jakarta font-extrabold text-3xl leading-none">
                  10+
                </div>

                <div className="text-primary-foreground/80 text-xs mt-1 font-medium">
                  Brands Under
                  <br />
                  One Umbrella
                </div>
              </div>

              {/* Green accent dot */}
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-accent" />
              </div>
            </div>
          </div>

          {/* Right: About Content */}
          <div className="lg:col-span-7 flex flex-col gap-8 pt-0 lg:pt-4">
            <div className="reveal">

              <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-5">
                About BNG
              </span>

              <h2
                className="font-jakarta font-bold text-foreground mb-5 leading-tight"
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                }}
              >
                A unified powerhouse of{' '}
                <span className="text-gradient-warm">
                  diverse brands
                </span>
              </h2>

              <p className="text-muted-foreground leading-relaxed text-base mb-4">
                Bharat Network Group (BNG), registered under{' '}
                <strong className="text-foreground">
                  Hello Founder Infomedia Pvt Ltd
                </strong>
                , is guided by three core tenets:{' '}
                <em>Bharat</em> — honouring our Indian heritage;{' '}
                <em>Network</em> — symbolising seamless collaboration;
                and <em>Group</em> — representing the collective strength
                of diversified ventures.
              </p>

              <p className="text-muted-foreground leading-relaxed text-base">
                Under the BNG umbrella: The Founder Media, The Banker
                Media, The Educator Media, Tech Disruptor Media, O2-Gears,
                Boothify, and NetconX — each retaining its distinct
                identity while benefiting from integrated operations and
                shared expertise.
              </p>

            </div>
          </div>
        </div>

        {/* ================================================================
            BELIEFS — FULL WIDTH
        ================================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 reveal reveal-delay-200">

          {beliefs.map((b, i) => (
            <div
              key={i}
              className="bg-secondary rounded-xl p-6 border border-border hover-lift group flex flex-col h-full"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                {b.icon}
              </div>

              {/* Title */}
              <h4 className="font-jakarta font-semibold text-foreground text-sm md:text-base mb-2">
                {b.title}
              </h4>

              {/* Description */}
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* ================================================================
          VISION & MISSION
      ================================================================= */}

      <div className="w-full mt-16 reveal reveal-delay-300">

        <div className="flex flex-col md:flex-row">

          {/* Vision */}
          <div className="flex-1 bg-foreground px-8 md:px-14 lg:px-20 py-14 flex flex-col justify-center">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary" />

              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                Our Vision
              </span>
            </div>

            <h3 className="font-jakarta font-bold text-white text-2xl md:text-3xl mb-5 leading-tight">
              India's Foremost
              <br />
              Multi-Vertical Catalyst
            </h3>

            <p className="text-white/75 text-sm leading-relaxed mb-6">
              To become India's foremost multi-vertical catalyst for
              self-reliant, sustainable growth — rooted in national pride
              and the "Make in India" ethos.
            </p>

            <ul className="space-y-3">
              {[
                'Build a self-reliant, homegrown business ecosystem that champions Indian entrepreneurship.',
                'Foster cross-industry collaboration through media, events, technology, and education.',
                'Create lasting impact by empowering professionals, founders, and institutions across Bharat.',
                'Champion the "Make in India" spirit through every brand, product, and platform we build.',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-white/65 text-xs leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />

                  {item}
                </li>
              ))}
            </ul>

          </div>

          {/* Divider */}
          <div className="w-px bg-white/10 hidden md:block" />

          {/* Mission */}
          <div className="flex-1 bg-foreground px-8 md:px-14 lg:px-20 py-14 flex flex-col justify-center border-t border-white/10 md:border-t-0">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent" />

              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                Our Mission
              </span>
            </div>

            <h3 className="font-jakarta font-bold text-white text-2xl md:text-3xl mb-5 leading-tight">
              Unite & Empower
              <br />
              Bharat's Professionals
            </h3>

            <p className="text-white/75 text-sm leading-relaxed mb-6">
              To unite and empower Bharat's diverse professional community
              through innovative, homegrown solutions across media, events,
              IT, and education.
            </p>

            <ul className="space-y-3">
              {[
                'Deliver high-quality B2B media content that informs, inspires, and connects industry leaders.',
                'Organise world-class events that spark meaningful conversations and business opportunities.',
                'Provide cutting-edge IT and digital solutions that help businesses scale with confidence.',
                'Nurture the next generation of leaders through education platforms and student communities.',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-white/65 text-xs leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />

                  {item}
                </li>
              ))}
            </ul>

          </div>

        </div>
      </div>
    </section>
  );
}
