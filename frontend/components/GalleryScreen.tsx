
import React, { useState, useEffect, useCallback } from 'react';
import UploadForm from './UploadForm';
import Gallery from './Gallery';
import * as mockApi from '../services/mockApiService';
import { useAuth } from '../contexts/AuthContext';
import { Image } from '../types';

const GalleryScreen: React.FC = () => {
    const { user } = useAuth();
    const [images, setImages] = useState<Image[]>([]);

    const fetchImages = useCallback(() => {
        if (user) {
            const userImages = mockApi.getImagesForUser(user.id);
            setImages(userImages.sort((a, b) => b.timestamp - a.timestamp));
        }
    }, [user]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);
    
    const handleImageUpdate = () => {
        fetchImages();
    };

    return (
        <div className="space-y-8">
            <UploadForm onUploadSuccess={handleImageUpdate} />
            <Gallery images={images} onImageUpdate={handleImageUpdate} />
        </div>
    );
};

export default GalleryScreen;
