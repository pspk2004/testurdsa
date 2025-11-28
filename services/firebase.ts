
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to safely access env vars and strip accidental quotes
const getEnv = (key: string) => {
    try {
        const value = (import.meta as any).env?.[key];
        if (value && typeof value === 'string') {
            // Remove start/end quotes if user pasted them by mistake
            return value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        }
        return value;
    } catch {
        return undefined;
    }
};

// We use Vite environment variables for security.
// When you deploy to Vercel, you will paste your keys into the "Environment Variables" section.
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY") || "AIzaSyDummyKey-ReplaceWithYours",
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID")
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseInitialized = false;

// Check if the keys are loaded (either from .env file or Vercel)
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyDummyKey-ReplaceWithYours";

if (isConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        isFirebaseInitialized = true;
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
} else {
    console.warn("Firebase keys missing. Running in DEMO MODE.");
}

export { auth, db, isFirebaseInitialized };
