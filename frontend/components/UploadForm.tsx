// src/components/UploadForm.tsx
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Spinner } from './Spinner';

interface UploadFile {
  file: File;
  preview: string;
}

interface UploadProgress {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message: string;
}

const API_BASE = 'http://127.0.0.1:8000/api/v1';

// Convert a File → base64 
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      if (parts.length < 2) return reject(new Error('Invalid data URL'));
      resolve(parts[1]); 
    };
    reader.onerror = (err) => reject(err);
  });

const UploadForm: React.FC<{ onUploadSuccess: () => void; onUploadError?: (msg?: string) => void }> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const { authorizedFetch } = useAuth();
  const { addToast } = useToast();

  const [filesToUpload, setFilesToUpload] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      filesToUpload.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [filesToUpload]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles: File[] = Array.from(e.target.files);
    const validFiles: UploadFile[] = [];

    for (const file of selectedFiles) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        addToast(`Invalid file type: ${file.name}`, 'error');
        continue;
      }
      if (file.size > 12 * 1024 * 1024) {
        addToast(`File too large: ${file.name}`, 'error');
        continue;
      }
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    if (validFiles.length) {
      setFilesToUpload((prev) => [...prev, ...validFiles]);
      setProgress((prev) => [
        ...prev,
        ...validFiles.map((f) => ({
          fileName: f.file.name,
          status: 'pending' as const,
          message: 'Waiting…',
        })),
      ]);
    }
    // reset input so selecting same file again re-triggers change
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!filesToUpload.length) return;

    setIsUploading(true);

    for (let i = 0; i < filesToUpload.length; i++) {
      const { file } = filesToUpload[i];

      const setP = (status: UploadProgress['status'], message: string) => {
        setProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status, message } : p))
        );
      };

      try {
        setP('uploading', 'Uploading…');

        // 1) to base64 (raw)
        const rawBase64 = await fileToBase64(file);

        // 2) re-add data URL prefix as your backend expects
        const dataUrl = `data:${file.type};base64,${rawBase64}`;

        // 3) POST to your API (backend generates caption)
        const res = await authorizedFetch(`${API_BASE}/gallery/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });

        // try to parse error/success details if present
        let body: any = null;
        try {
          body = await res.clone().json();
        } catch {
          /* ignore non-JSON */
        }

        if (!res.ok) {
          const msg =
            body?.detail ||
            (body && typeof body === 'object'
              ? Object.entries(body)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                  .join(' | ')
              : `Upload failed (HTTP ${res.status}).`);
          throw new Error(msg);
        }

        setP('success', 'Upload complete!');
      } catch (err: any) {
        const msg = err?.message || 'Upload failed.';
        setP('error', msg);
        addToast(`Failed to process ${file.name}: ${msg}`, 'error');
        onUploadError?.(msg);
      }
    }

    setIsUploading(false);

    // cleanup previews of successfully processed files
    filesToUpload.forEach((f) => URL.revokeObjectURL(f.preview));
    setFilesToUpload([]);
    // notify parent to refetch gallery
    onUploadSuccess();
    addToast('All uploads processed!', 'success');
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Upload New Images</h3>

      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:text-purple-400'}`}
        >
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v1m-4 8l-4-4m0 0l4-4m-4 4h12"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 12MB</p>
          </div>
        </label>
      </div>

      {filesToUpload.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Selected Files:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filesToUpload.map((f, i) => (
              <img key={i} src={f.preview} alt={f.file.name} className="w-full h-24 object-cover rounded-lg" />
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 w-full flex justify-center items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition duration-300"
          >
            {isUploading ? (
              <>
                <Spinner /> <span className="ml-2">Processing…</span>
              </>
            ) : (
              `Upload ${filesToUpload.length} Image(s)`
            )}
          </button>
        </div>
      )}

      {isUploading && progress.length > 0 && (
        <div className="mt-4 space-y-2">
          {progress.map((p) => (
            <div key={p.fileName} className="text-sm p-2 bg-gray-700 rounded-md">
              <p className="font-medium">{p.fileName}</p>
              <p
                className={`${
                  p.status === 'success'
                    ? 'text-green-400'
                    : p.status === 'error'
                    ? 'text-red-400'
                    : p.status === 'uploading'
                    ? 'text-yellow-400'
                    : ''
                }`}
              >
                {p.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadForm;
