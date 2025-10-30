
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex justify-center items-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === number 
                            ? 'bg-purple-600 text-white font-bold' 
                            : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </nav>
    );
};

export default Pagination;
