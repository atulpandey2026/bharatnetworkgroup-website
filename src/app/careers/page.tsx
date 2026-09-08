'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { jobsService, applicationsService, resumeUploadService } from '@/lib/careers-service';

interface Job {
  id: string;
  job_id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_required: string;
  description: string;
  responsibilities: string;
  required_skills: string;
  posted_date: string;
  application_deadline?: string;
}

interface ApplicationForm {
  full_name: string;
  email: string;
  mobile: string;
  current_location: string;
  city: string;
  state: string;
  current_company: string;
  current_designation: string;
  total_experience: string;
  relevant_experience: string;
  current_ctc: string;
  expected_ctc: string;
  notice_period: string;
  linkedin_url: string;
  portfolio_url: string;
  cover_letter: string;
  source: string;
  consent: boolean;
}

const whyJoinCards = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: 'Growth & Learning',
    desc: 'Continuous learning programs, mentorship, and clear career progression paths to help you reach your full potential.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: 'Innovation First',
    desc: 'Work on cutting-edge projects across media, technology, and events. Your ideas matter and are encouraged.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Collaborative Culture',
    desc: 'Join a diverse, inclusive team where collaboration drives success. We celebrate every win together.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Leadership Opportunities',
    desc: 'Fast-track your career with leadership roles across our growing portfolio of brands and ventures.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Work-Life Balance',
    desc: 'Flexible work arrangements, wellness programs, and a culture that respects your personal time.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Meaningful Impact',
    desc: 'Be part of a mission that empowers Bharat\'s professional community across media, tech, and education.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const inputClass = 'w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200';
const labelClass = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5';

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ApplicationForm>({
    full_name: '', email: '', mobile: '', current_location: '', city: '', state: '',
    current_company: '', current_designation: '', total_experience: '', relevant_experience: '',
    current_ctc: '', expected_ctc: '', notice_period: '', linkedin_url: '', portfolio_url: '',
    cover_letter: '', source: '', consent: false,
  });

  useEffect(() => {
    jobsService.getPublished().then((data) => {
      setJobs(data as Job[]);
      setLoadingJobs(false);
    });
  }, []);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowForm(true);
    setSubmitted(false);
    setErrors({});
    setResumeFile(null);
    setUploadProgress(0);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, resume: 'Only PDF, DOC, DOCX files are allowed.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: 'File size must be less than 5MB.' }));
      return;
    }
    setResumeFile(file);
    setErrors((prev) => { const n = { ...prev }; delete n.resume; return n; });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email is required.';
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, ''))) newErrors.mobile = 'Valid 10-digit mobile number is required.';
    if (!resumeFile) newErrors.resume = 'Resume is required.';
    if (!form.consent) newErrors.consent = 'You must accept the consent to submit.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      let resumeUrl = '';
      if (resumeFile) {
        setUploadProgress(30);
        resumeUrl = await resumeUploadService.upload(resumeFile);
        setUploadProgress(70);
      }
      const result = await applicationsService.submit({
        job_opening_id: selectedJob?.id,
        ...form,
        resume_url: resumeUrl,
      });
      setUploadProgress(100);
      setApplicationId(result.application_id);

      // Send emails via edge functions
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const submissionDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

      await Promise.allSettled([
        fetch(`${supabaseUrl}/functions/v1/send-careers-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ type: 'candidate', candidateName: form.full_name, candidateEmail: form.email, position: selectedJob?.title || form.full_name, applicationId: result.application_id, submissionDate }),
        }),
        fetch(`${supabaseUrl}/functions/v1/send-careers-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ type: 'admin', candidateName: form.full_name, candidateEmail: form.email, position: selectedJob?.title, applicationId: result.application_id, submissionDate, mobile: form.mobile, experience: form.total_experience, currentCompany: form.current_company, resumeUrl }),
        }),
      ]);

      setSubmitted(true);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-foreground pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl blob-drift" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl blob-drift-slow" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#1C1917_100%)]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            Join Our Team
          </span>
          <h1 className="font-jakarta font-bold text-white leading-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            Build Your Career{' '}
            <span className="text-shimmer-white">With Us</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Join Bharat Network Group and be part of a dynamic team shaping the future of media, technology, and enterprise across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#openings"
              className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
            >
              View Opportunities
            </a>
            <a
              href="#why-join"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Why Join BNG?
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section id="why-join" className="bg-background py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-5">
              Why BNG
            </span>
            <h2 className="font-jakarta font-bold text-foreground leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Why Join <span className="text-gradient-warm">Bharat Network Group?</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              We believe in building careers, not just filling positions. Here's what makes BNG a great place to grow.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyJoinCards.map((card, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-7 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-5`}>
                  {card.icon}
                </div>
                <h3 className="font-jakarta font-bold text-foreground text-lg mb-3">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section id="openings" className="bg-secondary/30 py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-5">
              Opportunities
            </span>
            <h2 className="font-jakarta font-bold text-foreground leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Current <span className="text-gradient-warm">Openings</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Explore our current job openings and find the role that matches your skills and ambitions.
            </p>
          </div>

          {loadingJobs ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                  <div className="h-6 bg-gray-100 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <h3 className="font-jakarta font-semibold text-foreground text-lg mb-2">No openings right now</h3>
              <p className="text-muted-foreground text-sm">Check back soon or send your resume to <a href="mailto:careers@bharatnetworkgroup.com" className="text-primary hover:underline">careers@bharatnetworkgroup.com</a></p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{job.department}</span>
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{job.employment_type}</span>
                        </div>
                        <h3 className="font-jakarta font-bold text-foreground text-xl mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            {job.experience_required}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Posted {formatDate(job.posted_date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                          className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all duration-300"
                        >
                          Apply Now
                        </button>
                        <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-transform duration-300 ${expandedJob === job.id ? 'rotate-180' : ''}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedJob === job.id && (
                    <div className="border-t border-border px-6 pb-6 pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-jakarta font-semibold text-foreground text-sm uppercase tracking-wide mb-3">About the Role</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>
                        <div className="space-y-5">
                          {job.responsibilities && (
                            <div>
                              <h4 className="font-jakarta font-semibold text-foreground text-sm uppercase tracking-wide mb-3">Responsibilities</h4>
                              <ul className="space-y-1.5">
                                {job.responsibilities.split('\n').filter(Boolean).map((r, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    {r.trim()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {job.required_skills && (
                            <div>
                              <h4 className="font-jakarta font-semibold text-foreground text-sm uppercase tracking-wide mb-3">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {job.required_skills.split(',').map((s, i) => (
                                  <span key={i} className="text-xs font-medium bg-secondary text-foreground px-3 py-1 rounded-full border border-border">{s.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Job ID: <span className="font-semibold text-foreground">{job.job_id}</span></span>
                        <button
                          onClick={() => handleApply(job)}
                          className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all duration-300"
                        >
                          Apply for this Role
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      {showForm && (
        <section ref={formRef} className="bg-background py-20 px-6 md:px-12 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-5">
                Apply Now
              </span>
              <h2 className="font-jakarta font-bold text-foreground text-3xl mb-2">
                {selectedJob ? `Apply for ${selectedJob.title}` : 'Submit Your Application'}
              </h2>
              {selectedJob && (
                <p className="text-muted-foreground text-sm">{selectedJob.department} · {selectedJob.location} · {selectedJob.employment_type}</p>
              )}
            </div>

            {submitted ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="font-jakarta font-bold text-foreground text-2xl mb-3">Application Submitted!</h3>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  Thank you for applying. Your application has been successfully submitted. Our HR team will review it and get back to you.
                </p>
                <div className="inline-block bg-secondary border border-border rounded-xl px-6 py-3 mb-6">
                  <p className="text-xs text-muted-foreground mb-1">Your Application ID</p>
                  <p className="font-jakarta font-bold text-foreground text-lg">{applicationId}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Please save this ID for future reference. A confirmation email has been sent to your registered email address.</p>
                <button
                  onClick={() => { setShowForm(false); setSubmitted(false); }}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all"
                >
                  View More Openings
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-7 md:p-10 space-y-8">
                {errors.submit && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{errors.submit}</div>
                )}

                {/* Candidate Information */}
                <div>
                  <h3 className="font-jakarta font-bold text-foreground text-lg mb-5 pb-3 border-b border-border">Candidate Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="full_name">Full Name *</label>
                      <input id="full_name" name="full_name" type="text" required value={form.full_name} onChange={handleChange} placeholder="Rahul Sharma" className={`${inputClass} ${errors.full_name ? 'border-red-400' : ''}`} />
                      {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">Email Address *</label>
                      <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="rahul@company.com" className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="mobile">Mobile Number *</label>
                      <input id="mobile" name="mobile" type="tel" required value={form.mobile} onChange={handleChange} placeholder="9876543210" className={`${inputClass} ${errors.mobile ? 'border-red-400' : ''}`} />
                      {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="current_location">Current Location</label>
                      <input id="current_location" name="current_location" type="text" value={form.current_location} onChange={handleChange} placeholder="Delhi NCR" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="city">City</label>
                      <input id="city" name="city" type="text" value={form.city} onChange={handleChange} placeholder="Noida" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="state">State</label>
                      <input id="state" name="state" type="text" value={form.state} onChange={handleChange} placeholder="Uttar Pradesh" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="font-jakarta font-bold text-foreground text-lg mb-5 pb-3 border-b border-border">Professional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="current_company">Current Company</label>
                      <input id="current_company" name="current_company" type="text" value={form.current_company} onChange={handleChange} placeholder="ABC Corp" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="current_designation">Current Designation</label>
                      <input id="current_designation" name="current_designation" type="text" value={form.current_designation} onChange={handleChange} placeholder="Senior Manager" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="total_experience">Total Experience</label>
                      <input id="total_experience" name="total_experience" type="text" value={form.total_experience} onChange={handleChange} placeholder="5 Years" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="relevant_experience">Relevant Experience</label>
                      <input id="relevant_experience" name="relevant_experience" type="text" value={form.relevant_experience} onChange={handleChange} placeholder="3 Years" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="current_ctc">Current CTC</label>
                      <input id="current_ctc" name="current_ctc" type="text" value={form.current_ctc} onChange={handleChange} placeholder="8 LPA" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="expected_ctc">Expected CTC</label>
                      <input id="expected_ctc" name="expected_ctc" type="text" value={form.expected_ctc} onChange={handleChange} placeholder="12 LPA" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="notice_period">Notice Period</label>
                      <input id="notice_period" name="notice_period" type="text" value={form.notice_period} onChange={handleChange} placeholder="30 Days" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="linkedin_url">LinkedIn Profile</label>
                      <input id="linkedin_url" name="linkedin_url" type="url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="portfolio_url">Portfolio / Website</label>
                      <input id="portfolio_url" name="portfolio_url" type="url" value={form.portfolio_url} onChange={handleChange} placeholder="https://yourportfolio.com" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div>
                  <h3 className="font-jakarta font-bold text-foreground text-lg mb-5 pb-3 border-b border-border">Job Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Position Applied For *</label>
                      <input type="text" value={selectedJob?.title || ''} readOnly className={`${inputClass} bg-secondary/50 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label className={labelClass}>Job ID</label>
                      <input type="text" value={selectedJob?.job_id || ''} readOnly className={`${inputClass} bg-secondary/50 cursor-not-allowed`} />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <h3 className="font-jakarta font-bold text-foreground text-lg mb-5 pb-3 border-b border-border">Resume / CV *</h3>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${errors.resume ? 'border-red-400 bg-red-50' : resumeFile ? 'border-emerald-400 bg-emerald-50' : 'border-border hover:border-primary hover:bg-primary/5'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <span className="text-emerald-700 font-semibold text-sm">{resumeFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        <p className="text-sm font-semibold text-foreground mb-1">Click to upload your resume</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX · Max 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
                  {submitting && uploadProgress > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="font-jakarta font-bold text-foreground text-lg mb-5 pb-3 border-b border-border">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass} htmlFor="cover_letter">Cover Letter / Message</label>
                      <textarea id="cover_letter" name="cover_letter" rows={4} value={form.cover_letter} onChange={handleChange} placeholder="Tell us why you're a great fit for this role..." className={`${inputClass} resize-none`} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="source">How did you hear about us?</label>
                      <select id="source" name="source" value={form.source} onChange={handleChange} className={inputClass}>
                        <option value="">Select an option</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Website">Website</option>
                        <option value="Employee Referral">Employee Referral</option>
                        <option value="Job Portal">Job Portal</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        id="consent"
                        name="consent"
                        type="checkbox"
                        checked={form.consent}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
                      />
                      <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                        I agree to the processing of my personal information for recruitment purposes by Bharat Network Group. *
                      </label>
                    </div>
                    {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                        Submitting...
                      </>
                    ) : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-4 rounded-xl border border-border text-muted-foreground font-semibold text-sm hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
