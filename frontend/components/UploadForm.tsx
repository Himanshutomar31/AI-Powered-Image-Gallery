import React, { useState, ChangeEvent } from 'react';
import * as geminiService from '../services/geminiService';
import * as mockApi from '../services/mockApiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Spinner } from './Spinner';

interface UploadFile {
    file: File;
    preview: string;
}

interface UploadProgress {
    fileName: string;
    status: 'pending' | 'generating' | 'uploading' | 'success' | 'error';
    message: string;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove `data:${file.type};base64,` prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });


const UploadForm: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
    const [filesToUpload, setFilesToUpload] = useState<UploadFile[]>([]);
    const [progress, setProgress] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuth();
    const { addToast } = useToast();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Add explicit type `File[]` to `selectedFiles` to ensure correct type inference for files in the loop.
            const selectedFiles: File[] = Array.from(e.target.files);
            const validFiles: UploadFile[] = [];
            for (const file of selectedFiles) {
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    addToast(`Invalid file type: ${file.name}`, 'error');
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    addToast(`File too large: ${file.name}`, 'error');
                    continue;
                }
                validFiles.push({ file, preview: URL.createObjectURL(file) });
            }
            setFilesToUpload(prev => [...prev, ...validFiles]);
        }
    };
    
    const handleUpload = async () => {
        if (!user || filesToUpload.length === 0) return;

        setIsUploading(true);
        const initialProgress = filesToUpload.map(f => ({
            fileName: f.file.name,
            status: 'pending' as const,
            message: 'Waiting...'
        }));
        setProgress(initialProgress);

        for (let i = 0; i < filesToUpload.length; i++) {
            const { file } = filesToUpload[i];
            
            const updateProgress = (status: UploadProgress['status'], message: string) => {
                 setProgress(prev => prev.map((p, index) => index === i ? {...p, status, message} : p));
            };

            try {
                updateProgress('generating', 'Generating caption...');
                const base64Image = await fileToBase64(file);

                const caption = await geminiService.generateCaption(base64Image, file.type);
                
                updateProgress('uploading', 'Saving image...');
                
                const dataUrl = `data:${file.type};base64,${base64Image}`;
                mockApi.addImage({
                    userId: user.id,
                    url: dataUrl,
                    caption: caption,
                    timestamp: Date.now(),
                });
                updateProgress('success', 'Upload complete!');

            } catch (error) {
                 console.error(error);
                 const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                 updateProgress('error', errorMessage);
                 addToast(`Failed to process ${file.name}: ${errorMessage}`, 'error');
            }
        }
        
        setIsUploading(false);
        setFilesToUpload([]);
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
                <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:text-purple-400'}`}>
                    <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v1m-4 8l-4-4m0 0l4-4m-4 4h12"></path></svg>
                        <p className="mt-2 text-sm text-gray-400">
                           <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                         <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                </label>
            </div>
            {filesToUpload.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Selected Files:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filesToUpload.map((f, i) => (
                            <img key={i} src={f.preview} alt={f.file.name} className="w-full h-24 object-cover rounded-lg"/>
                        ))}
                    </div>
                     <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="mt-4 w-full flex justify-center items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition duration-300"
                    >
                        {isUploading ? <><Spinner/> Processing...</> : `Upload ${filesToUpload.length} Image(s)`}
                    </button>
                </div>
            )}
            {isUploading && progress.length > 0 && (
                 <div className="mt-4 space-y-2">
                    {progress.map((p) => (
                        <div key={p.fileName} className="text-sm p-2 bg-gray-700 rounded-md">
                            <p className="font-medium">{p.fileName}</p>
                            <p className={`
                                ${p.status === 'success' && 'text-green-400'}
                                ${p.status === 'error' && 'text-red-400'}
                                ${p.status === 'generating' && 'text-blue-400'}
                                ${p.status === 'uploading' && 'text-yellow-400'}
                            `}>{p.message}</p>
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

export default UploadForm;