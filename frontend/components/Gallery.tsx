// src/components/Gallery.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Image } from '../types';
import ImageCard from './ImageCard';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface GalleryProps {
  onImageUpdate: () => void;
}

const ITEMS_PER_PAGE = 8;
const API_BASE = 'http://127.0.0.1:8000/api/v1';

// API shapes
type ApiImage = {
  id: number;
  owner: string;
  image: string;
  caption: string | null;
  uploaded_at: string; // ISO
  status: string;
};

type ApiListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const Gallery: React.FC<GalleryProps> = ({ onImageUpdate }) => {
  const { authorizedFetch } = useAuth();
  const { addToast } = useToast();

  const [remoteImages, setRemoteImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // fetcher (optionally accepts AbortSignal)
  const fetchImages = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setErr('');

      try {
        const res = await authorizedFetch(`${API_BASE}/gallery/`, {
          method: 'GET',
          signal,
        });

        if (res.status === 204) {
          setRemoteImages([]);
          setCurrentPage(1);
          return;
        }

        const data: unknown = await res.json();

        if (!res.ok) {
          const anyData = data as any;
          const msg =
            anyData?.detail ||
            (typeof anyData === 'object'
              ? Object.entries(anyData)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                  .join(' | ')
              : 'Failed to fetch images');
          throw new Error(msg);
        }

        // Accept both paginated and raw-list responses
        let results: ApiImage[] = [];
        if (data && typeof data === 'object' && Array.isArray((data as ApiListResponse<ApiImage>).results)) {
          results = (data as ApiListResponse<ApiImage>).results;
        } else if (Array.isArray(data)) {
          results = data as ApiImage[];
        } else {
          throw new Error('Invalid response format: expected { results: [...] } or an array.');
        }

        // Map to your Image type and normalize timestamp (number)
        const mapped: Image[] = results.map((it) => ({
          id: it.id,
          caption: it.caption ?? '',
          image: it.image, 
          status: (it as any).status,
          timestamp: Date.parse(it.uploaded_at),
          owner: (it as any).owner,
        })) as unknown as Image[];

        // newest first
        mapped.sort((a, b) => {
          const ta = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(String(a.timestamp));
          const tb = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(String(b.timestamp));
          return tb - ta;
        });

        setRemoteImages(mapped);
        setCurrentPage(1);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        const msg = e?.message || 'Could not load gallery.';
        setErr(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [authorizedFetch, addToast]
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchImages(ac.signal);
    return () => ac.abort();
  }, [fetchImages]);

  const handleChildUpdated = async () => {
    await fetchImages();
    onImageUpdate?.();
  };

  const filteredImages = useMemo(() => {
    return remoteImages
      .filter((image) =>
        (image.caption || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((image) => {
        if (!dateFilter) return true;
        const ts = typeof image.timestamp === 'number' ? image.timestamp : Date.parse(String(image.timestamp));
        const dateStr = new Date(ts).toISOString().split('T')[0];
        return dateStr === dateFilter;
      });
  }, [remoteImages, searchQuery, dateFilter]);

  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Gallery</h2>
        <button
          onClick={() => fetchImages()}
          disabled={loading}
          className="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search captions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-auto px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {err && (
        <div className="text-sm text-red-400 bg-gray-800 rounded-lg p-3">
          {err}
        </div>
      )}

      {loading && !remoteImages.length ? (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
          <p className="text-gray-400">Loading images…</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No images found. Try uploading some or adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedImages.map((image) => (
              <ImageCard key={image.id} image={image} onUpdate={handleChildUpdated} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
