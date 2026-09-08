'use client';

import React, { useEffect, useState, useRef } from 'react';
import { magazinesService, brandsService, storageService } from '@/lib/cms-service';
import { auditService } from '@/lib/audit-service';

interface Brand { id: string; name: string; }
interface Magazine {
  id: string;
  title: string;
  brand_id: string;
  edition: string;
  publication_date: string;
  thumbnail_url: string;
  pdf_url: string;
  description: string;
  mag_status: string;
  brands?: { id: string; name: string };
}

const emptyForm = {
  title: '',
  brand_id: '',
  edition: '',
  publication_date: '',
  thumbnail_url: '',
  pdf_url: '',
  description: '',
  mag_status: 'draft',
};

export default function MagazinesAdminPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const thumbRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [mags, brnds] = await Promise.all([magazinesService.getAll(), brandsService.getAll()]);
      setMagazines(mags);
      setBrands(brnds);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setThumbnailFile(null);
    setPdfFile(null);
    setThumbnailPreview('');
    setShowForm(true);
  };

  const openEdit = (mag: Magazine) => {
    setEditId(mag.id);
    setForm({
      title: mag.title,
      brand_id: mag.brand_id || '',
      edition: mag.edition,
      publication_date: mag.publication_date || '',
      thumbnail_url: mag.thumbnail_url || '',
      pdf_url: mag.pdf_url || '',
      description: mag.description || '',
      mag_status: mag.mag_status,
    });
    setThumbnailPreview(mag.thumbnail_url || '');
    setThumbnailFile(null);
    setPdfFile(null);
    setShowForm(true);
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) { notify('Only JPG, PNG, WebP allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { notify('Image must be under 5MB', 'error'); return; }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { notify('Only PDF files allowed', 'error'); return; }
    if (file.size > 50 * 1024 * 1024) { notify('PDF must be under 50MB', 'error'); return; }
    setPdfFile(file);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { notify('Title is required', 'error'); return; }
    if (!form.brand_id) { notify('Please select a brand', 'error'); return; }
    if (!form.edition.trim()) { notify('Edition is required', 'error'); return; }
    setSaving(true);
    try {
      let thumbnailUrl = form.thumbnail_url;
      let pdfUrl = form.pdf_url;
      if (thumbnailFile) thumbnailUrl = await storageService.upload('magazine-assets', 'thumbnails', thumbnailFile);
      if (pdfFile) pdfUrl = await storageService.upload('magazine-assets', 'pdfs', pdfFile);
      const payload = { ...form, thumbnail_url: thumbnailUrl, pdf_url: pdfUrl };
      if (editId) {
        // Save snapshot before update
        const existing = magazines.find((m) => m.id === editId);
        if (existing) {
          await auditService.saveSnapshot({
            entity_type: 'magazine',
            entity_id: editId,
            entity_name: existing.title,
            snapshot_data: { ...existing },
          });
        }
        await magazinesService.update(editId, payload);
        await auditService.log({
          action: 'update',
          entity_type: 'magazine',
          entity_id: editId,
          entity_name: form.title,
          summary: `Updated magazine: "${form.title}" (${form.edition})`,
          metadata: { brand_id: form.brand_id, mag_status: form.mag_status },
        });
        notify('Magazine updated');
      } else {
        const created = await magazinesService.create(payload);
        await auditService.log({
          action: 'create',
          entity_type: 'magazine',
          entity_id: created?.id,
          entity_name: form.title,
          summary: `Created magazine: "${form.title}" (${form.edition})`,
          metadata: { brand_id: form.brand_id, mag_status: form.mag_status },
        });
        notify('Magazine added');
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      notify(e?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const mag = magazines.find((m) => m.id === id);
      await magazinesService.delete(id);
      await auditService.log({
        action: 'delete',
        entity_type: 'magazine',
        entity_id: id,
        entity_name: mag?.title || id,
        summary: `Deleted magazine: "${mag?.title || id}"`,
      });
      setDeleteConfirm(null);
      notify('Magazine deleted');
      await load();
    } catch (e: any) {
      notify(e?.message || 'Delete failed', 'error');
    }
  };

  const handleToggleStatus = async (mag: Magazine) => {
    try {
      const newStatus = mag.mag_status === 'published' ? 'draft' : 'published';
      // Save snapshot before publish/unpublish
      await auditService.saveSnapshot({
        entity_type: 'magazine',
        entity_id: mag.id,
        entity_name: mag.title,
        snapshot_data: { ...mag },
      });
      await magazinesService.update(mag.id, { mag_status: newStatus });
      await auditService.log({
        action: newStatus === 'published' ? 'publish' : 'unpublish',
        entity_type: 'magazine',
        entity_id: mag.id,
        entity_name: mag.title,
        summary: `${newStatus === 'published' ? 'Published' : 'Unpublished'} magazine: "${mag.title}"`,
      });
      notify(`Magazine ${newStatus}`);
      await load();
    } catch (e: any) {
      notify(e?.message || 'Failed', 'error');
    }
  };

  const filtered = magazines.filter((m) => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.edition.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !filterBrand || m.brand_id === filterBrand;
    const matchStatus = !filterStatus || m.mag_status === filterStatus;
    return matchSearch && matchBrand && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Magazine Library</h2>
          <p className="text-gray-500 text-sm">Manage all magazine issues and publications</p>
        </div>
        <button onClick={openAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Magazine
        </button>
      </div>

      {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">{success}</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search magazines…"
          className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No magazines found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Cover</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Title / Edition</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Brand</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">PDF</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mag) => (
                  <tr key={mag.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {mag.thumbnail_url ? (
                          <img src={mag.thumbnail_url} alt={mag.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{mag.title}</p>
                      <p className="text-xs text-gray-400">{mag.edition}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{mag.brands?.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{mag.publication_date || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${mag.mag_status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${mag.mag_status === 'published' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {mag.mag_status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {mag.pdf_url ? (
                        <a href={mag.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View PDF</a>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(mag)} className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleToggleStatus(mag)} className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${mag.mag_status === 'published' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                          {mag.mag_status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => setDeleteConfirm(mag.id)} className="text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editId ? 'Edit Magazine' : 'Add Magazine'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand <span className="text-red-500">*</span></label>
                  <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">Select brand…</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Edition <span className="text-red-500">*</span></label>
                  <input type="text" value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} placeholder="Vol 1 · Issue 1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Publication Date</label>
                  <input type="date" value={form.publication_date} onChange={(e) => setForm({ ...form, publication_date: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.mag_status} onChange={(e) => setForm({ ...form, mag_status: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Thumbnail</label>
                  <input ref={thumbRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleThumbChange} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer mb-2" />
                  <input type="url" value={form.thumbnail_url} onChange={(e) => { setForm({ ...form, thumbnail_url: e.target.value }); setThumbnailPreview(e.target.value); }} placeholder="Or paste image URL" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-2 h-20 rounded-lg object-cover" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Magazine PDF</label>
                  <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-2" />
                  <input type="url" value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} placeholder="Or paste PDF URL" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {form.pdf_url && <a href={form.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline mt-1 inline-block">Preview PDF ↗</a>}
                  {pdfFile && <p className="text-xs text-emerald-600 mt-1">✓ {pdfFile.name}</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                {saving ? 'Saving…' : editId ? 'Update Magazine' : 'Add Magazine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h4 className="text-gray-900 font-semibold mb-2">Delete Magazine?</h4>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
