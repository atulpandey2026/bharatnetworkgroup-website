'use client';

import React, { useEffect, useState, useRef } from 'react';
import { brandsService, storageService } from '@/lib/cms-service';
import { auditService } from '@/lib/audit-service';

interface Brand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  is_active: boolean;
}

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [pendingUrls, setPendingUrls] = useState<Record<string, string>>({});
const [pendingWebsiteUrls, setPendingWebsiteUrls] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [newBrandFile, setNewBrandFile] = useState<File | null>(null);
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const data = await brandsService.getAll();
      setBrands(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const handleFileChange = (brandId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { notify('Only JPG, PNG, WebP allowed', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { notify('Logo must be under 2MB', 'error'); return; }
    setPendingFiles((prev) => ({ ...prev, [brandId]: file }));
    setPreviews((prev) => ({ ...prev, [brandId]: URL.createObjectURL(file) }));
  };

  const handleUrlChange = (brandId: string, url: string) => {
    setPendingUrls((prev) => ({ ...prev, [brandId]: url }));
    setPreviews((prev) => ({ ...prev, [brandId]: url }));
  };
const handleWebsiteUrlChange = (brandId: string, url: string) => {
  setPendingWebsiteUrls((prev) => ({
    ...prev,
    [brandId]: url,
  }));
};
  const handleSave = async (brand: Brand) => {
    setSaving(brand.id);
    try {
      let logoUrl = brand.logo_url;
      const file = pendingFiles[brand.id];
      const url = pendingUrls[brand.id];
      if (file) {
        logoUrl = await storageService.upload('brand-logos', 'logos', file);
      } else if (url) {
        logoUrl = url;
      }
      // Save snapshot before update
      await auditService.saveSnapshot({
        entity_type: 'brand',
        entity_id: brand.id,
        entity_name: brand.name,
        snapshot_data: { ...brand },
      });
      
const websiteUrl =
  pendingWebsiteUrls[brand.id] !== undefined
    ? pendingWebsiteUrls[brand.id]
    : brand.website_url || '';

await brandsService.update(brand.id, {
  logo_url: logoUrl,
  website_url: websiteUrl,
});

      await auditService.log({
        action: 'update',
        entity_type: 'brand',
        entity_id: brand.id,
        entity_name: brand.name,
        summary: `Updated logo for brand: "${brand.name}"`,
        metadata: { logo_url: logoUrl },
      });
      notify(`${brand.name} updated`);
      setPendingFiles((prev) => { const n = { ...prev }; delete n[brand.id]; return n; });
      setPendingUrls((prev) => { const n = { ...prev }; delete n[brand.id]; return n; });
      
      setPendingWebsiteUrls((prev) => {
  const n = { ...prev };
  delete n[brand.id];
  return n;
});
      
      await load();
    } catch (e: any) {
      notify(e?.message || 'Save failed', 'error');
    } finally {
      setSaving(null);
    }
  };


  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      notify('Brand name is required', 'error');
      return;
    }
    setAdding(true);
    try {
      let logoUrl = newBrandLogoUrl.trim();
      if (newBrandFile) {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(newBrandFile.type)) throw new Error('Only JPG, PNG, WebP allowed');
        if (newBrandFile.size > 2 * 1024 * 1024) throw new Error('Logo must be under 2MB');
        logoUrl = await storageService.upload('brand-logos', 'logos', newBrandFile);
      }
      const nextOrder = brands.length ? Math.max(...brands.map((b) => Number(b.display_order) || 0)) + 1 : 1;
      const created = await brandsService.create({
        name: newBrandName.trim(),
        logo_url: logoUrl,
        website_url: newBrandWebsite.trim(),
        display_order: nextOrder,
        is_active: true,
      });
      await auditService.log({
        action: 'create',
        entity_type: 'brand',
        entity_id: created.id,
        entity_name: created.name,
        summary: `Created brand: "${created.name}"`,
      });
      notify(`${created.name} added successfully`);
      setNewBrandName('');
      setNewBrandWebsite('');
      setNewBrandFile(null);
      setNewBrandLogoUrl('');
      setShowAddForm(false);
      await load();
    } catch (e: any) {
      notify(e?.message || 'Failed to add brand', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (brand: Brand) => {
    try {
      await brandsService.update(brand.id, { is_active: !brand.is_active });
      await auditService.log({
        action: !brand.is_active ? 'publish' : 'unpublish',
        entity_type: 'brand',
        entity_id: brand.id,
        entity_name: brand.name,
        summary: `${!brand.is_active ? 'Activated' : 'Deactivated'} brand: "${brand.name}"`,
      });
      notify(`${brand.name} ${!brand.is_active ? 'activated' : 'deactivated'}`);
      await load();
    } catch (e: any) {
      notify(e?.message || 'Failed to toggle', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Brands</h2>
        <p className="text-gray-500 text-sm">Manage logos and details for all BNG brands</p>
      </div>

      {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">{success}</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add New Brand'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Brand</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Brand Name *</label>
              <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="Brand name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Website URL</label>
              <input type="url" value={newBrandWebsite} onChange={(e) => setNewBrandWebsite(e.target.value)} placeholder="https://example.com/" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Upload Logo</label>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setNewBrandFile(e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Or Logo URL</label>
              <input type="url" value={newBrandLogoUrl} onChange={(e) => setNewBrandLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="button" onClick={handleAddBrand} disabled={adding} className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
            {adding ? 'Adding…' : 'Add Brand'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-5">
                {/* Logo preview */}
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-100 shadow flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={previews[brand.id] || brand.logo_url}
                    alt={`${brand.name} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/no_image.png'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">{brand.name}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${brand.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${brand.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(brand)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${brand.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                >
                  {brand.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Upload New Logo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileChange(brand.id, e)}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Or Logo URL</label>
                  <input
                    type="url"
                    value={pendingUrls[brand.id] || ''}
                    onChange={(e) => handleUrlChange(brand.id, e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

<div>
  <label className="block text-xs font-medium text-gray-600 mb-1.5">
    Website URL
  </label>

  <input
    type="url"
    value={
      pendingWebsiteUrls[brand.id] !== undefined
        ? pendingWebsiteUrls[brand.id]
        : brand.website_url || ''
    }
    onChange={(e) =>
      handleWebsiteUrlChange(brand.id, e.target.value)
    }
    placeholder="https://example.com/"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>

                <button
                  onClick={() => handleSave(brand)}
                  disabled={saving === brand.id}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium py-2.5 rounded-xl transition-colors"
                >
                  {saving === brand.id ? 'Saving…' : 'Save Logo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
