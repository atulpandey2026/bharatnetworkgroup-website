'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/app/admin/AdminLayout';
import { createClient } from '@/lib/supabase/client';
import AppImage from '@/components/ui/AppImage';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface FormState {
  name: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  status: 'active' | 'inactive';
}

const EMPTY_FORM: FormState = {
  name: '',
  logo_url: '',
  website_url: '',
  display_order: 0,
  status: 'active',
};

const BUCKET = 'clients-partners';

export default function ClientsPartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const notify = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients_partners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setPartners(data || []);
    } catch (e: any) {
      notify('error', e.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const filtered = partners.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      notify('error', 'Only PNG, JPG, JPEG, WebP, SVG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify('error', 'File size must be under 5MB.');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return publicUrl;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLogoFile(null);
    setLogoPreview('');
    setShowForm(true);
  };

  const openEdit = (p: Partner) => {
    setEditingId(p.id);
    setForm({ name: p.name, logo_url: p.logo_url, website_url: p.website_url || '', display_order: p.display_order, status: p.status });
    setLogoFile(null);
    setLogoPreview(p.logo_url);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { notify('error', 'Partner name is required.'); return; }
    if (!form.logo_url && !logoFile) { notify('error', 'Please upload a logo.'); return; }

    setSaving(true);
    setUploading(!!logoFile);
    try {
      let logoUrl = form.logo_url;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
        setUploading(false);
      }

      const payload = { name: form.name.trim(), logo_url: logoUrl, website_url: form.website_url.trim() || null, display_order: form.display_order, status: form.status };

      if (editingId) {
        const { error } = await supabase.from('clients_partners').update(payload).eq('id', editingId);
        if (error) throw error;
        notify('success', 'Partner updated successfully.');
      } else {
        const { error } = await supabase.from('clients_partners').insert(payload);
        if (error) throw error;
        notify('success', 'Partner added successfully.');
      }
      setShowForm(false);
      fetchPartners();
    } catch (e: any) {
      notify('error', e.message || 'Save failed.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleToggleStatus = async (p: Partner) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase.from('clients_partners').update({ status: newStatus }).eq('id', p.id);
      if (error) throw error;
      setPartners((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus } : x));
      notify('success', `Partner ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
    } catch (e: any) {
      notify('error', e.message || 'Status update failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('clients_partners').delete().eq('id', deleteId);
      if (error) throw error;
      setPartners((prev) => prev.filter((p) => p.id !== deleteId));
      notify('success', 'Partner deleted.');
    } catch (e: any) {
      notify('error', e.message || 'Delete failed.');
    } finally {
      setDeleteId(null);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A1E] focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {notification.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients &amp; Partners</h1>
            <p className="text-sm text-gray-500 mt-1">Manage logos displayed in the website carousel</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E05A1E] text-white rounded-xl text-sm font-semibold hover:bg-[#c94e18] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Partner
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E05A1E] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E05A1E]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#E05A1E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </div>
              <p className="text-gray-500 text-sm">No partners found. Add your first partner.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Logo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Partner Name</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 hidden md:table-cell">Website</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 hidden sm:table-cell">Order</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="w-16 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden">
                          <AppImage src={p.logo_url} alt={`${p.name} logo`} width={56} height={32} className="object-contain w-full h-full" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {p.website_url ? (
                          <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E05A1E] hover:underline truncate max-w-[180px] block">
                            {p.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{p.display_order}</span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {p.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg text-gray-400 hover:text-[#E05A1E] hover:bg-orange-50 transition-colors"
                            title="Edit"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Partner' : 'Add Partner'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className={labelClass}>Logo *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#E05A1E] hover:bg-orange-50/30 transition-all"
                  >
                    {logoPreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-32 h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-2 overflow-hidden">
                          <img src={logoPreview} alt="Logo preview" className="object-contain w-full h-full" />
                        </div>
                        <p className="text-xs text-gray-500">Click to replace logo</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        <p className="text-sm text-gray-500">Click to upload logo</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WebP, SVG — max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {!logoFile && !logoPreview && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-400 mb-1">Or paste logo URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={form.logo_url}
                        onChange={(e) => { setForm((f) => ({ ...f, logo_url: e.target.value })); setLogoPreview(e.target.value); }}
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className={labelClass}>Partner / Client Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className={labelClass}>Website URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={form.website_url}
                    onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {/* Display Order + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Display Order</label>
                    <input
                      type="number"
                      min={0}
                      value={form.display_order}
                      onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E05A1E] text-white rounded-xl text-sm font-semibold hover:bg-[#c94e18] disabled:opacity-60 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploading ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    editingId ? 'Save Changes' : 'Add Partner'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-2">Delete Partner?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to delete this client/partner? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
