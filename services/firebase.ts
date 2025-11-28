
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to strip accidental quotes if user pasted them into Vercel
const sanitize = (value: string | undefined) => {
    if (!value) return undefined;
    return value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
};

// Default config (Demo Mode)
let firebaseConfig = {
    apiKey: "AIzaSyDummyKey-ReplaceWithYours",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Robustly try to load environment variables.
// We use individual try-catch blocks or a simplified flow to ensure that if 'import.meta.env' 
// is undefined at runtime, we don't crash, but if Vite REPLACED the variables with strings, we use them.
try {
    // @ts-ignore
    const env = import.meta.env; // Check availability

    // We explicitly reference the full path (import.meta.env.VITE_...) so Vite's static replacement works.
    // If Vite replaces it, the line becomes: const key = "AIza...";
    // If Vite DOESNT replace it, and env is undefined, the try-catch saves us.
    
    // @ts-ignore
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (apiKey) firebaseConfig.apiKey = sanitize(apiKey) || firebaseConfig.apiKey;

    // @ts-ignore
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    if (authDomain) firebaseConfig.authDomain = sanitize(authDomain) || firebaseConfig.authDomain;

    // @ts-ignore
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (projectId) firebaseConfig.projectId = sanitize(projectId) || firebaseConfig.projectId;

    // @ts-ignore
    const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
    if (storageBucket) firebaseConfig.storageBucket = sanitize(storageBucket) || firebaseConfig.storageBucket;

    // @ts-ignore
    const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
    if (messagingSenderId) firebaseConfig.messagingSenderId = sanitize(messagingSenderId) || firebaseConfig.messagingSenderId;

    // @ts-ignore
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;
    if (appId) firebaseConfig.appId = sanitize(appId) || firebaseConfig.appId;

} catch (e) {
    // If import.meta.env is undefined, we simply stay in Demo Mode.
    console.warn("Environment variables not detected. Falling back to Demo Mode.");
}

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseInitialized = false;

// Check if the keys are loaded (either from .env file or Vercel)
const isConfigured = firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== "AIzaSyDummyKey-ReplaceWithYours" &&
                     !firebaseConfig.apiKey.includes("DummyKey");

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
    console.warn("Firebase keys missing or invalid. Running in DEMO MODE.");
}

export { auth, db, isFirebaseInitialized };
