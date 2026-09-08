'use client';

import React, { useState, FormEvent } from 'react';
import { contactEnquiriesService } from '@/lib/careers-service';

const ENQUIRY_TYPES = [
  'General Enquiry',
  'Business Enquiry',
  'Partnership',
  'Media/Press',
  'Event/Sponsorship',
  'Careers',
  'Other',
];

const SOURCE_OPTIONS = ['LinkedIn', 'Website', 'Employee Referral', 'Social Media', 'Search Engine', 'Other'];

export default function ContactSection() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    company_name: '',
    designation: '',
    subject: '',
    enquiry_type: '',
    message: '',
    company_website: '',
    city: '',
    country: '',
    source: '',
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200';
  const labelClass = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email is required.';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!form.enquiry_type) newErrors.enquiry_type = 'Please select an enquiry type.';
    if (!form.message.trim() || form.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters.';
    if (!form.consent) newErrors.consent = 'Please accept the consent to submit.';
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      const result = await contactEnquiriesService.submit({
        ...form,
        enquiry_type: form.enquiry_type as any,
      });
      setEnquiryId(result.enquiry_id);

      // Send emails via edge functions
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const submissionDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

      await Promise.allSettled([
        fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ type: 'user', fullName: form.full_name, email: form.email, subject: form.subject, enquiryType: form.enquiry_type, enquiryId: result.enquiry_id, submissionDate }),
        }),
        fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ type: 'admin', fullName: form.full_name, email: form.email, mobile: form.mobile, company: form.company_name, subject: form.subject, enquiryType: form.enquiry_type, message: form.message, enquiryId: result.enquiry_id, submissionDate }),
        }),
      ]);

      setSubmitted(true);
      setForm({ full_name: '', email: '', mobile: '', company_name: '', designation: '', subject: '', enquiry_type: '', message: '', company_website: '', city: '', country: '', source: '', consent: false });
    } catch (err: any) {
      setErrors({ submit: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-background w-full px-6 md:px-12 lg:px-16 pt-16 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Info */}
          <div className="lg:col-span-5 reveal-left">
            <span className="inline-block px-4 py-1.5 rounded-full badge-warm text-xs font-bold uppercase tracking-widest mb-5">
              Contact
            </span>
            <h2 className="font-jakarta font-bold text-foreground leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Connect With{' '}
              <span className="text-gradient-warm">BNG</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Reach out to BNG for tailored solutions across media, events, IT, digital, and educational services. We'd love to hear from you.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  label: 'Visit Our Office',
                  value: 'Suit G-008, C-127, Sector-63, Noida',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  ),
                  label: 'Send Email',
                  value: 'contact@bharatnetworkgroup.com',
                  href: 'mailto:contact@bharatnetworkgroup.com',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  label: 'Call Direct',
                  value: '0120-3209668',
                  href: 'tel:01203209668',
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  label: 'Business Hours',
                  value: 'Mon–Fri, 9AM–6PM IST',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-foreground font-medium hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-sm text-foreground font-medium">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Follow:</span>
              <a href="https://www.linkedin.com/company/bharat-network-group" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" aria-label="BNG LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="https://www.youtube.com/@bharatnetworkgroup" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300" aria-label="BNG YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" /></svg>
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7 reveal reveal-delay-200">
            <div className="bg-card rounded-2xl border border-border p-7 md:p-9 shadow-sm">
              <h3 className="font-jakarta font-bold text-foreground text-xl mb-1">Send a Message</h3>
              <p className="text-muted-foreground text-sm mb-6">We typically respond within 24 business hours.</p>

              {submitted ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h4 className="font-jakarta font-bold text-foreground text-lg mb-2">Message Received!</h4>
                  <p className="text-muted-foreground text-sm mb-4">Thank you for contacting us. Our team will get back to you shortly.</p>
                  <div className="inline-block bg-secondary border border-border rounded-xl px-5 py-2.5 mb-4">
                    <p className="text-xs text-muted-foreground mb-0.5">Reference ID</p>
                    <p className="font-jakarta font-bold text-foreground">{enquiryId}</p>
                  </div>
                  <br />
                  <button onClick={() => setSubmitted(false)} className="text-sm text-primary font-semibold hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.submit && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{errors.submit}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="full_name">Full Name *</label>
                      <input id="full_name" name="full_name" type="text" required value={form.full_name} onChange={handleChange} placeholder="Rahul Sharma" className={`${inputClass} ${errors.full_name ? 'border-red-400' : ''}`} />
                      {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">Work Email *</label>
                      <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="rahul@company.com" className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="mobile">Mobile Number</label>
                      <input id="mobile" name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="company_name">Company Name</label>
                      <input id="company_name" name="company_name" type="text" value={form.company_name} onChange={handleChange} placeholder="ABC Corp" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="designation">Designation</label>
                      <input id="designation" name="designation" type="text" value={form.designation} onChange={handleChange} placeholder="Marketing Manager" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="enquiry_type">Enquiry Type *</label>
                      <select id="enquiry_type" name="enquiry_type" required value={form.enquiry_type} onChange={handleChange} className={`${inputClass} ${errors.enquiry_type ? 'border-red-400' : ''}`}>
                        <option value="">Select type</option>
                        {ENQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.enquiry_type && <p className="text-red-500 text-xs mt-1">{errors.enquiry_type}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="subject">Subject *</label>
                    <input id="subject" name="subject" type="text" required value={form.subject} onChange={handleChange} placeholder="Media Partnership Enquiry" className={`${inputClass} ${errors.subject ? 'border-red-400' : ''}`} />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="message">Your Message *</label>
                    <textarea id="message" name="message" required rows={4} value={form.message} onChange={handleChange} placeholder="Tell us about your requirements..." className={`${inputClass} resize-none ${errors.message ? 'border-red-400' : ''}`} />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="city">City</label>
                      <input id="city" name="city" type="text" value={form.city} onChange={handleChange} placeholder="Noida" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="country">Country</label>
                      <input id="country" name="country" type="text" value={form.country} onChange={handleChange} placeholder="India" className={inputClass} />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input id="consent" name="consent" type="checkbox" checked={form.consent} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-primary cursor-pointer" />
                    <label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                      I consent to Bharat Network Group processing my data to respond to this enquiry. *
                    </label>
                  </div>
                  {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M22 2L11 13" /><path d="M22 2 15 22 11 13 2 9l20-7z" /></svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}