// src/components/GalleryScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import UploadForm from './UploadForm';
import Gallery from './Gallery';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Image } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const GalleryScreen: React.FC = () => {
  const { user, authorizedFetch } = useAuth();
  const { addToast } = useToast();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authorizedFetch(`${API_BASE}/gallery/`, { method: 'GET' });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail ||
          (typeof data === 'object'
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                .join(' | ')
            : 'Failed to fetch images');
        throw new Error(msg);
      }

      const list = (data as Image[]).slice().sort((a, b) => {
        const ta = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(String(a.timestamp));
        const tb = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(String(b.timestamp));
        return tb - ta; 
      });

      setImages(list);
    } catch (e: any) {
      addToast(e?.message || 'Could not load gallery.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, authorizedFetch, addToast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageUpdate = () => {
    fetchImages();
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-300">Please log in to view your gallery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UploadForm
        onUploadSuccess={() => {
          addToast('Image uploaded!', 'success');
          handleImageUpdate();
        }}
        onUploadError={(msg?: string) => addToast(msg || 'Upload failed.', 'error')}
      />

      {loading && !images.length ? (
        <div className="p-6 bg-gray-800 rounded-lg text-gray-300">Loading images…</div>
      ) : (
        <Gallery images={images} onImageUpdate={handleImageUpdate} />
      )}
    </div>
  );
};

export default GalleryScreen;
