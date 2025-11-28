import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseInitialized } from './firebase';
import type { User } from '../types';

// Map Firebase user to our app User type
const mapUser = (fbUser: FirebaseUser): User => ({
    uid: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    photoURL: fbUser.photoURL || undefined
});

// --- MOCK AUTH HELPERS FOR DEMO MODE ---
const MOCK_USER: User = {
    uid: 'mock-user-123',
    name: 'Demo User',
    email: 'demo@testurdsa.com',
    photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=random'
};

const MOCK_DELAY = 800;
const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

let mockCurrentUser: User | null = null;
const authListeners: ((user: User | null) => void)[] = [];

const notifyListeners = (user: User | null) => {
    mockCurrentUser = user;
    authListeners.forEach(cb => cb(user));
};

// ----------------------------------------

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    if (isFirebaseInitialized && auth) {
        return onAuthStateChanged(auth, (user) => {
            callback(user ? mapUser(user) : null);
        });
    } else {
        // Mock Implementation
        authListeners.push(callback);
        // Check local storage for persistent mock session
        const stored = localStorage.getItem('mock_user_session');
        if (stored) {
            const user = JSON.parse(stored);
            notifyListeners(user);
        } else {
            callback(null);
        }
        return () => {
            const index = authListeners.indexOf(callback);
            if (index > -1) authListeners.splice(index, 1);
        };
    }
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
    if (isFirebaseInitialized && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        return mapUser(userCredential.user);
    } else {
        await mockDelay();
        const newUser = { ...MOCK_USER, name, email, uid: `mock-${Date.now()}` };
        localStorage.setItem('mock_user_session', JSON.stringify(newUser));
        notifyListeners(newUser);
        return newUser;
    }
};

export const login = async (email: string, password: string): Promise<User> => {
    if (isFirebaseInitialized && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return mapUser(userCredential.user);
    } else {
        await mockDelay();
        // Allow any login in demo mode
        const user = { ...MOCK_USER, email, name: email.split('@')[0] };
        localStorage.setItem('mock_user_session', JSON.stringify(user));
        notifyListeners(user);
        return user;
    }
};

export const loginWithGoogle = async (): Promise<User> => {
    if (isFirebaseInitialized && auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return mapUser(result.user);
    } else {
        await mockDelay();
        const user = { ...MOCK_USER, name: 'Google User', email: 'google@test.com', uid: 'mock-google-uid' };
        localStorage.setItem('mock_user_session', JSON.stringify(user));
        notifyListeners(user);
        return user;
    }
};

export const loginWithGithub = async (): Promise<User> => {
    if (isFirebaseInitialized && auth) {
        const provider = new GithubAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return mapUser(result.user);
    } else {
        await mockDelay();
         const user = { ...MOCK_USER, name: 'GitHub User', email: 'github@test.com', uid: 'mock-github-uid' };
        localStorage.setItem('mock_user_session', JSON.stringify(user));
        notifyListeners(user);
        return user;
    }
};

export const logout = async () => {
    if (isFirebaseInitialized && auth) {
        await signOut(auth);
    } else {
        await mockDelay();
        localStorage.removeItem('mock_user_session');
        notifyListeners(null);
    }
};