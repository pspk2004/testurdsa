import React, { useState } from 'react';
import type { RunResult } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons/Icons';

interface ExecutionPanelProps {
    results: RunResult[] | null;
    isRunning: boolean;
}

type Tab = 'testCases' | 'console';

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ results, isRunning }) => {
    const [activeTab, setActiveTab] = useState<Tab>('testCases');

    const renderTestCases = () => {
        if (isRunning) {
            return <div className="p-4 text-zinc-400 animate-pulse">Running test cases...</div>;
        }
        if (!results) {
            return <div className="p-4 text-zinc-400">Run code to see test case results.</div>
        }

        return (
            <div className="p-4 space-y-3">
                {results.map(result => (
                    <div key={result.id} className="border-b border-zinc-700 pb-2">
                        <div className="flex items-center gap-2">
                            {result.passed ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            <p className="font-semibold">Case {result.id}</p>
                        </div>
                        <div className="text-xs font-mono text-zinc-400 mt-1 pl-7 space-y-1">
                            <p><strong>Input:</strong> {result.input}</p>
                            <p><strong>Output:</strong> <span className={result.passed ? '' : 'text-red-400'}>{result.actual}</span></p>
                            {!result.passed && <p><strong>Expected:</strong> <span className="text-green-400">{result.expected}</span></p>}
                        </div>
                    </div>
                ))}
            </div>
        )
    };
    
    const renderConsole = () => {
         if (isRunning) {
            return <div className="p-4 text-zinc-400 font-mono text-sm animate-pulse">Executing...</div>;
        }
        if (!results) {
            return <div className="p-4 text-zinc-400 font-mono text-sm">{`// Console output will appear here after running the code.`}</div>
        }
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        const success = passedCount === totalCount;
        return (
             <div className="p-4 font-mono text-sm space-y-1">
                <p className={success ? 'text-green-400' : 'text-red-400'}>
                    &gt; Result: {success ? 'Accepted' : 'Wrong Answer'}
                </p>
                <p className="text-zinc-400">
                    &gt; Finished in {Math.random().toFixed(3)}s
                </p>
                <p className="text-zinc-400">
                    &gt; {passedCount}/{totalCount} example test cases passed.
                </p>
             </div>
        )
    };

    return (
        <div className="h-1/3 flex flex-col border-t border-zinc-700">
            <div className="flex-shrink-0 flex gap-4 px-4 border-b border-zinc-700">
                <button
                    onClick={() => setActiveTab('testCases')}
                    className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'testCases' ? 'text-amber-400 border-amber-400' : 'text-zinc-400 border-transparent'}`}
                >
                    Test Cases
                </button>
                <button
                    onClick={() => setActiveTab('console')}
                    className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'console' ? 'text-amber-400 border-amber-400' : 'text-zinc-400 border-transparent'}`}
                >
                    Console
                </button>
            </div>
            <div className="flex-grow overflow-y-auto bg-zinc-800/50">
                {activeTab === 'testCases' ? renderTestCases() : renderConsole()}
            </div>
        </div>
    );
};

export default ExecutionPanel;