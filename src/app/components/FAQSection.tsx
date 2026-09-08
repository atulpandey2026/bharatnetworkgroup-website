'use client';

import React from 'react';

const faqs = [
  {
    q: 'What is Bharat Network Group (BNG) and what makes it unique?',
    a: 'BNG is a unified powerhouse of diverse brands operating across media, events, technology, exhibitions, and education-based services. Rooted in Indian heritage ("Bharat"), it emphasises seamless collaboration ("Network") and leverages the collective strength of its ventures ("Group") to deliver deep insights, customised solutions, and industry-building connections.',
  },
  {
    q: 'Which brands and core services fall under the BNG umbrella?',
    a: 'BNG houses seven distinct brands: The Founder Media (startup & tech journalism), The Banker Media (BFSI coverage), Tech Disruptor Media (enterprise IT), The Educator Media (education outreach), O2-Gears (smart wearables), Boothify (event management & fabrication), and NetconX (IT & digital solutions).',
  },
  {
    q: 'How does BNG accelerate my business growth?',
    a: 'Through our integrated ecosystem, we offer media visibility, event participation, IT solutions, and strategic partnerships — all under one roof. Whether you need brand exposure through our publications, event presence via Boothify, or digital transformation via NetconX, BNG connects all the dots.',
  },
  {
    q: 'Which signature events can I attend through BNG?',
    a: 'BNG hosts and powers flagship events including CISO Horizon (Guwahati, Oct 2026), BankTecX 2026 (Bangalore, Dec 2026), FinVision AI Summit, TechVerse 2026, OOH Summit & Awards, NAFCON, and Bharatcoop — spanning technology, banking, and cooperative sectors.',
  },
  {
    q: 'Which sectors are getting covered in BNG?',
    a: 'BNG covers B2B Technology, Banking & Financial Services (BFSI), Education & Higher Learning, Event Management & Experiential Marketing, Smart Wearables & Consumer Electronics, IT & Digital Services, and Media & Publishing — serving startups, enterprises, educational institutions, and financial organisations.',
  },
  {
    q: 'How can I register or participate in BNG events?',
    a: 'Visit the Events section on the BNG homepage, select your desired conference or expo, and follow the online registration prompts. For customised group bookings or sponsorships, reach out via the Contact Us form or call us directly at 0120-3209668.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-secondary w-full px-6 md:px-12 lg:px-16 pt-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 reveal">
          <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-4">
            FAQs
          </span>
          <h2 className="font-jakarta font-bold text-foreground leading-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Your go-to{' '}
            <span className="text-gradient-warm">knowledge hub</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Fast, clear answers to the questions that matter most about BNG.
          </p>
        </div>

        <div className="space-y-2 reveal reveal-delay-100">
          {faqs?.map((faq, i) => (
            <details
              key={i}
              className="group bg-card border border-border rounded-xl overflow-hidden open:border-primary/30"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer text-foreground font-semibold text-sm hover:text-primary transition-colors list-none select-none">
                <span className="pr-4 font-jakarta">{faq?.q}</span>
                <span className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-transform group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                {faq?.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}