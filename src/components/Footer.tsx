import React from 'react';

import AppImage from '@/components/ui/AppImage';

const footerBrands = [
{ name: 'The Founder Media', href: 'https://thefoundermedia.com/' },
{ name: 'Tech Disruptor Media', href: 'https://techdisruptormedia.com/' },
{ name: 'The Educator Media', href: '#' },
{ name: 'The Banker Media', href: 'https://thebankermedia.com/' },
{ name: 'O2-Gears', href: '#' },
{ name: 'Boothify', href: 'https://boothify.in/' },
{ name: 'NetconX', href: '#' }];


const footerEvents = [
{ name: 'TechVerse 2026', href: 'https://techverse.techdisruptormedia.com/' },
{ name: 'OOH Summit & Awards', href: 'https://oohsum.in/' },
{ name: 'NAFCON', href: 'https://nafcon.in/' },
{ name: 'Bharatcoop', href: 'https://bharatcoop.com/' }];


const footerServices = [
'Media & Publishing',
'IPs & Custom Events',
'Educational Engagements',
'Event Management',
'Smart Wearables & Tech',
'IT & Digital Solutions'];


const footerMagazines = [
'The Founder Magazine',
'Tech Disruptor Magazine',
'The Banker Magazine',
'The Educator Magazine'];


export default function Footer() {
  return (
    <footer className="bg-foreground text-white border-t border-white/10">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <AppImage
              src="https://www.bharatnetworkgroup.com/assets/img/BNGlogo.png"
              alt="Bharat Network Group logo"
              width={140}
              height={40}
              className="h-9 w-auto object-contain mb-4 brightness-0 invert" />
            
            <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xs">
              Uniting ideas and enterprise to empower Bharat&apos;s diverse professional community.
            </p>
            <div className="space-y-2 text-sm text-white/50">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">📍</span>
                <span>Suit G-008, C-127, Sector-63, Noida</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:01203209668" className="hover:text-white transition-colors">
                  0120-3209668
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:contact@bharatnetworkgroup.com" className="hover:text-white transition-colors">
                  contact@bharatnetworkgroup.com
                </a>
              </div>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.linkedin.com/company/bharat-network-group"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BNG LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all duration-300">
                
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@bharatnetworkgroup"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BNG YouTube"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all duration-300">
                
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                </svg>
              </a>
            </div>
          </div>

          {/* Our Brands */}
          <div>
            <h4 className="font-jakarta font-semibold text-white text-sm mb-4 uppercase tracking-widest">
              Our Brands
            </h4>
            <ul className="space-y-2.5">
              {footerBrands?.map((b) =>
              <li key={b?.name}>
                  <a
                  href={b?.href}
                  target={b?.href !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-white/50 text-sm hover:text-white transition-colors duration-200 font-medium">
                  
                    {b?.name}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Upcoming Events */}
          <div>
            <h4 className="font-jakarta font-semibold text-white text-sm mb-4 uppercase tracking-widest">
              Upcoming Events
            </h4>
            <ul className="space-y-2.5 mb-6">
              {footerEvents?.map((ev) =>
              <li key={ev?.name}>
                  <a
                  href={ev?.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 text-sm hover:text-white transition-colors duration-200 font-medium">
                  
                    {ev?.name}
                  </a>
                </li>
              )}
            </ul>
            <h4 className="font-jakarta font-semibold text-white text-sm mb-4 uppercase tracking-widest">
              Magazines
            </h4>
            <ul className="space-y-2.5">
              {footerMagazines?.map((m) =>
              <li key={m}>
                  <span className="text-white/50 text-sm font-medium">{m}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-jakarta font-semibold text-white text-sm mb-4 uppercase tracking-widest">
              Our Services
            </h4>
            <ul className="space-y-2.5">
              {footerServices?.map((s) =>
              <li key={s}>
                  <a
                  href="/#offerings"
                  className="text-white/50 text-sm hover:text-white transition-colors duration-200 font-medium">
                  
                    {s}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            © 2025 Bharat Network Group. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/#"
              className="text-white/40 text-sm hover:text-white transition-colors font-medium">
              
              Privacy Policy
            </a>
            <a
              href="/#"
              className="text-white/40 text-sm hover:text-white transition-colors font-medium">
              
              Terms & Conditions
            </a>
            <a
              href="/careers"
              className="text-white/40 text-sm hover:text-white transition-colors font-medium">
              
              Career
            </a>
            <a
              href="/admin/login"
              className="text-white/40 text-sm hover:text-white transition-colors font-medium">
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </footer>);

}
