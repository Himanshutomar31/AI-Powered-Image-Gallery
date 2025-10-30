
import { User, Image } from '../types';

// --- User Management ---

const getStoredUsers = (): User[] => {
    return JSON.parse(localStorage.getItem('users') || '[]');
};

const setStoredUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
};

export const register = (email: string, _password?: string): User => {
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
    }
    const newUser: User = { id: `user-${Date.now()}`, email };
    setStoredUsers([...users, newUser]);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
};

export const login = (email: string, _password?: string): User => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error('User not found. Please register.');
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
};

export const logout = (): void => {
    localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
};

// --- Image Management ---

const getStoredImages = (): Image[] => {
    return JSON.parse(localStorage.getItem('images') || '[]');
};

const setStoredImages = (images: Image[]) => {
    localStorage.setItem('images', JSON.stringify(images));
};

export const getImagesForUser = (userId: string): Image[] => {
    const allImages = getStoredImages();
    return allImages.filter(img => img.userId === userId);
};

export const addImage = (image: Omit<Image, 'id'>): Image => {
    const allImages = getStoredImages();
    const newImage: Image = { ...image, id: `img-${Date.now()}` };
    setStoredImages([...allImages, newImage]);
    return newImage;
};

export const updateImageCaption = (imageId: string, newCaption: string): Image => {
    const allImages = getStoredImages();
    const imageIndex = allImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
        throw new Error('Image not found');
    }
    allImages[imageIndex].caption = newCaption;
    setStoredImages(allImages);
    return allImages[imageIndex];
};

export const deleteImage = (imageId: string): void => {
    let allImages = getStoredImages();
    allImages = allImages.filter(img => img.id !== imageId);
    setStoredImages(allImages);
};
