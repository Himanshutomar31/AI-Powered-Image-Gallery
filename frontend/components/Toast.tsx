
import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const baseClasses = "flex items-center justify-between w-full max-w-xs p-4 text-gray-100 rounded-lg shadow-lg";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <div className="text-sm font-normal">{message}</div>
            <button
                type="button"
                className="ml-4 -mx-1.5 -my-1.5 bg-white bg-opacity-20 text-gray-100 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                onClick={onClose}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
            </button>
        </div>
    );
};

export default Toast;
