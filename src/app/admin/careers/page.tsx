'use client';

import React, { useState, useEffect } from 'react';
import { jobsService } from '@/lib/careers-service';

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
  job_status: string;
  created_at: string;
}

const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
const JOB_STATUSES = ['published', 'draft', 'closed'];

const inputClass = 'w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all';
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = {
    job_id: '', title: '', department: '', location: '', employment_type: 'Full Time',
    experience_required: '', description: '', responsibilities: '', required_skills: '',
    posted_date: new Date().toISOString().split('T')[0], application_deadline: '', job_status: 'draft',
  };
  const [form, setForm] = useState(emptyForm);

  const loadJobs = async () => {
    setLoading(true);
    const data = await jobsService.getAll();
    setJobs(data as Job[]);
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      job_id: job.job_id, title: job.title, department: job.department, location: job.location,
      employment_type: job.employment_type, experience_required: job.experience_required || '',
      description: job.description || '', responsibilities: job.responsibilities || '',
      required_skills: job.required_skills || '', posted_date: job.posted_date || '',
      application_deadline: job.application_deadline || '', job_status: job.job_status,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingJob(null);
    setForm({ ...emptyForm, job_id: `BNG-${Date.now().toString(36).toUpperCase()}` });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.department || !form.location) {
      setError('Title, Department, and Location are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingJob) {
        await jobsService.update(editingJob.id, form);
        setSuccess('Job updated successfully.');
      } else {
        await jobsService.create(form as any);
        setSuccess('Job created successfully.');
      }
      setShowForm(false);
      loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to save job.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await jobsService.delete(id);
      setDeleteConfirm(null);
      setSuccess('Job deleted.');
      loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete job.');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await jobsService.duplicate(id);
      setSuccess('Job duplicated as draft.');
      loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate job.');
    }
  };

  const handleStatusToggle = async (job: Job) => {
    const newStatus = job.job_status === 'published' ? 'draft' : 'published';
    try {
      await jobsService.update(job.id, { job_status: newStatus });
      setSuccess(`Job ${newStatus === 'published' ? 'published' : 'unpublished'}.`);
      loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      published: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-600',
      closed: 'bg-red-100 text-red-600',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Job Openings</h2>
          <p className="text-gray-500 text-sm">Manage job postings for the Careers page</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#E05A1E] text-white rounded-xl text-sm font-semibold hover:bg-[#C94E18] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Job
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 text-lg mb-5">{editingJob ? 'Edit Job' : 'New Job Opening'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Job ID *</label>
                <input name="job_id" value={form.job_id} onChange={handleChange} className={inputClass} placeholder="BNG-MKT-001" required />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Job Title *</label>
                <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Digital Marketing Manager" required />
              </div>
              <div>
                <label className={labelClass}>Department *</label>
                <input name="department" value={form.department} onChange={handleChange} className={inputClass} placeholder="Marketing" required />
              </div>
              <div>
                <label className={labelClass}>Location *</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="Noida" required />
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <select name="employment_type" value={form.employment_type} onChange={handleChange} className={inputClass}>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Experience Required</label>
                <input name="experience_required" value={form.experience_required} onChange={handleChange} className={inputClass} placeholder="3-5 Years" />
              </div>
              <div>
                <label className={labelClass}>Posted Date</label>
                <input name="posted_date" type="date" value={form.posted_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Application Deadline</label>
                <input name="application_deadline" type="date" value={form.application_deadline} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="job_status" value={form.job_status} onChange={handleChange} className={inputClass}>
                  {JOB_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Job Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="Describe the role..." />
            </div>
            <div>
              <label className={labelClass}>Responsibilities (one per line)</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Develop marketing strategies&#10;Manage campaigns..." />
            </div>
            <div>
              <label className={labelClass}>Required Skills (comma-separated)</label>
              <input name="required_skills" value={form.required_skills} onChange={handleChange} className={inputClass} placeholder="React, Node.js, TypeScript" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#E05A1E] text-white rounded-xl text-sm font-semibold hover:bg-[#C94E18] transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-20" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-sm">No job openings yet. Click "Add Job" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{job.department} · {job.job_id}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{job.location}</td>
                  <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{job.employment_type}</td>
                  <td className="px-5 py-4">
                    <span className={statusBadge(job.job_status)}>{job.job_status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleStatusToggle(job)} title={job.job_status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                      <button onClick={() => handleDuplicate(job.id)} title="Duplicate" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      </button>
                      <button onClick={() => handleEdit(job)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-600 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(job.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Job?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone. All associated data will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
