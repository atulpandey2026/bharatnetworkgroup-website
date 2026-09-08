import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import AboutSection from '@/app/components/AboutSection';
import BrandsSection from '@/app/components/BrandsSection';
import OfferingsSection from '@/app/components/OfferingsSection';
import StatsSection from '@/app/components/StatsSection';
import PublicationsSection from '@/app/components/PublicationsSection';
import TeamSection from '@/app/components/TeamSection';
import FAQSection from '@/app/components/FAQSection';
import ContactSection from '@/app/components/ContactSection';
import ClientsPartnersSection from '@/app/components/ClientsPartnersSection';
import ScrollRevealInit from '@/app/components/ScrollRevealInit';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <ScrollRevealInit />
      <HeroSection />
      <AboutSection />
      <BrandsSection />
      <OfferingsSection />
      <StatsSection />
      <PublicationsSection />
      <TeamSection />
      <FAQSection />
      <ClientsPartnersSection />
      <ContactSection />
      <Footer />
    </main>
  );
}