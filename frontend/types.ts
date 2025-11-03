export type User = {
  username: string;
  email?: string | null;
};

export type LoginResponse = {
  access?: string;
  refresh?: string;
  detail?: string;
  [key: string]: any;
};

export type AuthContextType = {
  user: User | null;
  isReady: boolean; 
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, password2: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
  refreshToken: () => Promise<string | null>;
  authorizedFetch: (input: RequestInfo, init?: RequestInit, retryOnce?: boolean) => Promise<Response>;
};

export interface Image {
    id: string;
    userId: string;
    url: string;
    caption: string;
    timestamp: number;
}

export type ToastMessage = {
    id: number;
    message: string;
    type: 'success' | 'error';
};

export interface ToastContextType {
    addToast: (message: string, type: 'success' | 'error') => void;
}

export type ApiImage = {
  id: number;
  owner: string;
  image: string;      
  caption: string | null;
  uploaded_at: string; 
  status: string;
};

export type ApiListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
