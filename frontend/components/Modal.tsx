
import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onConfirm: () => void;
    confirmText?: string;
    confirmButtonClass?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    onConfirm,
    confirmText = "Confirm",
    confirmButtonClass = "bg-purple-600 hover:bg-purple-700"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="mb-6">
                    {children}
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`py-2 px-4 text-white font-semibold rounded-lg shadow-md transition duration-300 ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
