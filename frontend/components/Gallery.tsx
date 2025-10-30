
import React, { useState, useMemo } from 'react';
import { Image } from '../types';
import ImageCard from './ImageCard';
import Pagination from './Pagination';

interface GalleryProps {
    images: Image[];
    onImageUpdate: () => void;
}

const ITEMS_PER_PAGE = 8;

const Gallery: React.FC<GalleryProps> = ({ images, onImageUpdate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredImages = useMemo(() => {
        return images
            .filter(image => 
                image.caption.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter(image => {
                if (!dateFilter) return true;
                const imageDate = new Date(image.timestamp).toISOString().split('T')[0];
                return imageDate === dateFilter;
            });
    }, [images, searchQuery, dateFilter]);

    const paginatedImages = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredImages, currentPage]);

    const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Gallery</h2>
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
            {filteredImages.length === 0 ? (
                <div className="text-center py-10 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">No images found. Try uploading some or adjusting your filters.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedImages.map(image => (
                            <ImageCard key={image.id} image={image} onUpdate={onImageUpdate} />
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
