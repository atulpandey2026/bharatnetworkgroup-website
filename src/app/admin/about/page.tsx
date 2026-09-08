'use client';

import React, { useEffect, useState } from 'react';
import { aboutService, storageService } from '@/lib/cms-service';

type AboutImage = {
  id: string;
  image_url: string;
  alt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AboutAdminPage() {
  const [images, setImages] = useState<AboutImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('Bharat Network Group team');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ─────────────────────────────────────────────────────────────────────────
  // Load About Images
  // ─────────────────────────────────────────────────────────────────────────

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await aboutService.getAll();

      setImages(data as AboutImage[]);
    } catch (err: any) {
      console.error('Error loading About images:', err);
      setError(err?.message || 'Failed to load About images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // File Selection
  // ─────────────────────────────────────────────────────────────────────────

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Allow common image formats only
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG or WebP image.');
      setSelectedFile(null);
      event.target.value = '';
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      setSelectedFile(null);
      event.target.value = '';
      return;
    }

    setError('');
    setMessage('');
    setSelectedFile(file);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Upload Image
  // ─────────────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setMessage('');

      // Upload image to Supabase Storage
      const imageUrl = await storageService.upload(
        'about-images',
        'about',
        selectedFile
      );

      // Save image information in database
      await aboutService.create({
        image_url: imageUrl,
        alt_text:
          altText.trim() || 'Bharat Network Group team',
        is_active: true,
      });

      setMessage('About image uploaded successfully.');

      // Reset form
      setSelectedFile(null);
      setAltText('Bharat Network Group team');

      const fileInput = document.getElementById(
        'about-image-upload'
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh image list
      await loadImages();
    } catch (err: any) {
      console.error('About image upload error:', err);

      setError(
        err?.message ||
          'Failed to upload About image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Set Active Image
  // ─────────────────────────────────────────────────────────────────────────

  const handleSetActive = async (id: string) => {
    try {
      setActivating(id);
      setError('');
      setMessage('');

      await aboutService.setActive(id);

      setMessage('About image changed successfully.');

      await loadImages();
    } catch (err: any) {
      console.error('Set active image error:', err);

      setError(
        err?.message ||
          'Failed to change the active About image.'
      );
    } finally {
      setActivating(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Delete Image
  // ─────────────────────────────────────────────────────────────────────────

  const handleDelete = async (image: AboutImage) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this About image?'
    );

    if (!confirmed) return;

    try {
      setDeleting(image.id);
      setError('');
      setMessage('');

      // Delete database record
      await aboutService.delete(image.id);

      // Delete actual file from Storage
      await storageService.deleteByUrl(
        'about-images',
        image.image_url
      );

      setMessage('About image deleted successfully.');

      await loadImages();
    } catch (err: any) {
      console.error('Delete About image error:', err);

      setError(
        err?.message ||
          'Failed to delete About image.'
      );
    } finally {
      setDeleting(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0D0B09] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E05A1E]/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#E05A1E]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                About Section
              </h1>

              <p className="text-white/50 text-sm mt-1">
                Manage the image displayed in the About section
                of your website.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">

          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Upload New About Image
            </h2>

            <p className="text-white/40 text-sm mt-1">
              Upload a new image and it will automatically become
              the active About section image.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* File Upload */}
            <div>
              <label
                htmlFor="about-image-upload"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Select Image
              </label>

              <input
                id="about-image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-white/60
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-lg file:border-0
                  file:bg-[#E05A1E]
                  file:text-white
                  file:font-medium
                  hover:file:bg-[#c94d17]
                  cursor-pointer"
              />

              <p className="text-xs text-white/30 mt-2">
                JPG, PNG or WebP. Maximum size: 5 MB.
              </p>
            </div>

            {/* Alt Text */}
            <div>
              <label
                htmlFor="alt-text"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Image Alt Text
              </label>

              <input
                id="alt-text"
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Bharat Network Group team"
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#E05A1E]/60"
              />
            </div>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

                <div className="w-32 h-24 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected About image"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-white/40 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E05A1E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c94d17] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0L8 7m4-4l4 4"
                    />
                  </svg>
                  Upload & Set Active
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Images */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold">
                About Images
              </h2>

              <p className="text-white/40 text-sm mt-1">
                The image marked as Active is displayed on the
                website.
              </p>
            </div>

            <button
              type="button"
              onClick={loadImages}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:bg-white/5 transition disabled:opacity-40"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#E05A1E] border-t-transparent rounded-full animate-spin" />

                <p className="text-sm text-white/40">
                  Loading images...
                </p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
              <svg
                className="w-10 h-10 mx-auto text-white/20 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              <p className="text-white/50 text-sm">
                No About images uploaded yet.
              </p>

              <p className="text-white/30 text-xs mt-1">
                Upload your first About section image above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {images.map((image) => (
                <div
                  key={image.id}
                  className={`rounded-xl overflow-hidden border ${
                    image.is_active
                      ? 'border-[#E05A1E]/60'
                      : 'border-white/10'
                  } bg-white/[0.02]`}
                >

                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-black/20">

                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'About image'}
                      className="w-full h-full object-cover"
                    />

                    {/* Active Badge */}
                    {image.is_active && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E05A1E] px-3 py-1 text-xs font-semibold text-white shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          Active
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">

                    <p className="text-sm text-white/70 truncate">
                      {image.alt_text || 'About image'}
                    </p>

                    <p className="text-xs text-white/30 mt-1">
                      Uploaded{' '}
                      {new Date(
                        image.created_at
                      ).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">

                      {!image.is_active && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSetActive(image.id)
                          }
                          disabled={activating === image.id}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#E05A1E]/10 border border-[#E05A1E]/20 text-[#E05A1E] text-xs font-semibold hover:bg-[#E05A1E]/20 transition disabled:opacity-40"
                        >
                          {activating === image.id
                            ? 'Activating...'
                            : 'Set Active'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(image)
                        }
                        disabled={deleting === image.id}
                        className={`${
                          image.is_active
                            ? 'flex-1'
                            : ''
                        } px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-40`}
                      >
                        {deleting === image.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}