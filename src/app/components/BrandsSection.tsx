'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { brandsService } from '@/lib/cms-service';

const FALLBACK_BRANDS = [
  { id: 'tfm', name: 'The Founder Media', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/tfm.png', website_url: 'https://thefoundermedia.com/', is_active: true },
  { id: 'tech', name: 'Tech Disruptor Media', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/tech.png', website_url: 'https://techdisruptormedia.com/', is_active: true },
  { id: 'banker', name: 'The Banker Media', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/Banker.png', website_url: 'https://b2bmarketmedia.com/', is_active: true },
  { id: 'educator', name: 'The Educator Media', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/Educator.png', website_url: '', is_active: true },
  { id: 'o2', name: 'O2-Gears', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/o2.png', website_url: '', is_active: true },
  { id: 'boothify', name: 'Boothify', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/boothify.png', website_url: 'https://boothify.in/', is_active: true },
  { id: 'netconx', name: 'NetconX', logo_url: 'https://www.bharatnetworkgroup.com/assets/img/icons/Netconx.png', website_url: '', is_active: true },
];

export default function BrandsSection() {
  const [brands, setBrands] = useState(FALLBACK_BRANDS);

  useEffect(() => {
    brandsService?.getActive()?.then((data) => {
      if (data && data?.length > 0) setBrands(data);
    })?.catch(() => {});
  }, []);

  return (
    <section id="brands" className="bg-secondary w-full px-6 md:px-12 lg:px-16 pt-16 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 reveal">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-4">
              Our Brands
            </span>
            <h2 className="font-jakarta font-bold text-foreground leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Eight brands.{' '}
              <span className="text-gradient-warm">One ecosystem.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Each brand stands tall in its own space. Together, they form an integrated network that shapes the future of Bharat's industries.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-10 lg:gap-12">
          {brands?.map((brand, i) => (
            <a
              key={brand?.id}
              href={brand?.website_url || '#'}
              target={brand?.website_url ? '_blank' : undefined}
              rel={brand?.website_url ? 'noopener noreferrer' : undefined}
             className="flex flex-col items-center gap-4 group"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-lg flex items-center justify-center p-4 border border-gray-100 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <AppImage
                  src={brand?.logo_url}
                  alt={`${brand?.name} logo`}
                  width={72}
                  height={72}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-foreground text-xs font-semibold text-center max-w-[100px] leading-tight group-hover:text-primary transition-colors duration-300">
                {brand?.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}