import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SetupScreen from './screens/SetupScreen';
import TestScreen from './screens/TestScreen';
import ResultsScreen from './screens/ResultsScreen';
import type { TestResult, ProctoringLog, Question, User } from './types';
import { getTestQuestions } from './services/questionService';
import { subscribeToAuthChanges, logout } from './services/authService';
import Header from './components/Header';
import Footer from './components/Footer';

enum View {
  Login,
  Home,
  Setup,
  Test,
  Results
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Login);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [proctoringLogs, setProctoringLogs] = useState<ProctoringLog[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      if (currentUser && currentView === View.Login) {
        setCurrentView(View.Home);
      } else if (!currentUser) {
        setCurrentView(View.Login);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [currentView]);

  const handleLogin = useCallback((loggedInUser: User) => {
    // Auth listener handles the state update, but we can force view change here for instant feedback
    setUser(loggedInUser);
    setCurrentView(View.Home);
  }, []);

  const handleStartTest = useCallback(() => {
    setCurrentView(View.Setup);
  }, []);

  const handleSetupComplete = useCallback(() => {
    setQuestions(getTestQuestions());
    setCurrentView(View.Test);
  }, []);

  const handleFinishTest = useCallback((results: TestResult[], logs: ProctoringLog[]) => {
    setTestResults(results);
    setProctoringLogs(logs);
    setCurrentView(View.Results);
  }, []);

  const handleRetakeTest = useCallback(() => {
    setTestResults([]);
    setProctoringLogs([]);
    setCurrentView(View.Home);
  }, []);
  
  const handleLogout = useCallback(() => {
    logout();
    // Auth listener will handle setting user to null and view to login
  }, []);

  const renderView = () => {
    if (loadingAuth) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>;
    }

    switch (currentView) {
      case View.Login:
        return <LoginScreen onLogin={handleLogin} />;
      case View.Home:
        return <HomeScreen onStartTest={handleStartTest} />;
      case View.Setup:
        return <SetupScreen onSetupComplete={handleSetupComplete} />;
      case View.Test:
        return <TestScreen questions={questions} onFinishTest={handleFinishTest} user={user} />;
      case View.Results:
        return <ResultsScreen results={testResults} proctoringLogs={proctoringLogs} onRetakeTest={handleRetakeTest} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col font-sans">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
