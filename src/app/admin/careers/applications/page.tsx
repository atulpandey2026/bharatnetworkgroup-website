'use client';

import React, { useState, useEffect } from 'react';
import { applicationsService, jobsService } from '@/lib/careers-service';

interface Application {
  id: string;
  application_id: string;
  full_name: string;
  email: string;
  mobile: string;
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
  resume_url: string;
  app_status: string;
  admin_notes: string;
  city: string;
  state: string;
  current_location: string;
  created_at: string;
  job_openings?: { title: string; department: string; job_id: string } | null;
}

const STATUS_OPTIONS = ['new', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'on_hold'];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview_scheduled: 'bg-indigo-100 text-indigo-700',
    selected: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-gray-100 text-gray-600',
  };
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`;
};

const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const limit = 15;

  const load = async () => {
    setLoading(true);
    const { data, count } = await applicationsService.getAll({ status: statusFilter, job_id: jobFilter, search, page, limit });
    setApplications(data as Application[]);
    setTotal(count);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, statusFilter, jobFilter, page]);
  useEffect(() => { jobsService.getAll().then((d) => setJobs(d.map((j: any) => ({ id: j.id, title: j.title })))); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await applicationsService.updateStatus(id, status);
      setSuccess('Status updated.');
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, app_status: status } : null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await applicationsService.updateNotes(selected.id, notes);
      setSuccess('Notes saved.');
      setSelected((prev) => prev ? { ...prev, admin_notes: notes } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await applicationsService.delete(id);
      setDeleteConfirm(null);
      setSelected(null);
      setSuccess('Application deleted.');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openDetail = (app: Application) => {
    setSelected(app);
    setNotes(app.admin_notes || '');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Applications</h2>
        <p className="text-gray-500 text-sm">Review and manage candidate applications</p>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or application ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select value={jobFilter} onChange={(e) => { setJobFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">All Positions</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`flex-1 min-w-0 ${selected ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No applications found.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Position</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Experience</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetail(app)}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">{app.full_name}</p>
                            <p className="text-gray-400 text-xs">{app.email}</p>
                            <p className="text-gray-400 text-xs font-mono">{app.application_id}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                            {app.job_openings?.title || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{app.total_experience || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={statusBadge(app.app_status)}>{statusLabel(app.app_status)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                            {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(app.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
                    <div className="flex gap-2">
                      <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                      <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{selected.full_name}</h3>
                  <p className="text-gray-400 text-xs font-mono">{selected.application_id}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {[
                  ['Email', selected.email],
                  ['Mobile', selected.mobile],
                  ['Position', selected.job_openings?.title || '—'],
                  ['Company', selected.current_company || '—'],
                  ['Designation', selected.current_designation || '—'],
                  ['Experience', selected.total_experience || '—'],
                  ['Current CTC', selected.current_ctc || '—'],
                  ['Expected CTC', selected.expected_ctc || '—'],
                  ['Notice Period', selected.notice_period || '—'],
                  ['Location', [selected.city, selected.state].filter(Boolean).join(', ') || '—'],
                  ['Source', selected.source || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-gray-400 w-28 shrink-0">{label}</span>
                    <span className="text-gray-900 font-medium break-all">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                {selected.linkedin_url && (
                  <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">LinkedIn</a>
                )}
                {selected.portfolio_url && (
                  <a href={selected.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-lg bg-gray-50 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors">Portfolio</a>
                )}
                {selected.resume_url && (
                  <a href={selected.resume_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition-colors">Resume</a>
                )}
              </div>

              {selected.cover_letter && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cover Letter</p>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">{selected.cover_letter}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Change Status</label>
                <select
                  value={selected.app_status}
                  onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Add internal notes..."
                />
                <button onClick={handleSaveNotes} disabled={savingNotes} className="mt-2 w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60">
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Application?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently remove the candidate's application.</p>
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
