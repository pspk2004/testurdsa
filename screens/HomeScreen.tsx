import React from 'react';
import Button from '../components/Button';
import { TOTAL_TEST_TIME_SECONDS } from '../constants';

interface HomeScreenProps {
  onStartTest: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartTest }) => {
  const totalMinutes = TOTAL_TEST_TIME_SECONDS / 60;

  return (
    <div className="flex-grow flex items-center justify-center text-center">
      <div className="w-full max-w-2xl bg-zinc-900/50 rounded-xl p-10 border border-zinc-700 shadow-lg">
        <h2 className="text-4xl font-bold text-white mb-4">Prepare for Your DSA Test</h2>
        <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
          You are about to begin a proctored assessment to test your Data Structures and Algorithms skills. Please ensure you are in a quiet environment with a stable internet connection.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <h3 className="font-semibold text-amber-400 mb-2">Duration</h3>
                <p className="text-zinc-300">{totalMinutes} minutes</p>
            </div>
             <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <h3 className="font-semibold text-amber-400 mb-2">Questions</h3>
                <p className="text-zinc-300">1 Easy, 1 Medium, 1 Hard</p>
            </div>
             <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <h3 className="font-semibold text-amber-400 mb-2">Proctoring</h3>
                <p className="text-zinc-300">Enabled (Webcam & Mic)</p>
            </div>
        </div>
        <Button onClick={onStartTest} size="lg" className="px-12 py-4 text-xl">
          Start System Check
        </Button>
      </div>
    </div>
  );
};

export default HomeScreen;