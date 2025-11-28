import React from 'react';
import type { TestResult, ProctoringLog } from '../types';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import { CheckCircleIcon, XCircleIcon } from '../components/icons/Icons';
import { SCORING } from '../constants';

interface ResultsScreenProps {
  results: TestResult[];
  proctoringLogs: ProctoringLog[];
  onRetakeTest: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, proctoringLogs, onRetakeTest }) => {
  const totalPossibleScore = results.reduce((acc, r) => acc + SCORING.points[r.difficulty], 0);
  const totalScore = results.reduce((acc, r) => acc + r.finalScore, 0);
  const totalTestCases = results.reduce((acc, r) => acc + r.testCases.total, 0);
  const passedTestCases = results.reduce((acc, r) => acc + r.testCases.passed, 0);

  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-4xl bg-zinc-900/50 rounded-xl p-10 border border-zinc-700 shadow-lg">
        <h2 className="text-4xl font-bold text-white mb-4">Test Results</h2>
        <p className="text-zinc-300 mb-8">Here's a summary of your performance.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ResultCard title="Overall Score" value={`${totalScore} / ${totalPossibleScore}`} description="Points" />
            <ResultCard title="Test Cases" value={`${passedTestCases} / ${totalTestCases}`} description="Passed" />
            <ResultCard title="Proctoring Flags" value={proctoringLogs.length} description="Issues Detected" isWarning={proctoringLogs.length > 0} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* Submission Details */}
            <div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Submission Details</h3>
                <div className="space-y-4 bg-black/50 p-4 rounded-lg">
                    {results.map(result => (
                        <div key={result.questionId} className="flex justify-between items-center p-3 bg-zinc-800 rounded-md border border-zinc-700">
                            <div>
                                <p className="font-semibold">{result.questionTitle}</p>
                                <p className="text-sm text-zinc-400">
                                    Score: <span className="font-bold text-white">{result.finalScore} / {SCORING.points[result.difficulty]}</span> | Violations: <span className={result.violations > 0 ? "text-amber-400 font-bold" : "text-zinc-400"}>{result.violations}</span>
                                </p>
                            </div>
                            {result.passed ? (
                                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                            ) : (
                                <XCircleIcon className="w-8 h-8 text-red-500" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Proctoring Log */}
            <div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Proctoring Log</h3>
                <div className="bg-black/50 p-4 rounded-lg h-56 overflow-y-auto">
                    {proctoringLogs.length > 0 ? (
                        <ul className="space-y-2">
                            {proctoringLogs.map((log) => (
                                <li key={log.timestamp} className="text-sm text-amber-400 flex items-center gap-2">
                                    <span className="font-mono text-zinc-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span>{log.event}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-400">
                           <CheckCircleIcon className="w-6 h-6 mr-2 text-green-500"/> No proctoring issues detected.
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-10">
            <Button onClick={onRetakeTest} size="lg">Take Another Test</Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
