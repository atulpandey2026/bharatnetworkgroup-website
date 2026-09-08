'use client';

import React, { useEffect, useState, useRef } from 'react';

import { heroService, storageService } from '@/lib/cms-service';
import { auditService } from '@/lib/audit-service';

interface HeroImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_active: boolean;
  created_at: string;
}

export default function HeroAdminPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await heroService.getAll();
      setImages(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { notify('Only JPG, PNG, WebP allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { notify('Image must be under 5MB', 'error'); return; }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    const imageUrl = file ? null : urlInput.trim();
    if (!file && !imageUrl) { notify('Please select a file or enter an image URL', 'error'); return; }
    if (!altText.trim()) { notify('Please enter alt text', 'error'); return; }
    setUploading(true);
    try {
      let finalUrl = imageUrl || '';
      if (file) {
        finalUrl = await storageService.upload('hero-images', 'hero', file);
      }
      const created = await heroService.create({ image_url: finalUrl, alt_text: altText, is_active: false });
      await auditService.log({
        action: 'upload',
        entity_type: 'hero_image',
        entity_id: created?.id,
        entity_name: altText,
        summary: `Uploaded new hero image: "${altText}"`,
        metadata: { image_url: finalUrl },
      });
      notify('Hero image added successfully');
      setPreviewUrl('');
      setAltText('');
      setUrlInput('');
      if (fileRef.current) fileRef.current.value = '';
      await load();
    } catch (e: any) {
      notify(e?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const img = images.find((i) => i.id === id);
      await heroService.setActive(id);
      await auditService.log({
        action: 'set_active',
        entity_type: 'hero_image',
        entity_id: id,
        entity_name: img?.alt_text || id,
        summary: `Set hero image as active: "${img?.alt_text || id}"`,
      });
      notify('Hero image set as active');
      await load();
    } catch (e: any) {
      notify(e?.message || 'Failed to set active', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const img = images.find((i) => i.id === id);
      await heroService.delete(id);
      await auditService.log({
        action: 'delete',
        entity_type: 'hero_image',
        entity_id: id,
        entity_name: img?.alt_text || id,
        summary: `Deleted hero image: "${img?.alt_text || id}"`,
      });
      setDeleteConfirm(null);
      notify('Image deleted');
      await load();
    } catch (e: any) {
      notify(e?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Hero Images</h2>
        <p className="text-gray-500 text-sm">Manage the hero banner image displayed on the homepage</p>
      </div>

      {/* Notifications */}
      {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">{success}</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-gray-900 font-semibold mb-5">Add New Hero Image</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image File</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Or Enter Image URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setPreviewUrl(e.target.value); }}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {uploading ? 'Uploading…' : 'Add Image'}
            </button>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-sm">No image selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Images list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-gray-900 font-semibold mb-5">All Hero Images</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : images.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No hero images yet. Add one above.</p>
        ) : (
          <div className="space-y-4">
            {images.map((img) => (
              <div key={img.id} className={`flex items-center gap-4 p-4 rounded-xl border ${img.is_active ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{img.alt_text || 'No alt text'}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{img.image_url}</p>
                  {img.is_active && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!img.is_active && (
                    <button
                      onClick={() => handleSetActive(img.id)}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(img.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h4 className="text-gray-900 font-semibold mb-2">Delete Image?</h4>
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
