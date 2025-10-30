
import React, { useState } from 'react';
import { Image } from '../types';
import * as mockApi from '../services/mockApiService';
import { useToast } from '../contexts/ToastContext';
import Modal from './Modal';

interface ImageCardProps {
    image: Image;
    onUpdate: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onUpdate }) => {
    const { addToast } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCaption, setNewCaption] = useState(image.caption);

    const handleDelete = () => {
        try {
            mockApi.deleteImage(image.id);
            addToast('Image deleted successfully.', 'success');
            onUpdate();
        } catch (error) {
            addToast('Failed to delete image.', 'error');
        }
        setIsDeleteModalOpen(false);
    };
    
    const handleEdit = () => {
        try {
            mockApi.updateImageCaption(image.id, newCaption);
            addToast('Caption updated successfully.', 'success');
            onUpdate();
        } catch(error) {
            addToast('Failed to update caption.', 'error');
        }
        setIsEditModalOpen(false);
    }

    return (
        <>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 flex flex-col">
                <img src={image.url} alt={image.caption} className="w-full h-48 object-cover" />
                <div className="p-4 flex flex-col flex-grow">
                    <p className="text-gray-300 text-sm flex-grow">{image.caption}</p>
                    <p className="text-gray-500 text-xs mt-2">{new Date(image.timestamp).toLocaleString()}</p>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Caption"
                onConfirm={handleEdit}
                confirmText="Save Changes"
            >
                <textarea
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </Modal>
            
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                onConfirm={handleDelete}
                confirmText="Delete"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            </Modal>
        </>
    );
};

export default ImageCard;
