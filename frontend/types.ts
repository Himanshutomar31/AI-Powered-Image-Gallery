
export interface User {
    id: string;
    email: string;
}

export interface Image {
    id: string;
    userId: string;
    url: string; // Base64 data URL
    caption: string;
    timestamp: number;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    logout: () => void;
    register: (email: string) => void;
}

export type ToastMessage = {
    id: number;
    message: string;
    type: 'success' | 'error';
};

export interface ToastContextType {
    addToast: (message: string, type: 'success' | 'error') => void;
}
