// src/components/ImageCard.tsx
import React, { useState } from 'react';
import { Image } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

interface ImageCardProps {
  image: Image;
  onUpdate: () => void;
}

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const ImageCard: React.FC<ImageCardProps> = ({ image, onUpdate }) => {
  const { addToast } = useToast();
  const { authorizedFetch } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState(image.caption || '');
  const [submitting, setSubmitting] = useState(false);

  const imgSrc = (image as any).image || (image as any).url || '';
  const ts =
    typeof image.timestamp === 'number'
      ? image.timestamp
      : Date.parse(String(image.timestamp));

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await authorizedFetch(`${API_BASE}/gallery/${image.id}/`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        let msg = 'Failed to delete image.';
        try {
          const data = await res.json();
          msg =
            data?.detail ||
            (typeof data === 'object'
              ? Object.entries(data)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                  .join(' | ')
              : msg);
        } catch {
          // no-op
        }
        throw new Error(msg);
      }

      addToast('Image deleted successfully.', 'success');
      onUpdate();
    } catch (error: any) {
      addToast(error?.message || 'Failed to delete image.', 'error');
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const patchCaption = async () => {
    let res = await authorizedFetch(`${API_BASE}/gallery/${image.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: newCaption }),
    });

    if (res.status === 405) {
      const fullPayload: Record<string, any> = {
        caption: newCaption,
      };

      res = await authorizedFetch(`${API_BASE}/gallery/${image.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });
    }
    return res;
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const res = await patchCaption();
      const data = res.status === 204 ? null : await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.detail ||
          (data && typeof data === 'object'
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                .join(' | ')
            : 'Failed to update caption.');
        throw new Error(msg);
      }

      addToast('Caption updated successfully.', 'success');
      onUpdate();
    } catch (error: any) {
      addToast(error?.message || 'Failed to update caption.', 'error');
    } finally {
      setSubmitting(false);
      setIsEditModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 flex flex-col">
        {/* image */}
        <img
          src={imgSrc}
          alt={image.caption || 'image'}
          className="w-full h-48 object-cover"
        />

        {/* body */}
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-gray-300 text-sm flex-grow break-words">
            {image.caption || '—'}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {isNaN(ts) ? '—' : new Date(ts).toLocaleString()}
          </p>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                setNewCaption(image.caption || '');
                setIsEditModalOpen(true);
              }}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              title="Edit caption"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
              </svg>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              title="Delete image"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Caption Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title="Edit Caption"
        onConfirm={!submitting ? handleEdit : undefined}
        confirmText={submitting ? 'Saving…' : 'Save Changes'}
      >
        <textarea
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
          disabled={submitting}
          className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        onConfirm={!submitting ? handleDelete : undefined}
        confirmText={submitting ? 'Deleting…' : 'Delete'}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        <p>Are you sure you want to delete this image? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default ImageCard;
