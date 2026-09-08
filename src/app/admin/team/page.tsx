'use client';

import React, { useEffect, useState, useRef } from 'react';
import { teamService, storageService } from '@/lib/cms-service';
import { auditService } from '@/lib/audit-service';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  company: string;
  profile_image_url: string;
  bio: string;
  linkedin_url: string;
  display_order: number;
  member_status: string;
}

const emptyForm = {
  name: '',
  designation: '',
  company: 'Bharat Network Group',
  profile_image_url: '',
  bio: '',
  linkedin_url: '',
  display_order: 0,
  member_status: 'active',
};

export default function TeamAdminPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const imgRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await teamService.getAll();
      setMembers(data);
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
    setForm({ ...emptyForm, display_order: members.length + 1 });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditId(m.id);
    setForm({
      name: m.name,
      designation: m.designation,
      company: m.company || '',
      profile_image_url: m.profile_image_url || '',
      bio: m.bio || '',
      linkedin_url: m.linkedin_url || '',
      display_order: m.display_order,
      member_status: m.member_status,
    });
    setImagePreview(m.profile_image_url || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) { notify('Only JPG, PNG, WebP allowed', 'error'); return; }
    if (file.size > 3 * 1024 * 1024) { notify('Image must be under 3MB', 'error'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { notify('Name is required', 'error'); return; }
    if (!form.designation.trim()) { notify('Designation is required', 'error'); return; }
    setSaving(true);
    try {
      let imageUrl = form.profile_image_url;
      if (imageFile) imageUrl = await storageService.upload('team-photos', 'photos', imageFile);
      const payload = { ...form, profile_image_url: imageUrl };
      if (editId) {
        const existing = members.find((m) => m.id === editId);
        if (existing) {
          await auditService.saveSnapshot({
            entity_type: 'team_member',
            entity_id: editId,
            entity_name: existing.name,
            snapshot_data: { ...existing },
          });
        }
        await teamService.update(editId, payload);
        await auditService.log({
          action: 'update',
          entity_type: 'team_member',
          entity_id: editId,
          entity_name: form.name,
          summary: `Updated team member: "${form.name}" (${form.designation})`,
        });
        notify('Team member updated');
      } else {
        const created = await teamService.create(payload);
        await auditService.log({
          action: 'create',
          entity_type: 'team_member',
          entity_id: created?.id,
          entity_name: form.name,
          summary: `Added team member: "${form.name}" (${form.designation})`,
        });
        notify('Team member added');
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
      const m = members.find((mem) => mem.id === id);
      await teamService.delete(id);
      await auditService.log({
        action: 'delete',
        entity_type: 'team_member',
        entity_id: id,
        entity_name: m?.name || id,
        summary: `Deleted team member: "${m?.name || id}"`,
      });
      setDeleteConfirm(null);
      notify('Team member deleted');
      await load();
    } catch (e: any) {
      notify(e?.message || 'Delete failed', 'error');
    }
  };

  const handleToggleStatus = async (m: TeamMember) => {
    try {
      const newStatus = m.member_status === 'active' ? 'inactive' : 'active';
      await teamService.update(m.id, { member_status: newStatus });
      await auditService.log({
        action: newStatus === 'active' ? 'publish' : 'unpublish',
        entity_type: 'team_member',
        entity_id: m.id,
        entity_name: m.name,
        summary: `${newStatus === 'active' ? 'Activated' : 'Deactivated'} team member: "${m.name}"`,
      });
      notify(`${m.name} ${newStatus}`);
      await load();
    } catch (e: any) {
      notify(e?.message || 'Failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Team Members</h2>
          <p className="text-gray-500 text-sm">Manage team profiles displayed on the website</p>
        </div>
        <button onClick={openAdd} className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Member
        </button>
      </div>

      {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">{success}</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">No team members yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => (
            <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${m.member_status === 'inactive' ? 'border-gray-100 opacity-60' : 'border-gray-100'}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {m.profile_image_url ? (
                    <img src={m.profile_image_url} alt={m.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/no_image.png'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold text-lg">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{m.name}</h4>
                  <p className="text-gray-500 text-xs truncate">{m.designation}</p>
                  <p className="text-gray-400 text-xs truncate">{m.company}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.member_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.member_status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {m.member_status}
                    </span>
                    <span className="text-gray-300 text-xs">#{m.display_order}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(m)} className="flex-1 text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleToggleStatus(m)} className={`flex-1 text-xs px-3 py-2 rounded-lg transition-colors ${m.member_status === 'active' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                  {m.member_status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setDeleteConfirm(m.id)} className="text-xs px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Photo</label>
                  <input ref={imgRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageChange} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" />
                  <input type="url" value={form.profile_image_url} onChange={(e) => { setForm({ ...form, profile_image_url: e.target.value }); setImagePreview(e.target.value); }} placeholder="Or paste image URL" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation <span className="text-red-500">*</span></label>
                  <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL</label>
                  <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.member_status} onChange={(e) => setForm({ ...form, member_status: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Short bio about this team member…" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                {saving ? 'Saving…' : editId ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h4 className="text-gray-900 font-semibold mb-2">Delete Team Member?</h4>
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
