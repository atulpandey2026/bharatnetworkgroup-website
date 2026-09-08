'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const navLinks = [
{ label: 'Home', href: '/#home' },
{ label: 'About BNG', href: '/#about' },
{ label: 'Brands', href: '/#brands' },
{ label: 'Offerings', href: '/#offerings' },
{ label: 'Publications', href: '/#publications' },
{ label: 'Team', href: '/#team' },
{ label: 'FAQs', href: '/#faq' },
{ label: 'Career', href: '/careers' },
{ label: 'Contact', href: '/#contact' }];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {document.body.style.overflow = '';};
  }, [menuOpen]);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ?
        'bg-card/95 backdrop-blur-xl shadow-sm border-b border-border' :
        'bg-transparent'}`
        }>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <AppImage
                src="https://www.bharatnetworkgroup.com/assets/img/BNGlogo.png"
                alt="Bharat Network Group logo — BNG brand mark"
                width={140}
                height={40}
                priority
                className="h-9 w-auto object-contain" />
              
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks?.slice(0, 8)?.map((link) =>
              <a
                key={link?.label}
                href={link?.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-sm">
                
                  {link?.label}
                </a>
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="/#contact"
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 hover:shadow-lg">
                
                Contact Us
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''}`
                } />
              
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? 'opacity-0' : ''}`
                } />
              
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''}`
                } />
              
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen &&
      <div className="fixed inset-0 z-40 mobile-menu-overlay flex flex-col pt-20 px-6 pb-8 overflow-y-auto">
          <nav className="flex flex-col gap-1 mt-4">
            {navLinks?.map((link) =>
          <a
            key={link?.label}
            href={link?.href}
            onClick={handleNavClick}
            className="px-4 py-4 text-base font-semibold text-white/80 hover:text-white border-b border-white/10 transition-colors">
            
                {link?.label}
              </a>
          )}
          </nav>
          <div className="mt-8">
            <a
            href="/#contact"
            onClick={handleNavClick}
            className="block w-full text-center px-6 py-4 text-base font-bold bg-primary text-primary-foreground rounded-full">
            
              Contact Us
            </a>
          </div>
        </div>
      }
    </>
  );

}