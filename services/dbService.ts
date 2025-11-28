
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseInitialized } from './firebase';
import type { TestResult, ProctoringLog, User } from '../types';

const MOCK_DB_KEY = 'mock_db_test_sessions';

export const saveTestSession = async (user: User, results: TestResult[], logs: ProctoringLog[]) => {
    const totalScore = results.reduce((acc, r) => acc + r.finalScore, 0);

    const sessionData = {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        results: results,
        logs: logs,
        totalScore: totalScore,
        completedAt: new Date().toISOString(), 
        passedQuestions: results.filter(r => r.passed).length,
        violationCount: logs.length
    };

    if (isFirebaseInitialized && db) {
        try {
            await addDoc(collection(db, "test_sessions"), {
                ...sessionData,
                completedAt: serverTimestamp()
            });
            console.log("Test session saved to Firestore.");
        } catch (e) {
            console.error("Error saving to Firestore:", e);
            throw e;
        }
    } else {
        // Fallback to LocalStorage
        console.log("Saving to Local Storage (Demo Mode)");
        const existingRaw = localStorage.getItem(MOCK_DB_KEY);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(sessionData);
        localStorage.setItem(MOCK_DB_KEY, JSON.stringify(existing));
    }
};

export const getUserHistory = async (userId: string) => {
    if (isFirebaseInitialized && db) {
        try {
            const q = query(
                collection(db, "test_sessions"), 
                where("userId", "==", userId),
                orderBy("completedAt", "desc"),
                limit(10)
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching history from Firestore:", e);
            return [];
        }
    } else {
        // Fallback to LocalStorage
        const existingRaw = localStorage.getItem(MOCK_DB_KEY);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        return existing
            .filter((item: any) => item.userId === userId)
            .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
};

// Real-time subscription for admin or user dashboards
export const subscribeToHistory = (userId: string, callback: (data: any[]) => void) => {
    if (isFirebaseInitialized && db) {
        const q = query(
            collection(db, "test_sessions"), 
            where("userId", "==", userId),
            orderBy("completedAt", "desc"),
            limit(10)
        );
        
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(data);
        });
    } else {
        // Fallback for mock mode (no real-time, just immediate return)
        getUserHistory(userId).then(data => callback(data));
        return () => {}; // no-op unsubscribe
    }
};
