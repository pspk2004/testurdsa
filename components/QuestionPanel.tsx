import React from 'react';
import type { Question } from '../types';
import { Difficulty } from '../types';

interface QuestionPanelProps {
  question: Question;
}

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
    const styles = {
        [Difficulty.Easy]: "bg-green-900/50 text-green-300 border border-green-700",
        [Difficulty.Medium]: "bg-yellow-900/50 text-yellow-300 border border-yellow-700",
        [Difficulty.Hard]: "bg-red-900/50 text-red-300 border border-red-700",
    }
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[difficulty]}`}>{difficulty}</span>;
};

const QuestionPanel: React.FC<QuestionPanelProps> = ({ question }) => {
  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 h-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-white pr-4">{question.title}</h2>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-zinc-300" dangerouslySetInnerHTML={{ __html: question.description.replace(/\n/g, '<br />').replace(/`([^`]+)`/g, '<code class="bg-zinc-700 rounded-sm px-1 py-0.5 text-amber-300">\$1</code>') }} />
      
      <div className="mt-6 space-y-4">
        {question.examples.map((example, index) => (
            <div key={index} className="bg-black/50 p-4 rounded-md border border-zinc-800">
                <p className="font-semibold text-zinc-200 mb-2">Example {index + 1}:</p>
                <div className="font-mono text-sm space-y-1">
                    <p><strong className="text-zinc-400">Input:</strong> {example.input}</p>
                    <p><strong className="text-zinc-400">Output:</strong> {example.output}</p>
                    {example.explanation && <p><strong className="text-zinc-400">Explanation:</strong> {example.explanation}</p>}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPanel;
