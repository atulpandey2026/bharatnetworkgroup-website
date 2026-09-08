'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { heroService, brandsService, magazinesService, teamService } from '@/lib/cms-service';
import { jobsService, applicationsService, contactEnquiriesService } from '@/lib/careers-service';

interface Stats {
  heroImages: number;
  brands: number;
  magazines: number;
  teamMembers: number;
  jobOpenings: number;
  applications: number;
  enquiries: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ heroImages: 0, brands: 0, magazines: 0, teamMembers: 0, jobOpenings: 0, applications: 0, enquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [heroes, brands, magazines, team, jobs, appsResult, enqResult] = await Promise.all([
          heroService.getAll(),
          brandsService.getAll(),
          magazinesService.getAll(),
          teamService.getAll(),
          jobsService.getAll(),
          applicationsService.getAll({ limit: 1 }),
          contactEnquiriesService.getAll({ limit: 1 }),
        ]);
        setStats({
          heroImages: heroes?.length || 0,
          brands: brands?.length || 0,
          magazines: magazines?.length || 0,
          teamMembers: team?.length || 0,
          jobOpenings: jobs?.length || 0,
          applications: appsResult?.count || 0,
          enquiries: enqResult?.count || 0,
        });
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Hero Images',
      value: stats.heroImages,
      href: '/admin/hero',
      color: 'bg-orange-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      label: 'Brands',
      value: stats.brands,
      href: '/admin/brands',
      color: 'bg-blue-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
        </svg>
      ),
    },
    {
      label: 'Magazines',
      value: stats.magazines,
      href: '/admin/magazines',
      color: 'bg-emerald-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: 'Team Members',
      value: stats.teamMembers,
      href: '/admin/team',
      color: 'bg-purple-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Job Openings',
      value: stats.jobOpenings,
      href: '/admin/careers',
      color: 'bg-amber-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
    },
    {
      label: 'Applications',
      value: stats.applications,
      href: '/admin/careers/applications',
      color: 'bg-rose-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: 'Enquiries',
      value: stats.enquiries,
      href: '/admin/contact-enquiries',
      color: 'bg-teal-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h2>
        <p className="text-gray-500 text-sm">Overview of your website content</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center text-white`}>
                {card.icon}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-gray-500 transition-colors mt-1">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              )}
              <p className="text-gray-500 text-sm">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-gray-900 font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/admin/hero', label: 'Manage Hero Image', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
            { href: '/admin/brands', label: 'Update Brand Logos', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            { href: '/admin/magazines', label: 'Add Magazine', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
            { href: '/admin/team', label: 'Add Team Member', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
            { href: '/admin/careers', label: 'Post New Job', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
            { href: '/admin/careers/applications', label: 'View Applications', color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
            { href: '/admin/contact-enquiries', label: 'View Enquiries', color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
            { href: '/admin/audit', label: 'Audit Log', color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} rounded-xl px-4 py-3 text-sm font-medium transition-colors text-center`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
